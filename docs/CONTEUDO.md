# Adicionar e revisar questões

Uma questão de um tipo já existente é adicionada apenas ao JSON. Não é necessário editar uma página, registrar um novo import ou alterar os testes para atualizar uma contagem.

## Fluxo

1. Acrescente a questão em um array dentro de `src/data/questions/*.json`. Pode criar um arquivo novo nesse diretório; o catálogo usa `import.meta.glob`.
2. Escolha um `moduleId` existente em `modules.json`. Para criar um módulo, adicione também seus metadados nesse arquivo; as telas o descobrem automaticamente.
3. Se usar outro documento, coloque o PDF em `public/materiais/` e registre seu identificador, nome de exibição, URL pública e quantidade de páginas em `documents.json`.
4. Execute `npm run build`. A validação rejeita IDs duplicados, respostas inválidas, atributos inexistentes, resoluções incompletas e páginas fora do documento.
5. Revise a matemática e o texto. A validação de formato não demonstra sozinha que um gabarito está correto.
6. Faça um commit, por exemplo: `feat(content): add exercises about candidate keys`.

## Contrato

### Materiais de origem

Os PDFs ficam em `public/materiais/` e são servidos em `/materiais/`, sem `/public` na URL. Cada registro de `src/data/documents.json` contém `id`, `title`, `fileName` (nome original exibido), `url` (caminho público absoluto) e `pages`. Use nomes de arquivo sem espaços e sem acentos nas URLs. Esses arquivos são públicos e precisam ser versionados junto com o código.

Ao substituir um PDF, mantenha o caminho estável e confira a contagem e a ordem das páginas citadas pelas questões e pelo guia. O número indicado é a posição da página no arquivo, contando a primeira como 1. Os links nas questões incluem `#page=N` para abrir na primeira página citada em leitores compatíveis.

### Questões

O tipo TypeScript está em `src/types.ts`. Os campos comuns são:

| Campo | Uso |
| --- | --- |
| `id` | Identificador único e estável, utilizado no progresso salvo |
| `moduleId` | Módulo ao qual a questão pertence |
| `type` | `choice`, `multi-choice` ou `attributes` |
| `difficulty` | `easy`, `medium` ou `hard` |
| `title`, `prompt` | Título curto e enunciado completo |
| `preparation` | Explicação opcional com `title`, `text` e `example`, exibida antes do enunciado e das alternativas |
| `assumption` | Hipótese adicional necessária para interpretar o problema, quando houver |
| `relation` | Nome, atributos e DFs; opcional em questões conceituais |
| `options` | Alternativas com `id`, `label` e `feedback`; omitidas em `attributes` |
| `answer` | Array com os IDs corretos, ou nomes dos atributos em `attributes` |
| `hint` | Dica que ajuda a descobrir o próximo passo |
| `explanation` | Explicação geral mostrada após responder |
| `steps` | Etapas com `title` e `text`; podem conter `tables` |
| `sources` | Documento, páginas e indicação de adaptação |
| `closureStart` | Conjunto inicial que habilita a visualização do fecho na solução |

Em `choice`, `answer` tem exatamente um ID. Em `multi-choice`, é necessário selecionar todo o conjunto correto, sem alternativas extras. Em `attributes`, a seleção é comparada como conjunto; a ordem não importa.

Uma DF é representada como `{"from":["A","B"],"to":["C"]}`. O determinante inteiro precisa estar disponível para a DF ser aplicada. Os nomes de atributos devem corresponder exatamente aos registrados na relação.

Cada tabela da solução contém `name`, `attributes` e `key`. O campo `key` destaca uma chave candidata escolhida para aquela tabela. Se houver chaves alternativas importantes para o raciocínio, explique-as também no texto.

## Exemplo completo

```json
[
  {
    "id": "nova-chave-ab",
    "moduleId": "chaves",
    "type": "attributes",
    "difficulty": "medium",
    "title": "Uma chave composta",
    "prompt": "Selecione os atributos da única chave candidata de R.",
    "relation": {
      "name": "R",
      "attributes": ["A", "B", "C"],
      "dependencies": [{ "from": ["A", "B"], "to": ["C"] }]
    },
    "answer": ["A", "B"],
    "hint": "Como obter A e B se eles não aparecem no lado direito de nenhuma DF?",
    "explanation": "A e B são indispensáveis. Juntos, também determinam C.",
    "steps": [
      {
        "title": "Encontre os atributos indispensáveis",
        "text": "Nenhuma DF produz A ou B; ambos precisam estar na chave."
      },
      {
        "title": "Calcule o fecho e teste a minimalidade",
        "text": "AB⁺ contém A, B e C. A sozinho e B sozinho não determinam tudo."
      }
    ],
    "closureStart": ["A", "B"],
    "sources": [{ "document": "slides", "pages": [22, 26], "kind": "adapted" }]
  }
]
```

