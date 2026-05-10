import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";

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

export async function submitScore(data: {
  callsign: string;
  score: number;
  accuracy: number;
  difficulty: string;
  createdAt: number;
}): Promise<void> {
  const { getDatabase, ref, push } = await import("firebase/database");
  const db = getDatabase();
  await push(ref(db, "leaderboard"), data);
}

export async function getLeaderboard(): Promise<Array<{
  id: string;
  callsign: string;
  score: number;
  accuracy: number;
  difficulty: string;
  createdAt: number;
}>> {
  const { getDatabase, ref, get, query, orderByChild, limitToLast } = await import("firebase/database");
  const db = getDatabase();
  const snapshot = await get(
    query(ref(db, "leaderboard"), orderByChild("score"), limitToLast(20))
  );
  if (!snapshot.exists()) return [];
  const entries: Array<{ id: string; callsign: string; score: number; accuracy: number; difficulty: string; createdAt: number }> = [];
  snapshot.forEach((child: import("firebase/database").DataSnapshot) => {
    const val = child.val() as LeaderboardEntry;
    entries.push({ id: child.key as string, ...val });
  });
  return entries.reverse();
}
