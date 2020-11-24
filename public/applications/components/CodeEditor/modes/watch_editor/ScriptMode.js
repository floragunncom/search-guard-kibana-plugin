import ace from 'brace';
import 'brace/mode/json';
import { ScriptHighlightRules } from './ScriptHighlightRules';

ace.acequire('ace/tokenizer');
const { Mode: TextMode } = ace.acequire('ace/mode/text');
const { FoldMode } = ace.acequire('ace/mode/folding/cstyle');
const { CstyleBehaviour } = ace.acequire('ace/mode/behaviour/cstyle');
const { MatchingBraceOutdent } = ace.acequire('ace/mode/matching_brace_outdent');

export class ScriptMode extends TextMode {
  constructor() {
    super();

    this.foldingRules = new FoldMode();
    this.$behaviour = new CstyleBehaviour();
    this.$outdent = new MatchingBraceOutdent();
    this.HighlightRules = ScriptHighlightRules;
  }

  getNextLineIndent(state, line, tab) {
    let indent = this.$getIndent(line);

    const match = line.match(/^.*[\{\(\[]\s*$/);
    if (match) {
      indent += tab;
    }

    return indent;
  }

  checkOutdent(state, line, input) {
    return this.$outdent.checkOutdent(line, input);
  }

  autoOutdent(state, doc, row) {
    this.$outdent.autoOutdent(doc, row);
  }
}