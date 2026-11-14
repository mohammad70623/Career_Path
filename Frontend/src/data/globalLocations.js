/**
 * Enterprise Global Hierarchical Location Data & Filter Options
 * Covers all 6 Global Regions: Asia, Europe, North America, South America, Africa, Oceania
 * Cascades: Region -> Country -> State / Province / Division -> City
 */

export const GLOBAL_REGIONS = [
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Africa",
  "Oceania"
];

export const GLOBAL_LOCATIONS = {
  Asia: {
    Bangladesh: {
      "Dhaka Division": ["Dhaka", "Gazipur", "Narayanganj"],
      "Chattogram Division": ["Chattogram", "Cox's Bazar"],
      "Sylhet Division": ["Sylhet"],
      "Rajshahi Division": ["Rajshahi"]
    },
    India: {
      Karnataka: ["Bengaluru"],
      Maharashtra: ["Mumbai", "Pune"],
      "Delhi NCR": ["New Delhi", "Gurugram"]
    },
    Japan: {
      Kanto: ["Tokyo", "Yokohama"],
      Kansai: ["Osaka", "Kyoto"]
    },
    UAE: {
      Dubai: ["Dubai"],
      "Abu Dhabi": ["Abu Dhabi"]
    }
  },
  Europe: {
    UK: {
      England: ["London", "Manchester"],
      Scotland: ["Edinburgh"]
    },
    Germany: {
      Berlin: ["Berlin"],
      Bavaria: ["Munich"],
      Hesse: ["Frankfurt"]
    },
    France: {
      "Île-de-France": ["Paris"],
      "Auvergne-Rhône-Alpes": ["Lyon"]
    }
  },
  "North America": {
    USA: {
      California: ["San Francisco", "Los Angeles"],
      "New York": ["New York City"],
      Texas: ["Austin", "Dallas"]
    },
    Canada: {
      Ontario: ["Toronto", "Ottawa"],
      "British Columbia": ["Vancouver"]
    },
    Mexico: {
      CDMX: ["Mexico City"],
      "Nuevo León": ["Monterrey"]
    }
  },
  "South America": {
    Brazil: {
      "São Paulo": ["São Paulo"],
      "Rio de Janeiro": ["Rio de Janeiro"]
    },
    Argentina: {
      "Buenos Aires": ["Buenos Aires"]
    },
    Chile: {
      "Santiago Metropolitan": ["Santiago"]
    }
  },
  Africa: {
    Nigeria: {
      Lagos: ["Lagos"],
      FCT: ["Abuja"]
    },
    Egypt: {
      Cairo: ["Cairo"],
      Giza: ["Giza"]
    },
    Kenya: {
      Nairobi: ["Nairobi"]
    }
  },
  Oceania: {
    Australia: {
      "New South Wales": ["Sydney"],
      Victoria: ["Melbourne"]
    },
    "New Zealand": {
      Auckland: ["Auckland"],
      Wellington: ["Wellington"]
    }
  }
};

/**
 * Filter Option Constants
 */
export const JOB_TYPES = ["All", "Remote", "On-site", "Hybrid"];

export const EMPLOYMENT_TYPES = ["All", "Full-time", "Part-time", "Contract", "Internship"];

export const EXPERIENCE_LEVELS = ["All", "Entry", "Mid", "Senior", "Lead / Principal"];

export const INDUSTRIES = [
  "All",
  "IT & Software",
  "AI & Data Science",
  "Healthcare",
  "Finance & FinTech",
  "E-Commerce",
  "Education"
];

export const SALARY_RANGES = [
  "Any Salary",
  "$500 – $2,000",
  "$2,000 – $5,000",
  "$5,000 – $10,000",
  "$10,000+"
];

export const WORK_AUTHORIZATIONS = [
  "Any",
  "Visa sponsorship available",
  "Local work permit required",
  "Remote global (No visa needed)"
];

/**
 * Helper Utilities for Geographic Cascading
 */
export const getCountriesForRegion = (region) => {
  const regionData = GLOBAL_LOCATIONS[region];
  return regionData ? Object.keys(regionData) : [];
};

export const getStatesForCountry = (region, country) => {
  const regionData = GLOBAL_LOCATIONS[region];
  if (!regionData) return [];
  const countryData = regionData[country];
  return countryData ? Object.keys(countryData) : [];
};

export const getCitiesForState = (region, country, state) => {
  const regionData = GLOBAL_LOCATIONS[region];
  if (!regionData) return [];
  const countryData = regionData[country];
  if (!countryData) return [];
  return countryData[state] || [];
};

/**
 * Get valid default fallback hierarchy for a region
 */
export const getDefaultGeoForRegion = (region) => {
  const countries = getCountriesForRegion(region);
  const country = countries[0] || "";
  const states = getStatesForCountry(region, country);
  const state = states[0] || "";
  const cities = getCitiesForState(region, country, state);
  const city = cities[0] || "";
  return { country, state, city };
};
