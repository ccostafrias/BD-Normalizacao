import ts from 'typescript';

const configPath = ts.findConfigFile(process.cwd(), ts.sys.fileExists, 'tsconfig.json');
if (!configPath) throw new Error('tsconfig.json não encontrado.');
const config = ts.readConfigFile(configPath, ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, process.cwd());
const program = ts.createProgram(parsed.fileNames, parsed.options);
const diagnostics = [
  ...(config.error ? [config.error] : []),
  ...parsed.errors,
  ...ts.getPreEmitDiagnostics(program),
];
if (diagnostics.length) {
  console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getCanonicalFileName: (file) => file,
    getNewLine: () => '\n',
  }));
  process.exitCode = 1;
} else {
  console.log('TypeScript: nenhum erro.');
}
