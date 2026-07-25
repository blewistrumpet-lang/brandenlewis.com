# brandenlewis.com

Static site for Branden Lewis — trumpet, vocals, production. No build step, no
framework, no dependencies. Plain HTML/CSS/JS served by GitHub Pages.

## Files

```
index.html          one-page scroll: hero, bio, credits, gallery, videos, booking
videos.html         all 13 videos, filterable
404.html            not-found page
assets/css/site.css the whole design system
assets/js/site.js   progressive enhancement only — the site works without it
assets/img/         photography (WebP + JPEG, multiple widths)
assets/img/yt/      video thumbnails, stored locally
assets/fonts/       Inter (self-hosted, no Google Fonts request)
CNAME               custom domain for GitHub Pages
```

## Editing

**Text and photos** — edit `index.html` directly. It's ordinary HTML with
comments marking each section.

**Adding a video** — copy an existing `<article class="vcard">` block in
`videos.html`, swap the YouTube ID in the three places it appears
(`href`, `data-yt`, and the two thumbnail paths), then save a thumbnail:

```bash
ID=YOUR_VIDEO_ID
curl -sf "https://i.ytimg.com/vi/$ID/maxresdefault.jpg" -o "assets/img/yt/$ID.jpg"
```

Update the `data-cat` attribute (`solo`, `phjb`, or `live`) so the filters
pick it up, and bump the count in the `#vcount` span.

**After editing CSS or JS**, refresh the cache-busting hashes:

```bash
python3 - <<'PY'
import re, pathlib, hashlib
cv = hashlib.sha1(pathlib.Path('assets/css/site.css').read_bytes()).hexdigest()[:8]
jv = hashlib.sha1(pathlib.Path('assets/js/site.js').read_bytes()).hexdigest()[:8]
for f in ['index.html','videos.html','404.html']:
    p = pathlib.Path(f); s = p.read_text()
    s = re.sub(r'(/assets/css/site\.css)(\?v=[0-9a-f]+)?', r'\1?v='+cv, s)
    s = re.sub(r'(/assets/js/site\.js)(\?v=[0-9a-f]+)?',  r'\1?v='+jv, s)
    p.write_text(s)
print('css', cv, 'js', jv)
PY
```

Without this, browsers keep serving the old stylesheet.

## Preview locally

```bash
python3 -m http.server 8480
# then open http://localhost:8480
```

## Publish

```bash
git add -A && git commit -m "Update site" && git push
```

GitHub Pages redeploys within a minute or so.

## Notes on how it's built

- **Video thumbnails are local.** Nothing is requested from YouTube until a
  visitor actually clicks play, at which point the player loads from
  `youtube-nocookie.com`. Each video card is a real link to YouTube, so it
  still works with JavaScript disabled.
- **Responsive images.** Every photo ships as WebP with a JPEG fallback at
  three or four widths; the browser picks one. The hero uses a different
  photograph below 640px because the 16:9 frame crops to nothing on a phone.
- **Fonts are self-hosted**, so there's no third-party request on page load.
- **Motion respects `prefers-reduced-motion`** — animations are disabled for
  visitors who ask for that in their OS settings.
