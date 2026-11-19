import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

const exec = promisify(execFile);
const maxImageBytes = 8_000_000;
const heading = /(?:전\s*성\s*분|화장품법에\s*따라.{0,40}모든\s*성분)/u;
const nextHeading = /(?:사용\s*할\s*때의\s*주의|사용\s*시의?\s*주의|기능성\s*화장품|품질\s*보증|소비자\s*상담|제조\s*번호|콘텐츠의\s*제작)/u;

export function extractIngredientExcerpt(input) {
  const text = input.normalize("NFKC").replace(/[\u0000-\u0008\u000b-\u001f]/gu, " ");
  for (const hit of text.matchAll(new RegExp(heading.source, "gu"))) {
    const body = text.slice(hit.index + hit[0].length, hit.index + hit[0].length + 1800).split(nextHeading)[0].trim();
    if ((body.match(/[,，]/gu)?.length ?? 0) >= 3 && /[가-힣]/u.test(body)) return body;
  }
  return null;
}

function allowedImage(input) {
  try {
    const url = new URL(input);
    return url.origin === "https://gi.esmplus.com" && !url.username && !url.password &&
      /^\/roundlab\/(?!HOME\/|etc\/)[^?#]+\.(jpe?g|png|webp|gif)$/iu.test(url.pathname) ? url : null;
  } catch { return null; }
}

async function downloadImage(input, fetcher) {
  const url = allowedImage(input);
  if (!url) throw new Error("Not an official detail image");
  const response = await fetcher(url, { redirect: "error", signal: AbortSignal.timeout(8000) });
  if (!response.ok || !/^image\/(jpeg|png|gif|webp)(?:;|$)/i.test(response.headers.get("content-type") ?? "") || !response.body) {
    throw new Error("Image unavailable");
  }
  const reader = response.body.getReader();
  const parts = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxImageBytes) { await reader.cancel(); throw new Error("Image too large"); }
    parts.push(Buffer.from(value));
  }
  return Buffer.concat(parts);
}

export async function readImage(bytes) {
  const dir = await mkdtemp(join(tmpdir(), "roundlab-ocr-"));
  try {
    const source = join(dir, "source");
    const png = join(dir, "review.png");
    await writeFile(source, bytes);
    await exec("convert", ["-limit", "memory", "128MiB", "-limit", "map", "256MiB", "-limit", "disk", "256MiB",
      `${source}[0]`, "-resize", "1200x10000>", "-colorspace", "Gray", png], { timeout: 12000 });
    const bottom = join(dir, "bottom.png");
    await exec("convert", [png, "-gravity", "south", "-crop", "100%x40%+0+0", "+repage", bottom], { timeout: 12000 });
    const recognize = async (path, mode) => (await exec("tesseract", [path, "stdout", "-l", "kor+eng", "--psm", mode],
      { timeout: 20000, maxBuffer: 200000 })).stdout;
    const bottomText = await recognize(bottom, "6").catch(() => "");
    return extractIngredientExcerpt(bottomText) ? bottomText : recognize(png, "11");
  } finally { await rm(dir, { recursive: true, force: true }); }
}

export async function addImageReviews(snapshot, { fetcher = fetch, ocr = readImage, now = new Date(), limit = 3 } = {}) {
  const updated = structuredClone(snapshot);
  const rows = Object.values(updated.products ?? {}).filter(row => row.state === "needs_review" && row.detailImages?.length)
    .sort((a, b) => (a.imageReview?.attemptedAt ?? "").localeCompare(b.imageReview?.attemptedAt ?? "")).slice(0, limit);
  for (const row of rows) {
    const attemptedAt = now.toISOString();
    const images = row.detailImages.filter(allowedImage).slice(-3).reverse();
    const previous = row.imageReview;
    const candidate = previous?.candidate;
    const imagesKey = createHash("sha256").update(JSON.stringify(images)).digest("hex");
    let checked = 0;
    let found = null;
    let unavailable = 0;
    for (const imageUrl of images) {
      try {
        const bytes = await downloadImage(imageUrl, fetcher);
        const hash = createHash("sha256").update(bytes).digest("hex");
        if (previous?.imagesKey === imagesKey && candidate?.imageUrl === imageUrl && candidate?.imageSha256 === hash) {
          found = candidate;
          break;
        }
        const excerpt = extractIngredientExcerpt(await ocr(bytes));
        checked++;
        if (excerpt) {
          found = { imageUrl, imageSha256: hash, excerpt, capturedAt: attemptedAt };
          break;
        }
      } catch { unavailable++; }
    }
    row.imageReview = { attemptedAt, imagesKey, checked, unavailable,
      status: found ? "pending_human_review" : checked ? "no_ingredient_section_found" : "unavailable",
      ...(found && { candidate: found }) };
  }
  return updated;
}

export async function reconcileImageApprovals(snapshot, approvals, { fetcher = fetch, now = new Date() } = {}) {
  const results = {};
  for (const [id, approval] of Object.entries(approvals)) {
    const row = snapshot.products?.[id];
    const listedSource = row?.listing?.volume === approval.volume && row.detailImages?.includes(approval.imageUrl);
    let status = "source_not_confirmed", currentImageSha256 = null;
    if (listedSource) {
      try {
        const bytes = await downloadImage(approval.imageUrl, fetcher);
        currentImageSha256 = createHash("sha256").update(bytes).digest("hex");
        status = currentImageSha256 === approval.imageSha256 ? "matches_reviewed_image" : "image_changed_needs_review";
      } catch { status = "image_unavailable"; }
    }
    results[id] = { ...approval, status, currentImageSha256, checkedAt: now.toISOString() };
  }
  return { ...snapshot, imageApprovalChecks: results };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const path = process.argv[2];
  if (!path) throw new Error("Pass a Round Lab snapshot file");
  await exec("tesseract", ["--list-langs"]).then(({ stdout }) => {
    if (!/^kor$/m.test(stdout)) throw new Error("Korean Tesseract language data is required");
  });
  const approvals = JSON.parse(await readFile(new URL("../data/roundlab-image-approvals.json", import.meta.url), "utf8"));
  const withOcr = await addImageReviews(JSON.parse(await readFile(path, "utf8")));
  const snapshot = await reconcileImageApprovals(withOcr, approvals);
  await writeFile(path, JSON.stringify(snapshot, null, 2) + "\n");
  console.log("Round Lab image review completed; recognition results require verification.");
}
