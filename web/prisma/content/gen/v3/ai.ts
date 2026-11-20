// AI chapter engines (Classes 6–8): AI Concepts, Data Literacy, Ethics & Safety.
import type { Colour, Fig } from "../../../../src/lib/figures";
import { type Engine, type Problem, int, pick, sample, NAMES, near, withUnit, cap } from "./core";

// ---------- AI Concepts ----------
const DOMAINS = ["Computer Vision", "Natural Language Processing", "Data Science"] as const;
const DOMAIN_ACCEPT: Record<string, string[]> = { "Computer Vision": ["cv", "computer vision"], "Natural Language Processing": ["nlp", "natural language processing"], "Data Science": ["data science", "ds"] };
const DOMAIN_CASES: [string, string, (typeof DOMAINS)[number]][] = [
  ["📷", "checks photos of mango leaves and marks the ones with disease spots", "Computer Vision"],
  ["🚗", "reads the number plates of cars at the school gate from a camera", "Computer Vision"],
  ["📱", "unlocks a phone by looking at its owner's face", "Computer Vision"],
  ["🏭", "finds cracked tiles on a factory belt from camera pictures", "Computer Vision"],
  ["🩻", "looks at X-ray images and points out possible broken bones", "Computer Vision"],
  ["🚦", "counts vehicles at a crossing from a traffic camera", "Computer Vision"],
  ["🐄", "spots a sick cow from video of the herd", "Computer Vision"],
  ["📝", "turns a photo of handwritten notes into typed text", "Computer Vision"],
  ["🎙️", "turns a spoken message into written text", "Natural Language Processing"],
  ["🌐", "translates a school notice from English into Hindi", "Natural Language Processing"],
  ["💬", "answers parents' typed questions in a chat window", "Natural Language Processing"],
  ["📧", "reads emails and moves spam into a separate folder", "Natural Language Processing"],
  ["🔊", "lets a smart speaker answer the question 'What is the weather today?'", "Natural Language Processing"],
  ["⌨️", "suggests the next word while you type a message", "Natural Language Processing"],
  ["⭐", "reads product reviews and marks each as happy or unhappy", "Natural Language Processing"],
  ["📰", "writes a short summary of a long news article", "Natural Language Processing"],
  ["🛒", "studies past sales to predict how many samosas the canteen should make on Fridays", "Data Science"],
  ["⚡", "predicts next month's electricity bill from past meter readings", "Data Science"],
  ["🎬", "recommends movies based on what a user watched before", "Data Science"],
  ["🌧️", "forecasts rainfall from years of weather records", "Data Science"],
  ["🏦", "flags unusual card payments by studying spending records", "Data Science"],
  ["📚", "groups library members by the kinds of books they borrow", "Data Science"],
  ["🚌", "predicts which buses will be late from past trip records", "Data Science"],
  ["🌾", "predicts crop yield from soil and rainfall records", "Data Science"],
];
const NOT_AI: [string, string][] = [
  ["💡", "a light that switches on when you press its switch"], ["🧮", "a calculator adding two numbers"], ["⏰", "an alarm clock that rings at 6:00 every day"],
  ["🚪", "a door bell that rings when pressed"], ["🌀", "a fan with three fixed speeds"], ["🔦", "a torch with an on/off button"],
  ["🧊", "a fridge that keeps food cold"], ["📺", "a TV remote that changes the channel by one"], ["🕹️", "a toy car that moves only while you hold a button"],
  ["⚖️", "a weighing scale that shows the weight"], ["🖨️", "a printer printing a page"], ["🔐", "a lock that opens with a fixed number code"],
];

export const aiOrNot: Engine = {
  id: "v3-ai-or-not", skill: "AI_CONCEPT", tags: ["ai"], part: "AI", pic: "maybe",
  make(c, d, pic) {
    const yes = pick(c.r, DOMAIN_CASES), nos = sample(c.r, NOT_AI, 3), who = pick(c.r, NAMES);
    if (d < 3) {
      const opts = [`a system that ${yes[1]}`, ...nos.map((n) => n[1])];
      return { skills: ["AI_CONCEPT"], d, ctx: `${who} makes a list of machines ${c.theme.place}. An AI system learns from data and makes its own predictions or decisions; other machines only follow fixed instructions.`, optionFigures: pic ? [yes, ...nos].map(([icon]) => ({ kind: "icons", items: [{ icon }], cols: 1, alt: "A machine" }) as Fig) : undefined, ask: "Which of these uses AI?", say: "The machine that uses AI is ____.", answer: opts[0], wrong: opts.slice(1), fill: false, solution: `Only the system that ${yes[1]} learns from data to make a decision (${yes[2]}). The others just follow one fixed instruction each time.` };
    }
    const [mach, dom] = [yes, yes[2]];
    return { skills: ["AI_CONCEPT", "ABSTRACT"], d, ctx: `${who} reads about a system ${c.theme.place} that ${mach[1]}. It improves as it sees more examples.`, figure: { kind: "icons", items: [{ icon: mach[0] }], cols: 1, alt: "The system" }, ask: "Which AI domain does it belong to?", say: "It belongs to the AI domain called ____.", answer: dom, wrong: [...DOMAINS.filter((x) => x !== dom), "Rule-based automation (not AI)"], accept: DOMAIN_ACCEPT[dom], solution: `${dom === "Computer Vision" ? "It works with pictures or video" : dom === "Natural Language Processing" ? "It works with human language (speech or text)" : "It works with records and numbers to find patterns and predict"}, so it is ${dom}.` };
  },
};

