
# Simple Nutrition Scanner

<img width="3063" height="1003" alt="bitmap" src="https://github.com/user-attachments/assets/f4693e5d-7f6f-45d9-93cc-b995a40658eb" />

A Yuka-like progressive web app (PWA) that scans food barcodes and provides nutrition information. This app is built with SvelteKit and uses the Quagga2 library for barcode scanning.

## Features

*   **Barcode Scanning:** Uses the device's camera to scan EAN, EAN-8, and UPC barcodes.
*   **Nutrition Information:** Fetches and displays nutrition information for scanned products from the [Open Food Facts API](https://openfoodfacts.org/).
*   **Scan History:** Keeps a history of scanned products.
*   **PWA:** Can be installed on a mobile device and used offline.

## Technologies Used

*   **SvelteKit:** A framework for building robust, high-performance web applications.
*   **Quagga2:** A barcode-scanning library.
*   **adapter-static:** SvelteKit adapter for building a static site, perfect for PWAs.
*   **Tailwind CSS:** A utility-first CSS framework for rapid UI development.

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/simple-nutrition-scanner.git
    cd simple-nutrition-scanner
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:5173`.

## Project Structure

*   `src/`: The main source code directory.
    *   `components/`: Svelte components used throughout the app.
    *   `lib/`: Core logic, including API handling, database, and state management.
    *   `routes/`: SvelteKit routes, defining the pages of the app.
        *   `(app)/`: The main app pages (home, history, settings).
        *   `scan/`: The barcode scanning page.
    *   `service-worker.ts`: The service worker for PWA functionality.
*   `static/`: Static assets like the favicon and web manifest.
*   `svelte.config.js`: SvelteKit configuration.
*   `vite.config.ts`: Vite configuration.

## PWA Features

This app is a Progressive Web App, which means it can be installed on your mobile device and used offline. The service worker in `src/service-worker.ts` handles caching of app resources and data, allowing for a seamless offline experience.
