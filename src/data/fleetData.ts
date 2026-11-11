import { FleetVehicle, CargoItem, StackingPatternInfo } from '../types/logistics';

export const DEFAULT_FLEET_VEHICLES: FleetVehicle[] = [
  {
    id: 'blind-van',
    name: 'Blind Van',
    wheelsConfig: '4 Roda',
    axles: 2,
    lengthCm: 210,
    widthCm: 140,
    heightCm: 120,
    minCbm: 1,
    maxCbm: 3,
    nominalCbm: 3.5, // 2.1 x 1.4 x 1.2 = 3.528 CBM gross, ~3 CBM usable
    minWeightKg: 700,
    maxWeightKg: 800,
    popularUnits: 'Daihatsu Gran Max Blind Van, Suzuki APV Blind Van',
    category: 'van'
  },
  {
    id: 'pickup-box',
    name: 'Pick Up Box',
    wheelsConfig: '4 Roda',
    axles: 2,
    lengthCm: 230,
    widthCm: 140,
    heightCm: 125,
    minCbm: 4,
    maxCbm: 5,
    nominalCbm: 4.0, // 2.3 x 1.4 x 1.25 = 4.025 CBM
    minWeightKg: 800,
    maxWeightKg: 1000,
    popularUnits: 'Mitsubishi L300, Daihatsu Gran Max, Isuzu Traga',
    category: 'pickup'
  },
  {
    id: 'cde-box',
    name: 'CDE Box (Engkel)',
    wheelsConfig: '4 Roda (2 Sumbu)',
    axles: 2,
    lengthCm: 310,
    widthCm: 170,
    heightCm: 170,
    minCbm: 8,
    maxCbm: 10,
    nominalCbm: 8.96, // 3.1 x 1.7 x 1.7 = 8.959 CBM
    minWeightKg: 2000,
    maxWeightKg: 2500,
    popularUnits: 'Mitsubishi Canter FE 71, Isuzu Elf NLR, Hino Dutro 110 SD',
    category: 'light_truck'
  },
  {
    id: 'cdd-box',
    name: 'CDD Box (Double)',
    wheelsConfig: '6 Roda (2 Sumbu)',
    axles: 2,
    lengthCm: 450,
    widthCm: 200,
    heightCm: 200,
    minCbm: 16,
    maxCbm: 20,
    nominalCbm: 18.0, // 4.5 x 2.0 x 2.0 = 18.0 CBM
    minWeightKg: 4000,
    maxWeightKg: 5000,
    popularUnits: 'Mitsubishi Canter FE 74, Isuzu Elf NMR, Hino Dutro 130 HD',
    category: 'medium_truck'
  },
  {
    id: 'cdd-long-box',
    name: 'CDD Long Box',
    wheelsConfig: '6 Roda (2 Sumbu)',
    axles: 2,
    lengthCm: 530,
    widthCm: 200,
    heightCm: 210,
    minCbm: 22,
    maxCbm: 26,
    nominalCbm: 22.26, // 5.3 x 2.0 x 2.1 = 22.26 CBM
    minWeightKg: 5000,
    maxWeightKg: 6000,
    popularUnits: 'Mitsubishi Canter FE 84G, Isuzu Elf NMR 81 Long',
    category: 'medium_truck'
  },
  {
    id: 'fuso-box',
    name: 'Fuso Box',
    wheelsConfig: '6 Roda (2 Sumbu)',
    axles: 2,
    lengthCm: 700, // 600 - 750 cm
    widthCm: 240,
    heightCm: 240,
    minCbm: 30,
    maxCbm: 40,
    nominalCbm: 40.32, // 7.0 x 2.4 x 2.4 = 40.32 CBM
    minWeightKg: 7000,
    maxWeightKg: 10000,
    popularUnits: 'Mitsubishi Fuso Fighter FM/FN, Hino Ranger FG',
    category: 'heavy_truck'
  },
  {
    id: 'tronton-box',
    name: 'Tronton Box',
    wheelsConfig: '10 Roda (3 Sumbu)',
    axles: 3,
    lengthCm: 940,
    widthCm: 240,
    heightCm: 250,
    minCbm: 50,
    maxCbm: 55,
    nominalCbm: 56.4, // 9.4 x 2.4 x 2.5 = 56.4 CBM
    minWeightKg: 15000,
    maxWeightKg: 20000,
    popularUnits: 'Hino Ranger FL, Mitsubishi Fuso FN 61/62, UD Quester',
    category: 'heavy_truck'
  },
  {
    id: 'tronton-wingbox',
    name: 'Tronton Wingbox',
    wheelsConfig: '10 Roda (3 Sumbu)',
    axles: 3,
    lengthCm: 940,
    widthCm: 240,
    heightCm: 260,
    minCbm: 55,
    maxCbm: 65,
    nominalCbm: 58.6,
    minWeightKg: 15000,
    maxWeightKg: 20000,
    popularUnits: 'Hino Ranger FL, UD Quester, Isuzu Giga',
    category: 'heavy_truck'
  },
  {
    id: 'container-20ft',
    name: 'Container 20 Feet',
    wheelsConfig: 'Trailer 4-5 Sumbu',
    axles: 4,
    lengthCm: 590,
    widthCm: 235,
    heightCm: 239,
    minCbm: 30,
    maxCbm: 33,
    nominalCbm: 33.1,
    minWeightKg: 18000,
    maxWeightKg: 24000,
    popularUnits: 'Trailer Head Scania / Volvo / Hino Profia 20ft',
    category: 'container'
  },
  {
    id: 'container-40ft-hc',
    name: 'Container 40 Feet High Cube',
    wheelsConfig: 'Trailer 5-6 Sumbu',
    axles: 5,
    lengthCm: 1203,
    widthCm: 235,
    heightCm: 269,
    minCbm: 70,
    maxCbm: 76,
    nominalCbm: 76.2,
    minWeightKg: 22000,
    maxWeightKg: 28000,
    popularUnits: 'Trailer Head Scania / Mercedes-Benz Actros 40ft HC',
    category: 'container'
  }
];

