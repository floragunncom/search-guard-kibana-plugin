export default function getCurrentAccount(allAccounts = [], account = []) {
  if (!account.length) return undefined;
  const matchingAccounts = allAccounts.filter(({ _id }) => _id === account[0].label);
  return matchingAccounts.find(({ _tenant: tenant }) => !!tenant) || matchingAccounts.pop();
}
