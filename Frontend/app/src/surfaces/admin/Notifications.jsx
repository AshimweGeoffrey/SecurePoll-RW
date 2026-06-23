import { useState } from "react";
import {
  Bell, LogIn, LogOut, KeyRound, UserX, UserPlus, Download, Ban, Flag, GitMerge, Archive,
  ShieldAlert, Activity, Check, ShieldCheck, SlidersHorizontal, BadgeCheck, CheckCheck,
  Fingerprint, RadioTower, X, Inbox,
} from "lucide-react";
import { notifications as notifApi } from "../../api/endpoints.js";
import { usePoll } from "../../lib/useApi.js";
import { useToast } from "../../lib/toast.jsx";
import { listItems } from "../../lib/list.js";
import { fmtRelative } from "../../lib/format.js";
import { Modal } from "../../components/index.js";

const ICONS = {
  "log-in": LogIn, "log-out": LogOut, "key-round": KeyRound, "user-x": UserX, "user-plus": UserPlus,
  download: Download, ban: Ban, flag: Flag, "git-merge": GitMerge, archive: Archive,
  "shield-alert": ShieldAlert, activity: Activity, check: Check, "shield-check": ShieldCheck,
  "sliders-horizontal": SlidersHorizontal, "badge-check": BadgeCheck, "check-check": CheckCheck,
  fingerprint: Fingerprint, "radio-tower": RadioTower, bell: Bell,
};
const TINT = {
  red: { bg: "var(--status-rejected-soft)", fg: "var(--status-rejected-text)" },
  amber: { bg: "var(--status-review-soft)", fg: "var(--status-review-text)" },
  blue: { bg: "var(--status-info-soft)", fg: "var(--status-info-text)" },
  green: { bg: "var(--status-approved-soft)", fg: "var(--status-approved-text)" },
};

function NotifRow({ n, onRead }) {
  const Ic = ICONS[n.icon] || Bell;
  const tint = TINT[n.tone] || TINT.blue;
  return (
    <button className={"notif" + (n.read ? "" : " unread")} onClick={() => !n.read && onRead(n.id)}>
      {!n.read && <span className="notif__dot" />}
      <span className="notif__ic" style={{ background: tint.bg, color: tint.fg }}><Ic size={17} /></span>
      <div className="notif__tx">
        <div className="notif__hh"><span className="notif__title">{n.title}</span><span className="notif__time">{fmtRelative(n.created_at)}</span></div>
        <div className="notif__desc">{n.description}</div>
      </div>
    </button>
  );
}

export function NotifBell({ onOpenSettings }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(false);
  const { data, reload } = usePoll(() => notifApi.list({ limit: 25 }), 30000, []);
  const items = listItems(data);
  const unread = data?.unread ?? items.filter((n) => !n.read).length;

  const markRead = async (id) => { try { await notifApi.markRead(id); reload(); } catch (e) { /* noop */ } };
  const markAll = async () => { try { await notifApi.markAllRead(); reload(); toast.success("All caught up"); } catch (e) { toast.error(e); } };

  return (
    <div className="bell-wrap">
      <button className={"icon-btn" + (open ? " on" : "")} aria-label="Notifications" onClick={() => setOpen((o) => !o)}>
        <Bell size={18} />
        {unread > 0 && <span className="badge-dot">{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && (
        <>
          <div className="pop-overlay" onClick={() => setOpen(false)} />
          <div className="npop">
            <div className="npop__h">
              <div className="npop__t">Notifications {unread > 0 && <span className="npop__count">{unread} new</span>}</div>
              <button className="npop__act" onClick={markAll} disabled={unread === 0}>Mark all read</button>
            </div>
            <div className="notif-list">
              {items.length === 0 && <div className="notif__empty"><Inbox size={26} /><div style={{ marginTop: 8 }}>You're all caught up.</div></div>}
              {items.slice(0, 8).map((n) => <NotifRow key={n.id} n={n} onRead={markRead} />)}
            </div>
            <div className="npop__f">
              <button className="npop__link" onClick={() => { setOpen(false); setModal(true); }}>View all notifications</button>
            </div>
          </div>
        </>
      )}
      {modal && <NotificationsModal items={items} unread={unread} onRead={markRead} onMarkAll={markAll}
        onClose={() => setModal(false)} onPrefs={() => { setModal(false); onOpenSettings?.("notifications"); }} />}
    </div>
  );
}

function NotificationsModal({ items, unread, onRead, onMarkAll, onClose, onPrefs }) {
  const [filter, setFilter] = useState("all");
  const shown = items.filter((n) => filter === "all" || (filter === "unread" && !n.read) || (filter === "critical" && n.tone === "red"));
  const counts = { all: items.length, unread, critical: items.filter((n) => n.tone === "red").length };
  return (
    <Modal open onClose={onClose} title="Notifications" subtitle={`${unread} unread · ${items.length} total`}
      footer={<button className="npop__link" style={{ width: "auto" }} onClick={onPrefs}><SlidersHorizontal size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />Notification preferences</button>}>
      <div className="sp-row-between sp-wrap" style={{ marginBottom: 14, gap: 10 }}>
        <div className="nfilters">
          {[["all", "All"], ["unread", "Unread"], ["critical", "Critical"]].map(([id, lbl]) => (
            <button key={id} className={"nfilter" + (filter === id ? " on" : "")} onClick={() => setFilter(id)}>{lbl}<span className="nfilter__c">{counts[id]}</span></button>
          ))}
        </div>
        <button className="npop__act" onClick={onMarkAll} disabled={unread === 0}>Mark all read</button>
      </div>
      <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
        {shown.length === 0 ? <div className="notif__empty"><Inbox size={26} /><div style={{ marginTop: 8 }}>Nothing here — you're all caught up.</div></div>
          : shown.map((n) => <NotifRow key={n.id} n={n} onRead={onRead} />)}
      </div>
    </Modal>
  );
}
