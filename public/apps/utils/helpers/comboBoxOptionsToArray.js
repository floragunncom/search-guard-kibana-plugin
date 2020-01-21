export const comboBoxOptionsToArray = (array = []) => {
  if (!array) return [];
  return array.map(({ label }) => label).sort((a, b) => a.localeCompare(b));
};
