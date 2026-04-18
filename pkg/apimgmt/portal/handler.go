package portal

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"
)

// Config holds developer portal configuration.
type Config struct {
	Enabled      bool   `json:"enabled" toml:"enabled" yaml:"enabled"`
	Title        string `json:"title,omitempty" toml:"title,omitempty" yaml:"title,omitempty"`
	Description  string `json:"description,omitempty" toml:"description,omitempty" yaml:"description,omitempty"`
	BasePath     string `json:"basePath,omitempty" toml:"basePath,omitempty" yaml:"basePath,omitempty"`
	AuthRequired bool   `json:"authRequired,omitempty" toml:"authRequired,omitempty" yaml:"authRequired,omitempty"`
}

// APICatalogEntry represents an API in the portal catalog.
type APICatalogEntry struct {
	Name        string `json:"name"`
	Group       string `json:"group,omitempty"`
	Description string `json:"description,omitempty"`
	Version     string `json:"version"`
	Status      string `json:"status"`
	DocsURL     string `json:"docsUrl,omitempty"`
}

// Developer represents a registered developer.
type Developer struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"createdAt"`
	APIKeys   []APIKey  `json:"apiKeys,omitempty"`
}

// APIKey represents a developer's API key.
type APIKey struct {
	ID        string    `json:"id"`
	Key       string    `json:"key,omitempty"` // only shown on creation
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"createdAt"`
	LastUsed  time.Time `json:"lastUsed,omitempty"`
	Requests  int64     `json:"requests"`
}

// UsageStats holds usage analytics for a developer/key.
type UsageStats struct {
	TotalRequests int64            `json:"totalRequests"`
	ErrorCount    int64            `json:"errorCount"`
	AvgLatencyMs  float64          `json:"avgLatencyMs"`
	ByAPI         map[string]int64 `json:"byApi,omitempty"`
}

// Handler serves the developer portal API.
type Handler struct {
	mu         sync.RWMutex
	config     Config
	catalog    []APICatalogEntry
	developers map[string]*Developer // id -> developer
	basePath   string
}

// NewHandler creates a new portal API handler.
func NewHandler(config Config) *Handler {
	bp := config.BasePath
	if bp == "" {
		bp = "/portal"
	}
	return &Handler{
		config:     config,
		catalog:    []APICatalogEntry{},
		developers: make(map[string]*Developer),
		basePath:   strings.TrimRight(bp, "/"),
	}
}

// SetCatalog updates the API catalog.
func (h *Handler) SetCatalog(entries []APICatalogEntry) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.catalog = entries
}

// ServeHTTP routes portal API requests.
func (h *Handler) ServeHTTP(rw http.ResponseWriter, req *http.Request) {
	path := strings.TrimPrefix(req.URL.Path, h.basePath)
	path = strings.TrimPrefix(path, "/api")

	switch {
	case path == "/catalog" && req.Method == http.MethodGet:
		h.handleCatalog(rw, req)
	case path == "/developers" && req.Method == http.MethodPost:
		h.handleRegister(rw, req)
	case strings.HasPrefix(path, "/developers/") && strings.HasSuffix(path, "/keys") && req.Method == http.MethodPost:
		devID := strings.TrimSuffix(strings.TrimPrefix(path, "/developers/"), "/keys")
		h.handleCreateKey(rw, req, devID)
	case strings.HasPrefix(path, "/developers/") && strings.HasSuffix(path, "/keys") && req.Method == http.MethodGet:
		devID := strings.TrimSuffix(strings.TrimPrefix(path, "/developers/"), "/keys")
		h.handleListKeys(rw, req, devID)
	default:
		http.NotFound(rw, req)
	}
}

func (h *Handler) handleCatalog(rw http.ResponseWriter, req *http.Request) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	search := strings.ToLower(req.URL.Query().Get("search"))
	var results []APICatalogEntry

	for _, entry := range h.catalog {
		if search == "" || strings.Contains(strings.ToLower(entry.Name), search) ||
			strings.Contains(strings.ToLower(entry.Group), search) {
			results = append(results, entry)
		}
	}

	writeJSON(rw, http.StatusOK, results)
}

func (h *Handler) handleRegister(rw http.ResponseWriter, req *http.Request) {
	var input struct {
		Email string `json:"email"`
		Name  string `json:"name"`
	}
	if err := json.NewDecoder(req.Body).Decode(&input); err != nil {
		writeJSON(rw, http.StatusBadRequest, map[string]string{"error": "invalid request"})
		return
	}
	if input.Email == "" {
		writeJSON(rw, http.StatusBadRequest, map[string]string{"error": "email required"})
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	id := generateID()
	dev := &Developer{
		ID:        id,
		Email:     input.Email,
		Name:      input.Name,
		CreatedAt: time.Now(),
	}
	h.developers[id] = dev

	writeJSON(rw, http.StatusCreated, dev)
}

func (h *Handler) handleCreateKey(rw http.ResponseWriter, _ *http.Request, devID string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	dev, ok := h.developers[devID]
	if !ok {
		writeJSON(rw, http.StatusNotFound, map[string]string{"error": "developer not found"})
		return
	}

	key := generateAPIKey()
	apiKey := APIKey{
		ID:        generateID(),
		Key:       key,
		Name:      fmt.Sprintf("key-%d", len(dev.APIKeys)+1),
		CreatedAt: time.Now(),
	}
	dev.APIKeys = append(dev.APIKeys, apiKey)

	writeJSON(rw, http.StatusCreated, apiKey)
}

func (h *Handler) handleListKeys(rw http.ResponseWriter, _ *http.Request, devID string) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	dev, ok := h.developers[devID]
	if !ok {
		writeJSON(rw, http.StatusNotFound, map[string]string{"error": "developer not found"})
		return
	}

	// Mask keys in listing.
	keys := make([]APIKey, len(dev.APIKeys))
	for i, k := range dev.APIKeys {
		keys[i] = k
		keys[i].Key = k.Key[:8] + "..."
	}

	writeJSON(rw, http.StatusOK, keys)
}

func writeJSON(rw http.ResponseWriter, status int, v any) {
	rw.Header().Set("Content-Type", "application/json")
	rw.WriteHeader(status)
	json.NewEncoder(rw).Encode(v)
}

func generateID() string {
	b := make([]byte, 8)
	rand.Read(b)
	return hex.EncodeToString(b)
}

func generateAPIKey() string {
	b := make([]byte, 32)
	rand.Read(b)
	return "tsk_" + hex.EncodeToString(b)
}
