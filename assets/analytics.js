/* ============================================================
   GOOGLE ANALYTICS — The Coolidge Group guides
   ------------------------------------------------------------
   PASTE YOUR MEASUREMENT ID ON THE NEXT LINE (looks like G-XXXXXXXXXX).
   Find it in Google Analytics: Admin -> Data streams -> your web
   stream -> "Measurement ID" (top right). That is the only edit
   needed. Until you add it, the site works fine with no tracking.
   ============================================================ */
window.GA_MEASUREMENT_ID = "G-XXXXXXXXXX";

(function () {
  var id = window.GA_MEASUREMENT_ID;
  if (!id || id.indexOf("X") !== -1) { window.__gaReady = false; return; }
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + id;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  gtag("js", new Date());
  gtag("config", id);
  window.__gaReady = true;
})();

/* Custom event helper used by the flipbook + landing page.
   Events you'll see in GA4 (Reports -> Realtime / Events):
     guide_open        - someone opened a guide
     page_view_flip    - turned to a page  (params: guide, page, total)
     guide_complete    - reached the last page
     cta_click         - clicked Book / Download / Share  (param: label)
     guide_select      - chose a guide on the landing page (param: guide) */
window.track = function (name, params) {
  try { if (window.gtag) gtag("event", name, params || {}); } catch (e) {}
};
