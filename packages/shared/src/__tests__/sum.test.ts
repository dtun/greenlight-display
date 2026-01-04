import { describe, it, expect } from 'vitest'

function sum(a: number, b: number): number {
	return a + b
}

describe('sum', () => {
	it('should add two numbers correctly', () => {
		// Arrange
		let a = 1
		let b = 2

		// Act
		let result = sum(a, b)

		// Assert
		expect(result).toBe(3)
	})
})
