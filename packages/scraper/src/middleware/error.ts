import type { Context } from 'hono'

export function errorHandler(err: Error, c: Context) {
	console.error('Unhandled error:', err)

	return c.json(
		{
			error: 'InternalServerError',
			message: err.message || 'An unexpected error occurred',
		},
		500
	)
}
