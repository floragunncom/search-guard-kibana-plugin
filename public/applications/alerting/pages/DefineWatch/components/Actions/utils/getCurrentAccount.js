export default function getCurrentAccount(allAccounts = [], account = []) {
  if (!account.length) return undefined;
  return allAccounts.filter(a => a._id === account[0].label).pop();
}
