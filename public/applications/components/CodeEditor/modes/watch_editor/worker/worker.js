/* eslint-disable */
/*
 * Copyright 2013 Thorsten Lorenz. 
 * All rights reserved.
 * 
 * https://opensource.org/licenses/MIT
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
*/

/*
 * Distributed under the BSD license:
 *
 * Copyright (c) 2010, Ajax.org B.V.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Ajax.org B.V. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

/*
  * Copyright 2015-2019 _floragunn_ GmbH
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  * http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

'no use strict';
!(function (window) {
  function resolveModuleId(id, paths) {
    for (let testPath = id, tail = ''; testPath;) {
      const alias = paths[testPath];
      if ('string' === typeof alias) return alias + tail;
      if (alias) {return alias.location.replace(/\/*$/, '/') +
              (tail || alias.main || alias.name);}
      if (alias === !1) return '';
      const i = testPath.lastIndexOf('/');
      if (-1 === i) break;
      tail = testPath.substr(i) + tail, testPath = testPath.slice(0, i);
    }
    return id;
  }
  if (!(void 0 !== window.window && window.document || window.acequire && window.define)) {
    window.console || (window.console = function () {
      const msgs = Array.prototype.slice.call(arguments, 0);
      postMessage({
        type: 'log',
        data: msgs
      });
    }, window.console.error = window.console.warn = window.console.log = window.console.trace = window.console), window.window = window, window.ace = window, window.onerror = function (message, file, line, col, err) {
      postMessage({
        type: 'error',
        data: {
          message: message,
          data: err.data,
          file: file,
          line: line,
          col: col,
          stack: err.stack
        }
      });
    }, window.normalizeModule = function (parentId, moduleName) {
      if (-1 !== moduleName.indexOf('!')) {
        const chunks = moduleName.split('!');
        return window.normalizeModule(parentId, chunks[0]) + '!' +
                  window.normalizeModule(parentId, chunks[1]);
      }
      if ('.' == moduleName.charAt(0)) {
        const base = parentId.split('/').slice(0, -1).join('/');
        for (moduleName = (base ? base + '/' : '') + moduleName;
          -1 !== moduleName.indexOf('.') && previous != moduleName;) {
          var previous = moduleName;
          moduleName = moduleName
            .replace(/^\.\/ /, '')
            .replace(/\/\.\//, '/')
            .replace(/[^\/]+\/\.\.\//, '');
        }
      }
      return moduleName;
    }, window.acequire = function acequire(parentId, id) {
      if (id || (id = parentId, parentId = null), !id.charAt)
      {throw Error('worker.js acequire() accepts only (parentId, id) as arguments');}
      id = window.normalizeModule(parentId, id);
      const module = window.acequire.modules[id];
      if (module)
      {return module.initialized ||
                (module.initialized = !0, module.exports = module.factory().exports),
      module.exports;}
      if (!window.acequire.tlns) return console.log('unable to load ' + id);
      let path = resolveModuleId(id, window.acequire.tlns);
      return '.js' != path.slice(-3) && (path += '.js'), window.acequire.id = id, window.acequire.modules[id] = {}, importScripts(path), window.acequire(parentId, id);
    },
    window.acequire.modules = {},
    window.acequire.tlns = {},
    window.define = function (id, deps, factory) {
      if (2 == arguments.length ?
        (factory = deps, 'string' !== typeof id && (deps = id, id = window.acequire.id)) : 1 == arguments.length && (factory = id, deps = [], id = window.acequire.id), 'function' !== typeof factory) {return window.acequire.modules[id] = {
        exports: factory,
        initialized: !0
      }, void 0;}
      deps.length || (deps = ['require', 'exports', 'module']);
      const req = function (childId) {
        return window.acequire(id, childId);
      };
      window.acequire.modules[id] = {
        exports: {},
        factory: function () {
          const module = this;
          const returnExports = factory.apply(this, deps.map(function (dep) {
            switch (dep) {
              case 'require':
                return req;
              case 'exports':
                return module.exports;
              case 'module':
                return module;
              default:
                return req(dep);
            }
          }));
          return returnExports && (module.exports = returnExports), module;
        }
      };
    }, window.define.amd = {}, acequire.tlns = {}, window.initBaseUrls = function (topLevelNamespaces) {
      for (const i in topLevelNamespaces) acequire.tlns[i] = topLevelNamespaces[i];
    }, window.initSender = function () {
      const EventEmitter = window.acequire('ace/lib/event_emitter').EventEmitter;
      const oop = window.acequire('ace/lib/oop');
      const Sender = function () {};
      return function () {
        oop.implement(this, EventEmitter), this.callback = function (data, callbackId) {
          postMessage({
            type: 'call',
            id: callbackId,
            data: data
          });
        }, this.emit = function (name, data) {
          postMessage({
            type: 'event',
            name: name,
            data: data
          });
        };
      }.call(Sender.prototype), new Sender;
    };
    let main = window.main = null;
    let sender = window.sender = null;
    window.onmessage = function (e) {
      const msg = e.data;
      if (msg.event && sender) sender._signal(msg.event, msg.data);
      else if (msg.command)
      {if (main[msg.command]) main[msg.command].apply(main, msg.args);
      else {
        if (!window[msg.command]) throw Error('Unknown command:' + msg.command);
        window[msg.command].apply(window, msg.args);
      }}
      else if (msg.init) {
        window.initBaseUrls(msg.tlns), acequire('ace/lib/es5-shim'), sender = window.sender = window.initSender();
        const clazz = acequire(msg.module)[msg.classname];
        main = window.main = new clazz(sender);
      }
    };
  }
}(this)), ace.define('ace/lib/oop', ['require', 'exports', 'module'], function (acequire, exports) {

  exports.inherits = function (ctor, superCtor) {
    ctor.super_ = superCtor, ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: !1,
        writable: !0,
        configurable: !0
      }
    });
  }, exports.mixin = function (obj, mixin) {
    for (const key in mixin) obj[key] = mixin[key];
    return obj;
  }, exports.implement = function (proto, mixin) {
    exports.mixin(proto, mixin);
  };
}), ace.define('ace/range', ['require', 'exports', 'module'], function (acequire, exports) {

  const comparePoints = function (p1, p2) {
    return p1.row - p2.row || p1.column - p2.column;
  };
  const Range = function (startRow, startColumn, endRow, endColumn) {
    this.start = {
      row: startRow,
      column: startColumn
    }, this.end = {
      row: endRow,
      column: endColumn
    };
  };
  (function () {
    this.isEqual = function (range) {
      return this.start.row === range.start.row && this.end.row === range.end.row && this.start.column === range.start.column && this.end.column === range.end.column;
    }, this.toString = function () {
      return 'Range: [' + this.start.row + '/' + this.start.column + '] -> [' + this.end.row + '/' + this.end.column + ']';
    }, this.contains = function (row, column) {
      return 0 == this.compare(row, column);
    }, this.compareRange = function (range) {
      let cmp; const end = range.end;
      const start = range.start;
      return cmp = this.compare(end.row, end.column), 1 == cmp ? (cmp = this.compare(start.row, start.column), 1 == cmp ? 2 : 0 == cmp ? 1 : 0) : -1 == cmp ? -2 : (cmp = this.compare(start.row, start.column), -1 == cmp ? -1 : 1 == cmp ? 42 : 0);
    }, this.comparePoint = function (p) {
      return this.compare(p.row, p.column);
    }, this.containsRange = function (range) {
      return 0 == this.comparePoint(range.start) && 0 == this.comparePoint(range.end);
    }, this.intersects = function (range) {
      const cmp = this.compareRange(range);
      return -1 == cmp || 0 == cmp || 1 == cmp;
    }, this.isEnd = function (row, column) {
      return this.end.row == row && this.end.column == column;
    }, this.isStart = function (row, column) {
      return this.start.row == row && this.start.column == column;
    }, this.setStart = function (row, column) {

      'object' === typeof row ? (this.start.column = row.column, this.start.row = row.row) : (this.start.row = row, this.start.column = column);
    }, this.setEnd = function (row, column) {

      'object' === typeof row ? (this.end.column = row.column, this.end.row = row.row) : (this.end.row = row, this.end.column = column);
    }, this.inside = function (row, column) {
      return 0 == this.compare(row, column) ? this.isEnd(row, column) || this.isStart(row, column) ? !1 : !0 : !1;
    }, this.insideStart = function (row, column) {
      return 0 == this.compare(row, column) ? this.isEnd(row, column) ? !1 : !0 : !1;
    }, this.insideEnd = function (row, column) {
      return 0 == this.compare(row, column) ? this.isStart(row, column) ? !1 : !0 : !1;
    }, this.compare = function (row, column) {
      return this.isMultiLine() || row !== this.start.row ? this.start.row > row ? -1 : row > this.end.row ? 1 : this.start.row === row ? column >= this.start.column ? 0 : -1 : this.end.row === row ? this.end.column >= column ? 0 : 1 : 0 : this.start.column > column ? -1 : column > this.end.column ? 1 : 0;
    }, this.compareStart = function (row, column) {
      return this.start.row == row && this.start.column == column ? -1 : this.compare(row, column);
    }, this.compareEnd = function (row, column) {
      return this.end.row == row && this.end.column == column ? 1 : this.compare(row, column);
    }, this.compareInside = function (row, column) {
      return this.end.row == row && this.end.column == column ? 1 : this.start.row == row && this.start.column == column ? -1 : this.compare(row, column);
    }, this.clipRows = function (firstRow, lastRow) {
      if (this.end.row > lastRow) {var end = {
        row: lastRow + 1,
        column: 0
      };}
      else if (firstRow > this.end.row) {var end = {
        row: firstRow,
        column: 0
      };}
      if (this.start.row > lastRow) {var start = {
        row: lastRow + 1,
        column: 0
      };}
      else if (firstRow > this.start.row) {var start = {
        row: firstRow,
        column: 0
      };}
      return Range.fromPoints(start || this.start, end || this.end);
    }, this.extend = function (row, column) {
      const cmp = this.compare(row, column);
      if (0 == cmp) return this;
      if (-1 == cmp) {var start = {
        row: row,
        column: column
      };}
      else {var end = {
        row: row,
        column: column
      };}
      return Range.fromPoints(start || this.start, end || this.end);
    }, this.isEmpty = function () {
      return this.start.row === this.end.row && this.start.column === this.end.column;
    }, this.isMultiLine = function () {
      return this.start.row !== this.end.row;
    }, this.clone = function () {
      return Range.fromPoints(this.start, this.end);
    }, this.collapseRows = function () {
      return 0 == this.end.column ? new Range(this.start.row, 0, Math.max(this.start.row, this.end.row - 1), 0) : new Range(this.start.row, 0, this.end.row, 0);
    }, this.toScreenRange = function (session) {
      const screenPosStart = session.documentToScreenPosition(this.start);
      const screenPosEnd = session.documentToScreenPosition(this.end);
      return new Range(screenPosStart.row, screenPosStart.column, screenPosEnd.row, screenPosEnd.column);
    }, this.moveBy = function (row, column) {
      this.start.row += row, this.start.column += column, this.end.row += row, this.end.column += column;
    };
  }).call(Range.prototype), Range.fromPoints = function (start, end) {
    return new Range(start.row, start.column, end.row, end.column);
  }, Range.comparePoints = comparePoints, Range.comparePoints = function (p1, p2) {
    return p1.row - p2.row || p1.column - p2.column;
  }, exports.Range = Range;
}), ace.define('ace/apply_delta', ['require', 'exports', 'module'], function (acequire, exports) {

  exports.applyDelta = function (docLines, delta) {
    const row = delta.start.row;
    const startColumn = delta.start.column;
    const line = docLines[row] || '';
    switch (delta.action) {
      case 'insert':
        var lines = delta.lines;
        if (1 === lines.length) docLines[row] = line.substring(0, startColumn) + delta.lines[0] + line.substring(startColumn);
        else {
          const args = [row, 1].concat(delta.lines);
          docLines.splice.apply(docLines, args), docLines[row] = line.substring(0, startColumn) + docLines[row], docLines[row + delta.lines.length - 1] += line.substring(startColumn);
        }
        break;
      case 'remove':
        var endColumn = delta.end.column;
        var endRow = delta.end.row;
        row === endRow ? docLines[row] = line.substring(0, startColumn) + line.substring(endColumn) : docLines.splice(row, endRow - row + 1, line.substring(0, startColumn) + docLines[endRow].substring(endColumn));
    }
  };
}), ace.define('ace/lib/event_emitter', ['require', 'exports', 'module'], function (acequire, exports) {

  const EventEmitter = {};
  const stopPropagation = function () {
    this.propagationStopped = !0;
  };
  const preventDefault = function () {
    this.defaultPrevented = !0;
  };
  EventEmitter._emit = EventEmitter._dispatchEvent = function (eventName, e) {
    this._eventRegistry || (this._eventRegistry = {}), this._defaultHandlers || (this._defaultHandlers = {});
    let listeners = this._eventRegistry[eventName] || [];
    const defaultHandler = this._defaultHandlers[eventName];
    if (listeners.length || defaultHandler) {

      'object' === typeof e && e || (e = {}), e.type || (e.type = eventName), e.stopPropagation || (e.stopPropagation = stopPropagation), e.preventDefault || (e.preventDefault = preventDefault), listeners = listeners.slice();
      for (let i = 0; listeners.length > i && (listeners[i](e, this), !e.propagationStopped); i++);
      return defaultHandler && !e.defaultPrevented ? defaultHandler(e, this) : void 0;
    }
  }, EventEmitter._signal = function (eventName, e) {
    let listeners = (this._eventRegistry || {})[eventName];
    if (listeners) {
      listeners = listeners.slice();
      for (let i = 0; listeners.length > i; i++) listeners[i](e, this);
    }
  }, EventEmitter.once = function (eventName, callback) {
    const _self = this;
    callback && this.addEventListener(eventName, function newCallback() {
      _self.removeEventListener(eventName, newCallback), callback.apply(null, arguments);
    });
  }, EventEmitter.setDefaultHandler = function (eventName, callback) {
    let handlers = this._defaultHandlers;
    if (handlers || (handlers = this._defaultHandlers = {
      _disabled_: {}
    }), handlers[eventName]) {
      const old = handlers[eventName];
      let disabled = handlers._disabled_[eventName];
      disabled || (handlers._disabled_[eventName] = disabled = []), disabled.push(old);
      const i = disabled.indexOf(callback); -1 != i && disabled.splice(i, 1);
    }
    handlers[eventName] = callback;
  }, EventEmitter.removeDefaultHandler = function (eventName, callback) {
    const handlers = this._defaultHandlers;
    if (handlers) {
      const disabled = handlers._disabled_[eventName];
      if (handlers[eventName] == callback) handlers[eventName], disabled && this.setDefaultHandler(eventName, disabled.pop());
      else if (disabled) {
        const i = disabled.indexOf(callback); -1 != i && disabled.splice(i, 1);
      }
    }
  }, EventEmitter.on = EventEmitter.addEventListener = function (eventName, callback, capturing) {
    this._eventRegistry = this._eventRegistry || {};
    let listeners = this._eventRegistry[eventName];
    return listeners || (listeners = this._eventRegistry[eventName] = []), -1 == listeners.indexOf(callback) && listeners[capturing ? 'unshift' : 'push'](callback), callback;
  }, EventEmitter.off = EventEmitter.removeListener = EventEmitter.removeEventListener = function (eventName, callback) {
    this._eventRegistry = this._eventRegistry || {};
    const listeners = this._eventRegistry[eventName];
    if (listeners) {
      const index = listeners.indexOf(callback); -1 !== index && listeners.splice(index, 1);
    }
  }, EventEmitter.removeAllListeners = function (eventName) {
    this._eventRegistry && (this._eventRegistry[eventName] = []);
  }, exports.EventEmitter = EventEmitter;
}), ace.define('ace/anchor', ['require', 'exports', 'module', 'ace/lib/oop', 'ace/lib/event_emitter'], function (acequire, exports) {

  const oop = acequire('./lib/oop');
  const EventEmitter = acequire('./lib/event_emitter').EventEmitter;
  const Anchor = exports.Anchor = function (doc, row, column) {
    this.$onChange = this.onChange.bind(this), this.attach(doc), column === void 0 ? this.setPosition(row.row, row.column) : this.setPosition(row, column);
  };
  (function () {
    function $pointsInOrder(point1, point2, equalPointsInOrder) {
      const bColIsAfter = equalPointsInOrder ? point1.column <= point2.column : point1.column < point2.column;
      return point1.row < point2.row || point1.row == point2.row && bColIsAfter;
    }

    function $getTransformedPoint(delta, point, moveIfEqual) {
      const deltaIsInsert = 'insert' == delta.action;
      const deltaRowShift = (deltaIsInsert ? 1 : -1) * (delta.end.row - delta.start.row);
      const deltaColShift = (deltaIsInsert ? 1 : -1) * (delta.end.column - delta.start.column);
      const deltaStart = delta.start;
      const deltaEnd = deltaIsInsert ? deltaStart : delta.end;
      return $pointsInOrder(point, deltaStart, moveIfEqual) ? {
        row: point.row,
        column: point.column
      } : $pointsInOrder(deltaEnd, point, !moveIfEqual) ? {
        row: point.row + deltaRowShift,
        column: point.column + (point.row == deltaEnd.row ? deltaColShift : 0)
      } : {
        row: deltaStart.row,
        column: deltaStart.column
      };
    }
    oop.implement(this, EventEmitter), this.getPosition = function () {
      return this.$clipPositionToDocument(this.row, this.column);
    }, this.getDocument = function () {
      return this.document;
    }, this.$insertRight = !1, this.onChange = function (delta) {
      if (!(delta.start.row == delta.end.row && delta.start.row != this.row || delta.start.row > this.row)) {
        const point = $getTransformedPoint(delta, {
          row: this.row,
          column: this.column
        }, this.$insertRight);
        this.setPosition(point.row, point.column, !0);
      }
    }, this.setPosition = function (row, column, noClip) {
      let pos;
      if (pos = noClip ? {
        row: row,
        column: column
      } : this.$clipPositionToDocument(row, column), this.row != pos.row || this.column != pos.column) {
        const old = {
          row: this.row,
          column: this.column
        };
        this.row = pos.row, this.column = pos.column, this._signal('change', {
          old: old,
          value: pos
        });
      }
    }, this.detach = function () {
      this.document.removeEventListener('change', this.$onChange);
    }, this.attach = function (doc) {
      this.document = doc || this.document, this.document.on('change', this.$onChange);
    }, this.$clipPositionToDocument = function (row, column) {
      const pos = {};
      return row >= this.document.getLength() ? (pos.row = Math.max(0, this.document.getLength() - 1), pos.column = this.document.getLine(pos.row).length) : 0 > row ? (pos.row = 0, pos.column = 0) : (pos.row = row, pos.column = Math.min(this.document.getLine(pos.row).length, Math.max(0, column))), 0 > column && (pos.column = 0), pos;
    };
  }).call(Anchor.prototype);
}), ace.define('ace/document', ['require', 'exports', 'module', 'ace/lib/oop', 'ace/apply_delta', 'ace/lib/event_emitter', 'ace/range', 'ace/anchor'], function (acequire, exports) {

  const oop = acequire('./lib/oop');
  const applyDelta = acequire('./apply_delta').applyDelta;
  const EventEmitter = acequire('./lib/event_emitter').EventEmitter;
  const Range = acequire('./range').Range;
  const Anchor = acequire('./anchor').Anchor;
  const Document = function (textOrLines) {
    this.$lines = [''], 0 === textOrLines.length ? this.$lines = [''] : Array.isArray(textOrLines) ? this.insertMergedLines({
      row: 0,
      column: 0
    }, textOrLines) : this.insert({
      row: 0,
      column: 0
    }, textOrLines);
  };
  (function () {
    oop.implement(this, EventEmitter), this.setValue = function (text) {
      const len = this.getLength() - 1;
      this.remove(new Range(0, 0, len, this.getLine(len).length)), this.insert({
        row: 0,
        column: 0
      }, text);
    }, this.getValue = function () {
      return this.getAllLines().join(this.getNewLineCharacter());
    }, this.createAnchor = function (row, column) {
      return new Anchor(this, row, column);
    }, this.$split = 0 === 'aaa'.split(/a/).length ? function (text) {
      return text.replace(/\r\n|\r/g, '\n').split('\n');
    } : function (text) {
      return text.split(/\r\n|\r|\n/);
    }, this.$detectNewLine = function (text) {
      const match = text.match(/^.*?(\\r\\n|\\r|\\n)/m);
      this.$autoNewLine = match ? match[1] : '\n', this._signal('changeNewLineMode');
    }, this.getNewLineCharacter = function () {
      switch (this.$newLineMode) {
        case 'windows':
          return '\r\n';
        case 'unix':
          return '\n';
        default:
          return this.$autoNewLine || '\n';
      }
    }, this.$autoNewLine = '', this.$newLineMode = 'auto', this.setNewLineMode = function (newLineMode) {
      this.$newLineMode !== newLineMode && (this.$newLineMode = newLineMode, this._signal('changeNewLineMode'));
    }, this.getNewLineMode = function () {
      return this.$newLineMode;
    }, this.isNewLine = function (text) {
      return '\r\n' == text || '\r' == text || '\n' == text;
    }, this.getLine = function (row) {
      return this.$lines[row] || '';
    }, this.getLines = function (firstRow, lastRow) {
      return this.$lines.slice(firstRow, lastRow + 1);
    }, this.getAllLines = function () {
      return this.getLines(0, this.getLength());
    }, this.getLength = function () {
      return this.$lines.length;
    }, this.getTextRange = function (range) {
      return this.getLinesForRange(range).join(this.getNewLineCharacter());
    }, this.getLinesForRange = function (range) {
      let lines;
      if (range.start.row === range.end.row) lines = [this.getLine(range.start.row).substring(range.start.column, range.end.column)];
      else {
        lines = this.getLines(range.start.row, range.end.row), lines[0] = (lines[0] || '').substring(range.start.column);
        const l = lines.length - 1;
        range.end.row - range.start.row == l && (lines[l] = lines[l].substring(0, range.end.column));
      }
      return lines;
    }, this.insertLines = function (row, lines) {
      return console.warn('Use of document.insertLines is deprecated. Use the insertFullLines method instead.'), this.insertFullLines(row, lines);
    }, this.removeLines = function (firstRow, lastRow) {
      return console.warn('Use of document.removeLines is deprecated. Use the removeFullLines method instead.'), this.removeFullLines(firstRow, lastRow);
    }, this.insertNewLine = function (position) {
      return console.warn('Use of document.insertNewLine is deprecated. Use insertMergedLines(position, [\'\', \'\']) instead.'), this.insertMergedLines(position, ['', '']);
    }, this.insert = function (position, text) {
      return 1 >= this.getLength() && this.$detectNewLine(text), this.insertMergedLines(position, this.$split(text));
    }, this.insertInLine = function (position, text) {
      const start = this.clippedPos(position.row, position.column);
      const end = this.pos(position.row, position.column + text.length);
      return this.applyDelta({
        start: start,
        end: end,
        action: 'insert',
        lines: [text]
      }, !0), this.clonePos(end);
    }, this.clippedPos = function (row, column) {
      const length = this.getLength();
      void 0 === row ? row = length : 0 > row ? row = 0 : row >= length && (row = length - 1, column = void 0);
      const line = this.getLine(row);
      return void 0 == column && (column = line.length), column = Math.min(Math.max(column, 0), line.length), {
        row: row,
        column: column
      };
    }, this.clonePos = function (pos) {
      return {
        row: pos.row,
        column: pos.column
      };
    }, this.pos = function (row, column) {
      return {
        row: row,
        column: column
      };
    }, this.$clipPosition = function (position) {
      const length = this.getLength();
      return position.row >= length ? (position.row = Math.max(0, length - 1), position.column = this.getLine(length - 1).length) : (position.row = Math.max(0, position.row), position.column = Math.min(Math.max(position.column, 0), this.getLine(position.row).length)), position;
    }, this.insertFullLines = function (row, lines) {
      row = Math.min(Math.max(row, 0), this.getLength());
      let column = 0;
      this.getLength() > row ? (lines = lines.concat(['']), column = 0) : (lines = [''].concat(lines), row--, column = this.$lines[row].length), this.insertMergedLines({
        row: row,
        column: column
      }, lines);
    }, this.insertMergedLines = function (position, lines) {
      const start = this.clippedPos(position.row, position.column);
      const end = {
        row: start.row + lines.length - 1,
        column: (1 == lines.length ? start.column : 0) + lines[lines.length - 1].length
      };
      return this.applyDelta({
        start: start,
        end: end,
        action: 'insert',
        lines: lines
      }), this.clonePos(end);
    }, this.remove = function (range) {
      const start = this.clippedPos(range.start.row, range.start.column);
      const end = this.clippedPos(range.end.row, range.end.column);
      return this.applyDelta({
        start: start,
        end: end,
        action: 'remove',
        lines: this.getLinesForRange({
          start: start,
          end: end
        })
      }), this.clonePos(start);
    }, this.removeInLine = function (row, startColumn, endColumn) {
      const start = this.clippedPos(row, startColumn);
      const end = this.clippedPos(row, endColumn);
      return this.applyDelta({
        start: start,
        end: end,
        action: 'remove',
        lines: this.getLinesForRange({
          start: start,
          end: end
        })
      }, !0), this.clonePos(start);
    }, this.removeFullLines = function (firstRow, lastRow) {
      firstRow = Math.min(Math.max(0, firstRow), this.getLength() - 1), lastRow = Math.min(Math.max(0, lastRow), this.getLength() - 1);
      const deleteFirstNewLine = lastRow == this.getLength() - 1 && firstRow > 0;
      const deleteLastNewLine = this.getLength() - 1 > lastRow;
      const startRow = deleteFirstNewLine ? firstRow - 1 : firstRow;
      const startCol = deleteFirstNewLine ? this.getLine(startRow).length : 0;
      const endRow = deleteLastNewLine ? lastRow + 1 : lastRow;
      const endCol = deleteLastNewLine ? 0 : this.getLine(endRow).length;
      const range = new Range(startRow, startCol, endRow, endCol);
      const deletedLines = this.$lines.slice(firstRow, lastRow + 1);
      return this.applyDelta({
        start: range.start,
        end: range.end,
        action: 'remove',
        lines: this.getLinesForRange(range)
      }), deletedLines;
    }, this.removeNewLine = function (row) {
      this.getLength() - 1 > row && row >= 0 && this.applyDelta({
        start: this.pos(row, this.getLine(row).length),
        end: this.pos(row + 1, 0),
        action: 'remove',
        lines: ['', '']
      });
    }, this.replace = function (range, text) {
      if (range instanceof Range || (range = Range.fromPoints(range.start, range.end)), 0 === text.length && range.isEmpty()) return range.start;
      if (text == this.getTextRange(range)) return range.end;
      this.remove(range);
      let end;
      return end = text ? this.insert(range.start, text) : range.start;
    }, this.applyDeltas = function (deltas) {
      for (let i = 0; deltas.length > i; i++) this.applyDelta(deltas[i]);
    }, this.revertDeltas = function (deltas) {
      for (let i = deltas.length - 1; i >= 0; i--) this.revertDelta(deltas[i]);
    }, this.applyDelta = function (delta, doNotValidate) {
      const isInsert = 'insert' == delta.action;
      (isInsert ? 1 >= delta.lines.length && !delta.lines[0] : !Range.comparePoints(delta.start, delta.end)) || (isInsert && delta.lines.length > 2e4 && this.$splitAndapplyLargeDelta(delta, 2e4), applyDelta(this.$lines, delta, doNotValidate), this._signal('change', delta));
    }, this.$splitAndapplyLargeDelta = function (delta, MAX) {
      for (let lines = delta.lines, l = lines.length, row = delta.start.row, column = delta.start.column, from = 0, to = 0; ;) {
        from = to, to += MAX - 1;
        const chunk = lines.slice(from, to);
        if (to > l) {
          delta.lines = chunk, delta.start.row = row + from, delta.start.column = column;
          break;
        }
        chunk.push(''), this.applyDelta({
          start: this.pos(row + from, column),
          end: this.pos(row + to, column = 0),
          action: delta.action,
          lines: chunk
        }, !0);
      }
    }, this.revertDelta = function (delta) {
      this.applyDelta({
        start: this.clonePos(delta.start),
        end: this.clonePos(delta.end),
        action: 'insert' == delta.action ? 'remove' : 'insert',
        lines: delta.lines.slice()
      });
    }, this.indexToPosition = function (index, startRow) {
      for (var lines = this.$lines || this.getAllLines(), newlineLength = this.getNewLineCharacter().length, i = startRow || 0, l = lines.length; l > i; i++)
      {if (index -= lines[i].length + newlineLength, 0 > index) {return {
        row: i,
        column: index + lines[i].length + newlineLength
      };}}
      return {
        row: l - 1,
        column: lines[l - 1].length
      };
    }, this.positionToIndex = function (pos, startRow) {
      for (var lines = this.$lines || this.getAllLines(), newlineLength = this.getNewLineCharacter().length, index = 0, row = Math.min(pos.row, lines.length), i = startRow || 0; row > i; ++i) index += lines[i].length + newlineLength;
      return index + pos.column;
    };
  }).call(Document.prototype), exports.Document = Document;
}), ace.define('ace/lib/lang', ['require', 'exports', 'module'], function (acequire, exports) {

  exports.last = function (a) {
    return a[a.length - 1];
  }, exports.stringReverse = function (string) {
    return string.split('').reverse().join('');
  }, exports.stringRepeat = function (string, count) {
    for (var result = ''; count > 0;) 1 & count && (result += string), (count >>= 1) && (string += string);
    return result;
  };
  const trimBeginRegexp = /^\s\s*/;
  const trimEndRegexp = /\s\s*$/;
  exports.stringTrimLeft = function (string) {
    return string.replace(trimBeginRegexp, '');
  }, exports.stringTrimRight = function (string) {
    return string.replace(trimEndRegexp, '');
  }, exports.copyObject = function (obj) {
    const copy = {};
    for (const key in obj) copy[key] = obj[key];
    return copy;
  }, exports.copyArray = function (array) {
    for (var copy = [], i = 0, l = array.length; l > i; i++) copy[i] = array[i] && 'object' === typeof array[i] ? this.copyObject(array[i]) : array[i];
    return copy;
  }, exports.deepCopy = function deepCopy(obj) {
    if ('object' !== typeof obj || !obj) return obj;
    let copy;
    if (Array.isArray(obj)) {
      copy = [];
      for (var key = 0; obj.length > key; key++) copy[key] = deepCopy(obj[key]);
      return copy;
    }
    if ('[object Object]' !== Object.prototype.toString.call(obj)) return obj;
    copy = {};
    for (var key in obj) copy[key] = deepCopy(obj[key]);
    return copy;
  }, exports.arrayToMap = function (arr) {
    for (var map = {}, i = 0; arr.length > i; i++) map[arr[i]] = 1;
    return map;
  }, exports.createMap = function (props) {
    const map = Object.create(null);
    for (const i in props) map[i] = props[i];
    return map;
  }, exports.arrayRemove = function (array, value) {
    for (let i = 0; array.length >= i; i++) value === array[i] && array.splice(i, 1);
  }, exports.escapeRegExp = function (str) {
    return str.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1');
  }, exports.escapeHTML = function (str) {
    return str.replace(/&/g, '&#38;').replace(/"/g, '&#34;').replace(/'/g, '&#39;').replace(/</g, '&#60;');
  }, exports.getMatchOffsets = function (string, regExp) {
    const matches = [];
    return string.replace(regExp, function (str) {
      matches.push({
        offset: arguments[arguments.length - 2],
        length: str.length
      });
    }), matches;
  }, exports.deferredCall = function (fcn) {
    let timer = null;
    const callback = function () {
      timer = null, fcn();
    };
    var deferred = function (timeout) {
      return deferred.cancel(), timer = setTimeout(callback, timeout || 0), deferred;
    };
    return deferred.schedule = deferred, deferred.call = function () {
      return this.cancel(), fcn(), deferred;
    }, deferred.cancel = function () {
      return clearTimeout(timer), timer = null, deferred;
    }, deferred.isPending = function () {
      return timer;
    }, deferred;
  }, exports.delayedCall = function (fcn, defaultTimeout) {
    let timer = null;
    const callback = function () {
      timer = null, fcn();
    };
    const _self = function (timeout) {
      null == timer && (timer = setTimeout(callback, timeout || defaultTimeout));
    };
    return _self.delay = function (timeout) {
      timer && clearTimeout(timer), timer = setTimeout(callback, timeout || defaultTimeout);
    }, _self.schedule = _self, _self.call = function () {
      this.cancel(), fcn();
    }, _self.cancel = function () {
      timer && clearTimeout(timer), timer = null;
    }, _self.isPending = function () {
      return timer;
    }, _self;
  };
}), ace.define('ace/worker/mirror', ['require', 'exports', 'module', 'ace/range', 'ace/document', 'ace/lib/lang'], function (acequire, exports) {

  acequire('../range').Range;
  const Document = acequire('../document').Document;
  const lang = acequire('../lib/lang');
  const Mirror = exports.Mirror = function (sender) {
    this.sender = sender;
    const doc = this.doc = new Document('');
    const deferredUpdate = this.deferredUpdate = lang.delayedCall(this.onUpdate.bind(this));
    const _self = this;
    sender.on('change', function (e) {
      const data = e.data;
      if (data[0].start) doc.applyDeltas(data);
      else
      {for (let i = 0; data.length > i; i += 2) {
        if (Array.isArray(data[i + 1])) {var d = {
          action: 'insert',
          start: data[i],
          lines: data[i + 1]
        };}
        else {var d = {
          action: 'remove',
          start: data[i],
          end: data[i + 1]
        };}
        doc.applyDelta(d, !0);
      }}
      return _self.$timeout ? deferredUpdate.schedule(_self.$timeout) : (_self.onUpdate(), void 0);
    });
  };
  (function () {
    this.$timeout = 500, this.setTimeout = function (timeout) {
      this.$timeout = timeout;
    }, this.setValue = function (value) {
      this.doc.setValue(value), this.deferredUpdate.schedule(this.$timeout);
    }, this.getValue = function (callbackId) {
      this.sender.callback(this.doc.getValue(), callbackId);
    }, this.onUpdate = function () {}, this.isPending = function () {
      return this.deferredUpdate.isPending();
    };
  }).call(Mirror.prototype);
}),
ace.define('ace/lib/es5-shim', ['require', 'exports', 'module'], function () {
  function Empty() {}

  function doesDefinePropertyWork(object) {
    try {
      return Object.defineProperty(object, 'sentinel', {}), 'sentinel' in object;
    } catch (exception) {}
  }

  function toInteger(n) {
    return n = +n, n !== n ? n = 0 : 0 !== n && n !== 1 / 0 && n !== -(1 / 0) && (n = (n > 0 || -1) * Math.floor(Math.abs(n))), n;
  }
  Function.prototype.bind || (Function.prototype.bind = function (that) {
    const target = this;
    if ('function' !== typeof target) throw new TypeError('Function.prototype.bind called on incompatible ' + target);
    const args = slice.call(arguments, 1);
    var bound = function () {
      if (this instanceof bound) {
        const result = target.apply(this, args.concat(slice.call(arguments)));
        return Object(result) === result ? result : this;
      }
      return target.apply(that, args.concat(slice.call(arguments)));
    };
    return target.prototype && (Empty.prototype = target.prototype, bound.prototype = new Empty, Empty.prototype = null), bound;
  });
  let defineGetter; let defineSetter; let lookupGetter; let lookupSetter; let supportsAccessors; const call = Function.prototype.call;
  const prototypeOfArray = Array.prototype;
  const prototypeOfObject = Object.prototype;
  var slice = prototypeOfArray.slice;
  const _toString = call.bind(prototypeOfObject.toString);
  const owns = call.bind(prototypeOfObject.hasOwnProperty);
  if ((supportsAccessors = owns(prototypeOfObject, '__defineGetter__')) && (defineGetter = call.bind(prototypeOfObject.__defineGetter__), defineSetter = call.bind(prototypeOfObject.__defineSetter__), lookupGetter = call.bind(prototypeOfObject.__lookupGetter__), lookupSetter = call.bind(prototypeOfObject.__lookupSetter__)), 2 != [1, 2].splice(0).length)
  {if (function () {
    function makeArray(l) {
      const a = Array(l + 2);
      return (a[0] = a[1] = 0), a;
    }
    let lengthBefore; const array = [];
    return array.splice.apply(array, makeArray(20)),
    array.splice.apply(array, makeArray(26)),
    lengthBefore = array.length, array.splice(5, 0, 'XXX'),
    lengthBefore + 1 == array.length,
    lengthBefore + 1 == array.length ? !0 : void 0;
  }()) {
    const array_splice = Array.prototype.splice;
    Array.prototype.splice = function (start, deleteCount) {
      return arguments.length ? array_splice.apply(this, [void 0 === start ? 0 : start, void 0 === deleteCount ? this.length - start : deleteCount].concat(slice.call(arguments, 2))) : [];
    };
  } else {Array.prototype.splice = function (pos, removeCount) {
    const length = this.length;
    pos > 0 ? pos > length && (pos = length) : void 0 == pos ? pos = 0 : 0 > pos && (pos = Math.max(length + pos, 0)), length > pos + removeCount || (removeCount = length - pos);
    const removed = this.slice(pos, pos + removeCount);
    const insert = slice.call(arguments, 2);
    const add = insert.length;
    if (pos === length) add && this.push.apply(this, insert);
    else {
      const remove = Math.min(removeCount, length - pos);
      const tailOldPos = pos + remove;
      const tailNewPos = tailOldPos + add - remove;
      const tailCount = length - tailOldPos;
      const lengthAfterRemove = length - remove;
      if (tailOldPos > tailNewPos)
      {for (var i = 0; tailCount > i; ++i) this[tailNewPos + i] = this[tailOldPos + i];}
      else if (tailNewPos > tailOldPos)
      {for (i = tailCount; i--;) this[tailNewPos + i] = this[tailOldPos + i];}
      if (add && pos === lengthAfterRemove) this.length = lengthAfterRemove, this.push.apply(this, insert);
      else
      {for (this.length = lengthAfterRemove + add, i = 0; add > i; ++i) this[pos + i] = insert[i];}
    }
    return removed;
  };}}
  Array.isArray || (Array.isArray = function (obj) {
    return '[object Array]' == _toString(obj);
  });
  const boxedString = Object('a');
  const splitString = 'a' != boxedString[0] || !(0 in boxedString);
  if (Array.prototype.forEach || (Array.prototype.forEach = function (fun) {
    const object = toObject(this);
    const self = splitString && '[object String]' == _toString(this) ? this.split('') : object;
    const thisp = arguments[1];
    let i = -1;
    const length = self.length >>> 0;
    if ('[object Function]' != _toString(fun)) throw new TypeError;
    for (; length > ++i;) i in self && fun.call(thisp, self[i], i, object);
  }), Array.prototype.map || (Array.prototype.map = function (fun) {
    const object = toObject(this);
    const self = splitString && '[object String]' == _toString(this) ? this.split('') : object;
    const length = self.length >>> 0;
    const result = Array(length);
    const thisp = arguments[1];
    if ('[object Function]' != _toString(fun)) throw new TypeError(fun + ' is not a function');
    for (let i = 0; length > i; i++) i in self && (result[i] = fun.call(thisp, self[i], i, object));
    return result;
  }), Array.prototype.filter || (Array.prototype.filter = function (fun) {
    let value; const object = toObject(this);
    const self = splitString && '[object String]' == _toString(this) ? this.split('') : object;
    const length = self.length >>> 0;
    const result = [];
    const thisp = arguments[1];
    if ('[object Function]' != _toString(fun)) throw new TypeError(fun + ' is not a function');
    for (let i = 0; length > i; i++) i in self && (value = self[i], fun.call(thisp, value, i, object) && result.push(value));
    return result;
  }), Array.prototype.every || (Array.prototype.every = function (fun) {
    const object = toObject(this);
    const self = splitString && '[object String]' == _toString(this) ? this.split('') : object;
    const length = self.length >>> 0;
    const thisp = arguments[1];
    if ('[object Function]' != _toString(fun)) throw new TypeError(fun + ' is not a function');
    for (let i = 0; length > i; i++)
    {if (i in self && !fun.call(thisp, self[i], i, object)) return !1;}
    return !0;
  }), Array.prototype.some || (Array.prototype.some = function (fun) {
    const object = toObject(this);
    const self = splitString && '[object String]' == _toString(this) ? this.split('') : object;
    const length = self.length >>> 0;
    const thisp = arguments[1];
    if ('[object Function]' != _toString(fun)) throw new TypeError(fun + ' is not a function');
    for (let i = 0; length > i; i++)
    {if (i in self && fun.call(thisp, self[i], i, object)) return !0;}
    return !1;
  }), Array.prototype.reduce || (Array.prototype.reduce = function (fun) {
    const object = toObject(this);
    const self = splitString && '[object String]' == _toString(this) ? this.split('') : object;
    const length = self.length >>> 0;
    if ('[object Function]' != _toString(fun)) throw new TypeError(fun + ' is not a function');
    if (!length && 1 == arguments.length) throw new TypeError('reduce of empty array with no initial value');
    let result; let i = 0;
    if (arguments.length >= 2) result = arguments[1];
    else
    {for (;;) {
      if (i in self) {
        result = self[i++];
        break;
      }
      if (++i >= length) throw new TypeError('reduce of empty array with no initial value');
    }}
    for (; length > i; i++) i in self && (result = fun.call(void 0, result, self[i], i, object));
    return result;
  }), Array.prototype.reduceRight || (Array.prototype.reduceRight = function (fun) {
    const object = toObject(this);
    const self = splitString && '[object String]' == _toString(this) ? this.split('') : object;
    const length = self.length >>> 0;
    if ('[object Function]' != _toString(fun)) throw new TypeError(fun + ' is not a function');
    if (!length && 1 == arguments.length) throw new TypeError('reduceRight of empty array with no initial value');
    let result; let i = length - 1;
    if (arguments.length >= 2) result = arguments[1];
    else
    {for (;;) {
      if (i in self) {
        result = self[i--];
        break;
      }
      if (0 > --i) throw new TypeError('reduceRight of empty array with no initial value');
    }}
    do i in this && (result = fun.call(void 0, result, self[i], i, object)); while (i--);
    return result;
  }), Array.prototype.indexOf && -1 == [0, 1].indexOf(1, 2) || (Array.prototype.indexOf = function (sought) {
    const self = splitString && '[object String]' == _toString(this) ? this.split('') : toObject(this);
    const length = self.length >>> 0;
    if (!length) return -1;
    let i = 0;
    for (arguments.length > 1 && (i = toInteger(arguments[1])), i = i >= 0 ? i : Math.max(0, length + i); length > i; i++)
    {if (i in self && self[i] === sought) return i;}
    return -1;
  }), Array.prototype.lastIndexOf && -1 == [0, 1].lastIndexOf(0, -3) || (Array.prototype.lastIndexOf = function (sought) {
    const self = splitString && '[object String]' == _toString(this) ? this.split('') : toObject(this);
    const length = self.length >>> 0;
    if (!length) return -1;
    let i = length - 1;
    for (arguments.length > 1 && (i = Math.min(i, toInteger(arguments[1]))), i = i >= 0 ? i : length - Math.abs(i); i >= 0; i--)
    {if (i in self && sought === self[i]) return i;}
    return -1;
  }), Object.getPrototypeOf || (Object.getPrototypeOf = function (object) {
    return object.__proto__ || (object.constructor ? object.constructor.prototype : prototypeOfObject);
  }), !Object.getOwnPropertyDescriptor) {
    const ERR_NON_OBJECT = 'Object.getOwnPropertyDescriptor called on a non-object: ';
    Object.getOwnPropertyDescriptor = function (object, property) {
      if ('object' !== typeof object && 'function' !== typeof object || null === object) throw new TypeError(ERR_NON_OBJECT + object);
      if (owns(object, property)) {
        let descriptor; var getter; var setter;
        if (descriptor = {
          enumerable: !0,
          configurable: !0
        }, supportsAccessors) {
          const prototype = object.__proto__;
          object.__proto__ = prototypeOfObject;
          var getter = lookupGetter(object, property);
          var setter = lookupSetter(object, property);
          if (object.__proto__ = prototype, getter || setter) return getter && (descriptor.get = getter), setter && (descriptor.set = setter), descriptor;
        }
        return descriptor.value = object[property], descriptor;
      }
    };
  }
  if (Object.getOwnPropertyNames || (Object.getOwnPropertyNames = function (object) {
    return Object.keys(object);
  }), !Object.create) {
    let createEmpty;
    createEmpty = null === Object.prototype.__proto__ ? function () {
      return {
        __proto__: null
      };
    } : function () {
      const empty = {};
      for (const i in empty) empty[i] = null;
      return empty.constructor = empty.hasOwnProperty = empty.propertyIsEnumerable = empty.isPrototypeOf = empty.toLocaleString = empty.toString = empty.valueOf = empty.__proto__ = null, empty;
    }, Object.create = function (prototype, properties) {
      let object;
      if (null === prototype) object = createEmpty();
      else {
        if ('object' !== typeof prototype) throw new TypeError('typeof prototype[' + typeof prototype + '] != \'object\'');
        const Type = function () {};
        Type.prototype = prototype, object = new Type, object.__proto__ = prototype;
      }
      return void 0 !== properties && Object.defineProperties(object, properties), object;
    };
  }
  if (Object.defineProperty) {
    const definePropertyWorksOnObject = doesDefinePropertyWork({});
    const definePropertyWorksOnDom = 'undefined' === typeof document || doesDefinePropertyWork(document.createElement('div'));
    if (!definePropertyWorksOnObject || !definePropertyWorksOnDom) var definePropertyFallback = Object.defineProperty;
  }
  if (!Object.defineProperty || definePropertyFallback) {
    const ERR_NON_OBJECT_DESCRIPTOR = 'Property description must be an object: ';
    const ERR_NON_OBJECT_TARGET = 'Object.defineProperty called on non-object: ';
    const ERR_ACCESSORS_NOT_SUPPORTED = 'getters & setters can not be defined on this javascript engine';
    Object.defineProperty = function (object, property, descriptor) {
      if ('object' !== typeof object && 'function' !== typeof object || null === object) throw new TypeError(ERR_NON_OBJECT_TARGET + object);
      if ('object' !== typeof descriptor && 'function' !== typeof descriptor || null === descriptor) throw new TypeError(ERR_NON_OBJECT_DESCRIPTOR + descriptor);
      if (definePropertyFallback) {try {
        return definePropertyFallback.call(Object, object, property, descriptor);
      } catch (exception) {}}
      if (owns(descriptor, 'value'))
      {if (supportsAccessors && (lookupGetter(object, property) || lookupSetter(object, property))) {
        const prototype = object.__proto__;
        object.__proto__ = prototypeOfObject, delete object[property], object[property] = descriptor.value, object.__proto__ = prototype;
      } else object[property] = descriptor.value;}
      else {
        if (!supportsAccessors) throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);
        owns(descriptor, 'get') && defineGetter(object, property, descriptor.get), owns(descriptor, 'set') && defineSetter(object, property, descriptor.set);
      }
      return object;
    };
  }
  Object.defineProperties || (Object.defineProperties = function (object, properties) {
    for (const property in properties) owns(properties, property) && Object.defineProperty(object, property, properties[property]);
    return object;
  }), Object.seal || (Object.seal = function (object) {
    return object;
  }), Object.freeze || (Object.freeze = function (object) {
    return object;
  });
  try {
    Object.freeze(function () {});
  } catch (exception) {
    Object.freeze = (function (freezeObject) {
      return function (object) {
        return 'function' === typeof object ? object : freezeObject(object);
      };
    }(Object.freeze));
  }
  if (Object.preventExtensions || (Object.preventExtensions = function (object) {
    return object;
  }), Object.isSealed || (Object.isSealed = function () {
    return !1;
  }), Object.isFrozen || (Object.isFrozen = function () {
    return !1;
  }), Object.isExtensible || (Object.isExtensible = function (object) {
    if (Object(object) === object) throw new TypeError;
    for (var name = ''; owns(object, name);) name += '?';
    object[name] = !0;
    const returnValue = owns(object, name);
    return delete object[name], returnValue;
  }), !Object.keys) {
    let hasDontEnumBug = !0;
    const dontEnums = ['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'];
    const dontEnumsLength = dontEnums.length;
    for (const key in {
      toString: null
    }) hasDontEnumBug = !1;
    Object.keys = function (object) {
      if ('object' !== typeof object && 'function' !== typeof object || null === object) throw new TypeError('Object.keys called on a non-object');
      const keys = [];
      for (const name in object) owns(object, name) && keys.push(name);
      if (hasDontEnumBug)
      {for (let i = 0, ii = dontEnumsLength; ii > i; i++) {
        const dontEnum = dontEnums[i];
        owns(object, dontEnum) && keys.push(dontEnum);
      }}
      return keys;
    };
  }
  Date.now || (Date.now = function () {
    return (new Date).getTime();
  });
  let ws = '\t\n\u000b\f\r   ᠎             　\u2028\u2029﻿';
  if (!String.prototype.trim || ws.trim()) {
    ws = '[' + ws + ']';
    const trimBeginRegexp = RegExp('^' + ws + ws + '*');
    const trimEndRegexp = RegExp(ws + ws + '*$');
    String.prototype.trim = function () {
      return (this + '').replace(trimBeginRegexp, '').replace(trimEndRegexp, '');
    };
  }
  var toObject = function (o) {
    if (null == o) throw new TypeError('can\'t convert ' + o + ' to object');
    return Object(o);
  };
});

