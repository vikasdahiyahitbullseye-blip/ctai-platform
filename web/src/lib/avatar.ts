// Avatar builder: children pick an animal buddy and background; accessories unlock with levels (earned, never bought).

export const ANIMALS = [
  { id: "fox", emoji: "🦊", name: "Fox" },
  { id: "owl", emoji: "🦉", name: "Owl" },
  { id: "panda", emoji: "🐼", name: "Panda" },
  { id: "tiger", emoji: "🐯", name: "Tiger" },
  { id: "elephant", emoji: "🐘", name: "Elephant" },
  { id: "peacock", emoji: "🦚", name: "Peacock" },
  { id: "dolphin", emoji: "🐬", name: "Dolphin" },
  { id: "robot", emoji: "🤖", name: "Robot" },
  { id: "lion", emoji: "🦁", name: "Lion" },
  { id: "frog", emoji: "🐸", name: "Frog" },
];

export const BACKGROUNDS = [
  { id: "sky", css: "linear-gradient(135deg,#7dd3fc,#3b82f6)" },
  { id: "sunset", css: "linear-gradient(135deg,#fdba74,#f43f5e)" },
  { id: "mint", css: "linear-gradient(135deg,#86efac,#14b8a6)" },
  { id: "grape", css: "linear-gradient(135deg,#c4b5fd,#7c3aed)" },
  { id: "lemon", css: "linear-gradient(135deg,#fde68a,#f59e0b)" },
  { id: "space", css: "linear-gradient(135deg,#312e81,#0f172a)" },
];

export const ACCESSORIES = [
  { id: "cap", emoji: "🧢", name: "Cap", level: 2 },
  { id: "glasses", emoji: "🕶️", name: "Cool glasses", level: 3 },
  { id: "book", emoji: "📚", name: "Book stack", level: 4 },
  { id: "medal", emoji: "🏅", name: "Medal", level: 5 },
  { id: "rocket", emoji: "🚀", name: "Rocket", level: 6 },
  { id: "crown", emoji: "👑", name: "Crown", level: 8 },
  { id: "star", emoji: "🌟", name: "Superstar", level: 10 },
];

export type Avatar = { animal: string; bg: string; accessory: string | null };

export function parseAvatar(json: string | null | undefined): Avatar {
  try {
    const a = JSON.parse(json || "{}");
    return { animal: a.animal ?? "fox", bg: a.bg ?? "sky", accessory: a.accessory ?? null };
  } catch {
    return { animal: "fox", bg: "sky", accessory: null };
  }
}

export function avatarParts(a: Avatar) {
  return {
    emoji: ANIMALS.find((x) => x.id === a.animal)?.emoji ?? "🦊",
    bg: BACKGROUNDS.find((x) => x.id === a.bg)?.css ?? BACKGROUNDS[0].css,
    accessory: ACCESSORIES.find((x) => x.id === a.accessory)?.emoji ?? null,
  };
}
