const US_STATES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas",
  CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho",
  IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
  KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah",
  VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia",
  WI: "Wisconsin", WY: "Wyoming", DC: "Washington DC",
};

const STATE_ABBR_SET = new Set(Object.keys(US_STATES));
const STATE_NAME_TO_ABBR = new Map(
  Object.entries(US_STATES).map(([abbr, name]) => [name.toLowerCase(), abbr]),
);

export function extractStateAbbr(address: string): string | null {
  if (!address.trim()) return null;
  const upper = address.toUpperCase();
  const lower = address.toLowerCase();

  const abbrMatch = upper.match(/\b([A-Z]{2})\b/g);
  if (abbrMatch) {
    for (let i = abbrMatch.length - 1; i >= 0; i--) {
      if (STATE_ABBR_SET.has(abbrMatch[i])) return abbrMatch[i];
    }
  }

  for (const [nameLower, abbr] of STATE_NAME_TO_ABBR) {
    if (lower.includes(nameLower)) return abbr;
  }

  return null;
}

export function buildStateOptions(addresses: string[]): string[] {
  const found = new Set<string>();
  for (const addr of addresses) {
    const abbr = extractStateAbbr(addr);
    if (abbr) found.add(abbr);
  }
  return [...found].sort();
}

export function stateFullName(abbr: string): string {
  return US_STATES[abbr] ?? abbr;
}
