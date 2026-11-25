// SPDX-License-Identifier: MIT
// Copies POST.json from the repository to the grader's output directory.
// The house reads the post itself from the URL in POST.json; nothing written
// here about the post counts.
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const postPath = new URL("./POST.json", import.meta.url).pathname;

const raw = readFileSync(postPath, "utf8");
let parsed: unknown;
try {
  parsed = JSON.parse(raw);
} catch {
  console.error("POST.json is not valid JSON");
  process.exit(1);
}
if (
  typeof parsed !== "object" ||
  parsed === null ||
  typeof (parsed as { url?: unknown }).url !== "string"
) {
  console.error("POST.json must be an object with a url string");
  process.exit(1);
}
const url = (parsed as { url: string }).url;
// Accept https://x.com/<handle>/status/<digits> (also twitter.com, www./mobile.
// prefixes, /i/web/status/<digits>, and a trailing query/fragment, which the
// house reads past).
const stripped = url.split(/[?#]/)[0];
const match =
  /^https:\/\/(?:www\.|mobile\.)?(?:x\.com|twitter\.com)\/(?:[^/]+\/status|i\/web\/status)\/(\d+)$/.exec(
    stripped,
  );
if (!match) {
  console.error(`POST.json url is not a valid X post address: ${url}`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
copyFileSync(postPath, join(outDir, "POST.json"));
console.log(`Wrote ${join(outDir, "POST.json")} for post ${match[1]}`);
