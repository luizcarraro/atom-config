(function() {
  var ActionSelectListView, GistListView, Promise, fs, match, mkdirAsync, path, shell, showError, unlinkAsync, writeFileAsync,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  path = require('path');

  shell = require('shell');

  fs = require('fs');

  Promise = require('bluebird');

  match = require('fuzzaldrin').match;

  mkdirAsync = Promise.promisify(require('temp').mkdir);

  writeFileAsync = Promise.promisify(fs.writeFile);

  unlinkAsync = Promise.promisify(fs.unlink);

  ActionSelectListView = require('@aki77/atom-select-action');

  showError = require('./helper').showError;

  module.exports = GistListView = (function(superClass) {
    var allowedTypes;

    extend(GistListView, superClass);

    allowedTypes = ['text', 'application'];

    GistListView.prototype.client = null;

    function GistListView(client) {
      this.client = client;
      this.showError = bind(this.showError, this);
      this.edit = bind(this.edit, this);
      this["delete"] = bind(this["delete"], this);
      this.insert = bind(this.insert, this);
      this.getItems = bind(this.getItems, this);
      GistListView.__super__.constructor.call(this, {
        items: this.getItems,
        filterKey: ['title', 'description'],
        actions: [
          {
            name: 'Insert',
            callback: this.insert
          }, {
            name: 'Edit',
            callback: this.edit
          }, {
            name: 'Delete',
            callback: this["delete"]
          }, {
            name: 'Open Browser',
            callback: this.openBrowser
          }
        ]
      });
    }

    GistListView.prototype.getItems = function() {
      return this.client.list().then(function(gists) {
        return gists.map(function(arg) {
          var description, files, html_url, id, ref;
          id = arg.id, description = arg.description, files = arg.files, html_url = arg.html_url;
          return {
            id: id,
            description: description,
            files: files,
            html_url: html_url,
            title: (ref = Object.keys(files)[0]) != null ? ref : "gist:" + id
          };
        });
      })["catch"](this.showError);
    };

    GistListView.prototype.contentForItem = function(gist, filterQuery, filterKey) {
      var description, matches, title;
      matches = match(gist[filterKey], filterQuery);
      title = gist.title, description = gist.description;
      if (description == null) {
        description = '';
      }
      return function(arg) {
        var highlighter;
        highlighter = arg.highlighter;
        return this.li({
          "class": 'two-lines'
        }, (function(_this) {
          return function() {
            _this.div({
              "class": 'primary-line'
            }, function() {
              return highlighter(title, matches, 0);
            });
            return _this.div({
              "class": 'secondary-line'
            }, function() {
              return highlighter(description, matches, title.length);
            });
          };
        })(this));
      };
    };

    GistListView.prototype.insert = function(arg) {
      var id;
      id = arg.id;
      return this.client.get(id).then(function(arg1) {
        var content, editor, filename, files, ref, ref1, results, type;
        files = arg1.files;
        editor = atom.workspace.getActiveTextEditor();
        if (!editor) {
          return;
        }
        results = [];
        for (filename in files) {
          ref = files[filename], content = ref.content, type = ref.type;
          if (ref1 = type.split('/')[0], indexOf.call(allowedTypes, ref1) >= 0) {
            results.push(editor.insertText(content));
          } else {
            results.push(void 0);
          }
        }
        return results;
      })["catch"](this.showError);
    };

    GistListView.prototype["delete"] = function(arg) {
      var id;
      id = arg.id;
      return this.client["delete"](id).then(function() {
        return atom.notifications.addSuccess('Gist deleted');
      })["catch"](this.showError);
    };

    GistListView.prototype.edit = function(arg) {
      var id;
      id = arg.id;
      return Promise.all([mkdirAsync('atom-gist'), this.client.get(id)]).then(function(arg1) {
        var diaPath, files, promiseArray, ref;
        diaPath = arg1[0], (ref = arg1[1], files = ref.files);
        promiseArray = Object.keys(files).map(function(filename) {
          var filePath;
          filePath = path.join(diaPath, filename);
          return writeFileAsync(filePath, files[filename].content).then(function() {
            return filePath;
          });
        });
        return Promise.all(promiseArray);
      }).then(function(filePaths) {
        var filePath, promiseArray;
        promiseArray = (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = filePaths.length; i < len; i++) {
            filePath = filePaths[i];
            results.push(atom.workspace.open(filePath).then(function(editor) {
              if (atom.config.get('tabs.usePreviewTabs')) {
                editor.save();
              }
              return editor;
            }));
          }
          return results;
        })();
        return Promise.all(promiseArray);
      }).then((function(_this) {
        return function(editors) {
          return editors.forEach(function(editor) {
            editor.onDidSave(function() {
              return _this.completeEdit(id, editor);
            });
            return editor.onDidDestroy(function() {
              return _this.cleanupGistFile(editor);
            });
          });
        };
      })(this))["catch"](this.showError);
    };

    GistListView.prototype.openBrowser = function(arg) {
      var html_url;
      html_url = arg.html_url;
      return shell.openExternal(html_url);
    };

    GistListView.prototype.completeEdit = function(id, editor) {
      var content, filename, files, message;
      filename = path.basename(editor.getPath());
      content = editor.getText().trim();
      files = {};
      if (content.length > 0) {
        files[filename] = {
          content: content
        };
        message = 'Gist updated';
      } else {
        files[filename] = null;
        message = 'Gist file deleted';
      }
      return this.client.edit(id, {
        files: files
      }).then(function(gist) {
        return atom.notifications.addSuccess(message);
      })["finally"](function() {
        var ref;
        if (atom.config.get('gist.closeOnSave')) {
          return (ref = atom.workspace.paneForItem(editor)) != null ? ref.destroyItem(editor) : void 0;
        }
      });
    };

    GistListView.prototype.cleanupGistFile = function(editor) {
      return unlinkAsync(editor.getPath())["catch"](this.showError);
    };

    GistListView.prototype.showError = function(error) {
      this.hide();
      return showError(error);
    };

    return GistListView;

  })(ActionSelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpc3QvbGliL2dpc3QtbGlzdC12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsdUhBQUE7SUFBQTs7Ozs7RUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSOztFQUNSLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxPQUFBLEdBQVUsT0FBQSxDQUFRLFVBQVI7O0VBQ1QsUUFBUyxPQUFBLENBQVEsWUFBUjs7RUFDVixVQUFBLEdBQWEsT0FBTyxDQUFDLFNBQVIsQ0FBa0IsT0FBQSxDQUFRLE1BQVIsQ0FBZSxDQUFDLEtBQWxDOztFQUNiLGNBQUEsR0FBaUIsT0FBTyxDQUFDLFNBQVIsQ0FBa0IsRUFBRSxDQUFDLFNBQXJCOztFQUNqQixXQUFBLEdBQWMsT0FBTyxDQUFDLFNBQVIsQ0FBa0IsRUFBRSxDQUFDLE1BQXJCOztFQUNkLG9CQUFBLEdBQXVCLE9BQUEsQ0FBUSwyQkFBUjs7RUFDdEIsWUFBYSxPQUFBLENBQVEsVUFBUjs7RUFFZCxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osUUFBQTs7OztJQUFBLFlBQUEsR0FBZSxDQUFDLE1BQUQsRUFBUyxhQUFUOzsyQkFDZixNQUFBLEdBQVE7O0lBRUssc0JBQUMsTUFBRDtNQUFDLElBQUMsQ0FBQSxTQUFEOzs7Ozs7TUFDWiw4Q0FBTTtRQUNKLEtBQUEsRUFBTyxJQUFDLENBQUEsUUFESjtRQUVKLFNBQUEsRUFBVyxDQUFDLE9BQUQsRUFBVSxhQUFWLENBRlA7UUFHSixPQUFBLEVBQVM7VUFDUDtZQUNFLElBQUEsRUFBTSxRQURSO1lBRUUsUUFBQSxFQUFVLElBQUMsQ0FBQSxNQUZiO1dBRE8sRUFLUDtZQUNFLElBQUEsRUFBTSxNQURSO1lBRUUsUUFBQSxFQUFVLElBQUMsQ0FBQSxJQUZi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TUFBaEQsV0FERjs7TUFEUyxDQUZYO0lBWlk7OzJCQW1CZCxlQUFBLEdBQWlCLFNBQUMsTUFBRDthQUNmLFdBQUEsQ0FBWSxNQUFNLENBQUMsT0FBUCxDQUFBLENBQVosQ0FBNkIsRUFBQyxLQUFELEVBQTdCLENBQW9DLElBQUMsQ0FBQSxTQUFyQztJQURlOzsyQkFHakIsU0FBQSxHQUFXLFNBQUMsS0FBRDtNQUNULElBQUMsQ0FBQSxJQUFELENBQUE7YUFDQSxTQUFBLENBQVUsS0FBVjtJQUZTOzs7O0tBckhjO0FBWjNCIiwic291cmNlc0NvbnRlbnQiOlsicGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5zaGVsbCA9IHJlcXVpcmUgJ3NoZWxsJ1xuZnMgPSByZXF1aXJlICdmcydcblByb21pc2UgPSByZXF1aXJlICdibHVlYmlyZCdcbnttYXRjaH0gPSByZXF1aXJlICdmdXp6YWxkcmluJ1xubWtkaXJBc3luYyA9IFByb21pc2UucHJvbWlzaWZ5KHJlcXVpcmUoJ3RlbXAnKS5ta2RpcilcbndyaXRlRmlsZUFzeW5jID0gUHJvbWlzZS5wcm9taXNpZnkoZnMud3JpdGVGaWxlKVxudW5saW5rQXN5bmMgPSBQcm9taXNlLnByb21pc2lmeShmcy51bmxpbmspXG5BY3Rpb25TZWxlY3RMaXN0VmlldyA9IHJlcXVpcmUgJ0Bha2k3Ny9hdG9tLXNlbGVjdC1hY3Rpb24nXG57c2hvd0Vycm9yfSA9IHJlcXVpcmUgJy4vaGVscGVyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBHaXN0TGlzdFZpZXcgZXh0ZW5kcyBBY3Rpb25TZWxlY3RMaXN0Vmlld1xuICBhbGxvd2VkVHlwZXMgPSBbJ3RleHQnLCAnYXBwbGljYXRpb24nXVxuICBjbGllbnQ6IG51bGxcblxuICBjb25zdHJ1Y3RvcjogKEBjbGllbnQpIC0+XG4gICAgc3VwZXIoe1xuICAgICAgaXRlbXM6IEBnZXRJdGVtc1xuICAgICAgZmlsdGVyS2V5OiBbJ3RpdGxlJywgJ2Rlc2NyaXB0aW9uJ11cbiAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdJbnNlcnQnXG4gICAgICAgICAgY2FsbGJhY2s6IEBpbnNlcnRcbiAgICAgICAgfVxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0VkaXQnXG4gICAgICAgICAgY2FsbGJhY2s6IEBlZGl0XG4gICAgICAgIH1cbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdEZWxldGUnXG4gICAgICAgICAgY2FsbGJhY2s6IEBkZWxldGVcbiAgICAgICAgfVxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ09wZW4gQnJvd3NlcidcbiAgICAgICAgICBjYWxsYmFjazogQG9wZW5Ccm93c2VyXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9KVxuXG4gIGdldEl0ZW1zOiA9PlxuICAgIEBjbGllbnQubGlzdCgpLnRoZW4oKGdpc3RzKSAtPlxuICAgICAgZ2lzdHMubWFwKCh7aWQsIGRlc2NyaXB0aW9uLCBmaWxlcywgaHRtbF91cmx9KSAtPlxuICAgICAgICB7XG4gICAgICAgICAgaWQsIGRlc2NyaXB0aW9uLCBmaWxlcywgaHRtbF91cmwsXG4gICAgICAgICAgdGl0bGU6IE9iamVjdC5rZXlzKGZpbGVzKVswXSA/IFwiZ2lzdDoje2lkfVwiXG4gICAgICAgIH1cbiAgICAgIClcbiAgICApLmNhdGNoKEBzaG93RXJyb3IpXG5cbiAgY29udGVudEZvckl0ZW06IChnaXN0LCBmaWx0ZXJRdWVyeSwgZmlsdGVyS2V5KSAtPlxuICAgIG1hdGNoZXMgPSBtYXRjaChnaXN0W2ZpbHRlcktleV0sIGZpbHRlclF1ZXJ5KVxuICAgIHt0aXRsZSwgZGVzY3JpcHRpb259ID0gZ2lzdFxuICAgIGRlc2NyaXB0aW9uID89ICcnXG5cbiAgICAoe2hpZ2hsaWdodGVyfSkgLT5cbiAgICAgIEBsaSBjbGFzczogJ3R3by1saW5lcycsID0+XG4gICAgICAgIEBkaXYgY2xhc3M6ICdwcmltYXJ5LWxpbmUnLCAtPlxuICAgICAgICAgIGhpZ2hsaWdodGVyKHRpdGxlLCBtYXRjaGVzLCAwKVxuICAgICAgICBAZGl2IGNsYXNzOiAnc2Vjb25kYXJ5LWxpbmUnLCAtPlxuICAgICAgICAgIGhpZ2hsaWdodGVyKGRlc2NyaXB0aW9uLCBtYXRjaGVzLCB0aXRsZS5sZW5ndGgpXG5cbiAgaW5zZXJ0OiAoe2lkfSkgPT5cbiAgICBAY2xpZW50LmdldChpZCkudGhlbigoe2ZpbGVzfSkgLT5cbiAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgcmV0dXJuIHVubGVzcyBlZGl0b3JcblxuICAgICAgZm9yIGZpbGVuYW1lLCB7Y29udGVudCwgdHlwZX0gb2YgZmlsZXNcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoY29udGVudCkgaWYgdHlwZS5zcGxpdCgnLycpWzBdIGluIGFsbG93ZWRUeXBlc1xuICAgICkuY2F0Y2goQHNob3dFcnJvcilcblxuICBkZWxldGU6ICh7aWR9KSA9PlxuICAgIEBjbGllbnQuZGVsZXRlKGlkKS50aGVuKCAtPlxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MoJ0dpc3QgZGVsZXRlZCcpXG4gICAgKS5jYXRjaChAc2hvd0Vycm9yKVxuXG4gIGVkaXQ6ICh7aWR9KSA9PlxuICAgIFByb21pc2UuYWxsKFtta2RpckFzeW5jKCdhdG9tLWdpc3QnKSwgQGNsaWVudC5nZXQoaWQpXSkudGhlbigoW2RpYVBhdGgsIHtmaWxlc31dKSAtPlxuICAgICAgcHJvbWlzZUFycmF5ID0gT2JqZWN0LmtleXMoZmlsZXMpLm1hcCgoZmlsZW5hbWUpIC0+XG4gICAgICAgIGZpbGVQYXRoID0gcGF0aC5qb2luKGRpYVBhdGgsIGZpbGVuYW1lKVxuICAgICAgICB3cml0ZUZpbGVBc3luYyhmaWxlUGF0aCwgZmlsZXNbZmlsZW5hbWVdLmNvbnRlbnQpLnRoZW4oIC0+XG4gICAgICAgICAgZmlsZVBhdGhcbiAgICAgICAgKVxuICAgICAgKVxuICAgICAgUHJvbWlzZS5hbGwocHJvbWlzZUFycmF5KVxuICAgICkudGhlbigoZmlsZVBhdGhzKSAtPlxuICAgICAgcHJvbWlzZUFycmF5ID0gZm9yIGZpbGVQYXRoIGluIGZpbGVQYXRoc1xuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGVQYXRoKS50aGVuKChlZGl0b3IpIC0+XG4gICAgICAgICAgIyBjbGVhciBwcmV2aWV3IHRhYlxuICAgICAgICAgIGVkaXRvci5zYXZlKCkgaWYgYXRvbS5jb25maWcuZ2V0KCd0YWJzLnVzZVByZXZpZXdUYWJzJylcbiAgICAgICAgICBlZGl0b3JcbiAgICAgICAgKVxuICAgICAgUHJvbWlzZS5hbGwocHJvbWlzZUFycmF5KVxuICAgICkudGhlbigoZWRpdG9ycykgPT5cbiAgICAgIGVkaXRvcnMuZm9yRWFjaCgoZWRpdG9yKSA9PlxuICAgICAgICBlZGl0b3Iub25EaWRTYXZlKCA9PlxuICAgICAgICAgIEBjb21wbGV0ZUVkaXQoaWQsIGVkaXRvcilcbiAgICAgICAgKVxuICAgICAgICBlZGl0b3Iub25EaWREZXN0cm95KCA9PlxuICAgICAgICAgIEBjbGVhbnVwR2lzdEZpbGUoZWRpdG9yKVxuICAgICAgICApXG4gICAgICApXG4gICAgKS5jYXRjaChAc2hvd0Vycm9yKVxuXG4gIG9wZW5Ccm93c2VyOiAoe2h0bWxfdXJsfSkgLT5cbiAgICBzaGVsbC5vcGVuRXh0ZXJuYWwoaHRtbF91cmwpXG5cbiAgY29tcGxldGVFZGl0OiAoaWQsIGVkaXRvcikgLT5cbiAgICBmaWxlbmFtZSA9IHBhdGguYmFzZW5hbWUoZWRpdG9yLmdldFBhdGgoKSlcbiAgICBjb250ZW50ID0gZWRpdG9yLmdldFRleHQoKS50cmltKClcblxuICAgIGZpbGVzID0ge31cbiAgICBpZiBjb250ZW50Lmxlbmd0aCA+IDBcbiAgICAgIGZpbGVzW2ZpbGVuYW1lXSA9IHtjb250ZW50fVxuICAgICAgbWVzc2FnZSA9ICdHaXN0IHVwZGF0ZWQnXG4gICAgZWxzZVxuICAgICAgZmlsZXNbZmlsZW5hbWVdID0gbnVsbFxuICAgICAgbWVzc2FnZSA9ICdHaXN0IGZpbGUgZGVsZXRlZCdcblxuICAgIEBjbGllbnQuZWRpdChpZCwge2ZpbGVzfSkudGhlbigoZ2lzdCkgLT5cbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKG1lc3NhZ2UpXG4gICAgKS5maW5hbGx5KCAtPlxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdnaXN0LmNsb3NlT25TYXZlJylcbiAgICAgICAgYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0oZWRpdG9yKT8uZGVzdHJveUl0ZW0oZWRpdG9yKVxuICAgIClcblxuICBjbGVhbnVwR2lzdEZpbGU6IChlZGl0b3IpIC0+XG4gICAgdW5saW5rQXN5bmMoZWRpdG9yLmdldFBhdGgoKSkuY2F0Y2goQHNob3dFcnJvcilcblxuICBzaG93RXJyb3I6IChlcnJvcikgPT5cbiAgICBAaGlkZSgpXG4gICAgc2hvd0Vycm9yKGVycm9yKVxuIl19
