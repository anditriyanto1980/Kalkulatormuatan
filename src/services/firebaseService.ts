import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { FleetVehicle, CargoItem } from '../types/logistics';

export interface SavedManifestRecord {
  id: string;
  manifestNumber: string;
  fleetId: string;
  fleetName: string;
  wheelsConfig: string;
  totalWeightKg: number;
  totalVolumeCbm: number;
  totalPieces: number;
  status: string;
  items: CargoItem[];
  notes?: string;
  createdAt: any;
  userId?: string;
}

export interface SavedCustomFleetRecord {
  id: string;
  name: string;
  wheelsConfig: string;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  nominalCbm: number;
  maxWeightKg: number;
  popularUnits: string;
  createdAt: any;
  userId?: string;
}

const MANIFESTS_COLLECTION = 'manifests';
const CUSTOM_FLEETS_COLLECTION = 'customFleets';

/**
 * Save a cargo loading manifest to Firestore
 */
export async function saveManifestToFirestore(data: {
  manifestNumber: string;
  fleet: FleetVehicle;
  items: CargoItem[];
  totalWeightKg: number;
  totalVolumeCbm: number;
  totalPieces: number;
  status: string;
  notes?: string;
}): Promise<string> {
  const currentUserId = auth.currentUser?.uid || 'anonymous';
  const manifestData = {
    manifestNumber: data.manifestNumber,
    fleetId: data.fleet.id,
    fleetName: data.fleet.name,
    wheelsConfig: data.fleet.wheelsConfig,
    totalWeightKg: data.totalWeightKg,
    totalVolumeCbm: data.totalVolumeCbm,
    totalPieces: data.totalPieces,
    status: data.status,
    items: data.items,
    notes: data.notes || '',
    userId: currentUserId,
    createdAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, MANIFESTS_COLLECTION), manifestData);
  return docRef.id;
}

/**
 * Fetch all saved manifests from Firestore
 */
export async function getManifestsFromFirestore(): Promise<SavedManifestRecord[]> {
  try {
    const q = query(collection(db, MANIFESTS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => {
      const d = docSnap.data();
      return {
        id: docSnap.id,
        manifestNumber: d.manifestNumber || `MNF-${docSnap.id.slice(0, 6)}`,
        fleetId: d.fleetId || '',
        fleetName: d.fleetName || 'Armada Logistik',
        wheelsConfig: d.wheelsConfig || '',
        totalWeightKg: d.totalWeightKg || 0,
        totalVolumeCbm: d.totalVolumeCbm || 0,
        totalPieces: d.totalPieces || 0,
        status: d.status || 'safe',
        items: d.items || [],
        notes: d.notes || '',
        createdAt: d.createdAt instanceof Timestamp ? d.createdAt.toDate() : new Date(),
        userId: d.userId
      };
    });
  } catch (err) {
    console.warn('Could not fetch manifests:', err);
    return [];
  }
}

/**
 * Delete a saved manifest
 */
export async function deleteManifestFromFirestore(id: string): Promise<void> {
  await deleteDoc(doc(db, MANIFESTS_COLLECTION, id));
}

/**
 * Save a custom fleet to Firestore
 */
export async function saveCustomFleetToFirestore(fleet: FleetVehicle): Promise<string> {
  const currentUserId = auth.currentUser?.uid || 'anonymous';
  const fleetData = {
    name: fleet.name,
    wheelsConfig: fleet.wheelsConfig,
    lengthCm: fleet.lengthCm,
    widthCm: fleet.widthCm,
    heightCm: fleet.heightCm,
    nominalCbm: fleet.nominalCbm,
    maxWeightKg: fleet.maxWeightKg,
    popularUnits: fleet.popularUnits,
    userId: currentUserId,
    createdAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, CUSTOM_FLEETS_COLLECTION), fleetData);
  return docRef.id;
}

/**
 * Fetch all custom fleets saved in Firestore
 */
export async function getCustomFleetsFromFirestore(): Promise<FleetVehicle[]> {
  try {
    const q = query(collection(db, CUSTOM_FLEETS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => {
      const d = docSnap.data();
      return {
        id: docSnap.id,
        name: d.name,
        wheelsConfig: d.wheelsConfig,
        axles: d.wheelsConfig?.includes('10') ? 3 : 2,
        lengthCm: d.lengthCm,
        widthCm: d.widthCm,
        heightCm: d.heightCm,
        minCbm: Math.floor(d.nominalCbm * 0.85),
        maxCbm: Math.ceil(d.nominalCbm),
        nominalCbm: d.nominalCbm,
        minWeightKg: Math.floor(d.maxWeightKg * 0.8),
        maxWeightKg: d.maxWeightKg,
        popularUnits: d.popularUnits || 'Custom Karoseri Khusus',
        category: 'medium_truck',
        isCustom: true
      };
    });
  } catch (err) {
    console.warn('Could not fetch custom fleets:', err);
    return [];
  }
}
