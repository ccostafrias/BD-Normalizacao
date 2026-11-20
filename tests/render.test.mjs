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
    const load = async (name, exported = 'default') => (await vite.ssrLoadModule(`/src/pages/${name}.tsx`))[exported];
    function render(Page, route = '/', pattern = '*') {
      return renderToStaticMarkup(h(MemoryRouter, { initialEntries: [route] }, h(ProgressProvider, null, h(Routes, null, h(Route, { path: pattern, element: h(Page) })))));
    }
    await t.test('home and catalog display all six learning modules', async () => {
      const home = render(await load('HomePage'));
      const catalog = render(await load('CatalogPage'));
      assert.ok(home.includes('Vamos descomplicar?'));
      assert.equal((home.match(/class="module-card panel"/g) ?? []).length, 6);
      assert.equal((catalog.match(/class="module-card panel"/g) ?? []).length, 6);
    });
    const Practice = await load('PracticePage');
    await t.test('all six practice modules render an unanswered question', () => {
      for (const id of ['fundamentos', 'dependencias', 'chaves', 'formas-normais', 'decomposicao', 'avancado']) {
        const html = render(Practice, `/praticar/${id}`, '/praticar/:moduleId');
        assert.ok(html.includes('Conferir resposta'), id);
        assert.ok(html.includes('aria-label="Navegar pelas questões"'), id);
        assert.ok(!html.includes('class="solution"'), id);
      }
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
  } finally {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else delete globalThis.localStorage;
    await vite.close();
  }
});
