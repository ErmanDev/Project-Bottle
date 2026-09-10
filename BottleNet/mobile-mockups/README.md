# BottleNet Mobile Mockups

Open `index.html` to view the three phone mockups together. All screen captures come from the existing BottleNet UI with sample data; the app itself is unchanged.

- `overview.png`: combined presentation board.
- `portal-mockup.png`: connection portal in a phone frame.
- `pin-mockup.png`: admin PIN entry in a phone frame.
- `dashboard-mockup.png`: admin overview in a phone frame.
- `screens/`: unframed screenshots, including full scrolling portal and dashboard captures.

Screens are captured at a 390 by 844 CSS-pixel viewport with 2x pixel density. Phone frames are illustrative. The HTML presentation and exported PNGs work offline.

To refresh captures using an installed Playwright package, set `PLAYWRIGHT_MODULE` to its module path and run `node tools/capture-mobile-mockups.cjs` from the project root. The script starts a temporary local server and closes it after capturing. External CDN requests are blocked for reproducible offline captures, so optional CDN icons use the app's fallback symbols.
