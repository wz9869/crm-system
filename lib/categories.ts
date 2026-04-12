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
  ["Window Coverings", /\b(window|blinds?|shad(?:e|ing)|shutter|curtain|drapery|draper|drap|screen|awning|tint|film|covering|coverings|sun\s*protect|solar.*shade|pergola|bli\s*ds|motorized\s*shade|skylight)/i],
  ["Smart Home / AV", /\b(smart\s*home|smart\s*homes|samart|home\s*auto|automat|integrat|integreator|a\/v|audio|video|low\s*volt|control4|iot|home\s*theater|home\s*entertainment|home\s*tech|crestron|savant|security|surveillance|domotique|network|av\b|home\s*technology|technolgy\s*integrat)/i],
  ["Design", /\b(interior|design\s*(studio|firm|service|consultant|build)|designer|decorator|decor(?:at)?|stag|furnish|upholster|boutique|home\s*d[eé]cor|interiors|workroom|home\s*design)/i],
  ["Construction", /\b(construct|contruct|contractor|contracter|general\s*contract|homebuilder|builder|build|remodel|renovat|handyman|home\s*improve|home\s*repair|home\s*renovation|plumb|roof|floor|cabinet|millwork|subcontract|contract(?:ing|or|ers)|electrical|electric|install(?:er|ation)?|carpent|home\s*service)/i],
  ["Retail / Dealer", /\b(retail|dealer|wholesale|distribut|store|shop|e-?commerce|online|resell|resale|merchant|supply|supplier|wholesaler|retailer|whole\s*seller|sales\b)/i],
  ["Architecture", /\b(architect)/i],
  ["Real Estate", /\b(real\s*estate|real\s*eatate|property\s*manage|property\s*remodel|develop|investor|rental)/i],
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
