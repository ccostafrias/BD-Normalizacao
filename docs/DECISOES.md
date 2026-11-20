# Decisões de implementação

## Limites entre conteúdo, lógica e apresentação

O JSON contém os enunciados, alternativas, resoluções e fontes. O catálogo faz sua descoberta e validação em um ponto único. Os componentes `AnswerOptions`, `RelationView`, `SchemaTable`, `ModuleCard`, `SolutionView` e os elementos de `ui/` recebem dados e callbacks.

Os hooks controlam o estado:

| Hook | Responsabilidade |
| --- | --- |
| `useQuiz` | Seleção, dica, submissão e nova tentativa de uma questão |
| `usePractice` | Fila da sessão e navegação pela URL |
| `useCatalog` | Busca, filtros e agrupamento por módulo |
| `useProgress` | Persistência, respostas, questões salvas e métricas |
| `useLearningPath` | Recomendar a próxima questão ainda não respondida |
| `useLaboratory` | Seleção de exemplo e de atributos, teste de chave |
| `useProgressActions` | Exportação do progresso |

O cálculo do fecho e a minimalidade são funções puras de `lib/relational.mjs`, compartilhadas pelo laboratório, pelas soluções e pelos testes. Os pequenos módulos `.mjs` com JSDoc podem ser executados diretamente pelo test runner do Node, sem instalar outro runtime de testes. O restante da aplicação usa TypeScript.

## Estado da sessão

O módulo e os filtros estão na URL; a questão atual fica em `questao`. Recarregar uma questão respondida restaura a correção. A seleção de uma tentativa ainda não enviada não é persistida.

A prática usa uma fotografia do filtro no começo da sessão. Se o aluno corrige uma questão no modo “Revisar erros”, ela continua visível para que ele possa ler a resolução. Ao abrir uma nova sessão, o filtro reflete as respostas mais recentes.

Responder novamente substitui a resposta anterior da questão nas métricas. O produto não acumula pontos por repetir o mesmo exercício e não sugere que a pontuação equivale a domínio comprovado do assunto.

## Persistência

Há apenas um registro versionado em `localStorage`. O parser descarta dados inválidos e IDs de questões removidas, evitando que uma mudança do banco derrube a aplicação. Se o navegador bloquear a escrita, a prática continua e a interface informa a limitação. Alterações em outra aba são recebidas pelo evento `storage`.

O backup exportado serve para consulta. Não há importação, conta ou sincronização nesta versão. Adicionar sincronização exigiria decidir identidade, backend e tratamento de conflitos.

## Performance

- Páginas secundárias carregadas por `React.lazy`.
- Imports nomeados do Lucide para permitir tree shaking.
- `LazyMotion` com apenas `domAnimation`; componentes `m` evitam carregar recursos de animação desnecessários.
- `useMemo` em cálculos de fecho, avaliação, filtros e métricas derivados de dados estáveis.
- `useCallback` nos handlers compartilhados por componentes e no gerenciamento de progresso.
- `memo` nos componentes de apresentação mais reutilizados.
- `useDeferredValue` mantém a entrada da busca responsiva durante o filtro.
- Sem fontes remotas, imagens decorativas, chamadas de API ou backend no caminho de estudo.

O banco de 28 questões é carregado junto com o catálogo; essa escolha simplifica métricas e navegação. Se o banco crescer para centenas de questões ou incorporar mídia, o próximo passo é carregar os arquivos por módulo e manter apenas seus índices no catálogo inicial. Não há necessidade de introduzir esse custo agora.

## Acessibilidade e aparência

As referências visuais orientaram as superfícies arredondadas, a ausência de contornos decorativos e a paleta de azul com tons suaves de verde, lilás e pêssego.

Os estados também usam texto e ícones, e não dependem apenas de cor. Há inputs nativos de rádio/checkbox, foco visível, navegação para o conteúdo, rótulos de progresso e anúncios de feedback. A preferência de movimento reduzido é respeitada.

O layout tem pontos de adaptação para tablet e celular. A inspeção visual e os fluxos de teclado em navegador real continuam pendentes da disponibilidade de um servidor de prévia neste ambiente.

## Git e publicação

Os commits seguem Conventional Commits, separando fundação, conteúdo/motor, experiência de estudo e ajustes relevantes. Nenhum remoto foi criado ou recebeu push sem um destino informado. O deploy fica preparado para a Vercel e será realizado pelo proprietário posteriormente.
