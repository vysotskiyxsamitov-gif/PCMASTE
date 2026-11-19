/* PC МАСТЕР — windows.js (после world.js, street.js, Room.js)
   Большие настоящие окна на всю ширину стены: сквозь них видна живая 3D-улица (погода, день/ночь, машины, люди).
   Дверь тоже открыта на улицу. Старые «нарисованные» окна и фон за дверью убираются. */
(function () {
  if (window.__windowsLoaded) return; window.__windowsLoaded = 1;
  function ready() { try { return typeof THREE !== 'undefined' && !!scene && !!window.__roomLoaded && !!window.__worldLoaded; } catch (e) { return false; } }

  function go() {
    var Z = 8, kids = scene.children.slice(), left = null, right = null, top = null;
    function par(o) { return (o.geometry && o.geometry.parameters) || {}; }
    kids.forEach(function (o) {
      var p = par(o), pos = o.position;
      if (o.geometry && o.geometry.type == 'PlaneGeometry') {
        if (Math.abs(pos.z - Z) < .01 && p.width == 8.5 && p.height == 10) { if (pos.x < 0) left = o; else right = o; }
        else if (Math.abs(pos.z - Z) < .01 && p.width == 3 && p.height == 4.8) top = o;
        else if (p.width == 5 && p.height == 4 && Math.abs(pos.z - 7.84) < .02) o.visible = false;      // нарисованное окно
        else if (p.width == 8 && p.height == 7 && Math.abs(pos.z - 9.8) < .05) o.visible = false;        // оранжевый фон за дверью
        else if (p.width == 16 && p.height == 7 && Math.abs(pos.z - 11.5) < .05) o.visible = false;     // серый «пол» снаружи
      } else if (o.type == 'Group' && Math.abs(pos.y - 5) < .01 && Math.abs(pos.z - 7.8) < .02 && Math.abs(Math.abs(pos.x) - 6) < .01) o.visible = false; // окна street.js
    });
    if (!left || !right) { console.warn('[windows] стена не найдена'); return; }

    function wallMat(src) { var m = src.material.clone(); m.side = THREE.DoubleSide; return m; }
    var mL = wallMat(left), mR = wallMat(right), mT = top ? wallMat(top) : mL;
    function quad(x0, x1, y0, y1, mat, uf, vf) {
      var g = new THREE.BufferGeometry(), P = [x0, y0, Z, x1, y0, Z, x1, y1, Z, x0, y1, Z], U = [];
      [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].forEach(function (c) { U.push(uf(c[0]), vf(c[1])); });
      g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute([0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1], 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.setIndex([0, 1, 2, 0, 2, 3]);
      var m = new THREE.Mesh(g, mat); m.receiveShadow = true; scene.add(m); return m;
    }
    var uL = function (x) { return (-1.5 - x) / 8.5; }, uR = function (x) { return (10 - x) / 8.5; }, vW = function (y) { return y / 10; };
    var WY0 = 1.5, WY1 = 5.8, WX0 = 3, WX1 = 9;                       // окно: x 3…9 (с обеих сторон), y 1.5…5.8
    // левая часть стены (x −10…−1.5) и правая (1.5…10)
    [[-10, -1.5, mL, uL, -1], [1.5, 10, mR, uR, 1]].forEach(function (s) {
      var a = s[0], b = s[1], m = s[2], u = s[3], sg = s[4];
      var w0 = sg < 0 ? -WX1 : WX0, w1 = sg < 0 ? -WX0 : WX1;
      quad(a, w0, 0, 10, m, u, vW); quad(w1, b, 0, 10, m, u, vW);        // боковые простенки
      quad(w0, w1, 0, WY0, m, u, vW); quad(w0, w1, WY1, 10, m, u, vW);   // под и над окном
    });
    if (top) quad(-1.5, 1.5, 5.2, 10, mT, function (x) { return (1.5 - x) / 3; }, function (y) { return (y - 5.2) / 4.8; });
    left.visible = right.visible = false; if (top) top.visible = false;

    // стекло, рамы, переплёты
    var FR = new THREE.MeshStandardMaterial({ color: 0x2a2f3a, roughness: .5, metalness: .3 });
    var GL = new THREE.MeshBasicMaterial({ color: 0xbfe6ff, transparent: true, opacity: .07, depthWrite: false, side: THREE.DoubleSide });
    function fb(w, h, d, x, y, z) { var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), FR); m.position.set(x, y, z); m.castShadow = true; scene.add(m); }
    [-6, 6].forEach(function (cx) {
      var W = WX1 - WX0, H = WY1 - WY0, cy = (WY0 + WY1) / 2, g = new THREE.Mesh(new THREE.PlaneGeometry(W, H), GL); g.position.set(cx, cy, Z - .02); g.renderOrder = 5; scene.add(g);
      fb(W + .3, .18, .3, cx, WY1 + .05, Z - .1); fb(W + .3, .18, .3, cx, WY0 - .05, Z - .1);
      fb(.18, H + .3, .3, cx - W / 2 - .05, cy, Z - .1); fb(.18, H + .3, .3, cx + W / 2 + .05, cy, Z - .1);
      fb(.1, H, .14, cx, cy, Z - .08); fb(W, .09, .14, cx, cy + .5, Z - .08);
      fb(W + .6, .14, .5, cx, WY0 - .12, Z - .3);                               // подоконник
    });
    // оформление стены: вывеска над окнами, плакаты на простенках, неоновые полосы по краям (раньше это были гладкие панели)
    try {
      function dPlane(w, h, x, y, tex, rough) { var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: rough || .8, metalness: .05 })); m.position.set(x, y, Z - .035); m.rotation.y = Math.PI; m.receiveShadow = true; scene.add(m); return m; }
      function rr(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
      var band = ['СБОРКА ПК НА ЗАКАЗ', 'РЕМОНТ · АПГРЕЙД · ГАРАНТИЯ'];
      [-6, 6].forEach(function (cx, bi) {
        var t = ct(1024, 320, function (x, W, H) {
          x.fillStyle = '#161b2a'; x.fillRect(0, 0, W, H);
          for (var i = 0; i < 14; i++) { x.fillStyle = i % 2 ? '#1c2336' : '#141a29'; x.fillRect(0, i * 24 + 4, W, 22); }
          x.strokeStyle = '#22d3ee'; x.lineWidth = 6; rr(x, 22, 22, W - 44, H - 44, 26); x.stroke();
          x.shadowColor = '#22d3ee'; x.shadowBlur = 24; x.fillStyle = '#e9fbff'; x.font = '800 78px system-ui,Segoe UI,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
          x.fillText(band[bi], W / 2, H / 2 - 12); x.shadowBlur = 0; x.fillStyle = '#a855f7'; x.fillRect(W / 2 - 180, H - 82, 360, 6);
        }, 1, 1);
        dPlane(5.6, 1.75, cx, 6.7, t, .55);
      });
      var posters = [[['ХИТ', 'ПРОДАЖ'], '#f97316', 'сборки от $399'], [['RAM', 'DDR5'], '#22d3ee', 'в наличии'], [['SSD', 'NVMe'], '#a855f7', 'скорость x10'], [['БЛОК', 'ПИТАНИЯ'], '#22c55e', 'от 450 Вт']];
      [[-2.25, 0], [2.25, 1]].forEach(function (c) {
        for (var k = 0; k < 2; k++) (function (pdef, kk) {
          var t = ct(256, 340, function (x, W, H) {
            x.fillStyle = '#10141f'; x.fillRect(0, 0, W, H); x.fillStyle = pdef[1]; x.fillRect(0, 0, W, 14);
            x.strokeStyle = 'rgba(255,255,255,.25)'; x.lineWidth = 3; x.strokeRect(10, 24, W - 20, H - 34);
            x.fillStyle = pdef[1]; x.globalAlpha = .18; x.beginPath(); x.arc(W / 2, 140, 78, 0, 6.283); x.fill(); x.globalAlpha = 1;
            x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = '800 46px system-ui,Segoe UI,sans-serif'; x.fillText(pdef[0][0], W / 2, 120); x.fillText(pdef[0][1], W / 2, 172);
            x.font = '600 22px system-ui,Segoe UI,sans-serif'; x.fillStyle = pdef[1]; x.fillText(pdef[2], W / 2, 290);
          }, 1, 1);
          /* постеры убраны */
        })(posters[c[1] * 2 + k], k);
      });
      var nm = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
      [-9.5, 9.5].forEach(function (cx) { var n = new THREE.Mesh(new THREE.BoxGeometry(.07, 5.6, .05), nm); n.position.set(cx, 3.9, Z - .045); scene.add(n); });
      var ft2 = ct(128, 128, function (x, W, H) { x.fillStyle = '#1b2236'; x.fillRect(0, 0, W, H); x.strokeStyle = 'rgba(255,255,255,.12)'; x.lineWidth = 2; x.strokeRect(10, 10, W - 20, H - 20); }, 1, 4);
      [-9.5, 9.5].forEach(function (cx) { dPlane(.8, 4.3, cx + (cx < 0 ? .0 : .0), 3.65, ft2, .85).position.z = Z - .03; });
    } catch (e) { console.warn('[windows] оформление стены', e); }
    // дверь: тоньше рамы, стекло ещё прозрачнее
    try { [doorL, doorR].forEach(function (d) { d.material.opacity = .14; }); } catch (e) { }
    console.log('[windows] готово');
  }

  var n = 0, iv = setInterval(function () { if (ready()) { clearInterval(iv); setTimeout(go, 2500); } else if (++n > 400) clearInterval(iv); }, 100);
})();
