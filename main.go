package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
)

type WeekData struct {
	Days    []string
	Hours   []Hour
	Minutes []int
}

type Hour struct {
	Value24 int
	Label   string
}

type Shift struct {
	Day     string `json:"Day"`
	Start   string `json:"Start"`
	End     string `json:"End"`
	Minutes int    `json:"Minutes"`
}

type Schedule struct {
	Shifts []Shift `json:"Shifts"`
}

// Home Route/Handler
func home(w http.ResponseWriter, r *http.Request) {
	pages := []string{
		"./templates/base.html",
		"./templates/schedule.html",
	}

	templateSet, err := template.ParseFiles(pages...)
	data := WeekData{
		Days: []string{"Monday", "Tuesday", "Wednesday", "Thursday", "Friday"},
		Hours: []Hour{
			{8, "8am"},
			{9, "9am"},
			{10, "10am"},
			{11, "11am"},
			{12, "12pm"},
			{13, "1pm"},
			{14, "2pm"},
			{15, "3pm"},
			{16, "4pm"},
			{17, "5pm"},
		},
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
	mux.HandleFunc("POST /submit", submitSchedule)

	// Start server at http://localhost:4444
	log.Print("Starting Server on port 4444")
	serverError := http.ListenAndServe(":4444", mux)
	log.Fatal(serverError)
}

func submitSchedule(w http.ResponseWriter, r *http.Request) {
	var schedule Schedule

	err := json.NewDecoder(r.Body).Decode(&schedule)
	if err != nil {
		fmt.Println("Decode error:", err)
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	fmt.Printf("Decoded schedule: %+v\n", schedule)
}
