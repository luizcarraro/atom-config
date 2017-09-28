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
          var editor;
          editor = atom.workspace.getActiveTextEditor();
          if (editor) {
            return atom.textEditors.setGrammarOverride(editor, grammar.scopeName);
          }
        }));
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL3NldC1zeW50YXgvbGliL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBRXhCLE1BQU0sQ0FBQyxPQUFQLEdBRUU7SUFBQSxRQUFBLEVBQVUsU0FBQTtNQUNSLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBSTtNQUVuQixJQUFJLENBQUMsUUFBUSxDQUFDLFdBQWQsQ0FBQSxDQUEyQixDQUFDLEdBQTVCLENBQWdDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxPQUFEO2lCQUM5QixLQUFDLENBQUEsYUFBRCxDQUFlLE9BQWY7UUFEOEI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhDO2FBR0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsT0FBRDtpQkFDN0MsS0FBQyxDQUFBLGFBQUQsQ0FBZSxPQUFmO1FBRDZDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QixDQUFqQjtJQU5RLENBQVY7SUFVQSxVQUFBLEVBQVksU0FBQTthQUNWLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFBO0lBRFUsQ0FWWjtJQWdCQSxhQUFBLEVBQWUsU0FBQyxPQUFEO0FBQ2IsVUFBQTtNQUFBLElBQUcsaURBQUg7UUFDRSxnQkFBQSxHQUFtQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsSUFBSSxDQUFDLFNBQXhCO2VBQ25CLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DLGFBQUEsR0FBYyxPQUFPLENBQUMsSUFBMUQsRUFBa0UsU0FBQTtBQUNqRixjQUFBO1VBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQTtVQUNULElBQUcsTUFBSDttQkFDRSxJQUFJLENBQUMsV0FBVyxDQUFDLGtCQUFqQixDQUFvQyxNQUFwQyxFQUE0QyxPQUFPLENBQUMsU0FBcEQsRUFERjs7UUFGaUYsQ0FBbEUsQ0FBakIsRUFGRjs7SUFEYSxDQWhCZjs7QUFKRiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgIyBQdWJsaWM6IEFjdGl2YXRlcyB0aGUgcGFja2FnZS5cbiAgYWN0aXZhdGU6IC0+XG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuICAgIGF0b20uZ3JhbW1hcnMuZ2V0R3JhbW1hcnMoKS5tYXAgKGdyYW1tYXIpID0+XG4gICAgICBAY3JlYXRlQ29tbWFuZChncmFtbWFyKVxuXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmdyYW1tYXJzLm9uRGlkQWRkR3JhbW1hciAoZ3JhbW1hcikgPT5cbiAgICAgIEBjcmVhdGVDb21tYW5kKGdyYW1tYXIpXG5cbiAgIyBQdWJsaWM6IERlYWN0aXZhdGVzIHRoZSBwYWNrYWdlLlxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcblxuICAjIFByaXZhdGU6IENyZWF0ZXMgdGhlIGNvbW1hbmQgZm9yIGEgZ2l2ZW4ge0dyYW1tYXJ9LlxuICAjXG4gICMgKiBgZ3JhbW1hcmAge0dyYW1tYXJ9IHRoZSBjb21tYW5kIHdpbGwgYmUgZm9yLlxuICBjcmVhdGVDb21tYW5kOiAoZ3JhbW1hcikgLT5cbiAgICBpZiBncmFtbWFyPy5uYW1lP1xuICAgICAgd29ya3NwYWNlRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcbiAgICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgd29ya3NwYWNlRWxlbWVudCwgXCJzZXQtc3ludGF4OiN7Z3JhbW1hci5uYW1lfVwiLCAtPlxuICAgICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgICAgaWYgZWRpdG9yXG4gICAgICAgICAgYXRvbS50ZXh0RWRpdG9ycy5zZXRHcmFtbWFyT3ZlcnJpZGUoZWRpdG9yLCBncmFtbWFyLnNjb3BlTmFtZSlcbiJdfQ==
