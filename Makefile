SHELL := /bin/bash
.DEFAULT_GOAL := help

.PHONY: install dev dev-api dev-client typecheck typecheck-api typecheck-web \
        seed migration-up migration-create migrate-and-seed \
        db db-up db-down db-reset orval setup clean help

# ── Configuração ────────────────────────────────────────────────────────────
API_DIR := packages/api
WEB_DIR := packages/client

# ── Setup inicial (rode uma vez após clonar) ────────────────────────────────
setup: db-up install migrate-and-seed
	@echo ""
	@echo "  Projeto pronto. Rode 'make dev' para iniciar."

# ── Dependências ────────────────────────────────────────────────────────────
install:
	rm -rf node_modules
	rm -rf $(API_DIR)/node_modules
	rm -rf $(WEB_DIR)/node_modules
	npm install

# ── Desenvolvimento ─────────────────────────────────────────────────────────
dev:
	$(MAKE) -j2 dev-api dev-client

dev-api:
	npm run dev -w $(API_DIR)

dev-client:
	npm run dev -w $(WEB_DIR)

# ── Type checking (paralelo) ─────────────────────────────────────────────────
typecheck:
	$(MAKE) -j2 typecheck-api typecheck-web

typecheck-api:
	npx tsc --noEmit -p $(API_DIR)/tsconfig.json

typecheck-web:
	npx tsc --noEmit -p $(WEB_DIR)/tsconfig.json

# ── Banco de dados ───────────────────────────────────────────────────────────
db:
	docker compose up

db-up:
	docker compose up -d
	@echo "Aguardando PostgreSQL ficar pronto..."
	@until docker exec erp-vendas-db pg_isready -U erp -q; do sleep 1; done
	@echo "PostgreSQL pronto."

db-down:
	docker compose down

db-reset:
	docker compose down -v
	docker compose up -d
	@until docker exec erp-vendas-db pg_isready -U erp -q; do sleep 1; done
	$(MAKE) migrate-and-seed

# ── Migrations ───────────────────────────────────────────────────────────────
migration-up:
	npm run migration:up -w $(API_DIR)

migration-create:
	npm run migration:create -w $(API_DIR)

# ── Seed ─────────────────────────────────────────────────────────────────────
seed:
	npm run seed -w $(API_DIR)

migrate-and-seed: migration-up seed

# ── Orval (geração do client HTTP tipado — requer API rodando) ────────────────
orval:
	npm run orval -w $(WEB_DIR)

# ── Limpeza ──────────────────────────────────────────────────────────────────
clean:
	rm -rf $(API_DIR)/dist
	rm -rf $(WEB_DIR)/dist

# ── Ajuda ────────────────────────────────────────────────────────────────────
help:
	@echo ""
	@echo "  make setup             Setup completo (primeira vez)"
	@echo "  make install           Instala dependências via npm workspaces"
	@echo ""
	@echo "  make dev               Inicia api + web em paralelo"
	@echo "  make dev-api           Inicia apenas o backend"
	@echo "  make dev-client        Inicia apenas o frontend"
	@echo ""
	@echo "  make typecheck         Type check (api + web, paralelo)"
	@echo "  make typecheck-api     Type check apenas do backend"
	@echo "  make typecheck-web     Type check apenas do frontend"
	@echo ""
	@echo "  make db                Sobe o PostgreSQL com logs no terminal"
	@echo "  make db-up             Sobe o PostgreSQL em background"
	@echo "  make db-down           Para o Docker"
	@echo "  make db-reset          Recria banco + volumes + migrations + seed"
	@echo ""
	@echo "  make migration-up      Roda as migrations pendentes"
	@echo "  make migration-create  Cria nova migration"
	@echo "  make migrate-and-seed  Roda migrations + seed em sequência"
	@echo "  make seed              Popula o banco com dados iniciais"
	@echo ""
	@echo "  make orval             Regenera o client HTTP (requer API rodando)"
	@echo "  make clean             Remove node_modules e dist"
	@echo ""