export const aiDomain: Engine = {
  id: "v3-ai-domain", skill: "AI_CONCEPT", tags: ["ai", "industry"], part: "AI", pic: "maybe",
  make(c, d, pic) {
    const who = pick(c.r, NAMES);
    if (d < 3) {
      const [icon, txt, dom] = pick(c.r, DOMAIN_CASES.filter((x) => (d === 1 ? ["Computer Vision", "Natural Language Processing"].includes(x[2]) : true)));
      return { skills: ["AI_CONCEPT"], d, ctx: `${who}'s team ${c.theme.place} builds an AI system that ${txt}.`, figure: pic ? { kind: "icons", items: [{ icon }], cols: 1, alt: "The system" } : undefined, ask: "Which AI domain is this?", say: "This is an example of ____.", answer: dom, wrong: [...DOMAINS.filter((x) => x !== dom), "Rule-based automation (not AI)"], accept: DOMAIN_ACCEPT[dom], solution: `${dom === "Computer Vision" ? "Computer Vision is AI that understands images and video" : dom === "Natural Language Processing" ? "Natural Language Processing is AI that understands human language" : "Data Science is AI that finds patterns in data and records to make predictions"}. This system ${txt}, so it is ${dom}.` };
    }
    const dom = pick(c.r, DOMAINS);
    const ins = sample(c.r, DOMAIN_CASES.filter((x) => x[2] === dom), 3), out = pick(c.r, DOMAIN_CASES.filter((x) => x[2] !== dom));
    const n = ins.length;
    return { skills: ["AI_CONCEPT", "ABSTRACT"], d, ctx: `${who} sorts AI examples ${c.theme.place} into the box labelled **${dom}**:\n\n${sample(c.r, [...ins, out], n + 1).map((x, i) => `${i + 1}. A system that ${x[1]}`).join("\n")}`, figure: pic ? { kind: "icons", items: [...ins, out].map(([icon]) => ({ icon })), cols: 4, alt: "Four AI systems" } : undefined, ask: `Which example should NOT be in the ${dom} box?`, say: `The example that does not belong is the system that ____.`, answer: out[1], wrong: ins.map((x) => x[1]), fill: false, solution: `The system that ${out[1]} is ${out[2]}. The other three are ${dom}.` };
  },
};

export const aiRules: Engine = {
  id: "v3-ai-rules", skill: "AI_CONCEPT", tags: ["ai", "rules"], part: "AI", pic: "never",
  make(c, d) {
    const who = pick(c.r, NAMES);
    const sys = pick(c.r, [
      { name: "a smart fan", a: "temperature (°C)", b: "humidity (%)", ta: int(c.r, 26, 32), tb: int(c.r, 50, 70), yes: "ON", no: "OFF" },
      { name: "a plant-watering robot", a: "hours since last watering", b: "soil dryness (out of 10)", ta: int(c.r, 10, 20), tb: int(c.r, 5, 7), yes: "WATER", no: "WAIT" },
      { name: "a library late-fee helper", a: "days late", b: "books borrowed", ta: int(c.r, 3, 7), tb: int(c.r, 2, 4), yes: "FINE", no: "NO FINE" },
    ]);
    const join = d === 1 ? "and" : pick(c.r, ["and", "or"]);
    const cases = Array.from({ length: d === 3 ? 5 : 1 }, () => [Math.max(0, sys.ta + int(c.r, -Math.min(6, sys.ta), 6)), Math.max(0, sys.tb + int(c.r, -Math.min(8, sys.tb), Math.max(2, Math.min(8, sys.tb))))] as [number, number]);
    const decide = ([x, y]: [number, number]) => (join === "and" ? x > sys.ta && y > sys.tb : x > sys.ta || y > sys.tb);
    const rule = `If ${sys.a} is more than ${sys.ta} **${join}** ${sys.b} is more than ${sys.tb}, the answer is ${sys.yes}; otherwise it is ${sys.no}.`;
    if (d < 3) { const [x, y] = cases[0]; const out = decide([x, y]) ? sys.yes : sys.no; return { skills: ["AI_CONCEPT", "ALGORITHMIC"], d, ctx: `${who} writes a decision rule for ${sys.name} ${c.theme.place}: ${rule}\n\nToday the ${sys.a} is **${x}** and the ${sys.b} is **${y}**.`, ask: "What does the system decide?", say: "The system decides ____.", answer: out, wrong: [out === sys.yes ? sys.no : sys.yes, "It cannot decide", "Both"], solution: `${sys.a} ${x} is ${x > sys.ta ? "more" : "not more"} than ${sys.ta}; ${sys.b} ${y} is ${y > sys.tb ? "more" : "not more"} than ${sys.tb}. With "${join}", ${join === "and" ? "both must be true" : "one true is enough"}: ${out}.` }; }
    const n = cases.filter(decide).length;
    return { skills: ["AI_CONCEPT", "DATA"], d, ctx: `${who} tests a decision rule for ${sys.name} ${c.theme.place}: ${rule}\n\nThe test readings (${sys.a}, ${sys.b}) are: ${cases.map(([x, y]) => `(${x}, ${y})`).join(", ")}.`, ask: `For how many readings does the system say ${sys.yes}?`, say: `The system says ${sys.yes} for ____ readings.`, answer: n, wrong: near(c.r, n, [n + 1, n - 1, 5 - n, cases.filter(([x, y]) => x > sys.ta || y > sys.tb).length]), solution: `Check each reading: ${cases.map((p) => `(${p[0]}, ${p[1]}) → ${decide(p) ? sys.yes : sys.no}`).join("; ")}. Total ${sys.yes}: ${n}.` };
  },
};

const LEARN: [string, string, string][] = [
  ["Supervised learning", "It is trained on thousands of photos, each already labelled with the right answer.", "learns from labelled examples"],
  ["Supervised learning", "Teachers marked 5,000 old answers as right or wrong, and the system learned from them.", "learns from labelled examples"],
  ["Unsupervised learning", "It is given shopping records with no labels and finds groups of similar customers on its own.", "finds groups in unlabelled data"],
  ["Unsupervised learning", "It sorts thousands of unlabelled songs into groups that sound alike.", "finds groups in unlabelled data"],
  ["Reinforcement learning", "A game-playing robot gets points for winning moves and loses points for bad ones, and slowly plays better.", "learns from rewards and penalties"],
  ["Reinforcement learning", "A robot vacuum is rewarded when it cleans a room quickly without bumping into things.", "learns from rewards and penalties"],
];
export const learnType: Engine = {
  id: "v3-learn-type", skill: "AI_CONCEPT", tags: ["ai"], part: "AI", pic: "never", min: 7,
  make(c, d) {
    const [ans, txt, why] = pick(c.r, LEARN), who = pick(c.r, NAMES);
    return { skills: ["AI_CONCEPT"], d, ctx: `${who} reads about an AI system ${c.theme.place}. ${txt}`, ask: "Which type of machine learning is this?", say: "This is ____.", answer: ans, wrong: ["Supervised learning", "Unsupervised learning", "Reinforcement learning", "Rule-based programming"].filter((x) => x !== ans), accept: [ans.toLowerCase().replace(" learning", "")], solution: `The system ${why}, which is ${ans.toLowerCase()}.` };
  },
};