export interface CargoPreset {
  name: string;
  category: string;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  weightKg: number;
  color: string;
  description: string;
  allowRotation: boolean;
  thisSideUp: boolean;
}

export const CARGO_PRESETS: CargoPreset[] = [
  {
    name: 'Karton Standar Logistik',
    category: 'Karton & Dus',
    lengthCm: 40,
    widthCm: 30,
    heightCm: 25,
    weightKg: 8,
    color: '#3B82F6', // Blue
    description: 'Kardus boks pengiriman barang umum / e-commerce',
    allowRotation: true,
    thisSideUp: false
  },
  {
    name: 'Karton Mie Instan / Makanan Ringan',
    category: 'Karton & Dus',
    lengthCm: 38,
    widthCm: 24,
    heightCm: 20,
    weightKg: 4.5,
    color: '#F59E0B', // Amber
    description: 'Dus mie instan 40 bungkus / makanan ringan',
    allowRotation: true,
    thisSideUp: true
  },
  {
    name: 'Karung Beras / Tepung (50 kg)',
    category: 'Karung & Sak',
    lengthCm: 75,
    widthCm: 45,
    heightCm: 20,
    weightKg: 50,
    color: '#10B981', // Emerald
    description: 'Karung goni/plastik bahan pangan berat',
    allowRotation: true,
    thisSideUp: false
  },
  {
    name: 'Sak Semen (50 kg)',
    category: 'Material Bangunan',
    lengthCm: 60,
    widthCm: 40,
    heightCm: 15,
    weightKg: 50,
    color: '#6B7280', // Gray
    description: 'Semen portland 50kg padat dan berbobot tinggi',
    allowRotation: true,
    thisSideUp: false
  },
  {
    name: 'Pallet Kayu Standar (120 x 100 cm)',
    category: 'Pallet & Unitized',
    lengthCm: 120,
    widthCm: 100,
    heightCm: 140, // Pallet + loaded height
    weightKg: 650,
    color: '#8B5CF6', // Purple
    description: 'Pallet standar industri ISO / ISPM 15 full load',
    allowRotation: false,
    thisSideUp: true
  },
  {
    name: 'Jerigen Cairan 20 Liter',
    category: 'Cairan & Kimia',
    lengthCm: 30,
    widthCm: 25,
    heightCm: 40,
    weightKg: 21,
    color: '#06B6D4', // Cyan
    description: 'Jerigen minyak goreng, sabun, atau cairan kimia',
    allowRotation: false,
    thisSideUp: true
  },
  {
    name: 'Drum Besi 200 Liter',
    category: 'Cairan & Kimia',
    lengthCm: 60,
    widthCm: 60,
    heightCm: 90,
    weightKg: 210,
    color: '#EF4444', // Red
    description: 'Drum baja oli / pelumas / cairan industri 200L',
    allowRotation: false,
    thisSideUp: true
  },
  {
    name: 'Kulkas 2 Pintu / Elektronik Besar',
    category: 'Elektronik & Furniture',
    lengthCm: 65,
    widthCm: 65,
    heightCm: 175,
    weightKg: 65,
    color: '#6366F1', // Indigo
    description: 'Kulkas lemari es, wajib tegak (tidak boleh rebah)',
    allowRotation: true,
    thisSideUp: true
  }
];

export const INITIAL_CARGO_ITEMS: CargoItem[] = [
  {
    id: 'item-1',
    name: 'Karton Barang Elektronik / Sembako',
    lengthCm: 50,
    widthCm: 40,
    heightCm: 35,
    weightKg: 15,
    quantity: 120,
    color: '#3B82F6',
    allowRotation: true,
    thisSideUp: false
  }
];

