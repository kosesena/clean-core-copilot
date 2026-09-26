import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
const entries=JSON.parse(read('data/recorded-audits.json'));
test('study snapshots preserve raw reports and synthetic source exactly',()=>{
 assert.equal(entries.length,4);
 for(const e of entries){const r=JSON.parse(e.raw),name=r.program.toLowerCase();
 assert.equal(e.raw,read('../reports/'+name+'.json'));
 assert.equal(e.source,read('../samples/legacy/'+name+'.abap'));
 assert.equal(e.report_sha256,createHash('sha256').update(e.raw).digest('hex'));
 assert.deepEqual(Object.keys(e.assessment).sort(),r.findings.map(f=>f.id).sort());
 }
});
test('confirmed scoring preserves exclusions and precision denominator',()=>{
 const a=entries.flatMap(e=>Object.values(e.assessment));
 assert.equal(a.filter(x=>x.startsWith('Match ')).length,27);
 assert.equal(a.filter(x=>x.startsWith('Bonus ')).length,1);
 assert.equal(a.filter(x=>x.startsWith('Duplicate ')).length,6);
 assert.equal(a.filter(x=>x==='Incorrect').length,2);
 assert.equal(a.filter(x=>x==='Partially correct').length,1);
 assert.equal(a.filter(x=>x==='Correct extra').length,1);
 assert.equal(a.filter(x=>x==='Correct observation - unscored').length,2);
 const decided=a.filter(x=>!x.startsWith('Duplicate ')&&x!=='Correct observation - unscored');
 assert.equal(decided.length,32);
 assert.equal(decided.filter(x=>/^(Match |Bonus )/.test(x)||x==='Correct extra').length,29);
 assert.equal(Math.round((entries.reduce((n,e)=>n+e.coins,0)+.807)*1000),1468);
});

test('task 6 case preserves current recorded files without invented target checks',()=>{
 const c=JSON.parse(read('cases/zfi-modernization.json'));
 for(const key of ['before','after','bob'])assert.equal(c.artifacts[key].text,read('../'+c.artifacts[key].name));
 assert.deepEqual(c.checks,{});
 assert.equal(c.target,'');
 for(const key of ['activation','atc','unit'])assert.equal(c.artifacts[key],undefined);
 assert.equal(Math.round((entries.reduce((n,e)=>n+e.coins,0)+.807+1.03)*1000),2498);
});
