"use client";

import { useState } from "react";
import Image from "next/image";
import { PlayIcon, SpotifyLogo } from "@phosphor-icons/react/dist/ssr";
import { acceptSpotify, useSpotifyAccepted, useSpotifyWarm, warmSpotify } from "@/lib/consent";

// Spotify sets third-party cookies, so a same-size card stands in until the visitor clicks "Escuchar".
// That click is the consent, shared by every player on the site.
// Once consented, every player preloads its iframe behind the cover so "Escuchar" opens instantly;
// on the consent click itself, the clicked player loads first and the rest follow (see warmSpotify).
// Embed from any playlist URL the editor pastes (share links include ?si=..., that's fine).
export function SpotifyPlaylist({ url, title, cover, eager }: { url: string; title: string; cover?: string; eager?: boolean }) {
  const accepted = useSpotifyAccepted();
  const warm = useSpotifyWarm();
  // Each cover opens only on its own click and comes back on the next visit; consent itself persists.
  const [open, setOpen] = useState(false);
  const id = url.match(/playlist\/([A-Za-z0-9]+)/)?.[1];
  if (!id) return null;

  const showCover = !open || !accepted;

  return (
    <div className="reveal relative h-[352px] w-full overflow-hidden rounded-xl">
      {accepted && (open || warm) && (
        <iframe
          title={`Playlist ${title} en Spotify`}
          src={`https://open.spotify.com/embed/playlist/${id}?theme=0`}
          height={352}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          className="w-full"
          onLoad={warmSpotify}
          inert={showCover}
        />
      )}
      {showCover && (
        <div className="absolute inset-0 flex flex-col items-start justify-between overflow-hidden rounded-xl border border-line bg-night-2 p-6">
          {cover && (
            <>
              <Image src={cover} alt="" fill loading={eager ? "eager" : "lazy"} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
              {/* Darkens top and bottom so the title and button stay readable on any photo. */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-black/80" />
            </>
          )}
          <div className="relative">
            <SpotifyLogo size={36} className={cover ? "text-white/80" : "text-muted"} />
            <p className="mt-5 text-2xl font-black tracking-tight">{title}</p>
          </div>
          <div className="relative">
            <button onClick={() => { acceptSpotify(); setOpen(true); }} className="btn btn-accent h-10 gap-2 px-4 text-sm">
              <PlayIcon size={16} weight="fill" /> Escuchar
            </button>
            {!accepted && (
              <p className={`mt-3 max-w-[34ch] text-xs leading-relaxed ${cover ? "text-white/75" : "text-muted"}`}>Al darle a escuchar aceptas las cookies de Spotify en todo el sitio.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
