import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ace from 'brace';
//import 'brace/ext/language_tools';
import Modes from './modes';

export class CodeEditor extends Component {
  constructor(props) {
    super(props);
    this.refEditor;

    this.state = {
      isSilent: false
    };
  }

  componentDidMount() {
    const {
      mode,
      theme,
      value,
      isCustomMode,
      insertText,
      foldStyle,
      setOptions: options,
    } = this.props;

    this.editor = ace.edit(this.refEditor);
    this.editor.$blockScrolling = Infinity;

    if (isCustomMode) {
      //this.editor.getSession().setMode(new Modes[mode]);
    } else {
      try {
        //require(`brace/mode/${mode}`);
        //this.editor.getSession().setMode(`ace/mode/${mode}`);
      } catch (error) {
        console.error(`CodeEditor -- ace mode '${mode}' not found`);
      }
    }

    try {
      //require(`brace/theme/${theme}`);
      //this.editor.setTheme(`ace/theme/${theme}`);
    } catch (error) {
      console.error(`CodeEditor -- ace theme '${theme}' not found`);
    }

    if (typeof value === 'string') {
      this.editor.getSession().setValue(value);
    }

    this.editor.getSession().setFoldStyle(foldStyle);
    this.editor.on('change', this.onChange);
    this.editor.on('blur', this.onBlur);

    Object.keys(options).forEach(option => {
      if (this.editor.$options.hasOwnProperty(option)) {
        this.editor.setOption(option, options[option]);
      } else if (options[option]) {
        console.warn(`CodeEditor -- ace option '${option}' not found`);
      }
    });

    this.insertText(insertText);
  }

  componentDidUpdate({ insertText: prevInsertText }) {
    const { insertText: { row, column, text }, value } = this.props;

    if (this.editor && this.editor.getValue() !== value && typeof value === 'string') {
      this.setState({ isSilent: true });
      this.editor.getSession().setValue(value);
      this.setState({ isSilent: false });
    }

    const { row: prevRow, column: prevColumn, text: prevText } = prevInsertText;
    if (typeof text === 'string' && (row !== prevRow || column !== prevColumn || text !== prevText)) {
      this.insertText({ row, column, text });
    }
  }

  onChange = e => {
    if (typeof this.props.onChange === 'function' && !this.state.isSilent) {
      const value = this.editor.getValue();
      this.props.onChange(e, value);
    }
  }

  onBlur = e => {
    if (typeof this.props.onBlur === 'function') {
      this.props.onBlur(e, this.editor);
    }
  }

  insertText = ({ row, column, text } = {}) => {
    const isInsertAllowed = Number.isInteger(row) && Number.isInteger(column)
      && typeof text === 'string' && text;

    if (isInsertAllowed) {
      this.editor.session.insert({ row, column }, text);
    }
  }

  updateRef = item => this.refEditor = item;

  render() {
    const { id, width, height, style } = this.props;

    return <div
      id={id}
      ref={this.updateRef}
      style={{ width, height, ...style }}
    />;
  }
}

CodeEditor.propTypes = {
  id: PropTypes.string,
  mode: PropTypes.string,
  theme: PropTypes.string,
  isCustomMode: PropTypes.bool,
  foldStyle: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
  style: PropTypes.object,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  insertText: PropTypes.shape({
    row: PropTypes.number,
    column: PropTypes.number,
    text: PropTypes.string
  }),
  setOptions: PropTypes.shape({
    tabSize: PropTypes.number,
    useSoftTabs: PropTypes.bool,
    readOnly: PropTypes.bool,
    highlightActiveLine: PropTypes.bool,
    highlightSelectedWord: PropTypes.bool,
    enableBasicAutocompletion: PropTypes.bool,
    enableLiveAutocompletion: PropTypes.bool,
    enableSnippets: PropTypes.bool
  })
};

CodeEditor.defaultProps = {
  id: 'ace-code-editor',
  mode: 'text',
  theme: 'github',
  isCustomMode: false,
  foldStyle: 'markbeginend',
  width: '100%',
  height: '200px',
  style: {},
  insertText: {},
  setOptions: {
    tabSize: 2,
    useSoftTabs: true,
    readOnly: false,
    highlightActiveLine: true,
    highlightSelectedWord: true,
    enableBasicAutocompletion: false,
    enableLiveAutocompletion: false,
    enableSnippets: false
  }
};