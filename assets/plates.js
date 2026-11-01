/* Planches illustrées : paysages façon affiche de voyage, générés en SVG.
   Utilisation : <div class="plate" data-plate="mer" data-time="jour" data-view="paysage"></div>
   Pour mettre de vraies photos plus tard, remplacez la div par <img src="images/....jpg" alt="..."> */
(function () {
  const W = 1200, H = 900;
  const PAL = {
    mer: {
      jour: { s1: "#86AFC6", s2: "#ECE4D2", sun: "#F6E7BC", sea1: "#5C99AD", sea2: "#245F78", far: "#8AA3A3", mid: "#5D7B76", fg: "#1F3B3A", wall: "#F4F1EA", wall2: "#D8D3C6", pool: "#7FC3CF", roof: "#E9E4D8", glow: "#FFF6DA" },
      soir: { s1: "#3D4A70", s2: "#F2B489", sun: "#F8D594", sea1: "#7C7891", sea2: "#2C3B58", far: "#6E6278", mid: "#4A4560", fg: "#1C2131", wall: "#EBD9CB", wall2: "#B9A39A", pool: "#8FA7C2", roof: "#D9C4B6", glow: "#FFD9A0" }
    },
    montagne: {
      jour: { s1: "#8DB4D0", s2: "#EBF0F1", sun: "#FBF6E4", far: "#AEBECB", mid: "#7A8FA0", snow: "#F7F9FA", fg: "#223D35", ground: "#EEF2F2", wood: "#7A5338", roof: "#3B2D27", win: "#F4E1A6", glow: "#FFFFFF" },
      nuit: { s1: "#18243C", s2: "#50627F", sun: "#E8E6D8", far: "#3D4C66", mid: "#2D3A50", snow: "#C7D1DE", fg: "#111D1D", ground: "#AFBBCB", wood: "#4C3526", roof: "#1F1815", win: "#F5C46A", glow: "#F5C46A" }
    },
    provence: {
      jour: { s1: "#A3C3D3", s2: "#F2E7CF", sun: "#FBEFC8", far: "#B6B7A0", mid: "#97A06A", near: "#7C8B4E", lav1: "#7F6FA6", lav2: "#A698C7", fg: "#2D3D29", wall: "#EADBBE", wall2: "#CDB894", roof: "#B8724F", pool: "#79BFC8", glow: "#FFF4D6" },
      soir: { s1: "#5F5E8A", s2: "#F1B47C", sun: "#F9D08A", far: "#9C8472", mid: "#8C7C5C", near: "#6E6446", lav1: "#6A5888", lav2: "#8E7BAB", fg: "#272A24", wall: "#E8C9A5", wall2: "#BE9C7D", roof: "#A35E43", pool: "#7FA6B5", glow: "#FFD49A" }
    },
    bassin: {
      jour: { s1: "#B2CEDA", s2: "#F4EFE2", sun: "#FBF4DC", sea1: "#86B4BF", sea2: "#4C8798", far: "#8FA697", dune: "#E6D6B1", dune2: "#D2BE92", fg: "#33493A", wood: "#8B6C4E", roof: "#5C4A3B", pool: "#86B4BF", glow: "#FFF8E2" },
      aube: { s1: "#C9B4C4", s2: "#F5E1CC", sun: "#FBE3BE", sea1: "#A9B2C2", sea2: "#6E7F98", far: "#9A9AA3", dune: "#E8D1B6", dune2: "#CDB49A", fg: "#3A4340", wood: "#7D6050", roof: "#544238", pool: "#A9B2C2", glow: "#FFE6C4" }
    },
    ville: {
      jour: { s1: "#9EC0D3", s2: "#EEE8DA", sun: "#FBF1CF", sea1: "#7C9FA8", sea2: "#3E6672", fronts: ["#F2EAD8", "#EAD9B4", "#F5F0E6", "#E3CFA6", "#EFE3CC"], beam: "#5A3C2A", roof: "#9B4E36", roof2: "#7E3F2E", win: "#40565C", fg: "#2F4A3B", wall: "#EDE6D6", wall2: "#CFC4AE", glow: "#FFF6DC" },
      soir: { s1: "#22304F", s2: "#C98F7A", sun: "#F6D08E", sea1: "#3F4C66", sea2: "#1C2438", fronts: ["#D9C6B0", "#CDB596", "#E0D2C0", "#C4A988", "#D6C2A8"], beam: "#3A2820", roof: "#6E3A2E", roof2: "#552C24", win: "#F4C46C", fg: "#1D2A26", wall: "#3A3A44", wall2: "#2A2A32", glow: "#F6C77A" },
      colmar: { s1: "#A6C6D6", s2: "#F1EADB", sun: "#FBF1CF", sea1: "#7FA7A2", sea2: "#3F6B66", fronts: ["#E9C46A", "#8FB3C9", "#E5A39A", "#A9C49A", "#F2D7A6"], beam: "#4E3426", roof: "#A1523A", roof2: "#82402F", win: "#3B5157", fg: "#2F4A3B", wall: "#EDE6D6", wall2: "#CFC4AE", glow: "#FFF6DC" }
    },
    vosges: {
      jour: { s1: "#9DBBCF", s2: "#E9EDE6", sun: "#FBF4DC", far: "#8FA6A4", mid: "#5E7A6C", near: "#3D5A48", fg: "#1F3529", ground: "#B8C79E", wood: "#8A5E3B", roof: "#3B2E28", win: "#F3DFA2", steam: "#FFFFFF", glow: "#FFF8E2" },
      neige: { s1: "#2A3A55", s2: "#8D9DB4", sun: "#EDEBDF", far: "#5D6E85", mid: "#43546A", near: "#2C3B47", fg: "#15211F", ground: "#E6ECF1", wood: "#5E4030", roof: "#241C18", win: "#F5C46A", steam: "#FFFFFF", glow: "#F5C46A" }
    }
  };

  function rng(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
  function hash(str) { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

  function ridge(r, y, amp, n, rough) {
    const pts = [];
    for (let i = 0; i <= n; i++) pts.push([i * W / n, y - r() * amp * (rough ? 1 : 0.6) - (rough ? Math.sin(i * 1.7) * amp * 0.2 : 0)]);
    if (!rough) {
      let d = `M0 ${H} L0 ${pts[0][1]}`;
      for (let i = 1; i < pts.length; i++) {
        const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
        d += ` Q${x0 + (x1 - x0) / 2} ${y0 - (r() * 18)} ${x1} ${y1}`;
      }
      return d + ` L${W} ${H} Z`;
    }
    return `M0 ${H} ` + pts.map(p => `L${p[0].toFixed(0)} ${p[1].toFixed(0)}`).join(" ") + ` L${W} ${H} Z`;
  }

  function peaks(r, base, h, count) {
    let d = `M0 ${H} L0 ${base}`; const caps = [];
    let x = 0; const step = W / count;
    for (let i = 0; i < count; i++) {
      const px = x + step * (0.35 + r() * 0.3), py = base - h * (0.55 + r() * 0.45), nx = x + step;
      d += ` L${px.toFixed(0)} ${py.toFixed(0)} L${nx.toFixed(0)} ${(base - r() * h * 0.25).toFixed(0)}`;
      caps.push([px, py, step]);
      x = nx;
    }
    return { d: d + ` L${W} ${H} Z`, caps };
  }

  function fir(x, y, s, c) { return `<path d="M${x} ${y - s * 3} L${x + s} ${y - s * 1.4} L${x + s * 0.55} ${y - s * 1.4} L${x + s * 1.3} ${y} L${x - s * 1.3} ${y} L${x - s * 0.55} ${y - s * 1.4} L${x - s} ${y - s * 1.4} Z" fill="${c}"/>`; }
  function cypress(x, y, s, c) { return `<path d="M${x} ${y - s * 5} C${x + s * 0.9} ${y - s * 3.4} ${x + s * 0.8} ${y - s * 0.6} ${x} ${y} C${x - s * 0.8} ${y - s * 0.6} ${x - s * 0.9} ${y - s * 3.4} ${x} ${y - s * 5} Z" fill="${c}"/>`; }
  function umbrellaPine(x, y, s, c) {
    return `<path d="M${x} ${y} C${x + s * 0.1} ${y - s * 1.2} ${x - s * 0.3} ${y - s * 2} ${x + s * 0.2} ${y - s * 2.6}" stroke="${c}" stroke-width="${s * 0.14}" fill="none"/>
      <path d="M${x - s * 1.9} ${y - s * 2.5} C${x - s * 1.6} ${y - s * 3.4} ${x + s * 1.6} ${y - s * 3.7} ${x + s * 2.2} ${y - s * 2.7} C${x + s * 1.2} ${y - s * 2.3} ${x - s * 1.1} ${y - s * 2.2} ${x - s * 1.9} ${y - s * 2.5} Z" fill="${c}"/>`;
  }

  function sky(p, id) {
    return `<defs><linearGradient id="sk${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.s1}"/><stop offset="1" stop-color="${p.s2}"/></linearGradient>
      <radialGradient id="gl${id}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${p.glow}" stop-opacity=".9"/><stop offset="1" stop-color="${p.glow}" stop-opacity="0"/></radialGradient>
      <linearGradient id="se${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sea1 || p.far}"/><stop offset="1" stop-color="${p.sea2 || p.mid}"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#sk${id})"/>`;
  }
  function sun(p, id, x, y, r) { return `<g class="sun"><circle cx="${x}" cy="${y}" r="${r * 3}" fill="url(#gl${id})"/><circle cx="${x}" cy="${y}" r="${r}" fill="${p.sun}"/></g>`; }

  const SCENES = {
    mer(p, r, id, view) {
      let s = sky(p, id) + sun(p, id, 820, 300, 70);
      s += `<rect y="470" width="${W}" height="${H - 470}" fill="url(#se${id})"/>`;
      for (let i = 0; i < 14; i++) { const y = 490 + i * 26 + r() * 10; s += `<rect x="${r() * W * 0.8}" y="${y}" width="${80 + r() * 260}" height="2" fill="${p.sun}" opacity="${0.18 + r() * 0.2}"/>`; }
      s += `<path d="M640 470 C720 420 820 410 1200 432 L1200 470 Z" fill="${p.far}"/>`;
      if (view === "piscine") {
        s += `<rect y="600" width="${W}" height="300" fill="${p.wall}"/><rect y="640" width="${W}" height="200" fill="${p.pool}"/>`;
        for (let i = 0; i < 6; i++) s += `<path d="M${r() * 1000} ${670 + i * 28} q40 -8 80 0 t80 0" stroke="#FFFFFF" stroke-opacity=".45" stroke-width="3" fill="none"/>`;
        s += `<rect y="600" width="${W}" height="40" fill="${p.wall2}"/>` + umbrellaPine(140, 640, 70, p.fg);
        s += `<rect x="760" y="560" width="180" height="16" fill="${p.wall2}"/><rect x="770" y="576" width="8" height="30" fill="${p.wall2}"/><rect x="922" y="576" width="8" height="30" fill="${p.wall2}"/>`;
        return s;
      }
      if (view === "fenetre") return s + frame(p);
      s += `<path d="${ridge(r, 640, 60, 8, false)}" fill="${p.mid}"/>`;
      s += `<rect x="300" y="520" width="360" height="120" fill="${p.wall}"/><rect x="300" y="520" width="360" height="14" fill="${p.roof}"/><rect x="560" y="470" width="190" height="170" fill="${p.wall}"/><rect x="560" y="470" width="190" height="12" fill="${p.roof}"/>`;
      s += `<rect x="330" y="560" width="70" height="80" fill="${p.wall2}"/><rect x="420" y="560" width="120" height="80" fill="${p.sea2}" opacity=".55"/><rect x="590" y="510" width="130" height="70" fill="${p.sea2}" opacity=".55"/>`;
      s += `<rect x="250" y="640" width="560" height="26" fill="${p.pool}"/><path d="${ridge(r, 780, 40, 6, false)}" fill="${p.fg}"/>`;
      s += umbrellaPine(980, 760, 95, p.fg) + umbrellaPine(110, 790, 70, p.fg);
      return s;
    },
    montagne(p, r, id, view) {
      let s = sky(p, id) + sun(p, id, 300, 230, 46);
      if (p.s1 === PAL.montagne.nuit.s1) for (let i = 0; i < 70; i++) s += `<circle cx="${r() * W}" cy="${r() * 380}" r="${r() * 1.8 + .4}" fill="#FFFFFF" opacity="${.3 + r() * .6}"/>`;
      const far = peaks(r, 520, 300, 5), mid = peaks(r, 610, 260, 4);
      s += `<path d="${far.d}" fill="${p.far}"/>`;
      far.caps.forEach(([x, y, st]) => s += `<path d="M${x} ${y} L${x + st * 0.16} ${y + 60} L${x + st * 0.04} ${y + 46} L${x - st * 0.06} ${y + 70} L${x - st * 0.15} ${y + 58} Z" fill="${p.snow}"/>`);
      s += `<path d="${mid.d}" fill="${p.mid}"/>`;
      mid.caps.forEach(([x, y, st]) => s += `<path d="M${x} ${y} L${x + st * 0.17} ${y + 70} L${x + st * 0.05} ${y + 52} L${x - st * 0.07} ${y + 80} L${x - st * 0.17} ${y + 64} Z" fill="${p.snow}"/>`);
      if (view === "fenetre") return s + `<path d="${ridge(r, 760, 30, 6, false)}" fill="${p.ground}"/>` + frame({ wall: p.wood, wall2: p.roof, glow: p.win });
      s += `<path d="${ridge(r, 720, 40, 6, false)}" fill="${p.ground}"/>`;
      for (let i = 0; i < 16; i++) { const x = r() * W, y = 700 + r() * 60; s += fir(x, y, 18 + r() * 22, p.fg); }
      if (view === "piscine") {
        s += `<rect x="0" y="760" width="${W}" height="140" fill="${p.wood}"/><rect x="120" y="790" width="560" height="110" fill="#6F9EB0"/><rect x="760" y="780" width="300" height="70" fill="${p.roof}"/>`;
        for (let i = 0; i < 9; i++) s += `<circle cx="${180 + r() * 420}" cy="${770 - r() * 90}" r="${10 + r() * 22}" fill="#FFFFFF" opacity=".18"/>`;
        return s;
      }
      s += `<path d="M420 640 L620 520 L820 640 Z" fill="${p.roof}"/><path d="M400 650 L620 512 L840 650" stroke="${p.snow}" stroke-width="16" fill="none"/>`;
      s += `<rect x="460" y="640" width="320" height="150" fill="${p.wood}"/>`;
      [[490, 670], [590, 670], [690, 670]].forEach(([x, y]) => s += `<rect x="${x}" y="${y}" width="60" height="70" fill="${p.win}"/>`);
      s += `<rect x="440" y="740" width="360" height="12" fill="${p.roof}"/><path d="${ridge(r, 840, 26, 5, false)}" fill="${p.snow}"/>`;
      s += fir(160, 860, 60, p.fg) + fir(1040, 870, 70, p.fg) + fir(960, 860, 44, p.fg);
      return s;
    },
    provence(p, r, id, view) {
      let s = sky(p, id) + sun(p, id, 900, 260, 60);
      s += `<path d="${ridge(r, 470, 70, 5, false)}" fill="${p.far}"/><path d="${ridge(r, 560, 60, 6, false)}" fill="${p.mid}"/>`;
      if (view === "fenetre") return s + `<path d="${ridge(r, 680, 40, 6, false)}" fill="${p.near}"/>` + frame(p);
      s += `<path d="${ridge(r, 640, 40, 7, false)}" fill="${p.near}"/>`;
      // rangs de lavande en perspective
      s += `<rect y="700" width="${W}" height="200" fill="${p.lav1}"/>`;
      for (let i = -8; i <= 8; i++) s += `<path d="M${600 + i * 18} 700 L${600 + i * 150} ${H}" stroke="${p.lav2}" stroke-width="${10 + Math.abs(i) * 3}"/>`;
      s += `<rect y="690" width="${W}" height="14" fill="${p.near}"/>`;
      if (view === "piscine") {
        s += `<rect x="0" y="760" width="${W}" height="140" fill="${p.wall2}"/><rect x="200" y="780" width="800" height="100" fill="${p.pool}"/>`;
        s += cypress(120, 770, 40, p.fg) + cypress(1080, 770, 44, p.fg);
        return s;
      }
      s += `<rect x="440" y="560" width="300" height="140" fill="${p.wall}"/><path d="M425 566 L590 520 L755 566 Z" fill="${p.roof}"/>`;
      s += `<rect x="740" y="600" width="140" height="100" fill="${p.wall2}"/><path d="M735 604 L810 582 L885 604 Z" fill="${p.roof}"/>`;
      [[470, 600], [540, 600], [610, 600], [680, 600]].forEach(([x, y]) => s += `<rect x="${x}" y="${y}" width="30" height="44" fill="${p.fg}" opacity=".55"/>`);
      s += cypress(400, 700, 30, p.fg) + cypress(372, 700, 22, p.fg) + cypress(920, 700, 28, p.fg) + cypress(1110, 720, 40, p.fg) + cypress(70, 730, 36, p.fg);
      return s;
    },
    bassin(p, r, id, view) {
      let s = sky(p, id) + sun(p, id, 280, 290, 54);
      s += `<rect y="500" width="${W}" height="${H - 500}" fill="url(#se${id})"/>`;
      s += `<path d="M0 500 C200 470 380 480 520 500 Z" fill="${p.far}"/>`;
      for (let i = 0; i < 10; i++) s += `<rect x="${r() * W}" y="${520 + r() * 160}" width="${60 + r() * 200}" height="2" fill="#FFFFFF" opacity=".3"/>`;
      if (view === "fenetre") return s + frame(p);
      if (view === "piscine") {
        s += `<path d="M0 700 C300 660 700 680 1200 650 L1200 900 L0 900 Z" fill="${p.dune}"/>`;
        s += `<rect x="0" y="780" width="${W}" height="120" fill="${p.wood}"/>`;
        for (let i = 0; i < 12; i++) s += `<rect x="${i * 100}" y="780" width="4" height="120" fill="${p.roof}" opacity=".5"/>`;
        s += `<rect x="760" y="720" width="150" height="14" fill="#F4EFE2"/><rect x="760" y="734" width="6" height="46" fill="#F4EFE2"/><rect x="904" y="734" width="6" height="46" fill="#F4EFE2"/>`;
        return s;
      }
      // cabane tchanquée
      s += `<rect x="760" y="560" width="8" height="120" fill="${p.roof}"/><rect x="880" y="560" width="8" height="120" fill="${p.roof}"/><rect x="740" y="520" width="170" height="50" fill="${p.wood}"/><path d="M730 524 L825 486 L920 524 Z" fill="${p.roof}"/>`;
      s += `<rect x="790" y="532" width="26" height="24" fill="${p.glow}"/>`;
      s += `<path d="M0 720 C260 650 520 700 760 690 C960 680 1080 640 1200 660 L1200 900 L0 900 Z" fill="${p.dune}"/>`;
      s += `<path d="M0 800 C300 760 600 800 1200 770 L1200 900 L0 900 Z" fill="${p.dune2}"/>`;
      for (let i = 0; i < 24; i++) { const x = r() * 520, y = 720 + r() * 60; s += `<path d="M${x} ${y} l6 -30 l6 30" stroke="${p.fg}" stroke-width="2" fill="none" opacity=".7"/>`; }
      s += umbrellaPine(120, 720, 70, p.fg) + umbrellaPine(300, 700, 56, p.fg);
      return s;
    }
  };

  // Maisons à colombages au bord de l'eau (Petite France, Petite Venise)
  SCENES.ville = function (p, r, id, view) {
    let s = sky(p, id) + sun(p, id, 920, 220, 52);
    const wl = 640;
    s += `<rect y="${wl}" width="${W}" height="${H - wl}" fill="url(#se${id})"/>`;
    let row = "", x = -30, i = 0;
    while (x < W + 20) {
      const w = 130 + r() * 70, h = 230 + r() * 150, top = wl - h, front = p.fronts[i % p.fronts.length];
      const rh = 90 + r() * 70;
      row += `<rect x="${x}" y="${top}" width="${w}" height="${h}" fill="${front}"/>`;
      row += `<path d="M${x - 6} ${top + 2} L${x + w / 2} ${top - rh} L${x + w + 6} ${top + 2} Z" fill="${i % 2 ? p.roof : p.roof2}"/>`;
      // colombages
      const floors = Math.max(2, Math.floor(h / 80));
      for (let f = 1; f < floors; f++) row += `<rect x="${x}" y="${top + f * (h / floors)}" width="${w}" height="5" fill="${p.beam}"/>`;
      row += `<rect x="${x}" y="${top}" width="5" height="${h}" fill="${p.beam}"/><rect x="${x + w - 5}" y="${top}" width="5" height="${h}" fill="${p.beam}"/>`;
      for (let f = 0; f < floors - 1; f++) {
        const fy = top + f * (h / floors), fh = h / floors;
        row += `<path d="M${x + 6} ${fy + fh} L${x + w * 0.28} ${fy + 6} M${x + w - 6} ${fy + fh} L${x + w * 0.72} ${fy + 6}" stroke="${p.beam}" stroke-width="4"/>`;
        const cols = 2 + Math.floor(r() * 2);
        for (let c = 0; c < cols; c++) {
          const wx = x + w * (0.3 + c * (0.4 / Math.max(1, cols - 1))) - 11;
          if (cols === 2 && c === 1) row += `<rect x="${x + w * 0.62 - 11}" y="${fy + fh * 0.3}" width="22" height="${fh * 0.45}" fill="${p.win}"/>`;
          else row += `<rect x="${wx}" y="${fy + fh * 0.3}" width="22" height="${fh * 0.45}" fill="${p.win}"/>`;
        }
      }
      row += `<rect x="${x + w / 2 - 12}" y="${top - rh * 0.45}" width="24" height="26" fill="${p.win}"/>`;
      x += w; i++;
    }
    s += row;
    s += `<g transform="translate(0 ${wl * 2}) scale(1 -1)" opacity=".28">${row}</g>`;
    s += `<rect y="${wl}" width="${W}" height="${H - wl}" fill="url(#se${id})" opacity=".55"/>`;
    for (let k = 0; k < 12; k++) s += `<rect x="${r() * W}" y="${wl + 20 + r() * 220}" width="${50 + r() * 160}" height="2" fill="#FFFFFF" opacity=".25"/>`;
    s += `<rect y="${wl - 14}" width="${W}" height="16" fill="${p.wall2}"/>`;
    if (view === "fenetre") return s + frame(p);
    if (view === "piscine") {
      // barque et saules
      s += `<path d="M420 760 Q600 800 780 760 L760 780 Q600 812 440 780 Z" fill="${p.beam}"/>`;
      s += `<path d="M0 640 C80 520 160 560 200 640 Z" fill="${p.fg}"/><path d="M1050 640 C1100 500 1200 520 1200 640 Z" fill="${p.fg}"/>`;
      return s;
    }
    s += `<path d="M0 ${wl} C60 540 150 560 190 ${wl} Z" fill="${p.fg}" opacity=".9"/>`;
    return s;
  };

  // Hautes-Vosges : ballons arrondis, sapins, gîte et bain nordique
  SCENES.vosges = function (p, r, id, view) {
    let s = sky(p, id) + sun(p, id, 330, 220, 46);
    if (p === PAL.vosges.neige) for (let i = 0; i < 60; i++) s += `<circle cx="${r() * W}" cy="${r() * 360}" r="${r() * 1.6 + .4}" fill="#FFFFFF" opacity="${.3 + r() * .5}"/>`;
    s += `<path d="${ridge(r, 440, 50, 4, false)}" fill="${p.far}"/><path d="${ridge(r, 540, 50, 5, false)}" fill="${p.mid}"/>`;
    for (let i = 0; i < 40; i++) s += fir(r() * W, 540 + r() * 50, 10 + r() * 10, p.near);
    if (view === "fenetre") return s + `<path d="${ridge(r, 700, 20, 6, false)}" fill="${p.ground}"/>` + frame({ wall: p.wood, wall2: p.roof, glow: p.win });
    s += `<path d="${ridge(r, 660, 30, 6, false)}" fill="${p.near}"/>`;
    s += `<path d="${ridge(r, 740, 24, 6, false)}" fill="${p.ground}"/>`;
    if (view === "piscine") {
      s += `<rect x="0" y="770" width="${W}" height="130" fill="${p.wood}"/>`;
      s += `<ellipse cx="560" cy="800" rx="230" ry="50" fill="${p.roof}"/><ellipse cx="560" cy="792" rx="205" ry="38" fill="#6F9EB0"/>`;
      for (let i = 0; i < 10; i++) s += `<circle cx="${420 + r() * 280}" cy="${760 - r() * 120}" r="${12 + r() * 26}" fill="${p.steam}" opacity=".16"/>`;
      s += fir(120, 780, 60, p.fg) + fir(1060, 790, 66, p.fg);
      return s;
    }
    s += `<path d="M430 620 L620 500 L810 620 Z" fill="${p.roof}"/>`;
    s += `<rect x="470" y="618" width="300" height="140" fill="${p.wood}"/>`;
    s += `<rect x="500" y="648" width="120" height="80" fill="${p.win}"/><rect x="650" y="648" width="70" height="80" fill="${p.win}"/>`;
    s += `<rect x="455" y="752" width="330" height="10" fill="${p.roof}"/>`;
    s += `<ellipse cx="900" cy="760" rx="60" ry="14" fill="${p.roof}"/><ellipse cx="900" cy="756" rx="50" ry="9" fill="#6F9EB0"/>`;
    for (let i = 0; i < 6; i++) s += `<circle cx="${880 + r() * 40}" cy="${735 - r() * 60}" r="${8 + r() * 12}" fill="${p.steam}" opacity=".22"/>`;
    s += fir(150, 840, 64, p.fg) + fir(260, 860, 46, p.fg) + fir(1080, 850, 70, p.fg);
    return s;
  };

  function frame(p) {
    // encadrement de fenêtre vu de l'intérieur
    return `<path fill-rule="evenodd" d="M0 0 H${W} V${H} H0 Z M180 110 H1020 V760 H180 Z" fill="${p.wall}"/>
      <rect x="590" y="110" width="20" height="650" fill="${p.wall2}"/><rect x="180" y="420" width="840" height="14" fill="${p.wall2}"/>
      <rect x="140" y="760" width="920" height="40" fill="${p.wall2}"/>
      <rect x="0" y="800" width="${W}" height="100" fill="${p.wall2}" opacity=".6"/>
      <rect x="640" y="700" width="70" height="60" rx="6" fill="${p.wall}" opacity=".9"/>`;
  }

  let counter = 0;
  function render(el) {
    const photo = el.dataset.img && window.SK_IMG && window.SK_IMG[el.dataset.img];
    if (photo) {
      const img = document.createElement("img");
      img.src = photo; img.alt = el.getAttribute("aria-label") || ""; img.loading = "lazy"; img.decoding = "async";
      img.className = "plate-photo";
      el.removeAttribute("role"); el.insertAdjacentElement("afterbegin", img); el.classList.add("has-photo");
      return;
    }
    const type = el.dataset.plate, time = el.dataset.time || Object.keys(PAL[type] || {})[0], view = el.dataset.view || "paysage";
    if (!SCENES[type]) return;
    const p = PAL[type][time] || PAL[type][Object.keys(PAL[type])[0]];
    const id = "p" + (counter++);
    const r = rng(hash(type + time + view + (el.dataset.seed || "")));
    const label = el.getAttribute("aria-label") || "";
    el.insertAdjacentHTML("afterbegin", `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${SCENES[type](p, r, id, view)}</svg>`);
  }
  window.renderPlates = (root) => (root || document).querySelectorAll(".plate[data-plate]:not([data-done])").forEach(el => { el.dataset.done = "1"; render(el); });
  if (document.readyState !== "loading") window.renderPlates(); else document.addEventListener("DOMContentLoaded", () => window.renderPlates());
})();
