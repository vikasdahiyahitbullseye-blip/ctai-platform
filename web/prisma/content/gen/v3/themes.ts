// Story settings for every chapter: where it happens, which topics it covers (tags decide which engines fit) and
// everyday things to count and buy. Tags: count, money, time, calendar, length, weight, capacity, shape, area,
// symmetry, angle, map, number, place, mult, div, fraction, decimal, data, pattern, letters, integer, algebra,
// power, factor. AI chapters: ai, data, ethics.
import { CURRICULUM } from "../../../../src/lib/constants";
import type { Theme, Thing } from "./core";

const T = (one: string, many: string, icon: string, price: [number, number]): Thing => ({ one, many, icon, price });
const SETS: Record<string, Thing[]> = {
  toys: [T("toy car", "toy cars", "🚗", [25, 90]), T("ball", "balls", "⚽", [20, 60]), T("kite", "kites", "🪁", [10, 30]), T("teddy bear", "teddy bears", "🧸", [60, 150]), T("top", "tops", "🪀", [8, 25])],
  fair: [T("balloon", "balloons", "🎈", [5, 15]), T("bangle", "bangles", "💍", [10, 40]), T("clay pot", "clay pots", "🏺", [30, 90]), T("kite", "kites", "🪁", [10, 30]), T("candy floss", "candy flosses", "🍭", [10, 25])],
  rakhi: [T("rakhi", "rakhis", "🎀", [10, 45]), T("sweet box", "sweet boxes", "🍬", [60, 150]), T("diya", "diyas", "🪔", [5, 15]), T("flower", "flowers", "🌼", [2, 8])],
  party: [T("cupcake", "cupcakes", "🧁", [10, 30]), T("balloon", "balloons", "🎈", [5, 15]), T("sandwich", "sandwiches", "🥪", [15, 40]), T("juice box", "juice boxes", "🧃", [10, 25])],
  travel: [T("train ticket", "train tickets", "🎫", [40, 180]), T("water bottle", "water bottles", "🧴", [15, 30]), T("bus ticket", "bus tickets", "🎫", [10, 60]), T("postcard", "postcards", "💌", [5, 20])],
  farm: [T("mango", "mangoes", "🥭", [10, 30]), T("egg", "eggs", "🥚", [5, 8]), T("coconut", "coconuts", "🥥", [20, 45]), T("carrot", "carrots", "🥕", [3, 10]), T("banana", "bananas", "🍌", [4, 8])],
  dairy: [T("packet of milk", "packets of milk", "🥛", [25, 35]), T("cup of curd", "cups of curd", "🍶", [15, 30]), T("block of paneer", "blocks of paneer", "🧀", [60, 110])],
  school: [T("pencil", "pencils", "✏️", [3, 10]), T("notebook", "notebooks", "📒", [20, 50]), T("eraser", "erasers", "🧽", [2, 8]), T("crayon box", "crayon boxes", "🖍️", [30, 70]), T("book", "books", "📘", [40, 120])],
  village: [T("dustbin", "dustbins", "🗑️", [80, 200]), T("broom", "brooms", "🧹", [30, 80]), T("sapling", "saplings", "🌱", [10, 40]), T("water pot", "water pots", "🪣", [40, 120])],
  animals: [T("elephant", "elephants", "🐘", [0, 0]), T("tiger", "tigers", "🐅", [0, 0]), T("leopard", "leopards", "🐆", [0, 0]), T("deer", "deer", "🦌", [0, 0])],
  transport: [T("bus", "buses", "🚌", [0, 0]), T("car", "cars", "🚗", [0, 0]), T("bicycle", "bicycles", "🚲", [0, 0]), T("auto-rickshaw", "auto-rickshaws", "🛺", [0, 0])],
  shapes: [T("tile", "tiles", "🟦", [5, 20]), T("block", "blocks", "🧱", [5, 15]), T("sticker", "stickers", "⭐", [2, 6]), T("card", "cards", "🃏", [3, 10])],
  kitchen: [T("bag of rice", "bags of rice", "🍚", [50, 120]), T("bottle of oil", "bottles of oil", "🫗", [90, 180]), T("packet of dal", "packets of dal", "🫘", [60, 140])],
  quilt: [T("patch", "patches", "🟥", [5, 15]), T("button", "buttons", "🔘", [1, 5]), T("ribbon", "ribbons", "🎀", [10, 30])],
  sports: [T("cricket ball", "cricket balls", "🏏", [40, 120]), T("medal", "medals", "🏅", [0, 0]), T("cone", "cones", "🔺", [10, 30])],
  devices: [T("phone", "phones", "📱", [0, 0]), T("camera", "cameras", "📷", [0, 0]), T("robot", "robots", "🤖", [0, 0]), T("laptop", "laptops", "💻", [0, 0])],
};

