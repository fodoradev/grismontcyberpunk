"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { completeAdvancedAuditAction, saveAdvancedAuditAnswerAction } from "../../app/advanced-audit/actions";
import { ADVANCED_AUDIT_QUESTIONS, AUDIT_SECTIONS, type AuditQuestion } from "../../lib/advanced-audit/questions";
import { firstOpenAdvancedAuditIndex } from "../../lib/advanced-audit/validation";
import type { AdvancedAuditAnswers } from "../../lib/advanced-audit/types";
import type { Locale } from "../../lib/i18n";

function countAnswered(answers: AdvancedAuditAnswers, current: number) {
  return ADVANCED_AUDIT_QUESTIONS.filter((q,index) => q.id in answers || (q.kind === "text" && !q.required && index < current)).length;
}

export default function AdvancedAuditFlow({ token, initialAnswers, locale }: { token:string; initialAnswers:AdvancedAuditAnswers; locale:Locale }) {
  const hu=locale==="hu";
  const [answers,setAnswers]=useState(initialAnswers);
  const answersRef=useRef(initialAnswers);
  const [index,setIndex]=useState(()=>firstOpenAdvancedAuditIndex(initialAnswers));
  const [message,setMessage]=useState("");
  const [saving,setSaving]=useState(false);
  const [completing,setCompleting]=useState(false);
  const [copied,setCopied]=useState(false);
  const pending=useRef(new Map<string,string|number>());
  const flushing=useRef<Promise<void>>(Promise.resolve());
  const timer=useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const q=ADVANCED_AUDIT_QUESTIONS[index] as AuditQuestion|undefined;
  const sectionIndex=q?AUDIT_SECTIONS.findIndex(section=>section.id===q.section):AUDIT_SECTIONS.length-1;
  const currentSection=AUDIT_SECTIONS[sectionIndex];

  const flush=useCallback(()=>{
    flushing.current=flushing.current.then(async()=>{
      while(pending.current.size){
        const [id,value]=pending.current.entries().next().value as [string,string|number];
        setSaving(true);
        let saved=false;
        for(let attempt=0;attempt<3&&!saved;attempt++){
          try{
            const result=await saveAdvancedAuditAnswerAction(token,id,value);
            if(result.ok){saved=true;if(pending.current.get(id)===value)pending.current.delete(id);}
            else {setMessage(result.message);break;}
          }catch{if(attempt===2)setMessage(hu?"Nem sikerült menteni. Ellenőrizd a kapcsolatot, majd próbáld újra.":"We couldn't save that answer. Check your connection and try again.");else await new Promise(resolve=>setTimeout(resolve,350*(attempt+1)));}
        }
        if(!saved)break;
      }
      setSaving(false);
    });
    return flushing.current;
  },[token,hu]);

  const setAnswer=(id:string,value:string|number,debounced=false)=>{
    answersRef.current={...answersRef.current,[id]:value};
    setAnswers(answersRef.current);
    pending.current.set(id,value);
    setMessage("");
    clearTimeout(timer.current);
    if(debounced) timer.current=setTimeout(()=>void flush(),450);
  };
  const go=async(to:number)=>{
    if(to<0||to>ADVANCED_AUDIT_QUESTIONS.length)return;
    clearTimeout(timer.current);
    if(pending.current.size)await flush();
    if(pending.current.size)return;
    setMessage("");setIndex(to);
  };
  const next=async()=>{
    if(!q)return;
    const value=answers[q.id];
    const required=q.kind==="text"?q.required:true;
    if(required&&(value===undefined||(typeof value==="string"&&!value.trim()))){setMessage(hu?"A folytatáshoz válaszolj erre a kérdésre.":"Answer this question before continuing.");return;}
    if(q.kind==="text"&&typeof value==="string"&&value.trim())setAnswer(q.id,value.trim());
    await go(index+1);
  };
  const finish=async()=>{
    if(completing)return;
    setCompleting(true);setMessage("");
    try{
      clearTimeout(timer.current);
      if(pending.current.size)await flush();
      if(pending.current.size){setMessage(hu?"Még nem sikerült minden választ elmenteni. Próbáld újra.":"Some answers are still waiting to save. Please try again.");return;}
      const result=await completeAdvancedAuditAction(token);
      if(!result.ok)setMessage(result.message);
    }catch{setMessage(hu?"Nem sikerült elkészíteni a jelentést. A válaszaid mentve vannak; próbáld újra.":"We couldn't generate the report. Your answers are saved; please try again.");}
    finally{setCompleting(false);}
  };

  useEffect(()=>()=>clearTimeout(timer.current),[]);
  useEffect(()=>{
    const onKey=(event:KeyboardEvent)=>{
      if(event.defaultPrevented||event.metaKey||event.ctrlKey||event.altKey)return;
      const target=event.target as HTMLElement;
      if(target.closest("button,a,[role=button],[role=radio]"))return;
      if(target.matches("input,textarea,select,[contenteditable]")){if(event.key==="Enter"&&!event.shiftKey&&q?.kind==="text"){event.preventDefault();void next();}return;}
      if(event.key==="ArrowLeft"||event.key==="Backspace"){event.preventDefault();void go(index-1);return;}
      if(event.key==="ArrowRight"||event.key==="Enter"){event.preventDefault();void next();return;}
      if(q?.kind==="choice"&&/^[1-9]$/.test(event.key)){
        const option=q.options[Number(event.key)-1];if(option){event.preventDefault();setAnswer(q.id,option.code);window.setTimeout(()=>void go(index+1),250);}
      }
    };
    window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey);
  });

  const sectionQuestions=currentSection?ADVANCED_AUDIT_QUESTIONS.filter(item=>item.section===currentSection.id):[];
  const localPrompt=(question:AuditQuestion)=>hu?question.promptHu:question.prompt;
  const position=q?String(index+1):undefined;
  const copyLink=async()=>{try{await navigator.clipboard.writeText(location.href);setCopied(true);setTimeout(()=>setCopied(false),1800);}catch{setMessage(hu?"Másold ki a hivatkozást a böngésző címsorából.":"Copy the link from your browser address bar.");}};

  return <section className="sc-flow sc-audit-flow" aria-label={hu?"Részletes audit kérdőív":"Advanced audit questionnaire"}>
    <div className="sc-resume-bar"><span>{hu?"A válaszaid mentése":"Your answers are saved as you go"}{saving?` · ${hu?"Mentés…":"Saving…"}`:""}</span><button type="button" className="gm-text-link" onClick={copyLink}>{copied?(hu?"Hivatkozás másolva":"Link copied"):hu?"Privát hivatkozás másolása":"Copy private link"}</button></div>
    <div className="sc-progress-wrap">
      <div className="sc-progress" role="progressbar" aria-label={hu?"Audit előrehaladása":"Audit progress"} aria-valuemin={0} aria-valuemax={ADVANCED_AUDIT_QUESTIONS.length} aria-valuenow={countAnswered(answers,index)}>
        {AUDIT_SECTIONS.map((section,i)=>{const questions=ADVANCED_AUDIT_QUESTIONS.filter(item=>item.section===section.id);const done=questions.every(item=>item.id in answers||(item.kind==="text"&&!item.required&&ADVANCED_AUDIT_QUESTIONS.indexOf(item)<index));const fraction=questions.filter(item=>item.id in answers).length/Math.max(1,questions.length);return <div key={section.id} className={`sc-seg ${done?"sc-seg-done":""} ${i===sectionIndex?"sc-seg-current":""}`} title={hu?section.nameHu:section.name}><span style={{transform:`scaleX(${done?1:fraction})`}}/></div>;})}
      </div>
      <div className="sc-progress-meta"><span>{currentSection?(hu?currentSection.nameHu:currentSection.name):hu?"Befejezés":"Complete"}{q?<span className="sc-progress-pos"> · {hu?`kérdés ${position}`:`question ${position}`}</span>:null}</span><span>{countAnswered(answers,index)} / {ADVANCED_AUDIT_QUESTIONS.length} {hu?"megválaszolva":"answered"}</span></div>
    </div>
    <div className="sc-stage"><div className="sc-card" key={index}>
      {currentSection?.intro?<p className="sc-card-help">{hu?currentSection.introHu:currentSection.intro}</p>:null}
      {q?<>
        <h1 className="sc-card-q" id="audit-question">{String(index+1).padStart(2,"0")}<span className="sc-card-n">/{ADVANCED_AUDIT_QUESTIONS.length}</span> {localPrompt(q)}{q.kind==="text"&&!q.required?<em className="sc-optional">{hu?"nem kötelező":"optional"}</em>:null}</h1>
        {q.help?<p className="sc-card-help">{hu&&q.helpHu?q.helpHu:q.help}</p>:null}
        {q.kind==="text"?<div className="sc-text"><textarea id="audit-answer" maxLength={q.maxLength} rows={q.id==="P1_process"?2:3} value={typeof answers[q.id]==="string"?answers[q.id] as string:""} onChange={event=>setAnswer(q.id,event.target.value,true)} placeholder={hu?q.placeholderHu:q.placeholder} aria-labelledby="audit-question" autoFocus/><div className="sc-ok"><span className="sc-keyhint">{(typeof answers[q.id]==="string"?answers[q.id] as string:"").length}/{q.maxLength}</span><button type="button" className="gm-cta" onClick={()=>void next()}>{hu?"Rendben":"OK"} <span aria-hidden="true">→</span></button></div></div>:<div className="sc-choices" role="radiogroup" aria-labelledby="audit-question">{q.options.map((option,i)=><button type="button" role="radio" aria-checked={answers[q.id]===option.code} className="sc-choice" key={option.code} onClick={()=>{setAnswer(q.id,option.code);window.setTimeout(()=>void go(index+1),260);}}><kbd>{i+1}</kbd><span>{hu?option.labelHu:option.label}</span>{answers[q.id]===option.code?<span aria-hidden="true">✓</span>:null}</button>)}</div>}
      </>:<div className="sc-audit-finish"><h1 className="sc-card-q">{hu?"Minden kötelező kérdésre válaszoltál.":"You’ve answered every required question."}</h1><p className="sc-card-help">{hu?"Készítsd el a jelentést. Bármikor visszaléphetsz és módosíthatsz egy választ.":"Generate your report now. You can go back and change any answer first."}</p><button type="button" className="gm-cta" onClick={()=>void finish()} disabled={completing}>{completing?(hu?"Jelentés készül…":"Generating report…"):hu?"Jelentés készítése":"Generate report"} <span aria-hidden="true">→</span></button></div>}
    </div></div>
    <div className="sc-flow-foot"><p className="sc-flow-msg" role="status" aria-live="polite">{message|| (saving?(hu?"Válasz mentése…":"Saving answer…"):"")}</p><div className="sc-flow-nav"><button type="button" onClick={()=>void go(index-1)} disabled={index<=0||completing} aria-label={hu?"Előző kérdés":"Previous question"}>←</button>{q?<button type="button" onClick={()=>void next()} disabled={completing} aria-label={hu?"Következő kérdés":"Next question"}>→</button>:null}</div></div>
  </section>;
}
