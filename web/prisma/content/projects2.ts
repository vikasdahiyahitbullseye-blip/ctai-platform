// More Hitbullseye project kits, so every class has four to choose from. Same format as projects.ts:
// Classes 6–8 kits are 20-session interdisciplinary projects (CBSE asks for two a year); Classes 3–5 kits are short
// enrichment projects. Data about children is always collected anonymously and with consent.

type Milestone = { phase: string; title: string; sessions: number; studentTask: string; teacherGuide: string; deliverable: string; evidence?: "TEXT" | "FILE" | "ANY" };
type Kit = {
  code: string; classLevel: number; title: string; tagline: string; emoji: string; drivingQuestion: string; overview: string;
  subjects: string[]; skills: string[]; hours: number; finalProduct: string; milestones: Milestone[]; rubric: { name: string; levels: [string, string, string, string] }[];
};
type Levels = [string, string, string, string];
const TEAMWORK = { name: "Teamwork and reflection", levels: ["Few members contributed; no reflection", "Most contributed; brief reflection", "All contributed; honest reflection on what worked", "Roles shared fairly; reflection shows clear learning and next steps"] as Levels };
const COMMUNICATION = { name: "Communication", levels: ["Message unclear", "Main idea shared but hard to follow", "Clear, organised presentation with visuals", "Engaging, well-organised, answers questions confidently"] as Levels };
const DATA_RUBRIC = { name: "Collecting and organising data", levels: ["Little or no data", "Some data, not organised", "Complete data in a clear table or chart", "Complete, checked data with a well-chosen chart"] as Levels };
const ETHICS_RUBRIC = { name: "Responsible data and fairness", levels: ["Names or private data used; fairness not considered", "Partly anonymised; fairness mentioned", "Consented and anonymised; one fairness check", "Consented, anonymised and documented; fairness checked and improved"] as Levels };