export const STACKING_PATTERNS: StackingPatternInfo[] = [
  {
    id: 'column',
    name: 'Susunan Kolom (Column / Block)',
    subtitle: 'Kekuatan tumpuk maksimal (sudut ketemu sudut)',
    description: 'Kardus ditumpuk lurus sejajar secara vertikal dari bawah ke atas.',
    method: 'Kardus ditumpuk lurus sejajar secara vertikal dari bawah ke atas (sudut ketemu sudut).',
    pros: 'Memiliki kekuatan tumpuk (compression strength) paling tinggi karena keempat sudut kardus saling menopang secara langsung.',
    cons: 'Kurang stabil terhadap guncangan atau tikungan tajam karena tidak ada ikatan antar tumpukan, sehingga wajib diikat (wrapping/strapping).',
    compressionStrengthPct: 100,
    stabilityPct: 50,
    recommendedWrapping: 'Wajib diikat rapat (Wrapping / Strapping ketat)',
    bestFor: 'Muatan kardus berat, material homogen, kardus dengan spesifikasi ECT tinggi'
  },
  {
    id: 'brick',
    name: 'Susunan Bata (Interlocking)',
    subtitle: 'Saling mengunci, anti geser & anti roboh',
    description: 'Lapisan berikutnya disusun berselang-seling memotong sambungan lapisan di bawahnya.',
    method: 'Lapisan berikutnya disusun berselang-seling memotong sambungan lapisan di bawahnya (seperti susunan batu bata pada dinding).',
    pros: 'Sangat stabil dan saling mengunci, sehingga tidak mudah bergeser atau roboh saat armada mengerem mendadak atau berbelok.',
    cons: 'Mengurangi kekuatan menahan beban atas hingga sekitar 30–50% dibanding susunan kolom, sehingga tidak cocok untuk barang yang mudah penyok.',
    compressionStrengthPct: 60,
    stabilityPct: 95,
    recommendedWrapping: 'Pengikatan standar, kargo sangat stabil saat jalan berliku',
    bestFor: 'Rute pengiriman jarak jauh, jalan bergelombang / tikungan tajam, barang tidak mudah penyok'
  },
  {
    id: 'pinwheel',
    name: 'Susunan Kincir (Pinwheel)',
    subtitle: 'Memutar memaksimal luasan bidang dasar',
    description: 'Empat kardus berbentuk persegi panjang diletakkan memutar mengelilingi ruang tengah.',
    method: 'Empat kardus berbentuk persegi panjang diletakkan memutar mengelilingi ruang kosong kecil di bagian tengah.',
    pros: 'Memaksimalkan luas bidang palet atau lantai truk jika ukuran kardus tidak pas untuk susunan kolom maupun bata.',
    cons: 'Cenderung tidak stabil jika tumpukan terlalu tinggi dan kekuatan sudutnya tidak sejajar sempurna.',
    compressionStrengthPct: 65,
    stabilityPct: 75,
    recommendedWrapping: 'Wrapping menyeluruh dan strapping silang',
    bestFor: 'Kardus rasio panjang-lebar khusus, pallet 120x100 atau lantai box ukuran tanggung'
  },
  {
    id: 'hybrid',
    name: 'Susunan Campuran (Mixed / Hybrid)',
    subtitle: 'Kolom di bawah + Bata pengunci di atas',
    description: 'Menggabungkan susunan kolom di bagian bawah dan susunan bata di 1–2 lapisan paling atas.',
    method: 'Menggabungkan susunan kolom di bagian bawah (untuk menahan beban berat) dan susunan bata di 1–2 lapisan paling atas (untuk mengunci muatan).',
    pros: 'Mendapatkan keseimbangan optimal antara kekuatan tumpukan bawah yang kokoh dan kestabilan bagian atas agar tidak mudah jatuh.',
    cons: 'Memerlukan ketelitian dan waktu penataan sedikit lebih lama bagi kru bongkar muat.',
    compressionStrengthPct: 88,
    stabilityPct: 90,
    recommendedWrapping: 'Corner protector + strapping atas',
    bestFor: 'Truk full load muatan berat campur ringan, pengiriman antar kota / tol'
  },
  {
    id: 'pyramid',
    name: 'Susunan Piramida / Tangga (Stepped)',
    subtitle: 'Aman untuk muatan sebagian (Partial Load / LTL)',
    description: 'Bagian bawah dibuat lebar dan penuh, semakin ke atas luas tumpukan mengecil.',
    method: 'Bagian bawah dibuat lebar dan penuh, lalu semakin ke atas luas tumpukannya semakin mengecil menyerupai anak tangga.',
    pros: 'Sangat aman saat mengirim barang dalam jumlah yang tidak memenuhi satu truk penuh (partial load), karena mencegah barang bagian atas meluncur jatuh ke ruang kosong di belakangnya.',
    cons: 'Kapasitas kubikasi total truk tidak terpakai 100% karena menyisakan ruang tangga di atas/belakang.',
    compressionStrengthPct: 82,
    stabilityPct: 92,
    recommendedWrapping: 'Netting cargo / jaring penahan kargo di tangga belakang',
    bestFor: 'Muatan partial (LTL), pengiriman sebagian kuota, multi-drop unloading'
  }
];

