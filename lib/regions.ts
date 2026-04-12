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

const KNOWN_COUNTRIES = [
  "Canada", "Mexico", "UK", "United Kingdom", "France", "Germany",
  "Australia", "Brazil", "India", "China", "Japan", "South Korea",
  "Italy", "Spain", "Netherlands", "Sweden", "Norway", "Denmark",
  "Switzerland", "Belgium", "Austria", "Portugal", "Ireland",
  "New Zealand", "Singapore", "Malaysia", "Thailand", "Philippines",
  "Indonesia", "Vietnam", "UAE", "Saudi Arabia", "Israel", "Turkey",
  "South Africa", "Nigeria", "Colombia", "Chile", "Argentina", "Peru",
  "Puerto Rico", "Dominican Republic", "Costa Rica", "Panama",
];

const COUNTRY_LOWER = new Map(
  KNOWN_COUNTRIES.map((c) => [c.toLowerCase(), c]),
);

/**
 * Parse an address string and return a normalized region label.
 * - US addresses → state full name (e.g. "Texas")
 * - Non-US → country name (e.g. "Canada")
 * - Unknown → "Other"
 */
export function extractRegion(address: string): string {
  if (!address.trim()) return "Unknown";

  const upper = address.toUpperCase();
  const lower = address.toLowerCase();

  // 1. Match US state abbreviation (e.g. ", TX " or ", TX," or ending with " TX")
  const abbrMatch = upper.match(/\b([A-Z]{2})\b/g);
  if (abbrMatch) {
    for (let i = abbrMatch.length - 1; i >= 0; i--) {
      const candidate = abbrMatch[i];
      if (STATE_ABBR_SET.has(candidate)) {
        return US_STATES[candidate];
      }
    }
  }

  // 2. Match full US state name
  for (const [nameLower, abbr] of STATE_NAME_TO_ABBR) {
    if (lower.includes(nameLower)) {
      return US_STATES[abbr];
    }
  }

  // 3. Match known country
  for (const [countryLower, countryOriginal] of COUNTRY_LOWER) {
    if (lower.includes(countryLower)) {
      return countryOriginal;
    }
  }

  // 4. "USA" / "US" / "United States" → try harder with zip code pattern
  if (/\bUS(?:A)?\b/i.test(address) || /united\s+states/i.test(address)) {
    return "USA (state unknown)";
  }

  return "Other";
}

/**
 * Build a sorted, deduplicated list of region labels from a list of customers.
 * US states come first (sorted), then international countries (sorted), then Other/Unknown last.
 */
export function buildRegionOptions(addresses: string[]): string[] {
  const regionSet = new Set<string>();
  for (const addr of addresses) {
    regionSet.add(extractRegion(addr));
  }

  const usStates: string[] = [];
  const countries: string[] = [];
  const others: string[] = [];

  const stateNameSet = new Set(Object.values(US_STATES));

  for (const r of regionSet) {
    if (stateNameSet.has(r) || r === "USA (state unknown)") {
      usStates.push(r);
    } else if (r === "Other" || r === "Unknown") {
      others.push(r);
    } else {
      countries.push(r);
    }
  }

  usStates.sort();
  countries.sort();
  others.sort();

  return [...usStates, ...countries, ...others];
}
