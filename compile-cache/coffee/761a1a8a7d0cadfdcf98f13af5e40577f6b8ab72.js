(function() {
  var MINIMUM_AUTO_UPDATE_BLOCK_DURATION_MINUTES, PackageUpdater, WARMUP_WAIT, meta;

  meta = require("../package.json");

  PackageUpdater = null;

  WARMUP_WAIT = 10 * 1000;

  MINIMUM_AUTO_UPDATE_BLOCK_DURATION_MINUTES = 15;

  module.exports = {
    config: {
      includedPackages: {
        title: "Included Packages",
        description: "Comma-delimited list of packages to be included from automatic updates",
        type: "array",
        "default": [],
        order: 1
      },
      excludedPackages: {
        title: "Excluded Packages",
        description: "Comma-delimited list of packages to be excluded from automatic updates",
        type: "array",
        "default": [],
        order: 2
      },
      intervalMinutes: {
        title: 'Update Interval',
        description: "Set the default update interval in minutes",
        type: 'integer',
        minimum: MINIMUM_AUTO_UPDATE_BLOCK_DURATION_MINUTES,
        "default": 6 * 60,
        order: 3
      },
      updateNotification: {
        title: "Notify on Update",
        description: "Enable to show notifications when packages have been updated",
        type: "boolean",
        "default": true,
        order: 4
      },
      dismissNotification: {
        title: "Dismiss Notification",
        description: "Automatically dismiss the update notification after 5 seconds",
        type: "boolean",
        "default": true,
        order: 5
      }
    },
    activate: function(state) {
      var commands;
      commands = {};
      commands[meta.name + ":update-now"] = (function(_this) {
        return function() {
          return _this.updatePackages(false);
        };
      })(this);
      this.commandSubscription = atom.commands.add('atom-workspace', commands);
      return setTimeout((function(_this) {
        return function() {
          return _this.enableAutoUpdate();
        };
      })(this), WARMUP_WAIT);
    },
    deactivate: function() {
      var ref;
      this.disableAutoUpdate();
      if ((ref = this.commandSubscription) != null) {
        ref.dispose();
      }
      return this.commandSubscription = null;
    },
    enableAutoUpdate: function() {
      this.updatePackagesIfAutoUpdateBlockIsExpired();
      this.autoUpdateCheck = setInterval((function(_this) {
        return function() {
          return _this.updatePackagesIfAutoUpdateBlockIsExpired();
        };
      })(this), this.getAutoUpdateCheckInterval());
      return this.configSubscription = atom.config.onDidChange(meta.name + ".intervalMinutes", (function(_this) {
        return function(arg) {
          var newValue, oldValue;
          newValue = arg.newValue, oldValue = arg.oldValue;
          if (atom.inDevMode()) {
            console.log("Changed update interval to " + newValue);
          }
          _this.disableAutoUpdate();
          return _this.enableAutoUpdate();
        };
      })(this));
    },
    disableAutoUpdate: function() {
      var ref;
      if ((ref = this.configSubscription) != null) {
        ref.dispose();
      }
      this.configSubscription = null;
      if (this.autoUpdateCheck) {
        clearInterval(this.autoUpdateCheck);
      }
      return this.autoUpdateCheck = null;
    },
    updatePackagesIfAutoUpdateBlockIsExpired: function() {
      var lastUpdateTime;
      lastUpdateTime = this.loadLastUpdateTime() || 0;
      if (Date.now() > lastUpdateTime + this.getAutoUpdateBlockDuration()) {
        return this.updatePackages();
      }
    },
    updatePackages: function(isAutoUpdate) {
      if (isAutoUpdate == null) {
        isAutoUpdate = true;
      }
      if (PackageUpdater == null) {
        PackageUpdater = require('./package-updater');
      }
      PackageUpdater.updatePackages(isAutoUpdate);
      return this.saveLastUpdateTime();
    },
    getAutoUpdateBlockDuration: function() {
      var minutes;
      minutes = atom.config.get(meta.name + ".intervalMinutes");
      if (isNaN(minutes) || minutes < MINIMUM_AUTO_UPDATE_BLOCK_DURATION_MINUTES) {
        minutes = MINIMUM_AUTO_UPDATE_BLOCK_DURATION_MINUTES;
      }
      return minutes * 60 * 1000;
    },
    getAutoUpdateCheckInterval: function() {
      return this.getAutoUpdateBlockDuration() / 15;
    },
    loadLastUpdateTime: function() {
      var lastUpdateTime;
      try {
        lastUpdateTime = localStorage.getItem(meta.name + ".lastUpdateTime");
        return parseInt(lastUpdateTime);
      } catch (error) {
        return null;
      }
    },
    saveLastUpdateTime: function() {
      return localStorage.setItem(meta.name + ".lastUpdateTime", Date.now().toString());
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2F1dG8tdXBkYXRlLXBsdXMvbGliL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFTLGlCQUFUOztFQUNQLGNBQUEsR0FBaUI7O0VBRWpCLFdBQUEsR0FBYyxFQUFBLEdBQUs7O0VBQ25CLDBDQUFBLEdBQTZDOztFQUU3QyxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsTUFBQSxFQUNFO01BQUEsZ0JBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxtQkFBUDtRQUNBLFdBQUEsRUFBYSx3RUFEYjtRQUVBLElBQUEsRUFBTSxPQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQUhUO1FBSUEsS0FBQSxFQUFPLENBSlA7T0FERjtNQU1BLGdCQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sbUJBQVA7UUFDQSxXQUFBLEVBQWEsd0VBRGI7UUFFQSxJQUFBLEVBQU0sT0FGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFIVDtRQUlBLEtBQUEsRUFBTyxDQUpQO09BUEY7TUFZQSxlQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8saUJBQVA7UUFDQSxXQUFBLEVBQWEsNENBRGI7UUFFQSxJQUFBLEVBQU0sU0FGTjtRQUdBLE9BQUEsRUFBUywwQ0FIVDtRQUlBLENBQUEsT0FBQSxDQUFBLEVBQVMsQ0FBQSxHQUFJLEVBSmI7UUFLQSxLQUFBLEVBQU8sQ0FMUDtPQWJGO01BbUJBLGtCQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sa0JBQVA7UUFDQSxXQUFBLEVBQWEsOERBRGI7UUFFQSxJQUFBLEVBQU0sU0FGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFIVDtRQUlBLEtBQUEsRUFBTyxDQUpQO09BcEJGO01BeUJBLG1CQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sc0JBQVA7UUFD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RyxLQUFBLENBQU0sT0FBTixDQUFBLElBQWtCLE9BQUEsR0FBVSwwQ0FBL0I7UUFDRSxPQUFBLEdBQVUsMkNBRFo7O2FBR0EsT0FBQSxHQUFVLEVBQVYsR0FBZTtJQU5XLENBNUU1QjtJQW9GQSwwQkFBQSxFQUE0QixTQUFBO2FBQzFCLElBQUMsQ0FBQSwwQkFBRCxDQUFBLENBQUEsR0FBZ0M7SUFETixDQXBGNUI7SUF5RkEsa0JBQUEsRUFBb0IsU0FBQTtBQUNsQixVQUFBO0FBQUE7UUFDRSxjQUFBLEdBQWlCLFlBQVksQ0FBQyxPQUFiLENBQXdCLElBQUksQ0FBQyxJQUFOLEdBQVcsaUJBQWxDO2VBQ2pCLFFBQUEsQ0FBUyxjQUFULEVBRkY7T0FBQSxhQUFBO2VBSUUsS0FKRjs7SUFEa0IsQ0F6RnBCO0lBZ0dBLGtCQUFBLEVBQW9CLFNBQUE7YUFDbEIsWUFBWSxDQUFDLE9BQWIsQ0FBd0IsSUFBSSxDQUFDLElBQU4sR0FBVyxpQkFBbEMsRUFBb0QsSUFBSSxDQUFDLEdBQUwsQ0FBQSxDQUFVLENBQUMsUUFBWCxDQUFBLENBQXBEO0lBRGtCLENBaEdwQjs7QUFQRiIsInNvdXJjZXNDb250ZW50IjpbIm1ldGEgPSByZXF1aXJlIChcIi4uL3BhY2thZ2UuanNvblwiKVxuUGFja2FnZVVwZGF0ZXIgPSBudWxsXG5cbldBUk1VUF9XQUlUID0gMTAgKiAxMDAwXG5NSU5JTVVNX0FVVE9fVVBEQVRFX0JMT0NLX0RVUkFUSU9OX01JTlVURVMgPSAxNVxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGNvbmZpZzpcbiAgICBpbmNsdWRlZFBhY2thZ2VzOlxuICAgICAgdGl0bGU6IFwiSW5jbHVkZWQgUGFja2FnZXNcIlxuICAgICAgZGVzY3JpcHRpb246IFwiQ29tbWEtZGVsaW1pdGVkIGxpc3Qgb2YgcGFja2FnZXMgdG8gYmUgaW5jbHVkZWQgZnJvbSBhdXRvbWF0aWMgdXBkYXRlc1wiXG4gICAgICB0eXBlOiBcImFycmF5XCJcbiAgICAgIGRlZmF1bHQ6IFtdXG4gICAgICBvcmRlcjogMVxuICAgIGV4Y2x1ZGVkUGFja2FnZXM6XG4gICAgICB0aXRsZTogXCJFeGNsdWRlZCBQYWNrYWdlc1wiXG4gICAgICBkZXNjcmlwdGlvbjogXCJDb21tYS1kZWxpbWl0ZWQgbGlzdCBvZiBwYWNrYWdlcyB0byBiZSBleGNsdWRlZCBmcm9tIGF1dG9tYXRpYyB1cGRhdGVzXCJcbiAgICAgIHR5cGU6IFwiYXJyYXlcIlxuICAgICAgZGVmYXVsdDogW11cbiAgICAgIG9yZGVyOiAyXG4gICAgaW50ZXJ2YWxNaW51dGVzOlxuICAgICAgdGl0bGU6ICdVcGRhdGUgSW50ZXJ2YWwnXG4gICAgICBkZXNjcmlwdGlvbjogXCJTZXQgdGhlIGRlZmF1bHQgdXBkYXRlIGludGVydmFsIGluIG1pbnV0ZXNcIlxuICAgICAgdHlwZTogJ2ludGVnZXInXG4gICAgICBtaW5pbXVtOiBNSU5JTVVNX0FVVE9fVVBEQVRFX0JMT0NLX0RVUkFUSU9OX01JTlVURVNcbiAgICAgIGRlZmF1bHQ6IDYgKiA2MFxuICAgICAgb3JkZXI6IDNcbiAgICB1cGRhdGVOb3RpZmljYXRpb246XG4gICAgICB0aXRsZTogXCJOb3RpZnkgb24gVXBkYXRlXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkVuYWJsZSB0byBzaG93IG5vdGlmaWNhdGlvbnMgd2hlbiBwYWNrYWdlcyBoYXZlIGJlZW4gdXBkYXRlZFwiXG4gICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgb3JkZXI6IDRcbiAgICBkaXNtaXNzTm90aWZpY2F0aW9uOlxuICAgICAgdGl0bGU6IFwiRGlzbWlzcyBOb3RpZmljYXRpb25cIlxuICAgICAgZGVzY3JpcHRpb246IFwiQXV0b21hdGljYWxseSBkaXNtaXNzIHRoZSB1cGRhdGUgbm90aWZpY2F0aW9uIGFmdGVyIDUgc2Vjb25kc1wiXG4gICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgb3JkZXI6IDVcblxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgIGNvbW1hbmRzID0ge31cbiAgICBjb21tYW5kc1tcIiN7bWV0YS5uYW1lfTp1cGRhdGUtbm93XCJdID0gPT4gQHVwZGF0ZVBhY2thZ2VzKGZhbHNlKVxuICAgIEBjb21tYW5kU3Vic2NyaXB0aW9uID0gYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywgY29tbWFuZHMpXG5cbiAgICBzZXRUaW1lb3V0ID0+XG4gICAgICBAZW5hYmxlQXV0b1VwZGF0ZSgpXG4gICAgLCBXQVJNVVBfV0FJVFxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQGRpc2FibGVBdXRvVXBkYXRlKClcbiAgICBAY29tbWFuZFN1YnNjcmlwdGlvbj8uZGlzcG9zZSgpXG4gICAgQGNvbW1hbmRTdWJzY3JpcHRpb24gPSBudWxsXG5cbiAgZW5hYmxlQXV0b1VwZGF0ZTogLT5cbiAgICBAdXBkYXRlUGFja2FnZXNJZkF1dG9VcGRhdGVCbG9ja0lzRXhwaXJlZCgpXG5cbiAgICBAYXV0b1VwZGF0ZUNoZWNrID0gc2V0SW50ZXJ2YWwgPT5cbiAgICAgIEB1cGRhdGVQYWNrYWdlc0lmQXV0b1VwZGF0ZUJsb2NrSXNFeHBpcmVkKClcbiAgICAsIEBnZXRBdXRvVXBkYXRlQ2hlY2tJbnRlcnZhbCgpXG5cbiAgICBAY29uZmlnU3Vic2NyaXB0aW9uID0gYXRvbS5jb25maWcub25EaWRDaGFuZ2UgXCIje21ldGEubmFtZX0uaW50ZXJ2YWxNaW51dGVzXCIsICh7bmV3VmFsdWUsIG9sZFZhbHVlfSkgPT5cbiAgICAgIGNvbnNvbGUubG9nIFwiQ2hhbmdlZCB1cGRhdGUgaW50ZXJ2YWwgdG8gI3tuZXdWYWx1ZX1cIiBpZiBhdG9tLmluRGV2TW9kZSgpXG4gICAgICBAZGlzYWJsZUF1dG9VcGRhdGUoKVxuICAgICAgQGVuYWJsZUF1dG9VcGRhdGUoKVxuXG4gIGRpc2FibGVBdXRvVXBkYXRlOiAtPlxuICAgIEBjb25maWdTdWJzY3JpcHRpb24/LmRpc3Bvc2UoKVxuICAgIEBjb25maWdTdWJzY3JpcHRpb24gPSBudWxsXG5cbiAgICBjbGVhckludGVydmFsKEBhdXRvVXBkYXRlQ2hlY2spIGlmIEBhdXRvVXBkYXRlQ2hlY2tcbiAgICBAYXV0b1VwZGF0ZUNoZWNrID0gbnVsbFxuXG4gIHVwZGF0ZVBhY2thZ2VzSWZBdXRvVXBkYXRlQmxvY2tJc0V4cGlyZWQ6IC0+XG4gICAgbGFzdFVwZGF0ZVRpbWUgPSBAbG9hZExhc3RVcGRhdGVUaW1lKCkgfHwgMFxuICAgIGlmIERhdGUubm93KCkgPiBsYXN0VXBkYXRlVGltZSArIEBnZXRBdXRvVXBkYXRlQmxvY2tEdXJhdGlvbigpXG4gICAgICBAdXBkYXRlUGFja2FnZXMoKVxuXG4gIHVwZGF0ZVBhY2thZ2VzOiAoaXNBdXRvVXBkYXRlID0gdHJ1ZSkgLT5cbiAgICBQYWNrYWdlVXBkYXRlciA/PSByZXF1aXJlICcuL3BhY2thZ2UtdXBkYXRlcidcbiAgICBQYWNrYWdlVXBkYXRlci51cGRhdGVQYWNrYWdlcyhpc0F1dG9VcGRhdGUpXG4gICAgQHNhdmVMYXN0VXBkYXRlVGltZSgpXG5cbiAgZ2V0QXV0b1VwZGF0ZUJsb2NrRHVyYXRpb246IC0+XG4gICAgbWludXRlcyA9IGF0b20uY29uZmlnLmdldChcIiN7bWV0YS5uYW1lfS5pbnRlcnZhbE1pbnV0ZXNcIilcblxuICAgIGlmIGlzTmFOKG1pbnV0ZXMpIHx8IG1pbnV0ZXMgPCBNSU5JTVVNX0FVVE9fVVBEQVRFX0JMT0NLX0RVUkFUSU9OX01JTlVURVNcbiAgICAgIG1pbnV0ZXMgPSBNSU5JTVVNX0FVVE9fVVBEQVRFX0JMT0NLX0RVUkFUSU9OX01JTlVURVNcblxuICAgIG1pbnV0ZXMgKiA2MCAqIDEwMDBcblxuICBnZXRBdXRvVXBkYXRlQ2hlY2tJbnRlcnZhbDogLT5cbiAgICBAZ2V0QXV0b1VwZGF0ZUJsb2NrRHVyYXRpb24oKSAvIDE1XG5cbiAgIyBhdXRvLXVwZ3JhZGUtcGFja2FnZXMgcnVucyBvbiBlYWNoIEF0b20gaW5zdGFuY2UsXG4gICMgc28gd2UgbmVlZCB0byBzaGFyZSB0aGUgbGFzdCB1cGRhdGVkIHRpbWUgdmlhIGEgZmlsZSBiZXR3ZWVuIHRoZSBpbnN0YW5jZXMuXG4gIGxvYWRMYXN0VXBkYXRlVGltZTogLT5cbiAgICB0cnlcbiAgICAgIGxhc3RVcGRhdGVUaW1lID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCIje21ldGEubmFtZX0ubGFzdFVwZGF0ZVRpbWVcIilcbiAgICAgIHBhcnNlSW50KGxhc3RVcGRhdGVUaW1lKVxuICAgIGNhdGNoXG4gICAgICBudWxsXG5cbiAgc2F2ZUxhc3RVcGRhdGVUaW1lOiAtPlxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiI3ttZXRhLm5hbWV9Lmxhc3RVcGRhdGVUaW1lXCIsIERhdGUubm93KCkudG9TdHJpbmcoKSlcbiJdfQ==
