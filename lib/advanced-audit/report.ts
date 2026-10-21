import { AUDIT_CONTENT_VERSION, ADVANCED_AUDIT_QUESTIONS } from "./questions";
import type { AdvancedAuditAnswers } from "./types";
import { computeAdvancedAudit, DIMENSIONS, DIMENSION_NAMES } from "./scoring";
import { buildAdvancedAuditRoadmap } from "./roadmap";

const round1=(value:number)=>Math.round((value+Number.EPSILON)*10)/10;

const categoryFamily: Record<number,string> = {1:"FIN",2:"HR",3:"CS",4:"MFG",5:"LOG",6:"QC",7:"IT",8:"SAL",9:"PRJ",10:"HC",11:"GEN"};
const familyKpis: Record<string,string[]> = {
  FIN:["Touchless / straight-through rate","First-time match rate","On-time payment or days-to-close"], HR:["Time-to-hire / time-to-complete request","Day-one readiness","Request first-contact resolution"],
  CS:["First contact resolution","SLA attainment","Customer satisfaction (CSAT) per resolved case"], MFG:["OEE","Scrap & rework rate","Changeover time / schedule attainment"],
  LOG:["OTIF","Order / pick accuracy","Dock-to-stock or order-to-ship time"], QC:["CAPA on-time closure rate","Repeat findings rate","Time to close a nonconformance"],
  IT:["Mean time to resolve (MTTR)","Reopen rate / first-time fix","Change failure rate"], SAL:["Lead / quote response time","Quote-to-order conversion rate","Pipeline hygiene"],
  PRJ:["On-time milestone rate","Defect escape rate","Lead time for change requests"], HC:["Patient / request wait time","Claim denial or rejection rate","Documentation completeness at first submission"],
  GEN:["Straight-through rate","SLA attainment","Touch time per case"],
};
const coreKpis = [
  {name:"End-to-end lead time",definition:"Elapsed time from trigger/request to completion",formula:"Median and 85th percentile of completion minus start",why:"The customer's experience; averages hide the painful tail."},
  {name:"First pass yield (FPY)",definition:"Share of cases completed without rework or send-back",formula:"Cases with zero rework divided by total cases",why:"A direct indicator of process quality."},
  {name:"Throughput",definition:"Cases completed per period",formula:"Count completed per week",why:"Shows the balance between capacity and demand."},
  {name:"Backlog age",definition:"Age of open cases",formula:"Share of open cases older than the target lead time",why:"A leading indicator of future delays."},
];
const label = (id: string, value: string | number, locale: "en"|"hu") => {
  const q = ADVANCED_AUDIT_QUESTIONS.find(item => item.id === id);
  if (!q) return String(value);
  if (q.kind === "text") return String(value);
  const option = q.options.find(item => item.code === value);
  return option ? (locale === "hu" ? option.labelHu : option.label) : String(value);
};

function painTheme(text: string) {
  const lower = text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu," ");
  const stems: [string,string,string[]][] = [
    ["SPEED","FLW",["slow","delay","wait","late","backlog","bottleneck","queue","turnaround","lead time","stuck","approv","chas","pending","overdue"]],
    ["QUALITY","QUA",["error","mistak","wrong","rework","defect","complain","quality","incorrect","miss","redo","return","fix","inaccura"]],
    ["DATA","DAT",["manual","excel","spreadsheet","copy","re ent","retyp","paste","data entry","email","paper","duplicat","system","tool","integrat"]],
    ["OWNERSHIP","GOV",["nobody","no one","owner","responsib","accountab","unclear","blame","silo","who does","align","escalat","decision"]],
    ["STANDARD","STD",["different","inconsisten","depends on","own way","knowledge","training","onboard","document","sop","key person","leav","expert","depend"]],
    ["VISIBILITY","MEA",["visib","report","kpi","metric","don t know","track","transparen","measur","dashboard","status"]],
    ["CAPACITY","CUL",["overload","workload","capacity","burnout","firefight","resist","motivat","no time","staff","turnover","morale"]],
    ["COMPLIANCE","QUA",["audit","complian","regulat","risk","control","finding","breach","penalt","fine"]],
  ];
  const matches = stems.map(([theme,dim,terms])=>({theme,dim,count:terms.reduce((n,term)=>n+(lower.includes(term)?1:0),0)})).filter(x=>x.count>0).sort((a,b)=>b.count-a.count);
  return matches;
}

