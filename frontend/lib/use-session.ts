"use client";

import { useEffect, useState } from "react";
import { getSessionState, type SessionState } from "./session";

export function useSession() {
  const [state, setState] = useState<SessionState | null>(null);

  useEffect(() => {
    let active = true;
    getSessionState().then((next) => {
      if (active) setState(next);
    });
    return () => {
      active = false;
    };
  }, []);

  return state;
}
