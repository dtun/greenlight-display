import type { Context, Next } from 'hono'

type Bindings = {
	API_KEY: string
}

export async function authMiddleware(c: Context<{ Bindings: Bindings }>, next: Next) {
	let authHeader = c.req.header('Authorization')

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return c.json(
			{
				error: 'Unauthorized',
				message: 'Missing or invalid Authorization header',
			},
			401
		)
	}

	let token = authHeader.substring(7) // Remove 'Bearer '
	let expectedToken = c.env.API_KEY

	if (!token || token !== expectedToken) {
		return c.json({ error: 'Unauthorized', message: 'Invalid API key' }, 401)
	}

	await next()
}
