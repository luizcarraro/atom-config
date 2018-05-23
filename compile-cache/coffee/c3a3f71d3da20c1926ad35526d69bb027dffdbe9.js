(function() {
  var QuickQueryCachedConnection, QuickQueryCachedDatabase, QuickQueryCachedSchema, QuickQueryCachedTable;

  QuickQueryCachedTable = (function() {
    QuickQueryCachedTable.prototype.type = 'table';

    QuickQueryCachedTable.prototype.child_type = 'column';

    QuickQueryCachedTable.prototype.childs = [];

    function QuickQueryCachedTable(parent, real) {
      this.parent = parent;
      this.real = real;
      this.connection = this.parent.connection;
      this.name = this.real.name;
    }

    QuickQueryCachedTable.prototype.toString = function() {
      return this.name;
    };

    QuickQueryCachedTable.prototype.parent = function() {
      return this.parent;
    };

    QuickQueryCachedTable.prototype.children = function(callback) {
      var time;
      time = Date.now();
      if ((this.last == null) || time - this.last > this.connection.timeout * 1000) {
        this.last = time;
        return this.real.children((function(_this) {
          return function(childs1) {
            _this.childs = childs1;
            return callback(_this.childs);
          };
        })(this));
      } else {
        return callback(this.childs);
      }
    };

    return QuickQueryCachedTable;

  })();

  QuickQueryCachedSchema = (function() {
    QuickQueryCachedSchema.prototype.type = 'schema';

    QuickQueryCachedSchema.prototype.child_type = 'table';

    QuickQueryCachedSchema.prototype.childs = [];

    function QuickQueryCachedSchema(database, real) {
      this.database = database;
      this.real = real;
      this.connection = this.database.connection;
      this.name = this.real.name;
    }

    QuickQueryCachedSchema.prototype.toString = function() {
      return this.name;
    };

    QuickQueryCachedSchema.prototype.parent = function() {
      return this.database;
    };

    QuickQueryCachedSchema.prototype.children = function(callback) {
      var time;
      time = Date.now();
      if ((this.last == null) || time - this.last > this.connection.timeout * 1000) {
        this.last = time;
        return this.real.children((function(_this) {
          return function(childs) {
            _this.childs = childs.map(function(child) {
              return new QuickQueryCachedTable(_this, child);
            });
            return callback(_this.childs);
          };
        })(this));
      } else {
        return callback(this.childs);
      }
    };

    return QuickQueryCachedSchema;

  })();

  QuickQueryCachedDatabase = (function() {
    QuickQueryCachedDatabase.prototype.type = 'database';

    QuickQueryCachedDatabase.prototype.childs = [];

    function QuickQueryCachedDatabase(connection, real) {
      this.connection = connection;
      this.real = real;
      this.name = this.real.name;
      this.child_type = this.real.child_type;
    }

    QuickQueryCachedDatabase.prototype.toString = function() {
      return this.name;
    };

    QuickQueryCachedDatabase.prototype.parent = function() {
      return this.connection;
    };

    QuickQueryCachedDatabase.prototype.children = function(callback) {
      var time;
      time = Date.now();
      if ((this.last == null) || time - this.last > this.connection.timeout * 1000) {
        this.last = time;
        return this.real.children((function(_this) {
          return function(childs) {
            if (_this.child_type === 'schema') {
              _this.childs = childs.map(function(child) {
                return new QuickQueryCachedSchema(_this, child);
              });
            } else {
              _this.childs = childs.map(function(child) {
                return new QuickQueryCachedTable(_this, child);
              });
            }
            return callback(_this.childs);
          };
        })(this));
      } else {
        return callback(this.childs);
      }
    };

    return QuickQueryCachedDatabase;

  })();

  module.exports = QuickQueryCachedConnection = (function() {
    QuickQueryCachedConnection.prototype.type = 'connection';

    QuickQueryCachedConnection.prototype.child_type = 'database';

    function QuickQueryCachedConnection(info) {
      this.realConnection = info.connection;
      this.protocol = this.realConnection.protocol;
      this.timeout = info.timeout;
      if (this.timeout == null) {
        this.timeout = 15;
      }
      this.last = null;
    }

    QuickQueryCachedConnection.prototype.getDefaultDatabase = function() {
      return this.realConnection.getDefaultDatabase();
    };

    QuickQueryCachedConnection.prototype.children = function(callback) {
      var time;
      time = Date.now();
      if ((this.last == null) || time - this.last > this.timeout * 1000) {
        this.last = time;
        return this.realConnection.children((function(_this) {
          return function(childs) {
            _this.childs = childs.map(function(child) {
              return new QuickQueryCachedDatabase(_this, child);
            });
            return callback(_this.childs);
          };
        })(this));
      } else {
        return callback(this.childs);
      }
    };

    QuickQueryCachedConnection.prototype.query = function(str) {
      return this.realConnection.query(str);
    };

    QuickQueryCachedConnection.prototype.simpleSelect = function(table, columns) {
      if (columns == null) {
        columns = '*';
      }
      return this.realConnection.simpleSelect(table, columns);
    };

    return QuickQueryCachedConnection;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL3F1aWNrLXF1ZXJ5L2xpYi9xdWljay1xdWVyeS1jYWNoZWQtY29ubmVjdGlvbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7QUFBQSxNQUFBOztFQUFNO29DQUNKLElBQUEsR0FBTTs7b0NBQ04sVUFBQSxHQUFZOztvQ0FDWixNQUFBLEdBQVE7O0lBQ0ssK0JBQUMsTUFBRCxFQUFTLElBQVQ7TUFBQyxJQUFDLENBQUEsU0FBRDtNQUFRLElBQUMsQ0FBQSxPQUFEO01BQ3BCLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBLE1BQU0sQ0FBQztNQUN0QixJQUFDLENBQUEsSUFBRCxHQUFRLElBQUMsQ0FBQSxJQUFJLENBQUM7SUFGSDs7b0NBR2IsUUFBQSxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUE7SUFETzs7b0NBRVYsTUFBQSxHQUFRLFNBQUE7YUFDTixJQUFDLENBQUE7SUFESzs7b0NBRVIsUUFBQSxHQUFVLFNBQUMsUUFBRDtBQUNSLFVBQUE7TUFBQSxJQUFBLEdBQU8sSUFBSSxDQUFDLEdBQUwsQ0FBQTtNQUNQLElBQUksbUJBQUQsSUFBVyxJQUFBLEdBQU8sSUFBQyxDQUFBLElBQVIsR0FBZ0IsSUFBQyxDQUFBLFVBQVUsQ0FBQyxPQUFaLEdBQXNCLElBQXBEO1FBQ0UsSUFBQyxDQUFBLElBQUQsR0FBUTtlQUNSLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBTixDQUFlLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsT0FBRDtZQUFDLEtBQUMsQ0FBQSxTQUFEO21CQUNkLFFBQUEsQ0FBUyxLQUFDLENBQUEsTUFBVjtVQURhO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFmLEVBRkY7T0FBQSxNQUFBO2VBS0UsUUFBQSxDQUFTLElBQUMsQ0FBQSxNQUFWLEVBTEY7O0lBRlE7Ozs7OztFQVNOO3FDQUNKLElBQUEsR0FB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ZW50IjpbIlxuY2xhc3MgUXVpY2tRdWVyeUNhY2hlZFRhYmxlXG4gIHR5cGU6ICd0YWJsZSdcbiAgY2hpbGRfdHlwZTogJ2NvbHVtbidcbiAgY2hpbGRzOiBbXVxuICBjb25zdHJ1Y3RvcjogKEBwYXJlbnQsQHJlYWwpIC0+XG4gICAgQGNvbm5lY3Rpb24gPSBAcGFyZW50LmNvbm5lY3Rpb25cbiAgICBAbmFtZSA9IEByZWFsLm5hbWVcbiAgdG9TdHJpbmc6IC0+XG4gICAgQG5hbWVcbiAgcGFyZW50OiAtPlxuICAgIEBwYXJlbnRcbiAgY2hpbGRyZW46IChjYWxsYmFjayktPlxuICAgIHRpbWUgPSBEYXRlLm5vdygpXG4gICAgaWYgIUBsYXN0PyB8fCB0aW1lIC0gQGxhc3QgPiAgQGNvbm5lY3Rpb24udGltZW91dCAqIDEwMDBcbiAgICAgIEBsYXN0ID0gdGltZVxuICAgICAgQHJlYWwuY2hpbGRyZW4gKEBjaGlsZHMpPT5cbiAgICAgICAgY2FsbGJhY2soQGNoaWxkcylcbiAgICBlbHNlXG4gICAgICBjYWxsYmFjayhAY2hpbGRzKVxuXG5jbGFzcyBRdWlja1F1ZXJ5Q2FjaGVkU2NoZW1hXG4gIHR5cGU6ICdzY2hlbWEnXG4gIGNoaWxkX3R5cGU6ICd0YWJsZSdcbiAgY2hpbGRzOiBbXVxuICBjb25zdHJ1Y3RvcjogKEBkYXRhYmFzZSxAcmVhbCkgLT5cbiAgICBAY29ubmVjdGlvbiA9IEBkYXRhYmFzZS5jb25uZWN0aW9uXG4gICAgQG5hbWUgPSBAcmVhbC5uYW1lXG4gIHRvU3RyaW5nOiAtPlxuICAgIEBuYW1lXG4gIHBhcmVudDogLT5cbiAgICBAZGF0YWJhc2VcbiAgY2hpbGRyZW46IChjYWxsYmFjayktPlxuICAgIHRpbWUgPSBEYXRlLm5vdygpXG4gICAgaWYgIUBsYXN0PyB8fCB0aW1lIC0gQGxhc3QgPiAgQGNvbm5lY3Rpb24udGltZW91dCAqIDEwMDBcbiAgICAgIEBsYXN0ID0gdGltZVxuICAgICAgQHJlYWwuY2hpbGRyZW4gKGNoaWxkcyk9PlxuICAgICAgICBAY2hpbGRzID0gY2hpbGRzLm1hcCAoY2hpbGQpPT4gbmV3IFF1aWNrUXVlcnlDYWNoZWRUYWJsZShALGNoaWxkKVxuICAgICAgICBjYWxsYmFjayhAY2hpbGRzKVxuICAgIGVsc2VcbiAgICAgIGNhbGxiYWNrKEBjaGlsZHMpXG5cbmNsYXNzIFF1aWNrUXVlcnlDYWNoZWREYXRhYmFzZVxuICB0eXBlOiAnZGF0YWJhc2UnXG4gIGNoaWxkczogW11cbiAgY29uc3RydWN0b3I6IChAY29ubmVjdGlvbixAcmVhbCkgLT5cbiAgICBAbmFtZSA9IEByZWFsLm5hbWVcbiAgICBAY2hpbGRfdHlwZSA9IEByZWFsLmNoaWxkX3R5cGVcbiAgdG9TdHJpbmc6IC0+XG4gICAgQG5hbWVcbiAgcGFyZW50OiAtPlxuICAgIEBjb25uZWN0aW9uXG4gIGNoaWxkcmVuOiAoY2FsbGJhY2spLT5cbiAgICB0aW1lID0gRGF0ZS5ub3coKVxuICAgIGlmICFAbGFzdD8gfHwgdGltZSAtIEBsYXN0ID4gIEBjb25uZWN0aW9uLnRpbWVvdXQgKiAxMDAwXG4gICAgICBAbGFzdCA9IHRpbWVcbiAgICAgIEByZWFsLmNoaWxkcmVuIChjaGlsZHMpPT5cbiAgICAgICAgaWYgQGNoaWxkX3R5cGUgPT0gJ3NjaGVtYSdcbiAgICAgICAgICBAY2hpbGRzID0gY2hpbGRzLm1hcCAoY2hpbGQpPT4gbmV3IFF1aWNrUXVlcnlDYWNoZWRTY2hlbWEoQCxjaGlsZClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBjaGlsZHMgPSBjaGlsZHMubWFwIChjaGlsZCk9PiBuZXcgUXVpY2tRdWVyeUNhY2hlZFRhYmxlKEAsY2hpbGQpXG4gICAgICAgIGNhbGxiYWNrKEBjaGlsZHMpXG4gICAgZWxzZVxuICAgICAgY2FsbGJhY2soQGNoaWxkcylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBRdWlja1F1ZXJ5Q2FjaGVkQ29ubmVjdGlvblxuXG4gIHR5cGU6ICdjb25uZWN0aW9uJ1xuICBjaGlsZF90eXBlOiAnZGF0YWJhc2UnXG5cbiAgY29uc3RydWN0b3I6IChpbmZvKS0+XG4gICAgQHJlYWxDb25uZWN0aW9uID0gaW5mby5jb25uZWN0aW9uXG4gICAgQHByb3RvY29sID0gQHJlYWxDb25uZWN0aW9uLnByb3RvY29sXG4gICAgQHRpbWVvdXQgPSBpbmZvLnRpbWVvdXRcbiAgICBAdGltZW91dCA/PSAxNSAjc2Vjb25kc1xuICAgIEBsYXN0ID0gbnVsbFxuXG4gIGdldERlZmF1bHREYXRhYmFzZTogLT4gQHJlYWxDb25uZWN0aW9uLmdldERlZmF1bHREYXRhYmFzZSgpXG5cbiAgY2hpbGRyZW46IChjYWxsYmFjayktPlxuICAgIHRpbWUgPSBEYXRlLm5vdygpXG4gICAgaWYgIUBsYXN0PyB8fCB0aW1lIC0gQGxhc3QgPiAgQHRpbWVvdXQgKiAxMDAwXG4gICAgICBAbGFzdCA9IHRpbWVcbiAgICAgIEByZWFsQ29ubmVjdGlvbi5jaGlsZHJlbiAoY2hpbGRzKSA9PlxuICAgICAgICBAY2hpbGRzID0gY2hpbGRzLm1hcCAoY2hpbGQpPT4gbmV3IFF1aWNrUXVlcnlDYWNoZWREYXRhYmFzZShALGNoaWxkKVxuICAgICAgICBjYWxsYmFjayhAY2hpbGRzKVxuICAgIGVsc2VcbiAgICAgIGNhbGxiYWNrKEBjaGlsZHMpXG5cbiAgcXVlcnk6IChzdHIpIC0+IEByZWFsQ29ubmVjdGlvbi5xdWVyeShzdHIpICNzaG91bGQgSSBjYWNoZSB0aGlzP1xuXG4gIHNpbXBsZVNlbGVjdDogKHRhYmxlLGNvbHVtbnM9JyonKS0+XG4gICAgQHJlYWxDb25uZWN0aW9uLnNpbXBsZVNlbGVjdCh0YWJsZSxjb2x1bW5zKVxuIl19
