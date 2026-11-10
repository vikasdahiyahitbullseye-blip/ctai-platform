// Hitbullseye project kits. Classes 6–8 kits are the two 20-hour interdisciplinary projects CBSE requires per year;
// themes follow the examples CBSE showed in its April 2026 webinar and will be re-mapped when CBSE publishes its official list.
// Classes 3–5 kits are optional enrichment (CBSE does not require projects at this stage).

type Milestone = { phase: string; title: string; sessions: number; studentTask: string; teacherGuide: string; deliverable: string; evidence?: "TEXT" | "FILE" | "ANY" };
type Kit = {
  code: string; classLevel: number; title: string; tagline: string; emoji: string; drivingQuestion: string; overview: string;
  subjects: string[]; skills: string[]; hours: number; finalProduct: string; milestones: Milestone[]; rubric: { name: string; levels: [string, string, string, string] }[];
};

const STANDARD_RUBRIC = {
  teamwork: { name: "Teamwork and reflection", levels: ["Few members contributed; no reflection", "Most contributed; brief reflection", "All contributed; honest reflection on what worked", "Roles shared fairly; reflection shows clear learning and next steps"] as [string, string, string, string] },
  communication: { name: "Communication", levels: ["Message unclear", "Main idea shared but hard to follow", "Clear, organised presentation with visuals", "Engaging, well-organised, answers questions confidently"] as [string, string, string, string] },
};

