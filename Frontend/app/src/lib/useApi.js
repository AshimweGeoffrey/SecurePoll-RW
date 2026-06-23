import { useCallback, useEffect, useRef, useState } from "react";

/* Generic data-fetching hook around an async endpoint fn.
   Returns { data, error, loading, reload }. Re-runs when `deps` change. */
export function useApi(fn, deps = [], { skip = false } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const reqId = useRef(0);

  const reload = useCallback(async () => {
    const id = ++reqId.current;
    setLoading(true);
    setError(null);
    try {
      const res = await fnRef.current();
      if (id === reqId.current) setData(res);
      return res;
    } catch (e) {
      if (id === reqId.current) setError(e);
      throw e;
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (skip) {
      setLoading(false);
      return;
    }
    reload().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error, loading, reload, setData };
}

/* Poll an endpoint on an interval (e.g. live turnout ~30s). */
export function usePoll(fn, intervalMs, deps = [], opts = {}) {
  const state = useApi(fn, deps, opts);
  useEffect(() => {
    if (!intervalMs || opts.skip) return;
    const t = setInterval(() => state.reload().catch(() => {}), intervalMs);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, ...deps]);
  return state;
}
