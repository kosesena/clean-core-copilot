// Presentation and separately labelled assessment; never modifies Bob's raw JSON.
let recordedAudits=[];
const assessmentLabel='Claude assessment · awaiting Sena';
function recordedForCurrent(){return recordedAudits.find(x=>x.raw===rawText);}
function assessmentFor(f){return recordedForCurrent()?.assessment[f.id]||'Not assessed for this report';}
function programButtons(){return [...loadedReports].filter(([key,s])=>!s.isDesign||key===activeReportKey).map(([key,s])=>`<button class="program-card ${key===activeReportKey?'chosen':''}" data-program="${esc(key)}"><strong>${esc(s.report.program)}</strong><span>${s.report.findings.length} findings · ${s.isDesign?'Design example':key.startsWith('recorded-')?'Recorded report':'Import '+esc(key)}</span></button>`).join('');}
function bindPrograms(node){node.querySelectorAll('[data-program]').forEach(b=>b.onclick=()=>{const page=location.hash;switchReport(b.dataset.program);location.hash=page||'#overview';paintWorkspace();});}
function paintOverview(){
 const cards=[['Core issues found','27 / 29','Includes one non-catalogue runtime issue'],['Bonus issues found','1 / 12','Planted issues outside the core set'],['Duplicates','6 / 40','Raw findings retained in every report'],['Bobcoin used','≈1.5 / 40','1.468 total · four audits + task 5']];
 $('overview-view').innerHTML=`<p class="assessment-label">Recorded study · four synthetic programs · ${assessmentLabel}</p><div class="metric-grid">${cards.map(([t,v,n])=>`<article class="metric ${t==='Bobcoin used'?'metric-coins':''}"><span>${t}</span>${t==='Bobcoin used'&&window.CLEAN_CORE_DEMO_CONFIG?.SHOW_MASCOT===true?`<div class="coin-value"><strong>${v}</strong><img src="assets/bob-coins.png" alt="" width="160" height="160"></div>`:`<strong>${v}</strong>`}<small>${n}</small><small>${assessmentLabel}</small></article>`).join('')}</div><p class="caption">Scores are sample-author-key comparisons, not independent validation or a general accuracy benchmark. Source: docs/scoring/zcc_legacy_materials.md; task costs from the five recorded task summaries.</p><div class="program-strip">${programButtons()}</div><div class="section-heading"><h2>${esc(report.program)}</h2><span>Needs target verification · Bob draft: ${esc(report.summary.draft_verdict_hint||'Not supplied')}</span></div><div class="table-scroll"><table class="findings-table"><thead><tr><th>ID / Rule</th><th>Reported evidence</th><th>Status</th><th>Answer-key assessment<br><small>${assessmentLabel}</small></th></tr></thead><tbody>${report.findings.map(f=>`<tr><td><button class="finding-link" data-finding="${esc(f.id)}">${esc(f.id)} ↗</button><br><code>${esc(f.rule)}</code></td><td><code>${esc(f.evidence)}</code><small>L${f.line_start}–${f.line_end}</small></td><td><span class="pill">${esc(statusText[f.verification_status])}</span></td><td>${esc(assessmentFor(f))}</td></tr>`).join('')}</tbody></table></div><p class="caption">Scored against an answer key frozen 24 Sep for synthetic samples · assessment stays separate from raw output.</p><a href="#findings">Open all findings →</a>`;
 bindPrograms($('overview-view'));$('overview-view').querySelectorAll('[data-finding]').forEach(b=>b.onclick=()=>{selected=b.dataset.finding;activeTab='source';location.hash='#findings';paintWorkspace();});
}
function paintWorkspace(){
 const page=['overview','findings','evidence'].includes(location.hash.slice(1))?location.hash.slice(1):'overview';
 document.querySelectorAll('[data-page]').forEach(a=>{if(a.dataset.page===page)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 $('overview-view').hidden=page!=='overview';$('atlas-view').hidden=page!=='evidence';
 ['findings','evidence','guide'].forEach(v=>$(v+'-view').classList.toggle('hidden',v!=='findings'||page!=='findings'));
 document.querySelector('.report-stats').classList.toggle('hidden',page!=='findings');
 $('page-title').textContent={overview:'Legacy ABAP, audited.',findings:'Inspect the evidence.',evidence:'What was done, and what was not.'}[page];
 $('page-subtitle').textContent='Recorded output · not a live analyzer. Needs target verification.';
 $('breadcrumb-current').textContent=page;
 if(page==='overview')paintOverview();
 if(page==='findings')renderList();
 if(page==='evidence')paintAtlas();
}
// Keep existing import, filters, review and export handlers; repaint their new surroundings.
const oldNavigate=navigate;
navigate=function(view){oldNavigate(view);if(view==='evidence')location.hash='#evidence';paintWorkspace();};
window.addEventListener('hashchange',paintWorkspace);
async function loadRecordedAudits(){try{
 const response=await fetch('data/recorded-audits.json');if(!response.ok)throw Error('Recorded reports unavailable');
 recordedAudits=await response.json();saveActiveReport();
 for(const item of recordedAudits){const r=validate(JSON.parse(item.raw));const key='recorded-'+r.program;if(!loadedReports.has(key))loadedReports.set(key,{report:r,rawText:item.raw,reviews:new Map(),missed:[],isDesign:false,selected:r.findings[0]?.id??null});}
 // Do not replace any report the user imported while the fixture was loading.
 if(activeReportKey==='design')switchReport('recorded-'+JSON.parse(recordedAudits[0].raw).program);
 renderReportPicker();paintWorkspace();
 }catch(e){notify(e.message);paintWorkspace();}}
function paintAtlas(){
 $('atlas-view').innerHTML=`<p class="assessment-label">Recorded study snapshot · ${assessmentLabel}</p><div class="table-scroll"><table class="atlas-table"><thead><tr><th>Program</th><th>01 / Audit</th><th>02 / Scored against key</th><th>03 / Modernized</th><th>04 / Verified on target</th></tr></thead><tbody>${recordedAudits.map((x,i)=>{const r=JSON.parse(x.raw);return `<tr><th>${esc(r.program)}</th><td><div class="atlas-record">Recorded report<small>${x.coins.toFixed(3)} Bobcoin</small></div></td><td><div class="atlas-review">Core ${x.core}<small>Bonus ${x.bonus} · draft assessment</small></div></td><td><div class="${i===0?'atlas-review':'atlas-empty'}">${i===0?'Candidate files':'Not performed'}<small>${i===0?'Task 5 · 0.807 Bobcoin · review open':''}</small></div></td><td><div class="atlas-empty">Not performed</div></td></tr>`;}).join('')}</tbody></table></div><div class="atlas-panels"><section class="panel"><div class="eyebrow">Selected program</div><h2>${esc(report.program)}</h2><p>Needs target verification</p><a href="#findings">Open recorded findings →</a></section><section class="panel"><div class="eyebrow">Next evidence needed</div><h2>Activation · ATC · ABAP Unit</h2><p>No target execution records are included in this study snapshot.</p><a href="walkthrough.html">Inspect the case or attach records →</a></section></div><p class="caption">Solid cells: recorded artifacts or draft assessments. Dashed cells: no performed step in this snapshot. Case imports are local and do not update this study table automatically.</p><section class="panel atlas-origin"><h2>Selected report origin</h2><div id="atlas-origin-rows"></div></section>`;
 renderEvidence();$('atlas-origin-rows').innerHTML=$('evidence-rows').innerHTML;
}
const dossierPrograms=document.createElement('aside');dossierPrograms.className='dossier-programs';document.querySelector('.review-grid').prepend(dossierPrograms);
renderList=function(){
 dossierPrograms.innerHTML=programButtons()+`<p class="assessment-label">${assessmentLabel}</p><p class="caption">Four recorded audits: core 27 / 29 · bonus 1 / 12. Snapshot, not scores for arbitrary imports.</p>`;bindPrograms(dossierPrograms);
 const query=$('search').value.toLowerCase(),status=$('filter').value;
 const findings=report.findings.filter(f=>(status==='all'||f.verification_status===status)&&[f.id,f.rule,f.reason,f.evidence].join(' ').toLowerCase().includes(query));
 const current=recordedForCurrent();document.querySelector('.list-heading').textContent=report.source_file;
 $('finding-list').innerHTML=current?`<div class="source-document">${current.source.split('\n').map((line,i)=>{const matches=findings.filter(f=>i+1>=f.line_start&&i+1<=f.line_end);const start=matches.filter(f=>f.line_start===i+1);const level=matches.some(f=>f.level_hint==='D')?'level-d':matches.some(f=>f.level_hint==='C')?'level-c':'level-other';return `<div class="source-row ${matches.length?level:''} ${matches.some(f=>f.id===selected)?'selected-line':''}"><span class="source-number">${i+1}</span><code>${esc(line)||' '}</code><span>${start.map(f=>`<button class="source-pill" data-id="${esc(f.id)}">${esc(f.id)} · ${esc(f.rule)} · ${esc(f.level_hint||'Unclassified')}</button>`).join('')}</span></div>`;}).join('')}</div><p class="caption source-legend">Bob level hints: D · red, C · green, other · neutral. Colour is a reported classification, not target verification.</p>`:findings.map(f=>`<button class="finding ${f.id===selected?'selected':''}" data-id="${esc(f.id)}"><strong>${esc(f.id)} · ${esc(f.rule)}</strong><p>${esc(f.evidence)}</p><span>L${f.line_start}–${f.line_end} · ${esc(statusText[f.verification_status])}</span></button>`).join('');
 $('list-count').textContent=`${findings.length} findings match the filter`;
 $('finding-list').querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>{selected=b.dataset.id;renderList();});renderDetail();
};
renderDetail=function(){const f=report.findings.find(x=>x.id===selected);if(!f){$('detail').innerHTML='<p class="empty">Select a finding to inspect.</p>';return;}
 $('detail').innerHTML=`<div class="detail-head"><span class="rule">${esc(f.id)} · ${esc(f.rule)} · ${esc(f.level_hint||'Unclassified')}</span><h2>Finding at line ${f.line_start}</h2><span class="pill">${esc(statusText[f.verification_status])}</span></div><div class="detail-body"><h3 class="subhead">Bob’s reason</h3><p class="body-copy">${esc(f.reason)}</p><h3 class="subhead">Reported evidence</h3><pre class="code-dark">${esc(f.evidence)}</pre><h3 class="subhead">Suggested action · candidate</h3><pre class="code-dark">${esc(f.suggested_action)}</pre><h3 class="subhead">Unknowns Bob left open</h3><ul class="unknown-list">${f.unknowns.length?f.unknowns.map(x=>`<li>${esc(x)}</li>`).join(''):'<li>No unknowns recorded; completeness not established.</li>'}</ul><section class="assessment-box"><h3 class="subhead">Answer-key assessment</h3><p>${esc(assessmentFor(f))}</p><small>${assessmentLabel}</small></section><label for="review-decision" class="subhead">Your review decision</label><select id="review-decision" class="review-select" aria-label="Assessment"><option value="not_reviewed">Undecided / not reviewed</option><option value="correct">Correct</option><option value="incorrect">Wrong</option><option value="partially_correct">Partially correct</option></select><p class="caption">Review decisions export separately from Bob’s raw JSON. A review does not mark code as verified on SAP.</p></div>`;
 if(f.source_url){try{const u=new URL(f.source_url);if(['https:','http:'].includes(u.protocol)){const a=document.createElement('a');a.href=u.href;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Open Bob’s cited reference ↗';a.className='small-link';$('detail').querySelector('.detail-body').append(a);}}catch{}}
 $('review-decision').value=reviewOf(f);$('review-decision').onchange=e=>{reviews.set(f.id,e.target.value);renderStats();notify('Review stored in this session. Export review to save.');};
};

document.querySelectorAll('[data-mascot]').forEach(img=>{if(window.CLEAN_CORE_DEMO_CONFIG?.SHOW_MASCOT===true){img.src='assets/ibm-bob.webp';img.hidden=false;img.closest('.mascot-slot')?.classList.add('has-mascot');}});
// Retain review work across the site's two HTML documents in this tab only.
try{const saved=JSON.parse(sessionStorage.getItem('ccc-workspace-v1')||'null');if(saved){
 const restored=saved.entries.map(([key,state])=>{validate(state.report);if(JSON.stringify(JSON.parse(state.rawText))!==JSON.stringify(state.report))throw Error('Saved raw report mismatch');if(!Array.isArray(state.reviews)||!Array.isArray(state.missed)||!state.missed.every(x=>typeof x==='string'))throw Error('Invalid saved review');for(const [id,v] of state.reviews)if(!state.report.findings.some(f=>f.id===id)||!['not_reviewed','correct','incorrect','partially_correct'].includes(v))throw Error('Invalid saved decision');return [key,{...state,reviews:new Map(state.reviews)}];});
 for(const [key,state] of restored)loadedReports.set(key,state);reportSequence=saved.sequence||0;if(loadedReports.has(saved.active)){activeReportKey=saved.active;({report,rawText,reviews,missed,isDesign,selected}=loadedReports.get(saved.active));renderStats();renderMissed();renderReportPicker();}
}}catch{notify('Saved workspace could not be restored. Import an exported review bundle to recover it.');}
window.addEventListener('pagehide',()=>{try{saveActiveReport();sessionStorage.setItem('ccc-workspace-v1',JSON.stringify({active:activeReportKey,sequence:reportSequence,entries:[...loadedReports].map(([k,s])=>[k,{...s,reviews:[...s.reviews]}])}));}catch{/* Exports remain the durable save path when browser storage is unavailable. */}});
$('search').addEventListener('input',()=>renderList());$('filter').addEventListener('change',()=>renderList());
const originalPicker=renderReportPicker;renderReportPicker=function(){originalPicker();paintWorkspace();};
paintWorkspace();loadRecordedAudits();
