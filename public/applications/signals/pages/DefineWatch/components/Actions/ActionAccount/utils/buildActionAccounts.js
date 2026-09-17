export default function buildActionAccounts(accounts = [], accountType) {
  const accountLabels = new Set();

  return accounts.reduce((acc, { _id: label, type }) => {
    const isRequestedType = !accountType || accountType.toLowerCase() === type.toLowerCase();
    if (isRequestedType && !accountLabels.has(label)) {
      accountLabels.add(label);
      acc.push({ label });
    }
    return acc;
  }, []);
}
