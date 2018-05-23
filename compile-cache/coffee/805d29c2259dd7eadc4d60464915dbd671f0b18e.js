(function() {
  var Emitter, QuickQueryMysqlColumn, QuickQueryMysqlConnection, QuickQueryMysqlDatabase, QuickQueryMysqlTable, mysql;

  mysql = require('mysql');

  Emitter = require('atom').Emitter;

  QuickQueryMysqlColumn = (function() {
    QuickQueryMysqlColumn.prototype.type = 'column';

    QuickQueryMysqlColumn.prototype.child_type = null;

    function QuickQueryMysqlColumn(table1, row) {
      this.table = table1;
      this.connection = this.table.connection;
      this.name = row['Field'];
      this.column = this.name;
      this.primary_key = row["Key"] === "PRI";
      this.datatype = row['Type'];
      this["default"] = row['Default'];
      this.nullable = row['Null'] === 'YES';
    }

    QuickQueryMysqlColumn.prototype.toString = function() {
      return this.name;
    };

    QuickQueryMysqlColumn.prototype.parent = function() {
      return this.table;
    };

    QuickQueryMysqlColumn.prototype.children = function(callback) {
      return callback([]);
    };

    return QuickQueryMysqlColumn;

  })();

  QuickQueryMysqlTable = (function() {
    QuickQueryMysqlTable.prototype.type = 'table';

    QuickQueryMysqlTable.prototype.child_type = 'column';

    function QuickQueryMysqlTable(database1, row, fields) {
      this.database = database1;
      this.connection = this.database.connection;
      this.name = row[fields[0].name];
      this.table = this.name;
    }

    QuickQueryMysqlTable.prototype.toString = function() {
      return this.name;
    };

    QuickQueryMysqlTable.prototype.parent = function() {
      return this.database;
    };

    QuickQueryMysqlTable.prototype.children = function(callback) {
      return this.connection.getColumns(this, callback);
    };

    return QuickQueryMysqlTable;

  })();

  QuickQueryMysqlDatabase = (function() {
    QuickQueryMysqlDatabase.prototype.type = 'database';

    QuickQueryMysqlDatabase.prototype.child_type = 'table';

    function QuickQueryMysqlDatabase(connection, row) {
      this.connection = connection;
      this.name = row["Database"];
      this.database = this.name;
    }

    QuickQueryMysqlDatabase.prototype.toString = function() {
      return this.name;
    };

    QuickQueryMysqlDatabase.prototype.parent = function() {
      return this.connection;
    };

    QuickQueryMysqlDatabase.prototype.children = function(callback) {
      return this.connection.getTables(this, callback);
    };

    return QuickQueryMysqlDatabase;

  })();

  module.exports = QuickQueryMysqlConnection = (function() {
    QuickQueryMysqlConnection.prototype.fatal = false;

    QuickQueryMysqlConnection.prototype.connection = null;

    QuickQueryMysqlConnection.prototype.protocol = 'mysql';

    QuickQueryMysqlConnection.prototype.type = 'connection';

    QuickQueryMysqlConnection.prototype.child_type = 'database';

    QuickQueryMysqlConnection.prototype.timeout = 40000;

    QuickQueryMysqlConnection.prototype.n_types = 'TINYINT SMALLINT MEDIUMINT INT INTEGER BIGINT FLOAT DOUBLE REAL DECIMAL NUMERIC TIMESTAMP YEAR ENUM SET'.split(/\s+/);

    QuickQueryMysqlConnection.prototype.s_types = 'CHAR VARCHAR TINYBLOB TINYTEXT MEDIUMBLOB MEDIUMTEXT LONGBLOB LONGTEXT BLOB TEXT DATETIME DATE TIME'.split(/\s+/);

    QuickQueryMysqlConnection.prototype.allowEdition = true;

    QuickQueryMysqlConnection.defaultPort = 3306;

    function QuickQueryMysqlConnection(info1) {
      this.info = info1;
      this.info.dateStrings = true;
      this.info.multipleStatements = true;
      this.emitter = new Emitter();
    }

    QuickQueryMysqlConnection.prototype.connect = function(callback) {
      this.connection = mysql.createConnection(this.info);
      this.connection.on('error', (function(_this) {
        return function(err) {
          if (err && err.code === 'PROTOCOL_CONNECTION_LOST') {
            return _this.fatal = true;
          }
        };
      })(this));
      return this.connection.connect(callback);
    };

    QuickQueryMysqlConnection.prototype.serialize = function() {
      var c;
      c = this.connection.config;
      return {
        host: c.host,
        port: c.port,
        protocol: this.protocol,
        database: c.database,
        user: c.user,
        password: c.password
      };
    };

    QuickQueryMysqlConnection.prototype.dispose = function() {
      return this.close();
    };

    QuickQueryMysqlConnection.prototype.close = function() {
      return this.connection.end();
    };

    QuickQueryMysqlConnection.prototype.query = function(text, callback) {
      if (this.fatal) {
        this.connection = mysql.createConnection(this.info);
        this.connection.on('error', (function(_this) {
          return function(err) {
            if (err && err.code === 'PROTOCOL_CONNECTION_LOST') {
              return _this.fatal = true;
            }
          };
        })(this));
        this.fatal = false;
      }
      return this.connection.query({
        sql: text,
        timeout: this.timeout
      }, (function(_this) {
        return function(err, rows, fields) {
          var affectedRows;
          if (err) {
            _this.fatal = err.fatal;
            return callback({
              type: 'error',
              content: err.toString()
            });
          } else if (!fields) {
            return callback({
              type: 'success',
              content: rows.affectedRows + " row(s) affected"
            });
          } else if (fields.length === 0 || (!Array.isArray(fields[0]) && (fields[0] != null))) {
            return callback(null, rows, fields);
          } else {
            affectedRows = rows.map(function(row) {
              if (row.affectedRows != null) {
                return row.affectedRows;
              } else {
                return 0;
              }
            });
            affectedRows = affectedRows.reduce(function(r1, r2) {
              return r1 + r2;
            });
            if ((fields[0] != null) && affectedRows === 0) {
              return callback(null, rows[0], fields[0]);
            } else {
              return callback({
                type: 'success',
                content: affectedRows + " row(s) affected"
              });
            }
          }
        };
      })(this));
    };

    QuickQueryMysqlConnection.prototype.setDefaultDatabase = function(database) {
      return this.connection.changeUser({
        database: database
      }, (function(_this) {
        return function() {
          return _this.emitter.emit('did-change-default-database', _this.connection.config.database);
        };
      })(this));
    };

    QuickQueryMysqlConnection.prototype.getDefaultDatabase = function() {
      return this.connection.config.database;
    };

    QuickQueryMysqlConnection.prototype.parent = function() {
      return this;
    };

    QuickQueryMysqlConnection.prototype.children = function(callback) {
      return this.getDatabases(function(databases, err) {
        if (err == null) {
          return callback(databases);
        } else {
          return console.log(err);
        }
      });
    };

    QuickQueryMysqlConnection.prototype.getDatabases = function(callback) {
      var text;
      text = "SHOW DATABASES";
      return this.query(text, (function(_this) {
        return function(err, rows, fields) {
          var databases;
          if (!err) {
            databases = rows.map(function(row) {
              return new QuickQueryMysqlDatabase(_this, row);
            });
            databases = databases.filter(function(database) {
              return !_this.hiddenDatabase(database.name);
            });
          }
          return callback(databases, err);
        };
      })(this));
    };

    QuickQueryMysqlConnection.prototype.getTables = function(database, callback) {
      var database_name, text;
      database_name = this.connection.escapeId(database.name);
      text = "SHOW TABLES IN " + database_name;
      return this.query(text, (function(_this) {
        return function(err, rows, fields) {
          var tables;
          if (!err) {
            tables = rows.map(function(row) {
              return new QuickQueryMysqlTable(database, row, fields);
            });
            return callback(tables);
          }
        };
      })(this));
    };

    QuickQueryMysqlConnection.prototype.getColumns = function(table, callback) {
      var database_name, table_name, text;
      table_name = this.connection.escapeId(table.name);
      database_name = this.connection.escapeId(table.database.name);
      text = "SHOW COLUMNS IN " + table_name + " IN " + database_name;
      return this.query(text, (function(_this) {
        return function(err, rows, fields) {
          var columns;
          if (!err) {
            columns = rows.map(function(row) {
              return new QuickQueryMysqlColumn(table, row);
            });
            return callback(columns);
          }
        };
      })(this));
    };

    QuickQueryMysqlConnection.prototype.hiddenDatabase = function(database) {
      return database === "information_schema" || database === "performance_schema" || database === "sys" || database === "mysql";
    };

    QuickQueryMysqlConnection.prototype.simpleSelect = function(table, columns) {
      var database_name, table_name;
      if (columns == null) {
        columns = '*';
      }
      if (columns !== '*') {
        columns = columns.map((function(_this) {
          return function(col) {
            return _this.connection.escapeId(col.name);
          };
        })(this));
        columns = "\n " + columns.join(",\n ") + "\n";
      }
      table_name = this.connection.escapeId(table.name);
      database_name = this.connection.escapeId(table.database.name);
      return "SELECT " + columns + " FROM " + database_name + "." + table_name + " LIMIT 1000;";
    };

    QuickQueryMysqlConnection.prototype.createDatabase = function(model, info) {
      var database;
      database = this.connection.escapeId(info.name);
      return "CREATE SCHEMA " + database + ";";
    };

    QuickQueryMysqlConnection.prototype.createTable = function(model, info) {
      var database, table;
      database = this.connection.escapeId(model.name);
      table = this.connection.escapeId(info.name);
      return "CREATE TABLE " + database + "." + table + " (\n   `id` INT NOT NULL ,\n   PRIMARY KEY (`id`)\n );";
    };

    QuickQueryMysqlConnection.prototype.createColumn = function(model, info) {
      var column, dafaultValue, database, nullable, table;
      database = this.connection.escapeId(model.database.name);
      table = this.connection.escapeId(model.name);
      column = this.connection.escapeId(info.name);
      nullable = info.nullable ? 'NULL' : 'NOT NULL';
      dafaultValue = this.escape(info["default"], info.datatype) || 'NULL';
      return ("ALTER TABLE " + database + "." + table + " ADD COLUMN " + column) + (" " + info.datatype + " " + nullable + " DEFAULT " + dafaultValue + ";");
    };

    QuickQueryMysqlConnection.prototype.alterTable = function(model, delta) {
      var database, newName, oldName, query;
      database = this.connection.escapeId(model.database.name);
      newName = this.connection.escapeId(delta.new_name);
      oldName = this.connection.escapeId(delta.old_name);
      return query = "ALTER TABLE " + database + "." + oldName + " RENAME TO " + database + "." + newName + ";";
    };

    QuickQueryMysqlConnection.prototype.alterColumn = function(model, delta) {
      var dafaultValue, database, newName, nullable, oldName, table;
      database = this.connection.escapeId(model.table.database.name);
      table = this.connection.escapeId(model.table.name);
      newName = this.connection.escapeId(delta.new_name);
      oldName = this.connection.escapeId(delta.old_name);
      nullable = delta.nullable ? 'NULL' : 'NOT NULL';
      dafaultValue = this.escape(delta["default"], delta.datatype) || 'NULL';
      return ("ALTER TABLE " + database + "." + table + " CHANGE COLUMN " + oldName + " " + newName) + (" " + delta.datatype + " " + nullable + " DEFAULT " + dafaultValue + ";");
    };

    QuickQueryMysqlConnection.prototype.dropDatabase = function(model) {
      var database;
      database = this.connection.escapeId(model.name);
      return "DROP SCHEMA " + database + ";";
    };

    QuickQueryMysqlConnection.prototype.dropTable = function(model) {
      var database, table;
      database = this.connection.escapeId(model.database.name);
      table = this.connection.escapeId(model.name);
      return "DROP TABLE " + database + "." + table + ";";
    };

    QuickQueryMysqlConnection.prototype.dropColumn = function(model) {
      var column, database, table;
      database = this.connection.escapeId(model.table.database.name);
      table = this.connection.escapeId(model.table.name);
      column = this.connection.escapeId(model.name);
      return "ALTER TABLE " + database + "." + table + " DROP COLUMN " + column + ";";
    };

    QuickQueryMysqlConnection.prototype.prepareValues = function(values, fields) {
      var f, i, j, len, obj;
      obj = {};
      for (i = j = 0, len = fields.length; j < len; i = ++j) {
        f = fields[i];
        obj[f.name] = values[i];
      }
      return obj;
    };

    QuickQueryMysqlConnection.prototype.updateRecord = function(row, fields, values) {
      var name, table, tables;
      tables = this._tableGroup(fields);
      return Promise.all((function() {
        var results;
        results = [];
        for (name in tables) {
          table = tables[name];
          results.push(new Promise((function(_this) {
            return function(resolve, reject) {
              return _this.getColumns(table, function(columns) {
                var allkeys, assings, database, j, key, keys, len, update, where;
                keys = (function() {
                  var j, len, results1;
                  results1 = [];
                  for (j = 0, len = columns.length; j < len; j++) {
                    key = columns[j];
                    if (key.primary_key) {
                      results1.push(key);
                    }
                  }
                  return results1;
                })();
                allkeys = true;
                for (j = 0, len = keys.length; j < len; j++) {
                  key = keys[j];
                  allkeys &= row[key.name] != null;
                }
                if (allkeys && keys.length > 0) {
                  assings = fields.map(function(field) {
                    var column;
                    column = ((function() {
                      var k, len1, results1;
                      results1 = [];
                      for (k = 0, len1 = columns.length; k < len1; k++) {
                        column = columns[k];
                        if (column.name === field.orgName) {
                          results1.push(column);
                        }
                      }
                      return results1;
                    })())[0];
                    return (_this.connection.escapeId(field.orgName)) + " = " + (_this.escape(values[field.name], column.datatype));
                  });
                  database = _this.connection.escapeId(table.database.name);
                  table = _this.connection.escapeId(table.name);
                  where = keys.map(function(key) {
                    return (_this.connection.escapeId(key.name)) + " = " + (_this.escape(row[key.name], key.datatype));
                  });
                  update = ("UPDATE " + database + "." + table) + (" SET " + (assings.join(','))) + " WHERE " + where.join(' AND ') + ";";
                  return resolve(update);
                } else {
                  return resolve('');
                }
              });
            };
          })(this)));
        }
        return results;
      }).call(this)).then(function(updates) {
        return new Promise(function(resolve, reject) {
          return resolve(updates.join("\n"));
        });
      });
    };

    QuickQueryMysqlConnection.prototype.insertRecord = function(fields, values) {
      var name, table, tables;
      tables = this._tableGroup(fields);
      return Promise.all((function() {
        var results;
        results = [];
        for (name in tables) {
          table = tables[name];
          results.push(new Promise((function(_this) {
            return function(resolve, reject) {
              return _this.getColumns(table, function(columns) {
                var aryfields, aryvalues, database, insert, strfields, strvalues;
                aryfields = table.fields.map(function(field) {
                  return _this.connection.escapeId(field.orgName);
                });
                strfields = aryfields.join(',');
                aryvalues = table.fields.map(function(field) {
                  var column;
                  column = ((function() {
                    var j, len, results1;
                    results1 = [];
                    for (j = 0, len = columns.length; j < len; j++) {
                      column = columns[j];
                      if (column.name === field.orgName) {
                        results1.push(column);
                      }
                    }
                    return results1;
                  })())[0];
                  return _this.escape(values[field.name], column.datatype);
                });
                strvalues = aryvalues.join(',');
                database = _this.connection.escapeId(table.database.name);
                table = _this.connection.escapeId(table.name);
                insert = ("INSERT INTO " + database + "." + table) + (" (" + strfields + ") VALUES (" + strvalues + ");");
                return resolve(insert);
              });
            };
          })(this)));
        }
        return results;
      }).call(this)).then(function(inserts) {
        return new Promise(function(resolve, reject) {
          return resolve(inserts.join("\n"));
        });
      });
    };

    QuickQueryMysqlConnection.prototype.deleteRecord = function(row, fields) {
      var name, table, tables;
      tables = this._tableGroup(fields);
      return Promise.all((function() {
        var results;
        results = [];
        for (name in tables) {
          table = tables[name];
          results.push(new Promise((function(_this) {
            return function(resolve, reject) {
              return _this.getColumns(table, function(columns) {
                var allkeys, database, del, j, key, keys, len, where;
                keys = (function() {
                  var j, len, results1;
                  results1 = [];
                  for (j = 0, len = columns.length; j < len; j++) {
                    key = columns[j];
                    if (key.primary_key) {
                      results1.push(key);
                    }
                  }
                  return results1;
                })();
                allkeys = true;
                for (j = 0, len = keys.length; j < len; j++) {
                  key = keys[j];
                  allkeys &= row[key.name] != null;
                }
                if (allkeys && keys.length > 0) {
                  database = _this.connection.escapeId(table.database.name);
                  table = _this.connection.escapeId(table.name);
                  where = keys.map(function(key) {
                    return (_this.connection.escapeId(key.name)) + " = " + (_this.escape(row[key.name], key.datatype));
                  });
                  del = ("DELETE FROM " + database + "." + table) + " WHERE " + where.join(' AND ') + ";";
                  return resolve(del);
                } else {
                  return resolve('');
                }
              });
            };
          })(this)));
        }
        return results;
      }).call(this)).then(function(deletes) {
        return new Promise(function(resolve, reject) {
          return resolve(deletes.join("\n"));
        });
      });
    };

    QuickQueryMysqlConnection.prototype._tableGroup = function(fields) {
      var field, j, len, name1, tables;
      tables = {};
      for (j = 0, len = fields.length; j < len; j++) {
        field = fields[j];
        if (field.orgTable != null) {
          if (tables[name1 = field.orgTable] == null) {
            tables[name1] = {
              name: field.orgTable,
              database: {
                name: field.db
              },
              fields: []
            };
          }
          tables[field.orgTable].fields.push(field);
        }
      }
      return tables;
    };

    QuickQueryMysqlConnection.prototype.onDidChangeDefaultDatabase = function(callback) {
      return this.emitter.on('did-change-default-database', callback);
    };

    QuickQueryMysqlConnection.prototype.getDataTypes = function() {
      return this.n_types.concat(this.s_types);
    };

    QuickQueryMysqlConnection.prototype.toString = function() {
      return this.protocol + "://" + this.connection.config.user + "@" + this.connection.config.host;
    };

    QuickQueryMysqlConnection.prototype.escape = function(value, type) {
      var j, len, ref, t1;
      ref = this.s_types;
      for (j = 0, len = ref.length; j < len; j++) {
        t1 = ref[j];
        if (value === null || type.search(new RegExp(t1, "i")) !== -1) {
          return this.connection.escape(value);
        }
      }
      return value.toString();
    };

    return QuickQueryMysqlConnection;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL3F1aWNrLXF1ZXJ5L2xpYi9xdWljay1xdWVyeS1teXNxbC1jb25uZWN0aW9uLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSOztFQUVQLFVBQVcsT0FBQSxDQUFRLE1BQVI7O0VBRU47b0NBQ0osSUFBQSxHQUFNOztvQ0FDTixVQUFBLEdBQVk7O0lBQ0MsK0JBQUMsTUFBRCxFQUFRLEdBQVI7TUFBQyxJQUFDLENBQUEsUUFBRDtNQUNaLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBLEtBQUssQ0FBQztNQUNyQixJQUFDLENBQUEsSUFBRCxHQUFRLEdBQUksQ0FBQSxPQUFBO01BQ1osSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUE7TUFDWCxJQUFDLENBQUEsV0FBRCxHQUFlLEdBQUksQ0FBQSxLQUFBLENBQUosS0FBYztNQUM3QixJQUFDLENBQUEsUUFBRCxHQUFZLEdBQUksQ0FBQSxNQUFBO01BQ2hCLElBQUMsRUFBQSxPQUFBLEVBQUQsR0FBVyxHQUFJLENBQUEsU0FBQTtNQUNmLElBQUMsQ0FBQSxRQUFELEdBQVksR0FBSSxDQUFBLE1BQUEsQ0FBSixLQUFlO0lBUGhCOztvQ0FRYixRQUFBLEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQTtJQURPOztvQ0FFVixNQUFBLEdBQVEsU0FBQTthQUNOLElBQUMsQ0FBQTtJQURLOztvQ0FFUixRQUFBLEdBQVUsU0FBQyxRQUFEO2FBQ1IsUUFBQSxDQUFTLEVBQVQ7SUFEUTs7Ozs7O0VBR047bUNBQ0osSUFBQSxHQUFNOzttQ0FDTixVQUFBLEdBQVk7O0lBQ0MsOEJBQUMsU0FBRCxFQUFXLEdBQVgsRUFBZSxNQUFmO01BQUMsSUFBQyxDQUFBLFdBQUQ7TUFDWixJQUFDLENBQUEsVUFBRCxHQUFjLElBQUMs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QUNBLFFBQUEsRUFBVTtnQkFBQyxJQUFBLEVBQU0sS0FBSyxDQUFDLEVBQWI7ZUFEVjtjQUVBLE1BQUEsRUFBUSxFQUZSOzs7VUFHRixNQUFPLENBQUEsS0FBSyxDQUFDLFFBQU4sQ0FBZSxDQUFDLE1BQU0sQ0FBQyxJQUE5QixDQUFtQyxLQUFuQyxFQUxGOztBQURGO2FBT0E7SUFUVzs7d0NBV2IsMEJBQUEsR0FBNEIsU0FBQyxRQUFEO2FBQzFCLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLDZCQUFaLEVBQTJDLFFBQTNDO0lBRDBCOzt3Q0FHNUIsWUFBQSxHQUFjLFNBQUE7YUFDWixJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBZ0IsSUFBQyxDQUFBLE9BQWpCO0lBRFk7O3dDQUdkLFFBQUEsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLFFBQUQsR0FBVSxLQUFWLEdBQWdCLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFBTSxDQUFDLElBQW5DLEdBQXdDLEdBQXhDLEdBQTRDLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFBTSxDQUFDO0lBRHZEOzt3Q0FHVixNQUFBLEdBQVEsU0FBQyxLQUFELEVBQU8sSUFBUDtBQUNOLFVBQUE7QUFBQTtBQUFBLFdBQUEscUNBQUE7O1FBQ0UsSUFBRyxLQUFBLEtBQVMsSUFBVCxJQUFpQixJQUFJLENBQUMsTUFBTCxDQUFZLElBQUksTUFBSixDQUFXLEVBQVgsRUFBZSxHQUFmLENBQVosQ0FBQSxLQUFvQyxDQUFDLENBQXpEO0FBQ0UsaUJBQU8sSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLENBQW1CLEtBQW5CLEVBRFQ7O0FBREY7YUFHQSxLQUFLLENBQUMsUUFBTixDQUFBO0lBSk07Ozs7O0FBNVRWIiwic291cmNlc0NvbnRlbnQiOlsibXlzcWwgPSByZXF1aXJlICdteXNxbCdcblxue0VtaXR0ZXJ9ID0gcmVxdWlyZSAnYXRvbSdcblxuY2xhc3MgUXVpY2tRdWVyeU15c3FsQ29sdW1uXG4gIHR5cGU6ICdjb2x1bW4nXG4gIGNoaWxkX3R5cGU6IG51bGxcbiAgY29uc3RydWN0b3I6IChAdGFibGUscm93KSAtPlxuICAgIEBjb25uZWN0aW9uID0gQHRhYmxlLmNvbm5lY3Rpb25cbiAgICBAbmFtZSA9IHJvd1snRmllbGQnXVxuICAgIEBjb2x1bW4gPSBAbmFtZSAjIFRPRE8gcmVtb3ZlXG4gICAgQHByaW1hcnlfa2V5ID0gcm93W1wiS2V5XCJdID09IFwiUFJJXCJcbiAgICBAZGF0YXR5cGUgPSByb3dbJ1R5cGUnXVxuICAgIEBkZWZhdWx0ID0gcm93WydEZWZhdWx0J11cbiAgICBAbnVsbGFibGUgPSByb3dbJ051bGwnXSA9PSAnWUVTJ1xuICB0b1N0cmluZzogLT5cbiAgICBAbmFtZVxuICBwYXJlbnQ6IC0+XG4gICAgQHRhYmxlXG4gIGNoaWxkcmVuOiAoY2FsbGJhY2spLT5cbiAgICBjYWxsYmFjayhbXSlcblxuY2xhc3MgUXVpY2tRdWVyeU15c3FsVGFibGVcbiAgdHlwZTogJ3RhYmxlJ1xuICBjaGlsZF90eXBlOiAnY29sdW1uJ1xuICBjb25zdHJ1Y3RvcjogKEBkYXRhYmFzZSxyb3csZmllbGRzKSAtPlxuICAgIEBjb25uZWN0aW9uID0gQGRhdGFiYXNlLmNvbm5lY3Rpb25cbiAgICBAbmFtZSA9IHJvd1tmaWVsZHNbMF0ubmFtZV1cbiAgICBAdGFibGUgPSBAbmFtZSAjIFRPRE8gcmVtb3ZlXG4gIHRvU3RyaW5nOiAtPlxuICAgIEBuYW1lXG4gIHBhcmVudDogLT5cbiAgICBAZGF0YWJhc2VcbiAgY2hpbGRyZW46IChjYWxsYmFjayktPlxuICAgIEBjb25uZWN0aW9uLmdldENvbHVtbnMoQCxjYWxsYmFjaylcbmNsYXNzIFF1aWNrUXVlcnlNeXNxbERhdGFiYXNlXG4gIHR5cGU6ICdkYXRhYmFzZSdcbiAgY2hpbGRfdHlwZTogJ3RhYmxlJ1xuICBjb25zdHJ1Y3RvcjogKEBjb25uZWN0aW9uLHJvdykgLT5cbiAgICBAbmFtZSA9IHJvd1tcIkRhdGFiYXNlXCJdXG4gICAgQGRhdGFiYXNlID0gQG5hbWUgIyBUT0RPIHJlbW92ZVxuICB0b1N0cmluZzogLT5cbiAgICBAbmFtZVxuICBwYXJlbnQ6IC0+XG4gICAgQGNvbm5lY3Rpb25cbiAgY2hpbGRyZW46IChjYWxsYmFjayktPlxuICAgIEBjb25uZWN0aW9uLmdldFRhYmxlcyhALGNhbGxiYWNrKVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBRdWlja1F1ZXJ5TXlzcWxDb25uZWN0aW9uXG5cbiAgZmF0YWw6IGZhbHNlXG4gIGNvbm5lY3Rpb246IG51bGxcbiAgcHJvdG9jb2w6ICdteXNxbCdcbiAgdHlwZTogJ2Nvbm5lY3Rpb24nXG4gIGNoaWxkX3R5cGU6ICdkYXRhYmFzZSdcbiAgdGltZW91dDogNDAwMDBcblxuICBuX3R5cGVzOiAnVElOWUlOVCBTTUFMTElOVCBNRURJVU1JTlQgSU5UIElOVEVHRVIgQklHSU5UIEZMT0FUIERPVUJMRSBSRUFMIERFQ0lNQUwgTlVNRVJJQyBUSU1FU1RBTVAgWUVBUiBFTlVNIFNFVCcuc3BsaXQgL1xccysvXG4gIHNfdHlwZXM6ICdDSEFSIFZBUkNIQVIgVElOWUJMT0IgVElOWVRFWFQgTUVESVVNQkxPQiBNRURJVU1URVhUIExPTkdCTE9CIExPTkdURVhUIEJMT0IgVEVYVCBEQVRFVElNRSBEQVRFIFRJTUUnLnNwbGl0IC9cXHMrL1xuXG4gIGFsbG93RWRpdGlvbjogdHJ1ZVxuICBAZGVmYXVsdFBvcnQ6IDMzMDZcblxuICBjb25zdHJ1Y3RvcjogKEBpbmZvKS0+XG4gICAgQGluZm8uZGF0ZVN0cmluZ3MgPSB0cnVlXG4gICAgQGluZm8ubXVsdGlwbGVTdGF0ZW1lbnRzID0gdHJ1ZVxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXIoKVxuXG4gIGNvbm5lY3Q6IChjYWxsYmFjayktPlxuICAgIEBjb25uZWN0aW9uID0gbXlzcWwuY3JlYXRlQ29ubmVjdGlvbihAaW5mbylcbiAgICBAY29ubmVjdGlvbi5vbiAnZXJyb3InLCAoZXJyKSA9PlxuICAgICAgaWYgZXJyICYmIGVyci5jb2RlID09ICdQUk9UT0NPTF9DT05ORUNUSU9OX0xPU1QnXG4gICAgICAgIEBmYXRhbCA9IHRydWVcbiAgICBAY29ubmVjdGlvbi5jb25uZWN0KGNhbGxiYWNrKVxuXG4gIHNlcmlhbGl6ZTogLT5cbiAgICBjID0gQGNvbm5lY3Rpb24uY29uZmlnXG4gICAgaG9zdDogYy5ob3N0LFxuICAgIHBvcnQ6IGMucG9ydCxcbiAgICBwcm90b2NvbDogQHByb3RvY29sXG4gICAgZGF0YWJhc2U6IGMuZGF0YWJhc2UsXG4gICAgdXNlcjogYy51c2VyLFxuICAgIHBhc3N3b3JkOiBjLnBhc3N3b3JkXG5cbiAgZGlzcG9zZTogLT5cbiAgICBAY2xvc2UoKVxuXG4gIGNsb3NlOiAtPlxuICAgIEBjb25uZWN0aW9uLmVuZCgpXG5cbiAgcXVlcnk6ICh0ZXh0LGNhbGxiYWNrKSAtPlxuICAgIGlmIEBmYXRhbFxuICAgICAgQGNvbm5lY3Rpb24gPSBteXNxbC5jcmVhdGVDb25uZWN0aW9uKEBpbmZvKVxuICAgICAgQGNvbm5lY3Rpb24ub24gJ2Vycm9yJywgKGVycikgPT5cbiAgICAgICAgaWYgZXJyICYmIGVyci5jb2RlID09ICdQUk9UT0NPTF9DT05ORUNUSU9OX0xPU1QnXG4gICAgICAgICAgQGZhdGFsID0gdHJ1ZVxuICAgICAgQGZhdGFsID0gZmFsc2VcbiAgICBAY29ubmVjdGlvbi5xdWVyeSB7c3FsOiB0ZXh0ICwgdGltZW91dDogQHRpbWVvdXQgfSwgKGVyciwgcm93cywgZmllbGRzKT0+XG4gICAgICBpZiAoZXJyKVxuICAgICAgICBAZmF0YWwgPSBlcnIuZmF0YWxcbiAgICAgICAgY2FsbGJhY2sgIHR5cGU6ICdlcnJvcicgLCBjb250ZW50OiBlcnIudG9TdHJpbmcoKVxuICAgICAgZWxzZSBpZiAhZmllbGRzXG4gICAgICAgIGNhbGxiYWNrIHR5cGU6ICdzdWNjZXNzJywgY29udGVudDogIHJvd3MuYWZmZWN0ZWRSb3dzK1wiIHJvdyhzKSBhZmZlY3RlZFwiXG4gICAgICBlbHNlIGlmIGZpZWxkcy5sZW5ndGggPT0gMCB8fCAoIUFycmF5LmlzQXJyYXkoZmllbGRzWzBdKSAmJiBmaWVsZHNbMF0/KVxuICAgICAgICBjYWxsYmFjayhudWxsLHJvd3MsZmllbGRzKVxuICAgICAgZWxzZSAjLS0gTXVsdGlwbGUgU3RhdGVtZW50c1xuICAgICAgICBhZmZlY3RlZFJvd3MgPSByb3dzLm1hcCAocm93KS0+XG4gICAgICAgICAgaWYgcm93LmFmZmVjdGVkUm93cz8gdGhlbiByb3cuYWZmZWN0ZWRSb3dzIGVsc2UgMFxuICAgICAgICBhZmZlY3RlZFJvd3MgPSBhZmZlY3RlZFJvd3MucmVkdWNlIChyMSxyMiktPiByMStyMlxuICAgICAgICBpZiBmaWVsZHNbMF0/ICYmIGFmZmVjdGVkUm93cyA9PSAwXG4gICAgICAgICAgY2FsbGJhY2sobnVsbCxyb3dzWzBdLGZpZWxkc1swXSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGNhbGxiYWNrIHR5cGU6ICdzdWNjZXNzJywgY29udGVudDogIGFmZmVjdGVkUm93cytcIiByb3cocykgYWZmZWN0ZWRcIlxuXG4gIHNldERlZmF1bHREYXRhYmFzZTogKGRhdGFiYXNlKS0+XG4gICAgQGNvbm5lY3Rpb24uY2hhbmdlVXNlciBkYXRhYmFzZTogZGF0YWJhc2UsID0+XG4gICAgICBAZW1pdHRlci5lbWl0ICdkaWQtY2hhbmdlLWRlZmF1bHQtZGF0YWJhc2UnLCBAY29ubmVjdGlvbi5jb25maWcuZGF0YWJhc2VcblxuICBnZXREZWZhdWx0RGF0YWJhc2U6IC0+XG4gICAgQGNvbm5lY3Rpb24uY29uZmlnLmRhdGFiYXNlXG5cbiAgcGFyZW50OiAtPiBAXG5cbiAgY2hpbGRyZW46IChjYWxsYmFjayktPlxuICAgIEBnZXREYXRhYmFzZXMgKGRhdGFiYXNlcyxlcnIpLT5cbiAgICAgIHVubGVzcyBlcnI/IHRoZW4gY2FsbGJhY2soZGF0YWJhc2VzKSBlbHNlIGNvbnNvbGUubG9nIGVyclxuXG4gIGdldERhdGFiYXNlczogKGNhbGxiYWNrKSAtPlxuICAgIHRleHQgPSBcIlNIT1cgREFUQUJBU0VTXCJcbiAgICBAcXVlcnkgdGV4dCAsIChlcnIsIHJvd3MsIGZpZWxkcykgPT5cbiAgICAgIGlmICFlcnJcbiAgICAgICAgZGF0YWJhc2VzID0gcm93cy5tYXAgKHJvdykgPT5cbiAgICAgICAgICBuZXcgUXVpY2tRdWVyeU15c3FsRGF0YWJhc2UoQCxyb3cpXG4gICAgICAgIGRhdGFiYXNlcyA9IGRhdGFiYXNlcy5maWx0ZXIgKGRhdGFiYXNlKSA9PiAhQGhpZGRlbkRhdGFiYXNlKGRhdGFiYXNlLm5hbWUpXG4gICAgICBjYWxsYmFjayhkYXRhYmFzZXMsZXJyKVxuXG4gIGdldFRhYmxlczogKGRhdGFiYXNlLGNhbGxiYWNrKSAtPlxuICAgIGRhdGFiYXNlX25hbWUgPSBAY29ubmVjdGlvbi5lc2NhcGVJZChkYXRhYmFzZS5uYW1lKVxuICAgIHRleHQgPSBcIlNIT1cgVEFCTEVTIElOICN7ZGF0YWJhc2VfbmFtZX1cIlxuICAgIEBxdWVyeSB0ZXh0ICwgKGVyciwgcm93cywgZmllbGRzKSA9PlxuICAgICAgaWYgIWVyclxuICAgICAgICB0YWJsZXMgPSByb3dzLm1hcCAocm93KSA9PlxuICAgICAgICAgIG5ldyBRdWlja1F1ZXJ5TXlzcWxUYWJsZShkYXRhYmFzZSxyb3csZmllbGRzKVxuICAgICAgICBjYWxsYmFjayh0YWJsZXMpXG5cbiAgZ2V0Q29sdW1uczogKHRhYmxlLGNhbGxiYWNrKSAtPlxuICAgIHRhYmxlX25hbWUgPSBAY29ubmVjdGlvbi5lc2NhcGVJZCh0YWJsZS5uYW1lKVxuICAgIGRhdGFiYXNlX25hbWUgPSBAY29ubmVjdGlvbi5lc2NhcGVJZCh0YWJsZS5kYXRhYmFzZS5uYW1lKVxuICAgIHRleHQgPSBcIlNIT1cgQ09MVU1OUyBJTiAje3RhYmxlX25hbWV9IElOICN7ZGF0YWJhc2VfbmFtZX1cIlxuICAgIEBxdWVyeSB0ZXh0ICwgKGVyciwgcm93cywgZmllbGRzKSA9PlxuICAgICAgaWYgIWVyclxuICAgICAgICBjb2x1bW5zID0gcm93cy5tYXAgKHJvdykgPT5cbiAgICAgICAgICBuZXcgUXVpY2tRdWVyeU15c3FsQ29sdW1uKHRhYmxlLHJvdylcbiAgICAgICAgY2FsbGJhY2soY29sdW1ucylcblxuICBoaWRkZW5EYXRhYmFzZTogKGRhdGFiYXNlKSAtPlxuICAgIGRhdGFiYXNlID09IFwiaW5mb3JtYXRpb25fc2NoZW1hXCIgfHxcbiAgICBkYXRhYmFzZSA9PSBcInBlcmZvcm1hbmNlX3NjaGVtYVwiIHx8XG4gICAgZGF0YWJhc2UgPT0gXCJzeXNcIiB8fFxuICAgIGRhdGFiYXNlID09IFwibXlzcWxcIlxuXG4gIHNpbXBsZVNlbGVjdDogKHRhYmxlLCBjb2x1bW5zID0gJyonKSAtPlxuICAgIGlmIGNvbHVtbnMgIT0gJyonXG4gICAgICBjb2x1bW5zID0gY29sdW1ucy5tYXAgKGNvbCkgPT5cbiAgICAgICAgQGNvbm5lY3Rpb24uZXNjYXBlSWQoY29sLm5hbWUpXG4gICAgICBjb2x1bW5zID0gXCJcXG4gXCIrY29sdW1ucy5qb2luKFwiLFxcbiBcIikgKyBcIlxcblwiXG4gICAgdGFibGVfbmFtZSA9IEBjb25uZWN0aW9uLmVzY2FwZUlkKHRhYmxlLm5hbWUpXG4gICAgZGF0YWJhc2VfbmFtZSA9IEBjb25uZWN0aW9uLmVzY2FwZUlkKHRhYmxlLmRhdGFiYXNlLm5hbWUpXG4gICAgXCJTRUxFQ1QgI3tjb2x1bW5zfSBGUk9NICN7ZGF0YWJhc2VfbmFtZX0uI3t0YWJsZV9uYW1lfSBMSU1JVCAxMDAwO1wiXG5cblxuICBjcmVhdGVEYXRhYmFzZTogKG1vZGVsLGluZm8pLT5cbiAgICBkYXRhYmFzZSA9IEBjb25uZWN0aW9uLmVzY2FwZUlkKGluZm8ubmFtZSlcbiAgICBcIkNSRUFURSBTQ0hFTUEgI3tkYXRhYmFzZX07XCJcblxuICBjcmVhdGVUYWJsZTogKG1vZGVsLGluZm8pLT5cbiAgICBkYXRhYmFzZSA9IEBjb25uZWN0aW9uLmVzY2FwZUlkKG1vZGVsLm5hbWUpXG4gICAgdGFibGUgPSBAY29ubmVjdGlvbi5lc2NhcGVJZChpbmZvLm5hbWUpXG4gICAgXCJcIlwiXG4gICAgQ1JFQVRFIFRBQkxFICN7ZGF0YWJhc2V9LiN7dGFibGV9IChcbiAgICAgICBgaWRgIElOVCBOT1QgTlVMTCAsXG4gICAgICAgUFJJTUFSWSBLRVkgKGBpZGApXG4gICAgICk7XG4gICAgXCJcIlwiXG5cbiAgY3JlYXRlQ29sdW1uOiAobW9kZWwsaW5mbyktPlxuICAgIGRhdGFiYXNlID0gQGNvbm5lY3Rpb24uZXNjYXBlSWQobW9kZWwuZGF0YWJhc2UubmFtZSlcbiAgICB0YWJsZSA9IEBjb25uZWN0aW9uLmVzY2FwZUlkKG1vZGVsLm5hbWUpXG4gICAgY29sdW1uID0gQGNvbm5lY3Rpb24uZXNjYXBlSWQoaW5mby5uYW1lKVxuICAgIG51bGxhYmxlID0gaWYgaW5mby5udWxsYWJsZSB0aGVuICdOVUxMJyBlbHNlICdOT1QgTlVMTCdcbiAgICBkYWZhdWx0VmFsdWUgPSBAZXNjYXBlKGluZm8uZGVmYXVsdCxpbmZvLmRhdGF0eXBlKSB8fCAnTlVMTCdcbiAgICBcIkFMVEVSIFRBQkxFICN7ZGF0YWJhc2V9LiN7dGFibGV9IEFERCBDT0xVTU4gI3tjb2x1bW59XCIrXG4gICAgXCIgI3tpbmZvLmRhdGF0eXBlfSAje251bGxhYmxlfSBERUZBVUxUICN7ZGFmYXVsdFZhbHVlfTtcIlxuXG5cbiAgYWx0ZXJUYWJsZTogKG1vZGVsLGRlbHRhKS0+XG4gICAgZGF0YWJhc2UgPSBAY29ubmVjdGlvbi5lc2NhcGVJZChtb2RlbC5kYXRhYmFzZS5uYW1lKVxuICAgIG5ld05hbWUgPSBAY29ubmVjdGlvbi5lc2NhcGVJZChkZWx0YS5uZXdfbmFtZSlcbiAgICBvbGROYW1lID0gQGNvbm5lY3Rpb24uZXNjYXBlSWQoZGVsdGEub2xkX25hbWUpXG4gICAgcXVlcnkgPSBcIkFMVEVSIFRBQkxFICN7ZGF0YWJhc2V9LiN7b2xkTmFtZX0gUkVOQU1FIFRPICN7ZGF0YWJhc2V9LiN7bmV3TmFtZX07XCJcblxuICBhbHRlckNvbHVtbjogKG1vZGVsLGRlbHRhKS0+XG4gICAgZGF0YWJhc2UgPSBAY29ubmVjdGlvbi5lc2NhcGVJZChtb2RlbC50YWJsZS5kYXRhYmFzZS5uYW1lKVxuICAgIHRhYmxlID0gQGNvbm5lY3Rpb24uZXNjYXBlSWQobW9kZWwudGFibGUubmFtZSlcbiAgICBuZXdOYW1lID0gQGNvbm5lY3Rpb24uZXNjYXBlSWQoZGVsdGEubmV3X25hbWUpXG4gICAgb2xkTmFtZSA9IEBjb25uZWN0aW9uLmVzY2FwZUlkKGRlbHRhLm9sZF9uYW1lKVxuICAgIG51bGxhYmxlID0gaWYgZGVsdGEubnVsbGFibGUgdGhlbiAnTlVMTCcgZWxzZSAnTk9UIE5VTEwnXG4gICAgZGFmYXVsdFZhbHVlID0gQGVzY2FwZShkZWx0YS5kZWZhdWx0LGRlbHRhLmRhdGF0eXBlKSB8fCAnTlVMTCdcbiAgICBcIkFMVEVSIFRBQkxFICN7ZGF0YWJhc2V9LiN7dGFibGV9IENIQU5HRSBDT0xVTU4gI3tvbGROYW1lfSAje25ld05hbWV9XCIrXG4gICAgXCIgI3tkZWx0YS5kYXRhdHlwZX0gI3tudWxsYWJsZX0gREVGQVVMVCAje2RhZmF1bHRWYWx1ZX07XCJcblxuICBkcm9wRGF0YWJhc2U6IChtb2RlbCktPlxuICAgIGRhdGFiYXNlID0gQGNvbm5lY3Rpb24uZXNjYXBlSWQobW9kZWwubmFtZSlcbiAgICBcIkRST1AgU0NIRU1BICN7ZGF0YWJhc2V9O1wiXG5cbiAgZHJvcFRhYmxlOiAobW9kZWwpLT5cbiAgICBkYXRhYmFzZSA9IEBjb25uZWN0aW9uLmVzY2FwZUlkKG1vZGVsLmRhdGFiYXNlLm5hbWUpXG4gICAgdGFibGUgPSBAY29ubmVjdGlvbi5lc2NhcGVJZChtb2RlbC5uYW1lKVxuICAgIFwiRFJPUCBUQUJMRSAje2RhdGFiYXNlfS4je3RhYmxlfTtcIlxuXG4gIGRyb3BDb2x1bW46IChtb2RlbCktPlxuICAgIGRhdGFiYXNlID0gQGNvbm5lY3Rpb24uZXNjYXBlSWQobW9kZWwudGFibGUuZGF0YWJhc2UubmFtZSlcbiAgICB0YWJsZSA9IEBjb25uZWN0aW9uLmVzY2FwZUlkKG1vZGVsLnRhYmxlLm5hbWUpXG4gICAgY29sdW1uID0gQGNvbm5lY3Rpb24uZXNjYXBlSWQobW9kZWwubmFtZSlcbiAgICBcIkFMVEVSIFRBQkxFICN7ZGF0YWJhc2V9LiN7dGFibGV9IERST1AgQ09MVU1OICN7Y29sdW1ufTtcIlxuXG4gIHByZXBhcmVWYWx1ZXM6ICh2YWx1ZXMsZmllbGRzKS0+XG4gICAgb2JqID0ge31cbiAgICBvYmpbZi5uYW1lXSA9IHZhbHVlc1tpXSBmb3IgZixpIGluIGZpZWxkc1xuICAgIHJldHVybiBvYmpcblxuICB1cGRhdGVSZWNvcmQ6IChyb3csZmllbGRzLHZhbHVlcyktPlxuICAgIHRhYmxlcyA9IEBfdGFibGVHcm91cChmaWVsZHMpXG4gICAgUHJvbWlzZS5hbGwoXG4gICAgICBmb3IgbmFtZSx0YWJsZSBvZiB0YWJsZXNcbiAgICAgICAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgICAgICBAZ2V0Q29sdW1ucyB0YWJsZSwgKGNvbHVtbnMpPT5cbiAgICAgICAgICAgIGtleXMgPSAoa2V5IGZvciBrZXkgaW4gY29sdW1ucyB3aGVuIGtleS5wcmltYXJ5X2tleSlcbiAgICAgICAgICAgIGFsbGtleXMgPSB0cnVlXG4gICAgICAgICAgICBhbGxrZXlzICY9IHJvd1trZXkubmFtZV0/IGZvciBrZXkgaW4ga2V5c1xuICAgICAgICAgICAgaWYgYWxsa2V5cyAmJiBrZXlzLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgYXNzaW5ncyA9IGZpZWxkcy5tYXAgKGZpZWxkKSA9PlxuICAgICAgICAgICAgICAgIGNvbHVtbiA9IChjb2x1bW4gZm9yIGNvbHVtbiBpbiBjb2x1bW5zIHdoZW4gY29sdW1uLm5hbWUgPT0gZmllbGQub3JnTmFtZSlbMF1cbiAgICAgICAgICAgICAgICBcIiN7QGNvbm5lY3Rpb24uZXNjYXBlSWQoZmllbGQub3JnTmFtZSl9ID0gI3tAZXNjYXBlKHZhbHVlc1tmaWVsZC5uYW1lXSxjb2x1bW4uZGF0YXR5cGUpfVwiXG4gICAgICAgICAgICAgIGRhdGFiYXNlID0gQGNvbm5lY3Rpb24uZXNjYXBlSWQodGFibGUuZGF0YWJhc2UubmFtZSlcbiAgICAgICAgICAgICAgdGFibGUgPSBAY29ubmVjdGlvbi5lc2NhcGVJZCh0YWJsZS5uYW1lKVxuICAgICAgICAgICAgICB3aGVyZSA9IGtleXMubWFwIChrZXkpPT4gXCIje0Bjb25uZWN0aW9uLmVzY2FwZUlkKGtleS5uYW1lKX0gPSAje0Blc2NhcGUocm93W2tleS5uYW1lXSxrZXkuZGF0YXR5cGUpfVwiXG4gICAgICAgICAgICAgIHVwZGF0ZSA9IFwiVVBEQVRFICN7ZGF0YWJhc2V9LiN7dGFibGV9XCIrXG4gICAgICAgICAgICAgIFwiIFNFVCAje2Fzc2luZ3Muam9pbignLCcpfVwiK1xuICAgICAgICAgICAgICBcIiBXSEVSRSBcIit3aGVyZS5qb2luKCcgQU5EICcpK1wiO1wiXG4gICAgICAgICAgICAgIHJlc29sdmUodXBkYXRlKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICByZXNvbHZlKCcnKVxuICAgICkudGhlbiAodXBkYXRlcykgLT4gKG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+IHJlc29sdmUodXBkYXRlcy5qb2luKFwiXFxuXCIpKSlcblxuICBpbnNlcnRSZWNvcmQ6IChmaWVsZHMsdmFsdWVzKS0+XG4gICAgdGFibGVzID0gQF90YWJsZUdyb3VwKGZpZWxkcylcbiAgICBQcm9taXNlLmFsbChcbiAgICAgIGZvciBuYW1lLHRhYmxlIG9mIHRhYmxlc1xuICAgICAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgICAgIEBnZXRDb2x1bW5zIHRhYmxlLCAoY29sdW1ucyk9PlxuICAgICAgICAgICAgYXJ5ZmllbGRzID0gdGFibGUuZmllbGRzLm1hcCAoZmllbGQpID0+XG4gICAgICAgICAgICAgIEBjb25uZWN0aW9uLmVzY2FwZUlkKGZpZWxkLm9yZ05hbWUpXG4gICAgICAgICAgICBzdHJmaWVsZHMgPSBhcnlmaWVsZHMuam9pbignLCcpXG4gICAgICAgICAgICBhcnl2YWx1ZXMgPSB0YWJsZS5maWVsZHMubWFwIChmaWVsZCkgPT5cbiAgICAgICAgICAgICAgY29sdW1uID0gKGNvbHVtbiBmb3IgY29sdW1uIGluIGNvbHVtbnMgd2hlbiBjb2x1bW4ubmFtZSA9PSBmaWVsZC5vcmdOYW1lKVswXVxuICAgICAgICAgICAgICBAZXNjYXBlKHZhbHVlc1tmaWVsZC5uYW1lXSxjb2x1bW4uZGF0YXR5cGUpXG4gICAgICAgICAgICBzdHJ2YWx1ZXMgPSBhcnl2YWx1ZXMuam9pbignLCcpXG4gICAgICAgICAgICBkYXRhYmFzZSA9IEBjb25uZWN0aW9uLmVzY2FwZUlkKHRhYmxlLmRhdGFiYXNlLm5hbWUpXG4gICAgICAgICAgICB0YWJsZSA9IEBjb25uZWN0aW9uLmVzY2FwZUlkKHRhYmxlLm5hbWUpXG4gICAgICAgICAgICBpbnNlcnQgPSBcIklOU0VSVCBJTlRPICN7ZGF0YWJhc2V9LiN7dGFibGV9XCIrXG4gICAgICAgICAgICBcIiAoI3tzdHJmaWVsZHN9KSBWQUxVRVMgKCN7c3RydmFsdWVzfSk7XCJcbiAgICAgICAgICAgIHJlc29sdmUoaW5zZXJ0KVxuICAgICkudGhlbiAoaW5zZXJ0cykgLT4gKG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+IHJlc29sdmUoaW5zZXJ0cy5qb2luKFwiXFxuXCIpKSlcblxuICBkZWxldGVSZWNvcmQ6IChyb3csZmllbGRzKS0+XG4gICAgdGFibGVzID0gQF90YWJsZUdyb3VwKGZpZWxkcylcbiAgICBQcm9taXNlLmFsbChcbiAgICAgIGZvciBuYW1lLHRhYmxlIG9mIHRhYmxlc1xuICAgICAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgICAgIEBnZXRDb2x1bW5zIHRhYmxlLCAoY29sdW1ucyk9PlxuICAgICAgICAgICAga2V5cyA9IChrZXkgZm9yIGtleSBpbiBjb2x1bW5zIHdoZW4ga2V5LnByaW1hcnlfa2V5KVxuICAgICAgICAgICAgYWxsa2V5cyA9IHRydWVcbiAgICAgICAgICAgIGFsbGtleXMgJj0gcm93W2tleS5uYW1lXT8gZm9yIGtleSBpbiBrZXlzXG4gICAgICAgICAgICBpZiBhbGxrZXlzICYmIGtleXMubGVuZ3RoID4gMFxuICAgICAgICAgICAgICBkYXRhYmFzZSA9IEBjb25uZWN0aW9uLmVzY2FwZUlkKHRhYmxlLmRhdGFiYXNlLm5hbWUpXG4gICAgICAgICAgICAgIHRhYmxlID0gQGNvbm5lY3Rpb24uZXNjYXBlSWQodGFibGUubmFtZSlcbiAgICAgICAgICAgICAgd2hlcmUgPSBrZXlzLm1hcCAoa2V5KT0+IFwiI3tAY29ubmVjdGlvbi5lc2NhcGVJZChrZXkubmFtZSl9ID0gI3tAZXNjYXBlKHJvd1trZXkubmFtZV0sa2V5LmRhdGF0eXBlKX1cIlxuICAgICAgICAgICAgICBkZWwgPSBcIkRFTEVURSBGUk9NICN7ZGF0YWJhc2V9LiN7dGFibGV9XCIrXG4gICAgICAgICAgICAgIFwiIFdIRVJFIFwiK3doZXJlLmpvaW4oJyBBTkQgJykrXCI7XCJcbiAgICAgICAgICAgICAgcmVzb2x2ZShkZWwpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHJlc29sdmUoJycpXG4gICAgKS50aGVuIChkZWxldGVzKSAtPiAobmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgLT4gcmVzb2x2ZShkZWxldGVzLmpvaW4oXCJcXG5cIikpKVxuXG4gIF90YWJsZUdyb3VwOiAoZmllbGRzKS0+XG4gICAgdGFibGVzID0ge31cbiAgICBmb3IgZmllbGQgaW4gZmllbGRzXG4gICAgICBpZiBmaWVsZC5vcmdUYWJsZT9cbiAgICAgICAgdGFibGVzW2ZpZWxkLm9yZ1RhYmxlXSA/PVxuICAgICAgICAgIG5hbWU6IGZpZWxkLm9yZ1RhYmxlXG4gICAgICAgICAgZGF0YWJhc2U6IHtuYW1lOiBmaWVsZC5kYn1cbiAgICAgICAgICBmaWVsZHM6IFtdXG4gICAgICAgIHRhYmxlc1tmaWVsZC5vcmdUYWJsZV0uZmllbGRzLnB1c2goZmllbGQpXG4gICAgdGFibGVzXG5cbiAgb25EaWRDaGFuZ2VEZWZhdWx0RGF0YWJhc2U6IChjYWxsYmFjayktPlxuICAgIEBlbWl0dGVyLm9uICdkaWQtY2hhbmdlLWRlZmF1bHQtZGF0YWJhc2UnLCBjYWxsYmFja1xuXG4gIGdldERhdGFUeXBlczogLT5cbiAgICBAbl90eXBlcy5jb25jYXQoQHNfdHlwZXMpXG5cbiAgdG9TdHJpbmc6IC0+XG4gICAgQHByb3RvY29sK1wiOi8vXCIrQGNvbm5lY3Rpb24uY29uZmlnLnVzZXIrXCJAXCIrQGNvbm5lY3Rpb24uY29uZmlnLmhvc3RcblxuICBlc2NhcGU6ICh2YWx1ZSx0eXBlKS0+XG4gICAgZm9yIHQxIGluIEBzX3R5cGVzXG4gICAgICBpZiB2YWx1ZSA9PSBudWxsIHx8IHR5cGUuc2VhcmNoKG5ldyBSZWdFeHAodDEsIFwiaVwiKSkgIT0gLTFcbiAgICAgICAgcmV0dXJuIEBjb25uZWN0aW9uLmVzY2FwZSh2YWx1ZSlcbiAgICB2YWx1ZS50b1N0cmluZygpXG4iXX0=
