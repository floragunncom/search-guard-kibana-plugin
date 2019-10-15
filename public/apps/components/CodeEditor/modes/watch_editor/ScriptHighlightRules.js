import ace from 'brace';

const { TextHighlightRules } = ace.acequire('ace/mode/text_highlight_rules');

export class ScriptHighlightRules extends TextHighlightRules {
  constructor() {
    super();

    this.$rules = {
      'start': [
        {
          token: 'script.keyword',
          // eslint-disable-next-line max-len
          regex: 'throw|break|long|if|ctx|null|do|for|else|char|int|String|while|double|return|float|this|instanceof|catch|new|def|try|byte|continue'
        },
        {
          token: 'script.string', // single line
          regex: '[\'](?:(?:\\\\.)|(?:[^\'\\\\]))*?[\']'
        },
        {
          token: 'script.constant.numeric', // hex
          regex: '0[xX][0-9a-fA-F]+\\b'
        },
        {
          token: 'script.constant.numeric', // float
          regex: '[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b'
        },
        {
          token: 'script.constant.language.boolean',
          regex: '(?:true|false)\\b'
        },
        {
          token: 'script.text',
          regex: '[a-zA-Z_$][a-zA-Z0-9_$]*\\b'
        },
        {
          token: 'script.lparen',
          regex: '[[({]'
        },
        {
          token: 'script.rparen',
          regex: '[\\])}]'
        },
        {
          token: 'script.text',
          regex: '\\s+'
        }
      ]
    };
  }
} 