const STAGES = ["Problem scoping", "Data acquisition", "Data exploration", "Modelling", "Evaluation", "Deployment"];
const STAGE_TASKS: [string, number][] = [
  ["deciding exactly what problem the AI should solve and who it is for", 0], ["writing the goal: 'help farmers spot leaf disease early'", 0],
  ["collecting 10,000 leaf photos from farms", 1], ["downloading weather records for five years", 1],
  ["removing blurry photos and drawing charts of the data", 2], ["checking the data for missing values and mistakes", 2],
  ["training the model on the cleaned photos", 3], ["choosing which learning method to use and training it", 3],
  ["testing the model on photos it has never seen and checking its accuracy", 4], ["comparing the model's answers with the right answers", 4],
  ["putting the model into a phone app that farmers use", 5], ["launching the chatbot on the school website", 5],
];
export const lifecycle: Engine = {
  id: "v3-lifecycle", skill: "AI_CONCEPT", tags: ["lifecycle"], part: "AI", pic: "never",
  make(c, d) {
    const who = pick(c.r, NAMES);
    if (d < 3) { const [task, s] = pick(c.r, STAGE_TASKS); return { skills: ["AI_CONCEPT"], d, ctx: `${who}'s team ${c.theme.place} is building an AI project. Right now they are ${task}.`, ask: "Which stage of the AI project cycle is this?", say: "This is the ____ stage.", answer: STAGES[s], wrong: sample(c.r, STAGES.filter((_, i) => i !== s), 3), accept: [STAGES[s].toLowerCase()], solution: `The stages are ${STAGES.join(" → ")}. ${cap(task)} is ${STAGES[s]}.` }; }
    const s = int(c.r, 1, 4);
    return { skills: ["AI_CONCEPT", "ALGORITHMIC"], d, ctx: `${who}'s team ${c.theme.place} has just finished the **${STAGES[s]}** stage of the AI project cycle.`, ask: "Which stage comes next?", say: "The next stage is ____.", answer: STAGES[s + 1], wrong: STAGES.filter((_, i) => i !== s + 1 && i !== s).slice(0, 4), accept: [STAGES[s + 1].toLowerCase()], solution: `The AI project cycle goes ${STAGES.join(" → ")}. After ${STAGES[s]} comes ${STAGES[s + 1]}.` };
  },
};

const INDUSTRY: [string, string, string][] = [
  ["🌾", "drones spot pests in fields and spray only where needed", "Agriculture"], ["🐄", "sensors predict when a cow may fall sick", "Agriculture"], ["🍅", "an app tells farmers the best day to sell tomatoes", "Agriculture"],
  ["🏥", "AI reads scans to help doctors find disease early", "Healthcare"], ["💊", "a chatbot reminds patients to take medicines", "Healthcare"], ["🩺", "a watch warns of an unusual heartbeat", "Healthcare"],
  ["🏦", "AI flags a suspicious card payment", "Banking"], ["💳", "AI checks loan forms for missing details", "Banking"], ["🪙", "a chatbot answers account questions at night", "Banking"],
  ["🚆", "AI predicts train delays and suggests new timings", "Transport"], ["🚕", "an app finds the fastest route around traffic", "Transport"], ["🚌", "buses plan routes using passenger data", "Transport"],
  ["🛍️", "an online shop recommends products you may like", "Retail"], ["📦", "a warehouse predicts how much stock to order", "Retail"],
  ["🎓", "an app gives each student practice at the right level", "Education"], ["📖", "AI reads a textbook aloud for a student who cannot see well", "Education"],
];
export const industry: Engine = {
  id: "v3-industry", skill: "AI_CONCEPT", tags: ["industry", "ai"], part: "AI", pic: "maybe", min: 7,
  make(c, d, pic) {
    const [icon, txt, ans] = pick(c.r, INDUSTRY), who = pick(c.r, NAMES);
    const all = [...new Set(INDUSTRY.map((x) => x[2]))];
    return { skills: ["AI_CONCEPT"], d, ctx: `${who} collects news about AI ${c.theme.place}. One story says: ${txt}.`, figure: pic ? { kind: "icons", items: [{ icon }], cols: 1, alt: "The news story" } : undefined, ask: "Which industry is this AI used in?", say: "This AI is used in ____.", answer: ans, wrong: all.filter((x) => x !== ans), accept: [ans.toLowerCase()], solution: `${cap(txt)} — this helps ${ans === "Agriculture" ? "farming" : ans === "Healthcare" ? "health and medicine" : ans === "Banking" ? "banks and money" : ans === "Transport" ? "travel and transport" : ans === "Retail" ? "shops and selling" : "learning"}, so the industry is ${ans}.` };
  },
};

export const trainSplit: Engine = {
  id: "v3-train-split", skill: "AI_CONCEPT", tags: ["ai"], part: "AI", pic: "never", min: 7,
  make(c, d) {
    const total = pick(c.r, [200, 400, 500, 600, 800, 1000, 1200]), pct = pick(c.r, [70, 75, 80, 90]), who = pick(c.r, NAMES);
    const train = (total * pct) / 100, test = total - train;
    if (!Number.isInteger(train)) return null;
    const what = pick(c.r, ["leaf photos", "voice clips", "handwritten digits", "weather records"]);
    if (d < 3) return { skills: ["AI_CONCEPT", "DATA"], d, ctx: `${who}'s team ${c.theme.place} has ${total} ${what}. They use ${pct}% to train the model and keep the rest to test it on data it has never seen.`, ask: `How many ${what} are kept for testing?`, say: `____ ${what} are kept for testing.`, answer: test, wrong: near(c.r, test, [train, (total * (100 - pct)) / 10, test + 10, pct]), solution: `Testing share = 100% − ${pct}% = ${100 - pct}%. ${100 - pct}% of ${total} = ${test}.` };
    const acc = pick(c.r, [80, 85, 90, 95]), right = (test * acc) / 100;
    if (!Number.isInteger(right)) return null;
    return { skills: ["AI_CONCEPT", "DATA"], d, ctx: `${who}'s team ${c.theme.place} has ${total} ${what}. ${pct}% are used for training and the rest for testing. On the test set, the model is ${acc}% accurate.`, ask: "How many test items does the model get right?", say: "The model gets ____ test items right.", answer: right, wrong: near(c.r, right, [(train * acc) / 100, test, (total * acc) / 100, right + 5]), solution: `Test items = ${100 - pct}% of ${total} = ${test}. Right = ${acc}% of ${test} = ${right}.` };
  },
};

