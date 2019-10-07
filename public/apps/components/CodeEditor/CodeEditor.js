import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AceEditor from 'react-ace';

class CodeEditor extends Component {
  aceEditorRef = aceEditor => {
    if (aceEditor) {
      this.aceEditor = aceEditor;
    }
  };

  isCustomMode = () => typeof this.props.mode === 'object';

  setCustomMode = () => {
    this.aceEditor.editor.getSession().setMode(this.props.mode);
  };

  insertText = ({ row, column, text } = {}) => {
    const isInsertAllowed = Number.isInteger(row) && Number.isInteger(column)
      && typeof text === 'string' && text;

    if (isInsertAllowed) {
      this.aceEditor.editor.session.insert({ row, column }, text);
    } else {
      console.debug('CodeEditor -- text insert is not allowed', { row, column, text });
    }
  };

  componentDidMount() {
    const { insertText = {} } = this.props;
    this.insertText(insertText);

    if (this.isCustomMode()) {
      this.setCustomMode();
    }
  }

  componentDidUpdate({
    mode: prevMode,
    insertText: prevInsertText = {},
  }) {
    const { mode, insertText = {} } = this.props;

    if (mode !== prevMode && this.isCustomMode()) {
      this.setCustomMode();
    }

    const { row, column, text } = insertText;
    const {
      row: prevRow,
      column: prevColumn,
      text: prevText,
    } = prevInsertText;

    if (row !== prevRow || column !== prevColumn || text !== prevText) {
      this.insertText({ row, column, text });
    }
  }

  render() {
    const {
      width,
      height,
      isReadOnly,
      setOptions,
      editorProps,
      mode,
      theme,
      ...rest
    } = this.props;

    const options = {
      ...setOptions,
      readOnly: isReadOnly,
      theme: `ace/theme/${theme}`
    };

    if (this.isCustomMode()) {
      delete rest.mode;
    } else {
      options.mode = `ace/mode/${mode}`;
    }

    return (
      <AceEditor
        ref={this.aceEditorRef}
        setOptions={options}
        width={width}
        height={height}
        editorProps={editorProps}
        {...rest}
      />
    );
  }
}

CodeEditor.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  isReadOnly: PropTypes.bool,
  mode: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  theme: PropTypes.string,
  setOptions: PropTypes.object,
  onChange: PropTypes.func,
  insertText: PropTypes.shape({
    row: PropTypes.number,
    column: PropTypes.number,
    text: PropTypes.string
  }),
  editorProps: PropTypes.object,
};

CodeEditor.defaultProps = {
  isReadOnly: false,
  setOptions: {},
  theme: 'github',
  mode: 'json',
  editorProps: {
    $blockScrolling: Infinity
  },
};

export default CodeEditor;
