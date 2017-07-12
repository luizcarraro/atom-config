(function() {
  var BrowsePackages, CompositeDisposable, name;

  name = require("../package.json").name;

  CompositeDisposable = require("atom").CompositeDisposable;

  module.exports = BrowsePackages = {
    config: {
      fileManager: {
        title: "File manager",
        description: "Specify the full path to a custom file manager",
        type: "string",
        "default": ""
      },
      notify: {
        title: "Verbose Mode",
        description: "Show info notifications for all actions",
        type: "boolean",
        "default": false
      }
    },
    subscriptions: null,
    activate: function() {
      var obj, obj1, obj2, obj3, obj4, obj5;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add("atom-workspace", (
        obj = {},
        obj[name + ":configuration-folder"] = (function(_this) {
          return function() {
            return _this.browseConfig();
          };
        })(this),
        obj
      )));
      this.subscriptions.add(atom.commands.add("atom-workspace", (
        obj1 = {},
        obj1[name + ":packages-folder"] = (function(_this) {
          return function() {
            return _this.browsePackages();
          };
        })(this),
        obj1
      )));
      this.subscriptions.add(atom.commands.add("atom-workspace", (
        obj2 = {},
        obj2[name + ":project-folders"] = (function(_this) {
          return function() {
            return _this.browseProjects();
          };
        })(this),
        obj2
      )));
      this.subscriptions.add(atom.commands.add("atom-workspace", (
        obj3 = {},
        obj3[name + ":reveal-file"] = (function(_this) {
          return function() {
            return _this.revealFile();
          };
        })(this),
        obj3
      )));
      this.subscriptions.add(atom.commands.add("atom-workspace", (
        obj4 = {},
        obj4[name + ":reveal-all-open-files"] = (function(_this) {
          return function() {
            return _this.revealFiles();
          };
        })(this),
        obj4
      )));
      return this.subscriptions.add(atom.commands.add("atom-workspace", (
        obj5 = {},
        obj5[name + ":application-folder"] = (function(_this) {
          return function() {
            return _this.appFolder();
          };
        })(this),
        obj5
      )));
    },
    deactivate: function() {
      var ref;
      if ((ref = this.subscriptions) != null) {
        ref.dispose();
      }
      return this.subscriptions = null;
    },
    appFolder: function() {
      var appFolder, dirname, join, platform, processBin, processPath, ref, resolve;
      platform = require("os").platform;
      ref = require("path"), dirname = ref.dirname, join = ref.join, resolve = ref.resolve;
      processBin = resolve(process.execPath);
      processPath = dirname(processBin);
      switch (platform()) {
        case "darwin":
          appFolder = join(processPath, "..", "..", "..", "..");
          break;
        default:
          appFolder = processPath;
      }
      return this.openFolder(appFolder);
    },
    browsePackages: function() {
      var F_OK, accessSync, error, i, len, packageDir, packageDirs, ref, results;
      ref = require("fs"), accessSync = ref.accessSync, F_OK = ref.F_OK;
      packageDirs = atom.packages.getPackageDirPaths();
      results = [];
      for (i = 0, len = packageDirs.length; i < len; i++) {
        packageDir = packageDirs[i];
        try {
          accessSync(packageDir, F_OK);
        } catch (error1) {
          error = error1;
          atom.notifications.addError(name, {
            detail: error,
            dismissable: true
          });
        }
        results.push(this.openFolder(packageDir));
      }
      return results;
    },
    revealFile: function() {
      var editor, file, ref;
      editor = atom.workspace.getActivePaneItem();
      if ((editor != null ? editor.constructor.name : void 0) === "TextEditor" || (editor != null ? editor.constructor.name : void 0) === "ImageEditor") {
        file = (editor != null ? (ref = editor.buffer) != null ? ref.file : void 0 : void 0) ? editor.buffer.file : (editor != null ? editor.file : void 0) ? editor.file : void 0;
        if (file != null ? file.path : void 0) {
          this.selectFile(file.path);
          return;
        }
      }
      return atom.notifications.addWarning("**" + name + "**: No active file", {
        dismissable: false
      });
    },
    revealFiles: function() {
      var count, editor, editors, file, i, len, ref;
      editors = atom.workspace.getPaneItems();
      if (editors.length > 0) {
        count = 0;
        for (i = 0, len = editors.length; i < len; i++) {
          editor = editors[i];
          if (!(editor.constructor.name === "TextEditor" || editor.constructor.name === "ImageEditor")) {
            continue;
          }
          file = (editor != null ? (ref = editor.buffer) != null ? ref.file : void 0 : void 0) ? editor.buffer.file : (editor != null ? editor.file : void 0) ? editor.file : void 0;
          if (file != null ? file.path : void 0) {
            this.selectFile(file.path);
            count++;
          }
        }
        if (count > 0) {
          return;
        }
      }
      return atom.notifications.addWarning("**" + name + "**: No open files", {
        dismissable: false
      });
    },
    browseProjects: function() {
      var F_OK, accessSync, i, len, project, projects, ref, results;
      ref = require("fs"), accessSync = ref.accessSync, F_OK = ref.F_OK;
      projects = atom.project.getPaths();
      if (!(projects.length > 0)) {
        return atom.notifications.addWarning("**" + name + "**: No active project", {
          dismissable: false
        });
      }
      results = [];
      for (i = 0, len = projects.length; i < len; i++) {
        project = projects[i];
        if (project.startsWith('atom://')) {
          continue;
        }
        try {
          accessSync(project, F_OK);
        } catch (error1) {
          atom.notifications.addError(name, {
            detail: error,
            dismissable: true
          });
          continue;
        }
        results.push(this.openFolder(project));
      }
      return results;
    },
    browseConfig: function() {
      var F_OK, accessSync, configFile, configPath, dirname, error, ref;
      ref = require("fs"), accessSync = ref.accessSync, F_OK = ref.F_OK;
      dirname = require("path").dirname;
      configFile = atom.config.getUserConfigPath();
      configPath = dirname(configFile);
      if (configPath) {
        try {
          accessSync(configPath, F_OK);
        } catch (error1) {
          error = error1;
          atom.notifications.addError(name, {
            detail: error,
            dismissable: true
          });
          return;
        }
        return this.openFolder(configPath);
      }
    },
    selectFile: function(path) {
      var basename, fileManager, showItemInFolder;
      basename = require("path").basename;
      fileManager = atom.config.get(name + ".fileManager");
      if (fileManager) {
        return this.spawnCmd(fileManager, [path], basename(path), "file manager");
      }
      switch (process.platform) {
        case "darwin":
          return this.spawnCmd("open", ["-R", path], basename(path), "Finder");
        case "win32":
          return this.spawnCmd("explorer", ["/select," + path], basename(path), "Explorer");
        case "linux":
          showItemInFolder = require("shell").showItemInFolder;
          showItemInFolder(path);
          return atom.notifications.addInfo("**" + name + "**: Opened `" + (basename(path)) + "` in file manager", {
            dismissable: false
          });
      }
    },
    openFolder: function(path) {
      var basename, fileManager, openItem;
      basename = require("path").basename;
      fileManager = atom.config.get(name + ".fileManager");
      if (fileManager) {
        return this.spawnCmd(fileManager, [path], basename(path), "file manager");
      }
      switch (process.platform) {
        case "darwin":
          return this.spawnCmd("open", [path], basename(path), "Finder");
        case "win32":
          return this.spawnCmd("explorer", [path], basename(path), "Explorer");
        case "linux":
          openItem = require("shell").openItem;
          openItem(path);
          return atom.notifications.addInfo("**" + name + "**: Opened `" + (basename(path)) + "` in file manager", {
            dismissable: false
          });
      }
    },
    spawnCmd: function(cmd, args, baseName, fileManager) {
      var open, spawn;
      spawn = require("child_process").spawn;
      open = spawn(cmd, args);
      open.stderr.on("data", function(error) {
        return atom.notifications.addError("**" + name + "**: " + error, {
          dismissable: true
        });
      });
      return open.on("close", function(errorCode) {
        if (errorCode === 0 && atom.config.get(name + ".notify")) {
          return atom.notifications.addInfo("**" + name + "**: Opened `" + baseName + "` in " + fileManager, {
            dismissable: false
          });
        }
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2Jyb3dzZS9saWIvYnJvd3NlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUUsT0FBUyxPQUFBLENBQVEsaUJBQVI7O0VBQ1Qsc0JBQXdCLE9BQUEsQ0FBUSxNQUFSOztFQUUxQixNQUFNLENBQUMsT0FBUCxHQUFpQixjQUFBLEdBQ2Y7SUFBQSxNQUFBLEVBQ0U7TUFBQSxXQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sY0FBUDtRQUNBLFdBQUEsRUFBYSxnREFEYjtRQUVBLElBQUEsRUFBTSxRQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQUhUO09BREY7TUFLQSxNQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sY0FBUDtRQUNBLFdBQUEsRUFBYSx5Q0FEYjtRQUVBLElBQUEsRUFBTSxTQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhUO09BTkY7S0FERjtJQVdBLGFBQUEsRUFBZSxJQVhmO0lBYUEsUUFBQSxFQUFVLFNBQUE7QUFFUixVQUFBO01BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTtNQUdyQixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQztjQUFBLEVBQUE7WUFBRyxJQUFELEdBQU0sMkJBQXdCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLFlBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoQzs7T0FBcEMsQ0FBbkI7TUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQztlQUFBLEVBQUE7YUFBRyxJQUFELEdBQU0sc0JBQW1CLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLGNBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzQjs7T0FBcEMsQ0FBbkI7TUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQztlQUFBLEVBQUE7YUFBRyxJQUFELEdBQU0sc0JBQW1CLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLGNBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzQjs7T0FBcEMsQ0FBbkI7TUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQztlQUFBLEVBQUE7YUFBRyxJQUFELEdBQU0sa0JBQWUsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsVUFBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZCOztPQUFwQyxDQUFuQjtNQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DO2VBQUEsRUFBQTthQUFHLElBQUQsR0FBTSw0QkFBeUIsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsV0FBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpDOztPQUFwQyxDQUFuQjthQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DO2VBQUEsRUFBQTthQUFHLElBQUQsR0FBTSx5QkFBc0IsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsU0FBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlCOztPQUFwQyxDQUFuQjtJQVZRLENBYlY7SUF5QkEsVUFBQSxFQUFZLFNBQUE7QUFDVixVQUFBOztXQUFjLENBQUUsT0FBaEIsQ0FBQTs7YUFDQSxJQUFDLENBQUEsYUFBRCxHQUFpQjtJQUZQLENBekJaO0lBNkJBLFNBQUEsRUFBVyxTQUFBO0FBQ1QsVUFBQTtNQUFFLFdBQWEsT0FBQSxDQUFRLElBQVI7TUFDZixNQUE2QixPQUFBLENBQVEsTUFBUixDQUE3QixFQUFFLHFCQUFGLEVBQVcsZUFBWCxFQUFpQjtNQUVqQixVQUFBLEdBQWEsT0FBQSxDQUFRLE9BQU8sQ0FBQyxRQUFoQjtNQUNiLFdBQUEsR0FBYyxPQUFBLENBQVEsVUFBUjtBQUVkLGNBQU8sUUFBQSxDQUFBLENBQVA7QUFBQSxhQUNPLFFBRFA7VUFFSSxTQUFBLEdBQVksSUFBQSxDQUFLLFdBQUwsRUFBa0IsSUFBbEIsRUFBd0IsSUFBeEIsRUFBOEIsSUFBOUIsRUFBb0MsSUFBcEM7QUFEVDtBQURQO1VBSUksU0FBQSxHQUFZO0FBSmhCO2FBTUEsSUFBQyxDQUFBLFVBQUQsQ0FBWSxTQUFaO0lBYlMsQ0E3Qlg7SUE0Q0EsY0FBQSxFQUFnQixTQUFBO0FBQ2QsVUFBQTtNQUFBLE1BQXVCLE9BQUEsQ0FBUSxJQUFSLENBQXZCLEVBQUUsMkJBQUYsRUFBYztNQUVkLFdBQUEsR0FBYyxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFkLENBQUE7QUFFZDtXQUFBLDZDQUFBOztBQUVFO1VBQ0UsVUFBQSxDQUFXLFVBQVgsRUFBdUIsSUFBdkIsRUFERjtTQUFBLGNBQUE7VUFFTTtVQUNKLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBbkIsQ0FBNEIsSUFBNUIsRUFBa0M7WUFBQSxNQUFBLEVBQVEsS0FBUjtZQUFlLFdBQUEsRUFBYSxJQUE1QjtXQUFsQyxFQUhGOztxQkFNQSxJQUFDLENBQUEsVUFBRCxDQUFZLFVBQVo7QUFSRjs7SUFMYyxDQTVDaEI7SUEyREEsVUFBQSxFQUFZLFNBQUE7QUFFVixVQUFBO01BQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWYsQ0FBQTtNQUVULHNCQUFHLE1BQU0sQ0FBRSxXQUFXLENBQUMsY0FBcEIsS0FBNEIsWUFBNUIsc0JBQTRDLE1BQU0sQ0FBRSxXQUFXLENBQUMsY0FBcEIsS0FBNEIsYUFBM0U7UUFDRSxJQUFBLHdEQUF3QixDQUFFLHVCQUFuQixHQUE2QixNQUFNLENBQUMsTUFBTSxDQUFDLElBQTNDLHFCQUF3RCxNQUFNLENBQUUsY0FBWCxHQUFxQixNQUFNLENBQUMsSUFBNUIsR0FBQTtRQUU1RCxtQkFBRyxJQUFJLENBQUUsYUFBVDtVQUNFLElBQUMsQ0FBQSxVQUFELENBQVksSUFBSSxDQUFDLElBQWpCO0FBQ0EsaUJBRkY7U0FIRjs7YUFPQSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQW5CLENBQThCLElBQUEsR0FBSyxJQUFMLEdBQVUsb0JBQXhDLEVBQTZEO1FBQUEsV0FBQSxFQUFhLEtBQWI7T0FBN0Q7SUFYVSxDQTNEWjtJQXdFQSxXQUFBLEVBQWEsU0FBQTtBQUVYLFVBQUE7TUFBQSxPQUFBLEdBQVUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFmLENBQUE7TUFFVixJQUFHLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLENBQXBCO1FBQ0UsS0FBQSxHQUFRO0FBQ1IsYUFBQSx5Q0FBQTs7VUFDRSxJQUFBLENBQUEsQ0FBZ0IsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFuQixLQUEyQixZQUEzQixJQUEyQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQW5CLEtBQTJCLGFBQXRGLENBQUE7QUFBQSxxQkFBQTs7VUFFQSxJQUFBLHdEQUF3QixDQUFFLHVCQUFuQixHQUE2QixNQUFNLENBQUMsTUFBTSxDQUFDLElBQTNDLHFCQUF3RCxNQUFNLENBQUUsY0FBWCxHQUFxQixNQUFNLENBQUMsSUFBNUIsR0FBQTtVQUU1RCxtQkFBRyxJQUFJLENBQUUsYUFBVDtZQUNFLElBQUMsQ0FBQSxVQUFELENBQVksSUFBSSxDQUFDLElBQWpCO1lBQ0EsS0FBQSxHQUZGOztBQUxGO1FBU0EsSUFBVSxLQUFBLEdBQVEsQ0FBbEI7QUFBQSxpQkFBQTtTQVhGOzthQWFBLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBbkIsQ0FBOEIsSUFBQSxHQUFLLElBQUwsR0FBVSxtQkFBeEMsRUFBNEQ7UUFBQSxXQUFBLEVBQWEsS0FBYjtPQUE1RDtJQWpCVyxDQXhFYjtJQTJGQSxjQUFBLEVBQWdCLFNBQUE7QUFDZCxVQUFBO01BQUEsTUFBdUIsT0FBQSxDQUFRLElBQVIsQ0FBdkIsRUFBRSwyQkFBRixFQUFjO01BRWQsUUFBQSxHQUFXLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFBO01BQ1gsSUFBQSxDQUFBLENBQWtHLFFBQVEsQ0FBQyxNQUFULEdBQWtCLENBQXBILENBQUE7QUFBQSxlQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBbkIsQ0FBOEIsSUFBQSxHQUFLLElBQUwsR0FBVSx1QkFBeEMsRUFBZ0U7VUFBQSxXQUFBLEVBQWEsS0FBYjtTQUFoRSxFQUFQOztBQUVBO1dBQUEsMENBQUE7O1FBRUUsSUFBRyxPQUFPLENBQUMsVUFBUixDQUFtQixTQUFuQixDQUFIO0FBQ0UsbUJBREY7O0FBSUE7VUFDRSxVQUFBLENBQVcsT0FBWCxFQUFvQixJQUFwQixFQURGO1NBQUEsY0FBQTtVQUdFLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBbkIsQ0FBNEIsSUFBNUIsRUFBa0M7WUFBQSxNQUFBLEVBQVEsS0FBUjtZQUFlLFdBQUEsRUFBYSxJQUE1QjtXQUFsQztBQUNBLG1CQUpGOztxQkFPQSxJQUFDLENBQUEsVUFBRCxDQUFZLE9BQVo7QUFiRjs7SUFOYyxDQTNGaEI7SUFnSEEsWUFBQSxFQUFjLFNBQUE7QUFDWixVQUFBO01BQUEsTUFBdUIsT0FBQSxDQUFRLElBQVIsQ0FBdkIsRUFBRSwyQkFBRixFQUFjO01BQ1osVUFBWSxPQUFBLENBQVEsTUFBUjtNQUVkLFVBQUEsR0FBYSxJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFaLENBQUE7TUFDYixVQUFBLEdBQWEsT0FBQSxDQUFRLFVBQVI7TUFFYixJQUFHLFVBQUg7QUFFRTtVQUNFLFVBQUEsQ0FBVyxVQUFYLEVBQXVCLElBQXZCLEVBREY7U0FBQSxjQUFBO1VBRU07VUFDSixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQW5CLENBQTRCLElBQTVCLEVBQWtDO1lBQUEsTUFBQSxFQUFRLEtBQVI7WUFBZSxXQUFBLEVBQWEsSUFBNUI7V0FBbEM7QUFDQSxpQkFKRjs7ZUFPQSxJQUFDLENBQUEsVUFBRCxDQUFZLFVBQVosRUFURjs7SUFQWSxDQWhIZDtJQWtJQSxVQUFBLEVBQVksU0FBQyxJQUFEO0FBQ1YsVUFBQTtNQUFFLFdBQWEsT0FBQSxDQUFRLE1BQVI7TUFHZixXQUFBLEdBQWMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQW1CLElBQUQsR0FBTSxjQUF4QjtNQUNkLElBQTBFLFdBQTFFO0FBQUEsZUFBTyxJQUFDLENBQUEsUUFBRCxDQUFVLFdBQVYsRUFBdUIsQ0FBRSxJQUFGLENBQXZCLEVBQWlDLFFBQUEsQ0FBUyxJQUFULENBQWpDLEVBQWlELGNBQWpELEVBQVA7O0FBR0EsY0FBTyxPQUFPLENBQUMsUUFBZjtBQUFBLGFBQ08sUUFEUDtpQkFFSSxJQUFDLENBQUEsUUFBRCxDQUFVLE1BQVYsRUFBa0IsQ0FBRSxJQUFGLEVBQVEsSUFBUixDQUFsQixFQUFrQyxRQUFBLENBQVMsSUFBVCxDQUFsQyxFQUFrRCxRQUFsRDtBQUZKLGFBR08sT0FIUDtpQkFJSSxJQUFDLENBQUEsUUFBRCxDQUFVLFVBQVYsRUFBc0IsQ0FBRSxVQUFBLEdBQVcsSUFBYixDQUF0QixFQUE2QyxRQUFBLENBQVMsSUFBVCxDQUE3QyxFQUE2RCxVQUE3RDtBQUpKLGFBS08sT0FMUDtVQU1NLG1CQUFxQixPQUFBLENBQVEsT0FBUjtVQUN2QixnQkFBQSxDQUFpQixJQUFqQjtpQkFDQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLElBQUEsR0FBSyxJQUFMLEdBQVUsY0FBVixHQUF1QixDQUFDLFFBQUEsQ0FBUyxJQUFULENBQUQsQ0FBdkIsR0FBdUMsbUJBQWxFLEVBQXNGO1lBQUEsV0FBQSxFQUFhLEtBQWI7V0FBdEY7QUFSSjtJQVJVLENBbElaO0lBb0pBLFVBQUEsRUFBWSxTQUFDLElBQUQ7QUFDVixVQUFBO01BQUUsV0FBYSxPQUFBLENBQVEsTUFBUjtNQUdmLFdBQUEsR0FBYyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBbUIsSUFBRCxHQUFNLGNBQXhCO01BQ2QsSUFBMEUsV0FBMUU7QUFBQSxlQUFPLElBQUMsQ0FBQSxRQUFELENBQVUsV0FBVixFQUF1QixDQUFFLElBQUYsQ0FBdkIsRUFBaUMsUUFBQSxDQUFTLElBQVQsQ0FBakMsRUFBaUQsY0FBakQsRUFBUDs7QUFHQSxjQUFPLE9BQU8sQ0FBQyxRQUFmO0FBQUEsYUFDTyxRQURQO2lCQUVJLElBQUMsQ0FBQSxRQUFELENBQVUsTUFBVixFQUFrQixDQUFFLElBQUYsQ0FBbEIsRUFBNEIsUUFBQSxDQUFTLElBQVQsQ0FBNUIsRUFBNEMsUUFBNUM7QUFGSixhQUdPLE9BSFA7aUJBSUksSUFBQyxDQUFBLFFBQUQsQ0FBVSxVQUFWLEVBQXNCLENBQUUsSUFBRixDQUF0QixFQUFnQyxRQUFBLENBQVMsSUFBVCxDQUFoQyxFQUFnRCxVQUFoRDtBQUpKLGFBS08sT0FMUDtVQU1NLFdBQWEsT0FBQSxDQUFRLE9BQVI7VUFDZixRQUFBLENBQVMsSUFBVDtpQkFDQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLElBQUEsR0FBSyxJQUFMLEdBQVUsY0FBVixHQUF1QixDQUFDLFFBQUEsQ0FBUyxJQUFULENBQUQsQ0FBdkIsR0FBdUMsbUJBQWxFLEVBQXNGO1lBQUEsV0FBQSxFQUFhLEtBQWI7V0FBdEY7QUFSSjtJQVJVLENBcEpaO0lBc0tBLFFBQUEsRUFBVSxTQUFDLEdBQUQsRUFBTSxJQUFOLEVBQVksUUFBWixFQUFzQixXQUF0QjtBQUNSLFVBQUE7TUFBRSxRQUFVLE9BQUEsQ0FBUSxlQUFSO01BRVosSUFBQSxHQUFPLEtBQUEsQ0FBTSxHQUFOLEVBQVcsSUFBWDtNQUVQLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBWixDQUFlLE1BQWYsRUFBdUIsU0FBQyxLQUFEO2VBQ3JCLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBbkIsQ0FBNEIsSUFBQSxHQUFLLElBQUwsR0FBVSxNQUFWLEdBQWdCLEtBQTVDLEVBQXFEO1VBQUEsV0FBQSxFQUFhLElBQWI7U0FBckQ7TUFEcUIsQ0FBdkI7YUFHQSxJQUFJLENBQUMsRUFBTCxDQUFRLE9BQVIsRUFBaUIsU0FBRSxTQUFGO1FBQ2YsSUFBRyxTQUFBLEtBQWEsQ0FBYixJQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBbUIsSUFBRCxHQUFNLFNBQXhCLENBQXRCO2lCQUNFLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsSUFBQSxHQUFLLElBQUwsR0FBVSxjQUFWLEdBQXdCLFFBQXhCLEdBQWlDLE9BQWpDLEdBQXdDLFdBQW5FLEVBQWtGO1lBQUEsV0FBQSxFQUFhLEtBQWI7V0FBbEYsRUFERjs7TUFEZSxDQUFqQjtJQVJRLENBdEtWOztBQUpGIiwic291cmNlc0NvbnRlbnQiOlsieyBuYW1lIH0gPSByZXF1aXJlIFwiLi4vcGFja2FnZS5qc29uXCJcbnsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9ID0gcmVxdWlyZSBcImF0b21cIlxuXG5tb2R1bGUuZXhwb3J0cyA9IEJyb3dzZVBhY2thZ2VzID1cbiAgY29uZmlnOlxuICAgIGZpbGVNYW5hZ2VyOlxuICAgICAgdGl0bGU6IFwiRmlsZSBtYW5hZ2VyXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlNwZWNpZnkgdGhlIGZ1bGwgcGF0aCB0byBhIGN1c3RvbSBmaWxlIG1hbmFnZXJcIlxuICAgICAgdHlwZTogXCJzdHJpbmdcIlxuICAgICAgZGVmYXVsdDogXCJcIlxuICAgIG5vdGlmeTpcbiAgICAgIHRpdGxlOiBcIlZlcmJvc2UgTW9kZVwiXG4gICAgICBkZXNjcmlwdGlvbjogXCJTaG93IGluZm8gbm90aWZpY2F0aW9ucyBmb3IgYWxsIGFjdGlvbnNcIlxuICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gIHN1YnNjcmlwdGlvbnM6IG51bGxcblxuICBhY3RpdmF0ZTogLT5cbiAgICAjIEV2ZW50cyBzdWJzY3JpYmVkIHRvIGluIEF0b20ncyBzeXN0ZW0gY2FuIGJlIGVhc2lseSBjbGVhbmVkIHVwIHdpdGggYSBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG4gICAgIyBSZWdpc3RlciBjb21tYW5kIHRoYXQgdG9nZ2xlcyB0aGlzIHZpZXdcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgXCJhdG9tLXdvcmtzcGFjZVwiLCBcIiN7bmFtZX06Y29uZmlndXJhdGlvbi1mb2xkZXJcIjogPT4gQGJyb3dzZUNvbmZpZygpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkIFwiYXRvbS13b3Jrc3BhY2VcIiwgXCIje25hbWV9OnBhY2thZ2VzLWZvbGRlclwiOiA9PiBAYnJvd3NlUGFja2FnZXMoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCBcImF0b20td29ya3NwYWNlXCIsIFwiI3tuYW1lfTpwcm9qZWN0LWZvbGRlcnNcIjogPT4gQGJyb3dzZVByb2plY3RzKClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgXCJhdG9tLXdvcmtzcGFjZVwiLCBcIiN7bmFtZX06cmV2ZWFsLWZpbGVcIjogPT4gQHJldmVhbEZpbGUoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCBcImF0b20td29ya3NwYWNlXCIsIFwiI3tuYW1lfTpyZXZlYWwtYWxsLW9wZW4tZmlsZXNcIjogPT4gQHJldmVhbEZpbGVzKClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgXCJhdG9tLXdvcmtzcGFjZVwiLCBcIiN7bmFtZX06YXBwbGljYXRpb24tZm9sZGVyXCI6ID0+IEBhcHBGb2xkZXIoKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnM/LmRpc3Bvc2UoKVxuICAgIEBzdWJzY3JpcHRpb25zID0gbnVsbFxuXG4gIGFwcEZvbGRlcjogLT5cbiAgICB7IHBsYXRmb3JtIH0gPSByZXF1aXJlIFwib3NcIlxuICAgIHsgZGlybmFtZSwgam9pbiwgcmVzb2x2ZSB9ID0gcmVxdWlyZSBcInBhdGhcIlxuXG4gICAgcHJvY2Vzc0JpbiA9IHJlc29sdmUgcHJvY2Vzcy5leGVjUGF0aFxuICAgIHByb2Nlc3NQYXRoID0gZGlybmFtZSBwcm9jZXNzQmluXG5cbiAgICBzd2l0Y2ggcGxhdGZvcm0oKVxuICAgICAgd2hlbiBcImRhcndpblwiXG4gICAgICAgIGFwcEZvbGRlciA9IGpvaW4ocHJvY2Vzc1BhdGgsIFwiLi5cIiwgXCIuLlwiLCBcIi4uXCIsIFwiLi5cIilcbiAgICAgIGVsc2VcbiAgICAgICAgYXBwRm9sZGVyID0gcHJvY2Vzc1BhdGhcblxuICAgIEBvcGVuRm9sZGVyKGFwcEZvbGRlcilcblxuICBicm93c2VQYWNrYWdlczogLT5cbiAgICB7IGFjY2Vzc1N5bmMsIEZfT0sgfSA9IHJlcXVpcmUgXCJmc1wiXG5cbiAgICBwYWNrYWdlRGlycyA9IGF0b20ucGFja2FnZXMuZ2V0UGFja2FnZURpclBhdGhzKClcblxuICAgIGZvciBwYWNrYWdlRGlyIGluIHBhY2thZ2VEaXJzXG4gICAgICAjIERvZXMgcGFja2FnZXMgZm9sZGVyIGV4aXN0P1xuICAgICAgdHJ5XG4gICAgICAgIGFjY2Vzc1N5bmMocGFja2FnZURpciwgRl9PSylcbiAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihuYW1lLCBkZXRhaWw6IGVycm9yLCBkaXNtaXNzYWJsZTogdHJ1ZSlcblxuICAgICAgIyBPcGVuIHBhY2thZ2VzIGZvbGRlclxuICAgICAgQG9wZW5Gb2xkZXIocGFja2FnZURpcilcblxuICByZXZlYWxGaWxlOiAtPlxuICAgICMgR2V0IHBhcmVudCBmb2xkZXIgb2YgYWN0aXZlIGZpbGVcbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpXG5cbiAgICBpZiBlZGl0b3I/LmNvbnN0cnVjdG9yLm5hbWUgaXMgXCJUZXh0RWRpdG9yXCIgb3IgZWRpdG9yPy5jb25zdHJ1Y3Rvci5uYW1lIGlzIFwiSW1hZ2VFZGl0b3JcIlxuICAgICAgZmlsZSA9IGlmIGVkaXRvcj8uYnVmZmVyPy5maWxlIHRoZW4gZWRpdG9yLmJ1ZmZlci5maWxlIGVsc2UgaWYgZWRpdG9yPy5maWxlIHRoZW4gZWRpdG9yLmZpbGVcbiAgICAgIFxuICAgICAgaWYgZmlsZT8ucGF0aFxuICAgICAgICBAc2VsZWN0RmlsZShmaWxlLnBhdGgpXG4gICAgICAgIHJldHVyblxuICAgIFxuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFwiKioje25hbWV9Kio6IE5vIGFjdGl2ZSBmaWxlXCIsIGRpc21pc3NhYmxlOiBmYWxzZSlcblxuICByZXZlYWxGaWxlczogLT5cbiAgICAjIEdldCBhbGwgb3BlbiBmaWxlXG4gICAgZWRpdG9ycyA9IGF0b20ud29ya3NwYWNlLmdldFBhbmVJdGVtcygpXG5cbiAgICBpZiBlZGl0b3JzLmxlbmd0aCA+IDBcbiAgICAgIGNvdW50ID0gMFxuICAgICAgZm9yIGVkaXRvciBpbiBlZGl0b3JzXG4gICAgICAgIGNvbnRpbnVlIHVubGVzcyBlZGl0b3IuY29uc3RydWN0b3IubmFtZSBpcyBcIlRleHRFZGl0b3JcIiBvciBlZGl0b3IuY29uc3RydWN0b3IubmFtZSBpcyBcIkltYWdlRWRpdG9yXCJcblxuICAgICAgICBmaWxlID0gaWYgZWRpdG9yPy5idWZmZXI/LmZpbGUgdGhlbiBlZGl0b3IuYnVmZmVyLmZpbGUgZWxzZSBpZiBlZGl0b3I/LmZpbGUgdGhlbiBlZGl0b3IuZmlsZVxuXG4gICAgICAgIGlmIGZpbGU/LnBhdGhcbiAgICAgICAgICBAc2VsZWN0RmlsZShmaWxlLnBhdGgpXG4gICAgICAgICAgY291bnQrK1xuXG4gICAgICByZXR1cm4gaWYgY291bnQgPiAwXG5cbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcIioqI3tuYW1lfSoqOiBObyBvcGVuIGZpbGVzXCIsIGRpc21pc3NhYmxlOiBmYWxzZSlcblxuICBicm93c2VQcm9qZWN0czogLT5cbiAgICB7IGFjY2Vzc1N5bmMsIEZfT0sgfSA9IHJlcXVpcmUgXCJmc1wiXG5cbiAgICBwcm9qZWN0cyA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpXG4gICAgcmV0dXJuIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFwiKioje25hbWV9Kio6IE5vIGFjdGl2ZSBwcm9qZWN0XCIsIGRpc21pc3NhYmxlOiBmYWxzZSkgdW5sZXNzIHByb2plY3RzLmxlbmd0aCA+IDBcblxuICAgIGZvciBwcm9qZWN0IGluIHByb2plY3RzXG4gICAgICAjIFNraXAgQXRvbSBkaWFsb2dzXG4gICAgICBpZiBwcm9qZWN0LnN0YXJ0c1dpdGgoJ2F0b206Ly8nKVxuICAgICAgICBjb250aW51ZVxuXG4gICAgICAjIERvZXMgcHJvamVjdCBmb2xkZXIgZXhpc3Q/XG4gICAgICB0cnlcbiAgICAgICAgYWNjZXNzU3luYyhwcm9qZWN0LCBGX09LKVxuICAgICAgY2F0Y2hcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKG5hbWUsIGRldGFpbDogZXJyb3IsIGRpc21pc3NhYmxlOiB0cnVlKVxuICAgICAgICBjb250aW51ZVxuXG4gICAgICAjIE9wZW4gcHJvamVjdCBmb2xkZXJcbiAgICAgIEBvcGVuRm9sZGVyKHByb2plY3QpXG5cbiAgYnJvd3NlQ29uZmlnOiAtPlxuICAgIHsgYWNjZXNzU3luYywgRl9PSyB9ID0gcmVxdWlyZSBcImZzXCJcbiAgICB7IGRpcm5hbWUgfSA9IHJlcXVpcmUgXCJwYXRoXCJcblxuICAgIGNvbmZpZ0ZpbGUgPSBhdG9tLmNvbmZpZy5nZXRVc2VyQ29uZmlnUGF0aCgpXG4gICAgY29uZmlnUGF0aCA9IGRpcm5hbWUoY29uZmlnRmlsZSlcblxuICAgIGlmIGNvbmZpZ1BhdGhcbiAgICAgICMgRG9lcyBjb25maWcgZm9sZGVyIGV4aXN0P1xuICAgICAgdHJ5XG4gICAgICAgIGFjY2Vzc1N5bmMoY29uZmlnUGF0aCwgRl9PSylcbiAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihuYW1lLCBkZXRhaWw6IGVycm9yLCBkaXNtaXNzYWJsZTogdHJ1ZSlcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgICMgT3BlbiBjb25maWcgZm9sZGVyXG4gICAgICBAb3BlbkZvbGRlcihjb25maWdQYXRoKVxuXG4gIHNlbGVjdEZpbGU6IChwYXRoKSAtPlxuICAgIHsgYmFzZW5hbWUgfSA9IHJlcXVpcmUgXCJwYXRoXCJcblxuICAgICMgQ3VzdG9tIGZpbGUgbWFuYWdlclxuICAgIGZpbGVNYW5hZ2VyID0gYXRvbS5jb25maWcuZ2V0KFwiI3tuYW1lfS5maWxlTWFuYWdlclwiKVxuICAgIHJldHVybiBAc3Bhd25DbWQgZmlsZU1hbmFnZXIsIFsgcGF0aCBdLCBiYXNlbmFtZShwYXRoKSwgXCJmaWxlIG1hbmFnZXJcIiBpZiBmaWxlTWFuYWdlclxuXG4gICAgIyBEZWZhdWx0IGZpbGUgbWFuYWdlclxuICAgIHN3aXRjaCBwcm9jZXNzLnBsYXRmb3JtXG4gICAgICB3aGVuIFwiZGFyd2luXCJcbiAgICAgICAgQHNwYXduQ21kIFwib3BlblwiLCBbIFwiLVJcIiwgcGF0aCBdLCBiYXNlbmFtZShwYXRoKSwgXCJGaW5kZXJcIlxuICAgICAgd2hlbiBcIndpbjMyXCJcbiAgICAgICAgQHNwYXduQ21kIFwiZXhwbG9yZXJcIiwgWyBcIi9zZWxlY3QsI3twYXRofVwiIF0sIGJhc2VuYW1lKHBhdGgpLCBcIkV4cGxvcmVyXCJcbiAgICAgIHdoZW4gXCJsaW51eFwiXG4gICAgICAgIHsgc2hvd0l0ZW1JbkZvbGRlciB9ID0gcmVxdWlyZSBcInNoZWxsXCJcbiAgICAgICAgc2hvd0l0ZW1JbkZvbGRlcihwYXRoKVxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcIioqI3tuYW1lfSoqOiBPcGVuZWQgYCN7YmFzZW5hbWUocGF0aCl9YCBpbiBmaWxlIG1hbmFnZXJcIiwgZGlzbWlzc2FibGU6IGZhbHNlKVxuXG4gIG9wZW5Gb2xkZXI6IChwYXRoKSAtPlxuICAgIHsgYmFzZW5hbWUgfSA9IHJlcXVpcmUgXCJwYXRoXCJcblxuICAgICMgQ3VzdG9tIGZpbGUgbWFuYWdlclxuICAgIGZpbGVNYW5hZ2VyID0gYXRvbS5jb25maWcuZ2V0KFwiI3tuYW1lfS5maWxlTWFuYWdlclwiKVxuICAgIHJldHVybiBAc3Bhd25DbWQgZmlsZU1hbmFnZXIsIFsgcGF0aCBdLCBiYXNlbmFtZShwYXRoKSwgXCJmaWxlIG1hbmFnZXJcIiBpZiBmaWxlTWFuYWdlclxuXG4gICAgIyBEZWZhdWx0IGZpbGUgbWFuYWdlclxuICAgIHN3aXRjaCBwcm9jZXNzLnBsYXRmb3JtXG4gICAgICB3aGVuIFwiZGFyd2luXCJcbiAgICAgICAgQHNwYXduQ21kIFwib3BlblwiLCBbIHBhdGggXSwgYmFzZW5hbWUocGF0aCksIFwiRmluZGVyXCJcbiAgICAgIHdoZW4gXCJ3aW4zMlwiXG4gICAgICAgIEBzcGF3bkNtZCBcImV4cGxvcmVyXCIsIFsgcGF0aCBdLCBiYXNlbmFtZShwYXRoKSwgXCJFeHBsb3JlclwiXG4gICAgICB3aGVuIFwibGludXhcIlxuICAgICAgICB7IG9wZW5JdGVtIH0gPSByZXF1aXJlIFwic2hlbGxcIlxuICAgICAgICBvcGVuSXRlbShwYXRoKVxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcIioqI3tuYW1lfSoqOiBPcGVuZWQgYCN7YmFzZW5hbWUocGF0aCl9YCBpbiBmaWxlIG1hbmFnZXJcIiwgZGlzbWlzc2FibGU6IGZhbHNlKVxuXG4gIHNwYXduQ21kOiAoY21kLCBhcmdzLCBiYXNlTmFtZSwgZmlsZU1hbmFnZXIpIC0+XG4gICAgeyBzcGF3biB9ID0gcmVxdWlyZShcImNoaWxkX3Byb2Nlc3NcIilcblxuICAgIG9wZW4gPSBzcGF3biBjbWQsIGFyZ3NcblxuICAgIG9wZW4uc3RkZXJyLm9uIFwiZGF0YVwiLCAoZXJyb3IpIC0+XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXCIqKiN7bmFtZX0qKjogI3tlcnJvcn1cIiwgZGlzbWlzc2FibGU6IHRydWUpXG5cbiAgICBvcGVuLm9uIFwiY2xvc2VcIiwgKCBlcnJvckNvZGUgKSAtPlxuICAgICAgaWYgZXJyb3JDb2RlIGlzIDAgYW5kIGF0b20uY29uZmlnLmdldChcIiN7bmFtZX0ubm90aWZ5XCIpXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKFwiKioje25hbWV9Kio6IE9wZW5lZCBgI3tiYXNlTmFtZX1gIGluICN7ZmlsZU1hbmFnZXJ9XCIsIGRpc21pc3NhYmxlOiBmYWxzZSlcbiJdfQ==
