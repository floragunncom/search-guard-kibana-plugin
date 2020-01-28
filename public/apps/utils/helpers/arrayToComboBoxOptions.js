export const arrayToComboBoxOptions = (array = []) => {
  if (!array) return [];
  return array.map(label => ({ label })).sort((a, b) => a.label.localeCompare(b.label));
};
