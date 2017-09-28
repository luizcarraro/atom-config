(function() {
  var meta, satisfy;

  meta = require("../package.json");

  satisfy = require("./dependencies").satisfy;

  module.exports = {
    config: {
      packageManager: {
        title: "Package Manager",
        description: "Pick your preferred package manager for installing",
        type: "string",
        "default": "yarn",
        "enum": ["apm", "pnpm", "yarn"],
        order: 0
      },
      showPrompt: {
        title: "Show Prompt",
        description: "Displays an prompt before installing Atom packages",
        type: "boolean",
        "default": false,
        order: 1
      },
      verboseMode: {
        title: "Verbose Mode",
        description: "Output progress to the console",
        type: "boolean",
        "default": false,
        order: 2
      },
      manageDependencies: {
        title: "Manage Dependencies",
        description: "When enabled, third-party dependencies will be installed automatically",
        type: "boolean",
        "default": true,
        order: 3
      }
    },
    subscriptions: null,
    activate: function() {
      var CompositeDisposable;
      CompositeDisposable = require("atom").CompositeDisposable;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add("atom-workspace", {
        "satisfy-dependencies:all": function() {
          return satisfy(true, true);
        }
      }));
      this.subscriptions.add(atom.commands.add("atom-workspace", {
        "satisfy-dependencies:atom-packages": function() {
          return satisfy(true, false);
        }
      }));
      return this.subscriptions.add(atom.commands.add("atom-workspace", {
        "satisfy-dependencies:node-packages": function() {
          return satisfy(false, true);
        }
      }));
    },
    deactivate: function() {
      var ref;
      if ((ref = this.subscriptions) != null) {
        ref.dispose();
      }
      return this.subscriptions = null;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL3NhdGlzZnktZGVwZW5kZW5jaWVzL2xpYi9tYWluLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxpQkFBUjs7RUFDTCxVQUFZLE9BQUEsQ0FBUSxnQkFBUjs7RUFFZCxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsTUFBQSxFQUNFO01BQUEsY0FBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLGlCQUFQO1FBQ0EsV0FBQSxFQUFhLG9EQURiO1FBRUEsSUFBQSxFQUFNLFFBRk47UUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLE1BSFQ7UUFJQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQ0osS0FESSxFQUVKLE1BRkksRUFHSixNQUhJLENBSk47UUFTQSxLQUFBLEVBQU8sQ0FUUDtPQURGO01BV0EsVUFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLGFBQVA7UUFDQSxXQUFBLEVBQWEsb0RBRGI7UUFFQSxJQUFBLEVBQU0sU0FGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtRQUlBLEtBQUEsRUFBTyxDQUpQO09BWkY7TUFpQkEsV0FBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLGNBQVA7UUFDQSxXQUFBLEVBQWEsZ0NBRGI7UUFFQSxJQUFBLEVBQU0sU0FGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtRQUlBLEtBQUEsRUFBTyxDQUpQO09BbEJGO01BdUJBLGtCQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8scUJBQVA7UUFDQSxXQUFBLEVBQWEsd0VBRGI7UUFFQSxJQUFBLEVBQU0sU0FGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFIVDtRQUlBLEtBQUEsRUFBTyxDQUpQO09BeEJGO0tBREY7SUE4QkEsYUFBQSxFQUFlLElBOUJmO0lBZ0NBLFFBQUEsRUFBVSxTQUFBO0FBQ1IsVUFBQTtNQUFFLHNCQUF3QixPQUFBLENBQVEsTUFBUjtNQUcxQixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BR3JCLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DO1FBQUEsMEJBQUEsRUFBNEIsU0FBQTtpQkFBRyxPQUFBLENBQVEsSUFBUixFQUFjLElBQWQ7UUFBSCxDQUE1QjtPQUFwQyxDQUFuQjtNQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DO1FBQUEsb0NBQUEsRUFBc0MsU0FBQTtpQkFBRyxPQUFBLENBQVEsSUFBUixFQUFjLEtBQWQ7UUFBSCxDQUF0QztPQUFwQyxDQUFuQjthQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DO1FBQUEsb0NBQUEsRUFBc0MsU0FBQTtpQkFBRyxPQUFBLENBQVEsS0FBUixFQUFlLElBQWY7UUFBSCxDQUF0QztPQUFwQyxDQUFuQjtJQVRRLENBaENWO0lBMkNBLFVBQUEsRUFBWSxTQUFBO0FBQ1YsVUFBQTs7V0FBYyxDQUFFLE9BQWhCLENBQUE7O2FBQ0EsSUFBQyxDQUFBLGFBQUQsR0FBaUI7SUFGUCxDQTNDWjs7QUFKRiIsInNvdXJjZXNDb250ZW50IjpbIm1ldGEgPSByZXF1aXJlIFwiLi4vcGFja2FnZS5qc29uXCJcbnsgc2F0aXNmeSB9ID0gcmVxdWlyZSBcIi4vZGVwZW5kZW5jaWVzXCJcblxubW9kdWxlLmV4cG9ydHMgPVxuICBjb25maWc6XG4gICAgcGFja2FnZU1hbmFnZXI6XG4gICAgICB0aXRsZTogXCJQYWNrYWdlIE1hbmFnZXJcIlxuICAgICAgZGVzY3JpcHRpb246IFwiUGljayB5b3VyIHByZWZlcnJlZCBwYWNrYWdlIG1hbmFnZXIgZm9yIGluc3RhbGxpbmdcIlxuICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgIGRlZmF1bHQ6IFwieWFyblwiLFxuICAgICAgZW51bTogW1xuICAgICAgICBcImFwbVwiLFxuICAgICAgICBcInBucG1cIixcbiAgICAgICAgXCJ5YXJuXCJcbiAgICAgIF0sXG4gICAgICBvcmRlcjogMFxuICAgIHNob3dQcm9tcHQ6XG4gICAgICB0aXRsZTogXCJTaG93IFByb21wdFwiXG4gICAgICBkZXNjcmlwdGlvbjogXCJEaXNwbGF5cyBhbiBwcm9tcHQgYmVmb3JlIGluc3RhbGxpbmcgQXRvbSBwYWNrYWdlc1wiXG4gICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIG9yZGVyOiAxXG4gICAgdmVyYm9zZU1vZGU6XG4gICAgICB0aXRsZTogXCJWZXJib3NlIE1vZGVcIlxuICAgICAgZGVzY3JpcHRpb246IFwiT3V0cHV0IHByb2dyZXNzIHRvIHRoZSBjb25zb2xlXCJcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgb3JkZXI6IDJcbiAgICBtYW5hZ2VEZXBlbmRlbmNpZXM6XG4gICAgICB0aXRsZTogXCJNYW5hZ2UgRGVwZW5kZW5jaWVzXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIldoZW4gZW5hYmxlZCwgdGhpcmQtcGFydHkgZGVwZW5kZW5jaWVzIHdpbGwgYmUgaW5zdGFsbGVkIGF1dG9tYXRpY2FsbHlcIlxuICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIG9yZGVyOiAzXG4gIHN1YnNjcmlwdGlvbnM6IG51bGxcblxuICBhY3RpdmF0ZTogLT5cbiAgICB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSA9IHJlcXVpcmUgXCJhdG9tXCJcblxuICAgICMgRXZlbnRzIHN1YnNjcmliZWQgdG8gaW4gYXRvbVwicyBzeXN0ZW0gY2FuIGJlIGVhc2lseSBjbGVhbmVkIHVwIHdpdGggYSBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG4gICAgIyBSZWdpc3RlciBjb21tYW5kIHRoYXQgdG9nZ2xlcyB0aGlzIHZpZXdcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgXCJhdG9tLXdvcmtzcGFjZVwiLCBcInNhdGlzZnktZGVwZW5kZW5jaWVzOmFsbFwiOiAtPiBzYXRpc2Z5KHRydWUsIHRydWUpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkIFwiYXRvbS13b3Jrc3BhY2VcIiwgXCJzYXRpc2Z5LWRlcGVuZGVuY2llczphdG9tLXBhY2thZ2VzXCI6IC0+IHNhdGlzZnkodHJ1ZSwgZmFsc2UpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkIFwiYXRvbS13b3Jrc3BhY2VcIiwgXCJzYXRpc2Z5LWRlcGVuZGVuY2llczpub2RlLXBhY2thZ2VzXCI6IC0+IHNhdGlzZnkoZmFsc2UsIHRydWUpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucz8uZGlzcG9zZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBudWxsXG4iXX0=
