import { createClient } from "@sanity/client";

export const client = createClient({
  projectId: "vvwrlu0o",      
  dataset: "production",        
  useCdn: true,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_READ_TOKEN,
});
