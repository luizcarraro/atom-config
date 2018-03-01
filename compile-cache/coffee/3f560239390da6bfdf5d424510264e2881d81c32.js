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
      return this.openFolder(appFolder);
    },
    browsePackages: function() {
      var F_OK, accessSync, error, i, len, packageDir, packageDirs, ref, results;
      require("./ga").sendEvent(name, "packages-folder");
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
      require("./ga").sendEvent(name, "reveal-file-from-treeview");
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
      require("./ga").sendEvent(name, "project-folders");
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
      require("./ga").sendEvent(name, "configuration-folder");
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2Jyb3dzZS9saWIvYnJvd3NlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUUsT0FBUyxPQUFBLENBQVEsaUJBQVI7O0VBRVgsTUFBTSxDQUFDLE9BQVAsR0FBaUIsY0FBQSxHQUNmO0lBQUEsTUFBQSxFQUNFO01BQUEsV0FBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLGNBQVA7UUFDQSxXQUFBLEVBQWEsZ0RBRGI7UUFFQSxJQUFBLEVBQU0sUUFGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFIVDtPQURGO01BS0EsTUFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLGNBQVA7UUFDQSxXQUFBLEVBQWEseUNBRGI7UUFFQSxJQUFBLEVBQU0sU0FGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtPQU5GO0tBREY7SUFXQSxhQUFBLEVBQWUsSUFYZjtJQWFBLFFBQUEsRUFBVSxTQUFBO0FBRVIsVUFBQTtNQUFFLHNCQUF3QixPQUFBLENBQVEsTUFBUjtNQUMxQixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BR3JCLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DO2NBQUEsRUFBQTtZQUFHLElBQUQsR0FBTSwyQkFBd0IsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsWUFBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhDOztPQUFwQyxDQUFuQjtNQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DO2VBQUEsRUFBQTthQUFHLElBQUQsR0FBTSxzQkFBbUIsQ0FBQSxTQUFB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QUwsR0FBVSxjQUFWLEdBQXVCLENBQUMsUUFBQSxDQUFTLElBQVQsQ0FBRCxDQUF2QixHQUF1QyxtQkFBbEUsRUFBc0Y7WUFBQSxXQUFBLEVBQWEsS0FBYjtXQUF0RjtBQVJKO0lBUlUsQ0F0TFo7SUF3TUEsUUFBQSxFQUFVLFNBQUMsR0FBRCxFQUFNLElBQU4sRUFBWSxRQUFaLEVBQXNCLFdBQXRCO0FBQ1IsVUFBQTtNQUFFLFFBQVUsT0FBQSxDQUFRLGVBQVI7TUFFWixJQUFBLEdBQU8sS0FBQSxDQUFNLEdBQU4sRUFBVyxJQUFYO01BRVAsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFaLENBQWUsTUFBZixFQUF1QixTQUFDLEtBQUQ7ZUFDckIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFuQixDQUE0QixJQUFBLEdBQUssSUFBTCxHQUFVLE1BQVYsR0FBZ0IsS0FBNUMsRUFBcUQ7VUFBQSxXQUFBLEVBQWEsSUFBYjtTQUFyRDtNQURxQixDQUF2QjthQUdBLElBQUksQ0FBQyxFQUFMLENBQVEsT0FBUixFQUFpQixTQUFFLFNBQUY7UUFDZixJQUFHLFNBQUEsS0FBYSxDQUFiLElBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFtQixJQUFELEdBQU0sU0FBeEIsQ0FBdEI7aUJBQ0UsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFuQixDQUEyQixJQUFBLEdBQUssSUFBTCxHQUFVLGNBQVYsR0FBd0IsUUFBeEIsR0FBaUMsT0FBakMsR0FBd0MsV0FBbkUsRUFBa0Y7WUFBQSxXQUFBLEVBQWEsS0FBYjtXQUFsRixFQURGOztNQURlLENBQWpCO0lBUlEsQ0F4TVY7O0FBSEYiLCJzb3VyY2VzQ29udGVudCI6WyJ7IG5hbWUgfSA9IHJlcXVpcmUgXCIuLi9wYWNrYWdlLmpzb25cIlxuXG5tb2R1bGUuZXhwb3J0cyA9IEJyb3dzZVBhY2thZ2VzID1cbiAgY29uZmlnOlxuICAgIGZpbGVNYW5hZ2VyOlxuICAgICAgdGl0bGU6IFwiRmlsZSBtYW5hZ2VyXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlNwZWNpZnkgdGhlIGZ1bGwgcGF0aCB0byBhIGN1c3RvbSBmaWxlIG1hbmFnZXJcIlxuICAgICAgdHlwZTogXCJzdHJpbmdcIlxuICAgICAgZGVmYXVsdDogXCJcIlxuICAgIG5vdGlmeTpcbiAgICAgIHRpdGxlOiBcIlZlcmJvc2UgTW9kZVwiXG4gICAgICBkZXNjcmlwdGlvbjogXCJTaG93IGluZm8gbm90aWZpY2F0aW9ucyBmb3IgYWxsIGFjdGlvbnNcIlxuICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gIHN1YnNjcmlwdGlvbnM6IG51bGxcblxuICBhY3RpdmF0ZTogLT5cbiAgICAjIEV2ZW50cyBzdWJzY3JpYmVkIHRvIGluIEF0b20ncyBzeXN0ZW0gY2FuIGJlIGVhc2lseSBjbGVhbmVkIHVwIHdpdGggYSBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gPSByZXF1aXJlIFwiYXRvbVwiXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG4gICAgIyBSZWdpc3RlciBjb21tYW5kIHRoYXQgdG9nZ2xlcyB0aGlzIHZpZXdcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgXCJhdG9tLXdvcmtzcGFjZVwiLCBcIiN7bmFtZX06Y29uZmlndXJhdGlvbi1mb2xkZXJcIjogPT4gQGJyb3dzZUNvbmZpZygpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkIFwiYXRvbS13b3Jrc3BhY2VcIiwgXCIje25hbWV9OnBhY2thZ2VzLWZvbGRlclwiOiA9PiBAYnJvd3NlUGFja2FnZXMoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCBcImF0b20td29ya3NwYWNlXCIsIFwiI3tuYW1lfTpwcm9qZWN0LWZvbGRlcnNcIjogPT4gQGJyb3dzZVByb2plY3RzKClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgXCJhdG9tLXdvcmtzcGFjZVwiLCBcIiN7bmFtZX06cmV2ZWFsLWZpbGVcIjogPT4gQHJldmVhbEZpbGUoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCBcImF0b20td29ya3NwYWNlXCIsIFwiI3tuYW1lfTpyZXZlYWwtYWxsLW9wZW4tZmlsZXNcIjogPT4gQHJldmVhbEZpbGVzKClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgXCJhdG9tLXdvcmtzcGFjZVwiLCBcIiN7bmFtZX06cmV2ZWFsLWZpbGUtZnJvbS10cmVldmlld1wiOiA9PiBAcmV2ZWFsRmlsZUZyb21UcmVldmlldygpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkIFwiYXRvbS13b3Jrc3BhY2VcIiwgXCIje25hbWV9OmFwcGxpY2F0aW9uLWZvbGRlclwiOiA9PiBAYXBwRm9sZGVyKClcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zPy5kaXNwb3NlKClcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG51bGxcblxuICBhcHBGb2xkZXI6IC0+XG4gICAgcmVxdWlyZShcIi4vZ2FcIikuc2VuZEV2ZW50IG5hbWUsIFwiYXBwbGljYXRpb24tZm9sZGVyXCJcblxuICAgIHsgcGxhdGZvcm0gfSA9IHJlcXVpcmUgXCJvc1wiXG4gICAgeyBkaXJuYW1lLCBqb2luLCByZXNvbHZlIH0gPSByZXF1aXJlIFwicGF0aFwiXG5cbiAgICBwcm9jZXNzQmluID0gcmVzb2x2ZSBwcm9jZXNzLmV4ZWNQYXRoXG4gICAgcHJvY2Vzc1BhdGggPSBkaXJuYW1lIHByb2Nlc3NCaW5cblxuICAgIHN3aXRjaCBwbGF0Zm9ybSgpXG4gICAgICB3aGVuIFwiZGFyd2luXCJcbiAgICAgICAgYXBwRm9sZGVyID0gam9pbihwcm9jZXNzUGF0aCwgXCIuLlwiLCBcIi4uXCIsIFwiLi5cIiwgXCIuLlwiKVxuICAgICAgZWxzZVxuICAgICAgICBhcHBGb2xkZXIgPSBwcm9jZXNzUGF0aFxuXG4gICAgQG9wZW5Gb2xkZXIoYXBwRm9sZGVyKVxuXG4gIGJyb3dzZVBhY2thZ2VzOiAtPlxuICAgIHJlcXVpcmUoXCIuL2dhXCIpLnNlbmRFdmVudCBuYW1lLCBcInBhY2thZ2VzLWZvbGRlclwiXG5cbiAgICB7IGFjY2Vzc1N5bmMsIEZfT0sgfSA9IHJlcXVpcmUgXCJmc1wiXG5cbiAgICBwYWNrYWdlRGlycyA9IGF0b20ucGFja2FnZXMuZ2V0UGFja2FnZURpclBhdGhzKClcblxuICAgIGZvciBwYWNrYWdlRGlyIGluIHBhY2thZ2VEaXJzXG4gICAgICAjIERvZXMgcGFja2FnZXMgZm9sZGVyIGV4aXN0P1xuICAgICAgdHJ5XG4gICAgICAgIGFjY2Vzc1N5bmMocGFja2FnZURpciwgRl9PSylcbiAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihuYW1lLCBkZXRhaWw6IGVycm9yLCBkaXNtaXNzYWJsZTogdHJ1ZSlcblxuICAgICAgIyBPcGVuIHBhY2thZ2VzIGZvbGRlclxuICAgICAgQG9wZW5Gb2xkZXIocGFja2FnZURpcilcblxuICByZXZlYWxGaWxlOiAtPlxuICAgIHJlcXVpcmUoXCIuL2dhXCIpLnNlbmRFdmVudCBuYW1lLCBcInJldmVhbC1maWxlXCJcblxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKClcblxuICAgIGlmIGVkaXRvcj8uY29uc3RydWN0b3IubmFtZSBpcyBcIlRleHRFZGl0b3JcIiBvciBlZGl0b3I/LmNvbnN0cnVjdG9yLm5hbWUgaXMgXCJJbWFnZUVkaXRvclwiXG4gICAgICBmaWxlID0gaWYgZWRpdG9yPy5idWZmZXI/LmZpbGUgdGhlbiBlZGl0b3IuYnVmZmVyLmZpbGUgZWxzZSBpZiBlZGl0b3I/LmZpbGUgdGhlbiBlZGl0b3IuZmlsZVxuXG4gICAgICBpZiBmaWxlPy5wYXRoXG4gICAgICAgIEBzZWxlY3RGaWxlKGZpbGUucGF0aClcbiAgICAgICAgcmV0dXJuXG5cbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcIioqI3tuYW1lfSoqOiBObyBhY3RpdmUgZmlsZVwiLCBkaXNtaXNzYWJsZTogZmFsc2UpXG5cbiAgcmV2ZWFsRmlsZXM6IC0+XG4gICAgcmVxdWlyZShcIi4vZ2FcIikuc2VuZEV2ZW50IG5hbWUsIFwicmV2ZWFsLWFsbC1vcGVuLWZpbGVzXCJcblxuICAgIGVkaXRvcnMgPSBhdG9tLndvcmtzcGFjZS5nZXRQYW5lSXRlbXMoKVxuXG4gICAgaWYgZWRpdG9ycy5sZW5ndGggPiAwXG4gICAgICBjb3VudCA9IDBcbiAgICAgIGZvciBlZGl0b3IgaW4gZWRpdG9yc1xuICAgICAgICBjb250aW51ZSB1bmxlc3MgZWRpdG9yLmNvbnN0cnVjdG9yLm5hbWUgaXMgXCJUZXh0RWRpdG9yXCIgb3IgZWRpdG9yLmNvbnN0cnVjdG9yLm5hbWUgaXMgXCJJbWFnZUVkaXRvclwiXG5cbiAgICAgICAgZmlsZSA9IGlmIGVkaXRvcj8uYnVmZmVyPy5maWxlIHRoZW4gZWRpdG9yLmJ1ZmZlci5maWxlIGVsc2UgaWYgZWRpdG9yPy5maWxlIHRoZW4gZWRpdG9yLmZpbGVcblxuICAgICAgICBpZiBmaWxlPy5wYXRoXG4gICAgICAgICAgQHNlbGVjdEZpbGUoZmlsZS5wYXRoKVxuICAgICAgICAgIGNvdW50KytcblxuICAgICAgcmV0dXJuIGlmIGNvdW50ID4gMFxuXG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXCIqKiN7bmFtZX0qKjogTm8gb3BlbiBmaWxlc1wiLCBkaXNtaXNzYWJsZTogZmFsc2UpXG5cbiAgcmV2ZWFsRmlsZUZyb21UcmVldmlldzogLT5cbiAgICByZXF1aXJlKFwiLi9nYVwiKS5zZW5kRXZlbnQgbmFtZSwgXCJyZXZlYWwtZmlsZS1mcm9tLXRyZWV2aWV3XCJcblxuICAgIHBhbmVzID0gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZUl0ZW1zKClcblxuICAgIGlmIHBhbmVzLmxlbmd0aCA+IDBcbiAgICAgIGNvdW50ID0gMFxuICAgICAgZm9yIHBhbmUgaW4gcGFuZXNcbiAgICAgICAgY29udGludWUgdW5sZXNzIHBhbmUuY29uc3RydWN0b3IubmFtZSBpcyBcIlRyZWVWaWV3XCJcblxuICAgICAgICBmaWxlID0gcGFuZS5zZWxlY3RlZFBhdGhcblxuICAgICAgICBpZiBmaWxlP1xuICAgICAgICAgIEBzZWxlY3RGaWxlKGZpbGUpXG4gICAgICAgICAgcmV0dXJuXG5cbiAgICAgIHJldHVybiBpZiBjb3VudCA+IDBcblxuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFwiKioje25hbWV9Kio6IE5vIHNlbGVjdGVkIGZpbGVzXCIsIGRpc21pc3NhYmxlOiBmYWxzZSlcblxuICBicm93c2VQcm9qZWN0czogLT5cbiAgICByZXF1aXJlKFwiLi9nYVwiKS5zZW5kRXZlbnQgbmFtZSwgXCJwcm9qZWN0LWZvbGRlcnNcIlxuXG4gICAgeyBhY2Nlc3NTeW5jLCBGX09LIH0gPSByZXF1aXJlIFwiZnNcIlxuXG4gICAgcHJvamVjdHMgPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVxuICAgIHJldHVybiBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcIioqI3tuYW1lfSoqOiBObyBhY3RpdmUgcHJvamVjdFwiLCBkaXNtaXNzYWJsZTogZmFsc2UpIHVubGVzcyBwcm9qZWN0cy5sZW5ndGggPiAwXG5cbiAgICBmb3IgcHJvamVjdCBpbiBwcm9qZWN0c1xuICAgICAgIyBTa2lwIEF0b20gZGlhbG9nc1xuICAgICAgaWYgcHJvamVjdC5zdGFydHNXaXRoKCdhdG9tOi8vJylcbiAgICAgICAgY29udGludWVcblxuICAgICAgIyBEb2VzIHByb2plY3QgZm9sZGVyIGV4aXN0P1xuICAgICAgdHJ5XG4gICAgICAgIGFjY2Vzc1N5bmMocHJvamVjdCwgRl9PSylcbiAgICAgIGNhdGNoXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihuYW1lLCBkZXRhaWw6IGVycm9yLCBkaXNtaXNzYWJsZTogdHJ1ZSlcbiAgICAgICAgY29udGludWVcblxuICAgICAgIyBPcGVuIHByb2plY3QgZm9sZGVyXG4gICAgICBAb3BlbkZvbGRlcihwcm9qZWN0KVxuXG4gIGJyb3dzZUNvbmZpZzogLT5cbiAgICByZXF1aXJlKFwiLi9nYVwiKS5zZW5kRXZlbnQgbmFtZSwgXCJjb25maWd1cmF0aW9uLWZvbGRlclwiXG5cbiAgICB7IGFjY2Vzc1N5bmMsIEZfT0sgfSA9IHJlcXVpcmUgXCJmc1wiXG4gICAgeyBkaXJuYW1lIH0gPSByZXF1aXJlIFwicGF0aFwiXG5cbiAgICBjb25maWdGaWxlID0gYXRvbS5jb25maWcuZ2V0VXNlckNvbmZpZ1BhdGgoKVxuICAgIGNvbmZpZ1BhdGggPSBkaXJuYW1lKGNvbmZpZ0ZpbGUpXG5cbiAgICBpZiBjb25maWdQYXRoXG4gICAgICAjIERvZXMgY29uZmlnIGZvbGRlciBleGlzdD9cbiAgICAgIHRyeVxuICAgICAgICBhY2Nlc3NTeW5jKGNvbmZpZ1BhdGgsIEZfT0spXG4gICAgICBjYXRjaCBlcnJvclxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IobmFtZSwgZGV0YWlsOiBlcnJvciwgZGlzbWlzc2FibGU6IHRydWUpXG4gICAgICAgIHJldHVyblxuXG4gICAgICAjIE9wZW4gY29uZmlnIGZvbGRlclxuICAgICAgQG9wZW5Gb2xkZXIoY29uZmlnUGF0aClcblxuICBzZWxlY3RGaWxlOiAocGF0aCkgLT5cbiAgICByZXF1aXJlKFwiLi9nYVwiKS5zZW5kRXZlbnQgbmFtZSwgXCJjb25maWd1cmF0aW9uLWZvbGRlclwiXG5cbiAgICB7IGJhc2VuYW1lIH0gPSByZXF1aXJlIFwicGF0aFwiXG5cbiAgICAjIEN1c3RvbSBmaWxlIG1hbmFnZXJcbiAgICBmaWxlTWFuYWdlciA9IGF0b20uY29uZmlnLmdldChcIiN7bmFtZX0uZmlsZU1hbmFnZXJcIilcbiAgICByZXR1cm4gQHNwYXduQ21kIGZpbGVNYW5hZ2VyLCBbIHBhdGggXSwgYmFzZW5hbWUocGF0aCksIFwiZmlsZSBtYW5hZ2VyXCIgaWYgZmlsZU1hbmFnZXJcblxuICAgICMgRGVmYXVsdCBmaWxlIG1hbmFnZXJcbiAgICBzd2l0Y2ggcHJvY2Vzcy5wbGF0Zm9ybVxuICAgICAgd2hlbiBcImRhcndpblwiXG4gICAgICAgIEBzcGF3bkNtZCBcIm9wZW5cIiwgWyBcIi1SXCIsIHBhdGggXSwgYmFzZW5hbWUocGF0aCksIFwiRmluZGVyXCJcbiAgICAgIHdoZW4gXCJ3aW4zMlwiXG4gICAgICAgIEBzcGF3bkNtZCBcImV4cGxvcmVyXCIsIFsgXCIvc2VsZWN0LCN7cGF0aH1cIiBdLCBiYXNlbmFtZShwYXRoKSwgXCJFeHBsb3JlclwiXG4gICAgICB3aGVuIFwibGludXhcIlxuICAgICAgICB7IHNob3dJdGVtSW5Gb2xkZXIgfSA9IHJlcXVpcmUgXCJzaGVsbFwiXG4gICAgICAgIHNob3dJdGVtSW5Gb2xkZXIocGF0aClcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXCIqKiN7bmFtZX0qKjogT3BlbmVkIGAje2Jhc2VuYW1lKHBhdGgpfWAgaW4gZmlsZSBtYW5hZ2VyXCIsIGRpc21pc3NhYmxlOiBmYWxzZSlcblxuICBvcGVuRm9sZGVyOiAocGF0aCkgLT5cbiAgICB7IGJhc2VuYW1lIH0gPSByZXF1aXJlIFwicGF0aFwiXG5cbiAgICAjIEN1c3RvbSBmaWxlIG1hbmFnZXJcbiAgICBmaWxlTWFuYWdlciA9IGF0b20uY29uZmlnLmdldChcIiN7bmFtZX0uZmlsZU1hbmFnZXJcIilcbiAgICByZXR1cm4gQHNwYXduQ21kIGZpbGVNYW5hZ2VyLCBbIHBhdGggXSwgYmFzZW5hbWUocGF0aCksIFwiZmlsZSBtYW5hZ2VyXCIgaWYgZmlsZU1hbmFnZXJcblxuICAgICMgRGVmYXVsdCBmaWxlIG1hbmFnZXJcbiAgICBzd2l0Y2ggcHJvY2Vzcy5wbGF0Zm9ybVxuICAgICAgd2hlbiBcImRhcndpblwiXG4gICAgICAgIEBzcGF3bkNtZCBcIm9wZW5cIiwgWyBwYXRoIF0sIGJhc2VuYW1lKHBhdGgpLCBcIkZpbmRlclwiXG4gICAgICB3aGVuIFwid2luMzJcIlxuICAgICAgICBAc3Bhd25DbWQgXCJleHBsb3JlclwiLCBbIHBhdGggXSwgYmFzZW5hbWUocGF0aCksIFwiRXhwbG9yZXJcIlxuICAgICAgd2hlbiBcImxpbnV4XCJcbiAgICAgICAgeyBvcGVuSXRlbSB9ID0gcmVxdWlyZSBcInNoZWxsXCJcbiAgICAgICAgb3Blbkl0ZW0ocGF0aClcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXCIqKiN7bmFtZX0qKjogT3BlbmVkIGAje2Jhc2VuYW1lKHBhdGgpfWAgaW4gZmlsZSBtYW5hZ2VyXCIsIGRpc21pc3NhYmxlOiBmYWxzZSlcblxuICBzcGF3bkNtZDogKGNtZCwgYXJncywgYmFzZU5hbWUsIGZpbGVNYW5hZ2VyKSAtPlxuICAgIHsgc3Bhd24gfSA9IHJlcXVpcmUoXCJjaGlsZF9wcm9jZXNzXCIpXG5cbiAgICBvcGVuID0gc3Bhd24gY21kLCBhcmdzXG5cbiAgICBvcGVuLnN0ZGVyci5vbiBcImRhdGFcIiwgKGVycm9yKSAtPlxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFwiKioje25hbWV9Kio6ICN7ZXJyb3J9XCIsIGRpc21pc3NhYmxlOiB0cnVlKVxuXG4gICAgb3Blbi5vbiBcImNsb3NlXCIsICggZXJyb3JDb2RlICkgLT5cbiAgICAgIGlmIGVycm9yQ29kZSBpcyAwIGFuZCBhdG9tLmNvbmZpZy5nZXQoXCIje25hbWV9Lm5vdGlmeVwiKVxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcIioqI3tuYW1lfSoqOiBPcGVuZWQgYCN7YmFzZU5hbWV9YCBpbiAje2ZpbGVNYW5hZ2VyfVwiLCBkaXNtaXNzYWJsZTogZmFsc2UpXG4iXX0=
