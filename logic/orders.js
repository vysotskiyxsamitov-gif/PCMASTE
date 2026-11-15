/* PC МАСТЕР — orders.js (подключать ПОСЛЕ blackout.js)
   • Клиент, подойдя к стойке, САМ говорит, что ему нужно. [E] — согласиться, [Q] — отказать.
     (То же [E]/[Q] теперь работает и в разговоре с Виктором: «Отдать» / «Не отдавать».)
   • Новый вид заказов — РЕМОНТ ПК. Клиент оставляет сломанный ПК на верстаке слева:
     осмотри его [E] (диагностика), поставь нужную деталь из своего запаса (или почисти/смени пасту),
     потом вернись к клиенту [E] — он заплатит за работу и деталь. */
(function () {
  if (window.__ordersLoaded) return; window.__ordersLoaded = 1;
  function ready() { try { return typeof THREE !== 'undefined' && !!scene && typeof talk === 'function' && typeof spawn === 'function' && typeof serve === 'function' && typeof tickCU === 'function' && typeof G !== 'undefined' && !!window.__blackoutLoaded; } catch (e) { return false; } }
  function safe(f) { try { return f(); } catch (e) { console.error('[orders]', e); } }
  function go() {
    /* код — буква азбуки Морзе: · точка (короткий писк), − тире (длинный) */
    var FAULTS = [
      { k: 'dust', code: '−··', L: 'D', t: 'Шумит и сильно перегревается', n: 'Перегрев: забит пылью', sol: 'Почистить ПК от пыли.', need: -1, fee: [35, 70], work: 'Продуваю и чищу от пыли…' },
      { k: 'paste', code: '−', L: 'T', t: 'Греется под нагрузкой и троттлит', n: 'Перегрев: высохла термопаста', sol: 'Заменить термопасту.', need: -1, fee: [30, 60], work: 'Снимаю кулер, меняю термопасту…' },
      { k: 'psu', code: '·−−·', L: 'P', t: 'Вообще не включается', n: 'Неисправен блок питания', sol: 'Заменить блок питания.', need: 6, fee: [40, 80], work: 'Меняю блок питания…' },
      { k: 'ram', code: '·−·', L: 'R', t: 'Синие экраны и зависания', n: 'Ошибка оперативной памяти', sol: 'Заменить планку памяти.', need: 4, fee: [35, 70], work: 'Меняю оперативную память…' },
      { k: 'gpu', code: '−−·', L: 'G', t: 'Нет картинки, на экране артефакты', n: 'Ошибка видеокарты', sol: 'Заменить видеокарту.', need: 5, fee: [50, 100], work: 'Меняю видеокарту…' },
      { k: 'cool', code: '−·−', L: 'K', t: 'Греется, вентилятор на процессоре стоит', n: 'Не вращается вентилятор процессора', sol: 'Заменить кулер.', need: 3, fee: [35, 70], work: 'Меняю кулер…' },
      { k: 'cpu', code: '−·−·', L: 'C', t: 'Не стартует, постоянные перезагрузки', n: 'Ошибка процессора', sol: 'Заменить процессор.', need: 2, fee: [60, 110], work: 'Меняю процессор и пасту…' },
      { k: 'mb', code: '−−', L: 'M', t: 'Не запускается, иногда искрит', n: 'Ошибка материнской платы', sol: 'Заменить материнскую плату.', need: 1, fee: [60, 120], work: 'Меняю материнскую плату…' }
    ];
    function rnd2(a, b) { return Math.floor(a + Math.random() * (b - a + 1)); }
    var BAL = window.BAL || { fee: {}, repairChance: .4, partMarkupPct: 30, patienceSec: 240, nervousAfterSec: 120, onlineEvery: [100, 160], onlineMax: 3, onlineMarginPct: 8, lounge: false };
    FAULTS.forEach(function (f) { var v = BAL.fee && BAL.fee[f.k]; if (v != null) f.fee = Array.isArray(v) ? v : [v, v]; });
    function pickOf(a) { return a[Math.floor(Math.random() * a.length)]; }
    function money(n) { try { return M(n); } catch (e) { return '$' + Math.round(n); } }
    var JOB = null;                                   // текущий ремонт: {c, f, g, fee, conn, on, fixed, mon, scr, ...}

    /* ---------- [E]/[Q] в разговоре с вариантами ---------- */
    var _talk = talk;
    talk = function (lines, cb, opts) {
      if (opts && opts.length && opts.length <= 2) opts = opts.map(function (o, i) { return [(/^\[[EQ]\]/.test(o[0]) ? '' : (i ? '[Q] ' : '[E] ')) + o[0], o[1]]; });
      else if (opts && opts.length > 2) opts = opts.map(function (o, i) { return [(/^\[\d\]/.test(o[0]) ? '' : '[' + (i + 1) + '] ') + o[0], o[1]]; });
      return _talk.call(this, lines, cb, opts);
    };
    addEventListener('keydown', function (e) {
      if (e.repeat || mode != 'talk' || !TK || !TK.o || TK.o.length > 2) return;
      if (TK.i != TK.l.length - 1) return;
      if (e.code == 'KeyE' && TK.o[0]) { e.preventDefault(); tpick(0); }
      else if (e.code == 'KeyQ' && TK.o[1]) { e.preventDefault(); tpick(1); }
    });
    addEventListener('keydown', function (e) {
      if (e.repeat || mode != 'talk' || !TK || !TK.o || TK.o.length < 3 || TK.i != TK.l.length - 1) return;
      var m = /^(Digit|Numpad)([1-9])$/.exec(e.code); if (m && TK.o[+m[2] - 1]) { e.preventDefault(); tpick(+m[2] - 1); }
    });

    /* ---------- клиенты: тип заказа ---------- */
    var _spawn = spawn;
    spawn = function () {
      var n0 = CU.length; _spawn.apply(this, arguments);
      safe(function () {
        if (CU.length > n0) {
          var c = CU[CU.length - 1], first = G.sold == 0;
          c.kind = 'buy';
          if (!first && !JOB && G.sold >= 1 && !CU.some(function (x) { return x.kind == 'repair'; }) && Math.random() < BAL.repairChance) {
            c.kind = 'repair'; c.fault = FAULTS[rnd2(0, FAULTS.length - 1)]; c.fee = rnd2(c.fault.fee[0], c.fault.fee[1]);
          }
          c.first = first;
        }
      });
    };

    function leaveC(c) { c.s = 'out'; try { c.mk.visible = false; } catch (e) { } }

    /* фразы при принятии и отказе заказа */
    var PH_OK = ['Хорошо, подожду здесь.', 'Договорились, я буду рядом.', 'Отлично, спасибо! Не торопитесь.', 'Ладно, постою, подожду.'];
    var PH_OK_L = ['Хорошо, я подожду в зоне отдыха.', 'Отлично, посижу пока на диване.', 'Договорились, буду вон там, позовёте.', 'Спасибо! Пока выпью воды и подожду.'];
    var PH_NO_ME = ['Извините, в данный момент не смогу вам помочь.', 'Простите, сейчас очень много работы. Загляните позже.', 'К сожалению, такие заказы сегодня не берём.'];
    var PH_NO_CL = ['Жаль, ну ладно.', 'Понятно, зайду в другой раз.', 'Эх, ладно. Всего доброго.'];
    function accepted(c, longer) {
      c.t = c.t0 = BAL.patienceSec + (longer ? 60 : 0);
      toast(c.name + ': «' + pickOf(BAL.lounge ? PH_OK_L : PH_OK) + '»');
    }
    function declined(c) { say(pickOf(PH_NO_ME)); toast(c.name + ': «' + pickOf(PH_NO_CL) + '»'); leaveC(c); }

    function ask(c) {
      c.asked = 1;
      if (c.kind == 'repair') {
        var f = c.fault;
        talk([[c.name, 'Здравствуйте! У меня проблема с ПК: ' + f.t.toLowerCase() + '.'], [c.name, 'Починишь? Заплачу за работу и за деталь, если потребуется.']], null, [
          ['Беру в ремонт', function () { if (JOB) { acceptRepair(c); return; } acceptRepair(c); accepted(c, f.need >= 0); }],
          ['Отказать', function () { declined(c); }]
        ]);
      } else {
        var need = 'ПК от ' + money(c.min) + (c.br ? ', видеокарта ' + c.br : '');
        var o = [['Подберу', function () { c.acc = 1; accepted(c, false); toast('Когда ПК будет готов — подойди к клиенту и нажми [E].'); }]];
        if (!c.first) o.push(['Отказать', function () { declined(c); }]);
        talk([[c.name, 'Здравствуйте! Мне нужен ' + need + '.'], [c.name, c.first ? 'Первый свой компьютер хочу. Поможете?' : 'Найдётся что-нибудь подходящее?']], null, o);
      }
    }

    var _serve = serve;
    serve = function (c) {
      if (c.s != 'wait') return;
      if (!c.asked) { ask(c); return; }
      if (c.kind == 'repair') { return repairReturn(c); }
      return _serve.apply(this, arguments);
    };

    /* клиент у стойки ждёт: нужно навести прицел и нажать E — тогда он расскажет, что ему нужно (E — согласиться, Q — отказать) */
    function labelSprite() {
      var c = document.createElement('canvas'); c.width = 256; c.height = 72; var x = c.getContext('2d');
      x.fillStyle = 'rgba(10,14,26,.88)'; x.beginPath(); x.moveTo(14, 4); x.lineTo(242, 4); x.quadraticCurveTo(252, 4, 252, 14); x.lineTo(252, 50); x.quadraticCurveTo(252, 60, 242, 60); x.lineTo(14, 60); x.quadraticCurveTo(4, 60, 4, 50); x.lineTo(4, 14); x.quadraticCurveTo(4, 4, 14, 4); x.fill();
      x.strokeStyle = 'rgba(110,231,255,.8)'; x.lineWidth = 2; x.stroke(); x.fillStyle = '#fde68a'; x.font = 'bold 30px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('E — поговорить', 128, 33);
      var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false })); sp.scale.set(2.1, .6, 1); sp.position.set(0, 4.75, 0); sp.renderOrder = 10; return sp;
    }
    setInterval(function () {
      safe(function () {
        if (!G) return;
        CU.forEach(function (c) {
          var show = c.s == 'wait' && !c.asked && c.kind;
          if (show && !c.__lb && c.g && c.g.add) { c.__lb = labelSprite(); c.g.add(c.__lb); if (!c.__tip) { c.__tip = 1; toast('Клиент у стойки: наведи прицел на него и нажми [E], чтобы поговорить.'); } }
          if (!show && c.__lb) { c.g.remove(c.__lb); c.__lb = null; }
        });
      });
    }, 400);

    /* ---------- терпение клиента: полоска с таймером над головой; после половины времени он нервничает ---------- */
    function barSprite() {
      var cv = document.createElement('canvas'); cv.width = 192; cv.height = 56;
      var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthTest: false }));
      sp.scale.set(1.5, .44, 1); sp.position.set(0, 4.5, 0); sp.renderOrder = 10; sp.userData.cv = cv; return sp;
    }
    function drawBar(c) {
      var sp = c.__bar, cv = sp.userData.cv, x = cv.getContext('2d'), f = Math.max(0, Math.min(1, c.t / c.t0)), s = Math.max(0, Math.ceil(c.t));
      x.clearRect(0, 0, 192, 56); x.fillStyle = 'rgba(10,14,26,.86)'; x.fillRect(2, 2, 188, 52);
      x.fillStyle = '#1e293b'; x.fillRect(12, 36, 168, 10); x.fillStyle = f > .5 ? '#22c55e' : f > .2 ? '#f59e0b' : '#ef4444'; x.fillRect(12, 36, 168 * f, 10);
      x.font = 'bold 22px sans-serif'; x.fillStyle = '#fff'; x.textAlign = 'left'; x.textBaseline = 'alphabetic';
      x.fillText((f > .5 ? '🙂' : f > .2 ? '😐' : '😠') + ' ' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'), 12, 28);
      sp.material.map.needsUpdate = true;
    }
    var _tickCU = tickCU;
    tickCU = function (dt) {
      _tickCU.apply(this, arguments);
      safe(function () {
        var tt = clock.elapsedTime, now = performance.now();
        CU.forEach(function (c) {
          var on = c.s == 'wait' && c.asked && c.t0;
          if (on && !c.__bar && c.g) { c.__bar = barSprite(); c.g.add(c.__bar); c.__bt = 0; }
          if (!on) { if (c.__bar) { c.g.remove(c.__bar); c.__bar = null; } return; }
          if (now - c.__bt > 500) { c.__bt = now; drawBar(c); }
          if (c.t0 - c.t > BAL.nervousAfterSec) {            // нервничает: переминается, поглядывает на часы
            var a = c.g.userData, ph = (tt + c.sl * 2) % 6;
            c.g.rotation.z = Math.sin(tt * 3.1 + c.sl) * .035;
            if (a && a.ar && a.ar[0]) a.ar[0].rotation.x = ph < 2.2 ? -1.3 : 0;
          }
        });
      });
    };

    /* ---------- онлайн-заказы: появляются в паузах (пока нет живого клиента); [O] — список; срок до конца дня ---------- */
    var ONL = [], onT = rnd2(BAL.onlineEvery[0], BAL.onlineEvery[1]), onN = 0, ONC = [250, 450, 700, 1100, 1800];
    var badge = document.createElement('div');
    badge.style.cssText = 'position:fixed;right:18px;top:64px;z-index:8000;display:none;padding:7px 12px;border-radius:10px;background:rgba(10,14,26,.88);color:#a5f3fc;font:600 13px system-ui,sans-serif;border:1px solid rgba(34,211,238,.5);cursor:pointer';
    document.body.appendChild(badge);
    function onUpd() { badge.style.display = ONL.length && mode == 'play' ? 'block' : 'none'; badge.textContent = '🛒 Онлайн-заказов: ' + ONL.length + ' · [O]'; }
    function shipOnline(o) {
      var pool = carry ? [carry] : G.pcs;
      var ok = pool.map(function (p, i) { return { p: p, i: i }; }).filter(function (a) { return a.p.v >= o.min && (!o.br || a.p.gb == o.br); }).sort(function (a, b) { return a.p.v - b.p.v; })[0];
      if (!ok) { toast('Подходящего ПК нет: нужен ПК от ' + money(o.min) + (o.br ? ', видеокарта ' + o.br : '') + '. Собери и возьми в руки.'); try { sfx('error'); } catch (e) { } return; }
      var mgn = ok.p.v / 100 * BAL.onlineMarginPct, pay = ok.p.v + mgn;
      G.m += pay; if (carry) dropCarry(); else G.pcs.splice(ok.i, 1);
      ONL.splice(ONL.indexOf(o), 1);
      toast('Онлайн-заказ отправлен курьером: +' + money(pay) + ' (прибыль +' + money(mgn) + ')');
      try { sfx('sell'); hud(); save(); } catch (e) { } onUpd();
    }
    function openOnline() {
      if (mode != 'play') return;
      if (!ONL.length) { toast('Онлайн-заказов пока нет — они появляются, когда нет живых клиентов.'); return; }
      var opts = ONL.map(function (o) { return ['ПК от ' + money(o.min) + (o.br ? ', ' + o.br : '') + ' — прибыль +' + BAL.onlineMarginPct + '%', function () { shipOnline(o); }]; });
      opts.push(['Закрыть', function () { }]);
      talk([['🛒 Онлайн-заказы', 'Отправь готовый ПК курьером. Срок — до конца дня. Живой клиент важнее.']], null, opts);
    }
    badge.onclick = openOnline;
    addEventListener('keydown', function (e) { if (!e.repeat && e.code == 'KeyO' && mode == 'play') openOnline(); });
    setInterval(function () {
      safe(function () {
        if (!G || mode != 'play' || !G.tid) { onUpd(); return; }
        var live = CU.some(function (c) { return c.s == 'in' || c.s == 'wait'; });
        if (!live && ONL.length < BAL.onlineMax && --onT <= 0) {
          onT = rnd2(BAL.onlineEvery[0], BAL.onlineEvery[1]);
          ONL.push({ id: ++onN, min: pickOf(ONC), br: Math.random() < .4 ? pickOf(['Nvira', 'Radion']) : null });
          toast('🛒 Новый онлайн-заказ! Нажми [O], чтобы открыть список.');
        }
        onUpd();
      });
    }, 1000);
    var _next = next; next = function () { ONL.length = 0; try { onUpd(); } catch (e) { } return _next.apply(this, arguments); };

    /* ---------- РЕМОНТ ---------- */
    var SPOT = { x: -1.5, y: 2.16, z: -5.6 }, MON = { x: -2.55, z: -5.6 }; window.__ordPts = { SPOT: SPOT, MON: MON };

    /* ---- звук: сигналы азбукой Морзе ---- */
    var AC2 = null;
    function ac() { try { if (!AC2) AC2 = new (window.AudioContext || window.webkitAudioContext)(); if (AC2.state == 'suspended') AC2.resume(); } catch (e) { } return AC2; }
    function beepAt(t, d) {
      var A2 = ac(); if (!A2 || !opt.s) return;
      var o = A2.createOscillator(), g = A2.createGain(), v = .07 * (typeof window.__vol == 'number' ? window.__vol : 1);
      o.type = 'square'; o.frequency.value = 780; o.connect(g); g.connect(A2.destination);
      var t0 = A2.currentTime + t; g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(v, t0 + .01); g.gain.setValueAtTime(v, t0 + d - .02); g.gain.linearRampToValueAtTime(0, t0 + d);
      o.start(t0); o.stop(t0 + d + .02);
    }
    var LEDT = [];
    function playCode(code, reps, j) {                 // возвращает длительность, сек
      var t = 0, DOT = .17, DASH = .5, GAP = .17, k, i;
      LEDT.forEach(clearTimeout); LEDT = [];
      for (k = 0; k < reps; k++) {
        for (i = 0; i < code.length; i++) {
          var d = code[i] == '·' ? DOT : DASH; beepAt(t, d);
          (function (on, off) {
            LEDT.push(setTimeout(function () { if (j && j.mk) j.mk.material.color.setHex(0xfef08a); }, on * 1000));
            LEDT.push(setTimeout(function () { if (j && j.mk) j.mk.material.color.setHex(j.fixed ? 0x22c55e : 0x7f1d1d); }, off * 1000));
          })(t, t + d);
          t += d + GAP;
        }
        t += .85;
      }
      return t;
    }

    /* ---- монитор ---- */
    function mkScreenTex() {
      var c = document.createElement('canvas'); c.width = 256; c.height = 160; var tx = new THREE.CanvasTexture(c); return { c: c, tx: tx };
    }
    function paintScreen(j, kind) {
      var c = j.scr.c, x = c.getContext('2d'), W = c.width, H = c.height;
      x.fillStyle = kind == 'off' ? '#050607' : kind == 'err' ? '#0b1020' : kind == 'ok' ? '#06220f' : '#0a1b3a'; x.fillRect(0, 0, W, H);
      x.textAlign = 'center'; x.textBaseline = 'middle';
      function tx(t, y, col, fs) { x.fillStyle = col; x.font = 'bold ' + fs + 'px sans-serif'; x.fillText(t, W / 2, y); }
      if (kind == 'nosig') { tx('НЕТ СИГНАЛА', H / 2 - 8, '#e2e8f0', 22); tx('нажми [E] на ПК — включить', H / 2 + 24, '#94a3b8', 13); }
      else if (kind == 'err') { tx('POST ERROR', 46, '#f87171', 26); tx('Система не загрузилась', 84, '#e2e8f0', 15); tx('Слушай сигналы ПК и', 112, '#fde68a', 14); tx('смотри в справочник', 130, '#fde68a', 14); }
      else if (kind == 'ok') { tx('✓ ПК ИСПРАВЕН', 60, '#4ade80', 24); tx('Система загружается…', 100, '#bbf7d0', 15); }
      else if (kind == 'on') { tx('ЗАГРУЗКА…', H / 2, '#93c5fd', 20); }
      j.scr.tx.needsUpdate = true;
    }
    function buildMonitor(j) {
      var m = new THREE.Group(), s = mkScreenTex(); j.scr = s;
      var dark = new THREE.MeshStandardMaterial({ color: 0x15171c, roughness: .5, metalness: .3 });
      function B2(w, h, d, x, y, z) { var o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), dark); o.position.set(x, y, z); o.castShadow = true; m.add(o); return o; }
      B2(.5, .04, .3, 0, .02, 0); B2(.07, .34, .06, 0, .21, -.02); B2(.9, .56, .05, 0, .6, 0);
      var sc = new THREE.Mesh(new THREE.PlaneGeometry(.82, .48), new THREE.MeshBasicMaterial({ map: s.tx })); sc.position.set(0, .6, .03); m.add(sc);
      m.position.set(MON.x, 1.67, MON.z); m.rotation.y = .25; scene.add(m); j.mon = m; paintScreen(j, 'off'); return m;
    }
    function addCable(j, done) {
      var pts = [[MON.x + .12, 1.7, MON.z - .1], [MON.x + .35, 1.69, MON.z + .35], [SPOT.x - .75, 1.69, SPOT.z + .5], [SPOT.x - .5, 1.95, SPOT.z + .15]].map(function (a) { return new THREE.Vector3(a[0], a[1], a[2]); });
      var geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, .018, 6, false), cb = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x0b0b0e, roughness: .6 }));
      scene.add(cb); j.cable = cb; var n = geo.index.count; geo.setDrawRange(0, 0);
      try { sfx('cable'); } catch (e) { }
      tw(1.3, function (u) { geo.setDrawRange(0, Math.floor(n * u / 3) * 3); }, function () { geo.setDrawRange(0, n); done && done(); });
    }

    function buildPC() {
      var p = { n: 'ПК клиента', v: rnd2(250, 900), gb: ['Nvira', 'Radion'][rnd2(0, 1)], cb: ['Ryzor', 'Corex'][rnd2(0, 1)] };
      var g;
      try { g = window.mkShowPC(p); } catch (e) { g = PB[0](CAT[0][1]); }
      g.scale.setScalar(.213); g.position.set(SPOT.x, SPOT.y, SPOT.z); g.rotation.y = .12;
      g.traverse(function (o) { if (o.userData && o.userData.fan) o.userData.on = 0; });      // сломан: вентиляторы стоят
      scene.add(g); return g;
    }
    function marker(col) {
      var m = new THREE.Mesh(new THREE.SphereGeometry(.38, 16, 12), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .8, depthWrite: false }));
      m.position.set(0, 2.9, 1.0); return m;
    }
    /* ---- видимая пыль внутри корпуса (неисправность «забит пылью») ---- */
    function dustTex() {
      var c = document.createElement('canvas'); c.width = c.height = 128; var x = c.getContext('2d');
      for (var i = 0; i < 70; i++) { var g = x.createRadialGradient(0, 0, 0, 0, 0, 1); x.save(); x.translate(20 + Math.random() * 88, 20 + Math.random() * 88); x.scale(8 + Math.random() * 26, 6 + Math.random() * 20); g.addColorStop(0, 'rgba(165,156,136,.55)'); g.addColorStop(1, 'rgba(165,156,136,0)'); x.fillStyle = g; x.beginPath(); x.arc(0, 0, 1, 0, 7); x.fill(); x.restore(); }
      x.strokeStyle = 'rgba(150,142,125,.5)'; x.lineWidth = 1.2; for (i = 0; i < 40; i++) { x.beginPath(); var sx = Math.random() * 128, sy = Math.random() * 128; x.moveTo(sx, sy); x.quadraticCurveTo(sx + (Math.random() - .5) * 30, sy + (Math.random() - .5) * 30, sx + (Math.random() - .5) * 40, sy + (Math.random() - .5) * 40); x.stroke(); }
      var t = new THREE.CanvasTexture(c); return t;
    }
    function addDust(g) {
      var D = new THREE.Group(), tx = dustTex(), P0 = [[-.78, .9, .55], [-2.05, .15, .55], [-.2, 1.1, .5], [-1.35, -1.6, .6]];
      function reg(m, op, sp) { m.userData.o = op; m.userData.z0 = m.position.z; m.userData.x0 = m.position.x; m.userData.y0 = m.position.y; m.userData.sp = sp; m.userData.s0 = m.scale.clone(); D.add(m); return m; }
      P0.forEach(function (p, i) {                                      // пыльная пелена перед вентиляторами и платами
        var m = new THREE.Mesh(new THREE.PlaneGeometry(1.8 + i * .3, 1.8 + i * .2), new THREE.MeshBasicMaterial({ map: tx, transparent: true, opacity: .8, depthWrite: false, side: THREE.DoubleSide }));
        m.position.set(p[0], p[1], p[2]); m.rotation.z = i; reg(m, .8, 1.2);
      });
      for (var k = 0; k < 34; k++) {                                    // серые «валенки» пыли на деталях и на дне корпуса
        var base = [[-.78, 1.6, -.4], [-2.0, .4, -.1], [-.15, 1.85, -.4], [-1.35, -1.35, .1], [0, -2.25, .6], [-2.5, -2.25, .3]][k % 6];
        var s = new THREE.Mesh(new THREE.SphereGeometry(.12 + Math.random() * .2, 8, 6), new THREE.MeshStandardMaterial({ color: 0x9a927f, roughness: 1, transparent: true, opacity: .95 }));
        s.scale.set(1.4 + Math.random(), .45, 1 + Math.random() * .6); s.position.set(base[0] + (Math.random() - .5) * 1.3, base[1], base[2] + (Math.random() - .5) * .9); reg(s, .95, 1.6 + Math.random());
      }
      for (k = 0; k < 14; k++) {                                         // свисающие нити пыли
        var h = .3 + Math.random() * .5, st = new THREE.Mesh(new THREE.CylinderGeometry(.012, .008, h, 4), new THREE.MeshBasicMaterial({ color: 0xb4ac9a, transparent: true, opacity: .8 }));
        st.position.set(-2.8 + Math.random() * 2.6, .3 + Math.random() * 1.6, .1 + Math.random() * .5); st.rotation.z = (Math.random() - .5) * .5; reg(st, .8, 2);
      }
      g.add(D); g.userData.dust = D; return D;
    }
    function blowDust(g, u) {
      var D = g.userData.dust; if (!D) return;
      D.children.forEach(function (m) { var d = m.userData; m.material.opacity = d.o * Math.max(0, 1 - Math.pow(u, 1.3)); m.position.z = d.z0 + u * d.sp * 3; m.position.x = d.x0 + Math.sin(u * 8 + d.sp) * .4 * u; m.position.y = d.y0 + u * .6; var q = 1 + u * .8; m.scale.set(d.s0.x * q, d.s0.y * q, d.s0.z * q); });
      if (u >= 1) { g.remove(D); g.userData.dust = null; }
    }
    function acceptRepair(c) {
      if (JOB) { toast('Верстак для ремонта занят.'); leaveC(c); return; }
      var g = buildPC(), mk = marker(0x7f1d1d); g.add(mk);
      try { if (c.fault && c.fault.k == 'dust') addDust(g); } catch (e) { console.error(e); }
      JOB = { c: c, f: c.fault, g: g, fee: c.fee, conn: 0, on: 0, fixed: 0, mk: mk, busy: 0 };
      buildMonitor(JOB);
      try { mkPanel(JOB); } catch (e) { console.error(e); }
      g.userData.act = function () { repairAct(); };
      c.rep = 1;
      try { sfx('put'); } catch (e) { }
      toast('ПК клиента — на верстаке слева, рядом монитор. Подключи ПК к монитору — нажми [E] на ПК.');
      say('Хорошо, посмотрим.');
    }
    function findPart(cl) {
      if (typeof hand !== 'undefined' && hand && hand.c == cl) return hand;
      return G.st.find(function (x) { return x.c == cl && !x.pl && !x.h && !x.fl; }) || null;
    }
    function consume(x) {
      var i = G.st.indexOf(x); if (i >= 0) G.st.splice(i, 1);
      if (hand === x) { try { setHand(null); } catch (e) { hand = null; } }
      try { shelf(); } catch (e) { }
    }
    var PARTN = { 6: 'Блок питания', 4: 'Оперативная память', 5: 'Видеокарта', 3: 'Кулер процессора', 2: 'Процессор', 1: 'Материнская плата' };

    function repairAct() {
      if (!JOB || JOB.busy || A.lock) return;
      var j = JOB;
      if (j.fixed) { toast('Починено. Клиент ждёт у стойки — поговори с ним [E].'); return; }
      if (!j.conn) {
        j.busy = 1; toast('Подключаю ПК к монитору…');
        addCable(j, function () { j.busy = 0; j.conn = 1; paintScreen(j, 'nosig'); toast('Монитор подключён. Теперь включи ПК — нажми [E] на ПК.'); });
        return;
      }
      if (!j.on) { j.on = 1; powerOn(j); return; }
      if (j.beeping) { toast('Слушай сигнал…'); return; }
      menuMain(j);
    }
    function powerOn(j) {
      try { sfx('power'); } catch (e) { }
      j.busy = 1; paintScreen(j, 'on');
      setTimeout(function () {
        if (JOB !== j) return;
        paintScreen(j, 'err'); j.beeping = 1;
        var dur = playCode(j.f.code, 2, j);
        toast('ПК пищит! Это азбука Морзе: · — короткий, — — длинный. Найди в справочнике (красная книга на верстаке справа) решение.');
        setTimeout(function () { if (JOB === j) { j.beeping = 0; j.busy = 0; } }, dur * 1000 + 100);
      }, 1200);
    }
    function menuMain(j) {
      talk([['Верстак', 'ПК подключён и выдаёт ошибку. Что делаем?']], null, [
        ['Прослушать сигнал ещё раз', function () { j.beeping = 1; var d = playCode(j.f.code, 2, j); setTimeout(function () { if (JOB === j) j.beeping = 0; }, d * 1000 + 100); }],
        ['Ремонтировать…', function () { menuAction(j); }],
        ['Отмена', function () { }]
      ]);
    }
    function menuAction(j) {
      talk([['Верстак', 'Что сделать с ПК? (подсказка — в справочнике)']], null, [
        ['Почистить от пыли', function () { attempt(j, 'dust', -1); }],
        ['Заменить термопасту', function () { attempt(j, 'paste', -1); }],
        ['Заменить деталь…', function () { menuPart(j); }],
        ['Назад', function () { menuMain(j); }]
      ]);
    }
    function menuPart(j) {
      var ks = [6, 4, 5, 3, 2, 1];
      talk([['Верстак', 'Какую деталь заменить?']], null, ks.map(function (k) { return [PARTN[k], function () { attempt(j, 'part', k); }]; }).concat([['Назад', function () { menuAction(j); }]]));
    }
    /* =====================================================================
       ФИЗИЧЕСКИЙ РЕМОНТ: ПК приходит с закрытой боковой крышкой. Чтобы заменить деталь, нужно по шагам:
       отвернуть винты → снять крышку → отключить/открутить → достать старую деталь → вставить новую → закрутить → поставить крышку.
       Каждый шаг — нажатие [E] на ПК. Старая и новая детали видны в руках мастера (настоящие 3D-модели деталей).
       ===================================================================== */
    var RH = null;
    function repHud(t) {
      if (!RH) { RH = document.createElement('div'); RH.style.cssText = 'position:fixed;left:50%;bottom:96px;transform:translateX(-50%);z-index:9000;padding:10px 18px;border-radius:12px;background:rgba(10,14,26,.9);color:#e8ecf5;font:600 15px system-ui,sans-serif;border:1px solid rgba(120,160,255,.45);pointer-events:none;display:none;text-align:center;max-width:80vw'; document.body.appendChild(RH); }
      if (!t) { RH.style.display = 'none'; return; } RH.style.display = 'block'; RH.innerHTML = t;
    }
    var SILV = new THREE.MeshStandardMaterial({ color: 0xcfd6e2, metalness: .8, roughness: .3 });
    function mkPanel(j) {
      var g = j.g; g.updateMatrixWorld(true);
      var b = new THREE.Box3().setFromObject(g), sz = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
      var w = sz.x * .98, h = sz.y * .96, P = new THREE.Group();
      var plate = new THREE.Mesh(new THREE.BoxGeometry(w, h, .03), new THREE.MeshStandardMaterial({ color: 0x2b3345, metalness: .6, roughness: .45 })); plate.castShadow = true; P.add(plate);
      P.screws = [];
      [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(function (q) {
        var sc = new THREE.Mesh(new THREE.CylinderGeometry(.028, .028, .035, 10), SILV); sc.rotation.x = Math.PI / 2; sc.position.set(q[0] * (w / 2 - .07), q[1] * (h / 2 - .07), .03); sc.userData.on = 1; P.add(sc); P.screws.push(sc);
      });
      P.position.set(c.x, c.y, b.max.z + .02); P.rotation.y = g.rotation.y; P.userData.home = P.position.clone(); P.userData.w = w; P.userData.h = h;
      scene.add(P); j.panel = P; j.open = 0; return P;
    }
    function wob(j, d) { var g = j.g, y0 = g.position.y; tw(d || .4, function (u) { g.position.y = y0 + Math.sin(u * 20) * .004; g.rotation.z = Math.sin(u * 14) * .008; }, function () { g.position.y = y0; g.rotation.z = 0; }); }
    function partVis(cl, item, dark) {
      var m = null; try { m = PB[cl](item); } catch (e) { m = null; }
      if (!m) { m = new THREE.Mesh(new THREE.BoxGeometry(1, .5, 1), new THREE.MeshStandardMaterial({ color: 0x556070 })); }
      var b = new THREE.Box3().setFromObject(m), sz = b.getSize(new THREE.Vector3()), mx = Math.max(sz.x, sz.y, sz.z) || 1, k = .55 / mx;
      var G2 = new THREE.Group(); m.scale.multiplyScalar(k); m.updateMatrixWorld(true); var b2 = new THREE.Box3().setFromObject(m), c2 = b2.getCenter(new THREE.Vector3());
      m.position.sub(c2); G2.add(m);
      if (dark) G2.traverse(function (o) { if (o.isMesh && o.material) { o.material = o.material.clone(); if (o.material.color) o.material.color.multiplyScalar(.45); } });
      return G2;
    }
    function pcC(j) { var b = new THREE.Box3().setFromObject(j.g); return { c: b.getCenter(new THREE.Vector3()), b: b }; }
    function dropVis(j, key) { var v = j[key]; if (v) { scene.remove(v); j[key] = null; } }
    function doStep(j, s, k, cb) {
      var kind = s[2], P = j.panel, info = pcC(j), c = info.c;
      if (kind == 'sOut') {
        var sc = P && P.screws.filter(function (x) { return x.userData.on; })[0];
        try { sfx('screw'); } catch (e) { }
        if (!sc) { cb(); return; } wob(j, .35);
        var y0 = sc.position.z; tw(.5, function (u) { sc.position.z = y0 + .18 * u; sc.rotation.y = u * 18; sc.scale.setScalar(1 - Math.max(0, u - .6) * 2.5); }, function () { sc.visible = false; sc.userData.on = 0; sc.scale.setScalar(1); sc.rotation.y = 0; sc.position.z = .03; cb(); });
      } else if (kind == 'sIn') {
        var sc2 = P && P.screws.filter(function (x) { return !x.userData.on; })[0];
        try { sfx('screw'); } catch (e) { }
        if (!sc2) { cb(); return; } sc2.visible = true; wob(j, .35);
        tw(.45, function (u) { sc2.position.z = .03 + .18 * (1 - u); sc2.rotation.y = u * 18; }, function () { sc2.position.z = .03; sc2.userData.on = 1; cb(); });
      } else if (kind == 'panelOff') {
        try { sfx('put'); } catch (e) { }
        var h0 = P.userData.home; tw(.9, function (u) { P.position.set(h0.x - 1.1 * u, h0.y - .15 * Math.sin(u * 3.1), h0.z + .35 * u); P.rotation.z = -.35 * u; }, function () { P.visible = false; cb(); });
      } else if (kind == 'panelOn') {
        try { sfx('put'); } catch (e) { }
        var h1 = P.userData.home; P.visible = true; tw(.8, function (u) { var v = 1 - u; P.position.set(h1.x - 1.1 * v, h1.y, h1.z + .35 * v); P.rotation.z = -.35 * v; }, function () { P.position.copy(h1); P.rotation.z = 0; cb(); });
      } else if (kind == 'screw') {
        try { sfx('screw'); } catch (e) { }
        wob(j, .5); var m = new THREE.Mesh(new THREE.CylinderGeometry(.022, .022, .04, 8), SILV), bb = info.b;
        m.position.set(bb.min.x + Math.random() * (bb.max.x - bb.min.x), bb.min.y + (bb.max.y - bb.min.y) * (.3 + Math.random() * .5), bb.max.z + .03); m.rotation.x = Math.PI / 2; scene.add(m);
        var yy = m.position.y, zz = m.position.z; tw(.6, function (u) { m.position.z = zz + .2 * u; m.position.y = yy - .5 * u * u; m.rotation.y = u * 14; }, function () { scene.remove(m); cb(); });
      } else if (kind == 'act') {
        try { sfx(/кабел|вентилятор/i.test(s[0]) ? 'cable' : 'put'); } catch (e) { } wob(j, .5); setTimeout(cb, 500);
      } else if (kind == 'blow') {
        try { sfx('screw'); } catch (e) { }
        j.blowN = (j.blowN || 0) + 1; var u0 = (j.blowN - 1) / 5, u1 = Math.min(1, j.blowN / 5);
        tw(.9, function (u) { try { blowDust(j.g, u0 + (u1 - u0) * u); } catch (e) { } }, function () { cb(); });
      } else if (kind == 'pull') {
        try { sfx('put'); } catch (e) { }
        dropVis(j, 'oldVis'); var v = partVis(j.cl, CAT[j.cl][0], true); v.position.copy(c); scene.add(v); j.oldVis = v;
        var tx = c.x + .55, ty = info.b.max.y + .35, tz = info.b.max.z + .35; tw(.9, function (u) { v.position.set(c.x + (tx - c.x) * u, c.y + (ty - c.y) * u, c.z + (tz - c.z) * u); v.rotation.y = u * 3; }, function () { cb(); });
      } else if (kind == 'push') {
        try { sfx('put'); } catch (e) { }
        dropVis(j, 'oldVis'); var nv = partVis(j.cl, CAT[j.cl][j.newI != null ? j.newI : 0], false); var sx = c.x + .55, sy = info.b.max.y + .35, sz = info.b.max.z + .35;
        nv.position.set(sx, sy, sz); scene.add(nv); tw(.9, function (u) { nv.position.set(sx + (c.x - sx) * u, sy + (c.y - sy) * u, sz + (c.z - sz) * u); nv.scale.setScalar(1 - u * .6); }, function () { scene.remove(nv); cb(); });
      } else { cb(); }
    }
    function runSteps(j, steps, done) {
      var si = 0, k = 0, prev = j.g.userData.act;
      function render() {
        var s = steps[si];
        repHud('Шаг ' + (si + 1) + '/' + steps.length + ': ' + s[0] + (s[1] > 1 ? ' (' + (k + 1) + '/' + s[1] + ')' : '') + '<div style="opacity:.7;font-weight:400;font-size:13px;margin-top:2px">наведи на ПК и нажми [E]</div>');
      }
      function finish() { j.g.userData.act = prev; repHud(null); done && done(); }
      j.g.userData.act = function () {
        if (j.busy || A.lock) return; var s = steps[si]; j.busy = 1;
        doStep(j, s, k, function () { j.busy = 0; k++; if (k >= s[1]) { si++; k = 0; } if (si >= steps.length) { finish(); return; } render(); });
      };
      render();
    }
    var OPEN = [['Отверни винты боковой крышки', 4, 'sOut'], ['Сними боковую крышку', 1, 'panelOff']];
    var CLOSE = [['Поставь боковую крышку на место', 1, 'panelOn'], ['Закрути винты крышки', 4, 'sIn']];
    var PS = {
      6: [['Отключи кабели питания от платы', 1, 'act'], ['Отверни винты блока питания', 4, 'screw'], ['Вытащи старый блок питания', 1, 'pull'], ['Вставь новый блок питания', 1, 'push'], ['Закрути винты блока питания', 4, 'screw'], ['Подключи кабели питания', 1, 'act']],
      4: [['Отогни фиксаторы слота памяти', 1, 'act'], ['Вытащи старый модуль памяти', 1, 'pull'], ['Вставь новый модуль до щелчка', 1, 'push'], ['Защёлкни фиксаторы', 1, 'act']],
      5: [['Отверни винт крепления видеокарты', 1, 'screw'], ['Отогни защёлку PCIe-слота', 1, 'act'], ['Вытащи старую видеокарту', 1, 'pull'], ['Вставь новую видеокарту', 1, 'push'], ['Закрути винт крепления', 1, 'screw']],
      3: [['Отключи вентилятор кулера', 1, 'act'], ['Отпусти крепление кулера', 2, 'screw'], ['Сними старый кулер', 1, 'pull'], ['Нанеси термопасту', 1, 'act'], ['Установи новый кулер', 1, 'push'], ['Закрепи кулер', 2, 'screw'], ['Подключи вентилятор', 1, 'act']],
      2: [['Сними кулер процессора', 2, 'screw'], ['Открой рычаг сокета', 1, 'act'], ['Достань старый процессор', 1, 'pull'], ['Вставь новый процессор по метке-треугольнику', 1, 'push'], ['Закрой рычаг сокета', 1, 'act'], ['Нанеси термопасту', 1, 'act'], ['Поставь кулер на место', 2, 'screw']],
      1: [['Отключи все кабели от платы', 1, 'act'], ['Отверни винты материнской платы', 6, 'screw'], ['Достань старую плату', 1, 'pull'], ['Установи новую плату', 1, 'push'], ['Закрути винты платы', 6, 'screw'], ['Подключи все кабели', 1, 'act']]
    };
    var PASTE = [['Сними кулер процессора', 2, 'screw'], ['Сотри старую термопасту', 1, 'act'], ['Нанеси новую термопасту', 1, 'act'], ['Установи кулер на место', 2, 'screw']];
    var DUST = [['Продуй вентиляторы и радиаторы', 3, 'blow'], ['Продуй платы и дно корпуса', 2, 'blow']];

    function attempt(j, kind, cl) {
      if (j.busy) return;
      if (j.panel && !j.open) { runSteps(j, OPEN, function () { j.open = 1; attempt(j, kind, cl); }); return; }
      var f = j.f, right = kind == 'part' ? (f.need == cl) : (f.k == kind);
      if (kind == 'part' && !right) {
        toast('Достал деталь, проверил — она исправна. Поставил обратно. ПК пищит так же. Сверься со справочником.'); try { sfx('error'); } catch (e) { }
        j.c.t = Math.max(1, j.c.t - 20); return;
      }
      var part = null;
      if (kind == 'part') {
        part = findPart(cl);
        if (!part) { toast('Нет запасной детали: ' + CN[cl].toLowerCase() + '. Купи в маркете (терминал справа) и возьми с полки.'); try { sfx('error'); } catch (e) { } return; }
      }
      j.cl = kind == 'part' ? cl : 3; j.newI = part ? part.i : 0;
      var steps = kind == 'part' ? PS[cl] : kind == 'dust' ? DUST : PASTE;
      var d0 = part ? D(part) : null;
      runSteps(j, steps, function () {
        if (!right) { toast('Не помогло — ПК пищит так же. Сверься со справочником.'); try { sfx('error'); } catch (e) { } j.c.t = Math.max(1, j.c.t - 20); return; }
        var fin = function () {
          if (part) { j.part = d0; consume(part); }
          j.fixed = 1; j.pay = Math.round(j.fee + (d0 ? d0.p * (1 + BAL.partMarkupPct / 100) : 0));
          j.g.traverse(function (o) { if (o.userData && o.userData.fan) o.userData.on = 1; });
          j.mk.material.color.setHex(0x22c55e);
          paintScreen(j, 'ok'); try { sfx('power'); } catch (e) { } beepAt(0, .15);
          toast('Готово! ПК загрузился с одним коротким сигналом. Подойди к клиенту [E] — он заплатит ' + money(j.pay) + '.');
          say('Работает!'); try { save(); } catch (e) { }
        };
        if (j.panel) { toast('Деталь заменена. Закрой корпус.'); runSteps(j, CLOSE, function () { j.open = 0; fin(); }); } else fin();
      });
    }

    /* ---- справочник мастера ---- */
    function bookHTML() {
      var h = '<div style="text-align:left;font-size:13.5px;line-height:1.35;max-height:62vh;overflow:auto">' +
        '<div style="opacity:.8;margin-bottom:6px">При запуске неисправный ПК пищит азбукой Морзе: <b>·</b> — короткий писк, <b>—</b> — длинный. Сигнал повторяется дважды.</div>' +
        '<table style="border-collapse:collapse;width:100%">';
      FAULTS.forEach(function (f) {
        h += '<tr style="border-top:1px solid rgba(255,255,255,.15)"><td style="padding:4px 8px 4px 0;white-space:nowrap;font-family:monospace;font-size:18px;color:#fde68a">' + f.code.split('').join(' ') + '</td>' +
          '<td style="padding:4px 8px"><b>' + f.n + '</b></td><td style="padding:4px 0;opacity:.9">→ ' + f.sol + '</td></tr>';
      });
      return h + '</table><div style="opacity:.7;margin-top:6px">Один короткий сигнал — ПК исправен. Если ремонт не помог — сигнал не изменится.</div></div>';
    }
    function openBook() {
      talk([['📖 Справочник мастера — звуковые сигналы', bookHTML()]], null, [['Закрыть книгу', function () { }]]);
    }
    var _say = say; say = function (t) { if (/<[a-z]/i.test(String(t))) return; return _say.apply(this, arguments); };
    var book = new THREE.Group();
    (function () {
      var cover = new THREE.MeshStandardMaterial({ color: 0x9f1239, roughness: .6 }), pg = new THREE.MeshStandardMaterial({ color: 0xf5f0e6, roughness: .9 });
      var b1 = new THREE.Mesh(new THREE.BoxGeometry(.62, .07, .46), cover); b1.position.y = .035; book.add(b1);
      var b2 = new THREE.Mesh(new THREE.BoxGeometry(.58, .04, .42), pg); b2.position.set(.01, .045, 0); book.add(b2);
      var b3 = new THREE.Mesh(new THREE.BoxGeometry(.62, .02, .46), cover); b3.position.y = .075; book.add(b3);
      try { var l = lp(book, 'СПРАВОЧНИК', .5, .1, 0, .088, 0, '#fde68a', null); l.rotation.x = -Math.PI / 2; var l2 = lp(book, '· — · —', .4, .08, 0, .088, .12, '#fff', null); l2.rotation.x = -Math.PI / 2; } catch (e) { }
      var hit = new THREE.Mesh(new THREE.BoxGeometry(.9, .5, .7), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); hit.position.y = .2; book.add(hit);
      book.position.set(2.3 + (window.__r2bx || 0), 1.67, -4.5 + (window.__r2bz || 0)); book.rotation.y = -.3; book.userData.act = openBook; scene.add(book);
    })();

    function repairReturn(c) {
      if (!JOB || JOB.c !== c) { toast(c.name + ': «Спасибо, что приняли!»'); return; }
      var j = JOB;
      if (!j.fixed) { toast(c.name + ': «Ну как там мой ПК? Он на верстаке слева.»'); return; }
      talk([[c.name, 'Отлично, работает! Сколько с меня?'], ['Ты', 'За работу' + (j.part ? ' и деталь «' + j.part.n + '»' : '') + ' — ' + money(j.pay) + '.']], null, [
        ['Принять оплату', function () {
          G.m += j.pay; G.fixed = (G.fixed || 0) + 1;
          clear(); leaveC(c);
          toast(c.name + ': «Спасибо!» Ремонт: +' + money(j.pay) + (j.part ? ' (деталь ' + money(j.part.p) + ' окупилась)' : ''));
          try { sfx('sell'); hud(); save(); } catch (e) { }
        }],
        ['Скидка 20%', function () {
          var p2 = Math.round(j.pay * .8); G.m += p2; G.fixed = (G.fixed || 0) + 1;
          clear(); leaveC(c);
          toast(c.name + ': «Вот это сервис!» Ремонт: +' + money(p2));
          try { sfx('sell'); hud(); save(); } catch (e) { }
        }]
      ]);
    }
    /* если клиент ушёл (устал ждать) — ПК возвращается хозяину */
    setInterval(function () {
      safe(function () {
        if (JOB && (JOB.c.s == 'out' || JOB.c.done) && !JOB.busy) {
          if (!JOB.fixed || JOB.c.done) { var msg = JOB.fixed ? '' : 'Клиент устал ждать и забрал ПК.'; clear(); if (msg) toast(msg); }
        }
      });
    }, 700);
    function clear() { if (JOB) { try { LEDT.forEach(clearTimeout); if (JOB.mon) scene.remove(JOB.mon); if (JOB.cable) scene.remove(JOB.cable); } catch (e) { } try { JOB.g.traverse(function (o) { var i = FN.indexOf(o); if (i >= 0) FN.splice(i, 1); }); scene.remove(JOB.g); } catch (e) { } try { if (JOB.panel) scene.remove(JOB.panel); dropVis(JOB, 'oldVis'); repHud(null); } catch (e) { } JOB = null; } }
    var _sp = startPlay; startPlay = function () { clear(); return _sp.apply(this, arguments); };
    var _nx = next; next = function () { clear(); return _nx.apply(this, arguments); };
    var _tm = toMenu; toMenu = function () { clear(); return _tm.apply(this, arguments); };
    window.__orders = { faults: FAULTS, job: function () { return JOB; } };
    console.log('[orders] готово');
  }
  if (ready()) go(); else { var n = 0, iv = setInterval(function () { if (ready()) { clearInterval(iv); setTimeout(go, 300); } else if (++n > 600) clearInterval(iv); }, 100); }
})();
