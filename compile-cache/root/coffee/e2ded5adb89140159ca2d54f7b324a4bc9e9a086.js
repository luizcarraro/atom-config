(function() {
  var $, CompositeDisposable, NavView, Parser, path;

  $ = require('jquery');

  NavView = require('./nav-view');

  Parser = require('./nav-parser');

  path = require('path');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = {
    navView: null,
    parser: null,
    subscriptions: null,
    config: {
      collapsedGroups: {
        title: 'Groups that are initially collapsed',
        description: 'List groups separated by comma (e.g. Variable) ',
        type: 'string',
        "default": 'Variable'
      },
      ignoredGroups: {
        title: 'Groups that are ignored',
        description: 'These groups will not be displayed at all',
        type: 'string',
        "default": ''
      },
      topGroups: {
        title: 'Groups at top',
        description: 'Groups that are displayed at the top, irrespective of sorting',
        type: 'string',
        "default": 'Bookmarks, Todo'
      },
      noDups: {
        title: 'No Duplicates',
        type: 'boolean',
        "default": true
      },
      leftPanel: {
        title: 'Should panel be on the left',
        type: 'boolean',
        "default": false
      }
    },
    activate: function(state) {
      var settings;
      this.enabled = !(state.enabled === false);
      this.subscriptions = new CompositeDisposable;
      settings = atom.config.getAll('nav-panel-plus')[0].value;
      settings.leftPanel = settings.leftPanel ? 'left' : 'right';
      this.parser = new Parser();
      this.navView = new NavView(state, settings, this.parser);
      this.subscriptions.add(atom.config.onDidChange('nav-panel-plus', (function(_this) {
        return function(event) {
          var i, key, len, value;
          settings = event.newValue;
          for (value = i = 0, len = settings.length; i < len; value = ++i) {
            key = settings[value];
            if (key.indexOf('Groups') > 0) {
              settings[key] = value.split(',');
            }
          }
          settings.leftPanel = settings.leftPanel ? 'left' : 'right';
          return _this.navView.changeSettings(settings);
        };
      })(this)));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'nav-panel-plus:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'nav-panel-plus:changeSide': (function(_this) {
          return function() {
            return _this.changePanelSide();
          };
        })(this)
      }));
      this.subscriptions.add(atom.workspace.onDidStopChangingActivePaneItem((function(_this) {
        return function(paneItem) {
          var editor, editorFile;
          editor = atom.workspace.getActiveTextEditor();
          if (!editor) {
            return _this.navView.hide();
          }
          if (editor !== paneItem) {
            return;
          }
          editorFile = editor.getPath();
          _this.navView.setFile(editorFile);
          if (!(editor && editor.onDidSave)) {
            return;
          }
          if (!editor.ziOnEditorSave) {
            editor.ziOnEditorSave = editor.onDidSave(function(event) {
              if (!_this.enabled) {
                return;
              }
              return setTimeout(function() {
                editorFile = editor.getPath();
                if (editorFile) {
                  return _this.navView.updateFile(editorFile);
                }
              }, 200);
            });
            _this.subscriptions.add(editor.ziOnEditorSave);
            return _this.subscriptions.add(editor.onDidDestroy(function() {
              return _this.navView.closeFile(editorFile);
            }));
          }
        };
      })(this)));
      return this.subscriptions.add(atom.workspace.onWillDestroyPaneItem((function(_this) {
        return function(event) {
          if (event.item.ziOnEditorSave) {
            return _this.navView.saveFileState(event.item.getPath());
          }
        };
      })(this)));
    },
    deactivate: function() {
      this.navView.destroy();
      this.parser.destroy();
      this.subscriptions.dispose();
      return this.navView = null;
    },
    serialize: function() {
      return {
        enabled: this.enabled,
        fileStates: this.navView.getState()
      };
    },
    toggle: function() {
      this.enabled = !this.enabled;
      return this.navView.enable(this.enabled);
    },
    changePanelSide: function() {
      return this.navView.movePanel();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL25hdi1wYW5lbC1wbHVzL2xpYi9uYXYtcGFuZWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7O0VBQ0osT0FBQSxHQUFVLE9BQUEsQ0FBUSxZQUFSOztFQUNWLE1BQUEsR0FBUyxPQUFBLENBQVEsY0FBUjs7RUFFVCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRU4sc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUd4QixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsT0FBQSxFQUFTLElBQVQ7SUFDQSxNQUFBLEVBQVEsSUFEUjtJQUVBLGFBQUEsRUFBZSxJQUZmO0lBSUEsTUFBQSxFQUNFO01BQUEsZUFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLHFDQUFQO1FBQ0EsV0FBQSxFQUFhLGlEQURiO1FBRUEsSUFBQSxFQUFNLFFBRk47UUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFVBSFQ7T0FERjtNQUtBLGFBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyx5QkFBUDtRQUNBLFdBQUEsRUFBYSwyQ0FEYjtRQUVBLElBQUEsRUFBTSxRQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQUhUO09BTkY7TUFVQSxTQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sZUFBUDtRQUNBLFdBQUEsRUFBYSwrREFEYjtRQUVBLElBQUEsRUFBTSxRQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxpQkFIVDtPQVhGO01BZUEsTUFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLGVBQVA7UUFDQSxJQUFBLEVBQU0sU0FETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFGVDtPQWhCRjtNQW1CQSxTQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sNkJBQVA7UUFDQSxJQUFBLEVBQU0sU0FETjtR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OztJQURTLENBekZYO0lBOEZBLE1BQUEsRUFBUSxTQUFBO01BQ04sSUFBQyxDQUFBLE9BQUQsR0FBVyxDQUFJLElBQUMsQ0FBQTthQUNoQixJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBZ0IsSUFBQyxDQUFBLE9BQWpCO0lBRk0sQ0E5RlI7SUFrR0EsZUFBQSxFQUFpQixTQUFBO2FBQ2YsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULENBQUE7SUFEZSxDQWxHakI7O0FBVkYiLCJzb3VyY2VzQ29udGVudCI6WyIkID0gcmVxdWlyZSAnanF1ZXJ5J1xuTmF2VmlldyA9IHJlcXVpcmUgJy4vbmF2LXZpZXcnXG5QYXJzZXIgPSByZXF1aXJlICcuL25hdi1wYXJzZXInXG5cbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG57Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgbmF2VmlldzogbnVsbFxuICBwYXJzZXI6IG51bGxcbiAgc3Vic2NyaXB0aW9uczogbnVsbFxuXG4gIGNvbmZpZzpcbiAgICBjb2xsYXBzZWRHcm91cHM6XG4gICAgICB0aXRsZTogJ0dyb3VwcyB0aGF0IGFyZSBpbml0aWFsbHkgY29sbGFwc2VkJ1xuICAgICAgZGVzY3JpcHRpb246ICdMaXN0IGdyb3VwcyBzZXBhcmF0ZWQgYnkgY29tbWEgKGUuZy4gVmFyaWFibGUpICdcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnVmFyaWFibGUnXG4gICAgaWdub3JlZEdyb3VwczpcbiAgICAgIHRpdGxlOiAnR3JvdXBzIHRoYXQgYXJlIGlnbm9yZWQnXG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZXNlIGdyb3VwcyB3aWxsIG5vdCBiZSBkaXNwbGF5ZWQgYXQgYWxsJ1xuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICcnXG4gICAgdG9wR3JvdXBzOlxuICAgICAgdGl0bGU6ICdHcm91cHMgYXQgdG9wJ1xuICAgICAgZGVzY3JpcHRpb246ICdHcm91cHMgdGhhdCBhcmUgZGlzcGxheWVkIGF0IHRoZSB0b3AsIGlycmVzcGVjdGl2ZSBvZiBzb3J0aW5nJ1xuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICdCb29rbWFya3MsIFRvZG8nXG4gICAgbm9EdXBzOlxuICAgICAgdGl0bGU6ICdObyBEdXBsaWNhdGVzJ1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgbGVmdFBhbmVsOlxuICAgICAgdGl0bGU6ICdTaG91bGQgcGFuZWwgYmUgb24gdGhlIGxlZnQnXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG5cblxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgIEBlbmFibGVkID0gIShzdGF0ZS5lbmFibGVkID09IGZhbHNlKVxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuICAgIHNldHRpbmdzID0gYXRvbS5jb25maWcuZ2V0QWxsKCduYXYtcGFuZWwtcGx1cycpWzBdLnZhbHVlXG4gICAgc2V0dGluZ3MubGVmdFBhbmVsID0gaWYgc2V0dGluZ3MubGVmdFBhbmVsIHRoZW4gJ2xlZnQnIGVsc2UgJ3JpZ2h0J1xuXG4gICAgQHBhcnNlciA9IG5ldyBQYXJzZXIoKVxuICAgIEBuYXZWaWV3ID0gbmV3IE5hdlZpZXcoc3RhdGUsIHNldHRpbmdzLCBAcGFyc2VyKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICduYXYtcGFuZWwtcGx1cycsIChldmVudCkgPT5cbiAgICAgIHNldHRpbmdzID0gZXZlbnQubmV3VmFsdWVcbiAgICAgIGZvciBrZXksIHZhbHVlIGluIHNldHRpbmdzXG4gICAgICAgIGlmIGtleS5pbmRleE9mKCdHcm91cHMnKSA+IDBcbiAgICAgICAgICBzZXR0aW5nc1trZXldID0gdmFsdWUuc3BsaXQoJywnKVxuICAgICAgc2V0dGluZ3MubGVmdFBhbmVsID0gaWYgc2V0dGluZ3MubGVmdFBhbmVsIHRoZW4gJ2xlZnQnIGVsc2UgJ3JpZ2h0J1xuICAgICAgQG5hdlZpZXcuY2hhbmdlU2V0dGluZ3Moc2V0dGluZ3MpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJ1xuICAgICAgLCAnbmF2LXBhbmVsLXBsdXM6dG9nZ2xlJzogPT4gQHRvZ2dsZSgpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJ1xuICAgICAgLCAnbmF2LXBhbmVsLXBsdXM6Y2hhbmdlU2lkZSc6ID0+IEBjaGFuZ2VQYW5lbFNpZGUoKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20ud29ya3NwYWNlLm9uRGlkU3RvcENoYW5naW5nQWN0aXZlUGFuZUl0ZW0gKHBhbmVJdGVtKT0+XG4gICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIHJldHVybiBAbmF2Vmlldy5oaWRlKCkgdW5sZXNzIGVkaXRvclxuICAgICAgcmV0dXJuIGlmIGVkaXRvciAhPSBwYW5lSXRlbVxuICAgICAgZWRpdG9yRmlsZSA9IGVkaXRvci5nZXRQYXRoKCkgIyB1bmRlZmluZWQgZm9yIG5ldyBmaWxlXG4gICAgICBAbmF2Vmlldy5zZXRGaWxlKGVkaXRvckZpbGUpXG4gICAgICAjIFBhbmVsIGFsc28gbmVlZHMgdG8gYmUgdXBkYXRlZCB3aGVuIHRleHQgc2F2ZWRcbiAgICAgIHJldHVybiB1bmxlc3MgZWRpdG9yIGFuZCBlZGl0b3Iub25EaWRTYXZlXG4gICAgICBpZiAhZWRpdG9yLnppT25FZGl0b3JTYXZlXG4gICAgICAgIGVkaXRvci56aU9uRWRpdG9yU2F2ZSA9IGVkaXRvci5vbkRpZFNhdmUgKGV2ZW50KSA9PlxuICAgICAgICAgIHJldHVybiB1bmxlc3MgQGVuYWJsZWRcbiAgICAgICAgICAjIFdpdGggYXV0b3NhdmUsIHRoaXMgZ2V0cyBjYWxsZWQgYmVmb3JlIG9uQ2xpY2suXG4gICAgICAgICAgIyBXZSB3YW50IGNsaWNrIHRvIGJlIGhhbmRsZWQgZmlyc3RcbiAgICAgICAgICAjIHNldEltbWVkaWF0ZSBkaWRuJ3Qgd29yay5cbiAgICAgICAgICBzZXRUaW1lb3V0ID0+XG4gICAgICAgICAgICBlZGl0b3JGaWxlID0gZWRpdG9yLmdldFBhdGgoKVxuICAgICAgICAgICAgQG5hdlZpZXcudXBkYXRlRmlsZShlZGl0b3JGaWxlKSBpZiBlZGl0b3JGaWxlXG4gICAgICAgICAgLCAyMDBcbiAgICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGVkaXRvci56aU9uRWRpdG9yU2F2ZVxuXG4gICAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBlZGl0b3Iub25EaWREZXN0cm95ID0+XG4gICAgICAgICAgQG5hdlZpZXcuY2xvc2VGaWxlKGVkaXRvckZpbGUpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS53b3Jrc3BhY2Uub25XaWxsRGVzdHJveVBhbmVJdGVtIChldmVudCk9PlxuICAgICAgaWYgZXZlbnQuaXRlbS56aU9uRWRpdG9yU2F2ZVxuICAgICAgICBAbmF2Vmlldy5zYXZlRmlsZVN0YXRlKGV2ZW50Lml0ZW0uZ2V0UGF0aCgpKVxuXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAbmF2Vmlldy5kZXN0cm95KClcbiAgICBAcGFyc2VyLmRlc3Ryb3koKVxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEBuYXZWaWV3ID0gbnVsbFxuXG5cbiAgc2VyaWFsaXplOiAtPlxuICAgIGVuYWJsZWQ6IEBlbmFibGVkXG4gICAgZmlsZVN0YXRlczogQG5hdlZpZXcuZ2V0U3RhdGUoKVxuXG5cbiAgdG9nZ2xlOiAtPlxuICAgIEBlbmFibGVkID0gbm90IEBlbmFibGVkXG4gICAgQG5hdlZpZXcuZW5hYmxlKEBlbmFibGVkKVxuXG4gIGNoYW5nZVBhbmVsU2lkZTogLT5cbiAgICBAbmF2Vmlldy5tb3ZlUGFuZWwoKVxuIl19
