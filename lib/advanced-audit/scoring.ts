import type { AdvancedAuditAnswers } from "./types";
import { ADVANCED_AUDIT_QUESTIONS, type AuditQuestion } from "./questions";

export const DIMENSIONS = ["GOV", "STD", "MEA", "FLW", "QUA", "DAT", "CUL"] as const;
export type Dimension = typeof DIMENSIONS[number];
export const DIMENSION_NAMES: Record<Dimension, string> = {
  GOV: "Ownership & Governance", STD: "Standardisation & Documentation", MEA: "Measurement & Reporting",
  FLW: "Flow & Waste", QUA: "Quality & Control", DAT: "Data & Systems", CUL: "People & Improvement Culture",
};
const weights: Record<Dimension, number> = { GOV: .15, STD: .20, MEA: .15, FLW: .15, QUA: .15, DAT: .10, CUL: .10 };
const areaItems: Record<Dimension, string[]> = {
  GOV: ["A1", "A2", "A3", "A4"], STD: ["B1", "B2", "B3", "B4"], MEA: ["C1", "C2", "C3", "C4"],
  FLW: ["D1", "D2", "D3", "D4"], QUA: ["E1", "E2", "E3", "E4"], DAT: ["F1", "F2", "F3", "F4"], CUL: ["H1", "H2", "H3", "H4"],
};
const questionById = new Map<string, AuditQuestion>(ADVANCED_AUDIT_QUESTIONS.map(q => [q.id, q]));
const get = (a: AdvancedAuditAnswers, id: string): number => {
  if (typeof a[id] !== "number") return 0;
  const question = questionById.get(id);
  return question?.kind === "choice" && question.scored ? scoreFor(question, a[id]) : a[id] as number;
};
const isDK = (a: AdvancedAuditAnswers, id: string) => {
  const q = questionById.get(id);
  return typeof a[id] === "number" && q?.kind === "choice" && q.options.some(option => option.code === a[id] && option.dontKnow);
};
const scoreFor = (q: AuditQuestion, value: AdvancedAuditAnswers[string] | undefined) => {
  if (typeof value !== "number" || q.kind !== "choice") return 0;
  return q.options.find(o => o.code === value)?.score ?? 0;
};
const round1 = (n: number) => Math.round((n + Number.EPSILON) * 10) / 10;
const levelFor = (score: number) => score < 25 ? 1 : score < 45 ? 2 : score < 65 ? 3 : score < 85 ? 4 : 5;
const levelNames: Record<number, string> = { 1: "Initial", 2: "Reactive", 3: "Defined", 4: "Managed", 5: "Optimising" };

