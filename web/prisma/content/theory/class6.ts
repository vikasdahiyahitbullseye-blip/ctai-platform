// Class 6 "Learn it" theory, matched to the concepts in Think, Play & Solve Help Book · Class 6.
import { T, type ChapterTheory } from "./types";

export const THEORY6: Record<string, ChapterTheory> = {
  "6-CT-1": T({
    intro: "A pattern is a rule that tells us how each term comes from the one before or from its position. Find the rule, test it on every term, then use it to predict.",
    concepts: [
      {
        title: "Finding the rule of a number series",
        text: "Look at the **differences** between neighbouring terms first. If they are not equal, look at the differences of the differences, or try multiplying.",
        table: [
          ["Series", "What changes", "Rule"],
          ["4, 9, 14, 19, …", "+5 every time", "add 5"],
          ["3, 5, 9, 15, 23, …", "+2, +4, +6, +8", "the gap grows by 2"],
          ["2, 5, 11, 23, 47, …", "×2 then +1", "double and add 1"],
          ["5#6, $7$, 8#9, …", "two styles take turns", "alternating series"],
        ],
        example: { q: "One term is wrong: 2, 5, 11, 23, 46, 95, 191. Which one?", steps: ["Try a rule on the first terms: 2 × 2 + 1 = 5, 5 × 2 + 1 = 11, 11 × 2 + 1 = 23.", "Next should be 23 × 2 + 1 = 47, and 47 × 2 + 1 = 95 fits the rest."], answer: "46 should be 47" },
      },
      {
        title: "Special number sequences",
        text: "Some sequences appear again and again in puzzles. Learn to recognise them.",
        points: [
          "**Square numbers** 1, 4, 9, 16, 25, … (n × n). The sum of the first n odd numbers is n × n: 1 + 3 + 5 = 9.",
          "**Triangular numbers** 1, 3, 6, 10, 15, … (1 + 2 + … + n). They make staircases and triangles of dots.",
          "**Repeating counts** 1, 2, 2, 3, 3, 3, … : the number k appears k times.",
        ],
        fig: { kind: "cubes", heights: [1, 2, 3, 4], colour: "orange", alt: "A staircase of 1, 2, 3 and 4 cubes: 10 cubes, a triangular number" },
      },
      {
        title: "Growing shape patterns",
        text: "Count how much each new term **adds**. If every term adds the same amount, term n = (first term) + (n − 1) × (amount added). A shape that adds 4 blocks each time and starts at 5 has **4n + 1** blocks.",
        example: { q: "A row of hexagons has a circle at every corner. 1 hexagon has 6 circles, 2 have 10, 3 have 14. How many circles for 50 hexagons?", steps: ["Each new hexagon adds 4 circles.", "Term n = 6 + (n − 1) × 4 = 4n + 2."], answer: "4 × 50 + 2 = 202 circles" },
      },
      {
        title: "Sets and pyramids",
        text: "In a **set** of numbers, every number follows the same rule (e.g. multiples of 4). Find the rule first, then spot the number that breaks it. In a **pyramid** where each level has a fixed number fewer cubes, start with 1 cube at the top to fit in the most levels.",
        remember: "Always check your rule against EVERY term, not just the first two.",
      },
    ],
    tip: "Write the differences under the series in a second row. Patterns hidden in the numbers often show up clearly in the gaps.",
  }),
  "6-CT-2": T({
    intro: "Angles measure turning. Directions, clock hands, rotating shapes and lines meeting at a point all use the same few facts about degrees.",
    concepts: [
      {
        title: "Angles you must know",
        text: "A **full turn** is 360°, a **straight angle** is 180° and a **right angle** is 90°. Angles on a straight line add up to **180°**, angles round a point add up to **360°**, and the angles of a triangle add up to **180°**.",
        fig: { kind: "angle", deg: 135, colour: "blue", alt: "An angle of 135 degrees" },
        remember: "Two lines that are both perpendicular to the same line are parallel to each other.",
      },
      {
        title: "Directions and turns",
        text: "The 8 compass directions are **45°** apart: N, NE, E, SE, S, SW, W, NW. A clockwise turn of 90° from North faces East; a turn of 135° from North faces South-East.",
        points: ["People round a table facing the centre: their **left** is the next seat clockwise when you look down from above.", "Equal gaps round a table: with 8 seats each seat turns the facing direction by 360° ÷ 8 = 45°."],
      },
      {
        title: "Clock angles",
        text: "The minute hand moves **6° per minute**. The hour hand moves **30° per hour**, which is **½° per minute**. Measure both from 12 and take the difference; if it is more than 180°, subtract it from 360° to get the smaller angle.",
        fig: { kind: "clock", h: 4, m: 30, alt: "A clock showing 4:30" },
        example: { q: "What is the smaller angle between the hands at 4:30?", steps: ["Minute hand: 30 × 6° = 180°.", "Hour hand: 4 × 30° + 30 × ½° = 135°."], answer: "180° − 135° = 45°" },
      },
      {
        title: "How often hands meet or make a right angle",
        text: "In 12 hours the minute hand goes round 12 times and the hour hand once, so the minute hand **gains 11 turns**. The hands overlap once per gained turn (**11 times**) and make 90° twice per gained turn (**22 times**).",
      },
      {
        title: "Turning shapes",
        text: "A regular shape with n equal corners looks the same after a turn of **360° ÷ n**. A regular pentagon fits itself after 72°, a regular hexagon after 60°.",
      },
    ],
    tip: "Draw a quick sketch with the angles you know marked on it. Then use '180° on a line' and '180° in a triangle' to fill in the rest.",
  }),
  "6-CT-3": T({
    intro: "Number play puzzles mix digits, sums and small rules. The key skills are making the biggest or smallest choice, listing cases neatly and checking every condition.",
    concepts: [
      {
        title: "Biggest and smallest choices",
        text: "To get the **highest sum** of three numbers from a set, take the three biggest. For the **second highest**, swap the smallest of those three for the next number down.",
        example: { q: "Pick 3 numbers from {2, 3, 5, 7, 8, 9}. Which pair is in both the highest-sum and second-highest-sum choice?", steps: ["Highest: 7 + 8 + 9 = 24.", "Second highest: swap 7 for 5, so 5 + 8 + 9 = 22."], answer: "8 and 9" },
      },
      {
        title: "Using big values to save steps",
        text: "To reach a total in the **fewest** steps, use the largest values allowed. To use the **most** steps, use the smallest. If a die game must end with three 6s (18 points) and the total is 31, the other rolls add to 13, and with at most 5 each you need at least 3 more rolls: **6 rolls**.",
      },
      {
        title: "Palindromes and digit rules",
        text: "A **palindrome** reads the same forwards and backwards (12321). In a 5-digit palindrome the 1st and 5th digits match and the 2nd and 4th match, so only three digits are free.",
        remember: "A number cannot start with 0.",
      },
      {
        title: "Neighbours in a grid",
        text: "Cells are **neighbours** when they share a side (not just a corner). A cell bigger than all its neighbours is a 'supercell'. Check each cell against its neighbours one by one, in order, so none is missed.",
        fig: { kind: "lettergrid", rows: ["385", "917", "264"], colour: "teal", alt: "A 3 by 3 grid of digits" },
      },
    ],
    tip: "Make a short list of all the cases in order (smallest to largest). Crossing out cases that break a rule is faster than guessing.",
  }),
  "6-CT-4": T({
    intro: "Data is information collected as numbers. Tally marks, pictographs and bar graphs present it so that we can read it quickly and draw conclusions.",
    concepts: [
      {
        title: "Tally marks and tables",
        text: "Tally marks are grouped in fives (four lines and one across: 卌) so that they are easy to count. A frequency table lists each item with how many times it occurs.",
      },
      {
        title: "Pictographs",
        text: "Each symbol stands for a fixed number given in the **key**; half a symbol stands for half that number. Value of a row = number of symbols × key.",
        fig: { kind: "pictograph", title: "Juice sold (litres)", labels: ["Store A", "Store B", "Store C"], counts: [3, 5, 4], icon: "🧃", per: 10, alt: "Pictograph: each juice box stands for 10 litres" },
        example: { q: "Each symbol stands for x litres (a whole number). The longest row has 8 symbols and no store sold 100 litres or more. What is the largest x can be?", steps: ["8 × x must be less than 100.", "8 × 12 = 96 fits but 8 × 13 = 104 does not."], answer: "x = 12" },
      },
      {
        title: "Bar graphs",
        text: "The height of each bar shows its value, read against the **scale** on the side. Check the scale step first (1, 2, 5, 10, …). Bars make comparisons easy: tallest, shortest, the difference between two bars, or bars that add up to another bar.",
        fig: { kind: "bars", title: "Marbles collected", labels: ["Mia", "Neil", "Ola", "Pav"], values: [26, 12, 34, 32], step: 10, showValues: true, alt: "Bar graph of marbles collected" },
      },
      {
        title: "Groups that overlap",
        text: "When students can be in more than one group, list each student's groups. 'Exactly two groups' means in two and **not** in the third. A Venn diagram helps keep the counts apart.",
        remember: "A conclusion must follow from the data. If two answers fit all the clues, the answer 'cannot be determined' is correct.",
      },
    ],
    tip: "Before answering, say in words what one bar or one symbol stands for. Most mistakes in data questions come from misreading the key or the scale.",
  }),
  "6-CT-5": T({
    intro: "Every whole number is built from primes by multiplying. Factors, multiples and primes explain patterns on circles, in sums of consecutive numbers and in number codes.",
    concepts: [
      {
        title: "Factors, multiples and primes",
        text: "A **factor** divides a number exactly; a **multiple** is the number times 1, 2, 3, … A **prime** has exactly two factors (1 and itself); a **composite** number has more than two. 1 is neither.",
        fig: { kind: "numgrid", from: 1, to: 30, cols: 10, marks: [{ v: 2, colour: "orange" }, { v: 3, colour: "orange" }, { v: 5, colour: "orange" }, { v: 7, colour: "orange" }, { v: 11, colour: "orange" }, { v: 13, colour: "orange" }, { v: 17, colour: "orange" }, { v: 19, colour: "orange" }, { v: 23, colour: "orange" }, { v: 29, colour: "orange" }], alt: "Numbers 1 to 30 with the 10 primes marked" },
        remember: "2 is the only even prime. The single-digit primes are 2, 3, 5 and 7.",
      },
      {
        title: "Prime factorisation and common factors",
        text: "Break a number into primes with a factor tree: 150 = 2 × 3 × 5 × 5. The **HCF** of two numbers is the biggest number that divides both; **co-prime** numbers have HCF 1.",
      },
      {
        title: "Points on a circle",
        text: "On a circle with **n** equally spaced points, start anywhere and jump **k** points each time. You return to the start after **n ÷ HCF(n, k)** jumps. If n and k are co-prime, you visit every point.",
        example: { q: "16 points, add 6 each time. How many steps to get back?", steps: ["HCF(16, 6) = 2.", "Steps = 16 ÷ 2."], answer: "8 steps" },
      },
      {
        title: "Sums of consecutive numbers",
        text: "Write the numbers as n, n + 1, n + 2, … Five consecutive numbers add to 5n + 10 = **5 × (n + 2)**, always a multiple of 5. Four consecutive numbers add to 4n + 6, always even but not always a multiple of 4.",
      },
    ],
    tip: "To show a statement is not always true, one counter-example is enough. To show it is always true, use a general form like n, n + 1, n + 2.",
  }),
  "6-CT-6": T({
    intro: "Perimeter is the distance round a shape; area is the space inside it. Cutting, folding and joining shapes changes them in ways we can predict.",
    concepts: [
      {
        title: "Perimeter and area of rectangles",
        text: "For a rectangle of length l and breadth b: perimeter = **2 × (l + b)**, area = **l × b**. For a square of side s: perimeter 4s, area s × s.",
        fig: { kind: "areamodel", height: 6, widths: [9], labels: ["9 cm"], hLabel: "6 cm", alt: "A 9 cm by 6 cm rectangle" },
        example: { q: "A rectangle has perimeter 30 cm and length 9 cm. What is its area?", steps: ["l + b = 30 ÷ 2 = 15, so b = 15 − 9 = 6 cm.", "Area = 9 × 6."], answer: "54 cm²" },
      },
      {
        title: "Triangles, parallelograms and trapeziums",
        text: "A triangle is **half** of the rectangle with the same base and height: area = ½ × base × height. A parallelogram has area base × height. A trapezium has area ½ × (sum of the parallel sides) × height.",
        remember: "Joining the midpoints of a square's sides makes a square with HALF the area.",
      },
      {
        title: "Joining and cutting shapes",
        text: "When shapes are joined, edges that touch are **hidden**, so the perimeter drops while the area stays the same. Cutting a square along its diagonal keeps the area but each new piece has a long new side (the diagonal), which is longer than a side.",
      },
      {
        title: "Folding",
        text: "Folding a sheet in half halves one side. A 24 cm × 12 cm sheet (perimeter 72 cm) becomes 12 × 12 (48 cm) and then 12 × 6 (36 cm).",
      },
    ],
    tip: "Draw the shape on squared paper and count squares for area and unit edges for perimeter. It is the quickest check of any formula.",
  }),
  "6-CT-7": T({
    intro: "A fraction names equal parts of a whole or of a group. To compare, order or combine fractions, make them speak the same 'language' first.",
    concepts: [
      {
        title: "Equivalent fractions",
        text: "Multiplying or dividing the top and bottom by the same number gives the same amount: 3/4 = 6/8 = 9/12.",
        fig: { kind: "fraction", shape: "bar", parts: 8, shaded: 6, colour: "blue", alt: "A bar with 6 of 8 parts shaded: 6/8 = 3/4" },
      },
      {
        title: "Comparing and ordering fractions",
        text: "Use **one** of these: write them with a common denominator, change them to decimals (divide top by bottom), or compare to ½ or 1 first.",
        example: { q: "Order Art 17/20, Music 33/40, Maths 43/50 from best to worst.", steps: ["17/20 = 0.85, 33/40 = 0.825, 43/50 = 0.86."], answer: "Maths, Art, Music" },
      },
      {
        title: "Fraction of a quantity",
        text: "To find 2/3 of 24, divide by the bottom and multiply by the top: 24 ÷ 3 × 2 = 16. If 1/4 of the children are sons, 3/4 are daughters: the parts always add up to 1 whole.",
      },
      {
        title: "Adding and subtracting",
        text: "Use a common denominator: 7/9 + 5/6 = 14/18 + 15/18 = 29/18. A fraction **between** two fractions can be found by writing both with a bigger common denominator, or by taking their average.",
        remember: "With people in two groups, 'both' is counted twice: both = group 1 + group 2 + neither − total.",
      },
    ],
    tip: "Turn 'of' into '×' and 'what fraction' into 'part ÷ whole'. Then the question becomes a simple calculation.",
  }),
  "6-CT-8": T({
    intro: "Construction puzzles ask you to fit pieces into squares and rectangles, count the shapes hidden in a figure and work with matchstick grids.",
    concepts: [
      {
        title: "Fitting pieces",
        text: "First check **area**: the pieces must have exactly as many squares as the space. Then fill the hardest spots first: corners and narrow gaps. If pieces cannot be turned or flipped, compare shapes exactly as drawn.",
        fig: { kind: "pixels", n: 4, cells: [[0, 0, "orange"], [0, 1, "orange"], [0, 2, "orange"], [1, 0, "orange"], [1, 1, "blue"], [1, 2, "blue"], [2, 0, "green"], [2, 1, "green"], [2, 2, "blue"], [3, 0, "green"], [3, 1, "pink"], [3, 2, "pink"], [3, 3, "pink"], [2, 3, "pink"], [1, 3, "purple"], [0, 3, "purple"]], alt: "A 4 by 4 square tiled by five coloured pieces" },
      },
      {
        title: "Counting squares in a grid",
        text: "Count size by size. An n × n grid has n² squares of side 1, (n − 1)² of side 2, and so on: a 3 × 3 grid has **9 + 4 + 1 = 14** squares.",
        remember: "In a grid that is not square, count separately for each size: a 2 × 3 grid has 6 + 2 = 8 squares.",
      },
      {
        title: "Matchstick grids",
        text: "A grid with r rows and c columns of squares has (r + 1) horizontal lines of c sticks and (c + 1) vertical lines of r sticks. To break all squares, remove sticks that are **shared** by many squares.",
        fig: { kind: "matchsticks", squares: 3, alt: "Three squares in a row made of 10 matchsticks" },
        example: { q: "How many matchsticks make a grid of 3 rows and 4 columns?", steps: ["Horizontal: 4 lines × 4 sticks = 16.", "Vertical: 5 lines × 3 sticks = 15."], answer: "31 matchsticks" },
      },
      {
        title: "Tiling a floor",
        text: "The floor's area must be a multiple of the tile's area, but that is not enough: the tile's shape must fit the corners and edges too. Try placing tiles from one corner, row by row.",
      },
    ],
    tip: "Shade or number the pieces as you place them. A drawing shows a gap or an overlap that is easy to miss in your head.",
  }),
  "6-CT-9": T({
    intro: "A shape is symmetric when one half matches the other. Mirrors, folding and turning are three ways of testing symmetry.",
    concepts: [
      {
        title: "Lines of symmetry",
        text: "A line of symmetry splits a shape into two **mirror halves**. A regular polygon with n sides has n lines of symmetry.",
        table: [
          ["Shape", "Lines of symmetry"],
          ["Square", "4"],
          ["Rectangle (not a square)", "2"],
          ["Rhombus (not a square)", "2"],
          ["Isosceles trapezium", "1"],
          ["Equilateral triangle / regular hexagon", "3 / 6"],
        ],
      },
      {
        title: "Symmetric letters and mirror words",
        text: "Letters with a **vertical** line: A H I M O T U V W X Y. Letters with a **horizontal** line: B C D E H I K O X. A side mirror flips left-right, so a word looks the same only if it reads the same backwards and every letter has a vertical line (WOW). A water image flips top-bottom (BOX).",
      },
      {
        title: "Folding and cutting",
        text: "When a folded sheet is cut, every hole appears **twice**: once where it is cut and once as its mirror image across the fold. Two folds give four copies.",
        fig: { kind: "pixels", n: 6, cells: [[1, 1, "purple"], [1, 4, "purple"], [2, 2, "pink"], [2, 3, "pink"], [4, 1, "purple"], [4, 4, "purple"], [3, 2, "pink"], [3, 3, "pink"]], mirror: "middle", alt: "A pattern that is symmetric about the middle line" },
      },
      {
        title: "Rotational symmetry",
        text: "A shape has rotational symmetry if it fits onto itself before a full turn. The smallest such turn is 360° ÷ (number of matching positions): a square fits after 90°, an equilateral triangle after 120°.",
        remember: "Mirror image = flip. Rotation = turn. A flipped shape cannot always be made by turning.",
      },
    ],
    tip: "Hold a pencil along the line you are testing and compare the squares or points pair by pair on each side.",
  }),
  "6-CT-10": T({
    intro: "Negative numbers are numbers less than zero. They describe temperatures below 0 °C, floors below the ground and money owed.",
    concepts: [
      {
        title: "Integers on a number line",
        text: "Integers are … −3, −2, −1, 0, 1, 2, 3, … Numbers get **bigger to the right**. So −2 > −7, because −2 is to the right of −7.",
        fig: { kind: "numberline", min: -6, max: 6, step: 1, labelEvery: 1, marks: [{ v: -4, label: "−4", colour: "blue" }, { v: 3, label: "+3", colour: "orange" }], alt: "A number line from −6 to 6 with −4 and 3 marked" },
      },
      {
        title: "Adding and subtracting",
        text: "Adding a positive number moves **right**; adding a negative number moves **left**. Subtracting a number is the same as adding its opposite: 5 − (−3) = 5 + 3 = 8.",
        example: { q: "At 6 a.m. it is −7 °C. It rises 4 °C an hour for 3 hours, falls 6 °C an hour for 2 hours, then rises 5 °C. Final temperature?", steps: ["−7 + 12 = 5.", "5 − 12 = −7.", "−7 + 5 = −2."], answer: "−2 °C" },
      },
      {
        title: "Tokens and scorecards",
        text: "Think of +1 and −1 tokens: a pair of +1 and −1 makes 0. A scorecard that adds the amount above a target and subtracts the amount below it gives (cost − target) for each item; the total is the sum of these.",
        remember: "A positive plus a negative: subtract the sizes and keep the sign of the bigger one. 8 + (−11) = −3.",
      },
      {
        title: "Series with negative numbers",
        text: "Many series simply keep subtracting: 48, 34, 20, 6, −8, … (subtract 14). Some series are two series mixed: look at the odd and even positions separately.",
      },
    ],
    tip: "Draw a small number line and move along it for each step. Lifts, temperatures and scores all become simple jumps.",
  }),
};
