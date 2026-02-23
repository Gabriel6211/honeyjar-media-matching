.PHONY: dev dev-backend dev-frontend db-up db-down

db-up:
	docker compose up -d

db-down:
	docker compose down

dev-backend:
	cd backend && npm run dev

dev-frontend:
	cd frontend && npm run dev

dev: db-up
	@echo "Starting backend and frontend..."
	@make dev-backend & make dev-frontend
