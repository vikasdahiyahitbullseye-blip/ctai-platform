// Scenario-level question families for the AI chapters (Classes 6–8) and the EVS themes (Classes 3–5).
// Each question sets up a real-life situation (30–60 words) and needs two or more steps of reasoning, at the level of
// the CBSE CT handbook questions. Answers are computed or come from hand-checked fact tables.
import { type Family, type D, type Item, int, pick, sample, fmt, NAMES, MONTHS } from "./util";

function mcq(answer: string, wrong: (string | number)[]) {
  const w = [...new Set(wrong.map(String).filter((x) => x !== answer))];
  return w.length < 3 ? null : { options: [answer, ...w.slice(0, 3)], answer: 0 };
}
function numMcq(r: () => number, answer: number, near: number[], f: (n: number) => string = fmt) {
  const c = [...new Set(near.filter((x) => Number.isFinite(x) && x !== answer && x >= 0))];
  let k = 1;
  while (c.length < 3) { const v = answer + (k % 2 ? k : -k) * Math.max(1, Math.round(Math.abs(answer) * 0.08)); if (v >= 0 && v !== answer && !c.includes(v)) c.push(v); k++; }
  return mcq(f(answer), sample(r, c, 3).map(f));
}
const item = (d: D, skills: string[], stem: string, o: { options: string[]; answer: number } | null, solution: string, hint?: string): Item | null =>
  o ? { d, skills, type: "MCQ", stem, options: o.options, answer: o.answer, solution, hint } : null;
const who = (r: () => number, n: number) => sample(r, NAMES, n);
const pct = (n: number) => `${Math.round(n * 10) / 10}%`;

// =================================================================== AI ===================================================================
const DOMAIN_CASES: [string, "Computer Vision" | "Natural Language Processing" | "Data Science"][] = [
  ["checks photos of mango leaves taken by farmers and marks the ones with disease spots", "Computer Vision"],
  ["reads the number plates of cars entering the school gate from a camera", "Computer Vision"],
  ["counts how many students raise their hands in a classroom video", "Computer Vision"],
  ["finds cracked tiles on a factory belt from camera pictures", "Computer Vision"],
  ["turns a parent's spoken message into written text for the class diary", "Natural Language Processing"],
  ["translates the school notice from English into Hindi and Tamil", "Natural Language Processing"],
  ["reads students' feedback comments and marks each one as happy, neutral or unhappy", "Natural Language Processing"],
  ["answers parents' typed questions about fee dates in a chat window", "Natural Language Processing"],
  ["studies five years of canteen sales records to predict how many samosas to make on Fridays", "Data Science"],
  ["uses past attendance records to find which months have the most absences", "Data Science"],
  ["predicts electricity use in each block of the school from last year's meter readings", "Data Science"],
  ["groups library members by the kinds of books they borrow, using borrowing records", "Data Science"],
];
const LEARN: Record<string, [string, string]> = {
  "Supervised learning": ["It was trained on thousands of examples, each already marked with the correct answer.", "learns from labelled examples"],
  "Unsupervised learning": ["It was given lots of examples with no labels and had to find groups on its own.", "finds groups in unlabelled data"],
  "Reinforcement learning": ["It improved by trying actions and getting points for good results and losing points for bad ones.", "learns from rewards and penalties"],
};

export const aiDomainLearning: Family = {
  id: "s-ai-domain-learning", ds: [2, 3],
  make(c, d) {
    const [text, dom] = pick(c.r, DOMAIN_CASES);
    const lt = pick(c.r, Object.keys(LEARN).filter((k) => !(k === "Reinforcement learning" && dom !== "Data Science")));
    const school = pick(c.r, ["A school in Pune", "A student club in Jaipur", "A team in Kochi", "A company in Lucknow"]);
    const ans = `${dom}; ${lt.toLowerCase()}`;
    const wrong = [...new Set(["Computer Vision", "Natural Language Processing", "Data Science"].flatMap((x) => Object.keys(LEARN).map((y) => `${x}; ${y.toLowerCase()}`)))];
    return item(d, ["AI_CONCEPT", "DECOMPOSITION"], `${school} builds an AI system that ${text}. ${LEARN[lt][0]}\n\nWhich AI domain does the system belong to, and which type of machine learning did it use?`, mcq(ans, sample(c.r, wrong.filter((w) => w !== ans), 3)), `Break the description into two parts. What the system works with: it ${text}, so the domain is ${dom}${dom === "Computer Vision" ? " (images and video)" : dom === "Natural Language Processing" ? " (human language)" : " (records and numbers)"}. How it learned: it ${LEARN[lt][1]}, which is ${lt.toLowerCase()}.`, "Answer two questions: what kind of data, and were there labels?");
  },
};

