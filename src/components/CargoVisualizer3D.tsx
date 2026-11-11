import React, { useRef, useEffect, useState, useMemo } from 'react';
import { FleetVehicle, CargoItem } from '../types/logistics';
import { PackingPlan, BoxPlacement } from '../utils/calculator';
import { Layers, Eye, ZoomIn, ZoomOut, RotateCw, Box, Truck, Maximize2, Minimize2 } from 'lucide-react';

interface Props {
  fleet: FleetVehicle;
  items: CargoItem[];
  packingPlan: PackingPlan;
}

type ViewMode = 'isometric' | 'top' | 'side' | 'rear';

export const CargoVisualizer3D: React.FC<Props> = ({ fleet, items: _items, packingPlan }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('isometric');
  const [zoom, setZoom] = useState<number>(1);
  const [selectedLayer, setSelectedLayer] = useState<number>(0); // 0 = all layers
  const [angleOffset, setAngleOffset] = useState<number>(30); // in degrees
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sizeKey, setSizeKey] = useState(0);

  // ResizeObserver to detect parent container dimension changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      setSizeKey((prev) => prev + 1);
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Compute layers available
  const availableLayers = useMemo(() => {
    const ySet = new Set<number>();
    packingPlan.placements.forEach((p) => ySet.add(p.y));
    return Array.from(ySet).sort((a, b) => a - b);
  }, [packingPlan]);

  // Filter boxes by layer
  const filteredBoxes = useMemo(() => {
    if (selectedLayer === 0 || availableLayers.length === 0) {
      return packingPlan.placements;
    }
    const targetY = availableLayers[selectedLayer - 1];
    return packingPlan.placements.filter((p) => Math.abs(p.y - targetY) < 1);
  }, [packingPlan, selectedLayer, availableLayers]);

  // Handle mouse drag to rotate isometric view
  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewMode !== 'isometric') return;
    setIsDragging(true);
    setDragStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || viewMode !== 'isometric') return;
    const deltaX = e.clientX - dragStartX;
    setAngleOffset((prev) => (prev + deltaX * 0.4) % 360);
    setDragStartX(e.clientX);
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0F172A'); // slate-900
    bgGrad.addColorStop(1, '#020617'); // slate-950
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Grid floor
    drawFloorGrid(ctx, width, height);

    if (viewMode === 'isometric') {
      renderIsometric(ctx, width, height, fleet, filteredBoxes, zoom, angleOffset);
    } else if (viewMode === 'top') {
      renderTopView(ctx, width, height, fleet, filteredBoxes, zoom);
    } else if (viewMode === 'side') {
      renderSideView(ctx, width, height, fleet, filteredBoxes, zoom);
    } else if (viewMode === 'rear') {
      renderRearView(ctx, width, height, fleet, filteredBoxes, zoom);
    }
  }, [fleet, filteredBoxes, viewMode, zoom, angleOffset, sizeKey, isFullscreen]);

  function drawFloorGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 3D Isometric projection math
  function project3D(
    x: number,
    y: number,
    z: number,
    centerX: number,
    centerY: number,
    scale: number,
    angleDeg: number
  ) {
    const rad = (angleDeg * Math.PI) / 180;
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);

    // Rotated around Y (vertical) axis
    const rx = x * cosA - z * sinA;
    const rz = x * sinA + z * cosA;

    // Standard 30 degree axonometric angle
    const isoAngle = Math.PI / 6;
    const px = centerX + (rx - rz) * Math.cos(isoAngle) * scale;
    const py = centerY + (rx + rz) * Math.sin(isoAngle) * 0.6 * scale - y * scale;

    return { x: px, y: py, depth: rx + rz };
  }

  function renderIsometric(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    vehicle: FleetVehicle,
    boxes: BoxPlacement[],
    zoomLevel: number,
    angle: number
  ) {
    ctx.save();
    const centerX = width / 2;
    const centerY = height * 0.68;

    // Normalize scale so standard vehicle fits nicely
    const maxDimension = Math.max(vehicle.lengthCm, vehicle.widthCm * 2, vehicle.heightCm * 2);
    const baseScale = (Math.min(width, height) * 0.65) / maxDimension;
    const scale = baseScale * zoomLevel;

    // Draw Truck Cabin at Front (X < 0)
    drawTruckCabinIsometric(ctx, centerX, centerY, scale, angle, vehicle);

    // Draw Cargo Box Outline (Transparent Container Walls)
    drawCargoBoxIsometric(ctx, centerX, centerY, scale, angle, vehicle);

    // Sort boxes from back to front for proper painter's algorithm
    const sortedBoxes = [...boxes].map((box) => {
      const p = project3D(
        box.x + box.length / 2,
        box.y + box.height / 2,
        box.z + box.width / 2,
        centerX,
        centerY,
        scale,
        angle
      );
      return { box, depth: p.depth };
    });
    sortedBoxes.sort((a, b) => a.depth - b.depth);

    // Draw Boxes
    sortedBoxes.forEach(({ box }) => {
      drawSingleBoxIsometric(ctx, centerX, centerY, scale, angle, box);
    });

    // Draw Axis and Dimension Indicators
    drawDimensionGuidesIsometric(ctx, centerX, centerY, scale, angle, vehicle);

    ctx.restore();
  }

  function drawTruckCabinIsometric(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    scale: number,
    angle: number,
    vehicle: FleetVehicle
  ) {
    ctx.save();
    // Cabin is in front of cargo box (negative X)
    const cabinLength = Math.min(140, vehicle.lengthCm * 0.25);
    const cabinHeight = vehicle.heightCm * 0.9;
    const cabinWidth = vehicle.widthCm * 0.95;
    const cabinX = -cabinLength;
    const cabinZ = (vehicle.widthCm - cabinWidth) / 2;

    const p1 = project3D(cabinX, 0, cabinZ, centerX, centerY, scale, angle);
    const p2 = project3D(0, 0, cabinZ, centerX, centerY, scale, angle);
    const p3 = project3D(0, 0, cabinZ + cabinWidth, centerX, centerY, scale, angle);
    const p4 = project3D(cabinX, 0, cabinZ + cabinWidth, centerX, centerY, scale, angle);

    const t1 = project3D(cabinX, cabinHeight, cabinZ, centerX, centerY, scale, angle);
    const t2 = project3D(0, cabinHeight, cabinZ, centerX, centerY, scale, angle);
    const t3 = project3D(0, cabinHeight, cabinZ + cabinWidth, centerX, centerY, scale, angle);
    const t4 = project3D(cabinX, cabinHeight, cabinZ + cabinWidth, centerX, centerY, scale, angle);

    // Cabin body
    ctx.fillStyle = 'rgba(51, 65, 85, 0.4)'; // slate-700
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)'; // slate-400
    ctx.lineWidth = 1.5;

    // Cabin front face
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.lineTo(t4.x, t4.y);
    ctx.lineTo(t1.x, t1.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Windshield hint
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)'; // sky blue glass
    ctx.beginPath();
    const wsY1 = cabinHeight * 0.4;
    const wsY2 = cabinHeight * 0.9;
    const wp1 = project3D(cabinX + 2, wsY1, cabinZ + 10, centerX, centerY, scale, angle);
    const wp2 = project3D(cabinX + 2, wsY1, cabinZ + cabinWidth - 10, centerX, centerY, scale, angle);
    const wp3 = project3D(cabinX + 2, wsY2, cabinZ + cabinWidth - 10, centerX, centerY, scale, angle);
    const wp4 = project3D(cabinX + 2, wsY2, cabinZ + 10, centerX, centerY, scale, angle);
    ctx.moveTo(wp1.x, wp1.y);
    ctx.lineTo(wp2.x, wp2.y);
    ctx.lineTo(wp3.x, wp3.y);
    ctx.lineTo(wp4.x, wp4.y);
    ctx.closePath();
    ctx.fill();

    // Cabin label
    const labelPos = project3D(cabinX / 2, cabinHeight + 15, cabinZ + cabinWidth / 2, centerX, centerY, scale, angle);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('KABIN DEPAN', labelPos.x, labelPos.y);

    ctx.restore();
  }

  function drawCargoBoxIsometric(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    scale: number,
    angle: number,
    vehicle: FleetVehicle
  ) {
    ctx.save();
    const L = vehicle.lengthCm;
    const W = vehicle.widthCm;
    const H = vehicle.heightCm;

    // 8 Box Corners
    const p000 = project3D(0, 0, 0, centerX, centerY, scale, angle);
    const pL00 = project3D(L, 0, 0, centerX, centerY, scale, angle);
    const pL0W = project3D(L, 0, W, centerX, centerY, scale, angle);
    const p00W = project3D(0, 0, W, centerX, centerY, scale, angle);

    const p0H0 = project3D(0, H, 0, centerX, centerY, scale, angle);
    const pLH0 = project3D(L, H, 0, centerX, centerY, scale, angle);
    const pLHW = project3D(L, H, W, centerX, centerY, scale, angle);
    const p0HW = project3D(0, H, W, centerX, centerY, scale, angle);

    // Floor of cargo box
    ctx.fillStyle = 'rgba(30, 41, 59, 0.7)'; // slate-800
    ctx.beginPath();
    ctx.moveTo(p000.x, p000.y);
    ctx.lineTo(pL00.x, pL00.y);
    ctx.lineTo(pL0W.x, pL0W.y);
    ctx.lineTo(p00W.x, p00W.y);
    ctx.closePath();
    ctx.fill();

    // Box perimeter wireframe
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)'; // vibrant cyan wireframe
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);

    // Bottom
    ctx.beginPath();
    ctx.moveTo(p000.x, p000.y);
    ctx.lineTo(pL00.x, pL00.y);
    ctx.lineTo(pL0W.x, pL0W.y);
    ctx.lineTo(p00W.x, p00W.y);
    ctx.closePath();
    ctx.stroke();

    // Top
    ctx.beginPath();
    ctx.moveTo(p0H0.x, p0H0.y);
    ctx.lineTo(pLH0.x, pLH0.y);
    ctx.lineTo(pLHW.x, pLHW.y);
    ctx.lineTo(p0HW.x, p0HW.y);
    ctx.closePath();
    ctx.stroke();

    // Pillars
    const drawLine = (a: { x: number; y: number }, b: { x: number; y: number }) => {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    };
    drawLine(p000, p0H0);
    drawLine(pL00, pLH0);
    drawLine(pL0W, pLHW);
    drawLine(p00W, p0HW);

    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawSingleBoxIsometric(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    scale: number,
    angle: number,
    box: BoxPlacement
  ) {
    ctx.save();
    const x0 = box.x;
    const x1 = box.x + box.length;
    const y0 = box.y;
    const y1 = box.y + box.height;
    const z0 = box.z;
    const z1 = box.z + box.width;

    const b00 = project3D(x0, y0, z0, centerX, centerY, scale, angle);
    const b10 = project3D(x1, y0, z0, centerX, centerY, scale, angle);
    const b11 = project3D(x1, y0, z1, centerX, centerY, scale, angle);
    const b01 = project3D(x0, y0, z1, centerX, centerY, scale, angle);

    const t00 = project3D(x0, y1, z0, centerX, centerY, scale, angle);
    const t10 = project3D(x1, y1, z0, centerX, centerY, scale, angle);
    const t11 = project3D(x1, y1, z1, centerX, centerY, scale, angle);
    const t01 = project3D(x0, y1, z1, centerX, centerY, scale, angle);

    // Color tones
    const baseColor = box.color || '#3B82F6';

    // Top Face (lightest)
    ctx.fillStyle = shadeColor(baseColor, 20);
    ctx.beginPath();
    ctx.moveTo(t00.x, t00.y);
    ctx.lineTo(t10.x, t10.y);
    ctx.lineTo(t11.x, t11.y);
    ctx.lineTo(t01.x, t01.y);
    ctx.closePath();
    ctx.fill();

    // Right / Front Face (medium)
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.moveTo(b10.x, b10.y);
    ctx.lineTo(b11.x, b11.y);
    ctx.lineTo(t11.x, t11.y);
    ctx.lineTo(t10.x, t10.y);
    ctx.closePath();
    ctx.fill();

    // Left / Back Face (darkest)
    ctx.fillStyle = shadeColor(baseColor, -25);
    ctx.beginPath();
    ctx.moveTo(b01.x, b01.y);
    ctx.lineTo(b11.x, b11.y);
    ctx.lineTo(t11.x, t11.y);
    ctx.lineTo(t01.x, t01.y);
    ctx.closePath();
    ctx.fill();

    // Box edge borders
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.restore();
  }

  function drawDimensionGuidesIsometric(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    scale: number,
    angle: number,
    vehicle: FleetVehicle
  ) {
    ctx.save();
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#38BDF8'; // Sky 400

    // Length label (bottom side)
    const pLStart = project3D(0, -10, vehicle.widthCm + 15, centerX, centerY, scale, angle);
    const pLEnd = project3D(vehicle.lengthCm, -10, vehicle.widthCm + 15, centerX, centerY, scale, angle);
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pLStart.x, pLStart.y);
    ctx.lineTo(pLEnd.x, pLEnd.y);
    ctx.stroke();

    const midL = { x: (pLStart.x + pLEnd.x) / 2, y: (pLStart.y + pLEnd.y) / 2 };
    ctx.fillText(`Panjang: ${vehicle.lengthCm} cm (${(vehicle.lengthCm / 100).toFixed(1)}m)`, midL.x - 40, midL.y + 16);

    // Height label (rear corner)
    const pHStart = project3D(vehicle.lengthCm + 15, 0, 0, centerX, centerY, scale, angle);
    const pHEnd = project3D(vehicle.lengthCm + 15, vehicle.heightCm, 0, centerX, centerY, scale, angle);
    ctx.beginPath();
    ctx.moveTo(pHStart.x, pHStart.y);
    ctx.lineTo(pHEnd.x, pHEnd.y);
    ctx.stroke();

    const midH = { x: (pHStart.x + pHEnd.x) / 2, y: (pHStart.y + pHEnd.y) / 2 };
    ctx.fillText(`Tinggi: ${vehicle.heightCm} cm`, midH.x + 8, midH.y);

    ctx.restore();
  }

  // 2D Orthogonal Projections
  function renderTopView(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    vehicle: FleetVehicle,
    boxes: BoxPlacement[],
    zoomLevel: number
  ) {
    ctx.save();
    const margin = 50;
    const availW = width - margin * 2;
    const availH = height - margin * 2;
    const scale = Math.min(availW / vehicle.lengthCm, availH / vehicle.widthCm) * 0.85 * zoomLevel;

    const boxW = vehicle.lengthCm * scale;
    const boxH = vehicle.widthCm * scale;
    const startX = (width - boxW) / 2;
    const startY = (height - boxH) / 2;

    // Truck Box Floor
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2;
    ctx.fillRect(startX, startY, boxW, boxH);
    ctx.strokeRect(startX, startY, boxW, boxH);

    // Cabin indicator (left side)
    ctx.fillStyle = '#334155';
    ctx.fillRect(startX - 40, startY + 5, 36, boxH - 10);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('KABIN', startX - 22, startY + boxH / 2);

    // Rear door indicator (right side)
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startX + boxW, startY);
    ctx.lineTo(startX + boxW, startY + boxH);
    ctx.stroke();
    ctx.fillStyle = '#F59E0B';
    ctx.fillText('PINTU BELAKANG', startX + boxW + 45, startY + boxH / 2);

    // Render cargo boxes
    boxes.forEach((box) => {
      const bx = startX + box.x * scale;
      const bz = startY + box.z * scale;
      const bw = box.length * scale;
      const bh = box.width * scale;

      ctx.fillStyle = box.color || '#3B82F6';
      ctx.fillRect(bx, bz, bw, bh);
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, bz, bw, bh);
    });

    // Dimension labels
    ctx.fillStyle = '#E2E8F0';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Tampak Atas: Panjang ${vehicle.lengthCm} cm × Lebar ${vehicle.widthCm} cm`, width / 2, startY - 15);

    ctx.restore();
  }

  function renderSideView(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    vehicle: FleetVehicle,
    boxes: BoxPlacement[],
    zoomLevel: number
  ) {
    ctx.save();
    const margin = 50;
    const availW = width - margin * 2;
    const availH = height - margin * 2;
    const scale = Math.min(availW / vehicle.lengthCm, availH / vehicle.heightCm) * 0.85 * zoomLevel;

    const boxW = vehicle.lengthCm * scale;
    const boxH = vehicle.heightCm * scale;
    const startX = (width - boxW) / 2;
    const startY = (height - boxH) / 2 + 15;

    // Box body
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2;
    ctx.fillRect(startX, startY, boxW, boxH);
    ctx.strokeRect(startX, startY, boxW, boxH);

    // Cabin at left
    ctx.fillStyle = '#334155';
    ctx.fillRect(startX - 50, startY + 10, 48, boxH - 10);
    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(startX - 45, startY + 15, 25, (boxH - 10) * 0.4); // windshield
    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px sans-serif';
    ctx.fillText('KABIN', startX - 25, startY + boxH * 0.8);

    // Wheels below
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 3;
    const wheelRadius = 14;
    // Front wheel
    ctx.beginPath();
    ctx.arc(startX - 25, startY + boxH + wheelRadius, wheelRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Rear wheels
    ctx.beginPath();
    ctx.arc(startX + boxW - 35, startY + boxH + wheelRadius, wheelRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (vehicle.wheelsConfig.includes('6') || vehicle.wheelsConfig.includes('10')) {
      ctx.beginPath();
      ctx.arc(startX + boxW - 65, startY + boxH + wheelRadius, wheelRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Render cargo boxes (from floor up)
    boxes.forEach((box) => {
      const bx = startX + box.x * scale;
      // Invert Y because canvas Y=0 is top, but truck floor Y=0 is bottom
      const by = startY + boxH - (box.y + box.height) * scale;
      const bw = box.length * scale;
      const bh = box.height * scale;

      ctx.fillStyle = box.color || '#3B82F6';
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, bw, bh);
    });

    ctx.fillStyle = '#E2E8F0';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Tampak Samping: Panjang ${vehicle.lengthCm} cm × Tinggi ${vehicle.heightCm} cm`, width / 2, startY - 20);

    ctx.restore();
  }

  function renderRearView(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    vehicle: FleetVehicle,
    boxes: BoxPlacement[],
    zoomLevel: number
  ) {
    ctx.save();
    const margin = 50;
    const availW = width - margin * 2;
    const availH = height - margin * 2;
    const scale = Math.min(availW / vehicle.widthCm, availH / vehicle.heightCm) * 0.85 * zoomLevel;

    const boxW = vehicle.widthCm * scale;
    const boxH = vehicle.heightCm * scale;
    const startX = (width - boxW) / 2;
    const startY = (height - boxH) / 2;

    // Rear cargo door opening
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2;
    ctx.fillRect(startX, startY, boxW, boxH);
    ctx.strokeRect(startX, startY, boxW, boxH);

    // Rear bumper & tail lights
    ctx.fillStyle = '#334155';
    ctx.fillRect(startX - 10, startY + boxH, boxW + 20, 16);
    ctx.fillStyle = '#EF4444'; // Red tail lights
    ctx.fillRect(startX - 6, startY + boxH + 2, 12, 12);
    ctx.fillRect(startX + boxW - 6, startY + boxH + 2, 12, 12);

    // Render boxes seen from rear (stacked across width and height)
    boxes.forEach((box) => {
      const bz = startX + box.z * scale;
      const by = startY + boxH - (box.y + box.height) * scale;
      const bw = box.width * scale;
      const bh = box.height * scale;

      ctx.fillStyle = box.color || '#3B82F6';
      ctx.fillRect(bz, by, bw, bh);
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1;
      ctx.strokeRect(bz, by, bw, bh);
    });

    ctx.fillStyle = '#E2E8F0';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Tampak Pintu Belakang: Lebar ${vehicle.widthCm} cm × Tinggi ${vehicle.heightCm} cm`, width / 2, startY - 20);

    ctx.restore();
  }

  // Color shading helper
  function shadeColor(color: string, percent: number) {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = Math.round((R * (100 + percent)) / 100);
    G = Math.round((G * (100 + percent)) / 100);
    B = Math.round((B * (100 + percent)) / 100);

    R = Math.min(255, Math.max(0, R));
    G = Math.min(255, Math.max(0, G));
    B = Math.min(255, Math.max(0, B));

    const RR = R.toString(16).padStart(2, '0');
    const GG = G.toString(16).padStart(2, '0');
    const BB = B.toString(16).padStart(2, '0');

    return `#${RR}${GG}${BB}`;
  }

  return (
    <div
      className={`relative w-full rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl transition-all duration-300 flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen w-screen border-none' : 'h-full'
      }`}
    >
      {/* Top HUD Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 z-10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              Visualisasi Penataan Kargo ({fleet.name})
            </h3>
            <p className="text-xs text-slate-400">
              Ruang Karoseri: {fleet.lengthCm} × {fleet.widthCm} × {fleet.heightCm} cm (Est. {fleet.nominalCbm} CBM)
            </p>
          </div>
        </div>

        {/* View Mode Segmented Controls */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <button
            type="button"
            onClick={() => setViewMode('isometric')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              viewMode === 'isometric'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            3D Isometrik
          </button>
          <button
            type="button"
            onClick={() => setViewMode('top')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              viewMode === 'top'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Tampak Atas
          </button>
          <button
            type="button"
            onClick={() => setViewMode('side')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              viewMode === 'side'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Samping
          </button>
          <button
            type="button"
            onClick={() => setViewMode('rear')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              viewMode === 'rear'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Pintu Belakang
          </button>
        </div>

        {/* Zoom, Rotation & Fullscreen Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setZoom((prev) => Math.min(prev + 0.15, 2.0))}
            className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
            title="Perbesar (Zoom In)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((prev) => Math.max(prev - 0.15, 0.6))}
            className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
            title="Perkecil (Zoom Out)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          {viewMode === 'isometric' && (
            <button
              type="button"
              onClick={() => setAngleOffset((prev) => (prev + 45) % 360)}
              className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
              title="Putar Sudut Pandang"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`p-1.5 rounded-lg border transition ${
              isFullscreen
                ? 'bg-blue-600 text-white border-blue-500'
                : 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border-slate-700'
            }`}
            title={isFullscreen ? 'Keluar Layar Penuh (ESC)' : 'Mode Layar Penuh (Full Page)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div
        ref={containerRef}
        className={`w-full relative cursor-grab active:cursor-grabbing flex-1 ${
          isFullscreen ? 'h-full min-h-0' : 'h-[440px] lg:h-[520px] xl:h-[580px]'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Overlay Info Badges */}
        <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2 pointer-events-none">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/85 backdrop-blur-md border border-slate-800 text-xs text-slate-200 flex items-center gap-2">
            <Box className="w-4 h-4 text-blue-400" />
            <span>
              Muat Fisik:{' '}
              <strong className="text-white">
                {packingPlan.totalBoxesPlaced} / {packingPlan.totalBoxesRequested}
              </strong>{' '}
              Koli
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-900/85 backdrop-blur-md border border-slate-800 text-xs text-indigo-300 flex items-center gap-1.5 font-mono">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>{packingPlan.patternName || 'Pola Penataan'}</span>
          </div>

          {packingPlan.totalBoxesPlaced < packingPlan.totalBoxesRequested && (
            <div className="px-3 py-1.5 rounded-lg bg-rose-950/80 backdrop-blur-md border border-rose-800 text-xs text-rose-200">
              Sisa {packingPlan.totalBoxesRequested - packingPlan.totalBoxesPlaced} koli tidak muat di armada ini!
            </div>
          )}
        </div>

        {/* 3D Drag Hint */}
        {viewMode === 'isometric' && (
          <div className="absolute top-3 right-3 pointer-events-none text-[11px] text-slate-500 bg-slate-950/60 px-2 py-1 rounded">
            Drag mouse untuk memutar 3D
          </div>
        )}
      </div>

      {/* Bottom Layer Slider (if multi-layer exists) */}
      {availableLayers.length > 1 && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Filter Tingkat Tumpukan (Layer):</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedLayer(0)}
              className={`px-2.5 py-1 rounded text-xs transition ${
                selectedLayer === 0 ? 'bg-emerald-600 text-white font-medium' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Semua ({availableLayers.length} Tingkat)
            </button>
            {availableLayers.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedLayer(i + 1)}
                className={`px-2.5 py-1 rounded text-xs transition ${
                  selectedLayer === i + 1 ? 'bg-emerald-600 text-white font-medium' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Lt.{i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
