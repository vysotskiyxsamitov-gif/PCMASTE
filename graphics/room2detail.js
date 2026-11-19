/* PC МАСТЕР — room2detail.js: детализация новой комнаты (вывески, постеры, часы, растения, подушки, коробки, указатели).
   Всё строится в группе ROOM2 в тех же координатах, что и мебель из room2furn.js. Отключается вместе с новой комнатой (F8). */
(function () {
  function tex(w, h, f) { var c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); var t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t; }
  function go(g) {
    var Y = .473, M = {};
    function L(c) { return M[c] || (M[c] = new THREE.MeshLambertMaterial({ color: c })); }
    function E(c) { var k = 'e' + c; return M[k] || (M[k] = new THREE.MeshBasicMaterial({ color: c })); }
    function b(x0, y0, z0, x1, y1, z1, c, em) { var m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), em ? E(c) : L(c)); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); g.add(m); return m; }
    function cyl(x, y, z, r, h, c, seg) { var m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg || 16), L(c)); m.position.set(x, y, z); g.add(m); return m; }
    function ball(x, y, z, r, c) { var m = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), L(c)); m.position.set(x, y, z); g.add(m); return m; }
    function plane(w, h, t, x, y, z, ry, basic) { var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic === false ? new THREE.MeshLambertMaterial({ map: t }) : new THREE.MeshBasicMaterial({ map: t })); m.position.set(x, y, z); m.rotation.y = ry || 0; g.add(m); return m; }
    function frame(w, h, x, y, z, ry) { var k = Math.cos(ry || 0), s = Math.sin(ry || 0), t = .12, c = 0x2d2119;
      [[0, h / 2 + t / 2, w + t * 2, t], [0, -h / 2 - t / 2, w + t * 2, t], [-w / 2 - t / 2, 0, t, h], [w / 2 + t / 2, 0, t, h]].forEach(function (p) { var m = new THREE.Mesh(new THREE.BoxGeometry(p[2], p[3], .08), L(c)); m.position.set(x + p[0] * k, y + p[1], z - p[0] * s); m.rotation.y = ry || 0; g.add(m); }); }
    function sign(txt, sub, c1, c2, w, h) { return tex(512, Math.round(512 * h / w), function (x, W, H) { var gr = x.createLinearGradient(0, 0, W, H); gr.addColorStop(0, c1); gr.addColorStop(1, c2); x.fillStyle = gr; x.fillRect(0, 0, W, H); x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = '700 ' + Math.round(H * .34) + 'px sans-serif'; x.fillText(txt, W / 2, H * .52); if (sub) { x.font = '500 ' + Math.round(H * .16) + 'px sans-serif'; x.fillStyle = 'rgba(255,255,255,.8)'; x.fillText(sub, W / 2, H * .8); } }); }

    /* ---- ЗАЛ ---- */
    // неоновая вывеска на задней стене и рекламный щит над стендом
    var neon = tex(1024, 256, function (x, W, H) { x.fillStyle = '#0a0f16'; x.fillRect(0, 0, W, H); x.shadowColor = '#35b0ff'; x.shadowBlur = 26; x.fillStyle = '#bfe8ff'; x.font = '700 150px sans-serif'; x.textAlign = 'center'; x.fillText('PC МАСТЕР', W / 2, 175); x.strokeStyle = '#35b0ff'; x.lineWidth = 6; x.strokeRect(14, 14, W - 28, H - 28); });
    plane(7.4, 1.85, neon, 6.6, 5.0, -9.66, 0); frame(7.4, 1.85, 6.6, 5.0, -9.64, 0);
    plane(5, 1.1, sign('ИГРОВЫЕ ПК ОТ $399', 'сборка · гарантия · апгрейд', '#7c3aed', '#0e7490', 5, 1.1), .5, 5.5, 1.05, 0);
    // часы
    var clk = tex(256, 256, function (x, W, H) { x.fillStyle = '#f4f1ea'; x.beginPath(); x.arc(128, 128, 120, 0, 7); x.fill(); x.strokeStyle = '#222'; x.lineWidth = 8; x.stroke(); x.lineWidth = 4; for (var i = 0; i < 12; i++) { var a = i / 12 * 6.283; x.beginPath(); x.moveTo(128 + Math.sin(a) * 100, 128 - Math.cos(a) * 100); x.lineTo(128 + Math.sin(a) * 112, 128 - Math.cos(a) * 112); x.stroke(); } x.lineWidth = 9; x.beginPath(); x.moveTo(128, 128); x.lineTo(128, 60); x.stroke(); x.lineWidth = 6; x.beginPath(); x.moveTo(128, 128); x.lineTo(180, 150); x.stroke(); });
    var cm = plane(1.1, 1.1, clk, -2.0, 5.0, -9.66, 0); cm.geometry = new THREE.CircleGeometry(.55, 32);
    // постеры на правой стене зала
    [['ВИДЕОКАРТЫ', 'RTX · RX', '#15324f', '#1d6fb0', -8.4], ['ПРОЦЕССОРЫ', 'Core · Ryzen', '#3a1d4f', '#7a3fb0', 3.4], ['СБОРКА НА ЗАКАЗ', 'любой бюджет', '#4f2a1d', '#b0642a', -1.0]].forEach(function (p) {
      var t = sign(p[0], p[1], p[2], p[3], 2.4, 3.2); t.repeat.set(1, 1); plane(2.4, 3.2, t, 13.0, 3.7, p[4], -Math.PI / 2); frame(2.4, 3.2, 13.0, 3.7, p[4], -Math.PI / 2);
    });
    // картины слева и зеркало
    var art = tex(256, 192, function (x, W, H) { x.fillStyle = '#10243a'; x.fillRect(0, 0, W, H); for (var i = 0; i < 9; i++) { x.fillStyle = 'hsl(' + (190 + i * 14) + ',70%,' + (35 + i * 4) + '%)'; x.fillRect(i * 28 + 6, H - 30 - i * 14, 22, 30 + i * 14); } });
    plane(3.2, 2.4, art, -12.8, 4.2, 4.0, Math.PI / 2); frame(3.2, 2.4, -12.8, 4.2, 4.0, Math.PI / 2);
    // коврик у входа
    var mat = tex(256, 128, function (x, W, H) { x.fillStyle = '#2a2f3a'; x.fillRect(0, 0, W, H); x.strokeStyle = '#d6b36a'; x.lineWidth = 6; x.strokeRect(8, 8, W - 16, H - 16); x.fillStyle = '#e5e7eb'; x.font = '700 28px sans-serif'; x.textAlign = 'center'; x.fillText('ДОБРО ПОЖАЛОВАТЬ', W / 2, 72); });
    var mm = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.8), new THREE.MeshLambertMaterial({ map: mat })); mm.rotation.x = -Math.PI / 2; mm.position.set(-10.3, Y + .03, 6.2); g.add(mm);
    // подушки на диванах и растения
    [[-11.6, -8.9], [-10.4, -8.9], [-9.4, -8.9]].forEach(function (p, i) { b(p[0] - .35, Y + .9, p[1] - .3, p[0] + .35, Y + 1.5, p[1] + .1, [0xd9a441, 0xc65d5d, 0x6a9fb0][i]); });
    [[-12.0, -7.2], [-12.0, -5.2]].forEach(function (p, i) { b(p[0] - .1, Y + .9, p[1] - .35, p[0] + .35, Y + 1.5, p[1] + .35, [0xd9a441, 0x8fb06a][i]); });
    function plant(x, z, s) { cyl(x, Y + .6 * s, z, .42 * s, 1.2 * s, 0xd8d3c8); for (var i = 0; i < 9; i++) { var a = i * 2.4; ball(x + Math.cos(a) * .35 * s, Y + (1.5 + (i % 4) * .35) * s, z + Math.sin(a) * .35 * s, .38 * s, [0x2f7d3a, 0x3f9a48, 0x276a30][i % 3]); } }
    plant(-2.7, -9.1, 1); plant(-2.9, 6.3, 1); plant(12.2, 6.8, 1.1); plant(-12.2, 7.0, 1);
    // указатель «ВЫХОД», огнетушитель, информационная доска
    plane(1.4, .5, sign('ВЫХОД', '', '#0b6b2e', '#14a34a', 1.4, .5), -10.3, 5.9, 8.0 - .25, Math.PI);
    cyl(12.7, Y + .6, -12.4, .22, 1.2, 0xc0302a); b(12.6, Y + 1.2, -12.5, 12.8, Y + 1.5, -12.3, 0x222222);
    plane(2.0, 2.6, sign('ПРАЙС', 'сборки от $399', '#1c2430', '#2c3a4c', 2.0, 2.6), 13.0, 3.5, -10.6, -Math.PI / 2);
    // жалюзи на среднем окне (верхняя треть)
    for (var i = 0; i < 6; i++) b(1.5, 4.55 + i * .08, 7.55, 7.5, 4.6 + i * .08, 7.6, 0xe8e4da);

    /* ---- КОРИДОР ---- */
    var rn = tex(256, 512, function (x, W, H) { x.fillStyle = '#5b2a2a'; x.fillRect(0, 0, W, H); x.strokeStyle = '#d6b36a'; x.lineWidth = 6; x.strokeRect(10, 10, W - 20, H - 20); for (var i = 0; i < 400; i++) { x.fillStyle = 'rgba(255,255,255,.05)'; x.fillRect(Math.random() * W, Math.random() * H, 2, 6); } });
    var rg = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 8.5), new THREE.MeshLambertMaterial({ map: rn })); rg.rotation.x = -Math.PI / 2; rg.rotation.z = Math.PI / 2; rg.position.set(-5.5, Y + .03, -14.2); g.add(rg);
    plane(2.2, .8, sign('ГОТОВЫЕ ПК', 'выдача заказов', '#0b2a5a', '#1d4ed8', 2.2, .8), -5.5, 3.3, -12.78, 0);

    /* ---- СКЛАД ---- */
    // паллеты с картонными коробками (скотч), лестница, табличка с номерами
    function crate(x, z, n) { b(x - .8, Y, z - .6, x + .8, Y + .18, z + .6, 0x8a6a45); for (var i = 0; i < n; i++) { var h = .55 + (i % 2) * .12; b(x - .75, Y + .18 + i * .62, z - .55, x + .75, Y + .18 + i * .62 + h, z + .55, i % 2 ? 0xc29a62 : 0xb58a52); b(x - .08, Y + .18 + i * .62 + h - .02, z - .55, x + .08, Y + .18 + i * .62 + h + .005, z + .55, 0xd8c9a0); } }
    crate(-9.5, -22.0, 3); crate(-0.2, -19.2, 2); crate(-4.0, -30.6, 3);
    for (var i = 0; i < 9; i++) b(-1.35 + 0, Y + .3 + i * .5, -31.0, -1.2, Y + .34 + i * .5, -30.5, 0x888888);                       // ступени лестницы
    b(-1.4, Y, -31.05, -1.28, Y + 4.6, -30.95, 0x9a9a9a); b(-1.4, Y, -30.55, -1.28, Y + 4.6, -30.45, 0x9a9a9a);
    plane(3.0, .8, sign('СКЛАД', 'комплектующие', '#7a4a10', '#b8741a', 3.0, .8), -6.0, 5.6, -32.1 + .1, 0);
    // линия «не заходить» у стеллажей
    b(-2.0, Y + .005, -18.9, 1.5, Y + .02, -18.8, 0xe0c000);

    /* ---- МАСТЕРСКАЯ ---- */
    var scr = tex(256, 160, function (x, W, H) { x.fillStyle = '#04141f'; x.fillRect(0, 0, W, H); x.fillStyle = '#35e0ff'; x.font = '14px monospace'; ['POST ... OK', 'CPU 3.6GHz  58C', 'RAM 16GB   OK', 'GPU  --  FAIL?', 'SMART: PASS', '> _'].forEach(function (t, i) { x.fillText(t, 12, 24 + i * 22); }); });
    plane(1.1, .7, scr, 8.2, 2.45, -30.45, 0);
    plane(3.0, .8, sign('МАСТЕРСКАЯ', 'сборка · ремонт', '#10405a', '#1d7aa8', 3.0, .8), 8.0, 5.6, -32.0 + .12, 0);
    // розетки/удлинитель и провода
    b(5.2, 1.66, -30.4, 7.2, 1.72, -30.28, 0x1b1e23); for (var j = 0; j < 4; j++) b(5.4 + j * .45, 1.72, -30.37, 5.5 + j * .45, 1.76, -30.3, 0xe8e8e8);
    return true;
  }
  var n = 0, iv = setInterval(function () {
    try { if (typeof THREE !== 'undefined' && window.__room2 && !window.__room2.userData.__detail) { window.__room2.userData.__detail = 1; clearInterval(iv); go(window.__room2); } } catch (e) { clearInterval(iv); console.error('[room2detail]', e); }
    if (++n > 400) clearInterval(iv);
  }, 500);
})();
