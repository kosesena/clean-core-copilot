// Presentation and separately labelled assessment; never modifies Bob's raw JSON.
let recordedAudits=[];
const assessmentLabel='Scored by Claude - confirmed by Sena, 26 Sep';
function recordedForCurrent(){return recordedAudits.find(x=>x.raw===rawText);}
const findingHeadlines={"ZFI_VENDOR_AGING": ["Reads the finance data tables directly; the cloud version may not allow that.", "Reads supplier data directly from an SAP table.", "Talks to the database in a raw way the cloud version does not allow.", "Declares a data table in an outdated way the cloud version rejects.", "Writes a file to the application server instead of a cloud integration.", "Launches another old-style program directly.", "Claims to convert currency, but only updates a log.", "Bob is right that the whole program is old-style, but cites the wrong rule."], "ZSD_OPEN_ORDERS": ["Uses a data structure tied to the old SAP desktop screens.", "Declares a data table in an outdated way the cloud version rejects.", "Bob questions how a variable borrows its type from a database field.", "Bob questions another variable that borrows its type from a database field.", "Uses an old-style input screen and a database-field type.", "Reads sales headers directly from an SAP table.", "Asks the database the same question over and over inside a loop.", "Reads sales items directly from an SAP table.", "Reads delivery status directly from an SAP table.", "Reads customer data directly from an SAP table.", "Bob questions a normal copy statement; our answer list disagrees.", "Organises code with an outdated construct (a subroutine) instead of a method.", "Another outdated subroutine instead of a method.", "Calls the outdated subroutines flagged above.", "Prints an old-style text screen that the cloud version cannot show.", "Uses an old list-printing feature in that text screen.", "Uses an outdated way of writing a sum.", "The delivery-status comment does not match its filter."], "ZMM_MASS_PRICE_UPDATE": ["Opens a desktop pop-up window that does not exist in the cloud version.", "Reads material prices directly from an SAP table.", "Updates SAP prices directly, bypassing standard posting logic.", "Fakes keystrokes on old SAP screens to change a material record.", "Prints an old-style text screen that the cloud version cannot show.", "Organises code with outdated subroutines instead of methods.", "Bob questions some variable declarations; our answer list disagrees.", "Changes standard prices without checking price control."], "ZCC_LEGACY_MATERIALS": ["Uses a data structure tied to the old SAP desktop screens.", "Uses an input screen that only works on the old SAP desktop.", "Reads material data directly from an SAP table.", "Prints an old-style text screen that the cloud version cannot show.", "Shows a table on screen through an old desktop-only function.", "Prints another old-style screen line; repeats an earlier issue."]};
function plainFinding(f){const a=recordedForCurrent();const n=Number(f.id.replace("F-",""))-1;return a&&findingHeadlines[report.program]?.[n]||f.title||f.reason.split(/\n|\. /)[0];}
// Plain-language layer: every label on screen should read like the pitch, not like a data field.
const programPlain={ZFI_VENDOR_AGING:'Lists unpaid supplier invoices by how overdue they are',ZSD_OPEN_ORDERS:'Prints open sales orders for each customer',ZMM_MASS_PRICE_UPDATE:'Raises the price of every material in a plant',ZCC_LEGACY_MATERIALS:'Shows a list of materials'};
const programTitles={ZFI_VENDOR_AGING:'Unpaid supplier invoices',ZSD_OPEN_ORDERS:'Open customer orders',ZMM_MASS_PRICE_UPDATE:'Bulk material price updates',ZCC_LEGACY_MATERIALS:'Material list'};
const programNameNotes={
 ZFI_VENDOR_AGING:'FI = finance; vendor = supplier; aging = how long invoices have been unpaid.',
 ZSD_OPEN_ORDERS:'SD = Sales and Distribution; open orders = customer orders still awaiting completion.',
 ZMM_MASS_PRICE_UPDATE:'MM = Materials Management; mass price update = changing many material prices at once.',
 ZCC_LEGACY_MATERIALS:'CC is this sample’s prefix, not a separate SAP module. Legacy materials means an old-style material-list program.'
};
const ruleName={"CC-01": "reads SAP data tables directly instead of through an approved view", "CC-02": "reads finance tables directly", "CC-03": "writes straight into SAP tables, skipping SAP's checks", "CC-04": "fakes keystrokes on old SAP screens", "CC-05": "talks to the database in a raw, non-portable way", "CC-06": "writes files on the server", "CC-07": "launches other old-style programs", "CC-08": "calls SAP functions not open to cloud code", "CC-09": "prints old-style text screens", "CC-10": "uses outdated ABAP syntax", "CC-11": "organises code with outdated subroutines", "CC-12": "asks the database the same question inside a loop"};
const ruleLabel=r=>ruleName[r]?`Rule ${r}: ${ruleName[r]}`:'Outside the 12-rule list';
const problemNo=f=>/^F-\d+$/.test(f.id)?'Problem '+Number(f.id.slice(2)):f.id;
const linesText=f=>f.line_start===f.line_end?`code line ${f.line_start}`:`code lines ${f.line_start}–${f.line_end}`;
const adviceText={Rebuild:'rebuild it',Refactor:'clean it up',Retire:'retire it',Keep:'keep it'};
const triedText=p=>p==='ZFI_VENDOR_AGING'?'New version being tried on a free SAP trial system':'Not yet tried on a real SAP system';
Object.assign(statusText,{observed:'Bob saw this in the code',needs_verification:'Must be confirmed on a real SAP system',verified_on_target:'Reported as checked on SAP'});
document.querySelectorAll('#filter option').forEach(o=>{if(statusText[o.value])o.textContent=statusText[o.value];});
function verdictFor(f){
 const value=recordedForCurrent()?.assessment[f.id]||'';
 if(/^(Match|Bonus) /.test(value))return['✓ Bob was right','good','Yes. This problem is on our sealed answer list, and Bob found it on the right lines.'];
 if(value==='Correct extra')return['✓ Right, and not on our list','good','Yes. This is a real problem that our answer list did not include.'];
 if(value.startsWith('Duplicate '))return['✓ Right, but a repeat','repeat','Yes, but Bob already reported this same problem earlier, so it is counted once.'];
 if(value==='Correct observation - unscored')return['✓ Fair point, not counted','repeat','A fair point. Our answer list marks this as a decision for a person, so it is not counted either way.'];
 if(value==='Partially correct')return['◐ Partly right','partial','Partly. Bob found the right place but the reason or rule is not fully right.'];
 if(value==='Incorrect')return['✗ Bob was wrong','wrong','No. Our answer list does not treat this as a problem.'];
 return['Not judged','none','This finding has not been judged against an answer list.'];
}
function assessmentFor(f){return verdictFor(f)[0];}
function programButtons(){
 const button=([key,s])=>`<button class="program-card ${key===activeReportKey?'chosen':''}" data-program="${esc(key)}"><strong>${esc(programTitles[s.report.program]||s.report.program)}</strong><small class="technical-name">Code name: ${esc(s.report.program)}</small><span class="program-plain">${esc(programPlain[s.report.program]||(s.isDesign?'Made-up design example':'A report you uploaded'))}</span><span>${s.report.findings.length} problems flagged by Bob</span></button>`;
 const entries=[...loadedReports];const main=entries.filter(([key])=>key.startsWith('recorded-'));
 const imports=entries.filter(([key,s])=>!key.startsWith('recorded-')&&!s.isDesign);
 return main.map(button).join('')+(imports.length?`<details class="your-imports" ${imports.some(([key])=>key===activeReportKey)?'open':''}><summary>Reports you uploaded (${imports.length})</summary><div class="program-strip">${imports.map(button).join('')}</div></details>`:'');
}
function bindPrograms(node){node.querySelectorAll('[data-program]').forEach(b=>b.onclick=()=>{const page=location.hash;switchReport(b.dataset.program);location.hash=page||'#overview';paintWorkspace();if(node.id==='overview-view')openProgramDialog(b.dataset.program);});}

