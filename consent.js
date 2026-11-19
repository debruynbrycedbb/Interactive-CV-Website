/* Cookies and Google Analytics 4 (Google tag GTM-M8CN4MBB), Consent Mode v2.

   Same setup as the BDB Public Hub: the Google tag always loads with cookies off,
   so Google gets anonymous, cookieless visit pings. "Accept" turns analytics
   cookies on; "Only essential" keeps them off. Ad storage is always off.
   The choice is kept in this browser (localStorage 'cv-cookies') for 6 months,
   then the banner asks again. "Cookie settings" in the footer reopens it.
   Loaded in <head> on every page (index.html, privacy.html). */
(function () {
  var TAG_ID = 'GTM-M8CN4MBB';
  var KEY = 'cv-cookies';
  var MAX_AGE = 182 * 864e5; // 6 months
  var loaded = false;
  var bar = null;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
  });

  function read() {
    try {
      var c = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (c && (c.v === 'granted' || c.v === 'denied') && Date.now() - c.t < MAX_AGE) return c.v;
    } catch (e) {}
    return null;
  }
  function save(value) {
    try { localStorage.setItem(KEY, JSON.stringify({ v: value, t: Date.now() })); } catch (e) {}
  }

  function loadTag() {
    if (loaded) return;
    loaded = true;
    window.gtag('js', new Date());
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + TAG_ID;
    document.head.appendChild(s);
  }

  // Remove Google Analytics cookies (_ga, _ga_XXXX) when consent is withdrawn.
  function clearGaCookies() {
    var host = location.hostname;
    var domains = ['', host, '.' + host];
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name.indexOf('_ga') !== 0) return;
      domains.forEach(function (d) {
        document.cookie = name + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
      });
    });
  }

  function choose(value) {
    save(value);
    window.gtag('consent', 'update', { analytics_storage: value });
    if (value === 'denied') clearGaCookies();
    close();
  }

  function close() {
    if (!bar) return;
    bar.remove();
    bar = null;
  }

  function open(focus) {
    if (bar) { bar.querySelector('button').focus(); return; }
    var current = read();
    bar = document.createElement('section');
    bar.className = 'consent';
    bar.setAttribute('aria-labelledby', 'consent-title');
    bar.innerHTML =
      '<h2 class="consent__title" id="consent-title">Cookies</h2>' +
      '<p class="consent__text">I use Google Analytics to see how many people visit this CV and which sections they read. ' +
      'Without your OK it only counts visits anonymously, without cookies. Accept to allow its cookies, or keep only the essential ones. Nothing is used for advertising. ' +
      'You can change your mind any time under "Cookie settings" at the bottom of the page.</p>' +
      '<p class="consent__more"><a href="privacy.html">Privacy &amp; cookie statement</a></p>' +
      '<div class="consent__actions">' +
      '<button class="consent__btn" type="button" data-choice="denied">Only essential</button>' +
      '<button class="consent__btn" type="button" data-choice="granted">Accept</button>' +
      '</div>' +
      (current ? '<p class="consent__now">Current choice: ' + (current === 'granted' ? 'analytics accepted' : 'only essential') + '</p>' : '');
    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-choice]');
      if (btn) choose(btn.getAttribute('data-choice'));
    });
    document.body.appendChild(bar);
    if (focus) bar.querySelector('button').focus();
  }

  if (read() === 'granted') window.gtag('consent', 'update', { analytics_storage: 'granted' });
  loadTag();

  function init() {
    document.querySelectorAll('[data-consent-open]').forEach(function (btn) {
      btn.addEventListener('click', function () { open(true); });
    });
    if (!read()) open(false);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
