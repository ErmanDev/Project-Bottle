# BottleNet

Static prototype using HTML, CSS, vanilla JavaScript, and Tailwind CDN. No build step.

## Structure

```text
index.html                 User connection portal
admin/index.html           PIN entry and admin workspace
assets/css/styles.css      Shared responsive visual system
assets/js/store.js         Shared persistent mock data
assets/js/portal.js        Deposit and connection states
assets/js/admin.js         PIN flow, dashboard, and management
```

Open `index.html` in a browser. For consistent shared storage between pages, serve the folder on a local HTTP origin (for example `npx --yes serve .`). Tailwind and Lucide icons require internet; the custom stylesheet supplies the complete base layout and system fonts work offline.

Admin demo PIN: **1234**. Four digit fields support paste, numeric input, and keyboard navigation.

The portal's Preview controls switch station states and reset sample data. Choose Bottle accepted or Bottle rejected in the Station state dropdown to simulate hardware validation. These outcomes appear only in the preview controls; the normal deposit flow displays feedback without acceptance/rejection buttons. Mock sessions count down; deposits update admin transactions and station totals. Admin supports filtering, CSV export, session termination, maintenance, bin collection, and reward settings.

This is a UI prototype: client-side PIN checking is not authentication, and the timer does not authorize network access. Production requires backend authentication, validated hardware events, device/session association, and router enforcement. Browser storage provides demo persistence only; separate devices do not share it.
