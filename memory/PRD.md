# SRDFSJL Website - PRD

## Problema Original
Website + CMS completo para a Sociedade Recreativa Desportiva e Familiar de São João das Lampas.

## Arquitetura
- **Frontend**: React 19 + Tailwind CSS + React Router v7
- **Backend**: FastAPI + Motor (async MongoDB)
- **Database**: MongoDB
- **Auth**: JWT httpOnly cookies

## Iteração 4 - Back Office Completo (14/05/2026)
Aplicadas alterações do GitHub do utilizador + CMS completo:

### Alterações do utilizador (GitHub merge):
- Removida Galeria (página + nav + rotas)
- CountUp animation nos stats da homepage
- Header maior com logo + nome sempre visível
- Footer simplificado
- Título da página alterado
- Removido badge "Made with Emergent"

### Back Office (8 tabs):
1. **Dashboard** - 4 cards estatísticas (eventos, mensagens, sócios, serviços)
2. **Homepage** - Editor: hero (badge, título, subtítulo), secção About, estatísticas editáveis
3. **Eventos** - CRUD completo
4. **Serviços** - CRUD com título, tag, imagem, nota, ordem, descrição
5. **Cronologia** - CRUD timeline (ano, título, descrição, ordem)
6. **Mensagens** - Ver/marcar lida/respondida/apagar + filtros
7. **Sócios** - Ver inscrições, aprovar/rejeitar
8. **Definições** - Nome, morada, cidade, email, telefone, Facebook, Instagram

### Páginas públicas dinâmicas:
- Homepage lê conteúdo da API (/api/content/homepage + /api/services)
- Serviços lê da API (/api/services)
- História lê da API (/api/timeline)

### Testes: 42/42 backend, 100% frontend

## Iteração 5-6 - Dataverse + SSO Microsoft
- Integração Dataverse: sócios (`cr56f_sociosv2s`, 327 registos) e pagamentos (`cr56f_paymentsrecords`)
- Aprovação de inscrições sincroniza com Dataverse
- Dashboard SaaS redesign + tab Relatórios
- SSO Microsoft (Entra ID) com MSAL

## Iteração 7 - SSO Redirect Flow (10/06/2026)
- Substituído `loginPopup` por `loginRedirect` (tudo na mesma página)
- `redirectUri` = `{origin}/admin/login` — **tem de estar registado no Azure App Registration (SPA)**
- Validação de grupo agora por **Object ID**: `442fb52b-5d77-4553-9f8e-3a99bf688403` (env `AZURE_REQUIRED_GROUP_ID`)
- Fluxo: SSO → redirect Microsoft → regresso a /admin/login → backend valida domínio + grupo via Graph → cria user se não existir → /admin
- Se validação falhar: `logoutRedirect` MSAL → homepage
- Requer permissão Graph `GroupMember.Read.All` (Application) concedida no tenant

## Iteração 8 - Fix SSO Logout Bug (10/07/2026)
- **Causa raiz**: client secret Azure inválido (AADSTS7000215) → substituído por secret novo no backend/.env (Graph + Dataverse OK, 327 sócios)
- Validação de grupo: verifica primeiro claim `groups` do idToken; fallback para Graph `memberOf` (requer `GroupMember.Read.All` Application — ainda pendente no Azure)
- Frontend: logout MSAL só em 401/403; erros 5xx mostram mensagem sem logout
- Testes: 51/51 backend (9 novos SSO em `/app/backend/tests/test_microsoft_sso.py`), frontend 100%
- **Pendente do utilizador (uma das opções)**: (a) Azure Portal → App → Token configuration → Add groups claim (Security groups) OU (b) API permissions → GroupMember.Read.All (Application) + admin consent

## Iteração 9 - Fix SSO M365 Group + Infra Docker/CI (11/07/2026)
- **SSO fix**: grupo "Órgãos Sociais" é Microsoft 365 (não Security); ao adicionar groups claim é preciso escolher **"All groups"** em vez do default (Security). Backend agora loga todas as claims + detecta overage (`_claim_names`) + mensagem de erro explícita para o admin
- Frontend: já não faz logout automático em erro — mostra a razão do 403 e limpa MSAL cache
- **Infra Cloud** (novo):
  - `backend/config.py`: loader central com Azure Key Vault via `DefaultAzureCredential` + fallback env vars (transparente em dev)
  - `backend/Dockerfile` (Python 3.11 slim, uvicorn 2 workers, non-root, healthcheck)
  - `frontend/Dockerfile` (multi-stage Node → Nginx com build args para `REACT_APP_*`) + `nginx.conf` (gzip, SPA fallback, cache imutável)
  - `docker-compose.yml` para testes locais idênticos a produção
  - `.github/workflows/deploy-dev.yml` (branch `dev` → ACA dev) e `deploy-prod.yml` (branch `main` → ACA prod, com approval por Environment)
  - CI usa **OIDC/Workload Identity Federation** (zero secrets long-lived no GitHub); imagens em **ghcr.io**
  - `scripts/azure-bootstrap.sh`: cria RG, Key Vault (RBAC), User-Assigned MI com role *Key Vault Secrets User*, Log Analytics, ACA env + Container Apps (backend/frontend), federated credential GitHub OIDC — idempotente, por ambiente
  - `scripts/kv-set-secrets.sh`: lê `secrets.dev.env` / `secrets.prod.env` (gitignored) e faz push para Key Vault (converte `_` → `-`)
  - `INFRA.md`: passo-a-passo completo (bootstrap → KV → GitHub Environments → Cloudflare DNS → primeiro deploy)

## Backlog
### P1
- Integração PowerApps para gestão de sócios
- Upload direto de imagens

### P2
- Newsletter para sócios
- Área de sócio com login
