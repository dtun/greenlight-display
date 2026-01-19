import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { healthRoute } from './routes/health'
import { balancesRoute } from './routes/balances'
import { authMiddleware } from './middleware/auth'
import { errorHandler } from './middleware/error'

type Bindings = {
	KV_CACHE: KVNamespace
	API_KEY: string
	GREENLIGHT_USERNAME: string
	GREENLIGHT_PASSWORD: string
	BROWSER: Fetcher
}

let app = new Hono<{ Bindings: Bindings }>()

// Global middleware
app.use('*', cors())

// Public routes
app.get('/', (c) => {
	return c.json({ message: 'Greenlight scraper API' })
})
app.route('/health', healthRoute)

// Protected routes
app.use('/api/*', authMiddleware)
app.route('/api/balances', balancesRoute)

// Error handling
app.onError(errorHandler)

export default app
