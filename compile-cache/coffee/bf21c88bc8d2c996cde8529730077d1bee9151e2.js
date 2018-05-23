(function() {
  var $, QuickQueryBrowserView, ScrollView, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), ScrollView = ref.ScrollView, $ = ref.$;

  module.exports = QuickQueryBrowserView = (function(superClass) {
    extend(QuickQueryBrowserView, superClass);

    QuickQueryBrowserView.prototype.editor = null;

    QuickQueryBrowserView.prototype.connection = null;

    QuickQueryBrowserView.prototype.connections = [];

    QuickQueryBrowserView.prototype.selectedConnection = null;

    function QuickQueryBrowserView() {
      QuickQueryBrowserView.__super__.constructor.apply(this, arguments);
    }

    QuickQueryBrowserView.prototype.initialize = function() {
      if (!atom.config.get('quick-query.browserButtons')) {
        this.addClass('no-buttons');
      }
      atom.config.onDidChange('quick-query.browserButtons', (function(_this) {
        return function(arg) {
          var newValue, oldValue;
          newValue = arg.newValue, oldValue = arg.oldValue;
          return _this.toggleClass('no-buttons', !newValue);
        };
      })(this));
      this.find('#quick-query-new-connection').click((function(_this) {
        return function(e) {
          var workspaceElement;
          workspaceElement = atom.views.getView(atom.workspace);
          return atom.commands.dispatch(workspaceElement, 'quick-query:new-connection');
        };
      })(this));
      return this.find('#quick-query-run').click((function(_this) {
        return function(e) {
          var workspaceElement;
          workspaceElement = atom.views.getView(atom.workspace);
          return atom.commands.dispatch(workspaceElement, 'quick-query:run');
        };
      })(this));
    };

    QuickQueryBrowserView.prototype.getTitle = function() {
      return 'Databases';
    };

    QuickQueryBrowserView.prototype.serialize = function() {};

    QuickQueryBrowserView.content = function() {
      return this.div({
        "class": 'quick-query-browser tool-panel'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'btn-group',
            outlet: 'buttons'
          }, function() {
            _this.button({
              id: 'quick-query-run',
              "class": 'btn icon icon-playback-play',
              title: 'Run',
              style: 'width:50%'
            });
            return _this.button({
              id: 'quick-query-new-connection',
              "class": 'btn icon icon-plus',
              title: 'New connection',
              style: 'width:50%'
            });
          });
          return _this.ol({
            id: 'quick-query-connections',
            "class": 'list-tree has-collapsable-children focusable-panel',
            tabindex: -1,
            outlet: 'list'
          });
        };
      })(this));
    };

    QuickQueryBrowserView.prototype.destroy = function() {
      return this.element.remove();
    };

    QuickQueryBrowserView.prototype["delete"] = function() {
      var $li, connection, model;
      connection = null;
      $li = this.find('ol:focus li.selected');
      model = $li.data('item');
      if ($li.hasClass('quick-query-connection')) {
        return this.removeConnection(model);
      } else {
        return this.trigger('quickQuery.edit', ['drop', model]);
      }
    };

    QuickQueryBrowserView.prototype.removeConnection = function(connection) {
      var i;
      i = this.connections.indexOf(connection);
      this.connections.splice(i, 1);
      this.showConnections();
      return this.trigger('quickQuery.connectionDeleted', [connection]);
    };

    QuickQueryBrowserView.prototype.getURI = function() {
      return 'quick-query://browser';
    };

    QuickQueryBrowserView.prototype.getDefaultLocation = function() {
      if (atom.config.get('quick-query.showBrowserOnLeftSide')) {
        return 'left';
      } else {
        return 'right';
      }
    };

    QuickQueryBrowserView.prototype.getAllowedLocations = function() {
      return ['left', 'right'];
    };

    QuickQueryBrowserView.prototype.isPermanentDockItem = function() {
      return true;
    };

    QuickQueryBrowserView.prototype.setDefault = function() {
      var $li, model;
      $li = this.find('li.selected');
      if (!$li.hasClass('default')) {
        model = $li.data('item');
        return model.connection.setDefaultDatabase(model.name);
      }
    };

    QuickQueryBrowserView.prototype.moveUp = function() {
      var $li, $prev;
      $li = this.find('li.selected');
      $prev = $li.prev();
      while ($prev.hasClass('expanded') && $prev.find('>ol>li').length > 0) {
        $prev = $prev.find('>ol>li:last');
      }
      if ($prev.length === 0 && $li.parent().get(0) !== this.list[0]) {
        $prev = $li.parent().parent();
      }
      if ($prev.length) {
        $prev.addClass('selected');
        $li.removeClass('selected');
        return this.scrollToItem($prev);
      }
    };

    QuickQueryBrowserView.prototype.moveDown = function() {
      var $i, $li, $next;
      $i = $li = this.find('li.selected');
      if ($li.hasClass('expanded') && $li.find('>ol>li').length > 0) {
        $next = $li.find('>ol>li:first');
      } else {
        $next = $li.next();
      }
      while ($next.length === 0 && $i.length !== 0 && $i.parent().get(0) !== this.list[0]) {
        $i = $i.parent().parent();
        $next = $i.next();
      }
      if ($next.length) {
        $next.addClass('selected');
        $li.removeClass('selected');
        return this.scrollToItem($next);
      }
    };

    QuickQueryBrowserView.prototype.scrollToItem = function($li) {
      var bottom, height, list_height, scroll, top;
      list_height = this.list.outerHeight();
      height = $li.children('div').height();
      top = $li.position().top;
      bottom = top + height;
      scroll = this.list.scrollTop();
      if (bottom > list_height) {
        return this.list.scrollTop(scroll - list_height + bottom);
      } else if (top < 0) {
        return this.list.scrollTop(scroll + top);
      }
    };

    QuickQueryBrowserView.prototype.addConnection = function(connectionPromise, pos) {
      return connectionPromise.then((function(_this) {
        return function(connection) {
          _this.selectedConnection = connection;
          if (pos != null) {
            _this.connections.splice(pos, 0, connection);
          } else {
            _this.connections.push(connection);
          }
          _this.trigger('quickQuery.connectionSelected', [connection]);
          _this.showConnections();
          return connection.onDidChangeDefaultDatabase(function(database) {
            return _this.defaultDatabaseChanged(connection, database);
          });
        };
      })(this));
    };

    QuickQueryBrowserView.prototype.defaultDatabaseChanged = function(connection, database) {
      return this.list.children().each(function(i, e) {
        if ($(e).data('item') === connection) {
          $(e).find(".quick-query-database").removeClass('default');
          return $(e).find(".quick-query-database[data-name=\"" + database + "\"]").addClass('default');
        }
      });
    };

    QuickQueryBrowserView.prototype.newItem = function(item) {
      var div, icon, li;
      li = document.createElement('li');
      li.classList.add('entry');
      li.setAttribute('data-name', item.name);
      div = document.createElement('div');
      div.classList.add('header', 'list-item');
      li.appendChild(div);
      icon = document.createElement('span');
      icon.classList.add('icon');
      div.textContent = item.toString();
      div.insertBefore(icon, div.firstChild);
      this.setItemClasses(item, li, div, icon);
      return $(li);
    };

    QuickQueryBrowserView.prototype.showConnections = function() {
      var $li, $ol, connection, j, len, ref1, results;
      $ol = this.list;
      $ol.empty();
      ref1 = this.connections;
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        connection = ref1[j];
        $li = this.newItem(connection);
        $li.attr('data-protocol', connection.protocol);
        if (connection === this.selectedConnection) {
          $li.addClass('default');
        }
        $li.children('div').mousedown((function(_this) {
          return function(e) {
            $li = $(e.currentTarget).parent();
            $li.parent().find('li').removeClass('selected');
            $li.addClass('selected');
            $li.parent().find('li').removeClass('default');
            $li.addClass('default');
            if (e.which !== 3) {
              return _this.expandConnection($li);
            }
          };
        })(this));
        $li.data('item', connection);
        results.push($ol.append($li));
      }
      return results;
    };

    QuickQueryBrowserView.prototype.expandConnection = function($li, callback) {
      var connection;
      connection = $li.data('item');
      if (connection !== this.selectedConnection) {
        this.selectedConnection = connection;
        this.trigger('quickQuery.connectionSelected', [connection]);
      }
      return this.expandItem($li, callback);
    };

    QuickQueryBrowserView.prototype.showItems = function(parentItem, childrenItems, $e) {
      var $li, $ol, childItem, j, len, ol_class, results;
      ol_class = (function() {
        switch (parentItem.child_type) {
          case 'database':
            return "quick-query-databases";
          case 'schema':
            return "quick-query-schemas";
          case 'table':
            return "quick-query-tables";
          case 'column':
            return "quick-query-columns";
        }
      })();
      $ol = $e.find("ol." + ol_class);
      if ($ol.length === 0) {
        $ol = $('<ol/>').addClass('list-tree entries');
        if (parentItem.child_type !== 'column') {
          $ol.addClass("has-collapsable-children");
        }
        $ol.addClass(ol_class);
        $e.append($ol);
      } else {
        $ol.empty();
      }
      if (parentItem.child_type !== 'column') {
        childrenItems = childrenItems.sort(this.compareItemName);
      }
      results = [];
      for (j = 0, len = childrenItems.length; j < len; j++) {
        childItem = childrenItems[j];
        $li = this.newItem(childItem);
        $li.children('div').mousedown((function(_this) {
          return function(e) {
            $li = $(e.currentTarget).parent();
            _this.list.find('li').removeClass('selected');
            $li.addClass('selected');
            if (e.which !== 3) {
              return _this.expandItem($li);
            }
          };
        })(this));
        $li.data('item', childItem);
        results.push($ol.append($li));
      }
      return results;
    };

    QuickQueryBrowserView.prototype.setItemClasses = function(item, li, div, icon) {
      switch (item.type) {
        case 'connection':
          li.classList.add('quick-query-connection');
          div.classList.add("qq-connection-item");
          icon.classList.add('icon-plug');
          break;
        case 'database':
          li.classList.add('quick-query-database');
          div.classList.add("qq-database-item");
          icon.classList.add('icon-database');
          if (item.name === this.selectedConnection.getDefaultDatabase()) {
            li.classList.add('default');
          }
          break;
        case 'schema':
          li.classList.add('quick-query-schema');
          div.classList.add("qq-schema-item");
          icon.classList.add('icon-book');
          break;
        case 'table':
          li.classList.add('quick-query-table');
          div.classList.add("qq-table-item");
          icon.classList.add('icon-browser');
          break;
        case 'column':
          li.classList.add('quick-query-column');
          div.classList.add("qq-column-item");
          if (item.primary_key) {
            icon.classList.add('icon-key');
          } else {
            icon.classList.add('icon-tag');
          }
      }
      if (item.type !== 'column') {
        return li.classList.add('list-nested-item', 'collapsed');
      }
    };

    QuickQueryBrowserView.prototype.timeout = function(t, bk) {
      return setTimeout(bk, t);
    };

    QuickQueryBrowserView.prototype.expandSelected = function(callback) {
      var $li;
      $li = this.find('li.selected');
      return this.expandItem($li, callback);
    };

    QuickQueryBrowserView.prototype.expandItem = function($li, callback) {
      var $div, $icon, $loading, model, t100, t5000, time1;
      $li.toggleClass('collapsed expanded');
      if ($li.hasClass("expanded") && !$li.hasClass("busy")) {
        $li.addClass('busy');
        $div = $li.children('div');
        $div.children('.loading,.icon-stop').remove();
        $icon = $div.children('.icon');
        $loading = $('<span>').addClass("loading loading-spinner-tiny inline-block").hide();
        $div.prepend($loading);
        time1 = Date.now();
        t100 = this.timeout(100, (function(_this) {
          return function() {
            $icon.hide();
            return $loading.show();
          };
        })(this));
        t5000 = this.timeout(5000, (function(_this) {
          return function() {
            $li.removeClass('busy');
            return $loading.attr('class', 'icon icon-stop');
          };
        })(this));
        model = $li.data('item');
        return model.children((function(_this) {
          return function(children) {
            var time2;
            clearTimeout(t100);
            clearTimeout(t5000);
            time2 = Date.now();
            if (time2 - time1 < 5000) {
              $li.removeClass('busy');
              $loading.remove();
              $icon.css('display', '');
              _this.showItems(model, children, $li);
              if (callback) {
                return callback(children);
              }
            }
          };
        })(this));
      }
    };

    QuickQueryBrowserView.prototype.refreshTree = function(model) {
      var $li, selector;
      selector = (function() {
        switch (model.type) {
          case 'connection':
            return 'li.quick-query-connection';
          case 'database':
            return 'li.quick-query-database';
          case 'schema':
            return 'li.quick-query-schema';
          case 'table':
            return 'li.quick-query-table';
          default:
            return 'li';
        }
      })();
      $li = this.find(selector).filter(function(i, e) {
        return $(e).data('item') === model;
      });
      $li.removeClass('collapsed');
      $li.addClass('expanded');
      $li.find('ol').empty();
      return model.children((function(_this) {
        return function(children) {
          return _this.showItems(model, children, $li);
        };
      })(this));
    };

    QuickQueryBrowserView.prototype.expand = function(model, callback) {
      var parent;
      if (model.type === 'connection') {
        return this.list.children().each((function(_this) {
          return function(i, li) {
            if ($(li).data('item') === model) {
              $(li).removeClass('expanded').addClass('collapsed');
              return _this.expandConnection($(li), function() {
                if (callback) {
                  return callback($(li));
                }
              });
            }
          };
        })(this));
      } else {
        parent = model.parent();
        return this.expand(parent, (function(_this) {
          return function($li) {
            var $ol;
            $ol = $li.children("ol");
            return $ol.children().each(function(i, li) {
              var item;
              item = $(li).data('item');
              if (item && item.name === model.name && item.type === model.type) {
                return _this.expandItem($(li), function() {
                  if (callback) {
                    return callback($(li));
                  }
                });
              }
            });
          };
        })(this));
      }
    };

    QuickQueryBrowserView.prototype.reveal = function(model, callback) {
      return this.expand(model, (function(_this) {
        return function($li) {
          var bottom, top;
          $li.addClass('selected');
          top = $li.position().top;
          bottom = top + $li.outerHeight();
          if (bottom > _this.list.scrollBottom()) {
            _this.list.scrollBottom(bottom);
          }
          if (top < _this.list.scrollTop()) {
            _this.list.scrollTop(top);
          }
          if (callback) {
            return callback();
          }
        };
      })(this));
    };

    QuickQueryBrowserView.prototype.compareItemName = function(item1, item2) {
      if (item1.name < item2.name) {
        return -1;
      } else if (item1.name > item2.name) {
        return 1;
      } else {
        return 0;
      }
    };

    QuickQueryBrowserView.prototype.simpleSelect = function() {
      var $li, model;
      $li = this.find('li.selected.quick-query-table');
      if ($li.length > 0) {
        model = $li.data('item');
        return model.connection.getColumns(model, (function(_this) {
          return function(columns) {
            var text;
            text = model.connection.simpleSelect(model, columns);
            return atom.workspace.open().then(function(editor) {
              atom.textEditors.setGrammarOverride(editor, 'source.sql');
              return editor.insertText(text);
            });
          };
        })(this));
      }
    };

    QuickQueryBrowserView.prototype.copy = function() {
      var $header, $li;
      $li = this.find('li.selected');
      $header = $li.children('div.header');
      if ($header.length > 0) {
        return atom.clipboard.write($header.text());
      }
    };

    QuickQueryBrowserView.prototype.create = function() {
      var $li, model;
      $li = this.find('li.selected');
      if ($li.length > 0) {
        model = $li.data('item');
        return this.trigger('quickQuery.edit', ['create', model]);
      }
    };

    QuickQueryBrowserView.prototype.alter = function() {
      var $li, model;
      $li = this.find('li.selected');
      if ($li.length > 0) {
        model = $li.data('item');
        return this.trigger('quickQuery.edit', ['alter', model]);
      }
    };

    QuickQueryBrowserView.prototype.drop = function() {
      var $li, model;
      $li = this.find('li.selected');
      if ($li.length > 0) {
        model = $li.data('item');
        return this.trigger('quickQuery.edit', ['drop', model]);
      }
    };

    QuickQueryBrowserView.prototype.selectConnection = function(connection) {
      if (connection === this.selectedConnection) {
        return;
      }
      return this.list.children().each((function(_this) {
        return function(i, li) {
          if ($(li).data('item') === connection) {
            _this.list.children().removeClass('default');
            $(li).addClass('default');
            _this.selectedConnection = connection;
            return _this.trigger('quickQuery.connectionSelected', [connection]);
          }
        };
      })(this));
    };

    QuickQueryBrowserView.prototype.onConnectionSelected = function(callback) {
      return this.bind('quickQuery.connectionSelected', (function(_this) {
        return function(e, connection) {
          return callback(connection);
        };
      })(this));
    };

    QuickQueryBrowserView.prototype.onConnectionDeleted = function(callback) {
      return this.bind('quickQuery.connectionDeleted', (function(_this) {
        return function(e, connection) {
          return callback(connection);
        };
      })(this));
    };

    return QuickQueryBrowserView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL3F1aWNrLXF1ZXJ5L2xpYi9xdWljay1xdWVyeS1icm93c2VyLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx5Q0FBQTtJQUFBOzs7RUFBQSxNQUFrQixPQUFBLENBQVEsc0JBQVIsQ0FBbEIsRUFBQywyQkFBRCxFQUFhOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQ007OztvQ0FFSixNQUFBLEdBQVE7O29DQUNSLFVBQUEsR0FBWTs7b0NBQ1osV0FBQSxHQUFhOztvQ0FDYixrQkFBQSxHQUFvQjs7SUFFUCwrQkFBQTtNQUNYLHdEQUFBLFNBQUE7SUFEVzs7b0NBR2IsVUFBQSxHQUFZLFNBQUE7TUFDVixJQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDRCQUFoQixDQUFKO1FBQ0UsSUFBQyxDQUFBLFFBQUQsQ0FBVSxZQUFWLEVBREY7O01BRUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFaLENBQXdCLDRCQUF4QixFQUFzRCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsR0FBRDtBQUNwRCxjQUFBO1VBRHNELHlCQUFVO2lCQUNoRSxLQUFDLENBQUEsV0FBRCxDQUFhLFlBQWIsRUFBMEIsQ0FBQyxRQUEzQjtRQURvRDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEQ7TUFFQSxJQUFDLENBQUEsSUFBRCxDQUFNLDZCQUFOLENBQW9DLENBQUMsS0FBckMsQ0FBMkMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLENBQUQ7QUFDekMsY0FBQTtVQUFBLGdCQUFBLEdBQW1CLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFJLENBQUMsU0FBeEI7aUJBQ25CLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixnQkFBdkIsRUFBeUMsNEJBQXpDO1FBRnlDO01BQUEsQ0FB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QUE7ZUFBQSxTQUFDLENBQUQsRUFBRyxVQUFIO2lCQUNyQyxRQUFBLENBQVMsVUFBVDtRQURxQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkM7SUFEb0I7O29DQUl0QixtQkFBQSxHQUFxQixTQUFDLFFBQUQ7YUFDbkIsSUFBQyxDQUFBLElBQUQsQ0FBTSw4QkFBTixFQUFzQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRCxFQUFHLFVBQUg7aUJBQ3BDLFFBQUEsQ0FBUyxVQUFUO1FBRG9DO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QztJQURtQjs7OztLQXBXYTtBQUhwQyIsInNvdXJjZXNDb250ZW50IjpbIntTY3JvbGxWaWV3LCAkfSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBRdWlja1F1ZXJ5QnJvd3NlclZpZXcgZXh0ZW5kcyBTY3JvbGxWaWV3XG5cbiAgZWRpdG9yOiBudWxsXG4gIGNvbm5lY3Rpb246IG51bGxcbiAgY29ubmVjdGlvbnM6IFtdXG4gIHNlbGVjdGVkQ29ubmVjdGlvbjogbnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBpZiAhYXRvbS5jb25maWcuZ2V0KCdxdWljay1xdWVyeS5icm93c2VyQnV0dG9ucycpXG4gICAgICBAYWRkQ2xhc3MoJ25vLWJ1dHRvbnMnKVxuICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdxdWljay1xdWVyeS5icm93c2VyQnV0dG9ucycsICh7bmV3VmFsdWUsIG9sZFZhbHVlfSkgPT5cbiAgICAgIEB0b2dnbGVDbGFzcygnbm8tYnV0dG9ucycsIW5ld1ZhbHVlKVxuICAgIEBmaW5kKCcjcXVpY2stcXVlcnktbmV3LWNvbm5lY3Rpb24nKS5jbGljayAoZSkgPT5cbiAgICAgIHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdxdWljay1xdWVyeTpuZXctY29ubmVjdGlvbicpXG4gICAgQGZpbmQoJyNxdWljay1xdWVyeS1ydW4nKS5jbGljayAoZSkgPT5cbiAgICAgIHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdxdWljay1xdWVyeTpydW4nKVxuXG4gICMgUmV0dXJucyBhbiBvYmplY3QgdGhhdCBjYW4gYmUgcmV0cmlldmVkIHdoZW4gcGFja2FnZSBpcyBhY3RpdmF0ZWRcbiAgZ2V0VGl0bGU6IC0+ICdEYXRhYmFzZXMnXG5cbiAgc2VyaWFsaXplOiAtPlxuXG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6ICdxdWljay1xdWVyeS1icm93c2VyIHRvb2wtcGFuZWwnLCA9PlxuICAgICAgQGRpdiBjbGFzczogJ2J0bi1ncm91cCcsIG91dGxldDogJ2J1dHRvbnMnLCA9PlxuICAgICAgICBAYnV0dG9uIGlkOiAncXVpY2stcXVlcnktcnVuJywgY2xhc3M6ICdidG4gaWNvbiBpY29uLXBsYXliYWNrLXBsYXknICwgdGl0bGU6ICdSdW4nICwgc3R5bGU6ICd3aWR0aDo1MCUnXG4gICAgICAgIEBidXR0b24gaWQ6ICdxdWljay1xdWVyeS1uZXctY29ubmVjdGlvbicsIGNsYXNzOiAnYnRuIGljb24gaWNvbi1wbHVzJyAsIHRpdGxlOiAnTmV3IGNvbm5lY3Rpb24nICwgc3R5bGU6ICd3aWR0aDo1MCUnXG4gICAgICBAb2wgaWQ6J3F1aWNrLXF1ZXJ5LWNvbm5lY3Rpb25zJyAsIGNsYXNzOiAnbGlzdC10cmVlIGhhcy1jb2xsYXBzYWJsZS1jaGlsZHJlbiBmb2N1c2FibGUtcGFuZWwnLCB0YWJpbmRleDogLTEsIG91dGxldDogJ2xpc3QnXG5cblxuICAjIFRlYXIgZG93biBhbnkgc3RhdGUgYW5kIGRldGFjaFxuICBkZXN0cm95OiAtPlxuICAgIEBlbGVtZW50LnJlbW92ZSgpXG5cbiAgZGVsZXRlOiAtPlxuICAgIGNvbm5lY3Rpb24gPSBudWxsXG4gICAgJGxpID0gQGZpbmQoJ29sOmZvY3VzIGxpLnNlbGVjdGVkJylcbiAgICBtb2RlbCA9ICRsaS5kYXRhKCdpdGVtJylcbiAgICBpZiAkbGkuaGFzQ2xhc3MoJ3F1aWNrLXF1ZXJ5LWNvbm5lY3Rpb24nKVxuICAgICAgQHJlbW92ZUNvbm5lY3Rpb24obW9kZWwpXG4gICAgZWxzZVxuICAgICAgQHRyaWdnZXIoJ3F1aWNrUXVlcnkuZWRpdCcsWydkcm9wJyxtb2RlbF0pXG5cbiAgcmVtb3ZlQ29ubmVjdGlvbjogKGNvbm5lY3Rpb24pLT5cbiAgICBpID0gQGNvbm5lY3Rpb25zLmluZGV4T2YoY29ubmVjdGlvbilcbiAgICBAY29ubmVjdGlvbnMuc3BsaWNlKGksMSlcbiAgICBAc2hvd0Nvbm5lY3Rpb25zKClcbiAgICBAdHJpZ2dlcigncXVpY2tRdWVyeS5jb25uZWN0aW9uRGVsZXRlZCcsW2Nvbm5lY3Rpb25dKVxuXG4gIGdldFVSSTogLT4gJ3F1aWNrLXF1ZXJ5Oi8vYnJvd3NlcidcbiAgZ2V0RGVmYXVsdExvY2F0aW9uOiAtPlxuICAgIGlmIGF0b20uY29uZmlnLmdldCgncXVpY2stcXVlcnkuc2hvd0Jyb3dzZXJPbkxlZnRTaWRlJylcbiAgICAgICdsZWZ0J1xuICAgIGVsc2VcbiAgICAgICdyaWdodCdcbiAgZ2V0QWxsb3dlZExvY2F0aW9uczogLT4gWydsZWZ0JywgJ3JpZ2h0J11cbiAgaXNQZXJtYW5lbnREb2NrSXRlbTogLT4gdHJ1ZVxuXG4gIHNldERlZmF1bHQ6IC0+XG4gICAgJGxpID0gQGZpbmQoJ2xpLnNlbGVjdGVkJylcbiAgICB1bmxlc3MgJGxpLmhhc0NsYXNzKCdkZWZhdWx0JylcbiAgICAgIG1vZGVsID0gJGxpLmRhdGEoJ2l0ZW0nKVxuICAgICAgbW9kZWwuY29ubmVjdGlvbi5zZXREZWZhdWx0RGF0YWJhc2UgbW9kZWwubmFtZVxuXG4gIG1vdmVVcDogLT5cbiAgICAkbGkgPSBAZmluZCgnbGkuc2VsZWN0ZWQnKVxuICAgICRwcmV2ID0gJGxpLnByZXYoKVxuICAgIHdoaWxlICRwcmV2Lmhhc0NsYXNzKCdleHBhbmRlZCcpICYmICRwcmV2LmZpbmQoJz5vbD5saScpLmxlbmd0aCA+IDBcbiAgICAgICRwcmV2ID0gJHByZXYuZmluZCgnPm9sPmxpOmxhc3QnKVxuICAgIGlmICRwcmV2Lmxlbmd0aCA9PSAwICYmICRsaS5wYXJlbnQoKS5nZXQoMCkgIT0gQGxpc3RbMF1cbiAgICAgICRwcmV2ID0gJGxpLnBhcmVudCgpLnBhcmVudCgpXG4gICAgaWYgJHByZXYubGVuZ3RoXG4gICAgICAkcHJldi5hZGRDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgJGxpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpXG4gICAgICBAc2Nyb2xsVG9JdGVtKCRwcmV2KVxuXG4gIG1vdmVEb3duOiAtPlxuICAgICRpID0gJGxpID0gQGZpbmQoJ2xpLnNlbGVjdGVkJylcbiAgICBpZiAkbGkuaGFzQ2xhc3MoJ2V4cGFuZGVkJykgJiYgJGxpLmZpbmQoJz5vbD5saScpLmxlbmd0aCA+IDBcbiAgICAgICRuZXh0ID0gJGxpLmZpbmQoJz5vbD5saTpmaXJzdCcpXG4gICAgZWxzZVxuICAgICAgJG5leHQgPSAkbGkubmV4dCgpXG4gICAgd2hpbGUgJG5leHQubGVuZ3RoID09IDAgJiYgJGkubGVuZ3RoICE9IDAgJiYgJGkucGFyZW50KCkuZ2V0KDApICE9IEBsaXN0WzBdXG4gICAgICAkaSA9ICRpLnBhcmVudCgpLnBhcmVudCgpXG4gICAgICAkbmV4dCA9ICRpLm5leHQoKVxuICAgIGlmICRuZXh0Lmxlbmd0aFxuICAgICAgJG5leHQuYWRkQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgICRsaS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgQHNjcm9sbFRvSXRlbSgkbmV4dClcblxuICBzY3JvbGxUb0l0ZW06ICgkbGkpLT5cbiAgICBsaXN0X2hlaWdodCA9IEBsaXN0Lm91dGVySGVpZ2h0KClcbiAgICBoZWlnaHQgPSAkbGkuY2hpbGRyZW4oJ2RpdicpLmhlaWdodCgpXG4gICAgdG9wID0gJGxpLnBvc2l0aW9uKCkudG9wXG4gICAgYm90dG9tID0gdG9wICsgaGVpZ2h0XG4gICAgc2Nyb2xsID0gQGxpc3Quc2Nyb2xsVG9wKClcbiAgICBpZiBib3R0b20gPiBsaXN0X2hlaWdodFxuICAgICAgQGxpc3Quc2Nyb2xsVG9wKHNjcm9sbCAtIGxpc3RfaGVpZ2h0ICsgYm90dG9tKVxuICAgIGVsc2UgaWYgdG9wIDwgMFxuICAgICAgQGxpc3Quc2Nyb2xsVG9wKHNjcm9sbCArIHRvcClcblxuICBhZGRDb25uZWN0aW9uOiAoY29ubmVjdGlvblByb21pc2UscG9zKSAtPlxuICAgIGNvbm5lY3Rpb25Qcm9taXNlLnRoZW4gKGNvbm5lY3Rpb24pPT5cbiAgICAgIEBzZWxlY3RlZENvbm5lY3Rpb24gPSBjb25uZWN0aW9uXG4gICAgICBpZiBwb3M/XG4gICAgICAgIEBjb25uZWN0aW9ucy5zcGxpY2UocG9zLCAwLCBjb25uZWN0aW9uKVxuICAgICAgZWxzZVxuICAgICAgICBAY29ubmVjdGlvbnMucHVzaChjb25uZWN0aW9uKVxuICAgICAgQHRyaWdnZXIoJ3F1aWNrUXVlcnkuY29ubmVjdGlvblNlbGVjdGVkJyxbY29ubmVjdGlvbl0pXG4gICAgICBAc2hvd0Nvbm5lY3Rpb25zKClcbiAgICAgIGNvbm5lY3Rpb24ub25EaWRDaGFuZ2VEZWZhdWx0RGF0YWJhc2UgKGRhdGFiYXNlKSA9PlxuICAgICAgICBAZGVmYXVsdERhdGFiYXNlQ2hhbmdlZChjb25uZWN0aW9uLGRhdGFiYXNlKVxuXG4gIGRlZmF1bHREYXRhYmFzZUNoYW5nZWQ6IChjb25uZWN0aW9uLGRhdGFiYXNlKS0+XG4gICAgQGxpc3QuY2hpbGRyZW4oKS5lYWNoIChpLGUpLT5cbiAgICAgIGlmICQoZSkuZGF0YSgnaXRlbScpID09IGNvbm5lY3Rpb25cbiAgICAgICAgJChlKS5maW5kKFwiLnF1aWNrLXF1ZXJ5LWRhdGFiYXNlXCIpLnJlbW92ZUNsYXNzKCdkZWZhdWx0JylcbiAgICAgICAgJChlKS5maW5kKFwiLnF1aWNrLXF1ZXJ5LWRhdGFiYXNlW2RhdGEtbmFtZT1cXFwiI3tkYXRhYmFzZX1cXFwiXVwiKS5hZGRDbGFzcygnZGVmYXVsdCcpXG5cbiAgbmV3SXRlbTogKGl0ZW0pLT5cbiAgICBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ2xpJ1xuICAgIGxpLmNsYXNzTGlzdC5hZGQoJ2VudHJ5JylcbiAgICBsaS5zZXRBdHRyaWJ1dGUoJ2RhdGEtbmFtZScsaXRlbS5uYW1lKVxuICAgIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ2RpdidcbiAgICBkaXYuY2xhc3NMaXN0LmFkZCgnaGVhZGVyJywnbGlzdC1pdGVtJylcbiAgICBsaS5hcHBlbmRDaGlsZCBkaXZcbiAgICBpY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCAnc3BhbidcbiAgICBpY29uLmNsYXNzTGlzdC5hZGQoJ2ljb24nKVxuICAgIGRpdi50ZXh0Q29udGVudCA9IGl0ZW0udG9TdHJpbmcoKVxuICAgIGRpdi5pbnNlcnRCZWZvcmUgaWNvbiwgZGl2LmZpcnN0Q2hpbGRcbiAgICBAc2V0SXRlbUNsYXNzZXMoaXRlbSxsaSxkaXYsaWNvbilcbiAgICByZXR1cm4gJChsaSlcblxuICBzaG93Q29ubmVjdGlvbnM6ICgpLT5cbiAgICAkb2wgPSBAbGlzdFxuICAgICRvbC5lbXB0eSgpXG4gICAgZm9yIGNvbm5lY3Rpb24gaW4gQGNvbm5lY3Rpb25zXG4gICAgICAgICRsaSA9IEBuZXdJdGVtKGNvbm5lY3Rpb24pXG4gICAgICAgICRsaS5hdHRyKCdkYXRhLXByb3RvY29sJyxjb25uZWN0aW9uLnByb3RvY29sKVxuICAgICAgICBpZiBjb25uZWN0aW9uID09IEBzZWxlY3RlZENvbm5lY3Rpb25cbiAgICAgICAgICAkbGkuYWRkQ2xhc3MoJ2RlZmF1bHQnKVxuICAgICAgICAkbGkuY2hpbGRyZW4oJ2RpdicpLm1vdXNlZG93biAoZSkgPT5cbiAgICAgICAgICAkbGkgPSAkKGUuY3VycmVudFRhcmdldCkucGFyZW50KClcbiAgICAgICAgICAkbGkucGFyZW50KCkuZmluZCgnbGknKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgICAgICRsaS5hZGRDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgICAgICRsaS5wYXJlbnQoKS5maW5kKCdsaScpLnJlbW92ZUNsYXNzKCdkZWZhdWx0JylcbiAgICAgICAgICAkbGkuYWRkQ2xhc3MoJ2RlZmF1bHQnKVxuICAgICAgICAgIEBleHBhbmRDb25uZWN0aW9uKCRsaSkgaWYgZS53aGljaCAhPSAzXG4gICAgICAgICRsaS5kYXRhKCdpdGVtJyxjb25uZWN0aW9uKVxuICAgICAgICAkb2wuYXBwZW5kKCRsaSlcblxuICBleHBhbmRDb25uZWN0aW9uOiAoJGxpLGNhbGxiYWNrKS0+XG4gICAgY29ubmVjdGlvbiA9ICRsaS5kYXRhKCdpdGVtJylcbiAgICBpZiBjb25uZWN0aW9uICE9IEBzZWxlY3RlZENvbm5lY3Rpb25cbiAgICAgIEBzZWxlY3RlZENvbm5lY3Rpb24gPSBjb25uZWN0aW9uXG4gICAgICBAdHJpZ2dlcigncXVpY2tRdWVyeS5jb25uZWN0aW9uU2VsZWN0ZWQnLFtjb25uZWN0aW9uXSlcbiAgICBAZXhwYW5kSXRlbSgkbGksY2FsbGJhY2spXG5cbiAgc2hvd0l0ZW1zOiAocGFyZW50SXRlbSxjaGlsZHJlbkl0ZW1zLCRlKS0+XG4gICAgb2xfY2xhc3MgPSBzd2l0Y2ggcGFyZW50SXRlbS5jaGlsZF90eXBlXG4gICAgICB3aGVuICdkYXRhYmFzZSdcbiAgICAgICAgXCJxdWljay1xdWVyeS1kYXRhYmFzZXNcIlxuICAgICAgd2hlbiAnc2NoZW1hJ1xuICAgICAgICBcInF1aWNrLXF1ZXJ5LXNjaGVtYXNcIlxuICAgICAgd2hlbiAndGFibGUnXG4gICAgICAgIFwicXVpY2stcXVlcnktdGFibGVzXCJcbiAgICAgIHdoZW4gJ2NvbHVtbidcbiAgICAgICAgXCJxdWljay1xdWVyeS1jb2x1bW5zXCJcbiAgICAkb2wgPSAkZS5maW5kKFwib2wuI3tvbF9jbGFzc31cIilcbiAgICBpZiAkb2wubGVuZ3RoID09IDBcbiAgICAgICRvbCA9ICQoJzxvbC8+JykuYWRkQ2xhc3MoJ2xpc3QtdHJlZSBlbnRyaWVzJylcbiAgICAgIGlmIHBhcmVudEl0ZW0uY2hpbGRfdHlwZSAhPSAnY29sdW1uJ1xuICAgICAgICAkb2wuYWRkQ2xhc3MoXCJoYXMtY29sbGFwc2FibGUtY2hpbGRyZW5cIilcbiAgICAgICRvbC5hZGRDbGFzcyhvbF9jbGFzcylcbiAgICAgICRlLmFwcGVuZCgkb2wpXG4gICAgZWxzZVxuICAgICAgJG9sLmVtcHR5KClcbiAgICBpZiBwYXJlbnRJdGVtLmNoaWxkX3R5cGUgIT0gJ2NvbHVtbidcbiAgICAgIGNoaWxkcmVuSXRlbXMgPSBjaGlsZHJlbkl0ZW1zLnNvcnQoQGNvbXBhcmVJdGVtTmFtZSlcbiAgICBmb3IgY2hpbGRJdGVtIGluIGNoaWxkcmVuSXRlbXNcbiAgICAgICRsaSA9IEBuZXdJdGVtKGNoaWxkSXRlbSlcbiAgICAgICRsaS5jaGlsZHJlbignZGl2JykubW91c2Vkb3duIChlKSA9PlxuICAgICAgICAkbGkgPSAkKGUuY3VycmVudFRhcmdldCkucGFyZW50KClcbiAgICAgICAgQGxpc3QuZmluZCgnbGknKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgICAkbGkuYWRkQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgICAgQGV4cGFuZEl0ZW0oJGxpKSBpZiBlLndoaWNoICE9IDNcbiAgICAgICRsaS5kYXRhKCdpdGVtJyxjaGlsZEl0ZW0pXG4gICAgICAkb2wuYXBwZW5kKCRsaSlcblxuICBzZXRJdGVtQ2xhc3NlczogKGl0ZW0sbGksZGl2LGljb24pLT5cbiAgICBzd2l0Y2ggaXRlbS50eXBlXG4gICAgICB3aGVuICdjb25uZWN0aW9uJ1xuICAgICAgICBsaS5jbGFzc0xpc3QuYWRkKCdxdWljay1xdWVyeS1jb25uZWN0aW9uJylcbiAgICAgICAgZGl2LmNsYXNzTGlzdC5hZGQoXCJxcS1jb25uZWN0aW9uLWl0ZW1cIilcbiAgICAgICAgaWNvbi5jbGFzc0xpc3QuYWRkKCdpY29uLXBsdWcnKVxuICAgICAgd2hlbiAnZGF0YWJhc2UnXG4gICAgICAgIGxpLmNsYXNzTGlzdC5hZGQoJ3F1aWNrLXF1ZXJ5LWRhdGFiYXNlJylcbiAgICAgICAgZGl2LmNsYXNzTGlzdC5hZGQoXCJxcS1kYXRhYmFzZS1pdGVtXCIpXG4gICAgICAgIGljb24uY2xhc3NMaXN0LmFkZCgnaWNvbi1kYXRhYmFzZScpXG4gICAgICAgIGlmIGl0ZW0ubmFtZSA9PSBAc2VsZWN0ZWRDb25uZWN0aW9uLmdldERlZmF1bHREYXRhYmFzZSgpXG4gICAgICAgICAgbGkuY2xhc3NMaXN0LmFkZCgnZGVmYXVsdCcpXG4gICAgICB3aGVuICdzY2hlbWEnXG4gICAgICAgIGxpLmNsYXNzTGlzdC5hZGQoJ3F1aWNrLXF1ZXJ5LXNjaGVtYScpXG4gICAgICAgIGRpdi5jbGFzc0xpc3QuYWRkKFwicXEtc2NoZW1hLWl0ZW1cIilcbiAgICAgICAgaWNvbi5jbGFzc0xpc3QuYWRkKCdpY29uLWJvb2snKVxuICAgICAgd2hlbiAndGFibGUnXG4gICAgICAgIGxpLmNsYXNzTGlzdC5hZGQoJ3F1aWNrLXF1ZXJ5LXRhYmxlJylcbiAgICAgICAgZGl2LmNsYXNzTGlzdC5hZGQoXCJxcS10YWJsZS1pdGVtXCIpXG4gICAgICAgIGljb24uY2xhc3NMaXN0LmFkZCgnaWNvbi1icm93c2VyJylcbiAgICAgIHdoZW4gJ2NvbHVtbidcbiAgICAgICAgbGkuY2xhc3NMaXN0LmFkZCgncXVpY2stcXVlcnktY29sdW1uJylcbiAgICAgICAgZGl2LmNsYXNzTGlzdC5hZGQoXCJxcS1jb2x1bW4taXRlbVwiKVxuICAgICAgICBpZiBpdGVtLnByaW1hcnlfa2V5XG4gICAgICAgICAgaWNvbi5jbGFzc0xpc3QuYWRkKCdpY29uLWtleScpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBpY29uLmNsYXNzTGlzdC5hZGQoJ2ljb24tdGFnJylcbiAgICBpZiBpdGVtLnR5cGUgIT0gJ2NvbHVtbidcbiAgICAgIGxpLmNsYXNzTGlzdC5hZGQoJ2xpc3QtbmVzdGVkLWl0ZW0nLCdjb2xsYXBzZWQnKVxuXG4gIHRpbWVvdXQ6ICh0LGJrKSAtPiBzZXRUaW1lb3V0KGJrLHQpXG5cbiAgZXhwYW5kU2VsZWN0ZWQ6IChjYWxsYmFjayktPlxuICAgICRsaSA9IEBmaW5kKCdsaS5zZWxlY3RlZCcpXG4gICAgQGV4cGFuZEl0ZW0oJGxpLGNhbGxiYWNrKVxuXG4gIGV4cGFuZEl0ZW06ICgkbGksY2FsbGJhY2spIC0+XG4gICAgJGxpLnRvZ2dsZUNsYXNzKCdjb2xsYXBzZWQgZXhwYW5kZWQnKVxuICAgIGlmICRsaS5oYXNDbGFzcyhcImV4cGFuZGVkXCIpICYmICEkbGkuaGFzQ2xhc3MoXCJidXN5XCIpXG4gICAgICAkbGkuYWRkQ2xhc3MoJ2J1c3knKVxuICAgICAgJGRpdiA9ICRsaS5jaGlsZHJlbignZGl2JylcbiAgICAgICRkaXYuY2hpbGRyZW4oJy5sb2FkaW5nLC5pY29uLXN0b3AnKS5yZW1vdmUoKVxuICAgICAgJGljb24gPSAkZGl2LmNoaWxkcmVuKCcuaWNvbicpXG4gICAgICAkbG9hZGluZyA9ICQoJzxzcGFuPicpLmFkZENsYXNzKFwibG9hZGluZyBsb2FkaW5nLXNwaW5uZXItdGlueSBpbmxpbmUtYmxvY2tcIikuaGlkZSgpXG4gICAgICAkZGl2LnByZXBlbmQoJGxvYWRpbmcpXG4gICAgICB0aW1lMSA9IERhdGUubm93KClcbiAgICAgIHQxMDAgPSBAdGltZW91dCAxMDAsID0+XG4gICAgICAgICRpY29uLmhpZGUoKVxuICAgICAgICAkbG9hZGluZy5zaG93KClcbiAgICAgIHQ1MDAwID0gQHRpbWVvdXQgNTAwMCwgPT5cbiAgICAgICAgJGxpLnJlbW92ZUNsYXNzKCdidXN5JylcbiAgICAgICAgJGxvYWRpbmcuYXR0cignY2xhc3MnLCdpY29uIGljb24tc3RvcCcpXG4gICAgICBtb2RlbCA9ICRsaS5kYXRhKCdpdGVtJylcbiAgICAgIG1vZGVsLmNoaWxkcmVuIChjaGlsZHJlbikgPT5cbiAgICAgICAgY2xlYXJUaW1lb3V0KHQxMDApXG4gICAgICAgIGNsZWFyVGltZW91dCh0NTAwMClcbiAgICAgICAgdGltZTIgPSBEYXRlLm5vdygpXG4gICAgICAgIGlmIHRpbWUyIC0gdGltZTEgPCA1MDAwXG4gICAgICAgICAgJGxpLnJlbW92ZUNsYXNzKCdidXN5JylcbiAgICAgICAgICAkbG9hZGluZy5yZW1vdmUoKVxuICAgICAgICAgICRpY29uLmNzcygnZGlzcGxheScsJycpXG4gICAgICAgICAgQHNob3dJdGVtcyhtb2RlbCxjaGlsZHJlbiwkbGkpXG4gICAgICAgICAgY2FsbGJhY2soY2hpbGRyZW4pIGlmIGNhbGxiYWNrXG5cbiAgcmVmcmVzaFRyZWU6IChtb2RlbCktPlxuICAgIHNlbGVjdG9yID0gc3dpdGNoIG1vZGVsLnR5cGVcbiAgICAgIHdoZW4gJ2Nvbm5lY3Rpb24nIHRoZW4gJ2xpLnF1aWNrLXF1ZXJ5LWNvbm5lY3Rpb24nXG4gICAgICB3aGVuICdkYXRhYmFzZScgdGhlbiAnbGkucXVpY2stcXVlcnktZGF0YWJhc2UnXG4gICAgICB3aGVuICdzY2hlbWEnIHRoZW4gJ2xpLnF1aWNrLXF1ZXJ5LXNjaGVtYSdcbiAgICAgIHdoZW4gJ3RhYmxlJyB0aGVuICdsaS5xdWljay1xdWVyeS10YWJsZSdcbiAgICAgIGVsc2UgJ2xpJ1xuICAgICRsaSA9IEBmaW5kKHNlbGVjdG9yKS5maWx0ZXIgKGksZSktPiAkKGUpLmRhdGEoJ2l0ZW0nKSA9PSBtb2RlbFxuICAgICRsaS5yZW1vdmVDbGFzcygnY29sbGFwc2VkJylcbiAgICAkbGkuYWRkQ2xhc3MoJ2V4cGFuZGVkJylcbiAgICAkbGkuZmluZCgnb2wnKS5lbXB0eSgpO1xuICAgIG1vZGVsLmNoaWxkcmVuIChjaGlsZHJlbikgPT4gQHNob3dJdGVtcyhtb2RlbCxjaGlsZHJlbiwkbGkpXG5cbiAgZXhwYW5kOiAobW9kZWwsY2FsbGJhY2spLT5cbiAgICBpZiBtb2RlbC50eXBlID09ICdjb25uZWN0aW9uJ1xuICAgICAgQGxpc3QuY2hpbGRyZW4oKS5lYWNoIChpLGxpKSA9PlxuICAgICAgICBpZiAkKGxpKS5kYXRhKCdpdGVtJykgPT0gbW9kZWxcbiAgICAgICAgICAkKGxpKS5yZW1vdmVDbGFzcygnZXhwYW5kZWQnKS5hZGRDbGFzcygnY29sbGFwc2VkJykgI0hBQ0s/XG4gICAgICAgICAgQGV4cGFuZENvbm5lY3Rpb24gJChsaSkgLCA9PlxuICAgICAgICAgICAgY2FsbGJhY2soJChsaSkpIGlmIGNhbGxiYWNrXG4gICAgZWxzZVxuICAgICAgcGFyZW50ID0gbW9kZWwucGFyZW50KClcbiAgICAgIEBleHBhbmQgcGFyZW50LCAoJGxpKSA9PlxuICAgICAgICAkb2wgPSAkbGkuY2hpbGRyZW4oXCJvbFwiKVxuICAgICAgICAkb2wuY2hpbGRyZW4oKS5lYWNoIChpLGxpKSA9PlxuICAgICAgICAgIGl0ZW0gPSAkKGxpKS5kYXRhKCdpdGVtJylcbiAgICAgICAgICBpZiBpdGVtICYmIGl0ZW0ubmFtZSA9PSBtb2RlbC5uYW1lICYmIGl0ZW0udHlwZSA9PSBtb2RlbC50eXBlXG4gICAgICAgICAgICBAZXhwYW5kSXRlbSAkKGxpKSAsID0+XG4gICAgICAgICAgICAgIGNhbGxiYWNrKCQobGkpKSBpZiBjYWxsYmFja1xuXG4gIHJldmVhbDogKG1vZGVsLGNhbGxiYWNrKSAtPlxuICAgIEBleHBhbmQgbW9kZWwsICgkbGkpID0+XG4gICAgICAkbGkuYWRkQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgIHRvcCA9ICRsaS5wb3NpdGlvbigpLnRvcFxuICAgICAgYm90dG9tID0gdG9wICsgJGxpLm91dGVySGVpZ2h0KClcbiAgICAgIGlmIGJvdHRvbSA+IEBsaXN0LnNjcm9sbEJvdHRvbSgpXG4gICAgICAgIEBsaXN0LnNjcm9sbEJvdHRvbShib3R0b20pXG4gICAgICBpZiB0b3AgPCBAbGlzdC5zY3JvbGxUb3AoKVxuICAgICAgICBAbGlzdC5zY3JvbGxUb3AodG9wKVxuICAgICAgY2FsbGJhY2soKSBpZiBjYWxsYmFja1xuXG4gIGNvbXBhcmVJdGVtTmFtZTogKGl0ZW0xLGl0ZW0yKS0+XG4gICAgaWYgKGl0ZW0xLm5hbWUgPCBpdGVtMi5uYW1lKVxuICAgICAgcmV0dXJuIC0xXG4gICAgZWxzZSBpZiAoaXRlbTEubmFtZSA+IGl0ZW0yLm5hbWUpXG4gICAgICByZXR1cm4gMVxuICAgIGVsc2VcbiAgICAgIHJldHVybiAwXG5cbiAgc2ltcGxlU2VsZWN0OiAtPlxuICAgICRsaSA9IEBmaW5kKCdsaS5zZWxlY3RlZC5xdWljay1xdWVyeS10YWJsZScpXG4gICAgaWYgJGxpLmxlbmd0aCA+IDBcbiAgICAgIG1vZGVsID0gJGxpLmRhdGEoJ2l0ZW0nKVxuICAgICAgbW9kZWwuY29ubmVjdGlvbi5nZXRDb2x1bW5zIG1vZGVsICwoY29sdW1ucykgPT5cbiAgICAgICAgdGV4dCA9IG1vZGVsLmNvbm5lY3Rpb24uc2ltcGxlU2VsZWN0KG1vZGVsLGNvbHVtbnMpXG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oKS50aGVuIChlZGl0b3IpID0+XG4gICAgICAgICAgYXRvbS50ZXh0RWRpdG9ycy5zZXRHcmFtbWFyT3ZlcnJpZGUoZWRpdG9yLCAnc291cmNlLnNxbCcpXG4gICAgICAgICAgZWRpdG9yLmluc2VydFRleHQodGV4dClcblxuICBjb3B5OiAtPlxuICAgICRsaSA9IEBmaW5kKCdsaS5zZWxlY3RlZCcpXG4gICAgJGhlYWRlciA9ICRsaS5jaGlsZHJlbignZGl2LmhlYWRlcicpXG4gICAgaWYgJGhlYWRlci5sZW5ndGggPiAwXG4gICAgICBhdG9tLmNsaXBib2FyZC53cml0ZSgkaGVhZGVyLnRleHQoKSlcblxuICBjcmVhdGU6IC0+XG4gICAgJGxpID0gQGZpbmQoJ2xpLnNlbGVjdGVkJylcbiAgICBpZiAkbGkubGVuZ3RoID4gMFxuICAgICAgbW9kZWwgPSAkbGkuZGF0YSgnaXRlbScpXG4gICAgICBAdHJpZ2dlcigncXVpY2tRdWVyeS5lZGl0JyxbJ2NyZWF0ZScsbW9kZWxdKVxuXG5cbiAgYWx0ZXI6IC0+XG4gICAgJGxpID0gQGZpbmQoJ2xpLnNlbGVjdGVkJylcbiAgICBpZiAkbGkubGVuZ3RoID4gMFxuICAgICAgbW9kZWwgPSAkbGkuZGF0YSgnaXRlbScpXG4gICAgICBAdHJpZ2dlcigncXVpY2tRdWVyeS5lZGl0JyxbJ2FsdGVyJyxtb2RlbF0pXG5cbiAgZHJvcDogLT5cbiAgICAkbGkgPSBAZmluZCgnbGkuc2VsZWN0ZWQnKVxuICAgIGlmICRsaS5sZW5ndGggPiAwXG4gICAgICBtb2RlbCA9ICRsaS5kYXRhKCdpdGVtJylcbiAgICAgIEB0cmlnZ2VyKCdxdWlja1F1ZXJ5LmVkaXQnLFsnZHJvcCcsbW9kZWxdKVxuXG4gIHNlbGVjdENvbm5lY3Rpb246IChjb25uZWN0aW9uKS0+XG4gICAgcmV0dXJuIHVubGVzcyBjb25uZWN0aW9uICE9IEBzZWxlY3RlZENvbm5lY3Rpb25cbiAgICBAbGlzdC5jaGlsZHJlbigpLmVhY2ggKGksbGkpID0+XG4gICAgICBpZiAkKGxpKS5kYXRhKCdpdGVtJykgPT0gY29ubmVjdGlvblxuICAgICAgICBAbGlzdC5jaGlsZHJlbigpLnJlbW92ZUNsYXNzKCdkZWZhdWx0JylcbiAgICAgICAgJChsaSkuYWRkQ2xhc3MoJ2RlZmF1bHQnKVxuICAgICAgICBAc2VsZWN0ZWRDb25uZWN0aW9uID0gY29ubmVjdGlvblxuICAgICAgICBAdHJpZ2dlcigncXVpY2tRdWVyeS5jb25uZWN0aW9uU2VsZWN0ZWQnLFtjb25uZWN0aW9uXSlcblxuICAjZXZlbnRzXG4gIG9uQ29ubmVjdGlvblNlbGVjdGVkOiAoY2FsbGJhY2spLT5cbiAgICBAYmluZCAncXVpY2tRdWVyeS5jb25uZWN0aW9uU2VsZWN0ZWQnLCAoZSxjb25uZWN0aW9uKSA9PlxuICAgICAgY2FsbGJhY2soY29ubmVjdGlvbilcblxuICBvbkNvbm5lY3Rpb25EZWxldGVkOiAoY2FsbGJhY2spLT5cbiAgICBAYmluZCAncXVpY2tRdWVyeS5jb25uZWN0aW9uRGVsZXRlZCcsIChlLGNvbm5lY3Rpb24pID0+XG4gICAgICBjYWxsYmFjayhjb25uZWN0aW9uKVxuIl19
