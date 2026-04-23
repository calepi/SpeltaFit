import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // Fixed import path

export interface StravaTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete?: {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
  };
}

export const connectStrava = async (userId: string): Promise<StravaTokens> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Pass the current window origin so the backend correctly constructs the callback URL
      const currentOrigin = window.location.origin;
      const response = await fetch(`/api/auth/strava/url?origin=${encodeURIComponent(currentOrigin)}`);
      const { url } = await response.json();

      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const authWindow = window.open(
        url,
        "strava_oauth",
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!authWindow) {
        reject(new Error("Abertura de popup bloqueada pelo navegador."));
        return;
      }

      const handleMessage = async (event: MessageEvent) => {
        // Simple origin check for development
        if (!event.origin.includes('.run.app') && !event.origin.includes('localhost')) return;

        if (event.data?.type === "STRAVA_AUTH_SUCCESS") {
          const tokens: StravaTokens = event.data.payload;
          
          // Store in Firestore
          const userRef = doc(db, "users", userId);
          await updateDoc(userRef, {
            strava: tokens,
          });

          window.removeEventListener("message", handleMessage);
          resolve(tokens);
        }
      };

      window.addEventListener("message", handleMessage);
    } catch (error) {
      reject(error);
    }
  });
};

export const getStravaActivities = async (userId: string) => {
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);
  const strava = userDoc.data()?.strava as StravaTokens;

  if (!strava) return null;

  // Check if token expired
  const now = Math.floor(Date.now() / 1000);
  if (now >= strava.expires_at) {
    // We would need a refresh token flow here, but for simplicity we'll proxy it
    // In a real app, the server would handle refresh automatically
  }

  try {
    const response = await fetch("/api/strava/activities", {
      headers: {
        Authorization: `Bearer ${strava.access_token}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching Strava activities:", error);
    return null;
  }
};
