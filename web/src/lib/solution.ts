// Helpers for worked solutions (CBSE Teacher Handbook style). "[fig:N]" marks where solution picture N goes.

/** Solution text without picture markers, for plain-text outputs (Word files, slides, narration). */
export const plainSolution = (text: string) => text.replace(/\s*\[fig:\d+\]\s*/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
