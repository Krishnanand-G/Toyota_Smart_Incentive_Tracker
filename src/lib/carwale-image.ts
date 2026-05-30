import {
  buildTrimOptions,
  extractCarwaleVersionsFromHtml,
  type CarwaleTrimOptions,
} from "@/lib/carwale-variants";

const CARWALE_SLUGS: Record<string, string> = {
  "innova hycross": "innova-hycross",
  "innova crysta": "innova-crysta",
  "urban cruiser hyryder": "hyryder",
  hyryder: "hyryder",
  "urban cruiser taisor": "taisor",
  taisor: "taisor",
  glanza: "glanza",
  rumion: "rumion",
  fortuner: "fortuner",
  "fortuner legender": "fortuner-legender",
  hilux: "hilux",
  camry: "camry",
  vellfire: "vellfire",
  "land cruiser 300": "land-cruiser",
  "land cruiser lc300": "land-cruiser",
};

export type CarwaleModelData = {
  imageUrl: string | null;
  description: string | null;
  trimOptions: CarwaleTrimOptions;
};

function decodeHtml(value: string) {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"');
}

function decodeJsonString(value: string) {
  return value
    .replace(/\\u0026/g, "&")
    .replace(/\\u0027/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function modelNameToCarwaleSlug(modelName: string): string {
  const trimmed = modelName.trim();
  if (!trimmed) return "";

  const mapped = CARWALE_SLUGS[trimmed.toLowerCase()];
  if (mapped) return mapped;

  return trimmed
    .toLowerCase()
    .replace(/^urban cruiser\s+/i, "")
    .replace(/^innova\s+/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function carwaleModelUrl(slug: string) {
  return `https://www.carwale.com/toyota-cars/${slug}/`;
}

export function normalizeCarwaleImageUrl(url: string) {
  const decoded = decodeHtml(url);
  return decoded.replace(/\/\d+x\d+\//, "/664x374/");
}

export function extractCarwaleImageFromHtml(html: string): string | null {
  const ogMatch = html.match(/property="og:image"\s+content="([^"]+)"/i);
  if (ogMatch?.[1]) {
    return normalizeCarwaleImageUrl(decodeHtml(ogMatch[1]));
  }

  const preloadMatch = html.match(
    /rel="preload"\s+href="(https:\/\/imgd\.aeplcdn\.com\/664x374[^"]+)"/i,
  );
  if (preloadMatch?.[1]) {
    return normalizeCarwaleImageUrl(decodeHtml(preloadMatch[1]));
  }

  const exteriorMatch = html.match(
    /https:\/\/imgd\.aeplcdn\.com\/664x374\/[^"'\s]+exterior[^"'\s]*/i,
  );
  if (exteriorMatch?.[0]) {
    return normalizeCarwaleImageUrl(exteriorMatch[0]);
  }

  const dataSrcMatch = html.match(
    /data-src="(https:\/\/imgd\.aeplcdn\.com\/[^"]+exterior-right-front-three-quarter[^"]*)"/i,
  );
  if (dataSrcMatch?.[1]) {
    return normalizeCarwaleImageUrl(decodeHtml(dataSrcMatch[1]));
  }

  return null;
}

export function extractCarwaleDescriptionFromHtml(html: string): string | null {
  const matches = [...html.matchAll(/"description"\s*:\s*"((?:\\.|[^"\\])*)"/g)];
  for (const m of matches) {
    const text = decodeJsonString(m[1]);
    if (text.length < 80) continue;
    if (/^The price of .+ seater/i.test(text)) return text;
  }

  for (const m of matches) {
    const text = decodeJsonString(m[1]);
    if (text.length >= 120 && !/^Set by the Indian Government/i.test(text)) return text;
  }

  const og = html.match(/property="og:description"\s+content="([^"]+)"/i);
  return og?.[1] ? decodeHtml(og[1]) : null;
}

export function extractCarwaleDataFromHtml(html: string): CarwaleModelData {
  return {
    imageUrl: extractCarwaleImageFromHtml(html),
    description: extractCarwaleDescriptionFromHtml(html),
    trimOptions: buildTrimOptions(extractCarwaleVersionsFromHtml(html)),
  };
}

const dataCache = new Map<string, { data: CarwaleModelData; expires: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

async function fetchCarwalePageHtml(slug: string): Promise<string | null> {
  const pageUrl = carwaleModelUrl(slug);
  const res = await fetch(pageUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; ToyotaIncentiveTracker/1.0)",
      Accept: "text/html",
    },
    next: { revalidate: 86400 },
  });

  if (!res.ok) return null;
  return res.text();
}

export async function fetchCarwaleDataForModel(modelName: string): Promise<CarwaleModelData | null> {
  const slug = modelNameToCarwaleSlug(modelName);
  if (!slug) return null;

  const cached = dataCache.get(slug);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  const html = await fetchCarwalePageHtml(slug);
  if (!html) {
    const empty = { imageUrl: null, description: null, trimOptions: buildTrimOptions([]) };
    dataCache.set(slug, { data: empty, expires: Date.now() + 5 * 60 * 1000 });
    return empty;
  }

  const data = extractCarwaleDataFromHtml(html);
  dataCache.set(slug, { data, expires: Date.now() + CACHE_TTL_MS });
  return data;
}

export async function fetchCarwaleImageForModel(modelName: string): Promise<string | null> {
  const data = await fetchCarwaleDataForModel(modelName);
  return data?.imageUrl ?? null;
}

export async function fetchCarwaleDescriptionForModel(modelName: string): Promise<string | null> {
  const data = await fetchCarwaleDataForModel(modelName);
  return data?.description ?? null;
}
