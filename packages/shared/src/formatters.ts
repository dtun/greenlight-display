/**
 * Format a number as USD currency
 * @example formatCurrency(125.5) // "$125.50"
 */
export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	}).format(amount)
}

/**
 * Format an ISO 8601 timestamp to readable short format
 * @example formatTimestamp("2026-01-03T10:30:00Z") // "Jan 3, 10:30 AM"
 */
export function formatTimestamp(isoString: string): string {
	let date = new Date(isoString)

	// Check if date is valid
	if (isNaN(date.getTime())) {
		throw new Error('Invalid ISO 8601 timestamp')
	}

	// Format date part: "Jan 3"
	let dateFormatter = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
	})

	// Format time part: "10:30 AM"
	let timeFormatter = new Intl.DateTimeFormat('en-US', {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true,
	})

	let datePart = dateFormatter.format(date)
	let timePart = timeFormatter.format(date)

	return `${datePart}, ${timePart}`
}

/**
 * Parse a currency string to a number
 * @example parseCurrencyString("$1,234.56") // 1234.56
 */
export function parseCurrencyString(currencyStr: string): number {
	return parseFloat(currencyStr.replace(/[$,\s]/g, ''))
}

/**
 * Sanitize an account name
 * @example sanitizeAccountName("  Alice  ") // "Alice"
 */
export function sanitizeAccountName(name: string): string {
	return name.trim().substring(0, 50)
}
