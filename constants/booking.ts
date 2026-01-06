/**
 * Booking-related constants for The Ark booking system
 */

/**
 * Minimum hours required before booking time to allow cancellation
 * Applies to both full booking cancellation and individual slot deletion
 */
export const CANCELLATION_HOURS_REQUIRED = 72;

/**
 * Payment methods that allow cancellation
 */
export const CANCELLABLE_PAYMENT_METHODS = ["PayNow", "Credit Card", "Credit"];

/**
 * GST rate (as percentage)
 */
export const GST_PERCENTAGE = 9;

/**
 * Credit card transaction fee (as percentage)
 */
export const CARD_TRANSACTION_PERCENTAGE = 5;
