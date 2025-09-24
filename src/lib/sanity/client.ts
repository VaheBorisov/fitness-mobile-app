import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

// client config
const config = {
  projectId: "eyt7ym3f",
  dataset: "production",
  apiVersion: "2025-02-19",
  useCdn: false,
};
export const client = createClient(config);

// admin client
const adminConfig = {
  ...config,
  token: process.env.SANITY_API_TOKEN,
};
export const adminClient = createClient(adminConfig);

// Image URL builder
const builder = imageUrlBuilder(config);
export const urlFor = (source: string) => builder.image(source);
