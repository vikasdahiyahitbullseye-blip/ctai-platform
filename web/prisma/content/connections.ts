// How each chapter's thinking connects to other subjects. Keys: "<class>-<part>-<chapter number>".
// Every CT chapter also gets an automatic link to the NCERT Mathematics chapter it accompanies (see seed.ts).
type Link = { subject: string; topic: string; how: string; activity?: string };
export const CONNECTIONS: Record<string, { focus: string; links: Link[] }> = {
  // ---------------- Class 3 ----------------
  "3-CT-1": {
    focus: "Patterns and rules in number names; secret codes (simple encryption).",
    links: [
      { subject: "ENGLISH", topic: "Spelling and alphabetical order", how: "Counting letters, ordering words alphabetically and reading backwards use the same step-by-step rules as number names.", activity: "Make a class dictionary of 10 words and sort them alphabetically in pairs." },
      { subject: "DAILY_LIFE", topic: "PINs and passwords", how: "The Caesar-cipher idea explains why PINs and passwords are kept secret.", activity: "Pass a coded 'secret message' (shift of 1) to a friend and decode theirs." },
      { subject: "COMPUTER", topic: "Encryption", how: "Computers hide messages with codes, just like the letter-shift code — only much stronger." },
    ],
  },
  "3-CT-5": {
    focus: "Shapes, faces and corners; folding and views (abstract thinking).",
    links: [
      { subject: "ART", topic: "Paper folding and symmetry", how: "Folding paper to make shapes is visual reasoning about how shapes change.", activity: "Fold a square in different ways and predict the shape before opening it." },
      { subject: "EVS", topic: "Shapes in our surroundings", how: "Spotting cubes, cuboids and cylinders in the classroom is classifying objects by their properties." },
    ],
  },
  "3-CT-14": {
    focus: "Directions, routes and money at a fair (algorithmic thinking, decomposition).",
    links: [
      { subject: "EVS", topic: "Maps, directions and our neighbourhood", how: "Giving step-by-step directions on a map is writing an algorithm.", activity: "Draw the route from the classroom to the library as arrows on a grid." },
      { subject: "DAILY_LIFE", topic: "Shopping at a mela", how: "Working out cost and change breaks a problem into small steps." },
      { subject: "PE", topic: "Movement games", how: "'Robot' games (2 steps forward, turn right) act out an algorithm with the body.", activity: "Play 'Programme the Robot' in the playground with direction cards." },
    ],
  },
  "3-EVS-2": {
    focus: "Plant growth steps, plant products and repeating patterns in nature.",
    links: [
      { subject: "MATHS", topic: "Adding equal amounts", how: "Growth of 2 cm every week is a repeating rule — a number pattern." },
      { subject: "SCIENCE", topic: "What plants need", how: "Ordering the steps to grow a seed is sequencing (algorithmic thinking)." },
    ],
  },
  "3-EVS-5": {
    focus: "Saving water: measuring use, finding patterns and choosing the best option.",
    links: [
      { subject: "MATHS", topic: "Addition and time", how: "Adding litres used and counting drops per minute is decomposition with numbers.", activity: "Keep a one-day 'water diary' at home and total it in class." },
      { subject: "DAILY_LIFE", topic: "Saving water at home", how: "Comparing options and choosing the one that saves most water is evaluation." },
    ],
  },
  // ---------------- Class 4 ----------------
  "4-CT-3": {
    focus: "Patterns in numbers, shapes and around us.",
    links: [
      { subject: "ART", topic: "Rangoli and border designs", how: "Rangoli and borders repeat a core unit — the same idea as a repeating pattern rule.", activity: "Design a border with a 3-part repeating unit and swap with a friend to continue it." },
      { subject: "ENGLISH", topic: "Rhymes and poems", how: "Rhyme schemes are sound patterns that repeat in a rule." },
    ],
  },
  "4-CT-11": {
    focus: "Mirror images and symmetry.",
    links: [
      { subject: "ART", topic: "Symmetrical designs and ink blots", how: "Predicting the other half of a design is abstract thinking." },
      { subject: "EVS", topic: "Symmetry in leaves, butterflies and flowers", how: "Recognising symmetry in nature is pattern recognition." },
    ],
  },
  "4-CT-14": {
    focus: "Collecting, organising and reading data.",
    links: [
      { subject: "EVS", topic: "Survey of the neighbourhood", how: "Tallying vehicles or trees outside school is collecting and organising data.", activity: "Count vehicles passing the gate for 5 minutes and make a pictograph." },
      { subject: "SCIENCE", topic: "Observations", how: "Recording observations in a table is the first step of every investigation." },
    ],
  },
  // ---------------- Class 5 ----------------
  "5-CT-14": {
    focus: "Maps, locations and routes.",
    links: [
      { subject: "SST", topic: "Map reading, directions and scale", how: "Finding the shortest route with rules is an algorithm with constraints." },
      { subject: "COMPUTER", topic: "Navigation apps", how: "Map apps find routes using the same step-by-step search ideas (and AI for traffic prediction)." },
    ],
  },
  "5-CT-15": {
    focus: "Reading and drawing data with pictures.",
    links: [
      { subject: "EVS", topic: "Weather and seasons", how: "Charting rainy and sunny days reveals patterns in the weather.", activity: "Record the weather for 2 weeks with symbols and find the most common type." },
      { subject: "SCIENCE", topic: "Recording experiments", how: "Pictographs and bar graphs make results easy to compare." },
    ],
  },
  // ---------------- Class 6 ----------------
  "6-CT-1": {
    focus: "Number sequences, rules and generalisation (square, triangular, cube numbers).",
    links: [
      { subject: "SCIENCE", topic: "Patterns in observations", how: "Scientists look for rules in measurements, just as we find the rule in a sequence." },
      { subject: "ART", topic: "Growing patterns in tiles and kolam", how: "Matchstick and tile patterns grow by a rule (e.g. 3n + 1).", activity: "Build a growing tile pattern and write the rule for the 10th step." },
      { subject: "COMPUTER", topic: "Loops", how: "A rule applied again and again is what a loop in a computer program does." },
    ],
  },
  "6-CT-3": {
    focus: "Digit puzzles, palindromes, Kaprekar's routine and number logic.",
    links: [
      { subject: "ENGLISH", topic: "Palindromes and word puzzles", how: "Word palindromes (madam, level) follow the same rule as number palindromes." },
      { subject: "DAILY_LIFE", topic: "Logic puzzles (Sudoku, KenKen)", how: "Using clues to rule out possibilities is decomposition and logical deduction." },
    ],
  },
  "6-CT-4": {
    focus: "Collecting data and presenting it in tables and graphs.",
    links: [
      { subject: "SCIENCE", topic: "Recording experiment results", how: "Organising measurements in tables is data handling — the raw material of AI." },
      { subject: "SST", topic: "Population and climate data", how: "Reading bar graphs about states or rainfall uses the same skills." },
    ],
  },
  "6-AI-1": {
    focus: "What AI is, AI vs automation, human vs machine intelligence, types of learning.",
    links: [
      { subject: "SCIENCE", topic: "How living things learn and sense", how: "Comparing how humans learn with how machines learn from data." },
      { subject: "SST", topic: "Technology in society", how: "Recognising AI in banking, transport and agriculture in India.", activity: "List 5 AI apps your family uses and classify each as supervised, unsupervised or reinforcement learning." },
      { subject: "ENGLISH", topic: "Debate", how: "Debate: 'Can a machine ever be as clever as a human?'" },
    ],
  },
  "6-AI-2": {
    focus: "Types of data (text, number, image, sound) and organising data.",
    links: [
      { subject: "MATHS", topic: "Data handling and presentation", how: "Tables and charts in Maths are how we prepare data for AI." },
      { subject: "SCIENCE", topic: "Observation and measurement", how: "Every measurement in an experiment is a data point." },
    ],
  },
  "6-AI-3": {
    focus: "Spotting patterns in data and routines to make decisions.",
    links: [
      { subject: "MATHS", topic: "Patterns in Mathematics", how: "Pattern recognition in sequences is the same skill AI uses on data." },
      { subject: "PE", topic: "Training routines", how: "Tracking practice and performance helps decide what to improve." },
    ],
  },
  "6-AI-4": {
    focus: "Online safety, privacy, passwords, digital footprints and ethics.",
    links: [
      { subject: "SST", topic: "Rights and responsibilities", how: "Digital citizenship extends rights and duties into the online world." },
      { subject: "ENGLISH", topic: "Writing rules and posters", how: "Write a class charter for safe online behaviour.", activity: "Make a poster: '5 rules for a strong password'." },
    ],
  },
  // ---------------- Class 7 ----------------
  "7-AI-1": {
    focus: "AI domains (Computer Vision, NLP, Data Science) and predictive techniques.",
    links: [
      { subject: "MATHS", topic: "Data and graphs", how: "Regression is drawing the 'best line' through data to predict a value." },
      { subject: "ENGLISH", topic: "Language and translation", how: "NLP lets computers translate and summarise text — and shows where they make mistakes." },
      { subject: "SCIENCE", topic: "Classification of living things", how: "Grouping organisms by features is exactly what classification models do." },
    ],
  },
  "7-AI-3": {
    focus: "Collecting structured data; bar, line and pie charts; interpreting trends.",
    links: [
      { subject: "MATHS", topic: "Percentages and data handling", how: "Pie charts need percentages; line graphs show trends over time." },
      { subject: "SCIENCE", topic: "Nutrition and health data", how: "Food-group data from a class survey can be shown as a pie chart (see the Nutri-Quest project)." },
    ],
  },
  "7-AI-4": {
    focus: "Bias in AI, fairness, consent and digital citizenship.",
    links: [
      { subject: "SST", topic: "Equality and fairness", how: "Unfair AI decisions are a modern form of discrimination — linking to equality in civics." },
      { subject: "ENGLISH", topic: "Case-study discussion", how: "Discuss a real case of biased AI and write a short opinion." },
    ],
  },
  // ---------------- Class 8 ----------------
  "8-CT-3": {
    focus: "Number systems (binary and others) and representations.",
    links: [
      { subject: "COMPUTER", topic: "Binary and how computers store data", how: "Computers store everything — text, images, sound — as binary numbers." },
      { subject: "SST", topic: "History of number systems", how: "Indian, Roman and other number systems show how representation changes thinking." },
    ],
  },
  "8-AI-1": {
    focus: "AI project lifecycle: define problem, collect data, test AI tools, reflect and improve.",
    links: [
      { subject: "SCIENCE", topic: "The scientific method", how: "The AI project cycle mirrors question → data → test → conclusion in science." },
      { subject: "PE", topic: "Fitness data", how: "Use the cycle on a fitness question (see the 'Game On' project)." },
    ],
  },
  "8-AI-3": {
    focus: "How AI uses data; finding bias in datasets; fairness and inclusivity.",
    links: [
      { subject: "MATHS", topic: "Proportional reasoning and sampling", how: "Checking whether a dataset represents everyone is proportional reasoning." },
      { subject: "SST", topic: "Social justice", how: "Fair representation in data connects to inclusion in society." },
    ],
  },
};
