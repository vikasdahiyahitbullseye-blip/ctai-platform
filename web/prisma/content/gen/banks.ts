// Scenario banks: short, hand-written real-world situations, each with its correct category.
// Each bank becomes several question families (classify / pick-one / true-false / choose-all).
import { type Family, type D, pick, sample, textOptions } from "./util";

type Bank = {
  id: string;
  skills: string[];
  labels: Record<string, string[]>;
  category?: string; // "Which <category> is this?" (needs ≥ 3 labels)
  q?: string; // custom classify question
  noTf?: boolean;
  ask: Record<string, string>; // "Which of these <ask>?"
  tf: Record<string, string>; // "True or false: <scenario> <tf>."
};

export const BANKS: Bank[] = [
  {
    id: "ai-domain", skills: ["AI_CONCEPT"], category: "AI domain",
    labels: {
      "Computer Vision": ["A phone camera blurs the background behind a person's face", "A traffic camera reads car number plates", "An app names a plant from a photo of its leaf", "A self-driving car spots people crossing the road", "A factory camera finds cracked bottles on a moving belt", "An app counts the birds in a photo", "A tool highlights a fracture on an X-ray image", "A game lets you control a character by waving at the webcam"],
      "Natural Language Processing": ["A keyboard suggests the next word as you type", "An app translates a sentence you type from Tamil to Hindi", "A voice assistant sets an alarm when you say 'Wake me at 6'", "A tool summarises a long news article in three lines", "An email app warns you that your message sounds rude", "A chatbot answers questions about train timings", "Your phone types out the words you speak", "A spell-checker changes 'recieve' to 'receive'"],
      "Data Science": ["A shop predicts next month's umbrella sales from past sales records", "A cricket analyst finds which bowlers take most wickets in the last overs from match records", "An electricity company predicts which areas will need more power in summer", "A school studies attendance records to find which weekdays have the most absences", "A weather service predicts rainfall from years of temperature and humidity records", "A bank spots unusual spending patterns in card transactions", "A music app finds that people who like one song often like another"],
    },
    ask: { "Computer Vision": "uses **Computer Vision**", "Natural Language Processing": "uses **Natural Language Processing (NLP)**", "Data Science": "is mainly **Data Science**" },
    tf: { "Computer Vision": "is an example of Computer Vision", "Natural Language Processing": "is an example of Natural Language Processing", "Data Science": "is an example of Data Science" },
  },
  {
    id: "ai-vs-automation", skills: ["AI_CONCEPT", "EVALUATION"],
    labels: {
      AI: ["A phone unlocks by recognising your face", "A video app recommends videos based on what you watched", "A spam filter gets better as more emails are marked as spam", "A map app predicts traffic jams from live data", "A smart speaker understands many different voices", "A camera app recognises dogs and cats", "A chatbot answers questions typed in everyday language", "A shoe website suggests your size from what similar buyers chose"],
      Automation: ["A washing machine runs the same fixed 40-minute programme", "A street light switches on at 6 pm every day", "A tap turns on when a sensor detects a hand", "A lift goes to the floor whose button is pressed", "A school bell rings every 40 minutes", "An ATM gives out cash when the correct PIN is entered", "A water pump switches off when the tank is full", "A microwave stops when its timer reaches zero"],
    },
    ask: { AI: "uses **AI** (it learns from data)", Automation: "is **automation only** (it follows fixed rules)" },
    tf: { AI: "uses AI that learns from data", Automation: "is automation that follows fixed rules, not AI" },
  },
  {
    id: "learning-type", skills: ["AI_CONCEPT"], category: "type of learning",
    labels: {
      "Supervised learning": ["Learning to tell ripe from unripe mangoes using photos labelled 'ripe' or 'unripe'", "Predicting house prices from past sales where the price is known", "Recognising handwritten digits from examples marked with the correct digit", "Learning to spot spam from emails already marked 'spam' or 'not spam'", "Diagnosing leaf disease from photos labelled by experts", "Recognising whose voice it is from recordings labelled with names"],
      "Unsupervised learning": ["Grouping customers by shopping habits without any labels", "Sorting news articles into topics nobody has named yet", "Finding groups of similar songs in a big music library", "Grouping photos of flowers that look alike, with no names given", "Finding a few unusual bank transactions that don't fit any group", "Grouping students by reading habits with no categories given"],
      "Reinforcement learning": ["A robot learns to walk by getting points when it doesn't fall", "A game program improves by winning and losing thousands of games", "A self-balancing toy learns from its mistakes to stay upright", "A computer learns to park a car in a simulator, rewarded for good parking", "A program learns chess by playing against itself", "A drone learns to fly through hoops, rewarded each time it passes one"],
    },
    ask: { "Supervised learning": "is **supervised learning**", "Unsupervised learning": "is **unsupervised learning**", "Reinforcement learning": "is **reinforcement learning**" },
    tf: { "Supervised learning": "is supervised learning", "Unsupervised learning": "is unsupervised learning", "Reinforcement learning": "is reinforcement learning" },
  },
  {
    id: "task-type", skills: ["AI_CONCEPT", "DATA"], category: "kind of AI task",
    labels: {
      "Regression (predict a number)": ["Predicting tomorrow's maximum temperature", "Estimating a mango's weight from its size", "Predicting how many visitors a museum will have on Sunday", "Predicting the price of a used bicycle", "Predicting how many litres of milk a dairy will collect tomorrow", "Estimating how many minutes a bus will take to reach the next stop"],
      "Classification (choose a label)": ["Deciding whether an X-ray shows pneumonia or not", "Sorting fruit photos into apple, banana or orange", "Deciding whether a product review is positive or negative", "Labelling a handwritten letter as one of A to Z", "Deciding whether a leaf is healthy or diseased", "Marking a bank transaction as fraud or not fraud"],
      "Clustering (find groups)": ["Grouping shoppers who buy similar things, with no groups given", "Grouping cities that have similar weather patterns", "Finding groups of students who learn in similar ways", "Grouping news stories that talk about the same event", "Grouping songs that sound alike", "Grouping stars in telescope photos by brightness and colour, without labels"],
    },
    ask: { "Regression (predict a number)": "is a **regression** task", "Classification (choose a label)": "is a **classification** task", "Clustering (find groups)": "is a **clustering** task" },
    tf: { "Regression (predict a number)": "is a regression task", "Classification (choose a label)": "is a classification task", "Clustering (find groups)": "is a clustering task" },
  },
  {
    id: "data-type", skills: ["DATA"], category: "type of data",
    labels: {
      Text: ["A WhatsApp message", "The name of a city", "A book review", "A list of favourite foods written as words", "A poem typed on a computer"],
      Number: ["Your height in cm", "Today's temperature", "Marks in a maths test", "The number of steps walked today", "The price of a notebook"],
      Image: ["A selfie", "A satellite photo of a forest", "A scanned X-ray", "A drawing of a tree", "A photo of a cricket match"],
      Sound: ["A recording of a koel singing", "A voice note", "The sound of rain recorded on a phone", "A song", "A recording of a school assembly speech"],
    },
    ask: { Text: "is **text** data", Number: "is **number** data", Image: "is **image** data", Sound: "is **sound** data" },
    tf: { Text: "is text data", Number: "is number data", Image: "is image data", Sound: "is sound data" },
  },
  {
    id: "industry", skills: ["AI_CONCEPT"], category: "area of use",
    labels: {
      Healthcare: ["AI reads eye scans to spot damage caused by diabetes", "An app reminds patients to take medicines and notices missed doses", "AI predicts which patients may need an ICU bed", "AI helps screen chest X-rays for tuberculosis"],
      Agriculture: ["Drones with cameras spot pests on crops", "An app predicts the best day to sow seeds using weather data", "Sensors and AI decide how much water each part of a field needs", "AI estimates the crop yield of a field from satellite photos"],
      Transport: ["AI changes traffic-light timings based on queue lengths", "Railways predict which coaches will need repairs", "An app estimates when a cab will arrive", "AI helps plan bus routes from passenger data"],
      Education: ["A tutoring app gives extra practice on a student's weak topics", "AI points out spelling mistakes in students' essays", "A tool reads text aloud for students with low vision", "An app recommends library books based on what a student enjoyed"],
      Banking: ["AI flags unusual spending on a debit card", "A chatbot helps customers check their account balance", "AI helps estimate the risk of giving a loan", "AI checks signatures on cheques"],
    },
    ask: { Healthcare: "is AI in **healthcare**", Agriculture: "is AI in **agriculture**", Transport: "is AI in **transport**", Education: "is AI in **education**", Banking: "is AI in **banking**" },
    tf: { Healthcare: "is a use of AI in healthcare", Agriculture: "is a use of AI in agriculture", Transport: "is a use of AI in transport", Education: "is a use of AI in education", Banking: "is a use of AI in banking" },
  },
  {
    id: "chart-choice", skills: ["DATA", "EVALUATION"], category: "chart", q: "Which chart would show this best?",
    labels: {
      "Bar graph": ["Comparing the number of students in 5 clubs", "Comparing July rainfall in 4 cities", "Comparing the marks of 6 students in one test", "Comparing votes for 4 class-monitor candidates"],
      "Line graph": ["Showing a plant's height every week for 2 months", "Showing the temperature every hour of a day", "Showing a town's population each year", "Showing your weekly reading time over a term"],
      "Pie chart": ["Showing how a family's monthly budget is split", "Showing what fraction of the class chose each fruit", "Showing how the 24 hours of a day are spent", "Showing how a school's land is used for buildings, playground and garden"],
    },
    ask: { "Bar graph": "is best shown with a **bar graph**", "Line graph": "is best shown with a **line graph**", "Pie chart": "is best shown with a **pie chart**" },
    tf: { "Bar graph": "is best shown with a bar graph", "Line graph": "is best shown with a line graph", "Pie chart": "is best shown with a pie chart" },
  },
  {
    id: "online-safety", skills: ["ETHICS"],
    labels: {
      Safe: ["Using a long passphrase with numbers and symbols", "Logging out of a shared computer", "Asking a parent before downloading a new app", "Turning on two-step verification", "Telling a teacher about a mean comment you saw online", "Checking a fact on two reliable websites before sharing it", "Keeping location sharing turned off in games"],
      Unsafe: ["Sharing an OTP with someone who calls saying they are from the bank", "Using your birthday as your password", "Posting your school name and home address publicly", "Clicking a link in a message that says you won a prize", "Meeting an online friend alone without telling your parents", "Forwarding a rumour without checking it", "Using the same password for every app"],
    },
    ask: { Safe: "is a **safe** online habit", Unsafe: "is **unsafe** online" },
    tf: { Safe: "is a safe thing to do online", Unsafe: "is unsafe online" },
  },
  {
    id: "footprint", skills: ["ETHICS", "DATA"],
    labels: {
      "Active footprint": ["Posting a photo of your science project", "Writing a comment under a video", "Filling an online quiz with your name", "Uploading a drawing to the school website", "Sending an email to your teacher"],
      "Passive footprint": ["A website remembering which pages you visited", "An app recording your location in the background", "Cookies saving what you searched for", "A shopping site noting which items you looked at", "A game tracking how long you play each day"],
    },
    ask: { "Active footprint": "creates an **active** digital footprint (something you chose to share)", "Passive footprint": "creates a **passive** digital footprint (collected without you posting)" },
    tf: { "Active footprint": "creates an active digital footprint", "Passive footprint": "creates a passive digital footprint" },
  },
  {
    id: "project-stage", skills: ["AI_CONCEPT", "ALGORITHMIC"], category: "stage of the AI project lifecycle",
    labels: {
      "Define Problem": ["Writing who is affected by food waste in the canteen and why it matters", "Using the 4Ws (who, what, where, why) to describe the problem", "Deciding what success will look like for the project", "Choosing one clear question the project will answer"],
      "Collect Data": ["Taking 200 photos of healthy and diseased leaves", "Running a survey on how students travel to school", "Recording the canteen's leftover food every day for 3 weeks", "Getting consent before collecting classmates' data"],
      "Test AI Tools": ["Training an image model in Teachable Machine and trying it on new photos", "Counting how many test photos the model labels correctly", "Trying two no-code tools to see which works better", "Asking a chatbot 20 new questions to see how it answers"],
      "Reflect and Improve": ["Adding photos taken in dim light because the model failed at dusk", "Removing duplicate photos and training again", "Asking users for feedback and changing the design", "Checking whether the model works equally well for all groups"],
    },
    ask: { "Define Problem": "belongs to the **Define Problem** stage", "Collect Data": "belongs to the **Collect Data** stage", "Test AI Tools": "belongs to the **Test AI Tools** stage", "Reflect and Improve": "belongs to the **Reflect and Improve** stage" },
    tf: { "Define Problem": "is part of the Define Problem stage", "Collect Data": "is part of the Collect Data stage", "Test AI Tools": "is part of the Test AI Tools stage", "Reflect and Improve": "is part of the Reflect and Improve stage" },
  },
  {
    id: "ethics-principle", skills: ["ETHICS"], category: "principle of responsible AI", q: "Which principle of responsible AI is this mainly about?",
    labels: {
      Privacy: ["An app should not collect your contacts if it doesn't need them", "Photos of students should not be shared without consent", "Hospital records must be kept secret", "A chatbot should not store your address"],
      Fairness: ["A face app should work equally well for every skin tone", "A loan AI should not reject people just because of their area", "A voice assistant should understand people from villages and cities alike", "An exam-marking AI should give the same marks for the same answer from any student"],
      Transparency: ["A bank should explain why its AI rejected a loan", "Users should be told when they are chatting with a bot, not a person", "An app should say what data it uses to make suggestions", "A news site should label pictures made by AI"],
      Accountability: ["A company is responsible if its self-driving car causes an accident", "A doctor must check and sign off an AI diagnosis", "A school must answer for decisions made with an AI marking tool", "The team that built an AI must fix it when it harms people"],
    },
    ask: { Privacy: "is mainly about **privacy**", Fairness: "is mainly about **fairness**", Transparency: "is mainly about **transparency**", Accountability: "is mainly about **accountability**" },
    tf: { Privacy: "is about privacy", Fairness: "is about fairness", Transparency: "is about transparency", Accountability: "is about accountability" },
  },
  {
    id: "responsible-use", skills: ["ETHICS", "EVALUATION"],
    labels: {
      Responsible: ["Using AI to explain a hard concept, then solving the problem yourself", "Checking an AI answer against your textbook", "Saying in your project that you used an AI tool", "Using AI to practise English conversation", "Reporting a deepfake video instead of sharing it", "Asking AI for feedback on your own draft"],
      Irresponsible: ["Submitting an AI-written essay as your own", "Making a fake video of a classmate as a joke", "Uploading a friend's photo to an AI app without asking", "Trusting an AI answer for an exam without checking", "Using AI to write mean messages", "Copying AI-made pictures into a competition entry without saying so"],
    },
    ask: { Responsible: "is a **responsible** use of AI", Irresponsible: "is an **irresponsible** use of AI" },
    tf: { Responsible: "is a responsible use of AI", Irresponsible: "is an irresponsible use of AI" },
  },
  // ---------- EVS banks ----------
  {
    id: "food-source", skills: ["DECOMPOSITION"],
    labels: { "From plants": ["Rice", "Wheat", "Apples", "Spinach", "Dal", "Sugar (from sugarcane)", "Tea", "Potatoes", "Groundnuts"], "From animals": ["Milk", "Eggs", "Honey", "Curd", "Paneer", "Ghee", "Fish"] },
    ask: { "From plants": "comes **from plants**", "From animals": "comes **from animals**" },
    tf: { "From plants": "comes from plants", "From animals": "comes from animals" },
  },
  {
    id: "waste-type", skills: ["DECOMPOSITION", "EVALUATION"],
    labels: { "Wet waste (green bin)": ["Fruit peels", "Leftover food", "Used tea leaves", "Eggshells", "Old flowers from a puja", "Vegetable peels"], "Dry waste (blue bin)": ["Newspaper", "A plastic bottle", "A glass jar", "A cardboard box", "An old pen", "A tin can"] },
    ask: { "Wet waste (green bin)": "is **wet waste** (green bin)", "Dry waste (blue bin)": "is **dry waste** (blue bin)" },
    tf: { "Wet waste (green bin)": "goes in the green (wet waste) bin", "Dry waste (blue bin)": "goes in the blue (dry waste) bin" },
  },
  {
    id: "water-source", skills: ["DECOMPOSITION"],
    labels: { Natural: ["A river", "A lake", "Rain", "A spring", "The sea", "A glacier"], "Made by people": ["A well", "A tap", "A tube well", "A dam reservoir", "A water tanker", "A hand pump"] },
    ask: { Natural: "is a **natural** source of water", "Made by people": "is a water source **made by people**" },
    tf: { Natural: "is a natural source of water", "Made by people": "is a water source made by people" },
  },
  {
    id: "energy", skills: ["DECOMPOSITION", "EVALUATION"],
    labels: { Renewable: ["Sunlight", "Wind", "Flowing water in a river", "Biogas from cow dung", "Ocean waves"], "Non-renewable": ["Coal", "Petrol", "Diesel", "Natural gas", "Kerosene"] },
    ask: { Renewable: "is a **renewable** energy source", "Non-renewable": "is a **non-renewable** energy source" },
    tf: { Renewable: "is a renewable energy source", "Non-renewable": "is a non-renewable energy source" },
  },
  {
    id: "animal-home", skills: ["DECOMPOSITION"], category: "home",
    labels: { Burrow: ["A rabbit", "A rat", "A snake"], Nest: ["A sparrow", "A weaver bird", "A crow"], Hive: ["A honeybee"], Web: ["A spider"], Den: ["A lion", "A tiger", "A fox"], "Water (pond or river)": ["A fish", "A crocodile", "A whale"], Anthill: ["An ant"], Kennel: ["A pet dog"] },
    ask: { Burrow: "lives in a **burrow**", Nest: "lives in a **nest**", Hive: "lives in a **hive**", Web: "lives on a **web**", Den: "lives in a **den**", "Water (pond or river)": "lives mostly in **water**", Anthill: "lives in an **anthill**", Kennel: "lives in a **kennel**" },
    tf: { Burrow: "lives in a burrow", Nest: "lives in a nest", Hive: "lives in a hive", Web: "lives on a web", Den: "lives in a den", "Water (pond or river)": "lives mostly in water", Anthill: "lives in an anthill", Kennel: "lives in a kennel" },
  },
  {
    id: "transport-mode", skills: ["DECOMPOSITION"], category: "way of travel",
    labels: { Land: ["A bus", "A train", "An auto rickshaw", "A bullock cart", "A bicycle"], Water: ["A boat", "A ship", "A ferry", "A canoe"], Air: ["An aeroplane", "A helicopter", "A hot-air balloon"] },
    ask: { Land: "travels on **land**", Water: "travels on **water**", Air: "travels through the **air**" },
    tf: { Land: "travels on land", Water: "travels on water", Air: "travels through the air" },
  },
  {
    id: "healthy-habit", skills: ["EVALUATION"],
    labels: { Healthy: ["Washing hands before eating", "Brushing teeth twice a day", "Sleeping 9–10 hours at night", "Eating fruits and vegetables every day", "Playing outdoors", "Drinking clean water"], Unhealthy: ["Eating chips every day instead of lunch", "Staying up late watching phone videos", "Skipping breakfast every day", "Drinking sugary cold drinks instead of water", "Not washing hands after using the toilet", "Sitting in one place for hours without moving"] },
    ask: { Healthy: "is a **healthy** habit", Unhealthy: "is an **unhealthy** habit" },
    tf: { Healthy: "is a healthy habit", Unhealthy: "is an unhealthy habit" },
  },
  {
    id: "crop-season", skills: ["DECOMPOSITION"],
    labels: { "Kharif (monsoon) crop": ["Rice", "Maize", "Cotton", "Groundnut", "Soybean"], "Rabi (winter) crop": ["Wheat", "Mustard", "Gram (chana)", "Barley", "Peas"] },
    ask: { "Kharif (monsoon) crop": "is a **kharif** (monsoon) crop", "Rabi (winter) crop": "is a **rabi** (winter) crop" },
    tf: { "Kharif (monsoon) crop": "is a kharif (monsoon) crop", "Rabi (winter) crop": "is a rabi (winter) crop" },
  },
  {
    id: "body-part", skills: ["DECOMPOSITION"], category: "body part", noTf: true,
    labels: { Eyes: ["helps us see colours and shapes"], Ears: ["helps us hear sounds"], Nose: ["helps us smell and breathe in air"], Tongue: ["helps us taste food"], Skin: ["helps us feel hot, cold and touch"], Heart: ["pumps blood around the body"], Lungs: ["help us breathe"], Teeth: ["help us bite and chew food"] },
    ask: { Eyes: "describes the **eyes**", Ears: "describes the **ears**", Nose: "describes the **nose**", Tongue: "describes the **tongue**", Skin: "describes the **skin**", Heart: "describes the **heart**", Lungs: "describes the **lungs**", Teeth: "describes the **teeth**" },
    tf: { Eyes: "describes the eyes", Ears: "describes the ears", Nose: "describes the nose", Tongue: "describes the tongue", Skin: "describes the skin", Heart: "describes the heart", Lungs: "describes the lungs", Teeth: "describes the teeth" },
  },
  {
    id: "plant-part", skills: ["DECOMPOSITION"], category: "part of the plant", noTf: true,
    labels: { Roots: ["take in water from the soil", "hold the plant firmly in the ground"], Leaves: ["make food using sunlight", "are usually green and flat"], Stem: ["carries water from the roots upward", "holds up the leaves and flowers"], Flower: ["turns into fruit with seeds", "attracts bees and butterflies"] },
    ask: { Roots: "is done by the **roots**", Leaves: "is done by the **leaves**", Stem: "is done by the **stem**", Flower: "is done by the **flower**" },
    tf: { Roots: "is a job of the roots", Leaves: "is a job of the leaves", Stem: "is a job of the stem", Flower: "is a job of the flower" },
  },
];

