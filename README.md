# store-admin-Bestbuy

This repository contains the CST8915 final-project admin dashboard frontend. It is a lightweight Vue 3 app styled as a Best Buy-inspired electronics admin panel for monitoring orders, observing status changes, and optionally reviewing products.

## What This App Does

- Monitors orders created by the storefront
- Shows status changes as orders move through the workflow
- Provides a simple product visibility view for demo purposes
- Keeps manual admin override lightweight and optional

This app is not the main order-processing engine. The intended final-project flow is:

1. `order-service` accepts new orders and records them with an initial `pending` state
2. `makeline-service` processes orders in the background
3. `store-admin-Bestbuy` helps you monitor the order lifecycle and confirm product data

## Backend Services

The frontend is designed to work with:

- `order-service`
- `product-service`
- `makeline-service` for background status visibility and optional admin override support

## Frontend Structure

- `src/main.js`: Vue app entry point
- `src/App.vue`: shared app shell and data loading
- `src/router.js`: order and product routes
- `src/components/OrderList.vue`: main monitoring dashboard
- `src/components/OrderDetail.vue`: per-order detail view
- `src/components/ProductList.vue`: product visibility page
- `src/components/ProductDetail.vue`: product detail page
- `src/components/ProductForm.vue`: simple create/edit form
- `src/components/TopNav.vue`: admin navigation and branding

## Configuration

The app keeps the existing local development pattern and uses lightweight proxy routes in `vue.config.js`.

Optional environment variables for `npm run serve`:

```bash
export VUE_APP_ORDER_SERVICE_URL=http://localhost:3000/
export VUE_APP_MAKELINE_SERVICE_URL=http://localhost:3001/
export VUE_APP_PRODUCT_SERVICE_URL=http://localhost:3002/
```

Windows PowerShell equivalents:

```powershell
$env:VUE_APP_ORDER_SERVICE_URL="http://localhost:3000/"
$env:VUE_APP_MAKELINE_SERVICE_URL="http://localhost:3001/"
$env:VUE_APP_PRODUCT_SERVICE_URL="http://localhost:3002/"
```

If you do not set these variables, local development defaults to `localhost` ports `3000`, `3001`, and `3002`.

## Local Run Instructions

Start the required backend services first, then run the admin frontend:

```bash
npm install
npm run serve
```

The Vue development server runs on:

- `http://localhost:8081/`

If you want to launch the supporting backend services from the included compose file, run:

```bash
docker compose up
```

## Production Build

Create a production bundle with:

```bash
npm run build
```

## Docker Build And Run

Build the frontend image:

```bash
docker build -t store-admin-bestbuy .
```

Run the image:

```bash
docker run --rm -p 8081:8081 store-admin-bestbuy
```

If you want to use the included compose stack for local integration, the repository still provides `docker-compose.yml` for the supporting services used by the demo.

## Demo Notes

- The order dashboard is the primary landing experience
- Refresh is available in the UI and auto-refresh runs every 15 seconds on the order list
- Product pages remain available as a secondary admin feature
- Manual completion is presented as an optional override, not the main flow

## Deployment Notes

The project remains suitable for containerized deployment because:

- the production image builds a static Vue bundle
- Nginx handles frontend serving and service routing
- the app continues to use simple relative API paths in production
