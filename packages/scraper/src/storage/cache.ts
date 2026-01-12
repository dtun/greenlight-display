import { isValidBalanceData, type BalanceData } from '@greenlight-trmnl/shared'

export class KVCache {
	private kv: KVNamespace

	constructor(kv: KVNamespace) {
		this.kv = kv
	}

	async get(key: string): Promise<BalanceData | null> {
		let value = await this.kv.get(key, 'json')
		if (value === null) {
			return null
		}
		if (!isValidBalanceData(value)) {
			console.warn(`Invalid balance data in cache for key: ${key}`)
			return null
		}
		return value
	}

	async set(key: string, value: BalanceData, expirationTtl: number): Promise<void> {
		await this.kv.put(key, JSON.stringify(value), {
			expirationTtl,
		})
	}

	async setWithMetadata(
		key: string,
		value: BalanceData,
		metadata: { timestamp: number },
		expirationTtl: number
	): Promise<void> {
		await this.kv.put(key, JSON.stringify(value), {
			expirationTtl,
			metadata,
		})
	}

	async getWithMetadata(key: string): Promise<{
		value: BalanceData | null
		metadata: { timestamp: number } | null
	}> {
		let result = await this.kv.getWithMetadata(key, 'json')

		// Validate the cached data
		let value: BalanceData | null = null
		if (result.value !== null && isValidBalanceData(result.value)) {
			value = result.value
		} else if (result.value !== null) {
			console.warn(`Invalid balance data in cache for key: ${key}`)
		}

		// Validate metadata structure
		let metadata: { timestamp: number } | null = null
		if (
			result.metadata !== null &&
			typeof result.metadata === 'object' &&
			'timestamp' in result.metadata &&
			typeof (result.metadata as { timestamp: unknown }).timestamp === 'number'
		) {
			metadata = result.metadata as { timestamp: number }
		}

		return { value, metadata }
	}

	async delete(key: string): Promise<void> {
		await this.kv.delete(key)
	}
}
