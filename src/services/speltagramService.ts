import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, orderBy, onSnapshot, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';
import imageCompression from 'browser-image-compression';

export interface SpeltaGramPost {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  imageUrl: string;
  caption?: string;
  tag?: string;
  likes: string[];
  createdAt: string;
}

export interface SpeltaGramComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  createdAt: string;
}

const POSTS_COLLECTION = 'speltagram_posts';

export const speltaGramService = {
  // Compress and upload image
  async uploadImage(file: File, userId: string): Promise<string> {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1080,
      useWebWorker: true,
    };
    
    try {
      const compressedFile = await imageCompression(file, options);
      const filename = `${userId}_${Date.now()}_${compressedFile.name}`;
      const storageRef = ref(storage, `speltagram/${filename}`);
      
      await uploadBytes(storageRef, compressedFile);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Falha ao fazer upload da imagem.');
    }
  },

  // Create a new post
  async createPost(data: Omit<SpeltaGramPost, 'id' | 'likes' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, POSTS_COLLECTION), {
        ...data,
        likes: [],
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating post:', error);
      throw new Error('Falha ao criar postagem.');
    }
  },

  // Delete a post
  async deletePost(postId: string, imageUrl: string): Promise<void> {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, POSTS_COLLECTION, postId));
      
      // Try to delete image from Storage (ignore if fails)
      try {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      } catch (e) {
        console.warn('Could not delete image from storage', e);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      throw new Error('Falha ao deletar postagem.');
    }
  },

  // Toggle Like
  async toggleLike(postId: string, userId: string, isLiked: boolean): Promise<void> {
    try {
      const postRef = doc(db, POSTS_COLLECTION, postId);
      await updateDoc(postRef, {
        likes: isLiked ? arrayRemove(userId) : arrayUnion(userId)
      });
    } catch (error) {
      console.error('Error toggling like:', error);
      throw new Error('Falha ao curtir/descurtir.');
    }
  },

  // Add Comment
  async addComment(postId: string, data: Omit<SpeltaGramComment, 'id' | 'postId' | 'createdAt'>): Promise<void> {
    try {
      await addDoc(collection(db, `${POSTS_COLLECTION}/${postId}/comments`), {
        ...data,
        postId,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new Error('Falha ao adicionar comentário.');
    }
  },

  // Delete Comment
  async deleteComment(postId: string, commentId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, `${POSTS_COLLECTION}/${postId}/comments`, commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw new Error('Falha ao deletar comentário.');
    }
  },

  // Subscribe to Posts
  subscribeToPosts(callback: (posts: SpeltaGramPost[]) => void) {
    const q = query(collection(db, POSTS_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const posts: SpeltaGramPost[] = [];
      snapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() } as SpeltaGramPost);
      });
      callback(posts);
    }, (error) => {
      console.error('Error listening to posts:', error);
    });
  },

  // Subscribe to Comments
  subscribeToComments(postId: string, callback: (comments: SpeltaGramComment[]) => void) {
    const q = query(collection(db, `${POSTS_COLLECTION}/${postId}/comments`), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const comments: SpeltaGramComment[] = [];
      snapshot.forEach((doc) => {
        comments.push({ id: doc.id, ...doc.data() } as SpeltaGramComment);
      });
      callback(comments);
    }, (error) => {
      console.error('Error listening to comments:', error);
    });
  }
};
