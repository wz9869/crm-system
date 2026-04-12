export const CATEGORIES = [
  "Window Coverings",
  "Smart Home / AV",
  "Design",
  "Construction",
  "Retail / Dealer",
  "Architecture",
  "Real Estate",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

const rules: [Category, RegExp][] = [
  ["Window Coverings", /\b(window|blind|shade|shutter|curtain|drapery|draper|drap|screen|awning|tint|film|coverings?|sun\s*protect|solar.*shade|pergola)\b/i],
  ["Smart Home / AV", /\b(smart\s*home|home\s*auto|automation|integrat|a\/?v|audio|video|low\s*voltage|control4|iot|home\s*theater|home\s*entertainment|home\s*tech|crestron|savant|security.*auto|surveillance)\b/i],
  ["Design", /\b(interior\s*design|design\s*(studio|firm|service|consultant|build)|decorator|decor|stag|furnish|upholster|boutique|home\s*d[eé]cor)\b/i],
  ["Construction", /\b(construct|contractor|general\s*contract|builder|build|remodel|renovat|handyman|home\s*improve|home\s*repair|plumb|roof|floor|cabinet|millwork|subcontract)\b/i],
  ["Retail / Dealer", /\b(retail|dealer|wholesale|distribut|store|shop|e-?commerce|online|resell|resale|merchant|supply|supplier)\b/i],
  ["Architecture", /\b(architect|planning)\b/i],
  ["Real Estate", /\b(real\s*estate|property\s*manage|develop|investor|rental)\b/i],
];

export function categorize(businessType: string): Category {
  if (!businessType.trim()) return "Other";
  for (const [cat, re] of rules) {
    if (re.test(businessType)) return cat;
  }
  return "Other";
}

const catColors: Record<Category, string> = {
  "Window Coverings": "bg-violet-100 text-violet-700",
  "Smart Home / AV": "bg-blue-100 text-blue-700",
  "Design": "bg-pink-100 text-pink-700",
  "Construction": "bg-orange-100 text-orange-700",
  "Retail / Dealer": "bg-emerald-100 text-emerald-700",
  "Architecture": "bg-cyan-100 text-cyan-700",
  "Real Estate": "bg-amber-100 text-amber-700",
  "Other": "bg-slate-100 text-slate-500",
};

export function categoryColor(cat: Category): string {
  return catColors[cat];
}
