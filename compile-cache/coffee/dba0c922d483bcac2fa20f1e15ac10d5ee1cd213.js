(function() {
  var CompositeDisposable;

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = {
    activate: function() {
      this.disposables = new CompositeDisposable;
      atom.grammars.getGrammars().map((function(_this) {
        return function(grammar) {
          return _this.createCommand(grammar);
        };
      })(this));
      return this.disposables.add(atom.grammars.onDidAddGrammar((function(_this) {
        return function(grammar) {
          return _this.createCommand(grammar);
        };
      })(this)));
    },
    deactivate: function() {
      return this.disposables.dispose();
    },
    createCommand: function(grammar) {
      var workspaceElement;
      if ((grammar != null ? grammar.name : void 0) != null) {
        workspaceElement = atom.views.getView(atom.workspace);
        return this.disposables.add(atom.commands.add(workspaceElement, "set-syntax:" + grammar.name, function() {
          var ref;
          return (ref = atom.workspace.getActiveTextEditor()) != null ? ref.setGrammar(grammar) : void 0;
        }));
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL3NldC1zeW50YXgvbGliL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBRXhCLE1BQU0sQ0FBQyxPQUFQLEdBRUU7SUFBQSxRQUFBLEVBQVUsU0FBQTtNQUNSLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBSTtNQUVuQixJQUFJLENBQUMsUUFBUSxDQUFDLFdBQWQsQ0FBQSxDQUEyQixDQUFDLEdBQTVCLENBQWdDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxPQUFEO2lCQUM5QixLQUFDLENBQUEsYUFBRCxDQUFlLE9BQWY7UUFEOEI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhDO2FBR0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsT0FBRDtpQkFDN0MsS0FBQyxDQUFBLGFBQUQsQ0FBZSxPQUFmO1FBRDZDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QixDQUFqQjtJQU5RLENBQVY7SUFVQSxVQUFBLEVBQVksU0FBQTthQUNWLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFBO0lBRFUsQ0FWWjtJQWdCQSxhQUFBLEVBQWUsU0FBQyxPQUFEO0FBQ2IsVUFBQTtNQUFBLElBQUcsaURBQUg7UUFDRSxnQkFBQSxHQUFtQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsSUFBSSxDQUFDLFNBQXhCO2VBQ25CLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DLGFBQUEsR0FBYyxPQUFPLENBQUMsSUFBMUQsRUFBa0UsU0FBQTtBQUNqRixjQUFBOzJFQUFvQyxDQUFFLFVBQXRDLENBQWlELE9BQWpEO1FBRGlGLENBQWxFLENBQWpCLEVBRkY7O0lBRGEsQ0FoQmY7O0FBSkYiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gICMgUHVibGljOiBBY3RpdmF0ZXMgdGhlIHBhY2thZ2UuXG4gIGFjdGl2YXRlOiAtPlxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICBhdG9tLmdyYW1tYXJzLmdldEdyYW1tYXJzKCkubWFwIChncmFtbWFyKSA9PlxuICAgICAgQGNyZWF0ZUNvbW1hbmQoZ3JhbW1hcilcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5ncmFtbWFycy5vbkRpZEFkZEdyYW1tYXIgKGdyYW1tYXIpID0+XG4gICAgICBAY3JlYXRlQ29tbWFuZChncmFtbWFyKVxuXG4gICMgUHVibGljOiBEZWFjdGl2YXRlcyB0aGUgcGFja2FnZS5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG5cbiAgIyBQcml2YXRlOiBDcmVhdGVzIHRoZSBjb21tYW5kIGZvciBhIGdpdmVuIHtHcmFtbWFyfS5cbiAgI1xuICAjICogYGdyYW1tYXJgIHtHcmFtbWFyfSB0aGUgY29tbWFuZCB3aWxsIGJlIGZvci5cbiAgY3JlYXRlQ29tbWFuZDogKGdyYW1tYXIpIC0+XG4gICAgaWYgZ3JhbW1hcj8ubmFtZT9cbiAgICAgIHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29tbWFuZHMuYWRkIHdvcmtzcGFjZUVsZW1lbnQsIFwic2V0LXN5bnRheDoje2dyYW1tYXIubmFtZX1cIiwgLT5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpPy5zZXRHcmFtbWFyKGdyYW1tYXIpXG4iXX0=
