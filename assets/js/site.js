/* brandenlewis.com — progressive enhancement only.
   Every feature here degrades to working HTML if JS never runs. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------ masthead
     The bar is always visible and never slides. All that changes is
     whether it carries a background — transparent over the hero image,
     opaque once content scrolls underneath it. */
  var head = document.querySelector('.masthead');
  if (head) {
    if (document.body.dataset.pinnedHeader === 'true') {
      head.classList.add('is-stuck');
    } else {
      var onScroll = function () {
        head.classList.toggle('is-stuck', window.scrollY > 40);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }

  /* ------------------------------------------------ scroll reveal */
  var targets = document.querySelectorAll('.reveal');
  if (targets.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.06 });
      targets.forEach(function (el) { io.observe(el); });
    }
  }

  /* ------------------------------------------------ youtube facades
     Each facade is a real link to youtube.com, so it works with JS off.
     With JS on we intercept and swap in an inline player instead, which
     keeps 13 third-party iframes off the critical path entirely.       */
  document.querySelectorAll('.facade').forEach(function (btn) {
    btn.addEventListener('click', function (ev) {
      var id = btn.dataset.yt;
      if (!id || btn.dataset.loaded) return;
      // Let modifier-clicks and middle-clicks open YouTube in a new tab.
      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button !== 0) return;
      ev.preventDefault();
      btn.dataset.loaded = '1';

      var frame = document.createElement('iframe');
      frame.src = 'https://www.youtube-nocookie.com/embed/' + id +
                  '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
      frame.title = btn.dataset.title || 'Video player';
      frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; ' +
                    'gyroscope; picture-in-picture; web-share';
      frame.allowFullscreen = true;
      frame.loading = 'eager';

      btn.textContent = '';
      btn.appendChild(frame);
      btn.style.cursor = 'default';
      btn.setAttribute('aria-label', 'Now playing: ' + (btn.dataset.title || 'video'));
    });
  });

  /* ------------------------------------------------ instagram facade
     Same bargain as the YouTube facades: the card stays a plain link to
     the post until someone clicks it, so Meta sees nobody who didn't ask
     to watch.

     We load Instagram's embed iframe directly rather than their embed.js.
     Their script refuses to size a blockquote injected after load (it
     leaves the iframe at height=0), and skipping it means no third-party
     JavaScript executes on the page at all. */
  document.querySelectorAll('[data-ig]').forEach(function (link) {
    link.addEventListener('click', function (ev) {
      var code = link.dataset.ig;
      if (!code || link.dataset.loaded) return;
      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button !== 0) return;
      ev.preventDefault();
      link.dataset.loaded = '1';

      var frame = document.createElement('iframe');
      frame.src = 'https://www.instagram.com/p/' + code + '/embed/';
      frame.title = link.dataset.title || 'Instagram post';
      frame.setAttribute('scrolling', 'no');
      frame.setAttribute('allowtransparency', 'true');
      frame.allow = 'encrypted-media; picture-in-picture; web-share';
      frame.allowFullscreen = true;
      frame.loading = 'eager';

      link.textContent = '';
      link.classList.add('is-live');
      link.appendChild(frame);
      link.removeAttribute('aria-label');
    });
  });

  /* ------------------------------------------------ gallery lightbox */
  var box = document.getElementById('lightbox');
  if (box && typeof box.showModal === 'function') {
    var boxImg = box.querySelector('img');
    var opener = null;

    document.querySelectorAll('.shot').forEach(function (shot) {
      shot.addEventListener('click', function () {
        var full = shot.dataset.full;
        var img = shot.querySelector('img');
        if (!full || !img) return;
        opener = shot;
        boxImg.src = full;
        boxImg.alt = img.alt;
        box.showModal();
      });
    });

    var shut = function () { box.close(); };
    box.querySelector('.lightbox__close').addEventListener('click', shut);
    box.addEventListener('click', function (e) {
      // Click anywhere outside the picture itself dismisses.
      if (e.target === box) shut();
    });
    box.addEventListener('close', function () {
      boxImg.removeAttribute('src');
      if (opener) { opener.focus(); opener = null; }
    });
  }

  /* ------------------------------------------------ video filters */
  var filters = document.querySelector('.filters');
  if (filters) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-cat]'));
    var count = document.getElementById('vcount');

    filters.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      var want = btn.dataset.filter;

      filters.querySelectorAll('button').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });

      var shown = 0;
      cards.forEach(function (card) {
        var hit = want === 'all' || card.dataset.cat === want;
        card.hidden = !hit;
        if (hit) shown++;
      });
      if (count) {
        count.textContent = shown + (shown === 1 ? ' video' : ' videos');
      }
    });
  }

})();
