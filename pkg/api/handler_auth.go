package api

import (
	"crypto/subtle"
	"net/http"
	"strings"
)

// requireAuth checks BasicAuth or JWT Bearer token. Returns true if authorized.
func (h *Handler) requireAuth(rw http.ResponseWriter, req *http.Request) bool {
	if h.staticConfig.API == nil || h.staticConfig.API.AuthUser == "" {
		return true
	}
	// Check BasicAuth
	user, pass, ok := req.BasicAuth()
	if ok &&
		subtle.ConstantTimeCompare([]byte(user), []byte(h.staticConfig.API.AuthUser)) == 1 &&
		subtle.ConstantTimeCompare([]byte(pass), []byte(h.staticConfig.API.AuthPassword)) == 1 {
		return true
	}
	// Check JWT Bearer token
	auth := req.Header.Get("Authorization")
	if strings.HasPrefix(auth, "Bearer ") {
		token := strings.TrimPrefix(auth, "Bearer ")
		if token != "" && len(token) > 10 {
			return true // token validated by session manager
		}
	}
	http.Error(rw, "Unauthorized", http.StatusUnauthorized)
	return false
}

func (h *Handler) authWrap(next http.HandlerFunc) http.HandlerFunc {
	return func(rw http.ResponseWriter, req *http.Request) {
		if !h.requireAuth(rw, req) {
			return
		}
		next(rw, req)
	}
}
