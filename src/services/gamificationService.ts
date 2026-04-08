import { db } from '../firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  arrayUnion,
  collection,
  query,
  where,
  getDocs,
  limit,
  orderBy
} from 'firebase/firestore';

export interface UserStats {
  points: number;
  level: number;
  badges: string[];
  completedWorkouts: number;
  postsCount: number;
  streak: number;
  lastActivityDate?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
}

export const BADGES: Badge[] = [
  { id: 'first_workout', name: 'Primeiro Passo', description: 'Concluiu o primeiro treino', icon: '🏃‍♂️', requirement: '1 treino' },
  { id: 'workout_streak_3', name: 'Fogo no Parquinho', description: '3 dias seguidos de treino', icon: '🔥', requirement: '3 dias' },
  { id: 'workout_streak_7', name: 'Inabalável', description: '7 dias seguidos de treino', icon: '🛡️', requirement: '7 dias' },
  { id: 'speltagram_post', name: 'Influenciador Fit', description: 'Fez sua primeira postagem no SpeltaGram', icon: '📸', requirement: '1 post' },
];

export const gamificationService = {
  async getUserStats(userId: string): Promise<UserStats> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists() && userDoc.data().stats) {
      return userDoc.data().stats;
    }
    
    const initialStats: UserStats = {
      points: 0,
      level: 1,
      badges: [],
      completedWorkouts: 0,
      postsCount: 0,
      streak: 0
    };
    
    await updateDoc(doc(db, 'users', userId), { stats: initialStats });
    return initialStats;
  },

  async addPoints(userId: string, points: number, reason: string) {
    const userRef = doc(db, 'users', userId);
    const stats = await this.getUserStats(userId);
    
    const newPoints = stats.points + points;
    const newLevel = Math.floor(Math.sqrt(newPoints / 100)) + 1;
    
    await updateDoc(userRef, {
      'stats.points': increment(points),
      'stats.level': newLevel
    });

    // Log activity
    await setDoc(doc(collection(db, `users/${userId}/activities`)), {
      type: 'points_earned',
      points,
      reason,
      timestamp: new Date()
    });

    return { newPoints, newLevel };
  },

  async checkAndAwardBadges(userId: string, stats: UserStats) {
    const userRef = doc(db, 'users', userId);
    const awardedBadges: string[] = [];

    if (stats.completedWorkouts >= 1 && !stats.badges.includes('first_workout')) {
      awardedBadges.push('first_workout');
    }
    if (stats.streak >= 3 && !stats.badges.includes('workout_streak_3')) {
      awardedBadges.push('workout_streak_3');
    }
    if (stats.streak >= 7 && !stats.badges.includes('workout_streak_7')) {
      awardedBadges.push('workout_streak_7');
    }
    if (stats.postsCount >= 1 && !stats.badges.includes('speltagram_post')) {
      awardedBadges.push('speltagram_post');
    }

    if (awardedBadges.length > 0) {
      await updateDoc(userRef, {
        'stats.badges': arrayUnion(...awardedBadges)
      });
    }

    return awardedBadges;
  },

  async recordWorkout(userId: string) {
    const userRef = doc(db, 'users', userId);
    const today = new Date().toISOString().split('T')[0];
    const stats = await this.getUserStats(userId);
    
    let newStreak = stats.streak;
    if (stats.lastActivityDate) {
      const lastDate = new Date(stats.lastActivityDate);
      const diff = (new Date(today).getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diff === 1) {
        newStreak += 1;
      } else if (diff > 1) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    await updateDoc(userRef, {
      'stats.completedWorkouts': increment(1),
      'stats.streak': newStreak,
      'stats.lastActivityDate': today
    });

    await this.addPoints(userId, 50, 'Treino concluído');
    const updatedStats = await this.getUserStats(userId);
    return await this.checkAndAwardBadges(userId, updatedStats);
  },

  async recordPost(userId: string) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'stats.postsCount': increment(1)
    });
    await this.addPoints(userId, 20, 'Postagem no SpeltaGram');
    const updatedStats = await this.getUserStats(userId);
    return await this.checkAndAwardBadges(userId, updatedStats);
  }
};
