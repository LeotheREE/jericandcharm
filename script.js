(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };

  var RSVP_URL = 'https://www.love-inked.com/charm-jeric';

  /* ---------- 1. Wayfinder Navigation Scroll-Spy ("Where They Are") ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.wayfinder-link'));
  var spySections = Array.prototype.slice.call(document.querySelectorAll('[data-spy]'));

  function setActiveNav(id) {
    navLinks.forEach(function (link) {
      var match = link.getAttribute('data-section') === id;
      link.classList.toggle('active', match);
    });
  }

  if ('IntersectionObserver' in window) {
    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setActiveNav(entry.target.getAttribute('data-spy'));
        }
      });
    }, { rootMargin: '-30% 0px -55% 0px', threshold: 0 });

    spySections.forEach(function (sec) { spyObserver.observe(sec); });
  }

  /* ---------- 2. Live Countdown Backup & Add to Phone Calendar (.ICS) ---------- */
  var targetEpoch = Date.UTC(2026, 11, 15, 6, 30, 0); // Dec 15, 2026 2:30 PM PHT (GMT+8)
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function tickCountdown() {
    var dEl = $('cdD'), hEl = $('cdH'), mEl = $('cdM'), sEl = $('cdS');
    if (!dEl || !hEl || !mEl || !sEl) return;
    var left = targetEpoch - Date.now();
    if (left <= 0) {
      dEl.textContent = hEl.textContent = mEl.textContent = sEl.textContent = '00';
      if ($('cdWhen')) $('cdWhen').textContent = 'Today we celebrate our marriage! Thank you for being part of it.';
      return;
    }
    var s = Math.floor(left / 1000);
    dEl.textContent = pad(Math.floor(s / 86400));
    hEl.textContent = pad(Math.floor((s % 86400) / 3600));
    mEl.textContent = pad(Math.floor((s % 3600) / 60));
    sEl.textContent = pad(s % 60);
  }
  tickCountdown();
  if (!window.__weddingCountdownInterval) {
    window.__weddingCountdownInterval = setInterval(tickCountdown, 1000);
  }

  var addCalBtn = $('addCalBtn');
  if (addCalBtn) {
    addCalBtn.addEventListener('click', function () {
      var icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Jeric and Charm Wedding//EN',
        'BEGIN:VEVENT',
        'DTSTART:20261215T063000Z',
        'DTEND:20261215T130000Z',
        'SUMMARY:Jeric & Charm Wedding Celebration',
        'DESCRIPTION:Ceremony at 2:30 PM at Our Lady of Lourdes Parish Tagaytay. Reception to follow at Palacio Cristal del Aquila.',
        'LOCATION:Our Lady of Lourdes Parish Tagaytay, Tagaytay-Nasugbu Highway, Tagaytay City',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');
      var blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'Jeric-and-Charm-Wedding.ics';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    });
  }

  /* ---------- 3. Interactive 4-Color Swatches & Hashtag Copy ---------- */
  var swatchBtns = Array.prototype.slice.call(document.querySelectorAll('.swatch-btn'));
  var swatchLabel = $('swatchLabel');
  var attireLineup = $('attireLineup');
  var attireFigures = attireLineup ? Array.prototype.slice.call(attireLineup.querySelectorAll('.f')) : [];
  var activeShade = null;

  swatchBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var shade = btn.getAttribute('data-Filter');
      if (activeShade === shade) {
        activeShade = null;
        swatchBtns.forEach(function (b) { b.classList.remove('active'); });
        if (attireLineup) attireLineup.classList.remove('filtering');
        attireFigures.forEach(function (f) { f.classList.remove('matched'); });
        if (swatchLabel) swatchLabel.textContent = 'Tap a shade to preview outfit inspiration';
      } else {
        activeShade = shade;
        swatchBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        if (attireLineup) attireLineup.classList.add('filtering');
        attireFigures.forEach(function (f) {
          var shades = (f.getAttribute('data-shade') || '').split(',');
          f.classList.toggle('matched', shades.indexOf(shade) !== -1);
        });
        if (swatchLabel) swatchLabel.textContent = btn.getAttribute('data-color');
      }
    });
  });

  var copyHashBtn = $('copyHashBtn');
  var copyHashFeedback = $('copyHashFeedback');
  if (copyHashBtn) {
    copyHashBtn.addEventListener('click', function () {
      var text = '#JERICFoundHisSpecialCHARMone';
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        copyHashFeedback.textContent = 'Hashtag copied to clipboard!';
        setTimeout(function () { copyHashFeedback.textContent = ''; }, 2500);
      } catch (err) {}
      document.body.removeChild(ta);
    });
  }

  /* ---------- 4. QR Codes Generator ---------- */
  function qrSvg(text) {
    if (!window.qrcode) return '';
    try {
      var q = window.qrcode(0, 'M');
      q.addData(text);
      q.make();
      var n = q.getModuleCount(), d = '', r, c;
      for (r = 0; r < n; r++) for (c = 0; c < n; c++) if (q.isDark(r, c)) d += 'M' + c + ' ' + r + 'h1v1h-1z';
      var w = n + 4;
      return '<svg viewBox="-2 -2 ' + w + ' ' + w + '" shape-rendering="crispEdges" aria-hidden="true"><rect x="-2" y="-2" width="' + w + '" height="' + w + '" fill="#ffffff"/><path d="' + d + '" fill="#0c1f4d"/></svg>';
    } catch (e) { return ''; }
  }
  function renderQrs() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-qr]'), function (el) {
      var s = qrSvg(el.getAttribute('data-qr'));
      if (s) el.innerHTML = s;
    });
    var rq = $('rsvpQr'), rb = $('rsvpOpen');
    if (RSVP_URL && rq) {
      var s2 = qrSvg(RSVP_URL);
      if (s2) rq.innerHTML = s2;
      rq.href = RSVP_URL;
      if (rb) rb.href = RSVP_URL;
    }
  }
  renderQrs();

  /* ---------- 5. Cover Stardust & Floating Petals Canvas ---------- */
  var cv = $('dust');
  if (cv && !reduce && cv.getContext) {
    var cx = cv.getContext('2d'), W = 0, H = 0, dpr = 1, ps = [], visible = true;
    var size = function () {
      var r = cv.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width || window.innerWidth;
      H = r.height || window.innerHeight;
      cv.width = W * dpr;
      cv.height = H * dpr;
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.max(24, Math.min(70, Math.round(W * H / 14000)));
      ps = [];
      for (var i = 0; i < n; i++) {
        ps.push({ x: Math.random() * W, y: Math.random() * H, r: 0.5 + Math.random() * 1.7, vy: 0.1 + Math.random() * 0.3, vx: (Math.random() - 0.5) * 0.18, p: Math.random() * 6.28 });
      }
    };
    size();
    window.addEventListener('resize', size);
    (function frame(t) {
      if (visible) {
        cx.clearRect(0, 0, W, H);
        for (var i = 0; i < ps.length; i++) {
          var p = ps[i];
          p.y += p.vy; p.x += p.vx + Math.sin(t / 1800 + p.p) * 0.12;
          if (p.y > H + 4) { p.y = -4; p.x = Math.random() * W; }
          cx.globalAlpha = 0.18 + 0.38 * (0.5 + 0.5 * Math.sin(t / 900 + p.p));
          cx.fillStyle = '#c9cedb';
          cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.283); cx.fill();
        }
      }
      requestAnimationFrame(frame);
    })(0);
  }

  var pc = $('petals');
  if (pc && !reduce && pc.getContext) {
    var g = pc.getContext('2d'), PW = 0, PH = 0, things = [];
    var cols = ['#ffffff', '#e4eefa', '#bcd6e6', '#9db8d0', '#cfd3de'];
    var spawn = function (init) {
      var bloom = Math.random() < 0.18;
      return {
        x: Math.random() * PW, y: init ? Math.random() * PH : -30,
        s: bloom ? 11 + Math.random() * 8 : 5 + Math.random() * 6,
        vy: 0.32 + Math.random() * 0.65, sw: 0.4 + Math.random() * 0.9,
        ph: Math.random() * 6.28, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.02,
        fl: Math.random() * 6.28, vf: 0.01 + Math.random() * 0.025,
        c: cols[(Math.random() * cols.length) | 0], a: 0.55 + Math.random() * 0.3, bloom: bloom
      };
    };
    var fit = function () {
      var r = Math.min(2, window.devicePixelRatio || 1);
      PW = window.innerWidth; PH = window.innerHeight;
      pc.width = PW * r; pc.height = PH * r;
      g.setTransform(r, 0, 0, r, 0, 0);
      var n = PW < 600 ? 16 : 28;
      while (things.length < n) things.push(spawn(true));
      things.length = n;
    };
    var petalPath = function (s) {
      g.beginPath();
      g.moveTo(0, -s);
      g.bezierCurveTo(s * 0.75, -s * 0.45, s * 0.6, s * 0.55, 0, s);
      g.bezierCurveTo(-s * 0.6, s * 0.55, -s * 0.75, -s * 0.45, 0, -s);
      g.closePath(); g.fill(); g.stroke();
    };
    fit();
    window.addEventListener('resize', fit);
    (function loop(t) {
      g.clearRect(0, 0, PW, PH);
      for (var i = 0; i < things.length; i++) {
        var p = things[i];
        p.y += p.vy;
        p.x += Math.sin(t / 1400 + p.ph) * p.sw * 0.6 + 0.15;
        p.rot += p.vr; p.fl += p.vf;
        if (p.y > PH + 40 || p.x > PW + 50) { things[i] = spawn(false); continue; }
        g.save();
        g.translate(p.x, p.y);
        g.rotate(p.rot);
        g.globalAlpha = p.a;
        g.fillStyle = p.c;
        g.strokeStyle = 'rgba(27,44,102,.35)';
        g.lineWidth = 0.7;
        if (p.bloom) {
          g.scale(1, 0.72 + 0.28 * Math.cos(p.fl));
          for (var k = 0; k < 6; k++) {
            g.save(); g.rotate(k * Math.PI / 3); g.translate(0, -p.s * 0.62);
            petalPath(p.s * 0.62);
            g.restore();
          }
        } else {
          g.scale(0.4 + 0.6 * Math.abs(Math.cos(p.fl)), 1);
          petalPath(p.s);
        }
        g.restore();
      }
      requestAnimationFrame(loop);
    })(0);
  }

  /* ---------- 6. Music: your LANY ILYSB (Stripped) song, stored inside this page and played with Web Audio ---------- */
  var musicDock = $('musicDock');
  var musicBtn = $('musicBtn');
  var loadSongBtn = $('loadSongBtn');
  var loadSongBtnText = $('loadSongBtnText');
  var customAudioInput = $('customAudioInput');
  var welcomeGate = $('welcomeGate');
  var enterInviteBtn = $('enterInviteBtn');
  var openBtn = $('openBtn');

  var AC = window.AudioContext || window.webkitAudioContext;
  var actx = null, gainNode = null, songBuf = null, srcNode = null;
  var userPaused = false;
  var isPlaying = false;

  function updateMusicUI(playing) {
    isPlaying = playing;
    if (musicDock) musicDock.classList.toggle('playing', playing);
    if (musicBtn) musicBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
  }
  function syncUI() {
    var on = !!actx && actx.state === 'running' && !!srcNode && !userPaused;
    updateMusicUI(on);
    if (on) unbindAutoUnlock();
  }

  function ensureCtx() {
    if (actx || !AC) return !!actx;
    actx = new AC();
    gainNode = actx.createGain();
    gainNode.gain.value = 0.85;
    gainNode.connect(actx.destination);
    actx.onstatechange = syncUI;
    return true;
  }
  function decode(ab) {
    return new Promise(function (resolve, reject) {
      var r = actx.decodeAudioData(ab, resolve, reject);
      if (r && r.then) r.then(resolve, reject);
    });
  }
  function begin() {
    if (!actx || !songBuf || srcNode) return;
    srcNode = actx.createBufferSource();
    srcNode.buffer = songBuf;
    srcNode.loop = true;
    srcNode.connect(gainNode);
    srcNode.start(0);
    syncUI();
  }
  function replaceSong(buf) {
    if (srcNode) { try { srcNode.stop(); } catch (e) {} srcNode.disconnect(); srcNode = null; }
    songBuf = buf;
    begin();
  }

  /* Call straight from a tap or click so the browser allows sound. */
  function startWeddingMusic() {
    if (userPaused) return;
    if (!ensureCtx()) return;
    var r = actx.resume();
    if (r && r.then) r.then(syncUI, function () {});
    begin();
    syncUI();
  }
  function stopWeddingMusic() {
    if (actx && actx.suspend) actx.suspend();
    updateMusicUI(false);
  }

  /* decode the song that is stored in the page */
  function loadEmbedded() {
    if (!ensureCtx()) return;
    if (!window.SONG_B64) return;
    var bin = atob(window.SONG_B64);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    decode(bytes.buffer).then(function (buf) {
      if (!songBuf) { songBuf = buf; begin(); }
    }).catch(function () {});
  }

  /* the first tap, touch or key press anywhere starts the music if the browser blocked it on load */
  var unlockEvents = ['pointerdown', 'touchend', 'click', 'keydown'];
  function handleFirstGesture(e) {
    if (userPaused || isPlaying) return;
    if (e && e.target && musicBtn && musicBtn.contains(e.target)) return;
    startWeddingMusic();
  }
  function bindAutoUnlock() {
    unlockEvents.forEach(function (ev) { document.addEventListener(ev, handleFirstGesture, { passive: true, capture: true }); });
  }
  function unbindAutoUnlock() {
    unlockEvents.forEach(function (ev) { document.removeEventListener(ev, handleFirstGesture, { capture: true }); });
  }

  function dismissWelcomeGate() {
    if (!welcomeGate || welcomeGate.classList.contains('closing')) return;
    welcomeGate.classList.add('closing');
    userPaused = false;
    startWeddingMusic();
    setTimeout(function () { welcomeGate.style.display = 'none'; }, 550);
  }

  if (enterInviteBtn) {
    enterInviteBtn.addEventListener('click', function (e) { e.stopPropagation(); dismissWelcomeGate(); });
  }
  if (welcomeGate) {
    welcomeGate.addEventListener('click', function () { dismissWelcomeGate(); });
  }
  if (openBtn) {
    openBtn.addEventListener('click', function () { if (!isPlaying && !userPaused) startWeddingMusic(); });
  }
  if (musicBtn) {
    musicBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (isPlaying) { userPaused = true; stopWeddingMusic(); }
      else { userPaused = false; startWeddingMusic(); }
    });
  }

  /* load a different MP3 (kept only in this browser) */
  if (loadSongBtn && customAudioInput) {
    loadSongBtn.addEventListener('click', function (e) { e.stopPropagation(); customAudioInput.click(); });
    customAudioInput.addEventListener('change', function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file || !ensureCtx()) return;
      userPaused = false;
      var rd = new FileReader();
      rd.onload = function () {
        decode(rd.result).then(function (buf) {
          replaceSong(buf); startWeddingMusic();
          if (loadSongBtnText) loadSongBtnText.textContent = 'MP3 loaded';
        }).catch(function () {});
      };
      rd.readAsArrayBuffer(file);
    });
  }

  bindAutoUnlock();
  loadEmbedded();
  startWeddingMusic();

})();
