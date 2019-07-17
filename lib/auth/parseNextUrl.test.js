import { parseNextUrl } from './parseNextUrl';

describe('parse next url', () => {
  it('get /path', () => {
    const basePath = '';
    const nextUrl = '/path';
    expect(parseNextUrl(nextUrl, basePath)).toBe(nextUrl);
  });

  it('get basepath/path', () => {
    const basePath = 'basepath';
    const nextUrl = '/path';
    expect(parseNextUrl(nextUrl, basePath)).toBe(basePath + nextUrl);
  });

  it('get /', () => {
    const basePath = '';

    let nextUrl = 'http://host.com:80/path';
    expect(parseNextUrl(nextUrl, basePath)).toBe('/');

    nextUrl = '//host.com:80/path';
    expect(parseNextUrl(nextUrl, basePath)).toBe('/');
  });

  it('get basepath/', () => {
    const basePath = 'basepath';

    let nextUrl = 'http://host.com:80/path';
    expect(parseNextUrl(nextUrl, basePath)).toBe(`${basePath}/`);

    nextUrl = '//host.com:80/path';
    expect(parseNextUrl(nextUrl, basePath)).toBe(`${basePath}/`);
  });
});
