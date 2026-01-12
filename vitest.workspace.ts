import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
	'packages/scraper/vitest.config.ts',
	'packages/shared/vitest.config.ts',
])
