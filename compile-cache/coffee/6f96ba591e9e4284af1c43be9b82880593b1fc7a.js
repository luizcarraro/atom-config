(function() {
  var QuickQueryAutocomplete, QuickQueryCachedConnection;

  QuickQueryCachedConnection = require('./quick-query-cached-connection');

  module.exports = QuickQueryAutocomplete = (function() {
    QuickQueryAutocomplete.prototype.selector = '.source.sql';

    QuickQueryAutocomplete.prototype.disableForSelector = '.source.sql .comment, .source.sql .string.quoted.single';

    QuickQueryAutocomplete.prototype.excludeLowerPriority = false;

    function QuickQueryAutocomplete(browser) {
      if (browser.connection != null) {
        this.connection = new QuickQueryCachedConnection({
          connection: browser.connection
        });
      }
      browser.onConnectionDeleted((function(_this) {
        return function(connection) {
          return _this.connection = null;
        };
      })(this));
      browser.onConnectionSelected((function(_this) {
        return function(connection) {
          return _this.connection = new QuickQueryCachedConnection({
            connection: connection
          });
        };
      })(this));
    }

    QuickQueryAutocomplete.prototype.prepareSugestions = function(suggestions, prefix) {
      suggestions = suggestions.sort(function(s1, s2) {
        return Math.sign(s1.score - s2.score);
      });
      return suggestions.map(function(item) {
        if (item.type === 'table') {
          return {
            text: item.text,
            displayText: item.text,
            replacementPrefix: prefix,
            type: 'qq-table',
            iconHTML: '<i class="icon-browser"></i>'
          };
        } else if (item.type === 'schema') {
          return {
            text: item.text,
            displayText: item.text,
            replacementPrefix: prefix,
            type: 'qq-schema',
            iconHTML: '<i class="icon-book"></i>'
          };
        } else if (item.type === 'database') {
          return {
            text: item.text,
            displayText: item.text,
            replacementPrefix: prefix,
            type: 'qq-database',
            iconHTML: '<i class="icon-database"></i>'
          };
        } else {
          return {
            text: item.text,
            displayText: item.text,
            replacementPrefix: prefix,
            type: 'qq-column',
            iconHTML: item.type === 'key' ? '<i class="icon-key"></i>' : '<i class="icon-tag"></i>'
          };
        }
      });
    };

    QuickQueryAutocomplete.prototype.getScore = function(string, prefix) {
      return string.indexOf(prefix);
    };

    QuickQueryAutocomplete.prototype.getSuggestions = function(arg) {
      var activatedManually, bufferPosition, editor, prefix, scopeDescriptor;
      editor = arg.editor, bufferPosition = arg.bufferPosition, scopeDescriptor = arg.scopeDescriptor, prefix = arg.prefix, activatedManually = arg.activatedManually;
      if (prefix.length < 2 || (this.connection == null) || !atom.config.get('quick-query.autompleteIntegration')) {
        return [];
      }
      return new Promise((function(_this) {
        return function(resolve) {
          var defaultDatabase, editor_text, lwr_prefix, suggestions;
          lwr_prefix = prefix.toLowerCase();
          editor_text = editor.getText().toLowerCase();
          defaultDatabase = _this.connection.getDefaultDatabase();
          suggestions = [];
          return _this.connection.children(function(databases) {
            var database, i, len, lwr_database, results, score;
            results = [];
            for (i = 0, len = databases.length; i < len; i++) {
              database = databases[i];
              lwr_database = database.name.toLowerCase();
              if (activatedManually) {
                score = _this.getScore(lwr_database, lwr_prefix);
                if ((score != null) && score !== -1) {
                  suggestions.push({
                    text: database.name,
                    lower: lwr_database,
                    score: score,
                    type: 'database'
                  });
                }
              }
              if (defaultDatabase === database.name || (editor_text.includes(lwr_database) && _this.connection.protocol !== 'postgres')) {
                results.push(database.children(function(items) {
                  if (database.child_type === 'schema') {
                    return _this.getSchemasSuggestions(items, suggestions, lwr_prefix, editor_text, activatedManually, function() {
                      return resolve(_this.prepareSugestions(suggestions, prefix));
                    });
                  } else {
                    return _this.getTablesSuggestions(items, suggestions, lwr_prefix, editor_text, function() {
                      return resolve(_this.prepareSugestions(suggestions, prefix));
                    });
                  }
                }));
              } else {
                results.push(void 0);
              }
            }
            return results;
          });
        };
      })(this));
    };

    QuickQueryAutocomplete.prototype.getSchemasSuggestions = function(schemas, suggestions, prefix, editor_text, activatedManually, fn) {
      var i, len, lwr_schema, remain, results, schema, score;
      remain = schemas.length;
      if (remain === 0) {
        fn();
      }
      results = [];
      for (i = 0, len = schemas.length; i < len; i++) {
        schema = schemas[i];
        if (activatedManually) {
          lwr_schema = schema.name.toLowerCase();
          score = this.getScore(lwr_schema, prefix);
          if ((score != null) && score !== -1) {
            suggestions.push({
              text: schema.name,
              lower: lwr_schema,
              score: score,
              type: 'schema'
            });
          }
        }
        results.push(schema.children((function(_this) {
          return function(tables) {
            return _this.getTablesSuggestions(tables, suggestions, prefix, editor_text, function() {
              remain--;
              if (remain === 0) {
                return fn();
              }
            });
          };
        })(this)));
      }
      return results;
    };

    QuickQueryAutocomplete.prototype.getTablesSuggestions = function(tables, suggestions, prefix, editor_text, fn) {
      var i, len, lwr_table, remain, results, score, table;
      remain = tables.length;
      if (remain === 0) {
        fn();
      }
      results = [];
      for (i = 0, len = tables.length; i < len; i++) {
        table = tables[i];
        lwr_table = table.name.toLowerCase();
        score = this.getScore(lwr_table, prefix);
        if ((score != null) && score !== -1) {
          suggestions.push({
            text: table.name,
            lower: lwr_table,
            score: score,
            type: 'table'
          });
        }
        if (editor_text.includes(lwr_table)) {
          results.push(table.children((function(_this) {
            return function(columns) {
              var column, j, len1, lwr_column;
              for (j = 0, len1 = columns.length; j < len1; j++) {
                column = columns[j];
                lwr_column = column.name.toLowerCase();
                score = _this.getScore(lwr_column, prefix);
                if ((score != null) && score !== -1) {
                  suggestions.push({
                    text: column.name,
                    lower: lwr_table,
                    score: score,
                    type: column.primary_key ? 'key' : 'column'
                  });
                }
              }
              remain--;
              if (remain === 0) {
                return fn();
              }
            };
          })(this)));
        } else {
          remain--;
          if (remain === 0) {
            results.push(fn());
          } else {
            results.push(void 0);
          }
        }
      }
      return results;
    };

    return QuickQueryAutocomplete;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL3F1aWNrLXF1ZXJ5L2xpYi9xdWljay1xdWVyeS1hdXRvY29tcGxldGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSwwQkFBQSxHQUE2QixPQUFBLENBQVEsaUNBQVI7O0VBRTdCLE1BQU0sQ0FBQyxPQUFQLEdBQXVCO3FDQUNyQixRQUFBLEdBQVU7O3FDQUNWLGtCQUFBLEdBQW9COztxQ0FDcEIsb0JBQUEsR0FBc0I7O0lBRVYsZ0NBQUMsT0FBRDtNQUdWLElBQUcsMEJBQUg7UUFDRSxJQUFDLENBQUEsVUFBRCxHQUFjLElBQUksMEJBQUosQ0FBK0I7VUFBQSxVQUFBLEVBQVksT0FBTyxDQUFDLFVBQXBCO1NBQS9CLEVBRGhCOztNQUVBLE9BQU8sQ0FBQyxtQkFBUixDQUE0QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsVUFBRDtpQkFBZSxLQUFDLENBQUEsVUFBRCxHQUFjO1FBQTdCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1QjtNQUNBLE9BQU8sQ0FBQyxvQkFBUixDQUE2QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsVUFBRDtpQkFDM0IsS0FBQyxDQUFBLFVBQUQsR0FBYyxJQUFJLDBCQUFKLENBQStCO1lBQUEsVUFBQSxFQUFhLFVBQWI7V0FBL0I7UUFEYTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0I7SUFOVTs7cUNBVVosaUJBQUEsR0FBbUIsU0FBQyxXQUFELEVBQWEsTUFBYjtNQUNqQixXQUFBLEdBQWMsV0FBVyxDQUFDLElBQVosQ0FBaUIsU0FBQyxFQUFELEVBQUksRUFBSjtlQUFVLElBQUksQ0FBQyxJQUFMLENBQVUsRUFBRSxDQUFDLEtBQUgsR0FBVyxFQUFFLENBQUMsS0FBeEI7TUFBVixDQUFqQjthQUNkLFdBQVcsQ0FBQyxHQUFaLENBQWdCLFNBQUMsSUFB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QUFDLENBQUEsUUFBRCxDQUFVLFVBQVYsRUFBcUIsTUFBckI7Z0JBQ1IsSUFBRyxlQUFBLElBQVUsS0FBQSxLQUFTLENBQUMsQ0FBdkI7a0JBQ0UsV0FBVyxDQUFDLElBQVosQ0FDRTtvQkFBQSxJQUFBLEVBQU0sTUFBTSxDQUFDLElBQWI7b0JBQ0EsS0FBQSxFQUFPLFNBRFA7b0JBRUEsS0FBQSxFQUFPLEtBRlA7b0JBR0EsSUFBQSxFQUFTLE1BQU0sQ0FBQyxXQUFWLEdBQTJCLEtBQTNCLEdBQXNDLFFBSDVDO21CQURGLEVBREY7O0FBSEY7Y0FTQSxNQUFBO2NBQVUsSUFBUSxNQUFBLEtBQVUsQ0FBbEI7dUJBQUEsRUFBQSxDQUFBLEVBQUE7O1lBVkc7VUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWYsR0FERjtTQUFBLE1BQUE7VUFhRSxNQUFBO1VBQVUsSUFBUSxNQUFBLEtBQVUsQ0FBbEI7eUJBQUEsRUFBQSxDQUFBLEdBQUE7V0FBQSxNQUFBO2lDQUFBO1dBYlo7O0FBVEY7O0lBSG9COzs7OztBQWhHeEIiLCJzb3VyY2VzQ29udGVudCI6WyJRdWlja1F1ZXJ5Q2FjaGVkQ29ubmVjdGlvbiA9IHJlcXVpcmUgJy4vcXVpY2stcXVlcnktY2FjaGVkLWNvbm5lY3Rpb24nXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUXVpY2tRdWVyeUF1dG9jb21wbGV0ZVxuICBzZWxlY3RvcjogJy5zb3VyY2Uuc3FsJ1xuICBkaXNhYmxlRm9yU2VsZWN0b3I6ICcuc291cmNlLnNxbCAuY29tbWVudCwgLnNvdXJjZS5zcWwgLnN0cmluZy5xdW90ZWQuc2luZ2xlJ1xuICBleGNsdWRlTG93ZXJQcmlvcml0eTogZmFsc2VcblxuICBjb25zdHJ1Y3RvcjooYnJvd3NlciktPlxuICAgICMgQGNvbm5lY3Rpb24gPSBicm93c2VyLmNvbm5lY3Rpb25cbiAgICAjIGJyb3dzZXIub25Db25uZWN0aW9uU2VsZWN0ZWQgKEBjb25uZWN0aW9uKT0+XG4gICAgaWYgYnJvd3Nlci5jb25uZWN0aW9uP1xuICAgICAgQGNvbm5lY3Rpb24gPSBuZXcgUXVpY2tRdWVyeUNhY2hlZENvbm5lY3Rpb24oY29ubmVjdGlvbjogYnJvd3Nlci5jb25uZWN0aW9uKVxuICAgIGJyb3dzZXIub25Db25uZWN0aW9uRGVsZXRlZCAoY29ubmVjdGlvbik9PiBAY29ubmVjdGlvbiA9IG51bGxcbiAgICBicm93c2VyLm9uQ29ubmVjdGlvblNlbGVjdGVkIChjb25uZWN0aW9uKT0+XG4gICAgICBAY29ubmVjdGlvbiA9IG5ldyBRdWlja1F1ZXJ5Q2FjaGVkQ29ubmVjdGlvbihjb25uZWN0aW9uOiAgY29ubmVjdGlvbilcblxuXG4gIHByZXBhcmVTdWdlc3Rpb25zOiAoc3VnZ2VzdGlvbnMscHJlZml4KS0+XG4gICAgc3VnZ2VzdGlvbnMgPSBzdWdnZXN0aW9ucy5zb3J0KChzMSxzMiktPiBNYXRoLnNpZ24oczEuc2NvcmUgLSBzMi5zY29yZSApKVxuICAgIHN1Z2dlc3Rpb25zLm1hcCAoaXRlbSktPlxuICAgICAgaWYgaXRlbS50eXBlID09ICd0YWJsZSdcbiAgICAgICAgdGV4dDogaXRlbS50ZXh0XG4gICAgICAgIGRpc3BsYXlUZXh0OiBpdGVtLnRleHRcbiAgICAgICAgcmVwbGFjZW1lbnRQcmVmaXg6IHByZWZpeFxuICAgICAgICB0eXBlOiAncXEtdGFibGUnXG4gICAgICAgIGljb25IVE1MOiAnPGkgY2xhc3M9XCJpY29uLWJyb3dzZXJcIj48L2k+J1xuICAgICAgZWxzZSBpZiBpdGVtLnR5cGUgPT0gJ3NjaGVtYSdcbiAgICAgICAgdGV4dDogaXRlbS50ZXh0XG4gICAgICAgIGRpc3BsYXlUZXh0OiBpdGVtLnRleHRcbiAgICAgICAgcmVwbGFjZW1lbnRQcmVmaXg6IHByZWZpeFxuICAgICAgICB0eXBlOiAncXEtc2NoZW1hJ1xuICAgICAgICBpY29uSFRNTDogJzxpIGNsYXNzPVwiaWNvbi1ib29rXCI+PC9pPidcbiAgICAgIGVsc2UgaWYgaXRlbS50eXBlID09ICdkYXRhYmFzZSdcbiAgICAgICAgdGV4dDogaXRlbS50ZXh0XG4gICAgICAgIGRpc3BsYXlUZXh0OiBpdGVtLnRleHRcbiAgICAgICAgcmVwbGFjZW1lbnRQcmVmaXg6IHByZWZpeFxuICAgICAgICB0eXBlOiAncXEtZGF0YWJhc2UnXG4gICAgICAgIGljb25IVE1MOiAnPGkgY2xhc3M9XCJpY29uLWRhdGFiYXNlXCI+PC9pPidcbiAgICAgIGVsc2VcbiAgICAgICAgdGV4dDogaXRlbS50ZXh0XG4gICAgICAgIGRpc3BsYXlUZXh0OiBpdGVtLnRleHRcbiAgICAgICAgcmVwbGFjZW1lbnRQcmVmaXg6IHByZWZpeFxuICAgICAgICB0eXBlOiAncXEtY29sdW1uJ1xuICAgICAgICBpY29uSFRNTDogaWYgaXRlbS50eXBlID09ICdrZXknXG4gICAgICAgICAgICAnPGkgY2xhc3M9XCJpY29uLWtleVwiPjwvaT4nXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgJzxpIGNsYXNzPVwiaWNvbi10YWdcIj48L2k+J1xuXG4gIGdldFNjb3JlOiAoc3RyaW5nLHByZWZpeCktPiBzdHJpbmcuaW5kZXhPZihwcmVmaXgpXG5cbiAgZ2V0U3VnZ2VzdGlvbnM6ICh7ZWRpdG9yLCBidWZmZXJQb3NpdGlvbiwgc2NvcGVEZXNjcmlwdG9yLCBwcmVmaXgsIGFjdGl2YXRlZE1hbnVhbGx5fSkgLT5cbiAgICByZXR1cm4gW10gaWYgcHJlZml4Lmxlbmd0aCA8IDIgfHwgIUBjb25uZWN0aW9uPyB8fCAhYXRvbS5jb25maWcuZ2V0KCdxdWljay1xdWVyeS5hdXRvbXBsZXRlSW50ZWdyYXRpb24nKVxuICAgIG5ldyBQcm9taXNlIChyZXNvbHZlKSA9PlxuICAgICAgbHdyX3ByZWZpeCA9IHByZWZpeC50b0xvd2VyQ2FzZSgpXG4gICAgICBlZGl0b3JfdGV4dCA9IGVkaXRvci5nZXRUZXh0KCkudG9Mb3dlckNhc2UoKVxuICAgICAgZGVmYXVsdERhdGFiYXNlID0gQGNvbm5lY3Rpb24uZ2V0RGVmYXVsdERhdGFiYXNlKClcbiAgICAgIHN1Z2dlc3Rpb25zID0gW11cbiAgICAgIEBjb25uZWN0aW9uLmNoaWxkcmVuIChkYXRhYmFzZXMpID0+XG4gICAgICAgIGZvciBkYXRhYmFzZSBpbiBkYXRhYmFzZXNcbiAgICAgICAgICBsd3JfZGF0YWJhc2UgPSBkYXRhYmFzZS5uYW1lLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICBpZiBhY3RpdmF0ZWRNYW51YWxseVxuICAgICAgICAgICAgc2NvcmUgPSBAZ2V0U2NvcmUobHdyX2RhdGFiYXNlLGx3cl9wcmVmaXgpXG4gICAgICAgICAgICBpZiBzY29yZT8gJiYgc2NvcmUgIT0gLTFcbiAgICAgICAgICAgICAgc3VnZ2VzdGlvbnMucHVzaFxuICAgICAgICAgICAgICAgIHRleHQ6IGRhdGFiYXNlLm5hbWVcbiAgICAgICAgICAgICAgICBsb3dlcjogbHdyX2RhdGFiYXNlXG4gICAgICAgICAgICAgICAgc2NvcmU6IHNjb3JlXG4gICAgICAgICAgICAgICAgdHlwZTogJ2RhdGFiYXNlJ1xuICAgICAgICAgIGlmIGRlZmF1bHREYXRhYmFzZSA9PSBkYXRhYmFzZS5uYW1lIG9yIChlZGl0b3JfdGV4dC5pbmNsdWRlcyhsd3JfZGF0YWJhc2UpIGFuZCBAY29ubmVjdGlvbi5wcm90b2NvbCAhPSAncG9zdGdyZXMnKVxuICAgICAgICAgICAgZGF0YWJhc2UuY2hpbGRyZW4gKGl0ZW1zKSA9PlxuICAgICAgICAgICAgICBpZiBkYXRhYmFzZS5jaGlsZF90eXBlID09ICdzY2hlbWEnXG4gICAgICAgICAgICAgICAgQGdldFNjaGVtYXNTdWdnZXN0aW9ucyBpdGVtcyAsIHN1Z2dlc3Rpb25zLCBsd3JfcHJlZml4LCBlZGl0b3JfdGV4dCxhY3RpdmF0ZWRNYW51YWxseSwgPT5cbiAgICAgICAgICAgICAgICAgIHJlc29sdmUoQHByZXBhcmVTdWdlc3Rpb25zKHN1Z2dlc3Rpb25zLHByZWZpeCkpXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAZ2V0VGFibGVzU3VnZ2VzdGlvbnMgaXRlbXMsc3VnZ2VzdGlvbnMsbHdyX3ByZWZpeCwgZWRpdG9yX3RleHQsID0+XG4gICAgICAgICAgICAgICAgICByZXNvbHZlKEBwcmVwYXJlU3VnZXN0aW9ucyhzdWdnZXN0aW9ucyxwcmVmaXgpKVxuXG5cbiAgZ2V0U2NoZW1hc1N1Z2dlc3Rpb25zOiAoc2NoZW1hcyxzdWdnZXN0aW9ucyxwcmVmaXgsIGVkaXRvcl90ZXh0LCBhY3RpdmF0ZWRNYW51YWxseSAsIGZuKS0+XG4gICAgcmVtYWluID0gc2NoZW1hcy5sZW5ndGhcbiAgICBmbigpIGlmIHJlbWFpbiA9PSAwXG4gICAgZm9yIHNjaGVtYSBpbiBzY2hlbWFzXG4gICAgICBpZiBhY3RpdmF0ZWRNYW51YWxseVxuICAgICAgICBsd3Jfc2NoZW1hID0gc2NoZW1hLm5hbWUudG9Mb3dlckNhc2UoKVxuICAgICAgICBzY29yZSA9IEBnZXRTY29yZShsd3Jfc2NoZW1hLHByZWZpeClcbiAgICAgICAgaWYgc2NvcmU/ICYmIHNjb3JlICE9IC0xXG4gICAgICAgICAgc3VnZ2VzdGlvbnMucHVzaFxuICAgICAgICAgICAgdGV4dDogc2NoZW1hLm5hbWVcbiAgICAgICAgICAgIGxvd2VyOiBsd3Jfc2NoZW1hXG4gICAgICAgICAgICBzY29yZTogc2NvcmVcbiAgICAgICAgICAgIHR5cGU6ICdzY2hlbWEnXG4gICAgICBzY2hlbWEuY2hpbGRyZW4gKHRhYmxlcykgPT5cbiAgICAgICAgQGdldFRhYmxlc1N1Z2dlc3Rpb25zIHRhYmxlcyAsIHN1Z2dlc3Rpb25zLCBwcmVmaXgsIGVkaXRvcl90ZXh0LCA9PlxuICAgICAgICAgIHJlbWFpbi0tOyBmbigpIGlmIHJlbWFpbiA9PSAwXG5cblxuICBnZXRUYWJsZXNTdWdnZXN0aW9uczogKHRhYmxlcyxzdWdnZXN0aW9ucyxwcmVmaXgsIGVkaXRvcl90ZXh0LCBmbiktPlxuICAgIHJlbWFpbiA9IHRhYmxlcy5sZW5ndGhcbiAgICBmbigpIGlmIHJlbWFpbiA9PSAwXG4gICAgZm9yIHRhYmxlIGluIHRhYmxlc1xuICAgICAgbHdyX3RhYmxlID0gdGFibGUubmFtZS50b0xvd2VyQ2FzZSgpXG4gICAgICBzY29yZSA9IEBnZXRTY29yZShsd3JfdGFibGUscHJlZml4KVxuICAgICAgaWYgc2NvcmU/ICYmIHNjb3JlICE9IC0xXG4gICAgICAgIHN1Z2dlc3Rpb25zLnB1c2hcbiAgICAgICAgICB0ZXh0OiB0YWJsZS5uYW1lXG4gICAgICAgICAgbG93ZXI6IGx3cl90YWJsZVxuICAgICAgICAgIHNjb3JlOiBzY29yZVxuICAgICAgICAgIHR5cGU6ICd0YWJsZSdcbiAgICAgIGlmIGVkaXRvcl90ZXh0LmluY2x1ZGVzKGx3cl90YWJsZSlcbiAgICAgICAgdGFibGUuY2hpbGRyZW4gKGNvbHVtbnMpID0+XG4gICAgICAgICAgZm9yIGNvbHVtbiBpbiBjb2x1bW5zXG4gICAgICAgICAgICBsd3JfY29sdW1uID0gY29sdW1uLm5hbWUudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgc2NvcmUgPSBAZ2V0U2NvcmUobHdyX2NvbHVtbixwcmVmaXgpXG4gICAgICAgICAgICBpZiBzY29yZT8gJiYgc2NvcmUgIT0gLTFcbiAgICAgICAgICAgICAgc3VnZ2VzdGlvbnMucHVzaFxuICAgICAgICAgICAgICAgIHRleHQ6IGNvbHVtbi5uYW1lXG4gICAgICAgICAgICAgICAgbG93ZXI6IGx3cl90YWJsZVxuICAgICAgICAgICAgICAgIHNjb3JlOiBzY29yZVxuICAgICAgICAgICAgICAgIHR5cGU6IGlmIGNvbHVtbi5wcmltYXJ5X2tleSB0aGVuICdrZXknIGVsc2UgJ2NvbHVtbidcbiAgICAgICAgICByZW1haW4tLTsgZm4oKSBpZiByZW1haW4gPT0gMFxuICAgICAgZWxzZVxuICAgICAgICByZW1haW4tLTsgZm4oKSBpZiByZW1haW4gPT0gMFxuIl19
