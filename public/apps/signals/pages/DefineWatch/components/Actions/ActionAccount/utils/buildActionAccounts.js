export default function buildActionAccounts(accounts = [], accountType) {
  if (!accountType) {
    return accounts.map(({ _id: label }) => ({ label }));
  }

  return accounts.reduce((acc, { _id: label, type }) => {
    if (accountType.toLowerCase() === type.toLowerCase()) {
      acc.push({ label });
    }
    return acc;
  }, []);
}