type Row = { place: string; tags: string[]; set: string };
const ROWS: Record<string, Row> = {
  // Class 3
  "3-CT-1": { place: "in the class name game", tags: ["letters", "count", "pattern", "map"], set: "school" },
  "3-CT-2": { place: "at the toy shop", tags: ["shape", "count", "money", "pattern"], set: "toys" },
  "3-CT-3": { place: "at the school sports day", tags: ["number", "place", "count", "pattern"], set: "sports" },
  "3-CT-4": { place: "on the trip to Nani Maa's village", tags: ["money", "count", "time", "map", "number"], set: "travel" },
  "3-CT-5": { place: "in the shapes corner", tags: ["shape", "symmetry", "pattern", "count", "area"], set: "shapes" },
  "3-CT-6": { place: "at the village library", tags: ["number", "place", "count", "money"], set: "school" },
  "3-CT-7": { place: "at the Raksha Bandhan celebration", tags: ["mult", "count", "money", "pattern"], set: "rakhi" },
  "3-CT-8": { place: "at the class picnic", tags: ["div", "fraction", "count", "money"], set: "farm" },
  "3-CT-9": { place: "at the school library", tags: ["number", "place", "count", "money"], set: "school" },
  "3-CT-10": { place: "at the class party", tags: ["count", "money", "pattern", "data", "time"], set: "party" },
  "3-CT-11": { place: "in the kitchen", tags: ["capacity", "weight", "count", "money"], set: "kitchen" },
  "3-CT-12": { place: "at the village market", tags: ["money", "count", "number"], set: "farm" },
  "3-CT-13": { place: "at school", tags: ["time", "calendar", "pattern", "count"], set: "school" },
  "3-CT-14": { place: "at the Surajkund Fair", tags: ["money", "count", "time", "map", "data"], set: "fair" },
  // Class 4
  "4-CT-1": { place: "in the shapes corner", tags: ["shape", "symmetry", "count", "area", "pattern"], set: "shapes" },
  "4-CT-2": { place: "in the hide-and-seek game", tags: ["map", "shape", "count"], set: "toys" },
  "4-CT-3": { place: "at the rangoli competition", tags: ["pattern", "count", "shape", "number"], set: "shapes" },
  "4-CT-4": { place: "at the book fair", tags: ["number", "place", "money", "count"], set: "school" },
  "4-CT-5": { place: "at the school canteen", tags: ["fraction", "div", "length", "capacity", "count"], set: "party" },
  "4-CT-6": { place: "on the school playground", tags: ["length", "count", "map"], set: "sports" },
  "4-CT-7": { place: "in the cleanest-village drive", tags: ["count", "money", "data", "number"], set: "village" },
  "4-CT-8": { place: "at the grocery shop", tags: ["weight", "capacity", "money", "count"], set: "kitchen" },
  "4-CT-9": { place: "at the fruit market", tags: ["mult", "div", "count", "money", "pattern"], set: "farm" },
  "4-CT-10": { place: "in the wildlife park", tags: ["data", "number", "count", "mult"], set: "animals" },
  "4-CT-11": { place: "in the art room", tags: ["symmetry", "shape", "pattern", "count"], set: "shapes" },
  "4-CT-12": { place: "at the summer camp", tags: ["time", "calendar", "pattern", "count"], set: "school" },
  "4-CT-13": { place: "at the transport museum", tags: ["money", "time", "count", "mult", "map"], set: "transport" },
  "4-CT-14": { place: "in the class survey", tags: ["data", "count", "number"], set: "school" },
  // Class 5
  "5-CT-1": { place: "on a long train journey", tags: ["number", "place", "money", "count", "map"], set: "travel" },
  "5-CT-2": { place: "at the pizza party", tags: ["fraction", "count", "money"], set: "party" },
  "5-CT-3": { place: "in the robot-turning game", tags: ["angle", "map"], set: "toys" },
  "5-CT-4": { place: "on the school trip", tags: ["money", "time", "number", "count", "map"], set: "travel" },
  "5-CT-5": { place: "on the walk to school", tags: ["length", "map", "count"], set: "school" },
  "5-CT-6": { place: "at the dairy farm", tags: ["mult", "div", "capacity", "money", "count"], set: "dairy" },
  "5-CT-7": { place: "at the tile shop", tags: ["shape", "pattern", "count", "area"], set: "shapes" },
  "5-CT-8": { place: "at the grocery shop", tags: ["weight", "capacity", "money", "count"], set: "kitchen" },
  "5-CT-9": { place: "at the coconut farm", tags: ["mult", "div", "count", "money", "pattern"], set: "farm" },
  "5-CT-10": { place: "in the design club", tags: ["symmetry", "shape", "pattern", "count"], set: "shapes" },
  "5-CT-11": { place: "in Grandmother's sewing room", tags: ["area", "shape", "pattern", "count"], set: "quilt" },
  "5-CT-12": { place: "at the sports meet", tags: ["time", "count", "number", "data"], set: "sports" },
  "5-CT-13": { place: "in the animal jumping game", tags: ["factor", "mult", "pattern", "number", "count"], set: "animals" },
  "5-CT-14": { place: "on the town map", tags: ["map", "count", "length"], set: "transport" },
  "5-CT-15": { place: "in the class survey", tags: ["data", "count", "number"], set: "school" },
  // Class 6
  "6-CT-1": { place: "in the maths club", tags: ["pattern", "number", "count", "shape"], set: "shapes" },
  "6-CT-2": { place: "in the geometry lab", tags: ["angle", "shape", "map"], set: "shapes" },
  "6-CT-3": { place: "in the number games club", tags: ["number", "place", "factor", "count"], set: "school" },
  "6-CT-4": { place: "in the school survey", tags: ["data", "count", "number"], set: "school" },
  "6-CT-5": { place: "in the prime number hunt", tags: ["factor", "number", "pattern", "count"], set: "school" },
  "6-CT-6": { place: "in the school garden", tags: ["area", "length", "shape", "count"], set: "village" },
  "6-CT-7": { place: "at the community kitchen", tags: ["fraction", "count", "capacity", "money"], set: "kitchen" },
  "6-CT-8": { place: "in the drawing class", tags: ["shape", "angle", "length", "map"], set: "shapes" },
  "6-CT-9": { place: "in the art room", tags: ["symmetry", "shape", "pattern", "count"], set: "shapes" },
  "6-CT-10": { place: "in the lift game", tags: ["integer", "number", "count"], set: "school" },
  // Class 7
  "7-CT-1": { place: "in the census project", tags: ["number", "place", "count", "money"], set: "transport" },
  "7-CT-2": { place: "at the school store", tags: ["money", "count", "number", "algebra"], set: "school" },
  "7-CT-3": { place: "at the athletics meet", tags: ["decimal", "length", "money", "number"], set: "sports" },
  "7-CT-4": { place: "in the pattern club", tags: ["algebra", "pattern", "count"], set: "shapes" },
  "7-CT-5": { place: "in the city map project", tags: ["angle", "shape", "map"], set: "transport" },
  "7-CT-6": { place: "in the number games club", tags: ["number", "factor", "pattern", "count"], set: "school" },
  "7-CT-7": { place: "in the geometry lab", tags: ["angle", "shape", "count"], set: "shapes" },
  "7-CT-8": { place: "at the community kitchen", tags: ["fraction", "count", "money", "capacity"], set: "kitchen" },
  // Class 8
  "8-CT-1": { place: "in the cube-building lab", tags: ["power", "shape", "area", "pattern", "count"], set: "shapes" },
  "8-CT-2": { place: "in the science club", tags: ["power", "pattern", "number", "count"], set: "school" },
  "8-CT-3": { place: "in the coding club", tags: ["letters", "number", "place", "pattern"], set: "devices" },
  "8-CT-4": { place: "in the geometry lab", tags: ["angle", "shape", "area", "count"], set: "shapes" },
  "8-CT-5": { place: "in the number games club", tags: ["factor", "number", "pattern", "count"], set: "school" },
  "8-CT-6": { place: "at the school store", tags: ["algebra", "mult", "area", "money", "count"], set: "school" },
  "8-CT-7": { place: "at the community kitchen", tags: ["mult", "div", "money", "fraction", "count"], set: "kitchen" },
  // AI chapters
  "6-AI-1": { place: "in the AI club", tags: ["ai", "data", "ethics"], set: "devices" },
  "6-AI-2": { place: "in the data club", tags: ["ai", "data", "ethics"], set: "devices" },
  "6-AI-3": { place: "in the AI club", tags: ["ai", "data", "ethics", "rules"], set: "devices" },
  "6-AI-4": { place: "in the digital citizenship class", tags: ["ai", "data", "ethics", "safety"], set: "devices" },
  "7-AI-1": { place: "in the AI club", tags: ["ai", "data", "ethics"], set: "devices" },
  "7-AI-2": { place: "on the industry visit", tags: ["ai", "data", "ethics", "industry"], set: "devices" },
  "7-AI-3": { place: "in the data club", tags: ["ai", "data", "ethics"], set: "devices" },
  "7-AI-4": { place: "in the AI ethics debate", tags: ["ai", "data", "ethics", "safety"], set: "devices" },
  "8-AI-1": { place: "in the AI project team", tags: ["ai", "data", "ethics", "lifecycle"], set: "devices" },
  "8-AI-2": { place: "in the AI club", tags: ["ai", "data", "ethics", "industry"], set: "devices" },
  "8-AI-3": { place: "in the AI project team", tags: ["ai", "data", "ethics"], set: "devices" },
  "8-AI-4": { place: "in the AI ethics debate", tags: ["ai", "data", "ethics", "safety"], set: "devices" },
};

export const ITEM_SETS = SETS;

export function themes(): Theme[] {
  const out: Theme[] = [];
  for (const [clsS, parts] of Object.entries(CURRICULUM)) {
    for (const [part, titles] of Object.entries(parts) as ["CT" | "AI", string[]][]) {
      titles.forEach((title, i) => {
        const key = `${clsS}-${part}-${i + 1}`;
        const row = ROWS[key];
        if (!row) throw new Error(`No theme for ${key}`);
        out.push({ key, cls: Number(clsS), part, ch: i + 1, title, place: row.place, tags: row.tags, items: SETS[row.set] });
      });
    }
  }
  return out;
}
