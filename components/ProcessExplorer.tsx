"use client";

import { useState } from "react";
import type { Problem } from "../content/site/home";

type Labels = { choose: string; situation: string; before: string; after: string; happens: string; result: string };

export default function ProcessExplorer({ problems, labels }: { problems: Problem[]; labels: Labels }) {
  const [selected, setSelected] = useState(0);
  const problem = problems[selected];
  return <div className="home-explorer"><div className="home-example-options" role="group" aria-label={labels.choose}>{problems.map((item, i) => <button type="button" key={item.name} aria-pressed={selected === i} aria-controls="process-example" onClick={() => setSelected(i)}><span className="home-option-number">0{i + 1}</span>{item.name}<span aria-hidden="true">↗</span></button>)}</div><div id="process-example" className="home-example-panel" role="region" aria-label={problem.name} aria-live="polite" aria-atomic="true"><div className="home-example-diagram"><span className="gm-label">{labels.situation}</span><h3>{problem.title}</h3><div className="home-flow-label">{labels.before}</div><ol className="home-flow home-flow-before">{problem.before.map(step => <li key={step}>{step}</li>)}</ol><div className="home-flow-divider" aria-hidden="true">↓</div><div className="home-flow-label">{labels.after}</div><ol className="home-flow home-flow-after">{problem.after.map(step => <li key={step}>{step}</li>)}</ol></div><div className="home-example-thinking"><span className="gm-label">{labels.happens}</span><p className="home-example-question">{problem.text}</p>{problem.result ? <div className="home-example-result"><span className="gm-label">{labels.result}</span><p>{problem.result}</p></div> : null}</div></div></div>;
}
