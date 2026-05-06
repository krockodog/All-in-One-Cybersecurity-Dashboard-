package db

import "os"

func PostgresURL() string {
	return os.Getenv("POSTGRES_URL")
}
