import { unfoldMultiLineString } from "./unfoldMultiLineString"

describe('unfoldMultiLineString', () => {
  test('can unfold string', () => {
    const folded = '\n{\n' +
'  "type": "condition.script",\n' +
'  "name": "mycondition",\n' +
'  "source": "  def hosts=data.change_in_memory.aggregations.per_host.buckets;\\n' +
'  if(hosts.size()==0) return false;\\n  return hosts.stream().anyMatch(h->{\\n' +
'    def mem_deriv=h.memory_per_day.buckets[h.memory_per_day.buckets.length-1].memory_deriv.value;\\n' +
'    return mem_deriv<data.constants.mem_threshold;\\n' +
'  });"\n' +
'}\n';

    const unfolded = `
{
  "type": "condition.script",
  "name": "mycondition",
  "source": """
  def hosts=data.change_in_memory.aggregations.per_host.buckets;
  if(hosts.size()==0) return false;
  return hosts.stream().anyMatch(h->{
    def mem_deriv=h.memory_per_day.buckets[h.memory_per_day.buckets.length-1].memory_deriv.value;
    return mem_deriv<data.constants.mem_threshold;
  });
"""
}
`;

    expect(unfoldMultiLineString(folded)).toBe(unfolded);
  });

  test('dont unfold strings with no \\n', () => {
    expect(unfoldMultiLineString('{"a": "hello world"}')).toBe('{"a": "hello world"}');
  });
});
