.PHONY: install dev build typecheck seed migration-up migration-create \
        db db-up db-down db-reset orval setup clean

# ── Configuração ────────────────────────────────────────────────────────────
API_DIR  := packages/api
WEB_DIR  := packages/client

# ── Setup inicial (rode uma vez após clonar) ────────────────────────────────
setup: db-up install migration-up seed
	@echo ""
	@echo "Projeto pronto. Rode 'make dev' para iniciar."

# ── Dependências ────────────────────────────────────────────────────────────
install:
	cd $(API_DIR) && npm install
	cd $(WEB_DIR) && npm install

# ── Desenvolvimento ─────────────────────────────────────────────────────────
dev:
	@trap 'kill 0' SIGINT; \
	cd $(API_DIR) && npm run dev & \
	cd $(WEB_DIR) && npm run dev & \
	wait

dev-api:
	cd $(API_DIR) && npm run dev

dev-web:
	cd $(WEB_DIR) && npm run dev

# ── Build ────────────────────────────────────────────────────────────────────
build:
	cd $(API_DIR) && npm run build
	cd $(WEB_DIR) && npm run build

# ── Type checking ────────────────────────────────────────────────────────────
typecheck:
	cd $(API_DIR) && npx tsc --noEmit
	cd $(WEB_DIR) && npx tsc --noEmit

typecheck-api:
	cd $(API_DIR) && npx tsc --noEmit

typecheck-web:
	cd $(WEB_DIR) && npx tsc --noEmit

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

db-reset: db-down
	docker compose down -v
	docker compose up -d
	@until docker exec erp-vendas-db pg_isready -U erp -q; do sleep 1; done
	$(MAKE) migration-up seed

# ── Migrations ───────────────────────────────────────────────────────────────
migration-up:
	cd $(API_DIR) && npm run migration:up

migration-create:
	cd $(API_DIR) && npm run migration:create

# ── Seed ─────────────────────────────────────────────────────────────────────
seed:
	cd $(API_DIR) && npm run seed

# ── Orval (geração do client HTTP tipado) ────────────────────────────────────
orval:
	cd $(WEB_DIR) && npm run orval

# ── Limpeza ──────────────────────────────────────────────────────────────────
clean:
	rm -rf $(API_DIR)/dist $(API_DIR)/node_modules
	rm -rf $(WEB_DIR)/dist $(WEB_DIR)/node_modules

# ── Ajuda ────────────────────────────────────────────────────────────────────
help:
	@echo ""
	@echo "  make setup            Setup completo (primeira vez)"
	@echo "  make install          Instala dependências (api + web)"
	@echo "  make dev              Inicia api + web em paralelo"
	@echo "  make dev-api          Inicia apenas o backend"
	@echo "  make dev-web          Inicia apenas o frontend"
	@echo "  make build            Build de produção (api + web)"
	@echo "  make typecheck        Type check (api + web)"
	@echo "  make db               Sobe o PostgreSQL com logs no terminal"
	@echo "  make db-up            Sobe o PostgreSQL em background"
	@echo "  make db-down          Para o Docker"
	@echo "  make db-reset         Recria banco + migrations + seed"
	@echo "  make migration-up     Roda as migrations pendentes"
	@echo "  make migration-create Cria nova migration"
	@echo "  make seed             Popula o banco com dados iniciais"
	@echo "  make orval            Regenera o client HTTP a partir do OpenAPI"
	@echo "  make clean            Remove node_modules e dist"
	@echo ""
