#!/bin/bash


cd ..

docker compose -f docker-compose.yml -f docker-compose.test.yml up --build --abort-on-container-exit

