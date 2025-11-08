import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  amount: number | null | undefined,
  currencyCode: string | null | undefined = 'USD',
  fallback: string = 'N/A'
): string {
  if (amount === null || amount === undefined) {
    return fallback;
  }

  let locale = 'en-US'; // Default to US locale
  let currencySymbol = '$';

  switch (currencyCode?.toUpperCase()) {
    case 'NAIRA':
      currencySymbol = '₦';
      locale = 'en-NG';
      break;
    case 'EURO':
      currencySymbol = '€';
      locale = 'en-EU';
      break;
    case 'POUNDS STERLING':
      currencySymbol = '£';
      locale = 'en-GB';
      break;
    case 'DOLLAR': // Assuming this means USD
    case 'USD':
    default:
      currencySymbol = '$';
      locale = 'en-US';
      break;
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode?.toUpperCase() === 'NAIRA' ? 'NGN' : currencyCode?.toUpperCase() === 'EURO' ? 'EUR' : currencyCode?.toUpperCase() === 'POUNDS STERLING' ? 'GBP' : 'USD',
      minimumFractionDigits: 0, // No cents for large amounts
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (error) {
    console.error("Error formatting currency:", error);
    // Fallback to a simpler format if Intl.NumberFormat fails
    return `${currencySymbol}${amount.toLocaleString(locale)}`;
  }
}