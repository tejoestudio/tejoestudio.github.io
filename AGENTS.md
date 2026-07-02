# Tejo Estúdio

> Institutional website, linktree and press kits for Estúdio Tejo. Brutalist visual identity, focused on simplicity and accessibility.
> Stack: Handlebars, vanilla CSS (tejo-base.css), Node.js (build.js), i18n JSON.

## Workspace

| Repository | What it is | Contribution |
|---|---|---|
| `../exu/` | Narrative game "Vem, Exu" (Godot 4.6) | Original game assets and current development context |
| `../tejoestudio/` | Press kits, promotional assets — gifs, videos, screenshots, trailers (Handlebars) | Web showcase for all projects; reusable brutalist visual identity |
| `../tejo-estudio-cerebro/` | Creative docs, grant applications, project context and scripts (Markdown) | Narrative briefings and cultural proposals |
| `../tiu-automator/` | Social media automation and outreach (Node.js) | Publishing and press prospecting for all studio projects |

---

# Guidelines for AI and Developers

This file contains strict architectural and styling rules that must be followed when modifying this repository.

## CSS and Styling Rules

* **Brutalist Visual Identity:** The project relies on a brutalist visual identity (hard shadows, borders, high contrast) established in `css/tejo-base.css`.
* **Linktree / Main Index (`index.html`):**
  * The `index.html` file must exclusively use `css/tejo-base.css` for structural and base styling, and `css/tejo-brands.css` for button/link brand styling.
  * **Strictly Forbidden:** You must not reintroduce or use the old LittleLink stylesheets (`css/style.css` and `css/brands.css`).
  * If new link buttons need to be added, use the semantic HTML approach defined in `tejo-base.css` and apply the classes from `tejo-brands.css` (e.g., `<a class="tejo-link-btn tejo-brand-x" href="..." target="_blank" rel="noopener">`).
  * If a new brand color is needed, add it to `css/tejo-brands.css` following the documented pattern (using `--brand-bg`, `--brand-text` and optionally `--brand-hover-filter`), rather than adding inline styles or complex external libraries.

## HTML Semantics

* Rely on native HTML elements (`<main>`, `<figure>`, `<footer>`, `<article>`, etc.) instead of generic `<div>` containers whenever possible, as `tejo-base.css` uses a semantic styling approach.


## Media and Accessibility Assets
* When using or referencing any images, videos, or animations, always consult src/static/assets_meta.json.
* This file acts as a manifest and contains the complete, detailed accessibility descriptions (alt texts) for every media asset in the project.
* Do not attempt to guess file contents from their names or read binary metadata directly; the assets_meta.json is the single source of truth for semantic descriptions and alt properties.