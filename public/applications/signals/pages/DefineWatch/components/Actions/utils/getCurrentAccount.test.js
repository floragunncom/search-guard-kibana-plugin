import getCurrentAccount from './getCurrentAccount';

describe('getCurrentAccount', () => {
  test('can return action account', () => {
    const allAccounts = [{ _id: '123' }];
    const account = [{ label: '123' }];

    expect(getCurrentAccount(allAccounts, account)).toEqual({ _id: '123' });
  });

  test('return undefined if no current account', () => {
    const allAccounts = [{ _id: '123' }];
    const account = [];

    expect(getCurrentAccount(allAccounts, account)).toEqual(undefined);
  });

  test('returns the tenant account when it shadows a global account', () => {
    const globalAccount = { _id: 'shared', default_from: 'global@example.com' };
    const tenantAccount = {
      _id: 'shared',
      _tenant: '_main',
      default_from: 'tenant@example.com',
    };

    expect(getCurrentAccount([tenantAccount, globalAccount], [{ label: 'shared' }])).toEqual(
      tenantAccount
    );
  });
});