export const aiAccuracy: Family = {
  id: "s-ai-accuracy", ds: [2, 3],
  make(c, d) {
    const thing = pick(c.r, [["spam filter", "emails", '"spam"', '"not spam"'], ["fruit-sorting camera", "mangoes", '"spoilt"', '"good"'], ["face-mask detector", "photos", '"no mask"', '"mask"']] as [string, string, string, string][]);
    const N = pick(c.r, [40, 50, 80, 100, 120, 200]);
    const pos = int(c.r, Math.floor(N * 0.3), Math.floor(N * 0.5));
    const tp = int(c.r, Math.floor(pos * 0.6), pos - 1), fn = pos - tp;
    const neg = N - pos, fp = int(c.r, 1, Math.floor(neg * 0.25)), tn = neg - fp;
    const correct = tp + tn;
    const acc = (correct / N) * 100;
    if (d === 2 || !Number.isInteger(acc * 10)) {
      if (!Number.isInteger(acc)) return null;
      return item(d, ["DATA", "AI_CONCEPT"], `A ${thing[0]} is tested on ${N} ${thing[1]}. Of these, ${pos} are really ${thing[2]} and ${neg} are really ${thing[3]}. It correctly labels ${tp} of the ${thing[2]} ${thing[1]}, but it also wrongly labels ${fp} ${thing[3]} ${thing[1]} as ${thing[2]}. What is the accuracy of the ${thing[0]}?`, numMcq(c.r, acc, [(tp / pos) * 100, ((tp + fp) / N) * 100, ((N - fp) / N) * 100, acc + 5].filter((x) => Number.isInteger(x) && x <= 100), (n) => `${n}%`), `Correct results: ${tp} ${thing[2]} found + ${tn} ${thing[3]} left alone (${neg} − ${fp}) = ${correct}. Accuracy = ${correct} ÷ ${N} × 100 = ${acc}%.`, "Accuracy = correct results ÷ total tested.");
    }
    return item(d, ["DATA", "AI_CONCEPT"], `A ${thing[0]} is tested on ${N} ${thing[1]}: ${pos} are really ${thing[2]} and the rest are really ${thing[3]}. It misses ${fn} of the ${thing[2]} ${thing[1]}, and wrongly labels ${fp} of the ${thing[3]} ${thing[1]} as ${thing[2]}. How many ${thing[1]} did it classify wrongly, and what is its accuracy?`, mcq(`${fn + fp} wrong; accuracy ${pct(acc)}`, [`${fn} wrong; accuracy ${pct(((N - fn) / N) * 100)}`, `${fp} wrong; accuracy ${pct(((N - fp) / N) * 100)}`, `${fn + fp} wrong; accuracy ${pct((tp / pos) * 100)}`]), `Wrong results: ${fn} missed + ${fp} false alarms = ${fn + fp}. Correct: ${N} − ${fn + fp} = ${correct}. Accuracy = ${correct} ÷ ${N} × 100 = ${pct(acc)}.`);
  },
};

export const aiSplit: Family = {
  id: "s-ai-split", ds: [2, 3],
  make(c, d) {
    const N = pick(c.r, [600, 800, 1000, 1200, 1500, 2000, 2400]);
    const [tr, va] = pick(c.r, [[70, 15], [80, 10], [60, 20], [75, 15]] as [number, number][]);
    const te = 100 - tr - va;
    const removed = d === 3 ? pick(c.r, [50, 100, 200]) : 0;
    const total = N - removed;
    const ask = pick(c.r, ["validation", "test", "training"] as const);
    const share = { training: tr, validation: va, test: te }[ask];
    const ans = (total * share) / 100;
    if (!Number.isInteger(ans)) return null;
    return item(d, ["DATA", "AI_CONCEPT"], `A team collects ${fmt(N)} labelled photos of birds to train an AI model.${removed ? ` While cleaning the data they remove ${removed} blurry or duplicate photos.` : ""} The remaining photos are split into training, validation and test sets in the ratio ${tr} : ${va} : ${te}. How many photos are in the ${ask} set?`, numMcq(c.r, ans, [(N * share) / 100, (total * tr) / 100, (total * te) / 100, (total * va) / 100, ans + removed]), `${removed ? `After cleaning there are ${fmt(N)} − ${removed} = ${fmt(total)} photos. ` : ""}The ${ask} set gets ${share}% of them: ${fmt(total)} × ${share} ÷ 100 = ${fmt(ans)}.`);
  },
};

export const aiBias: Family = {
  id: "s-ai-bias", ds: [2, 3],
  make(c, d) {
    const groups = pick(c.r, [["cats", "dogs"], ["boys' handwriting", "girls' handwriting"], ["city roads", "village roads"], ["light-skinned faces", "darker-skinned faces"], ["English speakers", "Hindi speakers"]] as [string, string][]);
    const a = pick(c.r, [600, 800, 900, 1200]), b = pick(c.r, [100, 150, 200, 300]);
    if (d === 2) {
      const share = (b / (a + b)) * 100;
      if (!Number.isInteger(share * 10)) return null;
      return item(d, ["ETHICS", "DATA"], `An AI model is trained with ${a} examples of ${groups[0]} and only ${b} examples of ${groups[1]}. When it is used, it makes many more mistakes with ${groups[1]}. What percentage of the training data was ${groups[1]}, and what is the best way to reduce this bias?`, mcq(`${pct(share)}; add more examples of ${groups[1]}`, [`${pct(share)}; remove all examples of ${groups[1]}`, `${pct((a / (a + b)) * 100)}; add more examples of ${groups[0]}`, `${pct(share)}; train the model for a longer time on the same data`]), `${groups[1]} were ${b} of ${a + b} examples = ${pct(share)}. The model saw too few of them (under-representation), so the fix is to collect more, varied examples of ${groups[1]} until the groups are balanced.`);
    }
    const need = a - b;
    return item(d, ["ETHICS", "DATA"], `A model trained with ${a} examples of ${groups[0]} and ${b} examples of ${groups[1]} works badly for ${groups[1]}. The team decides to add new examples of ${groups[1]} only, until both groups have the same number of examples. How many examples must they add, and what will the total size of the dataset then be?`, mcq(`${need} examples; ${fmt(2 * a)} in total`, [`${need} examples; ${fmt(a + b)} in total`, `${a} examples; ${fmt(2 * a + b)} in total`, `${b} examples; ${fmt(a + 2 * b)} in total`]), `To balance, ${groups[1]} must also have ${a} examples: add ${a} − ${b} = ${need}. The dataset then has ${a} + ${a} = ${fmt(2 * a)} examples.`);
  },
};

