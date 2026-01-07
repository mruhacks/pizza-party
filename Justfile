start-services:
    docker compose up -d --wait

remove-services:
    docker compose down -v

run: start-services
    bun install
    bun dev

restart: remove-services run
