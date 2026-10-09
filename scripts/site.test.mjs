import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, access} from 'node:fs/promises';
import {resolve, dirname} from 'node:path';
import {jobs,cooperation,questions} from '../src/data.mjs';
const paths=['index.html',...jobs.map(j=>`vacancies/${j.slug}/index.html`)];
test('all pages have valid internal links and no candidate data collection',async()=>{
 for(const p of paths){const html=await readFile('dist/'+p,'utf8');
 assert.match(html,/<html lang="ru">/);assert.match(html,/<meta name="viewport"/);
 assert.ok(html.includes(questions));assert.ok(html.includes('href="mailto:lina.nikrasova.83@mail.ru"'));assert.ok(html.includes('Как проходит трудоустройство'));assert.doesNotMatch(html,/Продолжите[^<]*Telegram/);
 assert.doesNotMatch(html,/<form\b|<input\b|<textarea\b|tel:|https?:\/\/t\.me|Отправить заявку|Зарегистрироваться/);
 for(const [,href] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
 if(/^(https?:|mailto:)/.test(href))continue;
 const [file,fragment]=href.split('#');
 const local=file?resolve('dist','.'+file):resolve('dist',p);
 const target=/\.[a-z]+$/.test(file||'')?local:resolve(local,'index.html');
 if(file)await access(target);
 if(fragment){const linked=await readFile(file?target:resolve('dist',p),'utf8');assert.ok(linked.includes(`id="${fragment}"`),`${p}: missing ${href}`);}
 }
 }
});
test('vacancy pages preserve salary, schedules, remote format and NPD wording',async()=>{
 for(const j of jobs){const html=await readFile(`dist/vacancies/${j.slug}/index.html`,'utf8');assert.ok(html.includes(j.title));assert.ok(html.includes(j.salary));assert.ok(html.includes(j.schedule));assert.ok(html.includes(cooperation));assert.ok(html.includes('Полностью удалённый'));for(const task of j.tasks)assert.ok(html.includes(task));assert.ok(html.includes(`property="og:title" content="${j.title} — Кадровый ресурс"`));const cover=await readFile(`dist/covers/${j.slug}.png`);assert.equal(cover.readUInt32BE(16),1200);assert.equal(cover.readUInt32BE(20),630);}
 const beauty=await readFile('dist/vacancies/beauty-admin/index.html','utf8');assert.ok(beauty.includes('Выплаты два раза в месяц.'));assert.ok(beauty.includes('10:00–18:00'));
 const gym=await readFile('dist/vacancies/gymnastics-admin/index.html','utf8');assert.ok(gym.includes('Верхняя граница не является гарантированным заработком.'));
});
test('FAQ contains requested NPD answer',async()=>{const home=await readFile('dist/index.html','utf8');assert.ok(home.includes('Нужно ли оформлять самозанятость?'));assert.ok(home.includes('Да, для представленных вакансий предусмотрено сотрудничество в статусе самозанятого. Менеджер расскажет о необходимых действиях и документах.'));assert.equal((home.match(/Подробнее о вакансии/g)||[]).length,3);});
