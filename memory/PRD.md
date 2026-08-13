# Pudim & CIA Admin — Design System P1

## Problema original
Após concluir a fundação P0, implementar o P1 completo na branch `milestone/ag-05-catalog-service`:
- Formalizar tokens semânticos Dark Espresso.
- Oficializar identidade visual, tipografia, radius e espaçamento.
- Migrar todas as páginas Admin nesta rodada.
- Não avançar para componentização P2 nem criar novas funcionalidades.

## Arquitetura e decisões
- Next.js 15.5, React 19, App Router e Tailwind CSS 4.
- Tokens CSS definidos em `:root` e expostos ao Tailwind via `@theme inline`.
- Paleta oficial do Admin:
  - Background `#110D0A`.
  - Superfícies `#1A1410`, `#1E1713`, `#241C16`.
  - Bordas `#2D231C`, `#3D2F26`.
  - Texto `#F4EFE8`, `#B8A698`, `#8C786A`.
  - Accent `#D9822B`, hover `#C2711E`.
- Estados semânticos: success, warning, danger, info e neutral.
- Plus Jakarta Sans permanece na interface operacional; Playfair Display fica restrita a marca, títulos e headings estratégicos.
- Radius oficiais: input 8 px, button 10 px, card 12 px, panel/modal 16 px e badge 9999 px.
- Escala de spacing oficial: 4, 8, 12, 16, 20, 24, 32, 40 e 48 px; cards 24 px, seções 32 px, fields 16 px e página 24–32 px.

## Implementado
- Tokens semânticos e namespaces Tailwind criados em `src/styles/globals.css`.
- Todas as rotas Admin migradas dos hexadecimais repetidos para utilities semânticas.
- Todos os radius legados do Admin migrados para tokens de input, button, card, panel e badge.
- Cores de status migradas para tokens; labels e ícones continuam acompanhando as cores.
- Login, AdminNav, Dashboard, Produtos, Categorias, criação/edição de produto e Configurações migrados.
- 84 test IDs estáticos únicos, além de IDs dinâmicos, adicionados aos controles e informações críticas do Admin.
- Nenhuma funcionalidade P2+ foi adicionada.

## Validação
- Nenhum hexadecimal Dark Espresso residual nas páginas/componentes Admin.
- Nenhum `rounded-xl`, `rounded-2xl`, `rounded-lg` ou `rounded-full` residual no Admin.
- Cores computadas do login confirmadas: background `rgb(17,13,10)` e card `rgb(30,23,19)`.
- Radius computados: panel 16 px, input 8 px e button 10 px.
- Fontes computadas: Playfair no título e Jakarta no input/interface.
- Hover semântico confirmado em runtime: transparente → `rgb(36,28,22)`.
- Dashboard, Produtos, edição de produto, Categorias, novo produto e Configurações percorridos no modo de desenvolvimento autorizado.
- Sem overflow horizontal em 360, 390, 768, 1024, 1366 e 1920 px.
- Navegação mobile/desktop alterna corretamente no breakpoint de 768 px.
- `yarn typecheck`: aprovado.
- `yarn build`: aprovado.

## Observação de autenticação
- O bypass por cookie existe somente em desenvolvimento e foi usado para validar as rotas protegidas.
- Em produção, o redirecionamento para login sem sessão Supabase válida é o comportamento de segurança esperado; nenhuma proteção foi relaxada.

## Backlog priorizado
### P0
- Concluído: Tailwind, PostCSS e tokens de fonte.

### P1
- Concluído: tokens semânticos, Dark Espresso, tipografia, radius, spacing e migração completa do Admin.

### P2
- Criar componentes reutilizáveis apenas onde houver repetição real.
- Priorizar AdminShell, PageHeader, Card, MetricCard, Button, campos de formulário, DataTable e estados de tela.
- Criar `StatusBadge` e sistema global de toast com Sonner.

### P3+
- Evoluir navegação para AdminShell/sidebar conforme novos módulos forem implementados.
- Executar Dashboard, Produtos, Formulários, Variantes, Categorias, Configurações, Mídia, Pedidos e Lançamentos em tickets separados.

## Próximas tarefas
1. Iniciar P2 com inventário de repetições reais, sem abstrair cada `div`.
2. Extrair primeiro os componentes de maior recorrência: PageHeader, Panel/Card, Button e FormField.
3. Migrar uma rota por vez e manter os testes responsivos atuais.