O exemplo é uma nova aplicação dos conceitos das páginas indicadas, não uma transcrição de um exercício do professor.

## Critérios editoriais

- Use os slides como base e identifique as páginas do PDF, contando a primeira página como 1.
- Esclareça se os atributos são atômicos e quais DFs devem ser consideradas. A interface já mostra a hipótese padrão nas relações.
- Não infira uma regra de negócio apenas porque os poucos dados de uma tabela não a contradizem.
- Para testar 2FN e 3FN, considere todas as chaves candidatas e os atributos primários.
- Diferencie uma chave candidata de uma superchave com atributos redundantes.
- Dê justificativas específicas às alternativas erradas, em vez de apenas “incorreto”.
- Em decomposições, confira cobertura de atributos, junção sem perda e preservação das dependências separadamente.
- Identifique qualquer hipótese acrescentada ao material. Se uma ambiguidade impedir um gabarito único, reformule o problema ou deixe-o fora do banco até esclarecê-la.
- Uma proposta incorreta presente em uma lista pode ser uma afirmação a julgar. Não a trate automaticamente como erro de transcrição ou solução oficial.

O conjunto inicial inclui testes matemáticos para os casos CASAS, as chaves sobrepostas e o fecho de AB. Para novos exercícios com cálculos menos óbvios, acrescente verificações do raciocínio usando `attributeClosure` e `keyStatus`, sem duplicar textos da interface no teste.

## Um tipo de interação novo

Nesse caso, estenda `QuestionType`, a validação e o componente de resposta. Mantenha a regra de correção fora da apresentação e teste a propriedade que torna a correção válida.

Para uma futura decomposição livre, não basta comparar nomes e ordem de tabelas com um gabarito fixo: esquemas equivalentes podem ter nomes e agrupamentos diferentes. Esse recurso exige um avaliador específico.

## Ampliar o guia de consulta

O dicionário está em `src/data/guide.json`, agrupado em uma ordem de aprendizado. Cada verbete contém:

| Campo | Uso |
| --- | --- |
| `id` | Identificador estável usado no endereço `/guia#id`; não reutilize um ID de seção |
| `term` | Nome completo do conceito |
| `aliases` | Siglas, sinônimos e notações pesquisáveis, também apresentados ao leitor |
| `text` | Definição introdutória, com a regra formal quando necessária |
| `example` | Exemplo concreto, com as hipóteses necessárias para interpretá-lo |
| `detail` | Observação que esclarece uma sutileza ou um erro comum, sob expansão opcional |
| `related` | IDs de verbetes relacionados; os links levam à definição e limpam a busca |

As referências `document` e `pages` de cada seção indicam a base conceitual do material. Os exemplos e as explicações introdutórias são ampliações didáticas, não transcrições de um gabarito oficial. Ao acrescentar conceitos, confira também suas fontes.

A busca consulta nome, aliases, definição, exemplo e detalhe, ignora acentos e maiúsculas, e coloca nomes e siglas exatos primeiro. A busca fica na URL (`/guia?busca=FNBC`), permitindo compartilhar ou recarregar a consulta. Os IDs antigos das seções continuam válidos.

Os testes verificam as referências entre verbetes, as âncoras, as páginas das fontes, a pesquisa de siglas e a renderização com filtros. Execute `npm run build` antes de registrar a alteração.

## Primeiro contato com formas normais

O módulo `primeiros-passos` fica entre Fundamentos e Dependências. As questões em `src/data/questions/primeiros-passos.json` apresentam uma preparação visível antes da resposta, avançando de siglas e valores atômicos para chaves, DFs, dependências parciais e transitivas e classificação em 1FN, 2FN e 3FN. Todos os exemplos são adaptações dos slides com hipóteses explícitas.

`NormalizationPrimer` apresenta o roteiro e uma nota fiscal resolvida em expansão opcional, com referências próprias. O teste de 3FN simplificado fica limitado aos exemplos com uma única chave candidata; a definição geral está disponível na mesma seção. Não use “nenhuma dependência transitiva” como definição universal de 3FN.

Os testes introdutórios enumeram as consequências das DFs para confirmar chaves e classificação e verificam cobertura de atributos, preservação de dependências e junção sem perda das decomposições. As telas são testadas com URLs diretas, revisão, questões salvas e recomendação do próximo módulo.
