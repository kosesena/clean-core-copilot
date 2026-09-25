// This viewer records supplied artifacts; it never executes Bob or SAP.
export const stages = ['before', 'after', 'bob', 'activation', 'atc', 'unit'];
export function emptyCase() {
  return {format:'clean-core-case-v1', title:'One program, one reviewable change', target:'', artifacts:{}, checks:{}};
}
export function validateCase(value) {
  const obj=v=>v!==null && typeof v==='object' && !Array.isArray(v);
  if (!obj(value) || value.format !== 'clean-core-case-v1' || typeof value.title !== 'string' || typeof value.target !== 'string' || !obj(value.artifacts) || !obj(value.checks)) throw Error('Invalid case bundle.');
  for (const [key,a] of Object.entries(value.artifacts)) {
    if (!stages.includes(key) || !a || typeof a.name !== 'string' || typeof a.text !== 'string' || a.text.length > 2000000) throw Error('Invalid artifact.');
  }
  for (const [key,c] of Object.entries(value.checks)) {
    if (!['activation','atc','unit'].includes(key) || !c || !['passed','failed','inconclusive'].includes(c.outcome) || typeof c.target !== 'string' || !/^[a-f0-9]{64}$/.test(c.source_sha256) || !/^[a-f0-9]{64}$/.test(c.record_sha256) || typeof c.recorded_at !== 'string') throw Error('Invalid check declaration.');
  }
  return value;
}
export async function digest(text) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(bytes), b=>b.toString(16).padStart(2,'0')).join('');
}
export function declarationReady(data,key) {
  return Boolean(data.target.trim() && data.artifacts.after?.text.trim() && data.artifacts[key]?.text.trim());
}
export async function checkState(data,key) {
  const artifact=data.artifacts[key], c=data.checks[key];
  if (!artifact) return 'No record';
  if (!artifact.text.trim()) return 'Empty record · attach execution output';
  if (!c) return 'Record attached · outcome not declared';
  if (!declarationReady(data,key)) return 'Incomplete evidence · declaration not accepted';
  if (!data.artifacts.after || c.source_sha256 !== await digest(data.artifacts.after.text) || c.record_sha256 !== await digest(artifact.text) || c.target !== data.target) return 'Stale declaration · review again';
  return `Reported ${c.outcome} · not independently verified`;
}
