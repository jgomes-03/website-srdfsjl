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

## Backlog
### P1
- Integração PowerApps para gestão de sócios
- Upload direto de imagens

### P2
- Newsletter para sócios
- Área de sócio com login
