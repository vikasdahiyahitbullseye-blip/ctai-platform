// All learning modules, keyed "<class>-<part>-<chapter>".
import type { ModuleData } from "./types";
import { MODULES3 } from "./modules3";
import { MODULES4 } from "./modules4";
import { MODULES5 } from "./modules5";
import { MODULES6 } from "./modules6";
import { MODULES7 } from "./modules7";
import { MODULES8 } from "./modules8";

export const MODULES: Record<string, ModuleData> = { ...MODULES3, ...MODULES4, ...MODULES5, ...MODULES6, ...MODULES7, ...MODULES8 };
export type { ModuleData };
