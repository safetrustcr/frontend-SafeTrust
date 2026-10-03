"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  listWalletsWithReadiness,
  type WalletWithReadiness,
} from "@/lib/stellar/wallet-status";

export function useWalletOptions(enabled: boolean) {
  const [options, setOptions] = useState<WalletWithReadiness[]>([]);
  const [loading, setLoading] = useState(false);

  const seq = useRef(0);
  const refresh = useCallback(async () => {
    const id = ++seq.current;
    setLoading(true);
    try {
      const result = await listWalletsWithReadiness();
      if (id === seq.current) setOptions(result);
    } finally {
      if (id === seq.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    refresh();

    const onFocus = () => refresh(); // user installed/unlocked in another tab
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [enabled, refresh]);

  return { options, loading, refresh };
}
