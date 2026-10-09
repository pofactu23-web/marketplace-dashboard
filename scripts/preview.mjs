import {readFile,writeFile} from 'node:fs/promises';
const home=await readFile('dist/index.html','utf8');
const css=await readFile('dist/styles.css','utf8');
const main=html=>html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
const linkFix=html=>html.replaceAll('href="/vacancies/','href="#vacancy-').replaceAll('href="/#','href="#').replaceAll('href="/"','href="#home"');
const slugs=['beauty-admin','gymnastics-admin','marketplace-manager'];
let sections='';
for(const slug of slugs){const html=await readFile(`dist/vacancies/${slug}/index.html`,'utf8');const body=main(html).replace('id="process"',`id="process-${slug}"`);sections+=`<main class="preview-page" id="vacancy-${slug}">${linkFix(body)}</main>`;}
const header=home.match(/<header[\s\S]*?<\/header>/)[0];
const footer=home.match(/<footer[\s\S]*?<\/footer>/)[0];
const output=`<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Кадровый ресурс</title><style>${css}\n.preview-page{display:none}.preview-page:target{display:block}.preview-page:target~#home{display:none}</style></head><body>${linkFix(header)}${sections}<main id="home">${linkFix(main(home))}</main>${linkFix(footer)}</body></html>`;
await writeFile('/workspace/kadroviy-resurs-v2.html',output);
console.log('Self-contained preview generated; navigation works without JavaScript.');