// ---------- Data Literacy ----------
const DATASETS: { title: string; labels: string[] }[] = [
  { title: "Photos in each class of the dataset", labels: ["Cat", "Dog", "Cow", "Goat"] },
  { title: "Votes for the club name", labels: ["Robo", "Pixel", "Byte", "Spark"] },
  { title: "Students' favourite subject", labels: ["Maths", "Science", "English", "Art"] },
  { title: "Fruit photos collected", labels: ["Mango", "Apple", "Banana", "Guava"] },
  { title: "How students come to school", labels: ["Bus", "Walk", "Cycle", "Car"] },
];
export const dataBars: Engine = {
  id: "v3-data-bars", skill: "DATA", tags: ["data", "ai"], part: "AI", pic: "always",
  make(c, d) {
    const ds = pick(c.r, DATASETS), unit = d === 1 ? 5 : 10;
    const values = ds.labels.map(() => int(c.r, 2, 9) * unit);
    const figure: Fig = { kind: "bars", title: ds.title, labels: ds.labels, values, step: unit * 2, showValues: d === 1, alt: `${ds.title}: ${ds.labels.map((l, i) => `${l} ${values[i]}`).join(", ")}` };
    const who = pick(c.r, NAMES), total = values.reduce((a, b) => a + b, 0);
    const ctx = `${who} collected data ${c.theme.place} and drew this bar graph.${d > 1 ? " Read the scale on the left carefully." : ""}`;
    const i = int(c.r, 0, 3), j = (i + int(c.r, 1, 3)) % 4;
    if (d === 1) return { skills: ["DATA"], d, ctx, figure, ask: "What is the total of all the bars?", say: "The total is ____.", answer: total, wrong: near(c.r, total, [total - values[0], total + unit, Math.max(...values) * 4, total - unit]), solution: `Add the bars: ${values.join(" + ")} = ${total}.` };
    if (d === 2) { if (values[i] === values[j]) return null; const diff = Math.abs(values[i] - values[j]); const [hi, lo] = values[i] > values[j] ? [i, j] : [j, i]; return { skills: ["DATA"], d, ctx, figure, ask: `How many more does ${ds.labels[hi]} have than ${ds.labels[lo]}?`, say: `${ds.labels[hi]} has ____ more than ${ds.labels[lo]}.`, answer: diff, wrong: near(c.r, diff, [values[hi], values[lo], diff + unit, values[hi] + values[lo]]), solution: `${ds.labels[hi]} = ${values[hi]}, ${ds.labels[lo]} = ${values[lo]}. Difference ${values[hi]} − ${values[lo]} = ${diff}.` }; }
    if (c.cls >= 7) { if ((values[i] * 100) % total !== 0) return null; const pct = (values[i] * 100) / total; return { skills: ["DATA"], d, ctx, figure, ask: `What percentage of the total is ${ds.labels[i]}?`, say: `${ds.labels[i]} is ____% of the total.`, answer: pct, wrong: near(c.r, pct, [values[i], pct + 5, pct - 5, 25]), show: (v) => `${v}%`, unitNote: "as a percentage", solution: `Total = ${total}. ${values[i]} ÷ ${total} × 100 = ${pct}%.` }; }
    const mx = Math.max(...values), mn = Math.min(...values);
    return { skills: ["DATA"], d, ctx, figure, ask: "What is the range of the data (largest minus smallest)?", say: "The range is ____.", answer: mx - mn, wrong: near(c.r, mx - mn, [mx, mn, mx + mn, total / 4]), solution: `Largest ${mx}, smallest ${mn}. Range = ${mx} − ${mn} = ${mx - mn}.` };
  },
};

export const accuracyTicks: Engine = {
  id: "v3-accuracy-ticks", skill: "DATA", tags: ["ai", "data"], part: "AI", pic: "always",
  make(c, d) {
    const n = d === 1 ? 10 : pick(c.r, [10, 12, 15, 16, 20]);
    const right = int(c.r, Math.ceil(n * 0.5), n - 1);
    const pct = (right / n) * 100;
    if (d > 1 && !Number.isInteger(pct * 10)) return null;
    const what = pick(c.r, [["🐱", "cat photos"], ["🍎", "fruit photos"], ["✉️", "emails"], ["🌿", "leaf photos"]]);
    const marks = sample(c.r, Array.from({ length: n }, (_, k) => (k < right ? "tick" : "cross")), n) as ("tick" | "cross")[];
    const figure: Fig = { kind: "icons", items: marks.map((m) => ({ icon: what[0], mark: m })), cols: 5, alt: `${n} test items, ${right} ticked` };
    const who = pick(c.r, NAMES);
    const ctx = `${who} tests an AI model ${c.theme.place} on ${n} ${what[1]} it has never seen. A green tick means the model was right; a red cross means it was wrong.`;
    if (d === 1) return { skills: ["DATA", "AI_CONCEPT"], d, ctx, figure, ask: "How many did the model get wrong?", say: "The model got ____ wrong.", answer: n - right, wrong: near(c.r, n - right, [right, n, n - right + 1, n - right - 1]), solution: `Count the crosses: ${n - right}. (Ticks: ${right}, total ${n}.)` };
    if (!Number.isInteger(pct)) return null;
    return { skills: ["DATA", "AI_CONCEPT"], d, ctx, figure, ask: "What is the model's accuracy?", say: "The accuracy is ____%.", answer: pct, wrong: near(c.r, pct, [right, 100 - pct, pct + 5, Math.round((right / (n + 1)) * 100)]), show: (v) => `${v}%`, unitNote: "as a percentage", solution: `Accuracy = right ÷ total × 100 = ${right} ÷ ${n} × 100 = ${pct}%.` };
  },
};

