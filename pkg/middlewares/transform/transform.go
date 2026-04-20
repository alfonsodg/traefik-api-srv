package transform

import (
	"context"
	"net/http"

	"github.com/rs/zerolog/log"
	"github.com/traefik/traefik/v3/pkg/config/dynamic"
)

type transform struct {
	next   http.Handler
	name   string
	config dynamic.Transform
}

// New creates a request/response transformation middleware.
func New(_ context.Context, next http.Handler, config dynamic.Transform, name string) (http.Handler, error) {
	log.Info().Str("middleware", name).Msg("Creating Transform middleware")
	return &transform{next: next, name: name, config: config}, nil
}

func (t *transform) ServeHTTP(rw http.ResponseWriter, req *http.Request) {
	// Apply request header operations
	if t.config.RequestHeaders != nil {
		applyHeaderOps(req.Header, t.config.RequestHeaders)
	}

	// Apply CORS preset to response
	if t.config.CORSPreset != "" {
		applyCORS(rw.Header(), t.config.CORSPreset)
	}

	// Wrap response writer to modify response headers
	if t.config.ResponseHeaders != nil {
		rw = &responseWriter{ResponseWriter: rw, ops: t.config.ResponseHeaders}
	}

	t.next.ServeHTTP(rw, req)
}

func applyHeaderOps(h http.Header, ops *dynamic.HeaderOps) {
	for k, v := range ops.Add {
		h.Add(k, v)
	}
	for k, v := range ops.Set {
		h.Set(k, v)
	}
	for _, k := range ops.Remove {
		h.Del(k)
	}
}

func applyCORS(h http.Header, preset string) {
	switch preset {
	case "permissive":
		h.Set("Access-Control-Allow-Origin", "*")
		h.Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
		h.Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
		h.Set("Access-Control-Max-Age", "86400")
	case "strict":
		h.Set("Access-Control-Allow-Methods", "GET, POST")
		h.Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		h.Set("Access-Control-Max-Age", "3600")
	case "security":
		h.Set("X-Content-Type-Options", "nosniff")
		h.Set("X-Frame-Options", "DENY")
		h.Set("X-XSS-Protection", "1; mode=block")
		h.Set("Referrer-Policy", "strict-origin-when-cross-origin")
		h.Set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
	}
}

type responseWriter struct {
	http.ResponseWriter
	ops         *dynamic.HeaderOps
	wroteHeader bool
}

func (w *responseWriter) WriteHeader(code int) {
	if !w.wroteHeader {
		applyHeaderOps(w.Header(), w.ops)
		w.wroteHeader = true
	}
	w.ResponseWriter.WriteHeader(code)
}

func (w *responseWriter) Write(b []byte) (int, error) {
	if !w.wroteHeader {
		applyHeaderOps(w.Header(), w.ops)
		w.wroteHeader = true
	}
	return w.ResponseWriter.Write(b)
}
