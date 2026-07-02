# Online Electrical Load Schedule

Static web version for field use and GitHub Pages.

## Files

- `index.html`
- `styles.css`
- `app.js`
- `sample_load_schedule.pdf`

## Deploy

Upload these files to a GitHub Pages repository root, or put them in `/docs` and set GitHub Pages to serve from that folder.

Recommended repository structure:

```text
/
  index.html
  styles.css
  app.js
  sample_load_schedule.pdf
  .nojekyll
```

This online-first version runs fully in the browser:

- load entry
- 1P / 3P schedule
- 1P phase allocation A / B / C / Auto
- standard load schedule
- CSV export
- A4 report preview
- Save PDF through browser print dialog

PDF extraction/import is intentionally disabled in this static version because it requires a backend or OCR service.
