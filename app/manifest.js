import { DEFAULT_DESCRIPTION, SITE_NAME } from "@/lib/site";

export default function manifest() {
  return {
    id: "/",
    name: SITE_NAME,
    short_name: "Révision facile",
    description: DEFAULT_DESCRIPTION,
    start_url: "/reviser",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f1f5f9",
    theme_color: "#4f46e5",
    lang: "fr",
    dir: "ltr",
    categories: ["education"],
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Générer une fiche",
        short_name: "Réviser",
        description: "Choisis ta matière et génère ta fiche",
        url: "/reviser",
        icons: [{ src: "/icon.png", sizes: "192x192", type: "image/png" }],
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
    handle_links: "preferred",
  };
}
