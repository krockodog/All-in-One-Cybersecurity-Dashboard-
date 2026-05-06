package db

import "os"

func MinioEndpoint() string {
	return os.Getenv("MINIO_ENDPOINT")
}
