package main

import (
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"strconv"
	"strings"
)

type Vertices [][2]int
type Edges [][2]int
type Triangulation struct {
	V Vertices
	E Edges
}

func Triangulate(vertices Vertices) (Triangulation, error) {
	triangulation := Triangulation{}

	tempFile, err := ioutil.TempFile("tmp", "vertices_*.txt")
	if err != nil {
		return triangulation, err
	}
	defer tempFile.Close()
	defer os.Remove(tempFile.Name())

	err = writeVertices(vertices, tempFile)
	if err != nil {
		return triangulation, err
	}

	cmd := exec.Command("./triangulation/delaunay", tempFile.Name())
	out, err := cmd.Output()
	if err != nil {
		return triangulation, err
	}

	triangulation.V = vertices
	words := strings.Fields(string(out))
	for i := 0; i < len(words); i += 2 {
		a, _ := strconv.Atoi(words[i])
		b, _ := strconv.Atoi(words[i+1])
		triangulation.E = append(triangulation.E, [2]int{a, b})
	}
	return triangulation, nil
}

func writeVertices(vertices Vertices, f *os.File) error {
	_, err := f.WriteString(fmt.Sprintf("%d\n", len(vertices)))
	if err != nil {
		return err
	}
	for _, v := range vertices {
		_, err = f.WriteString(fmt.Sprintf("%d %d\n", v[0], v[1]))
		if err != nil {
			return err
		}
	}
	return nil
}
