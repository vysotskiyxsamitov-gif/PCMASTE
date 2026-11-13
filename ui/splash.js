/* PC МАСТЕР — splash.js: заставка студии перед загрузкой (как в больших играх).
   Название студии меняется здесь, в одной строке. Пропуск: клик, пробел, Enter, Esc. */
(function () {
  var STUDIO = 'Vysam Games';
  var SUB = 'представляет';
  var HOLD = 2600;   // сколько мс держится заставка
  var d = document.createElement('div');
  d.id = 'splash';
  d.style.cssText = 'position:fixed;inset:0;z-index:100000;background:#05060a;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:system-ui,Segoe UI,sans-serif;color:#e8ecf5;opacity:1;transition:opacity .9s ease;cursor:pointer;user-select:none';
  d.innerHTML =
    '<style>@keyframes spIn{from{opacity:0;transform:translateY(8px);letter-spacing:.5em}to{opacity:1;transform:none;letter-spacing:.32em}}' +
    '@keyframes spLine{from{width:0}to{width:min(46vw,360px)}}' +
    '@keyframes spSub{from{opacity:0}to{opacity:.6}}</style>' +
    '<div style="font-size:clamp(22px,4.2vw,46px);font-weight:700;letter-spacing:.32em;text-transform:uppercase;text-indent:.32em;animation:spIn 1.4s ease-out both"></div>' +
    '<div style="height:2px;margin:18px 0 14px;background:linear-gradient(90deg,transparent,#5b8cff,transparent);animation:spLine 1.6s .3s ease-out both"></div>' +
    '<div style="font-size:clamp(11px,1.6vw,16px);letter-spacing:.3em;text-transform:uppercase;opacity:0;animation:spSub 1s 1s ease-out forwards"></div>';
  var parts = d.querySelectorAll('div');
  parts[0].textContent = STUDIO; parts[2].textContent = SUB;
  (document.body || document.documentElement).appendChild(d);
  var gone = false;
  function bye() {
    if (gone) return; gone = true;
    d.style.opacity = '0'; d.style.pointerEvents = 'none';
    setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 950);
    window.removeEventListener('keydown', key, true);
  }
  function key(e) { if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') bye(); }
  d.addEventListener('click', bye);
  window.addEventListener('keydown', key, true);
  setTimeout(bye, HOLD);
})();
