// Original Hitbullseye items, Class 3 — remaining CT chapters (2–4, 6–13).
// Class 3 outcomes: simple patterns with 1–2 changes, problems with 2–3 clues, flips/folds/views,
// step-by-step rules, grid/direction paths and before/after ordering.
import type { SeedQuestion } from "./types";

export const class3more: SeedQuestion[] = [
  // Ch 2 — Toy Joy
  { ch: 2, skills: ["ABSTRACT"], type: "MCQ", d: 1, stem: "A ball is shaped like a …", options: ["Sphere", "Cube", "Cone", "Cylinder"], answer: 0, solution: "A ball is round all over — a sphere." },
  { ch: 2, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 1, stem: "A toy car has **4 wheels**. How many wheels do **3 toy cars** have?", answer: 12, solution: "4 + 4 + 4 = 12 wheels." },
  { ch: 2, skills: ["ABSTRACT", "EVALUATION"], type: "MCQ", d: 2, stem: "Which toy can **roll** and also be **stacked** one on top of another?", options: ["A drum shaped like a cylinder", "A ball", "A building block (cube)", "A spinning top"], answer: 0, solution: "A cylinder rolls on its curved side and stacks on its flat faces. A ball rolls but won't stack; a cube stacks but won't roll." },
  { ch: 2, skills: ["ABSTRACT"], type: "MCQ", d: 2, stem: "A dice is shaped like a …", options: ["Cube", "Sphere", "Cone", "Cylinder"], answer: 0, solution: "A dice has 6 flat square faces — a cube." },
  { ch: 2, skills: ["PATTERN"], type: "MCQ", d: 2, stem: "Toys on a shelf:\n\n🧸 🚗 🚗 🧸 🚗 🚗 🧸 ___\n\nWhat comes next?", options: ["🚗", "🧸", "🪀", "⚽"], answer: 0, solution: "The group 🧸 🚗 🚗 repeats. After 🧸 comes 🚗." },
  { ch: 2, skills: ["ABSTRACT"], type: "NUMERIC", d: 2, stem: "How many **flat faces** does a cone (like a birthday cap) have?", answer: 1, solution: "A cone has 1 flat round face (the base) and 1 curved surface." },
  { ch: 2, skills: ["DECOMPOSITION", "ABSTRACT"], type: "MCQ", d: 3, stem: "I have **2 flat faces** and **1 curved surface**. I can roll. What shape am I?", options: ["Cylinder", "Cone", "Cube", "Sphere"], answer: 0, solution: "A cone has only 1 flat face, a cube has 6 and a sphere has none. A cylinder has 2 flat faces and rolls." },
  { ch: 2, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 3, stem: "Riya has **3 toy boxes**. Each box has **4 balls and 2 cars**. How many toys are there in all?", answer: 18, solution: "Each box has 4 + 2 = 6 toys. 3 boxes: 6 + 6 + 6 = 18.", hint: "First find the toys in one box." },

  // Ch 3 — Double Century
  { ch: 3, skills: ["PATTERN"], type: "NUMERIC", d: 1, stem: "What comes next?\n\n110, 120, 130, ___", answer: 140, solution: "Add 10 each time." },
  { ch: 3, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 1, stem: "**100 + 50 + 7 = ?**", answer: 157, solution: "1 hundred, 5 tens and 7 ones make 157." },
  { ch: 3, skills: ["ALGORITHMIC"], type: "MCQ", d: 2, stem: "Which number comes **between 149 and 151**?", options: ["148", "150", "152", "159"], answer: 1, solution: "149, 150, 151." },
  { ch: 3, skills: ["ALGORITHMIC"], type: "ORDER", d: 2, stem: "Put these numbers from **smallest to largest**.", options: ["120", "102", "200", "112"], answer: [1, 3, 0, 2], solution: "102 < 112 < 120 < 200." },
  { ch: 3, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 2, stem: "How many **tens** make **200**?", answer: 20, solution: "10 tens make 100, so 20 tens make 200." },
  { ch: 3, skills: ["PATTERN"], type: "NUMERIC", d: 3, stem: "What comes next?\n\n195, 190, 185, 180, ___", answer: 175, solution: "Take away 5 each time: 180 − 5 = 175." },
  { ch: 3, skills: ["DECOMPOSITION"], type: "MCQ", d: 3, stem: "I am **more than 150** and **less than 160**. My ones digit is **8**. Who am I?", options: ["158", "168", "148", "185"], answer: 0, solution: "Numbers between 150 and 160 are 151–159. The one ending in 8 is 158." },
  { ch: 3, skills: ["DECOMPOSITION"], type: "TRUE_FALSE", d: 1, stem: "True or false: **199 + 1 = 200**.", answer: true, solution: "One more than 199 is 200 — a double century!" },

  // Ch 4 — Vacation with My Nani Maa
  { ch: 4, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 1, stem: "Riya packs **5 frocks** and **3 shorts** for her trip. How many clothes in all?", answer: 8, solution: "Add the frocks and shorts: 5 + 3 = 8 clothes." },
  { ch: 4, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 1, stem: "Nani Maa has **20 mangoes**. She gives **7** to Riya. How many are left?", answer: 13, solution: "20 − 7 = 13." },
  { ch: 4, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 2, stem: "The train journey takes **3 hours** on day 1 and **4 hours** on day 2. How many hours in all?", answer: 7, solution: "3 + 4 = 7 hours." },
  { ch: 4, skills: ["ALGORITHMIC"], type: "ORDER", d: 2, stem: "Put Riya's journey in order.", options: ["Get on the train", "Reach the station", "Get off at Nani's town", "Walk to Nani's house"], answer: [1, 0, 2, 3], solution: "Reach the station, get on the train, get off at Nani's town, then walk to her house." },
  { ch: 4, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 2, stem: "Nani's village is **45 km** away. The bus has gone **30 km**. How many km are left?", answer: 15, solution: "45 − 30 = 15 km." },
  { ch: 4, skills: ["DECOMPOSITION", "ALGORITHMIC"], type: "NUMERIC", d: 3, stem: "Riya collects **12 shells** on Monday. On Tuesday she collects **9 more than on Monday**. How many shells does she collect on the two days together?", answer: 33, solution: "Tuesday: 12 + 9 = 21. Both days: 12 + 21 = 33.", hint: "First find Tuesday's shells." },
  { ch: 4, skills: ["ALGORITHMIC", "EVALUATION"], type: "MCQ", d: 3, stem: "Riya is older than Rohan. Rohan is older than Tina. Who is the **youngest**?", options: ["Riya", "Rohan", "Tina", "We can't tell"], answer: 2, solution: "Riya > Rohan > Tina, so Tina is the youngest." },
  { ch: 4, skills: ["PATTERN"], type: "NUMERIC", d: 2, stem: "Nani plants **2 flowers every day**. How many flowers has she planted after **6 days**?", answer: 12, solution: "2, 4, 6, 8, 10, 12 — 12 flowers." },

  // Ch 6 — House of Hundreds – I
  { ch: 6, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 1, stem: "**3 hundreds, 4 tens and 2 ones** make which number?", answer: 342, solution: "300 + 40 + 2 = 342." },
  { ch: 6, skills: ["DECOMPOSITION"], type: "MCQ", d: 1, stem: "In **527**, which digit is in the **hundreds** place?", options: ["5", "2", "7", "0"], answer: 0, solution: "527 = 5 hundreds, 2 tens, 7 ones." },
  { ch: 6, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 2, stem: "How many **hundreds** are there in **600**?", answer: 6, solution: "600 = 6 hundreds." },
  { ch: 6, skills: ["ABSTRACT", "DECOMPOSITION"], type: "MCQ", d: 2, stem: "Which number has **0 tens**?", options: ["305", "350", "530", "355"], answer: 0, solution: "305 = 3 hundreds, 0 tens, 5 ones." },
  { ch: 6, skills: ["ALGORITHMIC"], type: "NUMERIC", d: 2, stem: "What is **10 more** than **395**?", answer: 405, solution: "395 + 10 = 405. The tens go past 9, so the hundreds go up by 1." },
  { ch: 6, skills: ["DECOMPOSITION", "ABSTRACT"], type: "NUMERIC", d: 3, stem: "Make the **biggest** 3-digit number using **2, 7, 4** (each once).", answer: 742, solution: "Put the biggest digit first: 7, then 4, then 2 → 742." },
  { ch: 6, skills: ["DECOMPOSITION", "EVALUATION"], type: "NUMERIC", d: 3, stem: "Make the **smallest** 3-digit number using **6, 0, 3** (each once).", answer: 306, solution: "A 3-digit number can't start with 0, so start with 3, then 0, then 6 → 306.", hint: "Can a 3-digit number start with 0?" },
  { ch: 6, skills: ["ABSTRACT"], type: "TRUE_FALSE", d: 2, stem: "True or false: in **444**, all three 4s have the same value.", answer: false, solution: "The 4s mean 400, 40 and 4 — the place changes the value." },

  // Ch 7 — Raksha Bandhan
  { ch: 7, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 1, stem: "Meena ties a rakhi on each of her **3 brothers**. Each rakhi has **2 beads**. How many beads in all?", answer: 6, solution: "2 + 2 + 2 = 6 beads." },
  { ch: 7, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 1, stem: "A box has **5 laddoos**. How many laddoos are in **4 boxes**?", answer: 20, solution: "5 + 5 + 5 + 5 = 20." },
  { ch: 7, skills: ["PATTERN"], type: "MCQ", d: 2, stem: "Rakhi beads:\n\n🔴 🟡 🟡 🔴 🟡 🟡 🔴 ___\n\nWhat comes next?", options: ["🟡", "🔴", "🟢", "🔵"], answer: 0, solution: "The group 🔴 🟡 🟡 repeats. After 🔴 comes 🟡." },
  { ch: 7, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 2, stem: "Rakhis cost **₹10 each**. How much do **4 rakhis** cost?", answer: 40, solution: "10 + 10 + 10 + 10 = ₹40." },
  { ch: 7, skills: ["DECOMPOSITION", "ABSTRACT"], type: "NUMERIC", d: 2, stem: "Diyas are kept in **3 rows** with **6 diyas** in each row. How many diyas?", answer: 18, solution: "6 + 6 + 6 = 18." },
  { ch: 7, skills: ["DECOMPOSITION", "ALGORITHMIC"], type: "NUMERIC", d: 3, stem: "Sita has **₹50**. She buys **3 rakhis** at **₹10 each**. How much money is left?", answer: 20, solution: "3 rakhis cost ₹30. 50 − 30 = ₹20." },
  { ch: 7, skills: ["PATTERN", "GENERALISATION"], type: "NUMERIC", d: 3, stem: "A rakhi uses **2 red beads, then 1 gold bead**, again and again. How many **gold** beads are in the first **12 beads**?", answer: 4, solution: "Each group of 3 beads has 1 gold bead. 12 beads = 4 groups → 4 gold beads." },
  { ch: 7, skills: ["GENERALISATION"], type: "TRUE_FALSE", d: 1, stem: "True or false: 2 groups of 5 sweets is the same number of sweets as 5 groups of 2 sweets.", answer: true, solution: "Both make 10 sweets." },

  // Ch 8 — Fair Share
  { ch: 8, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 1, stem: "**10 biscuits** are shared equally between **2 children**. How many does each get?", answer: 5, solution: "10 shared into 2 equal groups: 5 each." },
  { ch: 8, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 1, stem: "What is **half of 8**?", answer: 4, solution: "Half means 2 equal parts: 4 and 4." },
  { ch: 8, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 2, stem: "**12 pencils** are shared equally among **4 friends**. How many does each friend get?", answer: 3, solution: "12 shared into 4 equal groups: 3 each." },
  { ch: 8, skills: ["EVALUATION"], type: "MCQ", d: 2, stem: "Two children share 6 sweets. Which way is **fair**?", options: ["3 and 3", "4 and 2", "5 and 1", "6 and 0"], answer: 0, solution: "A fair share means equal parts: 3 and 3." },
  { ch: 8, skills: ["ABSTRACT"], type: "NUMERIC", d: 2, stem: "A roti is folded **exactly in half**. Into how many equal parts is it divided?", answer: 2, solution: "Folding in half makes 2 equal parts." },
  { ch: 8, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 3, stem: "**15 marbles** are shared equally among **4 friends**, as many as possible to each. How many marbles are **left over**?", answer: 3, solution: "Each friend gets 3 (4 × 3 = 12). 15 − 12 = 3 left over." },
  { ch: 8, skills: ["ABSTRACT", "ALGORITHMIC"], type: "NUMERIC", d: 3, stem: "**Half** of a number is **9**. What is the number?", answer: 18, solution: "If half is 9, the whole is 9 + 9 = 18." },
  { ch: 8, skills: ["EVALUATION"], type: "TRUE_FALSE", d: 2, stem: "True or false: if a cake is cut into 2 pieces that are **not equal**, each piece is a half.", answer: false, solution: "Halves must be 2 equal parts." },

  // Ch 9 — House of Hundreds – II
  { ch: 9, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 1, stem: "**200 + 300 = ?**", answer: 500, solution: "2 hundreds + 3 hundreds = 5 hundreds = 500." },
  { ch: 9, skills: ["EVALUATION"], type: "MCQ", d: 1, stem: "Which is **bigger**?", options: ["490", "409", "Both are the same", "We can't tell"], answer: 0, solution: "Both have 4 hundreds; 490 has 9 tens and 409 has 0 tens, so 490 is bigger." },
  { ch: 9, skills: ["ALGORITHMIC"], type: "ORDER", d: 2, stem: "Put these from **smallest to largest**.", options: ["560", "506", "650", "605"], answer: [1, 0, 3, 2], solution: "506 < 560 < 605 < 650." },
  { ch: 9, skills: ["ALGORITHMIC"], type: "NUMERIC", d: 2, stem: "What is **100 less** than **724**?", answer: 624, solution: "Only the hundreds digit changes: 7 → 6." },
  { ch: 9, skills: ["PATTERN"], type: "NUMERIC", d: 2, stem: "What comes next?\n\n250, 300, 350, 400, ___", answer: 450, solution: "Add 50 each time." },
  { ch: 9, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 3, stem: "A 3-digit number:\n- it has **4 hundreds**,\n- its tens digit is **2 more** than its hundreds digit,\n- its ones digit is **0**.\n\nWhat is the number?", answer: 460, solution: "Hundreds 4, tens 4 + 2 = 6, ones 0 → 460." },
  { ch: 9, skills: ["EVALUATION"], type: "MCQ", d: 3, stem: "Which sign makes this true?\n\n345 ☐ 354", options: ["<", ">", "="], answer: 0, solution: "Same hundreds; 4 tens < 5 tens, so 345 < 354." },
  { ch: 9, skills: ["DECOMPOSITION", "PATTERN"], type: "NUMERIC", d: 3, stem: "How many 3-digit numbers have **all three digits the same** (like 222)?", answer: 9, solution: "111, 222, 333, 444, 555, 666, 777, 888, 999 — 9 numbers. (000 is not a 3-digit number.)" },

  // Ch 10 — Fun at Class Party!
  { ch: 10, skills: ["PATTERN"], type: "MCQ", d: 1, stem: "Party decorations:\n\n🎈 🎈 🎁 🎈 🎈 🎁 🎈 ___\n\nWhat comes next?", options: ["🎈", "🎁", "🎂", "🎉"], answer: 0, solution: "The group 🎈 🎈 🎁 repeats. After one 🎈 comes another 🎈." },
  { ch: 10, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 1, stem: "**6 children** each get **2 sandwiches**. How many sandwiches are needed?", answer: 12, solution: "2 + 2 + 2 + 2 + 2 + 2 = 12." },
  { ch: 10, skills: ["ALGORITHMIC"], type: "NUMERIC", d: 2, stem: "Chairs in a circle are numbered 1 to 8. Ravi sits on chair **3**. Anu sits **2 chairs after** Ravi (counting up). Which chair is Anu's?", answer: 5, solution: "3 → 4 → 5. Anu sits on chair 5." },
  { ch: 10, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 2, stem: "A cake is cut into **12 pieces**. **8** are eaten. How many are left?", answer: 4, solution: "12 − 8 = 4." },
  { ch: 10, skills: ["ABSTRACT"], type: "MCQ", d: 2, stem: "A party hat (a cone) seen from the **side** looks like a …", options: ["Triangle", "Circle", "Square", "Rectangle"], answer: 0, solution: "From the side, a cone shows two slanting edges and a flat bottom — a triangle." },
  { ch: 10, skills: ["DECOMPOSITION", "ALGORITHMIC"], type: "NUMERIC", d: 3, stem: "For a sandwich you choose **1 bread** (white or brown) and **1 filling** (cheese, jam or vegetables). How many **different** sandwiches can you make?", answer: 6, solution: "White with 3 fillings = 3; brown with 3 fillings = 3. 3 + 3 = 6.", hint: "List all the white-bread sandwiches first." },
  { ch: 10, skills: ["ALGORITHMIC"], type: "MCQ", d: 3, stem: "Musical chairs: **5 children** play. In every round **one child is out**. How many rounds until only **1 winner** is left?", options: ["4", "5", "3", "6"], answer: 0, solution: "5 → 4 → 3 → 2 → 1: four children go out, so 4 rounds." },
  { ch: 10, skills: ["PATTERN", "GENERALISATION"], type: "NUMERIC", d: 2, stem: "Fairy lights go **1 red, 2 blue**, again and again. How many lights are there in **5 full groups**?", answer: 15, solution: "Each group has 3 lights. 3 × 5 = 15." },

  // Ch 11 — Filling and Lifting
  { ch: 11, skills: ["EVALUATION"], type: "MCQ", d: 1, stem: "Which holds the **most** water?", options: ["Bucket", "Cup", "Spoon", "Bottle cap"], answer: 0, solution: "A bucket is much bigger than the others." },
  { ch: 11, skills: ["EVALUATION"], type: "MCQ", d: 1, stem: "Which is the **heaviest**?", options: ["Watermelon", "Grape", "Feather", "Paper clip"], answer: 0, solution: "A watermelon weighs much more than the small, light things." },
  { ch: 11, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 2, stem: "One jug fills **4 glasses**. How many glasses can **3 jugs** fill?", answer: 12, solution: "4 + 4 + 4 = 12 glasses." },
  { ch: 11, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 2, stem: "A bucket is full after **10 mugs** of water. **6 mugs** have been poured. How many more mugs are needed?", answer: 4, solution: "10 − 6 = 4." },
  { ch: 11, skills: ["ABSTRACT"], type: "MCQ", d: 2, stem: "A balance tips **down on the left** side. Which side is heavier?", options: ["Left", "Right", "Both are the same", "We can't tell"], answer: 0, solution: "The heavier side goes down." },
  { ch: 11, skills: ["DECOMPOSITION", "ABSTRACT"], type: "NUMERIC", d: 3, stem: "**2 apples** balance **1 mango**. How many apples balance **3 mangoes**?", answer: 6, solution: "Each mango needs 2 apples: 2 + 2 + 2 = 6." },
  { ch: 11, skills: ["ALGORITHMIC"], type: "ORDER", d: 2, stem: "Put the animals from **lightest to heaviest**.", options: ["Elephant", "Cat", "Ant", "Dog"], answer: [2, 1, 3, 0], solution: "Ant, cat, dog, elephant." },
  { ch: 11, skills: ["EVALUATION", "ABSTRACT"], type: "MCQ", d: 3, stem: "Bottle A fills **3 glasses**. Bottle B fills **5 glasses** of the same size. Which bottle holds **more**?", options: ["Bottle B", "Bottle A", "Both the same", "We can't tell"], answer: 0, solution: "Bottle B fills more of the same glasses, so it holds more." },

  // Ch 12 — Give and Take
  { ch: 12, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 1, stem: "Rahul had **25 stickers**. He got **10 more**. How many does he have now?", answer: 35, solution: "25 + 10 = 35." },
  { ch: 12, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 1, stem: "Seema had **₹50**. She spent **₹20**. How much is left?", answer: 30, solution: "50 − 20 = ₹30." },
  { ch: 12, skills: ["DECOMPOSITION", "ABSTRACT"], type: "NUMERIC", d: 2, stem: "Ali gives Bina **5 marbles**. Now **Ali has 15** marbles. How many marbles did Ali have **at first**?", answer: 20, solution: "Undo the giving: 15 + 5 = 20." },
  { ch: 12, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 2, stem: "How many **₹10 notes** make **₹100**?", answer: 10, solution: "10 tens make 100." },
  { ch: 12, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 2, stem: "A toy costs **₹65**. You pay with **₹100**. How much change do you get?", answer: 35, solution: "100 − 65 = ₹35. (Count on: 65 → 70 is 5, 70 → 100 is 30.)" },
  { ch: 12, skills: ["DECOMPOSITION", "ALGORITHMIC"], type: "NUMERIC", d: 3, stem: "Tara has **18 cards**. She **gives 6** to Raj and then **gets 4** from Mona. How many cards does she have now?", answer: 16, solution: "18 − 6 = 12, then 12 + 4 = 16.", hint: "Do one step at a time." },
  { ch: 12, skills: ["DECOMPOSITION", "EVALUATION"], type: "MULTI", d: 3, stem: "Which of these make exactly **₹20**? Choose all that apply.", options: ["₹10 + ₹10", "₹5 + ₹5 + ₹5", "₹10 + ₹5 + ₹5", "₹2 + ₹2 + ₹10"], answer: [0, 2], solution: "10 + 10 = 20 ✓; 5 + 5 + 5 = 15; 10 + 5 + 5 = 20 ✓; 2 + 2 + 10 = 14." },
  { ch: 12, skills: ["ALGORITHMIC"], type: "NUMERIC", d: 2, stem: "Find the missing number:\n\n34 + ☐ = 50", answer: 16, solution: "50 − 34 = 16." },

  // Ch 13 — Time Goes On
  { ch: 13, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 1, stem: "How many days are there in a **week**?", answer: 7, solution: "Monday to Sunday: 7 days." },
  { ch: 13, skills: ["ALGORITHMIC"], type: "MCQ", d: 1, stem: "Which day comes **after Saturday**?", options: ["Sunday", "Friday", "Monday", "Thursday"], answer: 0, solution: "Saturday is followed by Sunday." },
  { ch: 13, skills: ["ALGORITHMIC"], type: "MCQ", d: 2, stem: "Which month comes **after July**?", options: ["August", "June", "September", "March"], answer: 0, solution: "July is followed by August." },
  { ch: 13, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 1, stem: "How many **months** are there in a year?", answer: 12, solution: "January to December: 12 months." },
  { ch: 13, skills: ["ALGORITHMIC"], type: "MCQ", d: 2, stem: "Today is **Tuesday**. What day was it **yesterday**?", options: ["Monday", "Wednesday", "Sunday", "Thursday"], answer: 0, solution: "The day before Tuesday is Monday." },
  { ch: 13, skills: ["ALGORITHMIC", "PATTERN"], type: "MCQ", d: 3, stem: "Today is **Friday**. What day will it be in **10 days**?", options: ["Monday", "Sunday", "Tuesday", "Friday"], answer: 0, solution: "7 days later is Friday again. 3 more days: Saturday, Sunday, Monday." },
  { ch: 13, skills: ["ALGORITHMIC"], type: "ORDER", d: 2, stem: "Put these in order, **earliest in the day first**.", options: ["Eat lunch", "Wake up", "Go to bed", "Go to school"], answer: [1, 3, 0, 2], solution: "Wake up, go to school, eat lunch, go to bed." },
  { ch: 13, skills: ["ALGORITHMIC"], type: "NUMERIC", d: 2, stem: "The clock shows **3 o'clock**. What time will it be **4 hours later**? (Type the hour.)", answer: 7, solution: "3 + 4 = 7 o'clock." },

  // Theme 1 — Family and Friends
  // Theme 3 — Animals Around Us
  // Theme 4 — Food We Eat
  // Theme 6 — Our Neighbourhood and Maps
];