export const MORE_PROJECT_KITS: Kit[] = [
  // ---------------- Class 3 ----------------
  {
    code: "P3-SHAPES", classLevel: 3, emoji: "🔺", title: "Shape Detectives", tagline: "Hunt for shapes around school and build a shape-pattern trail.",
    drivingQuestion: "Which shapes hide in our school, and can we make a pattern trail that others can continue?",
    overview: "Children look for 2D and 3D shapes in the classroom and playground, sort what they find, and design a repeating shape trail for another class to complete — abstraction, sorting and patterns.",
    subjects: ["MATHS", "ART", "EVS"], skills: ["ABSTRACT", "PATTERN"], hours: 4, finalProduct: "A shape-sorting chart and a pattern trail on the floor or wall",
    milestones: [
      { phase: "COLLECT", title: "Shape hunt", sessions: 1, studentTask: "Walk around the class and playground with a partner. Draw or photograph 8 things and name their shape (circle, square, triangle, cube, cylinder…).", teacherGuide: "Give each pair a hunting sheet. Accept 'looks like a…' answers and discuss them.", deliverable: "Hunting sheet with 8 shapes" },
      { phase: "EXPLORE", title: "Sort the shapes", sessions: 1, studentTask: "Sort your finds into groups. Explain your rule: by number of corners, flat or curved, or something else.", teacherGuide: "Different sorting rules are all fine — ask each group to name its rule. This is abstraction: noticing what matters.", deliverable: "Sorting chart with the rule written on top" },
      { phase: "CREATE", title: "Make a pattern trail", sessions: 1, studentTask: "Cut out paper shapes and make a repeating pattern trail. Leave the last 3 places empty for others to finish.", teacherGuide: "Push for a repeating unit of 2–4 shapes; strong groups can change two things (shape and colour).", deliverable: "Photo of the trail" },
      { phase: "REFLECT", title: "Swap and check", sessions: 1, studentTask: "Finish another group's trail. Tell them how you knew what comes next.", teacherGuide: "Ask children to say the repeating part aloud — that is the pattern rule.", deliverable: "Spoken or written explanation", evidence: "TEXT" },
    ],
    rubric: [
      { name: "Recognising shapes", levels: ["Names few shapes", "Names most shapes with help", "Names shapes correctly", "Names shapes and their properties (corners, faces)"] },
      { name: "Sorting rule", levels: ["No clear rule", "Rule used but not followed", "Clear rule followed", "Clear rule explained and a second rule tried"] },
      { name: "Pattern", levels: ["No repeat", "Repeat with mistakes", "Correct repeating pattern", "Pattern with two changing features"] },
      TEAMWORK,
    ],
  },
  {
    code: "P3-PARTY", classLevel: 3, emoji: "🎉", title: "Fair Share Party", tagline: "Plan a class party where everyone gets a fair share.",
    drivingQuestion: "How can we plan snacks for a class party so that everyone gets the same and nothing is wasted?",
    overview: "Children count guests, decide what to share, work out equal shares and leftovers, and check the plan step by step — decomposition and sharing (division) in a real setting.",
    subjects: ["MATHS", "EVS", "DAILY_LIFE"], skills: ["DECOMPOSITION", "ALGORITHMIC"], hours: 5, finalProduct: "A party plan sheet: what, how many, who gets what",
    milestones: [
      { phase: "DEFINE", title: "Who is coming?", sessions: 1, studentTask: "Count the children and teachers coming. Make a list of 3 snacks we could share.", teacherGuide: "Link to 'Fun at Class Party!'. Healthy snacks only; check allergies with the class teacher.", deliverable: "Guest count and snack list" },
      { phase: "EXPLORE", title: "Share it out", sessions: 2, studentTask: "Use counters or real items: if we have 30 biscuits for 8 friends, how many each? How many are left?", teacherGuide: "Let them share physically first, then record with numbers. Talk about what to do with leftovers.", deliverable: "Sharing table with leftovers" },
      { phase: "CREATE", title: "Write the plan", sessions: 1, studentTask: "Write step-by-step instructions for the party helpers: what to buy, how to share, who serves.", teacherGuide: "Check that the steps are in order and nothing is missing.", deliverable: "Party plan sheet" },
      { phase: "REFLECT", title: "Did it work?", sessions: 1, studentTask: "After the party (or a pretend party), write one thing that went well and one thing to change.", teacherGuide: "Celebrate fair sharing. Ask: what if 2 more friends came?", deliverable: "Reflection", evidence: "TEXT" },
    ],
    rubric: [
      { name: "Breaking the plan into parts", levels: ["One big step", "Some parts", "All parts listed", "All parts listed and checked"] },
      { name: "Fair shares", levels: ["Shares unequal", "Equal shares with help", "Equal shares and leftovers correct", "Explains sharing with numbers and changes for new guests"] },
      { name: "Clear steps", levels: ["Steps unclear", "Some steps in order", "Clear, ordered steps", "Clear steps another class could follow"] },
      TEAMWORK,
    ],
  },
  {
    code: "P3-SEEDS", classLevel: 3, emoji: "🌱", title: "Seed Diary", tagline: "Grow seeds, measure them every day and spot the pattern.",
    drivingQuestion: "How fast do our seeds grow, and what helps them grow best?",
    overview: "Each group plants fast-growing seeds (moong, mustard) in different conditions, measures height with a paper ruler, and finds patterns in a simple chart — data collection and patterns.",
    subjects: ["EVS", "MATHS", "SCIENCE"], skills: ["DATA", "PATTERN"], hours: 6, finalProduct: "A seed diary with a growth chart",
    milestones: [
      { phase: "DEFINE", title: "Plant and plan", sessions: 1, studentTask: "Plant seeds in two cups: one in sunlight, one in the shade. Guess which will grow taller.", teacherGuide: "Moong or mustard seeds sprout in 2–3 days. Keep water the same for both cups.", deliverable: "Our guess (prediction)" },
      { phase: "COLLECT", title: "Measure every day", sessions: 2, studentTask: "Every day for a week, measure the tallest shoot with a paper strip ruler and record it.", teacherGuide: "Use a class tally sheet. Rotate the measuring job between children.", deliverable: "Growth table" },
      { phase: "EXPLORE", title: "Draw the chart", sessions: 2, studentTask: "Colour a bar for each day. Which cup grew faster? Is there a pattern?", teacherGuide: "Ask: 'How much did it grow each day?' Look for 'about the same each day'.", deliverable: "Growth chart", evidence: "FILE" },
      { phase: "REFLECT", title: "Was our guess right?", sessions: 1, studentTask: "Compare with your guess. What did the seeds need most?", teacherGuide: "Praise honest answers when the guess was wrong — that is what scientists do.", deliverable: "Reflection", evidence: "TEXT" },
    ],
    rubric: [
      DATA_RUBRIC,
      { name: "Finding a pattern", levels: ["No pattern found", "Notices growth", "Describes how growth changes", "Compares the two cups with numbers"] },
      { name: "Fair test", levels: ["Conditions not kept the same", "Some conditions kept", "Only light changed", "Explains why only one thing changed"] },
      TEAMWORK,
    ],
  },
  // ---------------- Class 4 ----------------
  {
    code: "P4-TREASURE", classLevel: 4, emoji: "🗺️", title: "Treasure Map Coders", tagline: "Hide treasure in the playground and write a code that leads to it.",
    drivingQuestion: "Can we write directions so exact that another team finds our treasure on the first try?",
    overview: "Teams draw a grid map of the playground, hide a 'treasure', and write move-and-turn instructions (a program) for another team to follow. Bugs are found and fixed — algorithms, directions and debugging.",
    subjects: ["MATHS", "PE", "ENGLISH"], skills: ["ALGORITHMIC", "ABSTRACT"], hours: 6, finalProduct: "A grid map and a tested instruction card",
    milestones: [
      { phase: "DEFINE", title: "Make the map", sessions: 1, studentTask: "Draw the playground on squared paper. Mark trees, the gate and the tap. Choose a start square.", teacherGuide: "Link to 'Hide and Seek' and maps. One square = 2 steps works well.", deliverable: "Grid map" },
      { phase: "CREATE", title: "Write the code", sessions: 2, studentTask: "Hide a token. Write instructions using only FORWARD n, TURN LEFT, TURN RIGHT to reach it.", teacherGuide: "Strong teams can use REPEAT 3 [FORWARD 2]. Check every step on the map first.", deliverable: "Instruction card" },
      { phase: "PRESENT", title: "Swap and test", sessions: 2, studentTask: "Another team follows your card exactly. Did they find it? Find the bug and fix it.", teacherGuide: "The followers must not guess. Record each bug and its fix.", deliverable: "Bug list and fixed card" },
      { phase: "REFLECT", title: "Reflect", sessions: 1, studentTask: "Write why instructions for a robot must be exact. What was your trickiest bug?", teacherGuide: "Link to how robots and apps follow code.", deliverable: "Reflection", evidence: "TEXT" },
    ],
    rubric: [
      { name: "Map and grid", levels: ["Map unclear", "Map without grid", "Clear grid map with landmarks", "Accurate, labelled grid map"] },
      { name: "Instructions (algorithm)", levels: ["Do not reach the treasure", "Reach it with help", "Reach it exactly", "Short and exact, uses repeats"] },
      { name: "Debugging", levels: ["Did not test", "Tested, not fixed", "Found and fixed a bug", "Found several bugs and explained them"] },
      TEAMWORK,
    ],
  },
  {
    code: "P4-MARKET", classLevel: 4, emoji: "🛍️", title: "Class Market Day", tagline: "Run a pretend market: price things, keep accounts, and find what sells best.",
    drivingQuestion: "How should we price and record our sales so our stall makes a profit?",
    overview: "Teams set up a pretend stall with play money, decide prices, keep a sales record and work out totals and change — decomposition, money and data in a real-world role-play.",
    subjects: ["MATHS", "DAILY_LIFE", "ENGLISH"], skills: ["DECOMPOSITION", "DATA"], hours: 6, finalProduct: "A price list, a sales record and a 'best seller' chart",
    milestones: [
      { phase: "DEFINE", title: "Plan the stall", sessions: 1, studentTask: "Choose 4 items to sell (drawings or craft items). Decide a price for each and why.", teacherGuide: "Keep prices in rupees under ₹100 for easy change. Discuss cost and selling price simply.", deliverable: "Price list" },
      { phase: "COLLECT", title: "Market day", sessions: 2, studentTask: "Sell to other teams using play money. Record every sale: item, price, money given, change.", teacherGuide: "Rotate roles: seller, cashier, record-keeper. Check change calculations.", deliverable: "Sales record sheet" },
      { phase: "EXPLORE", title: "Count up", sessions: 2, studentTask: "Add your total sales. Which item sold most? Make a bar chart.", teacherGuide: "Link to 'Data Handling'. Ask why one item sold best.", deliverable: "Totals and bar chart", evidence: "FILE" },
      { phase: "REFLECT", title: "Next time", sessions: 1, studentTask: "Would you change any price? Why?", teacherGuide: "Introduce 'decisions from data' in simple words.", deliverable: "Reflection", evidence: "TEXT" },
    ],
    rubric: [
      { name: "Money calculations", levels: ["Many errors", "Some errors", "Totals and change correct", "Correct and explained clearly"] },
      DATA_RUBRIC,
      { name: "Using data to decide", levels: ["No decision", "Decision without reason", "Decision based on the chart", "Decision with numbers and a new idea to test"] },
      TEAMWORK,
    ],
  },
  {
    code: "P4-RANGOLI", classLevel: 4, emoji: "🌸", title: "Rangoli Symmetry Studio", tagline: "Design symmetric rangoli patterns and give instructions to recreate them.",
    drivingQuestion: "Can we design a rangoli with lines of symmetry and write instructions so a friend can copy it exactly?",
    overview: "Children explore symmetry in rangoli and kolam designs, create their own on a dot grid, find lines of symmetry and write step-by-step drawing instructions — patterns, abstraction and algorithms with a cultural link.",
    subjects: ["MATHS", "ART", "SST"], skills: ["PATTERN", "ALGORITHMIC"], hours: 6, finalProduct: "A symmetric rangoli design with its instruction card",
    milestones: [
      { phase: "EXPLORE", title: "Look at rangoli", sessions: 1, studentTask: "Look at photos of rangoli and kolam. Mark the lines of symmetry you can see.", teacherGuide: "Link to 'Fun with Symmetry'. Discuss rangoli traditions from different states.", deliverable: "Marked photos" },
      { phase: "CREATE", title: "Design on a dot grid", sessions: 2, studentTask: "Draw one quarter of a design on a 5×5 dot grid, then reflect it to complete the whole rangoli.", teacherGuide: "Use mirrors to check. Strong students try designs with 4 lines of symmetry.", deliverable: "Finished design" },
      { phase: "CREATE", title: "Write the instructions", sessions: 2, studentTask: "Write instructions a friend can follow to draw your design without seeing it. Test them.", teacherGuide: "This is an algorithm. Compare the copy with the original and fix the steps.", deliverable: "Instruction card and the friend's copy", evidence: "FILE" },
      { phase: "REFLECT", title: "Exhibit and reflect", sessions: 1, studentTask: "Display designs. Explain how symmetry helped you write shorter instructions.", teacherGuide: "Point out: 'draw one quarter, then mirror it' is a clever, short algorithm.", deliverable: "Reflection", evidence: "TEXT" },
    ],
    rubric: [
      { name: "Symmetry", levels: ["Not symmetric", "One line of symmetry with errors", "Correct lines of symmetry", "Several lines of symmetry, explained"] },
      { name: "Instructions", levels: ["Copy does not match", "Copy partly matches", "Copy matches", "Copy matches and instructions use the symmetry"] },
      { name: "Creativity", levels: ["Copied design", "Small changes to a model", "Own design", "Own design with a clear theme"] },
      TEAMWORK,
    ],
  },
  {
    code: "P4-TRANSPORT", classLevel: 4, emoji: "🚌", title: "How We Come to School", tagline: "Survey how classmates travel and suggest a safer, greener way.",
    drivingQuestion: "How do children in our school travel, and how could more of us travel safely and cleanly?",
    overview: "Children survey travel modes, tally and chart the data, look for patterns by distance, and present one practical suggestion — data handling linked to EVS and road safety.",
    subjects: ["EVS", "MATHS", "ENGLISH"], skills: ["DATA", "EVALUATION"], hours: 6, finalProduct: "A travel survey chart and a 'safe and green travel' poster",
    milestones: [
      { phase: "DEFINE", title: "Plan the survey", sessions: 1, studentTask: "Write the survey question and the choices: walk, cycle, bus, auto, car, other.", teacherGuide: "Link to 'The Transport Museum'. No names on survey sheets.", deliverable: "Survey sheet" },
      { phase: "COLLECT", title: "Survey", sessions: 2, studentTask: "Ask 3 classes and tally the answers. Also ask: near (under 2 km) or far?", teacherGuide: "Arrange the visits with class teachers. Check tallies add up.", deliverable: "Tally table" },
      { phase: "EXPLORE", title: "Chart and pattern", sessions: 2, studentTask: "Make a bar chart. Do children who live near walk more? What is the most common way?", teacherGuide: "Encourage comparisons with numbers ('twice as many').", deliverable: "Chart with 2 findings", evidence: "FILE" },
      { phase: "PRESENT", title: "Poster and suggestion", sessions: 1, studentTask: "Make a poster with your chart and one suggestion, e.g. a walking group.", teacherGuide: "Invite the principal or transport in-charge to see the posters.", deliverable: "Poster photo" },
    ],
    rubric: [DATA_RUBRIC, { name: "Patterns and comparisons", levels: ["No finding", "One general finding", "Two findings with numbers", "Findings linked to distance or safety"] }, COMMUNICATION, TEAMWORK],
  },
  // ---------------- Class 5 ----------------
  {
    code: "P5-TRIP", classLevel: 5, emoji: "🚆", title: "Plan a Class Trip", tagline: "Choose the best trip using distance, time, cost and a decision table.",
    drivingQuestion: "Which place should our class visit, and how do we decide fairly?",
    overview: "Teams compare three trip options with a decision table (distance, travel time, cost per child, what we learn), plan a timetable and a budget, and present their choice — decomposition, evaluation and data.",
    subjects: ["MATHS", "SST", "EVS"], skills: ["DECOMPOSITION", "EVALUATION"], hours: 8, finalProduct: "A trip proposal with a decision table, timetable and budget",
    milestones: [
      { phase: "DEFINE", title: "Choose the options", sessions: 1, studentTask: "List three places to visit nearby. Decide what makes a 'good trip' for the class.", teacherGuide: "Link to 'We the Travellers' and 'Far and Near'. Turn the class's ideas into 4 criteria.", deliverable: "Options and criteria" },
      { phase: "COLLECT", title: "Find the facts", sessions: 2, studentTask: "For each place find the distance, travel time, ticket and bus cost, and one thing we would learn.", teacherGuide: "Use maps and printed fact sheets. Check units (km, minutes, ₹).", deliverable: "Fact table" },
      { phase: "EXPLORE", title: "Decision table", sessions: 2, studentTask: "Score each option 1–3 on every criterion and add up. Which wins? Does the winner change if cost matters twice as much?", teacherGuide: "This is evaluation: making a decision with clear rules. Discuss weighting simply.", deliverable: "Decision table", evidence: "FILE" },
      { phase: "CREATE", title: "Timetable and budget", sessions: 2, studentTask: "Plan the day from 8:00 to 3:00 and the cost per child.", teacherGuide: "Link to time and money. Check the timetable adds up.", deliverable: "Timetable and budget" },
      { phase: "PRESENT", title: "Pitch the trip", sessions: 1, studentTask: "Present your choice to the class and vote.", teacherGuide: "Ask teams to defend their choice with numbers.", deliverable: "Presentation" },
    ],
    rubric: [
      { name: "Breaking the decision into criteria", levels: ["No criteria", "One or two criteria", "Clear criteria used", "Clear criteria with weighting explained"] },
      { name: "Calculations (distance, time, money)", levels: ["Many errors", "Some errors", "Correct", "Correct and checked"] },
      { name: "Decision", levels: ["No reason", "Reason not linked to data", "Decision follows the table", "Decision follows the table and tests a change"] },
      COMMUNICATION,
    ],
  },
  {
    code: "P5-CODES", classLevel: 5, emoji: "🔐", title: "Secret Code Club", tagline: "Invent ciphers, send secret messages and crack each other's codes.",
    drivingQuestion: "How can we send a message only our friends can read — and can other teams crack it?",
    overview: "Children learn shift ciphers and symbol codes, invent their own coding rule, exchange messages and crack codes using letter patterns — patterns, algorithms and a first look at keeping information safe.",
    subjects: ["MATHS", "ENGLISH", "COMPUTER"], skills: ["PATTERN", "ALGORITHMIC"], hours: 6, finalProduct: "A code book with the team's cipher and a cracked message",
    milestones: [
      { phase: "EXPLORE", title: "Learn some codes", sessions: 1, studentTask: "Decode messages written in a shift code (A→C, B→D…) and a symbol code.", teacherGuide: "Link to 'What's in a Name?'-style letter puzzles. Use a cipher wheel.", deliverable: "Decoded messages" },
      { phase: "CREATE", title: "Invent a code", sessions: 2, studentTask: "Make your own rule for coding letters. Write it as steps someone could follow, then code a message.", teacherGuide: "A coding rule is an algorithm; decoding is the reverse algorithm.", deliverable: "Code rule and coded message" },
      { phase: "EXPLORE", title: "Crack the code", sessions: 2, studentTask: "Swap messages with another team and try to crack them. Which letters appear most?", teacherGuide: "Introduce letter frequency (E, A, T are common) as a pattern clue.", deliverable: "Cracking notes", evidence: "FILE" },
      { phase: "REFLECT", title: "Keeping secrets safe", sessions: 1, studentTask: "Why should we never share passwords? How do apps keep messages safe?", teacherGuide: "Simple talk on passwords and privacy; link to digital safety.", deliverable: "Reflection", evidence: "TEXT" },
    ],
    rubric: [
      { name: "Coding rule (algorithm)", levels: ["Rule unclear", "Rule works sometimes", "Rule works and is written as steps", "Rule works, steps clear, decoding steps given"] },
      { name: "Cracking codes", levels: ["Did not try", "Guessed", "Used patterns to crack part", "Cracked the message and explained how"] },
      { name: "Safety awareness", levels: ["None", "Mentions passwords", "Explains why secrets matter", "Gives practical online safety tips"] },
      TEAMWORK,
    ],
  },
  {
    code: "P5-BIRDS", classLevel: 5, emoji: "🐦", title: "Bird Count Champions", tagline: "Count the birds around school like real citizen scientists.",
    drivingQuestion: "Which birds visit our school, and when are they most active?",
    overview: "Inspired by the Great Backyard Bird Count, children observe birds at fixed times, record counts, make pictographs and find patterns by time of day — data collection, classification and patterns.",
    subjects: ["EVS", "SCIENCE", "MATHS"], skills: ["DATA", "PATTERN"], hours: 8, finalProduct: "A bird count pictograph and a 'bird guide' for the school",
    milestones: [
      { phase: "DEFINE", title: "Learn the birds", sessions: 1, studentTask: "Make identification cards for 6 common birds (crow, myna, sparrow, pigeon, parrot, bulbul).", teacherGuide: "Use pictures. Discuss features that help tell birds apart (classification).", deliverable: "Bird ID cards" },
      { phase: "COLLECT", title: "Count", sessions: 3, studentTask: "For one week, count birds for 10 minutes at morning assembly and after lunch. Record species and number.", teacherGuide: "Same place, same time each day. Remind children to stay quiet and not disturb the birds.", deliverable: "Count sheets" },
      { phase: "EXPLORE", title: "Pictograph and patterns", sessions: 2, studentTask: "Make a pictograph. Which bird is most common? Morning or afternoon?", teacherGuide: "Link to 'Data Through Pictures'. Agree what one picture stands for.", deliverable: "Pictograph with findings", evidence: "FILE" },
      { phase: "PRESENT", title: "School bird guide", sessions: 2, studentTask: "Make a one-page guide to our school's birds with your data.", teacherGuide: "Display in the corridor; invite feedback from other classes.", deliverable: "Bird guide" },
    ],
    rubric: [DATA_RUBRIC, { name: "Classification", levels: ["Cannot tell birds apart", "Identifies some birds", "Identifies birds using features", "Explains which features matter most"] }, { name: "Patterns", levels: ["None", "One finding", "Findings with numbers", "Findings with numbers and possible reasons"] }, TEAMWORK],
  },
  // ---------------- Class 6 (20 sessions each) ----------------
  {
    code: "P6-SMARTBIN", classLevel: 6, emoji: "♻️", title: "Smart Bin Sorters", tagline: "Study our school's waste and train a computer to sort it.",
    drivingQuestion: "How much of our school's waste could be recycled, and can a computer learn to sort it?",
    overview: "Teams audit classroom waste, classify it into wet, dry and recyclable, chart the results, then train a simple image classifier (e.g. Teachable Machine) to sort waste photos and test how accurate it is — data, classification and a first AI model.",
    subjects: ["SCIENCE", "MATHS", "COMPUTER"], skills: ["DATA", "AI_CONCEPT", "EVALUATION"], hours: 20, finalProduct: "Waste audit report, a trained sorting model with its accuracy, and a 'bin plan' for school",
    milestones: [
      { phase: "DEFINE", title: "The waste question", sessions: 2, studentTask: "Write the team's question and plan which bins and days to audit. Agree safety rules (gloves, no sharp items).", teacherGuide: "Link to Science (waste management). Teachers handle any unsafe waste.", deliverable: "Audit plan" },
      { phase: "COLLECT", title: "Waste audit", sessions: 4, studentTask: "For 5 days, sort one class's dry waste into categories and count or weigh each.", teacherGuide: "Use a kitchen scale or count items. Record in a shared table.", deliverable: "Audit data table" },
      { phase: "EXPLORE", title: "Chart the waste", sessions: 3, studentTask: "Make bar and pie charts. What share could be recycled? Which item is most common?", teacherGuide: "Link to 'Data Handling and Presentation' and percentages.", deliverable: "Charts with findings", evidence: "FILE" },
      { phase: "CREATE", title: "Train a sorting model", sessions: 5, studentTask: "Take 20+ photos of each category and train an image classifier. Test it with 10 new photos and count how many it gets right.", teacherGuide: "Use Teachable Machine on school devices. Discuss training vs test data and accuracy = correct ÷ total.", deliverable: "Model test results (accuracy)" },
      { phase: "PRESENT", title: "Bin plan", sessions: 4, studentTask: "Present your findings, the model's accuracy and a plan for better bins.", teacherGuide: "Invite the housekeeping staff or eco-club.", deliverable: "Presentation" },
      { phase: "REFLECT", title: "Reflect", sessions: 2, studentTask: "When did the model make mistakes and why? What would make it better?", teacherGuide: "Link to AI ch. 3 (patterns and decisions). Mistakes come from limited or unbalanced data.", deliverable: "Individual reflections", evidence: "TEXT" },
    ],
    rubric: [DATA_RUBRIC, { name: "AI model and testing", levels: ["No model", "Model trained, not tested", "Model tested; accuracy calculated", "Accuracy calculated, mistakes explained, model improved"] }, { name: "Recommendation", levels: ["None", "General idea", "Plan based on data", "Practical plan with expected impact"] }, COMMUNICATION, TEAMWORK],
  },
  {
    code: "P6-GATE", classLevel: 6, emoji: "🚦", title: "Safe School Gate", tagline: "Count traffic at dispersal time and design a safer system.",
    drivingQuestion: "When is the school gate most crowded, and what simple rules would make it safer?",
    overview: "Teams count vehicles and people at arrival and dispersal, find patterns by time, model the flow with a simple flowchart, and propose rules to reduce crowding — data, patterns and algorithm design for a real school problem.",
    subjects: ["MATHS", "SST", "ENGLISH"], skills: ["DATA", "PATTERN", "ALGORITHMIC"], hours: 20, finalProduct: "Traffic data report and a flowchart of a safer dispersal plan",
    milestones: [
      { phase: "DEFINE", title: "Understand the problem", sessions: 2, studentTask: "Observe the gate for 10 minutes. List the problems you see and write a problem statement.", teacherGuide: "Supervise closely; students observe from a safe spot. Link to civic sense (SST).", deliverable: "Problem statement" },
      { phase: "COLLECT", title: "Count the traffic", sessions: 4, studentTask: "On 4 days, count cars, two-wheelers, buses, cycles and walkers in 5-minute slots.", teacherGuide: "Use tally sheets and a timer; rotate counting roles.", deliverable: "Traffic data table" },
      { phase: "EXPLORE", title: "Find the rush", sessions: 4, studentTask: "Draw line graphs by time slot. When is the peak? Which vehicle type causes most crowding?", teacherGuide: "Ask for averages across days and for one surprising finding.", deliverable: "Graphs and findings", evidence: "FILE" },
      { phase: "CREATE", title: "Design the plan", sessions: 5, studentTask: "Design a dispersal plan as a flowchart (e.g. classes leave in a set order; separate lanes). Simulate it with class volunteers.", teacherGuide: "Flowcharts are algorithms. Test the plan in a role-play and improve it.", deliverable: "Flowchart and simulation notes" },
      { phase: "PRESENT", title: "Present to the school", sessions: 3, studentTask: "Present the data and plan to the principal or prefects.", teacherGuide: "Focus on feasibility and safety.", deliverable: "Presentation" },
      { phase: "REFLECT", title: "Reflect", sessions: 2, studentTask: "What did the data show that opinions missed?", teacherGuide: "Discuss evidence-based decisions.", deliverable: "Reflections", evidence: "TEXT" },
    ],
    rubric: [DATA_RUBRIC, { name: "Patterns", levels: ["None", "Peak identified", "Peak and causes with numbers", "Clear patterns across days, explained"] }, { name: "Plan (algorithm)", levels: ["No plan", "Plan as an idea", "Clear flowchart, tested", "Flowchart tested and improved from the simulation"] }, COMMUNICATION, TEAMWORK],
  },
  {
    code: "P6-PLANTDOC", classLevel: 6, emoji: "🌿", title: "Plant Doctor", tagline: "Build a decision tree that diagnoses sick plants.",
    drivingQuestion: "Can we build a set of yes/no questions that tells what is wrong with a plant?",
    overview: "Teams observe healthy and unhealthy plants, record leaf features, build a decision tree (a rule-based 'expert system'), test it on new plants, and compare it with how AI apps diagnose plants from photos — classification, rules and AI.",
    subjects: ["SCIENCE", "EVS", "COMPUTER"], skills: ["DECOMPOSITION", "AI_CONCEPT", "EVALUATION"], hours: 20, finalProduct: "A plant-diagnosis decision tree with test results",
    milestones: [
      { phase: "DEFINE", title: "What makes a plant sick?", sessions: 2, studentTask: "Research common plant problems: too little water, too much water, no sunlight, pests.", teacherGuide: "Link to Science (plants). Use the school garden or potted plants.", deliverable: "List of problems and signs" },
      { phase: "COLLECT", title: "Observe plants", sessions: 4, studentTask: "Observe 15 plants. Record leaf colour, spots, droopiness, soil wetness and the likely problem.", teacherGuide: "Provide an observation table. Get the gardener's opinion as the 'correct label'.", deliverable: "Observation table" },
      { phase: "CREATE", title: "Build the decision tree", sessions: 5, studentTask: "Write yes/no questions (Are leaves yellow? Is soil wet?) that lead to a diagnosis. Draw it as a tree.", teacherGuide: "Decision trees are a simple form of AI that uses rules. Keep each question about one feature.", deliverable: "Decision tree", evidence: "FILE" },
      { phase: "EXPLORE", title: "Test it", sessions: 4, studentTask: "Test the tree on 10 new plants. How many diagnoses match the gardener's? Fix the rules that failed.", teacherGuide: "Calculate accuracy. Discuss why rules can be wrong.", deliverable: "Test results and improved tree" },
      { phase: "PRESENT", title: "Present", sessions: 3, studentTask: "Show your tree and results. Compare with a plant-ID app's suggestion.", teacherGuide: "Discuss rule-based vs learning-based AI.", deliverable: "Presentation" },
      { phase: "REFLECT", title: "Reflect", sessions: 2, studentTask: "When should we trust an AI diagnosis, and when ask an expert?", teacherGuide: "Link to responsible use of AI.", deliverable: "Reflections", evidence: "TEXT" },
    ],
    rubric: [{ name: "Observation data", levels: ["Little data", "Some features recorded", "Complete table", "Complete, checked table with clear labels"] }, { name: "Decision tree", levels: ["No tree", "Tree with unclear questions", "Clear tree that gives a diagnosis", "Clear tree, tested and improved"] }, { name: "Testing and accuracy", levels: ["Not tested", "Tested informally", "Accuracy calculated", "Accuracy calculated and errors explained"] }, COMMUNICATION, TEAMWORK],
  },
  // ---------------- Class 7 (20 sessions each) ----------------
  {
    code: "P7-ENERGY", classLevel: 7, emoji: "⚡", title: "Energy Audit Squad", tagline: "Measure where our school uses electricity and find ways to save it.",
    drivingQuestion: "Where does our school use the most electricity, and how much could we save?",
    overview: "Teams list appliances, estimate their power use from labels and hours, read the meter, find the biggest users, and calculate savings from simple changes — data, decimals, proportional thinking and evaluation.",
    subjects: ["SCIENCE", "MATHS", "SST"], skills: ["DATA", "DECOMPOSITION", "EVALUATION"], hours: 20, finalProduct: "Energy audit report with a savings plan",
    milestones: [
      { phase: "DEFINE", title: "Plan the audit", sessions: 2, studentTask: "Decide which rooms to audit and what to record. Learn to read watts on labels.", teacherGuide: "Link to Science (electricity). Safety: never open sockets or devices.", deliverable: "Audit plan" },
      { phase: "COLLECT", title: "Count and estimate", sessions: 4, studentTask: "For each room list fans, lights, computers, ACs with watts and hours used per day. Read the school meter daily for a week.", teacherGuide: "Use energy (kWh) = watts × hours ÷ 1000. Check readings with the caretaker.", deliverable: "Appliance table and meter readings" },
      { phase: "EXPLORE", title: "Find the big users", sessions: 4, studentTask: "Calculate daily kWh per room and per appliance type. Chart them. What uses most?", teacherGuide: "Link to decimals and 'Large Numbers Around Us'.", deliverable: "Calculations and charts", evidence: "FILE" },
      { phase: "CREATE", title: "Savings plan", sessions: 5, studentTask: "Propose 3 changes (e.g. switch-off monitors, LED lights). Calculate monthly kWh and rupees saved.", teacherGuide: "Use the local tariff per kWh. Ask teams to rank changes by savings vs effort.", deliverable: "Savings plan with calculations" },
      { phase: "PRESENT", title: "Present", sessions: 3, studentTask: "Present the audit and plan to the eco-club or principal.", teacherGuide: "Encourage a 'switch-off monitor' rota as a follow-up.", deliverable: "Presentation" },
      { phase: "REFLECT", title: "Reflect", sessions: 2, studentTask: "How could smart meters and AI help save energy? What data would they need?", teacherGuide: "Link to AI in industries (smart grids).", deliverable: "Reflections", evidence: "TEXT" },
    ],
    rubric: [DATA_RUBRIC, { name: "Calculations", levels: ["Many errors", "Some errors", "Correct kWh and costs", "Correct, checked and clearly shown"] }, { name: "Savings plan", levels: ["No plan", "Ideas without numbers", "Plan with calculated savings", "Ranked plan with savings and effort"] }, COMMUNICATION, TEAMWORK],
  },
  {
    code: "P7-CHATBOT", classLevel: 7, emoji: "💬", title: "Heritage Guide Chatbot", tagline: "Design a rule-based chatbot that answers questions about a local monument.",
    drivingQuestion: "Can we design a chatbot that helps visitors learn about a heritage site in our city?",
    overview: "Teams research a local monument, collect the questions visitors ask, design a rule-based chatbot (keywords → answers) on paper or in a no-code tool, test it with users, and compare it with how AI chatbots understand language — NLP basics, decomposition and testing.",
    subjects: ["SST", "ENGLISH", "COMPUTER"], skills: ["AI_CONCEPT", "DECOMPOSITION", "ALGORITHMIC"], hours: 20, finalProduct: "A working (paper or no-code) chatbot with test results",
    milestones: [
      { phase: "DEFINE", title: "Choose the site", sessions: 2, studentTask: "Choose a monument and list who would use the chatbot and what they want to know.", teacherGuide: "Link to History/Geography. A school visit or virtual tour helps.", deliverable: "Site and user list" },
      { phase: "COLLECT", title: "Research and questions", sessions: 4, studentTask: "Research facts (history, timings, tickets, how to reach). Collect 20 questions real people would ask.", teacherGuide: "Ask family members for questions. Check facts from reliable sources.", deliverable: "Fact sheet and question list" },
      { phase: "CREATE", title: "Design the chatbot", sessions: 5, studentTask: "Group the questions into intents (timings, history, tickets…). For each intent choose keywords and write the answer. Build it as a flowchart or in a no-code tool.", teacherGuide: "This is how simple chatbots work: match keywords to intents. Introduce 'NLP' as computers working with language.", deliverable: "Intent table / flowchart", evidence: "FILE" },
      { phase: "EXPLORE", title: "Test with users", sessions: 4, studentTask: "Ask 5 people to type or say questions. Count how many get a correct answer. Fix the failures.", teacherGuide: "Record misspellings and new words; add synonyms.", deliverable: "Test log and fixes" },
      { phase: "PRESENT", title: "Demo day", sessions: 3, studentTask: "Demo the chatbot to the class.", teacherGuide: "Compare with an AI chatbot: what can it do that ours can't? What could go wrong?", deliverable: "Demo" },
      { phase: "REFLECT", title: "Reflect", sessions: 2, studentTask: "Write about the limits of your chatbot and how to make it fair for people who speak different languages.", teacherGuide: "Link to AI ethics and inclusion.", deliverable: "Reflections", evidence: "TEXT" },
    ],
    rubric: [{ name: "Research", levels: ["Few facts", "Facts not checked", "Accurate facts", "Accurate, sourced facts"] }, { name: "Chatbot design", levels: ["No structure", "Some intents", "Clear intents, keywords and answers", "Clear design handling misspellings and synonyms"] }, { name: "Testing", levels: ["Not tested", "Tested once", "Tested with users; success rate counted", "Tested, improved and re-tested"] }, COMMUNICATION, TEAMWORK],
  },
  {
    code: "P7-RAIN", classLevel: 7, emoji: "🌧️", title: "Rain & Reservoir Tracker", tagline: "Track rainfall and water levels and predict next month's supply.",
    drivingQuestion: "How does rainfall affect our city's water supply, and can we predict a shortage?",
    overview: "Teams gather rainfall and reservoir/groundwater data from public sources, build their own rain gauge, visualise trends over years and months, make a simple prediction, and discuss water-saving actions — data visualisation, patterns and prediction.",
    subjects: ["SST", "SCIENCE", "MATHS"], skills: ["DATA", "PATTERN", "AI_CONCEPT"], hours: 20, finalProduct: "Rainfall dashboard poster with a prediction and water-saving advice",
    milestones: [
      { phase: "DEFINE", title: "Ask the question", sessions: 2, studentTask: "Write questions about rain and water in your city. Decide which data you need.", teacherGuide: "Link to Geography (monsoon, water resources).", deliverable: "Question list and data plan" },
      { phase: "COLLECT", title: "Gather data", sessions: 4, studentTask: "Collect 5 years of monthly rainfall from IMD or the textbook and build a bottle rain gauge for school.", teacherGuide: "Provide a cleaned table if internet access is limited. Check units (mm).", deliverable: "Data table and rain gauge readings" },
      { phase: "EXPLORE", title: "Visualise", sessions: 4, studentTask: "Make line and bar charts. Which months bring most rain? Is the total changing over the years?", teacherGuide: "Link to AI ch. 3 (Data Visualization). Discuss averages and unusual years.", deliverable: "Charts with findings", evidence: "FILE" },
      { phase: "CREATE", title: "Predict", sessions: 5, studentTask: "Use the average of past years to predict next monsoon month. Compare with the actual value when available.", teacherGuide: "Explain that AI forecasting learns from much more data. Discuss error = actual − predicted.", deliverable: "Prediction and error" },
      { phase: "PRESENT", title: "Dashboard poster", sessions: 3, studentTask: "Make a 'dashboard' poster: charts, prediction, and 3 water-saving actions.", teacherGuide: "Display in the school corridor.", deliverable: "Poster" },
      { phase: "REFLECT", title: "Reflect", sessions: 2, studentTask: "Why might a prediction be wrong? Who is most affected by water shortage?", teacherGuide: "Fairness and uncertainty in predictions.", deliverable: "Reflections", evidence: "TEXT" },
    ],
    rubric: [DATA_RUBRIC, { name: "Visualisation", levels: ["No chart", "Chart with errors", "Correct, labelled charts", "Well-chosen charts that show the pattern clearly"] }, { name: "Prediction", levels: ["None", "Guess", "Prediction from data", "Prediction with error checked and explained"] }, COMMUNICATION, TEAMWORK],
  },
  // ---------------- Class 8 (20 sessions each) ----------------
  {
    code: "P8-SLEEP", classLevel: 8, emoji: "😴", title: "Screen Time & Sleep Study", tagline: "Does screen time before bed affect sleep? Find out with data.",
    drivingQuestion: "Is there a link between screen time before bed and how well students sleep?",
    overview: "Teams design an anonymous survey, collect a week of sleep and screen-time logs, look for relationships with scatter plots, discuss correlation vs causation, and share healthy-habit advice — the AI project cycle with strong ethics.",
    subjects: ["SCIENCE", "MATHS", "PE"], skills: ["DATA", "ETHICS", "EVALUATION"], hours: 20, finalProduct: "Research poster with anonymised data, scatter plot and advice",
    milestones: [
      { phase: "DEFINE", title: "Problem and hypothesis", sessions: 2, studentTask: "Write a research question and a hypothesis. Decide what to measure (bedtime screen minutes, hours slept, how rested you feel 1–5).", teacherGuide: "AI project cycle: problem scoping. Discuss why self-reported data may be inaccurate.", deliverable: "Question, hypothesis, variables" },
      { phase: "COLLECT", title: "Ethical data collection", sessions: 4, studentTask: "Write a consent note and an anonymous 7-day log. Collect logs from volunteers (codes, not names).", teacherGuide: "Parental consent required. Nobody is pressured to take part; data is kept securely.", deliverable: "Consent note and anonymised dataset" },
      { phase: "EXPLORE", title: "Look for a link", sessions: 4, studentTask: "Draw a scatter plot of screen minutes vs hours slept. Calculate averages for low and high screen-time groups.", teacherGuide: "Link to 'Proportional Reasoning'. Introduce correlation informally.", deliverable: "Scatter plot and group averages", evidence: "FILE" },
      { phase: "EXPLORE", title: "Correlation or cause?", sessions: 3, studentTask: "List other things that could affect sleep (homework, noise, caffeine). Does the data prove screens cause poor sleep?", teacherGuide: "Correlation is not causation — a key idea for judging AI predictions too.", deliverable: "Analysis of other factors" },
      { phase: "PRESENT", title: "Share the findings", sessions: 4, studentTask: "Make a research poster and present healthy-habit advice based on the data.", teacherGuide: "Advice must be respectful and not single anyone out.", deliverable: "Poster and talk" },
      { phase: "REFLECT", title: "Reflect", sessions: 3, studentTask: "Reflect on privacy, honesty in data and what you would do differently.", teacherGuide: "Link to 'Ethics and Responsible AI'.", deliverable: "Reflections", evidence: "TEXT" },
    ],
    rubric: [ETHICS_RUBRIC, DATA_RUBRIC, { name: "Analysis and reasoning", levels: ["No analysis", "Charts without conclusions", "Relationship described with numbers", "Relationship described; correlation vs causation discussed"] }, COMMUNICATION, TEAMWORK],
  },
  {
    code: "P8-ACCESS", classLevel: 8, emoji: "♿", title: "School for Everyone", tagline: "Audit accessibility and design an AI-assisted helper for students with disabilities.",
    drivingQuestion: "How accessible is our school, and how could technology (including AI) help everyone take part?",
    overview: "Teams audit ramps, signs, toilets and digital materials using a checklist, interview students and staff (with consent), prototype an assistive solution (e.g. voice-to-text notes, picture schedules, captioned videos) and evaluate it — empathy, design and fair AI.",
    subjects: ["SST", "ENGLISH", "COMPUTER"], skills: ["ETHICS", "EVALUATION", "AI_CONCEPT"], hours: 20, finalProduct: "Accessibility audit report and a tested prototype",
    milestones: [
      { phase: "DEFINE", title: "Understand needs", sessions: 3, studentTask: "Learn about different disabilities and the idea of inclusive design. Write 3 'How might we…' questions.", teacherGuide: "Invite a special educator if possible. Use respectful, person-first language.", deliverable: "Needs list and questions" },
      { phase: "COLLECT", title: "Accessibility audit", sessions: 4, studentTask: "Use a checklist to audit 5 places and 3 digital materials. Photograph issues (no people in photos).", teacherGuide: "Provide a simple checklist (ramps, rails, signs, contrast, captions).", deliverable: "Audit checklist and photos" },
      { phase: "CREATE", title: "Prototype a helper", sessions: 6, studentTask: "Choose one problem and build a prototype: e.g. captions for a school video using speech-to-text, a picture timetable, or a voice note system.", teacherGuide: "Use free tools on school devices. Discuss how speech recognition is an AI tool and where it makes mistakes (accents, noise).", deliverable: "Prototype", evidence: "FILE" },
      { phase: "EXPLORE", title: "Test with users", sessions: 3, studentTask: "Test the prototype with 3 users (with consent) and record what worked and what didn't.", teacherGuide: "Focus on users' feedback, not on 'winning'.", deliverable: "Test notes and improvements" },
      { phase: "PRESENT", title: "Present", sessions: 2, studentTask: "Present the audit and prototype to the school leadership.", teacherGuide: "Highlight low-cost changes the school can make.", deliverable: "Presentation" },
      { phase: "REFLECT", title: "Reflect", sessions: 2, studentTask: "How can AI help or exclude people with disabilities?", teacherGuide: "Link to 'Data and Fairness in AI'.", deliverable: "Reflections", evidence: "TEXT" },
    ],
    rubric: [{ name: "Understanding users", levels: ["Little empathy shown", "Needs described generally", "Needs described from research and interviews", "Deep, respectful understanding guiding the design"] }, { name: "Audit", levels: ["Incomplete", "Some places checked", "Complete checklist with evidence", "Complete, prioritised findings"] }, { name: "Prototype and testing", levels: ["No prototype", "Prototype not tested", "Tested with users", "Tested, improved, AI limits explained"] }, ETHICS_RUBRIC, TEAMWORK],
  },
  {
    code: "P8-FARM", classLevel: 8, emoji: "🌾", title: "Farm Advisor AI", tagline: "Use crop and weather data to advise farmers when to sow.",
    drivingQuestion: "Can data about rainfall, temperature and soil help a farmer choose what and when to sow?",
    overview: "Teams study crop needs, collect district weather and crop data, build a rule-based or spreadsheet 'advisor', test it on past years, and consider who benefits and who might be left out — the AI project cycle applied to agriculture.",
    subjects: ["SST", "SCIENCE", "MATHS"], skills: ["DATA", "AI_CONCEPT", "ETHICS"], hours: 20, finalProduct: "A crop-advisor rule sheet or spreadsheet with test results and a fairness note",
    milestones: [
      { phase: "DEFINE", title: "Problem scoping", sessions: 2, studentTask: "Interview (or read about) a farmer's sowing decisions. Write the problem and who the advisor is for.", teacherGuide: "Link to Geography (agriculture, kharif and rabi crops). Use the 4Ws canvas.", deliverable: "Problem statement" },
      { phase: "COLLECT", title: "Collect data", sessions: 4, studentTask: "Collect crop requirements (rain, temperature, soil) for 4 crops and 5 years of district rainfall and temperature.", teacherGuide: "Provide cleaned tables from IMD and agriculture sites if needed.", deliverable: "Crop and weather tables" },
      { phase: "EXPLORE", title: "Explore patterns", sessions: 3, studentTask: "Chart rainfall by month and year. Which years were dry? Which crops suit normal and dry years?", teacherGuide: "Discuss variability and risk.", deliverable: "Charts and notes", evidence: "FILE" },
      { phase: "CREATE", title: "Build the advisor", sessions: 5, studentTask: "Write IF–THEN rules or a spreadsheet that recommends a crop and sowing month from rainfall and temperature. Test it on each past year.", teacherGuide: "Count how often the advice would have suited the year (accuracy). Rule-based systems are a simple kind of AI.", deliverable: "Rules/spreadsheet and test table" },
      { phase: "REFLECT", title: "Who benefits?", sessions: 3, studentTask: "Who might the advisor fail (small farmers, no phone, different soil)? How would you make it fairer?", teacherGuide: "Link to 'Data and Fairness in AI' and access to technology.", deliverable: "Fairness analysis" },
      { phase: "PRESENT", title: "Present", sessions: 3, studentTask: "Present your advisor and its limits as if to a farmers' group.", teacherGuide: "Use simple language; no overclaiming.", deliverable: "Presentation" },
    ],
    rubric: [DATA_RUBRIC, { name: "Advisor (rules or model)", levels: ["No advisor", "Rules incomplete", "Working rules tested on past years", "Tested, accuracy reported and rules improved"] }, ETHICS_RUBRIC, COMMUNICATION, TEAMWORK],
  },
];
