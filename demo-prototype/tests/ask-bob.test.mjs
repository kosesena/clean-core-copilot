import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../workspace.js',import.meta.url),'utf8');
const functions=source.slice(source.indexOf('function levelCounts()'),source.indexOf('function ringSVG()'));
function answer(q,program='UPLOADED'){
 const context={report:{program,findings:[],summary:{human_must_decide:[],draft_verdict_hint:'Refactor'}},programTitles:{},programPlain:{},recordedForCurrent:()=>undefined,adviceText:{Refactor:'refactor'}};
 vm.createContext(context);vm.runInContext(functions,context);
 return context.askBobAnswer(q);
}
test('empty uploaded reports have no invented worst finding or readiness verdict',()=>{
 assert.match(answer('worst').text,/no findings/);
 assert.match(answer('ready').text,/has not been verified/);
});
test('an upload using the recorded program name does not inherit trial results',()=>{
 const result=answer('rewrite','ZFI_VENDOR_AGING');
 assert.match(result.text,/uploaded report/);
 assert.doesNotMatch(result.text,/tests passed|431/);
});
