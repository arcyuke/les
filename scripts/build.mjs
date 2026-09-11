import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {layout,pages,filenames} from '../dist/assets/render.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const content=JSON.parse(await readFile(path.join(root,'dist/data/content.json'),'utf8'));
await mkdir(path.join(root,'dist'),{recursive:true});
for(const p of pages)await writeFile(path.join(root,'dist',filenames[p]),layout(content,p));
console.log(`Built ${pages.length} pages in dist/`);
