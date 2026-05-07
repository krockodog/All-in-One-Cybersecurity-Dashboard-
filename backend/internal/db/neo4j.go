package db

import "os"

func Neo4jURL() string {
	return os.Getenv("NEO4J_URL")
}
