export const UTM_PARAMETER_NAMES = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "utm_source_platform",
  "utm_creative_format",
  "utm_marketing_tactic",
] as const;

export type UtmParameterName = (typeof UTM_PARAMETER_NAMES)[number];
export type UtmParameters = Partial<Record<UtmParameterName, string>>;

const UTM_STORAGE_KEY = "kodeva-utm-parameters";
const MAX_UTM_VALUE_LENGTH = 500;

function sanitizeUtmValue(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const sanitized = value.trim().slice(0, MAX_UTM_VALUE_LENGTH);
  return sanitized || undefined;
}

export function getUtmParametersFromSearch(
  search: string | URLSearchParams,
): UtmParameters {
  const params =
    typeof search === "string"
      ? new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
      : search;
  const utmParameters: UtmParameters = {};

  for (const name of UTM_PARAMETER_NAMES) {
    const value = sanitizeUtmValue(params.get(name));
    if (value) utmParameters[name] = value;
  }

  return utmParameters;
}

export function getUtmParametersFromRecord(value: unknown): UtmParameters {
  if (typeof value !== "object" || value === null) return {};

  const record = value as Record<string, unknown>;
  const utmParameters: UtmParameters = {};
  for (const name of UTM_PARAMETER_NAMES) {
    const sanitized = sanitizeUtmValue(record[name]);
    if (sanitized) utmParameters[name] = sanitized;
  }

  return utmParameters;
}

export function getStoredUtmParameters(): UtmParameters {
  if (typeof window === "undefined") return {};

  try {
    const stored = window.sessionStorage.getItem(UTM_STORAGE_KEY);
    if (!stored) return {};
    return getUtmParametersFromRecord(JSON.parse(stored));
  } catch {
    return {};
  }
}

export function captureUtmParameters(search: string): UtmParameters {
  if (typeof window === "undefined") return {};

  const captured = getUtmParametersFromSearch(search);
  const utmParameters = { ...getStoredUtmParameters(), ...captured };

  if (Object.keys(utmParameters).length > 0) {
    try {
      window.sessionStorage.setItem(
        UTM_STORAGE_KEY,
        JSON.stringify(utmParameters),
      );
    } catch {
      return utmParameters;
    }
  }

  return utmParameters;
}

export function appendUtmParameters<T extends object>(
  payload: T,
  utmParameters: UtmParameters = getStoredUtmParameters(),
): T & UtmParameters {
  return { ...payload, ...utmParameters };
}
