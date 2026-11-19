/* PC МАСТЕР — userobj.js: модели пользователя (Blender -> игра): СТЕНД (стойка) и СТОЛ.
   Размеры взяты из stend.blend / stoll.blend (1 ед. Blender = SC игровых). Положение и масштаб — в таблице PLACE ниже. */
(function () {
  var PLACE = {
    stend: { x: 0.5, z: 1.9, sc: 1.7, rot: 0 },
    stoll: { x: -8.0, z: -6.4, sc: 1.2, rot: 0 }
  };
  var STEND = [
    [-1.936,0.0,-0.477,2.042,1.262,0.516,0xd8d2c4,'s'],
    [-2.24,1.196,-0.744,2.24,1.292,0.744,0x5b4636,'s'],
    [-1.505,0.226,-0.563,1.592,1.042,-0.477,0x9fd0e8,'g']
  ];
  var STOLL = [
    [-0.61,0.02,-0.481,-0.538,0.47,0.558,0x2b2f36,'s'],
    [1.086,0.0,-0.636,1.228,0.485,-0.476,0x2b2f36,'s'],
    [-1.381,0.0,0.539,-1.24,0.485,0.7,0x2b2f36,'s'],
    [-1.382,0.0,-0.636,-1.24,0.485,-0.476,0x2b2f36,'s'],
    [1.086,0.0,0.539,1.228,0.485,0.7,0x2b2f36,'s'],
    [-1.408,0.44,-0.897,1.408,0.532,0.897,0x8a6a45,'s'],
    [-1.361,0.02,-0.481,-1.289,0.47,0.558,0x2b2f36,'s'],
    [-0.673,0.0,-0.636,-0.531,0.485,-0.476,0x2b2f36,'s'],
    [-0.673,0.0,0.539,-0.531,0.485,0.7,0x2b2f36,'s'],
    [-1.26,0.003,0.544,-0.673,0.469,0.692,0x2b2f36,'s'],
    [-1.284,0.077,-0.684,-0.606,0.087,0.539,0x9fd0e8,'g'],
    [-1.284,0.248,-0.684,-0.606,0.257,0.539,0x9fd0e8,'g']
  ];
  function build() {
    var g = window.__room2; if (!g || typeof THREE === 'undefined') return false;
    var inv = 1 / (g.scale.y || 1), mats = {};
    function mat(c, f) { var k = c + f; return mats[k] || (mats[k] = f === 'g' ? new THREE.MeshLambertMaterial({ color: c, transparent: true, opacity: .35, depthWrite: false }) : new THREE.MeshLambertMaterial({ color: c })); }
    [['stend', STEND], ['stoll', STOLL]].forEach(function (p) {
      var pl = PLACE[p[0]], grp = new THREE.Group(); grp.name = 'USER_' + p[0];
      var x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9;
      p[1].forEach(function (it) {
        var s = pl.sc, w = (it[3] - it[0]) * s, h = (it[4] - it[1]) * s, d = (it[5] - it[2]) * s;
        var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(it[6], it[7]));
        m.position.set((it[0] + it[3]) / 2 * s, (it[1] + it[4]) / 2 * s, (it[2] + it[5]) / 2 * s); grp.add(m);
        x0 = Math.min(x0, it[0] * s); x1 = Math.max(x1, it[3] * s); z0 = Math.min(z0, it[2] * s); z1 = Math.max(z1, it[5] * s);
      });
      /* группа комнаты растянута по Y (scale.y) — компенсирую, чтобы модель не вытягивалась */
      grp.scale.y = inv; grp.position.set(pl.x, 0.473 + 0, pl.z); grp.rotation.y = pl.rot || 0; g.add(grp);
      if (window.__r2solid) window.__r2solid.push([pl.x + x0 - .2, pl.z + z0 - .2, pl.x + x1 + .2, pl.z + z1 + .2]);
    });
    return true;
  }
  var n = 0, iv = setInterval(function () { try { if (build() || ++n > 200) clearInterval(iv); } catch (e) { clearInterval(iv); console.error('[userobj]', e); } }, 400);
})();
