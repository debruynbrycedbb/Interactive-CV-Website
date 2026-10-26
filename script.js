/* Bryce de Bruyn — Interactive CV
   Journey map, timeline and small page behaviours. */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------
     Data — every line below is taken word-for-word from the CV
     ---------------------------------------------------------- */
  const STOPS = [
    {
      id: "south-africa", country: "South Africa", years: "2001 – 2005", iso: "710",
      coords: [28.05, -26.2], label: "right", short: "Where I was born",
      items: [{ kind: "Born", title: "Born in South Africa in 2001" }]
    },
    {
      id: "ghana", country: "Ghana", years: "2005 – 2010", iso: "288",
      coords: [-0.19, 5.6], label: "below",
      items: [{ kind: "Primary", title: "Lincoln International Community School, Ghana" }]
    },
    {
      id: "tanzania", country: "Tanzania", years: "2010 – 2013", iso: "834",
      coords: [39.21, -6.79], label: "right",
      items: [
        { kind: "Secondary", title: "International School of Tanganyika, Tanzania" },
        {
          kind: "Volunteer experience", title: "Charcoal Eradication Project",
          desc: [
            "Led fundraising and a deforestation exhibition; sponsored LPG equipment distribution to rural households.",
            "Also ran swimming sessions with local special needs children."
          ]
        }
      ]
    },
    {
      id: "singapore", country: "Singapore", years: "2013 – 2017", iso: "702",
      coords: [103.82, 1.35], label: "right",
      items: [{ kind: "Secondary", title: "International School of Singapore" }]
    },
    {
      id: "france", country: "France", years: "2017 – 2019", iso: "250",
      coords: [2.35, 48.86], label: "left",
      items: [{ kind: "IB Diploma (International Baccalaureate)", title: "International School of Paris, France" }]
    },
    {
      id: "netherlands", country: "Netherlands", years: "2019 – 2024", iso: "528",
      coords: [5.12, 52.09], label: "rightUp",
      items: [{
        kind: "Bachelor's — Creative Business",
        title: "Hogeschool Utrecht (HU University of Applied Sciences), Netherlands",
        desc: ["Focus: international marketing, media production and business innovation"]
      }]
    }
  ];

  const PLACES = [
    {
      id: "england", country: "England", iso: "826",
      coords: [-1.09, 50.8], label: "left",
      items: [{ kind: "Additional Studies — Film & Photography", title: "Portsmouth University, England" }]
    },
    {
      id: "kenya", country: "Kenya", iso: "404",
      coords: [37.91, 0.18], label: "right",
      items: [{ kind: "Freelance Photographer & Videographer", title: "Promotional video for a boat charter company in Kenya — including aerial drone and underwater footage" }]
    },
    {
      id: "namibia", country: "Namibia", sub: "1 month", iso: "516",
      coords: [17.08, -22.56], label: "left",
      items: [{ kind: "Volunteer experience", title: "Sustainability Project", desc: ["Collected funds, expanded a community library, painted a school, built an activity adventure playground, and taught English and Maths classes."] }]
    },
    {
      id: "thailand", country: "Thailand", iso: "764",
      coords: [100.99, 15.87], label: "left",
      items: [{ kind: "Volunteer experience", title: "Elephant Rehabilitation", desc: ["Collaborated with local communities to raise awareness and care for at-risk elephants."] }]
    },
    {
      id: "borneo", country: "Borneo", iso: null,
      coords: [114.0, 0.9], label: "below",
      items: [{ kind: "Volunteer experience", title: "Reforestation Project", desc: ["Contributed to large-scale reforestation efforts on the island of Borneo."] }]
    }
  ];

  /* ----------------------------------------------------------
     Elements
     ---------------------------------------------------------- */
  const mapEl = document.getElementById("map");
  const svgEl = document.getElementById("map-svg");
  const card = document.getElementById("stop-card");
  const timelineEl = document.getElementById("timeline");
  const playBtn = document.getElementById("play");
  const playLabel = playBtn.querySelector("span");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const elsewhereBox = document.getElementById("elsewhere");
  const journeySection = document.getElementById("journey");

  /* ----------------------------------------------------------
     Small helpers
     ---------------------------------------------------------- */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function itemsHTML(items) {
    return items.map((it) => `
      <li>
        <p class="stop-card__kind">${esc(it.kind)}</p>
        <p class="stop-card__title">${esc(it.title)}</p>
        ${(it.desc || []).map((d) => `<p class="stop-card__desc">${esc(d)}</p>`).join("")}
      </li>`).join("");
  }

  function renderCard(html) {
    card.innerHTML = html;
    card.classList.remove("is-swapping");
    void card.offsetWidth; // restart the short swap animation
    card.classList.add("is-swapping");
  }

  function cardIntro() {
    renderCard(`
      <p class="stop-card__step"><span>Six stops</span><span>2001 – 2024</span></p>
      <h3 class="stop-card__country">South Africa to the Netherlands</h3>
      <p class="stop-card__desc" style="margin-top:.75rem">Press Explore My Journey to travel through each country in order, or choose a stop on the timeline.</p>`);
  }

  function cardStop(i) {
    const s = STOPS[i];
    renderCard(`
      <p class="stop-card__step"><span>Stop ${i + 1} of ${STOPS.length}</span></p>
      <h3 class="stop-card__country">${esc(s.country)}</h3>
      <p class="stop-card__years">${esc(s.years)}</p>
      <ul class="stop-card__list">${itemsHTML(s.items)}</ul>`);
  }

  function cardPlace(p) {
    renderCard(`
      <p class="stop-card__step"><span>Projects &amp; studies elsewhere</span></p>
      <h3 class="stop-card__country">${esc(p.country)}</h3>
      ${p.sub ? `<p class="stop-card__years">${esc(p.sub)}</p>` : ""}
      <ul class="stop-card__list">${itemsHTML(p.items)}</ul>`);
  }

  function cardEnd() {
    renderCard(`
      <p class="stop-card__step"><span>Journey complete</span><span>2001 – 2024</span></p>
      <h3 class="stop-card__country">South Africa to the Netherlands</h3>
      <ul class="stop-card__list">
        ${STOPS.map((s, i) => `<li><button type="button" class="pin" data-stop="${i}" style="color:var(--teal-on-dark)">${esc(s.country)}, ${esc(s.years)}</button></li>`).join("")}
      </ul>
      <p class="stop-card__desc" style="margin-top:1rem">The outlined dots mark projects and studies in other countries. Select one to read more.</p>`);
  }

  /* ----------------------------------------------------------
     Timeline
     ---------------------------------------------------------- */
  timelineEl.innerHTML =
    `<span class="timeline__progress" aria-hidden="true"></span>` +
    STOPS.map((s, i) => `
      <li class="tl-stop" data-i="${i}">
        <button type="button" aria-label="${esc(s.country)}, ${esc(s.years)}">
          <span class="tl-stop__dot" aria-hidden="true"></span>
          <span class="tl-stop__years">${esc(s.years)}</span>
          <span class="tl-stop__country">${esc(s.country)}</span>
          <span class="tl-stop__school">${esc(s.short || (s.items[0].kind === "Primary" || s.items[0].kind === "Secondary" ? s.items[0].title : s.items[0].kind))}</span>
        </button>
      </li>`).join("");
  const tlItems = Array.from(timelineEl.querySelectorAll(".tl-stop"));
  const tlProgress = timelineEl.querySelector(".timeline__progress");

  function updateTimeline(i) {
    tlItems.forEach((li, j) => {
      li.classList.toggle("is-active", j === i);
      li.classList.toggle("is-visited", i >= 0 && j < i);
      li.querySelector("button").setAttribute("aria-current", j === i ? "step" : "false");
    });
    const pct = i <= 0 ? 0 : i / STOPS.length;
    tlProgress.style.width = `calc((100% - 2 * var(--gutter)) * ${pct})`;
    const active = tlItems[i];
    if (active && timelineEl.scrollWidth > timelineEl.clientWidth) {
      timelineEl.scrollTo({ left: active.offsetLeft - timelineEl.offsetLeft - 16, behavior: reduceMotion ? "auto" : "smooth" });
    }
  }

  /* ----------------------------------------------------------
     Map
     ---------------------------------------------------------- */
  const hasD3 = typeof window.d3 !== "undefined" && typeof window.topojson !== "undefined";
  const REF_W = 1000;                      // reference width the projection is fitted to
  let W = 0, H = 0;
  let projection, geoPath, root, gCountries, gRoutes, gPlaces, gStops;
  let countryById = new Map();
  let view = null;                         // [x, y, w] in reference units
  let k = 1;
  let mapReady = false;

  const state = { current: -1, place: null, playing: false, timer: null, ended: false };

  function availableRegion() {
    // On wide screens the card floats over the map's left side, so frame things to its right.
    const cs = getComputedStyle(card);
    if (cs.position === "absolute") {
      const left = (card.offsetLeft + card.offsetWidth + 24) / W;
      return { ox: left + (1 - left) / 2, f: 1 - left };
    }
    return { ox: 0.5, f: 1 };
  }

  function apply(v) {
    view = v;
    const { ox } = availableRegion();
    k = W / v[2];
    const tx = W * ox - v[0] * k;
    const ty = H / 2 - v[1] * k;
    root.attr("transform", `translate(${tx},${ty}) scale(${k})`);
    // Keep strokes and markers a constant size on screen.
    gCountries.selectAll("path").attr("stroke-width", 0.6 / k);
    gRoutes.selectAll("path").attr("stroke-width", 2 / k);
    gStops.selectAll(".stop-dot").attr("r", 5.5 / k).attr("stroke-width", 1.6 / k);
    gStops.selectAll(".hit, .place .hit").attr("r", 16 / k);
    gPlaces.selectAll(".place-dot").attr("r", 4.5 / k).attr("stroke-width", 1.6 / k);
    gPlaces.selectAll(".hit").attr("r", 14 / k);
    root.selectAll("text").each(function () {
      const t = d3.select(this), pos = t.attr("data-pos"), fs = (t.classed("place-label") ? 12 : 13.5) / k;
      const off = 10 / k;
      let dx = off, dy = fs * 0.35, anchor = "start";
      if (pos === "left") { dx = -off; anchor = "end"; }
      if (pos === "below") { dx = 0; dy = off + fs * 0.9; anchor = "middle"; }
      if (pos === "rightUp") { dx = off * 0.8; dy = -off * 0.6; }
      t.attr("font-size", fs).attr("dx", dx).attr("dy", dy).attr("text-anchor", anchor).attr("stroke-width", 3 / k);
    });
  }

  function pointViewFor(coords, widthKm) {
    const [x, y] = projection(coords);
    const { f } = availableRegion();
    const w = (widthKm / 40000) * REF_W;   // reference units ≈ km at the equator
    return [x, y, w / f];
  }

  function overviewView(includePlaces) {
    const pts = STOPS.map((s) => projection(s.coords));
    if (includePlaces) PLACES.forEach((p) => pts.push(projection(p.coords)));
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const { f } = availableRegion();
    const bw = x1 - x0, bh = y1 - y0;
    // On wide screens the controls sit over the bottom of the map, so keep markers clear of them.
    const ctl = document.querySelector(".map__controls");
    const bottom = ctl && getComputedStyle(ctl).position === "absolute" ? ctl.offsetHeight + 28 : 0;
    const w = Math.max(bw / f, (bh * W) / (H - bottom)) * 1.28;
    return [(x0 + x1) / 2, (y0 + y1) / 2 + (bottom / 2) * (w / W), w];
  }

  function stopView(i) { return pointViewFor(STOPS[i].coords, STOPS[i].id === "singapore" ? 5200 : 6200); }

  function flyTo(target, onTick) {
    return new Promise((resolve) => {
      if (!mapReady) { resolve(); return; }
      d3.select(svgEl).interrupt("fly");
      const start = view || target;
      const interp = d3.interpolateZoom(start, target);
      const duration = reduceMotion ? 0 : Math.max(1300, Math.min(3200, interp.duration * 0.75));
      if (duration === 0) { apply(target); if (onTick) onTick(1); resolve(); return; }
      d3.select(svgEl).transition("fly").duration(duration).ease(d3.easeCubicInOut)
        .tween("fly", () => (t) => { apply(interp(t)); if (onTick) onTick(t); })
        .on("end", resolve)
        .on("interrupt", () => { if (onTick) onTick(1); resolve(); });
    });
  }

  function routeSegment(i, t) {
    // Great-circle line from stop i-1 to stop i, drawn up to fraction t.
    const a = STOPS[i - 1].coords, b = STOPS[i].coords;
    const gi = d3.geoInterpolate(a, b);
    const n = 48, coords = [];
    for (let s = 0; s <= n; s++) { const u = (s / n) * t; coords.push(gi(u)); }
    return geoPath({ type: "LineString", coordinates: coords });
  }

  function drawRoutes(i, animateLast) {
    const segs = d3.range(1, Math.max(1, i + 1));
    const sel = gRoutes.selectAll("path").data(segs, (d) => d);
    sel.exit().remove();
    sel.enter().append("path").attr("class", "route")
      .merge(sel)
      .attr("d", (d) => routeSegment(d, animateLast && d === i ? 0.0001 : 1))
      .classed("is-done", (d) => d < i)
      .attr("stroke-width", 2 / k);
  }

  function markStops(i) {
    gStops.selectAll(".stop").each(function (d, j) {
      d3.select(this).select(".stop-dot")
        .classed("is-active", j === i)
        .classed("is-visited", i >= 0 && j < i);
    });
    STOPS.forEach((s, j) => {
      const c = countryById.get(s.iso);
      if (c) d3.select(c).classed("is-active", j === i).classed("is-visited", i >= 0 && j < i && j !== i);
    });
  }

  function markPlace(id) {
    gPlaces.selectAll(".place-dot").classed("is-active", (d) => d.id === id);
    PLACES.forEach((p) => {
      const c = countryById.get(p.iso);
      if (c) d3.select(c).classed("is-place", p.id === id);
    });
  }

  function setPlacesVisible(on) {
    elsewhereBox.checked = on;
    mapEl.classList.toggle("show-places", on);
    gPlaces && gPlaces.selectAll(".hit").attr("tabindex", on ? 0 : -1);
  }

  /* ----------------------------------------------------------
     Navigation through the journey
     ---------------------------------------------------------- */
  async function goTo(i, opts = {}) {
    const prev = state.current;
    state.current = i;
    state.place = null;
    state.ended = false;
    if (mapReady) markPlace(null);
    cardStop(i);
    updateTimeline(i);
    if (!mapReady) return;
    const animateLast = opts.animateRoute && prev === i - 1 && i > 0 && !reduceMotion;
    drawRoutes(i, animateLast);
    markStops(i);
    const lastPath = gRoutes.selectAll("path").filter((d) => d === i);
    await flyTo(stopView(i), animateLast ? (t) => lastPath.attr("d", routeSegment(i, Math.min(1, t * 1.15))) : null);
  }

  async function showPlace(id) {
    const p = PLACES.find((x) => x.id === id);
    if (!p) return;
    stop();
    state.place = id;
    setPlacesVisible(true);
    cardPlace(p);
    if (!mapReady) return;
    markPlace(id);
    await flyTo(pointViewFor(p.coords, id === "england" ? 4200 : 6800));
  }

  async function showEnd() {
    state.ended = true;
    state.place = null;
    cardEnd();
    updateTimeline(STOPS.length - 1);
    tlItems[STOPS.length - 1].classList.remove("is-active");
    tlItems[STOPS.length - 1].classList.add("is-visited");
    tlProgress.style.width = `calc((100% - 2 * var(--gutter)) * ${(STOPS.length - 1) / STOPS.length})`;
    if (!mapReady) { setPlacesVisible(true); return; }
    gStops.selectAll(".stop-dot").classed("is-active", false).classed("is-visited", true);
    STOPS.forEach((s) => { const c = countryById.get(s.iso); if (c) d3.select(c).classed("is-active", false).classed("is-visited", true); });
    gRoutes.selectAll("path").classed("is-done", true);
    setPlacesVisible(true);
    await flyTo(overviewView(true));
  }

  const DWELL = reduceMotion ? 5000 : 3600;

  function setPlaying(on) {
    state.playing = on;
    playBtn.classList.toggle("is-playing", on);
    playLabel.textContent = on ? "Pause" : (state.ended || state.current === STOPS.length - 1 ? "Replay journey" : (state.current >= 0 ? "Continue journey" : "Explore My Journey"));
  }

  function stop() {
    clearTimeout(state.timer);
    if (state.playing) setPlaying(false);
  }

  async function step() {
    if (!state.playing) return;
    const next = state.current + 1;
    if (next >= STOPS.length) {
      await showEnd();
      setPlaying(false);
      return;
    }
    await goTo(next, { animateRoute: true });
    if (!state.playing) return;
    state.timer = setTimeout(step, DWELL);
  }

  async function play(fromStart) {
    clearTimeout(state.timer);
    if (fromStart || state.ended || state.current >= STOPS.length - 1 || state.place) {
      state.current = -1;
      state.ended = false;
      state.place = null;
      if (mapReady) {
        setPlacesVisible(false);
        markPlace(null);
        drawRoutes(-1, false);
        markStops(-1);
      }
      setPlaying(true);
      if (mapReady && !reduceMotion) await flyTo(overviewView(false));
      if (!state.playing) return;
    } else {
      setPlaying(true);
    }
    step();
  }

  playBtn.addEventListener("click", () => {
    if (state.playing) { stop(); d3 && mapReady && d3.select(svgEl).interrupt("fly"); return; }
    play(false);
  });
  prevBtn.addEventListener("click", () => { stop(); goTo(Math.max(0, (state.ended ? STOPS.length : state.current) - 1)); });
  nextBtn.addEventListener("click", () => {
    stop();
    if (state.current >= STOPS.length - 1) { showEnd(); setPlaying(false); return; }
    goTo(state.current + 1, { animateRoute: true });
  });
  timelineEl.addEventListener("click", (e) => {
    const li = e.target.closest(".tl-stop");
    if (!li) return;
    stop();
    goTo(Number(li.dataset.i), { animateRoute: true });
  });
  elsewhereBox.addEventListener("change", () => {
    stop();
    setPlacesVisible(elsewhereBox.checked);
    if (mapReady) flyTo(overviewView(elsewhereBox.checked));
  });
  card.addEventListener("click", (e) => {
    const b = e.target.closest("[data-stop]");
    if (b) { stop(); goTo(Number(b.dataset.stop)); }
  });

  /* "Show on map" links elsewhere on the page */
  function scrollToJourney() {
    journeySection.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }
  document.addEventListener("click", (e) => {
    const pin = e.target.closest(".pin[data-stop], .pin[data-place]");
    if (!pin || card.contains(pin)) return;
    stop();
    scrollToJourney();
    const wait = reduceMotion ? 0 : 650;
    setTimeout(() => {
      if (pin.dataset.place) showPlace(pin.dataset.place);
      else goTo(Number(pin.dataset.stop));
    }, wait);
  });

  /* Hero "Explore My Journey" — scroll down and start the tour */
  document.querySelectorAll('[data-action="explore"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      scrollToJourney();
      history.replaceState(null, "", "#journey");
      setTimeout(() => play(true), reduceMotion ? 0 : 750);
    });
  });

  /* ----------------------------------------------------------
     Build the map
     ---------------------------------------------------------- */
  function measure() {
    W = svgEl.clientWidth || mapEl.clientWidth;
    H = svgEl.clientHeight || mapEl.clientHeight;
    d3.select(svgEl).attr("viewBox", `0 0 ${W} ${H}`);
  }

  function build(world) {
    const svg = d3.select(svgEl);
    measure();
    projection = d3.geoNaturalEarth1().fitWidth(REF_W, { type: "Sphere" });
    geoPath = d3.geoPath(projection);

    root = svg.append("g");
    root.append("path").attr("class", "sphere").attr("d", geoPath({ type: "Sphere" }));
    root.append("path").attr("class", "graticule").attr("d", geoPath(d3.geoGraticule10())).attr("vector-effect", "non-scaling-stroke");

    const countries = topojson.feature(world, world.objects.countries).features;
    gCountries = root.append("g");
    gCountries.selectAll("path").data(countries).join("path")
      .attr("class", "country")
      .attr("d", geoPath)
      .each(function (d) { countryById.set(String(d.id).padStart(3, "0"), this); });

    gRoutes = root.append("g");

    gPlaces = root.append("g");
    const pg = gPlaces.selectAll("g").data(PLACES).join("g").attr("class", "place")
      .attr("transform", (d) => `translate(${projection(d.coords)})`);
    pg.append("circle").attr("class", "place-dot");
    pg.append("text").attr("class", "place-label").attr("data-pos", (d) => d.label).text((d) => d.country);
    pg.append("circle").attr("class", "hit")
      .attr("tabindex", -1).attr("role", "button")
      .attr("aria-label", (d) => `${d.country}: ${d.items[0].title}`)
      .on("click", (e, d) => showPlace(d.id))
      .on("keydown", (e, d) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); showPlace(d.id); } });

    gStops = root.append("g");
    const sg = gStops.selectAll("g").data(STOPS).join("g").attr("class", "stop")
      .attr("transform", (d) => `translate(${projection(d.coords)})`);
    sg.append("circle").attr("class", "stop-dot");
    sg.append("text").attr("class", "stop-label").attr("data-pos", (d) => d.label).text((d) => d.country);
    sg.append("circle").attr("class", "hit")
      .attr("tabindex", 0).attr("role", "button")
      .attr("aria-label", (d) => `${d.country}, ${d.years}`)
      .on("click", (e, d) => { stop(); goTo(STOPS.indexOf(d), { animateRoute: true }); })
      .on("keydown", (e, d) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); stop(); goTo(STOPS.indexOf(d)); } });

    mapReady = true;
    apply(overviewView(false));

    let rt;
    window.addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        measure();
        if (state.place) apply(pointViewFor(PLACES.find((p) => p.id === state.place).coords, 6800));
        else if (state.ended) apply(overviewView(true));
        else if (state.current >= 0) apply(stopView(state.current));
        else apply(overviewView(elsewhereBox.checked));
      }, 120);
    });
  }

  cardIntro();
  updateTimeline(-1);

  if (hasD3) {
    fetch("assets/vendor/countries-110m.json")
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(build)
      .catch(() => { mapEl.querySelector(".map__fallback").hidden = false; });
  } else {
    mapEl.querySelector(".map__fallback").hidden = false;
  }

  /* ----------------------------------------------------------
     Portfolio embed
     ---------------------------------------------------------- */
  const embed = document.getElementById("portfolio-embed");
  const embedUrl = (embed.dataset.embed || "").trim();
  if (embedUrl) {
    const iframe = document.createElement("iframe");
    iframe.src = embedUrl;
    iframe.title = "Photography portfolio";
    iframe.loading = "lazy";
    iframe.allow = "fullscreen; accelerometer; gyroscope";
    embed.querySelector(".embed__frame").appendChild(iframe);
    embed.classList.add("has-embed");
    const cap = embed.querySelector(".embed__cap");
    cap.hidden = false;
    cap.querySelector("a").href = embedUrl;
  }

  /* ----------------------------------------------------------
     Nav: solid background on scroll, current section, mobile menu
     ---------------------------------------------------------- */
  const nav = document.querySelector(".nav");
  const onScroll = () => nav.classList.toggle("is-solid", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const navLinks = Array.from(document.querySelectorAll(".nav__links a"));
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === `#${en.target.id}`));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["journey", "profile", "work", "experience", "education", "skills", "contact"].forEach((id) => {
      const el = document.getElementById(id); if (el) io.observe(el);
    });
  }

  const toggle = document.querySelector(".nav__toggle");
  const menu = document.getElementById("mobile-menu");
  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
  }
  toggle.addEventListener("click", () => setMenu(menu.hidden));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) setMenu(false); });

  /* ----------------------------------------------------------
     Copy buttons
     ---------------------------------------------------------- */
  const toast = document.getElementById("toast");
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-on"), 1800);
  }
  document.querySelectorAll(".copy").forEach((b) => {
    b.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(b.dataset.copy); showToast("Copied"); }
      catch (_) { showToast("Couldn't copy. Select the text instead."); }
    });
  });
})();