// ---- Ask Bob: a replay avatar. Every answer is composed from Bob's recorded JSON and our scoring; no live model. ----
const askBobQuestions=[
 ['ready','Is this program cloud-ready?'],
 ['worst','What is the worst problem you found?'],
 ['unknown','What could you not verify?'],
 ['right','How much of your review was right?'],
 ['rewrite','Can you rewrite it?'],
 ['cost','What did all this cost?'],
 ['cleancore','What is Clean Core, in one breath?']
];
let askBobCurrent='ready';
function levelCounts(){const d=report.findings.filter(f=>f.level_hint==='D').length;const c=report.findings.filter(f=>f.level_hint==='C').length;return {d,c,other:report.findings.length-d-c};}
function verdictCounts(){const o={good:0,partial:0,wrong:0,repeat:0,none:0};report.findings.forEach(f=>{o[verdictFor(f)[1]]++});return o;}
function askBobAnswer(q){
 const p=report.program,t=programTitles[p]||p,plain=programPlain[p]||'this program',rec=recordedForCurrent();const {d,c,other}=levelCounts();const n=report.findings.length;
 const advice=adviceText[report.summary.draft_verdict_hint]||'review it';
 if(q==='ready'){return {text:`No. ${t} is not cloud-ready as it stands. I read ${plain.toLowerCase()} and flagged ${n} places: ${d} that SAP's cloud version will not allow at all, ${c} that use SAP internals and need a supported replacement${other?`, and ${other} I could not place under a rule`:''}. My advice: ${advice}.${rec?` This review cost ${rec.coins.toFixed(3)} Bobcoin.`:''}`,ring:true};}
 if(q==='worst'){const f=report.findings.find(x=>x.level_hint==='D')||report.findings[0];return {text:`${plainFinding(f)} That is ${problemNo(f).toLowerCase()}, at ${linesText(f)}. ${f.level_hint==='D'?'I rate it the riskiest kind: the cloud version will not run it, and there is no supported way to keep it.':'It needs a supported replacement before the program can move.'} ${rec?`Our answer list says: ${verdictFor(f)[0].replace(/^[✓◐✗] /,'')}.`:''}`};}
 if(q==='unknown'){const u=(report.summary.human_must_decide||[]).slice(0,3);return {text:u.length?`Three things I could not know from the code alone:\n• ${u.join('\n• ')}\nI wrote these into the report as open questions instead of guessing.`:'I recorded no open questions for this program.'};}
 if(q==='right'){if(!rec)return {text:'This is an uploaded report; nobody has scored it against an answer list yet.'};const v=verdictCounts();return {text:`Of my ${n} findings here, ${v.good} were right, ${v.partial} partly right, ${v.wrong} wrong, and ${v.repeat} were repeats or fair points the answer list did not count. Across all four programs I caught 27 of 29 rule problems and 1 of 12 business-logic bugs. Logic is where a person still has to look.`};}
 if(q==='rewrite'){if(p==='ZFI_VENDOR_AGING')return {text:'Yes, I did. I wrote a data view, a class and seven unit tests. On a real SAP trial the view could not start, because the two SAP sources I had marked "confirm on target" do not exist there. With two stand-in tables the class compiled and all seven tests passed. The logic is proven; the link to real finance data is not.',link:['before-after.html','See the before / after']};return {text:rec?`I drafted a rewrite in one parallel run with two other programs: a sub-agent each, thirteen files in sixteen minutes for 1.76 Bobcoin. Nobody has reviewed or run those files yet, so I will not call them done.`:'Not for an uploaded report; I only rewrite what I have audited.',link:['https://github.com/kosesena/clean-core-copilot/tree/main/modernized','Bob’s draft files on GitHub']};}
 if(q==='cost'){return {text:'4.258 of the 40 Bobcoin the team was given, about a tenth. Reading the four programs 0.661, rewriting one 0.807, fixing that rewrite after review 1.030, rewriting the other three in parallel 1.760.'};}
 if(q==='cleancore'){return {text:'SAP’s cloud version only lets custom code use approved doors: released data views and APIs, no direct table writes, no desktop-screen tricks, no files on the server. "Clean Core" is the name of those rules. Old programs break them everywhere, so each one has to be checked before a company can move.'};}
 return {text:''};
}
function ringSVG(){const {d,c,other}=levelCounts();const n=report.findings.length||1;const R=34,C=2*Math.PI*R;const segs=[[d,'#8a1f2c'],[c,'#b8741a'],[other,'#9aa39e']];let off=0;const arcs=segs.map(([k,col])=>{const len=C*k/n;const a=`<circle r="${R}" cx="44" cy="44" fill="none" stroke="${col}" stroke-width="10" stroke-dasharray="${len} ${C-len}" stroke-dashoffset="${-off}" transform="rotate(-90 44 44)"/>`;off+=len;return a;}).join('');return `<svg class="ready-ring" viewBox="0 0 88 88" width="88" height="88" aria-hidden="true"><circle r="${R}" cx="44" cy="44" fill="none" stroke="#e8dfd3" stroke-width="10"/>${arcs}<text x="44" y="49" text-anchor="middle" font-size="22" font-family="Georgia,serif" fill="#3d2229">${report.findings.length}</text></svg>`;}
function paintAskBob(){
 const {d,c}=levelCounts();const a=askBobAnswer(askBobCurrent);
 const chips=[...loadedReports].filter(([k])=>k.startsWith('recorded-')).map(([k,s])=>`<button type="button" class="ask-prog ${k===activeReportKey?'on':''}" data-askprog="${esc(k)}">${esc(programTitles[s.report.program]||s.report.program)}</button>`).join('');
 return `<section class="ask-bob" aria-label="Ask Bob"><div class="ask-head"><img src="assets/bob-findings.png" alt="" width="84" height="84"><div><div class="eyebrow">Ask Bob</div><h2>Pick a program, ask Bob a question.</h2><p>Answers are replayed from Bob’s recorded reports and our scoring. Not a live model.</p></div></div>
 <div class="ask-progs">${chips}</div>
 <div class="ask-qs">${askBobQuestions.map(([k,q])=>`<button type="button" class="ask-q ${k===askBobCurrent?'on':''}" data-askq="${k}">${q}</button>`).join('')}</div>
 <div class="ask-answer"><div class="ask-bubble">${a.ring?`<div class="ask-ring">${ringSVG()}<div><b class="ready-no">Not cloud-ready</b><small>${d} blockers · ${c} need a supported replacement</small></div></div>`:''}<p class="ask-text" data-full="${esc(a.text)}"></p>${a.link?`<a class="ask-link" href="${esc(a.link[0])}">${esc(a.link[1])} →</a>`:''}</div></div></section>`;
}
function bindAskBob(root){
 root.querySelectorAll('[data-askprog]').forEach(b=>b.onclick=()=>{switchReport(b.dataset.askprog);location.hash='#overview';paintWorkspace();});
 root.querySelectorAll('[data-askq]').forEach(b=>b.onclick=()=>{askBobCurrent=b.dataset.askq;paintWorkspace();});
 const t=root.querySelector('.ask-text');if(!t)return;const full=t.dataset.full;
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){t.textContent=full;return;}
 let i=0;t.textContent='';const step=()=>{i+=3;t.textContent=full.slice(0,i);if(i<full.length)askBobTimer=setTimeout(step,14);};clearTimeout(askBobTimer);step();
}
let askBobTimer=null;
const didWell=[
 ['Never invented a rule','40 of 40 findings cite a real catalogue rule or say "Unclassified".'],
 ['Never claimed a system check','0 of 40 findings are marked "verified on target". Bob leaves that to people.'],
 ['Asked before writing','Every file write was proposed first and approved by hand.'],
 ['Caught a lying comment','ZFI problem 7: the comment promised a currency conversion the code never did.'],
 ['Refused to guess the integration','For the treasury hand-off it wrote four options and left the choice to a person.'],
 ['Fixed its own compile error','During the ZFI rewrite Bob noticed and corrected a compile error before finishing.']
];
const didWellHTML=()=>`<section class="did-well" aria-label="What Bob did well"><div class="eyebrow">What Bob did well, beyond the numbers</div><div class="did-well-grid">${didWell.map(([t,d])=>`<article><b>✓ ${t}</b><small>${d}</small></article>`).join('')}</div></section>`;

