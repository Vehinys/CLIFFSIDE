"use client";

import { useEffect } from "react";
import { pingOnlineStatus } from "@/app/actions/presence";

export function OnlineTracker() {
  useEffect(() => {
    // Ping immédiatement à la connexion/chargement
    pingOnlineStatus();

    // Puis toutes les 2 minutes
    const interval = setInterval(() => {
      pingOnlineStatus();
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
