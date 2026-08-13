# Pudim & CIA Admin — Fundação visual P0

## Problema original
Aplicar somente o P0 na branch `milestone/ag-05-catalog-service`, sem redesenhar o Admin:
1. Configurar Tailwind CSS corretamente e validar o build de produção.
2. Corrigir os tokens de fontes para eliminar variáveis CSS circulares.

## Arquitetura e decisões
- Aplicação Next.js 15.5 com React 19 e App Router.
- Tailwind CSS 4.3 integrado via `@tailwindcss/postcss` e `postcss.config.mjs`.
- `globals.css` importa Tailwind antes dos estilos existentes.
- O reset existente foi movido para `@layer base`, preservando a precedência das utilities Tailwind.
- Playfair Display injeta `--font-playfair`; Plus Jakarta Sans injeta `--font-jakarta`.
- Aliases semânticos existentes usam as novas variáveis sem autorreferência circular.
- Yarn foi adotado como gerenciador deste workspace, com `yarn.lock` como lockfile único.
- Nenhuma alteração deliberada de design foi realizada; apenas os estilos já presentes no código voltaram a funcionar.

## Implementado
- Instalados `tailwindcss`, `@tailwindcss/postcss` e `postcss`.
- Criado `postcss.config.mjs`.
- Adicionado `@import 'tailwindcss';` ao CSS global.
- Corrigido o conflito entre o reset global e utilities de spacing.
- Corrigidos os tokens `--font-playfair`, `--font-jakarta`, `--font-serif` e `--font-sans`.
- Restaurados flex, grid, breakpoints, backgrounds, cards, radius, spacing, thumbnails e hover states do Admin.
- Corrigido o gradiente radial do login para sintaxe arbitrária compatível com Tailwind v4.
- Corrigidas as associações `label`/`input` de e-mail e senha.
- Tornado o carregamento do Dashboard resiliente a falhas, sem loading infinito.
- Adicionados test IDs aos elementos críticos do login tocados nesta etapa.

## Validação
- `yarn typecheck`: aprovado.
- `yarn build`: aprovado após geração limpa do cache `.next`.
- Desktop 1366 px: navegação desktop visível e navegação mobile oculta.
- Mobile 390 px: navegação desktop oculta e navegação mobile visível.
- Sem overflow horizontal em desktop ou mobile.
- Login: card com 32 px de padding, inputs com 46 px e gradiente radial aplicado.
- Fontes em runtime: Playfair nos elementos `font-serif`; Jakarta nos inputs e interface operacional.
- Dashboard carregou corretamente em três navegações consecutivas.

## Backlog priorizado
### P0
- Concluído.

### P1
- Formalizar tokens semânticos Dark Espresso no tema Tailwind.
- Oficializar tipografia, radius e escala de espaçamento.

### P2
- Extrair componentes administrativos realmente reutilizáveis.
- Criar `StatusBadge` e sistema global de toast.

## Próximas tarefas
1. Iniciar P1 em um ticket separado, sem misturar componentização.
2. Mapear os hexadecimais repetidos para tokens semânticos.
3. Validar visualmente o P1 nos breakpoints 360, 390, 768, 1024, 1366 e 1920 px.