export const meanData: Engine = {
  id: "v3-mean-data", skill: "DATA", tags: ["data", "ai"], part: "AI", pic: "maybe",
  make(c, d, pic) {
    const n = int(c.r, 4, 6), who = pick(c.r, NAMES);
    const vals = Array.from({ length: n }, () => int(c.r, 10, 40));
    const sum = vals.reduce((a, b) => a + b, 0);
    if (sum % n) return null;
    const mean = sum / n, labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].slice(0, n);
    const what = pick(c.r, ["messages the school chatbot answered", "photos uploaded to the class album", "books borrowed from the library", "minutes of screen time"]);
    const figure: Fig | undefined = pic ? { kind: "bars", title: cap(what), labels, values: vals, step: 10, showValues: true, alt: `${labels.map((l, i) => `${l} ${vals[i]}`).join(", ")}` } : undefined;
    const ctx = `${who} recorded the number of ${what} ${c.theme.place} each day: ${vals.join(", ")}.`;
    if (d < 3) return { skills: ["DATA"], d, ctx, figure, ask: d === 1 ? "What is the largest value minus the smallest value (the range)?" : "What is the mean (average) per day?", say: d === 1 ? "The range is ____." : "The mean is ____ per day.", answer: d === 1 ? Math.max(...vals) - Math.min(...vals) : mean, wrong: d === 1 ? near(c.r, Math.max(...vals) - Math.min(...vals), [Math.max(...vals), Math.min(...vals), mean]) : near(c.r, mean, [sum, Math.round(sum / (n + 1)), mean + 1, (Math.max(...vals) + Math.min(...vals)) / 2].filter(Number.isInteger)), solution: d === 1 ? `Largest ${Math.max(...vals)}, smallest ${Math.min(...vals)}, range ${Math.max(...vals) - Math.min(...vals)}.` : `Mean = total ÷ days = ${sum} ÷ ${n} = ${mean}.` };
    const target = mean + int(c.r, 1, 4), x = target * (n + 1) - sum;
    if (x <= 0) return null;
    return { skills: ["DATA", "ALGORITHMIC"], d, ctx, figure, ask: `After one more day, the mean becomes ${target}. What was the number on that day?`, say: `If the mean becomes ${target} after one more day, the number on that day was ____.`, answer: x, wrong: near(c.r, x, [target, x - n, target * n - sum, x + 1]), solution: `New total = ${target} × ${n + 1} = ${target * (n + 1)}. Old total = ${sum}. Extra day = ${target * (n + 1)} − ${sum} = ${x}.` };
  },
};

const DATA_KIND: [string, string, string][] = [
  ["the names of students' favourite games", "Qualitative (categories)", "Quantitative (numbers)"], ["the heights of students in cm", "Quantitative (numbers)", "Qualitative (categories)"],
  ["the colours of cars in the parking lot", "Qualitative (categories)", "Quantitative (numbers)"], ["the number of books each student read", "Quantitative (numbers)", "Qualitative (categories)"],
  ["the marks scored in a test", "Quantitative (numbers)", "Qualitative (categories)"], ["the languages spoken at home", "Qualitative (categories)", "Quantitative (numbers)"],
  ["the time taken to run 100 m", "Quantitative (numbers)", "Qualitative (categories)"], ["the type of pet each family has", "Qualitative (categories)", "Quantitative (numbers)"],
];
const STRUCT: [string, string][] = [
  ["an attendance sheet with columns Name, Date, Present", "Structured"], ["a folder of holiday photos", "Unstructured"], ["a spreadsheet of marks", "Structured"],
  ["voice notes sent on a phone", "Unstructured"], ["a railway timetable table", "Structured"], ["a pile of handwritten letters", "Unstructured"], ["videos of a school play", "Unstructured"], ["a table of daily temperatures", "Structured"],
];
export const dataKind: Engine = {
  id: "v3-data-kind", skill: "DATA", tags: ["data", "ai"], part: "AI", pic: "never",
  make(c, d) {
    const who = pick(c.r, NAMES);
    if (d === 1 || (d === 2 && c.r() < 0.5)) { const [txt, ans, other] = pick(c.r, DATA_KIND); return { skills: ["DATA"], d, ctx: `${who} collects data ${c.theme.place}: ${txt}.`, ask: "What kind of data is this?", say: "This data is ____.", answer: ans, wrong: [other, "Neither — it is not data", "Both at the same time"], fill: false, solution: `${ans.startsWith("Qual") ? "The values are names or categories, not measurements" : "The values are numbers that can be counted or measured"}: ${ans}.` }; }
    const [txt, ans] = pick(c.r, STRUCT);
    return { skills: ["DATA", "ABSTRACT"], d, ctx: `${who} looks at different kinds of data ${c.theme.place}. One example is ${txt}.`, ask: "Is this structured or unstructured data?", say: "This is ____ data.", answer: ans, wrong: [ans === "Structured" ? "Unstructured" : "Structured", "Not data at all", "Random data"], accept: [ans.toLowerCase()], solution: `${ans === "Structured" ? "It is arranged in rows and columns with fixed fields" : "It has no fixed rows and columns (pictures, sound, video or free text)"}, so it is ${ans.toLowerCase()} data.` };
  },
};

const CHARTS: [string, string][] = [
  ["how a city's temperature changed every hour from morning to evening", "Line graph"], ["the number of books borrowed by each of five classes", "Bar graph"],
  ["what share of a family's spending goes on food, rent, travel and savings", "Pie chart"], ["a plant's height week after week", "Line graph"],
  ["the marks of four students in one test", "Bar graph"], ["the share of students who come by bus, car, cycle and on foot", "Pie chart"],
  ["how many visitors a website had each month of the year", "Line graph"], ["the number of medals won by each house", "Bar graph"],
];
export const chartChoice: Engine = {
  id: "v3-chart-choice", skill: "DATA", tags: ["data", "ai"], part: "AI", pic: "never",
  make(c, d) {
    const [txt, ans] = pick(c.r, CHARTS), who = pick(c.r, NAMES);
    return { skills: ["DATA"], d, ctx: `${who} wants to show ${txt} ${c.theme.place}. The chart must make the main idea clear at a glance.`, ask: "Which chart should be used?", say: "The best chart is a ____.", answer: ans, wrong: ["Line graph", "Bar graph", "Pie chart", "Scatter of random dots"].filter((x) => x !== ans), accept: [ans.toLowerCase()], solution: `${ans === "Line graph" ? "The data changes over time; a line graph shows rises and falls." : ans === "Bar graph" ? "The data compares separate groups; bars make comparison easy." : "The data is parts of one whole; a pie chart shows each share."} So: ${ans}.` };
  },
};