export function computeAdvancedAudit(answers: AdvancedAuditAnswers) {
  const byId = questionById;
  const points = Object.fromEntries([...byId].filter(([id]) => /^[A-H]\d$/.test(id)).map(([id, q]) => [id, scoreFor(q, answers[id])]));
  const dimensionScores = Object.fromEntries(DIMENSIONS.map(dim => [dim, round1(areaItems[dim].reduce((sum, id) => sum + (points[id] ?? 0), 0) / 16 * 100)])) as Record<Dimension, number>;
  const autoScore = round1(["G1", "G2", "G3", "G4", "G5"].reduce((s, id) => s + (points[id] ?? 0), 0) / 20 * 100);
  const pmi = round1(DIMENSIONS.reduce((s, dim) => s + dimensionScores[dim] * weights[dim], 0));
  const redFlags = [
    ["RF6", "Control & compliance exposure", get(answers, "P7_criticality") >= 4 && (get(answers,"B1") <= 1 || get(answers,"A2") <= 1 || get(answers,"E3") <= 1)],
    ["RF1", "Single point of failure", get(answers,"B4") <= 1],
    ["RF4", "Quality leakage", (get(answers,"D3") <= 1) || (get(answers,"E2") === 0 && get(answers,"P7_criticality") >= 3)],
    ["RF2", "Orphan process", get(answers,"A1") <= 1],
    ["RF3", "Flying blind", get(answers,"C1") <= 1 && get(answers,"C2") <= 1],
    ["RF5", "Automation trap", dimensionScores.STD < 40 || (get(answers,"B2") <= 1 && get(answers,"G3") <= 1)],
    ["RF7", "Firefighting loop", get(answers,"H4") === 0 && (get(answers,"D3") <= 1 || get(answers,"E3") <= 1)],
    ["RF8", "Approval bottleneck", get(answers,"D4") <= 1 && get(answers,"D2") <= 2],
  ].filter((x) => x[2]) as [string,string,boolean][];
  const checks = [
    ["X1", "Documentation–reality gap", get(answers,"B1") >= 3 && get(answers,"B2") <= 1],
    ["X2", "Targets without visibility", get(answers,"C1") >= 3 && get(answers,"C2") <= 1],
    ["X3", "Review theatre", get(answers,"A3") >= 3 && get(answers,"C4") <= 1],
    ["X4", "Automation islands", get(answers,"G4") >= 3 && get(answers,"F3") <= 1],
    ["X5", "Ineffective controls", get(answers,"E2") >= 3 && !isDK(answers,"D3") && get(answers,"D3") <= 1],
    ["X6", "Hidden expertise", get(answers,"B3") >= 3 && get(answers,"B4") <= 1],
    ["X7", "Willing but no capacity", get(answers,"H2") >= 3 && get(answers,"H4") <= 1],
    ["X8", "Data without decisions", get(answers,"C3") >= 3 && get(answers,"C1") <= 1],
    ["X9", "Unverified flow claim", get(answers,"D2") >= 3 && get(answers,"C2") <= 1],
    ["X10", "Ungoverned automation", get(answers,"G4") >= 3 && get(answers,"G5") <= 1],
  ].filter(x => x[2]).map(x => ({ id: x[0], name: x[1] }));
  const dkIds = ["B2","D1","D2","D3","G3"].filter(id => isDK(answers,id));
  let finalLevel = levelFor(pmi);
  const caps: string[] = [];
  const cap = (max: number, reason: string) => { if (finalLevel > max) { finalLevel = max; caps.push(reason); } };
  if (dimensionScores.STD < 40) cap(2, "A process without standard work cannot be rated as Defined.");
  if (dimensionScores.GOV < 50) cap(3, "Managed maturity requires clear ownership and governance.");
  if (dimensionScores.MEA < 50) cap(3, "Managed maturity requires measured performance.");
  if (redFlags.some(([id]) => ["RF1","RF3","RF6"].includes(id))) cap(3, "Critical risk present (see Critical Findings).");
  if (dimensionScores.MEA < 70 || dimensionScores.CUL < 70) cap(4, "Optimising requires strong measurement and an embedded improvement culture.");

  const ari = round1((get(answers,"G1")*.2 + get(answers,"G2")*.15 + get(answers,"G3")*.15 + get(answers,"B2")*.15 + get(answers,"G5")*.15 + get(answers,"F1")*.1 + get(answers,"F2")*.1) / 4 * 100);
  const p3 = get(answers,"P3_volume"), p4 = get(answers,"P4_effort");
  const volumes: Record<number,number> = {1:10,2:100,3:500,4:4000,5:15000}, efforts: Record<number,number> = {1:3,2:15,3:60,4:240,5:600};
  const hours = round1((volumes[p3] ?? 0) * (efforts[p4] ?? 0) / 60);
  const workloadBand = hours < 20 ? "Low" : hours < 80 ? "Medium" : hours < 400 ? "High" : "Very high";
  const workloadPts = hours < 20 ? 0 : hours < 80 ? 40 : hours < 400 ? 70 : 100;
  const aos = round1(.5 * workloadPts + .25 * ((4-get(answers,"F3"))/4*100) + .25 * ((4-get(answers,"G4"))/4*100));
  const quadrant = ari >= 55 ? (aos >= 50 ? "Q1" : "Q3") : (aos >= 50 ? "Q2" : "Q4");
  const archetype = p3 >= 3 && get(answers,"G3") >= 3 && get(answers,"B2") >= 2 ? "RUNNER" : p3 === 1 || get(answers,"G3") <= 1 ? "STRANGER" : "REPEATER";
  const p6 = get(answers,"P6_systems");
  const p6pts = ({1:2,2:4,3:3,4:1,5:0} as Record<number,number>)[p6] ?? 0;
  const waste = [
    ["Waiting", "W_WAIT", [get(answers,"D2")]],
    ["Defects", "W_DEF", [get(answers,"D3"), get(answers,"E2")]],
    ["Over-processing", "W_OVP", [get(answers,"D4"), get(answers,"F4")]],
    ["Transport", "W_TRA", [get(answers,"D1"), get(answers,"F3")]],
    ["Motion", "W_MOT", [get(answers,"F2"), p6pts]],
    ["Non-utilised talent", "W_TAL", [get(answers,"H2"), get(answers,"G4")]],
  ].map(([name,id,vals]) => { const v=vals as number[]; return { name: name as string, id: id as string, score: round1(100 - v.reduce((a,b)=>a+b,0)/v.length/4*100) }; });
  const tie: Record<string,number> = { W_DEF:0,W_WAIT:1,W_TRA:2,W_OVP:3,W_TAL:4,W_MOT:5 };
  waste.sort((a,b)=>b.score-a.score || tie[a.id]-tie[b.id]);

  const autoChecks = [get(answers,"B2")>=3,get(answers,"B1")>=3,get(answers,"G2")>=2,get(answers,"G3")>=2,get(answers,"F2")>=2,get(answers,"C2")>=2,get(answers,"A1")>=3,get(answers,"G5")>=2];
  const aiChecks = [get(answers,"G5")>=3,get(answers,"F1")>=1,get(answers,"F2")>=2,get(answers,"E1")>=2||get(answers,"C1")>=2,get(answers,"A1")>=3];
  const dmaicChecks = [get(answers,"C1")>=2,get(answers,"C2")>=2,get(answers,"E1")>=2,get(answers,"A1")>=3,get(answers,"H4")>=2,get(answers,"H3")>=2];
  const dashChecks = [get(answers,"C1")>=2,get(answers,"F1")>=2,get(answers,"F2")>=2,get(answers,"C4")>=2];
  const count = (xs: boolean[]) => xs.filter(Boolean).length;
  const autoN = count(autoChecks), aiN = count(aiChecks), dmN = count(dmaicChecks), dashN = count(dashChecks);
  const gateAuto = autoN===8 ? "GO" : autoN>=6 && autoChecks[0] && autoChecks[2] && autoChecks[3] ? "CONDITIONAL" : "NO-GO";
  const gateAi = aiN===5 ? "READY" : aiN>=3 && aiChecks[1] ? "PILOT-ONLY" : "NOT-READY";
  const gateDmaic = dmN===6 ? "READY" : dmN>=4 ? "READY-WITH-SUPPORT" : "NOT-READY";
  const gateDash = dashN===4 ? "READY" : dashN>=2 ? "PARTIAL" : "NOT-READY";
  const goal = get(answers,"P8_goal");
  const goalBoost: Record<number,Partial<Record<Dimension,number>>> = {
    1:{FLW:1.5,DAT:1.25,STD:1.25},2:{FLW:1.5,GOV:1.25,MEA:1.25},3:{QUA:1.5,STD:1.25,DAT:1.25},
    4:{STD:1.5,DAT:1.25,MEA:1.25},5:{GOV:1.5,QUA:1.25,STD:1.25},6:{CUL:1.5,QUA:1.25,FLW:1.25},
  };
  const priorities = DIMENSIONS.map(dim => {
    const exactScore=areaItems[dim].reduce((sum,id)=>sum+(points[id]??0),0)/16*100;
    const priority=(100-exactScore)*weights[dim]*(goalBoost[goal]?.[dim]??1)*(["GOV","STD","MEA"].includes(dim)&&exactScore<50?1.2:1);
    return {id:dim,name:DIMENSION_NAMES[dim],score:dimensionScores[dim],priority:Math.round((priority+Number.EPSILON)*100)/100};
  });
  const tieDim: Dimension[] = ["STD","GOV","MEA","FLW","QUA","DAT","CUL"];
  priorities.sort((a,b)=>b.priority-a.priority || a.score-b.score || tieDim.indexOf(a.id)-tieDim.indexOf(b.id));

  const pathways = [
    ["PW-STD","Standardise before automating",dimensionScores.STD<50||get(answers,"B2")<=1],
    ["PW-PM","Process/task mining for discovery",get(answers,"P5_people")>=3&&p3>=3&&p6>=3&&(get(answers,"C2")<=2||isDK(answers,"D1"))],
    ["PW-WF","Workflow / BPM orchestration",get(answers,"P5_people")>=2&&(get(answers,"D1")<=2||get(answers,"F4")<=1||get(answers,"D4")<=1)],
    ["PW-INT","System integration (API / iPaaS)",get(answers,"F3")<=1&&p6>=3],
    ["PW-IDP","Intelligent document processing",[1,2].includes(get(answers,"F1"))&&p3>=2],
    ["PW-BI","Automated reporting / BI",get(answers,"C3")<=2&&get(answers,"F2")>=2],
    ["PW-GENAI","GenAI assist (human-in-the-loop)",get(answers,"G1")<=2&&get(answers,"F1")>=1],
    ["PW-RPA","RPA / UI automation as a bridge",get(answers,"F3")<=1&&get(answers,"G1")>=3&&get(answers,"G2")>=2&&p6>=3],
    ["PW-AGENT","Agentic AI (multi-step, supervised)",ari>=70&&get(answers,"G5")>=3&&get(answers,"B1")>=3&&get(answers,"C2")>=3],
  ].filter(x=>x[2]).map(x=>({id:x[0] as string,name:x[1] as string}));
  if (!pathways.length) pathways.push({id:"PW-NONE",name:"Optimise and monitor"});
  const dkCount=dkIds.length,cxCount=checks.length;
  const confidence=dkCount<=1&&cxCount===0?"High":dkCount<=3&&cxCount<=2?"Medium":"Low";
  return {
    scores: { dimensions: dimensionScores, S_AUT:autoScore, PMI_raw:pmi, level_raw:levelFor(pmi), level_final:finalLevel, level_name:levelNames[finalLevel], level_capped: finalLevel < levelFor(pmi), cap_reasons:caps },
    automation: { ARI:ari, ARI_band:ari<40?"ARI_NR":ari<55?"ARI_FN":ari<75?"ARI_RT":"ARI_RS", AOS:aos, quadrant, workload_hours:hours, workload_fte:round1(hours/140), workload_band:workloadBand, archetype },
    waste: waste.map(w=>({...w, significant:w.score>=50})), waste_top3:waste.slice(0,3),
    gates:{ auto:{result:gateAuto,passes:autoN,items:autoChecks}, ai:{result:gateAi,passes:aiN,items:aiChecks,humanInLoop:get(answers,"P7_criticality")>=4}, dmaic:{result:gateDmaic,passes:dmN,items:dmaicChecks}, dashboard:{result:gateDash,passes:dashN,items:dashChecks} },
    findings:{ redFlags:redFlags.map(([id,name])=>({id,name})), consistency:checks },
    confidence:{level:confidence,dk_count:dkCount,cx_count:cxCount,dk_ids:dkIds}, priorities, top3_dims:priorities.slice(0,3), pathways: pathways.slice(0,3), pathways_later:pathways.slice(3),
    answer_points:points,
  };
}

export function isAdvancedAuditComplete(answers: AdvancedAuditAnswers) {
  return ADVANCED_AUDIT_QUESTIONS.every(q => q.kind === "text" ? (!q.required || (typeof answers[q.id] === "string" && (answers[q.id] as string).trim().length > 0)) : q.options.some(o => o.code === answers[q.id]));
}
