package portal_dashboard

import (
	"embed"
	"io/fs"
	"net/http"
)

//go:embed all:build/*
var appFs embed.FS

func Handler() http.Handler {
	appFiles, _ := fs.Sub(appFs, "build/")
	appServ := http.FileServer(http.FS(appFiles))

	return appServ
}
