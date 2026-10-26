# Interactive CV — Bryce de Bruyn

A single-page interactive CV: an animated world map of my journey (South Africa → Ghana → Tanzania → Singapore → France → the Netherlands), my creative portfolio, work and volunteer experience, education, skills and contact details.

Plain HTML, CSS and JavaScript — no build step. Open `index.html` through any static server, or view it on GitHub Pages.

## Files

- `index.html` — page content (all CV text lives here and in the journey data at the top of `script.js`)
- `styles.css` — design
- `script.js` — journey map, timeline, menu and copy buttons
- `assets/headshot.jpg` — homepage photo
- `assets/Bryce_de_Bruyn_CV.pdf` — the file behind every "Download CV" button
- `assets/vendor/` — D3, TopoJSON and the world map data (stored locally so the map works offline)

## Photography globe

The portfolio section embeds https://bdbphotography.site. To change it, edit `data-embed` on `id="portfolio-embed"` in `index.html`.
