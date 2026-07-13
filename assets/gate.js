/* ============================================================
   REGISTRATION GATE — download requires name / email / phone.
   The lead is POSTed to LEAD_ENDPOINT (a free relay that forwards
   it into Brivity). Paste your endpoint on the next line.
     - Formspree:  https://formspree.io/f/xxxxxxxx
     - Zapier hook: https://hooks.zapier.com/hooks/catch/xxxx/xxxx/
   In that relay, set the destination to your Brivity Lead Capture
   Email (Brivity -> your name -> Account -> Lead Parsing).
   Until an endpoint is set, the form still lets people download
   (so the site never blocks a client), but no lead is sent.
   ============================================================ */
window.LEAD_ENDPOINT = "PASTE_YOUR_ENDPOINT_HERE";

(function () {
  var g = window.GATE; if (!g) return;
  var KEY = "tcg_registered";

  var ov = document.createElement("div");
  ov.className = "gate-ov";
  ov.innerHTML =
    '<div class="gate" role="dialog" aria-modal="true" aria-label="Download the guide">' +
      '<div class="gate-head"><button class="gate-x" aria-label="Close">&times;</button>' +
        '<div class="k">The Coolidge Group</div><h3>Get your copy of the ' + g.guide + '</h3></div>' +
      '<form class="gate-body" novalidate>' +
        '<label>Full name</label><input name="name" type="text" autocomplete="name">' +
        '<label>Email</label><input name="email" type="email" autocomplete="email" inputmode="email">' +
        '<label>Phone</label><input name="phone" type="tel" autocomplete="tel" inputmode="tel">' +
        '<button class="gate-sub" type="submit">Download the guide</button>' +
        '<p class="gate-note">Your details are shared only with The Coolidge Group so we can help with your move.</p>' +
      '</form></div>';
  document.body.appendChild(ov);

  var form = ov.querySelector("form");
  var closeBtn = ov.querySelector(".gate-x");
  function open() { ov.classList.add("show"); setTimeout(function () { var f = form.querySelector('input[name=name]'); if (f) f.focus(); }, 60); }
  function close() { ov.classList.remove("show"); }
  closeBtn.addEventListener("click", close);
  ov.addEventListener("click", function (e) { if (e.target === ov) close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });

  function download() {
    var a = document.createElement("a");
    a.href = g.pdf; a.download = ""; document.body.appendChild(a); a.click(); a.remove();
  }

  window.__download = function () {
    if (localStorage.getItem(KEY)) {
      if (window.track) window.track("cta_click", { label: "download_returning", guide: g.guide });
      download(); return;
    }
    open();
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = form.name.value.trim(), email = form.email.value.trim(), phone = form.phone.value.trim();
    var ok = true;
    function mark(el, good) { el.classList.toggle("err", !good); if (!good) ok = false; }
    mark(form.name, name.length > 1);
    mark(form.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
    mark(form.phone, phone.replace(/\D/g, "").length >= 10);
    if (!ok) return;

    var btn = form.querySelector(".gate-sub");
    btn.disabled = true; btn.textContent = "One moment...";

    try {
      localStorage.setItem(KEY, JSON.stringify({ name: name, email: email, phone: phone, at: Date.now() }));
    } catch (x) {}
    if (window.track) window.track("lead_capture", { guide: g.guide });

    var ep = window.LEAD_ENDPOINT;
    var finish = function () { close(); btn.disabled = false; btn.textContent = "Download the guide"; download(); };

    if (ep && ep.indexOf("PASTE_") === -1) {
      var body = "New guide download lead\nName: " + name + "\nEmail: " + email +
        "\nPhone: " + phone + "\nGuide: " + g.guide + "\nSource: guides.thecoolidgegroup.com";
      var fd = new FormData();
      fd.append("name", name); fd.append("email", email); fd.append("_replyto", email);
      fd.append("phone", phone); fd.append("guide", g.guide);
      fd.append("_subject", "New " + g.guide + " lead: " + name);
      fd.append("message", body);
      fetch(ep, { method: "POST", headers: { "Accept": "application/json" }, body: fd })
        .then(finish).catch(finish);
    } else {
      finish();
    }
  });
})();
