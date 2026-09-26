// Presentation and separately labelled assessment; never modifies Bob's raw JSON.
let recordedAudits=[];
const assessmentLabel='Claude assessment · awaiting Sena';
function recordedForCurrent(){return recordedAudits.find(x=>x.raw===rawText);}
function assessmentFor(f){return recordedForCurrent()?.assessment[f.id]||'Not assessed for this report';}
function programButtons(){return [...loadedReports].map(([key,s])=>`<button class="program-card ${key===activeReportKey?'chosen':''}" data-program="${esc(key)}"><strong>${esc(s.report.program)}</strong><span>${s.report.findings.length} findings · ${s.isDesign?'Design example':'Recorded report'}</span></button>`).join('');}
function bindPrograms(node){node.querySelectorAll('[data-program]').forEach(b=>b.onclick=()=>{const page=location.hash;switchReport(b.dataset.program);location.hash=page||'#overview';paintWorkspace();});}
function paintOverview(){
 const cards=[['Core issues found','27 / 29','Includes one non-catalogue runtime issue'],['Bonus issues found','1 / 12','Planted issues outside the core set'],['Duplicates','6 / 40','Raw findings retained in every report'],['Bobcoin used','≈1.5 / 40','1.468 total · four audits + task 5']];
 $('overview-view').innerHTML=`<p class="assessment-label">Recorded study · four synthetic programs · ${assessmentLabel}</p><div class="metric-grid">${cards.map(([t,v,n])=>`<article class="metric"><span>${t}</span><strong>${v}</strong><small>${n}</small><small>${assessmentLabel}</small></article>`).join('')}</div><p class="caption">Scores are sample-author-key comparisons, not independent validation or a general accuracy benchmark. Source: docs/scoring/zcc_legacy_materials.md; task costs from the five recorded task summaries.</p><div class="program-strip">${programButtons()}</div><div class="section-heading"><h2>${esc(report.program)}</h2><span>Needs target verification · Bob draft: ${esc(report.summary.draft_verdict_hint||'Not supplied')}</span></div><div class="table-scroll"><table class="findings-table"><thead><tr><th>ID / Rule</th><th>Reported evidence</th><th>Status</th><th>Answer-key assessment<br><small>${assessmentLabel}</small></th></tr></thead><tbody>${report.findings.map(f=>`<tr><td><button class="finding-link" data-finding="${esc(f.id)}">${esc(f.id)} ↗</button><br><code>${esc(f.rule)}</code></td><td><code>${esc(f.evidence)}</code><small>L${f.line_start}–${f.line_end}</small></td><td><span class="pill">${esc(statusText[f.verification_status])}</span></td><td>${esc(assessmentFor(f))}</td></tr>`).join('')}</tbody></table></div><p class="caption">Scored against an answer key frozen 24 Sep for synthetic samples · assessment stays separate from raw output.</p><a href="#findings">Open all findings →</a>`;
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
 for(const item of recordedAudits){const r=validate(JSON.parse(item.raw));const key='recorded-'+r.program;loadedReports.set(key,{report:r,rawText:item.raw,reviews:new Map(),missed:[],isDesign:false,selected:r.findings[0]?.id??null});}
 // Do not replace any report the user imported while the fixture was loading.
 if(activeReportKey==='design')switchReport('recorded-'+JSON.parse(recordedAudits[0].raw).program);
 renderReportPicker();paintWorkspace();
 }catch(e){notify(e.message);paintWorkspace();}}
function paintAtlas(){$('atlas-view').innerHTML='<p>Evidence view is being prepared.</p>';}
paintWorkspace();loadRecordedAudits();