export const aiRules: Family = {
  id: "s-ai-rules", ds: [2, 3],
  make(c, d) {
    const [p] = who(c.r, 1);
    const sets = [
      { what: "a smart irrigation system for a school garden", vars: ["soil moisture (%)", "rain expected tomorrow"],
        rules: (m: number, rain: boolean) => (m < 30 ? (rain ? "Water lightly" : "Water fully") : m < 60 ? (rain ? "Do not water" : "Water lightly") : "Do not water"),
        text: ["If soil moisture is below 30%: water fully, but only lightly if rain is expected.", "If soil moisture is 30% to 59%: water lightly, but do not water if rain is expected.", "If soil moisture is 60% or more: do not water."],
        outs: ["Water fully", "Water lightly", "Do not water", "Send an alert"] },
    ];
    const s = sets[0];
    const m = int(c.r, 5, 90), rain = c.r() < 0.5;
    const ans = s.rules(m, rain);
    if (d === 2) return item(d, ["ALGORITHMIC", "AI_CONCEPT"], `${p} sets up ${s.what}. It follows these rules:\n${s.text.map((t) => `- ${t}`).join("\n")}\n\nToday the soil moisture is ${m}% and rain ${rain ? "IS" : "is NOT"} expected tomorrow. What does the system do?`, mcq(ans, s.outs.filter((o) => o !== ans)), `${m}% is ${m < 30 ? "below 30%" : m < 60 ? "between 30% and 59%" : "60% or more"}, and rain ${rain ? "is" : "is not"} expected, so the rule gives: ${ans}.`);
    const days = [...Array(4)].map(() => [int(c.r, 5, 90), c.r() < 0.5] as [number, boolean]);
    const count = days.filter(([mm, rr]) => s.rules(mm, rr) === "Do not water").length;
    return item(d, ["ALGORITHMIC", "AI_CONCEPT"], `${p} sets up ${s.what}. It follows these rules:\n${s.text.map((t) => `- ${t}`).join("\n")}\n\nOn four days the readings were: ${days.map(([mm, rr], i) => `Day ${i + 1}: ${mm}%, rain ${rr ? "expected" : "not expected"}`).join("; ")}. On how many of these days did the system NOT water the garden?`, numMcq(c.r, count, [0, 1, 2, 3, 4]), `Apply the rules day by day: ${days.map(([mm, rr], i) => `Day ${i + 1} → ${s.rules(mm, rr)}`).join("; ")}. "Do not water" happens on ${count} day${count === 1 ? "" : "s"}.`);
  },
};

const ETHICS_CASES: [string, string][] = [
  ["A fitness app quietly shares users' location history with advertisers without asking them.", "Privacy"],
  ["A school's AI marks essays, but no one can explain to students why it gave a low mark.", "Transparency"],
  ["A job-screening AI rejects most women because it learned from past hiring records that were mostly men.", "Fairness"],
  ["A hospital uses an AI suggestion to change a patient's medicine without any doctor checking it first.", "Human oversight (accountability)"],
  ["A face-unlock feature works well for some users but often fails for people with darker skin.", "Fairness"],
  ["An app stores children's photos on an open website where anyone can download them.", "Privacy"],
  ["A bank's AI refuses a loan, and when the customer asks why, the bank says 'the computer decided'.", "Transparency"],
  ["A self-driving bus company does not take responsibility after its AI causes an accident.", "Human oversight (accountability)"],
];
export const aiEthics: Family = {
  id: "s-ai-ethics", ds: [2, 3],
  make(c, d) {
    if (d === 2) {
      const [txt, ans] = pick(c.r, ETHICS_CASES);
      return item(d, ["ETHICS"], `Read the situation carefully.\n\n${txt}\n\nWhich principle of responsible AI is MOST clearly not being followed?`, mcq(ans, ["Privacy", "Transparency", "Fairness", "Human oversight (accountability)"].filter((x) => x !== ans)), `Ask what went wrong: ${ans === "Privacy" ? "personal data was shared or exposed without permission" : ans === "Transparency" ? "people cannot find out how or why the AI decided" : ans === "Fairness" ? "the system treats one group of people worse than another" : "no human checks or takes responsibility for the AI's decision"}. That is the principle of ${ans}.`);
    }
    const picks = sample(c.r, ETHICS_CASES, 3);
    const target = pick(c.r, [...new Set(picks.map((p) => p[1]))]);
    const n = picks.filter((p) => p[1] === target).length;
    return item(d, ["ETHICS", "DECOMPOSITION"], `Here are three situations:\n${picks.map((p, i) => `${i + 1}. ${p[0]}`).join("\n")}\n\nIn how many of these situations is the main problem a lack of ${target === "Human oversight (accountability)" ? "human oversight and accountability" : target.toLowerCase()}?`, numMcq(c.r, n, [0, 1, 2, 3]), `Classify each situation: ${picks.map((p, i) => `${i + 1} → ${p[1]}`).join("; ")}. ${n} of them ${n === 1 ? "is" : "are"} about ${target}.`);
  },
};

