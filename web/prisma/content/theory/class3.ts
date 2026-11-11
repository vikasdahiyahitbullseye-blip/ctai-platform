// Class 3 "Learn it" theory, matched to the concepts in Think, Play & Solve Help Book · Class 3.
import { T, type ChapterTheory } from "./types";

export const THEORY3: Record<string, ChapterTheory> = {
  "3-CT-1": T({
    intro: "Number names are made of letters, and letters can be counted, sorted and turned into secret codes.",
    concepts: [
      {
        title: "Letters in number names",
        text: "Every number has a **name**. We can count the letters in it, find its **vowels** (A, E, I, O, U) and its **consonants** (all the other letters).",
        table: [["Name", "Letters", "Vowels"], ["ONE", "3", "O, E"], ["THREE", "5", "E, E"], ["SEVEN", "5", "E, E"], ["EIGHTEEN", "8", "E, I, E, E"]],
        remember: "Count slowly and touch each letter once. Repeated letters count every time they appear.",
      },
      {
        title: "Dictionary order",
        text: "Words are put in **dictionary order** by looking at the first letter. If the first letters are the same, we look at the second letter, and so on.",
        example: { q: "Put FIVE, FOUR and EIGHT in dictionary order.", steps: ["First letters: F, F, E. E comes before F, so EIGHT is first.", "FIVE and FOUR both start with F. Look at the second letter: I comes before O."], answer: "EIGHT, FIVE, FOUR" },
      },
      {
        title: "Caesar cipher: a secret code",
        text: "In a **Caesar cipher** every letter moves forward by the same number of places, called the **shift**. After Z we go back to A, like going round a circle.",
        points: ["To **code** a message, move each letter forward by the shift.", "To **decode**, move each letter back by the same shift.", "The same letter always becomes the same code letter."],
        example: { q: "Code the word CAT with a shift of 2.", steps: ["C → D → E", "A → B → C", "T → U → V"], answer: "ECV" },
        remember: "A shift of 26 brings every letter back to itself, because there are 26 letters.",
      },
      {
        title: "Shape codes and hidden words",
        text: "Sometimes each letter is shown by a **shape** or a picture. Find which shape stands for which letter from a word you know, then use it to read or write new words. Hidden words can also be found by crossing out letters or reading a grid across and down.",
      },
    ],
    tip: "When a puzzle uses a code, first write down what each symbol means in a small table. Then use the table, one letter at a time.",
  }),
  "3-CT-2": T({
    intro: "Toys and objects around us are made of solid shapes. Each solid has faces, edges and corners, and looks different from different sides.",
    concepts: [
      {
        title: "Solid shapes",
        text: "Common solid shapes are the **cube**, **cuboid**, **cylinder**, **cone**, **sphere** and **pyramid**.",
        table: [["Solid", "Example", "Can it roll?"], ["Cube", "Dice", "No"], ["Cylinder", "Tin can", "Yes, on its curved side"], ["Cone", "Party cap", "Yes, in a circle"], ["Sphere", "Ball", "Yes, every way"]],
      },
      {
        title: "Faces, edges and corners",
        text: "A **face** is a flat or curved surface. An **edge** is where two faces meet. A **corner** (vertex) is where edges meet.",
        table: [["Solid", "Faces", "Edges", "Corners"], ["Cube", "6", "12", "8"], ["Square pyramid", "5", "8", "5"], ["Triangular prism (tent)", "5", "9", "6"]],
        remember: "Solids with flat faces can be stacked. Solids with a curved surface can roll. A cylinder can do both!",
      },
      {
        title: "Counting cubes",
        text: "To count cubes in a stack, count **one layer or one tower at a time**. Some cubes are hidden behind or under others, so think about them too.",
        fig: { kind: "cubes", heights: [3, 2, 1], colour: "orange", alt: "A staircase of cubes: 3, 2 and 1 high" },
        example: { q: "How many cubes are in this staircase?", steps: ["Count each tower: 3, 2 and 1.", "Add: 3 + 2 + 1."], answer: "6 cubes" },
      },
      {
        title: "Views from different sides",
        text: "The same object looks different from the **front**, the **side** and the **top**. A cone looks like a triangle from the side but a circle from the top. From any one place you can see at most **3 faces** of a cube.",
      },
    ],
    tip: "Imagine walking round the object, or build it with blocks. Ask: what would I see from here?",
  }),
  "3-CT-3": T({
    intro: "Numbers up to 200 can be built with hundreds, tens and ones, and placed on number lines and charts.",
    concepts: [
      {
        title: "Hundreds, tens and ones",
        text: "In a 3-digit number each digit has a **place**. In 175, the 1 means 1 **hundred**, the 7 means 7 **tens** and the 5 means 5 **ones**.",
        fig: { kind: "abacus", labels: ["H", "T", "O"], beads: [1, 7, 5], alt: "An abacus showing 175" },
        remember: "10 ones make 1 ten. 10 tens make 1 hundred. So 12 small cubes are 1 ten and 2 ones.",
      },
      {
        title: "Abacus and moving beads",
        text: "On an abacus each bead on the **Hundreds** rod is worth 100, on the **Tens** rod 10, and on the **Ones** rod 1. Moving one bead from Ones to Tens adds 10 but takes away 1, so the number grows by 9.",
      },
      {
        title: "Number lines and jumps",
        text: "On a **number line** numbers grow to the right. Jumping forward by the same amount each time makes a **pattern**.",
        fig: { kind: "numberline", min: 100, max: 200, step: 10, labelEvery: 2, jumps: { from: 100, size: 30, count: 3, colour: "green", icon: "🐸" }, alt: "A frog jumping 30 at a time from 100" },
        example: { q: "A frog starts at 100 and jumps 30 each time. Does it land on 170?", steps: ["Its landings: 130, 160, 190 …", "170 is not in the list."], answer: "No, it jumps over 170" },
      },
      {
        title: "Number charts and patterns",
        text: "On a number chart with 10 boxes in a row, moving **one box right adds 1** and moving **one box down adds 10**. In a pattern, find the **step** between numbers first, then continue it.",
      },
    ],
    tip: "Say the number out loud in hundreds, tens and ones. It helps you see which digit changes.",
  }),
  "3-CT-4": T({
    intro: "Holiday stories are full of adding and taking away: distances on maps, money, family members and things we count.",
    concepts: [
      {
        title: "Adding and taking away in stories",
        text: "Read the story and decide: are things being **put together** (add) or **taken away / compared** (subtract)? Write what you know before you work it out.",
        example: { q: "A bus starts with 40 people. At the first stop 12 get off and 20 get on. How many are on the bus now?", steps: ["40 − 12 = 28 (people get off)", "28 + 20 = 48 (people get on)"], answer: "48 people" },
      },
      {
        title: "Routes on a map",
        text: "To find the length of a **route**, add the lengths of all its parts. To compare two routes, find each total and subtract.",
      },
      {
        title: "Pictographs",
        text: "A **pictograph** shows data with pictures. Always read the **key** first: one picture may stand for more than one thing.",
        fig: { kind: "pictograph", title: "Bananas eaten", labels: ["Mon", "Tue", "Wed"], counts: [3, 5, 2], icon: "🍌", per: 2, alt: "Pictograph of bananas eaten, key: one picture = 2" },
        remember: "Number = pictures × key. On Tuesday: 5 × 2 = 10 bananas.",
      },
      {
        title: "Family trees and positions",
        text: "A **family tree** shows how people are related. **Cousins** are children of your parents' brothers and sisters. In a line, if you are 5th from one end, there are 4 people before you on that side.",
      },
    ],
    tip: "For long stories, follow the changes one step at a time and write the new total after each step.",
  }),
  "3-CT-5": T({
    intro: "Flat shapes have sides and corners. We can fold them, turn them, count shapes hidden in figures and cover floors with them.",
    concepts: [
      {
        title: "Sides and corners",
        text: "A **triangle** has 3 sides and 3 corners, a **square** and a **rectangle** have 4, a **pentagon** 5 and a **hexagon** 6. A square has 4 equal sides and 4 square corners. A **rhombus** has 4 equal sides but its corners are not square.",
        fig: { kind: "shapes", cols: 4, rows: 1, items: [{ r: 0, c: 0, shape: "triangle", colour: "red" }, { r: 0, c: 1, shape: "square", colour: "blue" }, { r: 0, c: 2, shape: "circle", colour: "green" }, { r: 0, c: 3, shape: "star", colour: "orange" }], alt: "A triangle, a square, a circle and a star" },
      },
      {
        title: "Counting shapes in a figure",
        text: "Big figures hide small shapes. Count **in an organised way**: first the single small shapes, then shapes made of 2 pieces, then 3, and so on.",
        example: { q: "A square is cut by both its diagonals. How many triangles can you see?", steps: ["4 small triangles.", "4 bigger triangles, each made of 2 small ones."], answer: "8 triangles" },
      },
      {
        title: "Turning shapes",
        text: "A **half turn** turns a shape upside down. A **quarter turn** turns it one corner round. The shape stays the same; only its direction changes.",
        fig: { kind: "sequence", frames: [{ kind: "arrow", dir: 0, colour: "purple", alt: "" }, { kind: "arrow", dir: 1, colour: "purple", alt: "" }, { kind: "arrow", dir: 2, colour: "purple", alt: "" }], alt: "An arrow turning a quarter turn each time" },
      },
      {
        title: "Tiling",
        text: "Shapes **tile** a floor if they cover it with **no gaps and no overlaps**. Squares, rectangles, triangles and hexagons tile. Circles cannot, because they leave gaps.",
        remember: "Matchstick squares in a row: 1 square uses 4 sticks, and each new square needs only 3 more.",
      },
    ],
    tip: "Colour or tick each shape as you count it so you never count it twice.",
  }),
  "3-CT-6": T({
    intro: "In 3-digit numbers the place of a digit decides its value. We can make, compare and find numbers from clues.",
    concepts: [
      {
        title: "Place value",
        text: "In 472, 4 is worth **400**, 7 is worth **70** and 2 is worth **2**. 6 hundreds and 4 ones is 604: a **0** keeps the tens place empty.",
        fig: { kind: "abacus", labels: ["H", "T", "O"], beads: [4, 7, 2], alt: "An abacus showing 472" },
      },
      {
        title: "Making the largest and smallest numbers",
        text: "To make the **largest** number, put the biggest digit in the hundreds place, then the next biggest, and so on. For the **smallest**, put the smallest digit first, but a 3-digit number cannot start with 0.",
        example: { q: "Using 5, 0 and 8 once each, make the smallest 3-digit number.", steps: ["0 cannot go first, so start with 5.", "Then the smaller of the rest: 0, then 8."], answer: "508" },
        remember: "Even numbers end in 0, 2, 4, 6 or 8. Odd numbers end in 1, 3, 5, 7 or 9.",
      },
      {
        title: "Comparing numbers",
        text: "Compare **hundreds first**. If they are the same, compare tens, then ones. So 299 is less than 300, even though 9 is bigger than 0.",
      },
      {
        title: "Number clues",
        text: "\"Who am I?\" puzzles give clues about digits. Use **one clue at a time** to cross out numbers that do not fit, until only one is left.",
      },
    ],
    tip: "Write a little H | T | O table and fill it in from the clues.",
  }),
  "3-CT-7": T({
    intro: "When things come in equal groups, we can multiply instead of counting one by one, and share things out equally.",
    concepts: [
      {
        title: "Equal groups and arrays",
        text: "An **array** has equal rows. **Rows × number in each row** gives the total.",
        fig: { kind: "icons", items: Array.from({ length: 12 }, () => ({ icon: "🍬" })), cols: 4, alt: "3 rows of 4 sweets" },
        example: { q: "A box has 3 rows of 4 laddoos. How many laddoos?", steps: ["3 rows, 4 in each row.", "3 × 4 = 12."], answer: "12 laddoos" },
      },
      {
        title: "Skip counting and tables",
        text: "Jumping by the same number on a number line is **skip counting**: 4, 8, 12, 16 … These are the numbers in the table of 4. A number like 12 is in the table of 3 AND the table of 4.",
      },
      {
        title: "Sharing and leftovers",
        text: "**Sharing** splits things into equal groups. Sometimes some are **left over**.",
        example: { q: "40 laddoos go into packs of 6. How many full packs?", steps: ["6 × 6 = 36, 6 × 7 = 42 (too many).", "So 6 full packs, and 40 − 36 = 4 are left over."], answer: "6 full packs, 4 left over" },
        remember: "Multiplying is quick adding of equal groups. Sharing is the opposite.",
      },
    ],
    tip: "Draw the groups as dots or circles. A quick drawing shows you whether to multiply or share.",
  }),
  "3-CT-8": T({
    intro: "A half and a quarter are equal parts of a whole. Fair sharing means everyone gets the same amount.",
    concepts: [
      {
        title: "Halves and quarters",
        text: "A **half** is one of **2 equal parts**. A **quarter** is one of **4 equal parts**. The parts must be the same size.",
        fig: { kind: "sequence", frames: [{ kind: "fraction", shape: "circle", parts: 2, shaded: 1, colour: "orange", alt: "" }, { kind: "fraction", shape: "circle", parts: 4, shaded: 1, colour: "blue", alt: "" }], alt: "A half and a quarter of a circle" },
        remember: "Two quarters make a half. Four quarters make a whole.",
      },
      {
        title: "Half of a number",
        text: "Half of a number of things means sharing them between 2. Half of 64 is 32; half again is 16; half again is 8. A quarter is half of a half.",
        example: { q: "Which is more: half of 30 or a quarter of 40?", steps: ["Half of 30 = 15.", "A quarter of 40 = 40 ÷ 4 = 10."], answer: "Half of 30" },
      },
      {
        title: "Folding and symmetry",
        text: "If a shape can be **folded** so that both parts match exactly, the fold line is a **line of symmetry**. Each part is a half. A cut on folded paper appears on **both** halves when you open it.",
      },
    ],
    tip: "To check if parts are halves, ask: are they exactly the same size? Fold or draw to check.",
  }),
  "3-CT-9": T({
    intro: "We can add and subtract 3-digit numbers by place, estimate answers, and solve number puzzles.",
    concepts: [
      {
        title: "Adding and subtracting by place",
        text: "Add or subtract the **ones**, then the **tens**, then the **hundreds**. If the ones add up to 10 or more, carry 1 ten. If you cannot take away, borrow 1 ten.",
        example: { q: "425 children: 178 go by bus. How many walk?", steps: ["425 − 178: ones 15 − 8 = 7 (borrow).", "Tens 11 − 7 = 4 (borrow). Hundreds 3 − 1 = 2."], answer: "247 walk" },
      },
      {
        title: "Estimating",
        text: "To **estimate**, round each number to the nearest ten or hundred and add. 298 + 207 is close to 300 + 200 = 500. Estimating helps check if an answer makes sense.",
      },
      {
        title: "Number puzzles",
        text: "In **number pyramids** each block is the sum of the two blocks below it. In **missing-digit sums**, work column by column from the ones. **Working backwards** undoes each step: if you added 150, take 150 away.",
        remember: "Adding any two odd numbers gives an even number. Adding three odd numbers gives an odd number.",
      },
    ],
    tip: "After any sum, check by doing the opposite: subtract to check an addition, add to check a subtraction.",
  }),
  "3-CT-10": T({
    intro: "We measure length and height to compare things, put them in order and solve problems.",
    concepts: [
      {
        title: "Measuring length",
        text: "Length is measured in **centimetres (cm)** and **metres (m)**. 1 m = 100 cm. On a ruler, start measuring from **0**.",
        fig: { kind: "ruler", cm: 8, start: 0, length: 6, colour: "yellow", alt: "A pencil 6 cm long on a ruler" },
      },
      {
        title: "Comparing and ordering",
        text: "If Raj is taller than Sam and Sam is taller than Tom, then **Raj is taller than Tom**. Put clues in a line from shortest to tallest to see the order.",
        remember: "Taller than, shorter than: draw the people in a line and place each clue.",
      },
      {
        title: "Cuts and gaps",
        text: "Cutting a 60 cm cake into 12 cm pieces makes 5 pieces but needs only **4 cuts**: the last piece needs no cut. Flags along a rope need one more flag than gaps if there is a flag at both ends.",
        example: { q: "Flags every 30 cm along a 1 m 50 cm rope, with a flag at each end. How many flags?", steps: ["150 cm ÷ 30 cm = 5 gaps.", "Flags = gaps + 1."], answer: "6 flags" },
      },
      {
        title: "Positions in a row",
        text: "If Aman is 4th from the left and 3rd from the right, the row has 4 + 3 − 1 = **6** children: Aman is counted twice, so take away 1.",
      },
    ],
    tip: "Draw a quick line or row of dots. Many length puzzles become easy when you can see them.",
  }),
  "3-CT-11": T({
    intro: "Weight tells how heavy something is; capacity tells how much a container holds.",
    concepts: [
      {
        title: "Balances",
        text: "When a **balance** is level, both sides weigh the **same**. The heavier side goes down.",
        fig: { kind: "balance", left: { icon: "🍎", n: 2 }, right: [200], unit: "g", alt: "Two apples balance 200 g" },
        example: { q: "Two equal apples balance 200 g. How heavy is one apple?", steps: ["2 apples = 200 g.", "1 apple = 200 ÷ 2."], answer: "100 g" },
      },
      {
        title: "Kilograms and grams",
        text: "Weight is measured in **kilograms (kg)** and **grams (g)**. **1 kg = 1000 g**. 1 kg of cotton weighs exactly the same as 1 kg of iron: it is just bigger.",
      },
      {
        title: "Litres and millilitres",
        text: "Capacity is measured in **litres (L)** and **millilitres (mL)**. **1 L = 1000 mL**, so a 1-litre jug fills four 250 mL glasses.",
        fig: { kind: "jug", max: 1000, step: 100, labelEvery: 1, level: 750, unit: "ml", alt: "A jug with 750 mL of water" },
        remember: "Things that weigh the same can look different sizes, and big containers can hold little.",
      },
      {
        title: "Comparing with chains",
        text: "If a cat weighs as much as 4 rabbits and a dog as much as 3 cats, then a dog weighs as much as 3 × 4 = **12 rabbits**.",
      },
    ],
    tip: "With balance puzzles, take the same thing off both sides. The balance stays level.",
  }),
  "3-CT-12": T({
    intro: "Money is used to buy, pay and give change. We also exchange and share things fairly.",
    concepts: [
      {
        title: "Paying and change",
        text: "**Change = money given − cost**. You can also count up from the cost to the money given.",
        fig: { kind: "money", items: [50, 20, 10, 5], alt: "₹50, ₹20, ₹10 and ₹5" },
        example: { q: "Riya buys things costing ₹37 and ₹28 and pays with ₹100. What change does she get?", steps: ["Total: 37 + 28 = ₹65.", "Change: 100 − 65 = ₹35."], answer: "₹35" },
      },
      {
        title: "Making amounts",
        text: "The same amount can be made in different ways. ₹10 can be ₹5 + ₹5, or ₹2 + ₹2 + ₹2 + ₹2 + ₹2. List the ways in order so you do not miss any.",
      },
      {
        title: "Giving and getting",
        text: "When one person **gives** to another, one total goes **down** and the other goes **up** by the same amount. If Aman gives Bina 5 cards and they become equal, Aman had 10 more cards than Bina at the start.",
        remember: "When everyone in a circle gives 2 to the next person at the same time, everyone still has the same amount!",
      },
    ],
    tip: "Write each person's amount after every exchange in a small table.",
  }),
  "3-CT-13": T({
    intro: "Clocks, calendars and timetables help us know when things happen and how long they take.",
    concepts: [
      {
        title: "Reading a clock",
        text: "The **short hand** shows the hour. The **long hand** shows the minutes: each number means 5 minutes. **Quarter past 6** is 6:15, **half past** is :30, **quarter to 7** is 6:45.",
        fig: { kind: "clock", h: 6, m: 15, alt: "A clock showing quarter past 6" },
        remember: "The minute hand goes all the way round once every hour.",
      },
      {
        title: "Time taken",
        text: "To find how long something takes, count forward from the start: first to the next hour, then whole hours, then the minutes.",
        example: { q: "A train leaves at 10:50 and arrives at 1:20. How long is the journey?", steps: ["10:50 → 11:00 is 10 minutes.", "11:00 → 1:00 is 2 hours.", "1:00 → 1:20 is 20 minutes."], answer: "2 hours 30 minutes" },
      },
      {
        title: "Calendars",
        text: "A week has **7 days**, so the same day of the week comes back every 7 dates. Months have 30 or 31 days, except **February** (28, or 29 in a leap year).",
        fig: { kind: "calendar", month: "March", start: 3, days: 31, marks: [{ d: 20, colour: "purple" }], alt: "A March calendar" },
        example: { q: "Today is Tuesday. What day will it be after 10 days?", steps: ["7 days later is Tuesday again.", "3 more days: Wednesday, Thursday, Friday."], answer: "Friday" },
      },
    ],
    tip: "For 'after many days' questions, take away full weeks of 7 first.",
  }),
  "3-CT-14": T({
    intro: "At the fair we use maps, directions, mirror images and symmetry.",
    concepts: [
      {
        title: "Grid maps",
        text: "A grid map names each box by its **column letter** and **row number**, like C2. To walk from one box to another, count the boxes across and down.",
        fig: { kind: "gridmap", rows: 4, cols: 4, compass: true, items: [{ r: 0, c: 0, icon: "🚪" }, { r: 1, c: 2, icon: "🎡" }, { r: 3, c: 3, icon: "🎈" }], alt: "A fair map on a grid" },
      },
      {
        title: "Directions and turns",
        text: "On a map, **North** is up. Facing North, a **right turn** makes you face East; two right turns make you face South. A right turn is a quarter turn **clockwise**.",
        remember: "North, East, South, West go clockwise: Never Eat Soggy Waffles!",
      },
      {
        title: "Mirror images",
        text: "A **mirror** swaps left and right but keeps top and bottom. In still **water**, a picture is flipped upside down.",
        fig: { kind: "pixels", n: 3, cells: [[0, 0, "blue"], [1, 0, "blue"], [1, 1, "red"], [2, 0, "blue"]], mirror: "right", alt: "A picture next to a mirror" },
      },
      {
        title: "Lines of symmetry",
        text: "A shape has a **line of symmetry** if both sides of the line match. A square has 4, an equilateral triangle has 3, a rectangle has 2, and a circle has many.",
      },
    ],
    tip: "To check a mirror image, hold a small mirror (or imagine one) on the line and look.",
  }),
};
