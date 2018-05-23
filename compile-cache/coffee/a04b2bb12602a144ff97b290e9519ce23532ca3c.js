(function() {
  var Browse, name;

  name = require("../package.json").name;

  module.exports = Browse = {
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
      var CompositeDisposable, obj, obj1, obj2, obj3, obj4, obj5, obj6, obj7;
      CompositeDisposable = require("atom").CompositeDisposable;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add("atom-workspace", (
        obj = {},
        obj[name + ":.apm-folder"] = (function(_this) {
          return function() {
            return _this.apmFolder();
          };
        })(this),
        obj
      )));
      this.subscriptions.add(atom.commands.add("atom-workspace", (
        obj1 = {},
        obj1[name + ":application-folder"] = (function(_this) {
          return function() {
            return _this.appFolder();
          };
        })(this),
        obj1
      )));
      this.subscriptions.add(atom.commands.add("atom-workspace", (
        obj2 = {},
        obj2[name + ":configuration-folder"] = (function(_this) {
          return function() {
            return _this.browseConfig();
          };
        })(this),
        obj2
      )));
      this.subscriptions.add(atom.commands.add("atom-workspace", (
        obj3 = {},
        obj3[name + ":packages-folder"] = (function(_this) {
          return function() {
            return _this.browsePackages();
          };
        })(this),
        obj3
      )));
      this.subscriptions.add(atom.commands.add("atom-workspace", (
        obj4 = {},
        obj4[name + ":project-folders"] = (function(_this) {
          return function() {
            return _this.browseProjects();
          };
        })(this),
        obj4
      )));
      this.subscriptions.add(atom.commands.add("atom-workspace", (
        obj5 = {},
        obj5[name + ":reveal-all-open-files"] = (function(_this) {
          return function() {
            return _this.revealFiles();
          };
        })(this),
        obj5
      )));
      this.subscriptions.add(atom.commands.add("atom-workspace", (
        obj6 = {},
        obj6[name + ":reveal-file"] = (function(_this) {
          return function() {
            return _this.revealFile();
          };
        })(this),
        obj6
      )));
      return this.subscriptions.add(atom.commands.add("atom-workspace", (
        obj7 = {},
        obj7[name + ":reveal-file-from-tree-view"] = (function(_this) {
          return function() {
            return _this.revealFileFromTreeview();
          };
        })(this),
        obj7
      )));
    },
    deactivate: function() {
      var ref;
      if ((ref = this.subscriptions) != null) {
        ref.dispose();
      }
      return this.subscriptions = null;
    },
    apmFolder: function() {
      var apmPath, configFile, configPath, dirname, join, ref;
      require("./ga").sendEvent(name, "apm-folder");
      ref = require("path"), dirname = ref.dirname, join = ref.join;
      configFile = atom.config.getUserConfigPath();
      configPath = dirname(configFile);
      apmPath = join(configPath, '.apm');
      if (apmPath) {
        return this.openFolder(apmPath);
      }
    },
    appFolder: function() {
      var appFolder, dirname, join, platform, processBin, processPath, ref, resolve;
      require("./ga").sendEvent(name, "application-folder");
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
      if (appFolder) {
        return this.openFolder(appFolder);
      }
    },
    browsePackages: function() {
      var i, len, packageDir, packageDirs, results;
      require("./ga").sendEvent(name, "packages-folder");
      packageDirs = atom.packages.getPackageDirPaths();
      results = [];
      for (i = 0, len = packageDirs.length; i < len; i++) {
        packageDir = packageDirs[i];
        results.push(this.openFolder(packageDir));
      }
      return results;
    },
    revealFile: function() {
      var editor, file, ref;
      require("./ga").sendEvent(name, "reveal-file");
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
      require("./ga").sendEvent(name, "reveal-all-open-files");
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
      require("./ga").sendEvent(name, "reveal-file-from-tree-view");
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
      var i, len, projectPath, projectPaths, results;
      require("./ga").sendEvent(name, "project-folders");
      projectPaths = atom.project.getPaths();
      if (!(projectPaths.length > 0)) {
        return atom.notifications.addWarning("**" + name + "**: No active project", {
          dismissable: false
        });
      }
      results = [];
      for (i = 0, len = projectPaths.length; i < len; i++) {
        projectPath = projectPaths[i];
        if (projectPath.startsWith('atom://')) {
          continue;
        }
        results.push(this.openFolder(projectPath));
      }
      return results;
    },
    browseConfig: function() {
      var configFile, configPath, dirname;
      require("./ga").sendEvent(name, "configuration-folder");
      dirname = require("path").dirname;
      configFile = atom.config.getUserConfigPath();
      configPath = dirname(configFile);
      if (configPath) {
        return this.openFolder(configPath);
      }
    },
    selectFile: function(path) {
      var basename, fileManager, shell;
      require("./ga").sendEvent(name, "configuration-folder");
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
          shell = require("electron").shell;
          shell.showItemInFolder(path);
          if (atom.config.get(name + ".notify")) {
            return atom.notifications.addInfo("**" + name + "**: Opening `" + (basename(path)) + "` in file manager", {
              dismissable: false
            });
          }
      }
    },
    openFolder: function(path) {
      var F_OK, access, basename, ref;
      ref = require("fs"), access = ref.access, F_OK = ref.F_OK;
      basename = require("path").basename;
      return access(path, F_OK, function(error) {
        var fileManager, shell;
        if (error) {
          return atom.notifications.addError(name, {
            detail: error,
            dismissable: true
          });
        }
        fileManager = atom.config.get(name + ".fileManager");
        if (fileManager) {
          return Browse.spawnCmd(fileManager, [path], basename(path), "file manager");
        }
        switch (process.platform) {
          case "darwin":
            return Browse.spawnCmd("open", [path], basename(path), "Finder");
          case "win32":
            return Browse.spawnCmd("explorer", [path], basename(path), "Explorer");
          case "linux":
            shell = require("electron").shell;
            shell.openItem(path);
            if (atom.config.get(name + ".notify")) {
              return atom.notifications.addInfo("**" + name + "**: Opening `" + (basename(path)) + "` in file manager", {
                dismissable: false
              });
            }
        }
      });
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
          return atom.notifications.addInfo("**" + name + "**: Opening `" + baseName + "` in " + fileManager, {
            dismissable: false
          });
        }
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2Jyb3dzZS9saWIvYnJvd3NlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUUsT0FBUyxPQUFBLENBQVEsaUJBQVI7O0VBRVgsTUFBTSxDQUFDLE9BQVAsR0FBaUIsTUFBQSxHQUNmO0lBQUEsTUFBQSxFQUNFO01BQUEsV0FBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLGNBQVA7UUFDQSxXQUFBLEVBQWEsZ0RBRGI7UUFFQSxJQUFBLEVBQU0sUUFGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFIVDtPQURGO01BS0EsTUFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLGNBQVA7UUFDQSxXQUFBLEVBQWEseUNBRGI7UUFFQSxJQUFBLEVBQU0sU0FGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtPQU5GO0tBREY7SUFXQSxhQUFBLEVBQWUsSUFYZjtJQWFBLFFBQUEsRUFBVSxTQUFBO0FBRVIsVUFBQTtNQUFFLHNCQUF3QixPQUFBLENBQVEsTUFBUjtNQUMxQixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BR3JCLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DO2NBQUEsRUFBQTtZQUFHLElBQUQsR0FBTSxrQkFBZSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxTQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkI7O09BQXBDLENBQW5CO01BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0M7ZUFBQSxFQUFBO2FBQUcsSUFBRCxHQUFNLHlCQUFzQixDQUFBLFNBQUEs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QUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLElBQUEsR0FBSyxJQUFMLEdBQVUsZUFBVixHQUF5QixRQUF6QixHQUFrQyxPQUFsQyxHQUF5QyxXQUFwRSxFQUFtRjtZQUFBLFdBQUEsRUFBYSxLQUFiO1dBQW5GLEVBREY7O01BRGUsQ0FBakI7SUFSUSxDQTVMVjs7QUFIRiIsInNvdXJjZXNDb250ZW50IjpbInsgbmFtZSB9ID0gcmVxdWlyZSBcIi4uL3BhY2thZ2UuanNvblwiXG5cbm1vZHVsZS5leHBvcnRzID0gQnJvd3NlID1cbiAgY29uZmlnOlxuICAgIGZpbGVNYW5hZ2VyOlxuICAgICAgdGl0bGU6IFwiRmlsZSBtYW5hZ2VyXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlNwZWNpZnkgdGhlIGZ1bGwgcGF0aCB0byBhIGN1c3RvbSBmaWxlIG1hbmFnZXJcIlxuICAgICAgdHlwZTogXCJzdHJpbmdcIlxuICAgICAgZGVmYXVsdDogXCJcIlxuICAgIG5vdGlmeTpcbiAgICAgIHRpdGxlOiBcIlZlcmJvc2UgTW9kZVwiXG4gICAgICBkZXNjcmlwdGlvbjogXCJTaG93IGluZm8gbm90aWZpY2F0aW9ucyBmb3IgYWxsIGFjdGlvbnNcIlxuICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gIHN1YnNjcmlwdGlvbnM6IG51bGxcblxuICBhY3RpdmF0ZTogLT5cbiAgICAjIEV2ZW50cyBzdWJzY3JpYmVkIHRvIGluIEF0b20ncyBzeXN0ZW0gY2FuIGJlIGVhc2lseSBjbGVhbmVkIHVwIHdpdGggYSBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gPSByZXF1aXJlIFwiYXRvbVwiXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG4gICAgIyBSZWdpc3RlciBjb21tYW5kIHRoYXQgdG9nZ2xlcyB0aGlzIHZpZXdcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgXCJhdG9tLXdvcmtzcGFjZVwiLCBcIiN7bmFtZX06LmFwbS1mb2xkZXJcIjogPT4gQGFwbUZvbGRlcigpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkIFwiYXRvbS13b3Jrc3BhY2VcIiwgXCIje25hbWV9OmFwcGxpY2F0aW9uLWZvbGRlclwiOiA9PiBAYXBwRm9sZGVyKClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgXCJhdG9tLXdvcmtzcGFjZVwiLCBcIiN7bmFtZX06Y29uZmlndXJhdGlvbi1mb2xkZXJcIjogPT4gQGJyb3dzZUNvbmZpZygpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkIFwiYXRvbS13b3Jrc3BhY2VcIiwgXCIje25hbWV9OnBhY2thZ2VzLWZvbGRlclwiOiA9PiBAYnJvd3NlUGFja2FnZXMoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCBcImF0b20td29ya3NwYWNlXCIsIFwiI3tuYW1lfTpwcm9qZWN0LWZvbGRlcnNcIjogPT4gQGJyb3dzZVByb2plY3RzKClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgXCJhdG9tLXdvcmtzcGFjZVwiLCBcIiN7bmFtZX06cmV2ZWFsLWFsbC1vcGVuLWZpbGVzXCI6ID0+IEByZXZlYWxGaWxlcygpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkIFwiYXRvbS13b3Jrc3BhY2VcIiwgXCIje25hbWV9OnJldmVhbC1maWxlXCI6ID0+IEByZXZlYWxGaWxlKClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgXCJhdG9tLXdvcmtzcGFjZVwiLCBcIiN7bmFtZX06cmV2ZWFsLWZpbGUtZnJvbS10cmVlLXZpZXdcIjogPT4gQHJldmVhbEZpbGVGcm9tVHJlZXZpZXcoKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnM/LmRpc3Bvc2UoKVxuICAgIEBzdWJzY3JpcHRpb25zID0gbnVsbFxuXG4gIGFwbUZvbGRlcjogLT5cbiAgICByZXF1aXJlKFwiLi9nYVwiKS5zZW5kRXZlbnQgbmFtZSwgXCJhcG0tZm9sZGVyXCJcblxuICAgIHsgZGlybmFtZSwgam9pbiB9ID0gcmVxdWlyZSBcInBhdGhcIlxuXG4gICAgY29uZmlnRmlsZSA9IGF0b20uY29uZmlnLmdldFVzZXJDb25maWdQYXRoKClcbiAgICBjb25maWdQYXRoID0gZGlybmFtZShjb25maWdGaWxlKVxuICAgIGFwbVBhdGggPSBqb2luKGNvbmZpZ1BhdGgsICcuYXBtJylcblxuICAgIEBvcGVuRm9sZGVyKGFwbVBhdGgpIGlmIGFwbVBhdGhcblxuICBhcHBGb2xkZXI6IC0+XG4gICAgcmVxdWlyZShcIi4vZ2FcIikuc2VuZEV2ZW50IG5hbWUsIFwiYXBwbGljYXRpb24tZm9sZGVyXCJcblxuICAgIHsgcGxhdGZvcm0gfSA9IHJlcXVpcmUgXCJvc1wiXG4gICAgeyBkaXJuYW1lLCBqb2luLCByZXNvbHZlIH0gPSByZXF1aXJlIFwicGF0aFwiXG5cbiAgICBwcm9jZXNzQmluID0gcmVzb2x2ZSBwcm9jZXNzLmV4ZWNQYXRoXG4gICAgcHJvY2Vzc1BhdGggPSBkaXJuYW1lIHByb2Nlc3NCaW5cblxuICAgIHN3aXRjaCBwbGF0Zm9ybSgpXG4gICAgICB3aGVuIFwiZGFyd2luXCJcbiAgICAgICAgYXBwRm9sZGVyID0gam9pbihwcm9jZXNzUGF0aCwgXCIuLlwiLCBcIi4uXCIsIFwiLi5cIiwgXCIuLlwiKVxuICAgICAgZWxzZVxuICAgICAgICBhcHBGb2xkZXIgPSBwcm9jZXNzUGF0aFxuXG4gICAgQG9wZW5Gb2xkZXIoYXBwRm9sZGVyKSBpZiBhcHBGb2xkZXJcblxuICBicm93c2VQYWNrYWdlczogLT5cbiAgICByZXF1aXJlKFwiLi9nYVwiKS5zZW5kRXZlbnQgbmFtZSwgXCJwYWNrYWdlcy1mb2xkZXJcIlxuXG5cbiAgICBwYWNrYWdlRGlycyA9IGF0b20ucGFja2FnZXMuZ2V0UGFja2FnZURpclBhdGhzKClcblxuICAgIGZvciBwYWNrYWdlRGlyIGluIHBhY2thZ2VEaXJzXG4gICAgICBAb3BlbkZvbGRlcihwYWNrYWdlRGlyKVxuXG4gIHJldmVhbEZpbGU6IC0+XG4gICAgcmVxdWlyZShcIi4vZ2FcIikuc2VuZEV2ZW50IG5hbWUsIFwicmV2ZWFsLWZpbGVcIlxuXG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKVxuXG4gICAgaWYgZWRpdG9yPy5jb25zdHJ1Y3Rvci5uYW1lIGlzIFwiVGV4dEVkaXRvclwiIG9yIGVkaXRvcj8uY29uc3RydWN0b3IubmFtZSBpcyBcIkltYWdlRWRpdG9yXCJcbiAgICAgIGZpbGUgPSBpZiBlZGl0b3I/LmJ1ZmZlcj8uZmlsZSB0aGVuIGVkaXRvci5idWZmZXIuZmlsZSBlbHNlIGlmIGVkaXRvcj8uZmlsZSB0aGVuIGVkaXRvci5maWxlXG5cbiAgICAgIGlmIGZpbGU/LnBhdGhcbiAgICAgICAgQHNlbGVjdEZpbGUoZmlsZS5wYXRoKVxuICAgICAgICByZXR1cm5cblxuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFwiKioje25hbWV9Kio6IE5vIGFjdGl2ZSBmaWxlXCIsIGRpc21pc3NhYmxlOiBmYWxzZSlcblxuICByZXZlYWxGaWxlczogLT5cbiAgICByZXF1aXJlKFwiLi9nYVwiKS5zZW5kRXZlbnQgbmFtZSwgXCJyZXZlYWwtYWxsLW9wZW4tZmlsZXNcIlxuXG4gICAgZWRpdG9ycyA9IGF0b20ud29ya3NwYWNlLmdldFBhbmVJdGVtcygpXG5cbiAgICBpZiBlZGl0b3JzLmxlbmd0aCA+IDBcbiAgICAgIGNvdW50ID0gMFxuICAgICAgZm9yIGVkaXRvciBpbiBlZGl0b3JzXG4gICAgICAgIGNvbnRpbnVlIHVubGVzcyBlZGl0b3IuY29uc3RydWN0b3IubmFtZSBpcyBcIlRleHRFZGl0b3JcIiBvciBlZGl0b3IuY29uc3RydWN0b3IubmFtZSBpcyBcIkltYWdlRWRpdG9yXCJcblxuICAgICAgICBmaWxlID0gaWYgZWRpdG9yPy5idWZmZXI/LmZpbGUgdGhlbiBlZGl0b3IuYnVmZmVyLmZpbGUgZWxzZSBpZiBlZGl0b3I/LmZpbGUgdGhlbiBlZGl0b3IuZmlsZVxuXG4gICAgICAgIGlmIGZpbGU/LnBhdGhcbiAgICAgICAgICBAc2VsZWN0RmlsZShmaWxlLnBhdGgpXG4gICAgICAgICAgY291bnQrK1xuXG4gICAgICByZXR1cm4gaWYgY291bnQgPiAwXG5cbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcIioqI3tuYW1lfSoqOiBObyBvcGVuIGZpbGVzXCIsIGRpc21pc3NhYmxlOiBmYWxzZSlcblxuICByZXZlYWxGaWxlRnJvbVRyZWV2aWV3OiAtPlxuICAgIHJlcXVpcmUoXCIuL2dhXCIpLnNlbmRFdmVudCBuYW1lLCBcInJldmVhbC1maWxlLWZyb20tdHJlZS12aWV3XCJcblxuICAgIHBhbmVzID0gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZUl0ZW1zKClcblxuICAgIGlmIHBhbmVzLmxlbmd0aCA+IDBcbiAgICAgIGNvdW50ID0gMFxuICAgICAgZm9yIHBhbmUgaW4gcGFuZXNcbiAgICAgICAgY29udGludWUgdW5sZXNzIHBhbmUuY29uc3RydWN0b3IubmFtZSBpcyBcIlRyZWVWaWV3XCJcblxuICAgICAgICBmaWxlID0gcGFuZS5zZWxlY3RlZFBhdGhcblxuICAgICAgICBpZiBmaWxlP1xuICAgICAgICAgIEBzZWxlY3RGaWxlKGZpbGUpXG4gICAgICAgICAgcmV0dXJuXG5cbiAgICAgIHJldHVybiBpZiBjb3VudCA+IDBcblxuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFwiKioje25hbWV9Kio6IE5vIHNlbGVjdGVkIGZpbGVzXCIsIGRpc21pc3NhYmxlOiBmYWxzZSlcblxuICBicm93c2VQcm9qZWN0czogLT5cbiAgICByZXF1aXJlKFwiLi9nYVwiKS5zZW5kRXZlbnQgbmFtZSwgXCJwcm9qZWN0LWZvbGRlcnNcIlxuXG5cbiAgICBwcm9qZWN0UGF0aHMgPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVxuICAgIHJldHVybiBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcIioqI3tuYW1lfSoqOiBObyBhY3RpdmUgcHJvamVjdFwiLCBkaXNtaXNzYWJsZTogZmFsc2UpIHVubGVzcyBwcm9qZWN0UGF0aHMubGVuZ3RoID4gMFxuXG4gICAgZm9yIHByb2plY3RQYXRoIGluIHByb2plY3RQYXRoc1xuICAgICAgIyBTa2lwIEF0b20gZGlhbG9nc1xuICAgICAgY29udGludWUgaWYgcHJvamVjdFBhdGguc3RhcnRzV2l0aCgnYXRvbTovLycpXG5cbiAgICAgIEBvcGVuRm9sZGVyKHByb2plY3RQYXRoKVxuXG4gIGJyb3dzZUNvbmZpZzogLT5cbiAgICByZXF1aXJlKFwiLi9nYVwiKS5zZW5kRXZlbnQgbmFtZSwgXCJjb25maWd1cmF0aW9uLWZvbGRlclwiXG5cbiAgICB7IGRpcm5hbWUgfSA9IHJlcXVpcmUgXCJwYXRoXCJcblxuICAgIGNvbmZpZ0ZpbGUgPSBhdG9tLmNvbmZpZy5nZXRVc2VyQ29uZmlnUGF0aCgpXG4gICAgY29uZmlnUGF0aCA9IGRpcm5hbWUoY29uZmlnRmlsZSlcblxuICAgIEBvcGVuRm9sZGVyKGNvbmZpZ1BhdGgpIGlmIGNvbmZpZ1BhdGhcblxuICBzZWxlY3RGaWxlOiAocGF0aCkgLT5cbiAgICByZXF1aXJlKFwiLi9nYVwiKS5zZW5kRXZlbnQgbmFtZSwgXCJjb25maWd1cmF0aW9uLWZvbGRlclwiXG5cbiAgICB7IGJhc2VuYW1lIH0gPSByZXF1aXJlIFwicGF0aFwiXG5cbiAgICAjIEN1c3RvbSBmaWxlIG1hbmFnZXJcbiAgICBmaWxlTWFuYWdlciA9IGF0b20uY29uZmlnLmdldChcIiN7bmFtZX0uZmlsZU1hbmFnZXJcIilcbiAgICByZXR1cm4gQHNwYXduQ21kIGZpbGVNYW5hZ2VyLCBbIHBhdGggXSwgYmFzZW5hbWUocGF0aCksIFwiZmlsZSBtYW5hZ2VyXCIgaWYgZmlsZU1hbmFnZXJcblxuICAgICMgRGVmYXVsdCBmaWxlIG1hbmFnZXJcbiAgICBzd2l0Y2ggcHJvY2Vzcy5wbGF0Zm9ybVxuICAgICAgd2hlbiBcImRhcndpblwiXG4gICAgICAgIEBzcGF3bkNtZCBcIm9wZW5cIiwgWyBcIi1SXCIsIHBhdGggXSwgYmFzZW5hbWUocGF0aCksIFwiRmluZGVyXCJcbiAgICAgIHdoZW4gXCJ3aW4zMlwiXG4gICAgICAgIEBzcGF3bkNtZCBcImV4cGxvcmVyXCIsIFsgXCIvc2VsZWN0LCN7cGF0aH1cIiBdLCBiYXNlbmFtZShwYXRoKSwgXCJFeHBsb3JlclwiXG4gICAgICB3aGVuIFwibGludXhcIlxuICAgICAgICB7IHNoZWxsIH0gPSByZXF1aXJlIFwiZWxlY3Ryb25cIlxuICAgICAgICBzaGVsbC5zaG93SXRlbUluRm9sZGVyKHBhdGgpXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKFwiKioje25hbWV9Kio6IE9wZW5pbmcgYCN7YmFzZW5hbWUocGF0aCl9YCBpbiBmaWxlIG1hbmFnZXJcIiwgZGlzbWlzc2FibGU6IGZhbHNlKSBpZiBhdG9tLmNvbmZpZy5nZXQoXCIje25hbWV9Lm5vdGlmeVwiKVxuXG4gIG9wZW5Gb2xkZXI6IChwYXRoKSAtPlxuICAgIHsgYWNjZXNzLCBGX09LIH0gPSByZXF1aXJlIFwiZnNcIlxuICAgIHsgYmFzZW5hbWUgfSA9IHJlcXVpcmUgXCJwYXRoXCJcblxuICAgIGFjY2VzcyBwYXRoLCBGX09LLCAoZXJyb3IpIC0+XG4gICAgICByZXR1cm4gYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKG5hbWUsIGRldGFpbDogZXJyb3IsIGRpc21pc3NhYmxlOiB0cnVlKSBpZiBlcnJvclxuXG4gICAgICAjIEN1c3RvbSBmaWxlIG1hbmFnZXJcbiAgICAgIGZpbGVNYW5hZ2VyID0gYXRvbS5jb25maWcuZ2V0KFwiI3tuYW1lfS5maWxlTWFuYWdlclwiKVxuICAgICAgcmV0dXJuIEJyb3dzZS5zcGF3bkNtZCBmaWxlTWFuYWdlciwgWyBwYXRoIF0sIGJhc2VuYW1lKHBhdGgpLCBcImZpbGUgbWFuYWdlclwiIGlmIGZpbGVNYW5hZ2VyXG5cbiAgICAgICMgRGVmYXVsdCBmaWxlIG1hbmFnZXJcbiAgICAgIHN3aXRjaCBwcm9jZXNzLnBsYXRmb3JtXG4gICAgICAgIHdoZW4gXCJkYXJ3aW5cIlxuICAgICAgICAgIEJyb3dzZS5zcGF3bkNtZCBcIm9wZW5cIiwgWyBwYXRoIF0sIGJhc2VuYW1lKHBhdGgpLCBcIkZpbmRlclwiXG4gICAgICAgIHdoZW4gXCJ3aW4zMlwiXG4gICAgICAgICAgQnJvd3NlLnNwYXduQ21kIFwiZXhwbG9yZXJcIiwgWyBwYXRoIF0sIGJhc2VuYW1lKHBhdGgpLCBcIkV4cGxvcmVyXCJcbiAgICAgICAgd2hlbiBcImxpbnV4XCJcbiAgICAgICAgICB7IHNoZWxsIH0gPSByZXF1aXJlIFwiZWxlY3Ryb25cIlxuICAgICAgICAgIHNoZWxsLm9wZW5JdGVtKHBhdGgpXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXCIqKiN7bmFtZX0qKjogT3BlbmluZyBgI3tiYXNlbmFtZShwYXRoKX1gIGluIGZpbGUgbWFuYWdlclwiLCBkaXNtaXNzYWJsZTogZmFsc2UpIGlmIGF0b20uY29uZmlnLmdldChcIiN7bmFtZX0ubm90aWZ5XCIpXG5cbiAgc3Bhd25DbWQ6IChjbWQsIGFyZ3MsIGJhc2VOYW1lLCBmaWxlTWFuYWdlcikgLT5cbiAgICB7IHNwYXduIH0gPSByZXF1aXJlKFwiY2hpbGRfcHJvY2Vzc1wiKVxuXG4gICAgb3BlbiA9IHNwYXduIGNtZCwgYXJnc1xuXG4gICAgb3Blbi5zdGRlcnIub24gXCJkYXRhXCIsIChlcnJvcikgLT5cbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihcIioqI3tuYW1lfSoqOiAje2Vycm9yfVwiLCBkaXNtaXNzYWJsZTogdHJ1ZSlcblxuICAgIG9wZW4ub24gXCJjbG9zZVwiLCAoIGVycm9yQ29kZSApIC0+XG4gICAgICBpZiBlcnJvckNvZGUgaXMgMCBhbmQgYXRvbS5jb25maWcuZ2V0KFwiI3tuYW1lfS5ub3RpZnlcIilcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXCIqKiN7bmFtZX0qKjogT3BlbmluZyBgI3tiYXNlTmFtZX1gIGluICN7ZmlsZU1hbmFnZXJ9XCIsIGRpc21pc3NhYmxlOiBmYWxzZSlcbiJdfQ==