// ---------- Ethics & Safety ----------
const PRINCIPLES = ["Privacy", "Fairness", "Transparency", "Accountability", "Safety"];
const ETHICS: [string, string, string][] = [
  ["📍", "A fitness app shares users' location history with advertisers without asking them.", "Privacy"],
  ["📸", "An app stores children's photos on a website where anyone can download them.", "Privacy"],
  ["🎤", "A smart speaker records family conversations and keeps them without telling anyone.", "Privacy"],
  ["👩‍💼", "A job-screening AI rejects most women because it learned from old hiring records that were mostly men.", "Fairness"],
  ["🙂", "A face-unlock feature often fails for people with darker skin.", "Fairness"],
  ["🗣️", "A voice assistant understands city accents well but often fails for village accents.", "Fairness"],
  ["📝", "A school's AI gives an essay a low mark, but no one can explain why.", "Transparency"],
  ["🏦", "A bank's AI refuses a loan, and the bank only says 'the computer decided'.", "Transparency"],
  ["🚌", "A self-driving bus company refuses to take responsibility after its AI causes an accident.", "Accountability"],
  ["💊", "A hospital changes a patient's medicine because the AI said so, and no doctor checks it.", "Accountability"],
  ["🤖", "A delivery robot is sent onto busy roads before it has been tested properly.", "Safety"],
  ["🚗", "A car's auto-brake is switched on before it is checked in rain and fog.", "Safety"],
  ["🏫", "A school's face-recognition cameras share students' face data with an advertising company without asking anyone.", "Privacy"],
  ["🛍️", "A shopping app keeps selling customers' phone numbers to other companies.", "Privacy"],
  ["🧑‍⚕️", "A health app works well for men but often misreads women's symptoms, because its training data came mostly from men.", "Fairness"],
  ["🏠", "A loan AI gives lower scores to people from certain pin codes, even with the same income.", "Fairness"],
  ["📚", "An AI that picks scholarship winners will not say which marks or answers it looked at.", "Transparency"],
  ["📰", "A news app hides that its headlines are chosen by an AI to keep people scrolling.", "Transparency"],
  ["🏭", "A factory blames 'the algorithm' when its AI wrongly cuts workers' pay, and nobody fixes it.", "Accountability"],
  ["⚖️", "A city uses an AI to decide traffic fines, and there is no way for people to appeal to a human.", "Accountability"],
  ["🚁", "A drone that delivers medicines is flown over a crowded market before any safety trials.", "Safety"],
  ["🧸", "A talking toy for small children is sold without checking what it might say to them.", "Safety"],
];
export const ethicsPrinciple: Engine = {
  id: "v3-ethics-principle", skill: "ETHICS", tags: ["ethics", "ai"], part: "AI", pic: "maybe",
  make(c, d, pic) {
    const who = pick(c.r, NAMES);
    if (d < 3) { const [icon, txt, ans] = pick(c.r, ETHICS); return { skills: ["ETHICS"], d, ctx: `${who} discusses news stories ${c.theme.place}. ${txt}`, figure: pic ? { kind: "icons", items: [{ icon }], cols: 1, alt: "The news story" } : undefined, ask: "Which principle of responsible AI is MOST clearly broken?", say: "The principle that is broken is ____.", answer: ans, wrong: PRINCIPLES.filter((x) => x !== ans), accept: [ans.toLowerCase()], solution: `${ans === "Privacy" ? "Personal data is collected or shared without permission" : ans === "Fairness" ? "One group of people is treated worse than another" : ans === "Transparency" ? "People cannot find out how or why the AI decided" : ans === "Accountability" ? "No person checks the AI or takes responsibility for it" : "The system is used before it is shown to be safe"} — that is ${ans}.` }; }
    const three = sample(c.r, ETHICS, 3), target = pick(c.r, [...new Set(three.map((x) => x[2]))]);
    const n = three.filter((x) => x[2] === target).length;
    return { skills: ["ETHICS", "DECOMPOSITION"], d, ctx: `${who} reads three situations ${c.theme.place}:\n\n${three.map((x, i) => `${i + 1}. ${x[1]}`).join("\n")}`, figure: pic ? { kind: "icons", items: three.map(([icon]) => ({ icon })), cols: 3, alt: "Three situations" } : undefined, ask: `In how many of these is the main problem about **${target}**?`, say: `The number of these situations that are about ${target} is ____.`, answer: n, wrong: [0, 1, 2, 3].filter((x) => x !== n), solution: `Classify each one: ${three.map((x, i) => `${i + 1} → ${x[2]}`).join("; ")}. ${n} ${n === 1 ? "is" : "are"} about ${target}.` };
  },
};

const SAFETY: [string, string, string[]][] = [
  ["A message says: 'You won a free tablet! Click this link and type your parent's card number.'", "Do not click; tell a parent and delete the message", ["Click but give a fake number", "Forward it to friends", "Reply asking for details"]],
  ["A simple puzzle game asks for permission to use contacts, location and the microphone.", "Deny the permissions it does not need, or do not install it", ["Allow everything so it runs faster", "Share your password with the game", "Allow only location"]],
  ["Someone made a fake account with a classmate's photo and posts rude comments.", "Tell a trusted adult and report the account", ["Post rude comments back", "Ignore it and tell no one", "Share passwords so friends can fix it"]],
  ["You find a great photo for your project on a photographer's website.", "Use it only if allowed, and give credit", ["Say you took the photo", "Edit it a little and use it without credit", "Download all their photos"]],
  ["An online friend you have never met asks for your home address and school name.", "Do not share; tell a trusted adult", ["Share only your school name", "Share it if they seem kind", "Send a photo of your house instead"]],
  ["A website asks you to make a password for your school account.", "Use a long password with letters, numbers and symbols, and keep it secret", ["Use your name and birthday", "Use 123456 so you remember it", "Use the same password as your friend"]],
  ["A video you watched online says something shocking about a famous person.", "Check it on trusted news sites before believing or sharing it", ["Share it at once", "Believe it because many people watched it", "Comment that it is true"]],
  ["You used a shared computer in the library to check your email.", "Log out and close the browser before leaving", ["Leave it open for the next person", "Save your password on that computer", "Write your password on a note"]],
];
export const safety: Engine = {
  id: "v3-safety", skill: "ETHICS", tags: ["safety"], part: "AI", pic: "never",
  make(c, d) {
    const [txt, ans, wrong] = pick(c.r, SAFETY), who = pick(c.r, NAMES);
    return { skills: ["ETHICS"], d, ctx: `${who} learns about staying safe online ${c.theme.place}. ${txt}`, ask: "What is the most responsible thing to do?", say: "The responsible thing to do is: ____.", answer: ans, wrong, fill: false, solution: `A responsible digital citizen protects personal information, respects others' work, checks facts and asks a trusted adult for help. Best choice: ${ans}.` };
  },
};

