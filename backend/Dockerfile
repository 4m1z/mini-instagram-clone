FROM golang:1.25-alpine AS build
WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/server .

FROM alpine:3.21 AS runtime
RUN adduser -D -u 10001 app
WORKDIR /app

COPY --from=build /out/server /app/server

ENV APP_ADDR=:8080 \
    APP_DB_PATH=/data/app.db \
    APP_UPLOADS_DIR=/data/uploads

RUN mkdir -p /data/uploads && chown -R app:app /data
USER app
VOLUME ["/data"]
EXPOSE 8080

ENTRYPOINT ["/app/server"]