/** Build one deterministic snapshot; the result is stored and all later views/downloads use it. */
export function buildAdvancedAuditReport(answers: AdvancedAuditAnswers, metadata: { submissionId:string; createdAt:Date; completedAt?:Date; locale?:"en"|"hu" }) {
  const locale = metadata.locale ?? "en";
  const calculated = computeAdvancedAudit(answers);
  const profile = Object.fromEntries(["P1_process","P2_category","P3_volume","P4_effort","P5_people","P6_systems","P7_criticality","P8_goal","P9_role","P10_pain","P11_tried"].flatMap(id => answers[id] === undefined ? [] : [[id,{code:answers[id],label:label(id,answers[id],locale)}]]));
  const dimensionRows = DIMENSIONS.map(id => ({ id, name:DIMENSION_NAMES[id], score:calculated.scores.dimensions[id], band:calculated.scores.dimensions[id]<40?"Critical":calculated.scores.dimensions[id]<60?"Developing":calculated.scores.dimensions[id]<80?"Established":"Leading" }));
  const family=categoryFamily[Number(answers.P2_category)]??"GEN";
  const startHere = calculated.scores.dimensions.MEA < 60 ? "core" : "family";
  const kpis = [...coreKpis.map(k=>({...k,priority:startHere==="core"?"Start here":"Monitor"})),...(familyKpis[family]??familyKpis.GEN).map(name=>({name,definition:"Define the operational start, end, and eligible case population before collecting the measure.",formula:"Use a consistent numerator, denominator, period, and source",why:"Selected for this process category.",priority:startHere==="family"?"Start here":"Monitor"}))];
  const goal=Number(answers.P8_goal);
  const goalFirst = goal===3?"First pass yield (FPY)":goal===2?"End-to-end lead time":goal===4?"Throughput":undefined;
  if(goalFirst) kpis.sort((a,b)=>Number(b.name===goalFirst)-Number(a.name===goalFirst));
  const themes=painTheme(String(answers.P10_pain??""));
  const roadmap=buildAdvancedAuditRoadmap(answers,calculated);
  const projectionTargets:Record<string,string[]>={
    "ACT-GOV-01":["A1"],"ACT-GOV-02":["A2"],"ACT-GOV-03":["A3"],"ACT-STD-01":["B1","B2"],"ACT-STD-02":["B1","B2"],"ACT-STD-03":["B3","B4"],
    "ACT-MEA-01":["C1"],"ACT-MEA-02":["C2"],"ACT-MEA-03":["C3","F2"],"ACT-FLW-01":["D1","D2"],"ACT-FLW-03":["D4"],"ACT-FLW-04":["D3","E2"],
    "ACT-QUA-03":["E3"],"ACT-DAT-01":["F1"],"ACT-DAT-02":["F2"],"ACT-DAT-03":["F3"],"ACT-CUL-01":["H1"],"ACT-CUL-04":["H4"],"ACT-AUT-01":["G1","G3","G4"],
  };
  const projectedAnswers={...answers};
  for(const action of [...roadmap.roadmap_30,...roadmap.roadmap_60,...roadmap.roadmap_90]){
    for(const id of projectionTargets[action.id]??[]){
      if(typeof projectedAnswers[id]!=="number")continue;
      const question=ADVANCED_AUDIT_QUESTIONS.find(item=>item.id===id);
      const current=question?.kind==="choice"?question.options.find(option=>option.code===projectedAnswers[id])?.score??0:0;
      projectedAnswers[id]=Math.max(current,Math.min(current+2,3));
    }
  }
  const projected=computeAdvancedAudit(projectedAnswers);
  const showProjection=projected.scores.PMI_raw-calculated.scores.PMI_raw>=5;
  const hours=calculated.automation.workload_hours;
  const workloadRounded=hours<100?Math.round(hours/5)*5:hours<1000?Math.round(hours/10)*10:Math.round(hours/50)*50;
  const answersAppendix=ADVANCED_AUDIT_QUESTIONS.map(q=>({id:q.id,section:q.section,question:locale==="hu"?q.promptHu:q.prompt,response_code:q.kind==="choice"?answers[q.id]??null:null,answer_text:q.kind==="text"?answers[q.id]??null:null,selected_label:q.kind==="choice"&&answers[q.id]!==undefined?label(q.id,answers[q.id],locale):null,points:q.kind==="choice"&&q.scored?q.options.find(o=>o.code===answers[q.id])?.score??0:null,dont_know:q.kind==="choice"&&q.options.some(o=>o.code===answers[q.id]&&o.dontKnow)}));
  const date=metadata.completedAt??new Date();
  const shortId=metadata.submissionId.replace(/-/g,"").slice(-5).toUpperCase();
  return {
    product:"Process Excellence Snapshot", displayName:"Advanced audit", model_version:AUDIT_CONTENT_VERSION, report_id:`PES-${date.toISOString().slice(0,10).replace(/-/g,"")}-${shortId}`,
    submission_id:metadata.submissionId, submitted_at:date.toISOString(), started_at:metadata.createdAt.toISOString(), locale,
    profile, scores:calculated.scores, dimension_rows:dimensionRows, automation:{...calculated.automation,workload_hours:workloadRounded,workload_fte:round1(workloadRounded/140)}, waste:calculated.waste,
    waste_top3:calculated.waste_top3, gates:calculated.gates, findings:calculated.findings, confidence:calculated.confidence,
    priorities:calculated.priorities, top3_dims:calculated.top3_dims, pathways:calculated.pathways, pathways_later:calculated.pathways_later,
    kpi_family:family, kpis, pain_themes:themes, answer_points:calculated.answer_points, answers:answersAppendix,
    ...roadmap,
    projection:{show:showProjection,PMI_now:calculated.scores.PMI_raw,PMI_projected:projected.scores.PMI_raw,level_now:calculated.scores.level_final,level_projected:projected.scores.level_final,level_projected_name:projected.scores.level_name,dimensions_now:calculated.scores.dimensions,dimensions_projected:projected.scores.dimensions,ARI_projected:projected.automation.ARI,AOS_projected:projected.automation.AOS,quadrant_projected:projected.automation.quadrant,note:showProjection?"Projection assumes every action reaches its done-when criterion; it is a target, not a guarantee.":"Your process is already strong. The remaining gains come from the beyond-90-day actions."},
    method:{ model_version:AUDIT_CONTENT_VERSION, maturity_dimension_weights:{...({GOV:.15,STD:.20,MEA:.15,FLW:.15,QUA:.15,DAT:.10,CUL:.10})}, money_estimates:false, evidence_verified:false, inventory_and_overproduction_assessed:false },
    limitations:["This is a single-respondent self-assessment; answers have not been independently verified.","Workload figures are order-of-magnitude estimates from banded answers, not financial savings.","The assessment covers six Lean waste categories; inventory and overproduction are not assessed."],
  };
}
