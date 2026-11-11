import { FleetVehicle, CargoItem, StackingResult, FleetFitSummary, StackingPattern } from '../types/logistics';

export interface BoxPlacement {
  itemIndex: number;
  itemId: string;
  itemName: string;
  color: string;
  x: number; // in cm from front left
  y: number; // in cm from floor
  z: number; // in cm from side
  length: number;
  width: number;
  height: number;
  weight: number;
  layer: number;
}

export interface PackingPlan {
  pattern: StackingPattern;
  placements: BoxPlacement[];
  totalBoxesPlaced: number;
  totalBoxesRequested: number;
  totalVolumePlacedCbm: number;
  totalWeightPlacedKg: number;
  alongLengthCount: number;
  alongWidthCount: number;
  alongHeightCount: number;
  layersCount: number;
  compressionStrengthPct: number;
  stabilityPct: number;
  patternName: string;
  patternTip: string;
}

/**
 * Calculates single-item orientation and physical fit
 */
export function calculateSingleItemFit(
  item: CargoItem,
  fleet: FleetVehicle,
  pattern: StackingPattern = 'column'
): StackingResult {
  // Check if item exceeds truck box in any orientation
  const canFitStraight =
    item.lengthCm <= fleet.lengthCm &&
    item.widthCm <= fleet.widthCm &&
    item.heightCm <= fleet.heightCm;

  const canFitRotated =
    item.allowRotation &&
    item.widthCm <= fleet.lengthCm &&
    item.lengthCm <= fleet.widthCm &&
    item.heightCm <= fleet.heightCm;

  if (!canFitStraight && !canFitRotated) {
    return {
      orientation: 'standard',
      pattern,
      alongLength: 0,
      alongWidth: 0,
      alongHeight: 0,
      maxFitByDimension: 0,
      actualPiecesLoaded: 0,
      totalVolumeCbm: 0,
      totalWeightKg: 0,
      totalTon: 0,
      volumeUtilizationPct: 0,
      weightUtilizationPct: 0,
      remainingVolumeCbm: fleet.nominalCbm,
      remainingWeightKg: fleet.maxWeightKg,
      isOverweight: false,
      isOvervolume: false,
      isDimensionExceeded: true,
      status: 'dimension_exceeded',
      statusMessage: `Dimensi barang (${item.lengthCm}x${item.widthCm}x${item.heightCm} cm) melebihi batas ruang dalam ${fleet.name} (${fleet.lengthCm}x${fleet.widthCm}x${fleet.heightCm} cm)`
    };
  }

  // Count standard
  const stdL = Math.floor(fleet.lengthCm / item.lengthCm);
  const stdW = Math.floor(fleet.widthCm / item.widthCm);
  const stdH = Math.floor(fleet.heightCm / item.heightCm);
  const countStd = stdL * stdW * stdH;

  // Count rotated
  let rotL = 0;
  let rotW = 0;
  let rotH = 0;
  let countRot = 0;

  if (item.allowRotation) {
    rotL = Math.floor(fleet.lengthCm / item.widthCm);
    rotW = Math.floor(fleet.widthCm / item.lengthCm);
    rotH = Math.floor(fleet.heightCm / item.heightCm);
    countRot = rotL * rotW * rotH;
  }

  const useRotated = countRot > countStd;
  const bestFitCount = useRotated ? countRot : countStd;
  const alongLength = useRotated ? rotL : stdL;
  const alongWidth = useRotated ? rotW : stdW;
  const alongHeight = useRotated ? rotH : stdH;

  const singleItemCbm = (item.lengthCm * item.widthCm * item.heightCm) / 1_000_000;
  const totalVolumeCbm = Number((singleItemCbm * item.quantity).toFixed(2));
  const totalWeightKg = Number((item.weightKg * item.quantity).toFixed(1));
  const totalTon = Number((totalWeightKg / 1000).toFixed(2));

  const volumeUtilizationPct = Number(((totalVolumeCbm / fleet.nominalCbm) * 100).toFixed(1));
  const weightUtilizationPct = Number(((totalWeightKg / fleet.maxWeightKg) * 100).toFixed(1));

  const remainingVolumeCbm = Number(Math.max(0, fleet.nominalCbm - totalVolumeCbm).toFixed(2));
  const remainingWeightKg = Number(Math.max(0, fleet.maxWeightKg - totalWeightKg).toFixed(1));

  const isOverweight = totalWeightKg > fleet.maxWeightKg;
  const isOvervolume = totalVolumeCbm > fleet.nominalCbm;
  const isDimensionExceeded = item.quantity > bestFitCount;

  let status: StackingResult['status'] = 'safe';
  let statusMessage = 'Kapasitas muatan aman sesuai ketentuan standar.';

  if (isOverweight && isOvervolume) {
    status = 'overload_weight';
    statusMessage = `PERINGATAN ODOL: Muatan melebihi tonase (${totalTon} Ton > ${fleet.maxWeightKg / 1000} Ton) dan over volume kubikasi.`;
  } else if (isOverweight) {
    status = 'overload_weight';
    statusMessage = `PERINGATAN OVERLOAD: Berat muatan (${totalTon} Ton) melebihi kapasitas maksimal ${fleet.name} (${fleet.maxWeightKg / 1000} Ton). Risiko ODOL di jembatan timbang!`;
  } else if (isOvervolume) {
    status = 'overload_volume';
    statusMessage = `PERINGATAN OVER VOLUME: Volume kargo (${totalVolumeCbm} CBM) melampaui kapasitas box (${fleet.nominalCbm} CBM). Barang tidak akan muat semuanya.`;
  } else if (isDimensionExceeded) {
    status = 'overload_volume';
    statusMessage = `Jumlah ${item.quantity} barang melebihi kapasitas fisik penataan (${bestFitCount} barang muat). Butuh armada lebih besar.`;
  } else if (volumeUtilizationPct > 85 || weightUtilizationPct > 85) {
    status = 'warning';
    statusMessage = 'Muatan hampir maksimal (>85% kapasitas). Pastikan pengikatan kargo kokoh dan pintu tertutup rapat.';
  } else if (volumeUtilizationPct >= 65 || weightUtilizationPct >= 65) {
    status = 'optimal';
    statusMessage = 'Kapasitas muat sangat optimal dan ekonomis.';
  }

  return {
    orientation: useRotated ? 'rotated' : 'standard',
    pattern,
    alongLength,
    alongWidth,
    alongHeight,
    maxFitByDimension: bestFitCount,
    actualPiecesLoaded: Math.min(item.quantity, bestFitCount),
    totalVolumeCbm,
    totalWeightKg,
    totalTon,
    volumeUtilizationPct,
    weightUtilizationPct,
    remainingVolumeCbm,
    remainingWeightKg,
    isOverweight,
    isOvervolume,
    isDimensionExceeded: item.quantity > bestFitCount,
    status,
    statusMessage
  };
}

