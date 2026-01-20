package main

import (
	// "fmt"
	"html/template"
	"log"
	"net/http"
)

// Home Route/Handler
func home(w http.ResponseWriter, r *http.Request) {
	pages := []string{
		"./templates/base.html",
		"./templates/schedule.html",
	}

	templateSet, err := template.ParseFiles(pages...)
	hours := []string{"8:00", "9:00", "10:00", "11:00", "12:00", "1:00", "2:00", "3:00", "4:00", "5:00", "6:00"}

	if err != nil {
		log.Print(err.Error())
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	err = templateSet.ExecuteTemplate(w, "base", hours)
	if err != nil {
		log.Print(err.Error())
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}

}

func createPost(w http.ResponseWriter, r *http.Request) {
	// Set HTTP Status code
	w.WriteHeader(201)

	w.Write([]byte("Save a new object..."))
}

func main() {
	// Servemux is the same as a React Browser Router
	mux := http.NewServeMux()
	fileServer := http.FileServer(http.Dir("./templates/static/"))

	mux.Handle("GET /static/", http.StripPrefix("/static", fileServer))

	// Route Declarations
	mux.HandleFunc("GET /", home)
	mux.HandleFunc("POST /create", createPost)

	// Start server at http://localhost:4444
	log.Print("Starting Server on port 4444")
	serverError := http.ListenAndServe(":4444", mux)
	log.Fatal(serverError)
}
