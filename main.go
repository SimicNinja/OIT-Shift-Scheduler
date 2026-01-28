package main

import (
	"crypto/rand"
	"encoding/hex"
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

type ScheduleWrapper struct {
	Schedule Schedule `json:"Schedule"`
}

type userInfo struct {
	Username    string
	Password    string
	AdminStatus bool
	Schedule    *Schedule
}

// User Database Mock
var users = map[string]*userInfo{"student1": {"student1", "BYUStudent", false, nil}, "admin1": {"admin1", "JoeBelnap", true, nil}}

// Tracks/maps browser sessions to users.
var sessions = map[string]*userInfo{}

func main() {
	// Servemux is the same as a React Browser Router
	mux := http.NewServeMux()
	fileServer := http.FileServer(http.Dir("./templates/static/"))

	mux.Handle("GET /static/", http.StripPrefix("/static", fileServer))

	// Route Declarations
	mux.HandleFunc("GET /", login)
	mux.HandleFunc("POST /login", login)
	mux.HandleFunc("GET /schedule", schedule)
	mux.HandleFunc("POST /submit", submitSchedule)
	mux.HandleFunc("GET /approval", approval)

	// Start server at http://localhost:4444
	log.Print("Starting Server on port 4444")
	serverError := http.ListenAndServe(":4444", mux)
	log.Fatal(serverError)
}

func login(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		pages := []string{
			"./templates/base.html",
			"./templates/login.html",
		}

		templateSet, err := template.ParseFiles(pages...)

		if err != nil {
			log.Println(err.Error())
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		err = templateSet.ExecuteTemplate(w, "base", nil)

		if err != nil {
			log.Print(err.Error())
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		}
	}

	if r.Method == "POST" {
		username := r.FormValue("username")
		password := r.FormValue("password")

		userPtr, ok := users[username]

		if !ok {
			fmt.Fprintf(w, "Denied! User: %s does not exist.", username)
		} else if userPtr.Password != password {
			fmt.Fprintf(w, "Denied! You have entered the wrong password for user: %s.", username)
		} else {
			sessionID := newSessionID()

			sessions[sessionID] = userPtr

			http.SetCookie(w, &http.Cookie{
				Name:     "sessionCookie",
				Value:    sessionID,
				Path:     "/",
				HttpOnly: true,
			})

			if userPtr.AdminStatus == false {
				w.Header().Set("HX-Redirect", "/schedule")
			} else {
				w.Header().Set("HX-Redirect", "/approval")
			}

			w.WriteHeader(http.StatusOK)
		}
	}
}

func schedule(w http.ResponseWriter, r *http.Request) {
	user, err := getUserFromSession(r)

	if err != nil {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

	pages := []string{
		"./templates/base.html",
		"./templates/schedule.html",
	}

	templateSet, err := template.ParseFiles(pages...)

	if err != nil {
		log.Println(err.Error())
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	data := struct {
		Week WeekData
		User *userInfo
	}{
		Week: WeekData{
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
		},
		User: user,
	}

	err = templateSet.ExecuteTemplate(w, "base", data)

	if err != nil {
		log.Print(err.Error())
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}

func submitSchedule(w http.ResponseWriter, r *http.Request) {
	user, err := getUserFromSession(r)

	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var wrapper ScheduleWrapper

	err = json.NewDecoder(r.Body).Decode(&wrapper)
	if err != nil {
		fmt.Println("Decode error:", err)
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	fmt.Printf("Decoded schedule: %+v\n", wrapper.Schedule)

	schedule := wrapper.Schedule
	dailyCount := map[string]int{"Monday": 0, "Tuesday": 0, "Wednesday": 0, "Thursday": 0, "Friday": 0}
	weeklyCount := 0

	for _, shift := range schedule.Shifts {
		if shift.Minutes < 180 {
			fmt.Fprintf(w, "Denied! One of your shifts on %s is less than 3 hours long. Fix %s's schedule and resubmit.", shift.Day, shift.Day)
			return
		}

		dailyCount[shift.Day] += shift.Minutes
	}

	for day, dailyTotal := range dailyCount {
		if dailyTotal > 540 {
			fmt.Fprintf(w, "Denied! You cannot work than 9 hours. Fix %s's schedule and resubmit.", day)
			return
		}

		weeklyCount += dailyTotal
	}

	if weeklyCount < 1200 {
		fmt.Fprintf(w, "Denied! You must work at least 20 hours a week. Fix your schedule and resubmit.")
		return
	} else if weeklyCount > 2400 {
		fmt.Fprintf(w, "Denied! You cannot work more than 40 in a week. Fix your schedule and resubmit.")
		return
	} else {
		user.Schedule = &schedule

		w.Header().Set("HX-Trigger", "pending-approval")
		fmt.Fprintf(w, "Pending Approval! You schedule has been sent to your manager for review and approval. You will not be able to make edits until your request is approved or denied.")
	}
}

func approval(w http.ResponseWriter, r *http.Request) {
	user, err := getUserFromSession(r)

	if err != nil {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

	if user.AdminStatus != true {
		http.Redirect(w, r, "/schedule", http.StatusSeeOther)
		return
	}

	pages := []string{
		"./templates/base.html",
		"./templates/approval.html",
	}

	templateSet, err := template.ParseFiles(pages...)

	if err != nil {
		log.Println(err.Error())
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	data := struct {
		Users map[string]*userInfo
	}{
		Users: users,
	}

	err = templateSet.ExecuteTemplate(w, "base", data)

	if err != nil {
		log.Print(err.Error())
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}

func newSessionID() string {
	b := make([]byte, 16)
	rand.Read(b)
	return hex.EncodeToString(b)
}

func getUserFromSession(r *http.Request) (*userInfo, error) {
	c, err := r.Cookie("sessionCookie")

	if err != nil {
		return nil, err
	}

	user, ok := sessions[c.Value]

	if !ok {
		return nil, fmt.Errorf("Session not found!")
	}

	return user, nil
}
