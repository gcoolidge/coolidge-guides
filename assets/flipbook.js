/* The Coolidge Group — self-contained page-flip engine (no dependencies) */
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

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") window.__next();
    else if (e.key === "ArrowLeft") window.__prev();
  });

  stage.addEventListener("click", function (e) {
    var r = stage.getBoundingClientRect();
    if (e.clientX - r.left > r.width / 2) window.__next(); else window.__prev();
  });

  var sx = null;
  stage.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener("touchend", function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 40) { if (dx < 0) window.__next(); else window.__prev(); }
    sx = null;
  }, { passive: true });

  if (window.track) window.track("guide_open", { guide: cfg.name });
  render();

  /* CTA wiring */
  window.__cta = function (label, url) {
    if (window.track) window.track("cta_click", { label: label, guide: cfg.name });
    if (url) { if (url.indexOf("http") === 0 || url.indexOf("mailto") === 0) window.location.href = url; }
  };
  window.__share = function () {
    var u = window.location.href;
    if (window.track) window.track("cta_click", { label: "share", guide: cfg.name });
    if (navigator.share) { navigator.share({ title: cfg.name + " — The Coolidge Group", url: u }).catch(function () {}); return; }
    if (navigator.clipboard) { navigator.clipboard.writeText(u).then(showToast); } else showToast();
  };
  function showToast() {
    var t = document.getElementById("toast"); if (!t) return;
    t.classList.add("show"); setTimeout(function () { t.classList.remove("show"); }, 1900);
  }
})();
