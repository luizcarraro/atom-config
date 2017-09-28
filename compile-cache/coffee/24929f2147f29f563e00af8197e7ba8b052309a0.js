(function() {
  var BrowsePackages, name;

  name = require("../package.json").name;

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
      var CompositeDisposable, obj, obj1, obj2, obj3, obj4, obj5, obj6;
      CompositeDisposable = require("atom").CompositeDisposable;
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
      this.subscriptions.add(atom.commands.add("atom-workspace", (
        obj5 = {},
        obj5[name + ":reveal-file-from-treeview"] = (function(_this) {
          return function() {
            return _this.revealFileFromTreeview();
          };
        })(this),
        obj5
      )));
      return this.subscriptions.add(atom.commands.add("atom-workspace", (
        obj6 = {},
        obj6[name + ":application-folder"] = (function(_this) {
          return function() {
            return _this.appFolder();
          };
        })(this),
        obj6
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
    revealFileFromTreeview: function() {
      var count, file, i, len, pane, panes;
      panes = atom.workspace.getPaneItems();
      if (panes.length > 0) {
        count = 0;
        for (i = 0, len = panes.length; i < len; i++) {
          pane = panes[i];
          if (pane.constructor.name !== "TreeView") {
            continue;
          }
          file = pane.selectedPath;
          if (file != null) {
            this.selectFile(file);
            return;
          }
        }
        if (count > 0) {
          return;
        }
      }
      return atom.notifications.addWarning("**" + name + "**: No selected files", {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2Jyb3dzZS9saWIvYnJvd3NlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUUsT0FBUyxPQUFBLENBQVEsaUJBQVI7O0VBRVgsTUFBTSxDQUFDLE9BQVAsR0FBaUIsY0FBQSxHQUNmO0lBQUEsTUFBQSxFQUNFO01BQUEsV0FBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLGNBQVA7UUFDQSxXQUFBLEVBQWEsZ0RBRGI7UUFFQSxJQUFBLEVBQU0sUUFGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFIVDtPQURGO01BS0EsTUFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLGNBQVA7UUFDQSxXQUFBLEVBQWEseUNBRGI7UUFFQSxJQUFBLEVBQU0sU0FGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtPQU5GO0tBREY7SUFXQSxhQUFBLEVBQWUsSUFYZjtJQWFBLFFBQUEsRUFBVSxTQUFBO0FBRVIsVUFBQTtNQUFFLHNCQUF3QixPQUFBLENBQVEsTUFBUjtNQUMxQixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BR3JCLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DO2NBQUEsRUFBQTtZQUFHLElBQUQsR0FBTSwyQkFBd0IsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsWUFBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhDOztPQUFwQyxDQUFuQjtNQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DO2VBQUEsRUFBQTthQUFHLElBQUQsR0FBTSxzQkFBbUIsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsY0FBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTNCOztPQUFwQyxDQUFuQjtNQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DO2VBQUEsRUFBQTthQUFHLElBQUQsR0FBTSxzQkFBbUIsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsY0FBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTNCOztPQUFwQyxDQUFuQjtNQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DO2VBQUEsRUFBQTthQUFHLElBQUQsR0FBTSxrQkFBZSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxVQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkI7O09BQXBDLENBQW5CO01BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0M7ZUFBQSxFQUFBO2FBQUcsSUFBRCxHQUFNLDRCQUF5QixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxXQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakM7O09BQXBDLENBQW5CO01BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0M7ZUFBQSxFQUFBO2FBQUcsSUFBRCxHQUFNLGdDQUE2QixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxzQkFBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJDOztPQUFwQyxDQUFuQjthQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DO2VBQUEsRUFBQTthQUFHLElBQUQsR0FBTSx5QkFBc0IsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsU0FBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlCOztPQUFwQyxDQUFuQjtJQVpRLENBYlY7SUEyQkEsVUFBQSxFQUFZLFNBQUE7QUFDVixVQUFBOztXQUFjLENBQUUsT0FBaEIsQ0FBQTs7YUFDQSxJQUFDLENBQUEsYUFBRCxHQUFpQjtJQUZQLENBM0JaO0lBK0JBLFNBQUEsRUFBVyxTQUFBO0FBQ1QsVUFBQTtNQUFFLFdBQWEsT0FBQSxDQUFRLElBQVI7TUFDZixNQUE2QixPQUFBLENBQVEsTUFBUixDQUE3QixFQUFFLHFCQUFGLEVBQVcsZUFBWCxFQUFpQjtNQUVqQixVQUFBLEdBQWEsT0FBQSxDQUFRLE9BQU8sQ0FBQyxRQUFoQjtNQUNiLFdBQUEsR0FBYyxPQUFBLENBQVEsVUFBUjtBQUVkLGNBQU8sUUFBQSxDQUFBLENBQVA7QUFBQSxhQUNPLFFBRFA7VUFFSSxTQUFBLEdBQVksSUFBQSxDQUFLLFdBQUwsRUFBa0IsSUFBbEIsRUFBd0IsSUFBeEIsRUFBOEIsSUFBOUIsRUFBb0MsSUFBcEM7QUFEVDtBQURQO1VBSUksU0FBQSxHQUFZO0FBSmhCO2FBTUEsSUFBQyxDQUFBLFVBQUQsQ0FBWSxTQUFaO0lBYlMsQ0EvQlg7SUE4Q0EsY0FBQSxFQUFnQixTQUFBO0FBQ2QsVUFBQTtNQUFBLE1BQXVCLE9BQUEsQ0FBUSxJQUFSLENBQXZCLEVBQUUsMkJBQUYsRUFBYztNQUVkLFdBQUEsR0FBYyxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFkLENBQUE7QUFFZDtXQUFBLDZDQUFBOztBQUVFO1VBQ0UsVUFBQSxDQUFXLFVBQVgsRUFBdUIsSUFBdkIsRUFERjtTQUFBLGNBQUE7VUFFTTtVQUNKLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBbkIsQ0FBNEIsSUFBNUIsRUFBa0M7WUFBQSxNQUFBLEVBQVEsS0FBUjtZQUFlLFdBQUEsRUFBYSxJQUE1QjtXQUFsQyxFQUhGOztxQkFNQSxJQUFDLENBQUEsVUFBRCxDQUFZLFVBQVo7QUFSRjs7SUFMYyxDQTlDaEI7SUE2REEsVUFBQSxFQUFZLFNBQUE7QUFDVixVQUFBO01BQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWYsQ0FBQTtNQUVULHNCQUFHLE1BQU0sQ0FBRSxXQUFXLENBQUMsY0FBcEIsS0FBNEIsWUFBNUIsc0JBQTRDLE1BQU0sQ0FBRSxXQUFXLENBQUMsY0FBcEIsS0FBNEIsYUFBM0U7UUFDRSxJQUFBLHdEQUF3QixDQUFFLHVCQUFuQixHQUE2QixNQUFNLENBQUMsTUFBTSxDQUFDLElBQTNDLHFCQUF3RCxNQUFNLENBQUUsY0FBWCxHQUFxQixNQUFNLENBQUMsSUFBNUIsR0FBQTtRQUU1RCxtQkFBRyxJQUFJLENBQUUsYUFBVDtVQUNFLElBQUMsQ0FBQSxVQUFELENBQVksSUFBSSxDQUFDLElBQWpCO0FBQ0EsaUJBRkY7U0FIRjs7YUFPQSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQW5CLENBQThCLElBQUEsR0FBSyxJQUFMLEdBQVUsb0JBQXhDLEVBQTZEO1FBQUEsV0FBQSxFQUFhLEtBQWI7T0FBN0Q7SUFWVSxDQTdEWjtJQXlFQSxXQUFBLEVBQWEsU0FBQTtBQUNYLFVBQUE7TUFBQSxPQUFBLEdBQVUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFmLENBQUE7TUFFVixJQUFHLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLENBQXBCO1FBQ0UsS0FBQSxHQUFRO0FBQ1IsYUFBQSx5Q0FBQTs7VUFDRSxJQUFBLENBQUEsQ0FBZ0IsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFuQixLQUEyQixZQUEzQixJQUEyQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQW5CLEtBQTJCLGFBQXRGLENBQUE7QUFBQSxxQkFBQTs7VUFFQSxJQUFBLHdEQUF3QixDQUFFLHVCQUFuQixHQUE2QixNQUFNLENBQUMsTUFBTSxDQUFDLElBQTNDLHFCQUF3RCxNQUFNLENBQUUsY0FBWCxHQUFxQixNQUFNLENBQUMsSUFBNUIsR0FBQTtVQUU1RCxtQkFBRyxJQUFJLENBQUUsYUFBVDtZQUNFLElBQUMsQ0FBQSxVQUFELENBQVksSUFBSSxDQUFDLElBQWpCO1lBQ0EsS0FBQSxHQUZGOztBQUxGO1FBU0EsSUFBVSxLQUFBLEdBQVEsQ0FBbEI7QUFBQSxpQkFBQTtTQVhGOzthQWFBLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBbkIsQ0FBOEIsSUFBQSxHQUFLLElBQUwsR0FBVSxtQkFBeEMsRUFBNEQ7UUFBQSxXQUFBLEVBQWEsS0FBYjtPQUE1RDtJQWhCVyxDQXpFYjtJQTRGQSxzQkFBQSxFQUF3QixTQUFBO0FBQ3RCLFVBQUE7TUFBQSxLQUFBLEdBQVEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFmLENBQUE7TUFFUixJQUFHLEtBQUssQ0FBQyxNQUFOLEdBQWUsQ0FBbEI7UUFDRSxLQUFBLEdBQVE7QUFDUixhQUFBLHVDQUFBOztVQUNFLElBQWdCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBakIsS0FBeUIsVUFBekM7QUFBQSxxQkFBQTs7VUFFQSxJQUFBLEdBQU8sSUFBSSxDQUFDO1VBRVosSUFBRyxZQUFIO1lBQ0UsSUFBQyxDQUFBLFVBQUQsQ0FBWSxJQUFaO0FBQ0EsbUJBRkY7O0FBTEY7UUFTQSxJQUFVLEtBQUEsR0FBUSxDQUFsQjtBQUFBLGlCQUFBO1NBWEY7O2FBYUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFuQixDQUE4QixJQUFBLEdBQUssSUFBTCxHQUFVLHVCQUF4QyxFQUFnRTtRQUFBLFdBQUEsRUFBYSxLQUFiO09BQWhFO0lBaEJzQixDQTVGeEI7SUE4R0EsY0FBQSxFQUFnQixTQUFBO0FBQ2QsVUFBQTtNQUFBLE1BQXVCLE9BQUEsQ0FBUSxJQUFSLENBQXZCLEVBQUUsMkJBQUYsRUFBYztNQUVkLFFBQUEsR0FBVyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQWIsQ0FBQTtNQUNYLElBQUEsQ0FBQSxDQUFrRyxRQUFRLENBQUMsTUFBVCxHQUFrQixDQUFwSCxDQUFBO0FBQUEsZUFBTyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQW5CLENBQThCLElBQUEsR0FBSyxJQUFMLEdBQVUsdUJBQXhDLEVBQWdFO1VBQUEsV0FBQSxFQUFhLEtBQWI7U0FBaEUsRUFBUDs7QUFFQTtXQUFBLDBDQUFBOztRQUVFLElBQUcsT0FBTyxDQUFDLFVBQVIsQ0FBbUIsU0FBbkIsQ0FBSDtBQUNFLG1CQURGOztBQUlBO1VBQ0UsVUFBQSxDQUFXLE9BQVgsRUFBb0IsSUFBcEIsRUFERjtTQUFBLGNBQUE7VUFHRSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQW5CLENBQTRCLElBQTVCLEVBQWtDO1lBQUEsTUFBQSxFQUFRLEtBQVI7WUFBZSxXQUFBLEVBQWEsSUFBNUI7V0FBbEM7QUFDQSxtQkFKRjs7cUJBT0EsSUFBQyxDQUFBLFVBQUQsQ0FBWSxPQUFaO0FBYkY7O0lBTmMsQ0E5R2hCO0lBbUlBLFlBQUEsRUFBYyxTQUFBO0FBQ1osVUFBQTtNQUFBLE1BQXVCLE9BQUEsQ0FBUSxJQUFSLENBQXZCLEVBQUUsMkJBQUYsRUFBYztNQUNaLFVBQVksT0FBQSxDQUFRLE1BQVI7TUFFZCxVQUFBLEdBQWEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBWixDQUFBO01BQ2IsVUFBQSxHQUFhLE9BQUEsQ0FBUSxVQUFSO01BRWIsSUFBRyxVQUFIO0FBRUU7VUFDRSxVQUFBLENBQVcsVUFBWCxFQUF1QixJQUF2QixFQURGO1NBQUEsY0FBQTtVQUVNO1VBQ0osSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFuQixDQUE0QixJQUE1QixFQUFrQztZQUFBLE1BQUEsRUFBUSxLQUFSO1lBQWUsV0FBQSxFQUFhLElBQTVCO1dBQWxDO0FBQ0EsaUJBSkY7O2VBT0EsSUFBQyxDQUFBLFVBQUQsQ0FBWSxVQUFaLEVBVEY7O0lBUFksQ0FuSWQ7SUFxSkEsVUFBQSxFQUFZLFNBQUMsSUFBRDtBQUNWLFVBQUE7TUFBRSxXQUFhLE9BQUEsQ0FBUSxNQUFSO01BR2YsV0FBQSxHQUFjLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFtQixJQUFELEdBQU0sY0FBeEI7TUFDZCxJQUEwRSxXQUExRTtBQUFBLGVBQU8sSUFBQyxDQUFBLFFBQUQsQ0FBVSxXQUFWLEVBQXVCLENBQUUsSUFBRixDQUF2QixFQUFpQyxRQUFBLENBQVMsSUFBVCxDQUFqQyxFQUFpRCxjQUFqRCxFQUFQOztBQUdBLGNBQU8sT0FBTyxDQUFDLFFBQWY7QUFBQSxhQUNPLFFBRFA7aUJBRUksSUFBQyxDQUFBLFFBQUQsQ0FBVSxNQUFWLEVBQWtCLENBQUUsSUFBRixFQUFRLElBQVIsQ0FBbEIsRUFBa0MsUUFBQSxDQUFTLElBQVQsQ0FBbEMsRUFBa0QsUUFBbEQ7QUFGSixhQUdPLE9BSFA7aUJBSUksSUFBQyxDQUFBLFFBQUQsQ0FBVSxVQUFWLEVBQXNCLENBQUUsVUFBQSxHQUFXLElBQWIsQ0FBdEIsRUFBNkMsUUFBQSxDQUFTLElBQVQsQ0FBN0MsRUFBNkQsVUFBN0Q7QUFKSixhQUtPLE9BTFA7VUFNTSxtQkFBcUIsT0FBQSxDQUFRLE9BQVI7VUFDdkIsZ0JBQUEsQ0FBaUIsSUFBakI7aUJBQ0EsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFuQixDQUEyQixJQUFBLEdBQUssSUFBTCxHQUFVLGNBQVYsR0FBdUIsQ0FBQyxRQUFBLENBQVMsSUFBVCxDQUFELENBQXZCLEdBQXVDLG1CQUFsRSxFQUFzRjtZQUFBLFdBQUEsRUFBYSxLQUFiO1dBQXRGO0FBUko7SUFSVSxDQXJKWjtJQXVLQSxVQUFBLEVBQVksU0FBQyxJQUFEO0FBQ1YsVUFBQTtNQUFFLFdBQWEsT0FBQSxDQUFRLE1BQVI7TUFHZixXQUFBLEdBQWMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQW1CLElBQUQsR0FBTSxjQUF4QjtNQUNkLElBQTBFLFdBQTFFO0FBQUEsZUFBTyxJQUFDLENBQUEsUUFBRCxDQUFVLFdBQVYsRUFBdUIsQ0FBRSxJQUFGLENBQXZCLEVBQWlDLFFBQUEsQ0FBUyxJQUFULENBQWpDLEVBQWlELGNBQWpELEVBQVA7O0FBR0EsY0FBTyxPQUFPLENBQUMsUUFBZjtBQUFBLGFBQ08sUUFEUDtpQkFFSSxJQUFDLENBQUEsUUFBRCxDQUFVLE1BQVYsRUFBa0IsQ0FBRSxJQUFGLENBQWxCLEVBQTRCLFFBQUEsQ0FBUyxJQUFULENBQTVCLEVBQTRDLFFBQTVDO0FBRkosYUFHTyxPQUhQO2lCQUlJLElBQUMsQ0FBQSxRQUFELENBQVUsVUFBVixFQUFzQixDQUFFLElBQUYsQ0FBdEIsRUFBZ0MsUUFBQSxDQUFTLElBQVQsQ0FBaEMsRUFBZ0QsVUFBaEQ7QUFKSixhQUtPLE9BTFA7VUFNTSxXQUFhLE9BQUEsQ0FBUSxPQUFSO1VBQ2YsUUFBQSxDQUFTLElBQVQ7aUJBQ0EsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFuQixDQUEyQixJQUFBLEdBQUssSUFBTCxHQUFVLGNBQVYsR0FBdUIsQ0FBQyxRQUFBLENBQVMsSUFBVCxDQUFELENBQXZCLEdBQXVDLG1CQUFsRSxFQUFzRjtZQUFBLFdBQUEsRUFBYSxLQUFiO1dBQXRGO0FBUko7SUFSVSxDQXZLWjtJQXlMQSxRQUFBLEVBQVUsU0FBQyxHQUFELEVBQU0sSUFBTixFQUFZLFFBQVosRUFBc0IsV0FBdEI7QUFDUixVQUFBO01BQUUsUUFBVSxPQUFBLENBQVEsZUFBUjtNQUVaLElBQUEsR0FBTyxLQUFBLENBQU0sR0FBTixFQUFXLElBQVg7TUFFUCxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQVosQ0FBZSxNQUFmLEVBQXVCLFNBQUMsS0FBRDtlQUNyQixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQW5CLENBQTRCLElBQUEsR0FBSyxJQUFMLEdBQVUsTUFBVixHQUFnQixLQUE1QyxFQUFxRDtVQUFBLFdBQUEsRUFBYSxJQUFiO1NBQXJEO01BRHFCLENBQXZCO2FBR0EsSUFBSSxDQUFDLEVBQUwsQ0FBUSxPQUFSLEVBQWlCLFNBQUUsU0FBRjtRQUNmLElBQUcsU0FBQSxLQUFhLENBQWIsSUFBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQW1CLElBQUQsR0FBTSxTQUF4QixDQUF0QjtpQkFDRSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLElBQUEsR0FBSyxJQUFMLEdBQVUsY0FBVixHQUF3QixRQUF4QixHQUFpQyxPQUFqQyxHQUF3QyxXQUFuRSxFQUFrRjtZQUFBLFdBQUEsRUFBYSxLQUFiO1dBQWxGLEVBREY7O01BRGUsQ0FBakI7SUFSUSxDQXpMVjs7QUFIRiIsInNvdXJjZXNDb250ZW50IjpbInsgbmFtZSB9ID0gcmVxdWlyZSBcIi4uL3BhY2thZ2UuanNvblwiXG5cbm1vZHVsZS5leHBvcnRzID0gQnJvd3NlUGFja2FnZXMgPVxuICBjb25maWc6XG4gICAgZmlsZU1hbmFnZXI6XG4gICAgICB0aXRsZTogXCJGaWxlIG1hbmFnZXJcIlxuICAgICAgZGVzY3JpcHRpb246IFwiU3BlY2lmeSB0aGUgZnVsbCBwYXRoIHRvIGEgY3VzdG9tIGZpbGUgbWFuYWdlclwiXG4gICAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgICBkZWZhdWx0OiBcIlwiXG4gICAgbm90aWZ5OlxuICAgICAgdGl0bGU6IFwiVmVyYm9zZSBNb2RlXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlNob3cgaW5mbyBub3RpZmljYXRpb25zIGZvciBhbGwgYWN0aW9uc1wiXG4gICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgc3Vic2NyaXB0aW9uczogbnVsbFxuXG4gIGFjdGl2YXRlOiAtPlxuICAgICMgRXZlbnRzIHN1YnNjcmliZWQgdG8gaW4gQXRvbSdzIHN5c3RlbSBjYW4gYmUgZWFzaWx5IGNsZWFuZWQgdXAgd2l0aCBhIENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSA9IHJlcXVpcmUgXCJhdG9tXCJcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICAjIFJlZ2lzdGVyIGNvbW1hbmQgdGhhdCB0b2dnbGVzIHRoaXMgdmlld1xuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCBcImF0b20td29ya3NwYWNlXCIsIFwiI3tuYW1lfTpjb25maWd1cmF0aW9uLWZvbGRlclwiOiA9PiBAYnJvd3NlQ29uZmlnKClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgXCJhdG9tLXdvcmtzcGFjZVwiLCBcIiN7bmFtZX06cGFja2FnZXMtZm9sZGVyXCI6ID0+IEBicm93c2VQYWNrYWdlcygpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkIFwiYXRvbS13b3Jrc3BhY2VcIiwgXCIje25hbWV9OnByb2plY3QtZm9sZGVyc1wiOiA9PiBAYnJvd3NlUHJvamVjdHMoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCBcImF0b20td29ya3NwYWNlXCIsIFwiI3tuYW1lfTpyZXZlYWwtZmlsZVwiOiA9PiBAcmV2ZWFsRmlsZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkIFwiYXRvbS13b3Jrc3BhY2VcIiwgXCIje25hbWV9OnJldmVhbC1hbGwtb3Blbi1maWxlc1wiOiA9PiBAcmV2ZWFsRmlsZXMoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCBcImF0b20td29ya3NwYWNlXCIsIFwiI3tuYW1lfTpyZXZlYWwtZmlsZS1mcm9tLXRyZWV2aWV3XCI6ID0+IEByZXZlYWxGaWxlRnJvbVRyZWV2aWV3KClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgXCJhdG9tLXdvcmtzcGFjZVwiLCBcIiN7bmFtZX06YXBwbGljYXRpb24tZm9sZGVyXCI6ID0+IEBhcHBGb2xkZXIoKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnM/LmRpc3Bvc2UoKVxuICAgIEBzdWJzY3JpcHRpb25zID0gbnVsbFxuXG4gIGFwcEZvbGRlcjogLT5cbiAgICB7IHBsYXRmb3JtIH0gPSByZXF1aXJlIFwib3NcIlxuICAgIHsgZGlybmFtZSwgam9pbiwgcmVzb2x2ZSB9ID0gcmVxdWlyZSBcInBhdGhcIlxuXG4gICAgcHJvY2Vzc0JpbiA9IHJlc29sdmUgcHJvY2Vzcy5leGVjUGF0aFxuICAgIHByb2Nlc3NQYXRoID0gZGlybmFtZSBwcm9jZXNzQmluXG5cbiAgICBzd2l0Y2ggcGxhdGZvcm0oKVxuICAgICAgd2hlbiBcImRhcndpblwiXG4gICAgICAgIGFwcEZvbGRlciA9IGpvaW4ocHJvY2Vzc1BhdGgsIFwiLi5cIiwgXCIuLlwiLCBcIi4uXCIsIFwiLi5cIilcbiAgICAgIGVsc2VcbiAgICAgICAgYXBwRm9sZGVyID0gcHJvY2Vzc1BhdGhcblxuICAgIEBvcGVuRm9sZGVyKGFwcEZvbGRlcilcblxuICBicm93c2VQYWNrYWdlczogLT5cbiAgICB7IGFjY2Vzc1N5bmMsIEZfT0sgfSA9IHJlcXVpcmUgXCJmc1wiXG5cbiAgICBwYWNrYWdlRGlycyA9IGF0b20ucGFja2FnZXMuZ2V0UGFja2FnZURpclBhdGhzKClcblxuICAgIGZvciBwYWNrYWdlRGlyIGluIHBhY2thZ2VEaXJzXG4gICAgICAjIERvZXMgcGFja2FnZXMgZm9sZGVyIGV4aXN0P1xuICAgICAgdHJ5XG4gICAgICAgIGFjY2Vzc1N5bmMocGFja2FnZURpciwgRl9PSylcbiAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihuYW1lLCBkZXRhaWw6IGVycm9yLCBkaXNtaXNzYWJsZTogdHJ1ZSlcblxuICAgICAgIyBPcGVuIHBhY2thZ2VzIGZvbGRlclxuICAgICAgQG9wZW5Gb2xkZXIocGFja2FnZURpcilcblxuICByZXZlYWxGaWxlOiAtPlxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKClcblxuICAgIGlmIGVkaXRvcj8uY29uc3RydWN0b3IubmFtZSBpcyBcIlRleHRFZGl0b3JcIiBvciBlZGl0b3I/LmNvbnN0cnVjdG9yLm5hbWUgaXMgXCJJbWFnZUVkaXRvclwiXG4gICAgICBmaWxlID0gaWYgZWRpdG9yPy5idWZmZXI/LmZpbGUgdGhlbiBlZGl0b3IuYnVmZmVyLmZpbGUgZWxzZSBpZiBlZGl0b3I/LmZpbGUgdGhlbiBlZGl0b3IuZmlsZVxuICAgICAgXG4gICAgICBpZiBmaWxlPy5wYXRoXG4gICAgICAgIEBzZWxlY3RGaWxlKGZpbGUucGF0aClcbiAgICAgICAgcmV0dXJuXG5cbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcIioqI3tuYW1lfSoqOiBObyBhY3RpdmUgZmlsZVwiLCBkaXNtaXNzYWJsZTogZmFsc2UpXG5cbiAgcmV2ZWFsRmlsZXM6IC0+XG4gICAgZWRpdG9ycyA9IGF0b20ud29ya3NwYWNlLmdldFBhbmVJdGVtcygpXG5cbiAgICBpZiBlZGl0b3JzLmxlbmd0aCA+IDBcbiAgICAgIGNvdW50ID0gMFxuICAgICAgZm9yIGVkaXRvciBpbiBlZGl0b3JzXG4gICAgICAgIGNvbnRpbnVlIHVubGVzcyBlZGl0b3IuY29uc3RydWN0b3IubmFtZSBpcyBcIlRleHRFZGl0b3JcIiBvciBlZGl0b3IuY29uc3RydWN0b3IubmFtZSBpcyBcIkltYWdlRWRpdG9yXCJcblxuICAgICAgICBmaWxlID0gaWYgZWRpdG9yPy5idWZmZXI/LmZpbGUgdGhlbiBlZGl0b3IuYnVmZmVyLmZpbGUgZWxzZSBpZiBlZGl0b3I/LmZpbGUgdGhlbiBlZGl0b3IuZmlsZVxuXG4gICAgICAgIGlmIGZpbGU/LnBhdGhcbiAgICAgICAgICBAc2VsZWN0RmlsZShmaWxlLnBhdGgpXG4gICAgICAgICAgY291bnQrK1xuXG4gICAgICByZXR1cm4gaWYgY291bnQgPiAwXG5cbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcIioqI3tuYW1lfSoqOiBObyBvcGVuIGZpbGVzXCIsIGRpc21pc3NhYmxlOiBmYWxzZSlcblxuXG4gIHJldmVhbEZpbGVGcm9tVHJlZXZpZXc6IC0+XG4gICAgcGFuZXMgPSBhdG9tLndvcmtzcGFjZS5nZXRQYW5lSXRlbXMoKVxuXG4gICAgaWYgcGFuZXMubGVuZ3RoID4gMFxuICAgICAgY291bnQgPSAwXG4gICAgICBmb3IgcGFuZSBpbiBwYW5lc1xuICAgICAgICBjb250aW51ZSB1bmxlc3MgcGFuZS5jb25zdHJ1Y3Rvci5uYW1lIGlzIFwiVHJlZVZpZXdcIlxuXG4gICAgICAgIGZpbGUgPSBwYW5lLnNlbGVjdGVkUGF0aFxuXG4gICAgICAgIGlmIGZpbGU/XG4gICAgICAgICAgQHNlbGVjdEZpbGUoZmlsZSlcbiAgICAgICAgICByZXR1cm5cblxuICAgICAgcmV0dXJuIGlmIGNvdW50ID4gMFxuXG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXCIqKiN7bmFtZX0qKjogTm8gc2VsZWN0ZWQgZmlsZXNcIiwgZGlzbWlzc2FibGU6IGZhbHNlKVxuXG4gIGJyb3dzZVByb2plY3RzOiAtPlxuICAgIHsgYWNjZXNzU3luYywgRl9PSyB9ID0gcmVxdWlyZSBcImZzXCJcblxuICAgIHByb2plY3RzID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClcbiAgICByZXR1cm4gYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXCIqKiN7bmFtZX0qKjogTm8gYWN0aXZlIHByb2plY3RcIiwgZGlzbWlzc2FibGU6IGZhbHNlKSB1bmxlc3MgcHJvamVjdHMubGVuZ3RoID4gMFxuXG4gICAgZm9yIHByb2plY3QgaW4gcHJvamVjdHNcbiAgICAgICMgU2tpcCBBdG9tIGRpYWxvZ3NcbiAgICAgIGlmIHByb2plY3Quc3RhcnRzV2l0aCgnYXRvbTovLycpXG4gICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICMgRG9lcyBwcm9qZWN0IGZvbGRlciBleGlzdD9cbiAgICAgIHRyeVxuICAgICAgICBhY2Nlc3NTeW5jKHByb2plY3QsIEZfT0spXG4gICAgICBjYXRjaFxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IobmFtZSwgZGV0YWlsOiBlcnJvciwgZGlzbWlzc2FibGU6IHRydWUpXG4gICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICMgT3BlbiBwcm9qZWN0IGZvbGRlclxuICAgICAgQG9wZW5Gb2xkZXIocHJvamVjdClcblxuICBicm93c2VDb25maWc6IC0+XG4gICAgeyBhY2Nlc3NTeW5jLCBGX09LIH0gPSByZXF1aXJlIFwiZnNcIlxuICAgIHsgZGlybmFtZSB9ID0gcmVxdWlyZSBcInBhdGhcIlxuXG4gICAgY29uZmlnRmlsZSA9IGF0b20uY29uZmlnLmdldFVzZXJDb25maWdQYXRoKClcbiAgICBjb25maWdQYXRoID0gZGlybmFtZShjb25maWdGaWxlKVxuXG4gICAgaWYgY29uZmlnUGF0aFxuICAgICAgIyBEb2VzIGNvbmZpZyBmb2xkZXIgZXhpc3Q/XG4gICAgICB0cnlcbiAgICAgICAgYWNjZXNzU3luYyhjb25maWdQYXRoLCBGX09LKVxuICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKG5hbWUsIGRldGFpbDogZXJyb3IsIGRpc21pc3NhYmxlOiB0cnVlKVxuICAgICAgICByZXR1cm5cblxuICAgICAgIyBPcGVuIGNvbmZpZyBmb2xkZXJcbiAgICAgIEBvcGVuRm9sZGVyKGNvbmZpZ1BhdGgpXG5cbiAgc2VsZWN0RmlsZTogKHBhdGgpIC0+XG4gICAgeyBiYXNlbmFtZSB9ID0gcmVxdWlyZSBcInBhdGhcIlxuXG4gICAgIyBDdXN0b20gZmlsZSBtYW5hZ2VyXG4gICAgZmlsZU1hbmFnZXIgPSBhdG9tLmNvbmZpZy5nZXQoXCIje25hbWV9LmZpbGVNYW5hZ2VyXCIpXG4gICAgcmV0dXJuIEBzcGF3bkNtZCBmaWxlTWFuYWdlciwgWyBwYXRoIF0sIGJhc2VuYW1lKHBhdGgpLCBcImZpbGUgbWFuYWdlclwiIGlmIGZpbGVNYW5hZ2VyXG5cbiAgICAjIERlZmF1bHQgZmlsZSBtYW5hZ2VyXG4gICAgc3dpdGNoIHByb2Nlc3MucGxhdGZvcm1cbiAgICAgIHdoZW4gXCJkYXJ3aW5cIlxuICAgICAgICBAc3Bhd25DbWQgXCJvcGVuXCIsIFsgXCItUlwiLCBwYXRoIF0sIGJhc2VuYW1lKHBhdGgpLCBcIkZpbmRlclwiXG4gICAgICB3aGVuIFwid2luMzJcIlxuICAgICAgICBAc3Bhd25DbWQgXCJleHBsb3JlclwiLCBbIFwiL3NlbGVjdCwje3BhdGh9XCIgXSwgYmFzZW5hbWUocGF0aCksIFwiRXhwbG9yZXJcIlxuICAgICAgd2hlbiBcImxpbnV4XCJcbiAgICAgICAgeyBzaG93SXRlbUluRm9sZGVyIH0gPSByZXF1aXJlIFwic2hlbGxcIlxuICAgICAgICBzaG93SXRlbUluRm9sZGVyKHBhdGgpXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKFwiKioje25hbWV9Kio6IE9wZW5lZCBgI3tiYXNlbmFtZShwYXRoKX1gIGluIGZpbGUgbWFuYWdlclwiLCBkaXNtaXNzYWJsZTogZmFsc2UpXG5cbiAgb3BlbkZvbGRlcjogKHBhdGgpIC0+XG4gICAgeyBiYXNlbmFtZSB9ID0gcmVxdWlyZSBcInBhdGhcIlxuXG4gICAgIyBDdXN0b20gZmlsZSBtYW5hZ2VyXG4gICAgZmlsZU1hbmFnZXIgPSBhdG9tLmNvbmZpZy5nZXQoXCIje25hbWV9LmZpbGVNYW5hZ2VyXCIpXG4gICAgcmV0dXJuIEBzcGF3bkNtZCBmaWxlTWFuYWdlciwgWyBwYXRoIF0sIGJhc2VuYW1lKHBhdGgpLCBcImZpbGUgbWFuYWdlclwiIGlmIGZpbGVNYW5hZ2VyXG5cbiAgICAjIERlZmF1bHQgZmlsZSBtYW5hZ2VyXG4gICAgc3dpdGNoIHByb2Nlc3MucGxhdGZvcm1cbiAgICAgIHdoZW4gXCJkYXJ3aW5cIlxuICAgICAgICBAc3Bhd25DbWQgXCJvcGVuXCIsIFsgcGF0aCBdLCBiYXNlbmFtZShwYXRoKSwgXCJGaW5kZXJcIlxuICAgICAgd2hlbiBcIndpbjMyXCJcbiAgICAgICAgQHNwYXduQ21kIFwiZXhwbG9yZXJcIiwgWyBwYXRoIF0sIGJhc2VuYW1lKHBhdGgpLCBcIkV4cGxvcmVyXCJcbiAgICAgIHdoZW4gXCJsaW51eFwiXG4gICAgICAgIHsgb3Blbkl0ZW0gfSA9IHJlcXVpcmUgXCJzaGVsbFwiXG4gICAgICAgIG9wZW5JdGVtKHBhdGgpXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKFwiKioje25hbWV9Kio6IE9wZW5lZCBgI3tiYXNlbmFtZShwYXRoKX1gIGluIGZpbGUgbWFuYWdlclwiLCBkaXNtaXNzYWJsZTogZmFsc2UpXG5cbiAgc3Bhd25DbWQ6IChjbWQsIGFyZ3MsIGJhc2VOYW1lLCBmaWxlTWFuYWdlcikgLT5cbiAgICB7IHNwYXduIH0gPSByZXF1aXJlKFwiY2hpbGRfcHJvY2Vzc1wiKVxuXG4gICAgb3BlbiA9IHNwYXduIGNtZCwgYXJnc1xuXG4gICAgb3Blbi5zdGRlcnIub24gXCJkYXRhXCIsIChlcnJvcikgLT5cbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihcIioqI3tuYW1lfSoqOiAje2Vycm9yfVwiLCBkaXNtaXNzYWJsZTogdHJ1ZSlcblxuICAgIG9wZW4ub24gXCJjbG9zZVwiLCAoIGVycm9yQ29kZSApIC0+XG4gICAgICBpZiBlcnJvckNvZGUgaXMgMCBhbmQgYXRvbS5jb25maWcuZ2V0KFwiI3tuYW1lfS5ub3RpZnlcIilcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXCIqKiN7bmFtZX0qKjogT3BlbmVkIGAje2Jhc2VOYW1lfWAgaW4gI3tmaWxlTWFuYWdlcn1cIiwgZGlzbWlzc2FibGU6IGZhbHNlKVxuIl19