const CHART_CASES: [string, string][] = [
  ["show how the temperature of a city changed every hour from 6 am to 6 pm", "Line graph"],
  ["compare the number of books borrowed by each of five classes in one month", "Bar graph"],
  ["show what fraction of a family's monthly spending goes on food, rent, travel and savings", "Pie chart"],
  ["show how a plant's height grew week after week for two months", "Line graph"],
  ["compare the marks of four students in a Maths test", "Bar graph"],
  ["show the share of students who come to school by bus, car, cycle and on foot", "Pie chart"],
];
export const aiChart: Family = {
  id: "s-ai-chart", ds: [2],
  make(c, d) {
    const [p] = who(c.r, 1);
    const [txt, ans] = pick(c.r, CHART_CASES);
    return item(d, ["DATA"], `${p} has collected data for a school project and wants to ${txt}. The chart must make the main idea clear at a glance. Which kind of chart should ${p} choose?`, mcq(ans, ["Line graph", "Bar graph", "Pie chart", "Table of numbers only"].filter((x) => x !== ans)), `${ans === "Line graph" ? "The data changes over time, and a line graph shows rises and falls clearly." : ans === "Bar graph" ? "The data compares separate groups, and bars of different heights make the comparison easy." : "The data shows parts of one whole, and a pie chart shows each part's share."} So: ${ans}.`);
  },
};

export const dataMean: Family = {
  id: "s-data-mean", ds: [2, 3],
  make(c, d) {
    const [p] = who(c.r, 1);
    const n = int(c.r, 5, 7);
    const vals = [...Array(n)].map(() => int(c.r, 12, 40));
    const sum = vals.reduce((a, b) => a + b, 0);
    if (sum % n) return null;
    const mean = sum / n;
    if (d === 2) return item(d, ["DATA"], `${p} records the number of cars passing the school gate every 10 minutes: ${vals.join(", ")}. What are the mean (average) and the range of these readings?`, mcq(`Mean ${mean}, range ${Math.max(...vals) - Math.min(...vals)}`, [`Mean ${mean}, range ${Math.max(...vals)}`, `Mean ${mean + 1}, range ${Math.max(...vals) - Math.min(...vals)}`, `Mean ${Math.round(sum / (n - 1))}, range ${Math.max(...vals) - Math.min(...vals) + 2}`]), `Mean = total ÷ number of readings = ${sum} ÷ ${n} = ${mean}. Range = largest − smallest = ${Math.max(...vals)} − ${Math.min(...vals)} = ${Math.max(...vals) - Math.min(...vals)}.`);
    const newMean = mean + int(c.r, 1, 4);
    const x = newMean * (n + 1) - sum;
    if (x <= 0) return null;
    return item(d, ["DATA", "ALGORITHMIC"], `${p} records the number of cars passing the school gate every 10 minutes: ${vals.join(", ")}. After one more reading, the mean of all the readings goes up to ${newMean}. What was the new reading?`, numMcq(c.r, x, [newMean, x - n, x + 1, newMean * n - sum]), `The old total is ${sum}, so the old mean is ${mean}. With ${n + 1} readings and a mean of ${newMean}, the total must be ${newMean} × ${n + 1} = ${newMean * (n + 1)}. The new reading is ${newMean * (n + 1)} − ${sum} = ${x}.`);
  },
};

const SAFETY_CASES: [string, string, string[]][] = [
  ["Riya gets a message: 'You have won a free tablet! Click this link and enter your parent's bank card number to pay the delivery fee.'", "Do not click; tell a parent and delete the message", ["Click the link but give a fake card number", "Forward it to friends so they can also win", "Reply asking for more details"]],
  ["A new game asks Kabir for permission to use his contacts, location and microphone, though it is a simple puzzle game.", "Deny the permissions it does not need, or not install the game", ["Allow everything so the game runs faster", "Install it and share his password with the game", "Give it only his location"]],
  ["Meera finds that someone has made a fake account using her photo and is posting rude comments.", "Tell a trusted adult and report the account to the platform", ["Make a fake account to post rude comments back", "Ignore it forever and tell no one", "Share her password with friends so they can fix it"]],
  ["Arjun needs pictures for his project and finds one he likes on a photographer's website.", "Use it only if it is allowed, and give credit to the photographer", ["Copy it and say he took the photo", "Edit it a little and use it without credit", "Download all the photographer's pictures"]],
];
export const safetyCase: Family = {
  id: "s-online-safety", ds: [2],
  make(c, d) {
    const [txt, ans, wrong] = pick(c.r, SAFETY_CASES);
    return item(d, ["ETHICS"], `${txt}\n\nWhat is the most responsible thing to do?`, mcq(ans, wrong), `A responsible digital citizen protects personal information, respects other people's work and asks a trusted adult for help when something feels wrong. The best choice is: ${ans}.`);
  },
};

