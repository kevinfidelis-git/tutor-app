FROM golang:1.26-alpine

WORKDIR /app

# Install Air for hot reload
RUN go install github.com/air-verse/air@latest

# Copy go.mod first
COPY go.mod ./

# If go.sum exists, copy it. If not, go mod tidy will create it.
COPY go.sum* ./

# Download dependencies (creates go.sum if missing)
RUN go mod tidy

# Copy source code
COPY . .

# Expose port
EXPOSE 8080

# Default command (Air for dev, change for production)
CMD ["air"]
