"use client";
// Shows newly created logins once, with printable login slips. Passwords are never stored in readable form.
export function Credentials({ items, schoolName, groupLabel = "Class" }: { items: { name: string; username: string; password: string; className?: string }[]; schoolName?: string; groupLabel?: string }) {
  if (!items.length) return null;
  const print = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const slips = items
      .map((c) => `<div class="slip"><div class="s">${schoolName ?? ""} · CT &amp; AI</div><div class="n">${c.name}${c.className ? ` · ${groupLabel === "Class" ? "Class " : ""}${c.className}` : ""}</div><div>Website: <b>${location.origin}</b></div><div>Username: <b>${c.username}</b></div><div>Password: <b>${c.password}</b></div></div>`)
      .join("");
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Login slips</title><style>body{font-family:system-ui,sans-serif;margin:16px}.wrap{display:grid;grid-template-columns:1fr 1fr;gap:10px}.slip{border:1.5px dashed #555;border-radius:10px;padding:12px;font-size:14px;line-height:1.6;break-inside:avoid}.s{font-size:11px;color:#555}.n{font-weight:700;font-size:16px}</style></head><body><div class="wrap">${slips}</div><script>window.print()</script></body></html>`);
    w.document.close();
  };
  return (
    <div className="mt-4 rounded-2xl border-2 border-good bg-good-soft p-4" role="status">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-semibold text-good">{items.length} login{items.length > 1 ? "s" : ""} created. Note them now — passwords are shown only once.</div>
        <button type="button" onClick={print} className="rounded-xl bg-good px-3 py-1.5 text-sm font-semibold text-white">🖨 Print login slips</button>
      </div>
      <div className="mt-3 max-h-72 overflow-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-muted"><th className="py-1">Name</th><th>{groupLabel}</th><th>Username</th><th>Temporary password</th></tr></thead>
          <tbody>{items.map((c) => <tr key={c.username} className="border-t border-line"><td className="py-1">{c.name}</td><td>{c.className ?? "—"}</td><td className="font-mono">{c.username}</td><td className="font-mono">{c.password}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
