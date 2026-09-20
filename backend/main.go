package main

import (
	"backend-ppk/config"
	router "backend-ppk/routes"
	"fmt"
	"net/http"
)

func main() {
	config.ConnectDB()

	mux := router.SetupRoutes()

	fmt.Println("Backend is starting on :8080")

	err := http.ListenAndServe(":8080", mux)

	if err != nil {
		fmt.Printf("Server failed to start: %v\n", err)
	}
}
