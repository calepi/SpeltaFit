import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, orderBy, onSnapshot, serverTimestamp, arrayUnion, arrayRemove, deleteField, increment, getCountFromServer } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '../firebase';
import imageCompression from 'browser-image-compression';

export interface LikeDetail {
  name: string;
  photoUrl?: string;
}

export interface SpeltaGramPost {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  imageUrl: string;
  caption?: string;
  tag?: string;
  likes: string[];
  likeDetails?: Record<string, LikeDetail>;
  commentCount?: number;
  createdAt: string;
}

export interface SpeltaGramComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  likes?: string[];
  likeDetails?: Record<string, LikeDetail>;
  parentId?: string;
  createdAt: string;
}

const POSTS_COLLECTION = 'speltagram_posts';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const speltaGramService = {
  // Compress and convert image to Base64
  async uploadImage(file: File, userId: string): Promise<string> {
    const options = {
      maxSizeMB: 0.5, // Max 500KB to ensure Base64 fits in Firestore 1MB limit
      maxWidthOrHeight: 800,
      useWebWorker: false, // More stable in some iframe environments
    };
    
    let fileToUpload = file;
    try {
      // Try to compress, but don't let it hang the whole process
      const compressionPromise = imageCompression(file, options);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Compression timeout')), 8000)
      );
      
      fileToUpload = await Promise.race([compressionPromise, timeoutPromise]) as File;
    } catch (error) {
      console.warn('Image compression failed or timed out:', error);
      if (file.size > 700 * 1024) { // If original is > 700KB, it might exceed 1MB in Base64
        throw new Error('A imagem é muito grande e a compressão falhou. Escolha uma imagem menor (máx 700KB).');
      }
      fileToUpload = file;
    }

    // Convert to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(fileToUpload);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Erro ao processar a imagem.'));
    });
  },

  // Create a new post
  async createPost(data: Omit<SpeltaGramPost, 'id' | 'likes' | 'likeDetails' | 'commentCount' | 'createdAt'>): Promise<string> {
    const path = POSTS_COLLECTION;
    try {
      const docRef = await addDoc(collection(db, path), {
        ...data,
        likes: [],
        likeDetails: {},
        commentCount: 0,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      return ''; // Unreachable
    }
  },

  // Delete a post
  async deletePost(postId: string, imageUrl: string): Promise<void> {
    const path = `${POSTS_COLLECTION}/${postId}`;
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, POSTS_COLLECTION, postId));
      
      // Try to delete image from Storage if it's a Storage URL (not base64)
      if (imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
        try {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        } catch (e) {
          console.warn('Could not delete image from storage', e);
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Toggle Like on Post
  async toggleLike(postId: string, userId: string, userName: string, userPhoto: string | undefined, isLiked: boolean): Promise<void> {
    const path = `${POSTS_COLLECTION}/${postId}`;
    try {
      const postRef = doc(db, POSTS_COLLECTION, postId);
      const updateData: any = {
        likes: isLiked ? arrayRemove(userId) : arrayUnion(userId)
      };
      
      if (isLiked) {
        updateData[`likeDetails.${userId}`] = deleteField();
      } else {
        updateData[`likeDetails.${userId}`] = { name: userName, photoUrl: userPhoto || null };
      }
      
      await updateDoc(postRef, updateData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // Toggle Like on Comment
  async toggleCommentLike(postId: string, commentId: string, userId: string, userName: string, userPhoto: string | undefined, isLiked: boolean): Promise<void> {
    const path = `${POSTS_COLLECTION}/${postId}/comments/${commentId}`;
    try {
      const commentRef = doc(db, `${POSTS_COLLECTION}/${postId}/comments`, commentId);
      const updateData: any = {
        likes: isLiked ? arrayRemove(userId) : arrayUnion(userId)
      };
      
      if (isLiked) {
        updateData[`likeDetails.${userId}`] = deleteField();
      } else {
        updateData[`likeDetails.${userId}`] = { name: userName, photoUrl: userPhoto || null };
      }
      
      await updateDoc(commentRef, updateData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // Add Comment
  async addComment(postId: string, data: Omit<SpeltaGramComment, 'id' | 'postId' | 'likes' | 'likeDetails' | 'createdAt'>): Promise<void> {
    const path = `${POSTS_COLLECTION}/${postId}/comments`;
    try {
      await addDoc(collection(db, path), {
        ...data,
        postId,
        likes: [],
        likeDetails: {},
        createdAt: new Date().toISOString()
      });
      
      // Increment comment count on post
      const postRef = doc(db, POSTS_COLLECTION, postId);
      await updateDoc(postRef, {
        commentCount: increment(1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  // Delete Comment
  async deleteComment(postId: string, commentId: string): Promise<void> {
    const path = `${POSTS_COLLECTION}/${postId}/comments/${commentId}`;
    try {
      await deleteDoc(doc(db, `${POSTS_COLLECTION}/${postId}/comments`, commentId));
      
      // Decrement comment count on post
      const postRef = doc(db, POSTS_COLLECTION, postId);
      await updateDoc(postRef, {
        commentCount: increment(-1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Subscribe to Posts
  subscribeToPosts(callback: (posts: SpeltaGramPost[]) => void, onError?: (error: any) => void) {
    const path = POSTS_COLLECTION;
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const posts: SpeltaGramPost[] = [];
      snapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() } as SpeltaGramPost);
      });
      callback(posts);
    }, (error) => {
      if (onError) {
        onError(error);
      } else {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    });
  },

  // Get Comment Count
  async getCommentCount(postId: string): Promise<number> {
    const path = `${POSTS_COLLECTION}/${postId}/comments`;
    try {
      const coll = collection(db, path);
      const snapshot = await getCountFromServer(coll);
      return snapshot.data().count;
    } catch (error) {
      console.error('Error getting comment count:', error);
      return 0;
    }
  },

  // Subscribe to Comments
  subscribeToComments(postId: string, callback: (comments: SpeltaGramComment[]) => void, onError?: (error: any) => void) {
    const path = `${POSTS_COLLECTION}/${postId}/comments`;
    const q = query(collection(db, path), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const comments: SpeltaGramComment[] = [];
      snapshot.forEach((doc) => {
        comments.push({ id: doc.id, ...doc.data() } as SpeltaGramComment);
      });
      callback(comments);
    }, (error) => {
      if (onError) {
        onError(error);
      } else {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    });
  }
};