const STAGES = ["Problem scoping (define the problem)", "Data acquisition (collect data)", "Data exploration (clean and study the data)", "Modelling (train the model)", "Evaluation (test the model)", "Deployment (put it to use)"];
export const aiLifecycle: Family = {
  id: "s-ai-lifecycle", ds: [2, 3],
  make(c, d) {
    const project = pick(c.r, ["an app that warns farmers about crop disease from leaf photos", "a system that predicts which buses will be late", "a chatbot that answers students' questions about the timetable", "a model that sorts recyclable and non-recyclable waste from photos"]);
    if (d === 2) {
      const k = int(c.r, 1, 4);
      return item(d, ["AI_CONCEPT", "ALGORITHMIC"], `A team is building ${project}. They have just finished "${STAGES[k]}". Following the AI project cycle, what should they do NEXT?`, mcq(STAGES[k + 1], STAGES.filter((_, i) => i !== k + 1 && i !== k)), `The AI project cycle goes: ${STAGES.join(" → ")}. After "${STAGES[k]}" comes "${STAGES[k + 1]}".`);
    }
    const order = sample(c.r, [...Array(6).keys()], 6);
    const pos = int(c.r, 2, 5);
    const label = "PQRSTU";
    return item(d, ["AI_CONCEPT", "ALGORITHMIC"], `A team building ${project} wrote their steps on cards in a jumbled order:\n${order.map((s, i) => `${label[i]}: ${STAGES[s]}`).join("\n")}\n\nWhen the cards are put in the correct order of the AI project cycle, which card is ${["", "1st", "2nd", "3rd", "4th", "5th", "6th"][pos]}?`, mcq(`Card ${label[order.indexOf(pos - 1)]}`, [...label].filter((x) => x !== label[order.indexOf(pos - 1)]).map((x) => `Card ${x}`)), `The correct order is: ${STAGES.join(" → ")}. The ${["", "1st", "2nd", "3rd", "4th", "5th", "6th"][pos]} step is "${STAGES[pos - 1]}", which is on card ${label[order.indexOf(pos - 1)]}.`);
  },
};

// =================================================================== EVS ===================================================================
export const evsWater: Family = {
  id: "s-evs-water", ds: [2, 3],
  make(c, d) {
    const [p] = who(c.r, 1);
    const uses = sample(c.r, [["bath with a bucket", 20], ["brushing with the tap running", 10], ["washing the car with a hose", 150], ["watering plants", 15], ["washing clothes", 60], ["shower", 50]] as [string, number][], 3);
    const times = uses.map(() => int(c.r, 1, 3));
    const day = uses.reduce((s, u, i) => s + u[1] * times[i], 0);
    const save = pick(c.r, [5, 10, 15]);
    if (d === 2) return item(d, ["DECOMPOSITION", "ALGORITHMIC"], `In ${p}'s home, water is used every day for: ${uses.map((u, i) => `${u[0]} (${u[1]} litres, ${times[i]} time${times[i] > 1 ? "s" : ""} a day)`).join(", ")}. How many litres are used for these in one week?`, numMcq(c.r, day * 7, [day, day * 6, day * 7 + 7 * save, day * 5]), `One day: ${uses.map((u, i) => `${u[1]} × ${times[i]}`).join(" + ")} = ${day} litres. One week: ${day} × 7 = ${fmt(day * 7)} litres.`);
    return item(d, ["DECOMPOSITION", "ALGORITHMIC"], `In ${p}'s home, water is used every day for: ${uses.map((u, i) => `${u[0]} (${u[1]} litres, ${times[i]} time${times[i] > 1 ? "s" : ""} a day)`).join(", ")}. The family now saves ${save} litres every time they do the first activity, by being careful. How many litres will they save in a 30-day month?`, numMcq(c.r, save * times[0] * 30, [save * 30, save * times[0] * 7, day * 30 - save * 30, save * 3 * 30]), `They save ${save} litres each time, ${times[0]} time${times[0] > 1 ? "s" : ""} a day: ${save * times[0]} litres a day. In 30 days: ${save * times[0]} × 30 = ${save * times[0] * 30} litres.`);
  },
};

export const evsPlant: Family = {
  id: "s-evs-plant", ds: [2, 3],
  make(c, d) {
    const [p] = who(c.r, 1);
    const plant = pick(c.r, ["bean", "tomato", "sunflower", "pea"]);
    const h = [int(c.r, 2, 6)]; const grow = [...Array(4)].map(() => int(c.r, 2, 9));
    grow.forEach((g) => h.push(h[h.length - 1] + g));
    const best = grow.indexOf(Math.max(...grow));
    if (grow.filter((g) => g === grow[best]).length > 1) return null;
    const table = h.map((v, i) => `Week ${i + 1}: ${v} cm`).join(", ");
    if (d === 2) return item(d, ["DATA", "PATTERN"], `${p} measures a ${plant} plant every Sunday: ${table}. In which week did the plant grow the MOST (compared with the week before)?`, mcq(`Week ${best + 2}`, [1, 2, 3, 4, 5].filter((w) => w !== best + 2).map((w) => `Week ${w}`)), `Growth each week: ${grow.map((g, i) => `Week ${i + 2}: +${g} cm`).join(", ")}. The biggest growth, ${grow[best]} cm, was in Week ${best + 2}.`);
    const avg = (h[4] - h[0]) / 4;
    if (!Number.isInteger(avg)) return null;
    return item(d, ["DATA", "PATTERN"], `${p} measures a ${plant} plant every Sunday: ${table}. If it keeps growing by its AVERAGE weekly growth, how tall will it be in Week 8?`, numMcq(c.r, h[4] + 3 * avg, [h[4] + 3 * grow[3], h[4] + avg, h[4] + 4 * avg, h[4] + 3 * avg + 1], (n) => `${n} cm`), `Total growth from Week 1 to Week 5: ${h[4]} − ${h[0]} = ${h[4] - h[0]} cm in 4 weeks, so ${avg} cm a week on average. Week 8 is 3 weeks after Week 5: ${h[4]} + 3 × ${avg} = ${h[4] + 3 * avg} cm.`);
  },
};

