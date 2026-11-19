/* PC МАСТЕР — hideq.js: задание «Прячься в шкафу».
   Макс звонит: к тебе едут люди Виктора. Игрок идёт к шкафу у правой стены зала и нажимает E — прячется внутрь.
   Снаружи слышны голоса, потом гости уходят. Если не успеть спрятаться — они находят пустой магазин и оставляют записку.
   Шкаф — настоящий, с полостью внутри (одежда, штанга, полка), двери открываются по E.
   Для проверки без ожидания: Ctrl+Shift+H или __hideq.start() в консоли. */
(function () {
  if (window.__hideqLoaded) return; window.__hideqLoaded = 1;
  function ready() {
    try {
      return typeof THREE !== 'undefined' && !!scene && !!cam && !!window.__r2on && !!window.__r2solid &&
        typeof talk === 'function' && typeof toast === 'function' && typeof incomingCall === 'function';
    } catch (e) { return false; }
  }
  function go() {
    var X0 = 11.2, X1 = 12.95, Z0 = -6.4, Z1 = -3.8, H = 5.6, DW = (Z1 - Z0) / 2;
    var g = new THREE.Group(); g.name = 'R2CLOSET'; scene.add(g);
    var cache = {};
    function M(c, o) { var k = c + (o ? 'e' : ''); return cache[k] || (cache[k] = o ? new THREE.MeshStandardMaterial({ color: c, roughness: .8 }) : new THREE.MeshLambertMaterial({ color: c })); }
    function B(w, h, d, c, x, y, z, p) { var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(c)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; (p || g).add(m); return m; }
    var WOOD = 0x5e3f2c, DK = 0x3b2a20;
    /* корпус: задняя стенка, бока, крыша, пол */
    B(.1, H, Z1 - Z0, DK, X1 - .05, H / 2, (Z0 + Z1) / 2);
    B(X1 - X0, H, .1, WOOD, (X0 + X1) / 2, H / 2, Z0 + .05); B(X1 - X0, H, .1, WOOD, (X0 + X1) / 2, H / 2, Z1 - .05);
    B(X1 - X0 + .1, .12, Z1 - Z0 + .1, WOOD, (X0 + X1) / 2, H + .04, (Z0 + Z1) / 2);
    B(X1 - X0, .06, Z1 - Z0, 0x2b1d15, (X0 + X1) / 2, .03, (Z0 + Z1) / 2);
    /* штанга, полка, одежда */
    var rail = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, Z1 - Z0 - .2, 10), M(0xb0b6bd)); rail.rotation.x = Math.PI / 2; rail.position.set(12.1, 4.5, (Z0 + Z1) / 2); g.add(rail);
    B(X1 - X0 - .1, .1, Z1 - Z0 - .2, 0x6b4a2b, (X0 + X1) / 2 + .05, 5.0, (Z0 + Z1) / 2);
    var CL = [0x2a3a52, 0x5a2f2f, 0x2f4a3a, 0x3a3a3a, 0x6a5a3a, 0x40334f, 0x2a3a52];
    for (var i = 0; i < 7; i++) { var z = Z0 + .35 + i * .33; B(.14, 2.1 + (i % 3) * .2, .22, CL[i], 12.1, 3.4 - (i % 3) * .1, z); B(.02, .12, .02, 0xb0b6bd, 12.1, 4.55, z); }
    B(.5, .3, 1.0, 0x8a6a45, 12.5, .2, -5.1); B(.5, .3, .6, 0x333a44, 12.5, .5, -4.4);       // коробки внизу
    var lamp = new THREE.PointLight(0xffd9a0, 0, 5); lamp.position.set(12.0, 4.9, -5.1); g.add(lamp);
    /* двери */
    var leaves = [];
    function leaf(z, dir) {
      var p = new THREE.Group(); p.position.set(X0, 0, z); g.add(p);
      B(.08, H - .1, DW - .03, WOOD, 0, (H - .1) / 2 + .03, dir * (DW - .03) / 2, p);
      B(.03, H - .8, DW - .35, 0x6e4a33, -.05, (H - .1) / 2 + .03, dir * (DW - .03) / 2, p);
      B(.07, .5, .07, 0xd9b45a, -.08, 2.8, dir * (DW - .2), p);
      p.userData.dir = dir; p.userData.open = 0; leaves.push(p); return p;
    }
    var lA = leaf(Z0, 1), lB = leaf(Z1, -1);
    function setOpen(k) { lA.rotation.y = -1.6 * k; lB.rotation.y = 1.6 * k; lamp.intensity = k * .9; }
    var tw = null;
    function anim(to, cb) {
      if (tw) cancelAnimationFrame(tw); var from = lA.userData.open, t0 = performance.now(), d = 450;
      (function s(now) { var k = Math.min(1, (now - t0) / d), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, v = from + (to - from) * e; lA.userData.open = v; setOpen(v); if (k < 1) tw = requestAnimationFrame(s); else { tw = null; if (cb) cb(); } })(t0);
    }
    /* хитбокс-дверь для E */
    var hit = new THREE.Mesh(new THREE.BoxGeometry(.4, H, Z1 - Z0), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
    hit.position.set(X0 - .15, H / 2, (Z0 + Z1) / 2); g.add(hit);
    window.__r2solid.push([X0 - .25, Z0 - .1, X1 + .2, Z1 + .1]);

    /* ---------- состояние ---------- */
    function hq() { try { return (G && G.ev && G.ev.hq) || null; } catch (e) { return null; } }
    function st() { var b = hq(); return b ? (b.st | 0) : 0; }
    function setSt(s, extra) { G.ev = G.ev || {}; var b = G.ev.hq = G.ev.hq || { st: 0, n: 0 }; b.st = s; if (extra) for (var k in extra) b[k] = extra[k]; try { save(); } catch (e) { } }
    function inGame() { try { return !!G && mode == 'play'; } catch (e) { return false; } }
    function safe(f) { try { return f(); } catch (e) { console.error('[hideq]', e); } }
    var busy = false, deadline = 0;

    function start() {
      if (st() || !G || busy) return;
      var n = (hq() && hq().n) | 0;
      setSt(1, { n: n });
      deadline = performance.now() + 100000;
      incomingCall('M', [
        ['M', 'Слушай и не перебивай. К тебе едут двое от Виктора, они уже рядом.'],
        ['M', 'Не встречай их у стойки. Спрячься в шкафу у правой стены зала и сиди тихо, пока не уйдут.'],
        ['Y', 'Понял, иду.']
      ], function () { toast('Спрячься в шкафу у правой стены зала. Нажми E у двери шкафа.'); });
    }

    function hide() {
      if (busy) return; busy = true;
      anim(1, function () {
        P.x = 12.2; P.z = -5.1; VX = VZ = 0; yaw = Math.PI / 2; try { cyaw = yaw; } catch (e) { }
        anim(0, function () {
          vig(true); setSt(2);
          talk([
            ['Ты', 'Тише. Только не дышать.'],
            ['Голос', 'Эй! Хозяин! Есть кто живой?'],
            ['Голос', 'Свет горит, компьютеры включены. Он где-то тут.'],
            ['Второй', 'Проверь коридор. Я гляну за стойкой.'],
            ['Ты', '(Шаги совсем рядом. Через щель видно ботинки.)'],
            ['Второй', 'Пусто. Видать, вышел.'],
            ['Голос', 'Ладно. Передай Виктору: он знает, чем кончится. Пошли.'],
            ['Ты', '(Дверь хлопнула. Тишина.)']
          ], function () { safe(out); });
        });
      });
    }
    function out() {
      vig(false); anim(1, function () {
        P.x = 10.0; P.z = -5.1; VX = VZ = 0; yaw = Math.PI / 2; try { cyaw = yaw; } catch (e) { }
        var n = ((hq() && hq().n) | 0) + 1; setSt(0, { n: n, done: 1 });
        busy = false;
        setTimeout(function () { anim(0); toast('Они ушли. Ты остался незамеченным. Виктор будет знать, что ты на месте.'); }, 500);
      });
    }
    function missed() {
      var n = ((hq() && hq().n) | 0) + 1; setSt(0, { n: n });
      talk([['Голос', 'Хозяина нет. Оставим записку.'], ['Записка', '«Срок идёт. Виктор»']], function () { toast('Ты не успел спрятаться. Гости ушли, оставив записку.'); });
    }
    function door() {
      if (busy) return;
      if (st() == 1) { hide(); return; }
      var open = lA.userData.open > .5; anim(open ? 0 : 1);
      if (!open) toast('В шкафу куртки и пара коробок.');
    }
    hit.userData.act = door; lA.children.forEach(function (c) { c.userData.act = door; }); lB.children.forEach(function (c) { c.userData.act = door; });

    /* затемнение, пока сидишь внутри */
    var V = document.createElement('div');
    V.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:6;opacity:0;transition:opacity .6s;background:radial-gradient(ellipse at 50% 50%,rgba(0,0,0,.35) 0%,rgba(0,0,0,.92) 85%);';
    document.body.appendChild(V);
    function vig(on) { V.style.opacity = on ? 1 : 0; }

    /* подсказка в «Задании» */
    try { var _q = qText; qText = function () { if (G && st() == 1) return 'Спрячься в шкафу у правой стены (E)'; return _q.apply(this, arguments); }; } catch (e) { }

    /* ---------- расписание ---------- */
    var sch = { day: -1, fire: false, t: 0 }, last = performance.now();
    setInterval(function () {
      var now = performance.now(), dt = (now - last) / 1000; last = now;
      safe(function () {
        if (!G || G.sb || !G.tid || !inGame()) return;
        var b = hq();
        if (b && b.st == 1 && now > deadline && !busy) { missed(); return; }
        if (b && b.st) return;
        try { var bo = G.ev && G.ev.bo; if (bo && bo.st) return; } catch (e) { }
        if (G.day < 3 || [10, 20, 30].indexOf(G.day) >= 0) { sch.day = -1; return; }
        if (sch.day !== G.day) {
          sch.day = G.day; var n = b ? (b.n | 0) : 0;
          sch.fire = n == 0 ? true : (G.day >= 6 && Math.random() < .2);
          sch.t = 60 + Math.random() * 180;
        }
        if (!sch.fire) return;
        if (G.dl < 150) { sch.fire = false; return; }
        sch.t -= dt; if (sch.t <= 0) { sch.fire = false; start(); }
      });
    }, 1000);
    addEventListener('keydown', function (e) { if (e.ctrlKey && e.shiftKey && e.code == 'KeyH') { e.preventDefault(); safe(start); } });
    window.__hideq = { start: start, state: hq, open: function (k) { anim(k ? 1 : 0); } };
    console.log('[hideq] готово');
  }
  var n = 0, iv = setInterval(function () {
    if (ready()) { clearInterval(iv); setTimeout(function () { try { go(); } catch (e) { console.error('[hideq] init', e); } }, 3500); }
    else if (++n > 600) clearInterval(iv);
  }, 100);
})();
