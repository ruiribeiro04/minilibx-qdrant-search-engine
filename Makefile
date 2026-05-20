.PHONY: install backend frontend dev dev-backend dev-frontend build clean

install:
	uv sync
	cd frontend && npm install

backend:
	uv run uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload

frontend:
	cd frontend && npm run dev

dev-backend:
	uv run uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload

dev-frontend:
	cd frontend && npm run dev

dev:
	@echo "Starting backend and frontend..."
	@$(MAKE) -j2 dev-backend dev-frontend

build:
	cd frontend && npm run build

clean:
	cd frontend && rm -rf .next
	rm -rf backend/app/__pycache__ backend/app/**/__pycache__
