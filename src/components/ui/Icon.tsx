import { createElement, memo } from 'react';
import { House, BookOpen, FlaskConical, ChartNoAxesCombined, Check, X, ChevronRight, KeyRound, Layers, Table2, GitBranch, Lightbulb, RotateCcw, Search, ExternalLink, Menu, Info, Play, Target, Circle, Download } from 'lucide';
import type { IconName } from '../../types';

// Named imports keep the icon library tree-shakeable. This adapter renders the
// library's SVG nodes as React elements, without DOM mutation or a second library.
const icons = { home: House, book: BookOpen, flask: FlaskConical, chart: ChartNoAxesCombined, check: Check, close: X, chevron: ChevronRight, key: KeyRound, layers: Layers, grid: Table2, branch: GitBranch, bulb: Lightbulb, rotate: RotateCcw, search: Search, external: ExternalLink, menu: Menu, info: Info, play: Play, target: Target, circle: Circle, download: Download };
export const Icon = memo(function Icon({ name, size = 20, className = '' }: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">

    {icons[name].map(([tag, attributes], index) => createElement(tag, { ...attributes, key: index }))}

  </svg>;
});
