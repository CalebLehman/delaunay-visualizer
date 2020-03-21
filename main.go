package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

func uploadVertices(w http.ResponseWriter, r *http.Request) {
	var triangulation Triangulation
	err := json.NewDecoder(r.Body).Decode(&triangulation)
	if err != nil {
		fmt.Println("Error decoding JSON")
		fmt.Println(err)
		return
	}

	triangulation, err = Triangulate(triangulation.V)
	if err != nil {
		fmt.Println("Error computing triangulation:")
		fmt.Println(err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(triangulation)
}

func setupRoutes(port string) {
	http.HandleFunc("/upload", uploadVertices)
	http.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir("./webpage"))))
	http.ListenAndServe(fmt.Sprintf(":%s", port), nil)
}

func main() {
	if len(os.Args) != 2 {
		fmt.Printf("Usage: %s <port>\n", os.Args[0])
		return
	}

	setupRoutes(os.Args[1])
}
