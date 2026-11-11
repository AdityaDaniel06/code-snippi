"use client";

import { logout } from "@/actions/auth";

const CHANNEL = "snippi-auth";
const STORAGE_KEY = "snippi-auth-event";

/** Tell every other open tab that this browser signed out. */
function broadcastLogout() {
  try {
    const bc = new BroadcastChannel(CHANNEL);
    bc.postMessage("logout");
    bc.close();
  } catch {
    /* BroadcastChannel unavailable */
  }
  try {
    // Fallback for browsers without BroadcastChannel: the storage event
    // fires in other tabs of the same origin.
    localStorage.setItem(STORAGE_KEY, `logout:${Date.now()}`);
  } catch {
    /* storage unavailable */
  }
}

/**
 * Sign out, then load /login as a brand-new document with location.replace.
 * A full load drops the client router cache, and replace removes the signed-in
 * page from history, so Back cannot bring private data back.
 */
export async function signOut() {
  try {
    await logout();
  } finally {
    broadcastLogout();
    window.location.replace("/login");
  }
}

/** Subscribe to sign-outs from other tabs. Returns an unsubscribe function. */
export function onSignOutElsewhere(handler: () => void) {
  let bc: BroadcastChannel | null = null;
  try {
    bc = new BroadcastChannel(CHANNEL);
    bc.onmessage = (e) => {
      if (e.data === "logout") handler();
    };
  } catch {
    /* BroadcastChannel unavailable */
  }
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue?.startsWith("logout:")) handler();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    bc?.close();
    window.removeEventListener("storage", onStorage);
  };
}
