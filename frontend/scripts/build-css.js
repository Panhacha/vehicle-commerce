const s = require('@tailwindcss/node');
const fs = require('fs');
const path = require('path');
const A = require('@tailwindcss/oxide');

async function buildCss() {
  const rootDir = path.resolve(__dirname, '..');
  const cssPath = path.join(rootDir, 'app', 'globals.css');
  const outPath = path.join(rootDir, 'app', 'tailwind.css');

  const css = fs.readFileSync(cssPath, 'utf8');
  const compiler = await s.compile(css, {
    base: rootDir,
    from: cssPath,
    shouldRewriteUrls: true,
    onDependency: () => {},
  });

  const scanner = new A.Scanner({
    sources: [
      { base: rootDir, pattern: '{app,components}/**/*.{js,ts,jsx,tsx}', negated: false }
    ]
  });

  const candidates = scanner.scan();
  const compiledCss = compiler.build(candidates);

  fs.writeFileSync(outPath, compiledCss, 'utf8');
  console.log(`[Tailwind Builder] Generated ${path.basename(outPath)} (${Math.round(compiledCss.length / 1024)} KB, ${candidates.length} classes)`);
}

async function main() {
  await buildCss();

  if (process.argv.includes('--watch')) {
    console.log('[Tailwind Builder] Watching app/ and components/ for changes...');
    const rootDir = path.resolve(__dirname, '..');
    const watchDirs = [path.join(rootDir, 'app'), path.join(rootDir, 'components')];
    let debounceTimer = null;

    for (const dir of watchDirs) {
      if (fs.existsSync(dir)) {
        fs.watch(dir, { recursive: true }, (event, filename) => {
          if (!filename || filename.endsWith('tailwind.css')) return;
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(async () => {
            try {
              await buildCss();
            } catch (e) {
              console.error('[Tailwind Builder Error]', e.message);
            }
          }, 300);
        });
      }
    }
  }
}

main().catch(err => {
  console.error('[Tailwind Builder Error]', err);
  process.exit(1);
});
