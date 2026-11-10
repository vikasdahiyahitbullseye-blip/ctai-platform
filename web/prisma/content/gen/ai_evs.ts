// Number-based families for AI/data chapters and EVS themes. Answers are computed.
import { type Family, int, pick, sample, textOptions, NAMES, DAYS } from "./util";

// ---------------- AI / data ----------------
export const predictNext: Family = {
  id: "ai-predict-next", ds: [1, 2],
  make(c, d) {
    const ctxs = [["Samosas sold in the canteen", ""], ["Visitors to the science fair", ""], ["Temperature at noon", "°C"], ["Books borrowed from the library", ""], ["Litres of milk collected", " L"]] as const;
    const [what, unit] = pick(c.r, ctxs);
    const start = int(c.r, 10, 60), step = d === 1 ? pick(c.r, [2, 5, 10]) : pick(c.r, [3, 4, 6, 7]);
    const days = DAYS.slice(0, 4);
    const vals = days.map((_, i) => start + i * step);
    return { d, skills: ["DATA", "PATTERN", "AI_CONCEPT"], type: "NUMERIC", stem: `${what}:\n\n| Day | Value |\n|---|---|\n${days.map((dd, i) => `| ${dd} | ${vals[i]}${unit} |`).join("\n")}\n\nIf the pattern continues, predict the value for **Friday**.`, answer: vals[3] + step, solution: `It goes up by ${step} each day: ${vals[3]} + ${step} = ${vals[3] + step}. Using a pattern in past data to predict a number is what regression does.` };
  },
};

export const ifElseRule: Family = {
  id: "ai-if-else", ds: [2, 3],
  make(c, d) {
    const kind = pick(c.r, [["temperature", "°C", ["Hot", "Warm", "Cool"], 30, 20], ["marks", "", ["Excellent", "Good", "Keep practising"], 80, 50], ["rainfall", " mm", ["Heavy rain", "Light rain", "Dry"], 50, 5]] as const);
    const [name, unit, labels, hi, lo] = kind;
    const v = d === 2 ? pick(c.r, [hi + int(c.r, 1, 15), lo + int(c.r, 1, hi - lo - 1), Math.max(0, lo - int(c.r, 1, 5))]) : pick(c.r, [hi, lo]);
    const ans = v > hi ? labels[0] : v > lo ? labels[1] : labels[2];
    const o = textOptions(ans, [...labels]);
    return { d, skills: ["ALGORITHMIC", "AI_CONCEPT"], type: "MCQ", stem: `A simple decision rule:\n- IF ${name} > ${hi}${unit} THEN say **"${labels[0]}"**\n- ELSE IF ${name} > ${lo}${unit} THEN say **"${labels[1]}"**\n- ELSE say **"${labels[2]}"**\n\nWhat does the rule say for **${v}${unit}**?`, ...o, solution: `${v} ${v > hi ? `is more than ${hi}` : `is not more than ${hi}`}${v > hi ? "" : v > lo ? `, but it is more than ${lo}` : `, and not more than ${lo}`}, so "${ans}".${d === 3 ? ` Careful: "> ${v}" means strictly greater, so ${v} itself does not pass that test.` : ""}`, hint: d === 3 ? "Is the value strictly greater than the limit?" : undefined };
  },
};

export const accuracyPct: Family = {
  id: "ai-accuracy", ds: [2, 3],
  make(c, d) {
    const total = pick(c.r, [20, 25, 40, 50, 80, 100, 200]);
    const pct = d === 2 ? pick(c.r, [50, 60, 75, 80, 90]) : pick(c.r, [65, 70, 85, 95]);
    const right = (total * pct) / 100;
    if (!Number.isInteger(right)) return null;
    const thing = pick(c.r, ["leaf photos", "handwritten digits", "fruit photos", "test emails", "animal sounds"]);
    if (d === 2) return { d, skills: ["DATA", "AI_CONCEPT"], type: "NUMERIC", stem: `A model is tested on **${total} ${thing}** it has never seen. It gets **${right}** right. What is its **accuracy** in percent?`, answer: pct, solution: `${right} ÷ ${total} × 100 = ${pct}%.` };
    return { d, skills: ["DATA", "AI_CONCEPT", "EVALUATION"], type: "NUMERIC", stem: `A model is **${pct}% accurate** on **${total} ${thing}**. How many does it get **wrong**?`, answer: total - right, solution: `Right: ${pct}% of ${total} = ${right}. Wrong: ${total} − ${right} = ${total - right}.` };
  },
};

