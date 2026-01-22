package main

import (
	// "fmt"
	"html/template"
	"log"
	"net/http"
)

type WeekData struct {
	Days    []string
	Hours   []int
	Minutes []int
}

// Home Route/Handler
func home(w http.ResponseWriter, r *http.Request) {
	pages := []string{
		"./templates/base.html",
		"./templates/schedule.html",
	}

	templateSet, err := template.ParseFiles(pages...)
	data := WeekData{
		Days:    []string{"Monday", "Tuesday", "Wednesday", "Thursday", "Friday"},
		Hours:   []int{8, 9, 10, 11, 12, 1, 2, 3, 4, 5},
		Minutes: []int{0, 10, 20, 30, 40, 50},
	}

	if err != nil {
		log.Print(err.Error())
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	err = templateSet.ExecuteTemplate(w, "base", data)
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
