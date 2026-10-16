Source code for http://nparashuram.com

Development happens on `main`. Pushing to `main` builds the site with GitHub Actions and deploys it to GitHub Pages; there is no generated branch.

No dependencies are needed beyond Node 18+.

    npm run dev       # build, watch src/ and serve on http://localhost:9000
    npm run preview   # build once and serve exactly what gets deployed
    npm run build     # build into dist/

Layout:

- `src/*.html` - pages. `<!--@include partials/x.html-->`, `<!--@css-->` and `<!--@js js/x.js-->` are expanded by `build.mjs`, so every page ships as a single file.
- `src/css/main.css` - plain CSS. The first layer is 2005-safe; newer features are layered on after it. Keep it that way.
- `src/media/` - copied as-is to the site root (images, favicon, `CNAME`).