const ANIMALS: { n: string; home: string; food: string; legs: number; skin: string }[] = [
  { n: "Frog", home: "pond", food: "insects", legs: 4, skin: "smooth, wet skin" },
  { n: "Eagle", home: "tall tree", food: "small animals", legs: 2, skin: "feathers" },
  { n: "Cow", home: "shed", food: "grass", legs: 4, skin: "hair" },
  { n: "Spider", home: "web", food: "insects", legs: 8, skin: "a hard outer covering" },
  { n: "Fish", home: "pond", food: "small plants and insects", legs: 0, skin: "scales" },
  { n: "Snake", home: "hole in the ground", food: "small animals", legs: 0, skin: "scales" },
  { n: "Parrot", home: "tall tree", food: "fruits and seeds", legs: 2, skin: "feathers" },
  { n: "Rabbit", home: "hole in the ground", food: "grass", legs: 4, skin: "fur" },
  { n: "Bee", home: "hive", food: "nectar", legs: 6, skin: "a hard outer covering" },
  { n: "Duck", home: "pond", food: "small plants and insects", legs: 2, skin: "feathers" },
];
export const evsAnimalClues: Family = {
  id: "s-evs-animal-clues", ds: [2, 3],
  make(c, d) {
    const a = pick(c.r, ANIMALS);
    const pool: [string, (x: typeof a) => boolean][] = [
      [`I live in a ${a.home}.`, (x) => x.home === a.home], [`I eat ${a.food}.`, (x) => x.food === a.food], [`I have ${a.legs === 0 ? "no legs" : `${a.legs} legs`}.`, (x) => x.legs === a.legs], [`My body is covered with ${a.skin}.`, (x) => x.skin === a.skin],
    ];
    let live = ANIMALS; const used: string[] = [];
    for (const cl of sample(c.r, pool, pool.length)) { const nx = live.filter(cl[1]); if (nx.length < live.length) { used.push(cl[0]); live = nx; } if (live.length === 1) break; }
    if (live.length !== 1 || used.length < 2) return null;
    return item(d, ["DECOMPOSITION", "ABSTRACT"], `Read the clues and find the animal.\n${used.map((u, i) => `- Clue ${i + 1}: ${u}`).join("\n")}\n\nWhich animal am I?`, mcq(a.n, sample(c.r, ANIMALS.filter((x) => x !== a).map((x) => x.n), 3)), `Check each animal against every clue. The ${a.n.toLowerCase()} lives in a ${a.home}, eats ${a.food}, has ${a.legs === 0 ? "no legs" : `${a.legs} legs`} and is covered with ${a.skin}; it is the only animal that fits all the clues.`);
  },
};

const CHAINS = [["grass", "grasshopper", "frog", "snake", "eagle"], ["algae", "small fish", "big fish", "heron"], ["leaves", "caterpillar", "sparrow", "cat"], ["grass", "deer", "tiger"], ["plants", "rabbit", "fox", "lion"]];
export const evsFoodChain: Family = {
  id: "s-evs-food-chain", ds: [2, 3],
  make(c, d) {
    const ch = pick(c.r, CHAINS.filter((x) => x.length >= (d === 3 ? 4 : 3)));
    const clues = ch.slice(1).map((x, i) => `The ${x} eats the ${ch[i]}.`);
    const shuffled = sample(c.r, clues, clues.length);
    const ask = pick(c.r, d === 3 ? ["second", "top", "third"] : ["top", "start"]);
    const ans = { top: ch[ch.length - 1], start: ch[0], second: ch[1], third: ch[2] }[ask] as string;
    const q = { top: "Which living thing is at the TOP of this food chain (eaten by none of the others)?", start: "Which living thing does this food chain START with (it makes its own food)?", second: "Which living thing comes SECOND in this food chain?", third: "Which living thing comes THIRD in this food chain?" }[ask] as string;
    return item(d, ["DECOMPOSITION", "ALGORITHMIC"], `These clues describe one food chain:\n${shuffled.map((x) => `- ${x}`).join("\n")}\n\n${q}`, mcq(ans[0].toUpperCase() + ans.slice(1), sample(c.r, ch.filter((x) => x !== ans), 3).map((x) => x[0].toUpperCase() + x.slice(1))), `Put the clues in order, starting from the living thing that is not eating anything else in the clues: ${ch.join(" → ")}. ${ans[0].toUpperCase() + ans.slice(1)} is ${ask === "top" ? "at the top" : ask === "start" ? "at the start" : `${ask} in the chain`}.`);
  },
};

export const evsMapRoute: Family = {
  id: "s-evs-map-route", ds: [2, 3],
  make(c, d) {
    const [p] = who(c.r, 1);
    const scale = pick(c.r, [100, 200, 250, 500]);
    const places = sample(c.r, ["school", "park", "post office", "temple", "market", "library", "hospital"], 4);
    const legs = [int(c.r, 2, 6), int(c.r, 1, 5), int(c.r, 2, 7)];
    const cm = legs.reduce((a, b) => a + b, 0);
    const m = cm * scale;
    const back = d === 3;
    const total = back ? m * 2 : m;
    const f = (x: number) => (x >= 1000 ? `${x / 1000} km` : `${x} m`);
    return item(d, ["ALGORITHMIC", "ABSTRACT"], `On a map of ${p}'s town, 1 cm stands for ${scale} m. ${p} walks from the ${places[0]} to the ${places[1]} (${legs[0]} cm on the map), then to the ${places[2]} (${legs[1]} cm), and then to the ${places[3]} (${legs[2]} cm).${back ? ` Then ${p} comes back to the ${places[0]} the same way.` : ""} How far does ${p} walk in all?`, mcq(f(total), [f(total / 2 === m && back ? m : total + scale), f(cm * 100), f(total - legs[2] * scale), f(total + 2 * scale)]), `On the map: ${legs.join(" + ")} = ${cm} cm. Real distance: ${cm} × ${scale} m = ${f(m)}${back ? `, and twice that for the walk back: ${f(total)}` : ""}.`);
  },
};