ace.define(
  'watch_editor/mode/watch_parser',
  [
    'require',
    'exports',
    'module'
  ], function () {
    let at;     // The index of the current character
    let ch;     // The current character
    const escapee = {
      '"': '"',
      '\\': '\\',
      '/': '/',
      b: '\b',
      f: '\f',
      n: '\n',
      r: '\r',
      t: '\t'
    };
    let text;
    const stringLiteralPattern = '"""';

    // Call error when something is wrong.
    const error = function(message) {
      throw { name: 'SyntaxError', message, at, text };
    };
  
    const next = function(c) {
      // If a c parameter is provided, verify that it matches the current character.
      if (c && c !== ch) {
        error('Expected \'' + c + '\' instead of \'' + ch + '\'');
      }
  
      // Get the next character. When there are no more characters,
      // return the empty string.
      ch = text.charAt(at);
      at += 1;
      return ch;
    };
  
    const nextPattern = function(stringPattern, errorMessage) {
      // Starting form the current index, verify that the text contains stringPattern,
      // for example, a string literal closing punctuation """.
      errorMessage = errorMessage || `Required '${stringPattern}'`;

      const previousAt = at;
      const i = text.indexOf(stringPattern, at);
      if (i < 0) error(errorMessage);

      // Jump to the end of the found stringPattern.
      ch = text[i + stringPattern.length];
      at = i + stringPattern.length + 1;

      // Return the text slice between the first and the second stringPattern.
      return text.slice(previousAt, previousAt + i);
    };
    
    const foundPattern = function(stringPattern, doTrim = true) {
      // Verify if text value at the current index is part of the provided stringPattern.
      return doTrim
        ? text.slice(at - 1, at + stringPattern.length - 1).trim() === stringPattern
        : text.slice(at - 1, at + stringPattern.length - 1) === stringPattern;
    };

    const number = function() {
      // Parse a number value.
      let number;
      let string = '';
  
      if (ch === '-') {
        string = '-';
        next('-');
      }
      while (ch >= '0' && ch <= '9') {
        string += ch;
        next();
      }
      if (ch === '.') {
        string += '.';
        while (next() && ch >= '0' && ch <= '9') {
          string += ch;
        }
      }
      if (ch === 'e' || ch === 'E') {
        string += ch;
        next();
        if (ch === '-' || ch === '+') {
          string += ch;
          next();
        }
        while (ch >= '0' && ch <= '9') {
          string += ch;
          next();
        }
      }
      number = +string;
      if (isNaN(number)) {
        error('Bad number');
      } else {
        return number;
      }
    };

    const stringLiteral = function() {
      next('"');
      next('"');
      return nextPattern(stringLiteralPattern, `Missed closing '${stringLiteralPattern}'`);
    };

    const string = function() {
      // Parse a string value.
      let hex;
      let i;
      let string = '';
      let uffff;
  
      // When parsing for string values, we must look for " and \ characters.
      if (ch === '"') {
        if (foundPattern(stringLiteralPattern)) {
          return stringLiteral();
        } else {
          while (next()) {
            if (ch === '"') {
              next();
              return string;
            } else if (ch === '\\') {
              next();
              if (ch === 'u') {
                uffff = 0;
                for (i = 0; i < 4; i += 1) {
                  hex = parseInt(next(), 16);
                  if (!isFinite(hex)) {
                    break;
                  }
                  uffff = uffff * 16 + hex;
                }
                string += String.fromCharCode(uffff);
              } else if (typeof escapee[ch] === 'string') {
                string += escapee[ch];
              } else {
                break;
              }
            } else if (ch == '\n' || ch == '\r') {
              break;
            } else {
              string += ch;
            }
          }
        }
      }
      error('Bad string');
    };
  
    const white = function() {
      // Skip whitespace.
      while (ch && ch <= ' ') {
        next();
      }
    };
  
    const word = function() {
      // true, false, or null.
      switch (ch) {
        case 't':
          next('t');
          next('r');
          next('u');
          next('e');
          return true;
        case 'f':
          next('f');
          next('a');
          next('l');
          next('s');
          next('e');
          return false;
        case 'n':
          next('n');
          next('u');
          next('l');
          next('l');
          return null;
      }
      error('Unexpected \'' + ch + '\'');
    };
  
    let value;  // Place holder for the value function.
  
    const array = function() {
      // Parse an array value.
      const array = [];
  
      if (ch === '[') {
        next('[');
        white();
        if (ch === ']') {
          next(']');
          return array;   // empty array
        }
        while (ch) {
          array.push(value());
          white();
          if (ch === ']') {
            next(']');
            return array;
          }
          next(',');
          white();
        }
      }
      error('Bad array');
    };
  
    const object = function() {
      // Parse an object value.
      let key;
      const object = {};
  
      if (ch === '{') {
        next('{');
        white();
        if (ch === '}') {
          next('}');
          return object;   // empty object
        }
        while (ch) {
          key = string();
          white();
          next(':');
          if (Object.hasOwnProperty.call(object, key)) {
            error('Duplicate key \'' + key + '\'');
          }
          object[key] = value();
          white();
          if (ch === '}') {
            next('}');
            return object;
          }
          next(',');
          white();
        }
      }
      error('Bad object');
    };
  
    value = function() {
      // Parse a JSON value. It could be an object, an array, a string, a number,
      // or a word.
      white();
      switch (ch) {
        case '{':
          return object();
        case '[':
          return array();
        case '"':
          return string();
        case '-':
          return number();
        default:
          return ch >= '0' && ch <= '9' ? number() : word();
      }
    };
  
    // Return the json_parse function. It will have access to all of the above
    // functions and variables.
    return function(source, reviver) {
      let result;
  
      text = source;
      at = 0;
      ch = ' ';
      result = value();
      white();
      if (ch) {
        error('Syntax error');
      }
  
      // If there is a reviver function, we recursively walk the new structure,
      // passing each name/value pair to the reviver function for possible
      // transformation, starting with a temporary root object that holds the result
      // in an empty key. If there is not a reviver function, we simply return the
      // result.
      return typeof reviver === 'function' ? function walk(holder, key) {
        let k;
        let v;
        const value = holder[key];
        if (value && typeof value === 'object') {
          for (k in value) {
            if (Object.hasOwnProperty.call(value, k)) {
              v = walk(value, k);
              if (v !== undefined) {
                value[k] = v;
              } else {
                delete value[k];
              }
            }
          }
        }
        return reviver.call(holder, key, value);
      }({'': result}, '') : result;
    };
});

ace.define(
  'watch_editor/mode/worker',
  [
    'require',
    'exports',
    'module',
    'ace/lib/oop',
    'ace/worker/mirror',
    'watch_editor/mode/watch_parser',
  ],
  function (require, exports) {
    const oop = require('ace/lib/oop');
    const Mirror = require('ace/worker/mirror').Mirror;
    const parse = require('watch_editor/mode/watch_parser');

    const WatchWorker = (exports.WatchWorker = function (sender) {
      Mirror.call(this, sender);
      this.setTimeout(200);
    });

    oop.inherits(WatchWorker, Mirror);

    (function () {
      this.id = 'watchWorker';

      this.onUpdate = function() {
        const value = this.doc.getValue();

        try {
          if (value) parse(value);
        } catch (error) {
          const { row, column } = this.doc.indexToPosition(error.at - 1);

          this.sender.emit('error', [{
            row,
            column,
            text: error.message,
            type: 'error'
          }]);

          return;
        }

        this.sender.emit('ok', []);
      };
    }.call(WatchWorker.prototype));
  }
);