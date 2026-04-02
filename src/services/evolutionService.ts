import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  Timestamp,
  doc,
  updateDoc,
  getDocs,
  limit
} from 'firebase/firestore';

export interface Measurement {
  id?: string;
  timestamp: Timestamp;
  weight: number;
  waist?: number;
  chest?: number;
  armRight?: number;
  armLeft?: number;
  thighRight?: number;
  thighLeft?: number;
  bodyFat?: number;
  muscleMass?: number;
}

export interface EvolutionPhoto {
  id?: string;
  timestamp: Timestamp;
  url: string;
  type: 'front' | 'side' | 'back';
  notes?: string;
}

export const evolutionService = {
  async addMeasurement(userId: string, measurement: Omit<Measurement, 'timestamp'>) {
    const colRef = collection(db, `users/${userId}/evolution`);
    return await addDoc(colRef, {
      ...measurement,
      timestamp: Timestamp.now()
    });
  },

  async addPhoto(userId: string, photo: Omit<EvolutionPhoto, 'timestamp'>) {
    const colRef = collection(db, `users/${userId}/photos`);
    return await addDoc(colRef, {
      ...photo,
      timestamp: Timestamp.now()
    });
  },

  subscribeToMeasurements(userId: string, callback: (measurements: Measurement[]) => void) {
    const q = query(
      collection(db, `users/${userId}/evolution`),
      orderBy('timestamp', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const measurements = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Measurement[];
      callback(measurements);
    });
  },

  subscribeToPhotos(userId: string, callback: (photos: EvolutionPhoto[]) => void) {
    const q = query(
      collection(db, `users/${userId}/photos`),
      orderBy('timestamp', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const photos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EvolutionPhoto[];
      callback(photos);
    });
  }
};
