import path from "node:path";
import { Document, Font, Page, Rect, StyleSheet, Svg, Text, View, renderToBuffer } from "@react-pdf/renderer";
import type { AdvancedAuditReport } from "../advanced-audit/types";

const font=(name:string)=>path.join(process.cwd(),"public/fonts",name);
Font.register({family:"Audit DM Sans",fonts:[{src:font("dm-sans-400.ttf"),fontWeight:400},{src:font("dm-sans-500.ttf"),fontWeight:500},{src:font("dm-sans-700.ttf"),fontWeight:700}]});
Font.register({family:"Audit Manrope",fonts:[{src:font("manrope-600.ttf"),fontWeight:600},{src:font("manrope-700.ttf"),fontWeight:700}]});
Font.registerHyphenationCallback(word=>[word]);

const C={paper:"#F5F4EE",ink:"#202B26",muted:"#536057",line:"#D8DBD1",lime:"#D5F36B",lilac:"#E7E1F3",white:"#FFFFFF"};
const s=StyleSheet.create({page:{backgroundColor:C.paper,color:C.ink,fontFamily:"Audit DM Sans",fontSize:9.5,lineHeight:1.5,padding:40,paddingBottom:56},label:{fontSize:7.5,fontWeight:500,letterSpacing:1,textTransform:"uppercase",color:"#61782D",marginBottom:5},h1:{fontFamily:"Audit Manrope",fontWeight:600,fontSize:26,lineHeight:1.2,marginBottom:9},h2:{fontFamily:"Audit Manrope",fontWeight:600,fontSize:17,marginTop:12,marginBottom:8},h3:{fontFamily:"Audit Manrope",fontWeight:700,fontSize:11,marginBottom:4},muted:{color:C.muted},card:{borderWidth:1,borderColor:C.line,borderRadius:8,padding:12,marginBottom:8,backgroundColor:C.white},row:{flexDirection:"row",gap:10},footer:{position:"absolute",top:806,left:40,right:40,flexDirection:"row",justifyContent:"space-between",fontSize:7.5,color:C.muted},small:{fontSize:8,color:C.muted}});

type Obj=Record<string,unknown>;
const obj=(value:unknown):Obj=>value&&typeof value==="object"&&!Array.isArray(value)?value as Obj:{};
const arr=(value:unknown):unknown[]=>Array.isArray(value)?value:[];
const str=(value:unknown)=>typeof value==="string"||typeof value==="number"?String(value):"—";
const num=(value:unknown)=>typeof value==="number"?value:0;

function ScoreRow({row}:{row:Obj}){
  const score=Math.max(0,Math.min(100,num(row.score)));
  return <View style={{flexDirection:"row",alignItems:"center",gap:10,paddingVertical:7,borderTopWidth:1,borderColor:C.line}} wrap={false}>
    <Text style={{width:150}}>{str(row.name)}</Text><View style={{flex:1,height:9,backgroundColor:"#E6E7E0",borderRadius:3,overflow:"hidden"}}><View style={{width:`${score}%`,height:9,backgroundColor:C.ink}}/></View><Text style={{width:36,textAlign:"right",fontWeight:700}}>{score.toFixed(1)}</Text><Text style={{width:75,textAlign:"right",fontSize:8,color:C.muted}}>{str(row.band)}</Text>
  </View>;
}

function BulletList({items}:{items:unknown}){
  return <View>{arr(items).map((item,i)=>{const entry=obj(item);return <Text key={i} style={{marginBottom:5}}>• {str(entry.name??entry.title??item)}</Text>;})}</View>;
}