function paintOverview(){
 const steps=[['1','We hid the problems','We wrote four old-style SAP programs and hid 41 known problems in them. The answer list was sealed on 24 Sep, before Bob saw any code.'],['2','Bob looked for them','Bob read each program and listed every problem it saw, with the line number and its reason.'],['3','We checked Bob’s list','Claude compared Bob’s list with the sealed answers. Sena confirmed every call on 26 Sep.']];
 const cards=[['Rule problems Bob caught','27 of 29','29 of the hidden problems break a written SAP cloud rule. Bob found 27 of them on the right lines.'],['Logic bugs Bob caught','1 of 12','12 hidden problems are business-logic mistakes that no rule list covers. Bob found 1, so a person still has to check the logic.'],['How often Bob was right','29 of 32','We could judge 32 of Bob’s findings, and 29 were correct (91%). Six repeats and two fair points our list did not count are left out.']];
 const spend=[['Reading the four programs','0.661'],['Rewriting one program as new cloud code','0.807'],['Fixing that rewrite after our review','1.030'],['Rewriting the other three programs at once','1.760']];
 const mascot=window.CLEAN_CORE_DEMO_CONFIG?.SHOW_MASCOT===true?'<img class="coin-art" src="assets/bob-coins.png" alt="" width="200" height="200">':'';
 $('overview-view').innerHTML=`<section class="product-box"><div class="product-head"><img src="assets/bob-building.png" alt="" width="96" height="96"><div><div class="eyebrow">What Clean Core Copilot is</div><h2>A Bob mode that reviews old SAP code for the cloud, and knows what it must not claim.</h2><p><b>IBM Bob</b> is an AI development partner that reads a whole code repository, proposes changes and asks before it writes. <b>Clean Core Copilot</b> turns Bob into a senior SAP architect: a custom mode with strict rules, a 12-rule Clean Core catalogue it must cite, and this site that shows Bob’s work next to the code and says how far it can be trusted.</p></div></div>
<div class="product-cols"><div class="try-it"><div class="eyebrow">Use it on your own code (needs IBM Bob)</div><ol><li>Copy the <a href="https://github.com/kosesena/clean-core-copilot/blob/main/bob-config-draft/clean-core-architect.mode.md" target="_blank" rel="noopener">Clean Core Architect mode</a> and the <a href="https://github.com/kosesena/clean-core-copilot/blob/main/docs/clean-core-rules.md" target="_blank" rel="noopener">rule catalogue</a> into your Bob workspace.</li><li>Open your legacy <code>.abap</code> file, pick the mode, send one prompt: “Audit this program against the catalogue.” Bob writes <code>reports/&lt;program&gt;.json</code> and explains every finding.</li><li>Ask Bob to rewrite it. It drafts a data view, a class and unit tests, and marks everything it could not verify as <code>candidate</code>.</li><li>Upload the JSON under <a href="#evidence">Proof</a> to browse the findings on your code and record your own verdicts.</li></ol></div>
<div class="why-box compact"><div class="eyebrow">Why the exam</div><p><b>The problem.</b> Companies moving to SAP’s cloud carry hundreds of old ABAP programs that break the new rules. Each one is checked by hand today, by the few experts who know both worlds.</p><p><b>The question.</b> Before handing that job to an AI, a project manager asks: how well does it do it, and where does it fail? So we tested Bob like an exam: four programs, 41 planted problems, an answer key sealed by hash before Bob saw any code. Everything below is that exam’s result.</p><details class="glossary"><summary>Words you will see on this site</summary><dl><dt>Clean Core rules</dt><dd>SAP’s list of what old code may no longer do in the cloud version. We wrote our 12-rule list from it.</dd><dt>SAP table / data view</dt><dd>Where SAP keeps its data. Cloud code must read it through approved views, not straight from the tables.</dd><dt>Old-style / classic</dt><dd>Techniques from the desktop era of SAP that the cloud version rejects.</dd><dt>Answer list, sealed</dt><dd>Our list of the 41 hidden problems, locked with a digital fingerprint on 24 Sep, before Bob saw any code.</dd><dt>Unit test</dt><dd>A small automatic check that a piece of code gives the right answer.</dd><dt>Bobcoin</dt><dd>The credit each hackathon team gets to pay for Bob’s work: 40 per team.</dd></dl></details></div></div></section>
`+paintAskBob()+`<ol class="explain-steps">${steps.map(([n,t,d])=>`<li><span class="step-number">${n}</span><div><h3>${t}</h3><p>${d}</p></div></li>`).join('')}</ol>
 <div class="metric-grid">${cards.map(([t,v,n])=>`<article class="metric"><span>${t}</span><strong>${v}</strong><small>${n}</small></article>`).join('')}
 <article class="metric metric-coins">${mascot}<div class="coin-summary"><span class="eyebrow">Bob credits spent</span><div class="coin-value"><strong>≈4.3 of 40</strong><span>Bobcoin</span></div><p>Each hackathon team gets 40 Bobcoin to pay for Bob’s work. This whole project used about a tenth of it.</p><div class="coin-budget"><div class="coin-track" role="meter" aria-label="Bobcoin used" aria-valuemin="0" aria-valuemax="40" aria-valuenow="4.258"><span style="width:10.645%"></span></div><div class="coin-budget-labels"><span>4.258 used</span><span>35.742 left</span></div></div><ul class="coin-breakdown">${spend.map(([t,v])=>`<li><span>${t}</span><b>${v}</b></li>`).join('')}</ul></div></article></div>
 `+didWellHTML()+`<details class="study-method"><summary>Where these numbers come from</summary><p>The 41 problems sit in made-up programs we wrote for this test, so the numbers describe this test only, not Bob on every SAP system. Scoring notes are in docs/scoring/. Bobcoin figures come from Bob’s own task summaries.</p></details>
 <h2 class="plain-heading">Pick a program to see what Bob found</h2><div class="program-strip">${programButtons()}</div>
`;
 bindPrograms($('overview-view'));bindAskBob($('overview-view'));
}
// Native modal keeps the background inert and traps keyboard focus.
let programDialogKey=null;
const programDialog=document.createElement('dialog');
programDialog.className='program-dialog';
programDialog.setAttribute('aria-labelledby','program-dialog-title');
document.body.append(programDialog);
programDialog.addEventListener('close',()=>{
 document.body.classList.remove('program-dialog-open');
 const trigger=[...document.querySelectorAll('#overview-view [data-program]')].find(b=>b.dataset.program===programDialogKey);
 if(location.hash==='#overview'||!location.hash)trigger?.focus({preventScroll:true});
});
let dialogBackdropDown=false;
programDialog.addEventListener('pointerdown',e=>{dialogBackdropDown=e.target===programDialog;});
programDialog.addEventListener('click',e=>{if(e.target===programDialog&&dialogBackdropDown)programDialog.close();dialogBackdropDown=false;});
function openProgramDialog(key){
 programDialogKey=key;
 const p=report.program,a=report.summary.draft_verdict_hint;
 const trial=!recordedForCurrent()?'Uploaded report: no trial result independently checked.':p==='ZFI_VENDOR_AGING'?'Trial: 7/7 tests passed with stand-in tables. Real SAP data access remains unproven.':'Trial: not performed for this program.';
 programDialog.innerHTML=`<div class="program-dialog-panel"><header class="program-dialog-bar"><span>PROGRAM REVIEW</span><button type="button" class="program-dialog-close" aria-label="Close program review">Close <span aria-hidden="true">×</span></button></header> <div class="section-heading"><h2 id="program-dialog-title" tabindex="-1">${esc(programTitles[p]||p)}</h2><small class="technical-name">Code name: ${esc(p)}</small><span>${esc(programPlain[p]||'')}${a?` · Bob’s advice: ${esc(adviceText[a]||a)}`:''} · ${esc(trial)}</span></div>
 <div class="finding-gallery-heading"><span>Bob flagged ${report.findings.length} problems in this program</span><a href="#findings">See each one in the code ↗</a></div>
 <p class="assessment-label gallery-assessment">Each card says whether Bob was right, compared with our sealed answer list: ✓ right · ◐ partly right · ✗ wrong.</p>
 <div class="finding-gallery">${report.findings.map(f=>{const [vt,vc]=verdictFor(f);return `<article class="finding-card"><button class="finding-card-title" data-finding="${esc(f.id)}" aria-label="Open ${esc(problemNo(f))}"><span>${esc(plainFinding(f))}</span><b aria-hidden="true">↗</b></button><div class="finding-card-meta"><span>${esc(problemNo(f))} · ${esc(linesText(f))}</span><span class="verdict ${vc}">${esc(vt)}</span></div><div class="finding-card-top"><span class="rule-plain">${esc(ruleLabel(f.rule))}</span></div><details class="finding-code"><summary>Show the code <span aria-hidden="true">＋</span></summary><pre>${esc(f.evidence)}</pre></details></article>`;}).join('')}</div></div>`;
 programDialog.querySelector('.program-dialog-close').onclick=()=>programDialog.close();
 programDialog.querySelectorAll('[data-finding]').forEach(b=>b.onclick=()=>{
  selected=b.dataset.finding;activeTab='source';location.hash='#findings';programDialog.close();paintWorkspace();
  $('page-title').setAttribute('tabindex','-1');$('page-title').focus();
 });
 programDialog.querySelector('a[href="#findings"]').onclick=()=>{location.hash='#findings';programDialog.close();};
 document.body.classList.add('program-dialog-open');
 programDialog.showModal();
 programDialog.scrollTop=0;
 $('program-dialog-title').focus({preventScroll:true});
}
window.addEventListener('hashchange',()=>{if(programDialog.open&&location.hash!=='#overview')programDialog.close();});

