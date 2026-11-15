/* Новая планировка (из Blender-модели пользователя, масштаб ×2.6). Включена по умолчанию; F8 — вернуть старую комнату/снова включить. */
(function () {
  var ON = true; try { ON = localStorage.getItem('pcroom2') !== '0'; } catch (e) { }
  addEventListener('keydown', function (e) { if (e.code === 'F8') { try { localStorage.setItem('pcroom2', ON ? '0' : '1'); } catch (x) { } location.reload(); } });
  if (!ON) return;
  var B = [["Cube",-13.088,0,-32.908,13.101,.473,8.221],["Cube.001",-13.11,.473,-32.678,-12.85,6.497,7.989],["Cube.002",13.074,.473,-32.332,13.335,6.497,8.419],["Cube.003",-12.807,.473,-32.933,13.09,6.485,-32.117],["Cube.004",-7.77,-.19,7.708,-5.731,6.63,8.406],["Cube.005",-5.694,.317,7.733,13.232,2.119,8.339],["Cube.006",-13.198,5.007,7.796,-7.77,6.612,8.353],["Cube.007",-5.731,5.076,7.793,13.236,6.542,8.423],["Cube.008",.26,2.119,7.615,1.416,5.241,8.224],["Cube.009",7.603,2.119,7.746,8.833,5.084,8.451],["Cube.010",-12.817,.473,-10.744,8.159,6.203,-9.816],["Cube.011",-12.71,.473,-17.014,-9.36,6.029,-16.729],["Cube.012",-6.609,.473,-17.005,9.115,5.668,-16.62],["Cube.013",12.289,.473,-17.138,13.187,6.13,-16.518],["Cube.014",2.146,.473,-32.538,3.2,5.629,-16.833],["Cube.015",-14.284,5.81,-17.088,13.983,6.386,-16.581],["Cube.016",8.159,5.366,-10.717,13.386,6.195,-9.883]];
  function cv(w, h, f) { var c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t; }
  var wallT = cv(256, 256, function (g, w, h) { g.fillStyle = '#d9d2c3'; g.fillRect(0, 0, w, h); for (var i = 0; i < 900; i++) { g.fillStyle = 'rgba(0,0,0,' + Math.random() * .03 + ')'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } g.fillStyle = '#5b4636'; g.fillRect(0, h * .72, w, h * .28); g.fillStyle = '#7a6049'; g.fillRect(0, h * .72, w, 5); });
  var floorT = cv(256, 256, function (g, w, h) { for (var y = 0; y < 4; y++)for (var x = 0; x < 4; x++) { var v = 120 + ((x + y) & 1) * 14 + Math.random() * 8; g.fillStyle = 'rgb(' + v + ',' + (v - 14) + ',' + (v - 32) + ')'; g.fillRect(x * 64, y * 64, 63, 63); } });
  var ceilT = cv(128, 128, function (g, w, h) { g.fillStyle = '#e8e6e0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#bbb'; g.strokeRect(0, 0, w, h); });
  wallT.repeat.set(1, 1); floorT.repeat.set(1, 1); ceilT.repeat.set(1, 1);
  var mWall = new THREE.MeshLambertMaterial({ map: wallT }), mFloor = new THREE.MeshLambertMaterial({ map: floorT }), mCeil = new THREE.MeshBasicMaterial({ map: ceilT }), mTrim = new THREE.MeshLambertMaterial({ color: 0x3a2d24 });
  var grp = new THREE.Group(); grp.name = 'ROOM2';
  var solid = [];
  function box(b, mat, tile) {
    var w = b[4] - b[1], h = b[5] - b[2], d = b[6] - b[3];
    var g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv, pos = g.attributes.position;
    for (var i = 0; i < uv.count; i++) { var n = g.attributes.normal; var nx = Math.abs(n.getX(i)), ny = Math.abs(n.getY(i)); var x = pos.getX(i) + (b[1] + b[4]) / 2, y = pos.getY(i) + (b[2] + b[5]) / 2, z = pos.getZ(i) + (b[3] + b[6]) / 2;
      if (ny > .5) uv.setXY(i, x / 3, z / 3); else if (nx > .5) uv.setXY(i, z / 3, y / 3.2); else uv.setXY(i, x / 3, y / 3.2); }
    var m = new THREE.Mesh(g, mat); m.position.set((b[1] + b[4]) / 2, (b[2] + b[5]) / 2, (b[3] + b[6]) / 2); grp.add(m); return m;
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
  var gl = new THREE.Mesh(new THREE.PlaneGeometry(19, 3.1), new THREE.MeshBasicMaterial({ color: 0x9cc8e0, transparent: true, opacity: .12, depthWrite: false })); gl.position.set(3.8, 3.6, 8); grp.add(gl);
  // свет: по комнатам
  [[0, 5.4, 3, 1.1, 26], [0, 5.3, -13.5, .9, 22], [-6, 5.3, -25, .8, 16], [8, 5.3, -25, .8, 16], [-8, 5.3, -13.5, .6, 14]].forEach(function (p) { var l = new THREE.PointLight(0xfff0d8, p[3], p[4], 1.6); l.position.set(p[0], p[1], p[2]); grp.add(l); });
  var amb = new THREE.AmbientLight(0xffffff, .55); grp.add(amb);
  window.__r2solid = solid;
  // коллизии: стены новой комнаты + старая мебель (прилавок, верстак, стеллаж, терминал) — она осталась на месте
  window.__r2solid = solid;
  window.blocked = function (x, z) {
    if (x < -12.3 || x > 12.3 || z < -32 || z > 7.2) return true;
    if (Math.abs(x) < 2.8 && z > 1 && z < 3) return true;                        // стойка клиентов (в зале)
    if (x > 7.1 && x < 10.1 && z > -6 && z < 0) return true;                     // терминал-маркет (в зале)
    if (x > 4.3 && x < 11.7 && z > -27.3 && z < -22.3) return true;              // верстак (в мастерской)
    if (x > -12.9 && x < -11.1 && z > -29.3 && z < -19.7) return true;           // стеллаж с деталями (на складе)
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
  function init() {
    if (typeof scene === 'undefined' || !scene || typeof P === 'undefined' || !P || typeof cam === 'undefined' || !cam || typeof THREE === 'undefined') return false;
    grp.scale.y = 1.12; grp.position.y = -.473 * 1.12; /* пол новой комнаты на уровне старого (y=0), иначе старая мебель и модели утопают в полу */ scene.add(grp); window.__room2 = grp;
    if (window.BAL) { BAL.spawnEvery = [99999, 99999]; BAL.onlineEvery = [99999, 99999]; }
    relocate(); moveLoose();
    var k = 0, t = setInterval(function () { hideOld(); moveLoose(); if (++k > 12) clearInterval(t); }, 1500);
    var ct0 = 0, ci = setInterval(function () { if (ceilSync() || ++ct0 > 60) clearInterval(ci); }, 700);
    P.x = 0; P.z = 4; try { yaw = Math.PI; } catch (e) { }
    window.__room2goto = function (x, z) { P.x = x; P.z = z; };
    return true;
  }
  var tries = 0, iv = setInterval(function () { if (init() || ++tries > 200) clearInterval(iv); }, 500);
})();
