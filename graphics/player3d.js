/* PC МАСТЕР — player3d.js: детальная 3D-модель игрока (гладкая геометрия, скелетная иерархия, анимации).
   API: PlayerModel.create({name,skin,hair,shirt,pants,shoes}) -> group; g.userData.anim(speed,dt,carry)
   Тест: F10 — поставить модель перед собой. Позже сюда подставится .glb пользователя. */
(function () {
  if (typeof THREE === 'undefined') return;
  var T = THREE;
  function mat(c, r, m) { return new T.MeshStandardMaterial({ color: c, roughness: r == null ? .7 : r, metalness: m || 0 }); }
  function sph(r, sx, sy, sz, m) { var o = new T.Mesh(new T.SphereGeometry(r, 32, 24), m); o.scale.set(sx, sy, sz); return o; }
  function cyl(rt, rb, h, m, seg) { return new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg || 24), m); }
  function lathe(pts, m) { return new T.Mesh(new T.LatheGeometry(pts.map(function (p) { return new T.Vector2(p[0], p[1]); }), 32), m); }
  function tag(name) {
    var c = document.createElement('canvas'); c.width = 256; c.height = 64; var x = c.getContext('2d');
    x.fillStyle = 'rgba(0,0,0,.55)'; x.fillRect(0, 8, 256, 48); x.fillStyle = '#fff'; x.font = 'bold 30px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(name || 'Игрок', 128, 33);
    var s = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), depthTest: false, transparent: true })); s.scale.set(1.0, .25, 1); s.renderOrder = 999; return s;
  }
  function limb(len1, len2, r1, r2, m1, m2, endMat, endScale) {
    var top = new T.Group(), a = lathe([[0, 0], [r1 * .95, -.02], [r1, -len1 * .15], [r1 * .9, -len1 * .8], [r1 * .8, -len1], [0, -len1 - .005]], m1); top.add(a);
    var j = sph(r1 * .82, 1, 1, 1, m1); j.position.y = -len1; top.add(j);
    var mid = new T.Group(); mid.position.y = -len1; top.add(mid);
    var b = lathe([[0, 0], [r2 * 1.1, -.02], [r2 * 1.15, -len2 * .25], [r2 * .75, -len2 * .95], [0, -len2]], m2); mid.add(b);
    top.userData.mid = mid; top.userData.len2 = len2; return top;
  }
  function create(o) {
    o = o || {};
    var skin = mat(o.skin || 0xe0ac86, .65), hair = mat(o.hair || 0x2b1d14, .55), shirt = mat(o.shirt || 0x2f6fb0, .8), pants = mat(o.pants || 0x2c3039, .85), shoes = mat(o.shoes || 0xf2f2f2, .5), dark = mat(0x111111, .4), white = mat(0xffffff, .3);
    var g = new T.Group(), rig = new T.Group(); g.add(rig);
    var hips = new T.Group(); hips.position.y = .92; rig.add(hips);
    // таз и торс
    var pel = sph(.19, 1.12, .75, .72, pants); pel.position.y = .02; hips.add(pel);
    var torso = lathe([[0, 0], [.2, .02], [.215, .16], [.205, .3], [.24, .46], [.25, .54], [.13, .62], [0, .63]], shirt); torso.scale.z = .62; hips.add(torso);
    var chest = sph(.22, 1.1, .7, .72, shirt); chest.position.y = .44; hips.add(chest);
    var collar = new T.Mesh(new T.TorusGeometry(.085, .02, 12, 24), shirt); collar.rotation.x = Math.PI / 2; collar.position.y = .62; hips.add(collar);
    var belt = cyl(.205, .205, .035, dark, 32); belt.scale.z = .66; belt.position.y = .08; hips.add(belt);
    // шея и голова
    var neck = cyl(.055, .065, .1, skin); neck.position.y = .66; hips.add(neck);
    var head = new T.Group(); head.position.y = .84; hips.add(head);
    var skull = sph(.12, .95, 1.14, 1.0, skin); head.add(skull);
    var jaw = sph(.095, .95, .9, .95, skin); jaw.position.set(0, -.08, .015); head.add(jaw);
    var nose = sph(.02, .9, 1.2, 1.3, skin); nose.position.set(0, -.015, .115); head.add(nose);
    [-1, 1].forEach(function (s) {
      var eye = sph(.021, 1, .8, .6, white); eye.position.set(s * .045, .02, .105); head.add(eye);
      var iris = sph(.011, 1, 1, .6, mat(0x3a5a80, .3)); iris.position.set(s * .045, .02, .118); head.add(iris);
      var pup = sph(.005, 1, 1, .6, dark); pup.position.set(s * .045, .02, .123); head.add(pup);
      var brow = sph(.03, 1.6, .22, .5, hair); brow.position.set(s * .045, .06, .107); brow.rotation.z = -s * .12; head.add(brow);
      var ear = sph(.03, .4, 1, .7, skin); ear.position.set(s * .118, -.01, 0); head.add(ear);
    });
    var mouth = sph(.03, 1.5, .25, .4, mat(0xa6554f, .6)); mouth.position.set(0, -.07, .105); head.add(mouth);
    var hairCap = new T.Mesh(new T.SphereGeometry(.128, 32, 20, 0, Math.PI * 2, 0, Math.PI * .55), hair); hairCap.scale.set(.98, 1.16, 1.05); hairCap.position.set(0, .005, -.008); head.add(hairCap);
    var back = sph(.11, .95, 1, .8, hair); back.position.set(0, -.02, -.06); head.add(back);
    // руки
    var arms = [];
    [-1, 1].forEach(function (s) {
      var sh = new T.Group(); sh.position.set(s * .27, .53, 0); hips.add(sh);
      var ball = sph(.065, 1, 1, 1, shirt); sh.add(ball);
      var arm = limb(.29, .27, .058, .046, shirt, skin); sh.add(arm);
      var hand = sph(.045, .8, 1.2, .55, skin); hand.position.y = -.29; arm.userData.mid.add(hand);
      var th = sph(.017, 1, 1.5, 1, skin); th.position.set(-s * .03, -.25, .025); arm.userData.mid.add(th);
      arms.push(sh);
    });
    // ноги
    var legs = [];
    [-1, 1].forEach(function (s) {
      var hip = new T.Group(); hip.position.set(s * .105, -.02, 0); hips.add(hip);
      var leg = limb(.43, .42, .085, .06, pants, pants); hip.add(leg);
      var shoe = sph(.065, .9, .6, 1.8, shoes); shoe.position.set(0, -.42, .06); leg.userData.mid.add(shoe);
      var sole = sph(.067, .93, .18, 1.82, mat(0x333333, .9)); sole.position.set(0, -.455, .06); leg.userData.mid.add(sole);
      legs.push(hip);
    });
    // тень + ник
    var sh = new T.Mesh(new T.CircleGeometry(.4, 24), new T.MeshBasicMaterial({ color: 0, transparent: true, opacity: .25, depthWrite: false })); sh.rotation.x = -Math.PI / 2; sh.position.y = .01; g.add(sh);
    var t = tag(o.name); t.position.y = 2.05; g.add(t);
    g.traverse(function (m) { if (m.isMesh) { m.castShadow = false; m.frustumCulled = true; } });
    var ph = 0, sm = 0;
    g.userData.keep = 1; g.userData.anim = function (speed, dt, carry) {
      sm += (speed - sm) * Math.min(1, dt * 8); ph += dt * (3 + sm * 2.2);
      var k = Math.min(1, sm / 1.5), sw = Math.sin(ph) * .7 * k;
      legs[0].rotation.x = sw; legs[1].rotation.x = -sw;
      legs[0].children[0].userData.mid.rotation.x = Math.max(0, -sw) * .9; legs[1].children[0].userData.mid.rotation.x = Math.max(0, sw) * .9;
      var br = Math.sin(ph * .4) * .01 * (1 - k);
      hips.position.y = .92 + Math.abs(Math.cos(ph)) * .035 * k + br;
      hips.rotation.y = Math.sin(ph) * .08 * k; hips.rotation.z = Math.sin(ph) * .02 * k;
      if (carry) { arms.forEach(function (a) { a.rotation.x = -1.1; a.rotation.z = 0; a.children[1].userData.mid.rotation.x = -.6; }); }
      else { arms[0].rotation.x = -sw * .8; arms[1].rotation.x = sw * .8; arms[0].rotation.z = .05; arms[1].rotation.z = -.05; arms[0].children[1].userData.mid.rotation.x = -.25 - k * .4 * (sw < 0 ? 1 : 0); arms[1].children[1].userData.mid.rotation.x = -.25 - k * .4 * (sw > 0 ? 1 : 0); }
      head.rotation.y = Math.sin(ph * .13) * .15 * (1 - k);
    };
    g.userData.setLook = function (yaw, pitch) { head.rotation.y = yaw || 0; head.rotation.x = pitch || 0; };
    return g;
  }
  window.PlayerModel = { create: create };
  // тест: F10 — модель перед игроком, ходит по кругу
  var test = null, last = 0;
  addEventListener('keydown', function (e) {
    if (e.code !== 'F10') return; e.preventDefault();
    try {
      if (typeof scene === 'undefined' || typeof P === 'undefined') return;
      if (test) { scene.remove(test.g); test = null; return; }
      var g = create({ name: 'Игрок 2' }); scene.add(g); test = { g: g, t: 0 };
      var cx = P.x - Math.sin(P.yaw) * 3, cz = P.z - Math.cos(P.yaw) * 3; test.cx = cx; test.cz = cz;
      (function loop(ts) { if (!test) return; var dt = Math.min(.05, (ts - last) / 1000 || .016); last = ts; test.t += dt * .5;
        g.position.set(test.cx + Math.cos(test.t) * 1.5, 0, test.cz + Math.sin(test.t) * 1.5); g.rotation.y = -test.t;
        g.userData.anim(1.4, dt, false); requestAnimationFrame(loop); })(performance.now());
    } catch (er) { }
  });
})();
