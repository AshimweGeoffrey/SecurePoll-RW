export default function PageHead({ title, sub, children }) {
  return (
    <div className="page-head sp-row-between sp-wrap sp-gap-3" style={{ alignItems: "flex-end" }}>
      <div>
        <h1>{title}</h1>
        {sub && <div className="sub">{sub}</div>}
      </div>
      {children && <div className="sp-row sp-gap-2 sp-wrap">{children}</div>}
    </div>
  );
}
