import { type AreaId, type Industry, type Option, type Question, type SizeBand } from "../../../lib/scorecard/types";

/** Options are ordered weakest → strongest; for scored questions the index is the 0–4 score. */
const opts = (labels: string[]): Option[] => labels.map((label, i) => ({ id: `o${i}`, label, score: i }));
/** Unscored options get named ids, so findings can refer to them by meaning: c.is("FW2", "approval"). */
const named = (options: Record<string, string>): Option[] => Object.entries(options).map(([id, label]) => ({ id, label }));

const scored = (id: string, area: AreaId, short: string, prompt: string, labels: string[], extra: Partial<Question> = {}): Question =>
  ({ id, area, short, prompt, kind: "scored", options: opts(labels), ...extra }) as Question;

export const AREA_NAMES: Record<AreaId, string> = {
  FW: "Flow and waste",
  SS: "Stability and standards",
  DM: "Data and measurement",
  AP: "Automation potential",
  AI: "AI readiness",
  PO: "People and ownership",
};

export const AREA_INTROS: Record<AreaId, string> = {
  FW: "How work moves through your company, and where it waits.",
  SS: "Whether the same work gets done the same way, by anyone.",
  DM: "Whether you can trust your numbers, and whether anyone uses them.",
  AP: "How much rule-based manual work exists, and whether it is ready to hand to software.",
  AI: "Whether your data, knowledge and rules are ready for AI to be useful and safe.",
  PO: "Who keeps improvements alive once the project is over.",
};

export const SIZE_LABELS: Record<SizeBand, string> = { "1-10": "1–10 people", "11-50": "11–50 people", "51-250": "51–250 people", "250+": "250+ people" };
export const INDUSTRY_LABELS: Record<Industry, string> = {
  manufacturing: "Manufacturing or logistics",
  services: "Customer services (agency, consulting, trades, healthcare…)",
  office: "Office and administration-heavy work (finance, HR, back office)",
  other: "Something else",
};

/**
 * Prompts may contain {process}: the answer to the opening question, shown to the person as they typed it.
 * Use it where the question is about that one process; leave company-wide questions (AI rules, leadership) without it.
 */
export const PROCESS_ID = "P1";

