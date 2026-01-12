import { Hono } from 'hono'

let healthRoute = new Hono()

healthRoute.get('/', (c) => {
	return c.json({
		status: 'ok',
		timestamp: new Date().toISOString(),
	})
})

export { healthRoute }