export const biasBars: Engine = {
  id: "v3-bias-bars", skill: "ETHICS", tags: ["ethics", "data", "ai"], part: "AI", pic: "always",
  make(c, d) {
    const set = pick(c.r, [
      { title: "Voice clips in the training data", labels: ["City", "Village", "Hill", "Coastal"], what: "accent", task: "voice assistant" },
      { title: "Face photos in the training data", labels: ["Age 5–15", "Age 16–40", "Age 41–60", "Age 60+"], what: "age group", task: "face-unlock app" },
      { title: "Handwriting samples", labels: ["Hindi", "English", "Tamil", "Bangla"], what: "script", task: "handwriting reader" },
    ]);
    const values = set.labels.map(() => int(c.r, 3, 12) * 50);
    const lo = values.indexOf(Math.min(...values));
    if (values.filter((v) => v === values[lo]).length > 1) return null;
    const figure: Fig = { kind: "bars", title: set.title, labels: set.labels, values, step: 100, showValues: d < 3, alt: `${set.labels.map((l, i) => `${l} ${values[i]}`).join(", ")}` };
    const who = pick(c.r, NAMES);
    if (d < 3) return { skills: ["ETHICS", "DATA"], d, ctx: `${who}'s team ${c.theme.place} trains a ${set.task} using the data in the graph. An AI usually works worst for the group it saw least during training.`, figure, ask: `For which ${set.what} is the ${set.task} most likely to make mistakes?`, say: `It will most likely make mistakes for ____.`, answer: set.labels[lo], wrong: set.labels.filter((_, i) => i !== lo), accept: [set.labels[lo].toLowerCase()], solution: `${set.labels[lo]} has the fewest examples (${values[lo]}), so the model learns least about it. To be fair, the team should collect more ${set.labels[lo]} data.` };
    const need = Math.max(...values) - values[lo];
    return { skills: ["ETHICS", "DATA"], d, ctx: `${who}'s team ${c.theme.place} trains a ${set.task} using the data in the graph. To be fair, they want the smallest group to have as many examples as the largest group.`, figure, ask: `How many more ${set.labels[lo]} examples must they collect?`, say: `They must collect ____ more ${set.labels[lo]} examples.`, answer: need, wrong: near(c.r, need, [Math.max(...values), values[lo], need + 50, need - 50]), solution: `Largest group ${Math.max(...values)}, smallest (${set.labels[lo]}) ${values[lo]}. Needed: ${Math.max(...values)} − ${values[lo]} = ${need}.` };
  },
};

export const password: Engine = {
  id: "v3-password", skill: "ETHICS", tags: ["safety"], part: "AI", pic: "never",
  make(c, d) {
    const who = pick(c.r, NAMES);
    const rule = "A strong password has **at least 10 characters** and uses **capital letters, small letters, numbers and symbols**.";
    const base = pick(c.r, ["mango", "tiger", "river", "cloud", "rocket", "pixel"]), n = int(c.r, 10, 99);
    const strong = `${cap(base)}#${n}${pick(c.r, ["Sky", "Run", "Box"])}!`;
    const weak = [`${base}${n}`, `${cap(base)}${n}${n}`, `${base}#${n}!`, `${who.toLowerCase()}2014`, `${cap(base)}!${n}`];
    const ok = (p: string) => p.length >= 10 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /\d/.test(p) && /[^A-Za-z0-9]/.test(p);
    const wrong = weak.filter((p) => !ok(p));
    if (!ok(strong) || wrong.length < 3) return null;
    const why = (p: string) => [p.length < 10 ? "too short" : "", /[A-Z]/.test(p) ? "" : "no capital letter", /[^A-Za-z0-9]/.test(p) ? "" : "no symbol", /\d/.test(p) ? "" : "no number"].filter(Boolean).join(", ");
    return { skills: ["ETHICS", "ABSTRACT"].slice(0, d === 3 ? 2 : 1), d, ctx: `${who} is making a new account ${c.theme.place}. ${rule}`, ask: "Which password follows the rule?", say: "The password that follows the rule is ____.", answer: strong, wrong: wrong.slice(0, 3), fill: false, show: (v) => `\`${v}\``, solution: `${strong} has ${strong.length} characters with capitals, small letters, numbers and symbols. ${wrong.slice(0, 3).map((p) => `${p}: ${why(p)}`).join("; ")}.` };
  },
};

// Accuracy for different groups: is the model fair?
export const fairness: Engine = {
  id: "v3-fairness", skill: "ETHICS", tags: ["ethics", "ai"], part: "AI", pic: "always",
  make(c, d) {
    const set = pick(c.r, [
      { task: "face-unlock app", groups: ["Light skin", "Dark skin"] }, { task: "voice assistant", groups: ["City accent", "Village accent"] },
      { task: "handwriting reader", groups: ["Adults", "Children"] }, { task: "plant-disease app", groups: ["Farm A photos", "Farm B photos"] },
    ]);
    const n = pick(c.r, [20, 25, 50]), acc = set.groups.map(() => pick(c.r, [60, 64, 68, 72, 76, 80, 84, 88, 92, 96]));
    if (acc[0] === acc[1] || acc.some((a) => !Number.isInteger((a * n) / 100))) return null;
    const right = acc.map((a) => (a * n) / 100);
    const figure: Fig = { kind: "bars", title: `Correct answers out of ${n} tests`, labels: set.groups, values: right, step: n <= 25 ? 5 : 10, showValues: true, alt: `${set.groups[0]}: ${right[0]} correct; ${set.groups[1]}: ${right[1]} correct` };
    const who = pick(c.r, NAMES), lo = acc[0] < acc[1] ? 0 : 1;
    const ctx = `${who}'s team ${c.theme.place} tests a ${set.task} on ${n} examples from each group. The graph shows how many it got right for each group.`;
    if (d === 1) return { skills: ["ETHICS", "DATA"], d, ctx, figure, ask: "For which group does the app work less well?", say: "The app works less well for the group: ____.", answer: set.groups[lo], wrong: [set.groups[1 - lo], "Both groups equally", "We cannot tell from the graph"], fill: false, solution: `${set.groups[lo]} has fewer correct answers (${right[lo]} out of ${n}) than ${set.groups[1 - lo]} (${right[1 - lo]} out of ${n}). The app is not equally fair to both groups.` };
    if (d === 2) return { skills: ["ETHICS", "DATA"], d, ctx, figure, ask: `What is the accuracy for ${set.groups[lo]}?`, say: `For ${set.groups[lo]}, the accuracy is ____%.`, answer: acc[lo], wrong: near(c.r, acc[lo], [right[lo], acc[1 - lo], 100 - acc[lo], acc[lo] + 5]), show: (v) => `${v}%`, unitNote: "as a percentage", solution: `Accuracy = ${right[lo]} ÷ ${n} × 100 = ${acc[lo]}%.` };
    const gap = Math.abs(acc[0] - acc[1]);
    return { skills: ["ETHICS", "DATA"], d, ctx, figure, ask: "By how many percentage points is the accuracy for the two groups different?", say: "The accuracy gap is ____ percentage points.", answer: gap, wrong: near(c.r, gap, [Math.abs(right[0] - right[1]), gap + 4, gap - 4, acc[lo]]), unitNote: "in percentage points", solution: `${set.groups[0]}: ${right[0]} ÷ ${n} = ${acc[0]}%. ${set.groups[1]}: ${right[1]} ÷ ${n} = ${acc[1]}%. Gap = ${gap} percentage points. A big gap means the team should collect more data from ${set.groups[lo]} and test again.` };
  },
};

