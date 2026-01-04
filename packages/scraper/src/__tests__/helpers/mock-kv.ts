import { vi } from 'vitest'

export function createMockKV() {
	let store = new Map<string, { value: string; metadata?: any }>()

	return {
		get: vi.fn(async (key: string, type?: string) => {
			let entry = store.get(key)
			if (!entry) return null
			return type === 'json' ? JSON.parse(entry.value) : entry.value
		}),

		getWithMetadata: vi.fn(async (key: string, type?: string) => {
			let entry = store.get(key)
			if (!entry) return { value: null, metadata: null }
			let value = type === 'json' ? JSON.parse(entry.value) : entry.value
			return { value, metadata: entry.metadata }
		}),

		put: vi.fn(async (key: string, value: string, options?: any) => {
			store.set(key, {
				value,
				metadata: options?.metadata,
			})
		}),

		delete: vi.fn(async (key: string) => {
			store.delete(key)
		}),

		list: vi.fn(async () => {
			return { keys: Array.from(store.keys()).map((name) => ({ name })) }
		}),

		// Test helpers
		_clear: () => store.clear(),
		_getStore: () => store,
	}
}
