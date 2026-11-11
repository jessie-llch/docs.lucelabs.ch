/* Lucelabs Hilfe: colour themes like on lucelabs.ch. The choice goes to <html data-palette> and local storage.
   The button is added next to Mintlify's light/dark switch, again after every page change. */
(function () {
  var KEY = 'lucelabs-palette';
  var THEMES = [
    { id: 'midnight', name: 'Mitternacht', note: 'Ruhiges Marineblau. Der Standard.', c: ['#17243a', '#a9c4e2', '#f7f8fa'] },
    { id: 'burgundy', name: 'Burgund', note: 'Warm und elegant.', c: ['#302126', '#d6a9b7', '#faf8f7'] },
    { id: 'purple', name: 'Violett', note: 'Sanft und kreativ.', c: ['#30264a', '#c4b2e5', '#f8f7fb'] },
    { id: 'petrol', name: 'Petrol und Sand', note: 'Frisches Petrol, warmer Sand.', c: ['#0e6e7a', '#e3b26b', '#f7f6f2'] },
    { id: 'stone', name: 'Stein und Signal', note: 'Schweizer Rot auf warmem Stein.', c: ['#c8341a', '#f2a65a', '#f8f5f0'] },
    { id: 'noir', name: 'Schwarz und Orange', note: 'Schwarz-Weiss mit einem Leuchten.', c: ['#1a1a1a', '#ff7a33', '#fafaf8'] }
  ];
  var html = document.documentElement;

  function read() {
    try { return localStorage.getItem(KEY) || 'midnight'; } catch (e) { return 'midnight'; }
  }
  function byId(id) {
    for (var i = 0; i < THEMES.length; i++) if (THEMES[i].id === id) return THEMES[i];
    return THEMES[0];
  }
  function dot(t) {
    var s = document.createElement('span');
    s.className = 'll-dot';
    s.setAttribute('aria-hidden', 'true');
    s.style.setProperty('--a', t.c[0]);
    s.style.setProperty('--b', t.c[1]);
    s.style.setProperty('--c', t.c[2]);
    return s;
  }
  function apply(id) {
    var t = byId(id);
    html.setAttribute('data-palette', t.id);
    var boxes = document.querySelectorAll('.ll-pal');
    for (var i = 0; i < boxes.length; i++) {
      var btn = boxes[i].querySelector('.ll-pal-btn');
      btn.replaceChild(dot(t), btn.firstChild);
      btn.setAttribute('aria-label', 'Farbthema: ' + t.name);
      var opts = boxes[i].querySelectorAll('.ll-pal-opt');
      for (var j = 0; j < opts.length; j++) {
        var on = opts[j].getAttribute('data-pal') === t.id;
        opts[j].setAttribute('aria-checked', on ? 'true' : 'false');
        opts[j].tabIndex = on ? 0 : -1;
      }
    }
  }
  function close(box, focusButton) {
    var menu = box.querySelector('.ll-pal-menu');
    if (menu.hidden) return;
    menu.hidden = true;
    box.querySelector('.ll-pal-btn').setAttribute('aria-expanded', 'false');
    if (focusButton) box.querySelector('.ll-pal-btn').focus();
  }
  function closeAll(except) {
    var boxes = document.querySelectorAll('.ll-pal');
    for (var i = 0; i < boxes.length; i++) if (boxes[i] !== except) close(boxes[i], false);
  }

  function build() {
    var box = document.createElement('div');
    box.className = 'll-pal';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'll-pal-btn';
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.appendChild(dot(THEMES[0]));
    var menu = document.createElement('div');
    menu.className = 'll-pal-menu';
    menu.hidden = true;
    var title = document.createElement('p');
    title.className = 'll-pal-title';
    title.id = 'll-pal-title-' + Math.random().toString(36).slice(2, 8);
    title.textContent = 'Farbthema';
    menu.appendChild(title);
    var group = document.createElement('div');
    group.setAttribute('role', 'radiogroup');
    group.setAttribute('aria-labelledby', title.id);
    THEMES.forEach(function (t) {
      var o = document.createElement('button');
      o.type = 'button';
      o.className = 'll-pal-opt';
      o.setAttribute('role', 'radio');
      o.setAttribute('data-pal', t.id);
      o.appendChild(dot(t));
      var text = document.createElement('span');
      var b = document.createElement('b'); b.textContent = t.name;
      var sm = document.createElement('small'); sm.textContent = t.note;
      text.appendChild(b); text.appendChild(sm);
      o.appendChild(text);
      o.insertAdjacentHTML('beforeend', '<svg class="ll-check" viewBox="0 0 16 16" aria-hidden="true"><path d="m3.5 8.5 3 3 6-6.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>');
      o.addEventListener('click', function () {
        try { localStorage.setItem(KEY, t.id); } catch (e) { /* private mode: the choice lasts for this page only */ }
        apply(t.id);
      });
      group.appendChild(o);
    });
    menu.appendChild(group);
    box.appendChild(btn);
    box.appendChild(menu);

    btn.addEventListener('click', function () {
      var open = menu.hidden;
      closeAll(box);
      menu.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        var sel = menu.querySelector('[aria-checked="true"]') || menu.querySelector('.ll-pal-opt');
        sel.focus();
      }
    });
    box.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(box, true); return; }
      if (menu.hidden || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return;
      var opts = Array.prototype.slice.call(menu.querySelectorAll('.ll-pal-opt'));
      var i = opts.indexOf(document.activeElement);
      var next = opts[(i + (e.key === 'ArrowDown' ? 1 : opts.length - 1)) % opts.length];
      next.focus();
      next.click();
      e.preventDefault();
    });
    return box;
  }

  function mount() {
    var switches = document.querySelectorAll('[role="group"][aria-label="Theme preference"]');
    var added = false;
    for (var i = 0; i < switches.length; i++) {
      var sw = switches[i];
      if (sw.previousElementSibling && sw.previousElementSibling.classList.contains('ll-pal')) continue;
      sw.parentNode.insertBefore(build(), sw);
      added = true;
    }
    if (!html.getAttribute('data-palette')) html.setAttribute('data-palette', byId(read()).id); // a page change may reset <html>
    if (added) apply(html.getAttribute('data-palette'));
  }

  html.setAttribute('data-palette', byId(read()).id);
  document.addEventListener('click', function (e) {
    if (!e.target.closest || !e.target.closest('.ll-pal')) closeAll(null);
  });
  var pending = false;
  new MutationObserver(function () {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; mount(); });
  }).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
