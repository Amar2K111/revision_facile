import { PUBLIC_ROUTES, SITE_URL } from "@/lib/site";

export default function sitemap() {
  const lastModified = new Date();

  return PUBLIC_ROUTES.map((path) => ({
    url: path === "/" ? SITE_URL : `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.5,
  }));
}
