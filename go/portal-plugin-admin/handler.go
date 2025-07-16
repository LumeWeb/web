package portal_plugin_admin

import (
	"embed"
	"io/fs"
	"net/http"
)

//go:embed all:build/*
var appFs embed.FS

func GetFS() http.Handler {
	appFiles, _ := fs.Sub(appFs, "build")

	return appFiles
}
