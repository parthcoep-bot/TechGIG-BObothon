# NammaFix (ನಮ್ಮ ಫಿಕ್ಸ್) — Deployment & GitHub Pages Guide

> **Official Live Demo:** [https://parthcoep-bot.github.io/TechGIG-BObothon/](https://parthcoep-bot.github.io/TechGIG-BObothon/)  
> **Source Repository:** [https://github.com/parthcoep-bot/TechGIG-BObothon](https://github.com/parthcoep-bot/TechGIG-BObothon)

## Overview
NammaFix is designed as a zero-dependency, self-contained single-page progressive web application. It runs in any modern browser without requiring external build pipelines, transpilation, or server processes.

## GitHub Pages Deployment

The repository is configured to serve directly from GitHub Pages on the `main` branch:

1. **Repository:** `https://github.com/parthcoep-bot/TechGIG-BObothon`
2. **Branch:** `main`
3. **Root Directory:** `/` (serving `index.html`)

### Enabling GitHub Pages (if not already active):
1. Navigate to repository **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, select **Deploy from a branch**.
3. Choose Branch: `main`, Folder: `/(root)`, and click **Save**.
4. The live site is served at: `https://parthcoep-bot.github.io/TechGIG-BObothon/`

## Running Locally

### Direct File Open
Double click `index.html` or run:
```bash
start index.html
```

### Static Web Server
```bash
# Python
python -m http.server 8080

# Node.js
npx serve .
```
Open `http://localhost:8080` in your browser.
