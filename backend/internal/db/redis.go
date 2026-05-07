package db

import "os"

func RedisURL() string {
	return os.Getenv("REDIS_URL")
}
