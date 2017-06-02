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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL25hdi1wYW5lbC1wbHVzL2xpYi9uYXYtcGFuZWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7O0VBQ0osT0FBQSxHQUFVLE9BQUEsQ0FBUSxZQUFSOztFQUNWLE1BQUEsR0FBUyxPQUFBLENBQVEsY0FBUjs7RUFFVCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRU4sc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUd4QixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsT0FBQSxFQUFTLElBQVQ7SUFDQSxNQUFBLEVBQVEsSUFEUjtJQUVBLGFBQUEsRUFBZSxJQUZmO0lBSUEsTUFBQSxFQUNFO01BQUEsZUFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLHFDQUFQO1FBQ0EsV0FBQSxFQUFhLGlEQURiO1FBRUEsSUFBQSxFQUFNLFFBRk47UUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFVBSFQ7T0FERjtNQUtBLGFBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyx5QkFBUDtRQUNBLFdBQUEsRUFBYSwyQ0FEYjtRQUVBLElBQUEsRUFBTSxRQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQUhUO09BTkY7TUFVQSxTQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sZUFBUDtRQUNBLFdBQUEsRUFBYSwrREFEYjtRQUVBLElBQUEsRUFBTSxRQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxpQkFIVDtPQVhGO01BZUEsTUFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLGVBQVA7UUFDQSxJQUFBLEVBQU0sU0FETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFGVDtPQWhCRjtNQW1CQSxTQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sNkJBQVA7UUFDQSxJQUFBLEVBQU0sU0FETjtR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SUFEUyxDQXpGWDtJQThGQSxNQUFBLEVBQVEsU0FBQTtNQUNOLElBQUMsQ0FBQSxPQUFELEdBQVcsQ0FBSSxJQUFDLENBQUE7YUFDaEIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQWdCLElBQUMsQ0FBQSxPQUFqQjtJQUZNLENBOUZSO0lBa0dBLGVBQUEsRUFBaUIsU0FBQTthQUNmLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxDQUFBO0lBRGUsQ0FsR2pCOztBQVZGIiwic291cmNlc0NvbnRlbnQiOlsiJCA9IHJlcXVpcmUgJ2pxdWVyeSdcbk5hdlZpZXcgPSByZXF1aXJlICcuL25hdi12aWV3J1xuUGFyc2VyID0gcmVxdWlyZSAnLi9uYXYtcGFyc2VyJ1xuXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcblxue0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIG5hdlZpZXc6IG51bGxcbiAgcGFyc2VyOiBudWxsXG4gIHN1YnNjcmlwdGlvbnM6IG51bGxcblxuICBjb25maWc6XG4gICAgY29sbGFwc2VkR3JvdXBzOlxuICAgICAgdGl0bGU6ICdHcm91cHMgdGhhdCBhcmUgaW5pdGlhbGx5IGNvbGxhcHNlZCdcbiAgICAgIGRlc2NyaXB0aW9uOiAnTGlzdCBncm91cHMgc2VwYXJhdGVkIGJ5IGNvbW1hIChlLmcuIFZhcmlhYmxlKSAnXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJ1ZhcmlhYmxlJ1xuICAgIGlnbm9yZWRHcm91cHM6XG4gICAgICB0aXRsZTogJ0dyb3VwcyB0aGF0IGFyZSBpZ25vcmVkJ1xuICAgICAgZGVzY3JpcHRpb246ICdUaGVzZSBncm91cHMgd2lsbCBub3QgYmUgZGlzcGxheWVkIGF0IGFsbCdcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnJ1xuICAgIHRvcEdyb3VwczpcbiAgICAgIHRpdGxlOiAnR3JvdXBzIGF0IHRvcCdcbiAgICAgIGRlc2NyaXB0aW9uOiAnR3JvdXBzIHRoYXQgYXJlIGRpc3BsYXllZCBhdCB0aGUgdG9wLCBpcnJlc3BlY3RpdmUgb2Ygc29ydGluZydcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnQm9va21hcmtzLCBUb2RvJ1xuICAgIG5vRHVwczpcbiAgICAgIHRpdGxlOiAnTm8gRHVwbGljYXRlcydcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIGxlZnRQYW5lbDpcbiAgICAgIHRpdGxlOiAnU2hvdWxkIHBhbmVsIGJlIG9uIHRoZSBsZWZ0J1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBAZW5hYmxlZCA9ICEoc3RhdGUuZW5hYmxlZCA9PSBmYWxzZSlcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICBzZXR0aW5ncyA9IGF0b20uY29uZmlnLmdldEFsbCgnbmF2LXBhbmVsLXBsdXMnKVswXS52YWx1ZVxuICAgIHNldHRpbmdzLmxlZnRQYW5lbCA9IGlmIHNldHRpbmdzLmxlZnRQYW5lbCB0aGVuICdsZWZ0JyBlbHNlICdyaWdodCdcblxuICAgIEBwYXJzZXIgPSBuZXcgUGFyc2VyKClcbiAgICBAbmF2VmlldyA9IG5ldyBOYXZWaWV3KHN0YXRlLCBzZXR0aW5ncywgQHBhcnNlcilcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnbmF2LXBhbmVsLXBsdXMnLCAoZXZlbnQpID0+XG4gICAgICBzZXR0aW5ncyA9IGV2ZW50Lm5ld1ZhbHVlXG4gICAgICBmb3Iga2V5LCB2YWx1ZSBpbiBzZXR0aW5nc1xuICAgICAgICBpZiBrZXkuaW5kZXhPZignR3JvdXBzJykgPiAwXG4gICAgICAgICAgc2V0dGluZ3Nba2V5XSA9IHZhbHVlLnNwbGl0KCcsJylcbiAgICAgIHNldHRpbmdzLmxlZnRQYW5lbCA9IGlmIHNldHRpbmdzLmxlZnRQYW5lbCB0aGVuICdsZWZ0JyBlbHNlICdyaWdodCdcbiAgICAgIEBuYXZWaWV3LmNoYW5nZVNldHRpbmdzKHNldHRpbmdzKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZSdcbiAgICAgICwgJ25hdi1wYW5lbC1wbHVzOnRvZ2dsZSc6ID0+IEB0b2dnbGUoKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZSdcbiAgICAgICwgJ25hdi1wYW5lbC1wbHVzOmNoYW5nZVNpZGUnOiA9PiBAY2hhbmdlUGFuZWxTaWRlKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLndvcmtzcGFjZS5vbkRpZFN0b3BDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtIChwYW5lSXRlbSk9PlxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICByZXR1cm4gQG5hdlZpZXcuaGlkZSgpIHVubGVzcyBlZGl0b3JcbiAgICAgIHJldHVybiBpZiBlZGl0b3IgIT0gcGFuZUl0ZW1cbiAgICAgIGVkaXRvckZpbGUgPSBlZGl0b3IuZ2V0UGF0aCgpICMgdW5kZWZpbmVkIGZvciBuZXcgZmlsZVxuICAgICAgQG5hdlZpZXcuc2V0RmlsZShlZGl0b3JGaWxlKVxuICAgICAgIyBQYW5lbCBhbHNvIG5lZWRzIHRvIGJlIHVwZGF0ZWQgd2hlbiB0ZXh0IHNhdmVkXG4gICAgICByZXR1cm4gdW5sZXNzIGVkaXRvciBhbmQgZWRpdG9yLm9uRGlkU2F2ZVxuICAgICAgaWYgIWVkaXRvci56aU9uRWRpdG9yU2F2ZVxuICAgICAgICBlZGl0b3IuemlPbkVkaXRvclNhdmUgPSBlZGl0b3Iub25EaWRTYXZlIChldmVudCkgPT5cbiAgICAgICAgICByZXR1cm4gdW5sZXNzIEBlbmFibGVkXG4gICAgICAgICAgIyBXaXRoIGF1dG9zYXZlLCB0aGlzIGdldHMgY2FsbGVkIGJlZm9yZSBvbkNsaWNrLlxuICAgICAgICAgICMgV2Ugd2FudCBjbGljayB0byBiZSBoYW5kbGVkIGZpcnN0XG4gICAgICAgICAgIyBzZXRJbW1lZGlhdGUgZGlkbid0IHdvcmsuXG4gICAgICAgICAgc2V0VGltZW91dCA9PlxuICAgICAgICAgICAgZWRpdG9yRmlsZSA9IGVkaXRvci5nZXRQYXRoKClcbiAgICAgICAgICAgIEBuYXZWaWV3LnVwZGF0ZUZpbGUoZWRpdG9yRmlsZSkgaWYgZWRpdG9yRmlsZVxuICAgICAgICAgICwgMjAwXG4gICAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBlZGl0b3IuemlPbkVkaXRvclNhdmVcblxuICAgICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9yLm9uRGlkRGVzdHJveSA9PlxuICAgICAgICAgIEBuYXZWaWV3LmNsb3NlRmlsZShlZGl0b3JGaWxlKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20ud29ya3NwYWNlLm9uV2lsbERlc3Ryb3lQYW5lSXRlbSAoZXZlbnQpPT5cbiAgICAgIGlmIGV2ZW50Lml0ZW0uemlPbkVkaXRvclNhdmVcbiAgICAgICAgQG5hdlZpZXcuc2F2ZUZpbGVTdGF0ZShldmVudC5pdGVtLmdldFBhdGgoKSlcblxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQG5hdlZpZXcuZGVzdHJveSgpXG4gICAgQHBhcnNlci5kZXN0cm95KClcbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBAbmF2VmlldyA9IG51bGxcblxuXG4gIHNlcmlhbGl6ZTogLT5cbiAgICBlbmFibGVkOiBAZW5hYmxlZFxuICAgIGZpbGVTdGF0ZXM6IEBuYXZWaWV3LmdldFN0YXRlKClcblxuXG4gIHRvZ2dsZTogLT5cbiAgICBAZW5hYmxlZCA9IG5vdCBAZW5hYmxlZFxuICAgIEBuYXZWaWV3LmVuYWJsZShAZW5hYmxlZClcblxuICBjaGFuZ2VQYW5lbFNpZGU6IC0+XG4gICAgQG5hdlZpZXcubW92ZVBhbmVsKClcbiJdfQ==
