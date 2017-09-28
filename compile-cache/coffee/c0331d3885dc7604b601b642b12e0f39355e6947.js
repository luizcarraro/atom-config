(function() {
  var Dependencies, meta;

  meta = require("../package.json");

  module.exports = Dependencies = {
    satisfy: function(installAtomPackages, installNodePackages) {
      var i, join, len, loadedPackage, loadedPackages, packageJson, packageMeta, results;
      join = require("path").join;
      loadedPackages = atom.packages.getLoadedPackages();
      results = [];
      for (i = 0, len = loadedPackages.length; i < len; i++) {
        loadedPackage = loadedPackages[i];
        if (atom.packages.isBundledPackage(loadedPackage.name)) {
          continue;
        }
        packageJson = join(loadedPackage.path, "package.json");
        try {
          packageMeta = require(packageJson);
        } catch (error1) {
          console.log("[" + loadedPackage.name + "] Missing package manifest, skipping...");
          continue;
        }
        if (installAtomPackages === true && packageMeta.hasOwnProperty("package-deps") === true) {
          Dependencies.installAtom(loadedPackage.name);
        }
        if (installNodePackages === true) {
          results.push(Dependencies.installNode(loadedPackage));
        } else {
          results.push(void 0);
        }
      }
      return results;
    },
    installAtom: function(packageName) {
      var install;
      install = require("atom-package-deps").install;
      if (atom.config.get(meta.name + ".verboseMode") === true) {
        console.time(packageName + ": Completed");
      }
      return install(packageName, atom.config.get(meta.name + ".showPrompt")).then(function() {
        if (atom.config.get(meta.name + ".verboseMode") === true) {
          console.log(packageName + ": Installing Atom package dependencies");
        }
        if (atom.config.get(meta.name + ".verboseMode") === true) {
          return console.timeEnd(packageName + ": Completed");
        }
      })["catch"](function(error) {
        if (error) {
          return console.error(error);
        }
      });
    },
    installNode: function(loadedPackage) {
      var args, cmd, defaultArgs, getPackageManager, options, platform, ref, spawnAsPromised;
      platform = require("os").platform;
      ref = require("./util"), getPackageManager = ref.getPackageManager, spawnAsPromised = ref.spawnAsPromised;
      cmd = getPackageManager();
      if (platform() === "win32") {
        defaultArgs = ["/c", cmd.bin, "install", "--production"];
        cmd.bin = "cmd.exe";
      } else {
        defaultArgs = ["install", "--production"];
      }
      args = defaultArgs.concat(cmd.args);
      options = {
        cwd: loadedPackage.path
      };
      return spawnAsPromised(cmd.bin, args, options).then(function(stdio) {
        console.info("Spawning " + cmd.name + " in '" + loadedPackage.name + "' directory");
        return console.log(stdio);
      })["catch"](function(error) {
        if (error) {
          return console.error(error);
        }
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL3NhdGlzZnktZGVwZW5kZW5jaWVzL2xpYi9kZXBlbmRlbmNpZXMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLGlCQUFSOztFQUVQLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFlBQUEsR0FDZjtJQUFBLE9BQUEsRUFBUyxTQUFDLG1CQUFELEVBQXNCLG1CQUF0QjtBQUNQLFVBQUE7TUFBRSxPQUFTLE9BQUEsQ0FBUSxNQUFSO01BRVgsY0FBQSxHQUFpQixJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFkLENBQUE7QUFFakI7V0FBQSxnREFBQTs7UUFDRSxJQUFZLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWQsQ0FBK0IsYUFBYSxDQUFDLElBQTdDLENBQVo7QUFBQSxtQkFBQTs7UUFFQSxXQUFBLEdBQWMsSUFBQSxDQUFLLGFBQWEsQ0FBQyxJQUFuQixFQUF5QixjQUF6QjtBQUVkO1VBQ0UsV0FBQSxHQUFjLE9BQUEsQ0FBUSxXQUFSLEVBRGhCO1NBQUEsY0FBQTtVQUdFLE9BQU8sQ0FBQyxHQUFSLENBQVksR0FBQSxHQUFJLGFBQWEsQ0FBQyxJQUFsQixHQUF1Qix5Q0FBbkM7QUFDQSxtQkFKRjs7UUFNQSxJQUFnRCxtQkFBQSxLQUF1QixJQUF2QixJQUFnQyxXQUFXLENBQUMsY0FBWixDQUEyQixjQUEzQixDQUFBLEtBQThDLElBQTlIO1VBQUEsWUFBWSxDQUFDLFdBQWIsQ0FBeUIsYUFBYSxDQUFDLElBQXZDLEVBQUE7O1FBQ0EsSUFBMkMsbUJBQUEsS0FBdUIsSUFBbEU7dUJBQUEsWUFBWSxDQUFDLFdBQWIsQ0FBeUIsYUFBekIsR0FBQTtTQUFBLE1BQUE7K0JBQUE7O0FBWkY7O0lBTE8sQ0FBVDtJQW1CQSxXQUFBLEVBQWEsU0FBQyxXQUFEO0FBQ1gsVUFBQTtNQUFFLFVBQVksT0FBQSxDQUFRLG1CQUFSO01BRWQsSUFBNEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQW1CLElBQUksQ0FBQyxJQUFOLEdBQVcsY0FBN0IsQ0FBQSxLQUErQyxJQUEzRjtRQUFBLE9BQU8sQ0FBQyxJQUFSLENBQWdCLFdBQUQsR0FBYSxhQUE1QixFQUFBOzthQUVBLE9BQUEsQ0FBUSxXQUFSLEVBQXFCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFtQixJQUFJLENBQUMsSUFBTixHQUFXLGFBQTdCLENBQXJCLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQTtRQUNKLElBQXNFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFtQixJQUFJLENBQUMsSUFBTixHQUFXLGNBQTdCLENBQUEsS0FBK0MsSUFBckg7VUFBQSxPQUFPLENBQUMsR0FBUixDQUFlLFdBQUQsR0FBYSx3Q0FBM0IsRUFBQTs7UUFDQSxJQUErQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBbUIsSUFBSSxDQUFDLElBQU4sR0FBVyxjQUE3QixDQUFBLEtBQStDLElBQTlGO2lCQUFBLE9BQU8sQ0FBQyxPQUFSLENBQW1CLFdBQUQsR0FBYSxhQUEvQixFQUFBOztNQUZJLENBRE4sQ0FJQSxFQUFDLEtBQUQsRUFKQSxDQUlPLFNBQUMsS0FBRDtRQUNMLElBQXVCLEtBQXZCO2lCQUFBLE9BQU8sQ0FBQyxLQUFSLENBQWMsS0FBZCxFQUFBOztNQURLLENBSlA7SUFMVyxDQW5CYjtJQStCQSxXQUFBLEVBQWEsU0FBQyxhQUFEO0FBQ1gsVUFBQTtNQUFFLFdBQWEsT0FBQSxDQUFRLElBQVI7TUFDZixNQUF5QyxPQUFBLENBQVEsUUFBUixDQUF6QyxFQUFFLHlDQUFGLEVBQXFCO01BRXJCLEdBQUEsR0FBTSxpQkFBQSxDQUFBO01BRU4sSUFBRyxRQUFBLENBQUEsQ0FBQSxLQUFjLE9BQWpCO1FBQ0UsV0FBQSxHQUFjLENBQ1osSUFEWSxFQUVaLEdBQUcsQ0FBQyxHQUZRLEVBR1osU0FIWSxFQUlaLGNBSlk7UUFNZCxHQUFHLENBQUMsR0FBSixHQUFVLFVBUFo7T0FBQSxNQUFBO1FBU0UsV0FBQSxHQUFjLENBQ1osU0FEWSxFQUVaLGNBRlksRUFUaEI7O01BY0EsSUFBQSxHQUFPLFdBQVcsQ0FBQyxNQUFaLENBQW1CLEdBQUcsQ0FBQyxJQUF2QjtNQUNQLE9BQUEsR0FBVTtRQUFDLEdBQUEsRUFBSyxhQUFhLENBQUMsSUFBcEI7O2FBRVYsZUFBQSxDQUFnQixHQUFHLENBQUMsR0FBcEIsRUFBeUIsSUFBekIsRUFBK0IsT0FBL0IsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLEtBQUQ7UUFDSixPQUFPLENBQUMsSUFBUixDQUFhLFdBQUEsR0FBWSxHQUFHLENBQUMsSUFBaEIsR0FBcUIsT0FBckIsR0FBNEIsYUFBYSxDQUFDLElBQTFDLEdBQStDLGFBQTVEO2VBQ0EsT0FBTyxDQUFDLEdBQVIsQ0FBWSxLQUFaO01BRkksQ0FETixDQUlBLEVBQUMsS0FBRCxFQUpBLENBSU8sU0FBQyxLQUFEO1FBQ0wsSUFBdUIsS0FBdkI7aUJBQUEsT0FBTyxDQUFDLEtBQVIsQ0FBYyxLQUFkLEVBQUE7O01BREssQ0FKUDtJQXZCVyxDQS9CYjs7QUFIRiIsInNvdXJjZXNDb250ZW50IjpbIm1ldGEgPSByZXF1aXJlIFwiLi4vcGFja2FnZS5qc29uXCJcblxubW9kdWxlLmV4cG9ydHMgPSBEZXBlbmRlbmNpZXMgPVxuICBzYXRpc2Z5OiAoaW5zdGFsbEF0b21QYWNrYWdlcywgaW5zdGFsbE5vZGVQYWNrYWdlcykgLT5cbiAgICB7IGpvaW4gfSA9IHJlcXVpcmUgXCJwYXRoXCJcblxuICAgIGxvYWRlZFBhY2thZ2VzID0gYXRvbS5wYWNrYWdlcy5nZXRMb2FkZWRQYWNrYWdlcygpXG5cbiAgICBmb3IgbG9hZGVkUGFja2FnZSBpbiBsb2FkZWRQYWNrYWdlc1xuICAgICAgY29udGludWUgaWYgYXRvbS5wYWNrYWdlcy5pc0J1bmRsZWRQYWNrYWdlIGxvYWRlZFBhY2thZ2UubmFtZVxuXG4gICAgICBwYWNrYWdlSnNvbiA9IGpvaW4gbG9hZGVkUGFja2FnZS5wYXRoLCBcInBhY2thZ2UuanNvblwiXG5cbiAgICAgIHRyeVxuICAgICAgICBwYWNrYWdlTWV0YSA9IHJlcXVpcmUgcGFja2FnZUpzb25cbiAgICAgIGNhdGNoXG4gICAgICAgIGNvbnNvbGUubG9nIFwiWyN7bG9hZGVkUGFja2FnZS5uYW1lfV0gTWlzc2luZyBwYWNrYWdlIG1hbmlmZXN0LCBza2lwcGluZy4uLlwiXG4gICAgICAgIGNvbnRpbnVlXG5cbiAgICAgIERlcGVuZGVuY2llcy5pbnN0YWxsQXRvbShsb2FkZWRQYWNrYWdlLm5hbWUpIGlmIGluc3RhbGxBdG9tUGFja2FnZXMgaXMgdHJ1ZSBhbmQgcGFja2FnZU1ldGEuaGFzT3duUHJvcGVydHkoXCJwYWNrYWdlLWRlcHNcIikgaXMgdHJ1ZVxuICAgICAgRGVwZW5kZW5jaWVzLmluc3RhbGxOb2RlKGxvYWRlZFBhY2thZ2UpIGlmIGluc3RhbGxOb2RlUGFja2FnZXMgaXMgdHJ1ZVxuXG4gIGluc3RhbGxBdG9tOiAocGFja2FnZU5hbWUpIC0+XG4gICAgeyBpbnN0YWxsIH0gPSByZXF1aXJlIFwiYXRvbS1wYWNrYWdlLWRlcHNcIlxuXG4gICAgY29uc29sZS50aW1lIFwiI3twYWNrYWdlTmFtZX06IENvbXBsZXRlZFwiIGlmIGF0b20uY29uZmlnLmdldChcIiN7bWV0YS5uYW1lfS52ZXJib3NlTW9kZVwiKSBpcyB0cnVlXG5cbiAgICBpbnN0YWxsKHBhY2thZ2VOYW1lLCBhdG9tLmNvbmZpZy5nZXQoXCIje21ldGEubmFtZX0uc2hvd1Byb21wdFwiKSlcbiAgICAudGhlbiAtPlxuICAgICAgY29uc29sZS5sb2cgXCIje3BhY2thZ2VOYW1lfTogSW5zdGFsbGluZyBBdG9tIHBhY2thZ2UgZGVwZW5kZW5jaWVzXCIgaWYgYXRvbS5jb25maWcuZ2V0KFwiI3ttZXRhLm5hbWV9LnZlcmJvc2VNb2RlXCIpIGlzIHRydWVcbiAgICAgIGNvbnNvbGUudGltZUVuZCBcIiN7cGFja2FnZU5hbWV9OiBDb21wbGV0ZWRcIiBpZiBhdG9tLmNvbmZpZy5nZXQoXCIje21ldGEubmFtZX0udmVyYm9zZU1vZGVcIikgaXMgdHJ1ZVxuICAgIC5jYXRjaCAoZXJyb3IpIC0+XG4gICAgICBjb25zb2xlLmVycm9yIGVycm9yIGlmIGVycm9yXG5cbiAgaW5zdGFsbE5vZGU6IChsb2FkZWRQYWNrYWdlKSAtPlxuICAgIHsgcGxhdGZvcm0gfSA9IHJlcXVpcmUgXCJvc1wiXG4gICAgeyBnZXRQYWNrYWdlTWFuYWdlciwgc3Bhd25Bc1Byb21pc2VkIH0gPSByZXF1aXJlIFwiLi91dGlsXCJcblxuICAgIGNtZCA9IGdldFBhY2thZ2VNYW5hZ2VyKClcblxuICAgIGlmIHBsYXRmb3JtKCkgaXMgXCJ3aW4zMlwiXG4gICAgICBkZWZhdWx0QXJncyA9IFtcbiAgICAgICAgXCIvY1wiXG4gICAgICAgIGNtZC5iaW5cbiAgICAgICAgXCJpbnN0YWxsXCJcbiAgICAgICAgXCItLXByb2R1Y3Rpb25cIlxuICAgICAgXVxuICAgICAgY21kLmJpbiA9IFwiY21kLmV4ZVwiXG4gICAgZWxzZVxuICAgICAgZGVmYXVsdEFyZ3MgPSBbXG4gICAgICAgIFwiaW5zdGFsbFwiXG4gICAgICAgIFwiLS1wcm9kdWN0aW9uXCJcbiAgICAgIF1cblxuICAgIGFyZ3MgPSBkZWZhdWx0QXJncy5jb25jYXQoY21kLmFyZ3MpXG4gICAgb3B0aW9ucyA9IHtjd2Q6IGxvYWRlZFBhY2thZ2UucGF0aH1cblxuICAgIHNwYXduQXNQcm9taXNlZChjbWQuYmluLCBhcmdzLCBvcHRpb25zKVxuICAgIC50aGVuIChzdGRpbykgLT5cbiAgICAgIGNvbnNvbGUuaW5mbyBcIlNwYXduaW5nICN7Y21kLm5hbWV9IGluICcje2xvYWRlZFBhY2thZ2UubmFtZX0nIGRpcmVjdG9yeVwiXG4gICAgICBjb25zb2xlLmxvZyBzdGRpb1xuICAgIC5jYXRjaCAoZXJyb3IpIC0+XG4gICAgICBjb25zb2xlLmVycm9yIGVycm9yIGlmIGVycm9yXG4iXX0=
