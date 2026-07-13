/* The Coolidge Group — self-contained page-flip engine with zoom (no dependencies) */
(function () {
  var cfg = window.FLIPBOOK;
  if (!cfg) return;
  var total = cfg.pages, dir = cfg.dir || "pages", ext = cfg.ext || "jpg", pad = cfg.pad || 2;
  var cur = 0, busy = false;

  var stage = document.getElementById("stage");
  var base = document.getElementById("base");
  var label = document.getElementById("pagelabel");
  var prevBtn = document.getElementById("prev");
  var nextBtn = document.getElementById("next");

  if (window.matchMedia && window.matchMedia("(max-width:640px)").matches) stage.classList.add("mobile");

  function src(i) { var s = "" + (i + 1); while (s.length < pad) s = "0" + s; return dir + "/page-" + s + "." + ext; }
  function preload(i) { if (i >= 0 && i < total) { var im = new Image(); im.src = src(i); } }

  function render() {
    base.src = src(cur);
    label.textContent = (cur + 1) + " / " + total;
    prevBtn.disabled = cur === 0;
    nextBtn.disabled = cur === total - 1;
    preload(cur + 1); preload(cur - 1);
  }

  function go(target, d) {
    if (busy || target < 0 || target >= total || target === cur) return;
    busy = true;
    var leaf = document.createElement("div");
    leaf.className = "leaf " + (d > 0 ? "fwd" : "bwd");
    var img = document.createElement("img");
    if (d > 0) { img.src = src(cur); base.src = src(target); }
    else { img.src = src(target); base.src = src(cur); }
    leaf.appendChild(img);
    stage.appendChild(leaf);
    void leaf.offsetWidth;
    leaf.classList.add("turn");
    var finished = false;
    function done() {
      if (finished) return; finished = true;
      if (leaf.parentNode) stage.removeChild(leaf);
      cur = target; busy = false; render(); after();
    }
    leaf.addEventListener("transitionend", done);
    setTimeout(done, 850);
  }
  function after() {
    if (window.track) window.track("page_view_flip", { guide: cfg.name, page: cur + 1, total: total });
    if (cur === total - 1 && window.track) window.track("guide_complete", { guide: cfg.name });
  }
  window.__next = function () { go(cur + 1, 1); };
  window.__prev = function () { go(cur - 1, -1); };
  nextBtn.addEventListener("click", function (e) { e.stopPropagation(); window.__next(); });
  prevBtn.addEventListener("click", function (e) { e.stopPropagation(); window.__prev(); });

  /* clickable edge arrows */
  var el = stage.querySelector(".edge.l"), er = stage.querySelector(".edge.r");
  if (el) el.addEventListener("click", function (e) { e.stopPropagation(); window.__prev(); });
  if (er) er.addEventListener("click", function (e) { e.stopPropagation(); window.__next(); });

  /* zoom button on the page */
  var zbtn = document.createElement("button");
  zbtn.className = "zoombtn"; zbtn.setAttribute("aria-label", "Zoom in to read");
  zbtn.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/></svg>';
  zbtn.addEventListener("click", function (e) { e.stopPropagation(); openZoom(); });
  stage.appendChild(zbtn);

  /* ---- keyboard ---- */
  document.addEventListener("keydown", function (e) {
    if (zv.classList.contains("show")) { if (e.key === "Escape") closeZoom(); return; }
    if (e.key === "ArrowRight") window.__next();
    else if (e.key === "ArrowLeft") window.__prev();
  });

  /* ---- tap page to zoom (suppress after a swipe) ---- */
  var suppressClick = false;
  stage.addEventListener("click", function (e) {
    if (e.target.closest(".edge") || e.target.closest(".zoombtn")) return;
    if (suppressClick) { suppressClick = false; return; }
    openZoom();
  });

  /* ---- swipe to navigate ---- */
  var sx = null, sy = null, moved = false;
  stage.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; moved = false; }, { passive: true });
  stage.addEventListener("touchmove", function (e) {
    if (sx === null) return;
    if (Math.abs(e.touches[0].clientX - sx) > 10 || Math.abs(e.touches[0].clientY - sy) > 10) moved = true;
  }, { passive: true });
  stage.addEventListener("touchend", function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 40) { suppressClick = true; if (dx < 0) window.__next(); else window.__prev(); }
    else if (!moved) { suppressClick = true; openZoom(); }
    sx = null;
  }, { passive: true });

  /* ================= ZOOM VIEWER ================= */
  var zv = document.createElement("div");
  zv.className = "zoomview";
  zv.innerHTML =
    '<button class="zclose" aria-label="Close">&times;</button>' +
    '<div class="zhint">Pinch or scroll to zoom &middot; drag to move</div>' +
    '<div class="zc"><img class="zimg" alt="Guide page (zoomed)"></div>' +
    '<div class="zctrl"><button data-z="out" aria-label="Zoom out">&minus;</button>' +
    '<button data-z="in" aria-label="Zoom in">+</button></div>';
  document.body.appendChild(zv);
  var zc = zv.querySelector(".zc"), zimg = zv.querySelector(".zimg");
  var scale = 1, tx = 0, ty = 0;
  function apply() { zimg.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + scale + ")"; }
  function setScale(s) { scale = Math.max(1, Math.min(6, s)); if (scale === 1) { tx = 0; ty = 0; } apply(); }
  function openZoom() {
    zimg.src = base.src; setScale(1.8); zv.classList.add("show");
    if (window.track) window.track("zoom_open", { guide: cfg.name, page: cur + 1 });
  }
  function closeZoom() { zv.classList.remove("show"); }
  window.__zoom = openZoom;
  zv.querySelector(".zclose").addEventListener("click", closeZoom);
  zv.addEventListener("click", function (e) { if (e.target === zv) closeZoom(); });
  zv.querySelectorAll("[data-z]").forEach(function (b) {
    b.addEventListener("click", function () { setScale(scale + (b.getAttribute("data-z") === "in" ? 0.5 : -0.5)); });
  });
  zc.addEventListener("wheel", function (e) { e.preventDefault(); setScale(scale - e.deltaY * 0.0025); }, { passive: false });

  /* mouse pan */
  var pd = false, px, py;
  zc.addEventListener("mousedown", function (e) { pd = true; px = e.clientX; py = e.clientY; });
  window.addEventListener("mousemove", function (e) { if (!pd) return; tx += e.clientX - px; ty += e.clientY - py; px = e.clientX; py = e.clientY; apply(); });
  window.addEventListener("mouseup", function () { pd = false; });

  /* touch pinch + pan */
  function dist(t) { var dx = t[0].clientX - t[1].clientX, dy = t[0].clientY - t[1].clientY; return Math.sqrt(dx * dx + dy * dy); }
  var startDist = 0, startScale = 1, pan0 = null;
  zc.addEventListener("touchstart", function (e) {
    if (e.touches.length === 2) { startDist = dist(e.touches); startScale = scale; }
    else if (e.touches.length === 1) { pan0 = { x: e.touches[0].clientX - tx, y: e.touches[0].clientY - ty }; }
  }, { passive: false });
  zc.addEventListener("touchmove", function (e) {
    if (e.touches.length === 2) { e.preventDefault(); setScale(startScale * dist(e.touches) / startDist); }
    else if (e.touches.length === 1 && scale > 1) { e.preventDefault(); tx = e.touches[0].clientX - pan0.x; ty = e.touches[0].clientY - pan0.y; apply(); }
  }, { passive: false });
  /* double-tap to reset */
  var lastTap = 0;
  zc.addEventListener("touchend", function () { var n = Date.now(); if (n - lastTap < 300) setScale(scale > 1.9 ? 1 : 2.6); lastTap = n; });

  if (window.track) window.track("guide_open", { guide: cfg.name });
  render();

  /* ---- CTA helpers ---- */
  window.__cta = function (label, url) {
    if (window.track) window.track("cta_click", { label: label, guide: cfg.name });
    if (url && (url.indexOf("http") === 0 || url.indexOf("mailto") === 0)) window.location.href = url;
  };
  window.__share = function () {
    var u = window.location.href;
    if (window.track) window.track("cta_click", { label: "share", guide: cfg.name });
    if (navigator.share) { navigator.share({ title: cfg.name + " — The Coolidge Group", url: u }).catch(function () {}); return; }
    if (navigator.clipboard) navigator.clipboard.writeText(u).then(showToast); else showToast();
  };
  function showToast() { var t = document.getElementById("toast"); if (!t) return; t.classList.add("show"); setTimeout(function () { t.classList.remove("show"); }, 1900); }
})();
