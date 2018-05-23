(function() {
  var ATOM_BUNDLE_IDENTIFIER, BufferedProcess, INSTALLATION_LINE_PATTERN, Util, meta,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  meta = require("../package.json");

  Util = require("./util");

  BufferedProcess = require("atom").BufferedProcess;

  ATOM_BUNDLE_IDENTIFIER = "com.github.atom";

  INSTALLATION_LINE_PATTERN = /^Installing +([^@]+)@(\S+).+\s+(\S+)$/;

  module.exports = {
    updatePackages: function(isAutoUpdate) {
      if (isAutoUpdate == null) {
        isAutoUpdate = true;
      }
      return this.runApmUpgrade((function(_this) {
        return function(log) {
          var entries, packageWording, summary, updateWording;
          entries = _this.parseLog(log);
          summary = _this.generateSummary(entries, isAutoUpdate);
          updateWording = isAutoUpdate === true ? "Auto-updating" : "Updating";
          packageWording = entries.length === 1 ? "package" : "packages";
          if (entries.length > 0) {
            require("./ga").sendEvent("package-updater", updateWording + " " + entries.length + " " + packageWording + " (Atom v" + atom.appVersion + " " + (atom.getReleaseChannel()) + ")");
            if (Util.getConfig("debugMode")) {
              console.log(updateWording + " " + entries.length + " " + packageWording);
            }
          }
          if (!summary) {
            return;
          }
          return _this.notify({
            title: "Atom Package Updates",
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
        if (Util.getConfig("debugMode")) {
          console.log("Packages included in update:");
        }
        for (i = 0, len = includedPackages.length; i < len; i++) {
          includedPackage = includedPackages[i];
          if (Util.getConfig("debugMode")) {
            console.log("- " + includedPackage);
          }
          args.push(includedPackage);
        }
      } else if (excludedPackages.length > 0) {
        if (Util.getConfig("debugMode")) {
          console.log("Packages excluded from update:");
        }
        for (j = 0, len1 = excludedPackages.length; j < len1; j++) {
          excludedPackage = excludedPackages[j];
          if (indexOf.call(availablePackages, excludedPackage) >= 0) {
            if (Util.getConfig("debugMode")) {
              console.log("- " + excludedPackage);
            }
            index = availablePackages.indexOf(excludedPackage);
            if (index) {
              availablePackages.splice(index, 1);
            }
          }
        }
      } else {
        for (k = 0, len2 = availablePackages.length; k < len2; k++) {
          availablePackage = availablePackages[k];
          args.push(availablePackage);
        }
      }
      args.push("--no-confirm");
      args.push("--no-color");
      log = "";
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
      lines = log.split("\n");
      results = [];
      for (i = 0, len = lines.length; i < len; i++) {
        line = lines[i];
        matches = line.match(INSTALLATION_LINE_PATTERN);
        if (matches == null) {
          continue;
        }
        _match = matches[0], name = matches[1], version = matches[2], result = matches[3];
        results.push({
          "name": name,
          "version": version,
          "isInstalled": result === "\u2713"
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
      summary = successfulEntries.length <= atom.config.get(meta.name + ".maximumPackageDetail") ? this.generateEnumerationExpression(names) : successfulEntries.length + " packages";
      summary += successfulEntries.length === 1 ? " has" : " have";
      summary += " been updated";
      if (isAutoUpdate) {
        summary += " automatically";
      }
      summary += ".";
      return summary;
    },
    generateEnumerationExpression: function(items) {
      var expression, i, index, item, len;
      expression = "";
      for (index = i = 0, len = items.length; i < len; index = ++i) {
        item = items[index];
        if (index > 0) {
          if (index + 1 < items.length) {
            expression += ", ";
          } else {
            expression += " and ";
          }
        }
        expression += item;
      }
      return expression;
    },
    notify: function(notification) {
      var notifyOptions;
      if (atom.config.get(meta.name + ".updateNotification")) {
        require("./ga").sendEvent("package-updater", "Show Notification");
        if (Util.getConfig("debugMode")) {
          console.log("Show Notification");
        }
        notifyOptions = {
          detail: notification.message,
          dismissable: !atom.config.get(meta.name + ".dismissNotification"),
          buttons: [
            {
              text: "Restart",
              className: "icon icon-sync",
              onDidClick: function() {
                require("./ga").sendEvent("package-updater", "Restart Application");
                if (Util.getConfig("debugMode")) {
                  console.log("Restart Application");
                }
                return atom.restartApplication();
              }
            }
          ]
        };
        return Util.notification("**" + meta.name + "**", notifyOptions);
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2F1dG8tdXBkYXRlLXBsdXMvbGliL3BhY2thZ2UtdXBkYXRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDhFQUFBO0lBQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxpQkFBUjs7RUFDUCxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBQ04sa0JBQW1CLE9BQUEsQ0FBUSxNQUFSOztFQUVwQixzQkFBQSxHQUF5Qjs7RUFDekIseUJBQUEsR0FBNEI7O0VBRTVCLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxjQUFBLEVBQWdCLFNBQUMsWUFBRDs7UUFBQyxlQUFlOzthQUM5QixJQUFDLENBQUEsYUFBRCxDQUFlLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxHQUFEO0FBQ2IsY0FBQTtVQUFBLE9BQUEsR0FBVSxLQUFDLENBQUEsUUFBRCxDQUFVLEdBQVY7VUFDVixPQUFBLEdBQVUsS0FBQyxDQUFBLGVBQUQsQ0FBaUIsT0FBakIsRUFBMEIsWUFBMUI7VUFFVixhQUFBLEdBQW1CLFlBQUEsS0FBZ0IsSUFBbkIsR0FBNkIsZUFBN0IsR0FBa0Q7VUFDbEUsY0FBQSxHQUFtQixPQUFPLENBQUMsTUFBUixLQUFrQixDQUFyQixHQUE0QixTQUE1QixHQUEyQztVQUUzRCxJQUFHLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLENBQXBCO1lBQ0UsT0FBQSxDQUFRLE1BQVIsQ0FBZSxDQUFDLFNBQWhCLENBQTBCLGlCQUExQixFQUFnRCxhQUFELEdBQWUsR0FBZixHQUFrQixPQUFPLENBQUMsTUFBMUIsR0FBaUMsR0FBakMsR0FBb0MsY0FBcEMsR0FBbUQsVUFBbkQsR0FBNkQsSUFBSSxDQUFDLFVBQWxFLEdBQTZFLEdBQTdFLEdBQStFLENBQUMsSUFBSSxDQUFDLGlCQUFMLENBQUEsQ0FBRCxDQUEvRSxHQUF5RyxHQUF4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bCA9IHJlcXVpcmUgXCIuL3V0aWxcIlxue0J1ZmZlcmVkUHJvY2Vzc30gPSByZXF1aXJlIFwiYXRvbVwiXG5cbkFUT01fQlVORExFX0lERU5USUZJRVIgPSBcImNvbS5naXRodWIuYXRvbVwiXG5JTlNUQUxMQVRJT05fTElORV9QQVRURVJOID0gL15JbnN0YWxsaW5nICsoW15AXSspQChcXFMrKS4rXFxzKyhcXFMrKSQvXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgdXBkYXRlUGFja2FnZXM6IChpc0F1dG9VcGRhdGUgPSB0cnVlKSAtPlxuICAgIEBydW5BcG1VcGdyYWRlIChsb2cpID0+XG4gICAgICBlbnRyaWVzID0gQHBhcnNlTG9nKGxvZylcbiAgICAgIHN1bW1hcnkgPSBAZ2VuZXJhdGVTdW1tYXJ5KGVudHJpZXMsIGlzQXV0b1VwZGF0ZSlcblxuICAgICAgdXBkYXRlV29yZGluZyA9IGlmIGlzQXV0b1VwZGF0ZSBpcyB0cnVlIHRoZW4gXCJBdXRvLXVwZGF0aW5nXCIgZWxzZSBcIlVwZGF0aW5nXCJcbiAgICAgIHBhY2thZ2VXb3JkaW5nID1pZiBlbnRyaWVzLmxlbmd0aCBpcyAxIHRoZW4gXCJwYWNrYWdlXCIgZWxzZSBcInBhY2thZ2VzXCJcblxuICAgICAgaWYgZW50cmllcy5sZW5ndGggPiAwXG4gICAgICAgIHJlcXVpcmUoXCIuL2dhXCIpLnNlbmRFdmVudCBcInBhY2thZ2UtdXBkYXRlclwiLCBcIiN7dXBkYXRlV29yZGluZ30gI3tlbnRyaWVzLmxlbmd0aH0gI3twYWNrYWdlV29yZGluZ30gKEF0b20gdiN7YXRvbS5hcHBWZXJzaW9ufSAje2F0b20uZ2V0UmVsZWFzZUNoYW5uZWwoKX0pXCJcbiAgICAgICAgY29uc29sZS5sb2coXCIje3VwZGF0ZVdvcmRpbmd9ICN7ZW50cmllcy5sZW5ndGh9ICN7cGFja2FnZVdvcmRpbmd9XCIpIGlmIFV0aWwuZ2V0Q29uZmlnKFwiZGVidWdNb2RlXCIpXG5cbiAgICAgIHJldHVybiB1bmxlc3Mgc3VtbWFyeVxuICAgICAgQG5vdGlmeVxuICAgICAgICB0aXRsZTogXCJBdG9tIFBhY2thZ2UgVXBkYXRlc1wiXG4gICAgICAgIG1lc3NhZ2U6IHN1bW1hcnlcbiAgICAgICAgc2VuZGVyOiBBVE9NX0JVTkRMRV9JREVOVElGSUVSXG4gICAgICAgIGFjdGl2YXRlOiBBVE9NX0JVTkRMRV9JREVOVElGSUVSXG5cbiAgcnVuQXBtVXBncmFkZTogKGNhbGxiYWNrKSAtPlxuICAgIGNvbW1hbmQgPSBhdG9tLnBhY2thZ2VzLmdldEFwbVBhdGgoKVxuXG4gICAgYXZhaWxhYmxlUGFja2FnZXMgPSBhdG9tLnBhY2thZ2VzLmdldEF2YWlsYWJsZVBhY2thZ2VOYW1lcygpXG4gICAgaW5jbHVkZWRQYWNrYWdlcyA9IGF0b20uY29uZmlnLmdldChcIiN7bWV0YS5uYW1lfS5pbmNsdWRlZFBhY2thZ2VzXCIpXG4gICAgZXhjbHVkZWRQYWNrYWdlcyA9IGF0b20uY29uZmlnLmdldChcIiN7bWV0YS5uYW1lfS5leGNsdWRlZFBhY2thZ2VzXCIpXG5cbiAgICBhcmdzID0gW1widXBncmFkZVwiXVxuXG4gICAgaWYgaW5jbHVkZWRQYWNrYWdlcy5sZW5ndGggPiAwXG4gICAgICBjb25zb2xlLmxvZyBcIlBhY2thZ2VzIGluY2x1ZGVkIGluIHVwZGF0ZTpcIiBpZiBVdGlsLmdldENvbmZpZyhcImRlYnVnTW9kZVwiKVxuXG4gICAgICBmb3IgaW5jbHVkZWRQYWNrYWdlIGluIGluY2x1ZGVkUGFja2FnZXNcbiAgICAgICAgY29uc29sZS5sb2cgXCItICN7aW5jbHVkZWRQYWNrYWdlfVwiIGlmIFV0aWwuZ2V0Q29uZmlnKFwiZGVidWdNb2RlXCIpXG4gICAgICAgIGFyZ3MucHVzaCBpbmNsdWRlZFBhY2thZ2VcblxuICAgIGVsc2UgaWYgZXhjbHVkZWRQYWNrYWdlcy5sZW5ndGggPiAwXG4gICAgICBjb25zb2xlLmxvZyBcIlBhY2thZ2VzIGV4Y2x1ZGVkIGZyb20gdXBkYXRlOlwiIGlmIFV0aWwuZ2V0Q29uZmlnKFwiZGVidWdNb2RlXCIpXG5cbiAgICAgIGZvciBleGNsdWRlZFBhY2thZ2UgaW4gZXhjbHVkZWRQYWNrYWdlc1xuICAgICAgICBpZiBleGNsdWRlZFBhY2thZ2UgaW4gYXZhaWxhYmxlUGFja2FnZXNcbiAgICAgICAgICBjb25zb2xlLmxvZyBcIi0gI3tleGNsdWRlZFBhY2thZ2V9XCIgaWYgVXRpbC5nZXRDb25maWcoXCJkZWJ1Z01vZGVcIilcbiAgICAgICAgICBpbmRleCA9IGF2YWlsYWJsZVBhY2thZ2VzLmluZGV4T2YgZXhjbHVkZWRQYWNrYWdlXG4gICAgICAgICAgYXZhaWxhYmxlUGFja2FnZXMuc3BsaWNlIGluZGV4LCAxIGlmIGluZGV4XG5cbiAgICBlbHNlXG4gICAgICBmb3IgYXZhaWxhYmxlUGFja2FnZSBpbiBhdmFpbGFibGVQYWNrYWdlc1xuICAgICAgICBhcmdzLnB1c2ggYXZhaWxhYmxlUGFja2FnZVxuXG4gICAgYXJncy5wdXNoIFwiLS1uby1jb25maXJtXCJcbiAgICBhcmdzLnB1c2ggXCItLW5vLWNvbG9yXCJcblxuICAgIGxvZyA9IFwiXCJcblxuICAgIHN0ZG91dCA9IChkYXRhKSAtPlxuICAgICAgbG9nICs9IGRhdGFcblxuICAgIGV4aXQgPSAoZXhpdENvZGUpIC0+XG4gICAgICBjYWxsYmFjayhsb2cpXG5cbiAgICBuZXcgQnVmZmVyZWRQcm9jZXNzKHtjb21tYW5kLCBhcmdzLCBzdGRvdXQsIGV4aXR9KVxuXG4gICMgUGFyc2luZyB0aGUgb3V0cHV0IG9mIGFwbSBpcyBhIGRpcnR5IHdheSwgYnV0IHVzaW5nIGF0b20tcGFja2FnZS1tYW5hZ2VyIGRpcmVjdGx5IHZpYSBKYXZhU2NyaXB0XG4gICMgaXMgcHJvYmFibHkgbW9yZSBicml0dGxlIHRoYW4gcGFyc2luZyB0aGUgb3V0cHV0IHNpbmNlIGl0XCJzIGEgcHJpdmF0ZSBwYWNrYWdlLlxuICAjIC9BcHBsaWNhdGlvbnMvQXRvbS5hcHAvQ29udGVudHMvUmVzb3VyY2VzL2FwcC9hcG0vbm9kZV9tb2R1bGVzL2F0b20tcGFja2FnZS1tYW5hZ2VyXG4gIHBhcnNlTG9nOiAobG9nKSAtPlxuICAgIGxpbmVzID0gbG9nLnNwbGl0KFwiXFxuXCIpXG5cbiAgICBmb3IgbGluZSBpbiBsaW5lc1xuICAgICAgbWF0Y2hlcyA9IGxpbmUubWF0Y2goSU5TVEFMTEFUSU9OX0xJTkVfUEFUVEVSTilcbiAgICAgIGNvbnRpbnVlIHVubGVzcyBtYXRjaGVzP1xuICAgICAgW19tYXRjaCwgbmFtZSwgdmVyc2lvbiwgcmVzdWx0XSA9IG1hdGNoZXNcblxuICAgICAgXCJuYW1lXCI6IG5hbWVcbiAgICAgIFwidmVyc2lvblwiOiB2ZXJzaW9uXG4gICAgICBcImlzSW5zdGFsbGVkXCI6IHJlc3VsdCA9PSBcIlxcdTI3MTNcIlxuXG4gIGdlbmVyYXRlU3VtbWFyeTogKGVudHJpZXMsIGlzQXV0b1VwZGF0ZSA9IHRydWUpIC0+XG4gICAgc3VjY2Vzc2Z1bEVudHJpZXMgPSBlbnRyaWVzLmZpbHRlciAoZW50cnkpIC0+XG4gICAgICBlbnRyeS5pc0luc3RhbGxlZFxuICAgIHJldHVybiBudWxsIHVubGVzcyBzdWNjZXNzZnVsRW50cmllcy5sZW5ndGggPiAwXG5cbiAgICBuYW1lcyA9IHN1Y2Nlc3NmdWxFbnRyaWVzLm1hcCAoZW50cnkpIC0+XG4gICAgICBlbnRyeS5uYW1lXG5cbiAgICBzdW1tYXJ5ID1cbiAgICAgIGlmIHN1Y2Nlc3NmdWxFbnRyaWVzLmxlbmd0aCA8PSBhdG9tLmNvbmZpZy5nZXQoXCIje21ldGEubmFtZX0ubWF4aW11bVBhY2thZ2VEZXRhaWxcIilcbiAgICAgICAgQGdlbmVyYXRlRW51bWVyYXRpb25FeHByZXNzaW9uKG5hbWVzKVxuICAgICAgZWxzZVxuICAgICAgICBcIiN7c3VjY2Vzc2Z1bEVudHJpZXMubGVuZ3RofSBwYWNrYWdlc1wiXG5cbiAgICBzdW1tYXJ5ICs9IGlmIHN1Y2Nlc3NmdWxFbnRyaWVzLmxlbmd0aCA9PSAxIHRoZW4gXCIgaGFzXCIgZWxzZSBcIiBoYXZlXCJcbiAgICBzdW1tYXJ5ICs9IFwiIGJlZW4gdXBkYXRlZFwiXG4gICAgc3VtbWFyeSArPSBcIiBhdXRvbWF0aWNhbGx5XCIgaWYgaXNBdXRvVXBkYXRlXG4gICAgc3VtbWFyeSArPSBcIi5cIlxuICAgIHN1bW1hcnlcblxuICBnZW5lcmF0ZUVudW1lcmF0aW9uRXhwcmVzc2lvbjogKGl0ZW1zKSAtPlxuICAgIGV4cHJlc3Npb24gPSBcIlwiXG5cbiAgICBmb3IgaXRlbSwgaW5kZXggaW4gaXRlbXNcbiAgICAgIGlmIGluZGV4ID4gMFxuICAgICAgICBpZiBpbmRleCArIDEgPCBpdGVtcy5sZW5ndGhcbiAgICAgICAgICBleHByZXNzaW9uICs9IFwiLCBcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgZXhwcmVzc2lvbiArPSBcIiBhbmQgXCJcblxuICAgICAgZXhwcmVzc2lvbiArPSBpdGVtXG5cbiAgICBleHByZXNzaW9uXG5cbiAgbm90aWZ5OiAobm90aWZpY2F0aW9uKSAtPlxuICAgIGlmIGF0b20uY29uZmlnLmdldChcIiN7bWV0YS5uYW1lfS51cGRhdGVOb3RpZmljYXRpb25cIilcbiAgICAgIHJlcXVpcmUoXCIuL2dhXCIpLnNlbmRFdmVudCBcInBhY2thZ2UtdXBkYXRlclwiLCBcIlNob3cgTm90aWZpY2F0aW9uXCJcbiAgICAgIGNvbnNvbGUubG9nKFwiU2hvdyBOb3RpZmljYXRpb25cIikgaWYgVXRpbC5nZXRDb25maWcoXCJkZWJ1Z01vZGVcIilcblxuICAgICAgbm90aWZ5T3B0aW9ucyA9IHtcbiAgICAgICAgZGV0YWlsOiBub3RpZmljYXRpb24ubWVzc2FnZVxuICAgICAgICBkaXNtaXNzYWJsZTogIWF0b20uY29uZmlnLmdldChcIiN7bWV0YS5uYW1lfS5kaXNtaXNzTm90aWZpY2F0aW9uXCIpXG4gICAgICAgIGJ1dHRvbnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgIHRleHQ6IFwiUmVzdGFydFwiXG4gICAgICAgICAgICBjbGFzc05hbWU6IFwiaWNvbiBpY29uLXN5bmNcIlxuICAgICAgICAgICAgb25EaWRDbGljazogLT5cbiAgICAgICAgICAgICAgcmVxdWlyZShcIi4vZ2FcIikuc2VuZEV2ZW50IFwicGFja2FnZS11cGRhdGVyXCIsIFwiUmVzdGFydCBBcHBsaWNhdGlvblwiXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUmVzdGFydCBBcHBsaWNhdGlvblwiKSBpZiBVdGlsLmdldENvbmZpZyhcImRlYnVnTW9kZVwiKVxuXG4gICAgICAgICAgICAgIGF0b20ucmVzdGFydEFwcGxpY2F0aW9uKClcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH1cblxuICAgICAgVXRpbC5ub3RpZmljYXRpb24oXCIqKiN7bWV0YS5uYW1lfSoqXCIsIG5vdGlmeU9wdGlvbnMpXG4iXX0=
