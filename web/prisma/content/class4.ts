// Original Hitbullseye items, Class 4. CT chapters follow the CBSE Class 4 handbook (NCERT Maths chapter order);
// EVS items are theme worksheets (CURRICULUM[4].EVS). Aligned to Class 4 learning outcomes: moderate multi-clue problems,
// patterns with one or more changes, mirror images, grid/direction paths, ordering by attributes.
import type { SeedQuestion } from "./types";

const ANIMALS = "| Animal | Number in the reserve |\n|---|---|\n| Elephants | 48 |\n| Tigers | 12 |\n| Leopards | 30 |";
const FRUIT = "| Fruit | Children |\n|---|---|\n| Mango | 9 |\n| Banana | 6 |\n| Apple | 4 |\n| Guava | 5 |";

export const class4: SeedQuestion[] = [
  // Ch 1 — Shapes Around Us
  { ch: 1, skills: ["ABSTRACT"], type: "MCQ", d: 1, stem: "A cylinder (like a tin can) is cut straight across, parallel to its flat top. What shape is the cut face?", options: ["Square", "Circle", "Triangle", "Rectangle"], answer: 1, solution: "Every slice across a cylinder, parallel to the top, is the same shape as the top — a circle." },
  { ch: 1, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 1, stem: "How many **edges** does a cube have?", answer: 12, solution: "4 edges around the top, 4 around the bottom and 4 standing upright: 4 + 4 + 4 = 12." },
  { ch: 1, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 2, stem: "How many **corners** (vertices) does a cuboid box have?", answer: 8, solution: "4 corners on the top face and 4 on the bottom face: 8 corners." },
  { ch: 1, skills: ["ABSTRACT", "DECOMPOSITION"], type: "MCQ", d: 2, stem: "I have 5 faces: **2 triangles** and **3 rectangles**. What am I?", options: ["Cube", "Triangular prism", "Square pyramid", "Cylinder"], answer: 1, solution: "A triangular prism has a triangle at each end joined by 3 rectangles. A square pyramid has 1 square and 4 triangles." },
  { ch: 1, skills: ["ABSTRACT"], type: "MCQ", d: 2, stem: "How many faces does a **square-based pyramid** have?", options: ["4", "5", "6", "8"], answer: 1, solution: "1 square base + 4 triangular faces = 5 faces." },
  { ch: 1, skills: ["DECOMPOSITION", "EVALUATION"], type: "NUMERIC", d: 2, stem: "On a dice, the dots on **opposite faces always add up to 7**. If the top face shows 2, how many dots are on the bottom face?", answer: 5, solution: "Top and bottom are opposite faces, so they add to 7. 7 − 2 = 5." },
  { ch: 1, skills: ["ABSTRACT", "DECOMPOSITION"], type: "NUMERIC", d: 3, stem: "Small cubes are glued together to make a big cube that is **3 cubes long, 3 cubes wide and 3 cubes tall**. How many small cubes are used?", answer: 27, solution: "One layer has 3 × 3 = 9 cubes. There are 3 layers: 9 × 3 = 27.", hint: "Count one layer first." },
  { ch: 1, skills: ["ABSTRACT", "DECOMPOSITION"], type: "NUMERIC", d: 3, stem: "Riya stacks **3 cubes** in a tower on a table. How many faces of the small cubes can be seen from all sides and from above? (Faces that touch the table or another cube cannot be seen.)", answer: 13, solution: "3 cubes have 3 × 6 = 18 faces. Hidden: the bottom face on the table (1) and the faces where cubes touch (2 places × 2 faces = 4). 18 − 5 = 13." },

  // Ch 2 — Hide and Seek
  { ch: 2, skills: ["ABSTRACT"], type: "MCQ", d: 1, stem: "A birthday cap (a cone) stands on its round base. You look at it from **straight above**. What shape do you see?", options: ["Triangle", "Circle", "Square", "Rectangle"], answer: 1, solution: "From above you see the round base — a circle (with the tip as a dot in the middle)." },
  { ch: 2, skills: ["ABSTRACT"], type: "MCQ", d: 1, stem: "A tin can stands on the table. From the **front** it looks like a …", options: ["Circle", "Rectangle", "Triangle", "Star"], answer: 1, solution: "From the side a cylinder shows straight top and bottom edges and straight sides — a rectangle." },
  { ch: 2, skills: ["ABSTRACT", "EVALUATION"], type: "MCQ", d: 2, stem: "Which object looks like a **circle** from the top **and** a **circle** from the front?", options: ["A ball", "A glass", "A book", "An ice-cream cone"], answer: 0, solution: "A ball (sphere) looks like a circle from every direction. A glass looks like a rectangle from the front." },
  { ch: 2, skills: ["ALGORITHMIC"], type: "MCQ", d: 2, stem: "5 children stand in a row. Ravi is **3rd from the left**. What is his position from the right?", options: ["2nd", "3rd", "4th", "5th"], answer: 1, solution: "There are 2 children on his left and 5 − 3 = 2 on his right, so he is also 3rd from the right." },
  { ch: 2, skills: ["PATTERN", "ALGORITHMIC"], type: "NUMERIC", d: 2, stem: "In hide and seek, the seeker counts **2, 4, 6, …** up to **40**. How many numbers does she say?", answer: 20, solution: "She says every even number from 2 to 40: that is 40 ÷ 2 = 20 numbers." },
  { ch: 2, skills: ["DECOMPOSITION", "ALGORITHMIC"], type: "NUMERIC", d: 3, stem: "In a queue, Mini is **6th from the front** and **4th from the back**. How many children are in the queue?", answer: 9, solution: "5 children are in front of her and 3 behind her. 5 + 1 + 3 = 9.", hint: "Count the children in front and behind, then add Mini." },
  { ch: 2, skills: ["ABSTRACT"], type: "MCQ", d: 3, stem: "4 cubes are placed as a 2 × 2 square on the table, and **1 more cube** is placed on top of one of them. Looking from **straight above**, how many squares do you see?", options: ["3", "4", "5", "1"], answer: 1, solution: "The top cube sits exactly over one bottom cube and hides it, so you still see 4 squares." },
  { ch: 2, skills: ["ABSTRACT"], type: "TRUE_FALSE", d: 1, stem: "True or false: a book lying flat on a table looks like a thin rectangle from the side.", answer: true, solution: "From the side you see only its thickness and length — a thin rectangle." },

  // Ch 3 — Patterns Around Us
  { ch: 3, skills: ["PATTERN"], type: "NUMERIC", d: 1, stem: "What comes next?\n\n4, 8, 12, 16, ___", answer: 20, solution: "Add 4 each time: 16 + 4 = 20." },
  { ch: 3, skills: ["PATTERN"], type: "MCQ", d: 1, stem: "What comes next?\n\n🔴 🔵 🔵 🔴 🔵 🔵 🔴 ___", options: ["🔴", "🔵", "🟢", "🟡"], answer: 1, solution: "The group 🔴 🔵 🔵 repeats. After 🔴 comes 🔵." },
  { ch: 3, skills: ["PATTERN"], type: "NUMERIC", d: 2, stem: "What comes next?\n\n1, 2, 4, 8, 16, ___", answer: 32, solution: "Each number is double the one before: 16 × 2 = 32." },
  { ch: 3, skills: ["PATTERN"], type: "MCQ", d: 2, stem: "What comes next?\n\nA, C, E, G, ___", options: ["H", "I", "J", "K"], answer: 1, solution: "Skip one letter each time: A (B) C (D) E (F) G (H) I." },
  { ch: 3, skills: ["PATTERN"], type: "NUMERIC", d: 2, stem: "What comes next?\n\n5, 6, 8, 11, 15, ___", answer: 20, solution: "The gaps are 1, 2, 3, 4, so the next gap is 5. 15 + 5 = 20.", hint: "Look at how much is added each time." },
  { ch: 3, skills: ["PATTERN", "DECOMPOSITION"], type: "NUMERIC", d: 3, stem: "What comes next?\n\n1, 10, 2, 20, 3, 30, ___", answer: 4, solution: "Two patterns take turns: 1, 2, 3, … and 10, 20, 30, …. After 30 comes the next number of the first pattern: 4." },
  { ch: 3, skills: ["PATTERN", "GENERALISATION"], type: "NUMERIC", d: 3, stem: "Row 1 has 1 star, row 2 has 3 stars, row 3 has 5 stars. The pattern continues. How many stars are in **row 6**?", answer: 11, solution: "Each row has 2 more stars: 1, 3, 5, 7, 9, 11. Row 6 has 11 stars." },
  { ch: 3, skills: ["PATTERN", "GENERALISATION"], type: "TRUE_FALSE", d: 1, stem: "True or false: in the pattern 3, 6, 9, 12, … every number is a multiple of 3.", answer: true, solution: "Each number is 3 × 1, 3 × 2, 3 × 3, … so all are multiples of 3." },

  // Ch 4 — Thousands Around Us
  { ch: 4, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 1, stem: "Which number has **3 thousands, 4 hundreds, 0 tens and 7 ones**?", answer: 3407, solution: "3000 + 400 + 0 + 7 = 3407." },
  { ch: 4, skills: ["ALGORITHMIC"], type: "NUMERIC", d: 1, stem: "What is **1 more** than 2,999?", answer: 3000, solution: "2,999 + 1 = 3,000. All the 9s roll over." },
  { ch: 4, skills: ["DECOMPOSITION"], type: "MCQ", d: 2, stem: "In **5,280**, what is the value of the digit **2**?", options: ["2", "20", "200", "2000"], answer: 2, solution: "2 is in the hundreds place, so its value is 200." },
  { ch: 4, skills: ["ALGORITHMIC"], type: "ORDER", d: 2, stem: "Arrange from **smallest to largest**.", options: ["4,050", "4,500", "4,005", "5,040"], answer: [2, 0, 1, 3], solution: "Compare thousands first (4, 4, 4, 5), then hundreds: 4,005 < 4,050 < 4,500 < 5,040." },
  { ch: 4, skills: ["DECOMPOSITION", "ABSTRACT"], type: "NUMERIC", d: 2, stem: "Make the **largest** 4-digit number using **3, 0, 8, 1** (each once).", answer: 8310, solution: "Put the biggest digit in the thousands place and go down: 8, 3, 1, 0 → 8310." },
  { ch: 4, skills: ["DECOMPOSITION", "EVALUATION"], type: "NUMERIC", d: 3, stem: "Make the **smallest** 4-digit number using **3, 0, 8, 1** (each once).", answer: 1038, solution: "A 4-digit number cannot start with 0, so start with 1, then the smallest of the rest: 1, 0, 3, 8 → 1038.", hint: "Can a 4-digit number start with 0?" },
  { ch: 4, skills: ["DECOMPOSITION"], type: "MCQ", d: 3, stem: "A 4-digit number:\n- its thousands digit is 2,\n- its hundreds digit is **double** the thousands digit,\n- its tens digit is **1 less** than the hundreds digit,\n- its ones digit is 0.\n\nWhat is the number?", options: ["2430", "2340", "2420", "4230"], answer: 0, solution: "Thousands 2; hundreds 2 × 2 = 4; tens 4 − 1 = 3; ones 0 → 2430." },
  { ch: 4, skills: ["PATTERN"], type: "NUMERIC", d: 2, stem: "What comes next?\n\n1000, 1250, 1500, 1750, ___", answer: 2000, solution: "Add 250 each time: 1750 + 250 = 2000." },

  // Ch 5 — Sharing and Measuring
  { ch: 5, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 1, stem: "A roti is cut into **4 equal pieces**. Ali eats 1 piece. How many pieces are left?", answer: 3, solution: "4 − 1 = 3 pieces (three quarters) are left." },
  { ch: 5, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 1, stem: "What is **half** of 12 laddoos?", answer: 6, solution: "Half means 2 equal shares: 12 ÷ 2 = 6." },
  { ch: 5, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 2, stem: "What is **a quarter** of 20 pencils?", answer: 5, solution: "A quarter means 4 equal shares: 20 ÷ 4 = 5." },
  { ch: 5, skills: ["EVALUATION", "ABSTRACT"], type: "MCQ", d: 2, stem: "Which is bigger: **half** of a chapati or **a quarter** of the same chapati?", options: ["Half", "Quarter", "Both are the same", "We can't tell"], answer: 0, solution: "A half is 2 quarters, so half is bigger." },
  { ch: 5, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 2, stem: "24 sweets are shared **equally** among 3 friends. How many sweets does each friend get?", answer: 8, solution: "24 ÷ 3 = 8." },
  { ch: 5, skills: ["DECOMPOSITION", "ALGORITHMIC"], type: "NUMERIC", d: 3, stem: "Meena has 16 marbles. She gives **half** to Raju. Then she gives **a quarter of what is left** to Sita. How many marbles does Meena have now?", answer: 6, solution: "Half of 16 is 8, so 8 are left. A quarter of 8 is 2. 8 − 2 = 6.", hint: "Do one step at a time." },
  { ch: 5, skills: ["ABSTRACT", "ALGORITHMIC"], type: "MCQ", d: 3, stem: "A sheet of paper is folded **in half**, then **in half again**. When you open it, into how many equal parts is it divided?", options: ["2", "3", "4", "8"], answer: 2, solution: "The first fold makes 2 parts; folding again doubles them to 4." },
  { ch: 5, skills: ["EVALUATION"], type: "TRUE_FALSE", d: 2, stem: "True or false: if a pizza is cut into 4 pieces that are **not equal**, each piece is one quarter.", answer: false, solution: "Quarters must be 4 **equal** parts. Unequal pieces are not quarters." },

  // Ch 6 — Measuring Length
  { ch: 6, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 1, stem: "1 metre = how many **centimetres**?", answer: 100, solution: "1 m = 100 cm." },
  { ch: 6, skills: ["EVALUATION"], type: "MCQ", d: 1, stem: "Which unit is best for measuring the length of a pencil?", options: ["Centimetre", "Metre", "Kilometre", "Kilogram"], answer: 0, solution: "A pencil is short, so centimetres fit best. Kilogram measures weight, not length." },
  { ch: 6, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 2, stem: "A ribbon is 1 m long. 35 cm is used for a gift. How many **centimetres** are left?", answer: 65, solution: "1 m = 100 cm. 100 − 35 = 65 cm." },
  { ch: 6, skills: ["ALGORITHMIC"], type: "ORDER", d: 2, stem: "Arrange from **shortest to longest**.", options: ["2 m", "150 cm", "90 cm", "1 m 20 cm"], answer: [2, 3, 1, 0], solution: "Change all to cm: 200, 150, 90, 120. Order: 90 cm, 1 m 20 cm, 150 cm, 2 m." },
  { ch: 6, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 2, stem: "An ant walks **25 cm every minute**. How many centimetres does it walk in 4 minutes?", answer: 100, solution: "25 × 4 = 100 cm (that is 1 metre)." },
  { ch: 6, skills: ["ALGORITHMIC", "EVALUATION"], type: "MCQ", d: 2, stem: "Raj is taller than Sam. Sam is taller than Tia. Who is the **shortest**?", options: ["Raj", "Sam", "Tia", "We can't tell"], answer: 2, solution: "Raj > Sam > Tia, so Tia is the shortest." },
  { ch: 6, skills: ["DECOMPOSITION", "GENERALISATION"], type: "NUMERIC", d: 3, stem: "Fence posts are put **2 m apart** in a straight line **10 m long**, with a post at **both ends**. How many posts are there?", answer: 6, solution: "10 ÷ 2 = 5 gaps. With a post at each end there is one more post than gaps: 6.", hint: "Draw it! Count the gaps and the posts." },
  { ch: 6, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 3, stem: "A rope is **3 m** long. How many pieces of **50 cm** can be cut from it?", answer: 6, solution: "3 m = 300 cm. 300 ÷ 50 = 6 pieces." },

  // Ch 7 — The Cleanest Village
  { ch: 7, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 1, stem: "Volunteers collected **245 kg** of waste on Monday and **132 kg** on Tuesday. How much in total?", answer: 377, solution: "245 + 132 = 377 kg." },
  { ch: 7, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 1, stem: "The village wants to plant **500** saplings. **275** are planted. How many more are needed?", answer: 225, solution: "500 − 275 = 225." },
  { ch: 7, skills: ["ALGORITHMIC", "PATTERN"], type: "NUMERIC", d: 2, stem: "On Day 1 the team collects **40 kg** of waste. Each day they collect **15 kg more** than the day before. How much do they collect on **Day 4**?", answer: 85, solution: "Day 1: 40, Day 2: 55, Day 3: 70, Day 4: 85 kg." },
  { ch: 7, skills: ["DECOMPOSITION", "EVALUATION"], type: "MCQ", d: 2, stem: "Where should a **banana peel** go?", options: ["Green bin (wet waste)", "Blue bin (dry waste)", "Red bin (medical waste)", "On the road"], answer: 0, solution: "A banana peel is wet (food) waste, so it goes in the green bin and can become compost." },
  { ch: 7, skills: ["DECOMPOSITION"], type: "MULTI", d: 2, stem: "Which of these are **dry waste**? Choose all that apply.", options: ["Newspaper", "Vegetable peels", "Plastic bottle", "Leftover rice"], answer: [0, 2], solution: "Newspaper and plastic bottles are dry waste. Peels and leftover rice are wet (food) waste." },
  { ch: 7, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 3, stem: "Waste collected by wards:\n\n| Ward | Waste (kg) |\n|---|---|\n| A | 120 |\n| B | 95 |\n| C | 140 |\n\nHow much **more** did the ward with the most waste collect than the ward with the least?", answer: 45, solution: "Most: C (140). Least: B (95). 140 − 95 = 45 kg." },
  { ch: 7, skills: ["ALGORITHMIC", "DECOMPOSITION"], type: "NUMERIC", d: 3, stem: "One digit is missing:\n\n4☐6 + 237 = 683\n\nWhat is the missing digit?", answer: 4, solution: "683 − 237 = 446, so the number is 446 and the missing digit is 4." },
  { ch: 7, skills: ["PATTERN"], type: "NUMERIC", d: 1, stem: "Dustbins along a road are numbered 10, 20, 30, … What is the number on the **7th** dustbin?", answer: 70, solution: "Each number is 10 × its position: 10 × 7 = 70." },

  // Ch 8 — Weigh It, Pour It
  { ch: 8, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 1, stem: "1 kg = how many **grams**?", answer: 1000, solution: "1 kg = 1000 g." },
  { ch: 8, skills: ["EVALUATION"], type: "MCQ", d: 1, stem: "Which is the **heaviest**?", options: ["250 g", "1 kg", "700 g", "900 g"], answer: 1, solution: "1 kg = 1000 g, which is more than 900 g, 700 g or 250 g." },
  { ch: 8, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 2, stem: "A bucket holds **10 litres**. A mug holds **500 mL**. How many mugs fill the bucket?", answer: 20, solution: "10 L = 10,000 mL. 10,000 ÷ 500 = 20 mugs (2 mugs make 1 litre)." },
  { ch: 8, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 2, stem: "A bag has **2 kg** of rice. **750 g** is cooked. How many **grams** are left?", answer: 1250, solution: "2 kg = 2000 g. 2000 − 750 = 1250 g." },
  { ch: 8, skills: ["EVALUATION", "ABSTRACT"], type: "TRUE_FALSE", d: 2, stem: "True or false: 1 kg of cotton is lighter than 1 kg of iron.", answer: false, solution: "Both weigh exactly 1 kg. Cotton just takes up more space." },
  { ch: 8, skills: ["DECOMPOSITION", "ABSTRACT"], type: "NUMERIC", d: 3, stem: "On a balance:\n- 3 apples balance 1 melon.\n- 1 melon balances 6 bananas.\n\nHow many bananas balance **1 apple**?", answer: 2, solution: "3 apples = 6 bananas, so 1 apple = 6 ÷ 3 = 2 bananas.", hint: "Both 3 apples and 6 bananas balance the same melon." },
  { ch: 8, skills: ["ALGORITHMIC"], type: "NUMERIC", d: 3, stem: "You have a **3-litre jug** and a **5-litre jug**. Fill the 5-litre jug, then pour from it into the 3-litre jug until the 3-litre jug is full. How many litres are left in the 5-litre jug?", answer: 2, solution: "5 − 3 = 2 litres stay in the big jug. This is how you can measure 2 L with only these two jugs!" },
  { ch: 8, skills: ["ALGORITHMIC"], type: "ORDER", d: 2, stem: "Arrange from **lightest to heaviest**.", options: ["1 kg", "800 g", "1 kg 200 g", "950 g"], answer: [1, 3, 0, 2], solution: "In grams: 1000, 800, 1200, 950. Order: 800 g, 950 g, 1 kg, 1 kg 200 g." },

  // Ch 9 — Equal Groups
  { ch: 9, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 1, stem: "There are **5 packets** with **4 biscuits** in each. How many biscuits in all?", answer: 20, solution: "5 groups of 4: 5 × 4 = 20." },
  { ch: 9, skills: ["PATTERN"], type: "NUMERIC", d: 1, stem: "What comes next?\n\n6, 12, 18, 24, ___", answer: 30, solution: "These are multiples of 6: 24 + 6 = 30." },
  { ch: 9, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 2, stem: "An auto rickshaw has 3 wheels. How many wheels do **7 autos** have?", answer: 21, solution: "7 × 3 = 21." },
  { ch: 9, skills: ["DECOMPOSITION", "EVALUATION"], type: "MCQ", d: 2, stem: "Which one is **NOT** equal to 24?", options: ["3 × 8", "4 × 6", "2 × 12", "5 × 5"], answer: 3, solution: "3 × 8, 4 × 6 and 2 × 12 are all 24. 5 × 5 = 25." },
  { ch: 9, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 2, stem: "Chairs are placed in **6 rows** with **9 chairs** in each row. How many chairs?", answer: 54, solution: "6 × 9 = 54." },
  { ch: 9, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 2, stem: "A spider has 8 legs and an ant has 6 legs. How many legs do **2 spiders and 3 ants** have together?", answer: 34, solution: "2 × 8 = 16 and 3 × 6 = 18. 16 + 18 = 34." },
  { ch: 9, skills: ["DECOMPOSITION", "ALGORITHMIC"], type: "NUMERIC", d: 3, stem: "12 chairs must be arranged in **equal rows**, with **at least 2 rows** and **at least 2 chairs in each row**. (2 rows of 6 and 6 rows of 2 count as different.) How many ways are there?", answer: 4, solution: "Pairs that multiply to 12 using numbers 2 or more: 2 × 6, 3 × 4, 4 × 3, 6 × 2. That is 4 ways." },
  { ch: 9, skills: ["DECOMPOSITION", "ABSTRACT"], type: "NUMERIC", d: 3, stem: "There are some tricycles (3 wheels) and bicycles (2 wheels). There are **5 cycles** and **13 wheels** in all. How many are **tricycles**?", answer: 3, solution: "If all 5 were bicycles: 10 wheels. 3 wheels are extra and each tricycle adds 1 extra wheel, so there are 3 tricycles. Check: 3 × 3 + 2 × 2 = 13." },

  // Ch 10 — Elephants, Tigers, and Leopards
  { ch: 10, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 1, stem: `${ANIMALS}\n\nHow many animals are there in all?`, answer: 90, solution: "48 + 12 + 30 = 90." },
  { ch: 10, skills: ["DECOMPOSITION"], type: "MCQ", d: 1, stem: `${ANIMALS}\n\nWhich animal has the **fewest** in the reserve?`, options: ["Elephants", "Tigers", "Leopards", "All the same"], answer: 1, solution: "12 tigers is less than 30 leopards and 48 elephants." },
  { ch: 10, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 2, stem: `${ANIMALS}\n\nHow many **more** elephants are there than tigers?`, answer: 36, solution: "48 − 12 = 36." },
  { ch: 10, skills: ["DECOMPOSITION", "ABSTRACT"], type: "NUMERIC", d: 2, stem: `${ANIMALS}\n\nThe number of elephants is how many **times** the number of tigers?`, answer: 4, solution: "48 ÷ 12 = 4, so there are 4 times as many elephants." },
  { ch: 10, skills: ["DECOMPOSITION", "EVALUATION"], type: "TRUE_FALSE", d: 2, stem: `${ANIMALS}\n\nTrue or false: there are **more than twice** as many leopards as tigers.`, answer: true, solution: "Twice the tigers is 2 × 12 = 24. There are 30 leopards, which is more than 24." },
  { ch: 10, skills: ["DECOMPOSITION", "ALGORITHMIC"], type: "NUMERIC", d: 3, stem: `${ANIMALS}\n\nNext year the tigers **increase by 3** and the leopards **decrease by 5**. How many tigers and leopards will there be together?`, answer: 40, solution: "Tigers: 12 + 3 = 15. Leopards: 30 − 5 = 25. 15 + 25 = 40." },
  { ch: 10, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 2, stem: "An elephant eats about **150 kg** of food a day. How much does it eat in **4 days**?", answer: 600, solution: "150 × 4 = 600 kg." },
  { ch: 10, skills: ["ALGORITHMIC"], type: "ORDER", d: 1, stem: `${ANIMALS}\n\nArrange the animals from **fewest to most**.`, options: ["Elephants", "Tigers", "Leopards"], answer: [1, 2, 0], solution: "Tigers 12, Leopards 30, Elephants 48." },

  // Ch 11 — Fun with Symmetry
  { ch: 11, skills: ["ABSTRACT"], type: "MCQ", d: 1, stem: "Which letter has a **line of symmetry** down its middle (left half matches right half)?", options: ["A", "F", "G", "J"], answer: 0, solution: "A's left and right halves match. F, G and J do not." },
  { ch: 11, skills: ["ABSTRACT"], type: "NUMERIC", d: 2, stem: "How many lines of symmetry does a **square** have?", answer: 4, solution: "2 lines through the middles of opposite sides and 2 along the diagonals: 4." },
  { ch: 11, skills: ["ABSTRACT"], type: "MCQ", d: 2, stem: "You hold a mirror beside a letter. Which letter looks **the same** in the mirror?", options: ["M", "R", "S", "Z"], answer: 0, solution: "M has a vertical line of symmetry, so its mirror image is the same. R, S and Z look reversed." },
  { ch: 11, skills: ["ABSTRACT"], type: "NUMERIC", d: 2, stem: "How many lines of symmetry does a **rectangle that is not a square** have?", answer: 2, solution: "One across the middle and one down the middle. The diagonals are not lines of symmetry for a rectangle." },
  { ch: 11, skills: ["ABSTRACT"], type: "MCQ", d: 2, stem: "The word **MOM** is written on a card. You see it in a mirror placed **beside** the card. What do you read?", options: ["MOM", "WOW", "OMO", "MWM"], answer: 0, solution: "M and O are symmetric left–right, and MOM reads the same backwards, so the mirror shows MOM." },
  { ch: 11, skills: ["ABSTRACT", "EVALUATION"], type: "MCQ", d: 3, stem: "You see a clock **in a mirror**. The mirror clock shows the hour hand at **3** and the minute hand at **12**. What is the **real** time?", options: ["3:00", "9:00", "6:00", "12:00"], answer: 1, solution: "A mirror flips left and right. The hand that looks like it points to 3 really points to 9, so the real time is 9:00." },
  { ch: 11, skills: ["ABSTRACT"], type: "MULTI", d: 3, stem: "Digits are written like on a calculator display. Which digits look the same when you flip them **top to bottom**? Choose all that apply.", options: ["0", "2", "3", "8"], answer: [0, 2, 3], solution: "0, 3 and 8 have matching top and bottom halves. 2 does not." },
  { ch: 11, skills: ["ABSTRACT"], type: "TRUE_FALSE", d: 1, stem: "True or false: a circle has many lines of symmetry.", answer: true, solution: "Any line through the centre of a circle is a line of symmetry." },

  // Ch 12 — Ticking Clocks and Turning Calendar
  { ch: 12, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 1, stem: "How many minutes are there in **2 hours**?", answer: 120, solution: "1 hour = 60 minutes, so 2 hours = 120 minutes." },
  { ch: 12, skills: ["ALGORITHMIC"], type: "MCQ", d: 1, stem: "Today is **Monday**. What day will it be **3 days** later?", options: ["Wednesday", "Thursday", "Friday", "Sunday"], answer: 1, solution: "Tuesday (1), Wednesday (2), Thursday (3)." },
  { ch: 12, skills: ["ALGORITHMIC"], type: "MCQ", d: 2, stem: "School starts at **8:30 am** and ends **6 hours** later. When does it end?", options: ["1:30 pm", "2:30 pm", "3:30 pm", "2:00 pm"], answer: 1, solution: "8:30 + 4 hours = 12:30 pm, + 2 more hours = 2:30 pm." },
  { ch: 12, skills: ["PATTERN", "ALGORITHMIC"], type: "MCQ", d: 2, stem: "5 March is a **Friday**. What day is **12 March**?", options: ["Thursday", "Friday", "Saturday", "Sunday"], answer: 1, solution: "12 − 5 = 7 days later. After 7 days we come back to the same day: Friday." },
  { ch: 12, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 2, stem: "How many days are there in **February (not a leap year) and March** together?", answer: 59, solution: "28 + 31 = 59." },
  { ch: 12, skills: ["ALGORITHMIC", "PATTERN"], type: "MCQ", d: 3, stem: "1 June is a **Tuesday**. What day is **30 June**?", options: ["Tuesday", "Wednesday", "Thursday", "Monday"], answer: 1, solution: "30 June is 29 days after 1 June. 29 = 4 weeks + 1 day, so it is one day after Tuesday: Wednesday.", hint: "Every 7 days the weekday repeats." },
  { ch: 12, skills: ["ABSTRACT"], type: "NUMERIC", d: 3, stem: "The minute hand moves from **12** to **9**. How many minutes have passed?", answer: 45, solution: "Each number on the clock is 5 minutes for the minute hand. 9 × 5 = 45 minutes." },
  { ch: 12, skills: ["ALGORITHMIC"], type: "ORDER", d: 2, stem: "Put Aanya's school day in order, **earliest first**.", options: ["Lunch at 1:15 pm", "Assembly at 8:00 am", "Games at 11:30 am", "Home at 3:45 pm"], answer: [1, 2, 0, 3], solution: "8:00 am, 11:30 am, 1:15 pm, 3:45 pm." },

  // Ch 13 — The Transport Museum
  { ch: 13, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 1, stem: "A museum ticket for a child costs **₹40**. How much for **3 children**?", answer: 120, solution: "40 × 3 = ₹120." },
  { ch: 13, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 1, stem: "A bus has **42 seats**. **29** are filled. How many seats are empty?", answer: 13, solution: "42 − 29 = 13." },
  { ch: 13, skills: ["DECOMPOSITION", "ALGORITHMIC"], type: "NUMERIC", d: 2, stem: "Tickets: adult **₹60**, child **₹40**. A family of **2 adults and 2 children** pays with a **₹500** note. How much change do they get?", answer: 300, solution: "Adults: 2 × 60 = 120. Children: 2 × 40 = 80. Total 200. Change: 500 − 200 = ₹300." },
  { ch: 13, skills: ["ALGORITHMIC"], type: "MCQ", d: 2, stem: "A train leaves at **10:45** and the journey takes **1 hour 30 minutes**. When does it arrive?", options: ["11:15", "12:15", "12:45", "11:75"], answer: 1, solution: "10:45 + 1 hour = 11:45. + 30 minutes = 12:15." },
  { ch: 13, skills: ["DECOMPOSITION", "EVALUATION"], type: "MULTI", d: 2, stem: "Which sets of notes and coins make **exactly ₹75**? Choose all that apply.", options: ["₹50 + ₹20 + ₹5", "₹50 + ₹10 + ₹10", "₹20 + ₹20 + ₹20 + ₹10 + ₹5", "₹50 + ₹20 + ₹2"], answer: [0, 2], solution: "50 + 20 + 5 = 75 ✓. 50 + 10 + 10 = 70. 20 + 20 + 20 + 10 + 5 = 75 ✓. 50 + 20 + 2 = 72." },
  { ch: 13, skills: ["DECOMPOSITION", "ABSTRACT"], type: "NUMERIC", d: 3, stem: "The museum has 3 halls with **24 vehicles** in total.\n- Hall 2 has **4 more** vehicles than Hall 1.\n- Hall 3 has **twice** as many as Hall 1.\n\nHow many vehicles are in **Hall 1**?", answer: 5, solution: "Try Hall 1 = 5: Hall 2 = 9, Hall 3 = 10. 5 + 9 + 10 = 24 ✓. (Hall 1 counts 4 times in total plus 4 extra: 4 × 5 + 4 = 24.)", hint: "Guess a number for Hall 1 and check the total." },
  { ch: 13, skills: ["PATTERN", "GENERALISATION"], type: "NUMERIC", d: 3, stem: "Buses leave at 9:00, 9:20, 9:40, … every 20 minutes. How many buses leave from **9:00 to 11:00**, including both times?", answer: 7, solution: "2 hours = 120 minutes = 6 gaps of 20 minutes. There is one more bus than gaps: 7 buses." },
  { ch: 13, skills: ["ABSTRACT"], type: "MCQ", d: 1, stem: "Which vehicle has the **most** wheels?", options: ["Auto rickshaw", "Bicycle", "Car", "A truck with 10 wheels"], answer: 3, solution: "10 is more than 3, 2 or 4." },

  // Ch 14 — Data Handling
  { ch: 14, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 1, stem: `Favourite fruits in Class 4:\n\n${FRUIT}\n\nHow many children were asked?`, answer: 24, solution: "9 + 6 + 4 + 5 = 24." },
  { ch: 14, skills: ["DECOMPOSITION"], type: "MCQ", d: 1, stem: `${FRUIT}\n\nWhich fruit is the **most** popular?`, options: ["Mango", "Banana", "Apple", "Guava"], answer: 0, solution: "Mango has the most votes (9)." },
  { ch: 14, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 2, stem: `${FRUIT}\n\nHow many more children chose Mango than Apple?`, answer: 5, solution: "Mango has 9 and Apple has 4. Subtract to compare: 9 − 4 = 5 more." },
  { ch: 14, skills: ["ABSTRACT", "DECOMPOSITION"], type: "MCQ", d: 2, stem: `${FRUIT}\n\nIn a pictograph, each 🍎 stands for **2 children**. How many 🍎 are drawn for **Banana**?`, options: ["2", "3", "6", "12"], answer: 1, solution: "6 children ÷ 2 per symbol = 3 symbols." },
  { ch: 14, skills: ["DECOMPOSITION", "EVALUATION"], type: "TRUE_FALSE", d: 2, stem: `${FRUIT}\n\nTrue or false: Banana and Guava together have more votes than Mango.`, answer: true, solution: "6 + 5 = 11, which is more than 9." },
  { ch: 14, skills: ["DECOMPOSITION", "EVALUATION"], type: "MCQ", d: 3, stem: `${FRUIT}\n\n6 new children join the class and **all choose Apple**. Which fruit is the most popular now?`, options: ["Mango", "Apple", "Banana", "Guava"], answer: 1, solution: "Apple becomes 4 + 6 = 10, which is more than Mango's 9." },
  { ch: 14, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 2, stem: "Tally marks are grouped in **fives**. There are **3 full groups and 2 extra marks**. What number is shown?", answer: 17, solution: "3 × 5 = 15, plus 2 = 17." },
  { ch: 14, skills: ["ALGORITHMIC"], type: "ORDER", d: 2, stem: `${FRUIT}\n\nArrange the fruits from **fewest to most** votes.`, options: ["Mango", "Banana", "Apple", "Guava"], answer: [2, 3, 1, 0], solution: "Apple 4, Guava 5, Banana 6, Mango 9." },

  // Theme 1 — Our Body and Health
  // Theme 2 — Seeds and Plants
  // Theme 3 — Animal Homes
  // Theme 4 — Sources of Water
  // Theme 5 — Travel and Transport
  // Theme 6 — Waste and Recycling

  // ---------- Puzzles of the Day ----------
  { ch: 4, puzzle: true, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 2, stem: "I am a 2-digit number.\n- My tens digit is **3 more** than my ones digit.\n- My digits add up to **11**.\n\nWho am I?", answer: 74, solution: "Try pairs that add to 11: (7, 4) has a difference of 3. The number is 74." },
  { ch: 1, puzzle: true, skills: ["ABSTRACT", "DECOMPOSITION"], type: "NUMERIC", d: 2, stem: "A triangle is cut by **one straight line** from its top corner down to the middle of the bottom side. How many triangles can you count now (of any size)?", answer: 3, solution: "2 small triangles plus the whole big triangle = 3." },
  { ch: 9, puzzle: true, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 3, stem: "A farmer has some chickens and goats. Together they have **6 heads** and **16 legs**. How many **goats** are there?", answer: 2, solution: "If all 6 were chickens: 12 legs. 4 legs are extra, and each goat has 2 extra legs, so there are 2 goats." },
  { ch: 3, puzzle: true, skills: ["PATTERN"], type: "MCQ", d: 2, stem: "What comes next?\n\n1, 1, 2, 3, 5, 8, ___", options: ["11", "12", "13", "15"], answer: 2, solution: "Each number is the sum of the two before it: 5 + 8 = 13." },
  { ch: 12, puzzle: true, skills: ["PATTERN", "DECOMPOSITION"], type: "NUMERIC", d: 3, stem: "A clock strikes **once** at 1 o'clock, **twice** at 2 o'clock, and so on. How many times does it strike from **1 o'clock to 6 o'clock**, including both?", answer: 21, solution: "1 + 2 + 3 + 4 + 5 + 6 = 21." },
];
