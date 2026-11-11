// Learning-module content for one chapter. The module page adds a worked example and "Try it" questions
// from the question bank; video scripts and the period plan are built from these fields too.
export type KitStep = [title: string, studentTask: string, teacherTip: string];
export type ModuleData = {
  o: [string, string, string]; // learning objectives ("I can …")
  hook: string; // opening question or story for the warm-up
  ideas: string[]; // 3–4 key ideas
  terms: [string, string][]; // key words and meanings
  mistake: string; // a common mistake to watch for
  home: string; // at-home task (used in assignments)
  kit: { t: string; e: string; mat: string; steps: KitStep[]; out: string }; // classroom activity kit
};
export const M = (data: ModuleData) => data;
