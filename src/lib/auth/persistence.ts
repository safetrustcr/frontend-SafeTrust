import {
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const KEY = "safetrust.remember";

export async function applyRememberMe(remember: boolean): Promise<void> {
  if (auth) {
    await setPersistence(
      auth,
      remember ? browserLocalPersistence : browserSessionPersistence,
    );
  }
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(KEY, remember ? "1" : "0");
    }
  } catch {
    /* storage unavailable */
  }
}

export function getRememberMe(): boolean {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return true;
    }
    return localStorage.getItem(KEY) !== "0";
  } catch {
    return true;
  }
}
