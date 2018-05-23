(function() {
  var Emitter, QuickQueryPostgresColumn, QuickQueryPostgresConnection, QuickQueryPostgresDatabase, QuickQueryPostgresSchema, QuickQueryPostgresTable, pg;

  pg = require('pg');

  Emitter = require('atom').Emitter;

  pg.types.setTypeParser(1082, function(x) {
    return x;
  });

  pg.types.setTypeParser(1183, function(x) {
    return x;
  });

  pg.types.setTypeParser(1114, function(x) {
    return x;
  });

  pg.types.setTypeParser(1184, function(x) {
    return x;
  });

  pg.types.setTypeParser(3802, function(x) {
    return x;
  });

  pg.types.setTypeParser(114, function(x) {
    return x;
  });

  QuickQueryPostgresColumn = (function() {
    QuickQueryPostgresColumn.prototype.type = 'column';

    QuickQueryPostgresColumn.prototype.child_type = null;

    function QuickQueryPostgresColumn(table1, row) {
      var m;
      this.table = table1;
      this.connection = this.table.connection;
      this.name = row['column_name'];
      this.primary_key = row['constraint_type'] === 'PRIMARY KEY';
      if (row['character_maximum_length']) {
        this.datatype = row['data_type'] + " (" + row['character_maximum_length'] + ")";
      } else {
        this.datatype = row['data_type'];
      }
      this["default"] = row['column_default'];
      if (this["default"] === 'NULL' || this["default"] === ("NULL::" + row['data_type'])) {
        this["default"] = null;
      }
      if (this["default"] !== null) {
        m = this["default"].match(/'(.*?)'::/);
        if (m && m[1]) {
          this["default"] = m[1];
        }
      }
      this.nullable = row['is_nullable'] === 'YES';
      this.id = parseInt(row['ordinal_position']);
    }

    QuickQueryPostgresColumn.prototype.toString = function() {
      return this.name;
    };

    QuickQueryPostgresColumn.prototype.parent = function() {
      return this.table;
    };

    QuickQueryPostgresColumn.prototype.children = function(callback) {
      return callback([]);
    };

    return QuickQueryPostgresColumn;

  })();

  QuickQueryPostgresTable = (function() {
    QuickQueryPostgresTable.prototype.type = 'table';

    QuickQueryPostgresTable.prototype.child_type = 'column';

    function QuickQueryPostgresTable(schema1, row, fields) {
      this.schema = schema1;
      this.connection = this.schema.connection;
      this.name = row["table_name"];
    }

    QuickQueryPostgresTable.prototype.toString = function() {
      return this.name;
    };

    QuickQueryPostgresTable.prototype.parent = function() {
      return this.schema;
    };

    QuickQueryPostgresTable.prototype.children = function(callback) {
      return this.connection.getColumns(this, callback);
    };

    return QuickQueryPostgresTable;

  })();

  QuickQueryPostgresSchema = (function() {
    QuickQueryPostgresSchema.prototype.type = 'schema';

    QuickQueryPostgresSchema.prototype.child_type = 'table';

    function QuickQueryPostgresSchema(database1, row, fields) {
      this.database = database1;
      this.connection = this.database.connection;
      this.name = row["schema_name"];
    }

    QuickQueryPostgresSchema.prototype.toString = function() {
      return this.name;
    };

    QuickQueryPostgresSchema.prototype.parent = function() {
      return this.database;
    };

    QuickQueryPostgresSchema.prototype.children = function(callback) {
      return this.connection.getTables(this, callback);
    };

    return QuickQueryPostgresSchema;

  })();

  QuickQueryPostgresDatabase = (function() {
    QuickQueryPostgresDatabase.prototype.type = 'database';

    QuickQueryPostgresDatabase.prototype.child_type = 'schema';

    function QuickQueryPostgresDatabase(connection2, row) {
      this.connection = connection2;
      this.name = row["datname"];
    }

    QuickQueryPostgresDatabase.prototype.toString = function() {
      return this.name;
    };

    QuickQueryPostgresDatabase.prototype.parent = function() {
      return this.connection;
    };

    QuickQueryPostgresDatabase.prototype.children = function(callback) {
      return this.connection.getSchemas(this, callback);
    };

    return QuickQueryPostgresDatabase;

  })();

  module.exports = QuickQueryPostgresConnection = (function() {
    QuickQueryPostgresConnection.prototype.fatal = false;

    QuickQueryPostgresConnection.prototype.connection = null;

    QuickQueryPostgresConnection.prototype.protocol = 'postgres';

    QuickQueryPostgresConnection.prototype.type = 'connection';

    QuickQueryPostgresConnection.prototype.child_type = 'database';

    QuickQueryPostgresConnection.prototype.timeout = 5000;

    QuickQueryPostgresConnection.prototype.n_types = 'bigint bigserial bit boolean box bytea circle integer interval line lseg money numeric path point polygon real smallint smallserial timestamp tsquery tsvector xml'.split(/\s+/).concat(['bit varying']);

    QuickQueryPostgresConnection.prototype.s_types = ['character', 'character varying', 'date', 'inet', 'cidr', 'time', 'macaddr', 'text', 'uuid', 'json', 'jsonb'];

    QuickQueryPostgresConnection.prototype.allowEdition = true;

    QuickQueryPostgresConnection.defaultPort = 5432;

    function QuickQueryPostgresConnection(info1) {
      var base;
      this.info = info1;
      this.emitter = new Emitter();
      if ((base = this.info).database == null) {
        base.database = 'postgres';
      }
      this.connections = {};
    }

    QuickQueryPostgresConnection.prototype.connect = function(callback) {
      this.defaultConnection = new pg.Client(this.info);
      return this.defaultConnection.connect((function(_this) {
        return function(err) {
          _this.connections[_this.info.database] = _this.defaultConnection;
          _this.defaultConnection.on('error', function(err) {
            console.log(err);
            _this.connections[_this.info.database] = null;
            return _this.fatal = true;
          });
          return callback(err);
        };
      })(this));
    };

    QuickQueryPostgresConnection.prototype.serialize = function() {
      var c;
      c = this.defaultConnection;
      return {
        host: c.host,
        port: c.port,
        ssl: c.ssl,
        protocol: this.protocol,
        database: c.database,
        user: c.user,
        password: c.password
      };
    };

    QuickQueryPostgresConnection.prototype.getDatabaseConnection = function(database, callback) {
      var newConnection;
      if (this.connections[database]) {
        if (callback) {
          return callback(this.connections[database]);
        }
      } else {
        this.info.database = database;
        newConnection = new pg.Client(this.info);
        return newConnection.connect((function(_this) {
          return function(err) {
            if (err) {
              return console.log(err);
            } else {
              newConnection.on('error', function(err) {
                console.log(err);
                _this.connections[database] = null;
                if (newConnection === _this.defaultConnection) {
                  return _this.fatal = true;
                }
              });
              _this.connections[database] = newConnection;
              if (callback) {
                return callback(newConnection);
              }
            }
          };
        })(this));
      }
    };

    QuickQueryPostgresConnection.prototype.setDefaultDatabase = function(database) {
      return this.getDatabaseConnection(database, (function(_this) {
        return function(connection) {
          _this.defaultConnection = connection;
          return _this.emitter.emit('did-change-default-database', connection.database);
        };
      })(this));
    };

    QuickQueryPostgresConnection.prototype.getDefaultDatabase = function() {
      return this.defaultConnection.database;
    };

    QuickQueryPostgresConnection.prototype.dispose = function() {
      return this.close();
    };

    QuickQueryPostgresConnection.prototype.close = function() {
      var connection, database, ref, results;
      ref = this.connections;
      results = [];
      for (database in ref) {
        connection = ref[database];
        results.push(connection.end());
      }
      return results;
    };

    QuickQueryPostgresConnection.prototype.queryDatabaseConnection = function(text, connection, callback, recursive) {
      if (recursive == null) {
        recursive = false;
      }
      return connection.query({
        text: text,
        rowMode: 'array'
      }, (function(_this) {
        return function(err, result) {
          var database, field, i, l, len, ref;
          if (err) {
            if (err.code === '0A000' && err.message.indexOf('cross-database') !== -1 && !recursive) {
              database = err.message.match(/"(.*?)"/)[1].split('.')[0];
              return _this.getDatabaseConnection(database, function(connection1) {
                return _this.queryDatabaseConnection(text, connection1, callback, true);
              });
            } else {
              return callback({
                type: 'error',
                content: err.message
              });
            }
          } else if (result.command !== 'SELECT') {
            if (isNaN(result.rowCount)) {
              return callback({
                type: 'success',
                content: "Success"
              });
            } else {
              return callback({
                type: 'success',
                content: result.rowCount + " row(s) affected"
              });
            }
          } else {
            ref = result.fields;
            for (i = l = 0, len = ref.length; l < len; i = ++l) {
              field = ref[i];
              field.db = connection.database;
            }
            return callback(null, result.rows, result.fields);
          }
        };
      })(this));
    };

    QuickQueryPostgresConnection.prototype.query = function(text, callback) {
      if (this.fatal) {
        return this.getDatabaseConnection(this.defaultConnection.database, (function(_this) {
          return function(connection) {
            _this.defaultConnection = connection;
            _this.fatal = false;
            return _this.queryDatabaseConnection(text, _this.defaultConnection, callback);
          };
        })(this));
      } else {
        return this.queryDatabaseConnection(text, this.defaultConnection, callback);
      }
    };

    QuickQueryPostgresConnection.prototype.objRowsMap = function(rows, fields, callback) {
      return rows.map((function(_this) {
        return function(r, i) {
          var field, j, l, len, row;
          row = {};
          for (j = l = 0, len = fields.length; l < len; j = ++l) {
            field = fields[j];
            row[field.name] = r[j];
          }
          if (callback != null) {
            return callback(row);
          } else {
            return row;
          }
        };
      })(this));
    };

    QuickQueryPostgresConnection.prototype.parent = function() {
      return this;
    };

    QuickQueryPostgresConnection.prototype.children = function(callback) {
      return this.getDatabases(function(databases, err) {
        if (err == null) {
          return callback(databases);
        } else {
          return console.log(err);
        }
      });
    };

    QuickQueryPostgresConnection.prototype.getDatabases = function(callback) {
      var text;
      text = "SELECT datname FROM pg_database WHERE datistemplate = false";
      return this.query(text, (function(_this) {
        return function(err, rows, fields) {
          var databases;
          if (!err) {
            databases = _this.objRowsMap(rows, fields, function(row) {
              return new QuickQueryPostgresDatabase(_this, row);
            });
            databases = databases.filter(function(database) {
              return !_this.hiddenDatabase(database.name);
            });
          }
          return callback(databases, err);
        };
      })(this));
    };

    QuickQueryPostgresConnection.prototype.getSchemas = function(database, callback) {
      return this.getDatabaseConnection(database.name, (function(_this) {
        return function(connection) {
          var text;
          text = "SELECT schema_name FROM information_schema.schemata WHERE catalog_name = '" + database.name + "' AND schema_name NOT IN ('pg_toast','pg_temp_1','pg_toast_temp_1','pg_catalog','information_schema')";
          return _this.queryDatabaseConnection(text, connection, function(err, rows, fields) {
            var schemas;
            if (!err) {
              schemas = _this.objRowsMap(rows, fields, function(row) {
                return new QuickQueryPostgresSchema(database, row);
              });
              return callback(schemas);
            }
          });
        };
      })(this));
    };

    QuickQueryPostgresConnection.prototype.getTables = function(schema, callback) {
      return this.getDatabaseConnection(schema.database.name, (function(_this) {
        return function(connection) {
          var text;
          text = "SELECT table_name FROM information_schema.tables WHERE table_catalog = '" + schema.database.name + "' AND table_schema = '" + schema.name + "'";
          return _this.queryDatabaseConnection(text, connection, function(err, rows, fields) {
            var tables;
            if (!err) {
              tables = _this.objRowsMap(rows, fields, function(row) {
                return new QuickQueryPostgresTable(schema, row);
              });
              return callback(tables);
            }
          });
        };
      })(this));
    };

    QuickQueryPostgresConnection.prototype.getColumns = function(table, callback) {
      return this.getDatabaseConnection(table.schema.database.name, (function(_this) {
        return function(connection) {
          var text;
          text = "SELECT  pk.constraint_type ,c.* FROM information_schema.columns c LEFT OUTER JOIN ( SELECT tc.constraint_type, kc.column_name, tc.table_catalog, tc.table_name, tc.table_schema FROM information_schema.table_constraints tc INNER JOIN information_schema.CONSTRAINT_COLUMN_USAGE kc ON kc.constraint_name = tc.constraint_name AND kc.table_catalog = tc.table_catalog AND kc.table_name = tc.table_name AND kc.table_schema = tc.table_schema WHERE tc.constraint_type = 'PRIMARY KEY' ) pk ON pk.column_name = c.column_name AND pk.table_catalog = c.table_catalog AND pk.table_name = c.table_name AND pk.table_schema = c.table_schema WHERE c.table_name = '" + table.name + "' AND c.table_schema = '" + table.schema.name + "' AND c.table_catalog = '" + table.schema.database.name + "'";
          return _this.queryDatabaseConnection(text, connection, function(err, rows, fields) {
            var columns;
            if (!err) {
              columns = _this.objRowsMap(rows, fields, function(row) {
                return new QuickQueryPostgresColumn(table, row);
              });
              return callback(columns);
            }
          });
        };
      })(this));
    };

    QuickQueryPostgresConnection.prototype.hiddenDatabase = function(database) {
      return database === "postgres";
    };

    QuickQueryPostgresConnection.prototype.simpleSelect = function(table, columns) {
      var database_name, schema_name, table_name;
      if (columns == null) {
        columns = '*';
      }
      if (columns !== '*') {
        columns = columns.map((function(_this) {
          return function(col) {
            return _this.defaultConnection.escapeIdentifier(col.name);
          };
        })(this));
        columns = "\n " + columns.join(",\n ") + "\n";
      }
      table_name = this.defaultConnection.escapeIdentifier(table.name);
      schema_name = this.defaultConnection.escapeIdentifier(table.schema.name);
      database_name = this.defaultConnection.escapeIdentifier(table.schema.database.name);
      return "SELECT " + columns + " FROM " + database_name + "." + schema_name + "." + table_name + " LIMIT 1000;";
    };

    QuickQueryPostgresConnection.prototype.createDatabase = function(model, info) {
      var database;
      database = this.defaultConnection.escapeIdentifier(info.name);
      return "CREATE DATABASE " + database + ";";
    };

    QuickQueryPostgresConnection.prototype.createSchema = function(model, info) {
      var schema;
      schema = this.defaultConnection.escapeIdentifier(info.name);
      this.setDefaultDatabase(model.name);
      return "CREATE SCHEMA " + schema + ";";
    };

    QuickQueryPostgresConnection.prototype.createTable = function(model, info) {
      var database, schema, table;
      database = this.defaultConnection.escapeIdentifier(model.database.name);
      schema = this.defaultConnection.escapeIdentifier(model.name);
      table = this.defaultConnection.escapeIdentifier(info.name);
      return "CREATE TABLE " + database + "." + schema + "." + table + " (\n  \"id\" INT NOT NULL ,\n  CONSTRAINT \"" + info.name + "_pk\" PRIMARY KEY (\"id\")\n);";
    };

    QuickQueryPostgresConnection.prototype.createColumn = function(model, info) {
      var column, dafaultValue, database, nullable, schema, table;
      database = this.defaultConnection.escapeIdentifier(model.schema.database.name);
      schema = this.defaultConnection.escapeIdentifier(model.schema.name);
      table = this.defaultConnection.escapeIdentifier(model.name);
      column = this.defaultConnection.escapeIdentifier(info.name);
      nullable = info.nullable ? 'NULL' : 'NOT NULL';
      dafaultValue = info["default"] === null ? 'NULL' : this.escape(info["default"], info.datatype);
      return ("ALTER TABLE " + database + "." + schema + "." + table + " ADD COLUMN " + column) + (" " + info.datatype + " " + nullable + " DEFAULT " + dafaultValue + ";");
    };

    QuickQueryPostgresConnection.prototype.alterTable = function(model, delta) {
      var database, newName, oldName, query, schema;
      database = this.defaultConnection.escapeIdentifier(model.schema.database.name);
      schema = this.defaultConnection.escapeIdentifier(model.schema.name);
      newName = this.defaultConnection.escapeIdentifier(delta.new_name);
      oldName = this.defaultConnection.escapeIdentifier(delta.old_name);
      return query = "ALTER TABLE " + database + "." + schema + "." + oldName + " RENAME TO " + newName + ";";
    };

    QuickQueryPostgresConnection.prototype.alterColumn = function(model, delta) {
      var database, defaultValue, newName, nullable, oldName, result, schema, table;
      database = this.defaultConnection.escapeIdentifier(model.table.schema.database.name);
      schema = this.defaultConnection.escapeIdentifier(model.table.schema.name);
      table = this.defaultConnection.escapeIdentifier(model.table.name);
      newName = this.defaultConnection.escapeIdentifier(delta.new_name);
      oldName = this.defaultConnection.escapeIdentifier(delta.old_name);
      nullable = delta.nullable ? 'DROP NOT NULL' : 'SET NOT NULL';
      defaultValue = delta["default"] === null ? 'NULL' : this.escape(delta["default"], delta.datatype);
      result = "ALTER TABLE " + database + "." + schema + "." + table + "\nALTER COLUMN " + oldName + " SET DATA TYPE " + delta.datatype + ",\nALTER COLUMN " + oldName + " " + nullable + ",\nALTER COLUMN " + oldName + " SET DEFAULT " + defaultValue;
      if (oldName !== newName) {
        result += ("\nALTER TABLE " + database + "." + schema + "." + table) + (" RENAME COLUMN " + oldName + " TO " + newName + ";");
      }
      return result;
    };

    QuickQueryPostgresConnection.prototype.dropDatabase = function(model) {
      var database;
      database = this.defaultConnection.escapeIdentifier(model.name);
      return "DROP DATABASE " + database + ";";
    };

    QuickQueryPostgresConnection.prototype.dropSchema = function(model) {
      var schema;
      schema = this.defaultConnection.escapeIdentifier(model.name);
      this.setDefaultDatabase(model.database.name);
      return "DROP SCHEMA " + schema + ";";
    };

    QuickQueryPostgresConnection.prototype.dropTable = function(model) {
      var database, schema, table;
      database = this.defaultConnection.escapeIdentifier(model.schema.database.name);
      schema = this.defaultConnection.escapeIdentifier(model.schema.name);
      table = this.defaultConnection.escapeIdentifier(model.name);
      return "DROP TABLE " + database + "." + schema + "." + table + ";";
    };

    QuickQueryPostgresConnection.prototype.dropColumn = function(model) {
      var column, database, schema, table;
      database = this.defaultConnection.escapeIdentifier(model.table.schema.database.name);
      schema = this.defaultConnection.escapeIdentifier(model.table.schema.name);
      table = this.defaultConnection.escapeIdentifier(model.table.name);
      column = this.defaultConnection.escapeIdentifier(model.name);
      return "ALTER TABLE " + database + "." + schema + "." + table + " DROP COLUMN " + column + ";";
    };

    QuickQueryPostgresConnection.prototype.prepareValues = function(values, fields) {
      return values;
    };

    QuickQueryPostgresConnection.prototype.updateRecord = function(row, fields, values) {
      var oid, t, tables;
      tables = this._tableGroup(fields);
      return Promise.all((function() {
        var results;
        results = [];
        for (oid in tables) {
          t = tables[oid];
          results.push(new Promise((function(_this) {
            return function(resolve, reject) {
              return _this.getTableByOID(t.database, t.oid, function(table) {
                return table.children(function(columns) {
                  var allkeys, assings, database, i, k, key, keys, l, len, schema, update, where;
                  keys = (function() {
                    var l, len, results1;
                    results1 = [];
                    for (i = l = 0, len = columns.length; l < len; i = ++l) {
                      key = columns[i];
                      if (key.primary_key) {
                        results1.push({
                          ix: i,
                          key: key
                        });
                      }
                    }
                    return results1;
                  })();
                  allkeys = true;
                  for (l = 0, len = keys.length; l < len; l++) {
                    k = keys[l];
                    allkeys &= row[k.ix] != null;
                  }
                  if (allkeys && keys.length > 0) {
                    _this._matchColumns(t.fields, columns);
                    assings = t.fields.filter(function(field) {
                      return field.column != null;
                    }).map(function(field) {
                      return (_this.defaultConnection.escapeIdentifier(field.column.name)) + " = " + (_this.escape(values[field.name], field.column.datatype));
                    });
                    database = _this.defaultConnection.escapeIdentifier(table.schema.database.name);
                    schema = _this.defaultConnection.escapeIdentifier(table.schema.name);
                    table = _this.defaultConnection.escapeIdentifier(table.name);
                    where = keys.map(function(k) {
                      return (_this.defaultConnection.escapeIdentifier(k.key.name)) + " = " + (_this.escape(row[k.ix], k.key.datatype));
                    });
                    update = ("UPDATE " + database + "." + schema + "." + table) + (" SET " + (assings.join(','))) + " WHERE " + where.join(' AND ') + ";";
                    return resolve(update);
                  } else {
                    return resolve('');
                  }
                });
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

    QuickQueryPostgresConnection.prototype.insertRecord = function(fields, values) {
      var oid, t, tables;
      tables = this._tableGroup(fields);
      return Promise.all((function() {
        var results;
        results = [];
        for (oid in tables) {
          t = tables[oid];
          results.push(new Promise((function(_this) {
            return function(resolve, reject) {
              return _this.getTableByOID(t.database, t.oid, function(table) {
                return table.children(function(columns) {
                  var aryfields, aryvalues, database, insert, schema, strfields, strvalues;
                  _this._matchColumns(t.fields, columns);
                  aryfields = t.fields.filter(function(field) {
                    return field.column != null;
                  }).map(function(field) {
                    return _this.defaultConnection.escapeIdentifier(field.column.name);
                  });
                  strfields = aryfields.join(',');
                  aryvalues = t.fields.filter(function(field) {
                    return field.column != null;
                  }).map(function(field) {
                    return _this.escape(values[field.column.name], field.column.datatype);
                  });
                  strvalues = aryvalues.join(',');
                  database = _this.defaultConnection.escapeIdentifier(table.schema.database.name);
                  schema = _this.defaultConnection.escapeIdentifier(table.schema.name);
                  table = _this.defaultConnection.escapeIdentifier(table.name);
                  insert = ("INSERT INTO " + database + "." + schema + "." + table) + (" (" + strfields + ") VALUES (" + strvalues + ");");
                  return resolve(insert);
                });
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

    QuickQueryPostgresConnection.prototype.deleteRecord = function(row, fields) {
      var oid, t, tables;
      tables = this._tableGroup(fields);
      return Promise.all((function() {
        var results;
        results = [];
        for (oid in tables) {
          t = tables[oid];
          results.push(new Promise((function(_this) {
            return function(resolve, reject) {
              return _this.getTableByOID(t.database, t.oid, function(table) {
                return table.children(function(columns) {
                  var allkeys, database, del, i, k, key, keys, l, len, schema, where;
                  keys = (function() {
                    var l, len, results1;
                    results1 = [];
                    for (i = l = 0, len = columns.length; l < len; i = ++l) {
                      key = columns[i];
                      if (key.primary_key) {
                        results1.push({
                          ix: i,
                          key: key
                        });
                      }
                    }
                    return results1;
                  })();
                  allkeys = true;
                  for (l = 0, len = keys.length; l < len; l++) {
                    k = keys[l];
                    allkeys &= row[k.ix] != null;
                  }
                  if (allkeys && keys.length > 0) {
                    database = _this.defaultConnection.escapeIdentifier(table.schema.database.name);
                    schema = _this.defaultConnection.escapeIdentifier(table.schema.name);
                    table = _this.defaultConnection.escapeIdentifier(table.name);
                    where = keys.map(function(k) {
                      return (_this.defaultConnection.escapeIdentifier(k.key.name)) + " = " + (_this.escape(row[k.ix], k.key.datatype));
                    });
                    del = ("DELETE FROM " + database + "." + schema + "." + table) + " WHERE " + where.join(' AND ') + ";";
                    return resolve(del);
                  } else {
                    return resolve('');
                  }
                });
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

    QuickQueryPostgresConnection.prototype.getTableByOID = function(database, oid, callback) {
      return this.getDatabaseConnection(database, (function(_this) {
        return function(connection) {
          var text;
          text = "SELECT s.nspname AS schema_name, t.relname AS table_name FROM pg_class t INNER JOIN pg_namespace s ON t.relnamespace = s.oid WHERE t.oid = " + oid;
          return _this.queryDatabaseConnection(text, connection, function(err, rows, fields) {
            var db, row, schema, table;
            db = {
              name: database,
              connection: _this
            };
            if (!err && rows.length === 1) {
              row = _this.objRowsMap(rows, fields)[0];
              schema = new QuickQueryPostgresSchema(db, row, fields);
              table = new QuickQueryPostgresTable(schema, row);
              return callback(table);
            }
          });
        };
      })(this));
    };

    QuickQueryPostgresConnection.prototype._matchColumns = function(fields, columns) {
      var column, field, l, len, results;
      results = [];
      for (l = 0, len = fields.length; l < len; l++) {
        field = fields[l];
        results.push((function() {
          var len1, n, results1;
          results1 = [];
          for (n = 0, len1 = columns.length; n < len1; n++) {
            column = columns[n];
            if (column.id === field.columnID) {
              results1.push(field.column = column);
            } else {
              results1.push(void 0);
            }
          }
          return results1;
        })());
      }
      return results;
    };

    QuickQueryPostgresConnection.prototype._tableGroup = function(fields) {
      var field, l, len, oid, tables;
      tables = {};
      for (l = 0, len = fields.length; l < len; l++) {
        field = fields[l];
        if (field.tableID != null) {
          oid = field.tableID.toString();
          if (tables[oid] == null) {
            tables[oid] = {
              oid: field.tableID,
              database: field.db,
              fields: []
            };
          }
          tables[oid].fields.push(field);
        }
      }
      return tables;
    };

    QuickQueryPostgresConnection.prototype.onDidChangeDefaultDatabase = function(callback) {
      return this.emitter.on('did-change-default-database', callback);
    };

    QuickQueryPostgresConnection.prototype.getDataTypes = function() {
      return this.n_types.concat(this.s_types);
    };

    QuickQueryPostgresConnection.prototype.toString = function() {
      return this.protocol + "://" + this.defaultConnection.user + "@" + this.defaultConnection.host;
    };

    QuickQueryPostgresConnection.prototype.escape = function(value, type) {
      var l, len, ref, t1;
      if (value === null) {
        return 'NULL';
      }
      ref = this.s_types;
      for (l = 0, len = ref.length; l < len; l++) {
        t1 = ref[l];
        if (type.search(new RegExp(t1, "i")) !== -1) {
          return this.defaultConnection.escapeLiteral(value);
        }
      }
      return value.toString();
    };

    return QuickQueryPostgresConnection;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL3F1aWNrLXF1ZXJ5L2xpYi9xdWljay1xdWVyeS1wb3N0Z3Jlcy1jb25uZWN0aW9uLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUVKLFVBQVcsT0FBQSxDQUFRLE1BQVI7O0VBR1osRUFBRSxDQUFDLEtBQUssQ0FBQyxhQUFULENBQXdCLElBQXhCLEVBQStCLFNBQUMsQ0FBRDtXQUFPO0VBQVAsQ0FBL0I7O0VBQ0EsRUFBRSxDQUFDLEtBQUssQ0FBQyxhQUFULENBQXdCLElBQXhCLEVBQStCLFNBQUMsQ0FBRDtXQUFPO0VBQVAsQ0FBL0I7O0VBQ0EsRUFBRSxDQUFDLEtBQUssQ0FBQyxhQUFULENBQXdCLElBQXhCLEVBQStCLFNBQUMsQ0FBRDtXQUFPO0VBQVAsQ0FBL0I7O0VBQ0EsRUFBRSxDQUFDLEtBQUssQ0FBQyxhQUFULENBQXdCLElBQXhCLEVBQStCLFNBQUMsQ0FBRDtXQUFPO0VBQVAsQ0FBL0I7O0VBQ0EsRUFBRSxDQUFDLEtBQUssQ0FBQyxhQUFULENBQXdCLElBQXhCLEVBQStCLFNBQUMsQ0FBRDtXQUFPO0VBQVAsQ0FBL0I7O0VBQ0EsRUFBRSxDQUFDLEtBQUssQ0FBQyxhQUFULENBQXdCLEdBQXhCLEVBQStCLFNBQUMsQ0FBRDtXQUFPO0VBQVAsQ0FBL0I7O0VBRU07dUNBQ0osSUFBQSxHQUFNOzt1Q0FDTixVQUFBLEdBQVk7O0lBQ0Msa0NBQUMsTUFBRCxFQUFRLEdBQVI7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFFBQUQ7TUFDWixJQUFDLENBQUEsVUFBRCxHQUFjLElBQUMsQ0FBQSxLQUFLLENBQUM7TUFDckIsSUFBQyxDQUFBLElBQUQsR0FBUSxHQUFJLENBQUEsYUFBQTtNQUNaLElBQUMsQ0FBQSxXQUFELEdBQWUsR0FBSSxD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QSxpQkFBaUIsQ0FBQyxhQUFuQixDQUFpQyxLQUFqQyxFQURUOztBQURGO2FBR0EsS0FBSyxDQUFDLFFBQU4sQ0FBQTtJQU5NOzs7OztBQWxkViIsInNvdXJjZXNDb250ZW50IjpbInBnID0gcmVxdWlyZSAncGcnXG5cbntFbWl0dGVyfSA9IHJlcXVpcmUgJ2F0b20nXG5cbiMgZG9uJ3QgcGFyc2UgZGF0ZXMsIHRpbWVzIGFuZCBqc29uLlxucGcudHlwZXMuc2V0VHlwZVBhcnNlciAgMTA4MiAsICh4KSAtPiB4XG5wZy50eXBlcy5zZXRUeXBlUGFyc2VyICAxMTgzICwgKHgpIC0+IHhcbnBnLnR5cGVzLnNldFR5cGVQYXJzZXIgIDExMTQgLCAoeCkgLT4geFxucGcudHlwZXMuc2V0VHlwZVBhcnNlciAgMTE4NCAsICh4KSAtPiB4XG5wZy50eXBlcy5zZXRUeXBlUGFyc2VyICAzODAyICwgKHgpIC0+IHhcbnBnLnR5cGVzLnNldFR5cGVQYXJzZXIgIDExNCAgLCAoeCkgLT4geFxuXG5jbGFzcyBRdWlja1F1ZXJ5UG9zdGdyZXNDb2x1bW5cbiAgdHlwZTogJ2NvbHVtbidcbiAgY2hpbGRfdHlwZTogbnVsbFxuICBjb25zdHJ1Y3RvcjogKEB0YWJsZSxyb3cpIC0+XG4gICAgQGNvbm5lY3Rpb24gPSBAdGFibGUuY29ubmVjdGlvblxuICAgIEBuYW1lID0gcm93Wydjb2x1bW5fbmFtZSddXG4gICAgQHByaW1hcnlfa2V5ID0gcm93Wydjb25zdHJhaW50X3R5cGUnXSA9PSAnUFJJTUFSWSBLRVknXG4gICAgaWYgcm93WydjaGFyYWN0ZXJfbWF4aW11bV9sZW5ndGgnXVxuICAgICAgQGRhdGF0eXBlID0gXCIje3Jvd1snZGF0YV90eXBlJ119ICgje3Jvd1snY2hhcmFjdGVyX21heGltdW1fbGVuZ3RoJ119KVwiXG4gICAgZWxzZVxuICAgICAgQGRhdGF0eXBlID0gcm93WydkYXRhX3R5cGUnXVxuICAgIEBkZWZhdWx0ID0gcm93Wydjb2x1bW5fZGVmYXVsdCddXG4gICAgaWYgQGRlZmF1bHQgPT0gJ05VTEwnIHx8IEBkZWZhdWx0ID09IFwiTlVMTDo6I3tyb3dbJ2RhdGFfdHlwZSddfVwiXG4gICAgICBAZGVmYXVsdCA9IG51bGxcbiAgICBpZiBAZGVmYXVsdCAhPSBudWxsXG4gICAgICBtID0gIEBkZWZhdWx0Lm1hdGNoKC8nKC4qPyknOjovKVxuICAgICAgaWYgbSAmJiBtWzFdIHRoZW4gQGRlZmF1bHQgPSBtWzFdXG4gICAgQG51bGxhYmxlID0gcm93Wydpc19udWxsYWJsZSddID09ICdZRVMnXG4gICAgQGlkID0gcGFyc2VJbnQocm93WydvcmRpbmFsX3Bvc2l0aW9uJ10pXG4gIHRvU3RyaW5nOiAtPlxuICAgIEBuYW1lXG4gIHBhcmVudDogLT5cbiAgICBAdGFibGVcbiAgY2hpbGRyZW46IChjYWxsYmFjayktPlxuICAgIGNhbGxiYWNrKFtdKVxuXG5jbGFzcyBRdWlja1F1ZXJ5UG9zdGdyZXNUYWJsZVxuICB0eXBlOiAndGFibGUnXG4gIGNoaWxkX3R5cGU6ICdjb2x1bW4nXG4gIGNvbnN0cnVjdG9yOiAoQHNjaGVtYSxyb3csZmllbGRzKSAtPlxuICAgIEBjb25uZWN0aW9uID0gQHNjaGVtYS5jb25uZWN0aW9uXG4gICAgQG5hbWUgPSByb3dbXCJ0YWJsZV9uYW1lXCJdXG4gIHRvU3RyaW5nOiAtPlxuICAgIEBuYW1lXG4gIHBhcmVudDogLT5cbiAgICBAc2NoZW1hXG4gIGNoaWxkcmVuOiAoY2FsbGJhY2spLT5cbiAgICBAY29ubmVjdGlvbi5nZXRDb2x1bW5zKEAsY2FsbGJhY2spXG5cbmNsYXNzIFF1aWNrUXVlcnlQb3N0Z3Jlc1NjaGVtYVxuICB0eXBlOiAnc2NoZW1hJ1xuICBjaGlsZF90eXBlOiAndGFibGUnXG4gIGNvbnN0cnVjdG9yOiAoQGRhdGFiYXNlLHJvdyxmaWVsZHMpIC0+XG4gICAgQGNvbm5lY3Rpb24gPSBAZGF0YWJhc2UuY29ubmVjdGlvblxuICAgIEBuYW1lID0gcm93W1wic2NoZW1hX25hbWVcIl1cbiAgdG9TdHJpbmc6IC0+XG4gICAgQG5hbWVcbiAgcGFyZW50OiAtPlxuICAgIEBkYXRhYmFzZVxuICBjaGlsZHJlbjogKGNhbGxiYWNrKS0+XG4gICAgQGNvbm5lY3Rpb24uZ2V0VGFibGVzKEAsY2FsbGJhY2spXG5cbmNsYXNzIFF1aWNrUXVlcnlQb3N0Z3Jlc0RhdGFiYXNlXG4gIHR5cGU6ICdkYXRhYmFzZSdcbiAgY2hpbGRfdHlwZTogJ3NjaGVtYSdcbiAgY29uc3RydWN0b3I6IChAY29ubmVjdGlvbixyb3cpIC0+XG4gICAgQG5hbWUgPSByb3dbXCJkYXRuYW1lXCJdXG4gIHRvU3RyaW5nOiAtPlxuICAgIEBuYW1lXG4gIHBhcmVudDogLT5cbiAgICBAY29ubmVjdGlvblxuICBjaGlsZHJlbjogKGNhbGxiYWNrKS0+XG4gICAgQGNvbm5lY3Rpb24uZ2V0U2NoZW1hcyhALGNhbGxiYWNrKVxuICAgICNAY29ubmVjdGlvbi5nZXRUYWJsZXMoQCxjYWxsYmFjaylcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgUXVpY2tRdWVyeVBvc3RncmVzQ29ubmVjdGlvblxuXG4gIGZhdGFsOiBmYWxzZVxuICBjb25uZWN0aW9uOiBudWxsXG4gIHByb3RvY29sOiAncG9zdGdyZXMnXG4gIHR5cGU6ICdjb25uZWN0aW9uJ1xuICBjaGlsZF90eXBlOiAnZGF0YWJhc2UnXG4gIHRpbWVvdXQ6IDUwMDAgI3RpbWUgb3QgaXMgc2V0IGluIDVzLiBxdWVyaWVzIHNob3VsZCBiZSBmYXN0LlxuICBuX3R5cGVzOiAnYmlnaW50IGJpZ3NlcmlhbCBiaXQgYm9vbGVhbiBib3ggYnl0ZWEgY2lyY2xlIGludGVnZXIgaW50ZXJ2YWwgbGluZSBsc2VnIG1vbmV5IG51bWVyaWMgcGF0aCBwb2ludCBwb2x5Z29uIHJlYWwgc21hbGxpbnQgc21hbGxzZXJpYWwgdGltZXN0YW1wIHRzcXVlcnkgdHN2ZWN0b3IgeG1sJy5zcGxpdCgvXFxzKy8pLmNvbmNhdChbJ2JpdCB2YXJ5aW5nJ10pXG4gIHNfdHlwZXM6IFsnY2hhcmFjdGVyJywnY2hhcmFjdGVyIHZhcnlpbmcnLCdkYXRlJywnaW5ldCcsJ2NpZHInLCd0aW1lJywnbWFjYWRkcicsJ3RleHQnLCd1dWlkJywnanNvbicsJ2pzb25iJ11cblxuICBhbGxvd0VkaXRpb246IHRydWVcbiAgQGRlZmF1bHRQb3J0OiA1NDMyXG5cbiAgY29uc3RydWN0b3I6IChAaW5mbyktPlxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXIoKVxuICAgIEBpbmZvLmRhdGFiYXNlID89ICdwb3N0Z3JlcydcbiAgICBAY29ubmVjdGlvbnMgPSB7fVxuXG4gIGNvbm5lY3Q6IChjYWxsYmFjayktPlxuICAgIEBkZWZhdWx0Q29ubmVjdGlvbiA9IG5ldyBwZy5DbGllbnQoQGluZm8pO1xuICAgIEBkZWZhdWx0Q29ubmVjdGlvbi5jb25uZWN0IChlcnIpPT5cbiAgICAgIEBjb25uZWN0aW9uc1tAaW5mby5kYXRhYmFzZV0gPSBAZGVmYXVsdENvbm5lY3Rpb25cbiAgICAgIEBkZWZhdWx0Q29ubmVjdGlvbi5vbiAnZXJyb3InLCAoZXJyKSA9PlxuICAgICAgICBjb25zb2xlLmxvZyhlcnIpICNmYXRhbCBlcnJvclxuICAgICAgICBAY29ubmVjdGlvbnNbQGluZm8uZGF0YWJhc2VdID0gbnVsbFxuICAgICAgICBAZmF0YWwgPSB0cnVlXG4gICAgICBjYWxsYmFjayhlcnIpXG5cbiAgc2VyaWFsaXplOiAtPlxuICAgIGMgPSBAZGVmYXVsdENvbm5lY3Rpb25cbiAgICBob3N0OiBjLmhvc3QsXG4gICAgcG9ydDogYy5wb3J0LFxuICAgIHNzbDogYy5zc2xcbiAgICBwcm90b2NvbDogQHByb3RvY29sXG4gICAgZGF0YWJhc2U6IGMuZGF0YWJhc2VcbiAgICB1c2VyOiBjLnVzZXIsXG4gICAgcGFzc3dvcmQ6IGMucGFzc3dvcmRcblxuICBnZXREYXRhYmFzZUNvbm5lY3Rpb246IChkYXRhYmFzZSxjYWxsYmFjaykgLT5cbiAgICBpZihAY29ubmVjdGlvbnNbZGF0YWJhc2VdKVxuICAgICAgY2FsbGJhY2soQGNvbm5lY3Rpb25zW2RhdGFiYXNlXSkgaWYgY2FsbGJhY2tcbiAgICBlbHNlXG4gICAgICBAaW5mby5kYXRhYmFzZSA9IGRhdGFiYXNlXG4gICAgICBuZXdDb25uZWN0aW9uID0gbmV3IHBnLkNsaWVudChAaW5mbylcbiAgICAgIG5ld0Nvbm5lY3Rpb24uY29ubmVjdCAoZXJyKT0+XG4gICAgICAgIGlmIGVyclxuICAgICAgICAgIGNvbnNvbGUubG9nKGVycilcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG5ld0Nvbm5lY3Rpb24ub24gJ2Vycm9yJywgKGVycikgPT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycikgI2ZhdGFsIGVycm9yXG4gICAgICAgICAgICBAY29ubmVjdGlvbnNbZGF0YWJhc2VdID0gbnVsbFxuICAgICAgICAgICAgaWYgbmV3Q29ubmVjdGlvbiA9PSBAZGVmYXVsdENvbm5lY3Rpb25cbiAgICAgICAgICAgICAgQGZhdGFsID0gdHJ1ZVxuICAgICAgICAgIEBjb25uZWN0aW9uc1tkYXRhYmFzZV0gPSBuZXdDb25uZWN0aW9uXG4gICAgICAgICAgY2FsbGJhY2sobmV3Q29ubmVjdGlvbikgaWYgY2FsbGJhY2tcblxuXG4gIHNldERlZmF1bHREYXRhYmFzZTogKGRhdGFiYXNlKS0+XG4gICAgQGdldERhdGFiYXNlQ29ubmVjdGlvbiBkYXRhYmFzZSwgKGNvbm5lY3Rpb24pID0+XG4gICAgICBAZGVmYXVsdENvbm5lY3Rpb24gPSBjb25uZWN0aW9uXG4gICAgICBAZW1pdHRlci5lbWl0ICdkaWQtY2hhbmdlLWRlZmF1bHQtZGF0YWJhc2UnLCBjb25uZWN0aW9uLmRhdGFiYXNlXG5cbiAgZ2V0RGVmYXVsdERhdGFiYXNlOiAtPlxuICAgIEBkZWZhdWx0Q29ubmVjdGlvbi5kYXRhYmFzZVxuXG4gIGRpc3Bvc2U6IC0+XG4gICAgQGNsb3NlKClcblxuICBjbG9zZTogLT5cbiAgICBmb3IgZGF0YWJhc2UsY29ubmVjdGlvbiBvZiBAY29ubmVjdGlvbnNcbiAgICAgIGNvbm5lY3Rpb24uZW5kKClcblxuICBxdWVyeURhdGFiYXNlQ29ubmVjdGlvbjogKHRleHQsY29ubmVjdGlvbixjYWxsYmFjaywgcmVjdXJzaXZlID0gZmFsc2UpIC0+XG4gICAgY29ubmVjdGlvbi5xdWVyeSB7IHRleHQ6IHRleHQgLCByb3dNb2RlOiAnYXJyYXknfSAsIChlcnIsIHJlc3VsdCkgPT5cbiAgICAgIGlmKGVycilcbiAgICAgICAgaWYgZXJyLmNvZGUgPT0gJzBBMDAwJyAmJiBlcnIubWVzc2FnZS5pbmRleE9mKCdjcm9zcy1kYXRhYmFzZScpICE9IC0xICYmICFyZWN1cnNpdmVcbiAgICAgICAgICAgIGRhdGFiYXNlID0gZXJyLm1lc3NhZ2UubWF0Y2goL1wiKC4qPylcIi8pWzFdLnNwbGl0KCcuJylbMF1cbiAgICAgICAgICAgIEBnZXREYXRhYmFzZUNvbm5lY3Rpb24gZGF0YWJhc2UgLCAoY29ubmVjdGlvbjEpID0+XG4gICAgICAgICAgICAgIEBxdWVyeURhdGFiYXNlQ29ubmVjdGlvbih0ZXh0LGNvbm5lY3Rpb24xLGNhbGxiYWNrLHRydWUpICNSZWN1cnNpdmUgY2FsbCFcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGNhbGxiYWNrKHsgdHlwZTogJ2Vycm9yJywgY29udGVudDogZXJyLm1lc3NhZ2V9KVxuICAgICAgZWxzZSBpZiByZXN1bHQuY29tbWFuZCAhPSAnU0VMRUNUJ1xuICAgICAgICBpZiBpc05hTihyZXN1bHQucm93Q291bnQpXG4gICAgICAgICAgY2FsbGJhY2sgdHlwZTogJ3N1Y2Nlc3MnLCBjb250ZW50OiBcIlN1Y2Nlc3NcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgY2FsbGJhY2sgIHR5cGU6ICdzdWNjZXNzJywgY29udGVudDogXCIje3Jlc3VsdC5yb3dDb3VudH0gcm93KHMpIGFmZmVjdGVkXCJcbiAgICAgIGVsc2VcbiAgICAgICAgZm9yIGZpZWxkLGkgaW4gcmVzdWx0LmZpZWxkc1xuICAgICAgICAgIGZpZWxkLmRiID0gY29ubmVjdGlvbi5kYXRhYmFzZVxuICAgICAgICBjYWxsYmFjayhudWxsLHJlc3VsdC5yb3dzLHJlc3VsdC5maWVsZHMpXG5cbiAgcXVlcnk6ICh0ZXh0LGNhbGxiYWNrKSAtPlxuICAgIGlmIEBmYXRhbFxuICAgICAgQGdldERhdGFiYXNlQ29ubmVjdGlvbiBAZGVmYXVsdENvbm5lY3Rpb24uZGF0YWJhc2UsIChjb25uZWN0aW9uKSA9PlxuICAgICAgICBAZGVmYXVsdENvbm5lY3Rpb24gPSBjb25uZWN0aW9uXG4gICAgICAgIEBmYXRhbCA9IGZhbHNlXG4gICAgICAgIEBxdWVyeURhdGFiYXNlQ29ubmVjdGlvbih0ZXh0LEBkZWZhdWx0Q29ubmVjdGlvbixjYWxsYmFjaylcbiAgICBlbHNlXG4gICAgICBAcXVlcnlEYXRhYmFzZUNvbm5lY3Rpb24odGV4dCxAZGVmYXVsdENvbm5lY3Rpb24sY2FsbGJhY2spXG5cbiAgb2JqUm93c01hcDogKHJvd3MsZmllbGRzLGNhbGxiYWNrKS0+XG4gICAgcm93cy5tYXAgKHIsaSkgPT5cbiAgICAgIHJvdyA9IHt9XG4gICAgICByb3dbZmllbGQubmFtZV0gPSByW2pdIGZvciBmaWVsZCxqIGluIGZpZWxkc1xuICAgICAgaWYgY2FsbGJhY2s/IHRoZW4gY2FsbGJhY2socm93KSBlbHNlIHJvd1xuXG4gIHBhcmVudDogLT4gQFxuXG4gIGNoaWxkcmVuOiAoY2FsbGJhY2spLT5cbiAgICBAZ2V0RGF0YWJhc2VzIChkYXRhYmFzZXMsZXJyKS0+XG4gICAgICB1bmxlc3MgZXJyPyB0aGVuIGNhbGxiYWNrKGRhdGFiYXNlcykgZWxzZSBjb25zb2xlLmxvZyBlcnJcblxuICBnZXREYXRhYmFzZXM6IChjYWxsYmFjaykgLT5cbiAgICB0ZXh0ID0gXCJTRUxFQ1QgZGF0bmFtZSBGUk9NIHBnX2RhdGFiYXNlXG4gICAgV0hFUkUgZGF0aXN0ZW1wbGF0ZSA9IGZhbHNlXCJcbiAgICBAcXVlcnkgdGV4dCAsIChlcnIsIHJvd3MsIGZpZWxkcykgPT5cbiAgICAgIGlmICFlcnJcbiAgICAgICAgZGF0YWJhc2VzID0gQG9ialJvd3NNYXAgcm93cyxmaWVsZHMsIChyb3cpID0+XG4gICAgICAgICAgIG5ldyBRdWlja1F1ZXJ5UG9zdGdyZXNEYXRhYmFzZShALHJvdylcbiAgICAgICAgZGF0YWJhc2VzID0gZGF0YWJhc2VzLmZpbHRlciAoZGF0YWJhc2UpID0+ICFAaGlkZGVuRGF0YWJhc2UoZGF0YWJhc2UubmFtZSlcbiAgICAgIGNhbGxiYWNrKGRhdGFiYXNlcyxlcnIpXG5cblxuICBnZXRTY2hlbWFzOiAoZGF0YWJhc2UsIGNhbGxiYWNrKS0+XG4gICAgQGdldERhdGFiYXNlQ29ubmVjdGlvbiBkYXRhYmFzZS5uYW1lLCAoY29ubmVjdGlvbikgPT5cbiAgICAgIHRleHQgPSBcIlNFTEVDVCBzY2hlbWFfbmFtZSBGUk9NIGluZm9ybWF0aW9uX3NjaGVtYS5zY2hlbWF0YVxuICAgICAgV0hFUkUgY2F0YWxvZ19uYW1lID0gJyN7ZGF0YWJhc2UubmFtZX0nXG4gICAgICBBTkQgc2NoZW1hX25hbWUgTk9UIElOICgncGdfdG9hc3QnLCdwZ190ZW1wXzEnLCdwZ190b2FzdF90ZW1wXzEnLCdwZ19jYXRhbG9nJywnaW5mb3JtYXRpb25fc2NoZW1hJylcIlxuICAgICAgQHF1ZXJ5RGF0YWJhc2VDb25uZWN0aW9uIHRleHQsIGNvbm5lY3Rpb24gLCAoZXJyLCByb3dzLCBmaWVsZHMpID0+XG4gICAgICAgIGlmICFlcnJcbiAgICAgICAgICBzY2hlbWFzID0gQG9ialJvd3NNYXAgcm93cywgZmllbGRzICwgKHJvdykgLT5cbiAgICAgICAgICAgIG5ldyBRdWlja1F1ZXJ5UG9zdGdyZXNTY2hlbWEoZGF0YWJhc2Uscm93KVxuICAgICAgICAgIGNhbGxiYWNrKHNjaGVtYXMpXG5cblxuICBnZXRUYWJsZXM6IChzY2hlbWEsY2FsbGJhY2spIC0+XG4gICAgQGdldERhdGFiYXNlQ29ubmVjdGlvbiBzY2hlbWEuZGF0YWJhc2UubmFtZSwgKGNvbm5lY3Rpb24pID0+XG4gICAgICB0ZXh0ID0gXCJcbiAgICAgICAgU0VMRUNUIHRhYmxlX25hbWVcbiAgICAgICAgRlJPTSBpbmZvcm1hdGlvbl9zY2hlbWEudGFibGVzXG4gICAgICAgIFdIRVJFIHRhYmxlX2NhdGFsb2cgPSAnI3tzY2hlbWEuZGF0YWJhc2UubmFtZX0nXG4gICAgICAgIEFORCB0YWJsZV9zY2hlbWEgPSAnI3tzY2hlbWEubmFtZX0nXCJcbiAgICAgIEBxdWVyeURhdGFiYXNlQ29ubmVjdGlvbiB0ZXh0LCBjb25uZWN0aW9uICwgKGVyciwgcm93cywgZmllbGRzKSA9PlxuICAgICAgICBpZiAhZXJyXG4gICAgICAgICAgdGFibGVzID0gQG9ialJvd3NNYXAgcm93cyxmaWVsZHMsIChyb3cpIC0+XG4gICAgICAgICAgICBuZXcgUXVpY2tRdWVyeVBvc3RncmVzVGFibGUoc2NoZW1hLHJvdylcbiAgICAgICAgICBjYWxsYmFjayh0YWJsZXMpXG5cbiAgZ2V0Q29sdW1uczogKHRhYmxlLGNhbGxiYWNrKSAtPlxuICAgIEBnZXREYXRhYmFzZUNvbm5lY3Rpb24gdGFibGUuc2NoZW1hLmRhdGFiYXNlLm5hbWUsIChjb25uZWN0aW9uKT0+XG4gICAgICB0ZXh0ID0gXCJTRUxFQ1QgIHBrLmNvbnN0cmFpbnRfdHlwZSAsYy4qXG4gICAgICAgRlJPTSBpbmZvcm1hdGlvbl9zY2hlbWEuY29sdW1ucyBjXG4gICAgICAgTEVGVCBPVVRFUiBKT0lOIChcbiAgICAgICAgU0VMRUNUXG4gICAgICAgICB0Yy5jb25zdHJhaW50X3R5cGUsXG4gICAgICAgICBrYy5jb2x1bW5fbmFtZSxcbiAgICAgICAgIHRjLnRhYmxlX2NhdGFsb2csXG4gICAgICAgICB0Yy50YWJsZV9uYW1lLFxuICAgICAgICAgdGMudGFibGVfc2NoZW1hXG4gICAgICAgIEZST00gaW5mb3JtYXRpb25fc2NoZW1hLnRhYmxlX2NvbnN0cmFpbnRzIHRjXG4gICAgICAgIElOTkVSIEpPSU4gaW5mb3JtYXRpb25fc2NoZW1hLkNPTlNUUkFJTlRfQ09MVU1OX1VTQUdFIGtjXG4gICAgICAgIE9OIGtjLmNvbnN0cmFpbnRfbmFtZSA9IHRjLmNvbnN0cmFpbnRfbmFtZVxuICAgICAgICBBTkQga2MudGFibGVfY2F0YWxvZyA9IHRjLnRhYmxlX2NhdGFsb2dcbiAgICAgICAgQU5EIGtjLnRhYmxlX25hbWUgPSB0Yy50YWJsZV9uYW1lXG4gICAgICAgIEFORCBrYy50YWJsZV9zY2hlbWEgPSB0Yy50YWJsZV9zY2hlbWFcbiAgICAgICAgV0hFUkUgdGMuY29uc3RyYWludF90eXBlID0gJ1BSSU1BUlkgS0VZJ1xuICAgICAgICkgcGsgT04gcGsuY29sdW1uX25hbWUgPSBjLmNvbHVtbl9uYW1lXG4gICAgICAgIEFORCBway50YWJsZV9jYXRhbG9nID0gYy50YWJsZV9jYXRhbG9nXG4gICAgICAgIEFORCBway50YWJsZV9uYW1lID0gYy50YWJsZV9uYW1lXG4gICAgICAgIEFORCBway50YWJsZV9zY2hlbWEgPSBjLnRhYmxlX3NjaGVtYVxuICAgICAgIFdIRVJFIGMudGFibGVfbmFtZSA9ICcje3RhYmxlLm5hbWV9J1xuICAgICAgIEFORCBjLnRhYmxlX3NjaGVtYSA9ICcje3RhYmxlLnNjaGVtYS5uYW1lfSdcbiAgICAgICBBTkQgYy50YWJsZV9jYXRhbG9nID0gJyN7dGFibGUuc2NoZW1hLmRhdGFiYXNlLm5hbWV9J1wiXG4gICAgICBAcXVlcnlEYXRhYmFzZUNvbm5lY3Rpb24gdGV4dCwgY29ubmVjdGlvbiAsIChlcnIsIHJvd3MsIGZpZWxkcykgPT5cbiAgICAgICAgaWYgIWVyclxuICAgICAgICAgIGNvbHVtbnMgPSBAb2JqUm93c01hcCByb3dzLCBmaWVsZHMsIChyb3cpID0+XG4gICAgICAgICAgICBuZXcgUXVpY2tRdWVyeVBvc3RncmVzQ29sdW1uKHRhYmxlLHJvdylcbiAgICAgICAgICBjYWxsYmFjayhjb2x1bW5zKVxuXG4gIGhpZGRlbkRhdGFiYXNlOiAoZGF0YWJhc2UpIC0+XG4gICAgZGF0YWJhc2UgPT0gXCJwb3N0Z3Jlc1wiXG5cbiAgc2ltcGxlU2VsZWN0OiAodGFibGUsIGNvbHVtbnMgPSAnKicpIC0+XG4gICAgaWYgY29sdW1ucyAhPSAnKidcbiAgICAgIGNvbHVtbnMgPSBjb2x1bW5zLm1hcCAoY29sKSA9PlxuICAgICAgICBAZGVmYXVsdENvbm5lY3Rpb24uZXNjYXBlSWRlbnRpZmllcihjb2wubmFtZSlcbiAgICAgIGNvbHVtbnMgPSBcIlxcbiBcIitjb2x1bW5zLmpvaW4oXCIsXFxuIFwiKSArIFwiXFxuXCJcbiAgICB0YWJsZV9uYW1lID0gQGRlZmF1bHRDb25uZWN0aW9uLmVzY2FwZUlkZW50aWZpZXIodGFibGUubmFtZSlcbiAgICBzY2hlbWFfbmFtZSA9IEBkZWZhdWx0Q29ubmVjdGlvbi5lc2NhcGVJZGVudGlmaWVyKHRhYmxlLnNjaGVtYS5uYW1lKVxuICAgIGRhdGFiYXNlX25hbWUgPSBAZGVmYXVsdENvbm5lY3Rpb24uZXNjYXBlSWRlbnRpZmllcih0YWJsZS5zY2hlbWEuZGF0YWJhc2UubmFtZSlcbiAgICBcIlNFTEVDVCAje2NvbHVtbnN9IEZST00gI3tkYXRhYmFzZV9uYW1lfS4je3NjaGVtYV9uYW1lfS4je3RhYmxlX25hbWV9IExJTUlUIDEwMDA7XCJcblxuXG4gIGNyZWF0ZURhdGFiYXNlOiAobW9kZWwsaW5mbyktPlxuICAgIGRhdGFiYXNlID0gQGRlZmF1bHRDb25uZWN0aW9uLmVzY2FwZUlkZW50aWZpZXIoaW5mby5uYW1lKVxuICAgIFwiQ1JFQVRFIERBVEFCQVNFICN7ZGF0YWJhc2V9O1wiXG5cbiAgY3JlYXRlU2NoZW1hOiAobW9kZWwsaW5mbyktPlxuICAgIHNjaGVtYSA9IEBkZWZhdWx0Q29ubmVjdGlvbi5lc2NhcGVJZGVudGlmaWVyKGluZm8ubmFtZSlcbiAgICBAc2V0RGVmYXVsdERhdGFiYXNlKG1vZGVsLm5hbWUpXG4gICAgXCJDUkVBVEUgU0NIRU1BICN7c2NoZW1hfTtcIlxuXG4gIGNyZWF0ZVRhYmxlOiAobW9kZWwsaW5mbyktPlxuICAgIGRhdGFiYXNlID0gQGRlZmF1bHRDb25uZWN0aW9uLmVzY2FwZUlkZW50aWZpZXIobW9kZWwuZGF0YWJhc2UubmFtZSlcbiAgICBzY2hlbWEgPSBAZGVmYXVsdENvbm5lY3Rpb24uZXNjYXBlSWRlbnRpZmllcihtb2RlbC5uYW1lKVxuICAgIHRhYmxlID0gQGRlZmF1bHRDb25uZWN0aW9uLmVzY2FwZUlkZW50aWZpZXIoaW5mby5uYW1lKVxuICAgIFwiXCJcIlxuICAgICAgQ1JFQVRFIFRBQkxFICN7ZGF0YWJhc2V9LiN7c2NoZW1hfS4je3RhYmxlfSAoXG4gICAgICAgIFwiaWRcIiBJTlQgTk9UIE5VTEwgLFxuICAgICAgICBDT05TVFJBSU5UIFwiI3tpbmZvLm5hbWV9X3BrXCIgUFJJTUFSWSBLRVkgKFwiaWRcIilcbiAgICAgICk7XG4gICAgXCJcIlwiXG5cbiAgY3JlYXRlQ29sdW1uOiAobW9kZWwsaW5mbyktPlxuICAgIGRhdGFiYXNlID0gQGRlZmF1bHRDb25uZWN0aW9uLmVzY2FwZUlkZW50aWZpZXIobW9kZWwuc2NoZW1hLmRhdGFiYXNlLm5hbWUpXG4gICAgc2NoZW1hID0gQGRlZmF1bHRDb25uZWN0aW9uLmVzY2FwZUlkZW50aWZpZXIobW9kZWwuc2NoZW1hLm5hbWUpXG4gICAgdGFibGUgPSBAZGVmYXVsdENvbm5lY3Rpb24uZXNjYXBlSWRlbnRpZmllcihtb2RlbC5uYW1lKVxuICAgIGNvbHVtbiA9IEBkZWZhdWx0Q29ubmVjdGlvbi5lc2NhcGVJZGVudGlmaWVyKGluZm8ubmFtZSlcbiAgICBudWxsYWJsZSA9IGlmIGluZm8ubnVsbGFibGUgdGhlbiAnTlVMTCcgZWxzZSAnTk9UIE5VTEwnXG4gICAgZGFmYXVsdFZhbHVlID0gaWYgaW5mby5kZWZhdWx0ID09IG51bGwgdGhlbiAnTlVMTCcgZWxzZSBAZXNjYXBlKGluZm8uZGVmYXVsdCxpbmZvLmRhdGF0eXBlKVxuICAgIFwiQUxURVIgVEFCTEUgI3tkYXRhYmFzZX0uI3tzY2hlbWF9LiN7dGFibGV9IEFERCBDT0xVTU4gI3tjb2x1bW59XCIrXG4gICAgXCIgI3tpbmZvLmRhdGF0eXBlfSAje251bGxhYmxlfSBERUZBVUxUICN7ZGFmYXVsdFZhbHVlfTtcIlxuXG5cbiAgYWx0ZXJUYWJsZTogKG1vZGVsLGRlbHRhKS0+XG4gICAgZGF0YWJhc2UgPSBAZGVmYXVsdENvbm5lY3Rpb24uZXNjYXBlSWRlbnRpZmllcihtb2RlbC5zY2hlbWEuZGF0YWJhc2UubmFtZSlcbiAgICBzY2hlbWEgPSBAZGVmYXVsdENvbm5lY3Rpb24uZXNjYXBlSWRlbnRpZmllcihtb2RlbC5zY2hlbWEubmFtZSlcbiAgICBuZXdOYW1lID0gQGRlZmF1bHRDb25uZWN0aW9uLmVzY2FwZUlkZW50aWZpZXIoZGVsdGEubmV3X25hbWUpXG4gICAgb2xkTmFtZSA9IEBkZWZhdWx0Q29ubmVjdGlvbi5lc2NhcGVJZGVudGlmaWVyKGRlbHRhLm9sZF9uYW1lKVxuICAgIHF1ZXJ5ID0gXCJBTFRFUiBUQUJMRSAje2RhdGFiYXNlfS4je3NjaGVtYX0uI3tvbGROYW1lfSBSRU5BTUUgVE8gI3tuZXdOYW1lfTtcIlxuXG4gIGFsdGVyQ29sdW1uOiAobW9kZWwsZGVsdGEpLT5cbiAgICBkYXRhYmFzZSA9IEBkZWZhdWx0Q29ubmVjdGlvbi5lc2NhcGVJZGVudGlmaWVyKG1vZGVsLnRhYmxlLnNjaGVtYS5kYXRhYmFzZS5uYW1lKVxuICAgIHNjaGVtYSA9IEBkZWZhdWx0Q29ubmVjdGlvbi5lc2NhcGVJZGVudGlmaWVyKG1vZGVsLnRhYmxlLnNjaGVtYS5uYW1lKVxuICAgIHRhYmxlID0gQGRlZmF1bHRDb25uZWN0aW9uLmVzY2FwZUlkZW50aWZpZXIobW9kZWwudGFibGUubmFtZSlcbiAgICBuZXdOYW1lID0gQGRlZmF1bHRDb25uZWN0aW9uLmVzY2FwZUlkZW50aWZpZXIoZGVsdGEubmV3X25hbWUpXG4gICAgb2xkTmFtZSA9IEBkZWZhdWx0Q29ubmVjdGlvbi5lc2NhcGVJZGVudGlmaWVyKGRlbHRhLm9sZF9uYW1lKVxuICAgIG51bGxhYmxlID0gaWYgZGVsdGEubnVsbGFibGUgdGhlbiAnRFJPUCBOT1QgTlVMTCcgZWxzZSAnU0VUIE5PVCBOVUxMJ1xuICAgIGRlZmF1bHRWYWx1ZSA9IGlmIGRlbHRhLmRlZmF1bHQgPT0gbnVsbCB0aGVuICdOVUxMJyBlbHNlIEBlc2NhcGUoZGVsdGEuZGVmYXVsdCxkZWx0YS5kYXRhdHlwZSlcbiAgICByZXN1bHQgPSBcIlwiXCJcbiAgICAgIEFMVEVSIFRBQkxFICN7ZGF0YWJhc2V9LiN7c2NoZW1hfS4je3RhYmxlfVxuICAgICAgQUxURVIgQ09MVU1OICN7b2xkTmFtZX0gU0VUIERBVEEgVFlQRSAje2RlbHRhLmRhdGF0eXBlfSxcbiAgICAgIEFMVEVSIENPTFVNTiAje29sZE5hbWV9ICN7bnVsbGFibGV9LFxuICAgICAgQUxURVIgQ09MVU1OICN7b2xkTmFtZX0gU0VUIERFRkFVTFQgI3tkZWZhdWx0VmFsdWV9XG4gICAgXCJcIlwiXG4gICAgaWYgb2xkTmFtZSAhPSBuZXdOYW1lXG4gICAgICByZXN1bHQgKz0gXCJcXG5BTFRFUiBUQUJMRSAje2RhdGFiYXNlfS4je3NjaGVtYX0uI3t0YWJsZX1cIitcbiAgICAgIFwiIFJFTkFNRSBDT0xVTU4gI3tvbGROYW1lfSBUTyAje25ld05hbWV9O1wiXG4gICAgcmVzdWx0XG5cbiAgZHJvcERhdGFiYXNlOiAobW9kZWwpLT5cbiAgICBkYXRhYmFzZSA9IEBkZWZhdWx0Q29ubmVjdGlvbi5lc2NhcGVJZGVudGlmaWVyKG1vZGVsLm5hbWUpXG4gICAgXCJEUk9QIERBVEFCQVNFICN7ZGF0YWJhc2V9O1wiXG5cbiAgZHJvcFNjaGVtYTogKG1vZGVsKS0+XG4gICAgc2NoZW1hID0gQGRlZmF1bHRDb25uZWN0aW9uLmVzY2FwZUlkZW50aWZpZXIobW9kZWwubmFtZSlcbiAgICBAc2V0RGVmYXVsdERhdGFiYXNlKG1vZGVsLmRhdGFiYXNlLm5hbWUpXG4gICAgXCJEUk9QIFNDSEVNQSAje3NjaGVtYX07XCJcblxuICBkcm9wVGFibGU6IChtb2RlbCktPlxuICAgIGRhdGFiYXNlID0gQGRlZmF1bHRDb25uZWN0aW9uLmVzY2FwZUlkZW50aWZpZXIobW9kZWwuc2NoZW1hLmRhdGFiYXNlLm5hbWUpXG4gICAgc2NoZW1hID0gQGRlZmF1bHRDb25uZWN0aW9uLmVzY2FwZUlkZW50aWZpZXIobW9kZWwuc2NoZW1hLm5hbWUpXG4gICAgdGFibGUgPSBAZGVmYXVsdENvbm5lY3Rpb24uZXNjYXBlSWRlbnRpZmllcihtb2RlbC5uYW1lKVxuICAgIFwiRFJPUCBUQUJMRSAje2RhdGFiYXNlfS4je3NjaGVtYX0uI3t0YWJsZX07XCJcblxuICBkcm9wQ29sdW1uOiAobW9kZWwpLT5cbiAgICBkYXRhYmFzZSA9IEBkZWZhdWx0Q29ubmVjdGlvbi5lc2NhcGVJZGVudGlmaWVyKG1vZGVsLnRhYmxlLnNjaGVtYS5kYXRhYmFzZS5uYW1lKVxuICAgIHNjaGVtYSA9IEBkZWZhdWx0Q29ubmVjdGlvbi5lc2NhcGVJZGVudGlmaWVyKG1vZGVsLnRhYmxlLnNjaGVtYS5uYW1lKVxuICAgIHRhYmxlID0gQGRlZmF1bHRDb25uZWN0aW9uLmVzY2FwZUlkZW50aWZpZXIobW9kZWwudGFibGUubmFtZSlcbiAgICBjb2x1bW4gPSBAZGVmYXVsdENvbm5lY3Rpb24uZXNjYXBlSWRlbnRpZmllcihtb2RlbC5uYW1lKVxuICAgIFwiQUxURVIgVEFCTEUgI3tkYXRhYmFzZX0uI3tzY2hlbWF9LiN7dGFibGV9IERST1AgQ09MVU1OICN7Y29sdW1ufTtcIlxuXG4gIHByZXBhcmVWYWx1ZXM6ICh2YWx1ZXMsZmllbGRzKS0+IHZhbHVlc1xuXG4gIHVwZGF0ZVJlY29yZDogKHJvdyxmaWVsZHMsdmFsdWVzKS0+XG4gICAgdGFibGVzID0gQF90YWJsZUdyb3VwKGZpZWxkcylcbiAgICBQcm9taXNlLmFsbChcbiAgICAgIGZvciBvaWQsdCBvZiB0YWJsZXNcbiAgICAgICAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgICAgICBAZ2V0VGFibGVCeU9JRCB0LmRhdGFiYXNlLHQub2lkLCAodGFibGUpID0+XG4gICAgICAgICAgICB0YWJsZS5jaGlsZHJlbiAoY29sdW1ucykgPT5cbiAgICAgICAgICAgICAga2V5cyA9ICh7IGl4OiBpLCBrZXk6IGtleX0gZm9yIGtleSxpIGluIGNvbHVtbnMgd2hlbiBrZXkucHJpbWFyeV9rZXkpXG4gICAgICAgICAgICAgIGFsbGtleXMgPSB0cnVlXG4gICAgICAgICAgICAgIGFsbGtleXMgJj0gcm93W2suaXhdPyBmb3IgayBpbiBrZXlzXG4gICAgICAgICAgICAgIGlmIGFsbGtleXMgJiYga2V5cy5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgQF9tYXRjaENvbHVtbnModC5maWVsZHMsY29sdW1ucylcbiAgICAgICAgICAgICAgICBhc3NpbmdzID0gdC5maWVsZHMuZmlsdGVyKCAoZmllbGQpLT4gZmllbGQuY29sdW1uPyApLm1hcCAoZmllbGQpID0+XG4gICAgICAgICAgICAgICAgICBcIiN7QGRlZmF1bHRDb25uZWN0aW9uLmVzY2FwZUlkZW50aWZpZXIoZmllbGQuY29sdW1uLm5hbWUpfSA9ICN7QGVzY2FwZSh2YWx1ZXNbZmllbGQubmFtZV0sZmllbGQuY29sdW1uLmRhdGF0eXBlKX1cIlxuICAgICAgICAgICAgICAgIGRhdGFiYXNlID0gQGRlZmF1bHRDb25uZWN0aW9uLmVzY2FwZUlkZW50aWZpZXIodGFibGUuc2NoZW1hLmRhdGFiYXNlLm5hbWUpXG4gICAgICAgICAgICAgICAgc2NoZW1hID0gQGRlZmF1bHRDb25uZWN0aW9uLmVzY2FwZUlkZW50aWZpZXIodGFibGUuc2NoZW1hLm5hbWUpXG4gICAgICAgICAgICAgICAgdGFibGUgPSBAZGVmYXVsdENvbm5lY3Rpb24uZXNjYXBlSWRlbnRpZmllcih0YWJsZS5uYW1lKVxuICAgICAgICAgICAgICAgIHdoZXJlID0ga2V5cy5tYXAgKGspPT4gXCIje0BkZWZhdWx0Q29ubmVjdGlvbi5lc2NhcGVJZGVudGlmaWVyKGsua2V5Lm5hbWUpfSA9ICN7QGVzY2FwZShyb3dbay5peF0say5rZXkuZGF0YXR5cGUpfVwiXG4gICAgICAgICAgICAgICAgdXBkYXRlID0gXCJVUERBVEUgI3tkYXRhYmFzZX0uI3tzY2hlbWF9LiN7dGFibGV9XCIrXG4gICAgICAgICAgICAgICAgXCIgU0VUICN7YXNzaW5ncy5qb2luKCcsJyl9XCIrXG4gICAgICAgICAgICAgICAgXCIgV0hFUkUgXCIrd2hlcmUuam9pbignIEFORCAnKStcIjtcIlxuICAgICAgICAgICAgICAgIHJlc29sdmUodXBkYXRlKVxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgnJylcbiAgICApLnRoZW4gKHVwZGF0ZXMpIC0+IChuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPiByZXNvbHZlKHVwZGF0ZXMuam9pbihcIlxcblwiKSkpXG5cblxuICBpbnNlcnRSZWNvcmQ6IChmaWVsZHMsdmFsdWVzKS0+XG4gICAgdGFibGVzID0gQF90YWJsZUdyb3VwKGZpZWxkcylcbiAgICBQcm9taXNlLmFsbChcbiAgICAgIGZvciBvaWQsdCBvZiB0YWJsZXNcbiAgICAgICAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgICAgICBAZ2V0VGFibGVCeU9JRCB0LmRhdGFiYXNlLHQub2lkLCAodGFibGUpID0+XG4gICAgICAgICAgICB0YWJsZS5jaGlsZHJlbiAoY29sdW1ucykgPT5cbiAgICAgICAgICAgICAgQF9tYXRjaENvbHVtbnModC5maWVsZHMsY29sdW1ucylcbiAgICAgICAgICAgICAgYXJ5ZmllbGRzID0gdC5maWVsZHMuZmlsdGVyKCAoZmllbGQpLT4gZmllbGQuY29sdW1uPyApLm1hcCAoZmllbGQpID0+XG4gICAgICAgICAgICAgICAgQGRlZmF1bHRDb25uZWN0aW9uLmVzY2FwZUlkZW50aWZpZXIoZmllbGQuY29sdW1uLm5hbWUpXG4gICAgICAgICAgICAgIHN0cmZpZWxkcyA9IGFyeWZpZWxkcy5qb2luKCcsJylcbiAgICAgICAgICAgICAgYXJ5dmFsdWVzID0gdC5maWVsZHMuZmlsdGVyKCAoZmllbGQpLT4gZmllbGQuY29sdW1uPyApLm1hcCAoZmllbGQpID0+XG4gICAgICAgICAgICAgICAgQGVzY2FwZSh2YWx1ZXNbZmllbGQuY29sdW1uLm5hbWVdLGZpZWxkLmNvbHVtbi5kYXRhdHlwZSlcbiAgICAgICAgICAgICAgc3RydmFsdWVzID0gYXJ5dmFsdWVzLmpvaW4oJywnKVxuICAgICAgICAgICAgICBkYXRhYmFzZSA9IEBkZWZhdWx0Q29ubmVjdGlvbi5lc2NhcGVJZGVudGlmaWVyKHRhYmxlLnNjaGVtYS5kYXRhYmFzZS5uYW1lKVxuICAgICAgICAgICAgICBzY2hlbWEgPSBAZGVmYXVsdENvbm5lY3Rpb24uZXNjYXBlSWRlbnRpZmllcih0YWJsZS5zY2hlbWEubmFtZSlcbiAgICAgICAgICAgICAgdGFibGUgPSBAZGVmYXVsdENvbm5lY3Rpb24uZXNjYXBlSWRlbnRpZmllcih0YWJsZS5uYW1lKVxuICAgICAgICAgICAgICBpbnNlcnQgPSBcIklOU0VSVCBJTlRPICN7ZGF0YWJhc2V9LiN7c2NoZW1hfS4je3RhYmxlfVwiK1xuICAgICAgICAgICAgICBcIiAoI3tzdHJmaWVsZHN9KSBWQUxVRVMgKCN7c3RydmFsdWVzfSk7XCJcbiAgICAgICAgICAgICAgcmVzb2x2ZShpbnNlcnQpXG4gICAgKS50aGVuIChpbnNlcnRzKSAtPiAobmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgLT4gcmVzb2x2ZShpbnNlcnRzLmpvaW4oXCJcXG5cIikpKVxuXG4gIGRlbGV0ZVJlY29yZDogKHJvdyxmaWVsZHMpLT5cbiAgICB0YWJsZXMgPSBAX3RhYmxlR3JvdXAoZmllbGRzKVxuICAgIFByb21pc2UuYWxsKFxuICAgICAgZm9yIG9pZCx0IG9mIHRhYmxlc1xuICAgICAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgICAgIEBnZXRUYWJsZUJ5T0lEIHQuZGF0YWJhc2UsdC5vaWQsICh0YWJsZSkgPT5cbiAgICAgICAgICAgIHRhYmxlLmNoaWxkcmVuIChjb2x1bW5zKSA9PlxuICAgICAgICAgICAgICBrZXlzID0gKHsgaXg6IGksIGtleToga2V5fSBmb3Iga2V5LGkgaW4gY29sdW1ucyB3aGVuIGtleS5wcmltYXJ5X2tleSlcbiAgICAgICAgICAgICAgYWxsa2V5cyA9IHRydWVcbiAgICAgICAgICAgICAgYWxsa2V5cyAmPSByb3dbay5peF0/IGZvciBrIGluIGtleXNcbiAgICAgICAgICAgICAgaWYgYWxsa2V5cyAmJiBrZXlzLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICBkYXRhYmFzZSA9IEBkZWZhdWx0Q29ubmVjdGlvbi5lc2NhcGVJZGVudGlmaWVyKHRhYmxlLnNjaGVtYS5kYXRhYmFzZS5uYW1lKVxuICAgICAgICAgICAgICAgIHNjaGVtYSA9IEBkZWZhdWx0Q29ubmVjdGlvbi5lc2NhcGVJZGVudGlmaWVyKHRhYmxlLnNjaGVtYS5uYW1lKVxuICAgICAgICAgICAgICAgIHRhYmxlID0gQGRlZmF1bHRDb25uZWN0aW9uLmVzY2FwZUlkZW50aWZpZXIodGFibGUubmFtZSlcbiAgICAgICAgICAgICAgICB3aGVyZSA9IGtleXMubWFwIChrKT0+IFwiI3tAZGVmYXVsdENvbm5lY3Rpb24uZXNjYXBlSWRlbnRpZmllcihrLmtleS5uYW1lKX0gPSAje0Blc2NhcGUocm93W2suaXhdLGsua2V5LmRhdGF0eXBlKX1cIlxuICAgICAgICAgICAgICAgIGRlbCA9IFwiREVMRVRFIEZST00gI3tkYXRhYmFzZX0uI3tzY2hlbWF9LiN7dGFibGV9XCIrXG4gICAgICAgICAgICAgICAgXCIgV0hFUkUgXCIrd2hlcmUuam9pbignIEFORCAnKStcIjtcIlxuICAgICAgICAgICAgICAgIHJlc29sdmUoZGVsKVxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgnJylcbiAgICApLnRoZW4gKGRlbGV0ZXMpIC0+IChuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPiByZXNvbHZlKGRlbGV0ZXMuam9pbihcIlxcblwiKSkpXG5cblxuICBnZXRUYWJsZUJ5T0lEOiAoZGF0YWJhc2Usb2lkLGNhbGxiYWNrKS0+XG4gICAgQGdldERhdGFiYXNlQ29ubmVjdGlvbiBkYXRhYmFzZSwgKGNvbm5lY3Rpb24pID0+XG4gICAgICB0ZXh0ID0gXCJTRUxFQ1Qgcy5uc3BuYW1lIEFTIHNjaGVtYV9uYW1lLFxuICAgICAgIHQucmVsbmFtZSBBUyB0YWJsZV9uYW1lXG4gICAgICAgRlJPTSBwZ19jbGFzcyB0XG4gICAgICAgSU5ORVIgSk9JTiBwZ19uYW1lc3BhY2UgcyBPTiB0LnJlbG5hbWVzcGFjZSA9IHMub2lkXG4gICAgICAgV0hFUkUgdC5vaWQgPSAje29pZH1cIlxuICAgICAgQHF1ZXJ5RGF0YWJhc2VDb25uZWN0aW9uIHRleHQsIGNvbm5lY3Rpb24gLCAoZXJyLCByb3dzLCBmaWVsZHMpID0+XG4gICAgICAgIGRiID0ge25hbWU6IGRhdGFiYXNlLCBjb25uZWN0aW9uOiBAIH1cbiAgICAgICAgaWYgIWVyciAmJiByb3dzLmxlbmd0aCA9PSAxXG4gICAgICAgICAgcm93ID0gQG9ialJvd3NNYXAocm93cyxmaWVsZHMpWzBdXG4gICAgICAgICAgc2NoZW1hID0gbmV3IFF1aWNrUXVlcnlQb3N0Z3Jlc1NjaGVtYShkYixyb3csZmllbGRzKVxuICAgICAgICAgIHRhYmxlID0gbmV3IFF1aWNrUXVlcnlQb3N0Z3Jlc1RhYmxlKHNjaGVtYSxyb3cpXG4gICAgICAgICAgY2FsbGJhY2sodGFibGUpXG5cbiAgX21hdGNoQ29sdW1uczogKGZpZWxkcyxjb2x1bW5zKS0+XG4gICAgZm9yIGZpZWxkIGluIGZpZWxkc1xuICAgICAgZm9yIGNvbHVtbiBpbiBjb2x1bW5zXG4gICAgICAgIGZpZWxkLmNvbHVtbiA9IGNvbHVtbiBpZiBjb2x1bW4uaWQgPT0gZmllbGQuY29sdW1uSURcblxuICBfdGFibGVHcm91cDogKGZpZWxkcyktPlxuICAgIHRhYmxlcyA9IHt9XG4gICAgZm9yIGZpZWxkIGluIGZpZWxkc1xuICAgICAgaWYgZmllbGQudGFibGVJRD9cbiAgICAgICAgb2lkID0gZmllbGQudGFibGVJRC50b1N0cmluZygpXG4gICAgICAgIHRhYmxlc1tvaWRdID89XG4gICAgICAgICAgb2lkOiBmaWVsZC50YWJsZUlEXG4gICAgICAgICAgZGF0YWJhc2U6IGZpZWxkLmRiXG4gICAgICAgICAgZmllbGRzOiBbXVxuICAgICAgICB0YWJsZXNbb2lkXS5maWVsZHMucHVzaChmaWVsZClcbiAgICB0YWJsZXNcblxuICBvbkRpZENoYW5nZURlZmF1bHREYXRhYmFzZTogKGNhbGxiYWNrKS0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC1jaGFuZ2UtZGVmYXVsdC1kYXRhYmFzZScsIGNhbGxiYWNrXG5cbiAgZ2V0RGF0YVR5cGVzOiAtPlxuICAgIEBuX3R5cGVzLmNvbmNhdChAc190eXBlcylcblxuICB0b1N0cmluZzogLT5cbiAgICBAcHJvdG9jb2wrXCI6Ly9cIitAZGVmYXVsdENvbm5lY3Rpb24udXNlcitcIkBcIitAZGVmYXVsdENvbm5lY3Rpb24uaG9zdFxuXG4gIGVzY2FwZTogKHZhbHVlLHR5cGUpLT5cbiAgICBpZiB2YWx1ZSA9PSBudWxsXG4gICAgICByZXR1cm4gJ05VTEwnXG4gICAgZm9yIHQxIGluIEBzX3R5cGVzXG4gICAgICBpZiB0eXBlLnNlYXJjaChuZXcgUmVnRXhwKHQxLCBcImlcIikpICE9IC0xXG4gICAgICAgIHJldHVybiBAZGVmYXVsdENvbm5lY3Rpb24uZXNjYXBlTGl0ZXJhbCh2YWx1ZSlcbiAgICB2YWx1ZS50b1N0cmluZygpXG4iXX0=
