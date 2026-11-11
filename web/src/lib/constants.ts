// Domain constants shared by server and client (docs/SPEC.md §2, §5, §8, §9).

export const SKILLS = {
  ABSTRACT: "Abstract Thinking",
  PATTERN: "Pattern Recognition",
  DECOMPOSITION: "Decomposition",
  ALGORITHMIC: "Algorithmic Thinking",
  GENERALISATION: "Generalisation",
  EVALUATION: "Evaluation",
  AI_CONCEPT: "AI Concepts",
  DATA: "Data Literacy",
  ETHICS: "Ethics & Safety",
} as const;
export type SkillCode = keyof typeof SKILLS;

/** Strands shown on dashboards, by stage. */
export const CORE_CT_SKILLS: SkillCode[] = ["ABSTRACT", "PATTERN", "DECOMPOSITION", "ALGORITHMIC"];
export const AI_SKILLS: SkillCode[] = ["AI_CONCEPT", "DATA", "ETHICS"];
export function dashboardSkills(classLevel: number): SkillCode[] {
  return classLevel >= 6 ? [...CORE_CT_SKILLS, ...AI_SKILLS] : CORE_CT_SKILLS;
}

export const QUESTION_TYPES = {
  MCQ: "Multiple choice",
  MULTI: "Multiple select",
  TRUE_FALSE: "True / False",
  NUMERIC: "Numeric answer",
  FILL_BLANK: "Fill in the blank",
  ORDER: "Arrange in order",
  SHORT: "Short answer (teacher-marked)",
} as const;
export type QuestionType = keyof typeof QUESTION_TYPES;

export const DIFFICULTY = { 1: "Easy", 2: "Medium", 3: "Hard" } as const;

export const ROLES = ["STUDENT", "TEACHER", "ADMIN", "CONTENT", "REVIEWER", "SUPERADMIN"] as const;
export type Role = (typeof ROLES)[number];

/** CBSE handbook chapter structure, 2026-27 (docs/SPEC.md §2). */
export const CURRICULUM: Record<number, { CT: string[]; AI?: string[]; EVS?: string[] }> = {
  3: { EVS: ["Family and Friends", "Plants Around Us", "Animals Around Us", "Food We Eat", "Water — Every Drop Counts", "Our Neighbourhood and Maps"], CT: ["What's in a Name?", "Toy Joy", "Double Century", "Vacation with My Nani Maa", "Fun with Shapes", "House of Hundreds – I", "Raksha Bandhan", "Fair Share", "House of Hundreds – II", "Fun at Class Party!", "Filling and Lifting", "Give and Take", "Time Goes On", "The Surajkund Fair"] },
  4: { EVS: ["Our Body and Health", "Seeds and Plants", "Animal Homes", "Sources of Water", "Travel and Transport", "Waste and Recycling"], CT: ["Shapes Around Us", "Hide and Seek", "Patterns Around Us", "Thousands Around Us", "Sharing and Measuring", "Measuring Length", "The Cleanest Village", "Weigh It, Pour It", "Equal Groups", "Elephants, Tigers, and Leopards", "Fun with Symmetry", "Ticking Clocks and Turning Calendar", "The Transport Museum", "Data Handling"] },
  5: { EVS: ["Food and Farming", "The Water Cycle", "Maps and Directions", "Energy Around Us", "Weather and Seasons", "Caring for Our Planet"], CT: ["We the Travellers – I", "Fractions", "Angles as Turns", "We the Travellers – II", "Far and Near", "The Dairy Farm", "Shapes and Patterns", "Weight and Capacity", "Coconut Farm", "Symmetrical Designs", "Grandmother's Quilt", "Racing Seconds", "Animal Jumps", "Maps and Locations", "Data Through Pictures"] },
  6: {
    CT: ["Patterns in Mathematics", "Lines and Angles", "Number Play", "Data Handling and Presentation", "Prime Time", "Perimeter and Area", "Fractions", "Playing with Constructions", "Symmetry", "The Other Side of Zero"],
    AI: ["Introduction to AI and Everyday Examples", "Basic Data Concepts", "Simple Pattern Recognition and Decision Making", "Ethics and Digital Responsibility"],
  },
  7: {
    CT: ["Large Numbers Around Us", "Arithmetic Expressions", "A Peek Beyond the Point", "Expressions using Letter-Numbers", "Parallel and Intersecting Lines", "Number Play", "A Tale of Three Intersecting Lines", "Working with Fractions"],
    AI: ["AI Domains and Applications", "AI in Industries", "Data Visualisation and Analysis", "Ethics and AI Bias Awareness"],
  },
  8: {
    CT: ["A Square and a Cube", "Power Play", "A Story of Numbers", "Quadrilaterals", "Number Play", "We Distribute Yet Things Multiply", "Proportional Reasoning"],
    AI: ["AI Project Lifecycle", "Artificial Intelligence and Its Applications", "Data and Fairness in AI", "Ethics and Responsible AI"],
  },
};

export const PART_LABEL: Record<string, string> = { CT: "Computational Thinking", AI: "Artificial Intelligence", EVS: "EVS (The World Around Us)" };

export const SUBJECTS = {
  MATHS: { name: "Mathematics", emoji: "➗", color: "#2f5bea" },
  EVS: { name: "EVS / The World Around Us", emoji: "🌿", color: "#14915a" },
  SCIENCE: { name: "Science", emoji: "🔬", color: "#0e8fa3" },
  SST: { name: "Social Science", emoji: "🗺️", color: "#b8641a" },
  ENGLISH: { name: "English / Languages", emoji: "📖", color: "#9b3fc4" },
  ART: { name: "Art & Craft", emoji: "🎨", color: "#d6336c" },
  PE: { name: "Physical Education", emoji: "🏃", color: "#c2410c" },
  COMPUTER: { name: "Computer Studies", emoji: "💻", color: "#475569" },
  DAILY_LIFE: { name: "Daily Life", emoji: "🏠", color: "#7c5c00" },
} as const;
export type SubjectCode = keyof typeof SUBJECTS;

