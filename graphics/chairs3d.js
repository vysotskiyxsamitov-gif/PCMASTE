/* PC МАСТЕР — chairs3d.js: офисные кресла за стойкой, на них можно сесть (E). Встать — любая клавиша движения.
   Сборка из скруглённых примитивов three.js: сиденье, спинка, подлокотники, газлифт, пятилучевая крестовина на колёсиках. */
(function () {
  var Y = .473, SEAT = [[-.75, -.35], [1.75, -.35]], FACE = Math.PI;   // позиции кресел (x, z)
  window.__sit = false;
  function M(c, o) { return new THREE.MeshLambertMaterial({ color: c, emissive: 0x000000 }); }
  function rbox(w, h, d, r, mat) {   // скруглённый бокс из сглаженной сферы-сетки
    var g = new THREE.BoxGeometry(w, h, d, 8, 8, 8), p = g.attributes.position, v = new THREE.Vector3();
    for (var i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      var sx = w / 2 - r, sy = h / 2 - r, sz = d / 2 - r;
      var cx = Math.max(-sx, Math.min(sx, v.x)), cy = Math.max(-sy, Math.min(sy, v.y)), cz = Math.max(-sz, Math.min(sz, v.z));
      var n = new THREE.Vector3(v.x - cx, v.y - cy, v.z - cz);
      if (n.lengthSq() > 0) { n.normalize().multiplyScalar(r); v.set(cx + n.x, cy + n.y, cz + n.z); }
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals(); return new THREE.Mesh(g, mat);
  }
  function build() {
    var ch = new THREE.Group();
    var fab = M(0x2b3440), fab2 = M(0x1d242d), plastic = M(0x15181c), chrome = M(0xb9bec6), accent = M(0x2f7fd0);
    var seat = rbox(1.35, .32, 1.3, .13, fab); seat.position.set(0, 1.55, 0); ch.add(seat);
    var pad = rbox(1.15, .1, 1.1, .05, fab2); pad.position.set(0, 1.74, .02); ch.add(pad);
    var back = rbox(1.25, 1.65, .24, .11, fab); back.position.set(0, 2.55, -.62); back.rotation.x = -.1; ch.add(back);
    var lum = rbox(.9, .5, .1, .04, accent); lum.position.set(0, 2.2, -.5); lum.rotation.x = -.1; ch.add(lum);        // поясничная вставка
    var head = rbox(.7, .4, .18, .08, fab2); head.position.set(0, 3.5, -.68); head.rotation.x = -.1; ch.add(head);
    var neck = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .5, 12), chrome); neck.position.set(0, 3.2, -.66); ch.add(neck);
    [-1, 1].forEach(function (s) {                                                                                       // подлокотники
      var post = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .75, 12), plastic); post.position.set(s * .72, 2.0, -.1); ch.add(post);
      var arm = rbox(.2, .09, .8, .04, plastic); arm.position.set(s * .72, 2.4, 0); ch.add(arm);
    });
    var col = new THREE.Mesh(new THREE.CylinderGeometry(.09, .11, .85, 16), chrome); col.position.set(0, 1.0, 0); ch.add(col);   // газлифт
    var hub = new THREE.Mesh(new THREE.CylinderGeometry(.2, .24, .16, 20), plastic); hub.position.set(0, .55, 0); ch.add(hub);
    for (var i = 0; i < 5; i++) {                                                                                         // крестовина + колёсики
      var a = i * Math.PI * 2 / 5, L = .72;
      var leg = rbox(L, .1, .14, .04, plastic); leg.position.set(Math.cos(a) * L / 2, .5, Math.sin(a) * L / 2); leg.rotation.y = -a; ch.add(leg);
      var wh = new THREE.Mesh(new THREE.SphereGeometry(.1, 14, 10), chrome); wh.position.set(Math.cos(a) * (L + .02), .26, Math.sin(a) * (L + .02)); ch.add(wh);
      var st = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .22, 8), chrome); st.position.set(Math.cos(a) * L, .38, Math.sin(a) * L); ch.add(st);
    }
    return ch;
  }
  function stand(c) {
    if (!window.__sit) return;
    window.__sit = false;
    try { P.set(c.x, 3.4, c.z - 1.25); } catch (e) { }
  }
  var tries = 0, iv = setInterval(function () {
    if (window.__r2empty) { clearInterval(iv); return; }
    if (typeof THREE === 'undefined' || !window.__room2 || typeof window.blocked !== 'function') { if (++tries > 400) clearInterval(iv); return; }
    clearInterval(iv);
    try {
      var g = window.__room2, ob = window.blocked;
      window.blocked = function (x, z) { return window.__sit ? true : ob(x, z); };
      var cur = null;
      SEAT.forEach(function (p, i) {
        var w = new THREE.Group(); w.name = 'R2CHAIR'; w.position.set(p[0], Y, p[1]); w.scale.set(.95, .95 / 1.12, .95); w.userData.keep = 1;
        w.add(build());
        var hit = new THREE.Mesh(new THREE.BoxGeometry(1.8, 4.2, 1.8), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
        hit.position.set(0, 2.0, 0);
        hit.userData.act = function () {
          if (window.__sit) return;
          cur = { x: p[0], z: p[1] }; window.__sit = true;
          try { P.set(p[0], 2.9, p[1] + .05); yaw = cyaw = FACE; pit = cpit = -.12; if (typeof toast === 'function') toast('Ты сел. Чтобы встать — W/A/S/D'); } catch (e) { }
        };
        w.add(hit); g.add(w);
        if (window.__r2solid) window.__r2solid.push([p[0] - .6, p[1] - .6, p[0] + .6, p[1] + .6]);
      });
      addEventListener('keydown', function (e) {
        if (!window.__sit) return;
        if (/^(KeyW|KeyA|KeyS|KeyD|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Escape)$/.test(e.code)) stand(cur);
      });
    } catch (e) { console.warn('[chairs3d]', e); }
  }, 400);
})();
