import { Link } from 'react-router-dom';
import { SourceReferences } from './SourceReferences';
import { SchemaTable } from './RelationView';

export function NormalizationPrimer() {
  return <section className="normalization-primer panel" aria-labelledby="primer-title">
    <p className="eyebrow">UMA PONTE ANTES DOS EXERCÍCIOS</p>
    <h2 id="primer-title">O que significa estar em uma forma normal?</h2>
    <p>FN significa <strong>forma normal</strong>: um conjunto de condições sobre como organizar uma tabela. Normalizar é reorganizar os dados para reduzir repetições e evitar problemas ao inserir, atualizar ou excluir informações.</p>
    <p><strong>Para ler os exemplos:</strong> tabela é uma relação; coluna é um atributo; linha é um registro. Uma dependência funcional (DF), escrita X → Y, diz que o mesmo X exige o mesmo Y. Uma chave candidata identifica a linha inteira, sem colunas dispensáveis.</p>
    <p>As condições se acumulam: uma tabela em 3FN também está em 2FN e 1FN. Não basta contar colunas ou procurar valores repetidos. Confira os testes nesta ordem:</p>
    <ol className="normal-form-checklist">
      <li><h3>1FN · Um valor por célula</h3><p>Cada coluna guarda um valor do tipo esperado, sem uma lista de itens ou um grupo de registros dentro da célula. “Atômico” significa tratado como uma unidade no modelo.</p><p><strong>Como descubro?</strong> Se Itens guarda “lápis, caderno” como dois produtos juntos, a tabela ainda não está em 1FN. Um nome completo pode ser um único valor de Nome.</p></li>
      <li><h3>2FN · Precisa da chave inteira?</h3><p>Primeiro, confirme a 1FN. Uma chave candidata identifica a linha sem atributos sobrando. Se a chave é composta, veja se uma parte dela já determina algum atributo que não pertence a nenhuma chave candidata: isso é uma dependência parcial e viola a 2FN.</p><p><strong>Como descubro?</strong> A quantidade de um item depende da nota e do código juntos. A descrição do material depende só do código. Essa descrição deve ficar no cadastro do material.</p></li>
      <li><h3>3FN · Existe um intermediário?</h3><p>Primeiro, confirme a 2FN. Nos exemplos com uma única chave, procure um atributo fora da chave que determine outro atributo fora dela: os dados de outra entidade ainda estão misturados.</p><p><strong>Como descubro?</strong> Nota → Cliente → NomeCliente. O nome é informação do cliente; separe seu cadastro e mantenha o identificador Cliente na nota.</p></li>
    </ol>
    <p><strong>Onde parar?</strong> Falhou em 1FN: ainda não normalizada. Passou em 1FN, mas falhou em 2FN: somente 1FN. Passou em 2FN, mas falhou em 3FN: até 2FN. Passou nos três testes: pelo menos 3FN; pode atender também a formas posteriores.</p>
    <details className="primer-example">
      <summary>Ver uma nota fiscal passar por 1FN, 2FN e 3FN</summary>
      <p><strong>Regras deste exemplo simplificado:</strong> cada nota tem um cliente; cada código identifica um material e sua descrição; um material aparece no máximo uma vez por nota. Um cliente pode ter várias notas. Cada cliente tem um nome cadastrado. Essas regras são hipóteses didáticas, não conclusões tiradas de poucas linhas.</p>
      <h3>1. Abra a lista de itens</h3>
      <p>Antes: NOTA(Nota, Cliente, NomeCliente, Itens), com Itens = [(P1, Lápis, 2), (P2, Caderno, 1)]. Há um grupo de registros dentro da célula. Depois: uma linha por item, com valores atômicos:</p>
      <div className="primer-table-scroll" role="region" aria-label="Itens da nota em primeira forma normal" tabIndex={0}>
        <table><caption>ITENS_NOTA · chave candidata: (Nota, Código)</caption><thead><tr>{['Nota', 'Código', 'Descrição', 'Quantidade', 'Cliente', 'NomeCliente'].map((name) => <th scope="col" key={name}>{name}</th>)}</tr></thead>
          <tbody><tr><td>101</td><td>P1</td><td>Lápis</td><td>2</td><td>C1</td><td>Ana</td></tr><tr><td>101</td><td>P2</td><td>Caderno</td><td>1</td><td>C1</td><td>Ana</td></tr></tbody>
        </table>
      </div>
      <p>Ainda há dados repetidos, mas cada célula tem um valor. Portanto, 1FN não significa eliminar toda repetição.</p>
      <h3>2. Separe o que depende só de parte da chave</h3>
      <p>A seta → significa “determina”: o mesmo valor à esquerda exige o mesmo valor à direita. Código → Descrição; Nota → Cliente; Cliente → NomeCliente; (Nota, Código) → Quantidade. Por consequência, Nota → NomeCliente. A única chave candidata é (Nota, Código).</p>
      <p>Código e Nota são partes da chave. Separe as informações do material e da nota. Quantidade precisa do par inteiro e fica no item:</p>
      <div className="primer-schemas">
        <SchemaTable table={{ name: 'ITEM_NOTA', attributes: ['Nota', 'Código', 'Quantidade'], key: ['Nota', 'Código'] }} />
        <SchemaTable table={{ name: 'MATERIAL', attributes: ['Código', 'Descrição'], key: ['Código'] }} />
        <SchemaTable table={{ name: 'NOTA', attributes: ['Nota', 'Cliente', 'NomeCliente'], key: ['Nota'] }} />
      </div>
      <p>As três tabelas estão em 2FN. NOTA ainda falha na 3FN: seu NomeCliente depende de Cliente, que não é chave da nota.</p>
      <h3>3. Separe os dados do cliente</h3>
      <p>Em NOTA, Nota → Cliente → NomeCliente é uma dependência transitiva. Mantenha Cliente para ligar as tabelas. ITEM_NOTA e MATERIAL permanecem como estão.</p>
      <div className="primer-schemas">
        <SchemaTable table={{ name: 'NOTA', attributes: ['Nota', 'Cliente'], key: ['Nota'] }} />
        <SchemaTable table={{ name: 'CLIENTE', attributes: ['Cliente', 'NomeCliente'], key: ['Cliente'] }} />
      </div>
      <p>Agora as quatro tabelas atendem à 3FN. O nome é cadastrado uma vez por cliente e as ligações por Nota, Código e Cliente permitem recuperar os dados.</p>
    </details>
    <details className="primer-example">
      <summary>Quando houver mais de uma chave candidata</summary>
      <p>Os exercícios daqui informam uma única chave para você aprender a reconhecer cada problema. Em geral, considere todas as chaves candidatas. Um atributo <strong>primário</strong> pertence a alguma delas; um atributo <strong>não primário</strong> não pertence a nenhuma.</p>
      <p>Na 2FN, nenhum atributo não primário pode depender de uma parte própria de qualquer chave candidata. Na 3FN, para cada dependência não trivial X → A, X deve ser uma superchave (determinar a linha inteira) ou A deve ser primário. Por isso, a frase “elimine toda dependência transitiva” é só uma aproximação para os primeiros exemplos.</p>
      <Link className="text-link" to="/guia#3fn">Consultar a definição completa de 3FN</Link>
    </details>
    <p className="small muted">Adaptação didática das notas fiscais dos slides. As páginas abaixo mostram a sequência que fundamenta esta explicação.</p>
    <SourceReferences sources={[{ document: 'slides', pages: [12, 13, 15, 17, 21, 34, 35, 37, 38, 39, 40, 44], kind: 'adapted' }]} />
  </section>;
}
