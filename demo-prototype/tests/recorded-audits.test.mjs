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
test('study labels retain duplicates and unresolved proposals',()=>{
 const a=entries.flatMap(e=>Object.values(e.assessment));
 assert.equal(a.filter(x=>x.startsWith('Match ')).length,27);
 assert.equal(a.filter(x=>x.startsWith('Bonus ')).length,1);
 assert.equal(a.filter(x=>x.startsWith('Duplicate ')).length,6);
 assert.equal(a.filter(x=>x==='Proposed incorrect').length,2);
 assert.equal(a.filter(x=>x==='Undecided').length,1);
 assert.equal(Math.round((entries.reduce((n,e)=>n+e.coins,0)+.807)*1000),1468);
});
