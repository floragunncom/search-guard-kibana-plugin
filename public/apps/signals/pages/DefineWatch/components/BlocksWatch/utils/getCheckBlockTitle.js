export const getCheckBlockTitle = (check = '') => {
  const reCeckName = new RegExp('"name":(?:\\s+)?"(.*)"', 'g');

  reCeckName.lastIndex = 0;
  const [, checkName] = reCeckName.exec(check) || [];
  if (checkName) return checkName; 

  check = check.replace(/\n/g, ' ').replace(/\s+/g, ' ');
  return check.length < 142 ? check : `${check.slice(0, 142)}...`;
};