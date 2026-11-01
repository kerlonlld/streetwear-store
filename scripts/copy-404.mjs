import { copyFile, mkdir } from 'node:fs/promises';

await copyFile('dist/index.html', 'dist/404.html');
for (const route of ['login', 'admin', 'admim', 'checkout']) {
	await mkdir(`dist/${route}`, { recursive: true });
	await copyFile('dist/index.html', `dist/${route}/index.html`);
}
