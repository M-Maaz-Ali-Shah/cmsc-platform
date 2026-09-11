import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

// Enables access to Cloudflare bindings (D1, R2, ...) via getCloudflareContext()
// while running the regular `next dev` server, not just under `wrangler dev`.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
