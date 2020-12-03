import { unfoldMultiLineString } from "./unfoldMultiLineString"

describe('unfoldMultiLineString', () => {
  test('can unfold string', () => {
    const folded = JSON.stringify([{
      source: '      a[\'b\'] = 0;\n      a["c"] = 1;' 
    }], null, 2);

    const unfolded = `[
  {
    "source": """
      a['b'] = 0;
      a["c"] = 1;
"""
  }
]`;

    expect(unfoldMultiLineString(folded)).toBe(unfolded);
  });

  test('dont unfold strings with no \\n', () => {
    expect(unfoldMultiLineString('{"a": "hello world"}')).toBe('{"a": "hello world"}');
  });
});
