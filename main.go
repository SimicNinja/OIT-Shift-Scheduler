package main

import (
	// "fmt"
	"log"
	"net/http"
)

// Home Route/Handler
func home(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Hello World"))
}

func main() {
	// Servemux is the same as a React Browser Router
	mux := http.NewServeMux()

	// Route Declarations
	mux.HandleFunc("/", home)

	// Start server at http://localhost:4444
	log.Print("Starting Server on port 4444")
	serverError := http.ListenAndServe(":4444", mux)
	log.Fatal(serverError)
}
