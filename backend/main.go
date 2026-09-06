package main

import (
	"backend-ppk/middleware"
	router "backend-ppk/routes"
	"fmt"
	"net/http"
)

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("/auth/login", router.Login)
	mux.Handle("/profile", middleware.Auth(http.HandlerFunc(router.Dashboard)))

	err := http.ListenAndServe(":8080", mux)
	fmt.Printf("Starting to run backend...")
	if err != nil {
		fmt.Printf("Server failed to start %v", err)
	} else {
		fmt.Printf("Backend Is Started to run!")
	}
}
