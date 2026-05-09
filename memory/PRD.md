# SRDFSIL Website - PRD

## Problema Original
Website para a Sociedade Recreativa Desportiva e Familiar de São João das Lampas (SRDFSIL), baseado no esboço em https://socipilot.ct.ws.

## Arquitetura
- **Frontend**: React 19 + Tailwind CSS + React Router v7
- **Backend**: FastAPI (Python) com Motor (async MongoDB)
- **Database**: MongoDB
- **Auth**: JWT com httpOnly cookies

## O que foi implementado

### Iteracao 1 - MVP (09/05/2026)
- Backend completo (auth, eventos CRUD, galeria, socios, contacto)
- Frontend 8 paginas
- Testes: 100%

### Iteracao 2 - Redesign Visual (09/05/2026)
- Logo real SRDFSIL + imagem 112 anos
- Header glassmorphism, scroll reveal animations
- Testes: 100%

### Iteracao 3 - Redesign Moderno (09/05/2026)
- **Tipografia**: DM Sans (body) + Sora (headings) - moderno e geometrico
- **Cores**: Paleta verde puro (#0B3D2E, #0d6b4f, #15B377, #E6F5EF) - sem laranja
- **Estrutura**: Header fixo com transparencia na homepage, hero left-aligned
- **Logos**: Apenas no header (40px) e footer (36px) - sem redundancia
- **Cards**: Limpos com bordas subtis e icones verdes
- **Formularios**: Inputs com rounded-lg e focus states verdes
- Testes: 100%

## Backlog
### P1
- Upload de imagens direto no admin
- Edicao de conteudo das paginas pelo admin

### P2
- Newsletter para socios
- Calendario visual mensal
- Area de socio com login proprio
- Integrcao com Facebook
