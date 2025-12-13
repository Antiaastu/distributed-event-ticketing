FROM golang:1.24-alpine

WORKDIR /app

RUN go env -w GOPROXY=https://proxy.golang.org,direct
RUN go install github.com/air-verse/air@v1.61.7

COPY go.mod ./
COPY go.sum ./
RUN go mod download

COPY . .

CMD ["air"]
