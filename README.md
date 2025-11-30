🚀 Aurora-UI

🌟 Project Overview

Aurora-UI is a modern front-end application built with React and Vite. Its main purpose is to demonstrate how to combine JavaScript's Device Orientation API and CSS 3D transforms to create an immersive aurora interaction effect.


✨ Technology Stack

Framework: React

Build Tool: Vite

Styling: Tailwind CSS

Core Feature: Device Orientation API (JavaScript)

📦 Local Installation and Running

Please ensure you have Node.js and npm installed in your local environment.

Install Dependencies:
Run the following command in the project root directory to install all required packages.

`npm install`




Start Development Server:
Run this command to start the Vite development server.

`npm run dev`




The project typically starts at http://localhost:5173. 

🛠️ Common Troubleshooting

'react-scripts' command not found:

Reason: Your project uses Vite, not Create React App, but the build script in package.json might be incorrectly set to use react-scripts command.

Solution: Ensure your package.json's build script is corrected to "build": "vite build".

Video/Static Resources fail to load locally:

Reason: Incorrect file reference paths, or resources are not placed in the correct location.

Solution: Ensure all static assets (like videos, images) are located in the public folder in the project root, and that you reference them in your React code using a root path (e.g., src="/aurora_video.mp4").

# React + Vite


This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
