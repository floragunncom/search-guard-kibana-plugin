import { getCheckBlockTitle } from './getCheckBlockTitle';

describe('getCheckBlockTitle', () => {
  test('get name', () => {
    const check = JSON.stringify({
      a: 1,
      name: 'aCheck'
    }, null, 2);

    expect(getCheckBlockTitle(check)).toBe('aCheck');
  });

  test('get check string if no name found', () => {
    const check = JSON.stringify({
      a: 1,
      n: 'aCheck'
    }, null, 2);

    expect(getCheckBlockTitle(check)).toBe('{ "a": 1, "n": "aCheck" }');
  });

  test('get a slice of the long check string if no name found', () => {
    const check = JSON.stringify({
      a: 1,
      n: 'aCheck',
      suuuuuuuuuuperLooooooooooooooooooooongKeeeeeeeeeeeyyyyyyyyyyyyyyy1: 1,
      suuuuuuuuuuperLooooooooooooooooooooongKeeeeeeeeeeeyyyyyyyyyyyyyyy2: 2
    }, null, 2);

    expect(getCheckBlockTitle(check)).toBe(
      '{ "a": 1, "n": "aCheck", ' +
      '"suuuuuuuuuuperLooooooooooooooooooooongKeeeeeeeeeeeyyyyyyyyyyyyyyy1": 1, ' +
      '"suuuuuuuuuuperLooooooooooooooooooooongKeeee...'
    );
  });
});