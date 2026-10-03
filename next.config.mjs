import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Évite que Turbopack prenne un mauvais répertoire racine quand un autre
  // package-lock.json existe plus haut (ex. C:\Users\...\), ce qui casse souvent le HMR.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
