package main

import (
	"fmt"
	"net/http"

	"html/template"
	"database/sql"
	"time"
	"strconv"
	"log"
	// "io/ioutil"
	// "encoding/json"

	_ "github.com/mattn/go-sqlite3"
)

var place int

type Database struct {
	SqlDb *sql.DB
}

type General struct {
	Name           string         `json:"playername"`
	Date   		   string      `json:"date"`
	Score          string 	      `json:"score"`
	Rank           int          `json:"position"`
}
type scores []General

type struktura struct {
	S scores
	Pagenum int
}

var Tmpl *template.Template

func main() {
	D := Database{}
	D.SqlDb, _ = sql.Open("sqlite3", "scores.db")
	D.SqlDb.Exec(`CREATE TABLE IF NOT EXISTS "scorelist" (
		"playername"	VARCHAR(255) NOT NULL,
		"score"	INTEGER NOT NULL,
		"id"	INTEGER NOT NULL,
		"time" DATETIME,
		PRIMARY KEY("id" AUTOINCREMENT)
	);`)


	http.Handle("/css/", http.StripPrefix("/css/", http.FileServer(http.Dir("css"))))
	http.HandleFunc("/", D.MainPageHandler)
	http.HandleFunc("/record", D.RecordHandler)
	http.ListenAndServe(":8080", nil)
}

func (c *Database) RecordHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/record" {
		return
	}
	if r.Method != http.MethodPost && r.Method != http.MethodGet {
		return
	}


	g := General{
		Name:   r.FormValue("input"),
		Score: r.FormValue("scoreinput"),
	}

	if g.Name != "" {
		c.SqlDb.Exec(`INSERT INTO scorelist (playername, time, score) 
		VALUES(?, ?, ?)`, g.Name, time.Now(), g.Score)
	}
	
	pagenum, _ := strconv.Atoi(r.FormValue("pagenum"))

	btn := r.FormValue("btn")

	if btn == "right" {
		pagenum++
	}
	if btn == "left" {
		pagenum--
	}
	pg2 := pagenum
	

	var rank int = pagenum
	if rank > 1 {
		rank = (rank -1)*5 +1
	}
	if pagenum > 1 {
		pagenum = (pagenum - 1)*5
	}
	var offsetStr string
	if pagenum == 1 {
		offsetStr = "0"
	} else {
		offsetStr = strconv.Itoa(pagenum)
	}
	
	q := fmt.Sprintf(`SELECT playername, score, id, time FROM scorelist ORDER BY score DESC, time ASC LIMIT 5 OFFSET %s`, offsetStr)
	rows, rowsErr := c.SqlDb.Query(q)

	if rowsErr != nil {
		log.Println(rowsErr)
	}
	defer rows.Close()

	s := scores{}
	

	//pattern := "%20s %5s %2s %20s %5s\n"
	//fmt.Printf(pattern, "Name", "Score", "Id", "Time", "RowN")
	for rows.Next() {
		g2 := General{}
		var t time.Time
		err := rows.Scan(&g2.Name, &g2.Score, &g2.Rank, &t)
		if err != nil {
			fmt.Println(err)
		}
		g2.Date = t.Format("01-02-2006 15:04:05")
		g2.Rank = rank
		s = append(s, g2)

		//fmt.Printf(pattern, g2.Name, g2.Score, g2.Id, g2.Date, fmt.Sprintf("%d", rank))
		rank++
	}
	st := struktura{
		S: s,
		Pagenum: pg2,
	}
	
	t := template.Must(template.ParseFiles("scorelist.html"))
	t.Execute(w, st)
}


func (c *Database) MainPageHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		
		return
	}
	if r.Method != http.MethodGet {
		
		return
	}

	//Tmpl.ExecuteTemplate(w, "index.html", nil)
	t := template.Must(template.ParseFiles("index.html"))
	t.Execute(w, nil)
}