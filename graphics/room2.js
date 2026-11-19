/* Новая планировка (из Blender-модели пользователя, масштаб ×2.6). Включена по умолчанию; F8 — вернуть старую комнату/снова включить. */
(function () {
  var ON = true; try { ON = localStorage.getItem('pcroom2') !== '0'; } catch (e) { }
  addEventListener('keydown', function (e) { if (e.code === 'F8') { try { localStorage.setItem('pcroom2', ON ? '0' : '1'); } catch (x) { } location.reload(); } });
  var EMPTY = false; try { EMPTY = localStorage.getItem('pcr2empty') === '1'; } catch (e) { }
  window.__r2empty = EMPTY;
  addEventListener('keydown', function (e) { if (e.code === 'F9') { try { localStorage.setItem('pcr2empty', EMPTY ? '0' : '1'); } catch (x) { } location.reload(); } });
  if (!ON) return;
  window.__r2on = true;
  var B = [["Cube",-13.088,0,-32.908,13.101,.473,8.221],["Cube.001",-13.11,.473,-32.678,-12.85,6.497,7.989],["Cube.002",13.074,.473,-32.332,13.335,6.497,8.419],["Cube.003",-12.807,.473,-32.933,13.09,6.485,-32.117],["Cube.004",-7.77,-.19,7.708,-5.731,6.63,8.406],["Cube.005",-5.694,.317,7.733,13.232,2.119,8.339],["Cube.006",-13.198,5.007,7.796,-7.77,6.612,8.353],["Cube.007",-5.731,5.076,7.793,13.236,6.542,8.423],["Cube.008",.26,2.119,7.615,1.416,5.241,8.224],["Cube.009",7.603,2.119,7.746,8.833,5.084,8.451],["Cube.010",-12.817,.473,-10.744,8.159,6.203,-9.816],["Cube.011",-12.71,.473,-17.014,-9.36,6.029,-16.729],["Cube.012",-6.609,.473,-17.005,9.115,5.668,-16.62],["Cube.013",12.289,.473,-17.138,13.187,6.13,-16.518],["Cube.014",2.146,.473,-32.538,3.2,5.629,-16.833],["Cube.015",-14.284,5.81,-17.088,13.983,6.386,-16.581],["Cube.016",8.159,5.366,-10.717,13.386,6.195,-9.883]];
  function cv(w, h, f) { var c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t; }
  function nz(g,w,h,n,a){for(var i=0;i<n;i++){g.fillStyle='rgba('+(Math.random()<.5?'255,255,255':'0,0,0')+','+Math.random()*a+')';g.fillRect(Math.random()*w,Math.random()*h,2,2);}}
  var wallT = cv(512, 512, function (g, w, h) {
    g.fillStyle = '#d8d1c2'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 2600; i++) { g.fillStyle = 'rgba(' + (Math.random() < .5 ? '255,255,255' : '90,70,40') + ',' + Math.random() * .035 + ')'; g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 1 + Math.random() * 40); }
    var wy = h * .78;                                                       // панели у пола: нижние ~1.4 ед. стены
    var gr = g.createLinearGradient(0, wy, 0, h); gr.addColorStop(0, '#6a4e3a'); gr.addColorStop(1, '#4f3a2b'); g.fillStyle = gr; g.fillRect(0, wy, w, h - wy);
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 3; for (var k = 0; k < 4; k++) { var x0 = k * 128 + 14; g.strokeRect(x0, wy + 16, 100, h - wy - 44); }
    g.strokeStyle = 'rgba(255,230,190,.18)'; g.lineWidth = 2; for (var k2 = 0; k2 < 4; k2++) g.strokeRect(k2 * 128 + 17, wy + 19, 94, h - wy - 50);
    g.fillStyle = '#8a6a4f'; g.fillRect(0, wy - 8, w, 10); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(0, wy - 8, w, 2);     // поручень
    g.fillStyle = '#2d2119'; g.fillRect(0, h - 22, w, 22);                                                              // плинтус
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, 0, w, 10);                                                           // тень у потолка
  });
  var floorT = cv(512, 512, function (g, w, h) {
    var n = 4, t = w / n;
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
      var v = 138 + ((x + y) & 1) * 10 + Math.random() * 10;
      var gr = g.createLinearGradient(x * t, y * t, (x + 1) * t, (y + 1) * t); gr.addColorStop(0, 'rgb(' + (v + 8) + ',' + (v - 4) + ',' + (v - 22) + ')'); gr.addColorStop(1, 'rgb(' + (v - 8) + ',' + (v - 18) + ',' + (v - 38) + ')');
      g.fillStyle = gr; g.fillRect(x * t + 2, y * t + 2, t - 4, t - 4);
      for (var i = 0; i < 60; i++) { g.fillStyle = 'rgba(' + (Math.random() < .5 ? '255,255,255' : '0,0,0') + ',' + Math.random() * .05 + ')'; g.fillRect(x * t + Math.random() * t, y * t + Math.random() * t, 2 + Math.random() * 14, 1); }
    }
    g.fillStyle = 'rgba(40,30,22,.85)'; for (var q = 0; q <= n; q++) { g.fillRect(q * t - 2, 0, 4, h); g.fillRect(0, q * t - 2, w, 4); }
  });
  var ceilT = cv(128, 128, function (g, w, h) { g.fillStyle = '#e8e6e0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#bbb'; g.strokeRect(0, 0, w, h); });
  wallT.repeat.set(1, 1); floorT.repeat.set(1, 1); ceilT.repeat.set(1, 1);
  var mWall = new THREE.MeshLambertMaterial({ map: wallT }), mFloor = new THREE.MeshLambertMaterial({ map: floorT }), mCeil = new THREE.MeshBasicMaterial({ map: ceilT }), mTrim = new THREE.MeshLambertMaterial({ color: 0x3a2d24 });
  var grp = new THREE.Group(); grp.name = 'ROOM2'; grp.userData.keep = 1; grp.userData.__r2 = 1;   // keep: batch.js не склеивает комнату (из-за склейки стены пропадали)
  var solid = [];
  function box(b, mat, tile) {
    var w = b[4] - b[1], h = b[5] - b[2], d = b[6] - b[3];
    var g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv, pos = g.attributes.position;
    for (var i = 0; i < uv.count; i++) { var n = g.attributes.normal; var nx = Math.abs(n.getX(i)), ny = Math.abs(n.getY(i)); var x = pos.getX(i) + (b[1] + b[4]) / 2, y = pos.getY(i) + (b[2] + b[5]) / 2, z = pos.getZ(i) + (b[3] + b[6]) / 2;
      if (ny > .5) uv.setXY(i, x / 3, z / 3); else if (nx > .5) uv.setXY(i, z / 6.4, y / 6.4); else uv.setXY(i, x / 6.4, y / 6.4); }
    var m = new THREE.Mesh(g, mat); m.position.set((b[1] + b[4]) / 2, (b[2] + b[5]) / 2, (b[3] + b[6]) / 2); m.frustumCulled = false; grp.add(m); return m;
  }
  B.forEach(function (b, i) {
    if (i === 0) { var f = box(b, mFloor); f.position.y -= .0; return; }
    box(b, mWall);
    if (b[2] < 1.2 && (b[5] - b[2]) > 1.5) solid.push([b[1] - .25, b[3] - .25, b[4] + .25, b[6] + .25]);   // стены, косяки, перегородки
  });
  // нижние части подоконника/простенков (низ окна) тоже непроходимы
  solid.push([-5.7, 7.5, 13.3, 8.6]);
  // потолок
  var ce = new THREE.Mesh(new THREE.PlaneGeometry(26.2, 41.2), mCeil); ce.rotation.x = Math.PI / 2; ce.position.set(0, 6.45, -12.4); ce.material.map.repeat.set(26.2 / 2, 41.2 / 2); grp.add(ce);
  // стекло окон
  var gl = new THREE.Mesh(new THREE.PlaneGeometry(19, 3.1), new THREE.MeshBasicMaterial({ color: 0x9cc8e0, transparent: true, opacity: .12, depthWrite: false })); gl.position.set(3.8, 3.6, 8); 
  // свет: по комнатам
  [[0, 5.4, 3, 1.1, 26], [0, 5.3, -13.5, .9, 22], [-6, 5.3, -25, .8, 16], [8, 5.3, -25, .8, 16], [-8, 5.3, -13.5, .6, 14]].forEach(function (p) { var l = new THREE.PointLight(0xfff0d8, p[3]*.8, p[4], 1.6); l.position.set(p[0], p[1], p[2]); grp.add(l); });
  var amb = new THREE.AmbientLight(0xffffff, .38); grp.add(amb);
  window.__r2solid = solid;
  // коллизии: стены новой комнаты + старая мебель (прилавок, верстак, стеллаж, терминал) — она осталась на месте
  window.__r2solid = solid;
  window.blocked = function (x, z) {
    if (x < -12.3 || x > 12.3 || z < -32 || z > 7.2) return true;
    if (!EMPTY) {                                                              // в пустой комнате объектов нет — упираться не во что, кроме стен
    if (Math.abs(x) < 2.8 && z > 1 && z < 3) return true;                        // стойка клиентов (в зале)
    if (x > 7.1 && x < 10.1 && z > -6 && z < 0) return true;                     // терминал-маркет (в зале)
    if (x > 4.3 && x < 11.7 && z > -27.3 && z < -22.3) return true;              // верстак (в мастерской)
    if (x > -12.9 && x < -11.1 && z > -29.3 && z < -19.7) return true;           // стеллаж с деталями (на складе)
    }
    for (var i = 0; i < solid.length; i++) { var s = solid[i]; if (x > s[0] && x < s[2] && z > s[1] && z < s[3]) return true; }
    return false;
  };
  // Раскладка по твоему плану: стеллаж с деталями и детали на полу — на склад, верстак со всем рабочим — в мастерскую
  var OB = [8, -19];
  window.__r2bx = OB[0]; window.__r2bz = OB[1];
  function relocate() {
    try {
      shF.position.set(-2.7, 0, -24.5); shI.position.set(-2.7, 0, -24.5); deco.position.set(-2.7, 0, -24.5);
      flG.position.set(-5, 0, -24); wrk.position.set(10, 0, -19);
      BP.x += OB[0]; BP.z += OB[1];
      if (window.__ordPts) { __ordPts.SPOT.x += OB[0]; __ordPts.SPOT.z += OB[1]; __ordPts.MON.x += OB[0]; __ordPts.MON.z += OB[1]; }
    } catch (e) { console.warn('[room2] relocate', e); }
  }

  // ---- Склад: дополнительные стеллажи по классам деталей. Что не влезло на главный стеллаж, раскладывается сюда ----
  var RK = [];     // по классу c: {x0, z, y0:[...]}  стеллаж длиной 3.2 вдоль x, лицом к +z
  var RACKPOS = { 0: [-11.4, -23.6], 1: [-7.4, -23.6], 2: [-3.4, -23.6], 3: [-11.4, -27.4], 4: [-7.4, -27.4], 5: [-3.4, -27.4], 6: [-3.4, -20.2] };
  var ovG = null;
  function buildRacks() {
    if (ovG) return;
    ovG = new THREE.Group(); ovG.name = 'R2RACKS'; scene.add(ovG);
    var mP = new THREE.MeshLambertMaterial({ color: 0x4a5460 }), mB = new THREE.MeshLambertMaterial({ color: 0x8a8f96 }), mHit = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    function box(w, h, d, m, x, y, z) { var o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); ovG.add(o); return o; }
    Object.keys(RACKPOS).forEach(function (k) {
      var c = +k, x0 = RACKPOS[k][0], z = RACKPOS[k][1], L = 3.6, D = 1.0;
      [[x0, z - D / 2], [x0 + L, z - D / 2], [x0, z + D / 2], [x0 + L, z + D / 2]].forEach(function (p) { box(.1, 4.7, .1, mP, p[0], 2.35, p[1]); });
      box(L, .1, .06, mP, x0 + L / 2, 4.6, z + D / 2); box(L, 4.4, .04, mP, x0 + L / 2, 2.35, z - D / 2);
      [.3, 1.4, 2.5, 3.6].forEach(function (y) { box(L, .08, D, mB, x0 + L / 2, y, z); });
      try { lp(ovG, SECN[c], 3.3, .34, x0 + L / 2, 4.85, z + D / 2 + .02, '#fff', CCOL[c], 0); } catch (e) { }
      var h = box(L, 4.4, D + .2, mHit, x0 + L / 2, 2.35, z); h.userData.act = function () { putSec(c); }; h.userData.sec = 1;
      solid.push([x0 - .1, z - .65, x0 + L + .1, z + .65]);
      RK[c] = { x0: x0, z: z, L: L, D: D, tiers: [.34, 1.44, 2.54, 3.64] };
    });
    // мои «декоративные» блоки на складе были лишними — теперь тут настоящие стеллажи
  }
  var ovI = null;
  function overflowItems() {
    if (!ovI) { ovI = new THREE.Group(); ovI.name = 'R2OVF'; scene.add(ovI); }
    while (ovI.children.length) ovI.remove(ovI.children[0]);
    if (!G || !RK.length) return;
    var n = need(), cnt = [0, 0, 0, 0, 0, 0, 0];
    G.st.filter(function (x) { return !x.fl && !x.h && !x.pl; }).forEach(function (x) {
      var k = cnt[x.c]++, bd = BOXD[x.c], w = bd[0], h = bd[1], dp = bd[2];
      var sA = [{ z0: -7.2, z1: -1.7 }, { z0: -1.5, z1: 3.4 }, { z0: -7.2, z1: -4.7 }, { z0: -4.5, z1: -.5 }, { z0: -.3, z1: 2.5 }, { z0: -7.2, z1: .2 }, { z0: 3.6, z1: 7.2 }][x.c];
      var per = Math.max(1, Math.floor((sA.z1 - sA.z0) / (w + .06))), stk = Math.max(1, Math.floor(.95 / (h + .03))), cap = per * stk;
      var r = RK[x.c]; if (!r) return;
      var m = k, perR = Math.max(1, Math.floor((r.L - .2) / (w + .06))), tcap = perR * stk, tier = Math.floor(m / tcap);
      if (tier >= 4) return;
      var q = m % tcap, lv = Math.floor(q / perR), col = q % perR, hl = x.c == n;
      var side = new THREE.MeshStandardMaterial({ map: sideTex(x), roughness: .7, metalness: .05 });
      var front = new THREE.MeshStandardMaterial({ map: boxTex(x), roughness: .35, metalness: .15, emissive: hl ? 0x22d3ee : 0, emissiveIntensity: hl ? .35 : 0 });
      var b = new THREE.Mesh(new THREE.BoxGeometry(dp, h, w), [front, side, side, side, side, side]);
      b.rotation.y = -Math.PI / 2;
      b.position.set(r.x0 + .15 + w / 2 + col * (w + .06), r.tiers[tier] + .04 + lv * (h + .03) + h / 2, r.z + .05);
      b.castShadow = b.receiveShadow = true; b.userData.act = function () { take(x); }; ovI.add(b);
    });
  }
  function installShelf() {
    try {
      buildRacks();
      shelf = function () { try { overflowItems(); } catch (e) { console.warn('[room2] shelf', e); } };
      shelf();
    } catch (e) { console.warn('[room2] racks', e); }
  }

  // ================= ПОЛНАЯ ЧИСТКА СТАРОЙ КОМНАТЫ =================
  var R2W = null;
  function hasAct(o) { var f = false; o.traverse(function (c) { if (c.userData && typeof c.userData.act === 'function') f = true; }); return f; }
  function keepIt(o) {
    if (EMPTY) {
      if (o.isPointLight || o.isSpotLight) return false;                     // старые лампы старой комнаты — убираю, свет теперь свой
      if (o.isLight || o === grp || o === R2W || (typeof cam !== 'undefined' && o === cam)) return true;
      if (o.name && o.name.indexOf('R2') === 0) return true;
      if (window.__W && o === window.__W.ST) return true;
      try { if (o === bod || o === benchPC || o === benchT || o === tm || o === dispB) return true; } catch (e) { }
      try { if (typeof THG !== 'undefined' && THG.indexOf(o) >= 0) return true; } catch (e) { }
      return false;
    }
    if (o.isLight || o === grp || o === R2W || (typeof cam !== 'undefined' && o === cam)) return true;
    if (o.name && o.name.indexOf('R2') === 0) return true;
    if (window.__W && o === window.__W.ST) return true;
    try { if (o === bod || o === flG || o === wrk || o === dbr || o === dec || o === benchPC || (A && A.cs === o) || o === benchT || o === tm || o === dispB) return true; } catch (e) { }
    try { if (typeof THG !== 'undefined' && THG.indexOf(o) >= 0) return true; } catch (e) { }
    if (o.userData && (o.userData.__keep || o.userData.pc)) return true;
    return hasAct(o);
  }
  function purgeOld() {
    var bb = new THREE.Box3(), sz = new THREE.Vector3(), n = 0;
    scene.children.slice().forEach(function (o) {
      try {
        if (keepIt(o)) return;
        bb.setFromObject(o); if (bb.isEmpty()) return;
        if (EMPTY) { if (bb.min.z > 8.6) return; scene.remove(o); n++; return; }          // пустая комната: убираем всё, кроме света, камеры, улицы и невидимых зон
        if (bb.max.x < -11.5 || bb.min.x > 14.5 || bb.max.z < -9.8 || bb.min.z > 9.6) return;       // вне старой комнаты (улица, новые комнаты)
        bb.getSize(sz);
        var big = Math.max(sz.x, sz.y, sz.z) >= .9;
        if (o.isSprite || o.isPoints || big) { scene.remove(o); n++; }
      } catch (e) { }
    });
    return n;
  }
  function buildWorld() {
    if (R2W) return;
    R2W = new THREE.Group(); R2W.name = 'R2WORLD'; scene.add(R2W);
    var cache = {};
    function M(c) { return cache[c] || (cache[c] = new THREE.MeshLambertMaterial({ color: c })); }
    function box(w, h, d, c, x, y, z) { var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(c)); m.position.set(x, y, z); R2W.add(m); return m; }
    // верстак мастерской (центр 8; -24) — точно под зону сборки и ремонта
    var bx0 = 8, bz0 = -24;
    box(6, .2, 2.6, 0xa07a4a, bx0, 1.52, bz0); box(6.1, .06, 2.7, 0x6b4a2b, bx0, 1.4, bz0);
    [[-2.8, -1.1], [2.8, -1.1], [-2.8, 1.1], [2.8, 1.1]].forEach(function (p) { box(.2, 1.5, .2, 0x3a4250, bx0 + p[0], .75, bz0 + p[1]); });
    box(5.6, .08, 2.2, 0x555b63, bx0, .5, bz0);
    box(1.5, 1.0, 2.2, 0x4a5460, bx0 + 2.0, .95, bz0);
    for (var d = 0; d < 3; d++) { box(1.4, .28, .04, 0x6c7684, bx0 + 2.0, .55 + d * .32, bz0 - 1.12); box(.5, .05, .06, 0xd9d9d9, bx0 + 2.0, .62 + d * .32, bz0 - 1.16); }
    box(3.6, .03, 1.4, 0x2f7a3a, bx0 - .6, 1.64, bz0 + .1);                       // антистатический коврик
    box(.5, .5, .5, 0x3a3f47, bx0 - 2.5, 1.9, bz0 + .5);                           // тиски
    box(.1, 1.5, .1, 0x888888, bx0 - 2.6, 2.3, bz0 - .8); box(1.0, .1, .1, 0x888888, bx0 - 2.1, 3.0, bz0 - .8); box(.6, .15, .5, 0xfff2c0, bx0 - 1.7, 2.95, bz0 - .8); // лампа
    // киоск «МАРКЕТ» (терминал заказа деталей) — рядом с хитбоксом
    var kt = (function () { var c = document.createElement('canvas'); c.width = 320; c.height = 200; var x = c.getContext('2d'); var g = x.createLinearGradient(0, 0, 320, 200); g.addColorStop(0, '#0b2a5a'); g.addColorStop(1, '#3b0f6a'); x.fillStyle = g; x.fillRect(0, 0, 320, 200); x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = 'bold 54px sans-serif'; x.fillText('МАРКЕТ', 160, 100); x.font = '22px sans-serif'; x.fillStyle = '#9aa4b8'; x.fillText('нажми, чтобы открыть', 160, 140); return new THREE.CanvasTexture(c); })();
    box(.25, 3.2, .25, 0x2a2f3a, 9.8, 1.6, -4.4); box(.25, 3.2, .25, 0x2a2f3a, 9.8, 1.6, -1.6);
    box(.2, 2.4, 3.4, 0x14171f, 9.75, 3.2, -3);
    var scr = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 2.0), new THREE.MeshBasicMaterial({ map: kt })); scr.position.set(9.64, 3.2, -3); scr.rotation.y = -Math.PI / 2; R2W.add(scr);
    box(1.2, 1.1, 3.0, 0x1f2430, 9.2, .55, -3);
    // витрина для готовых ПК у задней стены зала (под хитбокс dispB)
    box(6, .2, 1.4, 0x2a2f3a, 6, 2.3, -9.1); box(.15, 2.3, 1.2, 0x2a2f3a, 3.1, 1.15, -9.1); box(.15, 2.3, 1.2, 0x2a2f3a, 8.9, 1.15, -9.1);
    box(6, .08, .05, 0x6ee7ff, 6, 2.42, -8.42);
  }

  // ================= ВХОД И ОКНА: сужаю проём, ставлю двустворчатую дверь, рамки и стёкла =================
  function envelope() {
    var cache = {};
    function M(c, o) { var k = c + '_' + (o || 1); return cache[k] || (cache[k] = o ? new THREE.MeshLambertMaterial({ color: c, transparent: true, opacity: o, depthWrite: false }) : new THREE.MeshLambertMaterial({ color: c })); }
    function bx(x0, y0, z0, x1, y1, z1, mat, par) { var m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), mat); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); (par || grp).add(m); return m; }
    var FL = .473;
    // стенки по бокам проёма: остаётся 2.6 м для двери
    bx(-12.85, FL, 7.796, -11.6, 5.007, 8.353, mWall); bx(-9.0, FL, 7.796, -7.77, 5.007, 8.353, mWall);
    solid.push([-12.9, 7.5, -11.55, 8.5], [-9.05, 7.5, -7.7, 8.5]);
    // наличник двери
    bx(-11.68, FL, 7.7, -11.6, 4.95, 8.45, mTrim); bx(-9.0, FL, 7.7, -8.92, 4.95, 8.45, mTrim); bx(-11.68, 4.88, 7.7, -8.92, 4.98, 8.45, mTrim);
    // створки
    var wood = M(0x6b4a2b), glass = M(0xbfe3f0, .25), metal = M(0xcfd4da);
    function leaf(hx, dir) {
      var g = new THREE.Group(); g.position.set(hx, 0, 8.07);
      var W = 1.3 * dir, c0 = Math.min(0, W), c1 = Math.max(0, W);
      bx(c0, FL + .05, -.05, c1, FL + 1.3, .05, wood, g);          // нижняя филёнка
      bx(c0, 4.55, -.05, c1, 4.85, .05, wood, g);                    // верх
      bx(c0, FL + 1.3, -.05, c0 + .12 * dir * (dir > 0 ? 1 : -1) * 0 + (dir > 0 ? .12 : 0), 4.55, .05, wood, g);
      bx(dir > 0 ? c1 - .12 : c0, FL + 1.3, -.05, dir > 0 ? c1 : c0 + .12, 4.55, .05, wood, g);
      bx(dir > 0 ? c0 : c1 - .12, FL + 1.3, -.05, dir > 0 ? c0 + .12 : c1, 4.55, .05, wood, g);
      bx(c0 + .12, FL + 1.3, -.015, c1 - .12, 4.55, .015, glass, g);   // стекло
      bx(dir > 0 ? c1 - .3 : c0 + .25, 2.6, .05, dir > 0 ? c1 - .25 : c0 + .3, 3.4, .12, metal, g);   // ручка
      grp.add(g); return g;
    }
    var L = leaf(-11.6, 1), Rr = leaf(-9.0, -1), open = false, busy = false;
    function toggle() {
      if (busy) return; busy = true; open = !open;
      var a0L = L.rotation.y, a0R = Rr.rotation.y, aL = open ? -1.45 : 0, aR = open ? 1.45 : 0;
      var step = function (t) { L.rotation.y = a0L + (aL - a0L) * t; Rr.rotation.y = a0R + (aR - a0R) * t; };
      try { sfx(open ? 'door' : 'door'); } catch (e) { }
      if (typeof tw === 'function') tw(.7, step, function () { busy = false; }); else { step(1); busy = false; }
    }
    L.userData.act = toggle; Rr.userData.act = toggle;
    // окна: рамки, средники и стёкла (3 проёма из модели)
    [[-5.6, .22], [1.45, 7.56], [8.87, 13.0]].forEach(function (p) {
      var x0 = p[0], x1 = p[1], y0 = 2.14, y1 = 5.05, zf0 = 7.9, zf1 = 8.12, t = .1;
      bx(x0, y0, zf0, x1, y0 + t, zf1, mTrim); bx(x0, y1 - t, zf0, x1, y1, zf1, mTrim); bx(x0, y0, zf0, x0 + t, y1, zf1, mTrim); bx(x1 - t, y0, zf0, x1, y1, zf1, mTrim);
      bx((x0 + x1) / 2 - .04, y0, zf0, (x0 + x1) / 2 + .04, y1, zf1, mTrim); bx(x0, (y0 + y1) / 2 - .04, zf0, x1, (y0 + y1) / 2 + .04, zf1, mTrim);
      bx(x0 + t, y0 + t, 8.0, x1 - t, y1 - t, 8.015, M(0xaed4ea, .16));
    });
  }
  function moveLoose() {
    var wp = new THREE.Vector3();
    scene.children.slice().forEach(function (o) {
      if (o === grp || o === cam || o.userData.__r2m || o.userData.__r2) return;
      if (o === shF || o === shI || o === deco || o === flG || o === wrk) return;
      try {
        o.getWorldPosition(wp);
        if (o.isLight) { if (wp.x > -10.6 && wp.x < -8.2 && Math.abs(wp.z) < 5.2) { o.position.x -= 2.7; o.position.z -= 24.5; o.userData.__r2m = 1; } return; }
        if (wp.x > -4.2 && wp.x < 4.2 && wp.z > -8.4 && wp.z < -3.0 && wp.y < 6) { o.position.x += OB[0]; o.position.z += OB[1]; o.userData.__r2m = 1; }
      } catch (e) { }
    });
  }
  window.__cullX = 14;
  function hideOld() {
    var bb = new THREE.Box3(), sz = new THREE.Vector3(), n = 0;
    scene.children.slice().forEach(function (o) {
      if (o.isLight || o === grp || (typeof cam !== 'undefined' && o === cam) || (window.__W && o === window.__W.ST) || o.userData.__r2) return;
      var g = o.geometry; if (!o.isMesh && !o.isSprite) return;
      try { bb.setFromObject(o); if (bb.isEmpty()) return; bb.getSize(sz);
        var inside = bb.min.x > -10.6 && bb.max.x < 10.6 && bb.min.z > -8.6 && bb.max.z < 8.6;
        if (!inside) return;
        // старая «коробка» комнаты: большие стены, пол, потолок
        if (g && g.type === 'PlaneGeometry' && (g.parameters.width >= 8 || g.parameters.height >= 8) && !o.isSprite && !(g.parameters.width === 8 && g.parameters.height === 2)) { o.visible = false; o.userData.__r2 = 1; n++; return; }
        if (!o.isSprite && sz.y < .25 && (sz.x > 15 || sz.z > 14) && g && g.type === 'BoxGeometry') { o.visible = false; o.userData.__r2 = 1; n++; return; }
        // старая входная дверь и рама на передней стене — теперь там окна новой комнаты
        if (bb.min.z > 7.4) { o.visible = false; o.userData.__r2 = 1; n++; return; }
        // то, что висело на старой задней стене, переносим на новую
        if (sz.z < .35 && bb.max.z < -7.4 && bb.min.z > -8.3) { o.position.z -= 1.9; o.userData.__r2 = 1; }
      } catch (e) { }
    });
    return n;
  }
  // потолок — та же текстура (акустическая плитка) и тон, что в старой комнате; на всех помещениях сразу
  function ceilSync() {
    var cm = null;
    scene.children.forEach(function (o) { var g = o.geometry; if (!cm && g && g.type === 'PlaneGeometry' && g.parameters.width === 20 && g.parameters.height === 16 && o.position.y > 5 && o.material && o.material.map) cm = o; });
    if (!cm) return false;
    var t = cm.material.map.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(26.2 / 2, 41.2 / 2);
    ce.material = new THREE.MeshBasicMaterial({ map: t, color: 0x9aa0b4 });
    setInterval(function () { try { ce.material.color.copy(cm.material.color); } catch (e) { } }, 1000);
    return true;
  }
  var why = '';
  function init() {
    try {
      if (typeof scene === 'undefined' || !scene) { why = 'нет scene'; return false; }
      if (typeof P === 'undefined' || !P) { why = 'нет P'; return false; }
      if (typeof cam === 'undefined' || !cam) { why = 'нет cam'; return false; }
      if (typeof THREE === 'undefined') { why = 'нет THREE'; return false; }
      grp.scale.y = 1.12; grp.position.y = -.473 * 1.12; /* пол новой комнаты на уровне старого (y=0), иначе старая мебель и модели утопают в полу */ scene.add(grp); window.__room2 = grp;
      if (window.BAL) { BAL.spawnEvery = [99999, 99999]; BAL.onlineEvery = [99999, 99999]; }
    } catch (e) { why = String(e && e.message || e); console.error('[room2] init', e); return false; }
    var errs = [];
    [function () { relocate(); }, function () { moveLoose(); }, function () { if (!EMPTY) installShelf(); }, function () { if (!EMPTY) buildWorld(); }, function () { try { dec.position.z -= 1.9; dispB.position.z -= 1.9; } catch (e) { } }, function () { scene.remove(shF); scene.remove(shI); scene.remove(deco); }, function () { purgeOld(); }, function () { envelope(); }].forEach(function (f) { try { f(); } catch (e) { errs.push(String(e && e.message || e)); console.error('[room2]', e); } });
    var k = 0, t = setInterval(function () { try { hideOld(); moveLoose(); purgeOld(); } catch (e) { } if (++k > 30) clearInterval(t); }, 1500);
    var ct0 = 0, ci = setInterval(function () { try { if (ceilSync() || ++ct0 > 60) clearInterval(ci); } catch (e) { clearInterval(ci); } }, 700);
    try { P.x = 0; P.z = 4; yaw = Math.PI; } catch (e) { }
    window.__room2goto = function (x, z) { P.x = x; P.z = z; };
    setTimeout(function () { try { toast(errs.length ? 'Новая планировка включена, но с ошибкой: ' + errs[0] : 'Новая планировка включена (F8 — вернуть старую).'); } catch (e) { } }, 2500);
    return true;
  }
  var tries = 0, iv = setInterval(function () {
    if (init()) { clearInterval(iv); return; }
    if (++tries > 120) { clearInterval(iv); try { toast('Новая планировка НЕ запустилась: ' + why); } catch (e) { } console.error('[room2] не запустилась:', why); }
  }, 500);
})();