export function AdvancedAuditDocument({report}:{report:AdvancedAuditReport}){
  const r=report as Obj;
  const hu=r.locale==="hu";
  const scores=obj(r.scores),automation=obj(r.automation),gates=obj(r.gates),findings=obj(r.findings),confidence=obj(r.confidence);
  const dimensions=arr(r.dimension_rows),profile=obj(r.profile),kpis=arr(r.kpis),answers=arr(r.answers),pathways=[...arr(r.pathways),...arr(r.pathways_later)];
  const process=obj(profile.P1_process),date=new Date(str(r.submitted_at));
  return <Document title={`${hu?"Folyamatfejlesztési áttekintés":"Process Excellence Snapshot"} — ${str(process.label)}`} author="Grismont" language={hu?"hu":"en"}>
    <Page size="A4" style={s.page}>
      <View style={s.footer} fixed><Text>grismont · {str(r.report_id)}</Text><Text render={({pageNumber,totalPages})=>`${pageNumber} / ${totalPages}`}/></View>
      <Text style={s.label}>Grismont · {hu?"Részletes audit":"Advanced audit"} · {hu?"Modell":"Model"} {str(r.model_version)}</Text>
      <Text style={[s.h1,{fontSize:31,marginTop:26}]}>{str(process.label)}</Text>
      <Text style={[s.muted,{fontSize:12}]}>{hu?"Folyamatfejlesztési áttekintés":"Process Excellence Snapshot"} · {Number.isNaN(date.getTime())?"":date.toLocaleDateString(hu?"hu-HU":"en-GB")}</Text>
      <View style={[s.card,{marginTop:28,backgroundColor:C.lilac,borderColor:C.lilac}]}>
        <Text style={s.label}>{hu?"Összesített érettség":"Overall maturity"}</Text><Text style={{fontFamily:"Audit Manrope",fontSize:22,fontWeight:600}}>{hu?"Szint":"Level"} {str(scores.level_final)} — {str(scores.level_name)}</Text>
        <Text style={{marginTop:4}}>{hu?"Érettség":"Maturity"} {num(scores.PMI_raw).toFixed(1)}/100 · {hu?"Automatizálási felkészültség":"Automation readiness"} {num(automation.ARI).toFixed(1)}/100 · {hu?"Lehetőség":"Opportunity"} {num(automation.AOS).toFixed(1)}/100</Text>
        <Text style={[s.small,{marginTop:6}]}>{hu?"Megbízhatóság":"Confidence"}: {str(confidence.level)} · {hu?"Jelentésazonosító":"Report ID"} {str(r.report_id)}</Text>
      </View>
      <Text style={s.h2}>{hu?"Vezetői összefoglaló":"Executive summary"}</Text>
      <Text>{hu?"Ez a determinisztikus felmérés arra épül, hogyan működött a folyamat az elmúlt három hónapban. Az alapokat, a teljesítési kockázatokat és az automatizálás következő lépésként való alkalmasságát mutatja be.":"This deterministic assessment is based on your answers about how the process has run over the last three months. It highlights maturity foundations, delivery risks, and whether automation is a suitable next step."}</Text>
      {scores.level_capped?<View style={[s.card,{marginTop:10}]}><Text style={s.h3}>{hu?"Miért korlátozott az érettségi szint":"Why the maturity level is capped"}</Text>{arr(scores.cap_reasons).map((reason,i)=><Text key={i}>• {str(reason)}</Text>)}</View>:null}
      <Text style={s.h2}>{hu?"Folyamatprofil":"Process profile"}</Text>
      {Object.entries(profile).filter(([key])=>key!=="P10_pain"&&key!=="P11_tried").map(([key,value])=><View key={key} style={{flexDirection:"row",borderTopWidth:1,borderColor:C.line,paddingVertical:6}} wrap={false}><Text style={{width:175,color:C.muted}}>{key.replaceAll("_"," ")}</Text><Text style={{flex:1}}>{str(obj(value).label)}</Text></View>)}
    </Page>

    <Page size="A4" style={s.page}>
      <View style={s.footer} fixed><Text>grismont · {str(r.report_id)}</Text><Text render={({pageNumber,totalPages})=>`${pageNumber} / ${totalPages}`}/></View>
      <Text style={s.label}>{hu?"Érettségi pontozólap":"Maturity scorecard"}</Text><Text style={s.h1}>{hu?"Hét működési dimenzió":"Seven operating dimensions"}</Text>
      {dimensions.map(entry=>{const row=obj(entry);return <ScoreRow key={str(row.id)} row={row}/>;})}
      <Text style={[s.small,{marginTop:8}]}>Critical 0–39 · Developing 40–59 · Established 60–79 · Leading 80–100. Automation readiness is scored separately and is not included in the maturity index.</Text>
      <Text style={s.h2}>{hu?"Kiemelt kockázatok":"Critical findings"}</Text>
      {arr(findings.redFlags).length?arr(findings.redFlags).map((entry,i)=>{const item=obj(entry);return <View key={i} style={s.card} wrap={false}><Text style={s.h3}>{str(item.name)}</Text><Text style={s.small}>{hu?"Hivatkozás":"Finding reference"}: {str(item.id)}</Text></View>;}):<Text>{hu?"A válaszok alapján nem merült fel kritikus kockázat.":"No critical risk was triggered by the answers."}</Text>}
      <Text style={s.h2}>{hu?"Válaszok közötti ellentmondások":"Consistency observations"}</Text>
      {arr(findings.consistency).length?arr(findings.consistency).map((entry,i)=>{const item=obj(entry);return <View key={i} style={s.card} wrap={false}><Text style={s.h3}>{str(item.name)}</Text><Text style={s.small}>{hu?"Ellenőrzés":"Check reference"}: {str(item.id)}</Text></View>;}):<Text>{hu?"Nem találtunk ellentmondó válaszmintát.":"No contradictory answer pattern was detected."}</Text>}
      {r.profile&&obj(profile.P10_pain).label?<View style={s.card}><Text style={s.label}>{hu?"Az Ön által megadott probléma":"Your stated problem"}</Text><Text>{str(obj(profile.P10_pain).label)}</Text></View>:null}
    </Page>

    <Page size="A4" style={s.page}>
      <View style={s.footer} fixed><Text>grismont · {str(r.report_id)}</Text><Text render={({pageNumber,totalPages})=>`${pageNumber} / ${totalPages}`}/></View>
      <Text style={s.label}>{hu?"Automatizálás és fejlesztés":"Automation & improvement"}</Text><Text style={s.h1}>{hu?"Válassza ki a megfelelő következő lépést":"Choose the right next move"}</Text>
      <View style={[s.card,{backgroundColor:C.lilac,borderColor:C.lilac}]}><Text style={s.h3}>{str(automation.quadrant)} · {str(automation.archetype)}</Text><Text>{hu?"Automatizálási felkészültség":"Automation readiness"} {num(automation.ARI).toFixed(1)}/100 ({str(automation.ARI_band)}); {hu?"lehetőség":"opportunity"} {num(automation.AOS).toFixed(1)}/100.</Text><Text style={s.small}>{hu?"Becsült munkamennyiség":"Estimated workload"}: {str(automation.workload_hours)} {hu?"tényleges munkaóra havonta (körülbelül":"hands-on hours/month (about"} {str(automation.workload_fte)} FTE). {hu?"Nagyságrendi becslés kategóriákba sorolt válaszok alapján, nem pénzügyi becslés.":"This is an order-of-magnitude estimate from banded answers, not a financial estimate."}</Text></View>
      <Text style={s.h2}>{hu?"Felkészültségi kapuk":"Readiness gates"}</Text>
      {Object.entries(gates).map(([key,value])=>{const gate=obj(value);const name=hu?({auto:"Folyamatautomatizálás",ai:"AI",dmaic:"DMAIC fejlesztési projekt",dashboard:"Élő irányítópult"}[key]??key):({dashboard:"Live dashboard"}[key]??key);return <View key={key} style={[s.card,{flexDirection:"row",justifyContent:"space-between"}]} wrap={false}><Text>{name}</Text><Text style={{fontWeight:700}}>{str(gate.result)} · {str(gate.passes)} {hu?"kritérium teljesült":"criteria passed"}</Text></View>;})}
      <Text style={s.h2}>{hu?"Javasolt technológiai irányok":"Relevant technology pathways"}</Text>
      {pathways.map((entry,i)=>{const item=obj(entry);return <View key={i} style={{flexDirection:"row",gap:10,borderTopWidth:1,borderColor:C.line,paddingVertical:7}} wrap={false}><Text style={{width:26,color:"#61782D"}}>{String(i+1).padStart(2,"0")}</Text><Text style={{flex:1}}>{str(item.name)}</Text></View>;})}
      <Text style={s.h2}>{hu?"Javasolt teljesítménymutatók":"Recommended KPIs"}</Text>
      {kpis.map((entry,i)=>{const item=obj(entry);return <View key={i} style={s.card} wrap={false}><Text style={s.h3}>{str(item.name)} · {hu?(item.priority==="Start here"?"Kezdje itt":"Kövesse"):str(item.priority)}</Text><Text>{str(item.definition)}</Text><Text style={s.small}>{hu?"Képlet":"Formula"}: {str(item.formula)}</Text><Text style={s.small}>{hu?"Miért":"Why"}: {str(item.why)}</Text></View>;})}
    </Page>

    <Page size="A4" style={s.page}>
      <View style={s.footer} fixed><Text>grismont · {str(r.report_id)}</Text><Text render={({pageNumber,totalPages})=>`${pageNumber} / ${totalPages}`}/></View>
      <Text style={s.label}>{hu?"90 napos cselekvési terv":"90-day action plan"}</Text><Text style={s.h1}>{hu?"Először tárja fel a tényeket, utána fejlesszen":"Start with evidence, then improve"}</Text>
      {r.one_thing?<View style={[s.card,{backgroundColor:C.lime,borderColor:C.lime}]}><Text style={s.label}>{hu?"Ha csak egy dolgot tesz":"If you do one thing"}</Text><Text style={s.h3}>{str(obj(r.one_thing).title)}</Text><Text>{str(obj(r.one_thing).why)}</Text><Text style={s.small}>{hu?"Felelős":"Owner"}: {str(obj(r.one_thing).owner)} · {hu?"Akkor kész, ha":"Done when"}: {str(obj(r.one_thing).done_when)}</Text></View>:null}
      {([[hu?"Első 30 nap":"First 30 days",r.roadmap_30],[hu?"31–60. nap":"Days 31–60",r.roadmap_60],[hu?"61–90. nap":"Days 61–90",r.roadmap_90]] as [string,unknown][]) .map(([title,value])=><View key={title}><Text style={s.h2}>{title}</Text>{arr(value).map((entry,i)=>{const item=obj(entry);return <View key={i} style={s.card}><Text style={s.h3}>{str(item.title)} · {str(item.effort)} {hu?"ráfordítás":"effort"}</Text><Text>{str(item.why)}</Text><Text style={s.small}>{hu?"Felelős":"Owner"}: {str(item.owner)} · {hu?"Sikerfeltétel":"Success"}: {str(item.done_when)}</Text><BulletList items={item.steps}/><Text style={s.small}>KPI: {str(item.kpi)}</Text></View>;})}</View>)}
      {obj(r.projection).show?<View style={s.card}><Text style={s.h3}>{hu?"Szemléltető 90 napos előrejelzés":"Illustrative 90-day projection"}</Text><Text>{hu?"Érettségi index":"Maturity index"}: {str(obj(r.projection).PMI_now)} → {str(obj(r.projection).PMI_projected)} · {hu?"Szint":"Level"} {str(obj(r.projection).level_now)} → {str(obj(r.projection).level_projected)} ({str(obj(r.projection).level_projected_name)})</Text><Text style={s.small}>{str(obj(r.projection).note)}</Text></View>:null}
      <Text style={s.h2}>{hu?"Elsőként kezelendő veszteségek":"Wastes to address first"}</Text>
      {arr(r.waste_top3).map((entry,i)=>{const item=obj(entry);return <View key={i} style={{borderTopWidth:1,borderColor:C.line,paddingVertical:6,flexDirection:"row",justifyContent:"space-between"}}><Text>{str(item.name)}</Text><Text>{str(item.score)}/100</Text></View>;})}
      {arr(r.roadmap_later).length?<><Text style={s.h2}>{hu?"Később, az első 90 nap után":"Later, after the first 90 days"}</Text><BulletList items={r.roadmap_later}/></>:null}
    </Page>

    <Page size="A4" style={s.page}>
      <View style={s.footer} fixed><Text>grismont · {str(r.report_id)}</Text><Text render={({pageNumber,totalPages})=>`${pageNumber} / ${totalPages}`}/></View>
      <Text style={s.label}>Appendix A · Your answers</Text><Text style={s.h1}>Recorded responses and scores</Text>
      {answers.map((entry,i)=>{const answer=obj(entry);return <View key={i} style={{borderTopWidth:1,borderColor:C.line,paddingVertical:8}} wrap={false}><Text style={s.small}>{String(i+1).padStart(2,"0")} · Section {str(answer.section)} · {str(answer.id)}</Text><Text style={s.h3}>{str(answer.question)}</Text><Text>{str(answer.answer_text??answer.selected_label??"No response")}{answer.dont_know?" · Don't know (0 points)":typeof answer.points==="number"?` · ${answer.points}/4 points`:""}</Text><Text style={s.small}>Stored response code: {str(answer.response_code)}</Text></View>;})}
      <Text style={s.h2}>Method and limitations</Text><Text>This is a rule-based, single-respondent self-assessment. Responses have not been verified against operational evidence. Workload is estimated from answer bands; this report does not estimate money or savings. Inventory and overproduction are not assessed. Completing roadmap actions does not guarantee the projected result.</Text>
      <BulletList items={r.limitations}/>
    </Page>
  </Document>;
}

export async function renderAdvancedAuditPdf(report:AdvancedAuditReport){return renderToBuffer(<AdvancedAuditDocument report={report}/>);}
