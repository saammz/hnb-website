# 🛠️ Project Name

HnB Website built with **Vite**, **TypeScript**, **Tailwind CSS**, and **shadcn-ui**.

## 🚀 Getting Started

This guide will help you set up, run, and build the project locally.

### Prerequisites

Make sure you have the following installed on your system:

- **Node.js** (v22.12 or later): https://nodejs.org
- **npm** (comes with Node.js) or **Yarn**

To install Node.js using nvm:

```bash
nvm install 22
```

The npm overrides keep typography's selector parser, Sucrase's Glob, and TypeScript
ESLint's Minimatch on patched versions. Remove each override when its parent
dependency requires a patched version itself.

### Setup, Run, and Build

Follow these steps:

```bash
# 1. Clone the repository
git clone <GIT REPO>

# 2. Navigate to the project folder
cd your-project

# 3. Install project dependencies
npm install
# or
yarn install

# 4. Start the development server
npm run dev
# or
yarn dev

# 5. Build for production
npm run build
# or
yarn build

# 6. Preview the production build locally
npm run preview
# or
yarn preview
```

The app will be available during development at:  
[http://localhost:5173](http://localhost:5173)

## 🧰 Tech Stack

- ⚛️ [React](https://reactjs.org/)
- ⚡ [Vite](https://vitejs.dev/)
- 🛡️ [TypeScript](https://www.typescriptlang.org/)
- 💨 [Tailwind CSS](https://tailwindcss.com/)
- 🎨 [shadcn-ui](https://ui.shadcn.com/)

## 📁 Project Structure

```bash
src/
├── assets/        # Static assets
├── components/    # Reusable UI components
├── pages/         # Page-level components
├── styles/        # Global and utility styles
├── App.tsx        # Root component
├── main.tsx       # Application entry point
```

## 🌐 Deployment

You can deploy this project to platforms like:

- [Vercel](https://vercel.com/)
- [Netlify](https://netlify.com/)
- [Render](https://render.com/)

Just run the build command and follow the deployment instructions for your preferred platform.

## 📝 License

This project is licensed under the [MIT License](LICENSE).
