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
});