export const groupErrors: Family = {
  id: "ai-group-errors", ds: [3],
  make(c, d) {
    const n = pick(c.r, [100, 200, 400]), a = pick(c.r, [90, 95, 98]), b = pick(c.r, [60, 70, 75, 80]);
    const groups = pick(c.r, [["city voices", "village voices"], ["adults' faces", "children's faces"], ["photos taken in daylight", "photos taken at night"], ["boys' handwriting", "girls' handwriting"]]);
    return { d, skills: ["DATA", "ETHICS"], type: "NUMERIC", stem: `A model is **${a}% accurate** on ${groups[0]} and **${b}% accurate** on ${groups[1]}, with **${n}** examples in each group. How many **more mistakes** does it make on ${groups[1]} than on ${groups[0]}?`, answer: ((100 - b) * n) / 100 - ((100 - a) * n) / 100, solution: `Mistakes: ${groups[0]} ${100 - a}% of ${n} = ${((100 - a) * n) / 100}; ${groups[1]} ${100 - b}% of ${n} = ${((100 - b) * n) / 100}. Difference ${((100 - b) * n) / 100 - ((100 - a) * n) / 100}. A big gap like this is a sign of bias — the second group is probably under-represented in the training data.` };
  },
};

export const balancePct: Family = {
  id: "ai-dataset-balance", ds: [2],
  make(c, d) {
    const total = pick(c.r, [200, 400, 500, 1000]), pct = pick(c.r, [10, 20, 25, 30, 40]);
    const minority = (total * pct) / 100;
    const groups = pick(c.r, [["boys", "girls"], ["city schools", "village schools"], ["light skin tones", "dark skin tones"], ["Hindi speakers", "Tamil speakers"]]);
    return { d, skills: ["DATA", "ETHICS"], type: "NUMERIC", stem: `A dataset has **${total - minority}** examples from ${groups[0]} and **${minority}** from ${groups[1]}. What **percentage** of the dataset comes from ${groups[1]}?`, answer: pct, solution: `${minority} ÷ ${total} × 100 = ${pct}%. ${pct < 40 ? "This group is under-represented, so the model may work worse for it." : ""}` };
  },
};

export const meanRange: Family = {
  id: "data-mean-range", ds: [2, 3],
  make(c, d) {
    const n = 5;
    const vals = Array.from({ length: n }, () => int(c.r, 2, 30));
    const sum = vals.reduce((a, b) => a + b, 0);
    if (d === 2) return { d, skills: ["DATA"], type: "NUMERIC", stem: `Data: **${vals.join(", ")}**. What is the **range** (largest − smallest)?`, answer: Math.max(...vals) - Math.min(...vals), solution: `${Math.max(...vals)} − ${Math.min(...vals)} = ${Math.max(...vals) - Math.min(...vals)}.` };
    const fix = (n - (sum % n)) % n;
    vals[0] += fix;
    const s2 = sum + fix;
    return { d, skills: ["DATA", "DECOMPOSITION"], type: "NUMERIC", stem: `Minutes of reading each day: **${vals.join(", ")}**. What is the **mean**?`, answer: s2 / n, solution: `Total ${s2} ÷ ${n} days = ${s2 / n}.` };
  },
};

export const pieAngle: Family = {
  id: "data-pie-angle", ds: [2, 3],
  make(c, d) {
    const total = pick(c.r, [20, 24, 30, 36, 40, 60]), part = int(c.r, 1, total - 1);
    const ang = (part * 360) / total;
    if (!Number.isInteger(ang)) return null;
    if (d === 2) { const frac = pick(c.r, [[1, 2, 180], [1, 4, 90], [3, 4, 270], [1, 3, 120], [1, 6, 60]] as const); return { d, skills: ["DATA", "ABSTRACT"], type: "NUMERIC", stem: `In a pie chart, cricket takes **${frac[0]}/${frac[1]}** of the circle. What is the angle of that slice in degrees?`, answer: frac[2], solution: `${frac[0]}/${frac[1]} of 360° = ${frac[2]}°.` }; }
    return { d, skills: ["DATA", "DECOMPOSITION"], type: "NUMERIC", stem: `In a survey of **${total} students**, **${part}** chose football. In a pie chart, what angle (degrees) should the football slice have?`, answer: ang, solution: `${part}/${total} of 360° = ${ang}°.` };
  },
};

export const tableCells: Family = {
  id: "data-table-cells", ds: [1, 2],
  make(c, d) {
    const rows = int(c.r, 3, 12), cols = int(c.r, 2, 6);
    return { d, skills: ["DATA", "DECOMPOSITION"], type: "NUMERIC", stem: `A table stores data about **${rows} ${pick(c.r, ["students", "trees", "days", "cricket matches"])}**, with **${cols} columns** of information about each. How many data values (cells) are there, not counting headings?`, answer: rows * cols, solution: `${rows} rows × ${cols} columns = ${rows * cols}.` };
  },
};

