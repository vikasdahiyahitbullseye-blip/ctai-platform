// Class 8 "Learn it" theory, matched to the concepts in Think, Play & Solve Help Book · Class 8.
import { T, type ChapterTheory } from "./types";

export const THEORY8: Record<string, ChapterTheory> = {
  "8-CT-1": T({
    intro: "A perfect square is a number times itself; a perfect cube is a number used three times as a factor. Their prime factors and last digits follow clear patterns.",
    concepts: [
      {
        title: "Squares, cubes and prime factors",
        text: "Write the number as a product of primes. It is a **perfect square** when every prime appears an **even** number of times, and a **perfect cube** when every prime appears a **multiple of 3** times.",
        example: { q: "180 × k is a perfect cube. Find the smallest k.", steps: ["180 = 2 × 2 × 3 × 3 × 5.", "Each prime needs 3 copies: one more 2, one more 3 and two more 5s."], answer: "k = 2 × 3 × 5 × 5 = 150" },
      },
      {
        title: "Last digits",
        text: "Squares can only end in **0, 1, 4, 5, 6 or 9**, so a number ending in 2, 3, 7 or 8 is never a square. Cubes can end in any digit, and a cube is odd exactly when the number cubed is odd.",
        table: [
          ["n ends in", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
          ["n² ends in", "1", "4", "9", "6", "5", "6", "9", "4", "1"],
          ["n³ ends in", "1", "8", "7", "4", "5", "6", "3", "2", "9"],
        ],
      },
      {
        title: "Useful square patterns",
        text: "The sum of the first n odd numbers is **n²**: 1 + 3 + 5 + 7 = 16. A number that is both a square and a cube is a **6th power**: 1, 64, 729, …",
        remember: "Between a² and (a + 1)² there are no other squares, so to count squares in a range, find the first and last square roots.",
      },
      {
        title: "Painted cubes",
        text: "A painted cube of side n is cut into n³ small cubes. Corners (3 faces painted): **8**. Edges (2 faces): **12 × (n − 2)**. Faces (1 face): **6 × (n − 2)²**. Inside (none): **(n − 2)³**.",
        fig: { kind: "cubes", heights: [3, 3, 3], colour: "blue", alt: "One face of a 3 by 3 by 3 cube built from small cubes" },
        example: { q: "A 6 cm painted cube is cut into 1 cm cubes. How many have exactly two painted faces?", steps: ["n = 6, so each edge has 6 − 2 = 4 such cubes.", "There are 12 edges."], answer: "12 × 4 = 48" },
      },
    ],
    tip: "Split numbers into primes before anything else. Square and cube questions almost always become easy once you can see the prime factors.",
  }),
  "8-CT-2": T({
    intro: "Exponents are a short way of writing repeated multiplication. They help us compare huge numbers, find last digits and count the ways of choosing things.",
    concepts: [
      {
        title: "Laws of exponents",
        text: "aᵐ × aⁿ = aᵐ⁺ⁿ, aᵐ ÷ aⁿ = aᵐ⁻ⁿ, (aᵐ)ⁿ = aᵐⁿ, and a⁰ = 1. To compare powers, make the **bases** the same (8² = 2⁶) or the **exponents** the same, or simply work out small values.",
        example: { q: "Which is bigger, 2⁸ or 3⁵?", steps: ["2⁸ = 256.", "3⁵ = 243."], answer: "2⁸ is bigger" },
      },
      {
        title: "Last digits of powers",
        text: "Only the last digit of the base matters, and the last digits **repeat in cycles**: 2 → 2, 4, 8, 6; 3 → 3, 9, 7, 1; 7 → 7, 9, 3, 1; 8 → 8, 4, 2, 6 (every 4). 4 and 9 repeat every 2; 0, 1, 5, 6 never change.",
        example: { q: "What is the last digit of 13⁵⁷?", steps: ["The last digits of powers of 3 repeat every 4: 3, 9, 7, 1.", "57 = 4 × 14 + 1, so it is the 1st in the cycle."], answer: "3" },
      },
      {
        title: "Zeros at the end",
        text: "Each end zero needs one factor 2 and one factor 5. Write the number in prime powers and count the smaller of the two: 8¹⁵ × 25⁹ = 2⁴⁵ × 5¹⁸ ends in **18 zeros**.",
      },
      {
        title: "Counting ways",
        text: "If a choice has a ways and the next has b ways, together there are **a × b** ways. A 3-digit code from 1–6 with no repeats and an even first digit: 3 × 5 × 4 = **60**. Each item can be in or out, so n items give **2ⁿ** groups.",
        remember: "For 'cannot both' rules, count all the ways and subtract the forbidden ones.",
      },
    ],
    tip: "Look for the cycle. Write the first few powers or cases in a row; a repeating pattern usually appears within 4 or 5 terms.",
  }),
  "8-CT-3": T({
    intro: "Numbers can be written in many systems. Our usual system is base 10, computers use base 2 and puzzles use base 3, Roman numerals and abacus beads.",
    concepts: [
      {
        title: "Place value in any base",
        text: "In base b the places are worth 1, b, b², b³, … from the right, and the digits go from 0 to **b − 1**. So base 2 uses 0 and 1, base 3 uses 0, 1, 2 and base 6 uses 0 to 5.",
        table: [
          ["Base", "Place values", "Example"],
          ["10 (decimal)", "1000, 100, 10, 1", "84 = 8 tens + 4 ones"],
          ["2 (binary)", "32, 16, 8, 4, 2, 1", "45 = (101101)₂"],
          ["3 (ternary)", "81, 27, 9, 3, 1", "59 = (2012)₃"],
        ],
      },
      {
        title: "Converting to another base",
        text: "**Repeated division**: divide by the base again and again, then read the remainders from the **last to the first**. Or take the biggest place value that fits each time.",
        fig: { kind: "binary", bits: [1, 1, 0, 1], alt: "Binary cards 8, 4, 2, 1 showing 1101 = 13" },
        example: { q: "Write 59 in base 3.", steps: ["59 ÷ 3 = 19 r 2; 19 ÷ 3 = 6 r 1; 6 ÷ 3 = 2 r 0; 2 ÷ 3 = 0 r 2.", "Read the remainders upwards."], answer: "(2012)₃ = 2 × 27 + 0 × 9 + 1 × 3 + 2" },
      },
      {
        title: "Measuring with pipes",
        text: "Binary pipes 1, 2, 4, 8, 16, 32 (one of each) can measure **every** whole height from 1 to 63, because each pipe is either used or not: 2⁶ − 1 = 63 heights. Ternary pipes 1, 3, 9, 27, … allow up to 2 of each.",
        remember: "In base b, 'the largest number with n digits' is bⁿ − 1: in base 3, (22222)₃ = 3⁵ − 1 = 242.",
      },
      {
        title: "Roman numerals",
        text: "I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1000. A smaller symbol **before** a bigger one is subtracted: IV = 4, IX = 9, XL = 40, XC = 90, CD = 400, CM = 900. So XLIX = 49.",
      },
      {
        title: "Abacus moves",
        text: "Each pole is a place. Moving one bead from a low pole to a high pole makes the number much bigger; moving it from a high pole to a low pole makes it much smaller. Choose the move by the size of the place.",
        fig: { kind: "abacus", labels: ["L", "TTh", "Th", "H", "T", "O"], beads: [5, 2, 7, 0, 3, 8], alt: "An abacus showing 5,27,038" },
      },
    ],
    tip: "Write the place values above the digits before converting. In base problems, most mistakes come from using a digit that the base does not allow.",
  }),
  "8-CT-4": T({
    intro: "A quadrilateral has four sides and four angles adding up to 360°. Special quadrilaterals are defined by their parallel sides, equal sides, angles and diagonals.",
    concepts: [
      {
        title: "The family of quadrilaterals",
        text: "Know the properties of each shape; puzzles about colours or labels are solved by matching them.",
        table: [
          ["Shape", "Sides", "Angles", "Diagonals"],
          ["Parallelogram", "opposite sides parallel and equal", "opposite equal; neighbours add to 180°", "bisect each other"],
          ["Rectangle", "as parallelogram", "all 90°", "equal and bisect each other"],
          ["Rhombus", "all four equal", "opposite equal", "perpendicular, bisect each other and the angles"],
          ["Square", "all four equal", "all 90°", "equal, perpendicular, bisect each other"],
          ["Trapezium", "exactly one pair parallel", "co-interior angles add to 180°", "no special rule"],
          ["Kite", "two pairs of equal neighbouring sides", "one pair of equal opposite angles", "perpendicular; one bisects the other"],
        ],
      },
      {
        title: "Angles in quadrilaterals",
        text: "The angles add to **360°**. In a trapezium ABCD with AB ∥ DC, ∠A + ∠D = 180°, so ∠A = 65° gives ∠D = 115°. A diagonal of a rhombus bisects the corner angles: from a 64° corner it makes 32° with each side.",
        remember: "65°, 115°, 75°, 105° add to 360° but cannot be a parallelogram: its opposite angles must be equal.",
      },
      {
        title: "Counting rectangles and squares",
        text: "A rectangle in a grid is fixed by choosing **2 horizontal** and **2 vertical** lines. A grid of 2 × 4 squares has 3 horizontal and 5 vertical lines: 3 × 10 = **30** rectangles. Count squares size by size.",
        fig: { kind: "pixels", n: 4, cells: [[1, 0, "blue"], [1, 1, "blue"], [1, 2, "blue"], [1, 3, "blue"], [2, 0, "teal"], [2, 1, "teal"], [2, 2, "teal"], [2, 3, "teal"]], alt: "A grid of 2 rows and 4 columns of squares" },
      },
      {
        title: "Joining and cutting",
        text: "Two identical equilateral triangles joined along a side make a **rhombus**. Two identical right triangles mirrored across the hypotenuse make a **kite**. Cutting the largest square again and again from a 13 × 8 rectangle gives squares of 8, 5, 3, 2, 1, 1: **6 squares**.",
      },
    ],
    tip: "When a question names a property, go down the table and tick every shape that has it. Remember that a square is also a rectangle and a rhombus.",
  }),
  "8-CT-5": T({
    intro: "Divisibility rules, remainders and counting multiples let us answer questions about very large sets of numbers without listing them all.",
    concepts: [
      {
        title: "Divisibility rules",
        text: "Check a number quickly before dividing.",
        table: [
          ["Divisible by", "Rule"],
          ["2, 5, 10", "last digit (even; 0 or 5; 0)"],
          ["3, 9", "sum of the digits divisible by 3, 9"],
          ["4, 8", "last 2 digits divisible by 4; last 3 by 8"],
          ["6, 12", "by 2 and 3; by 3 and 4"],
          ["11", "(sum of odd-place digits) − (sum of even-place digits) is 0 or a multiple of 11"],
        ],
      },
      {
        title: "Working with remainders",
        text: "The remainder of a sum or product depends only on the remainders. 23 leaves 5 and 38 leaves 2 when divided by 9, so 23 × 38 leaves the same remainder as 5 × 2 = 10, which is **1**.",
        remember: "A number that leaves remainder 1 when divided by 2, 3, 4, 5 and 6 is 1 more than a multiple of their LCM, 60: so 61.",
      },
      {
        title: "Counting multiples",
        text: "From 1 to N there are N ÷ k multiples of k (whole part only). For 'multiples of a **or** b', add both counts and subtract the multiples of **both** (the LCM), which were counted twice.",
        fig: { kind: "venn", left: "Multiples of 6", right: "Multiples of 8", a: "12", both: "4", b: "8", outside: "1 to 100", alt: "Venn diagram of multiples of 6 and 8 up to 100" },
        example: { q: "How many numbers from 1 to 100 are multiples of 6 or 8?", steps: ["Multiples of 6: 16; of 8: 12; of both (24): 4.", "16 + 12 − 4."], answer: "24 numbers" },
      },
      {
        title: "Flipping lamps and divisors",
        text: "If lamp n is flipped once for each of its divisors, it ends ON only when it has an **odd** number of divisors. Divisors come in pairs except for perfect squares, so only the **square-numbered** lamps stay ON.",
      },
      {
        title: "Consecutive numbers",
        text: "For an odd count of equally spaced numbers, the **middle** one is the average. Five consecutive odd numbers adding to 205 have middle 41, so they are 37, 39, 41, 43, 45.",
      },
    ],
    tip: "Before counting, ask: can I count the opposite (what is NOT allowed) or use a rule instead of a list?",
  }),
  "8-CT-6": T({
    intro: "The distributive law says that multiplying a sum is the same as multiplying each part and adding. It explains algebraic identities and many mental-maths shortcuts.",
    concepts: [
      {
        title: "The distributive law",
        text: "a × (b + c) = a × b + a × c. With two brackets, multiply every term by every term: (a + b)(c + d) = ac + ad + bc + bd. An area model shows each product as a rectangle: 7 × 23 = 7 × 20 + 7 × 3 = 140 + 21 = **161**.",
        fig: { kind: "areamodel", height: 7, widths: [20, 3], labels: ["20", "3"], hLabel: "7", alt: "Area model: 7 × 23 split into 7 × 20 and 7 × 3" },
        example: { q: "4 bags hold (x + 3) coins each and 3 bags hold (2x − 1) each. How many coins when x = 7?", steps: ["4(x + 3) + 3(2x − 1) = 4x + 12 + 6x − 3 = 10x + 9.", "x = 7: 70 + 9."], answer: "79 coins" },
      },
      {
        title: "Identities",
        text: "These are true for **every** value of the letters.",
        points: ["(a + b)² = a² + 2ab + b²", "(a − b)² = a² − 2ab + b²", "(a + b)(a − b) = a² − b²", "(x + a)(x + b) = x² + (a + b)x + ab"],
      },
      {
        title: "Clever multiplication",
        text: "Write the numbers as the same distance from a round number: 47 × 53 = (50 − 3)(50 + 3) = 2500 − 9 = **2491**, and 105 × 95 = 100² − 5² = **9975**.",
        remember: "A 15 m square changed to (15 + 3) × (15 − 3) loses 3² = 9 m² of area: 216 m².",
      },
      {
        title: "Adding equations",
        text: "If 7 mangoes + 3 apples cost ₹140 and 3 mangoes + 7 apples cost ₹100, adding gives 10 mangoes + 10 apples = ₹240, so 5 mangoes + 5 apples = **₹120**. Look for a combination before solving for each price.",
      },
    ],
    tip: "Expand both sides into separate terms. Equal expressions must have the same terms, which also lets you check your algebra with a small number like x = 1.",
  }),
  "8-CT-7": T({
    intro: "A ratio compares two quantities of the same kind. Proportional reasoning uses ratios to share, mix, scale and compare rates.",
    concepts: [
      {
        title: "Ratios and sharing",
        text: "A ratio a : b means a parts to b parts. Write both quantities in the **same units** and simplify: 45 min : 2 h = 45 : 120 = 3 : 8. To share in a ratio, add the parts and find one part.",
        example: { q: "Share ₹2000 among three children in the ratio 2 : 3 : 5.", steps: ["2 + 3 + 5 = 10 parts, so 1 part = ₹200.", "2 × 200, 3 × 200, 5 × 200."], answer: "₹400, ₹600, ₹1000" },
      },
      {
        title: "Mixtures",
        text: "When only one ingredient is added, the other stays the same. 40 L of milk and water in 3 : 2 has 24 L milk and 16 L water. For 1 : 1 the water must also be 24 L, so add **8 L**.",
        fig: { kind: "fraction", shape: "bar", parts: 5, shaded: 3, colour: "blue", alt: "A bar of 5 parts: 3 parts milk, 2 parts water" },
      },
      {
        title: "Unit rates and best buys",
        text: "Divide to find the value for **one** unit (or for 100 g), then compare. Pack B: 400 g for ₹92 is ₹23 per 100 g, cheaper than ₹24 per 100 g for the others.",
        remember: "Map scales are proportions too: if 1 cm stands for 5 km, then 7.5 cm stands for 37.5 km.",
      },
      {
        title: "Direct and inverse proportion",
        text: "**Direct**: both grow together (more cookies need more flour). **Inverse**: one grows as the other shrinks (more workers need fewer days). 6 workers take 10 days, so the job is 60 worker-days, and 4 workers take **15 days**.",
      },
      {
        title: "Rates of work",
        text: "Add the parts of the job done **per hour**. Pipe A fills a tank in 6 h (1/6 per hour) and pipe B in 3 h (1/3 per hour): together 1/6 + 1/3 = 1/2 per hour, so **2 hours**. A pipe that empties counts as a minus.",
      },
    ],
    tip: "Ask first: when one quantity doubles, does the other double (direct) or halve (inverse)? That decides whether you multiply or divide.",
  }),
};
