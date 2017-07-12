(function() {
  var CompositeDisposable, SatisfyDependencies, install, join, meta, platform, spawn;

  meta = require("../package.json");

  CompositeDisposable = require("atom").CompositeDisposable;

  install = require("atom-package-deps").install;

  join = require("path").join;

  platform = require("os").platform;

  spawn = require("child_process").spawn;

  module.exports = SatisfyDependencies = {
    config: {
      atomPackageDependencies: {
        title: "Atom Package Dependencies",
        description: "Satisfies `atom-package-deps` specified in a package manifest",
        type: "boolean",
        "default": true,
        order: 0
      },
      nodeDependencies: {
        title: "Node Dependencies",
        description: "*Experimental* &mdash; Satisfies `dependencies` specified in a package manifest",
        type: "boolean",
        "default": false,
        order: 1
      },
      showPrompt: {
        title: "Show Prompt",
        description: "Displays an prompt before installing packages",
        type: "boolean",
        "default": false,
        order: 2
      },
      verboseMode: {
        title: "Verbose Mode",
        description: "Output progress to the console",
        type: "boolean",
        "default": false,
        order: 3
      }
    },
    subscriptions: null,
    activate: function() {
      this.subscriptions = new CompositeDisposable;
      return this.subscriptions.add(atom.commands.add("atom-workspace", {
        "satisfy-dependencies:all": (function(_this) {
          return function() {
            return _this.satisfyDependencies();
          };
        })(this)
      }));
    },
    deactivate: function() {
      var ref;
      if ((ref = this.subscriptions) != null) {
        ref.dispose();
      }
      return this.subscriptions = null;
    },
    satisfyDependencies: function() {
      var atomPackageDependencies, i, len, loadedPackage, loadedPackages, nodeDependencies, packageJson, packageMeta, results;
      loadedPackages = atom.packages.getLoadedPackages();
      atomPackageDependencies = atom.config.get(meta.name + ".atomPackageDependencies");
      nodeDependencies = atom.config.get(meta.name + ".nodeDependencies");
      results = [];
      for (i = 0, len = loadedPackages.length; i < len; i++) {
        loadedPackage = loadedPackages[i];
        if (atom.packages.isBundledPackage(loadedPackage.name)) {
          continue;
        }
        packageJson = join(loadedPackage.path, "package.json");
        try {
          packageMeta = require(packageJson);
        } catch (error) {
          continue;
        }
        if (nodeDependencies) {
          this.installNodeDependencies(loadedPackage);
        }
        if (atomPackageDependencies && packageMeta.hasOwnProperty("package-deps") === true) {
          results.push(this.installAtomDependencies(loadedPackage.name));
        } else {
          results.push(void 0);
        }
      }
      return results;
    },
    installAtomDependencies: function(packageName) {
      var showPrompt;
      if (atom.config.get(meta.name + ".verboseMode") === true) {
        console.time("[" + packageName + "] install()");
      }
      showPrompt = atom.config.get(meta.name + ".showPrompt");
      return install(packageName, showPrompt).then(function() {
        if (atom.config.get(meta.name + ".verboseMode") === true) {
          return console.timeEnd("[" + packageName + "] install()");
        }
      });
    },
    installNodeDependencies: function(loadedPackage) {
      var command, options, stdout, yarn;
      command = this.getYarnPath();
      options = {
        cwd: loadedPackage.path
      };
      stdout = "";
      if (platform() === "win32") {
        yarn = spawn("cmd.exe", ["/c", command, "install", "--production", "--pure-lockfile"], options);
      } else {
        yarn = spawn(command, ["install", "--production", "--pure-lockfile"], options);
      }
      yarn.stdout.on('data', function(data) {
        if (atom.config.get(meta.name + ".verboseMode") === true) {
          return stdout += (data.toString()) + "\n";
        }
      });
      return yarn.on('close', function(errorCode) {
        var underline;
        if (stdout.length > 0) {
          underline = "=".repeat(loadedPackage.name.length);
          if (atom.config.get(meta.name + ".verboseMode") === true) {
            return console.log(loadedPackage.name + "\n" + underline + "\n" + stdout);
          }
        }
      });
    },
    getYarnPath: function() {
      if (platform() === "win32") {
        return join(__dirname, "..", "node_modules", ".bin", "yarn.cmd");
      } else {
        return join(__dirname, "..", "node_modules", ".bin", "yarn");
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL3NhdGlzZnktZGVwZW5kZW5jaWVzL2xpYi9zYXRpc2Z5LWRlcGVuZGVuY2llcy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsaUJBQVI7O0VBR04sc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN2QixVQUFXLE9BQUEsQ0FBUSxtQkFBUjs7RUFDWCxPQUFRLE9BQUEsQ0FBUSxNQUFSOztFQUNSLFdBQVksT0FBQSxDQUFRLElBQVI7O0VBQ1osUUFBUyxPQUFBLENBQVEsZUFBUjs7RUFFVixNQUFNLENBQUMsT0FBUCxHQUFpQixtQkFBQSxHQUNmO0lBQUEsTUFBQSxFQUNFO01BQUEsdUJBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTywyQkFBUDtRQUNBLFdBQUEsRUFBYSwrREFEYjtRQUVBLElBQUEsRUFBTSxTQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUhUO1FBSUEsS0FBQSxFQUFPLENBSlA7T0FERjtNQU1BLGdCQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sbUJBQVA7UUFDQSxXQUFBLEVBQWEsaUZBRGI7UUFFQSxJQUFBLEVBQU0sU0FGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtRQUlBLEtBQUEsRUFBTyxDQUpQO09BUEY7TUFZQSxVQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sYUFBUDtRQUNBLFdBQUEsRUFBYSwrQ0FEYjtRQUVBLElBQUEsRUFBTSxTQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhUO1FBSUEsS0FBQSxFQUFPLENBSlA7T0FiRjtNQWtCQSxXQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sY0FBUDtRQUNBLFdBQUEsRUFBYSxnQ0FEYjtRQUVBLElBQUEsRUFBTSxTQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhU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QUFzQyxNQUF0QyxFQUE4QyxNQUE5QyxFQUhGOztJQURXLENBakZiOztBQVZGIiwic291cmNlc0NvbnRlbnQiOlsibWV0YSA9IHJlcXVpcmUgXCIuLi9wYWNrYWdlLmpzb25cIlxuXG4jIERlcGVuZGVuY2llc1xue0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSBcImF0b21cIlxue2luc3RhbGx9ID0gcmVxdWlyZSBcImF0b20tcGFja2FnZS1kZXBzXCJcbntqb2lufSA9IHJlcXVpcmUgXCJwYXRoXCJcbntwbGF0Zm9ybX0gPSByZXF1aXJlIFwib3NcIlxue3NwYXdufSA9IHJlcXVpcmUgXCJjaGlsZF9wcm9jZXNzXCJcblxubW9kdWxlLmV4cG9ydHMgPSBTYXRpc2Z5RGVwZW5kZW5jaWVzID1cbiAgY29uZmlnOlxuICAgIGF0b21QYWNrYWdlRGVwZW5kZW5jaWVzOlxuICAgICAgdGl0bGU6IFwiQXRvbSBQYWNrYWdlIERlcGVuZGVuY2llc1wiXG4gICAgICBkZXNjcmlwdGlvbjogXCJTYXRpc2ZpZXMgYGF0b20tcGFja2FnZS1kZXBzYCBzcGVjaWZpZWQgaW4gYSBwYWNrYWdlIG1hbmlmZXN0XCJcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBvcmRlcjogMFxuICAgIG5vZGVEZXBlbmRlbmNpZXM6XG4gICAgICB0aXRsZTogXCJOb2RlIERlcGVuZGVuY2llc1wiXG4gICAgICBkZXNjcmlwdGlvbjogXCIqRXhwZXJpbWVudGFsKiAmbWRhc2g7IFNhdGlzZmllcyBgZGVwZW5kZW5jaWVzYCBzcGVjaWZpZWQgaW4gYSBwYWNrYWdlIG1hbmlmZXN0XCJcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgb3JkZXI6IDFcbiAgICBzaG93UHJvbXB0OlxuICAgICAgdGl0bGU6IFwiU2hvdyBQcm9tcHRcIlxuICAgICAgZGVzY3JpcHRpb246IFwiRGlzcGxheXMgYW4gcHJvbXB0IGJlZm9yZSBpbnN0YWxsaW5nIHBhY2thZ2VzXCJcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgb3JkZXI6IDJcbiAgICB2ZXJib3NlTW9kZTpcbiAgICAgIHRpdGxlOiBcIlZlcmJvc2UgTW9kZVwiXG4gICAgICBkZXNjcmlwdGlvbjogXCJPdXRwdXQgcHJvZ3Jlc3MgdG8gdGhlIGNvbnNvbGVcIlxuICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBvcmRlcjogM1xuICBzdWJzY3JpcHRpb25zOiBudWxsXG5cbiAgYWN0aXZhdGU6IC0+XG4gICAgIyBFdmVudHMgc3Vic2NyaWJlZCB0byBpbiBhdG9tXCJzIHN5c3RlbSBjYW4gYmUgZWFzaWx5IGNsZWFuZWQgdXAgd2l0aCBhIENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICAjIFJlZ2lzdGVyIGNvbW1hbmQgdGhhdCB0b2dnbGVzIHRoaXMgdmlld1xuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCBcImF0b20td29ya3NwYWNlXCIsIFwic2F0aXNmeS1kZXBlbmRlbmNpZXM6YWxsXCI6ID0+IEBzYXRpc2Z5RGVwZW5kZW5jaWVzKClcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zPy5kaXNwb3NlKClcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG51bGxcblxuICBzYXRpc2Z5RGVwZW5kZW5jaWVzOiAtPlxuICAgIGxvYWRlZFBhY2thZ2VzID0gYXRvbS5wYWNrYWdlcy5nZXRMb2FkZWRQYWNrYWdlcygpXG5cbiAgICBhdG9tUGFja2FnZURlcGVuZGVuY2llcyA9IGF0b20uY29uZmlnLmdldChcIiN7bWV0YS5uYW1lfS5hdG9tUGFja2FnZURlcGVuZGVuY2llc1wiKVxuICAgIG5vZGVEZXBlbmRlbmNpZXMgPSBhdG9tLmNvbmZpZy5nZXQoXCIje21ldGEubmFtZX0ubm9kZURlcGVuZGVuY2llc1wiKVxuXG4gICAgZm9yIGxvYWRlZFBhY2thZ2UgaW4gbG9hZGVkUGFja2FnZXNcbiAgICAgIGNvbnRpbnVlIGlmIGF0b20ucGFja2FnZXMuaXNCdW5kbGVkUGFja2FnZSBsb2FkZWRQYWNrYWdlLm5hbWVcblxuICAgICAgcGFja2FnZUpzb24gPSBqb2luIGxvYWRlZFBhY2thZ2UucGF0aCwgXCJwYWNrYWdlLmpzb25cIlxuXG4gICAgICB0cnlcbiAgICAgICAgcGFja2FnZU1ldGEgPSByZXF1aXJlIHBhY2thZ2VKc29uXG4gICAgICBjYXRjaFxuICAgICAgICBjb250aW51ZVxuXG4gICAgICBAaW5zdGFsbE5vZGVEZXBlbmRlbmNpZXMobG9hZGVkUGFja2FnZSkgaWYgbm9kZURlcGVuZGVuY2llc1xuICAgICAgQGluc3RhbGxBdG9tRGVwZW5kZW5jaWVzKGxvYWRlZFBhY2thZ2UubmFtZSkgaWYgYXRvbVBhY2thZ2VEZXBlbmRlbmNpZXMgYW5kIHBhY2thZ2VNZXRhLmhhc093blByb3BlcnR5KFwicGFja2FnZS1kZXBzXCIpIGlzIHRydWVcblxuICBpbnN0YWxsQXRvbURlcGVuZGVuY2llczogKHBhY2thZ2VOYW1lKSAtPlxuICAgIGNvbnNvbGUudGltZSBcIlsje3BhY2thZ2VOYW1lfV0gaW5zdGFsbCgpXCIgaWYgYXRvbS5jb25maWcuZ2V0KFwiI3ttZXRhLm5hbWV9LnZlcmJvc2VNb2RlXCIpIGlzIHRydWVcbiAgICBzaG93UHJvbXB0ID0gYXRvbS5jb25maWcuZ2V0KFwiI3ttZXRhLm5hbWV9LnNob3dQcm9tcHRcIilcbiAgICBpbnN0YWxsKHBhY2thZ2VOYW1lLCBzaG93UHJvbXB0KS50aGVuIC0+XG4gICAgICBjb25zb2xlLnRpbWVFbmQgXCJbI3twYWNrYWdlTmFtZX1dIGluc3RhbGwoKVwiIGlmIGF0b20uY29uZmlnLmdldChcIiN7bWV0YS5uYW1lfS52ZXJib3NlTW9kZVwiKSBpcyB0cnVlXG5cbiAgaW5zdGFsbE5vZGVEZXBlbmRlbmNpZXM6IChsb2FkZWRQYWNrYWdlKSAtPlxuICAgIGNvbW1hbmQgPSBAZ2V0WWFyblBhdGgoKVxuICAgIG9wdGlvbnMgPSB7Y3dkOiBsb2FkZWRQYWNrYWdlLnBhdGh9XG4gICAgc3Rkb3V0ID0gXCJcIlxuXG4gICAgaWYgcGxhdGZvcm0oKSBpcyBcIndpbjMyXCJcbiAgICAgIHlhcm4gPSBzcGF3biBcImNtZC5leGVcIiwgW1wiL2NcIiwgY29tbWFuZCwgXCJpbnN0YWxsXCIsIFwiLS1wcm9kdWN0aW9uXCIsIFwiLS1wdXJlLWxvY2tmaWxlXCJdLCBvcHRpb25zXG4gICAgZWxzZVxuICAgICAgeWFybiA9IHNwYXduKCBjb21tYW5kLCBbXCJpbnN0YWxsXCIsIFwiLS1wcm9kdWN0aW9uXCIsIFwiLS1wdXJlLWxvY2tmaWxlXCJdLCBvcHRpb25zKVxuXG4gICAgeWFybi5zdGRvdXQub24gJ2RhdGEnLCAoZGF0YSkgLT5cbiAgICAgIHN0ZG91dCArPSBcIiN7ZGF0YS50b1N0cmluZygpfVxcblwiIGlmIGF0b20uY29uZmlnLmdldChcIiN7bWV0YS5uYW1lfS52ZXJib3NlTW9kZVwiKSBpcyB0cnVlXG5cbiAgICB5YXJuLm9uICdjbG9zZScsICggZXJyb3JDb2RlICkgLT5cbiAgICAgIGlmIHN0ZG91dC5sZW5ndGggPiAwXG4gICAgICAgIHVuZGVybGluZSA9IFwiPVwiLnJlcGVhdCBsb2FkZWRQYWNrYWdlLm5hbWUubGVuZ3RoXG4gICAgICAgIGNvbnNvbGUubG9nIFwiI3tsb2FkZWRQYWNrYWdlLm5hbWV9XFxuI3t1bmRlcmxpbmV9XFxuI3tzdGRvdXR9XCIgaWYgYXRvbS5jb25maWcuZ2V0KFwiI3ttZXRhLm5hbWV9LnZlcmJvc2VNb2RlXCIpIGlzIHRydWVcblxuICBnZXRZYXJuUGF0aDogLT5cbiAgICBpZiBwbGF0Zm9ybSgpIGlzIFwid2luMzJcIlxuICAgICAgam9pbiBfX2Rpcm5hbWUsIFwiLi5cIiwgXCJub2RlX21vZHVsZXNcIiwgXCIuYmluXCIsIFwieWFybi5jbWRcIlxuICAgIGVsc2VcbiAgICAgIGpvaW4gX19kaXJuYW1lLCBcIi4uXCIsIFwibm9kZV9tb2R1bGVzXCIsIFwiLmJpblwiLCBcInlhcm5cIlxuIl19
