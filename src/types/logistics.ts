export type FleetCategory = 'van' | 'pickup' | 'light_truck' | 'medium_truck' | 'heavy_truck' | 'container';

export interface FleetVehicle {
  id: string;
  name: string;
  wheelsConfig: string; // e.g. "4 Roda", "4 Roda (2 Sumbu)", "6 Roda (2 Sumbu)", "10 Roda (3 Sumbu)"
  axles: number;
  // Dimensions in centimeters (interior cargo area)
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  minCbm: number;
  maxCbm: number;
  nominalCbm: number;
  minWeightKg: number;
  maxWeightKg: number; // Max weight in kg (tonnage = maxWeightKg / 1000)
  popularUnits: string; // e.g. "Daihatsu Gran Max Blind Van, Suzuki APV Blind Van"
  category: FleetCategory;
  isCustom?: boolean;
}

export interface CargoItem {
  id: string;
  name: string;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  weightKg: number; // weight per single piece
  quantity: number;
  color: string;
  allowRotation: boolean; // can rotate horizontally (L x W)
  thisSideUp: boolean; // cannot invert height
}

export type StackingPattern = 'column' | 'brick' | 'pinwheel' | 'hybrid' | 'pyramid';

export interface StackingPatternInfo {
  id: StackingPattern;
  name: string;
  subtitle: string;
  description: string;
  method: string;
  pros: string;
  cons: string;
  compressionStrengthPct: number; // 0 - 100
  stabilityPct: number; // 0 - 100
  recommendedWrapping: string;
  bestFor: string;
}

export interface StackingResult {
  orientation: 'standard' | 'rotated';
  pattern: StackingPattern;
  alongLength: number;
  alongWidth: number;
  alongHeight: number;
  maxFitByDimension: number;
  actualPiecesLoaded: number;
  totalVolumeCbm: number;
  totalWeightKg: number;
  totalTon: number;
  volumeUtilizationPct: number;
  weightUtilizationPct: number;
  remainingVolumeCbm: number;
  remainingWeightKg: number;
  isOverweight: boolean;
  isOvervolume: boolean;
  isDimensionExceeded: boolean;
  status: 'safe' | 'optimal' | 'warning' | 'overload_weight' | 'overload_volume' | 'dimension_exceeded';
  statusMessage: string;
}

export interface FleetFitSummary {
  fleet: FleetVehicle;
  canFitAll: boolean;
  maxPiecesFit: number;
  totalWeightKg: number;
  totalVolumeCbm: number;
  weightPct: number;
  volumePct: number;
  isOverweight: boolean;
  isOvervolume: boolean;
  isDimensionExceeded: boolean;
  status: 'recommended' | 'safe' | 'warning' | 'overload' | 'too_large';
  reason: string;
}

