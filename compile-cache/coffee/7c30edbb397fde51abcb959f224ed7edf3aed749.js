(function() {
  var $, QuickQueryTableFinderView, SelectListView, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), SelectListView = ref.SelectListView, $ = ref.$;

  module.exports = QuickQueryTableFinderView = (function(superClass) {
    extend(QuickQueryTableFinderView, superClass);

    function QuickQueryTableFinderView() {
      return QuickQueryTableFinderView.__super__.constructor.apply(this, arguments);
    }

    QuickQueryTableFinderView.prototype.initialize = function() {
      this.step = 1;
      return QuickQueryTableFinderView.__super__.initialize.apply(this, arguments);
    };

    QuickQueryTableFinderView.prototype.getFilterKey = function() {
      return 'name';
    };

    QuickQueryTableFinderView.prototype.viewForItem = function(item) {
      var $li, $span;
      if (item.parent().type === 'schema') {
        $li = $("<li/>").html((item.parent().name) + "." + item.name);
      } else {
        $li = $("<li/>").html(item.name);
      }
      $span = $('<span/>').addClass('icon');
      if (item.type === 'database') {
        $span.addClass('icon-database');
      } else {
        $span.addClass('icon-browser');
      }
      $li.prepend($span);
      return $li;
    };

    QuickQueryTableFinderView.prototype.confirmed = function(item) {
      if (this.step === 1) {
        return this.step2(item);
      } else {
        return this.trigger('quickQuery.found', [item]);
      }
    };

    QuickQueryTableFinderView.prototype.cancel = function() {
      QuickQueryTableFinderView.__super__.cancel.apply(this, arguments);
      if (this.step === 2) {
        return this.step1();
      } else {
        return this.trigger('quickQuery.canceled');
      }
    };

    QuickQueryTableFinderView.prototype.searchTable = function(connection1) {
      this.connection = connection1;
      return this.step1();
    };

    QuickQueryTableFinderView.prototype.step1 = function() {
      this.step = 1;
      return this.connection.getDatabases((function(_this) {
        return function(databases, err) {
          var defaultdatabase;
          if (!err) {
            _this.setItems(databases);
            if (defaultdatabase = _this.connection.getDefaultDatabase()) {
              if (!_this.connection.hiddenDatabase(defaultdatabase)) {
                return _this.filterEditorView.getModel().setText(defaultdatabase);
              }
            }
          }
        };
      })(this));
    };

    QuickQueryTableFinderView.prototype.step2 = function(database) {
      this.step = 2;
      if (database.child_type === 'table') {
        return database.children((function(_this) {
          return function(tables) {
            _this.filterEditorView.getModel().setText('');
            return _this.setItems(tables);
          };
        })(this));
      } else {
        return database.children((function(_this) {
          return function(schemas) {
            var alltables, i, j, len, results, schema;
            alltables = [];
            i = 0;
            results = [];
            for (j = 0, len = schemas.length; j < len; j++) {
              schema = schemas[j];
              results.push(schema.children(function(tables) {
                i++;
                Array.prototype.push.apply(alltables, tables);
                if (i === schemas.length) {
                  _this.filterEditorView.getModel().setText('');
                  return _this.setItems(alltables);
                }
              }));
            }
            return results;
          };
        })(this));
      }
    };

    QuickQueryTableFinderView.prototype.onFound = function(callback) {
      return this.bind('quickQuery.found', (function(_this) {
        return function(e, connection) {
          return callback(connection);
        };
      })(this));
    };

    QuickQueryTableFinderView.prototype.onCanceled = function(callback) {
      return this.bind('quickQuery.canceled', (function(_this) {
        return function(e, connection) {
          return callback(connection);
        };
      })(this));
    };

    return QuickQueryTableFinderView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL3F1aWNrLXF1ZXJ5L2xpYi9xdWljay1xdWVyeS10YWJsZS1maW5kZXItdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGlEQUFBO0lBQUE7OztFQUFBLE1BQXdCLE9BQUEsQ0FBUSxzQkFBUixDQUF4QixFQUFDLG1DQUFELEVBQW1COztFQUduQixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O3dDQUNKLFVBQUEsR0FBWSxTQUFBO01BQ1YsSUFBQyxDQUFBLElBQUQsR0FBUTthQUNSLDJEQUFBLFNBQUE7SUFGVTs7d0NBR1osWUFBQSxHQUFjLFNBQUE7YUFDWjtJQURZOzt3Q0FFZCxXQUFBLEdBQWEsU0FBQyxJQUFEO0FBQ1YsVUFBQTtNQUFBLElBQUcsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFhLENBQUMsSUFBZCxLQUFzQixRQUF6QjtRQUNFLEdBQUEsR0FBTSxDQUFBLENBQUUsT0FBRixDQUFVLENBQUMsSUFBWCxDQUFrQixDQUFDLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBYSxDQUFDLElBQWYsQ0FBQSxHQUFvQixHQUFwQixHQUF1QixJQUFJLENBQUMsSUFBOUMsRUFEUjtPQUFBLE1BQUE7UUFHRSxHQUFBLEdBQU0sQ0FBQSxDQUFFLE9BQUYsQ0FBVSxDQUFDLElBQVgsQ0FBZ0IsSUFBSSxDQUFDLElBQXJCLEVBSFI7O01BSUEsS0FBQSxHQUFRLENBQUEsQ0FBRSxTQUFGLENBQVksQ0FBQyxRQUFiLENBQXNCLE1BQXRCO01BQ1IsSUFBRyxJQUFJLENBQUMsSUFBTCxLQUFhLFVBQWhCO1FBQ0UsS0FBSyxDQUFDLFFBQU4sQ0FBZSxlQUFmLEVBREY7T0FBQSxNQUFBO1FBR0UsS0FBSyxDQUFDLFFBQU4sQ0FBZSxjQUFmLEVBSEY7O01BSUEsR0FBRyxDQUFDLE9BQUosQ0FBWSxLQUFaO2FBQ0E7SUFYVTs7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U0FBQSxLQUFBO2VBQUEsU0FBQyxDQUFELEVBQUcsVUFBSDtpQkFDM0IsUUFBQSxDQUFTLFVBQVQ7UUFEMkI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTdCO0lBRFU7Ozs7S0FqRTBCO0FBSnhDIiwic291cmNlc0NvbnRlbnQiOlsie1NlbGVjdExpc3RWaWV3ICAsICR9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cbiMgY2xhc3MgUXVpY2tRdWVyeVNlbGVjdFRhYmxlVmlldyBleHRlbmRzIFNlbGVjdExpc3RWaWV3XG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBRdWlja1F1ZXJ5VGFibGVGaW5kZXJWaWV3IGV4dGVuZHMgU2VsZWN0TGlzdFZpZXdcbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBAc3RlcCA9IDFcbiAgICBzdXBlclxuICBnZXRGaWx0ZXJLZXk6IC0+XG4gICAgJ25hbWUnXG4gIHZpZXdGb3JJdGVtOiAoaXRlbSkgLT5cbiAgICAgaWYgaXRlbS5wYXJlbnQoKS50eXBlID09ICdzY2hlbWEnXG4gICAgICAgJGxpID0gJChcIjxsaS8+XCIpLmh0bWwoXCIje2l0ZW0ucGFyZW50KCkubmFtZX0uI3tpdGVtLm5hbWV9XCIpXG4gICAgIGVsc2VcbiAgICAgICAkbGkgPSAkKFwiPGxpLz5cIikuaHRtbChpdGVtLm5hbWUpXG4gICAgICRzcGFuID0gJCgnPHNwYW4vPicpLmFkZENsYXNzKCdpY29uJylcbiAgICAgaWYgaXRlbS50eXBlID09ICdkYXRhYmFzZSdcbiAgICAgICAkc3Bhbi5hZGRDbGFzcygnaWNvbi1kYXRhYmFzZScpXG4gICAgIGVsc2VcbiAgICAgICAkc3Bhbi5hZGRDbGFzcygnaWNvbi1icm93c2VyJylcbiAgICAgJGxpLnByZXBlbmQoJHNwYW4pXG4gICAgICRsaVxuICBjb25maXJtZWQ6IChpdGVtKSAtPlxuICAgIGlmIEBzdGVwID09IDFcbiAgICAgIEBzdGVwMihpdGVtKVxuICAgIGVsc2VcbiAgICAgIEB0cmlnZ2VyKCdxdWlja1F1ZXJ5LmZvdW5kJyxbaXRlbV0pXG5cbiAgY2FuY2VsOiAtPlxuICAgIHN1cGVyXG4gICAgaWYgQHN0ZXAgPT0gMlxuICAgICAgQHN0ZXAxKClcbiAgICBlbHNlXG4gICAgICBAdHJpZ2dlcigncXVpY2tRdWVyeS5jYW5jZWxlZCcpXG5cbiAgc2VhcmNoVGFibGU6IChAY29ubmVjdGlvbiktPlxuICAgIEBzdGVwMSgpXG5cbiAgc3RlcDE6ICgpLT5cbiAgICBAc3RlcCA9IDFcbiAgICBAY29ubmVjdGlvbi5nZXREYXRhYmFzZXMgKGRhdGFiYXNlcyxlcnIpID0+XG4gICAgICB1bmxlc3MgZXJyXG4gICAgICAgIEBzZXRJdGVtcyhkYXRhYmFzZXMpXG4gICAgICAgIGlmIGRlZmF1bHRkYXRhYmFzZSA9IEBjb25uZWN0aW9uLmdldERlZmF1bHREYXRhYmFzZSgpXG4gICAgICAgICAgdW5sZXNzIEBjb25uZWN0aW9uLmhpZGRlbkRhdGFiYXNlKGRlZmF1bHRkYXRhYmFzZSlcbiAgICAgICAgICAgIEBmaWx0ZXJFZGl0b3JWaWV3LmdldE1vZGVsKCkuc2V0VGV4dChkZWZhdWx0ZGF0YWJhc2UpXG5cbiAgc3RlcDI6IChkYXRhYmFzZSktPlxuICAgIEBzdGVwID0gMlxuICAgIGlmIGRhdGFiYXNlLmNoaWxkX3R5cGUgPT0gJ3RhYmxlJ1xuICAgICAgZGF0YWJhc2UuY2hpbGRyZW4gKHRhYmxlcykgPT5cbiAgICAgICAgQGZpbHRlckVkaXRvclZpZXcuZ2V0TW9kZWwoKS5zZXRUZXh0KCcnKVxuICAgICAgICBAc2V0SXRlbXModGFibGVzKVxuICAgIGVsc2VcbiAgICAgIGRhdGFiYXNlLmNoaWxkcmVuIChzY2hlbWFzKSA9PlxuICAgICAgICBhbGx0YWJsZXMgPSBbXVxuICAgICAgICBpID0gMFxuICAgICAgICBmb3Igc2NoZW1hIGluIHNjaGVtYXNcbiAgICAgICAgICBzY2hlbWEuY2hpbGRyZW4gKHRhYmxlcykgPT5cbiAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoYWxsdGFibGVzLHRhYmxlcylcbiAgICAgICAgICAgIGlmIGkgPT0gc2NoZW1hcy5sZW5ndGhcbiAgICAgICAgICAgICAgQGZpbHRlckVkaXRvclZpZXcuZ2V0TW9kZWwoKS5zZXRUZXh0KCcnKVxuICAgICAgICAgICAgICBAc2V0SXRlbXMoYWxsdGFibGVzKVxuXG4gIG9uRm91bmQ6IChjYWxsYmFjayktPlxuICAgIEBiaW5kICdxdWlja1F1ZXJ5LmZvdW5kJywgKGUsY29ubmVjdGlvbikgPT5cbiAgICAgIGNhbGxiYWNrKGNvbm5lY3Rpb24pXG5cbiAgb25DYW5jZWxlZDogKGNhbGxiYWNrKS0+XG4gICAgQGJpbmQgJ3F1aWNrUXVlcnkuY2FuY2VsZWQnLCAoZSxjb25uZWN0aW9uKSA9PlxuICAgICAgY2FsbGJhY2soY29ubmVjdGlvbilcbiJdfQ==
