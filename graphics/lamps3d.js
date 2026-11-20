/* PC МАСТЕР — lamps3d.js: подвесные светильники над стойкой и мастерской (вместо белых коробок). Колпак-раструб, шнур, патрон, горящая лампа. */
(function () {
  var POS = [[-2, 1.8], [1, 1.8], [4, 1.8], [7, -26], [10, -26]], Y = .473, CEIL = 6.6;
  function mk() {
    var g = new THREE.Group();
    var black = new THREE.MeshLambertMaterial({ color: 0x1c1f24 }), brass = new THREE.MeshLambertMaterial({ color: 0xb58a3c });
    var inner = new THREE.MeshLambertMaterial({ color: 0xffe9b8, emissive: 0xffd48a, emissiveIntensity: .8, side: THREE.BackSide });
    var bulb = new THREE.MeshLambertMaterial({ color: 0xfff3d0, emissive: 0xffe2a0, emissiveIntensity: 1.2 });
    var canopy = new THREE.Mesh(new THREE.CylinderGeometry(.22, .3, .12, 24), black); canopy.position.y = CEIL - .06; g.add(canopy);
    var cord = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, 1.35, 8), black); cord.position.y = CEIL - .8; g.add(cord);
    var cap = new THREE.Mesh(new THREE.CylinderGeometry(.09, .12, .22, 20), brass); cap.position.y = CEIL - 1.53; g.add(cap);
    var out = new THREE.Mesh(new THREE.CylinderGeometry(.16, .7, .55, 40, 1, true), black); out.position.y = CEIL - 1.8; out.material.side = THREE.DoubleSide; g.add(out);
    var rim = new THREE.Mesh(new THREE.TorusGeometry(.7, .022, 10, 40), brass); rim.rotation.x = Math.PI / 2; rim.position.y = CEIL - 2.07; g.add(rim);
    var inn = new THREE.Mesh(new THREE.CylinderGeometry(.15, .68, .53, 40, 1, true), inner); inn.position.y = CEIL - 1.8; g.add(inn);
    var b = new THREE.Mesh(new THREE.SphereGeometry(.16, 20, 14), bulb); b.position.y = CEIL - 1.93; g.add(b);
    return g;
  }
  var tries = 0, iv = setInterval(function () {
    if (window.__r2empty) { clearInterval(iv); return; }
    if (typeof THREE === 'undefined' || !window.__room2) { if (++tries > 400) clearInterval(iv); return; }
    clearInterval(iv);
    try {
      var g = window.__room2;
      POS.forEach(function (p) { var w = new THREE.Group(); w.name = 'R2LAMP'; w.position.set(p[0], Y, p[1]); w.scale.y = 1 / 1.12; w.userData.keep = 1; w.add(mk()); g.add(w); });
    } catch (e) { console.warn('[lamps3d]', e); }
  }, 400);
})();
