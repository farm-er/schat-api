#!/bin/bash


cd ..

# docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d

gnome-terminal --tab -- bash -c "docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build;docker compose logs -f app; exec bash"


while ! docker ps | grep -q "schat$"; do
    echo "Waiting for the app to start..."
    sleep 4
done

gnome-terminal --tab -- bash -c "docker exec -it schat-cassandra cqlsh; exec bash"

gnome-terminal --tab -- bash -c "docker exec -it schat-redis redis-cli; exec bash"

kill -9 $PPID




