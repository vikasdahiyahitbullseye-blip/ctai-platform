// Original EVS (TWAU) CT worksheet items, Class 3. Part "EVS"; chapter numbers refer to the themes in CURRICULUM[3].EVS.
import type { SeedQuestion } from "./types";

export const evs3: SeedQuestion[] = [
  // Theme 5 — Water
  { part: "EVS", ch: 5, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 1, stem: "A leaking tap drips **1 drop every second**. How many drops fall in **1 minute**?", answer: 60, solution: "1 minute = 60 seconds, and 1 drop falls each second, so 60 drops fall." },
  { part: "EVS", ch: 5, skills: ["DECOMPOSITION"], type: "NUMERIC", d: 2, stem: "Water used by Meena in the morning:\n\n| Activity | Litres |\n|---|---|\n| Bath with a bucket | 20 |\n| Brushing with the tap open | 6 |\n| Washing hands | 2 |\n\nHow many litres did she use in total?", answer: 28, solution: "20 + 6 + 2 = 28 litres." },
  { part: "EVS", ch: 5, skills: ["ALGORITHMIC"], type: "ORDER", d: 2, stem: "Put these steps in order to **brush your teeth and save water**.", options: ["Wet the brush", "Turn the tap off", "Brush your teeth", "Rinse with a mug of water"], answer: [0, 1, 2, 3], solution: "Wet the brush, then turn the tap off so water isn't wasted while brushing, brush, and rinse using a mug." },
  { part: "EVS", ch: 5, skills: ["EVALUATION"], type: "MCQ", d: 1, stem: "Which of these uses the **least** water?", options: ["Bath with one bucket", "A long shower", "Leaving the tap running", "Washing a car with a hose"], answer: 0, solution: "A bucket holds a fixed, small amount. Showers, running taps and hoses keep using water." },
  { part: "EVS", ch: 5, skills: ["PATTERN"], type: "MCQ", d: 1, stem: "Weather this week: ☀️ 🌧️ ☀️ 🌧️ ☀️ ___\n\nIf the pattern continues, what comes next?", options: ["☀️", "🌧️", "⛄", "🌈"], answer: 1, solution: "Sunny and rainy days take turns, so after ☀️ comes 🌧️." },
  // Theme 2 — Plants
  { part: "EVS", ch: 2, skills: ["ALGORITHMIC", "DECOMPOSITION"], type: "NUMERIC", d: 2, stem: "A plant is **5 cm** tall. It grows **2 cm every week**. How tall will it be after **3 weeks**?", answer: 11, solution: "It grows 2 + 2 + 2 = 6 cm in 3 weeks. 5 + 6 = 11 cm." },
  { part: "EVS", ch: 2, skills: ["PATTERN"], type: "MCQ", d: 2, stem: "🍃 🍃 🌸 🍃 🍃 🌸 🍃 ___\n\nWhat comes next?", options: ["🌸", "🍃", "🌳", "🍎"], answer: 1, solution: "The group 🍃 🍃 🌸 repeats. The 7th item is 🍃, so the 8th is also 🍃." },
  { part: "EVS", ch: 2, skills: ["DECOMPOSITION", "ABSTRACT"], type: "MCQ", d: 2, stem: "Which group has **only** things that come from plants?", options: ["Cotton, wheat, mango", "Milk, egg, rice", "Honey, wool, apple", "Stone, wood, rice"], answer: 0, solution: "Cotton, wheat and mango all come from plants. Milk, eggs, honey and wool come from animals; stone is not from living things." },
  { part: "EVS", ch: 2, skills: ["ALGORITHMIC"], type: "ORDER", d: 1, stem: "Put the steps for **growing a plant from a seed** in order.", options: ["Water it every day", "Put soil in a pot", "Wait for a sprout", "Plant the seed"], answer: [1, 3, 0, 2], solution: "Soil first, then plant the seed, water it every day, and wait for a sprout." },
  { part: "EVS", ch: 2, skills: ["EVALUATION"], type: "TRUE_FALSE", d: 1, stem: "True or false: plants need sunlight to make their food.", answer: true, solution: "Green plants use sunlight, water and air to make their own food." },
];
