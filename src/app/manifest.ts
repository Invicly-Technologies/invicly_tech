import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Invicly Tech",
    short_name: "Invicly",
    description: "Invicly Tech builds Flow, Spendly, Kivo and Unreel, and runs Invicly Learn: free learning paths with a study tracker.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      { src: "/icon.png", sizes: "any", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
