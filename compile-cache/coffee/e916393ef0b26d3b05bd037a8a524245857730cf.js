(function() {
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
      var CompositeDisposable, satisfy;
      CompositeDisposable = require("atom").CompositeDisposable;
      satisfy = require("./dependencies").satisfy;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL3NhdGlzZnktZGVwZW5kZW5jaWVzL2xpYi9tYWluLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxNQUFBLEVBQ0U7TUFBQSxjQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8saUJBQVA7UUFDQSxXQUFBLEVBQWEsb0RBRGI7UUFFQSxJQUFBLEVBQU0sUUFGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsTUFIVDtRQUlBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FDSixLQURJLEVBRUosTUFGSSxFQUdKLE1BSEksQ0FKTjtRQVNBLEtBQUEsRUFBTyxDQVRQO09BREY7TUFXQSxVQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sYUFBUDtRQUNBLFdBQUEsRUFBYSxvREFEYjtRQUVBLElBQUEsRUFBTSxTQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhUO1FBSUEsS0FBQSxFQUFPLENBSlA7T0FaRjtNQWlCQSxXQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sY0FBUDtRQUNBLFdBQUEsRUFBYSxnQ0FEYjtRQUVBLElBQUEsRUFBTSxTQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhUO1FBSUEsS0FBQSxFQUFPLENBSlA7T0FsQkY7TUF1QkEsa0JBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxxQkFBUDtRQUNBLFdBQUEsRUFBYSx3RUFEYjtRQUVBLElBQUEsRUFBTSxTQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUhUO1FBSUEsS0FBQSxFQUFPLENBSlA7T0F4QkY7S0FERjtJQThCQSxhQUFBLEVBQWUsSUE5QmY7SUFnQ0EsUUFBQSxFQUFVLFNBQUE7QUFDUixVQUFBO01BQUUsc0JBQXdCLE9BQUEsQ0FBUSxNQUFSO01BQ3hCLFVBQVksT0FBQSxDQUFRLGdCQUFSO01BR2QsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTtNQUdyQixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQztRQUFBLDBCQUFBLEVBQTRCLFNBQUE7aUJBQUcsT0FBQSxDQUFRLElBQVIsRUFBYyxJQUFkO1FBQUgsQ0FBNUI7T0FBcEMsQ0FBbkI7TUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQztRQUFBLG9DQUFBLEVBQXNDLFNBQUE7aUJBQUcsT0FBQSxDQUFRLElBQVIsRUFBYyxLQUFkO1FBQUgsQ0FBdEM7T0FBcEMsQ0FBbkI7YUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQztRQUFBLG9DQUFBLEVBQXNDLFNBQUE7aUJBQUcsT0FBQSxDQUFRLEtBQVIsRUFBZSxJQUFmO1FBQUgsQ0FBdEM7T0FBcEMsQ0FBbkI7SUFWUSxDQWhDVjtJQTRDQSxVQUFBLEVBQVksU0FBQTtBQUNWLFVBQUE7O1dBQWMsQ0FBRSxPQUFoQixDQUFBOzthQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCO0lBRlAsQ0E1Q1o7O0FBREYiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9XG4gIGNvbmZpZzpcbiAgICBwYWNrYWdlTWFuYWdlcjpcbiAgICAgIHRpdGxlOiBcIlBhY2thZ2UgTWFuYWdlclwiXG4gICAgICBkZXNjcmlwdGlvbjogXCJQaWNrIHlvdXIgcHJlZmVycmVkIHBhY2thZ2UgbWFuYWdlciBmb3IgaW5zdGFsbGluZ1wiXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgZGVmYXVsdDogXCJ5YXJuXCIsXG4gICAgICBlbnVtOiBbXG4gICAgICAgIFwiYXBtXCIsXG4gICAgICAgIFwicG5wbVwiLFxuICAgICAgICBcInlhcm5cIlxuICAgICAgXSxcbiAgICAgIG9yZGVyOiAwXG4gICAgc2hvd1Byb21wdDpcbiAgICAgIHRpdGxlOiBcIlNob3cgUHJvbXB0XCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkRpc3BsYXlzIGFuIHByb21wdCBiZWZvcmUgaW5zdGFsbGluZyBBdG9tIHBhY2thZ2VzXCJcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgb3JkZXI6IDFcbiAgICB2ZXJib3NlTW9kZTpcbiAgICAgIHRpdGxlOiBcIlZlcmJvc2UgTW9kZVwiXG4gICAgICBkZXNjcmlwdGlvbjogXCJPdXRwdXQgcHJvZ3Jlc3MgdG8gdGhlIGNvbnNvbGVcIlxuICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBvcmRlcjogMlxuICAgIG1hbmFnZURlcGVuZGVuY2llczpcbiAgICAgIHRpdGxlOiBcIk1hbmFnZSBEZXBlbmRlbmNpZXNcIlxuICAgICAgZGVzY3JpcHRpb246IFwiV2hlbiBlbmFibGVkLCB0aGlyZC1wYXJ0eSBkZXBlbmRlbmNpZXMgd2lsbCBiZSBpbnN0YWxsZWQgYXV0b21hdGljYWxseVwiXG4gICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgb3JkZXI6IDNcbiAgc3Vic2NyaXB0aW9uczogbnVsbFxuXG4gIGFjdGl2YXRlOiAtPlxuICAgIHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9ID0gcmVxdWlyZSBcImF0b21cIlxuICAgIHsgc2F0aXNmeSB9ID0gcmVxdWlyZSBcIi4vZGVwZW5kZW5jaWVzXCJcblxuICAgICMgRXZlbnRzIHN1YnNjcmliZWQgdG8gaW4gYXRvbVwicyBzeXN0ZW0gY2FuIGJlIGVhc2lseSBjbGVhbmVkIHVwIHdpdGggYSBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG4gICAgIyBSZWdpc3RlciBjb21tYW5kIHRoYXQgdG9nZ2xlcyB0aGlzIHZpZXdcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgXCJhdG9tLXdvcmtzcGFjZVwiLCBcInNhdGlzZnktZGVwZW5kZW5jaWVzOmFsbFwiOiAtPiBzYXRpc2Z5KHRydWUsIHRydWUpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkIFwiYXRvbS13b3Jrc3BhY2VcIiwgXCJzYXRpc2Z5LWRlcGVuZGVuY2llczphdG9tLXBhY2thZ2VzXCI6IC0+IHNhdGlzZnkodHJ1ZSwgZmFsc2UpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkIFwiYXRvbS13b3Jrc3BhY2VcIiwgXCJzYXRpc2Z5LWRlcGVuZGVuY2llczpub2RlLXBhY2thZ2VzXCI6IC0+IHNhdGlzZnkoZmFsc2UsIHRydWUpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucz8uZGlzcG9zZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBudWxsXG4iXX0=
