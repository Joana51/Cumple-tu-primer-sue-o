import { readdir, readFile, mkdir, copyFile, writeFile, unlink } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Pages ya publica main / (root). Mantener esa configuración evita necesitar
// permisos de administración. El código editable continúa en src/.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const build = join(root, 'dist/sueno/browser');
const assets = join(root, 'site-assets');
const manifest = join(assets, 'generated-files.json');

async function filesAt(directory, prefix = '') {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = prefix + entry.name;
    if (entry.isDirectory()) result.push(...await filesAt(join(directory, entry.name), relative + '/'));
    else if (entry.isFile()) result.push(relative);
    else throw new Error('La compilación contiene un enlace o un tipo de archivo no permitido.');
  }
  return result.sort();
}

const files = await filesAt(build);
if (!files.includes('index.html')) throw new Error('No existe la compilación de Angular.');
const outputFiles = files.filter(file => file !== 'index.html');
let previous = [];
try { previous = JSON.parse(await readFile(manifest, 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; }

await mkdir(assets, { recursive: true });
for (const file of outputFiles) {
  const destination = join(assets, file);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(join(build, file), destination);
}
for (const file of previous) {
  if (typeof file !== 'string' || file.startsWith('/') || file.split('/').includes('..')) throw new Error('Ruta inválida en el manifiesto generado.');
  if (!outputFiles.includes(file)) {
    try { await unlink(join(assets, file)); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
}

const html = (await readFile(join(build, 'index.html'), 'utf8')).replace(
  /\b(src|href)="([^"]+)"/g,
  (attribute, name, value) => {
    if (/^(?:[a-z]+:|\/|#)/i.test(value)) return attribute;
    const file = value.replace(/^\.\//, '');
    if (!outputFiles.includes(file)) throw new Error('Recurso no encontrado: ' + file);
    return `${name}="site-assets/${file}"`;
  }
).replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (style) =>
  style.replace(/url\((['"]?)([^)'"\s]+)\1\)/g, (reference, _quote, value) => {
    if (/^(?:[a-z]+:|\/|#)/i.test(value)) return reference;
    const file = value.replace(/^\.\//, '');
    if (!outputFiles.includes(file)) throw new Error('Recurso CSS no encontrado: ' + file);
    return `url("site-assets/${file}")`;
  })
);
await writeFile(join(root, 'index.html'), html);
await writeFile(join(root, '.nojekyll'), '');
await writeFile(manifest, JSON.stringify(outputFiles, null, 2) + '\n');
console.log('GitHub Pages preparado: index.html + site-assets/ (' + outputFiles.length + ' recursos).');
