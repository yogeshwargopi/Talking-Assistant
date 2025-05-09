# Define variables
DOCKER_COMPOSE_STAG=docker compose -f docker-compose-stag.yml
DOCKER_COMPOSE_LOCAL=docker compose -f docker-compose.yml

# STAGING Commands
.PHONY: stop-stag
stop-stag:
	$(DOCKER_COMPOSE_STAG) down

.PHONY: live-stag
live-stag:
	$(DOCKER_COMPOSE_STAG) up -d --build


# LOCAL Commands
.PHONY: stop-local
stop-local:
	$(DOCKER_COMPOSE_LOCAL) down

.PHONY: start-local
start-local:
	$(DOCKER_COMPOSE_LOCAL) up --build

.PHONY: connect-local-frontend
connect-local-frontend:
	docker exec -it hackathon-local-frontend-container sh

.PHONY: connect-local-backend
connect-local-backend:
	docker exec -it hackathon-local-backend-container sh