export const evsRain: Family = {
  id: "s-evs-rain", ds: [2, 3],
  make(c, d) {
    const start = int(c.r, 3, 7);
    const mon = [0, 1, 2, 3, 4].map((i) => MONTHS[(start + i) % 12]);
    const mm = mon.map(() => int(c.r, 2, 40) * 5);
    if (new Set(mm).size < 5) return null;
    const town = pick(c.r, ["Cherrapunji", "Shillong", "Kochi", "Mumbai", "Guwahati"]);
    if (d === 2) {
      const hi = mm.indexOf(Math.max(...mm)), lo = mm.indexOf(Math.min(...mm));
      return item(d, ["DATA"], `The rainfall in ${town} for five months was: ${mon.map((m, i) => `${m} ${mm[i]} mm`).join(", ")}. How much MORE rain fell in the wettest month than in the driest month?`, numMcq(c.r, mm[hi] - mm[lo], [mm[hi], mm[hi] + mm[lo], mm[hi] - mm[(lo + 1) % 5], mm[hi] - mm[lo] + 5], (n) => `${n} mm`), `The wettest month is ${mon[hi]} (${mm[hi]} mm) and the driest is ${mon[lo]} (${mm[lo]} mm). Difference = ${mm[hi]} − ${mm[lo]} = ${mm[hi] - mm[lo]} mm.`);
    }
    const pairs = [0, 1, 2, 3].map((i) => mm[i] + mm[i + 1]);
    const b = pairs.indexOf(Math.max(...pairs));
    if (pairs.filter((x) => x === pairs[b]).length > 1) return null;
    return item(d, ["DATA", "DECOMPOSITION"], `The rainfall in ${town} for five months was: ${mon.map((m, i) => `${m} ${mm[i]} mm`).join(", ")}. A farmer wants to know which TWO MONTHS IN A ROW together had the most rain. Which two months are they?`, mcq(`${mon[b]} and ${mon[b + 1]}`, [0, 1, 2, 3].filter((i) => i !== b).map((i) => `${mon[i]} and ${mon[i + 1]}`)), `Add each pair of neighbouring months: ${pairs.map((x, i) => `${mon[i]}–${mon[i + 1]}: ${x} mm`).join(", ")}. The largest total, ${pairs[b]} mm, is ${mon[b]} and ${mon[b + 1]}.`);
  },
};

const WASTE: Record<string, string[]> = {
  "wet (green) bin": ["banana peels", "leftover rice", "tea leaves", "vegetable peels", "fallen leaves", "egg shells"],
  "dry (blue) bin": ["newspaper", "plastic bottles", "milk packets", "cardboard boxes", "tin cans", "glass jars"],
  "hazardous (red) bin": ["old batteries", "broken tube lights", "used medicines", "paint tins"],
};
export const evsWaste: Family = {
  id: "s-evs-waste", ds: [2, 3],
  make(c, d) {
    const bins = Object.keys(WASTE);
    const list = sample(c.r, Object.values(WASTE).flat(), d === 2 ? 6 : 8);
    const target = pick(c.r, bins);
    const n = list.filter((x) => WASTE[target].includes(x)).length;
    const [p] = who(c.r, 1);
    return item(d, ["DECOMPOSITION", "ABSTRACT"], `${p}'s class collects these things after a school fair: ${list.join(", ")}. The school has a wet (green) bin, a dry (blue) bin and a hazardous (red) bin. How many of these things should go into the ${target}?`, numMcq(c.r, n, [n + 1, n - 1, list.length - n, n + 2]), `Sort each item: ${list.map((x) => `${x} → ${bins.find((b) => WASTE[b].includes(x))!.split(" (")[0]}`).join("; ")}. ${n} go into the ${target}.`);
  },
};

export const evsEnergy: Family = {
  id: "s-evs-energy", ds: [2, 3],
  make(c, d) {
    const [p] = who(c.r, 1);
    const apps = sample(c.r, [["fan", 75], ["tube light", 40], ["television", 100], ["computer", 200], ["water heater", 2000], ["refrigerator", 150]] as [string, number][], 3);
    const hours = apps.map(() => int(c.r, 1, 8));
    const wh = apps.map((a, i) => a[1] * hours[i]);
    const units = wh.reduce((a, b) => a + b, 0) / 1000;
    const days = d === 2 ? 1 : 30;
    const ans = Math.round(units * days * 1000) / 1000;
    return item(d, ["DECOMPOSITION", "ALGORITHMIC"], `In ${p}'s home: ${apps.map((a, i) => `a ${a[0]} (${a[1]} watts) runs ${hours[i]} hour${hours[i] > 1 ? "s" : ""} a day`).join(", ")}. One unit of electricity is 1000 watt-hours. How many units do these use in ${days === 1 ? "one day" : "30 days"}?`, numMcq(c.r, ans, [ans * 2, Math.round(((units * days) / 3) * 1000) / 1000, Math.round((ans + units) * 1000) / 1000, Math.round(units * 7 * 1000) / 1000, Math.round(ans * 1000 + 100) / 1000], (n) => String(Math.round(n * 1000) / 1000)), `Watt-hours a day: ${apps.map((a, i) => `${a[1]} × ${hours[i]} = ${wh[i]}`).join("; ")}; total ${wh.reduce((a, b) => a + b, 0)} Wh = ${units} units${days > 1 ? `. In 30 days: ${units} × 30 = ${ans} units` : ""}.`);
  },
};