// ---------------- EVS numbers ----------------
export const waterUse: Family = {
  id: "evs-water", ds: [1, 2, 3],
  make(c, d) {
    const acts = sample(c.r, [["bathing with a bucket", 20], ["brushing with the tap off", 1], ["washing hands", 2], ["cooking", 10], ["drinking", 3], ["washing clothes", 30], ["mopping the floor", 8]] as const, 3);
    if (d === 1) { const [a, l] = acts[0]; const days = int(c.r, 2, 7); return { d, skills: ["DECOMPOSITION"], type: "NUMERIC", stem: `${pick(c.r, NAMES)} uses about **${l} litres** of water for ${a} each day. How many litres in **${days} days**?`, answer: l * days, solution: `${l} × ${days} = ${l * days} litres.` }; }
    if (d === 2) return { d, skills: ["DECOMPOSITION"], type: "NUMERIC", stem: `Water used by a family in a morning:\n\n| Activity | Litres |\n|---|---|\n${acts.map(([a, l]) => `| ${a[0].toUpperCase() + a.slice(1)} | ${l} |`).join("\n")}\n\nHow many litres in total?`, answer: acts.reduce((s, [, l]) => s + l, 0), solution: `${acts.map(([, l]) => l).join(" + ")} = ${acts.reduce((s, [, l]) => s + l, 0)} litres.` };
    const leak = int(c.r, 1, 3), days = int(c.r, 2, 4);
    return { d, skills: ["DECOMPOSITION", "EVALUATION"], type: "NUMERIC", stem: `A leaking tap wastes **${leak} litre${leak > 1 ? "s" : ""} every hour**. How many litres are wasted in **${days} whole days**?`, answer: leak * 24 * days, solution: `1 day = 24 hours. ${leak} × 24 × ${days} = ${leak * 24 * days} litres. Fixing leaks saves a lot of water!`, hint: "How many hours are in one day?" };
  },
};

export const plantGrowth: Family = {
  id: "evs-plant-growth", ds: [1, 2, 3],
  make(c, d) {
    const h = int(c.r, 2, 20), g = int(c.r, 1, 5), w = int(c.r, 2, 8);
    const plant = pick(c.r, ["sunflower", "tomato plant", "bean plant", "tulsi plant", "marigold"]);
    if (d < 3) return { d, skills: ["PATTERN", "ALGORITHMIC"], type: "NUMERIC", stem: `A ${plant} is **${h} cm** tall and grows **${g} cm every week**. How tall will it be after **${w} weeks**?`, answer: h + g * w, solution: `Growth: ${g} × ${w} = ${g * w} cm. ${h} + ${g * w} = ${h + g * w} cm.` };
    const target = h + g * w;
    return { d, skills: ["PATTERN", "ABSTRACT"], type: "NUMERIC", stem: `A ${plant} is **${h} cm** tall and grows **${g} cm every week**. After how many weeks will it be **${target} cm** tall?`, answer: w, solution: `It must grow ${target} − ${h} = ${target - h} cm. ${target - h} ÷ ${g} = ${w} weeks.` };
  },
};

export const legsCount: Family = {
  id: "evs-legs", ds: [1, 2, 3],
  make(c, d) {
    const animals = sample(c.r, [["hens", 2], ["cows", 4], ["goats", 4], ["ducks", 2], ["dogs", 4], ["spiders", 8], ["ants", 6], ["crows", 2]] as const, d === 1 ? 1 : 2);
    const counts = animals.map(() => int(c.r, 2, 6));
    const total = animals.reduce((s, [, l], i) => s + l * counts[i], 0);
    return { d, skills: ["DECOMPOSITION"], type: "NUMERIC", stem: `${pick(c.r, ["On a farm", "In a garden", "In a village yard", "In a zoo corner"])} there are ${animals.map(([a], i) => `**${counts[i]} ${a}**`).join(" and ")}. How many legs are there in all?`, answer: total, solution: `${animals.map(([a, l], i) => `${a}: ${counts[i]} × ${l} = ${l * counts[i]}`).join("; ")}. Total ${total}.`, hint: d > 1 ? "Find the legs for each kind of animal first." : undefined };
  },
};