/**
 * Packs multiple items into 3D coordinates based on chosen stacking pattern
 */
export function generatePackingPlan(
  items: CargoItem[],
  fleet: FleetVehicle,
  pattern: StackingPattern = 'column'
): PackingPlan {
  const placements: BoxPlacement[] = [];
  let totalWeight = 0;
  let totalVolume = 0;
  let boxesPlaced = 0;
  let totalRequested = 0;

  // Pattern metrics
  let compressionStrengthPct = 100;
  let stabilityPct = 50;
  let patternName = 'Susunan Kolom (Column / Block)';
  let patternTip = 'Kekuatan tumpukan sudut maksimal. Wajib wrapping/strapping rapat agar tidak bergeser saat tikungan.';

  if (pattern === 'brick') {
    compressionStrengthPct = 60;
    stabilityPct = 95;
    patternName = 'Susunan Bata (Interlocking)';
    patternTip = 'Saling mengunci antar lapisan. Sangat tahan guncangan dan pengereman mendadak.';
  } else if (pattern === 'pinwheel') {
    compressionStrengthPct = 65;
    stabilityPct = 75;
    patternName = 'Susunan Kincir (Pinwheel)';
    patternTip = 'Penataan memutar mengelilingi ruang tengah untuk memaksimalkan luasan dasar.';
  } else if (pattern === 'hybrid') {
    compressionStrengthPct = 88;
    stabilityPct = 90;
    patternName = 'Susunan Campuran (Mixed / Hybrid)';
    patternTip = 'Kolom di lapisan bawah untuk menopang beban berat + bata di lapisan atas untuk mengunci muatan.';
  } else if (pattern === 'pyramid') {
    compressionStrengthPct = 82;
    stabilityPct = 92;
    patternName = 'Susunan Piramida / Tangga (Stepped)';
    patternTip = 'Bertumpu ke arah kabin depan dan mengecil ke belakang. Sangat aman untuk partial load (LTL).';
  }

  const sortedItems = [...items].sort((a, b) => b.weightKg - a.weightKg);
  const primaryItem = sortedItems[0];
  const refHeight = primaryItem ? primaryItem.heightCm : 30;
  const maxLayersEstimated = Math.max(1, Math.floor(fleet.heightCm / refHeight));

  let currentY = 0;
  let currentLayer = 0;

  while (currentY + refHeight <= fleet.heightCm && boxesPlaced < sortedItems.reduce((acc, it) => acc + it.quantity, 0)) {
    // Determine layer mode
    let isInterlockingLayer = false;
    if (pattern === 'brick') {
      isInterlockingLayer = currentLayer % 2 === 1;
    } else if (pattern === 'hybrid') {
      // Top 1 or 2 layers use interlocking
      isInterlockingLayer = currentLayer >= Math.max(1, maxLayersEstimated - 2);
    }

    // Determine max length allowed on this layer
    let maxAllowedLength = fleet.lengthCm;
    if (pattern === 'pyramid') {
      // Each layer stepping down progressively towards the front cabin
      const stepBack = currentLayer * Math.max(35, (primaryItem?.lengthCm || 40) * 0.9);
      maxAllowedLength = Math.max(primaryItem?.lengthCm || 50, fleet.lengthCm - stepBack);
    }

    // Offset for brick pattern
    const offsetX = isInterlockingLayer ? (primaryItem?.lengthCm || 40) / 2 : 0;
    let currentX = offsetX;
    let currentZ = 0;

    for (let idx = 0; idx < sortedItems.length; idx++) {
      const item = sortedItems[idx];
      totalRequested = items.reduce((sum, it) => sum + it.quantity, 0);

      // Remaining items to place
      const placedForItem = placements.filter((p) => p.itemId === item.id).length;
      const needToPlace = item.quantity - placedForItem;
      if (needToPlace <= 0) continue;

      let itemL = item.lengthCm;
      let itemW = item.widthCm;
      const itemH = item.heightCm;

      if (pattern === 'pinwheel' && item.allowRotation) {
        // In pinwheel, alternate orientation in 2x2 grid
        const cellIndex = (Math.floor(currentX / itemL) + Math.floor(currentZ / itemW)) % 4;
        if (cellIndex === 1 || cellIndex === 2) {
          itemL = item.widthCm;
          itemW = item.lengthCm;
        }
      } else if (isInterlockingLayer && item.allowRotation && item.widthCm <= fleet.widthCm) {
        // Rotate alternate layer to create cross-bonding
        itemL = item.widthCm;
        itemW = item.lengthCm;
      }

      if (itemL > fleet.lengthCm || itemW > fleet.widthCm || itemH > fleet.heightCm) {
        continue;
      }

      for (let q = 0; q < needToPlace; q++) {
        // Check length
        if (currentX + itemL > maxAllowedLength) {
          // Next row in width
          currentX = offsetX;
          currentZ += itemW;
        }

        // Check width
        if (currentZ + itemW > fleet.widthCm) {
          // Layer finished!
          break;
        }

        // Check height
        if (currentY + itemH > fleet.heightCm) {
          break;
        }

        placements.push({
          itemIndex: idx,
          itemId: item.id,
          itemName: item.name,
          color: item.color,
          x: currentX,
          y: currentY,
          z: currentZ,
          length: itemL,
          width: itemW,
          height: itemH,
          weight: item.weightKg,
          layer: currentLayer
        });

        boxesPlaced++;
        totalWeight += item.weightKg;
        totalVolume += (itemL * itemW * itemH) / 1_000_000;

        currentX += itemL;
      }

      if (currentZ + itemW > fleet.widthCm) {
        break;
      }
    }

    currentY += refHeight;
    currentLayer++;
  }

  const alongLengthMax = Math.max(1, Math.round(fleet.lengthCm / 50));
  const alongWidthMax = Math.max(1, Math.round(fleet.widthCm / 40));

  return {
    pattern,
    placements,
    totalBoxesPlaced: boxesPlaced,
    totalBoxesRequested: totalRequested,
    totalVolumePlacedCbm: Number(totalVolume.toFixed(2)),
    totalWeightPlacedKg: Number(totalWeight.toFixed(1)),
    alongLengthCount: alongLengthMax,
    alongWidthCount: alongWidthMax,
    alongHeightCount: currentLayer,
    layersCount: currentLayer,
    compressionStrengthPct,
    stabilityPct,
    patternName,
    patternTip
  };
}

