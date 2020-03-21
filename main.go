package main

import (
    "net/http"
    "fmt"
    "encoding/json"
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

func setupRoutes() {
    http.HandleFunc("/upload", uploadVertices)
    http.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir("./triangulation"))))
    http.ListenAndServe(":8030", nil)
}

func main() {
    fmt.Println("Go File Upload Tutorial")
    setupRoutes()
}
