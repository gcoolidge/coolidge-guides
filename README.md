# coolidge-guides

Online flipbook versions of The Coolidge Group buyer and listing guides.
Static site — no server, no build step, no dependencies. Hosts free on GitHub Pages.

## Live address
`guides.thecoolidgegroup.com` (set by the `CNAME` file + one DNS record at Squarespace).
Until DNS is set, it also works at `https://<username>.github.io/coolidge-guides/`.

## Structure
```
index.html              landing page — pick Buyer or Listing guide
buyer/index.html        buyer flipbook (23 pages)
listing/index.html      listing flipbook (19 pages)
buyer|listing/pages/    page images (page-01.jpg ...)
buyer|listing/*.pdf     downloadable PDF of each guide
assets/flipbook.css     styles
assets/flipbook.js      page-flip engine (self-contained, no libraries)
assets/analytics.js     Google Analytics + custom events
brand/                  optional: drop wordmark-onlight.png here to replace the text wordmark
CNAME                   custom domain
```

## The only edit you might make
Open `assets/analytics.js` and paste your GA4 Measurement ID (`G-XXXXXXXXXX`)
on the first line. That turns on analytics. The site works fine without it.

Optional: change the "Book a consultation" link in `buyer/index.html` and
`listing/index.html` (the `BOOK_URL` line) to a Calendly/booking URL.

## Updating a guide later
Replace the images in the relevant `pages/` folder (and the PDF), commit, push.
GitHub Pages redeploys automatically. No other tools needed.

## What's tracked in GA4
`guide_open`, `page_view_flip` (with page + guide), `guide_complete`,
`cta_click` (book / download / share), `guide_select`.
