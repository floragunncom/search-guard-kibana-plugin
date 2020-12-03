/* eslint-disable @kbn/eslint/require-license-header */
import ace from 'brace';
import 'brace/mode/json';
import 'brace/ext/language_tools';
import { ScriptMode } from './ScriptMode';
import { WatchHighlightRules } from './WatchHighlightRules';
import { watchWorker } from './worker';
import { WatchCompletions } from './WatchCompletions';

const { Tokenizer } = ace.acequire('ace/tokenizer');
const { Mode: TextMode } = ace.acequire('ace/mode/text');
const { FoldMode } = ace.acequire('ace/mode/folding/cstyle');
const { WorkerClient } = ace.acequire('ace/worker/worker_client');
const { CstyleBehaviour } = ace.acequire('ace/mode/behaviour/cstyle');
const { MatchingBraceOutdent } = ace.acequire('ace/mode/matching_brace_outdent');

export class WatchMode extends TextMode {
  constructor() {
    super();

    this.foldingRules = new FoldMode();
    this.$behaviour = new CstyleBehaviour();
    this.$completer = new WatchCompletions();
    this.$outdent = new MatchingBraceOutdent();
    this.$tokenizer = new Tokenizer(new WatchHighlightRules().getRules());

    // Delegate all script specific behaviour to the ScriptMode
    // https://github.com/ajaxorg/ace/wiki/Creating-or-Extending-an-Edit-Mode#mode-delegation
    this.createModeDelegates({
      'script-': ScriptMode,
    });
  }

  getCompletions(state, session, pos, prefix) {
    return this.$completer.getCompletions(state, session, pos, prefix);
  }

  getNextLineIndent(state, line, tab) {
    let indent = this.$getIndent(line);

    if (state !== 'string_literal') {
      const match = line.match(/^.*[\{\(\[]\s*$/);
      if (match) {
        indent += tab;
      }
    }

    return indent;
  }

  checkOutdent(state, line, input) {
    return this.$outdent.checkOutdent(line, input);
  }

  autoOutdent(state, doc, row) {
    this.$outdent.autoOutdent(doc, row);
  }

  createWorker(session) {
    const worker = new WorkerClient(['ace', 'watch_editor'], watchWorker, 'WatchWorker');

    worker.attachToDocument(session.getDocument());

    worker.on('error', function(e) {
      session.setAnnotations(e.data);
    });

    worker.on('ok', function(e) {
      session.setAnnotations(e.data);
    });

    return worker;
  }
}
