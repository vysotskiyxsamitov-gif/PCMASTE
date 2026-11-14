/* PC МАСТЕР — shell.js: новая «оболочка» магазина (после windows.js).
   Стены: деревянные панели, плинтус, молдинг, обои с ромбовидным узором, карниз; передняя стена с окнами получает ТОТ ЖЕ материал.
   Пол: «плетёнка» из досок + тёмная плитка по периметру с латунной вставкой. Потолок: рамы светильников.
   Форма: задние углы скошены диагональными стенами с подсвеченными нишами, по периметру — парящий карниз с тёплой подсветкой.
   Границы ходьбы и расстановка мебели не меняются (скос и карниз находятся вне зоны, куда можно зайти). */
(function () {
  if (window.__shellLoaded) return; window.__shellLoaded = 1;
  var PI = Math.PI;
  function ready() { try { return typeof THREE !== 'undefined' && !!scene && !!window.__windowsBuilt && typeof ct == 'function'; } catch (e) { return false; } }

  function wallFn(x, W, H) {
    var P = 128, Y = function (m) { return H - m * P; };
    var g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#34405d'); g.addColorStop(.7, '#3f4f77'); g.addColorStop(1, '#46577f'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    /* обои: ромбовидная сетка */
    x.save(); x.beginPath(); x.rect(0, Y(6.9), W, Y(1.32) - Y(6.9)); x.clip();
    x.strokeStyle = 'rgba(255,255,255,.075)'; x.lineWidth = 2;
    for (var k = -24; k < 30; k++) { x.beginPath(); x.moveTo(k * 64, 0); x.lineTo(k * 64 + H, H); x.stroke(); x.beginPath(); x.moveTo(k * 64 + H, 0); x.lineTo(k * 64, H); x.stroke(); }
    x.fillStyle = 'rgba(255,255,255,.06)';
    for (var i = 0; i <= 8; i++) for (var j = 0; j <= 22; j++) if ((i + j) % 2 == 0) { x.beginPath(); x.arc(i * 64, Y(1.32) - j * 64 + 32, 4, 0, 6.283); x.fill(); }
    x.restore();
    noise(x, W, H, 1600, .045);
    /* карниз и багет */
    x.fillStyle = '#d8cfbe'; x.fillRect(0, Y(7.7), W, Y(7.0) - Y(7.7));
    x.fillStyle = 'rgba(0,0,0,.16)'; x.fillRect(0, Y(7.5), W, 3); x.fillRect(0, Y(7.3), W, 3); x.fillStyle = 'rgba(0,0,0,.28)'; x.fillRect(0, Y(7.0) - 6, W, 6);
    x.fillStyle = '#cbbfa8'; x.fillRect(0, Y(6.98), W, 10); x.fillStyle = 'rgba(255,255,255,.45)'; x.fillRect(0, Y(6.98), W, 2);
    x.fillStyle = 'rgba(34,211,238,.6)'; x.fillRect(0, Y(6.55), W, 4);   // тонкая неоновая линия
    x.fillStyle = '#c9c1b0'; x.fillRect(0, 0, W, Y(7.7));
    /* деревянные панели */
    var wy = Y(1.2);
    x.fillStyle = '#4a2f1e'; x.fillRect(0, wy, W, H - wy);
    for (var p = 0; p < 4; p++) {
      var px = p * 128 + 10, py = wy + 22, pw = 108, ph = 1.2 * P - 22 - 30;
      x.fillStyle = '#5f3c26'; x.fillRect(px, py, pw, ph);
      x.fillStyle = '#6d4630'; x.fillRect(px + 12, py + 12, pw - 24, ph - 24);
      x.strokeStyle = 'rgba(255,225,180,.28)'; x.lineWidth = 2; x.beginPath(); x.moveTo(px, py + ph); x.lineTo(px, py); x.lineTo(px + pw, py); x.stroke();
      x.strokeStyle = 'rgba(0,0,0,.4)'; x.beginPath(); x.moveTo(px + pw, py); x.lineTo(px + pw, py + ph); x.lineTo(px, py + ph); x.stroke();
      x.strokeStyle = 'rgba(0,0,0,.35)'; x.strokeRect(px + 12, py + 12, pw - 24, ph - 24);
      for (var q = 0; q < 16; q++) { var gx = px + 8 + Math.random() * (pw - 16); x.strokeStyle = 'rgba(35,18,8,' + (.1 + Math.random() * .18).toFixed(2) + ')'; x.lineWidth = 1; x.beginPath(); x.moveTo(gx, py + 4); x.lineTo(gx + (Math.random() - .5) * 6, py + ph - 4); x.stroke(); }
    }
    x.fillStyle = '#8b5e3c'; x.fillRect(0, Y(1.32), W, Y(1.2) - Y(1.32));
    x.fillStyle = 'rgba(255,235,200,.55)'; x.fillRect(0, Y(1.32), W, 2); x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(0, Y(1.2) - 3, W, 3);
    x.fillStyle = '#231610'; x.fillRect(0, H - .18 * P, W, .18 * P); x.fillStyle = '#8a5a38'; x.fillRect(0, H - .18 * P, W, 2);
  }
  function floorFn(x, W, H) {
    var B = 96, s = 32;
    for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) {
      var hor = (i + j) % 2 == 0, bx = i * B, by = j * B;
      for (var k = 0; k < 3; k++) {
        var l = 33 + Math.random() * 12, h = 24 + Math.random() * 6;
        x.fillStyle = 'hsl(' + h + ',' + (40 + Math.random() * 10) + '%,' + l + '%)';
        var rx = hor ? bx : bx + k * s, ry = hor ? by + k * s : by, rw = hor ? B : s, rh = hor ? s : B;
        x.fillRect(rx + 1, ry + 1, rw - 2, rh - 2);
        x.strokeStyle = 'rgba(255,225,180,.18)'; x.lineWidth = 1; x.beginPath(); x.moveTo(rx + 1, ry + rh - 1); x.lineTo(rx + 1, ry + 1); x.lineTo(rx + rw - 1, ry + 1); x.stroke();
        for (var g = 0; g < 4; g++) { x.strokeStyle = 'rgba(40,20,8,' + (Math.random() * .2).toFixed(2) + ')'; x.beginPath(); if (hor) { var gy = ry + 4 + Math.random() * (rh - 8); x.moveTo(rx + 3, gy); x.lineTo(rx + rw - 3, gy); } else { var gx = rx + 4 + Math.random() * (rw - 8); x.moveTo(gx, ry + 3); x.lineTo(gx, ry + rh - 3); } x.stroke(); }
      }
    }
    x.fillStyle = 'rgba(20,10,4,.35)'; for (var a = 0; a <= 4; a++) { x.fillRect(a * B - 1, 0, 2, H); x.fillRect(0, a * B - 1, W, 2); }
  }
  function tileFn(x, W, H) {
    for (var i = 0; i < 8; i++) for (var j = 0; j < 8; j++) { x.fillStyle = (i + j) % 2 ? '#1c2130' : '#272d40'; x.fillRect(i * 32, j * 32, 32, 32); }
    x.strokeStyle = 'rgba(255,255,255,.07)'; x.lineWidth = 1; for (var k = 0; k <= 8; k++) { x.beginPath(); x.moveTo(k * 32, 0); x.lineTo(k * 32, H); x.stroke(); x.beginPath(); x.moveTo(0, k * 32); x.lineTo(W, k * 32); x.stroke(); }
  }
  function nicheFn(x, W, H) {
    x.fillStyle = '#0d1220'; x.fillRect(0, 0, W, H);
    var g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(34,211,238,.35)'); g.addColorStop(1, 'rgba(168,85,247,.25)'); x.fillStyle = g; x.fillRect(10, 10, W - 20, H - 20);
    x.strokeStyle = '#22d3ee'; x.lineWidth = 5; x.strokeRect(8, 8, W - 16, H - 16);
    x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = 3; for (var i = 1; i < 4; i++) { x.beginPath(); x.moveTo(20, i * H / 4); x.lineTo(W - 20, i * H / 4); x.stroke(); }
    x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = '800 40px system-ui,Segoe UI,sans-serif'; x.fillText('PC МАСТЕР', W / 2, 62);
    x.font = '600 24px system-ui,Segoe UI,sans-serif'; x.fillStyle = '#a5f3fc'; x.fillText('сервис · гарантия', W / 2, H - 38);
  }

  function go() {
    /* ----- стены ----- */
    var base = ct(512, 1280, wallFn, 1, 1);
    function mk(rx, ry, ox, oy) { var t = base.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.offset.set(ox || 0, oy || 0); return t; }
    scene.children.forEach(function (o) {
      var g = o.geometry; if (!g || g.type != 'PlaneGeometry' || !o.material) return; var p = g.parameters;
      if (p.height == 10 && o.position.y > 4 && o.position.y < 6) { o.material.map = mk(p.width / 4, 1); o.material.color.setHex(0xffffff); o.material.roughness = .85; o.material.needsUpdate = true; }
    });
    var fw = window.__frontWall;
    if (fw) {
      if (fw.L) { fw.L.map = mk(8.5 / 4, 1); fw.L.needsUpdate = true; }
      if (fw.R) { fw.R.map = mk(8.5 / 4, 1); fw.R.needsUpdate = true; }
      if (fw.T) { fw.T.map = mk(3 / 4, .48, 0, .52); fw.T.needsUpdate = true; }
    }
    /* ----- пол ----- */
    var floor = null; scene.children.forEach(function (o) { var g = o.geometry; if (g && g.type == 'PlaneGeometry' && g.parameters.width == 20 && g.parameters.height == 16 && o.position.y < 1) floor = o; });
    if (floor) { floor.material.map = ct(384, 384, floorFn, 8, 6.4); floor.material.color.setHex(0xffffff); floor.material.needsUpdate = true; }
    var tm = new THREE.MeshStandardMaterial({ map: ct(256, 256, tileFn, 1, 1), roughness: .35, metalness: .1 }), br = new THREE.MeshStandardMaterial({ color: 0xc9a24a, metalness: .85, roughness: .3 });
    function strip(w, d, x, z, tx, tz) { var t = tm.clone(); t.map = tm.map.clone(); t.map.needsUpdate = true; t.map.repeat.set(tx, tz); var m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), t); m.rotation.x = -PI / 2; m.position.set(x, .012, z); m.receiveShadow = true; scene.add(m); }
    function line(w, d, x, z) { var m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), br); m.rotation.x = -PI / 2; m.position.set(x, .014, z); scene.add(m); }
    strip(20, 1.0, 0, -7.5, 10, .5); strip(1.0, 15, -9.5, .5, .5, 7.5); strip(1.0, 15, 9.5, .5, .5, 7.5);
    line(18.0, .05, 0, -6.95); line(.05, 14.0, -8.95, .0); line(.05, 14.0, 8.95, .0);
    /* ----- потолок: рамы светильников ----- */
    var sh = new THREE.Shape(); sh.moveTo(-1, -1); sh.lineTo(1, -1); sh.lineTo(1, 1); sh.lineTo(-1, 1); sh.closePath();
    var hole = new THREE.Path(); hole.moveTo(-.86, -.86); hole.lineTo(-.86, .86); hole.lineTo(.86, .86); hole.lineTo(.86, -.86); hole.closePath(); sh.holes.push(hole);
    var fg = new THREE.ShapeGeometry(sh), fm = new THREE.MeshStandardMaterial({ color: 0x2a2f3c, metalness: .7, roughness: .4 });
    [-6, -2, 2, 6].forEach(function (px) { [-4, 0, 4].forEach(function (pz) { var f = new THREE.Mesh(fg, fm); f.rotation.x = PI / 2; f.position.set(px, 7.765, pz); scene.add(f); }); });
    /* ----- парящий карниз с подсветкой (сзади и по бокам; спереди — окна) ----- */
    var cream = new THREE.MeshStandardMaterial({ color: 0xd8cfbe, roughness: .8 }), glow = new THREE.MeshBasicMaterial({ color: 0xffd9a0 });
    function box(w, h, d, x, y, z, mat) { var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); scene.add(m); return m; }
    box(20, .3, .55, 0, 7.64, -7.72, cream); box(.55, .3, 16, -9.72, 7.64, 0, cream); box(.55, .3, 16, 9.72, 7.64, 0, cream);
    box(18.8, .03, .14, 0, 7.48, -7.5, glow); box(.14, .03, 15, -9.5, 7.48, 0, glow); box(.14, .03, 15, 9.5, 7.48, 0, glow);
    /* ----- скошенные задние углы ----- */
    var wm = new THREE.MeshStandardMaterial({ map: mk(2.83 / 4, 1), roughness: .85 });
    [[-9, -7, PI / 4], [9, -7, -PI / 4]].forEach(function (c, i) {
      var w = new THREE.Mesh(new THREE.BoxGeometry(2.83, 7.8, .22), wm); w.position.set(c[0], 3.9, c[1]); w.rotation.y = c[2]; w.receiveShadow = true; scene.add(w);
      var d = (i ? -1 : 1);   // внутренняя сторона: нормаль смотрит в комнату
      var nx = i ? -.7071 : .7071, nz = .7071;
      var nt = new THREE.MeshBasicMaterial({ map: ct(256, 512, nicheFn, 1, 1) });
      var niche = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 3.2), nt); niche.position.set(c[0] + nx * .125, 2.5, c[1] + nz * .125); niche.rotation.y = c[2] + PI + (i ? 0 : 0); niche.rotation.y = Math.atan2(nx, nz); scene.add(niche);
      box(.08, 3.4, .08, c[0] + nx * .13 - Math.cos(c[2]) * .85 * 0, 2.5, c[1] + nz * .13, glow).visible = false;
    });
    console.log('[shell] готово');
  }
  var n = 0, iv = setInterval(function () { if (ready()) { clearInterval(iv); setTimeout(function () { try { go(); } catch (e) { console.warn('[shell]', e); } }, 800); } else if (++n > 600) clearInterval(iv); }, 100);
})();
