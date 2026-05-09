# SRDFSIL Website - PRD

## Problema Original
Website para a Sociedade Recreativa Desportiva e Familiar de São João das Lampas (SRDFSIL), baseado no esboço em https://socipilot.ct.ws. Sociedade fundada em 1911 com atividades culturais, desportivas e recreativas.

## Arquitetura
- **Frontend**: React 19 + Tailwind CSS + React Router v7
- **Backend**: FastAPI (Python) com Motor (async MongoDB)
- **Database**: MongoDB
- **Auth**: JWT com httpOnly cookies

## Personas
- **Visitante público**: Consulta eventos, serviços, história, galeria, contactos
- **Potencial sócio**: Preenche formulário de inscrição
- **Administrador**: Gere eventos, galeria, vê inscrições e mensagens

## Requisitos Core
1. Homepage com hero banner (imagem real da sede), secções de eventos, serviços, CTA
2. Página de História com cronologia desde 1911
3. Página de Eventos com filtros (Todos/Próximos/Passados)
4. Página de Serviços (Teatro, Desporto, Aluguer de Salão)
5. Página de Galeria com lightbox e filtro por categoria
6. Página de Contactos com formulário e mapa
7. Formulário de inscrição de sócios
8. Painel admin (login JWT) para CRUD de eventos, galeria, ver sócios e mensagens

## O que foi implementado (09/05/2026)
### Iteração 1 - MVP Completo
- Backend com todas as APIs (auth, eventos, galeria, sócios, contacto)
- Frontend com todas as páginas (Home, História, Eventos, Serviços, Galeria, Contactos, Inscrição, Admin)
- Admin seeding automático
- Dados de exemplo (3 eventos, 3 imagens galeria)
- Testes: 100% backend (23/23), 100% frontend

### Iteração 2 - Redesign Visual Moderno
- Logo real SRDFSIL integrado
- Imagem real dos 112 anos como hero background
- Header glassmorphism com transparência
- Botões pill-shaped com efeito glow
- Cards com cantos arredondados e hover lift
- Animações scroll reveal (IntersectionObserver)
- Gradientes modernos nas secções
- Scroll-to-top button
- Menu mobile hamburger responsivo
- Testes: 100% frontend

## Backlog (P0/P1/P2)
### P1
- Upload de imagens direto no admin (atualmente por URL)
- Edição de conteúdo das páginas pelo admin

### P2
- Integração com redes sociais (Facebook da sociedade)
- Newsletter / notificações por email aos sócios
- Calendário visual mensal na página de eventos
- Área de sócio com login próprio
- Sistema de pagamento de quotas online
