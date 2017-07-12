(function() {
  var ATOM_BUNDLE_IDENTIFIER, BufferedProcess, INSTALLATION_LINE_PATTERN, meta,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  meta = require('../package.json');

  BufferedProcess = require('atom').BufferedProcess;

  ATOM_BUNDLE_IDENTIFIER = 'com.github.atom';

  INSTALLATION_LINE_PATTERN = /^Installing +([^@]+)@(\S+).+\s+(\S+)$/;

  module.exports = {
    updatePackages: function(isAutoUpdate) {
      if (isAutoUpdate == null) {
        isAutoUpdate = true;
      }
      return this.runApmUpgrade((function(_this) {
        return function(log) {
          var entries, summary;
          entries = _this.parseLog(log);
          summary = _this.generateSummary(entries, isAutoUpdate);
          if (!summary) {
            return;
          }
          return _this.notify({
            title: 'Atom Package Updates',
            message: summary,
            sender: ATOM_BUNDLE_IDENTIFIER,
            activate: ATOM_BUNDLE_IDENTIFIER
          });
        };
      })(this));
    },
    runApmUpgrade: function(callback) {
      var args, availablePackage, availablePackages, command, excludedPackage, excludedPackages, exit, i, includedPackage, includedPackages, index, j, k, len, len1, len2, log, stdout;
      command = atom.packages.getApmPath();
      availablePackages = atom.packages.getAvailablePackageNames();
      includedPackages = atom.config.get(meta.name + ".includedPackages");
      excludedPackages = atom.config.get(meta.name + ".excludedPackages");
      args = ["upgrade"];
      if (includedPackages.length > 0) {
        if (atom.inDevMode()) {
          console.log("Packages included in update:");
        }
        for (i = 0, len = includedPackages.length; i < len; i++) {
          includedPackage = includedPackages[i];
          if (atom.inDevMode()) {
            console.log("- " + includedPackage);
          }
          args.push(includedPackage);
        }
      } else if (excludedPackages.length > 0) {
        if (atom.inDevMode()) {
          console.log("Packages excluded from update:");
        }
        for (j = 0, len1 = excludedPackages.length; j < len1; j++) {
          excludedPackage = excludedPackages[j];
          if (indexOf.call(availablePackages, excludedPackage) >= 0) {
            if (atom.inDevMode()) {
              console.log("- " + excludedPackage);
            }
            index = availablePackages.indexOf(excludedPackage);
            if (index) {
              availablePackages.splice(index, 1);
            }
          }
        }
        for (k = 0, len2 = availablePackages.length; k < len2; k++) {
          availablePackage = availablePackages[k];
          args.push(availablePackage);
        }
      }
      args.push("--no-confirm");
      args.push("--no-color");
      log = '';
      stdout = function(data) {
        return log += data;
      };
      exit = function(exitCode) {
        return callback(log);
      };
      return new BufferedProcess({
        command: command,
        args: args,
        stdout: stdout,
        exit: exit
      });
    },
    parseLog: function(log) {
      var _match, i, len, line, lines, matches, name, result, results, version;
      lines = log.split('\n');
      results = [];
      for (i = 0, len = lines.length; i < len; i++) {
        line = lines[i];
        matches = line.match(INSTALLATION_LINE_PATTERN);
        if (matches == null) {
          continue;
        }
        _match = matches[0], name = matches[1], version = matches[2], result = matches[3];
        results.push({
          'name': name,
          'version': version,
          'isInstalled': result === '\u2713'
        });
      }
      return results;
    },
    generateSummary: function(entries, isAutoUpdate) {
      var names, successfulEntries, summary;
      if (isAutoUpdate == null) {
        isAutoUpdate = true;
      }
      successfulEntries = entries.filter(function(entry) {
        return entry.isInstalled;
      });
      if (!(successfulEntries.length > 0)) {
        return null;
      }
      names = successfulEntries.map(function(entry) {
        return entry.name;
      });
      summary = successfulEntries.length <= 5 ? this.generateEnumerationExpression(names) : successfulEntries.length + " packages";
      summary += successfulEntries.length === 1 ? ' has' : ' have';
      summary += ' been updated';
      if (isAutoUpdate) {
        summary += ' automatically';
      }
      summary += '.';
      return summary;
    },
    generateEnumerationExpression: function(items) {
      var expression, i, index, item, len;
      expression = '';
      for (index = i = 0, len = items.length; i < len; index = ++i) {
        item = items[index];
        if (index > 0) {
          if (index + 1 < items.length) {
            expression += ', ';
          } else {
            expression += ' and ';
          }
        }
        expression += item;
      }
      return expression;
    },
    notify: function(notification) {
      var args, key, value;
      args = [];
      for (key in notification) {
        value = notification[key];
        args.push("-" + key, value);
      }
      if (atom.config.get(meta.name + ".updateNotification")) {
        return atom.notifications.addSuccess(meta.name, {
          detail: notification.message,
          dismissable: !atom.config.get(meta.name + ".dismissNotification"),
          buttons: [
            {
              text: 'Restart',
              onDidClick: function() {
                return atom.restartApplication();
              }
            }
          ]
        });
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2F1dG8tdXBkYXRlLXBsdXMvbGliL3BhY2thZ2UtdXBkYXRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHdFQUFBO0lBQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxpQkFBUjs7RUFDTixrQkFBbUIsT0FBQSxDQUFRLE1BQVI7O0VBRXBCLHNCQUFBLEdBQXlCOztFQUN6Qix5QkFBQSxHQUE0Qjs7RUFFNUIsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLGNBQUEsRUFBZ0IsU0FBQyxZQUFEOztRQUFDLGVBQWU7O2FBQzlCLElBQUMsQ0FBQSxhQUFELENBQWUsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQ7QUFDYixjQUFBO1VBQUEsT0FBQSxHQUFVLEtBQUMsQ0FBQSxRQUFELENBQVUsR0FBVjtVQUNWLE9BQUEsR0FBVSxLQUFDLENBQUEsZUFBRCxDQUFpQixPQUFqQixFQUEwQixZQUExQjtVQUNWLElBQUEsQ0FBYyxPQUFkO0FBQUEsbUJBQUE7O2lCQUNBLEtBQUMsQ0FBQSxNQUFELENBQ0U7WUFBQSxLQUFBLEVBQU8sc0JBQVA7WUFDQSxPQUFBLEVBQVMsT0FEVDtZQUVBLE1BQUEsRUFBUSxzQkFGUjtZQUdBLFFBQUEsRUFBVSxzQkFIVjtXQURGO1FBSmE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWY7SUFEYyxDQUFoQjtJQVdBLGFBQUEsRUFBZSxTQUFDLFFBQUQ7QUFDYixVQUFBO01BQUEsT0FBQSxHQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBZCxDQUFBO01BRVYsaUJBQUEsR0FBb0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyx3QkFBZCxDQUFBO01BQ3BCLGdCQUFBLEdBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFtQixJQUFJLENBQUMsSUFBTixHQUFXLG1CQUE3QjtN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Y2thZ2UuanNvbidcbntCdWZmZXJlZFByb2Nlc3N9ID0gcmVxdWlyZSAnYXRvbSdcblxuQVRPTV9CVU5ETEVfSURFTlRJRklFUiA9ICdjb20uZ2l0aHViLmF0b20nXG5JTlNUQUxMQVRJT05fTElORV9QQVRURVJOID0gL15JbnN0YWxsaW5nICsoW15AXSspQChcXFMrKS4rXFxzKyhcXFMrKSQvXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgdXBkYXRlUGFja2FnZXM6IChpc0F1dG9VcGRhdGUgPSB0cnVlKSAtPlxuICAgIEBydW5BcG1VcGdyYWRlIChsb2cpID0+XG4gICAgICBlbnRyaWVzID0gQHBhcnNlTG9nKGxvZylcbiAgICAgIHN1bW1hcnkgPSBAZ2VuZXJhdGVTdW1tYXJ5KGVudHJpZXMsIGlzQXV0b1VwZGF0ZSlcbiAgICAgIHJldHVybiB1bmxlc3Mgc3VtbWFyeVxuICAgICAgQG5vdGlmeVxuICAgICAgICB0aXRsZTogJ0F0b20gUGFja2FnZSBVcGRhdGVzJ1xuICAgICAgICBtZXNzYWdlOiBzdW1tYXJ5XG4gICAgICAgIHNlbmRlcjogQVRPTV9CVU5ETEVfSURFTlRJRklFUlxuICAgICAgICBhY3RpdmF0ZTogQVRPTV9CVU5ETEVfSURFTlRJRklFUlxuXG4gIHJ1bkFwbVVwZ3JhZGU6IChjYWxsYmFjaykgLT5cbiAgICBjb21tYW5kID0gYXRvbS5wYWNrYWdlcy5nZXRBcG1QYXRoKClcblxuICAgIGF2YWlsYWJsZVBhY2thZ2VzID0gYXRvbS5wYWNrYWdlcy5nZXRBdmFpbGFibGVQYWNrYWdlTmFtZXMoKVxuICAgIGluY2x1ZGVkUGFja2FnZXMgPSBhdG9tLmNvbmZpZy5nZXQoXCIje21ldGEubmFtZX0uaW5jbHVkZWRQYWNrYWdlc1wiKVxuICAgIGV4Y2x1ZGVkUGFja2FnZXMgPSBhdG9tLmNvbmZpZy5nZXQoXCIje21ldGEubmFtZX0uZXhjbHVkZWRQYWNrYWdlc1wiKVxuXG4gICAgYXJncyA9IFtcInVwZ3JhZGVcIl1cblxuICAgIGlmIGluY2x1ZGVkUGFja2FnZXMubGVuZ3RoID4gMFxuICAgICAgY29uc29sZS5sb2cgXCJQYWNrYWdlcyBpbmNsdWRlZCBpbiB1cGRhdGU6XCIgaWYgYXRvbS5pbkRldk1vZGUoKVxuXG4gICAgICBmb3IgaW5jbHVkZWRQYWNrYWdlIGluIGluY2x1ZGVkUGFja2FnZXNcbiAgICAgICAgY29uc29sZS5sb2cgXCItICN7aW5jbHVkZWRQYWNrYWdlfVwiIGlmIGF0b20uaW5EZXZNb2RlKClcbiAgICAgICAgYXJncy5wdXNoIGluY2x1ZGVkUGFja2FnZVxuXG4gICAgZWxzZSBpZiBleGNsdWRlZFBhY2thZ2VzLmxlbmd0aCA+IDBcbiAgICAgIGNvbnNvbGUubG9nIFwiUGFja2FnZXMgZXhjbHVkZWQgZnJvbSB1cGRhdGU6XCIgaWYgYXRvbS5pbkRldk1vZGUoKVxuXG4gICAgICBmb3IgZXhjbHVkZWRQYWNrYWdlIGluIGV4Y2x1ZGVkUGFja2FnZXNcbiAgICAgICAgaWYgZXhjbHVkZWRQYWNrYWdlIGluIGF2YWlsYWJsZVBhY2thZ2VzXG4gICAgICAgICAgY29uc29sZS5sb2cgXCItICN7ZXhjbHVkZWRQYWNrYWdlfVwiIGlmIGF0b20uaW5EZXZNb2RlKClcbiAgICAgICAgICBpbmRleCA9IGF2YWlsYWJsZVBhY2thZ2VzLmluZGV4T2YgZXhjbHVkZWRQYWNrYWdlXG4gICAgICAgICAgYXZhaWxhYmxlUGFja2FnZXMuc3BsaWNlIGluZGV4LCAxIGlmIGluZGV4XG5cbiAgICAgIGZvciBhdmFpbGFibGVQYWNrYWdlIGluIGF2YWlsYWJsZVBhY2thZ2VzXG4gICAgICAgIGFyZ3MucHVzaCBhdmFpbGFibGVQYWNrYWdlXG5cbiAgICBhcmdzLnB1c2ggXCItLW5vLWNvbmZpcm1cIlxuICAgIGFyZ3MucHVzaCBcIi0tbm8tY29sb3JcIlxuXG4gICAgbG9nID0gJydcblxuICAgIHN0ZG91dCA9IChkYXRhKSAtPlxuICAgICAgbG9nICs9IGRhdGFcblxuICAgIGV4aXQgPSAoZXhpdENvZGUpIC0+XG4gICAgICBjYWxsYmFjayhsb2cpXG5cbiAgICBuZXcgQnVmZmVyZWRQcm9jZXNzKHtjb21tYW5kLCBhcmdzLCBzdGRvdXQsIGV4aXR9KVxuXG4gICMgUGFyc2luZyB0aGUgb3V0cHV0IG9mIGFwbSBpcyBhIGRpcnR5IHdheSwgYnV0IHVzaW5nIGF0b20tcGFja2FnZS1tYW5hZ2VyIGRpcmVjdGx5IHZpYSBKYXZhU2NyaXB0XG4gICMgaXMgcHJvYmFibHkgbW9yZSBicml0dGxlIHRoYW4gcGFyc2luZyB0aGUgb3V0cHV0IHNpbmNlIGl0J3MgYSBwcml2YXRlIHBhY2thZ2UuXG4gICMgL0FwcGxpY2F0aW9ucy9BdG9tLmFwcC9Db250ZW50cy9SZXNvdXJjZXMvYXBwL2FwbS9ub2RlX21vZHVsZXMvYXRvbS1wYWNrYWdlLW1hbmFnZXJcbiAgcGFyc2VMb2c6IChsb2cpIC0+XG4gICAgbGluZXMgPSBsb2cuc3BsaXQoJ1xcbicpXG5cbiAgICBmb3IgbGluZSBpbiBsaW5lc1xuICAgICAgbWF0Y2hlcyA9IGxpbmUubWF0Y2goSU5TVEFMTEFUSU9OX0xJTkVfUEFUVEVSTilcbiAgICAgIGNvbnRpbnVlIHVubGVzcyBtYXRjaGVzP1xuICAgICAgW19tYXRjaCwgbmFtZSwgdmVyc2lvbiwgcmVzdWx0XSA9IG1hdGNoZXNcblxuICAgICAgJ25hbWUnOiBuYW1lXG4gICAgICAndmVyc2lvbic6IHZlcnNpb25cbiAgICAgICdpc0luc3RhbGxlZCc6IHJlc3VsdCA9PSAnXFx1MjcxMydcblxuICBnZW5lcmF0ZVN1bW1hcnk6IChlbnRyaWVzLCBpc0F1dG9VcGRhdGUgPSB0cnVlKSAtPlxuICAgIHN1Y2Nlc3NmdWxFbnRyaWVzID0gZW50cmllcy5maWx0ZXIgKGVudHJ5KSAtPlxuICAgICAgZW50cnkuaXNJbnN0YWxsZWRcbiAgICByZXR1cm4gbnVsbCB1bmxlc3Mgc3VjY2Vzc2Z1bEVudHJpZXMubGVuZ3RoID4gMFxuXG4gICAgbmFtZXMgPSBzdWNjZXNzZnVsRW50cmllcy5tYXAgKGVudHJ5KSAtPlxuICAgICAgZW50cnkubmFtZVxuXG4gICAgc3VtbWFyeSA9XG4gICAgICBpZiBzdWNjZXNzZnVsRW50cmllcy5sZW5ndGggPD0gNVxuICAgICAgICBAZ2VuZXJhdGVFbnVtZXJhdGlvbkV4cHJlc3Npb24obmFtZXMpXG4gICAgICBlbHNlXG4gICAgICAgIFwiI3tzdWNjZXNzZnVsRW50cmllcy5sZW5ndGh9IHBhY2thZ2VzXCJcblxuICAgIHN1bW1hcnkgKz0gaWYgc3VjY2Vzc2Z1bEVudHJpZXMubGVuZ3RoID09IDEgdGhlbiAnIGhhcycgZWxzZSAnIGhhdmUnXG4gICAgc3VtbWFyeSArPSAnIGJlZW4gdXBkYXRlZCdcbiAgICBzdW1tYXJ5ICs9ICcgYXV0b21hdGljYWxseScgaWYgaXNBdXRvVXBkYXRlXG4gICAgc3VtbWFyeSArPSAnLidcbiAgICBzdW1tYXJ5XG5cbiAgZ2VuZXJhdGVFbnVtZXJhdGlvbkV4cHJlc3Npb246IChpdGVtcykgLT5cbiAgICBleHByZXNzaW9uID0gJydcblxuICAgIGZvciBpdGVtLCBpbmRleCBpbiBpdGVtc1xuICAgICAgaWYgaW5kZXggPiAwXG4gICAgICAgIGlmIGluZGV4ICsgMSA8IGl0ZW1zLmxlbmd0aFxuICAgICAgICAgIGV4cHJlc3Npb24gKz0gJywgJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgZXhwcmVzc2lvbiArPSAnIGFuZCAnXG5cbiAgICAgIGV4cHJlc3Npb24gKz0gaXRlbVxuXG4gICAgZXhwcmVzc2lvblxuXG4gIG5vdGlmeTogKG5vdGlmaWNhdGlvbikgLT5cbiAgICBhcmdzID0gW11cbiAgICBmb3Iga2V5LCB2YWx1ZSBvZiBub3RpZmljYXRpb25cbiAgICAgIGFyZ3MucHVzaChcIi0je2tleX1cIiwgdmFsdWUpXG5cbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoXCIje21ldGEubmFtZX0udXBkYXRlTm90aWZpY2F0aW9uXCIpXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcyhcbiAgICAgICAgbWV0YS5uYW1lLFxuICAgICAgICBkZXRhaWw6IG5vdGlmaWNhdGlvbi5tZXNzYWdlXG4gICAgICAgIGRpc21pc3NhYmxlOiAhYXRvbS5jb25maWcuZ2V0KFwiI3ttZXRhLm5hbWV9LmRpc21pc3NOb3RpZmljYXRpb25cIilcbiAgICAgICAgYnV0dG9uczogW3tcbiAgICAgICAgICB0ZXh0OiAnUmVzdGFydCcsXG4gICAgICAgICAgb25EaWRDbGljazogLT4gYXRvbS5yZXN0YXJ0QXBwbGljYXRpb24oKVxuICAgICAgICB9XVxuICAgICAgKVxuIl19
