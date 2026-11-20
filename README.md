# Forma — Normalização na prática

Aplicação de estudo de normalização de bancos de dados, em português, com questões graduais e resolução comentada. O banco inicial contém 28 questões em seis módulos, dos fundamentos até BCNF, 4FN e 5FN.

## Executar

Use Node.js 24 (também indicado em `.nvmrc`).

```sh
nvm use
npm ci
npm run dev
```

Abra a URL exibida pelo Vite. Sem `nvm`, basta ter Node.js 24 instalado.

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

O build executa a verificação de tipos e os testes antes de gerar `dist/`.

## O que já funciona

- Percurso com seis módulos e dificuldades graduais.
- Questões de alternativa única, múltipla seleção e seleção de atributos.
- Dicas, feedback das alternativas e resolução em etapas.
- Tabelas resultantes com indicação dos atributos da chave.
- Laboratório de fecho com cinco exemplos e teste de minimalidade de chaves.
- Busca que ignora diferenças de acentuação, filtro de dificuldade e revisão de erros.
- Questões salvas para depois e progresso persistido no navegador.
- Guia de consulta com 50 verbetes, definições introdutórias, exemplos e links entre conceitos; busca por siglas e nomes sem exigir acentos, índice de A a Z e caminho sugerido para iniciantes.
- Referências aos PDFs e às páginas utilizadas.
- Rotas próprias, carregamento de páginas sob demanda e layout responsivo.
- Exportação do progresso para consulta em JSON. Não há importação nesta versão.

## Publicar na Vercel

1. Envie este repositório ao seu GitHub.
2. Importe o repositório na Vercel com preset **Vite** e a raiz do projeto como Root Directory.
3. Use Node.js **24.x**. O projeto não precisa de variáveis de ambiente.
4. Build Command: `npm run build`. Output Directory: `dist`.

O `vercel.json` já contém o fallback da SPA para `index.html`, necessário para abrir ou atualizar diretamente rotas como `/laboratorio` e `/praticar/chaves`. Os arquivos em `assets/` recebem cache imutável; seus nomes incluem hashes do conteúdo. A aplicação não foi publicada automaticamente.

## Arquitetura

```text
src/
  components/       Elementos reutilizáveis de apresentação
    ui/             Botões, badges, progresso e adaptador de ícones
  data/
    questions/      Banco de questões em JSON, descoberto automaticamente
    modules.json    Ordem, objetivos e metadados dos módulos
    documents.json  Referências aos materiais de origem
    guide.json      Textos de consulta
  hooks/            Estado de prática, filtros, laboratório e progresso
  lib/              Cálculos e validações independentes da interface
  pages/            Composição das telas e rotas
tests/              Testes de conteúdo, matemática, filtros, persistência e renderização
docs/               Contrato editorial e decisões técnicas
```

React, TypeScript e Vite compõem a base. React Router gerencia as rotas. Os SVGs de ícones vêm exclusivamente do Lucide, por imports nomeados. O adaptador `Icon` transforma os nós oficiais da biblioteca em elementos React; ele não modifica o DOM manualmente.

Framer Motion é usado com `LazyMotion`, `domAnimation` e componentes `m`, respeitando a preferência de movimento reduzido. Não há fontes, imagens ou serviços externos necessários para usar o quiz.

Veja [como adicionar conteúdo](docs/CONTEUDO.md) e as [decisões de implementação](docs/DECISOES.md).

## Fontes e privacidade

Os conceitos e exercícios foram adaptados de `9.1-Normalizacao.pdf`, `9.3-ExercíciosNormalização.pdf` e `9.4-ExercíciosNormalização.pdf`. Cada questão registra documento e páginas. As hipóteses acrescentadas ficam explícitas no enunciado. As justificativas são adaptações didáticas; não são apresentadas como um gabarito oficial do professor.

Os PDFs não estão redistribuídos no repositório. Os links para os originais exigem as permissões da conta que os hospedou; nomes e páginas continuam disponíveis para quem possui uma cópia própria. O quiz não depende de acesso a esses links.

Sem login, backend, telemetria ou chamadas a IA. As respostas ficam em `localStorage`, sob a chave `forma.progress.v1`. O indicador de acerto usa a última resposta de cada questão e não representa uma nota oficial.

## Validação e limites

Os testes verificam as DFs calculáveis, chaves, integridade do conteúdo e das fontes, filtros e recuperação do progresso. Os testes de renderização percorrem os módulos e as telas usando React no servidor, sem abrir portas.

Na criação desta versão, a verificação TypeScript, os 23 testes e o build de produção passaram. A inspeção visual e os testes de interação em navegador ficaram pendentes porque o ambiente de execução bloqueou a abertura do servidor local com `EPERM`. Responsividade e acessibilidade foram implementadas, mas ainda precisam dessa conferência em navegador real.

Esta versão corrige escolhas estruturadas. Ela não valida decomposições livres digitadas pelo aluno e não faz sincronização de progresso entre dispositivos.