export const QUESTIONS: Question[] = [
  { id: PROCESS_ID, kind: "text", required: true, short: "The process assessed", maxLength: 80,
    prompt: "Let's pick one process to look at. Which one should it be?",
    help: "The one you know best, or the one that causes the most trouble. Every question that follows is about this process, apart from a few about the company as a whole.",
    placeholder: "e.g. Customer quotes, month-end invoicing, order to delivery" },

  // Flow and waste
  scored("FW1", "FW", "How long a one-hour request takes", "In {process}, take a typical piece of work that needs about an hour of actual effort. From the moment it's requested, when is it usually done?",
    ["Nobody could say; it varies wildly", "Within 1–2 weeks", "Within a few days", "Same or next day", "Same or next day, and we track it"]),
  { id: "FW2", area: "FW", kind: "diag", short: "Where that request waits", prompt: "Where does that piece of work spend most of its time?",
    options: named({ approval: "Waiting for an approval", inbox: "Sitting in someone's inbox or queue", info: "Waiting for information from another team or the customer", rework: "Being corrected or redone", working: "Actually being worked on", unknown: "I don't know" }) },
  scored("FW3", "FW", "How often work comes back", "In {process}, how often does work come back to be corrected or redone because something was missing, wrong or unclear?",
    ["Constantly; it's part of the job", "Something significant most weeks", "Regularly, and we know the usual causes", "Occasionally", "Rarely, and when it happens we fix the cause"]),
  scored("FW4", "FW", "How handoffs work", "When work in {process} moves from one person to the next, how does the next person know it's their turn?",
    ["They're told in passing, or they chase it", "Email or chat; things get missed", "A shared list or board that isn't always current", "A queue or system everyone actually uses", "A queue with visible limits; overdue items are flagged"]),
  scored("FW5", "FW", "Time spent searching, chasing and waiting", "For the people working in {process}, roughly what share of a typical week goes on searching for information, chasing status or waiting on others?",
    ["30% or more", "20–30%", "10–20%", "5–10%", "Under 5%"]),

  // Stability and standards
  scored("SS1", "SS", "How new people learn the work", "When a new person works in {process} for the first time, they learn it by…",
    ["asking whoever is around", "shadowing one specific person", "reading notes that are mostly current", "following a written standard that's updated when the process changes", "following a written standard; deviations are logged and trigger an update"]),
  scored("SS2", "SS", "Whether two people get the same result", "When two people do the same task in {process}, how often do their outputs differ in ways that matter?",
    ["Often, and we find out when a customer or manager complains", "Often; our checks catch most of it", "Sometimes", "Rarely; there's a shared template or checklist", "Rarely, and we measure it"]),
  scored("SS3", "SS", "What happens when the key person is away", "If the person who knows {process} best were away for two weeks, what would happen?",
    ["It would largely stop", "It would limp along with calls to them", "Others would manage, with mistakes", "Others would manage from the documentation", "Nothing; we rotate people so it's routine"]),
  scored("SS4", "SS", "How exceptions are handled", "How are exceptions in {process} (unusual orders, special customers, edge cases) handled?",
    ["Everyone handles them their own way", "Always escalated to one senior person", "Known rules, but only in people's heads", "Written rules for the common ones", "Written rules; new exception types get added"]),
  scored("SS5", "SS", "How process changes reach people", "When the way {process} works changes, how does everyone find out?",
    ["When something goes wrong", "Word of mouth", "An email or meeting; documents aren't updated", "Documents updated and the change announced", "Updated, announced, and checked a few weeks later"]),

  // Data and measurement
  scored("DM1", "DM", "Knowing your error rate", "Could you state last month's error or rework rate for {process} without looking it up?",
    ["We don't measure it", "It's measured, but I'd have to dig", "I have a rough idea, not sure it's right", "Yes, from a regular report", "Yes, and I know the trend and the main causes"]),
  scored("DM2", "DM", "Where report numbers come from", "Where do the numbers in your management or KPI review come from?",
    ["There's no regular review", "Someone builds them by hand from several files", "A partly automated spreadsheet", "Mostly straight from our systems, with some manual fixes", "Straight from our systems; definitions are written down"]),
  scored("DM3", "DM", "Whether two people get the same number", "If two people pull the same number (last month's revenue, open orders), do they get the same result?",
    ["Rarely", "Often not, and an argument follows", "Usually, after reconciling", "Yes, mostly", "Yes: one agreed definition, one source"]),
  scored("DM4", "DM", "What decisions are based on", "When a decision is made about a problem in {process}, what is it usually based on?",
    ["Whoever is most senior or most convinced", "A recent complaint or anecdote", "Data pulled for the occasion", "Data we review regularly", "Data with a baseline, and the result is measured afterwards"]),
  scored("DM5", "DM", "Data in personal files and inboxes", "How much of your key operating data lives in personal spreadsheets or inboxes instead of a shared system?",
    ["Most of it", "A lot", "About half", "Some", "Very little"]),

  // Automation potential
  scored("AP1", "AP", "Hours spent re-typing data", "In {process}, roughly how many hours per week go on copying or re-typing data between systems, files or emails?",
    ["Under 2", "2–5", "5–15", "15–40", "40 or more"], { sub: "opportunity" }),
  scored("AP2", "AP", "How rule-based the recurring work is", "How many of the recurring tasks in {process} follow fixed rules, where the same inputs always lead to the same steps?",
    ["Hardly any", "A few", "Some", "Many", "Most"], { sub: "opportunity" }),
  scored("AP3", "AP", "Whether the steps could be written as rules", "Could you write the steps of the most repetitive task in {process} as if/then rules today, without asking anyone?",
    ["No", "Only the main path", "Main path and common exceptions, with help", "Yes", "It's already written down that way"], { sub: "readiness" }),
  scored("AP4", "AP", "Whether your systems let data out", "Do the systems used in {process} let data out (export, API, integrations)?",
    ["I don't know", "Only manual export", "Some of them", "Most, and we've used it", "We have working integrations today"], { sub: "readiness" }),
  scored("AP5", "AP", "What happened to the last tool you introduced", "What happened to the last automation or software tool you introduced?",
    ["It was abandoned", "We haven't introduced one", "It works, but only one person can fix it", "It works and has an owner", "It works, has an owner and documentation, and we measured the time saved"], { sub: "readiness" }),

  // AI readiness
  scored("AI1", "AI", "Rules for data in AI tools", "Is there a rule about which company or customer data may go into AI tools?",
    ["No; people use what they like", "AI is banned, but people probably use it anyway", "Informal guidance", "A written, communicated rule", "A written rule, plus approved tools on company accounts"]),
  scored("AI2", "AI", "How AI is used today", "How is AI used in your company today?",
    ["People use free tools for work; we don't know what for", "Not at all", "A few people use it for writing and summaries", "Specific tasks in specific roles, done an agreed way", "Specific use cases with a measured benefit"]),
  scored("AI3", "AI", "Where the know-how is written down", "Where is the knowledge needed to answer a typical question about {process} written down?",
    ["In people's heads", "Scattered files and old emails", "A shared drive, partly out of date", "A maintained knowledge base", "Maintained, with an owner and review dates"]),
  scored("AI4", "AI", "How you would check an AI output", "If an AI tool drafted an answer or a decision, how would you check it was right?",
    ["We'd have no way to check", "Someone would read it and judge", "Compare it by hand against past examples", "We have clear criteria for a correct output", "Clear criteria plus a set of past cases to test against"]),
  scored("AI5", "AI", "A specific problem for AI, with a number", "Is there a specific problem you want AI to solve, with a number attached?",
    ["No; we just feel we should use AI", "General ideas", "A specific use case, no numbers", "A specific case with an estimated cost or time saving", "A specific case with a measured baseline"]),

  // People and ownership
  scored("PO1", "PO", "Whether improvements stick", "Think of the last improvement made to {process}. Is it still done that way three months later?",
    ["I can't think of one", "It faded out", "Partly", "Yes", "Yes, and someone checks"]),
  scored("PO2", "PO", "Who owns the key process", "Who owns {process} end to end, by name?",
    ["Nobody", "Everyone owns their own piece", "A manager, informally", "A named person", "A named person with the authority and a KPI to match"]),
  scored("PO3", "PO", "What happens to problems people spot", "When someone working in {process} spots a problem, what usually happens?",
    ["They work around it", "They tell someone; rarely does anything change", "It's fixed case by case", "There's a regular moment to raise and track problems", "It's raised, tracked, the root cause is fixed, and they hear back"]),
  scored("PO4", "PO", "Time for improvement work", "How much time do people have for improvement work, beyond the daily job?",
    ["None", "Only after hours or in a crisis", "Occasionally, when a manager pushes", "Planned time for some people", "Planned, protected time, with results reviewed"]),
  scored("PO5", "PO", "How bad news is received", "How does leadership react when someone shows a process is worse than everyone thought?",
    ["The messenger takes the heat", "Defensive, then quiet", "Accepted, but little follows", "Accepted, and a fix is resourced", "They ask for it; early bad news is welcomed"]),
  { id: "FT1", area: "PO", kind: "text", short: "What goes wrong", maxLength: 1000,
    prompt: "Last one: what goes wrong in {process} most often?",
    help: "Optional. A sentence or two is plenty; it's where we'll start the call.",
    placeholder: "e.g. Three people re-check the same numbers and it still slips by a week." },
];

export const QUESTION_BY_ID = new Map(QUESTIONS.map(q => [q.id, q]));

export const promptFor = (q: Question, industry?: Industry) => (industry && q.promptByIndustry?.[industry]) || q.prompt;
