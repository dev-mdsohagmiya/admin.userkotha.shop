import { cp, mkdir, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const sourceDir = path.join(projectRoot, "node_modules", "tinymce");
const destinationDir = path.join(projectRoot, "public", "tinymce");

const mainFile = path.join(sourceDir, "tinymce.min.js");

try {
  await access(mainFile);
} catch {
  console.warn(
    "[tinymce:copy] Skipped: tinymce package files not found in node_modules."
  );
  process.exit(0);
}

await mkdir(destinationDir, { recursive: true });
await cp(sourceDir, destinationDir, { recursive: true, force: true });

console.log("[tinymce:copy] TinyMCE assets copied to public/tinymce.");