export const evsTravel: Family = {
  id: "s-evs-travel", ds: [2, 3],
  make(c, d) {
    const [p] = who(c.r, 1);
    const modes = [["bus", int(c.r, 30, 60), int(c.r, 2, 5) * 10], ["auto-rickshaw", int(c.r, 20, 40), int(c.r, 8, 15) * 10], ["metro", int(c.r, 15, 35), int(c.r, 3, 6) * 10], ["cycle", int(c.r, 45, 80), 0]] as [string, number, number][];
    const limit = int(c.r, 30, 55);
    const ok = modes.filter((m) => m[1] <= limit);
    if (!ok.length) return null;
    const best = ok.sort((a, b) => a[2] - b[2] || a[1] - b[1])[0];
    if (ok.filter((m) => m[2] === best[2]).length > 1) return null;
    return item(d, ["DECOMPOSITION", "EVALUATION"], `${p} must reach the science museum within ${limit} minutes and wants to spend as little money as possible. The choices are: ${modes.map((m) => `${m[0]} (${m[1]} min, ${m[2] ? `₹${m[2]}` : "free"})`).join(", ")}. Which should ${p} choose?`, mcq(best[0][0].toUpperCase() + best[0].slice(1), modes.filter((m) => m !== best).map((m) => m[0][0].toUpperCase() + m[0].slice(1))), `First cross out choices that take longer than ${limit} minutes: ${modes.filter((m) => m[1] > limit).map((m) => m[0]).join(", ") || "none"}. Of the rest, the cheapest is the ${best[0]} (${best[2] ? `₹${best[2]}` : "free"}).`);
  },
};

export const evsFamily: Family = {
  id: "s-evs-family", ds: [2, 3],
  make(c, d) {
    const [kid] = who(c.r, 1);
    const qs: [string, string, string[]][] = [
      [`${kid}'s mother's brother`, "Uncle (mama)", ["Grandfather", "Cousin", "Brother"]],
      [`${kid}'s father's father`, "Grandfather (dada)", ["Uncle", "Great-grandfather", "Father"]],
      [`the son of ${kid}'s mother's brother`, "Cousin", ["Brother", "Uncle", "Nephew"]],
      [`${kid}'s father's sister`, "Aunt (bua)", ["Mother", "Grandmother", "Cousin"]],
      [`the daughter of ${kid}'s brother`, "Niece", ["Sister", "Cousin", "Daughter"]],
      [`${kid}'s mother's mother`, "Grandmother (nani)", ["Aunt", "Mother", "Great-grandmother"]],
    ];
    const [t, ans, wrong] = pick(c.r, qs);
    const extra = d === 3 ? ` ${kid} is making a family tree for an EVS project and wants to label everyone correctly. Uncle, aunt, cousin and niece are all on the tree.` : "";
    return item(d, ["ABSTRACT", "DECOMPOSITION"], `${kid} draws a family tree.${extra} How is ${t} related to ${kid}?`, mcq(ans, wrong), `Follow the relation one step at a time from ${kid}: ${t} → ${ans}.`);
  },
};

export const evsQueue: Family = {
  id: "s-evs-queue", ds: [2, 3],
  make(c, d) {
    const [a, b] = who(c.r, 2);
    const n = int(c.r, 12, 30);
    const pa = int(c.r, 2, n - 6), pb = int(c.r, 2, n - pa - 2);
    const between = n - pa - pb;
    if (between < 1) return null;
    return item(d, ["ALGORITHMIC", "ABSTRACT"], `Children stand in a line for the school assembly. ${a} is ${pa}${["th", "st", "nd", "rd"][pa % 10 > 3 || [11, 12, 13].includes(pa % 100) ? 0 : pa % 10]} from the front and ${b} is ${pb}${["th", "st", "nd", "rd"][pb % 10 > 3 || [11, 12, 13].includes(pb % 100) ? 0 : pb % 10]} from the back. There are ${n} children in the line, and ${a} is in front of ${b}. How many children stand BETWEEN ${a} and ${b}?`, numMcq(c.r, between, [between + 1, between - 1, n - pa, n - pb]), `${b} is ${pb}th from the back, so ${b} is ${n - pb + 1}th from the front. The children between them are in positions ${pa + 1} to ${n - pb}: ${n - pb} − ${pa} = ${between}.`);
  },
};

export const SCENARIO_FAMILIES: Family[] = [aiDomainLearning, aiAccuracy, aiSplit, aiBias, aiRules, aiEthics, aiChart, dataMean, safetyCase, aiLifecycle, evsWater, evsPlant, evsAnimalClues, evsFoodChain, evsMapRoute, evsRain, evsWaste, evsEnergy, evsTravel, evsFamily, evsQueue];
