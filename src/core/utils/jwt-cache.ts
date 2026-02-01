interface CachedToken {
    token: string
    expiresAt: number
}

export class JwtCache {
    private static instance: JwtCache
    private cache: Map<string, CachedToken> = new Map()
    private readonly CACHE_TTL = 5 * 60 * 1000 // 5 минут

    private constructor() {}

    public static getInstance(): JwtCache {
        if (!JwtCache.instance) {
            JwtCache.instance = new JwtCache()
        }
        return JwtCache.instance
    }

    public getToken(key: string): string | null {
        const cached = this.cache.get(key)
        if (!cached) return null

        if (Date.now() > cached.expiresAt) {
            this.cache.delete(key)
            return null
        }

        return cached.token
    }

    public setToken(key: string, token: string): void {
        this.cache.set(key, {
            token,
            expiresAt: Date.now() + this.CACHE_TTL
        })
    }

    public clearExpired(): void {
        const now = Date.now()
        for (const [key, cached] of this.cache.entries()) {
            if (now > cached.expiresAt) {
                this.cache.delete(key)
            }
        }
    }

    public clear(): void {
        this.cache.clear()
    }

    public size(): number {
        return this.cache.size
    }
}
