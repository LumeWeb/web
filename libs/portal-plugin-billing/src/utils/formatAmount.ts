interface FormatAmountOptions {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

// Currencies with 0 decimal places (no minor units)
const ZERO_DECIMAL_CURRENCIES = new Set([
  "JPY", // Japanese Yen
  "KRW", // South Korean Won
  "VND", // Vietnamese Dong
  "CLP", // Chilean Peso
  "PYG", // Paraguayan Guaraní
  "ISK", // Icelandic Króna
  "XOF", // West African CFA Franc
  "XAF", // Central African CFA Franc
  "UGX", // Ugandan Shilling
]);

// Currencies with 3 decimal places (dinar/rial currencies)
const THREE_DECIMAL_CURRENCIES = new Set([
  "KWD", // Kuwaiti Dinar
  "BHD", // Bahraini Dinar
  "OMR", // Omani Rial
  "JOD", // Jordanian Dinar
  "TND", // Tunisian Dinar
]);

export function formatAmount(
  value: number | string,
  options: FormatAmountOptions = {}
): string {
  const {
    currency = "USD",
    locale = "en-US",
    minimumFractionDigits,
    maximumFractionDigits,
  } = options;

  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (Number.isNaN(numValue)) {
    return "—";
  }

  const currencyUpper = currency.toUpperCase();
  let defaultFractions: number;

  if (ZERO_DECIMAL_CURRENCIES.has(currencyUpper)) {
    defaultFractions = 0;
  } else if (THREE_DECIMAL_CURRENCIES.has(currencyUpper)) {
    defaultFractions = 3;
  } else {
    defaultFractions = 2; // Standard for most currencies
  }

  const minFractions = minimumFractionDigits ?? defaultFractions;
  const maxFractions = maximumFractionDigits ?? defaultFractions;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: minFractions,
    maximumFractionDigits: maxFractions,
  }).format(numValue);
}

export function formatNumber(
  value: number | string,
  options: { locale?: string; maximumFractionDigits?: number } = {}
): string {
  const { locale = "en-US", maximumFractionDigits = 2 } = options;

  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (Number.isNaN(numValue)) {
    return "—";
  }

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits,
  }).format(numValue);
}
