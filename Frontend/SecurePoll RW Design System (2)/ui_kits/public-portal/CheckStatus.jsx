// CheckStatus.jsx — citizen registration & voting-status lookup
const { useState: useS, useEffect: useE } = React;
const C = window.SecurePollRWDesignSystem_92875f;
const Ic = ({ n, s }) => <i data-lucide={n} style={s}></i>;
function lc() { setTimeout(() => window.lucide && window.lucide.createIcons(), 20); }

function CheckStatus() {
  const [done, setDone] = useS(false);
  useE(lc, [done]);
  return (
    <div className="page">
      <nav className="snav">
        <img src="../../assets/logo-wordmark.svg" alt="SecurePoll RW" />
        <a className="back" href="index.html"><Ic n="arrow-left" /> Back to portal</a>
        <div className="end">
          <span className="lang"><Ic n="globe" /> EN / KIN / FR</span>
          <a className="plain" href="observer-login.html"><C.Button size="sm" variant="secondary" iconLeft={<Ic n="eye" />}>Observer login</C.Button></a>
        </div>
      </nav>

      <header className="phead">
        <span className="eyebrow"><Ic n="id-card" s={{ width: 14, height: 14 }} /> Voter services</span>
        <h1>Check your registration status</h1>
        <p>Enter your National ID to confirm you are registered, find your assigned polling station, and see whether your vote has been recorded.</p>
      </header>

      <main className="pbody">
        <div className="narrow">
          <div className="assure blue">
            <Ic n="lock" />
            <div>
              <div className="at">This lookup is private</div>
              <div className="as">We never display your name, biometric data, or how you voted — only your registration and turnout status. Sessions are not logged against your identity.</div>
            </div>
          </div>

          <div className="lk-card">
            <div className="f"><C.Input label="National ID" mono iconLeft={<Ic n="id-card" />} placeholder="1 1994 7 0098765 4 32" defaultValue="1 1994 7 0098765 4 32" hint="16 digits, as printed on your card" /></div>
            <C.Button variant="primary" size="lg" iconLeft={<Ic n="search" />} onClick={() => setDone(true)}>Check</C.Button>
          </div>

          {done && (
            <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 18 }}>
              <C.Card accent="green" elevation="raised"
                title="You're registered to vote"
                subtitle="National ID ending · 4 32"
                headerEnd={<C.Badge tone="green" dot>REGISTERED</C.Badge>}>
                <div className="detail-grid">
                  <div className="detail-row"><span className="k">Polling station</span><span className="v">PS-014 · Nyarugenge</span></div>
                  <div className="detail-row"><span className="k">Constituency</span><span className="v">Nyarugenge</span></div>
                  <div className="detail-row"><span className="k">District</span><span className="v">Nyarugenge</span></div>
                  <div className="detail-row"><span className="k">Station hours</span><span className="v">06:00 – 18:00</span></div>
                  <div className="detail-row"><span className="k">Roll position</span><span className="v mono">00482</span></div>
                  <div className="detail-row"><span className="k">Last verified</span><span className="v">07 Jun 2026</span></div>
                </div>
              </C.Card>

              <C.Card title="Voting status" subtitle="Live for today's election" headerEnd={<C.Badge tone="amber" dot>NOT YET VOTED</C.Badge>}>
                <div className="tl">
                  <div className="tl-step done"><div className="tl-dot"><Ic n="check" /></div><div className="tl-bd"><div className="tt">Registration confirmed</div><div className="ts">On the certified voter roll for Nyarugenge</div></div></div>
                  <div className="tl-step done"><div className="tl-dot"><Ic n="check" /></div><div className="tl-bd"><div className="tt">Station assigned</div><div className="ts">PS-014 · Nyarugenge — currently open</div></div></div>
                  <div className="tl-step current"><div className="tl-dot"><Ic n="user-round" /></div><div className="tl-bd"><div className="tt">Awaiting your vote</div><div className="ts">Bring your National ID. Average wait right now: ~12 min</div></div></div>
                  <div className="tl-step"><div className="tl-dot"><Ic n="flag" /></div><div className="tl-bd"><div className="tt">Vote recorded</div><div className="ts">A receipt code will appear here once you've cast your ballot</div></div></div>
                </div>
              </C.Card>

              <div style={{ display: "flex", gap: 12 }}>
                <a className="plain" href="report-incident.html" style={{ flex: 1 }}><C.Button variant="secondary" fullWidth iconLeft={<Ic n="megaphone" />}>Report a problem at this station</C.Button></a>
                <C.Button variant="ghost" iconLeft={<Ic n="rotate-ccw" />} onClick={() => setDone(false)}>Check another ID</C.Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
window.CheckStatus = CheckStatus;
