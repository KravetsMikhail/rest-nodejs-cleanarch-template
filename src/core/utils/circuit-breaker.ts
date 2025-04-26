import { Logger } from '../logger/logger'

export enum CircuitBreakerState {
    CLOSED = 'CLOSED',
    OPEN = 'OPEN',
    HALF_OPEN = 'HALF_OPEN'
}

export class CircuitBreaker {
    private state: CircuitBreakerState = CircuitBreakerState.CLOSED
    private failureCount: number = 0
    private lastFailureTime: number = 0
    private readonly logger: Logger
    private readonly failureThreshold: number
    private readonly resetTimeout: number
    private readonly maxRetries: number

    constructor(failureThreshold: number = 3, resetTimeout: number = 10000, maxRetries: number = 5) {
        this.logger = new Logger()
        this.failureThreshold = failureThreshold
        this.resetTimeout = resetTimeout
        this.maxRetries = maxRetries
    }

    public async execute<T>(operation: () => Promise<T>): Promise<T> {
        if (this.state === CircuitBreakerState.OPEN) {
            if (this.shouldReset()) {
                this.state = CircuitBreakerState.HALF_OPEN
                this.logger.info('Circuit breaker entering HALF-OPEN state')
            } else {
                throw new Error('Circuit breaker is OPEN')
            }
        }

        try {
            const result = await operation()
            this.onSuccess()
            return result
        } catch (error) {
            this.onFailure()
            throw error
        }
    }

    private onSuccess(): void {
        this.failureCount = 0
        if (this.state === CircuitBreakerState.HALF_OPEN) {
            this.state = CircuitBreakerState.CLOSED
            this.logger.info('Circuit breaker entering CLOSED state')
        }
    }

    private onFailure(): void {
        this.failureCount++
        this.lastFailureTime = Date.now()

        if (this.failureCount >= this.failureThreshold) {
            this.state = CircuitBreakerState.OPEN
            this.logger.error('Circuit breaker entering OPEN state')
        } else if (this.state === CircuitBreakerState.HALF_OPEN) {
            this.state = CircuitBreakerState.OPEN
            this.logger.error('Circuit breaker entering OPEN state')
        }
    }

    private shouldReset(): boolean {
        return Date.now() - this.lastFailureTime >= this.resetTimeout
    }

    public getState(): CircuitBreakerState {
        return this.state
    }

    public getFailureCount(): number {
        return this.failureCount
    }
} 