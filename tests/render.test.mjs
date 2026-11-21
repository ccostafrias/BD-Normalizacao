import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { createServer } from 'vite';
import { STORAGE_KEY } from '../src/lib/progress.mjs';

// This verifies component rendering and route state without opening a port.
// It complements, and does not replace, real-browser interaction/visual QA.
test('study routes render with fresh, saved and invalid session state', async (t) => {
  const vite = await createServer({
    server: { middlewareMode: true, ws: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
    appType: 'custom',
  });
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  let stored = null;
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: (key) => key === STORAGE_KEY ? stored : null },
  });
  try {
    const { ProgressProvider } = await vite.ssrLoadModule('/src/hooks/useProgress.tsx');
    const { modules, questionsByModule } = await vite.ssrLoadModule('/src/data/catalog.ts');
    const load = async (name, exported = 'default') => (await vite.ssrLoadModule(`/src/pages/${name}.tsx`))[exported];
    function render(Page, route = '/', pattern = '*') {
      return renderToStaticMarkup(h(MemoryRouter, { initialEntries: [route] }, h(ProgressProvider, null, h(Routes, null, h(Route, { path: pattern, element: h(Page) })))));
    }
    await t.test('home and catalog display every learning module in curriculum order', async () => {
      const home = render(await load('HomePage'));
      const catalog = render(await load('CatalogPage'));
      assert.ok(home.includes('Vamos descomplicar?'));
      assert.equal((home.match(/class="module-card panel"/g) ?? []).length, modules.length);
      assert.equal((catalog.match(/class="module-card panel"/g) ?? []).length, modules.length);
      assert.ok(home.indexOf('href="/praticar/fundamentos"') < home.indexOf('href="/praticar/primeiros-passos"'));
      assert.ok(home.indexOf('href="/praticar/primeiros-passos"') < home.indexOf('href="/praticar/dependencias"'));
      assert.ok(catalog.includes('Começar do zero'));
    });
    const Practice = await load('PracticePage');
    await t.test('every practice module renders an unanswered question', () => {
      for (const { id } of modules) {
        const html = render(Practice, `/praticar/${id}`, '/praticar/:moduleId');
        assert.ok(html.includes('Conferir resposta'), id);
        assert.ok(html.includes('aria-label="Navegar pelas questões"'), id);
        assert.ok(!html.includes('class="solution"'), id);
      }
    });
    await t.test('beginner lessons appear before answers on every direct question URL', () => {
      for (const q of questionsByModule.get('primeiros-passos')) {
        const html = render(Practice, `/praticar/primeiros-passos?questao=${q.id}`, '/praticar/:moduleId');
        assert.ok(html.includes(q.title), q.id);
        assert.ok(html.includes(q.preparation.text), q.id);
        assert.ok(html.indexOf('aria-label="Antes de responder"') < html.indexOf('Escolha uma alternativa.'), q.id);
        assert.ok(html.includes('Ver uma nota fiscal passar por 1FN, 2FN e 3FN'));
      }
      assert.ok(!render(Practice, '/praticar/chaves', '/praticar/:moduleId').includes('primer-title'));
    });
    await t.test('a saved beginner mistake restores feedback, review, and bookmarks', () => {
      stored = JSON.stringify({ version: 1, attempts: { 'intro-classificar-2fn': { questionId: 'intro-classificar-2fn', selected: ['3'], correct: false, hintUsed: true, timestamp: 1 } }, bookmarks: ['intro-classificar-2fn'] });
      const html = render(Practice, '/praticar/primeiros-passos?questao=intro-classificar-2fn&modo=revisao', '/praticar/:moduleId');
      assert.ok(html.includes('Chave simples já garante 3FN?'));
      assert.ok(html.includes('Cliente não determina a nota inteira.'));
      assert.ok(html.includes('Tentar novamente'));
      assert.ok(html.includes('aria-pressed="true"'));
      assert.ok(render(Practice, '/praticar/primeiros-passos?modo=salvas', '/praticar/:moduleId').includes('Chave simples já garante 3FN?'));
      stored = null;
    });
    await t.test('the learning path recommends the beginner bridge after fundamentals', async () => {
      const fundamentals = questionsByModule.get('fundamentos');
      stored = JSON.stringify({ version: 1, attempts: Object.fromEntries(fundamentals.map((q) => [q.id, { questionId: q.id, selected: q.answer, correct: true, hintUsed: false, timestamp: 1 }])), bookmarks: [] });
      assert.ok(render(await load('HomePage')).includes('href="/praticar/primeiros-passos?questao=intro-fn"'));
      const beginner = questionsByModule.get('primeiros-passos');
      stored = JSON.stringify({ version: 1, attempts: Object.fromEntries(beginner.map((q) => [q.id, { questionId: q.id, selected: q.answer, correct: true, hintUsed: false, timestamp: 1 }])), bookmarks: [] });
      const results = render(await load('PracticePage', 'ResultsPage'), '/resultado/primeiros-passos', '/resultado/:moduleId');
      assert.ok(results.includes('/praticar/dependencias'));
      stored = null;
    });
    await t.test('unknown module and empty review filter produce useful recovery actions', () => {
      assert.ok(render(Practice, '/praticar/inexistente', '/praticar/:moduleId').includes('Módulo não encontrado'));
      assert.ok(render(Practice, '/praticar/chaves?modo=revisao', '/praticar/:moduleId').includes('Tudo em dia por aqui'));
    });
    await t.test('saved answers restore the actual correction and visual solution', () => {
      stored = JSON.stringify({ version: 1, attempts: { 'c-casas': { questionId: 'c-casas', selected: ['Quadra'], correct: true, hintUsed: false, timestamp: 1 } }, bookmarks: [] });
      const html = render(Practice, '/praticar/chaves?questao=c-casas', '/praticar/:moduleId');
      assert.ok(html.includes('Você acertou. Vamos entender por quê.'));
      assert.ok(html.includes('Cálculo do fecho passo a passo'));
      stored = null;
    });
    await t.test('laboratory, guide, results and empty progress render', async () => {
      assert.ok(render(await load('LabPage')).includes('Qual será o seu ponto de partida?'));
      assert.ok(render(await load('GuidePage')).includes('Materiais de origem'));
      assert.ok(render(await load('ProgressPage')).includes('Todo caminho tem um começo'));
      assert.ok(render(await load('PracticePage', 'ResultsPage'), '/resultado/chaves', '/resultado/:moduleId').includes('0 acertos em 0 respostas'));
    });
    const Guide = await load('GuidePage');
    await t.test('guide and question sources link to public PDFs instead of private files', async () => {
      const { documents } = await vite.ssrLoadModule('/src/data/catalog.ts');
      const { SourceReferences } = await vite.ssrLoadModule('/src/components/SourceReferences.tsx');
      const html = render(Guide, '/guia#fontes');
      for (const document of documents) assert.ok(html.includes(`href="${document.url}"`), document.id);
      assert.ok(!html.includes('chatgpt.com/library'));
      assert.ok(!html.includes('exigem permissão'));
      const reference = renderToStaticMarkup(h(SourceReferences, { sources: [{ document: 'lista', pages: [2], kind: 'adapted' }] }));
      assert.ok(reference.includes('href="/materiais/9.4-ExerciciosNormalizacao.pdf#page=2"'));
      assert.ok(reference.includes('sem login'));
    });
    await t.test('guide supports bookmarked searches and related links that clear the filter', () => {
      const html = render(Guide, '/guia?busca=FNBC');
      assert.ok(html.includes('value="FNBC"'));
      assert.ok(html.includes('id="bcnf"'));
      assert.ok(!html.includes('id="relacao"'));
      assert.ok(html.includes('href="/guia#superchave"'));
      assert.ok(!html.includes('href="/guia?busca=FNBC#superchave"'));
      assert.ok(html.includes('Veja um exemplo'));
      assert.ok(html.includes('role="status"'));
    });
    await t.test('guide handles missing terms and retains old section anchors and new entry anchors', () => {
      const empty = render(Guide, '/guia?busca=naoexistexyz');
      assert.ok(empty.includes('Ainda não encontramos esse termo'));
      assert.ok(empty.includes('Ver todos os conceitos'));
      const full = render(Guide, '/guia#dependencia-funcional');
      for (const id of ['fundamentos', 'dependencias', 'chaves', 'formas', 'decomposicao', 'avancado', 'fontes', 'dependencia-funcional', '1fn', '5fn']) {
        assert.ok(full.includes(`id="${id}"`), id);
      }
    });
  } finally {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else delete globalThis.localStorage;
    await vite.close();
  }
});
