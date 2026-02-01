package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/positiondoctor/backend/internal/api"
)

var (
	port   = flag.String("port", "8080", "Server port")
	host   = flag.String("host", "", "Server host")
)

func main() {
	flag.Parse()

	addr := fmt.Sprintf("%s:%s", *host, *port)

	// Create server
	server := api.GetServer(addr)

	// Configure server
	server.ReadTimeout = 30 * time.Second
	server.WriteTimeout = 60 * time.Second
	server.IdleTimeout = 120 * time.Second

	// Start server in goroutine
	go func() {
		log.Printf("Starting PositionDoctor API server on %s", addr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed to start: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	// Graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Printf("Server forced to shutdown: %v", err)
		os.Exit(1)
	}

	log.Println("Server stopped")
}
