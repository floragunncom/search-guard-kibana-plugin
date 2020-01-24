import buildActionAccounts from './buildActionAccounts';

describe('buildActionAccounts', () => {
  const accounts = [
    { _id: '123', type: 'EMAIL' },
    { _id: '456', type: 'SLACK' }
  ];

  test('can build accounts', () => {
    expect(buildActionAccounts(accounts, 'email')).toEqual([
      { label: '123' },
    ]);
  });

  test('can build accounts if no type', () => {
    expect(buildActionAccounts(accounts)).toEqual([
      { label: '123' },
      { label: '456' }
    ]);
  });
});
