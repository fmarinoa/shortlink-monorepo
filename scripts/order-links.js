#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = join(__dirname, "..", "src", "data", "links.json");

const links = JSON.parse(readFileSync(filePath, "utf-8"));

links.sort((a, b) => {
  if (a.slug !== b.slug) return a.slug.localeCompare(b.slug);
  return a.created.localeCompare(b.created);
});

writeFileSync(filePath, JSON.stringify(links, null, 2) + "\n");

console.log(`Ordenado ${links.length} links en ${filePath}`);
