(function() {
  var CompositeDisposable, QuickQuery, QuickQueryAutocomplete, QuickQueryBrowserView, QuickQueryConnectView, QuickQueryEditorView, QuickQueryMysqlConnection, QuickQueryPostgresConnection, QuickQueryResultView, QuickQueryTableFinderView;

  QuickQueryConnectView = require('./quick-query-connect-view');

  QuickQueryResultView = require('./quick-query-result-view');

  QuickQueryBrowserView = require('./quick-query-browser-view');

  QuickQueryEditorView = require('./quick-query-editor-view');

  QuickQueryTableFinderView = require('./quick-query-table-finder-view');

  QuickQueryMysqlConnection = require('./quick-query-mysql-connection');

  QuickQueryPostgresConnection = require('./quick-query-postgres-connection');

  QuickQueryAutocomplete = require('./quick-query-autocomplete');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = QuickQuery = {
    config: {
      autompleteIntegration: {
        type: 'boolean',
        "default": true,
        title: 'Autocomplete integration'
      },
      canUseStatusBar: {
        type: 'boolean',
        "default": true,
        title: 'Show info in status bar'
      },
      browserButtons: {
        type: 'boolean',
        "default": true,
        title: 'Browser buttons'
      },
      resultsInTab: {
        type: 'boolean',
        "default": false,
        title: 'Show results in a tab'
      }
    },
    editorView: null,
    browser: null,
    modalPanel: null,
    modalConnect: null,
    modalSpinner: null,
    bottomPanel: null,
    sidePanel: null,
    subscriptions: null,
    connection: null,
    connections: null,
    queryEditors: [],
    tableFinder: null,
    activate: function(state) {
      var connectionInfo, connectionPromise, j, len, protocols, ref;
      protocols = {
        mysql: {
          name: "MySql",
          handler: QuickQueryMysqlConnection
        },
        postgres: {
          name: "PostgreSQL",
          handler: QuickQueryPostgresConnection
        },
        "ssl-postgres": {
          name: "PostgreSQL (ssl)",
          handler: QuickQueryPostgresConnection,
          "default": {
            protocol: 'postgres',
            ssl: true
          }
        }
      };
      this.connections = [];
      this.tableFinder = new QuickQueryTableFinderView();
      this.browser = new QuickQueryBrowserView();
      this.connectView = new QuickQueryConnectView(protocols);
      this.modalConnect = atom.workspace.addModalPanel({
        item: this.connectView,
        visible: false
      });
      this.modalSpinner = atom.workspace.addModalPanel({
        item: this.createSpinner(),
        visible: false
      });
      if (state.connections) {
        ref = state.connections;
        for (j = 0, len = ref.length; j < len; j++) {
          connectionInfo = ref[j];
          connectionPromise = this.connectView.buildConnection(connectionInfo);
          this.browser.addConnection(connectionPromise);
        }
      }
      this.browser.onConnectionSelected((function(_this) {
        return function(connection) {
          return _this.connection = connection;
        };
      })(this));
      this.browser.onConnectionDeleted((function(_this) {
        return function(connection) {
          var i;
          i = _this.connections.indexOf(connection);
          _this.connections.splice(i, 1);
          connection.close();
          if (_this.connections.length > 0) {
            return _this.browser.selectConnection(_this.connections[_this.connections.length - 1]);
          } else {
            return _this.connection = null;
          }
        };
      })(this));
      this.browser.bind('quickQuery.edit', (function(_this) {
        return function(e, action, model) {
          _this.editorView = new QuickQueryEditorView(action, model);
          if (action === 'drop') {
            return _this.editorView.openTextEditor();
          } else {
            if (_this.modalPanel != null) {
              _this.modalPanel.destroy();
            }
            _this.modalPanel = atom.workspace.addModalPanel({
              item: _this.editorView,
              visible: true
            });
            return _this.editorView.focusFirst();
          }
        };
      })(this));
      this.tableFinder.onCanceled((function(_this) {
        return function() {
          return _this.modalPanel.destroy();
        };
      })(this));
      this.tableFinder.onFound((function(_this) {
        return function(table) {
          _this.modalPanel.destroy();
          return _this.browser.reveal(table, function() {
            return _this.browser.simpleSelect();
          });
        };
      })(this));
      this.connectView.onConnectionStablished((function(_this) {
        return function(connection) {
          return _this.connections.push(connection);
        };
      })(this));
      this.connectView.onWillConnect((function(_this) {
        return function(connectionPromise) {
          _this.browser.addConnection(connectionPromise);
          return connectionPromise.then(function(connection) {
            return _this.modalConnect.hide();
          }, function(err) {
            return _this.setModalPanel({
              content: err,
              type: 'error'
            });
          });
        };
      })(this));
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'quick-query:run': (function(_this) {
          return function() {
            return _this.run();
          };
        })(this),
        'quick-query:new-editor': (function(_this) {
          return function() {
            return _this.newEditor();
          };
        })(this),
        'quick-query:toggle-browser': (function(_this) {
          return function() {
            return _this.toggleBrowser();
          };
        })(this),
        'quick-query:toggle-results': (function(_this) {
          return function() {
            return _this.toggleResults();
          };
        })(this),
        'core:cancel': (function(_this) {
          return function() {
            return _this.cancel();
          };
        })(this),
        'quick-query:new-connection': (function(_this) {
          return function() {
            return _this.newConnection();
          };
        })(this),
        'quick-query:find-table-to-select': (function(_this) {
          return function() {
            return _this.findTable();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('.quick-query-result', {
        'quick-query:copy': (function(_this) {
          return function() {
            return _this.activeResultView().copy();
          };
        })(this),
        'quick-query:copy-all': (function(_this) {
          return function() {
            return _this.activeResultView().copyAll();
          };
        })(this),
        'quick-query:save-csv': (function(_this) {
          return function() {
            return _this.activeResultView().saveCSV();
          };
        })(this),
        'quick-query:insert': (function(_this) {
          return function() {
            return _this.activeResultView().insertRecord();
          };
        })(this),
        'quick-query:null': (function(_this) {
          return function() {
            return _this.activeResultView().setNull();
          };
        })(this),
        'quick-query:undo': (function(_this) {
          return function() {
            return _this.activeResultView().undo();
          };
        })(this),
        'quick-query:delete': (function(_this) {
          return function() {
            return _this.activeResultView().deleteRecord();
          };
        })(this),
        'quick-query:copy-changes': (function(_this) {
          return function() {
            return _this.activeResultView().copyChanges();
          };
        })(this),
        'quick-query:apply-changes': (function(_this) {
          return function() {
            return _this.activeResultView().applyChanges();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('.quick-query-result-table', {
        'core:move-left': (function(_this) {
          return function() {
            return _this.activeResultView().moveSelection('left');
          };
        })(this),
        'core:move-right': (function(_this) {
          return function() {
            return _this.activeResultView().moveSelection('right');
          };
        })(this),
        'core:move-up': (function(_this) {
          return function() {
            return _this.activeResultView().moveSelection('up');
          };
        })(this),
        'core:move-down': (function(_this) {
          return function() {
            return _this.activeResultView().moveSelection('down');
          };
        })(this),
        'core:undo': (function(_this) {
          return function() {
            return _this.activeResultView().undo();
          };
        })(this),
        'core:confirm': (function(_this) {
          return function() {
            return _this.activeResultView().editSelected();
          };
        })(this),
        'core:copy': (function(_this) {
          return function() {
            return _this.activeResultView().copy();
          };
        })(this),
        'core:paste': (function(_this) {
          return function() {
            return _this.activeResultView().paste();
          };
        })(this),
        'core:backspace': (function(_this) {
          return function() {
            return _this.activeResultView().setNull();
          };
        })(this),
        'core:delete': (function(_this) {
          return function() {
            return _this.activeResultView().deleteRecord();
          };
        })(this),
        'core:page-up': (function(_this) {
          return function() {
            return _this.activeResultView().moveSelection('page-up');
          };
        })(this),
        'core:page-down': (function(_this) {
          return function() {
            return _this.activeResultView().moveSelection('page-down');
          };
        })(this),
        'core:save': (function(_this) {
          return function() {
            if (atom.config.get('quick-query.resultsInTab')) {
              return _this.activeResultView().applyChanges();
            }
          };
        })(this),
        'core:save-as': (function(_this) {
          return function() {
            if (atom.config.get('quick-query.resultsInTab')) {
              return _this.activeResultView().saveCSV();
            }
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('#quick-query-connections', {
        'quick-query:reconnect': (function(_this) {
          return function() {
            return _this.reconnect();
          };
        })(this),
        'quick-query:select-1000': (function(_this) {
          return function() {
            return _this.browser.simpleSelect();
          };
        })(this),
        'quick-query:set-default': (function(_this) {
          return function() {
            return _this.browser.setDefault();
          };
        })(this),
        'quick-query:alter': (function(_this) {
          return function() {
            return _this.browser.alter();
          };
        })(this),
        'quick-query:drop': (function(_this) {
          return function() {
            return _this.browser.drop();
          };
        })(this),
        'quick-query:create': (function(_this) {
          return function() {
            return _this.browser.create();
          };
        })(this),
        'quick-query:copy': (function(_this) {
          return function() {
            return _this.browser.copy();
          };
        })(this),
        'core:copy': (function(_this) {
          return function() {
            return _this.browser.copy();
          };
        })(this),
        'core:delete': (function(_this) {
          return function() {
            return _this.browser["delete"]();
          };
        })(this),
        'core:move-up': (function(_this) {
          return function() {
            return _this.browser.moveUp();
          };
        })(this),
        'core:move-down': (function(_this) {
          return function() {
            return _this.browser.moveDown();
          };
        })(this),
        'core:confirm': (function(_this) {
          return function() {
            return _this.browser.expandSelected();
          };
        })(this)
      }));
      this.subscriptions.add(atom.workspace.addOpener((function(_this) {
        return function(uri) {
          if (uri === 'quick-query://browser') {
            return _this.browser;
          }
        };
      })(this)));
      atom.config.onDidChange('quick-query.resultsInTab', (function(_this) {
        return function(arg) {
          var i, item, k, l, len1, len2, newValue, oldValue, pane, ref1, ref2, results;
          newValue = arg.newValue, oldValue = arg.oldValue;
          if (newValue) {
            ref1 = _this.queryEditors;
            for (k = 0, len1 = ref1.length; k < len1; k++) {
              i = ref1[k];
              i.panel.hide();
              i.panel.destroy();
            }
            return _this.queryEditors = [];
          } else {
            pane = atom.workspace.getActivePane();
            ref2 = pane.getItems();
            results = [];
            for (l = 0, len2 = ref2.length; l < len2; l++) {
              item = ref2[l];
              if (item instanceof QuickQueryResultView) {
                results.push(pane.destroyItem(item));
              } else {
                results.push(void 0);
              }
            }
            return results;
          }
        };
      })(this));
      atom.workspace.getCenter().onDidChangeActivePaneItem((function(_this) {
        return function(item) {
          var i, k, len1, ref1, resultView, results;
          _this.hideStatusBar();
          if (!atom.config.get('quick-query.resultsInTab')) {
            ref1 = _this.queryEditors;
            results = [];
            for (k = 0, len1 = ref1.length; k < len1; k++) {
              i = ref1[k];
              resultView = i.panel.getItem();
              if (i.editor === item && !resultView.hiddenResults()) {
                i.panel.show();
              } else {
                i.panel.hide();
              }
              if (i.editor === item) {
                results.push(_this.updateStatusBar(resultView));
              } else {
                results.push(void 0);
              }
            }
            return results;
          } else if (item instanceof QuickQueryResultView) {
            item.focusTable();
            return _this.updateStatusBar(item);
          }
        };
      })(this));
      return atom.workspace.getCenter().onDidDestroyPaneItem((function(_this) {
        return function(d) {
          return _this.queryEditors = _this.queryEditors.filter(function(i) {
            if (i.editor === d.item) {
              i.panel.destroy();
            }
            return i.editor !== d.item;
          });
        };
      })(this));
    },
    deactivate: function() {
      var c, i, item, j, k, l, len, len1, len2, pane, ref, ref1, ref2, ref3, ref4, results;
      ref = this.connections;
      for (j = 0, len = ref.length; j < len; j++) {
        c = ref[j];
        c.close();
      }
      this.subscriptions.dispose();
      ref1 = this.queryEditors;
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        i = ref1[k];
        i.panel.destroy();
      }
      this.browser.destroy();
      this.connectView.destroy();
      if ((ref2 = this.modalPanel) != null) {
        ref2.destroy();
      }
      this.modalConnect.destroy();
      this.modalSpinner.destroy();
      if ((ref3 = this.statusBarTile) != null) {
        ref3.destroy();
      }
      pane = atom.workspace.getActivePane();
      ref4 = pane.getItems();
      results = [];
      for (l = 0, len2 = ref4.length; l < len2; l++) {
        item = ref4[l];
        if (item instanceof QuickQueryResultView) {
          results.push(pane.destroyItem(item));
        }
      }
      return results;
    },
    serialize: function() {
      return {
        connections: this.connections.map(function(c) {
          return c.serialize();
        })
      };
    },
    newEditor: function() {
      return atom.workspace.open().then((function(_this) {
        return function(editor) {
          return atom.textEditors.setGrammarOverride(editor, 'source.sql');
        };
      })(this));
    },
    newConnection: function() {
      this.modalConnect.show();
      return this.connectView.focusFirst();
    },
    run: function() {
      var text;
      this.queryEditor = atom.workspace.getCenter().getActiveTextEditor();
      if (!this.queryEditor) {
        this.setModalPanel({
          content: "This tab is not an editor",
          type: 'error'
        });
        return;
      }
      text = this.queryEditor.getSelectedText();
      if (text === '') {
        text = this.queryEditor.getText();
      }
      if (this.connection) {
        this.showModalSpinner({
          content: "Running query..."
        });
        return this.connection.query(text, (function(_this) {
          return function(message, rows, fields) {
            var cursor, queryResult;
            if (message) {
              _this.modalSpinner.hide();
              if (message.type === 'error') {
                _this.setModalPanel(message);
              } else {
                _this.addInfoNotification(message.content);
              }
              if (message.type === 'success') {
                return _this.afterExecute(_this.queryEditor);
              }
            } else {
              _this.showModalSpinner({
                content: "Loading results..."
              });
              if (atom.config.get('quick-query.resultsInTab')) {
                queryResult = _this.showResultInTab();
              } else {
                queryResult = _this.showResultView(_this.queryEditor);
              }
              cursor = queryResult.getCursor();
              queryResult.showRows(rows, fields, _this.connection, function() {
                _this.modalSpinner.hide();
                if (rows.length > 100) {
                  queryResult.fixSizes();
                }
                if (cursor != null) {
                  return queryResult.setCursor.apply(queryResult, cursor);
                }
              });
              queryResult.fixSizes();
              return _this.updateStatusBar(queryResult);
            }
          };
        })(this));
      } else {
        return this.addWarningNotification("No connection selected");
      }
    },
    toggleBrowser: function() {
      return atom.workspace.toggle('quick-query://browser');
    },
    reconnect: function() {
      var connectionInfo, connectionPromise, oldConnection, pos;
      oldConnection = this.connection;
      pos = this.browser.connections.indexOf(oldConnection);
      connectionInfo = oldConnection.serialize();
      connectionPromise = this.connectView.buildConnection(connectionInfo);
      this.browser.addConnection(connectionPromise, pos);
      return connectionPromise.then((function(_this) {
        return function(newConnection) {
          return _this.browser.removeConnection(oldConnection);
        };
      })(this), (function(_this) {
        return function(err) {
          return _this.setModalPanel({
            content: err,
            type: 'error'
          });
        };
      })(this));
    },
    findTable: function() {
      if (this.connection) {
        this.tableFinder.searchTable(this.connection);
        if (this.modalPanel != null) {
          this.modalPanel.destroy();
        }
        this.modalPanel = atom.workspace.addModalPanel({
          item: this.tableFinder,
          visible: true
        });
        return this.tableFinder.focusFilterEditor();
      } else {
        return this.addWarningNotification("No connection selected");
      }
    },
    addWarningNotification: function(message) {
      var notification, view;
      notification = atom.notifications.addWarning(message);
      view = atom.views.getView(notification);
      return view != null ? view.element.addEventListener('click', function(e) {
        return view.removeNotification();
      }) : void 0;
    },
    addInfoNotification: function(message) {
      var notification, view;
      notification = atom.notifications.addInfo(message);
      view = atom.views.getView(notification);
      return view != null ? view.element.addEventListener('click', function(e) {
        return view.removeNotification();
      }) : void 0;
    },
    setModalPanel: function(message) {
      var close, content, copy, item;
      item = document.createElement('div');
      item.classList.add('quick-query-modal-message');
      content = document.createElement('span');
      content.classList.add('message');
      content.textContent = message.content;
      item.appendChild(content);
      if (message.type === 'error') {
        item.classList.add('text-error');
        copy = document.createElement('span');
        copy.classList.add('icon', 'icon-clippy');
        copy.setAttribute('title', "Copy to clipboard");
        copy.setAttribute('data-error', message.content);
        item.onmouseover = (function() {
          return this.classList.add('animated');
        });
        copy.onclick = (function() {
          return atom.clipboard.write(this.getAttribute('data-error'));
        });
        item.appendChild(copy);
      }
      close = document.createElement('span');
      close.classList.add('icon', 'icon-x');
      close.onclick = ((function(_this) {
        return function() {
          return _this.modalPanel.destroy();
        };
      })(this));
      item.appendChild(close);
      if (this.modalPanel != null) {
        this.modalPanel.destroy();
      }
      return this.modalPanel = atom.workspace.addModalPanel({
        item: item,
        visible: true
      });
    },
    createSpinner: function() {
      var content, item, spinner;
      item = document.createElement('div');
      item.classList.add('quick-query-modal-spinner');
      spinner = document.createElement('span');
      spinner.classList.add('loading', 'loading-spinner-tiny', 'inline-block');
      item.appendChild(spinner);
      content = document.createElement('span');
      content.classList.add('message');
      item.appendChild(content);
      return item;
    },
    showModalSpinner: function(message) {
      var content, item;
      item = this.modalSpinner.getItem();
      content = item.getElementsByClassName('message').item(0);
      content.textContent = message.content;
      return this.modalSpinner.show();
    },
    showResultInTab: function() {
      var filter, pane, queryResult;
      pane = atom.workspace.getCenter().getActivePane();
      filter = pane.getItems().filter(function(item) {
        return item instanceof QuickQueryResultView;
      });
      if (filter.length === 0) {
        queryResult = new QuickQueryResultView();
        queryResult.onRowStatusChanged((function(_this) {
          return function() {
            return _this.updateStatusBar(queryResult);
          };
        })(this));
        pane.addItem(queryResult);
      } else {
        queryResult = filter[0];
      }
      pane.activateItem(queryResult);
      return queryResult;
    },
    afterExecute: function(queryEditor) {
      if (this.editorView && this.editorView.editor === queryEditor) {
        if (!(typeof queryEditor.getPath === "function" ? queryEditor.getPath() : void 0)) {
          queryEditor.setText('');
          queryEditor.destroy();
        }
        if (this.editorView.action === 'create') {
          this.browser.refreshTree(this.editorView.model);
        } else {
          this.browser.refreshTree(this.editorView.model.parent());
        }
        if (this.modalPanel) {
          this.modalPanel.destroy();
        }
        return this.editorView = null;
      }
    },
    showResultView: function(queryEditor) {
      var bottomPanel, e, i, queryResult;
      e = (function() {
        var j, len, ref, results;
        ref = this.queryEditors;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          i = ref[j];
          if (i.editor === queryEditor) {
            results.push(i);
          }
        }
        return results;
      }).call(this);
      if (e.length > 0) {
        e[0].panel.show();
        queryResult = e[0].panel.getItem();
      } else {
        queryResult = new QuickQueryResultView();
        queryResult.onRowStatusChanged((function(_this) {
          return function() {
            return _this.updateStatusBar(queryResult);
          };
        })(this));
        bottomPanel = atom.workspace.addBottomPanel({
          item: queryResult,
          visible: true
        });
        this.queryEditors.push({
          editor: queryEditor,
          panel: bottomPanel
        });
      }
      return queryResult;
    },
    activeResultView: function() {
      var editor, i, item, j, len, ref;
      if (atom.config.get('quick-query.resultsInTab')) {
        item = atom.workspace.getActivePaneItem();
        if (item instanceof QuickQueryResultView) {
          return item;
        } else {
          return null;
        }
      } else {
        editor = atom.workspace.getCenter().getActiveTextEditor();
        ref = this.queryEditors;
        for (j = 0, len = ref.length; j < len; j++) {
          i = ref[j];
          if (i.editor === editor) {
            return i.panel.getItem();
          }
        }
        return null;
      }
    },
    provideBrowserView: function() {
      return this.browser;
    },
    provideConnectView: function() {
      return this.connectView;
    },
    provideAutocomplete: function() {
      return new QuickQueryAutocomplete(this.browser);
    },
    consumeStatusBar: function(statusBar) {
      var element;
      element = document.createElement('a');
      element.classList.add('quick-query-tile');
      element.classList.add('hide');
      element.onclick = ((function(_this) {
        return function() {
          return _this.toggleResults();
        };
      })(this));
      return this.statusBarTile = statusBar.addLeftTile({
        item: element,
        priority: 10
      });
    },
    hideStatusBar: function() {
      var span;
      if (this.statusBarTile != null) {
        span = this.statusBarTile.getItem();
        return span.classList.add('hide');
      }
    },
    updateStatusBar: function(queryResult) {
      var element;
      if (!((this.statusBarTile != null) && ((queryResult != null ? queryResult.rows : void 0) != null))) {
        return;
      }
      if (!atom.config.get('quick-query.canUseStatusBar')) {
        return;
      }
      element = this.statusBarTile.getItem();
      element.classList.remove('hide');
      if (atom.config.get('quick-query.resultsInTab')) {
        return element.textContent = "(" + (queryResult.rowsStatus()) + ")";
      } else {
        return element.textContent = (queryResult.getTitle()) + " (" + (queryResult.rowsStatus()) + ")";
      }
    },
    toggleResults: function() {
      var editor, i, j, len, ref, resultView, results;
      if (!atom.config.get('quick-query.resultsInTab')) {
        editor = atom.workspace.getCenter().getActiveTextEditor();
        ref = this.queryEditors;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          i = ref[j];
          if (!(i.editor === editor)) {
            continue;
          }
          resultView = i.panel.getItem();
          if (resultView.is(':visible')) {
            i.panel.hide();
            results.push(resultView.hideResults());
          } else {
            i.panel.show();
            results.push(resultView.showResults());
          }
        }
        return results;
      }
    },
    cancel: function() {
      var editor, i, j, len, ref, resultView, results;
      if (this.modalPanel) {
        this.modalPanel.destroy();
      }
      this.modalConnect.hide();
      if (this.modalSpinner.isVisible()) {
        resultView = this.activeResultView();
        if (resultView != null) {
          resultView.stopLoop();
          this.updateStatusBar(resultView);
        }
        this.modalSpinner.hide();
      }
      if (atom.config.get('quick-query.resultsInTab')) {
        resultView = atom.workspace.getActivePaneItem();
        if (resultView.editing) {
          return resultView.editSelected();
        }
      } else {
        editor = atom.workspace.getCenter().getActiveTextEditor();
        ref = this.queryEditors;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          i = ref[j];
          if (!(i.editor === editor)) {
            continue;
          }
          resultView = i.panel.getItem();
          if (resultView.editing) {
            results.push(resultView.editSelected());
          } else {
            i.panel.hide();
            results.push(resultView.hideResults());
          }
        }
        return results;
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL3F1aWNrLXF1ZXJ5L2xpYi9xdWljay1xdWVyeS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLHFCQUFBLEdBQXdCLE9BQUEsQ0FBUSw0QkFBUjs7RUFDeEIsb0JBQUEsR0FBdUIsT0FBQSxDQUFRLDJCQUFSOztFQUN2QixxQkFBQSxHQUF3QixPQUFBLENBQVEsNEJBQVI7O0VBQ3hCLG9CQUFBLEdBQXVCLE9BQUEsQ0FBUSwyQkFBUjs7RUFDdkIseUJBQUEsR0FBNEIsT0FBQSxDQUFRLGlDQUFSOztFQUM1Qix5QkFBQSxHQUE0QixPQUFBLENBQVEsZ0NBQVI7O0VBQzVCLDRCQUFBLEdBQStCLE9BQUEsQ0FBUSxtQ0FBUjs7RUFDL0Isc0JBQUEsR0FBeUIsT0FBQSxDQUFRLDRCQUFSOztFQUV4QixzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBRXhCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFVBQUEsR0FDZjtJQUFBLE1BQUEsRUFDRTtNQUFBLHFCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtRQUVBLEtBQUEsRUFBTywwQkFGUDtPQURGO01BSUEsZUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxLQUFBLEVBQU8seUJBRlA7T0FMRjtNQVFBLGNBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsS0FBQSxFQUFPLGlCQUZQO09BVEY7TUFZQSxZQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtRQUVBLEtBQUEsRUFBTyx1QkFGUDtPQWJGO0tBREY7SUFrQkEsVUFB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Rjs7QUFGRjt1QkFMRjs7SUFUTSxDQXZaUjs7QUFaRiIsInNvdXJjZXNDb250ZW50IjpbIlF1aWNrUXVlcnlDb25uZWN0VmlldyA9IHJlcXVpcmUgJy4vcXVpY2stcXVlcnktY29ubmVjdC12aWV3J1xuUXVpY2tRdWVyeVJlc3VsdFZpZXcgPSByZXF1aXJlICcuL3F1aWNrLXF1ZXJ5LXJlc3VsdC12aWV3J1xuUXVpY2tRdWVyeUJyb3dzZXJWaWV3ID0gcmVxdWlyZSAnLi9xdWljay1xdWVyeS1icm93c2VyLXZpZXcnXG5RdWlja1F1ZXJ5RWRpdG9yVmlldyA9IHJlcXVpcmUgJy4vcXVpY2stcXVlcnktZWRpdG9yLXZpZXcnXG5RdWlja1F1ZXJ5VGFibGVGaW5kZXJWaWV3ID0gcmVxdWlyZSAnLi9xdWljay1xdWVyeS10YWJsZS1maW5kZXItdmlldydcblF1aWNrUXVlcnlNeXNxbENvbm5lY3Rpb24gPSByZXF1aXJlICcuL3F1aWNrLXF1ZXJ5LW15c3FsLWNvbm5lY3Rpb24nXG5RdWlja1F1ZXJ5UG9zdGdyZXNDb25uZWN0aW9uID0gcmVxdWlyZSAnLi9xdWljay1xdWVyeS1wb3N0Z3Jlcy1jb25uZWN0aW9uJ1xuUXVpY2tRdWVyeUF1dG9jb21wbGV0ZSA9IHJlcXVpcmUgJy4vcXVpY2stcXVlcnktYXV0b2NvbXBsZXRlJ1xuXG57Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFF1aWNrUXVlcnkgPVxuICBjb25maWc6XG4gICAgYXV0b21wbGV0ZUludGVncmF0aW9uOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICB0aXRsZTogJ0F1dG9jb21wbGV0ZSBpbnRlZ3JhdGlvbidcbiAgICBjYW5Vc2VTdGF0dXNCYXI6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIHRpdGxlOiAnU2hvdyBpbmZvIGluIHN0YXR1cyBiYXInXG4gICAgYnJvd3NlckJ1dHRvbnM6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIHRpdGxlOiAnQnJvd3NlciBidXR0b25zJ1xuICAgIHJlc3VsdHNJblRhYjpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIHRpdGxlOiAnU2hvdyByZXN1bHRzIGluIGEgdGFiJ1xuXG4gIGVkaXRvclZpZXc6IG51bGxcbiAgYnJvd3NlcjogbnVsbFxuICBtb2RhbFBhbmVsOiBudWxsXG4gIG1vZGFsQ29ubmVjdDogbnVsbFxuICBtb2RhbFNwaW5uZXI6IG51bGxcbiAgYm90dG9tUGFuZWw6IG51bGxcbiAgc2lkZVBhbmVsOiBudWxsXG4gIHN1YnNjcmlwdGlvbnM6IG51bGxcbiAgY29ubmVjdGlvbjogbnVsbFxuICBjb25uZWN0aW9uczogbnVsbFxuICBxdWVyeUVkaXRvcnM6IFtdXG4gIHRhYmxlRmluZGVyOiBudWxsXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBwcm90b2NvbHMgPVxuICAgICAgbXlzcWw6XG4gICAgICAgIG5hbWU6IFwiTXlTcWxcIlxuICAgICAgICBoYW5kbGVyOlF1aWNrUXVlcnlNeXNxbENvbm5lY3Rpb25cbiAgICAgIHBvc3RncmVzOlxuICAgICAgICBuYW1lOiBcIlBvc3RncmVTUUxcIlxuICAgICAgICBoYW5kbGVyOiBRdWlja1F1ZXJ5UG9zdGdyZXNDb25uZWN0aW9uXG4gICAgICBcInNzbC1wb3N0Z3Jlc1wiOlxuICAgICAgICBuYW1lOiBcIlBvc3RncmVTUUwgKHNzbClcIlxuICAgICAgICBoYW5kbGVyOiBRdWlja1F1ZXJ5UG9zdGdyZXNDb25uZWN0aW9uXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcHJvdG9jb2w6ICdwb3N0Z3JlcydcbiAgICAgICAgICBzc2w6IHRydWVcblxuICAgIEBjb25uZWN0aW9ucyA9IFtdXG5cbiAgICBAdGFibGVGaW5kZXIgPSBuZXcgUXVpY2tRdWVyeVRhYmxlRmluZGVyVmlldygpXG5cbiAgICBAYnJvd3NlciA9IG5ldyBRdWlja1F1ZXJ5QnJvd3NlclZpZXcoKVxuXG4gICAgQGNvbm5lY3RWaWV3ID0gbmV3IFF1aWNrUXVlcnlDb25uZWN0Vmlldyhwcm90b2NvbHMpXG4gICAgQG1vZGFsQ29ubmVjdCA9IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogQGNvbm5lY3RWaWV3ICwgdmlzaWJsZTogZmFsc2UpXG5cbiAgICBAbW9kYWxTcGlubmVyID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbChpdGVtOiBAY3JlYXRlU3Bpbm5lcigpICwgdmlzaWJsZTogZmFsc2UpXG5cbiAgICBpZiBzdGF0ZS5jb25uZWN0aW9uc1xuICAgICAgZm9yIGNvbm5lY3Rpb25JbmZvIGluIHN0YXRlLmNvbm5lY3Rpb25zXG4gICAgICAgIGNvbm5lY3Rpb25Qcm9taXNlID0gQGNvbm5lY3RWaWV3LmJ1aWxkQ29ubmVjdGlvbihjb25uZWN0aW9uSW5mbylcbiAgICAgICAgQGJyb3dzZXIuYWRkQ29ubmVjdGlvbihjb25uZWN0aW9uUHJvbWlzZSlcblxuICAgIEBicm93c2VyLm9uQ29ubmVjdGlvblNlbGVjdGVkIChjb25uZWN0aW9uKSA9PlxuICAgICAgQGNvbm5lY3Rpb24gPSBjb25uZWN0aW9uXG5cbiAgICBAYnJvd3Nlci5vbkNvbm5lY3Rpb25EZWxldGVkIChjb25uZWN0aW9uKSA9PlxuICAgICAgaSA9IEBjb25uZWN0aW9ucy5pbmRleE9mKGNvbm5lY3Rpb24pXG4gICAgICBAY29ubmVjdGlvbnMuc3BsaWNlKGksMSlcbiAgICAgIGNvbm5lY3Rpb24uY2xvc2UoKVxuICAgICAgaWYgQGNvbm5lY3Rpb25zLmxlbmd0aCA+IDBcbiAgICAgICAgQGJyb3dzZXIuc2VsZWN0Q29ubmVjdGlvbihAY29ubmVjdGlvbnNbQGNvbm5lY3Rpb25zLmxlbmd0aC0xXSlcbiAgICAgIGVsc2VcbiAgICAgICAgQGNvbm5lY3Rpb24gPSBudWxsXG5cbiAgICBAYnJvd3Nlci5iaW5kICdxdWlja1F1ZXJ5LmVkaXQnLCAoZSxhY3Rpb24sbW9kZWwpID0+XG4gICAgICBAZWRpdG9yVmlldyA9IG5ldyBRdWlja1F1ZXJ5RWRpdG9yVmlldyhhY3Rpb24sbW9kZWwpXG4gICAgICBpZiBhY3Rpb24gPT0gJ2Ryb3AnXG4gICAgICAgIEBlZGl0b3JWaWV3Lm9wZW5UZXh0RWRpdG9yKClcbiAgICAgIGVsc2VcbiAgICAgICAgQG1vZGFsUGFuZWwuZGVzdHJveSgpIGlmIEBtb2RhbFBhbmVsP1xuICAgICAgICBAbW9kYWxQYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogQGVkaXRvclZpZXcgLCB2aXNpYmxlOiB0cnVlKVxuICAgICAgICBAZWRpdG9yVmlldy5mb2N1c0ZpcnN0KClcblxuICAgIEB0YWJsZUZpbmRlci5vbkNhbmNlbGVkID0+IEBtb2RhbFBhbmVsLmRlc3Ryb3koKVxuICAgIEB0YWJsZUZpbmRlci5vbkZvdW5kICh0YWJsZSkgPT5cbiAgICAgIEBtb2RhbFBhbmVsLmRlc3Ryb3koKVxuICAgICAgQGJyb3dzZXIucmV2ZWFsIHRhYmxlLCA9PlxuICAgICAgICBAYnJvd3Nlci5zaW1wbGVTZWxlY3QoKVxuXG4gICAgQGNvbm5lY3RWaWV3Lm9uQ29ubmVjdGlvblN0YWJsaXNoZWQgKGNvbm5lY3Rpb24pPT5cbiAgICAgIEBjb25uZWN0aW9ucy5wdXNoKGNvbm5lY3Rpb24pXG5cbiAgICBAY29ubmVjdFZpZXcub25XaWxsQ29ubmVjdCAoY29ubmVjdGlvblByb21pc2UpID0+XG4gICAgICBAYnJvd3Nlci5hZGRDb25uZWN0aW9uKGNvbm5lY3Rpb25Qcm9taXNlKVxuICAgICAgY29ubmVjdGlvblByb21pc2UudGhlbihcbiAgICAgICAgKGNvbm5lY3Rpb24pID0+IEBtb2RhbENvbm5lY3QuaGlkZSgpXG4gICAgICAgIChlcnIpID0+IEBzZXRNb2RhbFBhbmVsIGNvbnRlbnQ6IGVyciwgdHlwZTogJ2Vycm9yJ1xuICAgICAgKVxuXG4gICAgIyBFdmVudHMgc3Vic2NyaWJlZCB0byBpbiBhdG9tJ3Mgc3lzdGVtIGNhbiBiZSBlYXNpbHkgY2xlYW5lZCB1cCB3aXRoIGEgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuICAgICMgUmVnaXN0ZXIgY29tbWFuZCB0aGF0IHRvZ2dsZXMgdGhpcyB2aWV3XG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAncXVpY2stcXVlcnk6cnVuJzogPT4gQHJ1bigpXG4gICAgICAncXVpY2stcXVlcnk6bmV3LWVkaXRvcic6ID0+IEBuZXdFZGl0b3IoKVxuICAgICAgJ3F1aWNrLXF1ZXJ5OnRvZ2dsZS1icm93c2VyJzogPT4gQHRvZ2dsZUJyb3dzZXIoKVxuICAgICAgJ3F1aWNrLXF1ZXJ5OnRvZ2dsZS1yZXN1bHRzJzogPT4gQHRvZ2dsZVJlc3VsdHMoKVxuICAgICAgJ2NvcmU6Y2FuY2VsJzogPT4gQGNhbmNlbCgpXG4gICAgICAncXVpY2stcXVlcnk6bmV3LWNvbm5lY3Rpb24nOiA9PiBAbmV3Q29ubmVjdGlvbigpXG4gICAgICAncXVpY2stcXVlcnk6ZmluZC10YWJsZS10by1zZWxlY3QnOiA9PiBAZmluZFRhYmxlKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnLnF1aWNrLXF1ZXJ5LXJlc3VsdCcsXG4gICAgICAncXVpY2stcXVlcnk6Y29weSc6ID0+IEBhY3RpdmVSZXN1bHRWaWV3KCkuY29weSgpXG4gICAgICAncXVpY2stcXVlcnk6Y29weS1hbGwnOiA9PiBAYWN0aXZlUmVzdWx0VmlldygpLmNvcHlBbGwoKVxuICAgICAgJ3F1aWNrLXF1ZXJ5OnNhdmUtY3N2JzogPT4gQGFjdGl2ZVJlc3VsdFZpZXcoKS5zYXZlQ1NWKClcbiAgICAgICdxdWljay1xdWVyeTppbnNlcnQnOiA9PiBAYWN0aXZlUmVzdWx0VmlldygpLmluc2VydFJlY29yZCgpXG4gICAgICAncXVpY2stcXVlcnk6bnVsbCc6ID0+IEBhY3RpdmVSZXN1bHRWaWV3KCkuc2V0TnVsbCgpXG4gICAgICAncXVpY2stcXVlcnk6dW5kbyc6ID0+IEBhY3RpdmVSZXN1bHRWaWV3KCkudW5kbygpXG4gICAgICAncXVpY2stcXVlcnk6ZGVsZXRlJzogPT4gQGFjdGl2ZVJlc3VsdFZpZXcoKS5kZWxldGVSZWNvcmQoKVxuICAgICAgJ3F1aWNrLXF1ZXJ5OmNvcHktY2hhbmdlcyc6ID0+IEBhY3RpdmVSZXN1bHRWaWV3KCkuY29weUNoYW5nZXMoKVxuICAgICAgJ3F1aWNrLXF1ZXJ5OmFwcGx5LWNoYW5nZXMnOiA9PiBAYWN0aXZlUmVzdWx0VmlldygpLmFwcGx5Q2hhbmdlcygpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJy5xdWljay1xdWVyeS1yZXN1bHQtdGFibGUnLFxuICAgICAgJ2NvcmU6bW92ZS1sZWZ0JzogID0+IEBhY3RpdmVSZXN1bHRWaWV3KCkubW92ZVNlbGVjdGlvbignbGVmdCcpXG4gICAgICAnY29yZTptb3ZlLXJpZ2h0JzogPT4gQGFjdGl2ZVJlc3VsdFZpZXcoKS5tb3ZlU2VsZWN0aW9uKCdyaWdodCcpXG4gICAgICAnY29yZTptb3ZlLXVwJzogICAgPT4gQGFjdGl2ZVJlc3VsdFZpZXcoKS5tb3ZlU2VsZWN0aW9uKCd1cCcpXG4gICAgICAnY29yZTptb3ZlLWRvd24nOiAgPT4gQGFjdGl2ZVJlc3VsdFZpZXcoKS5tb3ZlU2VsZWN0aW9uKCdkb3duJylcbiAgICAgICdjb3JlOnVuZG8nOiAgICAgICA9PiBAYWN0aXZlUmVzdWx0VmlldygpLnVuZG8oKVxuICAgICAgJ2NvcmU6Y29uZmlybSc6ICAgID0+IEBhY3RpdmVSZXN1bHRWaWV3KCkuZWRpdFNlbGVjdGVkKClcbiAgICAgICdjb3JlOmNvcHknOiAgICAgICA9PiBAYWN0aXZlUmVzdWx0VmlldygpLmNvcHkoKVxuICAgICAgJ2NvcmU6cGFzdGUnOiAgICAgID0+IEBhY3RpdmVSZXN1bHRWaWV3KCkucGFzdGUoKVxuICAgICAgJ2NvcmU6YmFja3NwYWNlJzogID0+IEBhY3RpdmVSZXN1bHRWaWV3KCkuc2V0TnVsbCgpXG4gICAgICAnY29yZTpkZWxldGUnOiAgICAgPT4gQGFjdGl2ZVJlc3VsdFZpZXcoKS5kZWxldGVSZWNvcmQoKVxuICAgICAgJ2NvcmU6cGFnZS11cCc6ICAgID0+IEBhY3RpdmVSZXN1bHRWaWV3KCkubW92ZVNlbGVjdGlvbigncGFnZS11cCcpXG4gICAgICAnY29yZTpwYWdlLWRvd24nOiAgPT4gQGFjdGl2ZVJlc3VsdFZpZXcoKS5tb3ZlU2VsZWN0aW9uKCdwYWdlLWRvd24nKVxuICAgICAgJ2NvcmU6c2F2ZSc6ICAgID0+IEBhY3RpdmVSZXN1bHRWaWV3KCkuYXBwbHlDaGFuZ2VzKCkgaWYgYXRvbS5jb25maWcuZ2V0KCdxdWljay1xdWVyeS5yZXN1bHRzSW5UYWInKVxuICAgICAgJ2NvcmU6c2F2ZS1hcyc6ID0+IEBhY3RpdmVSZXN1bHRWaWV3KCkuc2F2ZUNTVigpIGlmIGF0b20uY29uZmlnLmdldCgncXVpY2stcXVlcnkucmVzdWx0c0luVGFiJylcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnI3F1aWNrLXF1ZXJ5LWNvbm5lY3Rpb25zJyxcbiAgICAgICdxdWljay1xdWVyeTpyZWNvbm5lY3QnOiAgID0+IEByZWNvbm5lY3QoKVxuICAgICAgJ3F1aWNrLXF1ZXJ5OnNlbGVjdC0xMDAwJzogPT4gQGJyb3dzZXIuc2ltcGxlU2VsZWN0KClcbiAgICAgICdxdWljay1xdWVyeTpzZXQtZGVmYXVsdCc6ID0+IEBicm93c2VyLnNldERlZmF1bHQoKVxuICAgICAgJ3F1aWNrLXF1ZXJ5OmFsdGVyJzogID0+IEBicm93c2VyLmFsdGVyKClcbiAgICAgICdxdWljay1xdWVyeTpkcm9wJzogICA9PiBAYnJvd3Nlci5kcm9wKClcbiAgICAgICdxdWljay1xdWVyeTpjcmVhdGUnOiA9PiBAYnJvd3Nlci5jcmVhdGUoKVxuICAgICAgJ3F1aWNrLXF1ZXJ5OmNvcHknOiAgID0+IEBicm93c2VyLmNvcHkoKVxuICAgICAgJ2NvcmU6Y29weSc6ICAgICAgID0+IEBicm93c2VyLmNvcHkoKVxuICAgICAgJ2NvcmU6ZGVsZXRlJzogICAgID0+IEBicm93c2VyLmRlbGV0ZSgpXG4gICAgICAnY29yZTptb3ZlLXVwJzogICAgPT4gQGJyb3dzZXIubW92ZVVwKClcbiAgICAgICdjb3JlOm1vdmUtZG93bic6ICA9PiBAYnJvd3Nlci5tb3ZlRG93bigpXG4gICAgICAnY29yZTpjb25maXJtJzogICAgPT4gQGJyb3dzZXIuZXhwYW5kU2VsZWN0ZWQoKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20ud29ya3NwYWNlLmFkZE9wZW5lciAodXJpKSA9PlxuICAgICAgcmV0dXJuIEBicm93c2VyIGlmICh1cmkgPT0gJ3F1aWNrLXF1ZXJ5Oi8vYnJvd3NlcicpXG5cbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAncXVpY2stcXVlcnkucmVzdWx0c0luVGFiJywgKHtuZXdWYWx1ZSwgb2xkVmFsdWV9KSA9PlxuICAgICAgaWYgbmV3VmFsdWVcbiAgICAgICAgZm9yIGkgaW4gQHF1ZXJ5RWRpdG9yc1xuICAgICAgICAgIGkucGFuZWwuaGlkZSgpXG4gICAgICAgICAgaS5wYW5lbC5kZXN0cm95KClcbiAgICAgICAgQHF1ZXJ5RWRpdG9ycyA9IFtdXG4gICAgICBlbHNlXG4gICAgICAgIHBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICAgICAgZm9yIGl0ZW0gaW4gcGFuZS5nZXRJdGVtcygpXG4gICAgICAgICAgcGFuZS5kZXN0cm95SXRlbShpdGVtKSBpZiBpdGVtIGluc3RhbmNlb2YgUXVpY2tRdWVyeVJlc3VsdFZpZXdcblxuICAgIGF0b20ud29ya3NwYWNlLmdldENlbnRlcigpLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0gKGl0ZW0pID0+XG4gICAgICBAaGlkZVN0YXR1c0JhcigpXG4gICAgICBpZiAhYXRvbS5jb25maWcuZ2V0KCdxdWljay1xdWVyeS5yZXN1bHRzSW5UYWInKVxuICAgICAgICBmb3IgaSBpbiBAcXVlcnlFZGl0b3JzXG4gICAgICAgICAgcmVzdWx0VmlldyA9IGkucGFuZWwuZ2V0SXRlbSgpXG4gICAgICAgICAgaWYgaS5lZGl0b3IgPT0gaXRlbSAmJiAhcmVzdWx0Vmlldy5oaWRkZW5SZXN1bHRzKClcbiAgICAgICAgICAgIGkucGFuZWwuc2hvdygpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgaS5wYW5lbC5oaWRlKClcbiAgICAgICAgICBAdXBkYXRlU3RhdHVzQmFyKHJlc3VsdFZpZXcpIGlmIGkuZWRpdG9yID09IGl0ZW1cbiAgICAgIGVsc2UgaWYgaXRlbSBpbnN0YW5jZW9mIFF1aWNrUXVlcnlSZXN1bHRWaWV3XG4gICAgICAgIGl0ZW0uZm9jdXNUYWJsZSgpXG4gICAgICAgIEB1cGRhdGVTdGF0dXNCYXIoaXRlbSlcblxuICAgIGF0b20ud29ya3NwYWNlLmdldENlbnRlcigpLm9uRGlkRGVzdHJveVBhbmVJdGVtIChkKSA9PlxuICAgICAgQHF1ZXJ5RWRpdG9ycyA9IEBxdWVyeUVkaXRvcnMuZmlsdGVyIChpKSA9PlxuICAgICAgICBpLnBhbmVsLmRlc3Ryb3koKSBpZiBpLmVkaXRvciA9PSBkLml0ZW1cbiAgICAgICAgaS5lZGl0b3IgIT0gZC5pdGVtXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBjLmNsb3NlKCkgZm9yIGMgaW4gQGNvbm5lY3Rpb25zXG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgaS5wYW5lbC5kZXN0cm95KCkgZm9yIGkgaW4gQHF1ZXJ5RWRpdG9yc1xuICAgIEBicm93c2VyLmRlc3Ryb3koKVxuICAgIEBjb25uZWN0Vmlldy5kZXN0cm95KClcbiAgICBAbW9kYWxQYW5lbD8uZGVzdHJveSgpXG4gICAgQG1vZGFsQ29ubmVjdC5kZXN0cm95KClcbiAgICBAbW9kYWxTcGlubmVyLmRlc3Ryb3koKVxuICAgIEBzdGF0dXNCYXJUaWxlPy5kZXN0cm95KClcbiAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgZm9yIGl0ZW0gaW4gcGFuZS5nZXRJdGVtcygpIHdoZW4gaXRlbSBpbnN0YW5jZW9mIFF1aWNrUXVlcnlSZXN1bHRWaWV3XG4gICAgICBwYW5lLmRlc3Ryb3lJdGVtKGl0ZW0pXG5cbiAgc2VyaWFsaXplOiAtPlxuICAgICBjb25uZWN0aW9uczogQGNvbm5lY3Rpb25zLm1hcCgoYyktPiBjLnNlcmlhbGl6ZSgpKSxcbiAgbmV3RWRpdG9yOiAtPlxuICAgIGF0b20ud29ya3NwYWNlLm9wZW4oKS50aGVuIChlZGl0b3IpID0+XG4gICAgICBhdG9tLnRleHRFZGl0b3JzLnNldEdyYW1tYXJPdmVycmlkZShlZGl0b3IsICdzb3VyY2Uuc3FsJylcbiAgbmV3Q29ubmVjdGlvbjogLT5cbiAgICBAbW9kYWxDb25uZWN0LnNob3coKVxuICAgIEBjb25uZWN0Vmlldy5mb2N1c0ZpcnN0KClcbiAgcnVuOiAtPlxuICAgIEBxdWVyeUVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldENlbnRlcigpLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIHVubGVzcyBAcXVlcnlFZGl0b3JcbiAgICAgIEBzZXRNb2RhbFBhbmVsIGNvbnRlbnQ6XCJUaGlzIHRhYiBpcyBub3QgYW4gZWRpdG9yXCIsIHR5cGU6J2Vycm9yJ1xuICAgICAgcmV0dXJuXG4gICAgdGV4dCA9IEBxdWVyeUVkaXRvci5nZXRTZWxlY3RlZFRleHQoKVxuICAgIHRleHQgPSBAcXVlcnlFZGl0b3IuZ2V0VGV4dCgpIGlmKHRleHQgPT0gJycpXG5cbiAgICBpZiBAY29ubmVjdGlvblxuICAgICAgQHNob3dNb2RhbFNwaW5uZXIgY29udGVudDpcIlJ1bm5pbmcgcXVlcnkuLi5cIlxuICAgICAgQGNvbm5lY3Rpb24ucXVlcnkgdGV4dCwgKG1lc3NhZ2UsIHJvd3MsIGZpZWxkcykgPT5cbiAgICAgICAgaWYgKG1lc3NhZ2UpXG4gICAgICAgICAgQG1vZGFsU3Bpbm5lci5oaWRlKClcbiAgICAgICAgICBpZiBtZXNzYWdlLnR5cGUgPT0gJ2Vycm9yJ1xuICAgICAgICAgICAgQHNldE1vZGFsUGFuZWwgbWVzc2FnZVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBhZGRJbmZvTm90aWZpY2F0aW9uKG1lc3NhZ2UuY29udGVudCk7XG4gICAgICAgICAgaWYgbWVzc2FnZS50eXBlID09ICdzdWNjZXNzJ1xuICAgICAgICAgICAgQGFmdGVyRXhlY3V0ZShAcXVlcnlFZGl0b3IpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAc2hvd01vZGFsU3Bpbm5lciBjb250ZW50OlwiTG9hZGluZyByZXN1bHRzLi4uXCJcbiAgICAgICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ3F1aWNrLXF1ZXJ5LnJlc3VsdHNJblRhYicpXG4gICAgICAgICAgICBxdWVyeVJlc3VsdCA9IEBzaG93UmVzdWx0SW5UYWIoKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHF1ZXJ5UmVzdWx0ID0gQHNob3dSZXN1bHRWaWV3KEBxdWVyeUVkaXRvcilcbiAgICAgICAgICBjdXJzb3IgPSBxdWVyeVJlc3VsdC5nZXRDdXJzb3IoKVxuICAgICAgICAgIHF1ZXJ5UmVzdWx0LnNob3dSb3dzIHJvd3MsIGZpZWxkcywgQGNvbm5lY3Rpb24gLCA9PlxuICAgICAgICAgICAgQG1vZGFsU3Bpbm5lci5oaWRlKClcbiAgICAgICAgICAgIHF1ZXJ5UmVzdWx0LmZpeFNpemVzKCkgaWYgcm93cy5sZW5ndGggPiAxMDBcbiAgICAgICAgICAgIHF1ZXJ5UmVzdWx0LnNldEN1cnNvcihjdXJzb3IuLi4pIGlmIGN1cnNvcj9cbiAgICAgICAgICBxdWVyeVJlc3VsdC5maXhTaXplcygpXG4gICAgICAgICAgQHVwZGF0ZVN0YXR1c0JhcihxdWVyeVJlc3VsdClcblxuICAgIGVsc2VcbiAgICAgIEBhZGRXYXJuaW5nTm90aWZpY2F0aW9uKFwiTm8gY29ubmVjdGlvbiBzZWxlY3RlZFwiKVxuXG4gIHRvZ2dsZUJyb3dzZXI6IC0+XG4gICAgYXRvbS53b3Jrc3BhY2UudG9nZ2xlKCdxdWljay1xdWVyeTovL2Jyb3dzZXInKVxuXG4gIHJlY29ubmVjdDogLT5cbiAgICBvbGRDb25uZWN0aW9uID0gQGNvbm5lY3Rpb25cbiAgICBwb3MgPSBAYnJvd3Nlci5jb25uZWN0aW9ucy5pbmRleE9mKG9sZENvbm5lY3Rpb24pXG4gICAgY29ubmVjdGlvbkluZm8gPSBvbGRDb25uZWN0aW9uLnNlcmlhbGl6ZSgpXG4gICAgY29ubmVjdGlvblByb21pc2UgPSBAY29ubmVjdFZpZXcuYnVpbGRDb25uZWN0aW9uKGNvbm5lY3Rpb25JbmZvKVxuICAgIEBicm93c2VyLmFkZENvbm5lY3Rpb24oY29ubmVjdGlvblByb21pc2UscG9zKVxuICAgIGNvbm5lY3Rpb25Qcm9taXNlLnRoZW4oXG4gICAgICAobmV3Q29ubmVjdGlvbikgPT4gQGJyb3dzZXIucmVtb3ZlQ29ubmVjdGlvbihvbGRDb25uZWN0aW9uKVxuICAgICAgKGVycikgPT4gQHNldE1vZGFsUGFuZWwgY29udGVudDogZXJyLCB0eXBlOiAnZXJyb3InXG4gICAgKVxuXG4gIGZpbmRUYWJsZTogKCktPlxuICAgIGlmIEBjb25uZWN0aW9uXG4gICAgICBAdGFibGVGaW5kZXIuc2VhcmNoVGFibGUoQGNvbm5lY3Rpb24pXG4gICAgICBAbW9kYWxQYW5lbC5kZXN0cm95KCkgaWYgQG1vZGFsUGFuZWw/XG4gICAgICBAbW9kYWxQYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogQHRhYmxlRmluZGVyICwgdmlzaWJsZTogdHJ1ZSlcbiAgICAgIEB0YWJsZUZpbmRlci5mb2N1c0ZpbHRlckVkaXRvcigpXG4gICAgZWxzZVxuICAgICAgQGFkZFdhcm5pbmdOb3RpZmljYXRpb24gXCJObyBjb25uZWN0aW9uIHNlbGVjdGVkXCJcblxuICBhZGRXYXJuaW5nTm90aWZpY2F0aW9uOihtZXNzYWdlKSAtPlxuICAgIG5vdGlmaWNhdGlvbiA9IGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKG1lc3NhZ2UpO1xuICAgIHZpZXcgPSBhdG9tLnZpZXdzLmdldFZpZXcobm90aWZpY2F0aW9uKVxuICAgIHZpZXc/LmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnY2xpY2snLCAoZSkgLT4gdmlldy5yZW1vdmVOb3RpZmljYXRpb24oKVxuXG4gIGFkZEluZm9Ob3RpZmljYXRpb246IChtZXNzYWdlKS0+XG4gICAgbm90aWZpY2F0aW9uID0gYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8obWVzc2FnZSk7XG4gICAgdmlldyA9IGF0b20udmlld3MuZ2V0Vmlldyhub3RpZmljYXRpb24pXG4gICAgdmlldz8uZWxlbWVudC5hZGRFdmVudExpc3RlbmVyICdjbGljaycsIChlKSAtPiB2aWV3LnJlbW92ZU5vdGlmaWNhdGlvbigpXG5cbiAgc2V0TW9kYWxQYW5lbDogKG1lc3NhZ2UpLT5cbiAgICBpdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBpdGVtLmNsYXNzTGlzdC5hZGQoJ3F1aWNrLXF1ZXJ5LW1vZGFsLW1lc3NhZ2UnKVxuICAgIGNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICBjb250ZW50LmNsYXNzTGlzdC5hZGQoJ21lc3NhZ2UnKVxuICAgIGNvbnRlbnQudGV4dENvbnRlbnQgPSBtZXNzYWdlLmNvbnRlbnRcbiAgICBpdGVtLmFwcGVuZENoaWxkKGNvbnRlbnQpXG4gICAgaWYgbWVzc2FnZS50eXBlID09ICdlcnJvcidcbiAgICAgIGl0ZW0uY2xhc3NMaXN0LmFkZCgndGV4dC1lcnJvcicpXG4gICAgICBjb3B5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgICBjb3B5LmNsYXNzTGlzdC5hZGQoJ2ljb24nLCdpY29uLWNsaXBweScpXG4gICAgICBjb3B5LnNldEF0dHJpYnV0ZSgndGl0bGUnLFwiQ29weSB0byBjbGlwYm9hcmRcIilcbiAgICAgIGNvcHkuc2V0QXR0cmlidXRlKCdkYXRhLWVycm9yJyxtZXNzYWdlLmNvbnRlbnQpXG4gICAgICBpdGVtLm9ubW91c2VvdmVyID0gKC0+IEBjbGFzc0xpc3QuYWRkKCdhbmltYXRlZCcpIClcbiAgICAgIGNvcHkub25jbGljayA9ICgtPmF0b20uY2xpcGJvYXJkLndyaXRlKEBnZXRBdHRyaWJ1dGUoJ2RhdGEtZXJyb3InKSkpXG4gICAgICBpdGVtLmFwcGVuZENoaWxkKGNvcHkpXG4gICAgY2xvc2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICBjbG9zZS5jbGFzc0xpc3QuYWRkKCdpY29uJywnaWNvbi14JylcbiAgICBjbG9zZS5vbmNsaWNrID0gKD0+IEBtb2RhbFBhbmVsLmRlc3Ryb3koKSlcbiAgICBpdGVtLmFwcGVuZENoaWxkKGNsb3NlKVxuICAgIEBtb2RhbFBhbmVsLmRlc3Ryb3koKSBpZiBAbW9kYWxQYW5lbD9cbiAgICBAbW9kYWxQYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogaXRlbSAsIHZpc2libGU6IHRydWUpXG5cbiAgY3JlYXRlU3Bpbm5lcjogLT5cbiAgICBpdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBpdGVtLmNsYXNzTGlzdC5hZGQoJ3F1aWNrLXF1ZXJ5LW1vZGFsLXNwaW5uZXInKVxuICAgIHNwaW5uZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICBzcGlubmVyLmNsYXNzTGlzdC5hZGQoJ2xvYWRpbmcnLCdsb2FkaW5nLXNwaW5uZXItdGlueScsJ2lubGluZS1ibG9jaycpXG4gICAgaXRlbS5hcHBlbmRDaGlsZCBzcGlubmVyXG4gICAgY29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICAgIGNvbnRlbnQuY2xhc3NMaXN0LmFkZCgnbWVzc2FnZScpXG4gICAgaXRlbS5hcHBlbmRDaGlsZCBjb250ZW50XG4gICAgcmV0dXJuIGl0ZW1cblxuICBzaG93TW9kYWxTcGlubmVyOiAobWVzc2FnZSktPlxuICAgIGl0ZW0gPSBAbW9kYWxTcGlubmVyLmdldEl0ZW0oKVxuICAgIGNvbnRlbnQgPSBpdGVtLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ21lc3NhZ2UnKS5pdGVtKDApXG4gICAgY29udGVudC50ZXh0Q29udGVudCA9IG1lc3NhZ2UuY29udGVudFxuICAgIEBtb2RhbFNwaW5uZXIuc2hvdygpXG5cbiAgc2hvd1Jlc3VsdEluVGFiOiAtPlxuICAgIHBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRDZW50ZXIoKS5nZXRBY3RpdmVQYW5lKClcbiAgICBmaWx0ZXIgPSBwYW5lLmdldEl0ZW1zKCkuZmlsdGVyIChpdGVtKSAtPlxuICAgICAgaXRlbSBpbnN0YW5jZW9mIFF1aWNrUXVlcnlSZXN1bHRWaWV3XG4gICAgaWYgZmlsdGVyLmxlbmd0aCA9PSAwXG4gICAgICBxdWVyeVJlc3VsdCA9IG5ldyBRdWlja1F1ZXJ5UmVzdWx0VmlldygpXG4gICAgICBxdWVyeVJlc3VsdC5vblJvd1N0YXR1c0NoYW5nZWQgPT4gQHVwZGF0ZVN0YXR1c0JhcihxdWVyeVJlc3VsdClcbiAgICAgIHBhbmUuYWRkSXRlbSBxdWVyeVJlc3VsdFxuICAgIGVsc2VcbiAgICAgIHF1ZXJ5UmVzdWx0ID0gZmlsdGVyWzBdXG4gICAgcGFuZS5hY3RpdmF0ZUl0ZW0gcXVlcnlSZXN1bHRcbiAgICBxdWVyeVJlc3VsdFxuXG4gIGFmdGVyRXhlY3V0ZTogKHF1ZXJ5RWRpdG9yKS0+XG4gICAgaWYgQGVkaXRvclZpZXcgJiYgQGVkaXRvclZpZXcuZWRpdG9yID09IHF1ZXJ5RWRpdG9yXG4gICAgICBpZiAhcXVlcnlFZGl0b3IuZ2V0UGF0aD8oKVxuICAgICAgICBxdWVyeUVkaXRvci5zZXRUZXh0KCcnKVxuICAgICAgICBxdWVyeUVkaXRvci5kZXN0cm95KClcbiAgICAgIGlmIEBlZGl0b3JWaWV3LmFjdGlvbiA9PSAnY3JlYXRlJ1xuICAgICAgICBAYnJvd3Nlci5yZWZyZXNoVHJlZShAZWRpdG9yVmlldy5tb2RlbClcbiAgICAgIGVsc2VcbiAgICAgICAgQGJyb3dzZXIucmVmcmVzaFRyZWUoQGVkaXRvclZpZXcubW9kZWwucGFyZW50KCkpXG4gICAgICBAbW9kYWxQYW5lbC5kZXN0cm95KCkgaWYgQG1vZGFsUGFuZWxcbiAgICAgIEBlZGl0b3JWaWV3ID0gbnVsbFxuXG4gIHNob3dSZXN1bHRWaWV3OiAocXVlcnlFZGl0b3IpLT5cbiAgICBlID0gKGkgZm9yIGkgaW4gQHF1ZXJ5RWRpdG9ycyB3aGVuIGkuZWRpdG9yID09IHF1ZXJ5RWRpdG9yKVxuICAgIGlmIGUubGVuZ3RoID4gMFxuICAgICAgZVswXS5wYW5lbC5zaG93KClcbiAgICAgIHF1ZXJ5UmVzdWx0ID0gZVswXS5wYW5lbC5nZXRJdGVtKClcbiAgICBlbHNlXG4gICAgICBxdWVyeVJlc3VsdCA9IG5ldyBRdWlja1F1ZXJ5UmVzdWx0VmlldygpXG4gICAgICBxdWVyeVJlc3VsdC5vblJvd1N0YXR1c0NoYW5nZWQgPT4gQHVwZGF0ZVN0YXR1c0JhcihxdWVyeVJlc3VsdClcbiAgICAgIGJvdHRvbVBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkQm90dG9tUGFuZWwoaXRlbTogcXVlcnlSZXN1bHQsIHZpc2libGU6dHJ1ZSApXG4gICAgICBAcXVlcnlFZGl0b3JzLnB1c2goe2VkaXRvcjogcXVlcnlFZGl0b3IsICBwYW5lbDogYm90dG9tUGFuZWx9KVxuICAgIHF1ZXJ5UmVzdWx0XG5cbiAgYWN0aXZlUmVzdWx0VmlldzogLT5cbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ3F1aWNrLXF1ZXJ5LnJlc3VsdHNJblRhYicpXG4gICAgICBpdGVtID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKVxuICAgICAgaWYgaXRlbSBpbnN0YW5jZW9mIFF1aWNrUXVlcnlSZXN1bHRWaWV3XG4gICAgICAgIHJldHVybiBpdGVtXG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgZWxzZVxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0Q2VudGVyKCkuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBmb3IgaSBpbiBAcXVlcnlFZGl0b3JzXG4gICAgICAgIHJldHVybiBpLnBhbmVsLmdldEl0ZW0oKSBpZiBpLmVkaXRvciA9PSBlZGl0b3JcbiAgICAgIHJldHVybiBudWxsXG5cbiAgcHJvdmlkZUJyb3dzZXJWaWV3OiAtPiBAYnJvd3NlclxuXG4gIHByb3ZpZGVDb25uZWN0VmlldzogLT4gQGNvbm5lY3RWaWV3XG5cbiAgcHJvdmlkZUF1dG9jb21wbGV0ZTogLT4gbmV3IFF1aWNrUXVlcnlBdXRvY29tcGxldGUoQGJyb3dzZXIpXG5cbiAgY29uc3VtZVN0YXR1c0JhcjogKHN0YXR1c0JhcikgLT5cbiAgICBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpXG4gICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdxdWljay1xdWVyeS10aWxlJylcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hpZGUnKVxuICAgIGVsZW1lbnQub25jbGljayA9ICg9PiBAdG9nZ2xlUmVzdWx0cygpKVxuICAgIEBzdGF0dXNCYXJUaWxlID0gc3RhdHVzQmFyLmFkZExlZnRUaWxlKGl0ZW06IGVsZW1lbnQsIHByaW9yaXR5OiAxMClcblxuICBoaWRlU3RhdHVzQmFyOiAtPlxuICAgIGlmIEBzdGF0dXNCYXJUaWxlP1xuICAgICAgc3BhbiA9IEBzdGF0dXNCYXJUaWxlLmdldEl0ZW0oKVxuICAgICAgc3Bhbi5jbGFzc0xpc3QuYWRkKCdoaWRlJylcblxuICB1cGRhdGVTdGF0dXNCYXI6IChxdWVyeVJlc3VsdCkgLT5cbiAgICByZXR1cm4gdW5sZXNzIEBzdGF0dXNCYXJUaWxlPyAmJiBxdWVyeVJlc3VsdD8ucm93cz9cbiAgICByZXR1cm4gdW5sZXNzIGF0b20uY29uZmlnLmdldCgncXVpY2stcXVlcnkuY2FuVXNlU3RhdHVzQmFyJylcbiAgICBlbGVtZW50ID0gQHN0YXR1c0JhclRpbGUuZ2V0SXRlbSgpXG4gICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ3F1aWNrLXF1ZXJ5LnJlc3VsdHNJblRhYicpXG4gICAgICBlbGVtZW50LnRleHRDb250ZW50ID0gXCIoI3txdWVyeVJlc3VsdC5yb3dzU3RhdHVzKCl9KVwiXG4gICAgZWxzZVxuICAgICAgZWxlbWVudC50ZXh0Q29udGVudCA9IFwiI3txdWVyeVJlc3VsdC5nZXRUaXRsZSgpfSAoI3txdWVyeVJlc3VsdC5yb3dzU3RhdHVzKCl9KVwiXG5cbiAgdG9nZ2xlUmVzdWx0czogLT5cbiAgICBpZiAhYXRvbS5jb25maWcuZ2V0KCdxdWljay1xdWVyeS5yZXN1bHRzSW5UYWInKVxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0Q2VudGVyKCkuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBmb3IgaSBpbiBAcXVlcnlFZGl0b3JzIHdoZW4gaS5lZGl0b3IgPT0gZWRpdG9yXG4gICAgICAgIHJlc3VsdFZpZXcgPSBpLnBhbmVsLmdldEl0ZW0oKVxuICAgICAgICBpZiByZXN1bHRWaWV3LmlzKCc6dmlzaWJsZScpXG4gICAgICAgICBpLnBhbmVsLmhpZGUoKVxuICAgICAgICAgcmVzdWx0Vmlldy5oaWRlUmVzdWx0cygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgIGkucGFuZWwuc2hvdygpXG4gICAgICAgICByZXN1bHRWaWV3LnNob3dSZXN1bHRzKClcblxuICBjYW5jZWw6IC0+XG4gICAgQG1vZGFsUGFuZWwuZGVzdHJveSgpIGlmIEBtb2RhbFBhbmVsXG4gICAgQG1vZGFsQ29ubmVjdC5oaWRlKClcbiAgICBpZiBAbW9kYWxTcGlubmVyLmlzVmlzaWJsZSgpXG4gICAgICByZXN1bHRWaWV3ID0gQGFjdGl2ZVJlc3VsdFZpZXcoKVxuICAgICAgaWYgcmVzdWx0Vmlldz9cbiAgICAgICAgcmVzdWx0Vmlldy5zdG9wTG9vcCgpXG4gICAgICAgIEB1cGRhdGVTdGF0dXNCYXIocmVzdWx0VmlldylcbiAgICAgIEBtb2RhbFNwaW5uZXIuaGlkZSgpXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdxdWljay1xdWVyeS5yZXN1bHRzSW5UYWInKVxuICAgICAgcmVzdWx0VmlldyA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKClcbiAgICAgIHJlc3VsdFZpZXcuZWRpdFNlbGVjdGVkKCkgaWYgcmVzdWx0Vmlldy5lZGl0aW5nXG4gICAgZWxzZVxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0Q2VudGVyKCkuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBmb3IgaSBpbiBAcXVlcnlFZGl0b3JzIHdoZW4gaS5lZGl0b3IgPT0gZWRpdG9yXG4gICAgICAgIHJlc3VsdFZpZXcgPSBpLnBhbmVsLmdldEl0ZW0oKVxuICAgICAgICBpZiByZXN1bHRWaWV3LmVkaXRpbmdcbiAgICAgICAgICByZXN1bHRWaWV3LmVkaXRTZWxlY3RlZCgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBpLnBhbmVsLmhpZGUoKVxuICAgICAgICAgIHJlc3VsdFZpZXcuaGlkZVJlc3VsdHMoKVxuIl19
