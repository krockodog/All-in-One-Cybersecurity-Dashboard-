package risk

import "time"

type EPSSCacheItem struct {
	Score     float64
	FetchedAt time.Time
}

func IsExpired(item EPSSCacheItem, ttl time.Duration) bool {
	return time.Since(item.FetchedAt) > ttl
}
