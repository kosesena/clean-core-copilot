import {test} from 'node:test';
import assert from 'node:assert/strict';
import {emptyCase,validateCase,digest,checkState,declarationReady} from '../walkthrough-model.mjs';
test('blank evidence cannot support a passed declaration, even from an import',async()=>{
 const c=emptyCase();c.target='TEST';c.artifacts.after={name:'demo.abap',text:'implementation'};c.artifacts.atc={name:'run.txt',text:'execution output'};
 assert.equal(declarationReady(c,'atc'),true);
 for(const field of ['target','after','atc']){
  const changed=structuredClone(c);
  if(field==='target')changed.target='  ';else changed.artifacts[field].text=' \n\t';
  changed.checks.atc={outcome:'passed',target:changed.target,source_sha256:await digest(changed.artifacts.after.text),record_sha256:await digest(changed.artifacts.atc.text),recorded_at:new Date().toISOString()};
  const imported=validateCase(JSON.parse(JSON.stringify(changed)));
  assert.equal(declarationReady(imported,'atc'),false);
  assert.doesNotMatch(await checkState(imported,'atc'),/^Reported passed/);
 }
});
test('no evidence cannot appear as success',async()=>{const c=emptyCase();assert.equal(await checkState(c,'atc'),'No record');c.artifacts.atc={name:'run.txt',text:'result'};assert.match(await checkState(c,'atc'),/not declared/);});
test('declarations go stale on implementation, log, or target changes',async()=>{const c=emptyCase();c.target='TEST system';c.artifacts.after={name:'demo.abap',text:'fictional source'};c.artifacts.atc={name:'atc.txt',text:'fixture log'};c.checks.atc={outcome:'passed',target:c.target,source_sha256:await digest(c.artifacts.after.text),record_sha256:await digest(c.artifacts.atc.text),recorded_at:new Date().toISOString()};assert.match(await checkState(c,'atc'),/^Reported passed/);for(const mutate of [x=>x.target='OTHER',x=>x.artifacts.after.text+='changed',x=>x.artifacts.atc.text+='changed']){const changed=structuredClone(c);mutate(changed);assert.match(await checkState(changed,'atc'),/^Stale/);}assert.deepEqual(validateCase(JSON.parse(JSON.stringify(c))),c);});
test('malformed bundles and unexpected stage names are rejected',()=>{for(const c of [null,{}, {...emptyCase(),artifacts:[]}, {...emptyCase(),checks:[]}, {...emptyCase(),artifacts:{unknown:{name:'x',text:'y'}}},{...emptyCase(),checks:{atc:{outcome:'passed'}}}])assert.throws(()=>validateCase(c));});
test('raw source including markup survives a round trip unchanged',()=>{const c=emptyCase();c.artifacts.before={name:'fixture.abap',text:'<script>alert(1)</script>\n  WRITE "test".\n'};assert.equal(validateCase(JSON.parse(JSON.stringify(c))).artifacts.before.text,c.artifacts.before.text);});
