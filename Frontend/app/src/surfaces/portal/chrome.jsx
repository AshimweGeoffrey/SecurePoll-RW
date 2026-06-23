import { Link } from "react-router-dom";
import { Globe, Lock, Eye, ArrowLeft } from "lucide-react";
import { Button } from "../../components/index.js";
import wordmark from "../../assets/logo-wordmark.svg";

/* Full marketing nav (PublicPortal landing). Mirrors the mock `.pub__nav`. */
export function PortalNav() {
  return (
    <nav className="pub__nav">
      <Link to="/portal"><img src={wordmark} alt="SecurePoll RW" /></Link>
      <div className="links">
        <Link to="/portal/status">Check status</Link>
        <Link to="/portal/incident">Report an incident</Link>
      </div>
      <div className="end">
        <span className="lang"><Globe size={15} /> EN / KIN / FR</span>
        <Link to="/login" style={{ textDecoration: "none" }}>
          <Button size="sm" variant="ghost" iconLeft={<Lock size={15} />}>Admin login</Button>
        </Link>
        <Link to="/portal/observer-login" style={{ textDecoration: "none" }}>
          <Button size="sm" variant="secondary" iconLeft={<Eye size={15} />}>Observer login</Button>
        </Link>
      </div>
    </nav>
  );
}

/* Slim sub-nav (Check status / Report incident). Mirrors the mock `.snav`. */
export function SubNav() {
  return (
    <nav className="snav">
      <Link to="/portal"><img src={wordmark} alt="SecurePoll RW" /></Link>
      <Link className="back" to="/portal"><ArrowLeft size={16} /> Back to portal</Link>
      <div className="end">
        <span className="lang"><Globe size={15} /> EN / KIN / FR</span>
        <Link to="/portal/observer-login" className="plain">
          <Button size="sm" variant="secondary" iconLeft={<Eye size={15} />}>Observer login</Button>
        </Link>
      </div>
    </nav>
  );
}
