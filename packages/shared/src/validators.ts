import type { Account, BalanceData, ScraperConfig } from './types'
import { ValidationError } from './errors'
import { defaultConfig } from './constants'

/**
 * Type guard for Account interface
 * Validates account structure and ensures total matches spending + savings
 */
export function isValidAccount(account: unknown): account is Account {
	throw new Error('isValidAccount not implemented yet')
}

/**
 * Type guard for BalanceData interface
 * Validates timestamp format, accounts array, and parentWallet
 */
export function isValidBalanceData(data: unknown): data is BalanceData {
	throw new Error('isValidBalanceData not implemented yet')
}

/**
 * Type guard for API key validation
 * Ensures key exists and is at least 32 characters long
 */
export function isValidApiKey(key: string | undefined): key is string {
	throw new Error('isValidApiKey not implemented yet')
}

/**
 * Validate and extract environment configuration
 * @throws {ValidationError} If required env vars are missing or invalid
 */
export function validateEnvConfig(env: NodeJS.ProcessEnv): ScraperConfig {
	throw new Error('validateEnvConfig not implemented yet')
}