const label = (b: Bank, scenario: string) => Object.entries(b.labels).find(([, list]) => list.includes(scenario))![0];
const allScenarios = (b: Bank) => Object.values(b.labels).flat();
const describe = (b: Bank, s: string) => (b.id === "body-part" ? `This part of the body ${s}.` : b.id === "plant-part" ? `This part of a plant: it ${s}.` : b.id === "animal-home" || b.id === "transport-mode" || b.id === "food-source" ? s : s);

export function bankFamilies(b: Bank): Family[] {
  const labels = Object.keys(b.labels);
  const fams: Family[] = [];
  if (b.category && labels.length >= 3) {
    fams.push({
      id: `${b.id}:classify`, ds: [1, 2],
      make(c, d) {
        const s = pick(c.r, allScenarios(b));
        const ans = label(b, s);
        const opts = textOptions(ans, sample(c.r, labels.filter((l) => l !== ans), 3));
        const stem = b.id === "body-part" || b.id === "plant-part" ? `${describe(b, s)} Which ${b.category} is it?` : b.id === "animal-home" ? `Where does **${s.toLowerCase().replace(/^a /, "a ").replace(/^an /, "an ")}** usually live?` : b.id === "transport-mode" ? `How does **${s.toLowerCase()}** travel?` : `**${s}.**\n\n${b.q ?? `Which ${b.category} is this?`}`;
        return { d, skills: b.skills, type: "MCQ", stem, ...opts, solution: `${s.replace(/\.$/, "")} → ${ans}.` };
      },
    });
  }
  fams.push({
    id: `${b.id}:pick`, ds: [2],
    make(c, d) {
      const target = pick(c.r, labels);
      const right = pick(c.r, b.labels[target]);
      const wrongPool = labels.filter((l) => l !== target).flatMap((l) => b.labels[l]);
      if (wrongPool.length < 3) return null;
      const opts = textOptions(right, sample(c.r, wrongPool, 3));
      return { d, skills: b.skills, type: "MCQ", stem: b.id === "body-part" || b.id === "plant-part" ? `Which of these ${b.ask[target].replace(/describes the |is done by the /, "is the job of the ")}?` : `Which of these ${b.ask[target]}?`, ...opts, solution: `${right} → ${target}. The others: ${opts.options.slice(1).map((o) => `${o} → ${label(b, o)}`).join("; ")}.` };
    },
  });
  if (!b.noTf) fams.push({
    id: `${b.id}:tf`, ds: [1],
    make(c, d) {
      const s = pick(c.r, allScenarios(b));
      const truth = label(b, s);
      const claim = c.r() < 0.5 ? truth : pick(c.r, labels.filter((l) => l !== truth));
      return { d, skills: [...b.skills, "EVALUATION"].filter((x, i, a) => a.indexOf(x) === i), type: "TRUE_FALSE", stem: `True or false: **${s}** — this ${b.tf[claim]}.`, answer: claim === truth, solution: claim === truth ? `True. ${s} → ${truth}.` : `False. ${s} → ${truth}, not ${claim}.` };
    },
  });
  fams.push({
    id: `${b.id}:multi`, ds: [3],
    make(c, d) {
      const target = pick(c.r, labels);
      if (b.labels[target].length < 2) return null;
      const right = sample(c.r, b.labels[target], 2);
      const wrongPool = labels.filter((l) => l !== target).flatMap((l) => b.labels[l]);
      const wrong = sample(c.r, wrongPool, 2);
      const options = [...right, ...wrong];
      return { d, skills: [...b.skills, "EVALUATION"].filter((x, i, a) => a.indexOf(x) === i), type: "MULTI", stem: `Which of these ${b.ask[target]}? Choose all that apply.`, options, answer: [0, 1], solution: `${right.join(" and ")} → ${target}. ${wrong.map((w) => `${w} → ${label(b, w)}`).join("; ")}.` };
    },
  });
  return fams;
}

export const BANK_FAMILIES: Record<string, Family> = Object.fromEntries(BANKS.flatMap((b) => bankFamilies(b)).map((f) => [f.id, f]));
export type { D };
