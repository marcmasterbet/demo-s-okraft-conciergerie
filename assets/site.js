/* Seokraft Conciergerie — site de démonstration.
   Toutes les maisons, disponibilités et réservations sont fictives.
   Le point de branchement Autonomya est la fonction AUTONOMYA.book() plus bas. */
(function () {
  "use strict";

  /* ---------- Données des maisons ---------- */
  const HOMES = {
    marelys: {
      name: "Villa Marelys", place: "Cap d'Antibes, Côte d'Azur", type: "mer",
      guests: 10, rooms: 5, baths: 5, area: 280, cleaning: 290, deposit: 3000,
      rates: { basse: 690, moyenne: 980, haute: 1490 }, minN: { basse: 3, moyenne: 4, haute: 7 }, seasonModel: "littoral"
    },
    nevea: {
      name: "Chalet Névéa", place: "Megève, Haute-Savoie", type: "montagne",
      guests: 8, rooms: 4, baths: 4, area: 210, cleaning: 260, deposit: 2500,
      rates: { basse: 420, moyenne: 640, haute: 1240 }, minN: { basse: 2, moyenne: 3, haute: 7 }, seasonModel: "ski"
    },
    ombrelle: {
      name: "Bastide Ombrelle", place: "Luberon, Vaucluse", type: "provence",
      guests: 12, rooms: 6, baths: 5, area: 340, cleaning: 330, deposit: 2500,
      rates: { basse: 490, moyenne: 740, haute: 1120 }, minN: { basse: 2, moyenne: 3, haute: 7 }, seasonModel: "littoral"
    },
    salvane: {
      name: "Maison Salvane", place: "Cap Ferret, bassin d'Arcachon", type: "bassin",
      guests: 6, rooms: 3, baths: 2, area: 140, cleaning: 180, deposit: 1500,
      rates: { basse: 320, moyenne: 490, haute: 790 }, minN: { basse: 2, moyenne: 3, haute: 7 }, seasonModel: "littoral"
    }
  };
  const TAXE = 3.0; // taxe de séjour estimée, par adulte et par nuit
  window.SEOKRAFT_HOMES = HOMES;

  const fmt = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  const fmt2 = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const dFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" });
  const dFmtY = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  const store = {
    get(k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } }
  };

  /* ---------- Dates ---------- */
  const DAY = 86400000;
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const parse = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const today = (() => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); })();
  const nightsBetween = (a, b) => Math.round((b - a) / DAY);

  function seasonOf(home, d) {
    const m = d.getMonth() + 1, day = d.getDate(), md = m * 100 + day;
    if (home.seasonModel === "ski") {
      if ((md >= 1219 || md <= 105) || (md >= 206 && md <= 308)) return "haute";
      if ((md >= 106 && md <= 405) || (m === 7 || m === 8)) return "moyenne";
      return "basse";
    }
    if (m === 7 || m === 8) return "haute";
    if ((m >= 4 && m <= 6) || m === 9 || md >= 1219 || md <= 103) return "moyenne";
    return "basse";
  }

  // Disponibilités fictives : blocs réservés déterministes par maison
  const bookedCache = {};
  function bookedSet(id) {
    if (bookedCache[id]) return bookedCache[id];
    let s = 0; for (const c of id) s = (s * 31 + c.charCodeAt(0)) >>> 0;
    const r = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
    const set = new Set();
    let d = new Date(today.getTime() + DAY * (2 + Math.floor(r() * 6)));
    const end = today.getTime() + DAY * 400;
    while (d.getTime() < end) {
      const len = 3 + Math.floor(r() * 6);
      for (let i = 0; i < len; i++) set.add(iso(new Date(d.getTime() + i * DAY)));
      d = new Date(d.getTime() + DAY * (len + 4 + Math.floor(r() * 14)));
    }
    return (bookedCache[id] = set);
  }

  function quote(id, a, b, adults) {
    const h = HOMES[id], n = nightsBetween(a, b);
    if (n <= 0) return null;
    let lodging = 0; const bySeason = {};
    for (let i = 0; i < n; i++) {
      const d = new Date(a.getTime() + i * DAY), s = seasonOf(h, d);
      lodging += h.rates[s]; bySeason[s] = (bySeason[s] || 0) + 1;
    }
    const startSeason = seasonOf(h, a);
    const tax = Math.round(TAXE * adults * n * 100) / 100;
    return { n, lodging, cleaning: h.cleaning, tax, total: lodging + h.cleaning + tax, min: h.minN[startSeason], startSeason, bySeason };
  }
  window.SEOKRAFT_QUOTE = quote;

  /* ---------- Point de branchement Autonomya ----------
     Aujourd'hui : simulation locale. Demain : remplacer le corps de book()
     par l'appel au moteur de réservation Autonomya (lien, widget ou API). */
  const AUTONOMYA = {
    connected: false,
    book(payload) {
      return new Promise(res => setTimeout(() => res({ ok: true, ref: "SK-" + Math.random().toString(36).slice(2, 8).toUpperCase(), payload }), 900));
    }
  };
  window.AUTONOMYA = AUTONOMYA;

  /* ---------- Menu mobile ---------- */
  document.addEventListener("click", e => {
    const t = e.target.closest(".menu-toggle");
    if (t) { const nav = document.getElementById("nav"); const open = nav.classList.toggle("open"); t.setAttribute("aria-expanded", open); }
  });

  /* ---------- Recherche rapide (accueil) ---------- */
  const quick = document.getElementById("quick");
  if (quick) {
    const qa = quick.querySelector("#q-arrive"), qd = quick.querySelector("#q-depart");
    qa.min = iso(today); qd.min = iso(new Date(today.getTime() + DAY));
    qa.addEventListener("change", () => { if (qa.value) { const m = iso(new Date(parse(qa.value).getTime() + DAY)); qd.min = m; if (!qd.value || qd.value <= qa.value) qd.value = m; } });
    quick.addEventListener("submit", e => {
      e.preventDefault();
      const home = quick.querySelector("#q-home").value;
      store.set("sk-search", { a: qa.value, b: qd.value, g: quick.querySelector("#q-guests").value });
      const base = quick.getAttribute("data-target") || "logements.html";
      location.href = base + "#" + home;
    });
  }

  /* ---------- Module de réservation ---------- */
  document.querySelectorAll(".booker[data-home]").forEach(initBooker);

  function initBooker(el) {
    const id = el.dataset.home, h = HOMES[id], booked = bookedSet(id);
    const saved = store.get("sk-search");
    let a = null, b = null, view = new Date(today.getFullYear(), today.getMonth(), 1);
    if (saved && saved.a && saved.b && location.hash === "#" + id) {
      const sa = parse(saved.a), sb = parse(saved.b);
      if (sa >= today && sb > sa) { a = sa; b = sb; view = new Date(sa.getFullYear(), sa.getMonth(), 1); }
    }
    el.innerHTML = `
      <div class="booker-head"><span>à partir de <strong class="num">${fmt.format(h.rates.basse)}</strong> / nuit</span><span class="note">jusqu'à ${h.guests} voyageurs</span></div>
      <div class="cal" aria-label="Calendrier des disponibilités">
        <div class="cal-head"><button type="button" data-nav="-1" aria-label="Mois précédent">‹</button><span class="cal-month" aria-live="polite"></span><button type="button" data-nav="1" aria-label="Mois suivant">›</button></div>
        <div class="cal-grid"></div>
        <div class="cal-legend"><span>Barré : déjà réservé</span><span>Cliquez l'arrivée, puis le départ</span></div>
      </div>
      <div class="fields">
        <label class="field">Arrivée<input type="date" id="${id}-a"></label>
        <label class="field">Départ<input type="date" id="${id}-b"></label>
        <label class="field full">Voyageurs adultes<select id="${id}-g">${Array.from({ length: h.guests }, (_, i) => `<option value="${i + 1}"${i + 1 === Math.min(4, h.guests) ? " selected" : ""}>${i + 1}</option>`).join("")}</select></label>
      </div>
      <div class="breakdown" aria-live="polite"></div>
      <button type="button" class="btn" data-book disabled>Réserver ces dates</button>
      <p class="note">Aucun paiement réel : cette maison est fictive et le paiement se fait en mode test.</p>`;
    const grid = el.querySelector(".cal-grid"), month = el.querySelector(".cal-month"), bd = el.querySelector(".breakdown"),
      ia = el.querySelector(`#${id}-a`), ib = el.querySelector(`#${id}-b`), ig = el.querySelector(`#${id}-g`), go = el.querySelector("[data-book]");
    if (saved && saved.g && location.hash === "#" + id) ig.value = String(Math.min(Number(saved.g) || 2, h.guests));
    ia.min = iso(today);

    function rangeFree(x, y) { for (let t = x.getTime(); t < y.getTime(); t += DAY) if (booked.has(iso(new Date(t)))) return false; return true; }

    function drawCal() {
      month.textContent = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(view);
      const first = (view.getDay() + 6) % 7, days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
      let html = ["L", "M", "M", "J", "V", "S", "D"].map(d => `<span class="dow">${d}</span>`).join("");
      for (let i = 0; i < first; i++) html += "<span></span>";
      for (let d = 1; d <= days; d++) {
        const dt = new Date(view.getFullYear(), view.getMonth(), d), k = iso(dt);
        const past = dt < today, isB = booked.has(k);
        let cls = isB ? "booked" : "";
        if (a && b && dt >= a && dt <= b) cls += (dt.getTime() === a.getTime() || dt.getTime() === b.getTime()) ? " edge" : " in-range";
        else if (a && !b && dt.getTime() === a.getTime()) cls += " edge";
        html += `<button type="button" data-d="${k}" class="${cls}" ${past ? "disabled" : ""} aria-label="${dFmtY.format(dt)}${isB ? ", réservé" : ""}">${d}</button>`;
      }
      grid.innerHTML = html;
    }

    function update() {
      ia.value = a ? iso(a) : ""; ib.value = b ? iso(b) : "";
      ib.min = a ? iso(new Date(a.getTime() + DAY)) : iso(new Date(today.getTime() + DAY));
      drawCal();
      if (!a || !b) { bd.innerHTML = `<p class="note">Choisissez vos dates pour voir le prix exact, frais compris.</p>`; go.disabled = true; return; }
      const q = quote(id, a, b, Number(ig.value));
      let warn = "";
      if (!rangeFree(a, b)) warn = "Ces dates chevauchent une réservation existante. Choisissez d'autres dates.";
      else if (q.n < q.min) warn = `En saison ${q.startSeason}, le séjour minimum est de ${q.min} nuits.`;
      const seasons = Object.entries(q.bySeason).map(([s, n]) => `${n} nuit${n > 1 ? "s" : ""} en saison ${s}`).join(", ");
      bd.innerHTML = `
        <div class="row"><span>${q.n} nuit${q.n > 1 ? "s" : ""}, du ${dFmt.format(a)} au ${dFmt.format(b)}</span><span class="num">${fmt.format(q.lodging)}</span></div>
        <div class="row note"><span>${seasons}</span></div>
        <div class="row"><span>Ménage de fin de séjour</span><span class="num">${fmt.format(q.cleaning)}</span></div>
        <div class="row"><span>Taxe de séjour estimée</span><span class="num">${fmt2.format(q.tax)}</span></div>
        <div class="row total"><span>Total</span><span class="num">${fmt2.format(q.total)}</span></div>
        <div class="row note"><span>Frais de service</span><span>0 €</span></div>
        ${warn ? `<p class="msg">${warn}</p>` : ""}`;
      go.disabled = !!warn;
    }

    grid.addEventListener("click", e => {
      const btn = e.target.closest("button[data-d]"); if (!btn || btn.disabled) return;
      const d = parse(btn.dataset.d);
      if (!a || (a && b) || d <= a) { if (booked.has(btn.dataset.d)) return; a = d; b = null; }
      else b = d;
      update();
    });
    el.querySelectorAll("[data-nav]").forEach(n => n.addEventListener("click", () => {
      const nv = new Date(view.getFullYear(), view.getMonth() + Number(n.dataset.nav), 1);
      if (nv < new Date(today.getFullYear(), today.getMonth(), 1)) return;
      view = nv; drawCal();
    }));
    ia.addEventListener("change", () => { a = ia.value ? parse(ia.value) : null; if (b && a && b <= a) b = null; if (a) view = new Date(a.getFullYear(), a.getMonth(), 1); update(); });
    ib.addEventListener("change", () => { b = ib.value ? parse(ib.value) : null; update(); });
    ig.addEventListener("change", update);
    go.addEventListener("click", () => openCheckout(id, a, b, Number(ig.value)));
    update();
  }

  /* ---------- Parcours de réservation (démo) ---------- */
  function openCheckout(id, a, b, adults) {
    const h = HOMES[id], q = quote(id, a, b, adults);
    const back = document.createElement("div");
    back.className = "dialog-back";
    back.innerHTML = `<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-t">
      <ol class="steps"><li class="on">Vos coordonnées</li><li>Paiement</li><li>Confirmation</li></ol>
      <div class="dlg-body"></div></div>`;
    document.body.appendChild(back);
    const body = back.querySelector(".dlg-body"), steps = back.querySelectorAll(".steps li");
    const close = () => { back.remove(); document.removeEventListener("keydown", esc); };
    const esc = e => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", esc);
    back.addEventListener("click", e => { if (e.target === back || e.target.closest("[data-close]")) close(); });
    const recap = `<p class="muted">${h.name} · ${q.n} nuits, du ${dFmt.format(a)} au ${dFmtY.format(b)} · ${adults} adulte${adults > 1 ? "s" : ""} · <strong class="num">${fmt2.format(q.total)}</strong></p>`;
    const guest = {};

    function step(n) { steps.forEach((s, i) => s.classList.toggle("on", i === n)); }

    function s1() {
      step(0);
      body.innerHTML = `<h3 id="dlg-t">Vos coordonnées</h3>${recap}
        <form class="fields" id="dlg-f1" novalidate>
          <label class="field">Prénom<input id="g-first" autocomplete="given-name" required></label>
          <label class="field">Nom<input id="g-last" autocomplete="family-name" required></label>
          <label class="field full">E-mail<input id="g-mail" type="email" autocomplete="email" required></label>
          <label class="field full">Téléphone<input id="g-tel" type="tel" autocomplete="tel"></label>
          <label class="field full">Un mot pour la conciergerie (facultatif)<input id="g-note" placeholder="Heure d'arrivée, lit bébé, courses…"></label>
          <p class="err full" id="g-err" hidden></p>
          <div class="row-actions field full"><button type="button" class="btn ghost" data-close>Annuler</button><button class="btn">Continuer vers le paiement</button></div>
        </form>`;
      body.querySelector("#g-first").focus();
      body.querySelector("#dlg-f1").addEventListener("submit", e => {
        e.preventDefault();
        const f = body.querySelector("#g-first").value.trim(), l = body.querySelector("#g-last").value.trim(), m = body.querySelector("#g-mail").value.trim();
        const err = body.querySelector("#g-err");
        if (!f || !l) { err.textContent = "Indiquez votre prénom et votre nom."; err.hidden = false; return; }
        if (!/^\S+@\S+\.\S+$/.test(m)) { err.textContent = "Indiquez une adresse e-mail valide, par exemple nom@exemple.fr."; err.hidden = false; return; }
        Object.assign(guest, { f, l, m }); s2();
      });
    }

    function s2() {
      step(1);
      body.innerHTML = `<h3 id="dlg-t">Paiement sécurisé</h3>${recap}
        <div class="card-test">Mode test : utilisez la carte <strong class="num">4242 4242 4242 4242</strong>, une date future et n'importe quel code à 3 chiffres. Aucun montant ne sera débité.</div>
        <form class="fields" id="dlg-f2" novalidate>
          <label class="field full">Numéro de carte<input id="c-num" inputmode="numeric" autocomplete="off" placeholder="4242 4242 4242 4242"></label>
          <label class="field">Expiration<input id="c-exp" inputmode="numeric" autocomplete="off" placeholder="MM/AA"></label>
          <label class="field">Code<input id="c-cvc" inputmode="numeric" autocomplete="off" placeholder="123"></label>
          <p class="note full">Une empreinte bancaire de ${fmt.format(h.deposit)} est demandée à l'arrivée pour la caution. Elle n'est pas débitée.</p>
          <p class="err full" id="c-err" hidden></p>
          <div class="row-actions field full"><button type="button" class="btn ghost" data-back>Retour</button><button class="btn" id="c-pay">Payer ${fmt2.format(q.total)}</button></div>
        </form>`;
      const num = body.querySelector("#c-num");
      num.addEventListener("input", () => { num.value = num.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim(); });
      body.querySelector("[data-back]").addEventListener("click", s1);
      body.querySelector("#dlg-f2").addEventListener("submit", async e => {
        e.preventDefault();
        const err = body.querySelector("#c-err"), raw = num.value.replace(/\s/g, ""), exp = body.querySelector("#c-exp").value.trim(), cvc = body.querySelector("#c-cvc").value.trim();
        if (raw !== "4242424242424242") { err.textContent = "Ce site est une démonstration : seule la carte de test 4242 4242 4242 4242 est acceptée."; err.hidden = false; return; }
        if (!/^(0[1-9]|1[0-2])\/?\d{2}$/.test(exp)) { err.textContent = "Saisissez la date d'expiration au format MM/AA."; err.hidden = false; return; }
        if (!/^\d{3}$/.test(cvc)) { err.textContent = "Le code de sécurité comporte 3 chiffres."; err.hidden = false; return; }
        const pay = body.querySelector("#c-pay"); pay.disabled = true; pay.textContent = "Paiement en cours…";
        const res = await AUTONOMYA.book({ home: id, arrive: iso(a), depart: iso(b), adults, guest, total: q.total });
        s3(res.ref);
      });
    }

    function s3(ref) {
      step(2);
      body.innerHTML = `<h3 id="dlg-t">Réservation confirmée</h3>
        <p class="msg ok">Merci ${guest.f}. Votre séjour à ${h.name} est réservé sous la référence <strong class="num">${ref}</strong>.</p>
        ${recap}
        <div class="prose"><p>Dans un vrai séjour, vous recevriez maintenant automatiquement :</p>
        <ul><li>l'e-mail de confirmation et la facture ;</li><li>le lien de check-in en ligne (pièce d'identité, signature, caution) ;</li><li>le livret d'accueil numérique, 3 jours avant l'arrivée ;</li><li>le code de la serrure connectée, le matin de votre arrivée.</li></ul>
        <p class="note">Démonstration : aucune réservation réelle n'a été créée et aucun e-mail n'a été envoyé.</p></div>
        <div class="row-actions"><button type="button" class="btn" data-close>Fermer</button></div>`;
    }
    s1();
  }

  /* ---------- Simulateur propriétaires (page tarifs) ---------- */
  const sim = document.getElementById("sim");
  if (sim) {
    const $ = s => sim.querySelector(s);
    const inputs = ["#s-rev", "#s-direct", "#s-airbnb", "#s-booking", "#s-split", "#s-stripe"];
    function run() {
      const rev = Math.max(0, Number($("#s-rev").value) || 0), direct = Number($("#s-direct").value) / 100,
        air = Number($("#s-airbnb").value) / 100, boo = Number($("#s-booking").value) / 100,
        split = Number($("#s-split").value) / 100, stripe = Number($("#s-stripe").value) / 100;
      $("#s-direct-out").textContent = Math.round(direct * 100) + " %";
      $("#s-split-out").textContent = `${Math.round(split * 100)} % Airbnb · ${Math.round((1 - split) * 100)} % Booking`;
      const platformRate = split * air + (1 - split) * boo;
      const allPlatform = rev * platformRate;
      const mixed = rev * (1 - direct) * platformRate + rev * direct * stripe;
      const saved = allPlatform - mixed;
      const max = Math.max(allPlatform, 1);
      $("#b-plat").style.width = (allPlatform / max * 100) + "%";
      $("#b-mix").style.width = (mixed / max * 100) + "%";
      $("#v-plat").textContent = fmt.format(allPlatform);
      $("#v-mix").textContent = fmt.format(mixed);
      $("#v-save").textContent = fmt.format(saved);
      $("#v-save-m").textContent = fmt.format(saved / 12);
    }
    inputs.forEach(s => $(s).addEventListener("input", run));
    run();
  }

  /* ---------- Formulaire de contact ---------- */
  const cf = document.getElementById("contact-form");
  if (cf) {
    cf.addEventListener("submit", e => {
      e.preventDefault();
      const err = cf.querySelector("#cf-err"), ok = cf.querySelector("#cf-ok");
      const name = cf.querySelector("#cf-name").value.trim(), mail = cf.querySelector("#cf-mail").value.trim(), msg = cf.querySelector("#cf-msg").value.trim();
      ok.hidden = true;
      if (!name) { err.textContent = "Indiquez votre nom."; err.hidden = false; return; }
      if (!/^\S+@\S+\.\S+$/.test(mail)) { err.textContent = "Indiquez une adresse e-mail valide pour que nous puissions vous répondre."; err.hidden = false; return; }
      if (msg.length < 10) { err.textContent = "Votre message est un peu court : dites-nous en quelques mots ce que vous cherchez."; err.hidden = false; return; }
      if (!cf.querySelector("#cf-rgpd").checked) { err.textContent = "Cochez la case de consentement pour envoyer le formulaire."; err.hidden = false; return; }
      err.hidden = true;
      ok.textContent = `Merci ${name.split(" ")[0]}. Sur le vrai site, votre message arriverait dans la messagerie de la conciergerie. Ici, rien n'a été envoyé : c'est une démonstration.`;
      ok.hidden = false; cf.reset();
    });
  }

  /* ---------- Année du pied de page ---------- */
  document.querySelectorAll("[data-year]").forEach(n => n.textContent = new Date().getFullYear());
})();
