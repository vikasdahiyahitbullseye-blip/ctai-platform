// Class 4 "Learn it" theory, matched to the concepts in Think, Play & Solve Help Book · Class 4.
import { T, type ChapterTheory } from "./types";

export const THEORY4: Record<string, ChapterTheory> = {
  "4-CT-1": T({
    intro: "A cube can be opened out into a flat net. Shapes can be cut, coloured and counted with clear rules.",
    concepts: [
      {
        title: "Nets of a cube",
        text: "A **net** is a flat shape that folds up into a solid. A cube's net has **6 squares**. When folded, squares that are **one square apart in a straight line** become **opposite faces**.",
        fig: { kind: "lettergrid", rows: [".T..", "PQRS", "..U."], colour: "blue", alt: "A cube net with letters T, P, Q, R, S, U" },
        example: { q: "In this net, which letter is opposite Q?", steps: ["In the row P Q R S, skip one square from Q.", "Q and S are one square apart in a straight line."], answer: "S is opposite Q (and P is opposite R, T is opposite U)" },
        remember: "Opposite faces never touch. On a dice, opposite faces add up to 7.",
      },
      {
        title: "Cutting shapes",
        text: "One straight cut across a square can make a triangle and a pentagon, two triangles, two rectangles, or a triangle and a quadrilateral. The cut adds new corners where it meets the edges.",
      },
      {
        title: "Counting hidden triangles",
        text: "Count small triangles first, then triangles made of 2, 3 or 4 small ones. A square with both diagonals has 4 small and 4 larger triangles: **8** in all.",
      },
      {
        title: "Colouring faces",
        text: "To colour a solid so that faces sharing an edge are different, find the face that touches the most others. On a cube, give each pair of **opposite faces** the same colour: 3 colours are enough.",
      },
      {
        title: "Hidden faces of stacked cubes",
        text: "Each cube has 6 faces. Faces that touch the floor or another cube cannot be seen. **Hidden faces = 6 × cubes − visible faces**.",
      },
    ],
    tip: "Make a paper net and fold it. Once you have seen it fold, you can picture it in your head.",
  }),
  "4-CT-2": T({
    intro: "We follow paths and turns, count different routes, and imagine how block towers look from the top, front and side.",
    concepts: [
      {
        title: "Following paths and turns",
        text: "When walking a path, notice every **turn**: a right turn is a quarter turn clockwise, a left turn anticlockwise. Your **left and right** depend on which way you are facing, not on the page.",
        fig: { kind: "gridmap", rows: 4, cols: 5, path: [[3, 0], [3, 2], [1, 2], [1, 4]], items: [{ r: 3, c: 0, icon: "🐝" }, { r: 1, c: 4, icon: "🌻" }], alt: "A path with turns on a grid" },
      },
      {
        title: "Counting paths",
        text: "To count paths that only go one way (for example, right or down), write at each point **how many ways there are to reach it**. Each number is the sum of the numbers you can arrive from.",
        example: { q: "From S, moving only right or down on a 2 × 2 square of roads, how many paths reach the far corner?", steps: ["The first row and first column each have 1 way.", "The middle point: 1 + 1 = 2. Next points: 1 + 2 = 3.", "Far corner: 3 + 3 = 6."], answer: "6 paths" },
      },
      {
        title: "Views of block towers",
        text: "From the **top** you see the top of every tower: one square for each tower, whatever its height. From the **front** you see how tall each column is. From the **side** you see the tallest tower in each row.",
        fig: { kind: "cubes", heights: [1, 3, 2], colour: "green", alt: "Towers of 1, 3 and 2 cubes" },
        remember: "The top view shows WHERE the towers are; the front view shows HOW TALL they are.",
      },
    ],
    tip: "Put your finger on the start and trace the path one step at a time, saying each turn out loud.",
  }),
  "4-CT-3": T({
    intro: "Numbers are odd or even. Knowing how odd and even numbers behave helps solve tricks and puzzles.",
    concepts: [
      {
        title: "Odd and even",
        text: "**Even** numbers can be put in pairs with nothing left over and end in 0, 2, 4, 6 or 8. **Odd** numbers always have one left over and end in 1, 3, 5, 7 or 9.",
        table: [["", "Even", "Odd"], ["Even +", "Even", "Odd"], ["Odd +", "Odd", "Even"], ["Even ×", "Even", "Even"], ["Odd ×", "Even", "Odd"]],
        remember: "A product is odd only when BOTH numbers are odd.",
      },
      {
        title: "Parity: the coin-flip magic",
        text: "**Parity** means whether something is odd or even. If every row and column of coins has an even number of black coins, flipping one coin makes its row AND its column odd. The odd row and odd column meet at the flipped coin, so you can find it!",
        fig: { kind: "pixels", n: 4, cells: [[0, 0, "purple"], [0, 1, "purple"], [1, 1, "purple"], [1, 2, "purple"], [2, 2, "purple"], [2, 3, "purple"], [3, 0, "purple"], [3, 3, "purple"]], alt: "A grid of coins: every row and every column has 2 black (purple) coins" },
      },
      {
        title: "Consecutive numbers",
        text: "**Consecutive** numbers come one after another: 7, 8, 9. Consecutive **odd** numbers go up by 2: 3, 5, 7, 9. Consecutive **even** numbers also go up by 2: 4, 6, 8.",
      },
      {
        title: "Number patterns",
        text: "To find a rule, look at what changes each time: +2, ×2, or adding a growing amount (+1, +2, +3 …). Check that the rule works for **every** step.",
      },
    ],
    tip: "Before trying lots of numbers, ask: must the answer be odd or even? It can cross out half the choices at once.",
  }),
  "4-CT-4": T({
    intro: "We sort numbers step by step, build and compare 4-digit numbers, and use place value to solve digit puzzles.",
    concepts: [
      {
        title: "Sorting networks",
        text: "In a **sorting network**, numbers travel along lines. At each **comparator** (a link between two lines) the two numbers are compared: the smaller goes up, the bigger goes down. After all comparators, the numbers come out in order.",
        example: { q: "Sort 64, 29 with one comparator.", steps: ["Compare 64 and 29.", "The smaller (29) goes to the top line; the bigger (64) to the bottom."], answer: "29, 64" },
        remember: "A sorting network always does the same comparisons, whatever numbers go in. That is an algorithm.",
      },
      {
        title: "4-digit numbers and place value",
        text: "In 4,527 the 4 is worth **4 thousand**, 5 is 5 hundreds, 2 is 2 tens and 7 is 7 ones.",
        fig: { kind: "abacus", labels: ["Th", "H", "T", "O"], beads: [4, 5, 2, 7], alt: "An abacus showing 4527" },
      },
      {
        title: "Comparing numbers",
        text: "Compare from the **left**: thousands first, then hundreds, tens, ones. The first place where the digits differ decides which number is bigger.",
        example: { q: "Which values of X make 58X3 > 5X83?", steps: ["Thousands are equal (5). Compare hundreds: 8 and X.", "If X < 8, the left number is bigger. If X = 8, compare tens: 8 and 8, then ones 3 and 3: equal."], answer: "X = 0 to 7 (8 values)" },
      },
      {
        title: "Largest and smallest numbers",
        text: "For the **largest** number, arrange digits from biggest to smallest; for the **smallest**, from smallest to biggest, but never start with 0.",
      },
    ],
    tip: "When a digit is unknown (X), try the comparison place by place from the left.",
  }),
  "4-CT-5": T({
    intro: "A fraction names equal parts of a whole or of a group. Fractions help us share and measure.",
    concepts: [
      {
        title: "Fractions of a shape",
        text: "A **fraction** has a top number (how many parts are taken) and a bottom number (how many **equal** parts in all). 3/8 means 3 of 8 equal parts.",
        fig: { kind: "fraction", shape: "bar", parts: 8, shaded: 3, colour: "green", alt: "3 of 8 parts shaded" },
        remember: "The parts must be equal. Two half-squares make one whole square.",
      },
      {
        title: "Fractions of a quantity",
        text: "To find a fraction of an amount, divide by the bottom number and multiply by the top. A quarter of 60 = 60 ÷ 4 = 15; three quarters = 15 × 3 = 45.",
        example: { q: "How many minutes is 1/2 + 1/3 of an hour?", steps: ["1/2 of 60 = 30 minutes.", "1/3 of 60 = 20 minutes."], answer: "50 minutes" },
      },
      {
        title: "Comparing fractions",
        text: "With the **same bottom number**, more parts means more: 5/8 > 3/8. With the **same top number**, more parts means smaller parts: 1/3 > 1/4.",
        fig: { kind: "sequence", frames: [{ kind: "fraction", shape: "circle", parts: 3, shaded: 1, colour: "red", alt: "" }, { kind: "fraction", shape: "circle", parts: 4, shaded: 1, colour: "blue", alt: "" }], alt: "One third is bigger than one quarter" },
      },
      {
        title: "Equal sharing",
        text: "If ₹72 buys some notebooks of the same price, the price must divide 72 exactly. Sharing equally always means **dividing with nothing left over**.",
      },
    ],
    tip: "Draw the whole as a bar and split it. Pictures make fraction puzzles much easier.",
  }),
  "4-CT-6": T({
    intro: "We measure lengths, add up perimeters and find the shortest way from one place to another.",
    concepts: [
      {
        title: "Measuring and comparing lengths",
        text: "Lengths are measured in **mm, cm, m and km**. 10 mm = 1 cm, 100 cm = 1 m, 1000 m = 1 km. Always compare lengths in the **same unit**.",
      },
      {
        title: "Perimeter",
        text: "The **perimeter** is the distance all the way round a shape. Count the outside edges only. Removing a corner block can keep the perimeter the same; removing a middle block can make it bigger.",
        fig: { kind: "pixels", n: 4, cells: [[1, 0, "orange"], [1, 1, "orange"], [1, 2, "orange"], [2, 1, "orange"]], alt: "A shape made of 4 squares" },
        example: { q: "What is the perimeter of this shape if each square is 1 cm?", steps: ["Count the outside edges all the way round.", "Top 3 + bottom 3 + sides 2 + edges round the bottom square 2 = 10."], answer: "10 cm" },
      },
      {
        title: "Shortest paths",
        text: "To find the **shortest route** between two places on a road map, add the lengths of each possible route and compare. On a grid, the shortest path uses only the moves that bring you closer.",
        remember: "A straight route is shortest, but obstacles can force a detour.",
      },
    ],
    tip: "For perimeter, walk your pencil round the outside and count every edge as you pass it.",
  }),
  "4-CT-7": T({
    intro: "Money problems, collecting and removing, and number puzzles all need careful step-by-step thinking.",
    concepts: [
      {
        title: "Spending and comparing",
        text: "If two people start with the same money and one spends ₹80 more, the other has **₹80 more left**. Differences stay the same when both change by the same amount.",
      },
      {
        title: "Adding and removing in steps",
        text: "When things are taken out and put in, keep a running total and write it after **each** step.",
        example: { q: "Boxes A, B, C have 400 sweets each. 150 are taken from A and put into C. How many in C now, and what is the difference between C and A?", steps: ["A: 400 − 150 = 250. C: 400 + 150 = 550.", "Difference: 550 − 250 = 300."], answer: "C has 550; C has 300 more than A" },
      },
      {
        title: "Symbol and digit puzzles",
        text: "When symbols stand for numbers or operations (★ = +, ◆ = −), rewrite the puzzle with numbers first. When letters stand for digits, use the **ones column** first and check each guess.",
        remember: "The largest 2-digit number with different digits is 98; the smallest is 10.",
      },
    ],
    tip: "Rewrite a puzzle in plain numbers before you start solving it.",
  }),
  "4-CT-8": T({
    intro: "We compare weights with balances and measure liquids with jugs and buckets.",
    concepts: [
      {
        title: "Balance puzzles",
        text: "A **level** balance means both sides weigh the same. You can **replace** something with what it balances, or take the same thing off both sides.",
        fig: { kind: "balance", left: { icon: "🍍", n: 2 }, right: [500, 100], unit: "g", alt: "Two pineapples balance 600 g" },
        example: { q: "2 circles = 1 square, and 3 squares = 1 star. How many circles balance a star?", steps: ["1 star = 3 squares.", "Each square = 2 circles, so 3 squares = 6 circles."], answer: "6 circles" },
      },
      {
        title: "Litres and buckets",
        text: "To measure an exact amount with buckets, combine **filling** and **pouring away**. With 4 L and 1 L buckets you can measure 5 L (4 + 1) or 3 L (4 − 1).",
        fig: { kind: "jug", max: 1000, step: 100, labelEvery: 2, level: 600, unit: "ml", alt: "A jug with 600 mL" },
        remember: "1 litre = 1000 mL and 1 kg = 1000 g.",
      },
      {
        title: "Heavier, taller: putting things in order",
        text: "With clues like 'A is heavier than B', draw the people in order from lightest to heaviest. Use **one clue at a time** and check them all at the end.",
      },
    ],
    tip: "Write the balance as a number sentence: 2 ○ = 1 □. Then replace step by step.",
  }),
  "4-CT-9": T({
    intro: "Equal groups lead to multiplication and division. Doubling and tripling make numbers grow very quickly.",
    concepts: [
      {
        title: "Multiplying and dividing",
        text: "**Multiplication** puts equal groups together; **division** splits a total into equal groups. They undo each other: 6 × 4 = 24, so 24 ÷ 4 = 6.",
        fig: { kind: "icons", items: Array.from({ length: 12 }, () => ({ icon: "🥚" })), cols: 6, alt: "12 eggs in 2 rows of 6" },
      },
      {
        title: "Doubling and halving",
        text: "When something **doubles** every day, the day before it was full it was **half full**. Working backwards, halve once for each day.",
        example: { q: "A plant doubles every day and covers the pond on day 20. When was the pond half covered?", steps: ["It doubles every day.", "So one day before it was full, it covered half."], answer: "Day 19" },
      },
      {
        title: "'Times as many' puzzles",
        text: "'Four times the number' means 4 groups of the number. If adding 36 to a number makes it four times as big, then 36 is **3 times** the number, so the number is 12.",
        remember: "Draw bars: one bar for the number, four bars for four times. The difference is three bars.",
      },
      {
        title: "Multiples in a row",
        text: "Positions that are multiples of 12 in a row of 60 are 12, 24, 36, 48 and 60: one every 12 places.",
      },
    ],
    tip: "Bar drawings turn 'times as many' sentences into simple pictures.",
  }),
  "4-CT-10": T({
    intro: "Big animals and big numbers: we use digits, money and logical rules to solve puzzles.",
    concepts: [
      {
        title: "Digit puzzles",
        text: "Clues like 'one even digit occurs twice' limit which digits can be used. List the possibilities in an organised way, then count them.",
      },
      {
        title: "Money and differences",
        text: "If Asha has ₹15 more than Bina, write Asha = Bina + 15. Comparing everyone with **one person** makes the puzzle easy.",
        example: { q: "Raj has ₹30 less than Sam, and Tej has ₹30 more than Sam. They have ₹300 in all. How much does Sam have?", steps: ["Raj + Tej = Sam − 30 + Sam + 30 = 2 Sams.", "So 3 Sams = ₹300."], answer: "Sam has ₹100" },
      },
      {
        title: "Reversed numbers",
        text: "Reversing a number swaps its digits around: 123 becomes 321. A number that is the **same** when reversed is a **palindrome**, like 12321.",
      },
      {
        title: "Rules in rows and columns",
        text: "In grid puzzles every row and column follows the **same rule**. Find the rule from a complete row, then check it on a complete column before using it.",
      },
    ],
    tip: "Pick one person or one number as the 'base' and describe everything else from it.",
  }),
  "4-CT-11": T({
    intro: "Folding, mirrors and symmetry help us see how shapes match and flip.",
    concepts: [
      {
        title: "Lines of symmetry",
        text: "A **line of symmetry** splits a shape into two halves that match when folded. Some letters have a **vertical** line (A, M, T), some a **horizontal** one (B, D, E), some both (H, I, O) and some none (F, P).",
        fig: { kind: "pixels", n: 6, cells: [[1, 1, "blue"], [1, 4, "blue"], [2, 2, "pink"], [2, 3, "pink"], [3, 2, "pink"], [3, 3, "pink"], [4, 1, "blue"], [4, 4, "blue"]], mirror: "middle", alt: "A symmetric design with its line of symmetry" },
      },
      {
        title: "Mirror images",
        text: "A **vertical mirror** swaps left and right; a **horizontal mirror** (like water) swaps top and bottom. Squares near the mirror stay near the mirror.",
        remember: "In a mirror, each point moves to the same distance on the other side of the mirror line.",
      },
      {
        title: "Folding and punching",
        text: "When folded paper is punched, the hole goes through **every layer**. When you unfold it, each hole appears again, reflected across each fold line.",
        example: { q: "A square paper is folded once and one hole is punched. How many holes when opened?", steps: ["The fold makes 2 layers.", "The punch goes through both."], answer: "2 holes, mirror images of each other" },
      },
    ],
    tip: "Unfold in your head one fold at a time, starting with the LAST fold.",
  }),
  "4-CT-12": T({
    intro: "Clocks and calendars help us work out durations, schedules and days of the week.",
    concepts: [
      {
        title: "Durations",
        text: "To find how long something lasts, count from the start time to the end time: first to the next hour, then whole hours, then minutes.",
        fig: { kind: "clock", h: 9, m: 45, alt: "A clock showing 9:45" },
      },
      {
        title: "Repeating schedules",
        text: "If something repeats every few days (work 5 days, rest 1), the pattern repeats every 6 days. Find the **cycle length** first, then use it to jump ahead.",
        example: { q: "Meera works 5 days, then rests 1 day, again and again, starting on Monday. On which day does she rest the second time?", steps: ["Cycle = 6 days. First rest: day 6 (Saturday).", "Second rest: day 12."], answer: "Day 12: Friday of the next week" },
      },
      {
        title: "Calendars and days of the week",
        text: "Days repeat every **7 days**. 30 days later is 2 days further on in the week (30 = 4 weeks + 2 days). A **leap year** has 29 days in February and 366 days in all.",
        remember: "April, June, September and November have 30 days. February has 28 (29 in a leap year). The rest have 31.",
      },
      {
        title: "Fast and slow clocks",
        text: "A clock that **loses** 10 minutes every hour shows 50 minutes for each real hour. After 3 real hours it is 30 minutes behind.",
      },
    ],
    tip: "Use a number line of hours or a mini calendar to count, instead of doing it all in your head.",
  }),
  "4-CT-13": T({
    intro: "At the museum we compare, share, solve 'times as many' puzzles and decide which clues are enough.",
    concepts: [
      {
        title: "Comparing with 'times as many'",
        text: "'A ship carries five times as many as a boat' means ship = 5 × boat. If you know one, you can find the other.",
      },
      {
        title: "Cutting a cube into small cubes",
        text: "If a cube is cut into **27** equal cubes, there are 3 along each edge (3 × 3 × 3 = 27). So each small cube's side is the big side ÷ 3.",
        fig: { kind: "cubes", heights: [3, 3, 3], colour: "purple", alt: "A front view of a cube built from small cubes" },
        example: { q: "A cube of side 12 cm is cut into 27 equal cubes. What is the side of each small cube?", steps: ["27 = 3 × 3 × 3, so 3 small cubes fit along each edge.", "12 ÷ 3 = 4."], answer: "4 cm" },
      },
      {
        title: "Symbol equations",
        text: "When shapes stand for numbers (△ + △ = 10), solve the **simplest equation** first, then put that value into the others.",
      },
      {
        title: "Is the information enough?",
        text: "Some questions ask whether given statements are **sufficient**. Check each statement on its own, then both together. Only say 'enough' if there is exactly one possible answer.",
        remember: "Enough information = only ONE answer is possible.",
      },
    ],
    tip: "Start with the clue that tells you the most, and use its answer in the next clue.",
  }),
  "4-CT-14": T({
    intro: "Data is information we collect. Tables, charts and surveys help us find answers and patterns.",
    concepts: [
      {
        title: "Reading tables",
        text: "A **table** has rows and columns. Read across a row and down a column to find one value. To compare, add up a row or a column.",
        table: [["Name", "Maths", "EVS", "Total"], ["A", "18", "15", "33"], ["B", "16", "19", "35"]],
      },
      {
        title: "Bar charts and patterns",
        text: "A **bar chart** shows amounts as bars. Read the scale carefully. If the bars follow a pattern (each month 5 more), you can predict the next one.",
        fig: { kind: "bars", title: "Notebooks sold", labels: ["Jan", "Feb", "Mar", "Apr"], values: [10, 15, 20, 25], step: 5, showValues: true, alt: "Bar chart rising by 5 each month" },
      },
      {
        title: "Marks with plus and minus",
        text: "When a test gives marks for correct answers and takes marks away for wrong ones, **score = correct × marks − wrong × penalty**.",
        example: { q: "5 marks for correct, 2 taken off for wrong. Meera gets 8 right and 3 wrong. Score?", steps: ["8 × 5 = 40.", "3 × 2 = 6 taken off."], answer: "34 marks" },
      },
      {
        title: "Logical deductions",
        text: "In 'who is who' puzzles, make a **grid** with people down the side and options across the top. Put ✓ and ✗ from each clue until only one choice is left in each row.",
      },
    ],
    tip: "Make a table before you start. Organised data answers questions quickly.",
  }),
};
