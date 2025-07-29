export const extensionToLang: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  json: 'json',
  sh: 'shell',
  bash: 'shell',
  zsh: 'shell',
  vue: 'vue',
  md: 'markdown',
  html: 'html',
  css: 'css',
};

export function inferLangFromFilename(filename?: string): string | undefined {
  if (!filename) return undefined;
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext && extensionToLang[ext]) return extensionToLang[ext];
  return undefined;
}
