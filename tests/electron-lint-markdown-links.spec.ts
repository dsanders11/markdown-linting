import * as cp from 'node:child_process';
import * as path from 'node:path';

const FIXTURES_DIR = path.resolve(__dirname, 'fixtures');

function runLintMarkdownLinks(...args: string[]) {
  return cp.spawnSync(
    process.execPath,
    [path.resolve(__dirname, '../dist/bin/lint-markdown-links.js'), ...args],
    { stdio: 'pipe' },
  );
}

describe('electron-lint-markdown-links', () => {
  it('requires --root', () => {
    const { status, stdout } = runLintMarkdownLinks(
      'broken-internal-link.md',
    );

    expect(stdout.toString('utf-8')).toContain('Usage');
    expect(status).toEqual(1);
  });

  it('should catch broken internal links', () => {
    const { status, stdout } = runLintMarkdownLinks(
      '--root',
      FIXTURES_DIR,
      'broken-internal-link.md',
    );

    expect(stdout.toString('utf-8')).toContain('Broken link');
    expect(status).toEqual(1);
  });

  it('can ignore a glob', () => {
    const { status } = runLintMarkdownLinks(
      '--root',
      FIXTURES_DIR,
      '--ignore',
      '**/broken-*-link.md',
      '*.md',
    );

    expect(status).toEqual(0);
  });

  it('can ignore multiple globs', () => {
    const { status } = runLintMarkdownLinks(
      '--root',
      FIXTURES_DIR,
      '--ignore',
      '**/broken-{external,internal}-link.md',
      '--ignore',
      '**/broken-cross-file-link.md',
      '*.md',
    );

    expect(status).toEqual(0);
  });

  it('can ignore from a file', () => {
    const { status } = runLintMarkdownLinks(
      '--root',
      FIXTURES_DIR,
      '--ignore-path',
      path.resolve(FIXTURES_DIR, 'ignorepaths'),
      '*.md',
    );

    expect(status).toEqual(0);
  });

  it('should catch broken cross-file links', () => {
    const { status, stdout } = runLintMarkdownLinks(
      '--root',
      FIXTURES_DIR,
      'broken-cross-file-link.md'
    );

    expect(stdout.toString('utf-8')).toContain('Broken link');
    expect(status).toEqual(1);
  });

  it('should by default ignore broken external links', () => {
    const { status } = runLintMarkdownLinks(
      '--root',
      FIXTURES_DIR,
      'broken-external-link.md'
    );

    expect(status).toEqual(0);
  });

  it('should catch broken external links with --fetch-external-links', () => {
    const { status, stdout } = runLintMarkdownLinks(
      '--root',
      FIXTURES_DIR,
      '--fetch-external-links',
      'broken-external-link.md'
    );

    expect(stdout.toString('utf-8')).toContain('Broken link');
    expect(status).toEqual(1);
  });

  it('can warn about redirected external links with --check-redirects', () => {
    const { status, stdout } = runLintMarkdownLinks(
      '--root',
      FIXTURES_DIR,
      '--fetch-external-links',
      '--check-redirects',
      'redirected-external-link.md'
    );

    expect(stdout.toString('utf-8')).toContain('Link redirection');
    expect(status).toEqual(0);
  });
});
