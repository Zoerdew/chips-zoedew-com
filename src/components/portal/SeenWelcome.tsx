"use client";

import { useEffect } from "react";

// Renders nothing. On mount it sets a cookie marking that the user has seen
// the how-it-works page, so the portal home stops auto-redirecting them here.
export function SeenWelcome() {
  useEffect(() => {
    // 1-year cookie. Per-browser, which is fine for "have you seen the intro".
    document.cookie = "chips_seen_welcome=1; path=/; max-age=31536000; samesite=lax";
  }, []);
  return null;
}
