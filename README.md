# Figma Plugin Extractor

This plugin contains a set of tools to help you build Figma plugins faster and easier. It provides a modern development environment with a fast and easy-to-use messaging system, and a simple command to build, run, and publish your plugin. It also automatically bundles all your assets into one file for easy compatibility with Figma.

It is built with React, Vite, and TailwindCSS.

## Features
- React, TailwindCSS, and Shadcn-ui for a modern, accessible, and responsive UI.
- Vite provides for a fast and effortless developer experience.
- All interprocess communication boilerplate is taken care of and handled with an easy to use messaging system.
- Just one simple command to build, run, and publish your plugin.
- Automatically bundles all your assets into one file for easy compatibility with Figma.
- Import SVGs as React components, URLs, or raw strings.
- Write styles with Sass/Scss/Less and modules.

## Getting Started

**You need to have Node.js version 20.14.0 or higher.**

1. Clone the repo.
2. Install dependencies with 
   `npm install`
   `pnpm install`
3. In Figma, create a new plugin by going to *Plugins › Development › New Plugin…* and in the windows that follow, choose "Figma" as the platform and either "Default" or "Run once" as a template (it doesn't matter so much which one you choose, because you will only need the manifest from the generated files), and finally click "Save as" to save it to a temporary directory on disk.
4. Locate the `manifest.json` file that was generated in the previous step and copy the `id` field from it.
5. Paste the `id` field into `figma.manifest.ts` in the root of your plugin (this project) and configure the manifest however you like. (See [Official Figma Plugin Manifest doc](https://www.figma.com/plugin-docs/manifest/)).
6. Run `npm run dev` to start the development server and create a `dist/` folder, which will include your plugin's `manifest.json`.
7. Load your plugin in Figma by going to  *Plugins › Development › Import plugin from manifest…* and selecting your plugin's `manifest.json` file.
8. (Optional) Turn on Figma's `Hot reload plugin` option to automatically reload your plugin when files in `dist/` changes.

## UI-only Development

To run your UI code in the browser, without Figma context or your plugin's back end logic, run:
```
npm run dev:ui-only
```

```
pnpm run dev:ui-only
```

## Publishing Your Plugin

To build your plugin for Figma, like with `npm run dev` or `pnpm run dev`, executing `npm run build` (or `pnpm run build`) generates a `dist/` folder. This folder includes your plugin's manifest.json and all assets required to load it in Figma. Additionally, it contains all necessary files to publish your plugin to the Figma Community.
