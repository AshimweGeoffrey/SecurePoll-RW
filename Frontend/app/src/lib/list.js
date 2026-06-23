/* Backend list endpoints use several envelope shapes:
   - {total,page,size,items}  (voters)
   - {total,items}            (fraud, duplicates, anomalies, verifications, audit, keys)
   - {total,skip,limit,items} (officers, districts, stations)
   - bare array               (roles, users, sessions)
   These helpers normalize all of them. */

export function listItems(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.items)) return res.items;
  return [];
}

export function listTotal(res, fallback) {
  if (!res) return 0;
  if (Array.isArray(res)) return res.length;
  if (typeof res.total === "number") return res.total;
  if (Array.isArray(res.items)) return res.items.length;
  return fallback ?? 0;
}
