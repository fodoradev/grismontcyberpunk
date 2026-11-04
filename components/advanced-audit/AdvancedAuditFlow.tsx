"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { completeAdvancedAuditAction, saveAdvancedAuditAnswerAction } from "../../app/advanced-audit/actions";
import { ADVANCED_AUDIT_QUESTIONS, AUDIT_SECTIONS, type AuditQuestion } from "../../lib/advanced-audit/questions";
import { firstOpenAdvancedAuditIndex } from "../../lib/advanced-audit/validation";
import type { AdvancedAuditAnswers } from "../../lib/advanced-audit/types";
import type { Locale } from "../../lib/i18n";
import { minutesLeft, resetCardScroll, useSectionMomentum } from "../scorecard/momentum";

export default function AdvancedAuditFlow({ token, initialAnswers, locale }: { token:string; initialAnswers:AdvancedAuditAnswers; locale:Locale }) {
  const hu=locale==="hu";
  const [answers,setAnswers]=useState(initialAnswers);
  const answersRef=useRef(initialAnswers);
  const [index,setIndex]=useState(()=>firstOpenAdvancedAuditIndex(initialAnswers));
  const [message,setMessage]=useState("");
  const [saving,setSaving]=useState(false);
  const [completing,setCompleting]=useState(false);
  const [copied,setCopied]=useState(false);
  const [resumeEmailQueued,setResumeEmailQueued]=useState(false);
  const [dir,setDir]=useState<1|-1>(1);
  const heading=useRef<HTMLHeadingElement>(null);
  const textField=useRef<HTMLTextAreaElement>(null);
  const firstRender=useRef(true);
  const doneAtMount=useRef<Set<string>|null>(null);
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
            if(result.ok){saved=true;if(result.resumeEmailPending)setResumeEmailQueued(true);if(pending.current.get(id)===value)pending.current.delete(id);}
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
    setDir(to>index?1:-1);setMessage("");setIndex(to);
  };
  const next=async()=>{
    if(!q){await finish();return;}
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
      if(target.matches("input,textarea,select,[contenteditable]")){if(event.key==="Enter"&&!event.shiftKey&&q?.kind==="text"){event.preventDefault();void next();}return;}
      if(q?.kind==="choice"&&/^[1-9]$/.test(event.key)){
        const option=q.options[Number(event.key)-1];if(option){event.preventDefault();setAnswer(q.id,option.code);window.setTimeout(()=>void go(index+1),250);}
        return;
      }
      const onControl=target.matches("button,a");
      if(event.key==="Enter"||event.key===" "){if(onControl)return;event.preventDefault();void next();return;}
      if(event.key==="ArrowLeft"||event.key==="Backspace"){event.preventDefault();void go(index-1);return;}
      if(event.key==="ArrowRight"){event.preventDefault();void next();return;}
      if(event.key==="ArrowDown"||event.key==="ArrowUp"){
        const options=[...document.querySelectorAll<HTMLButtonElement>(".sc-audit-flow .sc-choice")];if(!options.length)return;
        event.preventDefault();const at=options.indexOf(document.activeElement as HTMLButtonElement);const to=at===-1?(event.key==="ArrowDown"?0:options.length-1):(at+(event.key==="ArrowDown"?1:-1)+options.length)%options.length;options[to].focus();
      }
    };
    window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey);
  });

  const sectionQuestions=currentSection?ADVANCED_AUDIT_QUESTIONS.filter(item=>item.section===currentSection.id):[];
  const localPrompt=(question:AuditQuestion)=>hu?question.promptHu:question.prompt;
  const posInSection=q?sectionQuestions.indexOf(q)+1:0;
  const answered=ADVANCED_AUDIT_QUESTIONS.filter(item=>(item.id in answers&&!(item.kind==="text"&&item.id===q?.id)&&(item.kind!=="text"||!item.required||String(answers[item.id]??"").trim()))||(item.kind==="text"&&!item.required&&ADVANCED_AUDIT_QUESTIONS.indexOf(item)<index));
  doneAtMount.current??=AUDIT_SECTIONS.filter(section=>{const list=ADVANCED_AUDIT_QUESTIONS.filter(item=>item.section===section.id);return list.length>0&&list.every(item=>item.id in initialAnswers||(item.kind==="text"&&!item.required&&ADVANCED_AUDIT_QUESTIONS.indexOf(item)<index));}).map(section=>section.id).reduce((set,id)=>set.add(id),new Set<string>());
  const position=q&&sectionQuestions.length>1?(hu?`${posInSection}/${sectionQuestions.length}`:`${posInSection} of ${sectionQuestions.length}`):undefined;
  const copyLink=async()=>{try{await navigator.clipboard.writeText(location.href);setCopied(true);setTimeout(()=>setCopied(false),1800);}catch{setMessage(hu?"Másold ki a hivatkozást a böngésző címsorából.":"Copy the link from your browser address bar.");}};

  const total=ADVANCED_AUDIT_QUESTIONS.length;
  const momentum=useSectionMomentum(index,AUDIT_SECTIONS.map(section=>{const list=ADVANCED_AUDIT_QUESTIONS.filter(item=>item.section===section.id);return list.length>0&&list.every(item=>answered.includes(item));}),(done,left)=>{
    const name=hu?AUDIT_SECTIONS[done].nameHu:AUDIT_SECTIONS[done].name;
    if(!left)return hu?`${name}: kész. Minden szakasz megvan.`:`${name} done. All sections finished.`;
    return hu?`${name}: kész. Még ${left} szakasz van hátra.`:`${name} done, ${left} ${left===1?"section":"sections"} left.`;
  });

  useEffect(()=>{
    const shouldFocus=!firstRender.current||q?.kind==="text"; firstRender.current=false;
    if(shouldFocus)(q?.kind==="text"?textField.current:heading.current)?.focus({preventScroll:true});
    resetCardScroll();
  },[index,q?.kind]);

  return <section className="sc-flow sc-audit-flow" aria-label={hu?"Részletes audit kérdőív":"Advanced audit questionnaire"} aria-busy={completing}>
    <div className="sc-resume-bar"><span>{saving?(hu?"Mentés…":"Saving…"):answered.length?(hu?"Mentve. A válaszaidat folyamatosan mentjük.":"Saved. Your answers are saved as you go."):(hu?"A válaszaidat folyamatosan mentjük.":"Your answers are saved as you go.")}{resumeEmailQueued?<span role="status"> · {hu?"Hamarosan e-mailben elküldjük a folytatáshoz szükséges hivatkozást.":"We’ll email your personal resume link shortly."}</span>:null}</span><button type="button" className="gm-text-link" onClick={copyLink}>{copied?(hu?"Hivatkozás másolva":"Link copied"):hu?"Privát hivatkozás másolása":"Copy private link"}</button></div>
    <div className="sc-progress-wrap">
      <div className="sc-progress" role="progressbar" aria-label={hu?"A Részletes folyamat-audit előrehaladása":"Advanced audit progress"} aria-valuemin={0} aria-valuemax={total} aria-valuenow={answered.length} aria-valuetext={hu?`${answered.length}/${total} kérdés megválaszolva`:`${answered.length} of ${total} questions answered`}>
        {AUDIT_SECTIONS.map((section,i)=>{const questions=ADVANCED_AUDIT_QUESTIONS.filter(item=>item.section===section.id);const fraction=answered.filter(item=>item.section===section.id).length/Math.max(1,questions.length);const done=fraction===1;const cls=["sc-seg",done?"sc-seg-done":"",done&&!doneAtMount.current?.has(section.id)?"sc-seg-sweep":"",i===sectionIndex?"sc-seg-current":""].join(" ");return <div key={section.id} className={cls} style={{flexGrow:questions.length}} title={hu?section.nameHu:section.name}><span style={{transform:`scaleX(${fraction})`}}/></div>;})}
      </div>
      <div className="sc-progress-meta" aria-hidden="true"><span>{currentSection?(hu?currentSection.nameHu:currentSection.name):hu?"Minden kész":"All done"}{position?<span className="sc-progress-pos">{hu?`, ${position}. kérdés`:`, question ${position}`}</span>:null}</span><span className="sc-progress-count">{q?(hu?`${index+1}. kérdés / ${total} · kb. ${minutesLeft(total-index,total)} perc van hátra`:`Question ${index+1} of ${total} · about ${minutesLeft(total-index,total)} min left`):(hu?`${answered.length}/${total} megválaszolva`:`${answered.length} of ${total} answered`)}</span></div>
    </div>
    <div className="sc-stage"><div className={`sc-card ${dir===1?"sc-in-fwd":"sc-in-back"}`} key={index}>
      {currentSection?.intro?<p className="sc-card-help">{hu?currentSection.introHu:currentSection.intro}</p>:null}
      {q?<>
        <h1 ref={heading} tabIndex={-1} className="sc-card-q" id="audit-question"><span className="sc-card-n" aria-hidden="true">{index+1}</span>{localPrompt(q)}{q.kind==="text"&&!q.required?<em className="sc-optional">{hu?"nem kötelező":"optional"}</em>:null}</h1>
        {q.help?<p className="sc-card-help">{hu&&q.helpHu?q.helpHu:q.help}</p>:null}
        {q.kind==="text"?<div className="sc-text"><textarea ref={textField} id="audit-answer" name={q.id} maxLength={q.maxLength} rows={q.id==="P1_process"?2:3} value={typeof answers[q.id]==="string"?answers[q.id] as string:""} onChange={event=>setAnswer(q.id,event.target.value,true)} placeholder={hu?q.placeholderHu:q.placeholder} aria-labelledby="audit-question"/><div className="sc-ok"><span className="sc-keyhint">{(typeof answers[q.id]==="string"?answers[q.id] as string:"").length}/{q.maxLength}</span><button type="button" className="gm-cta" onClick={()=>void next()}>{hu?"Rendben":"OK"} <span aria-hidden="true">→</span></button></div></div>:<div className="sc-choices" role="radiogroup" aria-labelledby="audit-question">{q.options.map((option,i)=><button type="button" role="radio" aria-checked={answers[q.id]===option.code} tabIndex={answers[q.id]===option.code||(answers[q.id]===undefined&&i===0)?0:-1} className="sc-choice" key={option.code} onClick={()=>{setAnswer(q.id,option.code);window.setTimeout(()=>void go(index+1),260);}}><kbd aria-hidden="true">{i+1}</kbd><span>{hu?option.labelHu:option.label}</span>{answers[q.id]===option.code?<svg className="sc-check" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3 3 7-7" /></svg>:null}</button>)}</div>}
      </>:<div className="sc-audit-finish"><h1 className="sc-card-q">{hu?"Minden kötelező kérdésre válaszoltál.":"You’ve answered every required question."}</h1><p className="sc-card-help">{hu?"Készítsd el a jelentést. Bármikor visszaléphetsz és módosíthatsz egy választ.":"Generate your report now. You can go back and change any answer first."}</p><button type="button" className="gm-cta" onClick={()=>void finish()} disabled={completing}>{completing?(hu?"Jelentés készül…":"Generating report…"):hu?"Jelentés készítése":"Generate report"} <span aria-hidden="true">→</span></button></div>}
    </div></div>
    <div className="sc-flow-foot"><p className="sc-flow-msg" role="status" aria-live="polite">{message||(momentum?<span key={momentum} className="sc-momentum">{momentum}</span>:"")}</p><span className="sc-keyhint sc-keyhint-nav">{q?.kind==="choice"?<><kbd>1</kbd>–<kbd>{q.options.length}</kbd>{hu?" választás · ":" choose · "}</>:null}<kbd>Enter</kbd>{hu?" tovább · ":" next · "}<kbd>←</kbd>{hu?" vissza":" back"}</span><nav className="sc-flow-nav" aria-label={hu?"Navigáció a kérdések között":"Question navigation"}><button type="button" onClick={()=>void go(index-1)} disabled={index<=0||completing} aria-label={hu?"Előző kérdés":"Previous question"}>←</button><button type="button" onClick={()=>void next()} disabled={!q||completing} aria-label={hu?"Következő kérdés":"Next question"}>→</button></nav></div>
  </section>;
}
