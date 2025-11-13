restart:
    docker compose down -v && docker compose up -d
    @sleep 0.5

run:
    bun dev