export const rainfall: Family = {
  id: "evs-rainfall", ds: [1, 2, 3],
  make(c, d) {
    const weeks = [int(c.r, 5, 40), int(c.r, 5, 40), int(c.r, 5, 40)];
    const table = `Rainfall in ${pick(c.r, ["Kerala", "Assam", "Mumbai", "our town", "Cherrapunji"])}:\n\n| Week | Rain (mm) |\n|---|---|\n${weeks.map((w, i) => `| Week ${i + 1} | ${w} |`).join("\n")}`;
    if (d === 1) return { d, skills: ["DECOMPOSITION", "DATA"], type: "NUMERIC", stem: `${table}\n\nHow much rain fell in all three weeks?`, answer: weeks[0] + weeks[1] + weeks[2], solution: `${weeks.join(" + ")} = ${weeks[0] + weeks[1] + weeks[2]} mm.` };
    if (d === 2) return { d, skills: ["DECOMPOSITION", "DATA"], type: "NUMERIC", stem: `${table}\n\nWhat is the difference between the rainiest and the driest week?`, answer: Math.max(...weeks) - Math.min(...weeks), solution: `${Math.max(...weeks)} − ${Math.min(...weeks)} = ${Math.max(...weeks) - Math.min(...weeks)} mm.` };
    const best = weeks.indexOf(Math.max(...weeks));
    const o = textOptions(`Week ${best + 1}`, ["Week 1", "Week 2", "Week 3", "All the same"]);
    if (new Set(weeks).size < 3) return null;
    return { d, skills: ["DATA", "EVALUATION"], type: "MCQ", stem: `${table}\n\nIn which week were wet clothes **least** likely to dry outdoors?`, ...o, solution: `The week with the most rain (${Math.max(...weeks)} mm) is Week ${best + 1}.` };
  },
};

export const mapScale: Family = {
  id: "evs-map-scale", ds: [2, 3],
  make(c, d) {
    const s = pick(c.r, [2, 5, 10, 20]), cm = int(c.r, 2, 9);
    if (d === 2) return { d, skills: ["ABSTRACT", "DECOMPOSITION"], type: "NUMERIC", stem: `On a map, **1 cm = ${s} km**. Two towns are **${cm} cm** apart on the map. How far apart are they really (km)?`, answer: s * cm, solution: `${cm} × ${s} = ${s * cm} km.` };
    const a = int(c.r, 2, 6), b = int(c.r, 2, 6);
    return { d, skills: ["ABSTRACT", "DECOMPOSITION"], type: "NUMERIC", stem: `On a map (**1 cm = ${s} km**), the road goes **${a} cm** from the village to the market, then **${b} cm** from the market to the school. How many km is the trip from the village to the school along this road?`, answer: (a + b) * s, solution: `${a} + ${b} = ${a + b} cm on the map. ${a + b} × ${s} = ${(a + b) * s} km.` };
  },
};

export const energyUnits: Family = {
  id: "evs-energy", ds: [1, 2, 3],
  make(c, d) {
    if (d === 1) { const u = int(c.r, 2, 15), n = int(c.r, 2, 8); return { d, skills: ["DECOMPOSITION"], type: "NUMERIC", stem: `One fan uses **${u} units** of electricity a month. How many units do **${n} fans** use?`, answer: u * n, solution: `${u} × ${n} = ${u * n} units.` }; }
    if (d === 2) { const u = int(c.r, 3, 8), days = pick(c.r, [28, 30, 31]); return { d, skills: ["DECOMPOSITION"], type: "NUMERIC", stem: `A solar panel makes **${u} units** of electricity a day. How many units in a month with **${days} days**?`, answer: u * days, solution: `${u} × ${days} = ${u * days} units.` }; }
    const per = int(c.r, 2, 5), hrs = int(c.r, 2, 6);
    return { d, skills: ["DECOMPOSITION", "EVALUATION"], type: "NUMERIC", stem: `A light left on by mistake wastes **${per} units** for every **10 hours**. It is left on for **${hrs * 10} hours** a month. How many units are wasted in a **year** (12 months)?`, answer: per * hrs * 12, solution: `${hrs * 10} hours = ${hrs} lots of 10 hours → ${per} × ${hrs} = ${per * hrs} units a month. × 12 = ${per * hrs * 12} units a year.`, hint: "First find one month." };
  },
};

export const treesPlanted: Family = {
  id: "evs-trees", ds: [1, 2, 3],
  make(c, d) {
    const per = int(c.r, 5, 30), yrs = int(c.r, 2, 10);
    if (d < 3) return { d, skills: ["DECOMPOSITION", "PATTERN"], type: "NUMERIC", stem: `A school plants **${per} trees** every year. How many trees after **${yrs} years**?`, answer: per * yrs, solution: `${per} × ${yrs} = ${per * yrs}.` };
    const dead = int(c.r, 1, Math.max(1, Math.floor(per / 5)));
    return { d, skills: ["DECOMPOSITION", "ALGORITHMIC"], type: "NUMERIC", stem: `Every year a club plants **${per} saplings**, but about **${dead}** of them don't survive. How many trees are growing after **${yrs} years**?`, answer: (per - dead) * yrs, solution: `Each year ${per} − ${dead} = ${per - dead} survive. ${per - dead} × ${yrs} = ${(per - dead) * yrs}.` };
  },
};

export const AI_EVS_FAMILIES: Record<string, Family> = Object.fromEntries([predictNext, ifElseRule, accuracyPct, groupErrors, balancePct, meanRange, pieAngle, tableCells, waterUse, plantGrowth, legsCount, rainfall, mapScale, energyUnits, treesPlanted].map((f) => [f.id, f]));
