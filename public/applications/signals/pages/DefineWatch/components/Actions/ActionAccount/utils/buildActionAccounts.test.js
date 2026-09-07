import buildActionAccounts from './buildActionAccounts';

describe('buildActionAccounts', () => {
  const accounts = [
    { _id: '123', type: 'EMAIL' },
    { _id: '456', type: 'SLACK' },
  ];

  test('can build accounts', () => {
    expect(buildActionAccounts(accounts, 'email')).toEqual([{ label: '123' }]);
  });

  test('can build accounts if no type', () => {
    expect(buildActionAccounts(accounts)).toEqual([{ label: '123' }, { label: '456' }]);
  });

  test('shows a shadowed account name only once', () => {
    const shadowedAccounts = [
      { _id: 'shared', type: 'EMAIL' },
      { _id: 'shared', _tenant: '_main', type: 'EMAIL' },
    ];

    expect(buildActionAccounts(shadowedAccounts, 'email')).toEqual([{ label: 'shared' }]);
  });
});
