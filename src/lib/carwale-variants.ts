export type CarwaleTrim = {
  versionName: string;
  baseSuffix: string;
  variant: string;
};

export type CarwaleTrimOptions = {
  baseSuffixes: string[];
  variantsByBase: Record<string, string[]>;
  trims: CarwaleTrim[];
};

const COLOR_SUFFIX =
  /\s+(?:Platinum White Pearl|Attitude Black|Mario Black|Ocean Blue|Cafe White|Granite Grey|Aqua|Magnetic Grey|Mica|Metallic|Pearl)(?:\s+\d+\s*STR)?$/i;

function decodeJsonString(value: string) {
  return value
    .replace(/\\u0026/g, "&")
    .replace(/\\u0027/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeVersionName(versionName: string) {
  return versionName.replace(COLOR_SUFFIX, "").replace(/\s+/g, " ").trim();
}

export function parseVersionName(versionName: string): { baseSuffix: string; variant: string } {
  const trimmed = normalizeVersionName(versionName);
  if (!trimmed) return { baseSuffix: "", variant: "" };

  const gxO = trimmed.match(/^(GX\s\(O\))\s+(.+)$/i);
  if (gxO) return { baseSuffix: gxO[1], variant: gxO[2] };

  const hybridTrim = trimmed.match(/^((?:Elegant|Sprint Edition|E|G|V|GX|VX|ZX|S|G)\s+Hybrid(?:\s+\([^)]+\))?)\s+(.+)$/i);
  if (hybridTrim) return { baseSuffix: hybridTrim[1], variant: hybridTrim[2] };

  const engineTrim = trimmed.match(/^(\d+(?:\.\d+)?(?:\s+[A-Z]+(?:\s+\(O\))?)?)\s+(.+)$/i);
  if (engineTrim) return { baseSuffix: engineTrim[1], variant: engineTrim[2] };

  const shortTrim = trimmed.match(/^([A-Z0-9]+(?:\s\(O\))?)\s+(.+)$/i);
  if (shortTrim) return { baseSuffix: shortTrim[1], variant: shortTrim[2] };

  return { baseSuffix: "", variant: trimmed };
}

export function extractCarwaleVersionsFromHtml(html: string): CarwaleTrim[] {
  const matches = [...html.matchAll(/"versionName"\s*:\s*"((?:\\.|[^"\\])*)"/g)];
  const seen = new Set<string>();
  const trims: CarwaleTrim[] = [];

  for (const match of matches) {
    const versionName = decodeJsonString(match[1]);
    if (!versionName || versionName.length < 3) continue;

    const normalized = normalizeVersionName(versionName);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);

    const { baseSuffix, variant } = parseVersionName(normalized);
    trims.push({ versionName: normalized, baseSuffix, variant });
  }

  return trims;
}

export function buildTrimOptions(trims: CarwaleTrim[]): CarwaleTrimOptions {
  const baseSuffixSet = new Set<string>();
  const variantsByBase = new Map<string, Set<string>>();

  for (const trim of trims) {
    const base = trim.baseSuffix.trim() || "Standard";
    baseSuffixSet.add(base);
    if (!variantsByBase.has(base)) variantsByBase.set(base, new Set());
    variantsByBase.get(base)!.add(trim.variant.trim() || trim.versionName);
  }

  const variantsByBaseRecord: Record<string, string[]> = {};
  for (const [base, variants] of variantsByBase) {
    variantsByBaseRecord[base] = [...variants].sort((a, b) => a.localeCompare(b));
  }

  return {
    baseSuffixes: [...baseSuffixSet].sort((a, b) => a.localeCompare(b)),
    variantsByBase: variantsByBaseRecord,
    trims,
  };
}

export function mergeTrimOptions(
  primary: CarwaleTrimOptions,
  extra: { baseSuffix: string | null; variant: string | null }[],
): CarwaleTrimOptions {
  const trims = [...primary.trims];
  const baseSuffixSet = new Set(primary.baseSuffixes);
  const variantsByBase: Record<string, string[]> = { ...primary.variantsByBase };

  for (const row of extra) {
    const base = row.baseSuffix?.trim() || "Standard";
    const variant = row.variant?.trim();
    if (!variant) continue;

    baseSuffixSet.add(base);
    if (!variantsByBase[base]) variantsByBase[base] = [];
    if (!variantsByBase[base].includes(variant)) variantsByBase[base].push(variant);

    const versionName = [row.baseSuffix, row.variant].filter(Boolean).join(" ").trim();
    if (!trims.some((trim) => trim.baseSuffix === base && trim.variant === variant)) {
      trims.push({ versionName, baseSuffix: base === "Standard" ? "" : base, variant });
    }
  }

  for (const base of Object.keys(variantsByBase)) {
    variantsByBase[base].sort((a, b) => a.localeCompare(b));
  }

  return {
    baseSuffixes: [...baseSuffixSet].sort((a, b) => a.localeCompare(b)),
    variantsByBase,
    trims,
  };
}
