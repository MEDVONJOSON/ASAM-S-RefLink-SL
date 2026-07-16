import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ASAM'S REFLINK SL",
    short_name: "ASAM'S",
    description:
      "Sierra Leone's pay-per-result referral network. Businesses list for free; trained youth referrers earn on every confirmed sale.",
    start_url: "/",
    display: "standalone",
    background_color: "#fdfaf6",
    theme_color: "#ff6a1a",
    orientation: "portrait",
    categories: ["business", "productivity", "social"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192-maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