/**
 * Evaluates all fleet options against the current cargo load
 */
export function evaluateAllFleets(items: CargoItem[], fleets: FleetVehicle[]): FleetFitSummary[] {
  const totalVolumeCbm = items.reduce(
    (sum, item) => sum + ((item.lengthCm * item.widthCm * item.heightCm) / 1_000_000) * item.quantity,
    0
  );
  const totalWeightKg = items.reduce((sum, item) => sum + item.weightKg * item.quantity, 0);

  const summaries: FleetFitSummary[] = fleets.map((fleet) => {
    // Check if any single item dimension exceeds cargo doors/box
    const dimensionExceeded = items.some((item) => {
      const fitsStandard =
        item.lengthCm <= fleet.lengthCm &&
        item.widthCm <= fleet.widthCm &&
        item.heightCm <= fleet.heightCm;
      const fitsRotated =
        item.allowRotation &&
        item.widthCm <= fleet.lengthCm &&
        item.lengthCm <= fleet.widthCm &&
        item.heightCm <= fleet.heightCm;
      return !fitsStandard && !fitsRotated;
    });

    const isOverweight = totalWeightKg > fleet.maxWeightKg;
    const isOvervolume = totalVolumeCbm > fleet.nominalCbm;
    const weightPct = Number(((totalWeightKg / fleet.maxWeightKg) * 100).toFixed(1));
    const volumePct = Number(((totalVolumeCbm / fleet.nominalCbm) * 100).toFixed(1));

    let status: FleetFitSummary['status'] = 'safe';
    let reason = 'Muat aman';

    if (dimensionExceeded) {
      status = 'too_large';
      reason = 'Dimensi barang melebihi ukuran box';
    } else if (isOverweight && isOvervolume) {
      status = 'overload';
      reason = `Overload Berat (${weightPct}%) & Volume (${volumePct}%)`;
    } else if (isOverweight) {
      status = 'overload';
      reason = `Overload Tonase (${weightPct}%)`;
    } else if (isOvervolume) {
      status = 'overload';
      reason = `Over Volume CBM (${volumePct}%)`;
    } else if (weightPct > 85 || volumePct > 85) {
      status = 'warning';
      reason = 'Muatan padat (>85%)';
    }

    // Estimate pieces fit
    const piecesFit = items.reduce((sum, item) => {
      const perUnitCbm = (item.lengthCm * item.widthCm * item.heightCm) / 1_000_000;
      const byVol = Math.floor(fleet.nominalCbm / perUnitCbm);
      const byWeight = Math.floor(fleet.maxWeightKg / item.weightKg);
      return Math.min(byVol, byWeight);
    }, 0);

    return {
      fleet,
      canFitAll: !dimensionExceeded && !isOverweight && !isOvervolume,
      maxPiecesFit: piecesFit,
      totalWeightKg,
      totalVolumeCbm: Number(totalVolumeCbm.toFixed(2)),
      weightPct,
      volumePct,
      isOverweight,
      isOvervolume,
      isDimensionExceeded: dimensionExceeded,
      status,
      reason
    };
  });

  // Pick the recommended fleet: smallest vehicle that canFitAll without overload
  const capableFleets = summaries
    .filter((s) => s.canFitAll)
    .sort((a, b) => a.fleet.maxWeightKg - b.fleet.maxWeightKg);

  if (capableFleets.length > 0) {
    const recommended = capableFleets[0];
    const recIndex = summaries.findIndex((s) => s.fleet.id === recommended.fleet.id);
    if (recIndex !== -1) {
      summaries[recIndex].status = 'recommended';
      summaries[recIndex].reason = 'Paling Ekonomis & Muat Sempurna';
    }
  }

  return summaries;
}

