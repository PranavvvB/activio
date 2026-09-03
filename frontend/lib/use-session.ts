"use client";

import { useEffect, useState } from "react";
import { AUTH_CHANGE_EVENT } from "./auth-storage";
import { getSessionState, type SessionState } from "./session";

export function useSession() {
  const [state, setState] = useState<SessionState | null>(null);

  useEffect(() => {
    let active = true;

    const refresh = () =>
      getSessionState().then((next) => {
        if (active) setState(next);
      });

    refresh();
    window.addEventListener(AUTH_CHANGE_EVENT, refresh);
    return () => {
      active = false;
      window.removeEventListener(AUTH_CHANGE_EVENT, refresh);
    };
  }, []);

  return state;
}
