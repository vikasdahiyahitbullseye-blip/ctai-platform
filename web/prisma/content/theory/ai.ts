// "Learn it" theory for the AI chapters of Classes 6–8 (CBSE CT & AI handbooks, 2026-27), keyed "<class>-AI-<chapter>".
// Used in the help books (AI part), the chapter learning modules and the class slides.
import { T, type ChapterTheory } from "./types";

export const THEORY_AI: Record<string, ChapterTheory> = {
  // ---------------------------------------------------------------- Class 6
  "6-AI-1": T({
    intro: "Artificial Intelligence (AI) is the ability of a machine to learn from examples and then make its own predictions or decisions. You already use AI every day — in phones, maps, games and shopping apps.",
    concepts: [
      {
        title: "What makes a machine 'intelligent'?",
        text: "An ordinary machine follows **fixed instructions**: press a switch and the light comes on, every time. An **AI system** learns from **data** (many examples) and can then handle new situations it has never seen.",
        table: [
          ["Machine", "How it works", "AI?"],
          ["Calculator", "Follows fixed rules for + − × ÷", "No"],
          ["Alarm clock", "Rings at the time you set", "No"],
          ["Face unlock", "Learned your face from many photos", "Yes"],
          ["Video suggestions", "Learned what you like from what you watched", "Yes"],
        ],
      },
      {
        title: "AI or automation?",
        text: "**Automation** means a machine does a task by itself, but always in the same way (a traffic light changing every 60 seconds). **AI** means the machine **decides** using what it has learned (a traffic light that changes timing by counting cars on a camera).",
        points: ["Ask: does it **learn** from examples?", "Ask: can it deal with something **new**?", "If both answers are yes, it is AI."],
        remember: "All AI is automatic, but not everything automatic is AI.",
      },
      {
        title: "The three main areas (domains) of AI",
        text: "AI systems are grouped by the kind of data they work with.",
        table: [
          ["Domain", "Works with", "Examples"],
          ["Computer Vision (CV)", "Pictures and videos", "Face unlock, number-plate reader"],
          ["Natural Language Processing (NLP)", "Speech and text", "Voice assistants, translation apps"],
          ["Data Science", "Numbers and records", "Weather forecasts, shop sales predictions"],
        ],
        fig: { kind: "icons", items: [{ icon: "📷" }, { icon: "🎙️" }, { icon: "📊" }], cols: 3, alt: "A camera, a microphone and a chart: Computer Vision, NLP and Data Science" },
      },
      {
        title: "How an AI learns",
        text: "AI learns like you learn to recognise a mango: by seeing **many examples**. The more good, varied examples it sees, the better it becomes.",
        example: { q: "A school wants an app that tells whether a leaf is healthy or sick. What does the app need first?", steps: ["The app must learn what healthy and sick leaves look like.", "So it needs many photos of leaves, each marked 'healthy' or 'sick'."], answer: "Lots of labelled leaf photos (data)" },
      },
    ],
    tip: "To decide whether something is AI, ask 'Did it learn from examples?' — not 'Is it a computer?'",
  }),
  "6-AI-2": T({
    intro: "Data is information we collect: numbers, words, pictures and sounds. AI learns from data, so it is important to know the kinds of data and how to organise them.",
    concepts: [
      {
        title: "Kinds of data",
        text: "**Quantitative** data is made of numbers you can count or measure (height, marks, temperature). **Qualitative** data is made of words or categories (favourite colour, type of pet).",
        table: [
          ["Data", "Kind"],
          ["Number of books read", "Quantitative"],
          ["Language spoken at home", "Qualitative"],
          ["Time to run 100 m", "Quantitative"],
          ["Colour of a car", "Qualitative"],
        ],
      },
      {
        title: "Structured and unstructured data",
        text: "**Structured** data fits neatly into rows and columns, like an attendance sheet or a marks table. **Unstructured** data has no fixed rows and columns: photos, videos, voice notes and letters.",
        remember: "AI can learn from both, but unstructured data usually needs much more work to prepare.",
      },
      {
        title: "Collecting and organising data",
        text: "Collect data with a **survey**, by **observing** or by **measuring**. Then organise it in a **table**, using **tally marks** to count. A table makes it easy to find totals, the largest and the smallest.",
        fig: { kind: "pictograph", title: "How we come to school", labels: ["Bus", "Walk", "Cycle"], counts: [4, 3, 2], icon: "🧒", per: 5, alt: "Pictograph: Bus 20, Walk 15, Cycle 10 students (each picture = 5)" },
        example: { q: "In the pictograph, each picture stands for 5 children. How many more children come by bus than by cycle?", steps: ["Bus: 4 pictures × 5 = 20. Cycle: 2 pictures × 5 = 10.", "20 − 10 = 10."], answer: "10 more children" },
      },
      {
        title: "Good data",
        text: "Data is useful only if it is **correct**, **complete** and **enough**. Wrong or missing values lead an AI to wrong answers — 'garbage in, garbage out'.",
        points: ["Check for mistakes (a height of 1,500 cm!).", "Fill in or remove missing values.", "Collect enough examples of every kind."],
      },
    ],
    tip: "Before using any data, ask three questions: Is it right? Is anything missing? Is there enough?",
  }),
  "6-AI-3": T({
    intro: "AI spots patterns in data and uses them to make decisions. Even a simple rule like 'if it is cloudy and windy, take an umbrella' is a decision made from a pattern.",
    concepts: [
      {
        title: "Finding patterns in data",
        text: "A **pattern** is something that repeats or changes in a regular way. AI looks at many examples and finds what they have in common — for example, that spam emails often contain words like 'prize' and many links.",
        fig: { kind: "bars", title: "Ice creams sold", labels: ["20°C", "25°C", "30°C", "35°C"], values: [10, 20, 30, 40], step: 10, showValues: true, alt: "Ice creams sold rise with temperature: 10, 20, 30, 40" },
        remember: "A pattern lets you predict: when it is hotter, more ice creams are sold.",
      },
      {
        title: "If–then rules",
        text: "A decision rule says **if** a condition is true, **then** do something, **otherwise** do something else. With **AND**, both conditions must be true. With **OR**, one true condition is enough.",
        example: { q: "Rule: if the temperature is more than 30 AND the humidity is more than 60, switch the fan ON. Today it is 32 and 55. What happens?", steps: ["32 is more than 30: true.", "55 is not more than 60: false.", "With AND, both must be true."], answer: "The fan stays OFF" },
      },
      {
        title: "Decision trees",
        text: "A **decision tree** asks one question at a time. Each answer leads to the next question, until you reach a decision. AI can build such trees by itself from examples.",
        points: ["Is it raining? Yes → take an umbrella.", "No → Is it very sunny? Yes → wear a cap. No → go as you are."],
      },
      {
        title: "Learning from examples: nearest neighbour",
        text: "A simple AI labels a new thing the same as the **most similar** thing it already knows. To find 'most similar', compare the features (like length and width) and choose the smallest total difference.",
        example: { q: "Known: lemon (5 cm long, 4 cm wide), banana (18 cm, 4 cm). A new fruit is 6 cm long and 4 cm wide. What is it?", steps: ["Difference from lemon: 1 + 0 = 1.", "Difference from banana: 12 + 0 = 12."], answer: "Lemon — it is closest" },
      },
    ],
    tip: "When checking a rule, test each condition separately, then combine them with AND or OR.",
  }),
  "6-AI-4": T({
    intro: "Everything we do online leaves a trace. Being a responsible digital citizen means protecting your information, respecting others and using technology — including AI — safely and fairly.",
    concepts: [
      {
        title: "Your digital footprint",
        text: "Your **digital footprint** is the trail of information you leave online: posts, photos, comments, searches and the apps you use. It can stay for a very long time and others may see it.",
        points: ["Think before you post: would you be happy for anyone to see it?", "Never share your address, phone number, school name or passwords with strangers."],
      },
      {
        title: "Staying safe online",
        text: "Be careful with messages that promise prizes or ask you to click links and type personal details — this is **phishing**. Use **strong passwords** and do not share them.",
        table: [
          ["Weak password", "Strong password"],
          ["riya2014", "Mango#42Sky!"],
          ["123456", "Tiger!7River@9"],
        ],
        remember: "A strong password is long (10+ characters) and mixes capital letters, small letters, numbers and symbols.",
      },
      {
        title: "Respecting others' work",
        text: "Pictures, music and writing belong to the people who made them. Use them only if you are **allowed**, and always **give credit**. Copying someone's work and calling it your own is **plagiarism**.",
      },
      {
        title: "Using AI responsibly",
        text: "AI tools can be wrong or unfair. Check important answers with a trusted source, do not use AI to cheat or to hurt others, and tell a trusted adult if something online makes you uncomfortable.",
        fig: { kind: "icons", items: [{ icon: "🔐", mark: "tick" }, { icon: "📍", mark: "cross" }, { icon: "🤝", mark: "tick" }], cols: 3, alt: "Keep passwords secret (tick), do not share location (cross), be kind (tick)" },
      },
    ],
    tip: "Before you click, share or post, stop and ask: Is it true? Is it safe? Is it kind?",
  }),
  // ---------------------------------------------------------------- Class 7
  "7-AI-1": T({
    intro: "AI is used in three main domains, each working with a different kind of data. Knowing the domain tells you what the AI takes in, what it gives out and what data it needs to learn.",
    concepts: [
      {
        title: "Computer Vision (CV)",
        text: "CV helps machines **see**: it works with photos and videos. Input: an image. Output: what is in it.",
        points: ["Face unlock and attendance systems", "Reading number plates", "Spotting diseased crops from leaf photos", "Finding cracked products on a factory belt"],
        fig: { kind: "icons", items: [{ icon: "📷" }, { icon: "🚗" }, { icon: "🌿" }], cols: 3, alt: "Camera, car and leaf: Computer Vision examples" },
      },
      {
        title: "Natural Language Processing (NLP)",
        text: "NLP helps machines **understand and produce human language**, spoken or written.",
        points: ["Voice assistants that answer questions", "Translating a notice from English to Hindi", "Spam filters reading emails", "Auto-complete while typing"],
      },
      {
        title: "Data Science",
        text: "Data Science finds **patterns in numbers and records** to describe the past and predict the future.",
        points: ["Weather forecasts from years of records", "Predicting how many samosas the canteen will sell", "Recommending films from what you watched", "Spotting unusual bank payments"],
      },
      {
        title: "Which domain is it?",
        text: "Look at the **input** the system works with.",
        table: [["If the input is…", "the domain is…"], ["photos or video", "Computer Vision"], ["speech or text", "NLP"], ["numbers, tables, records", "Data Science"]],
        example: { q: "An app turns a photo of handwritten notes into typed text. Which domain?", steps: ["The input is a photo.", "The app must recognise letters in the image."], answer: "Computer Vision" },
      },
    ],
    tip: "Many real products combine domains: a smart speaker uses NLP to understand you and Data Science to suggest songs.",
  }),
  "7-AI-2": T({
    intro: "AI is changing how many industries work — from farms and hospitals to banks, shops and transport. It helps people work faster and more accurately, but it also brings new risks to manage.",
    concepts: [
      {
        title: "AI across industries",
        text: "Each industry uses AI to solve its own problems.",
        table: [
          ["Industry", "How AI helps"],
          ["Agriculture", "Drones spot pests; apps predict the best day to sell crops"],
          ["Healthcare", "Reading scans; reminding patients about medicines"],
          ["Banking", "Spotting fraud; answering customers through chatbots"],
          ["Transport", "Finding the fastest route; predicting train delays"],
          ["Retail", "Recommending products; predicting stock to order"],
          ["Education", "Practice at the right level; reading text aloud"],
        ],
      },
      {
        title: "Benefits",
        text: "AI can work **day and night**, handle **huge amounts of data** quickly and notice patterns people might miss. This saves time and money and can save lives — for example, finding a disease early in a scan.",
      },
      {
        title: "Risks and limits",
        text: "AI can make **mistakes**, can be **unfair** if its data is one-sided, can put **private data** at risk, and may change the kinds of jobs people do. That is why important decisions still need a **human** to check them.",
        remember: "AI is a helper. A doctor, a farmer or a bank officer stays responsible for the final decision.",
      },
      {
        title: "Spotting the industry",
        text: "Ask **who** uses the AI and **what problem** it solves.",
        example: { q: "Sensors on a farm predict when a cow may fall sick. Which industry?", steps: ["The users are farmers.", "The problem is keeping farm animals healthy."], answer: "Agriculture" },
      },
    ],
    tip: "Look for the problem first, then the industry: 'fraud' → banking, 'scan' → healthcare, 'crop' → agriculture.",
  }),
  "7-AI-3": T({
    intro: "Data becomes useful when we can see what it tells us. Charts show data at a glance, and simple measures like the mean and range sum it up in a single number.",
    concepts: [
      {
        title: "Choosing the right chart",
        text: "Pick the chart that makes the main idea clear.",
        table: [["Chart", "Best for", "Example"], ["Bar graph", "comparing groups", "books read by each class"], ["Line graph", "change over time", "temperature every hour"], ["Pie chart", "parts of one whole", "how a family spends its money"]],
        fig: { kind: "bars", title: "Books read", labels: ["6A", "6B", "6C", "6D"], values: [30, 45, 25, 40], step: 10, showValues: true, alt: "Bar graph: 6A 30, 6B 45, 6C 25, 6D 40" },
      },
      {
        title: "Reading a chart carefully",
        text: "Always read the **title**, the **labels** and the **scale** first. A scale may go up in 2s, 5s or 10s; a pictograph has a **key** that says what each picture stands for.",
        remember: "A chart whose scale does not start at 0 can make small differences look huge.",
      },
      {
        title: "Mean, median, mode and range",
        text: "These numbers describe a whole set of data.",
        points: ["**Mean** (average) = total ÷ number of values.", "**Median** = the middle value when the values are in order.", "**Mode** = the value that appears most often.", "**Range** = largest − smallest; it shows how spread out the data is."],
        example: { q: "Marks: 6, 8, 8, 9, 4. Find the mean, median, mode and range.", steps: ["Total 35, 5 values: mean 35 ÷ 5 = 7.", "In order 4, 6, 8, 8, 9: median 8, mode 8.", "Range 9 − 4 = 5."], answer: "Mean 7, median 8, mode 8, range 5" },
      },
      {
        title: "Percentages",
        text: "A percentage compares a part with the whole out of 100: **part ÷ whole × 100**. If 12 out of 40 students walk to school, 12 ÷ 40 × 100 = 30% walk.",
      },
    ],
    tip: "Before you answer a chart question, say out loud what one square, bar step or picture is worth.",
  }),
  "7-AI-4": T({
    intro: "An AI is only as fair as the data it learns from. If the data leaves people out or repeats old unfairness, the AI can be biased. Spotting and reducing bias is part of using AI responsibly.",
    concepts: [
      {
        title: "What is AI bias?",
        text: "**Bias** means the AI treats some people or things **unfairly** — for example, a voice assistant that understands city accents but often fails for village accents.",
        fig: { kind: "bars", title: "Voice clips used for training", labels: ["City", "Village", "Hill"], values: [900, 200, 300], step: 200, showValues: true, alt: "Training data: City 900, Village 200, Hill 300 clips" },
      },
      {
        title: "Where bias comes from",
        text: "Bias usually comes from the **data**, not from the computer itself.",
        points: ["**Too few examples** of some groups (few village voices).", "**Old unfair decisions** in the data (past hiring records that mostly chose men).", "**One-sided collection** (photos only from one city)."],
      },
      {
        title: "Checking for bias",
        text: "Test the AI **separately for each group** and compare the results. A big gap in accuracy between groups is a warning sign.",
        example: { q: "A face-unlock app is right 48 times out of 50 for one group and 32 out of 50 for another. Is it fair?", steps: ["Group 1: 48 ÷ 50 = 96%.", "Group 2: 32 ÷ 50 = 64%.", "The gap is 32 percentage points."], answer: "No — it works much worse for the second group" },
      },
      {
        title: "Reducing bias",
        text: "Collect **balanced** data from every group, check the AI's results for each group, ask people from different groups to test it, and let humans review important decisions.",
        remember: "Fair AI needs fair data — every group should be well represented.",
      },
    ],
    tip: "When you see an AI result, ask: 'Would it work just as well for everyone?'",
  }),
  // ---------------------------------------------------------------- Class 8
  "8-AI-1": T({
    intro: "Building an AI system follows a cycle of steps, from understanding the problem to putting the AI to use. Following the cycle carefully gives AI that actually helps the people it is meant for.",
    concepts: [
      {
        title: "The AI project cycle",
        text: "An AI project moves through six stages, in order.",
        table: [
          ["Stage", "What happens"],
          ["1. Problem scoping", "Decide exactly what problem to solve, and for whom"],
          ["2. Data acquisition", "Collect the data needed (photos, records, recordings)"],
          ["3. Data exploration", "Clean the data and study it with charts"],
          ["4. Modelling", "Choose a method and train the model on the data"],
          ["5. Evaluation", "Test the model on new data and measure accuracy"],
          ["6. Deployment", "Put the model to use in an app or system"],
        ],
      },
      {
        title: "Problem scoping: the 4Ws",
        text: "Before collecting any data, answer four questions.",
        points: ["**Who** has the problem? (farmers)", "**What** is the problem? (crops get diseases that are spotted too late)", "**Where** does it happen? (in the fields)", "**Why** solve it? (to save crops and income)"],
      },
      {
        title: "Training and testing",
        text: "The data is split into a **training set** (to learn from) and a **testing set** (kept aside to check the model on data it has never seen). A common split is 80% training and 20% testing.",
        example: { q: "A team has 500 leaf photos and uses 80% for training. How many are kept for testing?", steps: ["Testing share = 100% − 80% = 20%.", "20% of 500 = 100."], answer: "100 photos" },
      },
      {
        title: "Measuring success",
        text: "**Accuracy** = correct answers ÷ total test items × 100. If the model is not good enough, the team goes back to earlier stages — more data, better cleaning or a different model.",
        remember: "The cycle can loop: evaluation often sends a team back to collect better data.",
      },
    ],
    tip: "Never skip problem scoping — a perfect model that solves the wrong problem helps no one.",
  }),
  "8-AI-2": T({
    intro: "Machines learn in different ways, and those ways power the AI applications around us. Knowing how a system learned helps you understand what it can and cannot do.",
    concepts: [
      {
        title: "Three ways machines learn",
        text: "Machine learning is the part of AI where computers learn from data.",
        table: [
          ["Type", "How it learns", "Example"],
          ["Supervised", "From examples labelled with the right answer", "Photos marked 'cat' or 'dog'"],
          ["Unsupervised", "Finds groups in data with no labels", "Grouping shoppers by what they buy"],
          ["Reinforcement", "By trial and error, with rewards and penalties", "A robot learning to walk"],
        ],
      },
      {
        title: "Classification and prediction",
        text: "**Classification** puts something into a group (spam or not spam). **Regression** predicts a number (tomorrow's temperature). **Clustering** finds groups no one named in advance.",
      },
      {
        title: "Applications all around us",
        text: "AI applications combine domains and learning types.",
        points: ["**Healthcare:** scans read by Computer Vision (supervised).", "**Shopping:** recommendations from Data Science (often unsupervised groups).", "**Games and robots:** reinforcement learning.", "**Chatbots:** NLP trained on many conversations."],
        fig: { kind: "icons", items: [{ icon: "🏥" }, { icon: "🛍️" }, { icon: "🤖" }, { icon: "💬" }], cols: 4, alt: "Hospital, shopping, robot and chat icons" },
      },
      {
        title: "Testing an application",
        text: "Test on items the model has **never seen**. Count right and wrong answers and work out the accuracy.",
        example: { q: "A model is tested on 20 photos and gets 17 right. What is its accuracy?", steps: ["Accuracy = right ÷ total × 100.", "17 ÷ 20 × 100 = 85."], answer: "85%" },
      },
    ],
    tip: "Ask two questions about any AI: 'What data did it learn from?' and 'Were the examples labelled?'",
  }),
  "8-AI-3": T({
    intro: "Data decides what an AI learns. Fair, balanced and correctly used data gives AI that works well for everyone; one-sided data gives AI that fails some people.",
    concepts: [
      {
        title: "Representative data",
        text: "Data is **representative** when it includes all the kinds of people or things the AI will meet. A handwriting reader for all of India needs samples in many scripts and from children and adults.",
        fig: { kind: "bars", title: "Handwriting samples", labels: ["Hindi", "English", "Tamil", "Bangla"], values: [600, 550, 250, 200], step: 100, showValues: true, alt: "Hindi 600, English 550, Tamil 250, Bangla 200 samples" },
        remember: "The group with the fewest examples is where the AI will most likely make mistakes.",
      },
      {
        title: "Balancing a dataset",
        text: "To balance the data, collect more examples of the smaller groups until they match the larger ones.",
        example: { q: "In the chart, how many more Bangla samples are needed to match Hindi?", steps: ["Hindi has 600 and Bangla has 200.", "600 − 200 = 400."], answer: "400 more Bangla samples" },
      },
      {
        title: "Fairness checks",
        text: "Measure accuracy **for each group**. If one group's accuracy is much lower, the AI is not fair yet: collect more data for that group, retrain and test again.",
      },
      {
        title: "Data and privacy",
        text: "Data about people must be collected with **permission**, kept **secure** and used only for the purpose people agreed to. Remove names and other details that identify people when they are not needed.",
      },
    ],
    tip: "Look at a dataset as a chart first: unequal bars warn you about unfairness before you train anything.",
  }),
  "8-AI-4": T({
    intro: "Responsible AI means designing and using AI so that it is fair, safe and respectful of people. A few clear principles help us judge whether an AI is being used well.",
    concepts: [
      {
        title: "Principles of responsible AI",
        text: "Five principles appear again and again.",
        table: [
          ["Principle", "Meaning", "Broken when…"],
          ["Privacy", "People's data is protected", "an app shares locations without asking"],
          ["Fairness", "No group is treated worse", "a loan AI gives lower scores to some areas"],
          ["Transparency", "People can find out why the AI decided", "a bank only says 'the computer decided'"],
          ["Accountability", "A person is responsible and can be asked", "no one checks the AI's medical advice"],
          ["Safety", "The AI is tested before it is used", "a delivery robot is sent out untested"],
        ],
      },
      {
        title: "Misinformation and deepfakes",
        text: "AI can make fake pictures, voices and videos (**deepfakes**) that look real. Before believing or sharing something surprising, **check** it on trusted sources and look at who posted it.",
        points: ["Is it on trusted news sites?", "Does the picture or voice look odd?", "Who gains if you believe it?"],
      },
      {
        title: "Humans in charge",
        text: "For decisions that affect people's health, money or rights, a **human** should review what the AI suggests and be able to change it. People should be able to **appeal** to a human.",
        remember: "AI suggests; responsible people decide.",
      },
      {
        title: "Using AI tools responsibly as a student",
        text: "Use AI tools to learn, not to copy. Say when you used AI, check its answers, never share others' private data with it, and do not use it to make harmful or fake content.",
        fig: { kind: "icons", items: [{ icon: "✅", mark: "tick" }, { icon: "🔍", mark: "tick" }, { icon: "🎭", mark: "cross" }], cols: 3, alt: "Check answers (tick), verify sources (tick), no fakes (cross)" },
      },
    ],
    tip: "To judge an AI use, go through the five principles one by one: Privacy, Fairness, Transparency, Accountability, Safety.",
  }),
};