/**
 * Calculates estimated axle weight distribution
 * Returns percentage of weight on front axle vs rear axle(s)
 */
export function calculateAxleDistribution(fleet: FleetVehicle, packingPlan: PackingPlan) {
  if (packingPlan.placements.length === 0) {
    return { frontPct: 50, rearPct: 50, isBalanced: true, message: 'Belum ada muatan' };
  }

  // Calculate center of mass along truck length (X axis)
  let totalWeight = 0;
  let weightedX = 0;

  for (const box of packingPlan.placements) {
    const boxCenterX = box.x + box.length / 2;
    weightedX += boxCenterX * box.weight;
    totalWeight += box.weight;
  }

  const centerOfMassX = totalWeight > 0 ? weightedX / totalWeight : fleet.lengthCm / 2;
  const relativePosition = centerOfMassX / fleet.lengthCm; // 0 (front) to 1 (rear door)

  // Standard truck: front axle is near 0.15, rear axle(s) near 0.75 - 0.85
  // When relativePosition is 0.5 (middle of box), distribution is roughly 35-40% front, 60-65% rear
  const frontPct = Math.round(Math.max(15, Math.min(85, (1 - relativePosition * 0.9) * 60)));
  const rearPct = 100 - frontPct;

  const isBalanced = frontPct >= 30 && frontPct <= 45;
  let message = 'Distribusi beban ideal dan seimbang.';
  if (frontPct > 45) {
    message = 'Beban terlalu condong ke depan (dekat kabin). Kemudi mungkin terasa berat.';
  } else if (frontPct < 30) {
    message = 'Beban terlalu condong ke belakang (pintu). Risiko roda depan terangkat & ban selip!';
  }

  return {
    frontPct,
    rearPct,
    isBalanced,
    message
  };
}
