# Multi-stage build for Go backend
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Set Go proxy for China
ENV GOPROXY=https://goproxy.cn,direct
ENV GO111MODULE=on

# Install dependencies
RUN apk add --no-cache git ca-certificates

# Copy source code
COPY . .

# Build ignoring go.sum checksums
RUN CGO_ENABLED=0 GOOS=linux go build -mod=mod -a -installsuffix cgo -o server ./cmd/server

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates wget

WORKDIR /root/

# Copy the binary from builder
COPY --from=builder /app/server .

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget -q --spider http://localhost:8080/api/v1/health || exit 1

# Run the application
CMD ["./server"]
