// A list of Tailwind CSS colors to assign to users
export const COLORS = [
  '#f87171', // red-400
  '#fb923c', // orange-400
  '#fbbf24', // amber-400
  '#facc15', // yellow-400
  '#a3e635', // lime-400
  '#4ade80', // green-400
  '#34d399', // emerald-400
  '#2dd4bf', // teal-400
  '#22d3ee', // cyan-400
  '#60a5fa', // blue-400
  '#818cf8', // indigo-400
  '#a78bfa', // violet-400
  '#c084fc', // purple-400
  '#e879f9', // fuchsia-400
  '#f472b6', // pink-400
  '#fb7185', // rose-400
];

/**
 * Given a string (like a user ID), returns a consistent color from the COLORS array.
 * @param str The string to hash
 * @returns A color from the COLORS array
 */
export const getColorFromString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % COLORS.length);
  return COLORS[index];
};
