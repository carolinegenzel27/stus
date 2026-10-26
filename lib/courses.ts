const DEFAULT_NAME_RE = /^course_(\d+)$/;

/** Next free auto-name: course_1, course_2, … based on the highest existing number. */
export function nextDefaultName(existingNames: string[]) {
  const max = existingNames.reduce((m, name) => {
    const match = DEFAULT_NAME_RE.exec(name);
    return match ? Math.max(m, Number(match[1])) : m;
  }, 0);
  return `course_${max + 1}`;
}

export const COURSE_COLORS = ["violet", "pink", "amber", "emerald", "sky", "rose", "indigo", "teal"] as const;

export const COLOR_CLASSES: Record<string, string> = {
  violet: "from-violet-400 to-purple-500",
  pink: "from-pink-400 to-fuchsia-500",
  amber: "from-amber-300 to-orange-500",
  emerald: "from-emerald-300 to-teal-500",
  sky: "from-sky-300 to-blue-500",
  rose: "from-rose-300 to-red-500",
  indigo: "from-indigo-400 to-violet-600",
  teal: "from-teal-300 to-cyan-600",
};