// Nearest neighbour: label a new example like the closest known example.
export const nearest: Engine = {
  id: "v3-nearest", skill: "AI_CONCEPT", tags: ["ai"], part: "AI", pic: "never",
  make(c, d) {
    const k = pick(c.r, [
      { what: "fruit", f1: "length (cm)", f2: "width (cm)", labels: ["Lemon", "Banana"] },
      { what: "animal", f1: "height (cm)", f2: "weight (kg)", labels: ["Goat", "Cow"] },
      { what: "parcel", f1: "weight (kg)", f2: "length (cm)", labels: ["Small", "Large"] },
    ]);
    const pts = [[int(c.r, 2, 6), int(c.r, 2, 6), 0], [int(c.r, 3, 7), int(c.r, 3, 7), 0], [int(c.r, 10, 14), int(c.r, 10, 14), 1], [int(c.r, 11, 15), int(c.r, 11, 15), 1]];
    const nw = [int(c.r, 4, 13), int(c.r, 4, 13)];
    const dist = (p: number[]) => Math.abs(p[0] - nw[0]) + Math.abs(p[1] - nw[1]);
    const ds = pts.map(dist), best = Math.min(...ds);
    if (ds.filter((x) => x === best).length > 1) return null;
    const near0 = pts[ds.indexOf(best)];
    const ans = k.labels[near0[2]];
    const who = pick(c.r, NAMES);
    const table = pts.map((p) => `${p[0]}, ${p[1]} → ${k.labels[p[2]]}`).join("; ");
    return { skills: d === 3 ? ["AI_CONCEPT", "DATA"] : ["AI_CONCEPT"], d, ctx: `${who} builds a simple AI ${c.theme.place} that labels a new ${k.what} the same as the **closest** known example. "Closest" means the smallest total difference in ${k.f1} and ${k.f2}. Known examples (${k.f1}, ${k.f2} → label): ${table}. A new ${k.what} has ${k.f1} ${nw[0]} and ${k.f2} ${nw[1]}.`, ask: `What label does the AI give the new ${k.what}?`, say: `The AI labels the new ${k.what} as ____.`, answer: ans, wrong: [k.labels[1 - near0[2]], "It cannot decide", "Both labels"], accept: [ans.toLowerCase()], solution: `Total difference = |${k.f1} difference| + |${k.f2} difference|: ${pts.map((p, i) => `${k.labels[p[2]]} (${p[0]}, ${p[1]}) → ${Math.abs(p[0] - nw[0])} + ${Math.abs(p[1] - nw[1])} = ${ds[i]}`).join("; ")}. The closest is ${k.labels[near0[2]]} (${near0[0]}, ${near0[1]}), so the label is ${ans}.` };
  },
};

/** Teacher-marked short answers for the AI chapters (CBSE exercises have these too). */
export const aiShort = (c: { r: () => number; theme: { place: string } }): { stem: string; model: string; skills: string[] } => {
  const k = int(c.r, 0, 2);
  if (k === 0) { const [, txt, ans] = pick(c.r, ETHICS); return { stem: `${txt}\n\nWhich principle of responsible AI is broken here? Explain in two or three sentences, and suggest one way to fix it.`, model: `${ans} is broken. ${ans === "Privacy" ? "Personal data was used or shared without permission. Fix: ask for clear permission and keep the data secure." : ans === "Fairness" ? "The AI treats some people worse because its data did not represent them well. Fix: collect balanced data and test for every group." : ans === "Transparency" ? "People cannot learn why the AI decided. Fix: explain the main reasons for each decision and let people ask questions." : ans === "Accountability" ? "No person checks the AI or takes responsibility. Fix: a trained person must review important decisions and be responsible." : "The system was used before it was proven safe. Fix: test it carefully in safe conditions before using it with people."}`, skills: ["ETHICS"] }; }
  if (k === 1) { const [, txt, dom] = pick(c.r, DOMAIN_CASES); return { stem: `An AI system ${txt}. Name its AI domain and explain what kind of data it learns from.`, model: `${dom}. ${dom === "Computer Vision" ? "It learns from images or video, such as labelled photos." : dom === "Natural Language Processing" ? "It learns from human language — written text or recorded speech." : "It learns from records and numbers, finding patterns to make predictions."}`, skills: ["AI_CONCEPT"] }; }
  const [txt, ans] = pick(c.r, CHARTS); return { stem: `You want to show ${txt}. Which chart would you choose, and why?`, model: `${ans}. ${ans === "Line graph" ? "It shows how the values change over time." : ans === "Bar graph" ? "It compares separate groups side by side." : "It shows each part as a share of the whole."}`, skills: ["DATA"] };
};

export const AI_ENGINES = [fairness, nearest, aiOrNot, aiDomain, aiRules, learnType, lifecycle, industry, trainSplit, dataBars, accuracyTicks, meanData, dataKind, chartChoice, ethicsPrinciple, safety, biasBars, password];
void withUnit; void ({} as Problem); void ({} as Colour);
