(function() {
  var $, QuickQueryResultView, View, fs, json2csv, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), View = ref.View, $ = ref.$;

  json2csv = require('json2csv');

  fs = require('fs');

  module.exports = QuickQueryResultView = (function(superClass) {
    extend(QuickQueryResultView, superClass);

    QuickQueryResultView.prototype.keepHidden = false;

    QuickQueryResultView.prototype.rows = null;

    QuickQueryResultView.prototype.fields = null;

    QuickQueryResultView.prototype.canceled = false;

    function QuickQueryResultView() {
      this.resizeResultView = bind(this.resizeResultView, this);
      QuickQueryResultView.__super__.constructor.apply(this, arguments);
    }

    QuickQueryResultView.prototype.initialize = function() {
      $(window).resize((function(_this) {
        return function() {
          return _this.fixSizes();
        };
      })(this));
      this.applyButton.click((function(_this) {
        return function(e) {
          return _this.applyChanges();
        };
      })(this));
      this.acceptButton.keydown((function(_this) {
        return function(e) {
          if (e.keyCode === 13) {
            _this.acceptButton.click();
          }
          if (e.keyCode === 39) {
            return _this.cancelButton.focus();
          }
        };
      })(this));
      this.cancelButton.keydown((function(_this) {
        return function(e) {
          if (e.keyCode === 13) {
            _this.cancelButton.click();
          }
          if (e.keyCode === 37) {
            return _this.acceptButton.focus();
          }
        };
      })(this));
      if (!atom.config.get('quick-query.resultsInTab')) {
        this.handleResizeEvents();
      }
      return this.handleScrollEvent();
    };

    QuickQueryResultView.prototype.getTitle = function() {
      return 'Query Result';
    };

    QuickQueryResultView.prototype.serialize = function() {};

    QuickQueryResultView.content = function() {
      return this.div({
        "class": 'quick-query-result'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'quick-query-result-resize-handler'
          }, '');
          _this.table({
            "class": 'table quick-query-result-corner'
          }, function() {
            return _this.thead(function() {
              return _this.tr(function() {
                return _this.th({
                  outlet: 'corner'
                }, function() {
                  _this.span({
                    "class": 'hash'
                  }, '#');
                  return _this.button({
                    "class": 'btn icon icon-pencil',
                    title: 'Apply changes',
                    outlet: 'applyButton'
                  }, '');
                });
              });
            });
          });
          _this.table({
            "class": 'table quick-query-result-numbers',
            outlet: 'numbers'
          }, function() {});
          _this.table({
            "class": 'table quick-query-result-header',
            outlet: 'header'
          }, function() {});
          _this.div({
            "class": 'quick-query-result-table-wrapper',
            outlet: 'tableWrapper'
          }, function() {
            return _this.table({
              "class": 'quick-query-result-table table',
              outlet: 'table',
              tabindex: -1
            }, '');
          });
          _this.div({
            "class": 'preview',
            outlet: 'preview'
          }, function() {
            return _this.div({
              "class": 'container',
              syle: 'position:relative;'
            }, function() {});
          });
          return _this.div({
            "class": 'buttons'
          }, function() {
            _this.button({
              "class": 'btn btn-success icon icon-check',
              outlet: 'acceptButton'
            }, '');
            return _this.button({
              "class": 'btn btn-error icon icon-x',
              outlet: 'cancelButton'
            }, '');
          });
        };
      })(this));
    };

    QuickQueryResultView.prototype.moveSelection = function(direction) {
      var $td1, $td2, $tr, $trs, cell, index, page_size, table, tr_index;
      $td1 = this.table.find('td.selected');
      $tr = $td1.parent();
      index = $td1.index();
      $td2 = (function() {
        switch (direction) {
          case 'right':
            return $td1.next();
          case 'left':
            return $td1.prev();
          case 'up':
            return $tr.prev().children().eq(index);
          case 'down':
            return $tr.next().children().eq(index);
          case 'page-up':
          case 'page-down':
            $trs = $tr.parent().children();
            page_size = Math.floor(this.tableWrapper.height() / $td1.outerHeight());
            tr_index = direction === 'page-up' ? Math.max(0, $tr.index() - page_size) : Math.min($trs.length - 1, $tr.index() + page_size);
            return $trs.eq(tr_index).children().eq(index);
        }
      }).call(this);
      if (!$td1.hasClass('editing') && $td2.length > 0) {
        $td1.removeClass('selected');
        $td2.addClass('selected');
        table = this.tableWrapper.offset();
        table.bottom = table.top + this.tableWrapper.height();
        table.right = table.left + this.tableWrapper.width();
        cell = $td2.offset();
        cell.bottom = cell.top + $td2.height();
        cell.right = cell.left + $td2.width();
        if (cell.top < table.top) {
          this.tableWrapper.scrollTop(this.tableWrapper.scrollTop() - table.top + cell.top);
        }
        if (cell.bottom > table.bottom) {
          this.tableWrapper.scrollTop(this.tableWrapper.scrollTop() + cell.bottom - table.bottom + 1.5 * $td2.height());
        }
        if (cell.left < table.left) {
          this.tableWrapper.scrollLeft(this.tableWrapper.scrollLeft() - table.left + cell.left);
        }
        if (cell.right > table.right) {
          return this.tableWrapper.scrollLeft(this.tableWrapper.scrollLeft() + cell.right - table.right + 1.5 * $td2.width());
        }
      }
    };

    QuickQueryResultView.prototype.focusTable = function() {
      if (!this.hasClass('confirmation')) {
        return this.table.focus();
      }
    };

    QuickQueryResultView.prototype.getCursor = function() {
      var $td, x, y;
      $td = this.table.find('td.selected');
      x = $td.index();
      y = $td.parent().index();
      if (x !== -1) {
        return [x, y];
      } else {
        return null;
      }
    };

    QuickQueryResultView.prototype.setCursor = function(x, y) {
      var $td1, $td2;
      $td1 = this.table.find('td.selected');
      $td2 = this.table.find('tbody').children().eq(y).children().eq(x);
      if ($td2.length > 0 && $td1[0] !== $td2[0]) {
        $td1.removeClass('selected');
        return $td2.addClass('selected');
      }
    };

    QuickQueryResultView.prototype.editSelected = function() {
      var editors, td, val;
      td = this.selectedTd();
      if ((td != null) && this.connection.allowEdition) {
        editors = td.getElementsByTagName("atom-text-editor");
        if (editors.length === 0) {
          return this.editRecord(td);
        } else {
          val = editors[0].getModel().getText();
          this.setCellVal(td, val);
          return this.table.focus();
        }
      }
    };

    QuickQueryResultView.prototype.destroy = function() {};

    QuickQueryResultView.prototype.showRows = function(rows1, fields1, connection, done) {
      var field, k, len, numbersBody, ref1, tbody, th, thead, tr;
      this.rows = rows1;
      this.fields = fields1;
      this.connection = connection;
      this.removeClass('changed confirmation');
      this.attr('data-allow-edition', (function(_this) {
        return function() {
          if (_this.connection.allowEdition) {
            return 'yes';
          } else {
            return null;
          }
        };
      })(this));
      this.keepHidden = false;
      thead = document.createElement('thead');
      tr = document.createElement('tr');
      ref1 = this.fields;
      for (k = 0, len = ref1.length; k < len; k++) {
        field = ref1[k];
        th = document.createElement('th');
        th.textContent = field.name;
        tr.appendChild(th);
      }
      thead.appendChild(tr);
      this.header.html(thead);
      numbersBody = document.createElement('tbody');
      this.numbers.html(numbersBody);
      tbody = document.createElement('tbody');
      this.canceled = false;
      this.forEachChunk(this.rows, done, (function(_this) {
        return function(row, i) {
          var array_row, j, l, len1, ref2, row_value, td;
          array_row = Array.isArray(row);
          tr = document.createElement('tr');
          td = document.createElement('td');
          td.textContent = i + 1;
          tr.appendChild(td);
          numbersBody.appendChild(tr);
          tr = document.createElement('tr');
          ref2 = _this.fields;
          for (j = l = 0, len1 = ref2.length; l < len1; j = ++l) {
            field = ref2[j];
            td = document.createElement('td');
            row_value = array_row ? row[j] : row[field.name];
            if (row_value != null) {
              td.setAttribute('data-original-value', row_value);
              td.textContent = row_value;
              _this.showInvisibles(td);
            } else {
              td.dataset.originalValueNull = true;
              td.classList.add('null');
              td.textContent = 'NULL';
            }
            td.addEventListener('mousedown', function(e) {
              _this.table.find('td').removeClass('selected');
              return e.currentTarget.classList.add('selected');
            });
            if (_this.connection.allowEdition) {
              td.addEventListener('dblclick', function(e) {
                return _this.editRecord(e.currentTarget);
              });
            }
            tr.appendChild(td);
          }
          return tbody.appendChild(tr);
        };
      })(this));
      return this.table.html(tbody);
    };

    QuickQueryResultView.prototype.showInvisibles = function(td) {
      var k, l, len, len1, len2, m, ref1, ref2, ref3, results, s;
      td.innerHTML = td.innerHTML.replace(/\r\n/g, '<span class="crlf"></span>').replace(/\n/g, '<span class="lf"></span>').replace(/\r/g, '<span class="cr"></span>');
      ref1 = td.getElementsByClassName("crlf");
      for (k = 0, len = ref1.length; k < len; k++) {
        s = ref1[k];
        s.textContent = "\r\n";
      }
      ref2 = td.getElementsByClassName("lf");
      for (l = 0, len1 = ref2.length; l < len1; l++) {
        s = ref2[l];
        s.textContent = "\n";
      }
      ref3 = td.getElementsByClassName("cr");
      results = [];
      for (m = 0, len2 = ref3.length; m < len2; m++) {
        s = ref3[m];
        results.push(s.textContent = "\r");
      }
      return results;
    };

    QuickQueryResultView.prototype.forEachChunk = function(array, done, fn) {
      var chuncksize, doChunk, index;
      chuncksize = 100;
      index = 0;
      doChunk = (function(_this) {
        return function() {
          var cnt;
          cnt = chuncksize;
          while (cnt > 0 && index < array.length) {
            fn.call(_this, array[index], index, array);
            ++index;
            cnt--;
          }
          if (index < array.length) {
            return _this.loop = setTimeout(doChunk, 1);
          } else {
            _this.loop = null;
            return typeof done === "function" ? done() : void 0;
          }
        };
      })(this);
      return doChunk();
    };

    QuickQueryResultView.prototype.stopLoop = function() {
      if (this.loop != null) {
        clearTimeout(this.loop);
        this.loop = null;
        return this.canceled = true;
      }
    };

    QuickQueryResultView.prototype.rowsStatus = function() {
      var added, modified, removed, status, tr_count;
      added = this.table.find('tr.added').length;
      status = (this.rows.length + added).toString();
      status += status === '1' ? ' row' : ' rows';
      if (this.canceled) {
        tr_count = this.table.find('tr').length;
        status = tr_count + " of " + status;
      }
      if (added > 0) {
        status += "," + added + " added";
      }
      modified = this.table.find('tr.modified').length;
      if (modified > 0) {
        status += "," + modified + " modified";
      }
      removed = this.table.find('tr.removed').length;
      if (removed > 0) {
        status += "," + removed + " deleted";
      }
      this.toggleClass('changed', added + modified + removed > 0);
      return status;
    };

    QuickQueryResultView.prototype.copy = function() {
      var $td;
      $td = this.find('td.selected');
      if ($td.length === 1) {
        return atom.clipboard.write($td.text());
      }
    };

    QuickQueryResultView.prototype.paste = function() {
      var td, val;
      if (this.connection.allowEdition) {
        td = this.selectedTd();
        val = atom.clipboard.read();
        return this.setCellVal(td, val);
      }
    };

    QuickQueryResultView.prototype.copyAll = function() {
      var fields, rows;
      if ((this.rows != null) && (this.fields != null)) {
        if (Array.isArray(this.rows[0])) {
          fields = this.fields.map(function(field, i) {
            return {
              label: field.name,
              value: function(row) {
                return row[i];
              }
            };
          });
        } else {
          fields = this.fields.map(function(field) {
            return field.name;
          });
        }
        rows = this.rows.map(function(row) {
          var simpleRow;
          simpleRow = JSON.parse(JSON.stringify(row));
          return simpleRow;
        });
        return json2csv({
          del: "\t",
          data: rows,
          fields: fields,
          defaultValue: ''
        }, function(err, csv) {
          if (err) {
            return console.log(err);
          } else {
            return atom.clipboard.write(csv);
          }
        });
      }
    };

    QuickQueryResultView.prototype.saveCSV = function() {
      if ((this.rows != null) && (this.fields != null)) {
        return atom.getCurrentWindow().showSaveDialog({
          title: 'Save Query Result as CSV',
          defaultPath: process.cwd()
        }, (function(_this) {
          return function(filepath) {
            var fields, rows;
            if (filepath != null) {
              if (Array.isArray(_this.rows[0])) {
                fields = _this.fields.map(function(field, i) {
                  return {
                    label: field.name,
                    value: function(row) {
                      return row[i];
                    }
                  };
                });
              } else {
                fields = _this.fields.map(function(field) {
                  return field.name;
                });
              }
              rows = _this.rows.map(function(row) {
                var field, k, len, simpleRow;
                simpleRow = JSON.parse(JSON.stringify(row));
                for (k = 0, len = fields.length; k < len; k++) {
                  field = fields[k];
                  if (simpleRow[field] == null) {
                    simpleRow[field] = '';
                  }
                }
                return simpleRow;
              });
              return json2csv({
                data: rows,
                fields: fields,
                defaultValue: ''
              }, function(err, csv) {
                if (err) {
                  return console.log(err);
                } else {
                  return fs.writeFile(filepath, csv, function(err) {
                    if (err) {
                      return console.log(err);
                    } else {
                      return console.log('file saved');
                    }
                  });
                }
              });
            }
          };
        })(this));
      }
    };

    QuickQueryResultView.prototype.editRecord = function(td) {
      var editor, textEditor;
      if (td.getElementsByTagName("atom-text-editor").length === 0) {
        td.classList.add('editing');
        this.editing = true;
        editor = document.createElement('atom-text-editor');
        editor.setAttribute('mini', 'mini');
        editor.classList.add('editor');
        textEditor = editor.getModel();
        if (!td.classList.contains('null')) {
          textEditor.setText(td.textContent);
        }
        td.innerHTML = '';
        td.appendChild(editor);
        textEditor.onDidChangeCursorPosition((function(_this) {
          return function(e) {
            var charWidth, column, left, tdleft, tr, trleft, width;
            if (editor.offsetWidth > _this.tableWrapper.width()) {
              td = editor.parentNode;
              tr = td.parentNode;
              charWidth = textEditor.getDefaultCharWidth();
              column = e.newScreenPosition.column;
              trleft = -1 * $(tr).offset().left;
              tdleft = $(td).offset().left;
              width = _this.tableWrapper.width() / 2;
              left = trleft + tdleft - width;
              if (Math.abs(_this.tableWrapper.scrollLeft() - (left + column * charWidth)) > width) {
                return _this.tableWrapper.scrollLeft(left + column * charWidth);
              }
            }
          };
        })(this));
        editor.addEventListener('blur', (function(_this) {
          return function(e) {
            var val;
            td = e.currentTarget.parentNode;
            val = e.currentTarget.getModel().getText();
            return _this.setCellVal(td, val);
          };
        })(this));
        return $(editor).focus();
      }
    };

    QuickQueryResultView.prototype.setCellVal = function(td, text) {
      var tr;
      this.editing = false;
      td.classList.remove('editing', 'null');
      tr = td.parentNode;
      td.textContent = text;
      this.showInvisibles(td);
      this.fixSizes();
      if (tr.classList.contains('added')) {
        td.classList.remove('default');
        td.classList.add('status-added');
      } else if (text !== td.getAttribute('data-original-value')) {
        tr.classList.add('modified');
        td.classList.add('status-modified');
      } else {
        td.classList.remove('status-modified');
        if (tr.querySelector('td.status-modified') === null) {
          tr.classList.remove('modified');
        }
      }
      return this.trigger('quickQuery.rowStatusChanged', [tr]);
    };

    QuickQueryResultView.prototype.insertRecord = function() {
      var number, td, tr;
      td = document.createElement('td');
      tr = document.createElement('tr');
      number = this.numbers.find('tr').length + 1;
      td.textContent = number;
      tr.appendChild(td);
      this.numbers.children('tbody').append(tr);
      tr = document.createElement('tr');
      tr.classList.add('added');
      this.header.find("th").each((function(_this) {
        return function() {
          td = document.createElement('td');
          td.addEventListener('mousedown', function(e) {
            _this.table.find('td').removeClass('selected');
            return e.currentTarget.classList.add('selected');
          });
          td.classList.add('default');
          td.addEventListener('dblclick', function(e) {
            return _this.editRecord(e.currentTarget);
          });
          return tr.appendChild(td);
        };
      })(this));
      this.table.find('tbody').append(tr);
      if (number === 1) {
        this.fixSizes();
      }
      this.tableWrapper.scrollTop(function() {
        return this.scrollHeight;
      });
      return this.trigger('quickQuery.rowStatusChanged', [tr]);
    };

    QuickQueryResultView.prototype.selectedTd = function() {
      return this.find('td.selected').get(0);
    };

    QuickQueryResultView.prototype.deleteRecord = function() {
      var k, len, ref1, td, td1, tr;
      td = this.selectedTd();
      if (this.connection.allowEdition && (td != null)) {
        tr = td.parentNode;
        tr.classList.remove('modified');
        ref1 = tr.children;
        for (k = 0, len = ref1.length; k < len; k++) {
          td1 = ref1[k];
          td1.classList.remove('status-modified');
        }
        tr.classList.add('status-removed', 'removed');
        return this.trigger('quickQuery.rowStatusChanged', [tr]);
      }
    };

    QuickQueryResultView.prototype.undo = function() {
      var td, tr, value;
      td = this.selectedTd();
      if (td != null) {
        tr = td.parentNode;
        if (tr.classList.contains('removed')) {
          tr.classList.remove('status-removed', 'removed');
        } else if (tr.classList.contains('added')) {
          td.classList.remove('null');
          td.classList.add('default');
          td.textContent = '';
        } else {
          if (td.dataset.originalValueNull) {
            td.classList.add('null');
            td.textContent = 'NULL';
          } else {
            value = td.getAttribute('data-original-value');
            td.classList.remove('null');
            td.textContent = value;
            this.showInvisibles(td);
          }
          td.classList.remove('status-modified');
          if (tr.querySelector('td.status-modified') === null) {
            tr.classList.remove('modified');
          }
        }
        return this.trigger('quickQuery.rowStatusChanged', [tr]);
      }
    };

    QuickQueryResultView.prototype.setNull = function() {
      var td, tr;
      td = this.selectedTd();
      if (this.connection.allowEdition && (td != null) && !td.classList.contains('null')) {
        tr = td.parentNode;
        td.textContent = 'NULL';
        td.classList.add('null');
        if (tr.classList.contains('added')) {
          td.classList.remove('default');
          td.classList.add('status-added');
        } else if (td.dataset.originalValueNull) {
          td.classList.remove('status-modified');
          if (tr.querySelector('td.status-modified') === null) {
            tr.classList.remove('modified');
          }
        } else {
          tr.classList.add('modified');
          td.classList.add('status-modified');
        }
        return this.trigger('quickQuery.rowStatusChanged', [tr]);
      }
    };

    QuickQueryResultView.prototype.getSentences = function() {
      var sentences;
      sentences = [];
      this.table.find('tbody tr').each((function(_this) {
        return function(i, tr) {
          var fields, j, promise, row, td, value, values;
          values = {};
          promise = (function() {
            var k, l, len, len1, ref1, ref2;
            if (tr.classList.contains('modified')) {
              row = this.rows[i];
              ref1 = tr.childNodes;
              for (j = k = 0, len = ref1.length; k < len; j = ++k) {
                td = ref1[j];
                if (td.classList.contains('status-modified')) {
                  value = td.classList.contains('null') ? null : td.textContent;
                  values[this.fields[j].name] = value;
                }
              }
              fields = this.fields.filter(function(field) {
                return values.hasOwnProperty(field.name);
              });
              return this.connection.updateRecord(row, fields, values);
            } else if (tr.classList.contains('added')) {
              ref2 = tr.childNodes;
              for (j = l = 0, len1 = ref2.length; l < len1; j = ++l) {
                td = ref2[j];
                if (!td.classList.contains('default')) {
                  value = td.classList.contains('null') ? null : td.textContent;
                  values[this.fields[j].name] = value;
                }
              }
              fields = this.fields.filter(function(field) {
                return values.hasOwnProperty(field.name);
              });
              return this.connection.insertRecord(fields, values);
            } else if (tr.classList.contains('status-removed')) {
              row = this.rows[i];
              return this.connection.deleteRecord(row, this.fields);
            } else {
              return null;
            }
          }).call(_this);
          if (promise != null) {
            return sentences.push(promise.then(function(sentence) {
              return new Promise(function(resolve, reject) {
                return resolve({
                  sentence: sentence,
                  tr: tr,
                  index: i
                });
              });
            }));
          }
        };
      })(this));
      return Promise.all(sentences);
    };

    QuickQueryResultView.prototype.copyChanges = function() {
      return this.getSentences().then(function(sentences) {
        var changes;
        changes = sentences.map(function(arg) {
          var sentence;
          sentence = arg.sentence;
          return sentence;
        });
        return atom.clipboard.write(changes.join("\n"));
      })["catch"](function(err) {
        return console.log(err);
      });
    };

    QuickQueryResultView.prototype.confirm = function() {
      this.acceptButton.focus();
      return new Promise((function(_this) {
        return function(resolve, reject) {
          _this.acceptButton.off('click.confirm').one('click.confirm', function(e) {
            return resolve(true);
          });
          return _this.cancelButton.off('click.confirm').one('click.confirm', function(e) {
            return resolve(false);
          });
        };
      })(this));
    };

    QuickQueryResultView.prototype.applyChanges = function() {
      return this.getSentences().then((function(_this) {
        return function(sentences) {
          var wr;
          if (sentences.length === 0) {
            return;
          }
          if (sentences.every(function(arg) {
            var sentence;
            sentence = arg.sentence;
            return !/\S/.test(sentence);
          })) {
            wr = "Couldn't generate SQL\n\nMake sure that:\n\n* The primary key is included in the query.\n\n* The edited column isn't a computed column.\n";
            atom.notifications.addWarning(wr, {
              dismissable: true
            });
            return;
          }
          _this.addClass('confirmation');
          _this.loadPreview(sentences);
          return _this.confirm().then(function(accept) {
            var index, k, len, ref1, sentence, tr;
            _this.removeClass('confirmation');
            if (accept) {
              for (k = 0, len = sentences.length; k < len; k++) {
                ref1 = sentences[k], sentence = ref1.sentence, tr = ref1.tr, index = ref1.index;
                _this.executeChange(sentence, tr, index);
              }
            }
            return _this.table.focus();
          });
        };
      })(this))["catch"](function(err) {
        return console.log(err);
      });
    };

    QuickQueryResultView.prototype.loadPreview = function(sentences) {
      var changes, cursorLineDecoration, editor, editorElement, help, k, len, ref1;
      changes = sentences.map(function(arg) {
        var sentence;
        sentence = arg.sentence;
        return sentence;
      });
      editorElement = document.createElement('atom-text-editor');
      editorElement.setAttributeNode(document.createAttribute('gutter-hidden'));
      editorElement.setAttributeNode(document.createAttribute('readonly'));
      editor = editorElement.getModel();
      help = "-- The following SQL is going to be executed to apply the changes.\n";
      editor.setText(help + changes.join("\n"));
      atom.textEditors.setGrammarOverride(editor, 'source.sql');
      if (editor.cursorLineDecorations != null) {
        ref1 = editor.cursorLineDecorations;
        for (k = 0, len = ref1.length; k < len; k++) {
          cursorLineDecoration = ref1[k];
          cursorLineDecoration.destroy();
        }
      } else {
        editor.getDecorations({
          "class": 'cursor-line',
          type: 'line'
        })[0].destroy();
      }
      this.preview.find('.container').html(editorElement);
      editorElement.removeAttribute('tabindex');
      return this.preview.find('.container').width($('.horizontal-scrollbar > div', editorElement).width());
    };

    QuickQueryResultView.prototype.executeChange = function(sentence, tr, index) {
      return this.connection.query(sentence, (function(_this) {
        return function(msg, _r, _f) {
          var e, err;
          if (msg && msg.type === 'error') {
            e = msg.content.replace(/`/g, '\\`');
            err = "The following sentence gave an error.\nPlease create an issue if you think that\nthe SQL wasn't properly generated: <br/> " + e + "\"";
            return atom.notifications.addError(err, {
              detail: sentence,
              dismissable: true
            });
          } else {
            return _this.applyChangesToRow(tr, index);
          }
        };
      })(this));
    };

    QuickQueryResultView.prototype.applyChangesToRow = function(tr, index) {
      var k, l, len, len1, ref1, ref2, tbody, td, values;
      tbody = tr.parentNode;
      values = (function() {
        var k, len, ref1, results;
        ref1 = tr.children;
        results = [];
        for (k = 0, len = ref1.length; k < len; k++) {
          td = ref1[k];
          if (td.classList.contains('null')) {
            results.push(null);
          } else {
            results.push(td.textContent);
          }
        }
        return results;
      })();
      values = this.connection.prepareValues(values, this.fields);
      if (tr.classList.contains('status-removed')) {
        this.rows.splice(index, 1);
        tbody.removeChild(tr);
        this.numbers.children('tbody').children('tr:last-child').remove();
      } else if (tr.classList.contains('added')) {
        this.rows.push(values);
        tr.classList.remove('added');
        ref1 = tr.children;
        for (k = 0, len = ref1.length; k < len; k++) {
          td = ref1[k];
          td.classList.remove('status-added', 'default');
          td.setAttribute('data-original-value', td.textContent);
          td.dataset.originalValueNull = td.classList.contains('null');
        }
      } else if (tr.classList.contains('modified')) {
        this.rows[index] = values;
        tr.classList.remove('modified');
        ref2 = tr.children;
        for (l = 0, len1 = ref2.length; l < len1; l++) {
          td = ref2[l];
          td.classList.remove('status-modified');
          td.setAttribute('data-original-value', td.textContent);
          td.dataset.originalValueNull = td.classList.contains('null');
        }
      }
      return this.trigger('quickQuery.rowStatusChanged', [tr]);
    };

    QuickQueryResultView.prototype.hiddenResults = function() {
      return this.keepHidden;
    };

    QuickQueryResultView.prototype.showResults = function() {
      return this.keepHidden = false;
    };

    QuickQueryResultView.prototype.hideResults = function() {
      return this.keepHidden = true;
    };

    QuickQueryResultView.prototype.fixSizes = function() {
      var row_count, tds;
      row_count = this.table.find('tbody tr').length;
      if (row_count > 0) {
        tds = this.table.find('tbody tr:first').children();
        this.header.find('thead tr').children().each((function(_this) {
          return function(i, th) {
            var td, tdw, thw, w;
            td = tds[i];
            thw = th.offsetWidth;
            tdw = td.offsetWidth;
            w = Math.max(tdw, thw);
            td.style.minWidth = w + "px";
            return th.style.minWidth = w + "px";
          };
        })(this));
      } else {
        this.table.width(this.header.width());
      }
      this.applyButton.toggleClass('tight', row_count < 100);
      this.applyButton.toggleClass('x2', row_count < 10);
      return this.fixScrolls();
    };

    QuickQueryResultView.prototype.fixScrolls = function() {
      var handlerHeight, headerHeght, numbersWidth, scroll;
      handlerHeight = 5;
      headerHeght = this.header.height();
      if (this.numbers.find('tr').length > 0) {
        numbersWidth = this.numbers.width();
        this.corner.css({
          width: numbersWidth
        });
      } else {
        numbersWidth = this.corner.outerWidth();
      }
      this.tableWrapper.css({
        left: numbersWidth,
        top: headerHeght + handlerHeight
      });
      scroll = handlerHeight + headerHeght - this.tableWrapper.scrollTop();
      this.numbers.css({
        top: scroll
      });
      scroll = numbersWidth - this.tableWrapper.scrollLeft();
      return this.header.css({
        left: scroll
      });
    };

    QuickQueryResultView.prototype.handleScrollEvent = function() {
      return this.tableWrapper.scroll((function(_this) {
        return function(e) {
          var handlerHeight, scroll;
          handlerHeight = 5;
          scroll = $(e.target).scrollTop() - handlerHeight - _this.header.height();
          _this.numbers.css({
            top: -1 * scroll
          });
          scroll = $(e.target).scrollLeft() - _this.numbers.width();
          return _this.header.css({
            left: -1 * scroll
          });
        };
      })(this));
    };

    QuickQueryResultView.prototype.onRowStatusChanged = function(callback) {
      return this.bind('quickQuery.rowStatusChanged', function(e, row) {
        return callback(row);
      });
    };

    QuickQueryResultView.prototype.handleResizeEvents = function() {
      return this.on('mousedown', '.quick-query-result-resize-handler', (function(_this) {
        return function(e) {
          return _this.resizeStarted(e);
        };
      })(this));
    };

    QuickQueryResultView.prototype.resizeStarted = function() {
      $(document).on('mousemove', this.resizeResultView);
      return $(document).on('mouseup', this.resizeStopped);
    };

    QuickQueryResultView.prototype.resizeStopped = function() {
      $(document).off('mousemove', this.resizeResultView);
      return $(document).off('mouseup', this.resizeStopped);
    };

    QuickQueryResultView.prototype.resizeResultView = function(arg) {
      var height, pageY, which;
      pageY = arg.pageY, which = arg.which;
      if (which !== 1) {
        return this.resizeStopped();
      }
      height = this.outerHeight() + this.offset().top - pageY;
      this.height(height);
      return this.fixScrolls();
    };

    return QuickQueryResultView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL3F1aWNrLXF1ZXJ5L2xpYi9xdWljay1xdWVyeS1yZXN1bHQtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGdEQUFBO0lBQUE7Ozs7RUFBQSxNQUFZLE9BQUEsQ0FBUSxzQkFBUixDQUFaLEVBQUMsZUFBRCxFQUFPOztFQUNQLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7RUFDWCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBRUwsTUFBTSxDQUFDLE9BQVAsR0FDTTs7O21DQUNKLFVBQUEsR0FBWTs7bUNBQ1osSUFBQSxHQUFNOzttQ0FDTixNQUFBLEdBQVE7O21DQUNSLFFBQUEsR0FBVTs7SUFFSSw4QkFBQTs7TUFDWix1REFBQSxTQUFBO0lBRFk7O21DQUdkLFVBQUEsR0FBWSxTQUFBO01BQ1YsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLE1BQVYsQ0FBaUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxRQUFELENBQUE7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakI7TUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLEtBQWIsQ0FBbUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLENBQUQ7aUJBQU8sS0FBQyxDQUFBLFlBQUQsQ0FBQTtRQUFQO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQjtNQUNBLElBQUMsQ0FBQSxZQUFZLENBQUMsT0FBZCxDQUFzQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRDtVQUNwQixJQUFHLENBQUMsQ0FBQyxPQUFGLEtBQWEsRUFBaEI7WUFBd0IsS0FBQyxDQUFBLFlBQVksQ0FBQyxLQUFkLENBQUEsRUFBeEI7O1VBQ0EsSUFBRyxDQUFDLENBQUMsT0FBRixLQUFhLEVBQWhCO21CQUF3QixLQUFDLENBQUEs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S0FBUyxDQUF4QztBQUFBLGVBQU8sSUFBQyxDQUFBLGFBQUQsQ0FBQSxFQUFQOztNQUNBLE1BQUEsR0FBUyxJQUFDLENBQUEsV0FBRCxDQUFBLENBQUEsR0FBaUIsSUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFTLENBQUMsR0FBM0IsR0FBaUM7TUFDMUMsSUFBQyxDQUFBLE1BQUQsQ0FBUSxNQUFSO2FBQ0EsSUFBQyxDQUFBLFVBQUQsQ0FBQTtJQUpnQjs7OztLQXRpQmU7QUFMbkMiLCJzb3VyY2VzQ29udGVudCI6WyJ7VmlldywgJH0gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcbmpzb24yY3N2ID0gcmVxdWlyZSgnanNvbjJjc3YnKVxuZnMgPSByZXF1aXJlKCdmcycpXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFF1aWNrUXVlcnlSZXN1bHRWaWV3IGV4dGVuZHMgVmlld1xuICBrZWVwSGlkZGVuOiBmYWxzZVxuICByb3dzOiBudWxsLFxuICBmaWVsZHM6IG51bGxcbiAgY2FuY2VsZWQ6IGZhbHNlXG5cbiAgY29uc3RydWN0b3I6ICAoKS0+XG4gICAgc3VwZXJcblxuICBpbml0aWFsaXplOiAtPlxuICAgICQod2luZG93KS5yZXNpemUgPT4gQGZpeFNpemVzKClcbiAgICBAYXBwbHlCdXR0b24uY2xpY2sgKGUpID0+IEBhcHBseUNoYW5nZXMoKVxuICAgIEBhY2NlcHRCdXR0b24ua2V5ZG93biAoZSkgPT5cbiAgICAgIGlmIGUua2V5Q29kZSA9PSAxMyB0aGVuIEBhY2NlcHRCdXR0b24uY2xpY2soKVxuICAgICAgaWYgZS5rZXlDb2RlID09IDM5IHRoZW4gQGNhbmNlbEJ1dHRvbi5mb2N1cygpXG4gICAgQGNhbmNlbEJ1dHRvbi5rZXlkb3duIChlKSA9PlxuICAgICAgaWYgZS5rZXlDb2RlID09IDEzIHRoZW4gQGNhbmNlbEJ1dHRvbi5jbGljaygpXG4gICAgICBpZiBlLmtleUNvZGUgPT0gMzcgdGhlbiBAYWNjZXB0QnV0dG9uLmZvY3VzKClcbiAgICBAaGFuZGxlUmVzaXplRXZlbnRzKCkgdW5sZXNzIGF0b20uY29uZmlnLmdldCgncXVpY2stcXVlcnkucmVzdWx0c0luVGFiJylcbiAgICBAaGFuZGxlU2Nyb2xsRXZlbnQoKVxuXG4gIGdldFRpdGxlOiAtPiAnUXVlcnkgUmVzdWx0J1xuXG4gIHNlcmlhbGl6ZTogLT5cblxuICBAY29udGVudDogLT5cbiAgICBAZGl2IGNsYXNzOiAncXVpY2stcXVlcnktcmVzdWx0JyAsID0+XG4gICAgICBAZGl2IGNsYXNzOiAncXVpY2stcXVlcnktcmVzdWx0LXJlc2l6ZS1oYW5kbGVyJywgJydcbiAgICAgIEB0YWJsZSBjbGFzczogJ3RhYmxlIHF1aWNrLXF1ZXJ5LXJlc3VsdC1jb3JuZXInLCA9PlxuICAgICAgICBAdGhlYWQgPT4gKEB0ciA9PiAoQHRoIG91dGxldDogJ2Nvcm5lcicsID0+XG4gICAgICAgICAgQHNwYW4gY2xhc3M6ICdoYXNoJywgJyMnXG4gICAgICAgICAgQGJ1dHRvbiBjbGFzczogJ2J0biBpY29uIGljb24tcGVuY2lsJyx0aXRsZTogJ0FwcGx5IGNoYW5nZXMnICwgb3V0bGV0OiAnYXBwbHlCdXR0b24nICwgJydcbiAgICAgICAgKSlcbiAgICAgIEB0YWJsZSBjbGFzczogJ3RhYmxlIHF1aWNrLXF1ZXJ5LXJlc3VsdC1udW1iZXJzJywgb3V0bGV0OiAnbnVtYmVycycgLD0+XG4gICAgICBAdGFibGUgY2xhc3M6ICd0YWJsZSBxdWljay1xdWVyeS1yZXN1bHQtaGVhZGVyJywgb3V0bGV0OiAnaGVhZGVyJywgPT5cbiAgICAgIEBkaXYgY2xhc3M6ICdxdWljay1xdWVyeS1yZXN1bHQtdGFibGUtd3JhcHBlcicsIG91dGxldDogJ3RhYmxlV3JhcHBlcicgLCA9PlxuICAgICAgICBAdGFibGUgY2xhc3M6ICdxdWljay1xdWVyeS1yZXN1bHQtdGFibGUgdGFibGUnLCBvdXRsZXQ6ICd0YWJsZScsIHRhYmluZGV4OiAtMSAsICcnXG4gICAgICBAZGl2IGNsYXNzOiAncHJldmlldycsIG91dGxldDogJ3ByZXZpZXcnICwgPT5cbiAgICAgICAgQGRpdiBjbGFzczogJ2NvbnRhaW5lcicsIHN5bGU6ICdwb3NpdGlvbjpyZWxhdGl2ZTsnLCA9PlxuICAgICAgQGRpdiBjbGFzczogJ2J1dHRvbnMnLCA9PlxuICAgICAgICBAYnV0dG9uIGNsYXNzOiAnYnRuIGJ0bi1zdWNjZXNzIGljb24gaWNvbi1jaGVjaycsb3V0bGV0OidhY2NlcHRCdXR0b24nLCAnJ1xuICAgICAgICBAYnV0dG9uIGNsYXNzOiAnYnRuIGJ0bi1lcnJvciBpY29uIGljb24teCcsb3V0bGV0OidjYW5jZWxCdXR0b24nLCcnXG5cbiAgbW92ZVNlbGVjdGlvbjogKGRpcmVjdGlvbiktPlxuICAgICR0ZDEgPSBAdGFibGUuZmluZCgndGQuc2VsZWN0ZWQnKVxuICAgICR0ciA9ICR0ZDEucGFyZW50KClcbiAgICBpbmRleCA9ICR0ZDEuaW5kZXgoKVxuICAgICR0ZDIgPSBzd2l0Y2ggZGlyZWN0aW9uXG4gICAgICB3aGVuICdyaWdodCcgdGhlbiAkdGQxLm5leHQoKVxuICAgICAgd2hlbiAnbGVmdCcgIHRoZW4gJHRkMS5wcmV2KClcbiAgICAgIHdoZW4gJ3VwJyAgICB0aGVuICR0ci5wcmV2KCkuY2hpbGRyZW4oKS5lcShpbmRleClcbiAgICAgIHdoZW4gJ2Rvd24nICB0aGVuICR0ci5uZXh0KCkuY2hpbGRyZW4oKS5lcShpbmRleClcbiAgICAgIHdoZW4gJ3BhZ2UtdXAnLCAncGFnZS1kb3duJ1xuICAgICAgICAkdHJzID0gJHRyLnBhcmVudCgpLmNoaWxkcmVuKClcbiAgICAgICAgcGFnZV9zaXplID0gTWF0aC5mbG9vcihAdGFibGVXcmFwcGVyLmhlaWdodCgpLyR0ZDEub3V0ZXJIZWlnaHQoKSlcbiAgICAgICAgdHJfaW5kZXggPSBpZiBkaXJlY3Rpb24gPT0gJ3BhZ2UtdXAnXG4gICAgICAgICAgTWF0aC5tYXgoMCwkdHIuaW5kZXgoKSAtIHBhZ2Vfc2l6ZSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIE1hdGgubWluKCR0cnMubGVuZ3RoLTEsJHRyLmluZGV4KCkgKyBwYWdlX3NpemUpXG4gICAgICAgICR0cnMuZXEodHJfaW5kZXgpLmNoaWxkcmVuKCkuZXEoaW5kZXgpXG4gICAgaWYgISR0ZDEuaGFzQ2xhc3MoJ2VkaXRpbmcnKSAmJiAkdGQyLmxlbmd0aCA+IDBcbiAgICAgICR0ZDEucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgICR0ZDIuYWRkQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgIHRhYmxlID0gQHRhYmxlV3JhcHBlci5vZmZzZXQoKVxuICAgICAgdGFibGUuYm90dG9tID0gdGFibGUudG9wICsgQHRhYmxlV3JhcHBlci5oZWlnaHQoKVxuICAgICAgdGFibGUucmlnaHQgPSB0YWJsZS5sZWZ0ICsgQHRhYmxlV3JhcHBlci53aWR0aCgpXG4gICAgICBjZWxsID0gJHRkMi5vZmZzZXQoKVxuICAgICAgY2VsbC5ib3R0b20gPSBjZWxsLnRvcCArICR0ZDIuaGVpZ2h0KClcbiAgICAgIGNlbGwucmlnaHQgPSBjZWxsLmxlZnQgKyAkdGQyLndpZHRoKClcbiAgICAgIGlmIGNlbGwudG9wIDwgdGFibGUudG9wXG4gICAgICAgIEB0YWJsZVdyYXBwZXIuc2Nyb2xsVG9wKEB0YWJsZVdyYXBwZXIuc2Nyb2xsVG9wKCkgLSB0YWJsZS50b3AgKyBjZWxsLnRvcClcbiAgICAgIGlmIGNlbGwuYm90dG9tID4gdGFibGUuYm90dG9tXG4gICAgICAgIEB0YWJsZVdyYXBwZXIuc2Nyb2xsVG9wKEB0YWJsZVdyYXBwZXIuc2Nyb2xsVG9wKCkgKyBjZWxsLmJvdHRvbSAtIHRhYmxlLmJvdHRvbSArIDEuNSAqICR0ZDIuaGVpZ2h0KCkpXG4gICAgICBpZiBjZWxsLmxlZnQgPCB0YWJsZS5sZWZ0XG4gICAgICAgIEB0YWJsZVdyYXBwZXIuc2Nyb2xsTGVmdChAdGFibGVXcmFwcGVyLnNjcm9sbExlZnQoKSAtIHRhYmxlLmxlZnQgKyBjZWxsLmxlZnQpXG4gICAgICBpZiBjZWxsLnJpZ2h0ID4gdGFibGUucmlnaHRcbiAgICAgICAgQHRhYmxlV3JhcHBlci5zY3JvbGxMZWZ0KEB0YWJsZVdyYXBwZXIuc2Nyb2xsTGVmdCgpICsgY2VsbC5yaWdodCAtIHRhYmxlLnJpZ2h0ICsgMS41ICogJHRkMi53aWR0aCgpKVxuXG4gIGZvY3VzVGFibGU6IC0+XG4gICAgQHRhYmxlLmZvY3VzKCkgdW5sZXNzIEBoYXNDbGFzcygnY29uZmlybWF0aW9uJylcblxuICBnZXRDdXJzb3I6IC0+XG4gICAgJHRkID0gQHRhYmxlLmZpbmQoJ3RkLnNlbGVjdGVkJylcbiAgICB4ID0gJHRkLmluZGV4KClcbiAgICB5ID0gJHRkLnBhcmVudCgpLmluZGV4KClcbiAgICBpZiB4ICE9IC0xIHRoZW4gW3gseV0gZWxzZSBudWxsXG5cbiAgc2V0Q3Vyc29yOiAoeCx5KS0+XG4gICAgJHRkMSA9IEB0YWJsZS5maW5kKCd0ZC5zZWxlY3RlZCcpXG4gICAgJHRkMiA9IEB0YWJsZS5maW5kKCd0Ym9keScpLmNoaWxkcmVuKCkuZXEoeSkuY2hpbGRyZW4oKS5lcSh4KVxuICAgIGlmICR0ZDIubGVuZ3RoID4gMCAmJiAkdGQxWzBdICE9ICR0ZDJbMF1cbiAgICAgICR0ZDEucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgICR0ZDIuYWRkQ2xhc3MoJ3NlbGVjdGVkJylcblxuICBlZGl0U2VsZWN0ZWQ6IC0+XG4gICAgdGQgPSBAc2VsZWN0ZWRUZCgpXG4gICAgaWYgdGQ/ICYmIEBjb25uZWN0aW9uLmFsbG93RWRpdGlvblxuICAgICAgZWRpdG9ycyA9IHRkLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiYXRvbS10ZXh0LWVkaXRvclwiKVxuICAgICAgaWYgZWRpdG9ycy5sZW5ndGggPT0gMFxuICAgICAgICBAZWRpdFJlY29yZCh0ZClcbiAgICAgIGVsc2VcbiAgICAgICAgdmFsID0gZWRpdG9yc1swXS5nZXRNb2RlbCgpLmdldFRleHQoKVxuICAgICAgICBAc2V0Q2VsbFZhbCh0ZCx2YWwpXG4gICAgICAgIEB0YWJsZS5mb2N1cygpXG5cbiAgIyBUZWFyIGRvd24gYW55IHN0YXRlIGFuZCBkZXRhY2hcbiAgZGVzdHJveTogLT5cbiAgICAjIEBlbGVtZW50LnJlbW92ZSgpXG5cbiAgc2hvd1Jvd3M6IChAcm93cywgQGZpZWxkcyxAY29ubmVjdGlvbixkb25lKS0+XG4gICAgQHJlbW92ZUNsYXNzKCdjaGFuZ2VkIGNvbmZpcm1hdGlvbicpXG4gICAgQGF0dHIgJ2RhdGEtYWxsb3ctZWRpdGlvbicgLCA9PlxuICAgICAgaWYgQGNvbm5lY3Rpb24uYWxsb3dFZGl0aW9uIHRoZW4gJ3llcycgZWxzZSBudWxsXG4gICAgQGtlZXBIaWRkZW4gPSBmYWxzZVxuICAgIHRoZWFkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGhlYWQnKVxuICAgIHRyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKVxuICAgIGZvciBmaWVsZCBpbiBAZmllbGRzXG4gICAgICB0aCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RoJylcbiAgICAgIHRoLnRleHRDb250ZW50ID0gZmllbGQubmFtZVxuICAgICAgdHIuYXBwZW5kQ2hpbGQodGgpXG4gICAgdGhlYWQuYXBwZW5kQ2hpbGQodHIpXG4gICAgQGhlYWRlci5odG1sKHRoZWFkKVxuICAgIG51bWJlcnNCb2R5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGJvZHknKVxuICAgIEBudW1iZXJzLmh0bWwobnVtYmVyc0JvZHkpXG4gICAgdGJvZHkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0Ym9keScpXG4gICAgIyBmb3Igcm93LGkgaW4gQHJvd3NcbiAgICBAY2FuY2VsZWQgPSBmYWxzZVxuICAgIEBmb3JFYWNoQ2h1bmsgQHJvd3MgLCBkb25lICwgKHJvdyxpKSA9PlxuICAgICAgYXJyYXlfcm93ID0gQXJyYXkuaXNBcnJheShyb3cpXG4gICAgICB0ciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RyJylcbiAgICAgIHRkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKVxuICAgICAgdGQudGV4dENvbnRlbnQgPSBpKzFcbiAgICAgIHRyLmFwcGVuZENoaWxkIHRkXG4gICAgICBudW1iZXJzQm9keS5hcHBlbmRDaGlsZCh0cilcbiAgICAgIHRyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKVxuICAgICAgZm9yIGZpZWxkLGogaW4gQGZpZWxkc1xuICAgICAgICB0ZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJylcbiAgICAgICAgcm93X3ZhbHVlID0gaWYgYXJyYXlfcm93IHRoZW4gcm93W2pdIGVsc2Ugcm93W2ZpZWxkLm5hbWVdXG4gICAgICAgIGlmIHJvd192YWx1ZT9cbiAgICAgICAgICB0ZC5zZXRBdHRyaWJ1dGUgJ2RhdGEtb3JpZ2luYWwtdmFsdWUnICwgcm93X3ZhbHVlXG4gICAgICAgICAgdGQudGV4dENvbnRlbnQgPSByb3dfdmFsdWVcbiAgICAgICAgICBAc2hvd0ludmlzaWJsZXModGQpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICB0ZC5kYXRhc2V0Lm9yaWdpbmFsVmFsdWVOdWxsID0gdHJ1ZVxuICAgICAgICAgIHRkLmNsYXNzTGlzdC5hZGQgJ251bGwnXG4gICAgICAgICAgdGQudGV4dENvbnRlbnQgPSAnTlVMTCdcbiAgICAgICAgdGQuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2Vkb3duJywgKGUpPT5cbiAgICAgICAgICBAdGFibGUuZmluZCgndGQnKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgICAgIGUuY3VycmVudFRhcmdldC5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZCcpXG4gICAgICAgIGlmIEBjb25uZWN0aW9uLmFsbG93RWRpdGlvblxuICAgICAgICAgIHRkLmFkZEV2ZW50TGlzdGVuZXIgJ2RibGNsaWNrJywgKGUpPT4gQGVkaXRSZWNvcmQoZS5jdXJyZW50VGFyZ2V0KVxuICAgICAgICB0ci5hcHBlbmRDaGlsZCB0ZFxuICAgICAgdGJvZHkuYXBwZW5kQ2hpbGQodHIpXG4gICAgQHRhYmxlLmh0bWwodGJvZHkpXG5cbiAgc2hvd0ludmlzaWJsZXM6ICh0ZCktPlxuICAgIHRkLmlubmVySFRNTCA9IHRkLmlubmVySFRNTFxuICAgICAgLnJlcGxhY2UoL1xcclxcbi9nLCc8c3BhbiBjbGFzcz1cImNybGZcIj48L3NwYW4+JylcbiAgICAgIC5yZXBsYWNlKC9cXG4vZywnPHNwYW4gY2xhc3M9XCJsZlwiPjwvc3Bhbj4nKVxuICAgICAgLnJlcGxhY2UoL1xcci9nLCc8c3BhbiBjbGFzcz1cImNyXCI+PC9zcGFuPicpXG4gICAgcy50ZXh0Q29udGVudCA9IFwiXFxyXFxuXCIgZm9yIHMgaW4gdGQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImNybGZcIilcbiAgICBzLnRleHRDb250ZW50ID0gXCJcXG5cIiBmb3IgcyBpbiB0ZC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwibGZcIilcbiAgICBzLnRleHRDb250ZW50ID0gXCJcXHJcIiBmb3IgcyBpbiB0ZC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiY3JcIilcblxuICBmb3JFYWNoQ2h1bms6IChhcnJheSxkb25lLGZuKS0+XG4gICAgY2h1bmNrc2l6ZSA9IDEwMFxuICAgIGluZGV4ID0gMFxuICAgIGRvQ2h1bmsgPSAoKT0+XG4gICAgICBjbnQgPSBjaHVuY2tzaXplXG4gICAgICB3aGlsZSBjbnQgPiAwICYmIGluZGV4IDwgYXJyYXkubGVuZ3RoXG4gICAgICAgIGZuLmNhbGwoQCxhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSlcbiAgICAgICAgKytpbmRleFxuICAgICAgICBjbnQtLVxuICAgICAgaWYgaW5kZXggPCBhcnJheS5sZW5ndGhcbiAgICAgICAgQGxvb3AgPSBzZXRUaW1lb3V0KGRvQ2h1bmssIDEpXG4gICAgICBlbHNlXG4gICAgICAgIEBsb29wID0gbnVsbFxuICAgICAgICBkb25lPygpXG4gICAgZG9DaHVuaygpXG5cbiAgc3RvcExvb3A6IC0+XG4gICAgaWYgQGxvb3A/XG4gICAgICBjbGVhclRpbWVvdXQoQGxvb3ApXG4gICAgICBAbG9vcCA9IG51bGxcbiAgICAgIEBjYW5jZWxlZCA9IHRydWVcblxuICByb3dzU3RhdHVzOiAtPlxuICAgIGFkZGVkID0gQHRhYmxlLmZpbmQoJ3RyLmFkZGVkJykubGVuZ3RoXG4gICAgc3RhdHVzID0gKEByb3dzLmxlbmd0aCArIGFkZGVkKS50b1N0cmluZygpXG4gICAgc3RhdHVzICs9IGlmIHN0YXR1cyA9PSAnMScgdGhlbiAnIHJvdycgZWxzZSAnIHJvd3MnXG4gICAgaWYgQGNhbmNlbGVkXG4gICAgICB0cl9jb3VudCA9IEB0YWJsZS5maW5kKCd0cicpLmxlbmd0aFxuICAgICAgc3RhdHVzID0gXCIje3RyX2NvdW50fSBvZiAje3N0YXR1c31cIlxuICAgIHN0YXR1cyArPSBcIiwje2FkZGVkfSBhZGRlZFwiIGlmIGFkZGVkID4gMFxuICAgIG1vZGlmaWVkID0gQHRhYmxlLmZpbmQoJ3RyLm1vZGlmaWVkJykubGVuZ3RoXG4gICAgc3RhdHVzICs9IFwiLCN7bW9kaWZpZWR9IG1vZGlmaWVkXCIgaWYgbW9kaWZpZWQgPiAwXG4gICAgcmVtb3ZlZCA9IEB0YWJsZS5maW5kKCd0ci5yZW1vdmVkJykubGVuZ3RoXG4gICAgc3RhdHVzICs9IFwiLCN7cmVtb3ZlZH0gZGVsZXRlZFwiIGlmIHJlbW92ZWQgPiAwXG4gICAgQHRvZ2dsZUNsYXNzKCdjaGFuZ2VkJyxhZGRlZCttb2RpZmllZCtyZW1vdmVkPjApXG4gICAgc3RhdHVzXG5cbiAgY29weTogLT5cbiAgICAkdGQgPSBAZmluZCgndGQuc2VsZWN0ZWQnKVxuICAgIGlmICR0ZC5sZW5ndGggPT0gMVxuICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUoJHRkLnRleHQoKSlcblxuICBwYXN0ZTogLT5cbiAgICBpZiBAY29ubmVjdGlvbi5hbGxvd0VkaXRpb25cbiAgICAgIHRkID0gQHNlbGVjdGVkVGQoKVxuICAgICAgdmFsID0gYXRvbS5jbGlwYm9hcmQucmVhZCgpXG4gICAgICBAc2V0Q2VsbFZhbCh0ZCx2YWwpXG4gIGNvcHlBbGw6IC0+XG4gICAgaWYgQHJvd3M/ICYmIEBmaWVsZHM/XG4gICAgICBpZiBBcnJheS5pc0FycmF5KEByb3dzWzBdKVxuICAgICAgICBmaWVsZHMgPSBAZmllbGRzLm1hcCAoZmllbGQsaSkgLT5cbiAgICAgICAgICBsYWJlbDogZmllbGQubmFtZVxuICAgICAgICAgIHZhbHVlOiAocm93KS0+IHJvd1tpXVxuICAgICAgZWxzZVxuICAgICAgICBmaWVsZHMgPSBAZmllbGRzLm1hcCAoZmllbGQpIC0+IGZpZWxkLm5hbWVcbiAgICAgIHJvd3MgPSBAcm93cy5tYXAgKHJvdykgLT5cbiAgICAgICAgc2ltcGxlUm93ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShyb3cpKVxuICAgICAgICBzaW1wbGVSb3dcbiAgICAgIGpzb24yY3N2IGRlbDogXCJcXHRcIiwgZGF0YTogcm93cyAsIGZpZWxkczogZmllbGRzICwgZGVmYXVsdFZhbHVlOiAnJyAsIChlcnIsIGNzdiktPlxuICAgICAgICBpZiAoZXJyKVxuICAgICAgICAgIGNvbnNvbGUubG9nKGVycilcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKGNzdilcblxuICBzYXZlQ1NWOiAtPlxuICAgIGlmIEByb3dzPyAmJiBAZmllbGRzP1xuICAgICAgYXRvbS5nZXRDdXJyZW50V2luZG93KCkuc2hvd1NhdmVEaWFsb2cgdGl0bGU6ICdTYXZlIFF1ZXJ5IFJlc3VsdCBhcyBDU1YnLCBkZWZhdWx0UGF0aDogcHJvY2Vzcy5jd2QoKSwgKGZpbGVwYXRoKSA9PlxuICAgICAgICBpZiBmaWxlcGF0aD9cbiAgICAgICAgICBpZiBBcnJheS5pc0FycmF5KEByb3dzWzBdKVxuICAgICAgICAgICAgZmllbGRzID0gQGZpZWxkcy5tYXAgKGZpZWxkLGkpIC0+XG4gICAgICAgICAgICAgIGxhYmVsOiBmaWVsZC5uYW1lXG4gICAgICAgICAgICAgIHZhbHVlOiAocm93KS0+IHJvd1tpXVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGZpZWxkcyA9IEBmaWVsZHMubWFwIChmaWVsZCkgLT4gZmllbGQubmFtZVxuICAgICAgICAgIHJvd3MgPSBAcm93cy5tYXAgKHJvdykgLT5cbiAgICAgICAgICAgIHNpbXBsZVJvdyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkocm93KSlcbiAgICAgICAgICAgIHNpbXBsZVJvd1tmaWVsZF0gPz0gJycgZm9yIGZpZWxkIGluIGZpZWxkc1xuICAgICAgICAgICAgc2ltcGxlUm93XG4gICAgICAgICAganNvbjJjc3YgIGRhdGE6IHJvd3MgLCBmaWVsZHM6IGZpZWxkcyAsIGRlZmF1bHRWYWx1ZTogJycgLCAoZXJyLCBjc3YpLT5cbiAgICAgICAgICAgIGlmIChlcnIpXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycilcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgZnMud3JpdGVGaWxlIGZpbGVwYXRoLCBjc3YsIChlcnIpLT5cbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB0aGVuIGNvbnNvbGUubG9nKGVycikgZWxzZSBjb25zb2xlLmxvZygnZmlsZSBzYXZlZCcpXG5cbiAgZWRpdFJlY29yZDogKHRkKS0+XG4gICAgaWYgdGQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJhdG9tLXRleHQtZWRpdG9yXCIpLmxlbmd0aCA9PSAwXG4gICAgICB0ZC5jbGFzc0xpc3QuYWRkKCdlZGl0aW5nJylcbiAgICAgIEBlZGl0aW5nICA9IHRydWVcbiAgICAgIGVkaXRvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F0b20tdGV4dC1lZGl0b3InKVxuICAgICAgZWRpdG9yLnNldEF0dHJpYnV0ZSgnbWluaScsJ21pbmknKTtcbiAgICAgIGVkaXRvci5jbGFzc0xpc3QuYWRkKCdlZGl0b3InKVxuICAgICAgdGV4dEVkaXRvciA9IGVkaXRvci5nZXRNb2RlbCgpXG4gICAgICB0ZXh0RWRpdG9yLnNldFRleHQodGQudGV4dENvbnRlbnQpIHVubGVzcyB0ZC5jbGFzc0xpc3QuY29udGFpbnMoJ251bGwnKVxuICAgICAgdGQuaW5uZXJIVE1MID0gJydcbiAgICAgIHRkLmFwcGVuZENoaWxkKGVkaXRvcilcbiAgICAgIHRleHRFZGl0b3Iub25EaWRDaGFuZ2VDdXJzb3JQb3NpdGlvbiAoZSkgPT5cbiAgICAgICAgaWYgZWRpdG9yLm9mZnNldFdpZHRoID4gQHRhYmxlV3JhcHBlci53aWR0aCgpICNjZW50ZXIgY3Vyc29yIG9uIHNjcmVlblxuICAgICAgICAgIHRkID0gZWRpdG9yLnBhcmVudE5vZGVcbiAgICAgICAgICB0ciA9IHRkLnBhcmVudE5vZGVcbiAgICAgICAgICBjaGFyV2lkdGggPSAgdGV4dEVkaXRvci5nZXREZWZhdWx0Q2hhcldpZHRoKClcbiAgICAgICAgICBjb2x1bW4gPSBlLm5ld1NjcmVlblBvc2l0aW9uLmNvbHVtblxuICAgICAgICAgIHRybGVmdCA9IC0xICogJCh0cikub2Zmc2V0KCkubGVmdFxuICAgICAgICAgIHRkbGVmdCA9ICAkKHRkKS5vZmZzZXQoKS5sZWZ0XG4gICAgICAgICAgd2lkdGggPSBAdGFibGVXcmFwcGVyLndpZHRoKCkgLyAyXG4gICAgICAgICAgbGVmdCA9IHRybGVmdCArIHRkbGVmdCAtIHdpZHRoXG4gICAgICAgICAgaWYgTWF0aC5hYnMoQHRhYmxlV3JhcHBlci5zY3JvbGxMZWZ0KCkgLSAobGVmdCArIGNvbHVtbiAqIGNoYXJXaWR0aCkpID4gd2lkdGhcbiAgICAgICAgICAgIEB0YWJsZVdyYXBwZXIuc2Nyb2xsTGVmdChsZWZ0ICsgY29sdW1uICogY2hhcldpZHRoKVxuICAgICAgZWRpdG9yLmFkZEV2ZW50TGlzdGVuZXIgJ2JsdXInLCAoZSkgPT5cbiAgICAgICAgdGQgPSBlLmN1cnJlbnRUYXJnZXQucGFyZW50Tm9kZVxuICAgICAgICB2YWwgPSBlLmN1cnJlbnRUYXJnZXQuZ2V0TW9kZWwoKS5nZXRUZXh0KClcbiAgICAgICAgQHNldENlbGxWYWwodGQsdmFsKVxuICAgICAgJChlZGl0b3IpLmZvY3VzKClcblxuICBzZXRDZWxsVmFsOiAodGQsdGV4dCktPlxuICAgIEBlZGl0aW5nID0gZmFsc2VcbiAgICB0ZC5jbGFzc0xpc3QucmVtb3ZlKCdlZGl0aW5nJywnbnVsbCcpXG4gICAgdHIgPSB0ZC5wYXJlbnROb2RlXG4gICAgIyR0ci5oYXNDbGFzcygnc3RhdHVzLXJlbW92ZWQnKSByZXR1cm5cbiAgICB0ZC50ZXh0Q29udGVudCA9IHRleHRcbiAgICBAc2hvd0ludmlzaWJsZXModGQpXG4gICAgQGZpeFNpemVzKClcbiAgICBpZiB0ci5jbGFzc0xpc3QuY29udGFpbnMoJ2FkZGVkJylcbiAgICAgIHRkLmNsYXNzTGlzdC5yZW1vdmUoJ2RlZmF1bHQnKVxuICAgICAgdGQuY2xhc3NMaXN0LmFkZCgnc3RhdHVzLWFkZGVkJylcbiAgICBlbHNlIGlmIHRleHQgIT0gdGQuZ2V0QXR0cmlidXRlKCdkYXRhLW9yaWdpbmFsLXZhbHVlJylcbiAgICAgICAgdHIuY2xhc3NMaXN0LmFkZCgnbW9kaWZpZWQnKVxuICAgICAgICB0ZC5jbGFzc0xpc3QuYWRkKCdzdGF0dXMtbW9kaWZpZWQnKVxuICAgIGVsc2VcbiAgICAgIHRkLmNsYXNzTGlzdC5yZW1vdmUoJ3N0YXR1cy1tb2RpZmllZCcpXG4gICAgICBpZiB0ci5xdWVyeVNlbGVjdG9yKCd0ZC5zdGF0dXMtbW9kaWZpZWQnKSA9PSBudWxsXG4gICAgICAgIHRyLmNsYXNzTGlzdC5yZW1vdmUoJ21vZGlmaWVkJylcbiAgICBAdHJpZ2dlcigncXVpY2tRdWVyeS5yb3dTdGF0dXNDaGFuZ2VkJyxbdHJdKVxuXG4gIGluc2VydFJlY29yZDogLT5cbiAgICB0ZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ3RkJ1xuICAgIHRyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCAndHInXG4gICAgbnVtYmVyID0gQG51bWJlcnMuZmluZCgndHInKS5sZW5ndGggKyAxXG4gICAgdGQudGV4dENvbnRlbnQgPSBudW1iZXJcbiAgICB0ci5hcHBlbmRDaGlsZCh0ZClcbiAgICBAbnVtYmVycy5jaGlsZHJlbigndGJvZHknKS5hcHBlbmQodHIpXG4gICAgdHIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50ICd0cidcbiAgICB0ci5jbGFzc0xpc3QuYWRkICdhZGRlZCdcbiAgICBAaGVhZGVyLmZpbmQoXCJ0aFwiKS5lYWNoID0+XG4gICAgICB0ZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ3RkJ1xuICAgICAgdGQuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2Vkb3duJywgKGUpPT5cbiAgICAgICAgQHRhYmxlLmZpbmQoJ3RkJykucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgICAgZS5jdXJyZW50VGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJylcbiAgICAgIHRkLmNsYXNzTGlzdC5hZGQoJ2RlZmF1bHQnKVxuICAgICAgdGQuYWRkRXZlbnRMaXN0ZW5lciAnZGJsY2xpY2snLCAoZSkgPT4gQGVkaXRSZWNvcmQoZS5jdXJyZW50VGFyZ2V0KVxuICAgICAgdHIuYXBwZW5kQ2hpbGQodGQpXG4gICAgQHRhYmxlLmZpbmQoJ3Rib2R5JykuYXBwZW5kKHRyKVxuICAgIEBmaXhTaXplcygpIGlmIG51bWJlciA9PSAxXG4gICAgQHRhYmxlV3JhcHBlci5zY3JvbGxUb3AgLT4gdGhpcy5zY3JvbGxIZWlnaHRcbiAgICBAdHJpZ2dlcigncXVpY2tRdWVyeS5yb3dTdGF0dXNDaGFuZ2VkJyxbdHJdKVxuXG4gIHNlbGVjdGVkVGQ6IC0+IEBmaW5kKCd0ZC5zZWxlY3RlZCcpLmdldCgwKVxuXG4gIGRlbGV0ZVJlY29yZDogLT5cbiAgICB0ZCA9IEBzZWxlY3RlZFRkKClcbiAgICBpZiBAY29ubmVjdGlvbi5hbGxvd0VkaXRpb24gJiYgdGQ/XG4gICAgICB0ciA9IHRkLnBhcmVudE5vZGVcbiAgICAgIHRyLmNsYXNzTGlzdC5yZW1vdmUoJ21vZGlmaWVkJylcbiAgICAgIGZvciB0ZDEgaW4gdHIuY2hpbGRyZW5cbiAgICAgICAgdGQxLmNsYXNzTGlzdC5yZW1vdmUoJ3N0YXR1cy1tb2RpZmllZCcpXG4gICAgICB0ci5jbGFzc0xpc3QuYWRkKCdzdGF0dXMtcmVtb3ZlZCcsJ3JlbW92ZWQnKVxuICAgICAgQHRyaWdnZXIoJ3F1aWNrUXVlcnkucm93U3RhdHVzQ2hhbmdlZCcsW3RyXSlcblxuICB1bmRvOiAtPlxuICAgIHRkID0gQHNlbGVjdGVkVGQoKVxuICAgIGlmIHRkP1xuICAgICAgdHIgPSB0ZC5wYXJlbnROb2RlXG4gICAgICBpZiB0ci5jbGFzc0xpc3QuY29udGFpbnMoJ3JlbW92ZWQnKVxuICAgICAgICB0ci5jbGFzc0xpc3QucmVtb3ZlKCdzdGF0dXMtcmVtb3ZlZCcsJ3JlbW92ZWQnKVxuICAgICAgZWxzZSBpZiB0ci5jbGFzc0xpc3QuY29udGFpbnMoJ2FkZGVkJylcbiAgICAgICAgdGQuY2xhc3NMaXN0LnJlbW92ZSgnbnVsbCcpXG4gICAgICAgIHRkLmNsYXNzTGlzdC5hZGQoJ2RlZmF1bHQnKVxuICAgICAgICB0ZC50ZXh0Q29udGVudCA9ICcnXG4gICAgICBlbHNlXG4gICAgICAgIGlmIHRkLmRhdGFzZXQub3JpZ2luYWxWYWx1ZU51bGxcbiAgICAgICAgICB0ZC5jbGFzc0xpc3QuYWRkKCdudWxsJylcbiAgICAgICAgICB0ZC50ZXh0Q29udGVudCA9ICdOVUxMJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgdmFsdWUgPSB0ZC5nZXRBdHRyaWJ1dGUoJ2RhdGEtb3JpZ2luYWwtdmFsdWUnKVxuICAgICAgICAgIHRkLmNsYXNzTGlzdC5yZW1vdmUoJ251bGwnKVxuICAgICAgICAgIHRkLnRleHRDb250ZW50ID0gdmFsdWVcbiAgICAgICAgICBAc2hvd0ludmlzaWJsZXModGQpXG4gICAgICAgIHRkLmNsYXNzTGlzdC5yZW1vdmUoJ3N0YXR1cy1tb2RpZmllZCcpXG4gICAgICAgIGlmIHRyLnF1ZXJ5U2VsZWN0b3IoJ3RkLnN0YXR1cy1tb2RpZmllZCcpID09IG51bGxcbiAgICAgICAgICB0ci5jbGFzc0xpc3QucmVtb3ZlKCdtb2RpZmllZCcpXG4gICAgICBAdHJpZ2dlcigncXVpY2tRdWVyeS5yb3dTdGF0dXNDaGFuZ2VkJyxbdHJdKVxuXG4gIHNldE51bGw6IC0+XG4gICAgdGQgPSBAc2VsZWN0ZWRUZCgpXG4gICAgaWYgQGNvbm5lY3Rpb24uYWxsb3dFZGl0aW9uICYmIHRkPyAmJiAhdGQuY2xhc3NMaXN0LmNvbnRhaW5zKCdudWxsJylcbiAgICAgIHRyID0gdGQucGFyZW50Tm9kZVxuICAgICAgIyR0ci5oYXNDbGFzcygnc3RhdHVzLXJlbW92ZWQnKSByZXR1cm5cbiAgICAgIHRkLnRleHRDb250ZW50ID0gJ05VTEwnXG4gICAgICB0ZC5jbGFzc0xpc3QuYWRkKCdudWxsJylcbiAgICAgIGlmIHRyLmNsYXNzTGlzdC5jb250YWlucygnYWRkZWQnKVxuICAgICAgICB0ZC5jbGFzc0xpc3QucmVtb3ZlKCdkZWZhdWx0JylcbiAgICAgICAgdGQuY2xhc3NMaXN0LmFkZCgnc3RhdHVzLWFkZGVkJylcbiAgICAgIGVsc2UgaWYgdGQuZGF0YXNldC5vcmlnaW5hbFZhbHVlTnVsbFxuICAgICAgICB0ZC5jbGFzc0xpc3QucmVtb3ZlKCdzdGF0dXMtbW9kaWZpZWQnKVxuICAgICAgICBpZiB0ci5xdWVyeVNlbGVjdG9yKCd0ZC5zdGF0dXMtbW9kaWZpZWQnKSA9PSBudWxsXG4gICAgICAgICAgdHIuY2xhc3NMaXN0LnJlbW92ZSgnbW9kaWZpZWQnKVxuICAgICAgZWxzZVxuICAgICAgICB0ci5jbGFzc0xpc3QuYWRkKCdtb2RpZmllZCcpXG4gICAgICAgIHRkLmNsYXNzTGlzdC5hZGQoJ3N0YXR1cy1tb2RpZmllZCcpXG4gICAgICBAdHJpZ2dlcigncXVpY2tRdWVyeS5yb3dTdGF0dXNDaGFuZ2VkJyxbdHJdKVxuXG4gIGdldFNlbnRlbmNlczogLT5cbiAgICBzZW50ZW5jZXMgPSBbXVxuICAgIEB0YWJsZS5maW5kKCd0Ym9keSB0cicpLmVhY2ggKGksdHIpPT5cbiAgICAgIHZhbHVlcyA9IHt9XG4gICAgICBwcm9taXNlID0gaWYgdHIuY2xhc3NMaXN0LmNvbnRhaW5zKCdtb2RpZmllZCcpXG4gICAgICAgIHJvdyA9IEByb3dzW2ldXG4gICAgICAgIGZvciB0ZCxqIGluIHRyLmNoaWxkTm9kZXNcbiAgICAgICAgICBpZiB0ZC5jbGFzc0xpc3QuY29udGFpbnMoJ3N0YXR1cy1tb2RpZmllZCcpXG4gICAgICAgICAgICB2YWx1ZSA9IGlmIHRkLmNsYXNzTGlzdC5jb250YWlucygnbnVsbCcpIHRoZW4gbnVsbCBlbHNlIHRkLnRleHRDb250ZW50XG4gICAgICAgICAgICB2YWx1ZXNbQGZpZWxkc1tqXS5uYW1lXSA9IHZhbHVlXG4gICAgICAgIGZpZWxkcyA9IEBmaWVsZHMuZmlsdGVyIChmaWVsZCkgLT4gdmFsdWVzLmhhc093blByb3BlcnR5KGZpZWxkLm5hbWUpXG4gICAgICAgIEBjb25uZWN0aW9uLnVwZGF0ZVJlY29yZChyb3csZmllbGRzLHZhbHVlcylcbiAgICAgIGVsc2UgaWYgdHIuY2xhc3NMaXN0LmNvbnRhaW5zKCdhZGRlZCcpXG4gICAgICAgIGZvciB0ZCxqIGluIHRyLmNoaWxkTm9kZXNcbiAgICAgICAgICB1bmxlc3MgdGQuY2xhc3NMaXN0LmNvbnRhaW5zKCdkZWZhdWx0JylcbiAgICAgICAgICAgIHZhbHVlID0gaWYgdGQuY2xhc3NMaXN0LmNvbnRhaW5zKCdudWxsJykgdGhlbiBudWxsIGVsc2UgdGQudGV4dENvbnRlbnRcbiAgICAgICAgICAgIHZhbHVlc1tAZmllbGRzW2pdLm5hbWVdID0gdmFsdWVcbiAgICAgICAgZmllbGRzID0gQGZpZWxkcy5maWx0ZXIgKGZpZWxkKSAtPiB2YWx1ZXMuaGFzT3duUHJvcGVydHkoZmllbGQubmFtZSlcbiAgICAgICAgQGNvbm5lY3Rpb24uaW5zZXJ0UmVjb3JkKGZpZWxkcyx2YWx1ZXMpXG4gICAgICBlbHNlIGlmIHRyLmNsYXNzTGlzdC5jb250YWlucygnc3RhdHVzLXJlbW92ZWQnKVxuICAgICAgICByb3cgPSBAcm93c1tpXVxuICAgICAgICBAY29ubmVjdGlvbi5kZWxldGVSZWNvcmQocm93LEBmaWVsZHMpXG4gICAgICBlbHNlIG51bGxcbiAgICAgIGlmIHByb21pc2U/IHRoZW4gc2VudGVuY2VzLnB1c2ggcHJvbWlzZS50aGVuIChzZW50ZW5jZSkgLT5cbiAgICAgICAgbmV3IFByb21pc2UgKHJlc29sdmUscmVqZWN0KSAtPiByZXNvbHZlKHtzZW50ZW5jZSx0cixpbmRleDppfSlcbiAgICBQcm9taXNlLmFsbChzZW50ZW5jZXMpXG5cbiAgY29weUNoYW5nZXM6IC0+XG4gICAgQGdldFNlbnRlbmNlcygpLnRoZW4gKHNlbnRlbmNlcyktPlxuICAgICAgY2hhbmdlcyA9IHNlbnRlbmNlcy5tYXAgKHtzZW50ZW5jZX0pLT4gc2VudGVuY2VcbiAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKGNoYW5nZXMuam9pbihcIlxcblwiKSlcbiAgICAuY2F0Y2ggKGVyciktPiBjb25zb2xlLmxvZyBlcnJcblxuICBjb25maXJtOiAtPlxuICAgIEBhY2NlcHRCdXR0b24uZm9jdXMoKVxuICAgIG5ldyBQcm9taXNlIChyZXNvbHZlLHJlamVjdCkgPT5cbiAgICAgIEBhY2NlcHRCdXR0b24ub2ZmKCdjbGljay5jb25maXJtJykub25lICdjbGljay5jb25maXJtJywgKGUpIC0+IHJlc29sdmUodHJ1ZSlcbiAgICAgIEBjYW5jZWxCdXR0b24ub2ZmKCdjbGljay5jb25maXJtJykub25lICdjbGljay5jb25maXJtJywgKGUpIC0+IHJlc29sdmUoZmFsc2UpXG5cbiAgYXBwbHlDaGFuZ2VzOiAtPlxuICAgIEBnZXRTZW50ZW5jZXMoKS50aGVuIChzZW50ZW5jZXMpID0+XG4gICAgICByZXR1cm4gaWYgc2VudGVuY2VzLmxlbmd0aCA9PSAwXG4gICAgICBpZiBzZW50ZW5jZXMuZXZlcnkoICh7c2VudGVuY2V9KS0+ICEvXFxTLy50ZXN0KHNlbnRlbmNlKSApXG4gICAgICAgIHdyID0gXCJcIlwiXG4gICAgICAgICBDb3VsZG4ndCBnZW5lcmF0ZSBTUUxcXG5cbiAgICAgICAgIE1ha2Ugc3VyZSB0aGF0OlxcblxuICAgICAgICAgKiBUaGUgcHJpbWFyeSBrZXkgaXMgaW5jbHVkZWQgaW4gdGhlIHF1ZXJ5LlxcblxuICAgICAgICAgKiBUaGUgZWRpdGVkIGNvbHVtbiBpc24ndCBhIGNvbXB1dGVkIGNvbHVtbi5cXG5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKHdyLCBkaXNtaXNzYWJsZTogdHJ1ZSlcbiAgICAgICAgcmV0dXJuXG4gICAgICBAYWRkQ2xhc3MoJ2NvbmZpcm1hdGlvbicpXG4gICAgICBAbG9hZFByZXZpZXcoc2VudGVuY2VzKVxuICAgICAgQGNvbmZpcm0oKS50aGVuIChhY2NlcHQpID0+XG4gICAgICAgIEByZW1vdmVDbGFzcygnY29uZmlybWF0aW9uJylcbiAgICAgICAgaWYgYWNjZXB0IHRoZW4gQGV4ZWN1dGVDaGFuZ2Uoc2VudGVuY2UsdHIsaW5kZXgpIGZvciB7c2VudGVuY2UsdHIsaW5kZXh9IGluIHNlbnRlbmNlc1xuICAgICAgICBAdGFibGUuZm9jdXMoKVxuICAgIC5jYXRjaCAoZXJyKSAtPiBjb25zb2xlLmxvZyhlcnIpXG5cbiAgbG9hZFByZXZpZXc6IChzZW50ZW5jZXMpLT5cbiAgICBjaGFuZ2VzID0gc2VudGVuY2VzLm1hcCAoe3NlbnRlbmNlfSktPiBzZW50ZW5jZVxuICAgIGVkaXRvckVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdG9tLXRleHQtZWRpdG9yJylcbiAgICBlZGl0b3JFbGVtZW50LnNldEF0dHJpYnV0ZU5vZGUoZG9jdW1lbnQuY3JlYXRlQXR0cmlidXRlKCdndXR0ZXItaGlkZGVuJykpXG4gICAgZWRpdG9yRWxlbWVudC5zZXRBdHRyaWJ1dGVOb2RlKGRvY3VtZW50LmNyZWF0ZUF0dHJpYnV0ZSgncmVhZG9ubHknKSlcbiAgICBlZGl0b3IgPSBlZGl0b3JFbGVtZW50LmdldE1vZGVsKClcbiAgICBoZWxwID0gXCItLSBUaGUgZm9sbG93aW5nIFNRTCBpcyBnb2luZyB0byBiZSBleGVjdXRlZCB0byBhcHBseSB0aGUgY2hhbmdlcy5cXG5cIlxuICAgIGVkaXRvci5zZXRUZXh0KGhlbHArY2hhbmdlcy5qb2luKFwiXFxuXCIpKVxuICAgIGF0b20udGV4dEVkaXRvcnMuc2V0R3JhbW1hck92ZXJyaWRlKGVkaXRvciwgJ3NvdXJjZS5zcWwnKVxuICAgIGlmIGVkaXRvci5jdXJzb3JMaW5lRGVjb3JhdGlvbnM/XG4gICAgICBmb3IgY3Vyc29yTGluZURlY29yYXRpb24gaW4gZWRpdG9yLmN1cnNvckxpbmVEZWNvcmF0aW9uc1xuICAgICAgICBjdXJzb3JMaW5lRGVjb3JhdGlvbi5kZXN0cm95KClcbiAgICBlbHNlXG4gICAgICBlZGl0b3IuZ2V0RGVjb3JhdGlvbnMoY2xhc3M6ICdjdXJzb3ItbGluZScsIHR5cGU6ICdsaW5lJylbMF0uZGVzdHJveSgpXG4gICAgQHByZXZpZXcuZmluZCgnLmNvbnRhaW5lcicpLmh0bWwoZWRpdG9yRWxlbWVudClcbiAgICBlZGl0b3JFbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgndGFiaW5kZXgnKSAjIG1ha2UgcmVhZC1vbmx5XG4gICAgQHByZXZpZXcuZmluZCgnLmNvbnRhaW5lcicpLndpZHRoKCQoJy5ob3Jpem9udGFsLXNjcm9sbGJhciA+IGRpdicsZWRpdG9yRWxlbWVudCkud2lkdGgoKSkgI0hBQ0tcblxuICBleGVjdXRlQ2hhbmdlOiAoc2VudGVuY2UsdHIsaW5kZXgpLT5cbiAgICBAY29ubmVjdGlvbi5xdWVyeSBzZW50ZW5jZSwgKG1zZyxfcixfZikgPT5cbiAgICAgIGlmIG1zZyAmJiBtc2cudHlwZSA9PSAnZXJyb3InXG4gICAgICAgIGUgPSBtc2cuY29udGVudC5yZXBsYWNlKC9gL2csJ1xcXFxgJylcbiAgICAgICAgZXJyID0gXCJcIlwiXG4gICAgICAgICAgVGhlIGZvbGxvd2luZyBzZW50ZW5jZSBnYXZlIGFuIGVycm9yLlxuICAgICAgICAgIFBsZWFzZSBjcmVhdGUgYW4gaXNzdWUgaWYgeW91IHRoaW5rIHRoYXRcbiAgICAgICAgICB0aGUgU1FMIHdhc24ndCBwcm9wZXJseSBnZW5lcmF0ZWQ6IDxici8+ICN7ZX1cIlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yIGVyciwgZGV0YWlsOnNlbnRlbmNlICxkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgZWxzZVxuICAgICAgICBAYXBwbHlDaGFuZ2VzVG9Sb3codHIsaW5kZXgpXG5cbiAgYXBwbHlDaGFuZ2VzVG9Sb3c6ICh0cixpbmRleCktPlxuICAgIHRib2R5ID0gdHIucGFyZW50Tm9kZVxuICAgIHZhbHVlcyA9IGZvciB0ZCBpbiB0ci5jaGlsZHJlblxuICAgICAgaWYgdGQuY2xhc3NMaXN0LmNvbnRhaW5zKCdudWxsJykgdGhlbiBudWxsIGVsc2UgdGQudGV4dENvbnRlbnRcbiAgICB2YWx1ZXMgPSBAY29ubmVjdGlvbi5wcmVwYXJlVmFsdWVzKHZhbHVlcyxAZmllbGRzKVxuICAgIGlmIHRyLmNsYXNzTGlzdC5jb250YWlucygnc3RhdHVzLXJlbW92ZWQnKVxuICAgICAgQHJvd3Muc3BsaWNlKGluZGV4LDEpXG4gICAgICB0Ym9keS5yZW1vdmVDaGlsZCh0cilcbiAgICAgIEBudW1iZXJzLmNoaWxkcmVuKCd0Ym9keScpLmNoaWxkcmVuKCd0cjpsYXN0LWNoaWxkJykucmVtb3ZlKClcbiAgICBlbHNlIGlmIHRyLmNsYXNzTGlzdC5jb250YWlucygnYWRkZWQnKVxuICAgICAgQHJvd3MucHVzaCB2YWx1ZXNcbiAgICAgIHRyLmNsYXNzTGlzdC5yZW1vdmUoJ2FkZGVkJylcbiAgICAgIGZvciB0ZCBpbiB0ci5jaGlsZHJlblxuICAgICAgICB0ZC5jbGFzc0xpc3QucmVtb3ZlKCdzdGF0dXMtYWRkZWQnLCdkZWZhdWx0JylcbiAgICAgICAgdGQuc2V0QXR0cmlidXRlICdkYXRhLW9yaWdpbmFsLXZhbHVlJywgdGQudGV4dENvbnRlbnRcbiAgICAgICAgdGQuZGF0YXNldC5vcmlnaW5hbFZhbHVlTnVsbCA9IHRkLmNsYXNzTGlzdC5jb250YWlucygnbnVsbCcpXG4gICAgZWxzZSBpZiB0ci5jbGFzc0xpc3QuY29udGFpbnMoJ21vZGlmaWVkJylcbiAgICAgIEByb3dzW2luZGV4XSA9IHZhbHVlc1xuICAgICAgdHIuY2xhc3NMaXN0LnJlbW92ZSgnbW9kaWZpZWQnKVxuICAgICAgZm9yIHRkIGluIHRyLmNoaWxkcmVuXG4gICAgICAgIHRkLmNsYXNzTGlzdC5yZW1vdmUoJ3N0YXR1cy1tb2RpZmllZCcpXG4gICAgICAgIHRkLnNldEF0dHJpYnV0ZSAnZGF0YS1vcmlnaW5hbC12YWx1ZScsIHRkLnRleHRDb250ZW50XG4gICAgICAgIHRkLmRhdGFzZXQub3JpZ2luYWxWYWx1ZU51bGwgPSB0ZC5jbGFzc0xpc3QuY29udGFpbnMoJ251bGwnKVxuICAgIEB0cmlnZ2VyKCdxdWlja1F1ZXJ5LnJvd1N0YXR1c0NoYW5nZWQnLFt0cl0pXG5cblxuICBoaWRkZW5SZXN1bHRzOiAtPlxuICAgIEBrZWVwSGlkZGVuXG5cbiAgc2hvd1Jlc3VsdHM6IC0+XG4gICAgQGtlZXBIaWRkZW4gPSBmYWxzZVxuXG4gIGhpZGVSZXN1bHRzOiAtPlxuICAgIEBrZWVwSGlkZGVuID0gdHJ1ZVxuXG4gIGZpeFNpemVzOiAtPlxuICAgIHJvd19jb3VudCA9IEB0YWJsZS5maW5kKCd0Ym9keSB0cicpLmxlbmd0aFxuICAgIGlmIHJvd19jb3VudCA+IDBcbiAgICAgIHRkcyA9IEB0YWJsZS5maW5kKCd0Ym9keSB0cjpmaXJzdCcpLmNoaWxkcmVuKClcbiAgICAgIEBoZWFkZXIuZmluZCgndGhlYWQgdHInKS5jaGlsZHJlbigpLmVhY2ggKGksIHRoKSA9PlxuICAgICAgICB0ZCA9IHRkc1tpXVxuICAgICAgICB0aHcgPSB0aC5vZmZzZXRXaWR0aFxuICAgICAgICB0ZHcgPSB0ZC5vZmZzZXRXaWR0aFxuICAgICAgICB3ID0gTWF0aC5tYXgodGR3LHRodylcbiAgICAgICAgdGQuc3R5bGUubWluV2lkdGggPSB3K1wicHhcIlxuICAgICAgICB0aC5zdHlsZS5taW5XaWR0aCA9IHcrXCJweFwiXG4gICAgZWxzZVxuICAgICAgQHRhYmxlLndpZHRoKEBoZWFkZXIud2lkdGgoKSlcbiAgICBAYXBwbHlCdXR0b24udG9nZ2xlQ2xhc3MoJ3RpZ2h0Jyxyb3dfY291bnQgPCAxMDApXG4gICAgQGFwcGx5QnV0dG9uLnRvZ2dsZUNsYXNzKCd4Micscm93X2NvdW50IDwgMTApXG4gICAgQGZpeFNjcm9sbHMoKVxuXG4gIGZpeFNjcm9sbHM6IC0+XG4gICAgaGFuZGxlckhlaWdodCA9IDVcbiAgICBoZWFkZXJIZWdodCA9IEBoZWFkZXIuaGVpZ2h0KClcbiAgICBpZiBAbnVtYmVycy5maW5kKCd0cicpLmxlbmd0aCA+IDBcbiAgICAgIG51bWJlcnNXaWR0aCA9IEBudW1iZXJzLndpZHRoKClcbiAgICAgIEBjb3JuZXIuY3NzIHdpZHRoOiBudW1iZXJzV2lkdGhcbiAgICBlbHNlXG4gICAgICBudW1iZXJzV2lkdGggPSBAY29ybmVyLm91dGVyV2lkdGgoKVxuICAgIEB0YWJsZVdyYXBwZXIuY3NzIGxlZnQ6IG51bWJlcnNXaWR0aCAsIHRvcDogKGhlYWRlckhlZ2h0ICsgaGFuZGxlckhlaWdodClcbiAgICBzY3JvbGwgPSBoYW5kbGVySGVpZ2h0ICsgaGVhZGVySGVnaHQgIC0gQHRhYmxlV3JhcHBlci5zY3JvbGxUb3AoKVxuICAgIEBudW1iZXJzLmNzcyB0b3A6IHNjcm9sbFxuICAgIHNjcm9sbCA9IG51bWJlcnNXaWR0aCAtIEB0YWJsZVdyYXBwZXIuc2Nyb2xsTGVmdCgpXG4gICAgQGhlYWRlci5jc3MgbGVmdDogc2Nyb2xsXG5cbiAgaGFuZGxlU2Nyb2xsRXZlbnQ6IC0+XG4gICAgQHRhYmxlV3JhcHBlci5zY3JvbGwgKGUpID0+XG4gICAgICBoYW5kbGVySGVpZ2h0ID0gNVxuICAgICAgc2Nyb2xsID0gJChlLnRhcmdldCkuc2Nyb2xsVG9wKCkgLSBoYW5kbGVySGVpZ2h0IC0gQGhlYWRlci5oZWlnaHQoKVxuICAgICAgQG51bWJlcnMuY3NzIHRvcDogKC0xKnNjcm9sbClcbiAgICAgIHNjcm9sbCA9ICQoZS50YXJnZXQpLnNjcm9sbExlZnQoKSAtIEBudW1iZXJzLndpZHRoKClcbiAgICAgIEBoZWFkZXIuY3NzIGxlZnQ6IC0xKnNjcm9sbFxuXG4gIG9uUm93U3RhdHVzQ2hhbmdlZDogKGNhbGxiYWNrKS0+XG4gICAgQGJpbmQgJ3F1aWNrUXVlcnkucm93U3RhdHVzQ2hhbmdlZCcsIChlLHJvdyktPiBjYWxsYmFjayhyb3cpXG5cbiAgaGFuZGxlUmVzaXplRXZlbnRzOiAtPlxuICAgIEBvbiAnbW91c2Vkb3duJywgJy5xdWljay1xdWVyeS1yZXN1bHQtcmVzaXplLWhhbmRsZXInLCAoZSkgPT4gQHJlc2l6ZVN0YXJ0ZWQoZSlcbiAgcmVzaXplU3RhcnRlZDogLT5cbiAgICAkKGRvY3VtZW50KS5vbignbW91c2Vtb3ZlJywgQHJlc2l6ZVJlc3VsdFZpZXcpXG4gICAgJChkb2N1bWVudCkub24oJ21vdXNldXAnLCBAcmVzaXplU3RvcHBlZClcbiAgcmVzaXplU3RvcHBlZDogLT5cbiAgICAkKGRvY3VtZW50KS5vZmYoJ21vdXNlbW92ZScsIEByZXNpemVSZXN1bHRWaWV3KVxuICAgICQoZG9jdW1lbnQpLm9mZignbW91c2V1cCcsIEByZXNpemVTdG9wcGVkKVxuICByZXNpemVSZXN1bHRWaWV3OiAoe3BhZ2VZLCB3aGljaH0pID0+XG4gICAgcmV0dXJuIEByZXNpemVTdG9wcGVkKCkgdW5sZXNzIHdoaWNoIGlzIDFcbiAgICBoZWlnaHQgPSBAb3V0ZXJIZWlnaHQoKSArIEBvZmZzZXQoKS50b3AgLSBwYWdlWVxuICAgIEBoZWlnaHQoaGVpZ2h0KVxuICAgIEBmaXhTY3JvbGxzKClcbiJdfQ==
