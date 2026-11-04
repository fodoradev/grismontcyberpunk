"use client";

import { useState } from "react";
import type { Problem } from "../content/site/home";

type Labels = { choose: string; situation: string; before: string; after: string; happens: string; result: string; score: string };

export default function ProcessExplorer({ problems, labels, scoreHref }: { problems: Problem[]; labels: Labels; scoreHref: string }) {
  const [selected, setSelected] = useState(0);
  const problem = problems[selected];
  return <div className="home-explorer"><div className="home-example-options" role="group" aria-label={labels.choose}>{problems.map((item, i) => <button type="button" key={item.name} aria-pressed={selected === i} aria-controls="process-example" onClick={() => setSelected(i)}>{item.name}</button>)}</div><div id="process-example" key={selected} className="home-example-panel" role="region" aria-label={problem.name} aria-live="polite" aria-atomic="true"><div className="home-example-diagram"><span className="gm-label">{labels.situation}</span><h3>{problem.title}</h3><div className="home-flow-label">{labels.before}</div><ol className="home-flow home-flow-before">{problem.before.map((step, i) => <li key={step} style={{ "--i": i } as React.CSSProperties}>{step}</li>)}</ol><div className="home-flow-divider" aria-hidden="true">↓</div><div className="home-flow-label">{labels.after}</div><ol className="home-flow home-flow-after">{problem.after.map((step, i) => <li key={step} style={{ "--i": i + problem.before.length } as React.CSSProperties}>{step}</li>)}</ol></div><div className="home-example-thinking"><span className="gm-label">{labels.happens}</span><p className="home-example-question">{problem.text}</p>{problem.result ? <div className="home-example-result"><span className="gm-label">{labels.result}</span><p>{problem.result}</p></div> : null}<a className="gm-text-link home-example-link" href={scoreHref}>{labels.score} <span aria-hidden="true">↗</span></a></div></div></div>;
}
