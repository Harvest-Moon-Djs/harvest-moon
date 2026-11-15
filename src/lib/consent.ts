"use client";

import { useSyncExternalStore } from "react";

// Spotify consent, kept in localStorage. Given by clicking "Escuchar" on any player; withdrawn from the cookie policy page.
const KEY = "hm-spotify";
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
const notify = () => listeners.forEach((l) => l());
const set = (on: boolean) => {
  if (on) localStorage.setItem(KEY, "1");
  else { localStorage.removeItem(KEY); warm = false; }
  notify();
};

// "Warm" = players may preload behind their covers. True on load for visitors who already consented;
// otherwise flipped by the first player that finishes loading after the consent click, so that one loads alone first.
let warm = typeof window !== "undefined" && localStorage.getItem(KEY) === "1";
export const warmSpotify = () => { if (!warm) { warm = true; notify(); } };
export const useSpotifyWarm = () => useSyncExternalStore(subscribe, () => warm, () => false);

export const acceptSpotify = () => set(true);
export const revokeSpotify = () => set(false);

export const useSpotifyAccepted = () =>
  useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(KEY) === "1",
    () => false,
  );
