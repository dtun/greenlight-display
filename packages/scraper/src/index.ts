import { Hono } from 'hono'

let app = new Hono()

app.get('/', (c) => {
	return c.json({ message: 'Greenlight scraper API' })
})

app.get('/health', (c) => {
	return c.json({ status: 'ok' })
})

export default app
