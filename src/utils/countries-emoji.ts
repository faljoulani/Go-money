// src/utils/countries-svg.ts
import raw from 'world-countries';

export type Country = {
  name: string;
  iso2: string; // cca2
  iso3: string; // cca3
  dial: string; // single string, e.g. "+962"
};

export const COUNTRY_LIST: Country[] = raw.map((c) => {
  const root = c.idd?.root ?? '';
  const first = c.idd?.suffixes?.[0] ?? '';
  const dial = root && first ? `${root}${first}` : '';

  return {
    name: String(c.name.common),
    iso2: String(c.cca2),
    iso3: String(c.cca3),
    dial,
  };
});

