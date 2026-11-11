import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Generated on the server only (slide decks, picture rendering).
  serverExternalPackages: ["pptxgenjs", "sharp"],
};

export default nextConfig;
