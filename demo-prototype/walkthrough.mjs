import {emptyCase,validateCase,digest,checkState,declarationReady} from './walkthrough-model.mjs';
const $=id=>document.getElementById(id);
let data=emptyCase(),revision=0;
const checkNames={activation:'Activation',atc:'ATC',unit:'ABAP Unit'};
function message(text){$('message').textContent=text;}
for(const [key,label] of Object.entries(checkNames)){
 const panel=document.createElement('section');panel.className='panel';
 const heading=document.createElement('h2');heading.textContent=label;panel.append(heading);
 const status=document.createElement('p');status.id=key+'-status';status.className='status';panel.append(status);
 const file=document.createElement('input');file.type='file';file.accept='.txt,.json,.xml,.md,.log';file.dataset.artifact=key;file.setAttribute('aria-label','Load '+label+' execution record');panel.append(file);
 const name=document.createElement('div');name.id=key+'-name';name.className='muted';panel.append(name);
 const select=document.createElement('select');select.id=key+'-outcome';select.setAttribute('aria-label',label+' declared outcome');
 for(const [value,text] of [['','Choose reported outcome'],['passed','Passed'],['failed','Failed'],['inconclusive','Inconclusive']]){const o=document.createElement('option');o.value=value;o.textContent=text;select.append(o);}panel.append(select);
 const save=document.createElement('button');save.textContent='Record declaration';save.onclick=async()=>{
 try{if(!declarationReady(data,key)||!select.value)throw Error('Load non-empty implementation and execution records, set target, and choose an outcome first.');
 const snapshot=data,ver=revision,target=data.target,outcome=select.value;
 const source_sha256=await digest(data.artifacts.after.text),record_sha256=await digest(data.artifacts[key].text);
 if(ver!==revision||snapshot!==data)throw Error('Files changed; review the outcome again.');
 data.checks[key]={outcome,target,source_sha256,record_sha256,recorded_at:new Date().toISOString()};revision++;await render();message('Outcome recorded as your declaration, not an independently verified result.');
 }catch(e){message(e.message);}};panel.append(save);
 const details=document.createElement('details'),summary=document.createElement('summary'),pre=document.createElement('pre');summary.textContent='Read execution record';pre.id=key+'-code';details.append(summary,pre);panel.append(details);$('checks').append(panel);
}
async function render(){
 const ver=revision,snapshot=data;
 $('title').value=data.title;$('target').value=data.target;
 for(const key of ['before','after','bob',...Object.keys(checkNames)]){const a=data.artifacts[key];$(key+'-name').textContent=a?.name||'No file attached';$(key+'-code').textContent=a?.text||'No record loaded.';}
 const hashes=await Promise.all(['before','after'].map(async k=>data.artifacts[k]?await digest(data.artifacts[k].text):''));
 const states=await Promise.all(Object.keys(checkNames).map(k=>checkState(snapshot,k)));
 if(ver!==revision||snapshot!==data)return;
 ['before','after'].forEach((k,i)=>$(k+'-hash').textContent=hashes[i]?'SHA-256 '+hashes[i]:'');
 Object.keys(checkNames).forEach((k,i)=>{$(k+'-status').textContent=states[i];$(k+'-outcome').value=data.checks[k]?.outcome||'';});
 $('steps').replaceChildren();
 for(const [title,status] of [['Source',data.artifacts.before?'Loaded':'Waiting'],['Bob task',data.artifacts.bob?'Record attached':'Waiting'],['Change',data.artifacts.after?'Loaded':'Waiting'],['Target checks',`${Object.keys(checkNames).filter(k=>data.artifacts[k]).length}/3 records attached`]]){const el=document.createElement('div');el.className='step';const b=document.createElement('b'),s=document.createElement('span');b.textContent=title;s.textContent=status;el.append(b,s);$('steps').append(el);}
}
for(const field of ['title','target'])$(field).addEventListener('input',()=>{data[field]=$(field).value;revision++;if(field==='target')render();});
async function readFile(file){if(file.size>2000000)throw Error('Choose a text file smaller than 2 MB.');const text=await file.text();if(text.includes('\u0000'))throw Error('Choose a text execution record, not a binary file.');return text;}
document.querySelectorAll('[data-artifact]').forEach(input=>input.addEventListener('change',async()=>{const file=input.files[0];if(!file)return;const current=data;try{const text=await readFile(file);if(current!==data)throw Error('Case changed; attach this file again.');data.artifacts[input.dataset.artifact]={name:file.name,text};revision++;await render();message('File attached locally. Export the case to save.');}catch(e){message(e.message);}finally{input.value='';}}));
$('import').onclick=()=>$('case-file').click();
$('load-zfi').onclick=async()=>{const ver=revision;try{const response=await fetch('./cases/zfi-modernization.json?v=task6');if(!response.ok)throw Error('Recorded case could not be loaded.');const next=validateCase(await response.json());if(ver!==revision)throw Error('Case changed while loading; try again.');data=next;revision++;await render();message('Recorded ZFI task 6 revision loaded. Separate trial run recorded: adapted class activated, 7/7 tests passed with stand-in tables; ATC 0 errors, 2 warnings, 43 infos. SAP data link unproven. Trial results do not certify this raw snapshot.');}catch(e){message(e.message);}};
$('case-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>14000000)throw Error('Case bundle must be smaller than 14 MB.');const next=validateCase(JSON.parse(await file.text()));data=next;revision++;await render();message('Case imported. Outcomes remain supplied declarations.');}catch(e){message(e.message);}finally{e.target.value='';}};
$('export').onclick=()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='clean-core-case.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message('Case exported with source, raw records and separate check declarations.');};
render();

document.querySelectorAll("[data-mascot]").forEach(img=>{if(window.CLEAN_CORE_DEMO_CONFIG?.SHOW_MASCOT===true){img.src="assets/ibm-bob.webp";img.hidden=false;img.closest('.mascot-slot')?.classList.add('has-mascot');}});
// Keep case edits while navigating between the four views in this browser tab.
try{const saved=sessionStorage.getItem('ccc-case-v1');if(saved){data=validateCase(JSON.parse(saved));revision++;render();}else{$('load-zfi').click();}}catch{message('Saved case could not be restored. Import an exported case to recover it.');}
window.addEventListener('pagehide',()=>{try{sessionStorage.setItem('ccc-case-v1',JSON.stringify(data));}catch{/* Export remains the durable save path. */}});

if(window.CLEAN_CORE_DEMO_CONFIG?.SHOW_MASCOT===true){document.querySelectorAll('[data-case-art]').forEach(img=>{img.src=img.dataset.caseArt;img.closest('.case-illustration').hidden=false;});}
