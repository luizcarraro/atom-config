(function() {
  var AtomFoldFunctions, CompositeDisposable,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    slice = [].slice;

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = AtomFoldFunctions = {
    modalPanel: null,
    subscriptions: null,
    indentLevel: null,
    config: {
      autofold: {
        type: 'boolean',
        "default": false
      },
      shortfileCutoff: {
        type: 'integer',
        "default": 42
      },
      autofoldGrammars: {
        type: 'array',
        "default": []
      },
      autofoldIgnoreGrammars: {
        type: 'array',
        "default": ['SQL', 'CSV', 'JSON', 'CSON', 'Plain Text']
      },
      skipAutofoldWhenNotFirstLine: {
        type: 'boolean',
        "default": false
      },
      skipAutofoldWhenOnlyOneFunction: {
        type: 'boolean',
        "default": false
      },
      debug: {
        type: 'boolean',
        "default": false
      }
    },
    activate: function(state) {
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'fold-functions:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'fold-functions:fold': (function(_this) {
          return function() {
            return _this.fold();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'fold-functions:unfold': (function(_this) {
          return function() {
            return _this.unfold();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'fold-functions:scopes': (function(_this) {
          return function() {
            return _this.scopes();
          };
        })(this)
      }));
      if (atom.config.get('fold-functions.autofold')) {
        return atom.workspace.observeTextEditors((function(_this) {
          return function(editor) {
            return editor.tokenizedBuffer.onDidTokenize(function() {
              return _this.autofold(editor);
            });
          };
        })(this));
      }
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    },
    autofold: function(editor) {
      var autofold, autofoldGrammars, autofoldIgnoreGrammars, cursor, grammar, j, len, onFirstLine, ref, ref1, ref2, shortfileCutoff;
      this.debugMessage('fold functions: autofold');
      if (!editor) {
        editor = atom.workspace.getActiveTextEditor();
      }
      if (!editor) {
        this.debugMessage('fold functions: no editor, not autofolding...');
        return false;
      }
      grammar = editor.getGrammar();
      autofold = false;
      autofoldGrammars = atom.config.get('fold-functions.autofoldGrammars');
      if (autofoldGrammars && autofoldGrammars.length > 0 && (ref = grammar.name, indexOf.call(autofoldGrammars, ref) < 0)) {
        this.debugMessage('fold functions: autofold grammar not whitelisted', grammar.name);
        return false;
      }
      autofoldIgnoreGrammars = atom.config.get('fold-functions.autofoldIgnoreGrammars');
      if (autofoldIgnoreGrammars && autofoldIgnoreGrammars.length > 0 && (ref1 = grammar.name, indexOf.call(autofoldIgnoreGrammars, ref1) >= 0)) {
        this.debugMessage('fold functions: autofold ignored grammar', grammar.name);
        return false;
      }
      if (shortfileCutoff = atom.config.get('fold-functions.shortfileCutoff', 42)) {
        if (shortfileCutoff > 0 && editor.getLineCount() >= shortfileCutoff) {
          this.debugMessage('fold functions: autofold turned on');
          autofold = true;
        }
      } else {
        this.debugMessage('fold functions: autofold turned on');
        autofold = true;
      }
      if (autofold && atom.config.get('fold-functions.skipAutofoldWhenNotFirstLine')) {
        onFirstLine = true;
        ref2 = editor.getCursors();
        for (j = 0, len = ref2.length; j < len; j++) {
          cursor = ref2[j];
          if (cursor.getBufferRow() > 0) {
            onFirstLine = false;
            break;
          }
        }
        if (!onFirstLine) {
          this.debugMessage('fold function: not on first line, skipping autofold');
          autofold = false;
        }
      }
      if (autofold && atom.config.get('fold-functions.skipAutofoldWhenOnlyOneFunction')) {
        if (this.count(editor) === 1) {
          this.debugMessage('fold functions: only one function, skipping autofold');
          autofold = false;
        }
      }
      if (autofold) {
        this.debugMessage('fold functions: start autofolding');
        this.fold('autofold', editor);
        this.debugMessage('fold functions: autofolded');
        autofold = true;
      }
      return autofold;
    },
    count: function(editor) {
      var foldable, functionCount, hasFoldableLines, isCommented, isFolded, isFunction, j, ref, row, thisIndentLevel;
      if (!editor) {
        editor = atom.workspace.getActiveTextEditor();
      }
      this.indentLevel = this.indentLevel || null;
      hasFoldableLines = false;
      functionCount = 0;
      for (row = j = 0, ref = editor.getLastBufferRow(); 0 <= ref ? j <= ref : j >= ref; row = 0 <= ref ? ++j : --j) {
        foldable = editor.isFoldableAtBufferRow(row);
        isFolded = editor.isFoldedAtBufferRow(row);
        isCommented = editor.isBufferRowCommented(row);
        thisIndentLevel = editor.indentationForBufferRow(row);
        if (this.indentLevel !== null && thisIndentLevel !== this.indentLevel) {
          continue;
        }
        if (foldable) {
          hasFoldableLines = true;
        }
        isFunction = this.hasScopeAtBufferRow(editor, row, 'meta.function', 'meta.method', 'storage.type.arrow', 'entity.name.function.constructor');
        if (foldable && isFunction && !isCommented) {
          if (this.indentLevel === null) {
            this.indentLevel = thisIndentLevel;
          }
          functionCount++;
        }
      }
      return functionCount;
    },
    debugMessage: function() {
      if (atom.config.get('fold-functions.debug', false)) {
        return console.log.apply(console, arguments);
      }
    },
    fold: function(action, editor) {
      var bufferHasFoldableLines, fold, foldable, foldableLines, hasFoldableLines, isCommented, isFolded, isFunction, j, lines, ref, row, thisIndentLevel, toggle, unfold;
      if (!action) {
        action = 'fold';
      }
      if (!editor) {
        editor = atom.workspace.getActiveTextEditor();
      }
      if (!editor) {
        this.debugMessage('fold functions: no editor, skipping');
        return false;
      }
      this.debugMessage('fold functions: action=', action);
      this.indentLevel = this.indentLevel || null;
      hasFoldableLines = false;
      lines = foldableLines = fold = unfold = toggle = 0;
      bufferHasFoldableLines = false;
      for (row = j = 0, ref = editor.getLastBufferRow(); 0 <= ref ? j <= ref : j >= ref; row = 0 <= ref ? ++j : --j) {
        foldable = editor.isFoldableAtBufferRow(row);
        isFolded = editor.isFoldedAtBufferRow(row);
        isCommented = editor.isBufferRowCommented(row);
        if (foldable) {
          bufferHasFoldableLines = true;
        }
        lines++;
        thisIndentLevel = editor.indentationForBufferRow(row);
        if (this.indentLevel !== null && thisIndentLevel !== this.indentLevel) {
          continue;
        }
        if (action === 'unfold' && !isFolded) {
          continue;
        }
        if (isCommented) {
          continue;
        }
        if (foldable) {
          hasFoldableLines = true;
        }
        isFunction = this.hasScopeAtBufferRow(editor, row, 'meta.function', 'meta.method', 'storage.type.arrow', 'entity.name.function.constructor');
        this.debugMessage('fold functions: is foldable', lines, foldable && isFunction && !isCommented, 'foldable', foldable, 'isFunction', isFunction, 'isCommented', isCommented);
        if (isFunction && !(foldable && isFunction && !isCommented)) {
          this.debugMessage('fold functions: line is a function, but cannot be folded', foldable, isCommented);
        } else if (isFunction && foldable && !isCommented) {
          this.debugMessage('?');
          foldableLines++;
          if (this.indentLevel === null) {
            this.indentLevel = thisIndentLevel;
            this.debugMessage('fold functions: indentLevel set at', this.indentLevel);
          }
          if (action === 'toggle') {
            editor.toggleFoldAtBufferRow(row);
            toggle++;
          } else if (action === 'unfold' && isFolded) {
            editor.unfoldBufferRow(row);
            unfold++;
          } else if (!editor.isFoldedAtBufferRow(row)) {
            editor.foldBufferRow(row);
            fold++;
          }
        }
      }
      this.debugMessage('fold functions: done scanning ' + lines + ' lines (' + fold + ':' + unfold + ':' + toggle + ')');
      this.debugMessage('foldable lines: ' + foldableLines);
      return this.debugMessage('indentLevel: ' + this.indentLevel);
    },
    toggle: function() {
      return this.fold('toggle');
    },
    unfold: function() {
      return this.fold('unfold');
    },
    scopes: function() {
      var content, editor, list, position, scopes;
      editor = atom.workspace.getActiveTextEditor();
      position = editor.getCursorBufferPosition();
      scopes = this.getScopesForBufferRow(editor, position.row);
      atom.clipboard.write(scopes.join(', '));
      list = scopes.map(function(item) {
        return "* " + item;
      });
      content = "Scopes at Row\n" + (list.join('\n'));
      return atom.notifications.addInfo(content, {
        dismissable: true
      });
    },
    getScopesForBufferRow: function(editor, row) {
      var currentScope, j, k, len, pos, positionScopes, ref, ref1, scopes, text;
      scopes = [];
      text = editor.lineTextForBufferRow(row).trim();
      if (text && text.length > 0) {
        for (pos = j = 0, ref = text.length; 0 <= ref ? j <= ref : j >= ref; pos = 0 <= ref ? ++j : --j) {
          positionScopes = editor.scopeDescriptorForBufferPosition([row, pos]);
          ref1 = positionScopes.scopes;
          for (k = 0, len = ref1.length; k < len; k++) {
            currentScope = ref1[k];
            if (indexOf.call(scopes, currentScope) < 0) {
              scopes.push(currentScope);
            }
          }
        }
      }
      return scopes;
    },
    hasScopeAtBufferRow: function() {
      var editor, row, rowScopes, scopes;
      editor = arguments[0], row = arguments[1], scopes = 3 <= arguments.length ? slice.call(arguments, 2) : [];
      rowScopes = this.getScopesForBufferRow(editor, row);
      return this.scopeInScopes(rowScopes, scopes);
    },
    scopeInScopes: function(rowScopes, scopes) {
      var i, j, k, l, len, len1, len2, match, piece, pieces, rowScope, rowScopePieces, scope;
      this.debugMessage(scopes, rowScopes);
      for (j = 0, len = scopes.length; j < len; j++) {
        scope = scopes[j];
        if (indexOf.call(rowScopes, scope) >= 0) {
          return true;
        }
        pieces = scope.split('.');
        for (k = 0, len1 = rowScopes.length; k < len1; k++) {
          rowScope = rowScopes[k];
          rowScopePieces = rowScope.split('.');
          match = true;
          for (i = l = 0, len2 = pieces.length; l < len2; i = ++l) {
            piece = pieces[i];
            if (rowScopePieces[i] !== piece) {
              match = false;
            }
            if (!match) {
              break;
            }
          }
          if (match) {
            this.debugMessage('match for', pieces, rowScopePieces);
            return true;
          }
        }
      }
      return false;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2ZvbGQtZnVuY3Rpb25zL2xpYi9mb2xkLWZ1bmN0aW9ucy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHNDQUFBO0lBQUE7OztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFFeEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsaUJBQUEsR0FDZjtJQUFBLFVBQUEsRUFBWSxJQUFaO0lBQ0EsYUFBQSxFQUFlLElBRGY7SUFFQSxXQUFBLEVBQWEsSUFGYjtJQUlBLE1BQUEsRUFDRTtNQUFBLFFBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO09BREY7TUFHQSxlQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFEVDtPQUpGO01BTUEsZ0JBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxPQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQURUO09BUEY7TUFTQSxzQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLE9BQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLENBQUMsS0FBRCxFQUFRLEtBQVIsRUFBZSxNQUFmLEVBQXVCLE1BQXZCLEVBQStCLFlBQS9CLENBRFQ7T0FWRjtNQVlBLDRCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtPQWJGO01BZUEsK0JBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO09BaEJGO01Ba0JBLEtBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO09BbkJGO0tBTEY7SUEyQkEsUUFBQSxFQUFVLFNBQUMsS0FBRDtNQUdSLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFHckIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFDakI7UUFBQSx1QkFBQSxFQUF5QixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxNQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekI7T0FEaUIsQ0FBbkI7TUFHQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUNqQjtRQUFBLHFCQUFBLEVBQXVCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLElBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QjtPQURpQixDQUFuQjtNQUdBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQ2pCO1FBQUEsdUJBQUEsRUFBeUIsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsTUFBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpCO09BRGlCLENBQW5CO01BR0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFDakI7UUFBQSx1QkFBQSxFQUF5QixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxNQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekI7T0FEaUIsQ0FBbkI7TUFHQSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix5QkFBaEIsQ0FBSDtlQUNFLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWYsQ0FBa0MsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxNQUFEO21CQUVoQyxNQUFNLENBQUMsZUFBZSxDQUFDLGFBQXZCLENBQXFDLFNBQUE7cUJBQUcsS0FBQyxDQUFBLFFBQUQsQ0FBVSxNQUFWO1lBQUgsQ0FBckM7VUFGZ0M7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxDLEVBREY7O0lBbEJRLENBM0JWO0lBbURBLFVBQUEsRUFBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7SUFEVSxDQW5EWjtJQXNEQSxRQUFBLEVBQVUsU0FBQyxNQUFEO0FBQ1IsVUFBQTtNQUFBLElBQUMsQ0FBQSxZQUFELENBQWMsMEJBQWQ7TUFDQSxJQUFHLENBQUksTUFBUDtRQUNFLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsRUFEWDs7TUFJQSxJQUFHLENBQUksTUFBUDtRQUNFLElBQUMsQ0FBQSxZQUFELENBQWMsK0NBQWQ7QUFDQSxlQUFPLE1BRlQ7O01BSUEsT0FBQSxHQUFVLE1BQU0sQ0FBQyxVQUFQLENBQUE7TUFDVixRQUFBLEdBQVc7TUFHWCxnQkFBQSxHQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsaUNBQWhCO01BQ25CLElBQUcsZ0JBQUEsSUFBcUIsZ0JBQWdCLENBQUMsTUFBakIsR0FBMEIsQ0FBL0MsSUFBcUQsT0FBQSxPQUFPLENBQUMsSUFBUixFQUFBLGFBQW9CLGdCQUFwQixFQUFBLEdBQUEsS0FBQSxDQUF4RDtRQUNFLElBQUMsQ0FBQSxZQUFELENBQWMsa0RBQWQsRUFBa0UsT0FBTyxDQUFDLElBQTFFO0FBQ0EsZUFBTyxNQUZUOztNQUtBLHNCQUFBLEdBQXlCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix1Q0FBaEI7TUFDekIsSUFBRyxzQkFBQSxJQUEyQixzQkFBc0IsQ0FBQyxNQUF2QixHQUFnQyxDQUEzRCxJQUFpRSxRQUFBLE9BQU8sQ0FBQyxJQUFSLEVBQUEsYUFBZ0Isc0JBQWhCLEVBQUEsSUFBQSxNQUFBLENBQXBFO1FBQ0UsSUFBQyxDQUFBLFlBQUQsQ0FBYywwQ0FBZCxFQUEwRCxPQUFPLENBQUMsSUFBbEU7QUFDQSxlQUFPLE1BRlQ7O01BS0EsSUFBRyxlQUFBLEdBQWtCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixnQ0FBaEIsRUFBa0QsRUFBbEQsQ0FBckI7UUFFRSxJQUFJLGVBQUEsR0FBa0IsQ0FBbEIsSUFBd0IsTUFBTSxDQUFDLFlBQVAsQ0FBQSxDQUFBLElBQXlCLGVBQXJEO1VBQ0UsSUFBQyxDQUFBLFlBQUQsQ0FBYyxvQ0FBZDtVQUNBLFFBQUEsR0FBVyxLQUZiO1NBRkY7T0FBQSxNQUFBO1FBT0UsSUFBQyxDQUFBLFlBQUQsQ0FBYyxvQ0FBZDtRQUNBLFFBQUEsR0FBVyxLQVJiOztNQVlBLElBQUcsUUFBQSxJQUFhLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw2Q0FBaEIsQ0FBaEI7UUFDRSxXQUFBLEdBQWM7QUFDZDtBQUFBLGFBQUEsc0NBQUE7O1VBQ0UsSUFBRyxNQUFNLENBQUMsWUFBUCxDQUFBLENBQUEsR0FBd0IsQ0FBM0I7WUFDRSxXQUFBLEdBQWM7QUFDZCxrQkFGRjs7QUFERjtRQUtBLElBQUcsQ0FBSSxXQUFQO1VBQ0UsSUFBQyxDQUFBLFlBQUQsQ0FBYyxxREFBZDtVQUNBLFFBQUEsR0FBVyxNQUZiO1NBUEY7O01BYUEsSUFBRyxRQUFBLElBQWEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGdEQUFoQixDQUFoQjtRQUNFLElBQUcsSUFBQyxDQUFBLEtBQUQsQ0FBTyxNQUFQLENBQUEsS0FBa0IsQ0FBckI7VUFDRSxJQUFDLENBQUEsWUFBRCxDQUFjLHNEQUFkO1VBQ0EsUUFBQSxHQUFXLE1BRmI7U0FERjs7TUFLQSxJQUFHLFFBQUg7UUFDRSxJQUFDLENBQUEsWUFBRCxDQUFjLG1DQUFkO1FBQ0EsSUFBQyxDQUFBLElBQUQsQ0FBTSxVQUFOLEVBQWtCLE1BQWxCO1FBQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBYyw0QkFBZDtRQUNBLFFBQUEsR0FBVyxLQUpiOzthQUtBO0lBN0RRLENBdERWO0lBc0hBLEtBQUEsRUFBTyxTQUFDLE1BQUQ7QUFDTCxVQUFBO01BQUEsSUFBRyxDQUFJLE1BQVA7UUFDRSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLEVBRFg7O01BR0EsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFDLENBQUEsV0FBRCxJQUFnQjtNQUMvQixnQkFBQSxHQUFtQjtNQUVuQixhQUFBLEdBQWdCO0FBQ2hCLFdBQVcsd0dBQVg7UUFDRSxRQUFBLEdBQVcsTUFBTSxDQUFDLHFCQUFQLENBQTZCLEdBQTdCO1FBQ1gsUUFBQSxHQUFXLE1BQU0sQ0FBQyxtQkFBUCxDQUEyQixHQUEzQjtRQUNYLFdBQUEsR0FBYyxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsR0FBNUI7UUFJZCxlQUFBLEdBQWtCLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixHQUEvQjtRQUNsQixJQUFHLElBQUMsQ0FBQSxXQUFELEtBQWdCLElBQWhCLElBQXlCLGVBQUEsS0FBbUIsSUFBQyxDQUFBLFdBQWhEO0FBQ0UsbUJBREY7O1FBR0EsSUFBRyxRQUFIO1VBQ0UsZ0JBQUEsR0FBbUIsS0FEckI7O1FBR0EsVUFBQSxHQUFhLElBQUMsQ0FBQSxtQkFBRCxDQUNYLE1BRFcsRUFFWCxHQUZXLEVBR1gsZUFIVyxFQUlYLGFBSlcsRUFLWCxvQkFMVyxFQU1YLGtDQU5XO1FBUWIsSUFBRyxRQUFBLElBQWEsVUFBYixJQUE0QixDQUFJLFdBQW5DO1VBQ0UsSUFBRyxJQUFDLENBQUEsV0FBRCxLQUFnQixJQUFuQjtZQUNFLElBQUMsQ0FBQSxXQUFELEdBQWUsZ0JBRGpCOztVQUVBLGFBQUEsR0FIRjs7QUF0QkY7YUEwQkE7SUFsQ0ssQ0F0SFA7SUEwSkEsWUFBQSxFQUFjLFNBQUE7TUFDWixJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixzQkFBaEIsRUFBd0MsS0FBeEMsQ0FBSDtlQUNFLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBWixDQUFrQixPQUFsQixFQUEyQixTQUEzQixFQURGOztJQURZLENBMUpkO0lBOEpBLElBQUEsRUFBTSxTQUFDLE1BQUQsRUFBUyxNQUFUO0FBQ0osVUFBQTtNQUFBLElBQUcsQ0FBQyxNQUFKO1FBQWdCLE1BQUEsR0FBUyxPQUF6Qjs7TUFDQSxJQUFHLENBQUksTUFBUDtRQUNFLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsRUFEWDs7TUFHQSxJQUFHLENBQUksTUFBUDtRQUNFLElBQUMsQ0FBQSxZQUFELENBQWMscUNBQWQ7QUFDQSxlQUFPLE1BRlQ7O01BSUEsSUFBQyxDQUFBLFlBQUQsQ0FBYyx5QkFBZCxFQUF5QyxNQUF6QztNQUNBLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBQyxDQUFBLFdBQUQsSUFBZ0I7TUFDL0IsZ0JBQUEsR0FBbUI7TUFDbkIsS0FBQSxHQUFRLGFBQUEsR0FBZ0IsSUFBQSxHQUFPLE1BQUEsR0FBUyxNQUFBLEdBQVM7TUFDakQsc0JBQUEsR0FBeUI7QUFDekIsV0FBVyx3R0FBWDtRQUNFLFFBQUEsR0FBVyxNQUFNLENBQUMscUJBQVAsQ0FBNkIsR0FBN0I7UUFDWCxRQUFBLEdBQVcsTUFBTSxDQUFDLG1CQUFQLENBQTJCLEdBQTNCO1FBQ1gsV0FBQSxHQUFjLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixHQUE1QjtRQUVkLElBQWlDLFFBQWpDO1VBQUEsc0JBQUEsR0FBeUIsS0FBekI7O1FBRUEsS0FBQTtRQUlBLGVBQUEsR0FBa0IsTUFBTSxDQUFDLHVCQUFQLENBQStCLEdBQS9CO1FBQ2xCLElBQUcsSUFBQyxDQUFBLFdBQUQsS0FBZ0IsSUFBaEIsSUFBeUIsZUFBQSxLQUFtQixJQUFDLENBQUEsV0FBaEQ7QUFDRSxtQkFERjs7UUFLQSxJQUFHLE1BQUEsS0FBVSxRQUFWLElBQXVCLENBQUksUUFBOUI7QUFDRSxtQkFERjs7UUFJQSxJQUFHLFdBQUg7QUFDRSxtQkFERjs7UUFHQSxJQUFHLFFBQUg7VUFDRSxnQkFBQSxHQUFtQixLQURyQjs7UUFHQSxVQUFBLEdBQWEsSUFBQyxDQUFBLG1CQUFELENBQ1gsTUFEVyxFQUVYLEdBRlcsRUFHWCxlQUhXLEVBSVgsYUFKVyxFQUtYLG9CQUxXLEVBTVgsa0NBTlc7UUFRYixJQUFDLENBQUEsWUFBRCxDQUFjLDZCQUFkLEVBQ0UsS0FERixFQUVHLFFBQUEsSUFBYSxVQUFiLElBQTRCLENBQUksV0FGbkMsRUFHRSxVQUhGLEVBR2MsUUFIZCxFQUlFLFlBSkYsRUFJZ0IsVUFKaEIsRUFLRSxhQUxGLEVBS2lCLFdBTGpCO1FBTUEsSUFBRyxVQUFBLElBQWUsQ0FBSSxDQUFDLFFBQUEsSUFBYSxVQUFiLElBQTRCLENBQUksV0FBakMsQ0FBdEI7VUFDRSxJQUFDLENBQUEsWUFBRCxDQUFjLDBEQUFkLEVBQTBFLFFBQTFFLEVBQW9GLFdBQXBGLEVBREY7U0FBQSxNQUVLLElBQUcsVUFBQSxJQUFlLFFBQWYsSUFBNEIsQ0FBSSxXQUFuQztVQUNILElBQUMsQ0FBQSxZQUFELENBQWMsR0FBZDtVQUNBLGFBQUE7VUFDQSxJQUFHLElBQUMsQ0FBQSxXQUFELEtBQWdCLElBQW5CO1lBQ0UsSUFBQyxDQUFBLFdBQUQsR0FBZTtZQUNmLElBQUMsQ0FBQSxZQUFELENBQWMsb0NBQWQsRUFBb0QsSUFBQyxDQUFBLFdBQXJELEVBRkY7O1VBR0EsSUFBRyxNQUFBLEtBQVUsUUFBYjtZQUNFLE1BQU0sQ0FBQyxxQkFBUCxDQUE2QixHQUE3QjtZQUNBLE1BQUEsR0FGRjtXQUFBLE1BR0ssSUFBRyxNQUFBLEtBQVUsUUFBVixJQUF1QixRQUExQjtZQUNILE1BQU0sQ0FBQyxlQUFQLENBQXVCLEdBQXZCO1lBQ0EsTUFBQSxHQUZHO1dBQUEsTUFHQSxJQUFHLENBQUMsTUFBTSxDQUFDLG1CQUFQLENBQTJCLEdBQTNCLENBQUo7WUFDSCxNQUFNLENBQUMsYUFBUCxDQUFxQixHQUFyQjtZQUNBLElBQUEsR0FGRztXQVpGOztBQTNDUDtNQTBEQSxJQUFDLENBQUEsWUFBRCxDQUFjLGdDQUFBLEdBQW1DLEtBQW5DLEdBQTJDLFVBQTNDLEdBQXdELElBQXhELEdBQStELEdBQS9ELEdBQXFFLE1BQXJFLEdBQThFLEdBQTlFLEdBQW9GLE1BQXBGLEdBQTZGLEdBQTNHO01BQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBYyxrQkFBQSxHQUFxQixhQUFuQzthQUNBLElBQUMsQ0FBQSxZQUFELENBQWMsZUFBQSxHQUFrQixJQUFDLENBQUEsV0FBakM7SUExRUksQ0E5Sk47SUEwT0EsTUFBQSxFQUFRLFNBQUE7YUFDTixJQUFDLENBQUEsSUFBRCxDQUFNLFFBQU47SUFETSxDQTFPUjtJQTZPQSxNQUFBLEVBQVEsU0FBQTthQUNOLElBQUMsQ0FBQSxJQUFELENBQU0sUUFBTjtJQURNLENBN09SO0lBaVBBLE1BQUEsRUFBUSxTQUFBO0FBQ04sVUFBQTtNQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUE7TUFDVCxRQUFBLEdBQVcsTUFBTSxDQUFDLHVCQUFQLENBQUE7TUFDWCxNQUFBLEdBQVMsSUFBQyxDQUFBLHFCQUFELENBQXVCLE1BQXZCLEVBQStCLFFBQVEsQ0FBQyxHQUF4QztNQUNULElBQUksQ0FBQyxTQUFTLENBQUMsS0FBZixDQUFxQixNQUFNLENBQUMsSUFBUCxDQUFZLElBQVosQ0FBckI7TUFDQSxJQUFBLEdBQU8sTUFBTSxDQUFDLEdBQVAsQ0FBVyxTQUFDLElBQUQ7ZUFBVSxJQUFBLEdBQUs7TUFBZixDQUFYO01BQ1AsT0FBQSxHQUFVLGlCQUFBLEdBQWlCLENBQUMsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFWLENBQUQ7YUFDM0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFuQixDQUEyQixPQUEzQixFQUFvQztRQUFBLFdBQUEsRUFBYSxJQUFiO09BQXBDO0lBUE0sQ0FqUFI7SUEyUEEscUJBQUEsRUFBdUIsU0FBQyxNQUFELEVBQVMsR0FBVDtBQUNyQixVQUFBO01BQUEsTUFBQSxHQUFTO01BQ1QsSUFBQSxHQUFPLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixHQUE1QixDQUFnQyxDQUFDLElBQWpDLENBQUE7TUFDUCxJQUFHLElBQUEsSUFBUyxJQUFJLENBQUMsTUFBTCxHQUFjLENBQTFCO0FBRUUsYUFBVywwRkFBWDtVQUNFLGNBQUEsR0FBaUIsTUFBTSxDQUFDLGdDQUFQLENBQXdDLENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FBeEM7QUFDakI7QUFBQSxlQUFBLHNDQUFBOztZQUNFLElBQTZCLGFBQW9CLE1BQXBCLEVBQUEsWUFBQSxLQUE3QjtjQUFBLE1BQU0sQ0FBQyxJQUFQLENBQVksWUFBWixFQUFBOztBQURGO0FBRkYsU0FGRjs7YUFNQTtJQVRxQixDQTNQdkI7SUF1UUEsbUJBQUEsRUFBcUIsU0FBQTtBQUNuQixVQUFBO01BRG9CLHVCQUFRLG9CQUFLO01BQ2pDLFNBQUEsR0FBWSxJQUFDLENBQUEscUJBQUQsQ0FBdUIsTUFBdkIsRUFBK0IsR0FBL0I7QUFDWixhQUFPLElBQUMsQ0FBQSxhQUFELENBQWUsU0FBZixFQUEwQixNQUExQjtJQUZZLENBdlFyQjtJQTJRQSxhQUFBLEVBQWUsU0FBQyxTQUFELEVBQVksTUFBWjtBQUNiLFVBQUE7TUFBQSxJQUFDLENBQUEsWUFBRCxDQUFjLE1BQWQsRUFBc0IsU0FBdEI7QUFDQSxXQUFBLHdDQUFBOztRQUVFLElBQWUsYUFBUyxTQUFULEVBQUEsS0FBQSxNQUFmO0FBQUEsaUJBQU8sS0FBUDs7UUFLQSxNQUFBLEdBQVMsS0FBSyxDQUFDLEtBQU4sQ0FBWSxHQUFaO0FBQ1QsYUFBQSw2Q0FBQTs7VUFDRSxjQUFBLEdBQWlCLFFBQVEsQ0FBQyxLQUFULENBQWUsR0FBZjtVQUNqQixLQUFBLEdBQVE7QUFDUixlQUFBLGtEQUFBOztZQUNFLElBQWlCLGNBQWUsQ0FBQSxDQUFBLENBQWYsS0FBcUIsS0FBdEM7Y0FBQSxLQUFBLEdBQVEsTUFBUjs7WUFDQSxJQUFHLENBQUksS0FBUDtBQUNFLG9CQURGOztBQUZGO1VBSUEsSUFBRyxLQUFIO1lBQ0UsSUFBQyxDQUFBLFlBQUQsQ0FBYyxXQUFkLEVBQTJCLE1BQTNCLEVBQW1DLGNBQW5DO0FBQ0EsbUJBQU8sS0FGVDs7QUFQRjtBQVJGO2FBa0JBO0lBcEJhLENBM1FmOztBQUhGIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxubW9kdWxlLmV4cG9ydHMgPSBBdG9tRm9sZEZ1bmN0aW9ucyA9XG4gIG1vZGFsUGFuZWw6IG51bGxcbiAgc3Vic2NyaXB0aW9uczogbnVsbFxuICBpbmRlbnRMZXZlbDogbnVsbFxuXG4gIGNvbmZpZzpcbiAgICBhdXRvZm9sZDpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICBzaG9ydGZpbGVDdXRvZmY6XG4gICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIGRlZmF1bHQ6IDQyXG4gICAgYXV0b2ZvbGRHcmFtbWFyczpcbiAgICAgIHR5cGU6ICdhcnJheSdcbiAgICAgIGRlZmF1bHQ6IFtdXG4gICAgYXV0b2ZvbGRJZ25vcmVHcmFtbWFyczpcbiAgICAgIHR5cGU6ICdhcnJheSdcbiAgICAgIGRlZmF1bHQ6IFsnU1FMJywgJ0NTVicsICdKU09OJywgJ0NTT04nLCAnUGxhaW4gVGV4dCddXG4gICAgc2tpcEF1dG9mb2xkV2hlbk5vdEZpcnN0TGluZTpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICBza2lwQXV0b2ZvbGRXaGVuT25seU9uZUZ1bmN0aW9uOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlYnVnOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgIyBFdmVudHMgc3Vic2NyaWJlZCB0byBpbiBhdG9tJ3Mgc3lzdGVtIGNhbiBiZSBlYXNpbHkgY2xlYW5lZCB1cCB3aXRoIGFcbiAgICAjIENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICAjIFJlZ2lzdGVyIGNvbW1hbmQgdGhhdCB0b2dnbGVzIHRoaXMgdmlld1xuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgJ2ZvbGQtZnVuY3Rpb25zOnRvZ2dsZSc6ID0+IEB0b2dnbGUoKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAnZm9sZC1mdW5jdGlvbnM6Zm9sZCc6ID0+IEBmb2xkKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgJ2ZvbGQtZnVuY3Rpb25zOnVuZm9sZCc6ID0+IEB1bmZvbGQoKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAnZm9sZC1mdW5jdGlvbnM6c2NvcGVzJzogPT4gQHNjb3BlcygpXG5cbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2ZvbGQtZnVuY3Rpb25zLmF1dG9mb2xkJylcbiAgICAgIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgICAjIGVkaXRvci5kaXNwbGF5QnVmZmVyLnRva2VuaXplZEJ1ZmZlci5vbkRpZFRva2VuaXplID0+IEBhdXRvZm9sZChlZGl0b3IpXG4gICAgICAgIGVkaXRvci50b2tlbml6ZWRCdWZmZXIub25EaWRUb2tlbml6ZSA9PiBAYXV0b2ZvbGQoZWRpdG9yKVxuICAgICAgICAjIGVkaXRvci5vbkRpZENoYW5nZUdyYW1tYXIgPT4gQGF1dG9mb2xkKGVkaXRvcilcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuXG4gIGF1dG9mb2xkOiAoZWRpdG9yKSAtPlxuICAgIEBkZWJ1Z01lc3NhZ2UoJ2ZvbGQgZnVuY3Rpb25zOiBhdXRvZm9sZCcpXG4gICAgaWYgbm90IGVkaXRvclxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG5cbiAgICAjIGp1c3QgaW4gY2FzZSB0aGVyZSByZWFsbHkgaXMgbm90IGFuIGVkaXRvciwgZG9uJ3QgdHJ5IHRvIGF1dG9mb2xkLi4uXG4gICAgaWYgbm90IGVkaXRvclxuICAgICAgQGRlYnVnTWVzc2FnZSgnZm9sZCBmdW5jdGlvbnM6IG5vIGVkaXRvciwgbm90IGF1dG9mb2xkaW5nLi4uJylcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgZ3JhbW1hciA9IGVkaXRvci5nZXRHcmFtbWFyKClcbiAgICBhdXRvZm9sZCA9IGZhbHNlXG5cbiAgICAjIHRoZSBncmFtbWFyIGlzIG5vdCB3aGl0ZSBsaXN0ZWQgKGFuZCB0aGVyZSBhcmUgdGhpbmdzIHdoaXRlbGlzdGVkKVxuICAgIGF1dG9mb2xkR3JhbW1hcnMgPSBhdG9tLmNvbmZpZy5nZXQoJ2ZvbGQtZnVuY3Rpb25zLmF1dG9mb2xkR3JhbW1hcnMnKVxuICAgIGlmIGF1dG9mb2xkR3JhbW1hcnMgYW5kIGF1dG9mb2xkR3JhbW1hcnMubGVuZ3RoID4gMCBhbmQgZ3JhbW1hci5uYW1lIG5vdCBpbiBhdXRvZm9sZEdyYW1tYXJzXG4gICAgICBAZGVidWdNZXNzYWdlKCdmb2xkIGZ1bmN0aW9uczogYXV0b2ZvbGQgZ3JhbW1hciBub3Qgd2hpdGVsaXN0ZWQnLCBncmFtbWFyLm5hbWUpXG4gICAgICByZXR1cm4gZmFsc2VcblxuICAgICMgdGhlIGdyYW1tYXIgaXMgbm90IGluIHRoZSBpZ25vcmUgZ3JhbW1hciBsaXN0XG4gICAgYXV0b2ZvbGRJZ25vcmVHcmFtbWFycyA9IGF0b20uY29uZmlnLmdldCgnZm9sZC1mdW5jdGlvbnMuYXV0b2ZvbGRJZ25vcmVHcmFtbWFycycpXG4gICAgaWYgYXV0b2ZvbGRJZ25vcmVHcmFtbWFycyBhbmQgYXV0b2ZvbGRJZ25vcmVHcmFtbWFycy5sZW5ndGggPiAwIGFuZCBncmFtbWFyLm5hbWUgaW4gYXV0b2ZvbGRJZ25vcmVHcmFtbWFyc1xuICAgICAgQGRlYnVnTWVzc2FnZSgnZm9sZCBmdW5jdGlvbnM6IGF1dG9mb2xkIGlnbm9yZWQgZ3JhbW1hcicsIGdyYW1tYXIubmFtZSlcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgIyBjaGVjayBpZiB0aGUgZmlsZSBpcyB0b28gc2hvcnQgdG8gcnVuXG4gICAgaWYgc2hvcnRmaWxlQ3V0b2ZmID0gYXRvbS5jb25maWcuZ2V0KCdmb2xkLWZ1bmN0aW9ucy5zaG9ydGZpbGVDdXRvZmYnLCA0MilcbiAgICAgICMgbWFrZSBzdXJlIHRoZSBmaWxlIGlzIGxvbmdlciB0aGFuIHRoZSBjdXRvZmYgYmVmb3JlIGZvbGRpbmdcbiAgICAgIGlmIChzaG9ydGZpbGVDdXRvZmYgPiAwIGFuZCBlZGl0b3IuZ2V0TGluZUNvdW50KCkgPj0gc2hvcnRmaWxlQ3V0b2ZmKVxuICAgICAgICBAZGVidWdNZXNzYWdlKCdmb2xkIGZ1bmN0aW9uczogYXV0b2ZvbGQgdHVybmVkIG9uJylcbiAgICAgICAgYXV0b2ZvbGQgPSB0cnVlXG4gICAgIyBpZiBzaG9ydGZpbGVDdXRvZmYgPSAwL2ZhbHNlLy0xIHRoZW4gd2Ugc2hvdWxkIHN0aWxsIHR1cm4gb24gYXV0b2ZvbGRpbmdcbiAgICBlbHNlXG4gICAgICBAZGVidWdNZXNzYWdlKCdmb2xkIGZ1bmN0aW9uczogYXV0b2ZvbGQgdHVybmVkIG9uJylcbiAgICAgIGF1dG9mb2xkID0gdHJ1ZVxuXG4gICAgIyBmaWd1cmUgb3V0IGlmIHdlIHNob3VsZCBza2lwIGF1dG9mb2xkaW5nIGJlY2F1c2Ugd2UgYXJlIG5vdCBvbiB0aGUgZmlyc3RcbiAgICAjIGxpbmUgb2YgdGhlIGZpbGUuXG4gICAgaWYgYXV0b2ZvbGQgYW5kIGF0b20uY29uZmlnLmdldCgnZm9sZC1mdW5jdGlvbnMuc2tpcEF1dG9mb2xkV2hlbk5vdEZpcnN0TGluZScpXG4gICAgICBvbkZpcnN0TGluZSA9IHRydWVcbiAgICAgIGZvciBjdXJzb3IgaW4gZWRpdG9yLmdldEN1cnNvcnMoKVxuICAgICAgICBpZiBjdXJzb3IuZ2V0QnVmZmVyUm93KCkgPiAwXG4gICAgICAgICAgb25GaXJzdExpbmUgPSBmYWxzZVxuICAgICAgICAgIGJyZWFrXG5cbiAgICAgIGlmIG5vdCBvbkZpcnN0TGluZVxuICAgICAgICBAZGVidWdNZXNzYWdlKCdmb2xkIGZ1bmN0aW9uOiBub3Qgb24gZmlyc3QgbGluZSwgc2tpcHBpbmcgYXV0b2ZvbGQnKVxuICAgICAgICBhdXRvZm9sZCA9IGZhbHNlXG5cbiAgICAjIGZpZ3VyZSBvdXQgaWYgd2Ugc2hvdWxkIHNraXAgYXV0b2ZvbGRpbmcgYmVjYXVzZSB0aGVyZSBpcyBvbmx5IG9uZVxuICAgICMgdG9wLWxldmVsIGZ1bmN0aW9uIHRvIGZvbGRcbiAgICBpZiBhdXRvZm9sZCBhbmQgYXRvbS5jb25maWcuZ2V0KCdmb2xkLWZ1bmN0aW9ucy5za2lwQXV0b2ZvbGRXaGVuT25seU9uZUZ1bmN0aW9uJylcbiAgICAgIGlmIEBjb3VudChlZGl0b3IpID09IDFcbiAgICAgICAgQGRlYnVnTWVzc2FnZSgnZm9sZCBmdW5jdGlvbnM6IG9ubHkgb25lIGZ1bmN0aW9uLCBza2lwcGluZyBhdXRvZm9sZCcpXG4gICAgICAgIGF1dG9mb2xkID0gZmFsc2VcblxuICAgIGlmIGF1dG9mb2xkXG4gICAgICBAZGVidWdNZXNzYWdlKCdmb2xkIGZ1bmN0aW9uczogc3RhcnQgYXV0b2ZvbGRpbmcnKVxuICAgICAgQGZvbGQoJ2F1dG9mb2xkJywgZWRpdG9yKVxuICAgICAgQGRlYnVnTWVzc2FnZSgnZm9sZCBmdW5jdGlvbnM6IGF1dG9mb2xkZWQnKVxuICAgICAgYXV0b2ZvbGQgPSB0cnVlXG4gICAgYXV0b2ZvbGRcblxuICAjIEZpZ3VyZSBvdXQgdGhlIG51bWJlciBvZiBmdW5jdGlvbnMgaW4gdGhpcyBmaWxlLlxuICBjb3VudDogKGVkaXRvcikgLT5cbiAgICBpZiBub3QgZWRpdG9yXG4gICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcblxuICAgIEBpbmRlbnRMZXZlbCA9IEBpbmRlbnRMZXZlbCB8fCBudWxsXG4gICAgaGFzRm9sZGFibGVMaW5lcyA9IGZhbHNlXG5cbiAgICBmdW5jdGlvbkNvdW50ID0gMFxuICAgIGZvciByb3cgaW4gWzAuLmVkaXRvci5nZXRMYXN0QnVmZmVyUm93KCldXG4gICAgICBmb2xkYWJsZSA9IGVkaXRvci5pc0ZvbGRhYmxlQXRCdWZmZXJSb3cocm93KVxuICAgICAgaXNGb2xkZWQgPSBlZGl0b3IuaXNGb2xkZWRBdEJ1ZmZlclJvdyhyb3cpXG4gICAgICBpc0NvbW1lbnRlZCA9IGVkaXRvci5pc0J1ZmZlclJvd0NvbW1lbnRlZChyb3cpXG5cbiAgICAgICMgY2hlY2sgdGhlIGluZGVudCBsZXZlbCBmb3IgdGhpcyBsaW5lIGFuZCBtYWtlIHN1cmUgaXQgaXMgdGhlIHNhbWUgYXNcbiAgICAgICMgcHJldmlvdXMgbGluZXMgd2hlcmUgd2UgZm91bmQgZnVuY3Rpb25zXG4gICAgICB0aGlzSW5kZW50TGV2ZWwgPSBlZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocm93KVxuICAgICAgaWYgQGluZGVudExldmVsICE9IG51bGwgYW5kIHRoaXNJbmRlbnRMZXZlbCAhPSBAaW5kZW50TGV2ZWxcbiAgICAgICAgY29udGludWVcblxuICAgICAgaWYgZm9sZGFibGVcbiAgICAgICAgaGFzRm9sZGFibGVMaW5lcyA9IHRydWVcblxuICAgICAgaXNGdW5jdGlvbiA9IEBoYXNTY29wZUF0QnVmZmVyUm93KFxuICAgICAgICBlZGl0b3IsXG4gICAgICAgIHJvdyxcbiAgICAgICAgJ21ldGEuZnVuY3Rpb24nLFxuICAgICAgICAnbWV0YS5tZXRob2QnLFxuICAgICAgICAnc3RvcmFnZS50eXBlLmFycm93JyxcbiAgICAgICAgJ2VudGl0eS5uYW1lLmZ1bmN0aW9uLmNvbnN0cnVjdG9yJ1xuICAgICAgKVxuICAgICAgaWYgZm9sZGFibGUgYW5kIGlzRnVuY3Rpb24gYW5kIG5vdCBpc0NvbW1lbnRlZFxuICAgICAgICBpZiBAaW5kZW50TGV2ZWwgPT0gbnVsbFxuICAgICAgICAgIEBpbmRlbnRMZXZlbCA9IHRoaXNJbmRlbnRMZXZlbFxuICAgICAgICBmdW5jdGlvbkNvdW50KytcbiAgICBmdW5jdGlvbkNvdW50XG5cbiAgZGVidWdNZXNzYWdlOiAtPlxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnZm9sZC1mdW5jdGlvbnMuZGVidWcnLCBmYWxzZSlcbiAgICAgIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGFyZ3VtZW50cylcblxuICBmb2xkOiAoYWN0aW9uLCBlZGl0b3IpIC0+XG4gICAgaWYgIWFjdGlvbiB0aGVuIGFjdGlvbiA9ICdmb2xkJ1xuICAgIGlmIG5vdCBlZGl0b3JcbiAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuXG4gICAgaWYgbm90IGVkaXRvclxuICAgICAgQGRlYnVnTWVzc2FnZSgnZm9sZCBmdW5jdGlvbnM6IG5vIGVkaXRvciwgc2tpcHBpbmcnKVxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBAZGVidWdNZXNzYWdlKCdmb2xkIGZ1bmN0aW9uczogYWN0aW9uPScsIGFjdGlvbilcbiAgICBAaW5kZW50TGV2ZWwgPSBAaW5kZW50TGV2ZWwgfHwgbnVsbFxuICAgIGhhc0ZvbGRhYmxlTGluZXMgPSBmYWxzZVxuICAgIGxpbmVzID0gZm9sZGFibGVMaW5lcyA9IGZvbGQgPSB1bmZvbGQgPSB0b2dnbGUgPSAwXG4gICAgYnVmZmVySGFzRm9sZGFibGVMaW5lcyA9IGZhbHNlXG4gICAgZm9yIHJvdyBpbiBbMC4uZWRpdG9yLmdldExhc3RCdWZmZXJSb3coKV1cbiAgICAgIGZvbGRhYmxlID0gZWRpdG9yLmlzRm9sZGFibGVBdEJ1ZmZlclJvdyByb3dcbiAgICAgIGlzRm9sZGVkID0gZWRpdG9yLmlzRm9sZGVkQXRCdWZmZXJSb3cgcm93XG4gICAgICBpc0NvbW1lbnRlZCA9IGVkaXRvci5pc0J1ZmZlclJvd0NvbW1lbnRlZCByb3dcblxuICAgICAgYnVmZmVySGFzRm9sZGFibGVMaW5lcyA9IHRydWUgaWYgZm9sZGFibGVcblxuICAgICAgbGluZXMrK1xuXG4gICAgICAjIGNoZWNrIHRoZSBpbmRlbnQgbGV2ZWwgZm9yIHRoaXMgbGluZSBhbmQgbWFrZSBzdXJlIGl0IGlzIHRoZSBzYW1lIGFzXG4gICAgICAjIHByZXZpb3VzIGxpbmVzIHdoZXJlIHdlIGZvdW5kIGZ1bmN0aW9uc1xuICAgICAgdGhpc0luZGVudExldmVsID0gZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KHJvdylcbiAgICAgIGlmIEBpbmRlbnRMZXZlbCAhPSBudWxsIGFuZCB0aGlzSW5kZW50TGV2ZWwgIT0gQGluZGVudExldmVsXG4gICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICMgaWYgd2UgYXJlIHVuZm9sZGluZyBsaW5lcywgd2UgZG9uJ3QgbmVlZCB0byBwYXkgYXR0ZW50aW9uIHRvIGxpbmVzIHRoYXRcbiAgICAgICMgYXJlIG5vdCBmb2xkZWRcbiAgICAgIGlmIGFjdGlvbiA9PSAndW5mb2xkJyBhbmQgbm90IGlzRm9sZGVkXG4gICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICMgaWdub3JlIGNvbW1lbnRlZCBsaW5lc1xuICAgICAgaWYgaXNDb21tZW50ZWRcbiAgICAgICAgY29udGludWVcblxuICAgICAgaWYgZm9sZGFibGVcbiAgICAgICAgaGFzRm9sZGFibGVMaW5lcyA9IHRydWVcblxuICAgICAgaXNGdW5jdGlvbiA9IEBoYXNTY29wZUF0QnVmZmVyUm93KFxuICAgICAgICBlZGl0b3IsXG4gICAgICAgIHJvdyxcbiAgICAgICAgJ21ldGEuZnVuY3Rpb24nLFxuICAgICAgICAnbWV0YS5tZXRob2QnLFxuICAgICAgICAnc3RvcmFnZS50eXBlLmFycm93JyxcbiAgICAgICAgJ2VudGl0eS5uYW1lLmZ1bmN0aW9uLmNvbnN0cnVjdG9yJ1xuICAgICAgKVxuICAgICAgQGRlYnVnTWVzc2FnZSAnZm9sZCBmdW5jdGlvbnM6IGlzIGZvbGRhYmxlJyxcbiAgICAgICAgbGluZXMsXG4gICAgICAgIChmb2xkYWJsZSBhbmQgaXNGdW5jdGlvbiBhbmQgbm90IGlzQ29tbWVudGVkKSxcbiAgICAgICAgJ2ZvbGRhYmxlJywgZm9sZGFibGUsXG4gICAgICAgICdpc0Z1bmN0aW9uJywgaXNGdW5jdGlvbixcbiAgICAgICAgJ2lzQ29tbWVudGVkJywgaXNDb21tZW50ZWRcbiAgICAgIGlmIGlzRnVuY3Rpb24gYW5kIG5vdCAoZm9sZGFibGUgYW5kIGlzRnVuY3Rpb24gYW5kIG5vdCBpc0NvbW1lbnRlZClcbiAgICAgICAgQGRlYnVnTWVzc2FnZSAnZm9sZCBmdW5jdGlvbnM6IGxpbmUgaXMgYSBmdW5jdGlvbiwgYnV0IGNhbm5vdCBiZSBmb2xkZWQnLCBmb2xkYWJsZSwgaXNDb21tZW50ZWRcbiAgICAgIGVsc2UgaWYgaXNGdW5jdGlvbiBhbmQgZm9sZGFibGUgYW5kIG5vdCBpc0NvbW1lbnRlZFxuICAgICAgICBAZGVidWdNZXNzYWdlICc/J1xuICAgICAgICBmb2xkYWJsZUxpbmVzKytcbiAgICAgICAgaWYgQGluZGVudExldmVsID09IG51bGxcbiAgICAgICAgICBAaW5kZW50TGV2ZWwgPSB0aGlzSW5kZW50TGV2ZWxcbiAgICAgICAgICBAZGVidWdNZXNzYWdlICdmb2xkIGZ1bmN0aW9uczogaW5kZW50TGV2ZWwgc2V0IGF0JywgQGluZGVudExldmVsXG4gICAgICAgIGlmIGFjdGlvbiA9PSAndG9nZ2xlJ1xuICAgICAgICAgIGVkaXRvci50b2dnbGVGb2xkQXRCdWZmZXJSb3cgcm93XG4gICAgICAgICAgdG9nZ2xlKytcbiAgICAgICAgZWxzZSBpZiBhY3Rpb24gPT0gJ3VuZm9sZCcgYW5kIGlzRm9sZGVkXG4gICAgICAgICAgZWRpdG9yLnVuZm9sZEJ1ZmZlclJvdyByb3dcbiAgICAgICAgICB1bmZvbGQrK1xuICAgICAgICBlbHNlIGlmICFlZGl0b3IuaXNGb2xkZWRBdEJ1ZmZlclJvdyByb3dcbiAgICAgICAgICBlZGl0b3IuZm9sZEJ1ZmZlclJvdyByb3dcbiAgICAgICAgICBmb2xkKytcbiAgICBAZGVidWdNZXNzYWdlKCdmb2xkIGZ1bmN0aW9uczogZG9uZSBzY2FubmluZyAnICsgbGluZXMgKyAnIGxpbmVzICgnICsgZm9sZCArICc6JyArIHVuZm9sZCArICc6JyArIHRvZ2dsZSArICcpJylcbiAgICBAZGVidWdNZXNzYWdlKCdmb2xkYWJsZSBsaW5lczogJyArIGZvbGRhYmxlTGluZXMpXG4gICAgQGRlYnVnTWVzc2FnZSgnaW5kZW50TGV2ZWw6ICcgKyBAaW5kZW50TGV2ZWwpXG5cbiAgdG9nZ2xlOiAtPlxuICAgIEBmb2xkKCd0b2dnbGUnKVxuXG4gIHVuZm9sZDogLT5cbiAgICBAZm9sZCgndW5mb2xkJylcblxuICAjIExvZyB0aGUgc2NvcGVzIGFuZCBjb3B5IHRoZW0gdG8gdGhlIGNsaXBib2FyZC5cbiAgc2NvcGVzOiAtPlxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIHBvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICBzY29wZXMgPSBAZ2V0U2NvcGVzRm9yQnVmZmVyUm93KGVkaXRvciwgcG9zaXRpb24ucm93KVxuICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKHNjb3Blcy5qb2luKCcsICcpKVxuICAgIGxpc3QgPSBzY29wZXMubWFwIChpdGVtKSAtPiBcIiogI3tpdGVtfVwiXG4gICAgY29udGVudCA9IFwiU2NvcGVzIGF0IFJvd1xcbiN7bGlzdC5qb2luKCdcXG4nKX1cIlxuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKGNvbnRlbnQsIGRpc21pc3NhYmxlOiB0cnVlKVxuXG4gICMgZ2V0IGFsbCB0aGUgc2NvcGVzIGluIGEgYnVmZmVyIHJvd1xuICBnZXRTY29wZXNGb3JCdWZmZXJSb3c6IChlZGl0b3IsIHJvdykgLT5cbiAgICBzY29wZXMgPSBbXVxuICAgIHRleHQgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocm93KS50cmltKClcbiAgICBpZiB0ZXh0IGFuZCB0ZXh0Lmxlbmd0aCA+IDBcbiAgICAgICMgc2NhbiB0aGUgdGV4dCBsaW5lIHRvIHNlZSBpZiB0aGVyZSBpcyBhIGZ1bmN0aW9uIHNvbWV3aGVyZVxuICAgICAgZm9yIHBvcyBpbiBbMC4udGV4dC5sZW5ndGhdXG4gICAgICAgIHBvc2l0aW9uU2NvcGVzID0gZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKFtyb3csIHBvc10pXG4gICAgICAgIGZvciBjdXJyZW50U2NvcGUgaW4gcG9zaXRpb25TY29wZXMuc2NvcGVzXG4gICAgICAgICAgc2NvcGVzLnB1c2goY3VycmVudFNjb3BlKSBpZiBjdXJyZW50U2NvcGUgbm90IGluIHNjb3Blc1xuICAgIHNjb3Blc1xuXG4gICMgQ2hlY2sgdGhlIHNjb3BlcyBmb3IgdGhpcyBidWZmZXIgcm93IHRvIHNlZSBpZiBpdCBtYXRjaGVzIHdoYXQgd2Ugd2FudFxuICBoYXNTY29wZUF0QnVmZmVyUm93OiAoZWRpdG9yLCByb3csIHNjb3Blcy4uLikgLT5cbiAgICByb3dTY29wZXMgPSBAZ2V0U2NvcGVzRm9yQnVmZmVyUm93KGVkaXRvciwgcm93KVxuICAgIHJldHVybiBAc2NvcGVJblNjb3Blcyhyb3dTY29wZXMsIHNjb3BlcylcblxuICBzY29wZUluU2NvcGVzOiAocm93U2NvcGVzLCBzY29wZXMpIC0+XG4gICAgQGRlYnVnTWVzc2FnZShzY29wZXMsIHJvd1Njb3BlcylcbiAgICBmb3Igc2NvcGUgaW4gc2NvcGVzXG4gICAgICAjIGluY2FzZSB0aGVyZSBpcyBhbiBleGFjdCBtYXRjaCwgcmV0dXJuIHF1aWNrbHlcbiAgICAgIHJldHVybiB0cnVlIGlmIHNjb3BlIGluIHJvd1Njb3Blc1xuXG4gICAgICAjIGlmIG5vdCwgd2UgbmVlZCB0byBsb29rIGF0IGVhY2ggcGllY2Ugb2YgdGhlIHNjb3BlIHRvIHNlZSBpZiB0aGV5IG1hdGNoXG4gICAgICAjIHVzaW5nIHN0YXJ0c1dpdGggaXMgcHJvYmxlbWF0aWMgZm9yIHRoaW5ncyBsaWtlICdtZXRhLmZ1bmN0aW9uLWNhbGwnXG4gICAgICAjIHdvdWxkIGdldCBmb2xkZWQgaW5zdGVhZCBvZiBqdXN0ICdtZXRhLmZ1bmN0aW9uJ1xuICAgICAgcGllY2VzID0gc2NvcGUuc3BsaXQoJy4nKVxuICAgICAgZm9yIHJvd1Njb3BlIGluIHJvd1Njb3Blc1xuICAgICAgICByb3dTY29wZVBpZWNlcyA9IHJvd1Njb3BlLnNwbGl0KCcuJylcbiAgICAgICAgbWF0Y2ggPSB0cnVlXG4gICAgICAgIGZvciBwaWVjZSwgaSBpbiBwaWVjZXNcbiAgICAgICAgICBtYXRjaCA9IGZhbHNlIGlmIHJvd1Njb3BlUGllY2VzW2ldICE9IHBpZWNlXG4gICAgICAgICAgaWYgbm90IG1hdGNoXG4gICAgICAgICAgICBicmVha1xuICAgICAgICBpZiBtYXRjaFxuICAgICAgICAgIEBkZWJ1Z01lc3NhZ2UoJ21hdGNoIGZvcicsIHBpZWNlcywgcm93U2NvcGVQaWVjZXMpXG4gICAgICAgICAgcmV0dXJuIHRydWVcbiAgICBmYWxzZVxuIl19
