# Backend Dockerfile (Multi-stage Go build)
FROM golang:1.24-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/api ./cmd/api

FROM alpine:latest
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app
COPY --from=builder /app/api /app/api
COPY migrations /app/migrations

EXPOSE 8080
CMD ["/app/api"]