export const PROJECT_KITS: Kit[] = [
  {
    code: "P3-ROUTINE", classLevel: 3, emoji: "⏰", title: "My Morning Robot", tagline: "Write the perfect morning routine — so clear that a robot could follow it!",
    drivingQuestion: "Can we write instructions for getting ready for school that a robot could follow without mistakes?",
    overview: "Children break their morning routine into steps, put them in order, test them by acting them out, and fix 'bugs' — a gentle first taste of algorithms and debugging.",
    subjects: ["EVS", "ENGLISH", "MATHS"], skills: ["ALGORITHMIC", "DECOMPOSITION"], hours: 4, finalProduct: "Illustrated step cards and a 'robot' role-play",
    milestones: [
      { phase: "DEFINE", title: "What do we do every morning?", sessions: 1, studentTask: "List everything you do from waking up to reaching school. Draw or write each step on a card.", teacherGuide: "Model with 'making a sandwich'. Accept drawings. Aim for 6–10 steps per child.", deliverable: "Step cards (photo or list)" },
      { phase: "CREATE", title: "Put the steps in order", sessions: 1, studentTask: "Arrange your cards in the right order. Number them. Are any steps missing?", teacherGuide: "Ask: 'Can you brush your teeth before picking up the brush?' Encourage pairs to check each other.", deliverable: "Numbered routine" },
      { phase: "PRESENT", title: "Robot test!", sessions: 1, studentTask: "A friend plays the robot and does EXACTLY what your cards say. Did anything go wrong? Fix it.", teacherGuide: "The 'robot' must follow instructions literally. Celebrate bugs found — that's debugging!", deliverable: "One bug you found and how you fixed it" },
      { phase: "REFLECT", title: "What did we learn?", sessions: 1, studentTask: "Tell or write: Why do robots need very clear steps?", teacherGuide: "Link to how computers follow programs step by step.", deliverable: "Short reflection", evidence: "TEXT" },
    ],
    rubric: [
      { name: "Breaking the task into steps", levels: ["Fewer than 4 steps", "Some steps, a few missing", "Complete steps", "Complete and very precise steps"] },
      { name: "Correct order", levels: ["Mostly out of order", "Some steps out of order", "Correct order", "Correct order and explains why"] },
      { name: "Finding and fixing bugs", levels: ["Did not test", "Tested, did not fix", "Found and fixed a bug", "Found several bugs and improved the routine"] },
      STANDARD_RUBRIC.teamwork,
    ],
  },
  {
    code: "P5-WATER", classLevel: 5, emoji: "💧", title: "Water Detectives", tagline: "Find out where water is wasted in our school — and fix it with data.",
    drivingQuestion: "Where does our school waste the most water, and what simple rule could reduce it?",
    overview: "Teams survey taps and tanks, record data, draw pictographs and propose water-saving rules for the school.",
    subjects: ["EVS", "MATHS", "ENGLISH"], skills: ["DATA", "DECOMPOSITION", "PATTERN"], hours: 8, finalProduct: "Data poster and a 'water rule' proposal for the principal",
    milestones: [
      { phase: "DEFINE", title: "Plan the investigation", sessions: 1, studentTask: "Decide which taps/areas your team will check and what you will count.", teacherGuide: "Assign areas (toilets, garden, kitchen, drinking area). Discuss safety.", deliverable: "Team plan" },
      { phase: "COLLECT", title: "Count and measure", sessions: 2, studentTask: "For 3 days, count leaking taps and measure drips in 1 minute using a mug.", teacherGuide: "Provide a tally sheet. Measure with a 1-litre bottle where possible.", deliverable: "Tally sheet photo" },
      { phase: "EXPLORE", title: "Find the pattern", sessions: 2, studentTask: "Make a pictograph. Which area wastes most? At what time of day?", teacherGuide: "Link to 'Data Through Pictures'. Ask for one pattern and one surprise.", deliverable: "Pictograph" },
      { phase: "PRESENT", title: "Water rules poster", sessions: 2, studentTask: "Make a poster with your data and 2 rules to save water. Present to another class.", teacherGuide: "Invite the principal or caretaker if possible.", deliverable: "Poster photo" },
      { phase: "REFLECT", title: "Reflection", sessions: 1, studentTask: "What did the data tell you that you didn't expect?", teacherGuide: "Discuss why counting beats guessing.", deliverable: "Reflection", evidence: "TEXT" },
    ],
    rubric: [
      { name: "Data collection", levels: ["Little data", "Some data, gaps", "Complete tally for all days", "Complete, careful and checked"] },
      { name: "Pictograph and patterns", levels: ["Graph missing or wrong", "Graph with errors", "Correct graph, one pattern found", "Clear graph, several patterns explained"] },
      { name: "Water-saving rules", levels: ["No rule", "Rule not linked to data", "Sensible rule linked to data", "Practical rules with expected savings"] },
      STANDARD_RUBRIC.communication,
      STANDARD_RUBRIC.teamwork,
    ],
  },
  {
    code: "P6-WEATHER", classLevel: 6, emoji: "🌦️", title: "Weather Watchers", tagline: "Exploring weather and its impact across Indian states.",
    drivingQuestion: "How does the weather differ across Indian states, and can we spot patterns that help us predict it?",
    overview: "Teams track weather in four states from different regions for two weeks, organise and graph the data, look for patterns (coastal vs inland, north vs south), try a simple prediction rule, and present a TV-style weather report. Connects Geography, Science, Maths and English with CT and AI ideas (data, patterns, prediction).",
    subjects: ["SST", "SCIENCE", "MATHS", "ENGLISH"], skills: ["DATA", "PATTERN", "DECOMPOSITION", "AI_CONCEPT"], hours: 20, finalProduct: "Weather report presentation with charts and a tested prediction rule",
    milestones: [
      { phase: "DEFINE", title: "Ask the big question", sessions: 2, studentTask: "Choose 4 states from different regions (e.g. Kerala, Rajasthan, Delhi, Assam). Write 3 questions you want to answer about their weather. Plan who records what.", teacherGuide: "Show a map of India's climate zones (Geography link). Help teams pick contrasting states. Roles: data recorder, checker, chart maker, presenter.", deliverable: "Team plan: states, questions, roles" },
      { phase: "COLLECT", title: "Collect weather data", sessions: 4, studentTask: "Every school day for 2 weeks, record max/min temperature, rainfall and sky condition for each state (newspaper, IMD website or weather app). Also record your own school's weather.", teacherGuide: "Provide the data-table template (Resources). Check entries twice a week. Discuss: where does this data come from and can we trust it?", deliverable: "Completed 2-week data table" },
      { phase: "EXPLORE", title: "Organise and find patterns", sessions: 4, studentTask: "Draw a line graph of temperatures and a bar graph of rainfall. Write 3 patterns you see and 1 surprise.", teacherGuide: "Link to Maths 'Data Handling and Presentation'. Spreadsheets optional. Push for 'why' — coast, altitude, monsoon.", deliverable: "Graphs + 3 patterns", evidence: "FILE" },
      { phase: "CREATE", title: "Make and test a prediction rule", sessions: 4, studentTask: "Write a simple IF–THEN rule to predict rain or a hot day (e.g. IF cloudy AND humid THEN rain likely). Test it for 3 more days. How often was it right? Compare with the weather app's forecast.", teacherGuide: "Explain that AI forecasting learns rules like this from millions of data points. Discuss accuracy and why more data helps.", deliverable: "Rule, test results and accuracy" },
      { phase: "PRESENT", title: "Weather report", sessions: 4, studentTask: "Present a 3-minute 'news' weather report with your charts, patterns and prediction rule.", teacherGuide: "Use the communication rubric. Invite peer questions. Record videos if possible (with consent).", deliverable: "Presentation slides or poster" },
      { phase: "REFLECT", title: "Reflect", sessions: 2, studentTask: "Each member writes: what you learned, what was hard, and what you'd do differently.", teacherGuide: "Collect individual reflections (the platform records them per student).", deliverable: "Individual reflections", evidence: "TEXT" },
    ],
    rubric: [
      { name: "Question and planning", levels: ["Vague question, no plan", "Question but unclear plan", "Clear question and workable plan", "Insightful question, detailed plan with roles"] },
      { name: "Data collection and accuracy", levels: ["Many gaps or errors", "Some gaps", "Complete and mostly accurate", "Complete, accurate, sources noted and checked"] },
      { name: "Data representation and patterns", levels: ["Graphs missing or incorrect", "Graphs with errors; pattern unclear", "Correct graphs and clear patterns", "Well-chosen graphs; patterns explained with reasons"] },
      { name: "Computational and AI thinking", levels: ["No rule or test", "Rule but not tested", "Rule tested and accuracy reported", "Rule tested, improved and compared with AI forecast"] },
      STANDARD_RUBRIC.communication,
      STANDARD_RUBRIC.teamwork,
    ],
  },
  {
    code: "P7-NUTRI", classLevel: 7, emoji: "🥗", title: "Nutri-Quest", tagline: "Design a balanced weekly food planner using data and rules.",
    drivingQuestion: "How can we design a weekly meal plan that is balanced, affordable and liked by our class — and what would an AI planner need to know?",
    overview: "Teams survey food habits, classify foods into groups, analyse the data with charts, and design a rule-based meal planner (flowchart or spreadsheet). They explore how recommendation AI works and where it can be unfair.",
    subjects: ["SCIENCE", "MATHS", "SST", "ENGLISH"], skills: ["DATA", "DECOMPOSITION", "ALGORITHMIC", "AI_CONCEPT", "ETHICS"], hours: 20, finalProduct: "A weekly meal planner (flowchart/spreadsheet) with data-backed justification",
    milestones: [
      { phase: "DEFINE", title: "What is a balanced meal?", sessions: 2, studentTask: "Research the food groups and what a balanced plate looks like. Write your team's goal and constraints (budget, local foods, preferences).", teacherGuide: "Link to Science (nutrition). Discuss regional diets respectfully.", deliverable: "Goal and constraints" },
      { phase: "COLLECT", title: "Food survey and diary", sessions: 4, studentTask: "Run a class survey of favourite foods and keep a 3-day food diary. Read 3 nutrition labels.", teacherGuide: "Remind about consent and anonymity — no names in shared data.", deliverable: "Survey data table" },
      { phase: "EXPLORE", title: "Classify and chart", sessions: 4, studentTask: "Classify foods by group. Make a pie chart of the class's food groups. Can you find clusters of students with similar habits?", teacherGuide: "Link to AI chapter 'Data Visualisation'. Introduce clustering as 'grouping without labels'.", deliverable: "Charts and clusters", evidence: "FILE" },
      { phase: "CREATE", title: "Build the planner", sessions: 5, studentTask: "Design rules (a flowchart or spreadsheet) that create a 7-day plan meeting your constraints. Test it: does every day include all food groups?", teacherGuide: "This is algorithm design. Ask: what would a recommendation AI need to learn? Could it be unfair to some families?", deliverable: "Flowchart/spreadsheet and test results" },
      { phase: "PRESENT", title: "Pitch your planner", sessions: 3, studentTask: "Pitch your planner to the class as if to a school canteen.", teacherGuide: "Peer feedback with 'two stars and a wish'.", deliverable: "Presentation" },
      { phase: "REFLECT", title: "Reflect", sessions: 2, studentTask: "Individual reflection: learning, challenge, next time.", teacherGuide: "Discuss bias: one plan does not suit everyone.", deliverable: "Reflections", evidence: "TEXT" },
    ],
    rubric: [
      { name: "Research and constraints", levels: ["Little research", "Basic research", "Clear food-group knowledge and constraints", "Thorough research, realistic constraints"] },
      { name: "Data analysis", levels: ["Charts missing or wrong", "Charts with errors", "Accurate charts and interpretation", "Insightful analysis incl. clusters"] },
      { name: "Planner algorithm", levels: ["No clear rules", "Rules incomplete", "Working rules meet constraints", "Efficient rules, tested and improved"] },
      { name: "AI and ethics awareness", levels: ["Not addressed", "Mentioned briefly", "Explains how AI would do this and one risk", "Thoughtful discussion of bias and fairness"] },
      STANDARD_RUBRIC.communication,
      STANDARD_RUBRIC.teamwork,
    ],
  },
  {
    code: "P8-SPORTS", classLevel: 8, emoji: "🏏", title: "Game On!", tagline: "Sports participation and performance — an AI project from start to finish.",
    drivingQuestion: "What helps students in our school participate and perform better in sport — and can a no-code AI tool help us find out fairly?",
    overview: "Teams follow the AI project lifecycle: define a problem, collect (consented, anonymous) data on participation and simple fitness measures, test a no-code AI tool, check for bias, and make recommendations to the PE department.",
    subjects: ["PE", "MATHS", "SCIENCE", "SST", "ENGLISH"], skills: ["DATA", "AI_CONCEPT", "ETHICS", "EVALUATION"], hours: 20, finalProduct: "Recommendations report to the PE department with data and an AI tool trial",
    milestones: [
      { phase: "DEFINE", title: "Define the problem", sessions: 2, studentTask: "Choose a question, e.g. 'Why do fewer students play sport after Class 6?' or 'Which practice habits relate to sprint times?'. Write a problem statement.", teacherGuide: "AI project cycle stage 1. Use the 4Ws (who, what, where, why).", deliverable: "Problem statement" },
      { phase: "COLLECT", title: "Collect data responsibly", sessions: 4, studentTask: "Survey students (anonymous) and record simple measures (e.g. 30 m sprint, skipping count) with consent.", teacherGuide: "Stress informed consent and anonymity. No names in datasets. Work with the PE teacher.", deliverable: "Anonymised dataset" },
      { phase: "EXPLORE", title: "Analyse the data", sessions: 4, studentTask: "Use percentages and graphs to compare groups. What patterns appear?", teacherGuide: "Link to Maths 'Proportional Reasoning'.", deliverable: "Analysis with graphs", evidence: "FILE" },
      { phase: "CREATE", title: "Test a no-code AI tool", sessions: 4, studentTask: "Train a simple model, e.g. Teachable Machine to recognise correct vs incorrect exercise poses, or a spreadsheet trend line to predict performance. Test it on new examples.", teacherGuide: "Teacher-supervised. Use school devices; avoid uploading faces where possible (use poses from behind or drawings).", deliverable: "Model test results" },
      { phase: "REFLECT", title: "Check for bias and improve", sessions: 3, studentTask: "Is your data fair? Who is missing? Did the model work equally well for everyone? Improve one thing.", teacherGuide: "AI cycle stage 'Reflect and Improve'. Link to 'Data and Fairness in AI'.", deliverable: "Bias check and improvement" },
      { phase: "PRESENT", title: "Recommend", sessions: 3, studentTask: "Present 3 data-backed recommendations to the PE department.", teacherGuide: "Invite the PE teacher to give feedback.", deliverable: "Recommendations report" },
    ],
    rubric: [
      { name: "Problem definition", levels: ["Unclear problem", "Problem stated, not focused", "Clear, focused problem", "Clear problem with success criteria"] },
      { name: "Responsible data collection", levels: ["No consent/anonymity", "Partly anonymised", "Consented and anonymised", "Consented, anonymised, documented"] },
      { name: "Analysis and AI tool use", levels: ["Little analysis", "Analysis with errors", "Sound analysis and working AI test", "Strong analysis; model tested and evaluated"] },
      { name: "Bias and fairness", levels: ["Not considered", "Mentioned", "Bias checked with one improvement", "Thorough bias check; improvements justified"] },
      STANDARD_RUBRIC.communication,
      STANDARD_RUBRIC.teamwork,
    ],
  },
];