function paintWorkspace(){
 const page=['overview','findings','evidence'].includes(location.hash.slice(1))?location.hash.slice(1):'overview';
 document.querySelectorAll('[data-page]').forEach(a=>{if(a.dataset.page===page)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 $('overview-view').hidden=page!=='overview';$('atlas-view').hidden=page!=='evidence';
 ['findings','evidence','guide'].forEach(v=>$(v+'-view').classList.toggle('hidden',v!=='findings'||page!=='findings'));
 document.querySelector('.report-stats').classList.toggle('hidden',page!=='findings');
 $('page-title').textContent={overview:'Can IBM Bob review old SAP code?',findings:'See exactly what Bob found.',evidence:'What we did, and what we did not.'}[page];
 $('page-subtitle').textContent={overview:'We tested Bob like an exam, with the answers written down in advance. Here are the results.',findings:`Bob flagged ${report.findings.length} places in this program. Click a highlighted line to see the code, Bob’s reason, and whether Bob was right.`,evidence:'Each program went through four steps. A dashed box means the step is not done, so we make no claim about it.'}[page];
 const findingsArt=['overview','findings','evidence'].includes(page)&&window.CLEAN_CORE_DEMO_CONFIG?.SHOW_MASCOT===true;
 document.querySelector('.intro').classList.toggle('findings-hero',findingsArt);
 document.querySelector('.intro').classList.toggle('dossier-hero',page==='overview');
 document.querySelector('.hero-dossier').hidden=page!=='overview';
 document.querySelector('.intro').classList.toggle('code-hero',page==='findings');
 const stage=$('findings-hero-stage');stage.hidden=page!=='findings';
 if(page==='findings'){
 const f=report.findings[0];
 const heroSource=recordedForCurrent()?.source;
 const excerpt=f?(heroSource?heroSource.split('\n').slice(f.line_start-1,Math.min(f.line_start+2,f.line_end)):f.evidence.split('\n').filter(Boolean).slice(0,3)):[];
 stage.innerHTML=f?`<div class="hero-code-callout"><code>${esc(excerpt[0].trim())}</code><p>${esc(plainFinding(f))}</p></div>${window.CLEAN_CORE_DEMO_CONFIG?.SHOW_MASCOT===true?'<img src="assets/bob-seated-findings.png" alt="Bob sitting beside a recorded code finding" class="code-hero-bob">':''}<div class="hero-code-ribbon"><div class="hero-code-label">Code excerpt · ${esc(linesText(f))} · full source below</div><div class="hero-code-lines">${excerpt.map((line,i)=>`<div class="hero-code-line ${i===0?'flagged':''}"><span aria-hidden="true">${heroSource?f.line_start+i:(i===0?'›':'·')}</span><code>${esc(line)}</code></div>`).join('')}</div></div>`:'<p>No findings in this report.</p>';
 }
 $('program-name').textContent=programTitles[report.program]||report.program;
 const heroMascot=document.querySelector('.intro [data-mascot]');
 if(heroMascot){heroMascot.src=findingsArt?(page==='evidence'?'assets/bob-evidence-case.png':`assets/bob-${page}.png`):'assets/ibm-bob.webp';heroMascot.alt=findingsArt?{overview:'Bob holding the four program folders reviewed in this study',evidence:'Bob sorting completed, partial and missing evidence into an open case',findings:'Bob pointing to a flagged line in a code panel'}[page]:'IBM Bob';}
 $('breadcrumb-current').textContent=page;
 const recorded=!!recordedForCurrent();$('notice-label').textContent=recorded?'SAVED RESULTS':isDesign?'DESIGN EXAMPLE':'YOUR UPLOAD';$('notice-copy').textContent=recorded?'These are Bob’s answers from the hackathon runs, shown unchanged. Our judgements are kept separately.':isDesign?'Made-up findings that show how the page works. Bob did not produce them.':'Shown as found in your file. Nothing in it has been checked by us.';
 if(page==='overview')paintOverview();
 if(page==='findings')renderList();
 if(page==='evidence')paintAtlas();
}
// Keep existing import, filters, review and export handlers; repaint their new surroundings.
const oldNavigate=navigate;
navigate=function(view){oldNavigate(view);if(view==='evidence')location.hash='#evidence';paintWorkspace();};
window.addEventListener('hashchange',paintWorkspace);
async function loadRecordedAudits(){try{
 const response=await fetch('data/recorded-audits.json?v=confirmed-20260926');if(!response.ok)throw Error('Recorded reports unavailable');
 recordedAudits=await response.json();saveActiveReport();
 for(const item of recordedAudits){const r=validate(JSON.parse(item.raw));const key='recorded-'+r.program;if(!loadedReports.has(key))loadedReports.set(key,{report:r,rawText:item.raw,reviews:new Map(),missed:[],isDesign:false,selected:r.findings[0]?.id??null});}
 // Do not replace any report the user imported while the fixture was loading.
 if(activeReportKey==='design')switchReport('recorded-'+JSON.parse(recordedAudits[0].raw).program);
 renderReportPicker();paintWorkspace();
 }catch(e){notify(e.message);paintWorkspace();}}
function paintAtlas(){
 const heads=['Program','1 · Bob read it','2 · We checked Bob’s answers','3 · Bob rewrote it','4 · Tried on real SAP'];
 const of=v=>String(v).replace(' / ',' of ');
 const github='https://github.com/kosesena/clean-core-copilot';
 const evidenceLink=(href,style,title,body)=>`<a class="${style} atlas-link" href="${href}" ${href.startsWith('https:')?'target="_blank" rel="noopener noreferrer"':''} aria-label="${esc(title)}">${body}<span class="atlas-link-arrow" aria-hidden="true">↗</span></a>`;
 $('atlas-view').innerHTML=`<p class="program-naming-guide"><strong>Four sample programs, four steps.</strong> Click a completed step to open its evidence. Code names begin with <code>Z</code> for custom code; hover or focus a code name to learn its meaning.</p><div class="table-scroll atlas-table-wrap"><table class="atlas-table"><thead><tr>${heads.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${recordedAudits.map((x,i)=>{
 const r=JSON.parse(x.raw),slug=r.program.toLowerCase(),title=programTitles[r.program]||r.program;
 return `<tr><th scope="row"><strong class="atlas-program-title">${esc(title)}</strong><span class="atlas-name-help" tabindex="0" aria-label="${esc(r.program+': '+programNameNotes[r.program])}"><span class="technical-name">${esc(r.program)} ⓘ</span><span class="atlas-name-tooltip" role="tooltip">${esc(programNameNotes[r.program]||'Custom sample program')}</span></span></th>
 <td data-step="1 · Bob read it"><a class="atlas-record atlas-link" href="#findings" data-atlas-program="${esc(r.program)}" aria-label="See Bob’s findings for ${esc(title)}">Read the findings<small>${x.coins.toFixed(3)} Bobcoin</small><span class="atlas-link-arrow" aria-hidden="true">↗</span></a></td>
 <td data-step="2 · We checked Bob’s answers">${evidenceLink(`${github}/blob/main/docs/scoring/${slug}.md`,'atlas-review',`Open scoring for ${title}`,`Rule problems: ${esc(of(x.core))}<small>Logic bugs: ${esc(of(x.bonus))}</small>`)}</td>
 <td data-step="3 · Bob rewrote it">${evidenceLink(i===0?'before-after.html':`${github}/tree/main/modernized/${slug}`,'atlas-review',`Open rewritten code for ${title}`,`New code written<small>${i===0?'Reviewed and revised':'Review still open'}</small>`)}</td>
 <td data-step="4 · Tried on real SAP">${i===0?evidenceLink(`${github}/blob/main/docs/activation/README.md`,'atlas-review',`Open SAP trial evidence for ${title}`,'Free SAP trial<small>View failed: 2 candidates<br>Class OK · 7/7 tests with stand-ins</small>'):'<div class="atlas-empty">Not done</div>'}</td></tr>`;
 }).join('')}</tbody></table></div>
 <p class="caption">For the last three programs, step 3 ran as one job: three Bob helpers worked side by side and wrote 13 files in 16 minutes for 1.76 Bobcoin. Nobody has reviewed or run those files yet. Tests that are written are not tests that passed.</p>
 <div class="atlas-panels"><section class="panel atlas-current"><div class="eyebrow">The report you are viewing</div><h2>${esc(programTitles[report.program]||'Your uploaded program')}</h2><code class="atlas-program-id">${esc(report.program)}</code><p>${esc(programPlain[report.program]||'This is the program named in your report')}. Bob flagged <strong>${report.findings.length} possible problems</strong> in its code.</p><label for="atlas-program-picker">Choose a different report</label><select id="atlas-program-picker" aria-describedby="atlas-selection-help">${[...loadedReports].filter(([k,v])=>k.startsWith('recorded-')||!v.isDesign||k===activeReportKey).map(([k,v])=>`<option value="${esc(k)}" ${k===activeReportKey?'selected':''}>${esc(programTitles[v.report.program]||v.report.program)}${k.startsWith('recorded-')?'':' · Your upload'}</option>`).join('')}</select><p class="caption" id="atlas-selection-help">This choice also sets the report shown on Overview and Findings. The table above always compares all four programs.</p><a href="#findings">Explore these ${report.findings.length} findings →</a></section><section class="panel"><div class="eyebrow">What remains for this program</div><h2>${report.program==='ZFI_VENDOR_AGING'&&recordedForCurrent()?'Real SAP data access still needs testing':'The new code still needs testing'}</h2><p>${report.program==='ZFI_VENDOR_AGING'&&recordedForCurrent()?'The original data view could not start on the SAP trial because two required SAP data sources are missing. The class compiled and its seven unit tests passed using stand-in tables. Those tests cover specific code behaviours; they do not verify access to real SAP data.':recordedForCurrent()?'Bob wrote a replacement for this program, but it has not yet been reviewed or run on SAP. Finding problems in the old code and proving the replacement works are separate steps.':'We have not checked this uploaded report or run its code on SAP. Any claims in the file still need supporting evidence.'}</p>${report.program==='ZFI_VENDOR_AGING'?'<a href="before-after.html">See this program’s before / after case →</a>':'<a href="before-after.html">See the separate supplier-invoice case →</a>'}</section></div>
 <p class="caption">Solid boxes: done and recorded. Dashed boxes: not done, so we make no claim. Trial record: docs/activation/README.md.</p>
 <section class="panel atlas-origin"><h2>About this report</h2><div id="atlas-origin-rows"></div></section>`;
 $('atlas-view').querySelectorAll('[data-atlas-program]').forEach(a=>a.onclick=()=>{switchReport('recorded-'+a.dataset.atlasProgram);location.hash='#findings';paintWorkspace();});
 $('atlas-program-picker').onchange=e=>{switchReport(e.target.value);paintWorkspace();};
 renderEvidence();$('atlas-origin-rows').innerHTML=$('evidence-rows').innerHTML;
 const rv=document.createElement('section');rv.className='panel for-reviewers';rv.innerHTML='<div class="eyebrow">For reviewers</div><h2>Bring your own Bob report</h2><p>Upload a findings file in this project\'s format to browse it here, and download your verdicts as a separate file. Nothing leaves your browser.</p>';rv.append(document.querySelector('.actions'));$('atlas-view').append(rv);
}
renderEvidence=function(){const recorded=!!recordedForCurrent();const rows=[['Program',report.program+(programPlain[report.program]?' · '+programPlain[report.program]:'')],['Code file',report.source_file],['Who wrote the findings',recorded?'IBM Bob, in our “Clean Core Architect” mode':isDesign?'Nobody: a made-up example':'Taken from your uploaded file'],['Rule list Bob used',report.provenance.catalogue_version],['Checked by people?',recorded?'Yes. Claude scored it and Sena confirmed it on 26 Sep':'Not by us'],['Tried on a real SAP system?',report.program==='ZFI_VENDOR_AGING'&&recorded?'Partly, on a free trial system: 7 tests passed with stand-in tables (see step 4 above)':'No'],['Bob’s original answer','Kept unchanged. Our judgements are stored separately']];$('evidence-rows').innerHTML=rows.map(([a,b])=>`<div class="evidence-row"><span>${esc(a)}</span><span>${esc(b)}</span></div>`).join('');};
const dossierPrograms=document.createElement('aside');dossierPrograms.className='dossier-programs';document.querySelector('.review-grid').prepend(dossierPrograms);
let wrapSource=false;
const sourcePanel=document.querySelector('[aria-label="Findings list"]');
sourcePanel.classList.add('source-panel');
const codeTools=document.createElement('div');codeTools.className='code-tools';
codeTools.innerHTML='<span>ABAP <small>Original source</small></span><div><button type="button" id="jump-source">Go to selected line ↓</button><button type="button" id="wrap-source" aria-pressed="false">Wrap lines</button><button type="button" id="expand-source" aria-pressed="false">Expand code ↗</button></div>';
sourcePanel.querySelector('.list-heading').after(codeTools);
$('wrap-source').onclick=()=>{wrapSource=!wrapSource;sourcePanel.classList.toggle('wrap-source',wrapSource);$('wrap-source').setAttribute('aria-pressed',String(wrapSource));};
$('expand-source').onclick=()=>{const expanded=document.querySelector('.review-grid').classList.toggle('code-expanded');$('expand-source').setAttribute('aria-pressed',String(expanded));$('expand-source').textContent=expanded?'Restore layout ↙':'Expand code ↗';};
$('jump-source').onclick=()=>{const line=$('finding-list').querySelector('.selected-line');if(line)line.scrollIntoView({block:'center',behavior:'instant'});};
let renderedSourceProgram=null;
renderList=function(){
 const oldDocument=$('finding-list').querySelector('.source-document');
 const oldPosition=renderedSourceProgram===report.program&&oldDocument?{top:oldDocument.scrollTop,left:oldDocument.scrollLeft}:null;
 renderedSourceProgram=report.program;
 dossierPrograms.innerHTML=programButtons()+`<p class="caption">Across all four programs Bob caught 27 of 29 rule problems and 1 of 12 logic bugs.</p>`;bindPrograms(dossierPrograms);
 const query=$('search').value.toLowerCase(),status=$('filter').value;
 const findings=report.findings.filter(f=>(status==='all'||f.verification_status===status)&&[f.id,f.rule,f.reason,f.evidence].join(' ').toLowerCase().includes(query));
 const current=recordedForCurrent();document.querySelector('.list-heading').textContent='The program’s code · '+report.source_file;
 $('finding-list').innerHTML=current?`<div class="source-document">${current.source.split('\n').map((line,i)=>{const matches=findings.filter(f=>i+1>=f.line_start&&i+1<=f.line_end);const start=matches.filter(f=>f.line_start===i+1);const level=matches.some(f=>f.level_hint==='D')?'level-d':matches.some(f=>f.level_hint==='C')?'level-c':'level-other';return `<div class="source-row ${matches.length?level:''} ${matches.some(f=>f.id===selected)?'selected-line':''}"><span class="source-number">${i+1}</span><code>${esc(line)||' '}</code><span>${start.map(f=>`<button class="source-pill" data-id="${esc(f.id)}" title="${esc(ruleLabel(f.rule))}">${esc(problemNo(f))} ${esc(verdictFor(f)[0].slice(0,1))}</button>`).join('')}</span></div>`;}).join('')}</div><p class="caption source-legend">Highlighted lines are the places Bob flagged. Red: Bob rates it the riskiest kind, such as writing straight into SAP tables. Green: it uses SAP internals that need a supported replacement. Click a label to open that problem.</p>`:findings.map(f=>`<button class="finding ${f.id===selected?'selected':''}" data-id="${esc(f.id)}"><strong>${esc(plainFinding(f))}</strong><p>${esc(problemNo(f))} · ${esc(ruleLabel(f.rule))}</p><span>${esc(linesText(f))}</span></button>`).join('');
 $('list-count').textContent=`${findings.length} problems shown`;
 const newDocument=$('finding-list').querySelector('.source-document');if(oldPosition&&newDocument){newDocument.scrollTop=oldPosition.top;newDocument.scrollLeft=oldPosition.left;}
 $('finding-list').querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>{selected=b.dataset.id;renderList();});renderDetail();
};
renderDetail=function(){const f=report.findings.find(x=>x.id===selected);if(!f){$('detail').innerHTML='<p class="empty">Click a highlighted line to see a problem.</p>';return;}
 const [vt,vc,vx]=verdictFor(f);const recorded=!!recordedForCurrent();
 const meaning=f.level_hint==='D'?'The cloud version will not run this at all; there is no supported way to keep it.':f.level_hint==='C'?'This uses SAP internals; it needs a supported replacement before the program can move.':f.rule==='Unclassified'?'No catalogue rule covers this; Bob flagged it as something a person should look at.':'Outdated syntax the cloud language version rejects.';
 const evLines=f.evidence.split('\n');const short=evLines.slice(0,8).join('\n');const more=evLines.length>8;
 $('detail').innerHTML=`<div class="detail-head">${recorded?`<span class="verdict big ${vc}">${esc(vt)}</span>`:''}<h2>${esc(plainFinding(f))}</h2><p class="detail-meaning">${esc(meaning)}</p><span class="rule">${esc(problemNo(f))} · ${esc(linesText(f))} · ${esc(ruleLabel(f.rule))}</span></div><div class="detail-body"><h3 class="subhead">The code Bob pointed at</h3><pre class="code-dark${more?' code-clip':''}" id="detail-code">${esc(short)}</pre>${more?`<button type="button" class="btn code-more" id="detail-code-more">Show all ${evLines.length} lines</button>`:''}${recorded?`<section class="assessment-box"><h3 class="subhead">Was Bob right?</h3><p>${esc(vx)}</p><small>Checked by Claude against the sealed answer list, confirmed by Sena on 26 Sep.</small></section>`:''}<details class="bobs-words"><summary>Bob’s words: why it flagged this, and what it suggests</summary><h3 class="subhead">Why Bob flagged it</h3><p class="body-copy">${esc(f.reason)}</p><h3 class="subhead">What Bob suggests instead</h3><p class="caption">A suggestion only. It has not been run on SAP.</p><pre class="code-dark">${esc(f.suggested_action)}</pre><h3 class="subhead">What Bob said it could not know</h3><ul class="unknown-list">${f.unknowns.length?f.unknowns.map(x=>`<li>${esc(x)}</li>`).join(''):'<li>Bob listed nothing here.</li>'}</ul></details><label for="review-decision" class="subhead">Your own verdict (optional)</label><select id="review-decision" class="review-select" aria-label="Your verdict"><option value="not_reviewed">Not decided</option><option value="correct">Bob was right</option><option value="incorrect">Bob was wrong</option><option value="partially_correct">Partly right</option></select><p class="caption">Your choice stays in this browser. It never changes Bob’s original answer.</p></div>`;
 const mb=$('detail-code-more');if(mb){mb.onclick=()=>{$('detail-code').textContent=f.evidence;$('detail-code').classList.remove('code-clip');mb.remove();};}
 if(f.source_url){try{const u=new URL(f.source_url);if(['https:','http:'].includes(u.protocol)){const a=document.createElement('a');a.href=u.href;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Open the source Bob cited ↗';a.className='small-link';$('detail').querySelector('.detail-body').append(a);}}catch{}}
 $('review-decision').value=reviewOf(f);$('review-decision').onchange=e=>{reviews.set(f.id,e.target.value);renderStats();notify('Your verdict is saved in this browser tab. Use Export to keep it.');};
};

document.querySelectorAll('[data-mascot]').forEach(img=>{if(window.CLEAN_CORE_DEMO_CONFIG?.SHOW_MASCOT===true){img.src=img.dataset.mascotSrc||'assets/ibm-bob.webp';img.hidden=false;img.closest('.mascot-slot')?.classList.add('has-mascot');}});
// Retain review work across the site's two HTML documents in this tab only.
try{const saved=JSON.parse(sessionStorage.getItem('ccc-workspace-v1')||'null');if(saved){
 const restored=saved.entries.map(([key,state])=>{validate(state.report);if(JSON.stringify(JSON.parse(state.rawText))!==JSON.stringify(state.report))throw Error('Saved raw report mismatch');if(!Array.isArray(state.reviews)||!Array.isArray(state.missed)||!state.missed.every(x=>typeof x==='string'))throw Error('Invalid saved review');for(const [id,v] of state.reviews)if(!state.report.findings.some(f=>f.id===id)||!['not_reviewed','correct','incorrect','partially_correct'].includes(v))throw Error('Invalid saved decision');return [key,{...state,reviews:new Map(state.reviews)}];});
 for(const [key,state] of restored)loadedReports.set(key,state);reportSequence=saved.sequence||0;if(loadedReports.has(saved.active)){activeReportKey=saved.active;({report,rawText,reviews,missed,isDesign,selected}=loadedReports.get(saved.active));renderStats();renderMissed();renderReportPicker();}
}}catch{notify('Saved workspace could not be restored. Import an exported review bundle to recover it.');}
window.addEventListener('pagehide',()=>{try{saveActiveReport();sessionStorage.setItem('ccc-workspace-v1',JSON.stringify({active:activeReportKey,sequence:reportSequence,entries:[...loadedReports].map(([k,s])=>[k,{...s,reviews:[...s.reviews]}])}));}catch{/* Exports remain the durable save path when browser storage is unavailable. */}});
$('search').addEventListener('input',()=>renderList());$('filter').addEventListener('change',()=>renderList());
const originalPicker=renderReportPicker;renderReportPicker=function(){originalPicker();paintWorkspace();};
paintWorkspace();loadRecordedAudits();
