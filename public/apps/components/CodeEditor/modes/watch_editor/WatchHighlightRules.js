import ace from 'brace';
import { ScriptHighlightRules } from './ScriptHighlightRules';

const { TextHighlightRules } = ace.acequire('ace/mode/text_highlight_rules');

export class WatchHighlightRules extends TextHighlightRules {
  constructor() {
    super();

    this.$rules = {
      start: [
        {
          token: ['variable', 'whitespace', 'punctuation.colon', 'whitespace', 'punctuation.start_triple_quote'],
          regex: '("source")(\\s*?)(:)(\\s*?)("{3})',
          next: 'script-start',
          push: true
        },
        {
          token: 'punctuation.start_triple_quote',
          regex: '"{3}',
          next: 'string_literal',
          push: true
        },
        {
          token: 'punctuation.colon',
          regex: ':'
        },
        {
          token: 'whitespace',
          regex: '\\s+'
        },
        {
          token: 'variable', // single line
          regex: '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]\\s*(?=:)'
        },
        {
          token: 'string', // single line
          regex: '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]'
        },
        {
          token: 'constant.numeric', // hex
          regex: '0[xX][0-9a-fA-F]+\\b'
        },
        {
          token: 'constant.numeric', // float
          regex: '[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b'
        },
        {
          token: 'constant.language.boolean',
          regex: '(?:true|false)\\b'
        },
        {
          token: 'invalid.illegal', // single quoted strings are not allowed
          regex: '[\'](?:(?:\\\\.)|(?:[^\'\\\\]))*?[\']'
        },
        {
          token: 'invalid.illegal', // comments are not allowed
          regex: '\\/\\/.*$'
        },
        {
          token: 'paren.lparen',
          regex: '[[({]'
        },
        {
          token: 'paren.rparen',
          regex: '[\\])}]'
        },
        {
          token: 'text',
          regex: '.+?'
        }
      ],
      string_literal: [
        {
          token: 'punctuation.end_triple_quote',
          regex: '"{3}',
          next: 'pop'
        }
      ]
    };

    this.embedRules(ScriptHighlightRules, 'script-', [{
      token: 'punctuation.end_triple_quote',
      regex: '"{3}',
      next: 'pop',
    }]);

    this.normalizeRules();
  }
}