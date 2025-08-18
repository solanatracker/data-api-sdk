/**
 * Utility functions for Solana Tracker API examples
 */
import { DataApiError, RateLimitError, ValidationError } from '@solana-tracker/data-api';

/**
 * Handle API errors with informative messages
 * @param error The error to handle
 */
export function handleError(error: RateLimitError | ValidationError | DataApiError | any): void {
  if (error instanceof RateLimitError) {
    console.error('⚠️ Rate limit exceeded. Retry after:', error.retryAfter, 'seconds');
    console.error('  Message:', error.message);
  } else if (error instanceof ValidationError) {
    console.error('⚠️ Validation error:', error.message);
  } else if (error instanceof DataApiError) {
    console.error('⚠️ API error:', error.message);
    console.error('  Status:', error.status);
    if (error.code) {
      console.error('  Code:', error.code);
    }
  } else {
    console.error('⚠️ Unexpected error:', error);
  }
}

/**
 * Format a number as currency string
 * @param amount The amount to format
 * @param currency The currency symbol, defaults to USD
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format a number as a percentage
 * @param value The value to format as percentage
 * @param decimals Number of decimal places, defaults to 2
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

/**
 * Format a numeric value with appropriate units (K, M, B)
 * @param value The numeric value to format
 * @returns Formatted string with appropriate units
 */
export function formatNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  } else {
    return value.toFixed(2);
  }
}

/**
 * Truncate a Solana address for display
 * @param address The Solana address to truncate
 * @returns Truncated address (e.g., "Addr5x...y1z2")
 */
export function truncateAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format a date from a timestamp
 * @param timestamp The timestamp (in milliseconds)
 * @returns Formatted date string
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

/**
 * Delay execution for specified milliseconds
 * @param ms Milliseconds to delay
 * @returns Promise that resolves after the delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}