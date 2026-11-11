// Class 7 "Learn it" theory, matched to the concepts in Think, Play & Solve Help Book · Class 7.
import { T, type ChapterTheory } from "./types";

export const THEORY7: Record<string, ChapterTheory> = {
  "7-CT-1": T({
    intro: "Large numbers are read and written using place value. India uses lakhs and crores; most of the world uses millions and billions. Digit clues help us build or identify a number.",
    concepts: [
      {
        title: "Indian and international systems",
        text: "In the Indian system commas come after the first 3 digits from the right and then after every 2 digits. In the international system they come after every 3 digits.",
        table: [
          ["Indian", "Digits", "International"],
          ["1 lakh = 1,00,000", "6", "100 thousand"],
          ["10 lakh = 10,00,000", "7", "1 million"],
          ["1 crore = 1,00,00,000", "8", "10 million"],
          ["100 crore", "10", "1 billion"],
        ],
        example: { q: "How is 36,000,000 (36 million) read in the Indian system?", steps: ["Rewrite with Indian commas: 3,60,00,000.", "That is 3 crore and 60 lakh."], answer: "3 crore 60 lakh" },
      },
      {
        title: "Forming numbers with conditions",
        text: "For the **largest** number, put the biggest allowed digits on the left; for the **smallest**, put the smallest (but never 0 first). When adding lakhs, only the lakh digit and the digits to its left change, unless there is a carry.",
        remember: "A 7-digit number can start at 10,00,000; the largest 6-digit number is 9,99,999.",
      },
      {
        title: "Zeros at the end of a product",
        text: "Each zero at the end comes from a factor **10 = 2 × 5**. Count the 5s (there are always more 2s). In 1 × 2 × … × 12 the 5s come only from 5 and 10, so the product ends in **2 zeros**.",
      },
      {
        title: "Steps to reach a target",
        text: "When a counter adds the same amount each time, find how much is still needed and divide by the step. If it does not divide exactly, one more step is needed to go **past** the target.",
        example: { q: "A meter shows 99,250 and adds 125 a minute. What is the first reading above 1 lakh?", steps: ["1,00,000 − 99,250 = 750; 750 ÷ 125 = 6 steps reach exactly 1,00,000.", "'Above' needs one more step."], answer: "1,00,125" },
      },
    ],
    tip: "Draw place-value boxes (L, TTh, Th, H, T, O) and fill them one clue at a time. Mark digits that are already used.",
  }),
  "7-CT-2": T({
    intro: "An arithmetic expression is a set of numbers joined by operations. Its value depends on the order in which we do the operations.",
    concepts: [
      {
        title: "Order of operations",
        text: "Work out **brackets** first, then **× and ÷** from left to right, then **+ and −** from left to right.",
        example: { q: "Find 13 × 11 + 7 − 10.", steps: ["Multiply first: 13 × 11 = 143.", "Then left to right: 143 + 7 − 10."], answer: "140" },
        remember: "If a question says 'from left to right', ignore the usual order and do each step as you read it.",
      },
      {
        title: "Terms in an expression",
        text: "The **terms** are the parts joined by + or −. In 20 + 4 × 3 − 6 the terms are 20, 4 × 3 and −6. Changing the order of terms does not change the value; swapping an operator changes it.",
      },
      {
        title: "Working backwards",
        text: "To find a starting number, start from the result and **undo** each step in reverse order: undo × 3 by ÷ 3, undo − 15 by + 15, undo 'half get off' by doubling.",
        example: { q: "(n × 3 − 15) × 3 = 90. Find n.", steps: ["Undo × 3: 90 ÷ 3 = 30.", "Undo − 15: 30 + 15 = 45.", "Undo × 3: 45 ÷ 3 = 15."], answer: "n = 15" },
      },
      {
        title: "Codes made from operations",
        text: "Some puzzles hide a rule such as 'square and add 1' (1 → 2, 3 → 10, 5 → 26). Test the rule on **every** example before using it on the new number.",
      },
    ],
    tip: "Rewrite the expression neatly, underline the part you will do first, and write each new line under the last one.",
  }),
  "7-CT-3": T({
    intro: "Digits after the decimal point show parts smaller than one. The same place-value idea also explains binary numbers on punched cards.",
    concepts: [
      {
        title: "Decimal place value",
        text: "After the point the places are **tenths, hundredths, thousandths**. In 4.537 the 3 is worth 3/100. Multiplying by 10 moves every digit one place left (the point seems to move one place right).",
        fig: { kind: "numberline", min: 0, max: 1, step: 0.1, labelEvery: 2, decimals: 1, marks: [{ v: 0.3, label: "0.3", colour: "orange" }, { v: 0.7, label: "0.7", colour: "blue" }], alt: "A number line from 0 to 1 marked in tenths" },
        example: { q: "Two decimals differ by 5.4. Moving the point of the smaller one place right makes them equal. Find the smaller.", steps: ["Moving the point right multiplies by 10, so larger = 10 × smaller.", "10 × smaller − smaller = 9 × smaller = 5.4."], answer: "smaller = 0.6" },
      },
      {
        title: "Comparing decimals",
        text: "Compare the whole-number parts first, then the tenths, then the hundredths, and so on. Writing extra zeros helps: 0.5 = 0.500 > 0.475.",
        remember: "In a product of decimals, the answer has as many decimal places as both numbers together: 0.004 × 0.03 = 0.00012.",
      },
      {
        title: "Decimal series",
        text: "Find the differences between terms. They may be constant, alternate (−1.6, +0.9, −1.6, …) or follow a rule such as 'each term is the average of the two before it'.",
      },
      {
        title: "Binary numbers and punched cards",
        text: "In binary each place is worth **double** the place to its right: 16, 8, 4, 2, 1. Each place holds 0 or 1 (an O-hole or a U-hole). With n holes there are **2 × 2 × … = 2ⁿ** different cards.",
        fig: { kind: "binary", bits: [1, 0, 1, 1, 0], alt: "Binary cards 16, 8, 4, 2, 1 showing 10110 = 22" },
        example: { q: "Write 22 in binary.", steps: ["22 = 16 + 4 + 2.", "Put 1 under 16, 4 and 2, and 0 under 8 and 1."], answer: "10110" },
      },
    ],
    tip: "Line decimals up by their points (or write them with the same number of decimal places) before you compare, add or subtract.",
  }),
  "7-CT-4": T({
    intro: "Letters can stand for numbers. An expression with letters works for every value, which lets us describe rules, ages, flows and puzzles in short form.",
    concepts: [
      {
        title: "Writing expressions",
        text: "Turn words into symbols: '5 more than x' is x + 5; 'twice y' is 2y; 'the sum of A and B' is A + B. If three cousins' ages add to 45, then 6 years ago they added to 45 − 3 × 6 = **27**.",
      },
      {
        title: "Like terms and simplifying",
        text: "Terms with the same letter are **like terms** and can be combined: 3P + 2Q − P = 2P + 2Q. Expand brackets first: (4A − 2C) − (P + 2B) = 4A − 2C − P − 2B.",
        remember: "A minus sign before a bracket changes the sign of every term inside it.",
      },
      {
        title: "Symbols for relations",
        text: "Puzzles may use symbols for >, <, ≥, ≤ and =. Translate each symbol, then combine the facts: a > b and b ≥ c together give a > c.",
      },
      {
        title: "Remainders and repeating cycles",
        text: "Days of the week repeat every 7 days, so only the **remainder on dividing by 7** matters.",
        fig: { kind: "calendar", month: "Days repeat every 7", start: 3, days: 14, marks: [{ d: 1, colour: "orange" }, { d: 8, colour: "orange" }], alt: "Two weeks of a calendar: day 1 and day 8 fall on the same weekday" },
        example: { q: "Today is Wednesday. What day is it 100 days from now?", steps: ["100 = 14 × 7 + 2, so 14 whole weeks and 2 more days.", "2 days after Wednesday."], answer: "Friday" },
      },
      {
        title: "Number pyramids",
        text: "In an addition pyramid each brick is the sum of the two bricks below it. Write the unknown bricks as letters, write an equation for each brick, and solve from the bottom up.",
      },
    ],
    tip: "Give every unknown a letter and write each clue as an equation. Then solve the simplest equation first and substitute.",
  }),
  "7-CT-5": T({
    intro: "Lines on a flat surface either cross (intersect) or never meet (parallel). The angles they make follow fixed rules, which help us count shapes and find unknown angles.",
    concepts: [
      {
        title: "Angles at crossing lines",
        text: "When two lines cross, **vertically opposite** angles are equal and **neighbouring** angles add up to 180° (a linear pair).",
        fig: { kind: "lines", segs: [[0, 30, 100, 30], [0, 75, 100, 75], [25, 100, 75, 0]], colour: "green", alt: "Two parallel lines crossed by a transversal" },
        example: { q: "Two neighbouring angles are (2x + 15)° and (x + 45)°. Find the smaller angle.", steps: ["They add to 180°: 3x + 60 = 180, so x = 40.", "The angles are 95° and 85°."], answer: "85°" },
      },
      {
        title: "Parallel lines and a transversal",
        text: "A line crossing two parallel lines makes **corresponding** angles equal, **alternate** angles equal and **co-interior** angles (on the same side, between the lines) adding up to 180°.",
        remember: "A quadrilateral whose opposite sides lie on two pairs of parallel lines is a parallelogram.",
      },
      {
        title: "Counting intersection points",
        text: "n lines with no two parallel and no three through one point meet in **n × (n − 1) ÷ 2** points. Parallel lines never meet, so subtract the pairs inside each parallel group.",
        example: { q: "9 lines: 4 are parallel to each other and 3 others are parallel to each other. How many crossing points?", steps: ["All pairs: 9 × 8 ÷ 2 = 36.", "Parallel pairs: 4 × 3 ÷ 2 = 6 and 3 × 2 ÷ 2 = 3."], answer: "36 − 6 − 3 = 27" },
      },
      {
        title: "Counting squares and parallelograms",
        text: "A square divided into n × n parts has 1² + 2² + … + n² squares (n = 4 gives 30). With m parallel lines crossed by k parallel lines, each parallelogram uses 2 lines of each set: (m choose 2) × (k choose 2). 4 lines and 5 lines give 6 × 10 = 60.",
      },
      {
        title: "Parallel edges and faces of solids",
        text: "In a prism the two end faces are parallel, and in a regular base with an even number of sides opposite sides are parallel too. A hexagonal prism has 1 + 3 = 4 pairs of parallel faces.",
      },
    ],
    tip: "Mark equal angles with the same colour on your drawing. Most angle questions are solved by spotting one straight line or one pair of parallel lines.",
  }),
  "7-CT-6": T({
    intro: "These puzzles use logic cards, digit tricks and number grids. Many become easy once you see the rule hidden behind them.",
    concepts: [
      {
        title: "Punched cards for logic",
        text: "Each card shows ON (U-hole) or OFF (O-hole) for every light. A deck with all combinations of n lights has **2ⁿ** cards. Each statement that fixes one light throws away **half** the cards that are left.",
        fig: { kind: "binary", bits: [0, 1, 0], alt: "A card for Red, Green, Blue: OFF, ON, OFF" },
        example: { q: "From 32 cards for 5 lights, keep 'Yellow is ON', 'Red is OFF', 'Blue is OFF'. How many cards remain?", steps: ["Each statement halves the deck.", "32 → 16 → 8 → 4."], answer: "4 cards" },
      },
      {
        title: "Odd and even sums",
        text: "Even + even = even, odd + odd = even, odd + even = odd. So a sum of digits is odd exactly when it has an **odd number of odd digits**. Three odd and three even digits always give an odd sum.",
      },
      {
        title: "Reversing digits",
        text: "For a two-digit number with digits a and b (value 10a + b): number + reversal = **11 × (a + b)** and number − reversal = **9 × (a − b)**.",
        remember: "52 + 25 = 77 = 11 × 7, and 52 − 25 = 27 = 9 × 3.",
      },
      {
        title: "Magic squares and grids",
        text: "In a 3 × 3 magic square using 1 to 9, every row, column and diagonal adds to **15**, and 5 is in the centre. In other grid puzzles, start with the cell that has the fewest possible values.",
      },
      {
        title: "Sequences that add the two before",
        text: "In 1, 3, 4, 7, 11, 18, 29, … each term is the **sum of the two terms before it**. Rectangles 2 × 5, 5 × 7, 7 × 12, … use the same rule.",
      },
    ],
    tip: "When a grid puzzle seems stuck, write the possible values in pencil in each cell, then cross them out clue by clue.",
  }),
  "7-CT-7": T({
    intro: "A triangle is made by three intersecting lines. Its sides and angles follow simple rules that decide whether a triangle can exist and how triangles compare.",
    concepts: [
      {
        title: "Angles of a triangle",
        text: "The three angles add up to **180°**. In an **isosceles** triangle the two angles opposite the equal sides are equal; in an **equilateral** triangle every angle is 60°.",
        fig: { kind: "lines", segs: [[10, 90, 90, 90], [10, 90, 50, 10], [50, 10, 90, 90]], colour: "purple", alt: "An equilateral triangle" },
        example: { q: "The angles of a triangle are in the ratio 1 : 2 : 3. Find the largest.", steps: ["1 + 2 + 3 = 6 parts = 180°, so 1 part = 30°.", "The angles are 30°, 60°, 90°."], answer: "90°" },
      },
      {
        title: "Can the triangle exist?",
        text: "Any two sides together must be **longer** than the third side (the triangle inequality). 3, 4, 8 cannot make a triangle because 3 + 4 < 8.",
        example: { q: "How many triangles have whole-number sides and perimeter 13 cm?", steps: ["List a ≤ b ≤ c with a + b + c = 13 and a + b > c.", "1-6-6, 2-5-6, 3-4-6, 3-5-5, 4-4-5."], answer: "5 triangles" },
      },
      {
        title: "Similar triangles",
        text: "Triangles are **similar** when they have the same shape: all angles equal and all sides in the **same ratio**. A triangle with sides 5, 12, 13 and a similar one with shortest side 15 has scale factor 3, so sides 15, 36, 39.",
        remember: "One equal angle and one side ratio are not enough to prove two triangles are similar.",
      },
      {
        title: "Counting triangles in a figure",
        text: "From a top corner joined to k points on the base (ends included), every triangle uses the top and **two** of the base points: k × (k − 1) ÷ 2 triangles. 5 base points give 10 triangles.",
      },
    ],
    tip: "For data-sufficiency questions, test each piece of information alone first, then together. Look for a triangle that fits the facts but gives a different answer.",
  }),
  "7-CT-8": T({
    intro: "Fractions describe parts of a whole that keeps changing: what is shared, what is left and what happens next. Careful reading of 'of what' is the key.",
    concepts: [
      {
        title: "Fraction of the remainder",
        text: "'1/3 of what is left' is a fraction **of a fraction**: multiply. If 1/4 is used on Monday, 3/4 is left, and 1/3 of that is 1/3 × 3/4 = 1/4 of the whole.",
        fig: { kind: "fraction", shape: "bar", parts: 4, shaded: 1, colour: "orange", alt: "A bar with 1 of 4 parts shaded" },
      },
      {
        title: "Working back to the whole",
        text: "When the final amount is known, find what **fraction of the whole** it is, then divide.",
        example: { q: "Kabir keeps 1/4 of his sweets, gives 2/5 of the rest to Tara and 27 are left for Dev. How many sweets?", steps: ["After keeping 1/4, 3/4 is left. Tara gets 2/5 of it, so 3/5 of 3/4 = 9/20 remains.", "9/20 of the whole = 27, so 1/20 = 3."], answer: "60 sweets" },
      },
      {
        title: "Changes in a full tank",
        text: "If a tank goes from 3/5 full to 4/5 full when 30 litres are added, then 1/5 of the tank is 30 litres, so the tank holds **150 litres**.",
        remember: "Subtract the two fractions to find what fraction the known amount fills.",
      },
      {
        title: "Multiplying and dividing fractions",
        text: "Multiply tops and multiply bottoms: 2/3 × 5/7 = 10/21. Dividing by a fraction is multiplying by its **reciprocal**: 3/4 ÷ 1/2 = 3/4 × 2 = 3/2.",
      },
      {
        title: "Is the information enough?",
        text: "To find a fraction you need parts of the same whole. 'Riya ate 2 more pieces' cannot become a fraction unless you know how many pieces there are.",
      },
    ],
    tip: "Draw a bar for the whole and cut it into the parts as the story goes. Label each piece with its fraction and, when you know it, its amount.",
  }),
};
