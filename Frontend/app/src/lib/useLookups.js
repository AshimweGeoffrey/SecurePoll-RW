import { useEffect, useState } from "react";
import { districts as districtsApi, stations as stationsApi, officers as officersApi } from "../api/endpoints.js";
import { listItems } from "./list.js";

/* Cached reference data shared across admin pages. Fetched once per mount;
   results are small (≈49 districts, ≈108 stations, ≈41 officers). */
let cache = null;

export function useLookups() {
  const [data, setData] = useState(cache || { districts: [], stations: [], officers: [], byDistrict: {}, byStation: {}, byOfficer: {} });
  const [ready, setReady] = useState(!!cache);

  useEffect(() => {
    if (cache) return;
    let alive = true;
    (async () => {
      try {
        const [d, s, o] = await Promise.all([
          districtsApi.list({ limit: 200 }),
          stationsApi.list({ limit: 300 }),
          officersApi.list({ limit: 200 }),
        ]);
        const districts = listItems(d), stations = listItems(s), officers = listItems(o);
        const byDistrict = Object.fromEntries(districts.map((x) => [x.id, x]));
        const byStation = Object.fromEntries(stations.map((x) => [x.id, x]));
        const byOfficer = Object.fromEntries(officers.map((x) => [x.id, x]));
        cache = { districts, stations, officers, byDistrict, byStation, byOfficer };
        if (alive) { setData(cache); setReady(true); }
      } catch {
        if (alive) setReady(true);
      }
    })();
    return () => { alive = false; };
  }, []);

  return { ...data, ready };
}

export function invalidateLookups() { cache = null; }
