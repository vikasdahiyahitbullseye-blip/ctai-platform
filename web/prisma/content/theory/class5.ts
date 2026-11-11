// Class 5 "Learn it" theory, matched to the concepts in Think, Play & Solve Help Book · Class 5.
import { T, type ChapterTheory } from "./types";

export const THEORY5: Record<string, ChapterTheory> = {
  "5-CT-1": T({
    intro: "Big numbers are built from digits in places. Clues about digits help us form, arrange and identify numbers.",
    concepts: [
      {
        title: "Place value in big numbers",
        text: "Places from the right: **ones, tens, hundreds, thousands, ten thousands, lakhs**. In 3,47,215 the 4 is worth 40,000.",
        fig: { kind: "abacus", labels: ["TTh", "Th", "H", "T", "O"], beads: [4, 7, 2, 1, 5], alt: "An abacus showing 47,215" },
      },
      {
        title: "Forming numbers from digits",
        text: "For the **largest** number, put digits from biggest to smallest; for the **smallest**, from smallest to biggest (no 0 first). For the **second largest**, swap the last two different digits of the largest.",
        example: { q: "Using 3, 8, 5, 1, 9 once each, what is the second largest 5-digit number?", steps: ["Largest: 98531.", "Swap the last two digits: 98513."], answer: "98513" },
      },
      {
        title: "Digit clues and certainty",
        text: "A clue may allow many numbers. A statement is **definitely true** only if it is true for **every** number the clues allow. One example that breaks it is enough to show it is not definite.",
        remember: "To show a statement is false, find ONE counter-example.",
      },
      {
        title: "Adjacent digits",
        text: "**Adjacent** digits are next to each other. In 47215, 4 and 7 are adjacent, but 4 and 2 are not.",
      },
    ],
    tip: "Write blanks for each place (_ _ _ _ _) and fill them in as the clues allow.",
  }),
  "5-CT-2": T({
    intro: "Fractions describe parts of a whole and parts of a group. Working backwards undoes each step of a story.",
    concepts: [
      {
        title: "Fractions of a whole",
        text: "The bottom number says how many **equal parts**; the top number says how many are taken. Shapes may need to be split into equal small parts first.",
        fig: { kind: "fraction", shape: "grid", parts: 8, shaded: 3, rows: 2, colour: "purple", alt: "3 of 8 squares shaded" },
      },
      {
        title: "Fractions of a group and of 'what is left'",
        text: "3/4 of 20 = 15. Take care with 'of the **remaining** part': if Raj owns 3/8 of a field, 5/8 remains, and 2/5 of that is 2/5 × 5/8 = 2/8 = 1/4 of the field.",
      },
      {
        title: "Adding and subtracting fractions",
        text: "To add fractions, use the **same bottom number**: 1/2 = 3/6 and 1/3 = 2/6, so 1/2 + 1/3 = 5/6.",
        remember: "Equivalent fractions name the same amount: 1/2 = 2/4 = 3/6.",
      },
      {
        title: "Working backwards",
        text: "When a story changes a number step by step, start at the end and **undo** each step in reverse order: 'half' becomes 'double', 'one more' becomes 'one less'.",
        example: { q: "A shopkeeper sells half his chocolates and 1 more. 5 are left. How many did he have?", steps: ["Before the extra 1 was sold: 5 + 1 = 6.", "6 is the half that was left, so the whole was 6 × 2."], answer: "12 chocolates" },
      },
    ],
    tip: "Draw a bar for the whole and shade each part as the story goes.",
  }),
  "5-CT-3": T({
    intro: "An angle is an amount of turn. Turns can be quarter, half or full, clockwise or anticlockwise.",
    concepts: [
      {
        title: "Types of turns",
        text: "A **full turn** brings you back to where you started. A **half turn** faces the opposite way. A **quarter turn** is a right angle.",
        fig: { kind: "angle", deg: 90, colour: "blue", alt: "A right angle (quarter turn)" },
        table: [["Turn", "Right angles", "Degrees"], ["1/4 turn", "1", "90°"], ["1/2 turn", "2", "180°"], ["3/4 turn", "3", "270°"], ["Full turn", "4", "360°"]],
      },
      {
        title: "Clockwise and anticlockwise",
        text: "**Clockwise** is the way clock hands move. **Anticlockwise** is the other way. A 3/4 turn clockwise ends in the same place as a 1/4 turn anticlockwise.",
        example: { q: "Ravi faces North. He turns 1/4 clockwise, then 1/2 clockwise. Which way does he face?", steps: ["1/4 + 1/2 = 3/4 turn clockwise.", "North → East → South → West."], answer: "West" },
      },
      {
        title: "Adding up turns",
        text: "Change all turns to the same direction (clockwise) and add them. Take away full turns: they change nothing. Turns the other way count as **minus**.",
        remember: "N → E → S → W is clockwise; each step is a quarter turn.",
      },
      {
        title: "Turning pictures",
        text: "When a picture turns, every part turns with it. In a quarter turn clockwise, the **top** moves to the **right**.",
      },
    ],
    tip: "Stand up and turn! Acting out turns is the quickest way to check your answer.",
  }),
  "5-CT-4": T({
    intro: "Odd and even numbers, exchanges and counting arrangements are useful when travelling and trading.",
    concepts: [
      {
        title: "Odd and even sums",
        text: "The sum of digits is odd only if there is an **odd number of odd digits**. 3 odd digits always give an odd sum.",
        remember: "odd + odd = even, even + even = even, odd + even = odd.",
      },
      {
        title: "Exchanges",
        text: "When 1 gold = 4 silver and 1 silver = 3 bronze, then 1 gold = 4 × 3 = **12 bronze**. Change everything into the smallest unit to compare.",
        example: { q: "Mira has 2 gold and 5 silver coins. How many bronze coins is that?", steps: ["2 gold = 2 × 12 = 24 bronze.", "5 silver = 5 × 3 = 15 bronze."], answer: "39 bronze coins" },
      },
      {
        title: "Counting arrangements",
        text: "To count arrangements, fill the places **one at a time** and multiply the choices. For 3-digit numbers from 5, 0, 9 (digits may repeat): first digit 2 choices (not 0), second 3, last 3 → 2 × 3 × 3 = 18.",
      },
      {
        title: "Distances on a line",
        text: "For walks north and south, count north as **+** and south as **−**. 4 N, 3 S, 2 N, 5 S: +4 − 3 + 2 − 5 = −2, so you end 2 km **south** of the start.",
      },
    ],
    tip: "For counting questions, draw boxes for each place and write the number of choices in each box.",
  }),
  "5-CT-5": T({
    intro: "We measure distances and positions, compare lengths, and work out when moving things meet.",
    concepts: [
      {
        title: "Positions on a line",
        text: "Put places on a **number line** from a starting point. The distance between two places is the bigger position minus the smaller one.",
        fig: { kind: "numberline", min: 0, max: 100, step: 10, labelEvery: 2, marks: [{ v: 40, label: "Hut", colour: "orange" }, { v: 100, label: "Tree", colour: "green" }], alt: "Hut at 40 m and tree at 100 m from the beach" },
      },
      {
        title: "Meeting points",
        text: "When two people move **towards each other**, the gap closes by the sum of their speeds every second.",
        example: { q: "Two cyclists start at the ends of a 90 m track, at 4 m and 5 m per second towards each other. When do they meet?", steps: ["Together they close 4 + 5 = 9 m each second.", "90 ÷ 9 = 10."], answer: "After 10 seconds" },
      },
      {
        title: "Up and down puzzles",
        text: "A snail climbing 3 cm and slipping 1 cm gains 2 cm each round, but on the **last climb** it reaches the top before slipping back. Check the last step separately!",
      },
      {
        title: "Cuts and pieces",
        text: "A 40 m cloth cut into 1 m pieces needs **39 cuts**: the last piece is already separate.",
        remember: "Pieces = cuts + 1 (for a straight strip).",
      },
    ],
    tip: "Draw a straight line, mark the start, and place everything on it.",
  }),
  "5-CT-6": T({
    intro: "Multiplication and division help us count large equal groups quickly on the farm and in everyday life.",
    concepts: [
      {
        title: "Grouping and totals",
        text: "**Total = number of groups × size of each group.** 24 groups of 25 bricks = 600 bricks.",
      },
      {
        title: "Rows and seats",
        text: "A theatre with 6 rows and 5 seats in each row has 6 × 5 = 30 seats. Removing a row removes a whole group.",
        fig: { kind: "icons", items: Array.from({ length: 15 }, () => ({ icon: "🐄" })), cols: 5, alt: "3 rows of 5 cows" },
      },
      {
        title: "Matches in a pool",
        text: "If every team plays every other team once, each pair plays one match. With 3 teams there are 3 matches; with 4 teams, 6 matches.",
        example: { q: "How many matches when 4 teams each play every other team once?", steps: ["Team A plays 3, B plays 2 new, C plays 1 new.", "3 + 2 + 1."], answer: "6 matches" },
      },
      {
        title: "Marks with penalties",
        text: "If a correct answer gets 4 marks and a wrong one loses 1, then score = 4 × correct − wrong.",
        remember: "Multiplication and division undo each other. Use one to check the other.",
      },
    ],
    tip: "Look for the group size first. Then ask: how many groups?",
  }),
  "5-CT-7": T({
    intro: "Shapes can be divided, folded and built into cubes. Patterns help us count without drawing everything.",
    concepts: [
      {
        title: "Dividing shapes into equal parts",
        text: "Lines parallel to the sides can split a triangle into 4, 9 or 16 small equal triangles. A rectangle can be split into 6 equal parts with just **3 straight lines** (1 one way and 2 the other).",
      },
      {
        title: "Folding paper",
        text: "Each fold **doubles** the layers: 1 fold → 2 layers, 2 → 4, 3 → 8, 4 → 16. One punch through all layers makes that many holes.",
        remember: "Layers after n folds: 2 × 2 × … (n times).",
      },
      {
        title: "Cube nets",
        text: "Squares that are one apart in a straight line on a net become **opposite faces** of the cube.",
        fig: { kind: "lettergrid", rows: ["A...", "BCDE", "F..."], colour: "orange", alt: "A cube net" },
      },
      {
        title: "Painted cubes",
        text: "When a big cube made of small cubes is painted outside, **corner** cubes have 3 painted faces, **edge** cubes 2, **face** cubes 1, and **inside** cubes none.",
        example: { q: "A 3 × 3 × 3 cube is painted on the outside. How many small cubes have 3 painted faces?", steps: ["Only corner cubes have 3 painted faces.", "A cube has 8 corners."], answer: "8 small cubes" },
      },
    ],
    tip: "Build a small version (2 × 2 × 2) first, find the pattern, then use it for the bigger one.",
  }),
  "5-CT-8": T({
    intro: "Balances and measuring containers help us compare weights and capacities and solve clever puzzles.",
    concepts: [
      {
        title: "The lighter-coin puzzle",
        text: "To find **one lighter coin** among 9, split them into **3 groups of 3**. Weigh two groups: if they balance, the light coin is in the third group; if not, it is in the lighter group. Then weigh 1 coin against 1 coin from that group.",
        fig: { kind: "balance", left: { icon: "🪙", n: 3 }, right: [3], unit: "coins", alt: "Three coins against three coins on a balance" },
        remember: "Splitting into 3 groups uses each weighing best: 9 coins need only 2 weighings.",
      },
      {
        title: "Order from comparisons",
        text: "From 'A is heavier than B' and 'B is heavier than C', we know A > B > C. Put every clue on one line from lightest to heaviest.",
      },
      {
        title: "Totals and differences",
        text: "If A + B = 50 and B + C = 70, then C is **20 more** than A. Comparing two sums shows the difference between the parts that are not shared.",
        example: { q: "John is 5 kg heavier than Bob. Bob and John weigh 75 kg together. How heavy is Bob?", steps: ["Take away the extra 5 kg: 75 − 5 = 70.", "That is 2 × Bob, so Bob = 35 kg."], answer: "35 kg" },
      },
      {
        title: "Faulty scales",
        text: "A scale that always shows 3 kg too much adds 3 kg **every** time you weigh. Weighing two things together adds 3 kg once, not twice.",
      },
    ],
    tip: "Write weights as short sentences (A + B = 50) and compare them.",
  }),
  "5-CT-9": T({
    intro: "Divisibility and remainders tell us how numbers split into rows, columns and groups.",
    concepts: [
      {
        title: "Divisibility",
        text: "A number is **divisible** by another if it splits into equal groups with nothing left. Quick tests: by **2** if it ends in 0, 2, 4, 6, 8; by **5** if it ends in 0 or 5; by **3** if its digit sum is divisible by 3.",
      },
      {
        title: "Remainders",
        text: "When 1234 soldiers stand in rows of 25: 25 × 49 = 1225, so there are 49 full rows and **9** soldiers left over. The remainder is always smaller than the group size.",
        example: { q: "How many numbers from 101 to 200 leave remainder 2 when divided by 5?", steps: ["They are 102, 107, 112, … , 197 (every 5th number).", "From 102 to 197 in steps of 5: (197 − 102) ÷ 5 + 1."], answer: "20 numbers" },
      },
      {
        title: "Rows and columns",
        text: "24 soldiers can stand in rectangles of 1 × 24, 2 × 12, 3 × 8 or 4 × 6 (and the other way round). These pairs are the **factor pairs** of 24.",
        fig: { kind: "icons", items: Array.from({ length: 24 }, () => ({ icon: "🥥" })), cols: 6, alt: "24 coconuts in 4 rows of 6" },
      },
      {
        title: "Order of operations",
        text: "Do **× and ÷ before + and −**, unless brackets say otherwise. 7 + 4 × 6 = 7 + 24 = 31.",
      },
    ],
    tip: "List multiples in a row (5, 10, 15 …) to see remainder patterns clearly.",
  }),
  "5-CT-10": T({
    intro: "Symmetry, mirror images, folding and punching show how shapes reflect.",
    concepts: [
      {
        title: "Lines of symmetry",
        text: "A regular shape has as many lines of symmetry as sides: an equilateral triangle 3, a square 4, a regular pentagon 5. A rectangle (not a square) has 2.",
        fig: { kind: "pixels", n: 6, cells: [[0, 2, "green"], [0, 3, "green"], [1, 1, "teal"], [1, 4, "teal"], [2, 0, "green"], [2, 5, "green"], [3, 1, "teal"], [3, 4, "teal"], [4, 2, "green"], [4, 3, "green"]], mirror: "middle", alt: "A design with a vertical line of symmetry" },
      },
      {
        title: "Mirror letters",
        text: "In a **vertical mirror**, letters like A, H, M, O, T, U, V, W, X, Y look the same. Lowercase b and d, p and q are mirror images of each other.",
      },
      {
        title: "Folding, cutting and punching",
        text: "Each fold doubles the layers. A paper folded **3 times** has 8 layers, so 2 punched holes become 16 holes when opened. Holes appear reflected across every fold line.",
        example: { q: "A square paper is folded left to right, then top to bottom, and one hole is punched. How many holes when opened?", steps: ["2 folds → 4 layers.", "The punch goes through all 4."], answer: "4 holes, one in each quarter" },
        remember: "Unfold one fold at a time, starting with the last fold.",
      },
    ],
    tip: "Use tracing paper or a mirror to check reflections.",
  }),
  "5-CT-11": T({
    intro: "Area is the space inside a shape; perimeter is the distance around it. Grandmother's quilt is full of both!",
    concepts: [
      {
        title: "Area and perimeter",
        text: "**Area** is counted in square units: a rectangle's area = length × breadth. **Perimeter** is the total length of the boundary: for a rectangle, 2 × (length + breadth).",
        fig: { kind: "areamodel", height: 3, widths: [5], labels: ["5 units"], hLabel: "3", alt: "A 3 by 5 rectangle" },
        example: { q: "A rectangle is 5 units long and 3 units wide. Find its area and perimeter.", steps: ["Area = 5 × 3 = 15 square units.", "Perimeter = 2 × (5 + 3) = 16 units."], answer: "Area 15, perimeter 16" },
      },
      {
        title: "Joining shapes",
        text: "When two shapes are joined along a side, the **area adds up** but the **perimeter loses** the shared side twice (once from each shape).",
        remember: "Joined perimeter = perimeter of A + perimeter of B − 2 × shared side.",
      },
      {
        title: "Equal parts",
        text: "A line through the centre of a square or rectangle splits it into **two equal halves**. Half of a 4 × 4 grid is 8 small squares, whatever pattern you choose.",
      },
      {
        title: "Border tiles",
        text: "In a 6 × 6 floor (36 tiles), the inside 4 × 4 has 16 tiles, so the **border** has 36 − 16 = 20 tiles.",
      },
    ],
    tip: "Draw the shape on squared paper and count, then check with the formula.",
  }),
  "5-CT-12": T({
    intro: "We work with time: schedules, speeds and events that repeat again and again.",
    concepts: [
      {
        title: "Adding times",
        text: "Add hours to hours and minutes to minutes. If the minutes reach 60 or more, change 60 minutes into 1 hour.",
        fig: { kind: "clock", h: 10, m: 15, alt: "A clock showing 10:15" },
        example: { q: "A match starts at 10:15 AM and lasts 1 hour 15 minutes. When does it end?", steps: ["10:15 + 1 hour = 11:15.", "11:15 + 15 minutes = 11:30."], answer: "11:30 AM" },
      },
      {
        title: "Repeating events",
        text: "If something repeats every few minutes or hours, list the times or use **multiples**. An alarm every 3 hours from 8 AM rings at 8, 11, 2, 5, 8 …",
        remember: "Two repeating events meet again at a common multiple of their times.",
      },
      {
        title: "Speed: who is faster?",
        text: "Compare speeds by the **same time** or the **same distance**. 2 pages in 10 minutes = 6 pages in 30 minutes; 3 pages in 15 minutes = 6 pages in 30 minutes: the same speed.",
      },
      {
        title: "Colour cycles",
        text: "In a pattern Red, Green, Blue, Yellow repeating, box 4 is Yellow, box 5 is Red again. Divide the box number by 4 and look at the **remainder**.",
      },
    ],
    tip: "Draw a time line and mark the events on it.",
  }),
  "5-CT-13": T({
    intro: "Factors and multiples describe how numbers fit together, like animals jumping along a number line.",
    concepts: [
      {
        title: "Multiples",
        text: "The **multiples** of 3 are 3, 6, 9, 12 … the numbers you land on jumping 3 at a time.",
        fig: { kind: "numberline", min: 0, max: 24, step: 1, labelEvery: 3, jumps: { from: 0, size: 3, count: 6, colour: "green", icon: "🐰" }, alt: "A rabbit jumping 3 at a time" },
      },
      {
        title: "Factors and primes",
        text: "A **factor** divides a number exactly. Factors of 12: 1, 2, 3, 4, 6, 12. A **prime** number has exactly **two** factors, 1 and itself (2, 3, 5, 7, 11 …).",
        remember: "1 is not prime. 2 is the only even prime.",
      },
      {
        title: "Common factors and multiples",
        text: "The **biggest common factor** helps split things into the largest equal groups. The **smallest common multiple** tells when two jumps land on the same number.",
        example: { q: "36 chocolates and 48 toys go into identical boxes with nothing left. What is the largest number of boxes?", steps: ["Factors of 36: 1, 2, 3, 4, 6, 9, 12, 18, 36.", "Factors of 48: 1, 2, 3, 4, 6, 8, 12, 16, 24, 48.", "Biggest common factor: 12."], answer: "12 boxes" },
      },
      {
        title: "Patterns in numbers",
        text: "Among any 3 whole numbers in a row, one is always divisible by 3. Spot patterns like this to answer questions without long working.",
      },
    ],
    tip: "List factors in pairs (1 × 36, 2 × 18, …) so you never miss one.",
  }),
  "5-CT-14": T({
    intro: "Maps use directions, turns and grid positions to tell us exactly where things are and how to get there.",
    concepts: [
      {
        title: "Directions",
        text: "The four main directions are **North, East, South, West**. The sun rises in the East. Facing North, East is on your **right**; so if you jog with the rising sun on your **left**, you are facing **South**.",
        fig: { kind: "gridmap", rows: 3, cols: 3, compass: true, items: [{ r: 1, c: 1, icon: "🧒" }], alt: "A child in the middle of a map with a compass" },
      },
      {
        title: "Positions on a grid",
        text: "A position like (3, 2) means 3 steps **East** from the origin and 2 steps **North**. The order matters: (3, 2) is not (2, 3).",
        example: { q: "Village P is 4 km East of Q. R is 3 km North of P. How far must you go from Q to R along the roads?", steps: ["Q → P: 4 km East.", "P → R: 3 km North."], answer: "7 km" },
      },
      {
        title: "Turning while moving",
        text: "After each turn, your 'forward' changes. Facing North, turn right → East; turn right again → South. Keep track of which way you face after **every** turn.",
        remember: "Right turn = clockwise quarter turn. Left turn = anticlockwise quarter turn.",
      },
      {
        title: "Counting routes",
        text: "If you can only move East or North, the number of ways to reach a point is the sum of the ways to reach the point to its West and the point to its South.",
      },
    ],
    tip: "Draw a small compass in the corner of your working and turn it with you.",
  }),
  "5-CT-15": T({
    intro: "Pictures, tables and diagrams show data. Reading them carefully lets us answer questions and find patterns.",
    concepts: [
      {
        title: "Pictographs with half pictures",
        text: "If a full tree stands for 10, a **half tree** stands for 5. Always read the key and count the half pictures too.",
        fig: { kind: "pictograph", title: "Trees planted", labels: ["Team A", "Team B"], counts: [4, 3], icon: "🌳", per: 10, alt: "Pictograph of trees planted, key: one tree = 10" },
      },
      {
        title: "Tables and totals",
        text: "In a table, row totals and column totals help you compare. The day with the most items is the column with the **largest total**.",
      },
      {
        title: "Venn diagrams",
        text: "A **Venn diagram** shows groups that overlap. The middle part belongs to **both** groups.",
        fig: { kind: "venn", left: "Football", right: "Chess", a: "14", both: "8", b: "10", outside: "Neither: 8", alt: "Venn diagram of football and chess players" },
        example: { q: "40 students: 22 play football, 18 play chess, 8 play both. How many play neither?", steps: ["Football only: 22 − 8 = 14. Chess only: 18 − 8 = 10.", "At least one game: 14 + 8 + 10 = 32."], answer: "40 − 32 = 8 play neither" },
        remember: "Fill in the middle (both) first, then the 'only' parts.",
      },
      {
        title: "Towers and leaders",
        text: "In a row of towers, a tower is a **leader** if every tower to its right is shorter. Check from the right end: the last tower is always a leader.",
      },
    ],
    tip: "For Venn diagrams, start with the overlap and work outwards.",
  }),
};
