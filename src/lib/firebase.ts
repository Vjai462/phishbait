import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, push, query, orderByChild, limitToLast, DataSnapshot, get } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

function getFirebaseApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }
  return initializeApp(firebaseConfig);
}

export const db = getDatabase(getFirebaseApp());

export type LeaderboardEntry = {
  callsign: string;
  score: number;
  accuracy: number;
  difficulty: "easy" | "medium" | "hard";
  createdAt: number;
};

export async function submitScore(entry: LeaderboardEntry) {
  const sanitizedCallsign = entry.callsign.replace(/[^a-zA-Z0-9\-_]/g, '').slice(0, 20);
  
  if (!sanitizedCallsign) return;

  const score = Math.max(0, Math.min(30000, entry.score));
  const accuracy = Math.max(0, Math.min(100, entry.accuracy));

  const validatedData: LeaderboardEntry = {
    callsign: sanitizedCallsign,
    score,
    accuracy,
    difficulty: entry.difficulty,
    createdAt: entry.createdAt,
  };

  await push(ref(db, "leaderboard"), validatedData);
}

export async function getTopScores(limit = 10) {
  const q = query(ref(db, "leaderboard"), orderByChild("score"), limitToLast(limit));
  const snapshot = await get(q);
  
  const results: (LeaderboardEntry & { id: string })[] = [];
  
  if (snapshot.exists()) {
    snapshot.forEach((child: DataSnapshot) => {
      results.push({
        id: child.key as string,
        ...(child.val() as LeaderboardEntry)
      });
    });
  }
  
  // Sort descending by score
  results.sort((a, b) => b.score - a.score);
  return results;
}
