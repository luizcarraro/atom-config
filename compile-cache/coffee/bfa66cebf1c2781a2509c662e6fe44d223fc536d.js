(function() {
  var CompositeDisposable, MultiCursor, Point;

  CompositeDisposable = require('atom').CompositeDisposable;

  Point = require('atom').Point;

  module.exports = MultiCursor = {
    subscriptions: null,
    editor: null,
    firstActivation: true,
    firstBuffer: null,
    currentPosition: null,
    skipCount: 0,
    activate: function(state) {
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-text-editor', {
        'multi-cursor:expandDown': (function(_this) {
          return function() {
            return _this.expandDown();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-text-editor', {
        'multi-cursor:expandUp': (function(_this) {
          return function() {
            return _this.expandUp();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-text-editor', {
        'multi-cursor:move-last-cursor-up': (function(_this) {
          return function() {
            return _this.moveLastCursorUp();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-text-editor', {
        'multi-cursor:move-last-cursor-down': (function(_this) {
          return function() {
            return _this.moveLastCursorDown();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-text-editor', {
        'multi-cursor:move-last-cursor-left': (function(_this) {
          return function() {
            return _this.moveLastCursorLeft();
          };
        })(this)
      }));
      return this.subscriptions.add(atom.commands.add('atom-text-editor', {
        'multi-cursor:move-last-cursor-right': (function(_this) {
          return function() {
            return _this.moveLastCursorRight();
          };
        })(this)
      }));
    },
    deactivate: function() {
      this.subscriptions.dispose();
      this.currentPosition = null;
      this.firstBuffer = null;
      return this.editor = null;
    },
    serialize: function() {
      return this.currentPosition = null;
    },
    expandDown: function() {
      return this.expandInDirection(1);
    },
    expandUp: function() {
      return this.expandInDirection(-1);
    },
    expandInDirection: function(dir) {
      var coords, cursors, editor, lastCursor, newCoords, newCursor;
      if (!(editor = atom.workspace.getActiveTextEditor())) {
        return;
      }
      if (!(lastCursor = editor.getLastCursor())) {
        return;
      }
      cursors = editor.getCursors();
      coords = lastCursor.getBufferPosition();
      newCoords = {
        column: lastCursor.goalColumn || coords.column,
        row: coords.row + dir + this.skipCount
      };
      if (newCoords.row < 0 || newCoords.row > editor.getLastBufferRow()) {
        return;
      }
      newCursor = editor.addCursorAtBufferPosition(newCoords);
      newCursor.goalColumn = lastCursor.goalColumn || coords.column;
      if (cursors.length === editor.getCursors().length) {
        if (editor.hasMultipleCursors()) {
          lastCursor.destroy();
        }
      }
      return this.skipCount = 0;
    },
    moveLastCursorUp: function() {
      var cursor, editor;
      this.skipCount = 0;
      if (!(editor = atom.workspace.getActiveTextEditor())) {
        return;
      }
      if (!(cursor = editor.getLastCursor())) {
        return;
      }
      if (cursor.selection.isEmpty()) {
        cursor.moveUp();
      } else {
        cursor.selection.modifySelection(function() {
          return cursor.moveUp();
        });
      }
      return editor.mergeCursors();
    },
    moveLastCursorDown: function() {
      var cursor, editor;
      this.skipCount = 0;
      if (!(editor = atom.workspace.getActiveTextEditor())) {
        return;
      }
      if (!(cursor = editor.getLastCursor())) {
        return;
      }
      if (cursor.selection.isEmpty()) {
        cursor.moveDown();
      } else {
        cursor.selection.modifySelection(function() {
          return cursor.moveDown();
        });
      }
      return editor.mergeCursors();
    },
    moveLastCursorLeft: function() {
      var cursor, editor;
      this.skipCount = 0;
      if (!(editor = atom.workspace.getActiveTextEditor())) {
        return;
      }
      if (!(cursor = editor.getLastCursor())) {
        return;
      }
      if (cursor.selection.isEmpty()) {
        cursor.moveLeft();
      } else {
        cursor.selection.modifySelection(function() {
          return cursor.moveLeft();
        });
      }
      return editor.mergeCursors();
    },
    moveLastCursorRight: function() {
      var cursor, editor;
      this.skipCount = 0;
      if (!(editor = atom.workspace.getActiveTextEditor())) {
        return;
      }
      if (!(cursor = editor.getLastCursor())) {
        return;
      }
      if (cursor.selection.isEmpty()) {
        cursor.moveRight();
      } else {
        cursor.selection.modifySelection(function() {
          return cursor.moveRight();
        });
      }
      return editor.mergeCursors();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL211bHRpLWN1cnNvci9saWIvbXVsdGktY3Vyc29yLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN2QixRQUFTLE9BQUEsQ0FBUSxNQUFSOztFQUVWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFdBQUEsR0FDZjtJQUFBLGFBQUEsRUFBZSxJQUFmO0lBQ0EsTUFBQSxFQUFRLElBRFI7SUFFQSxlQUFBLEVBQWlCLElBRmpCO0lBR0EsV0FBQSxFQUFhLElBSGI7SUFJQSxlQUFBLEVBQWlCLElBSmpCO0lBS0EsU0FBQSxFQUFXLENBTFg7SUFPQSxRQUFBLEVBQVUsU0FBQyxLQUFEO01BRVIsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTtNQUVyQixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGtCQUFsQixFQUFzQztRQUFBLHlCQUFBLEVBQTJCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLFVBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzQjtPQUF0QyxDQUFuQjtNQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0Isa0JBQWxCLEVBQXNDO1FBQUEsdUJBQUEsRUFBeUIsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsUUFBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpCO09BQXRDLENBQW5CO01BRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixrQkFB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dH0gPSByZXF1aXJlICdhdG9tJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IE11bHRpQ3Vyc29yID1cbiAgc3Vic2NyaXB0aW9uczogbnVsbFxuICBlZGl0b3I6IG51bGxcbiAgZmlyc3RBY3RpdmF0aW9uOiB0cnVlXG4gIGZpcnN0QnVmZmVyOiBudWxsXG4gIGN1cnJlbnRQb3NpdGlvbjogbnVsbFxuICBza2lwQ291bnQ6IDBcblxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgICMgRXZlbnRzIHN1YnNjcmliZWQgdG8gaW4gYXRvbSdzIHN5c3RlbSBjYW4gYmUgZWFzaWx5IGNsZWFuZWQgdXAgd2l0aCBhIENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20tdGV4dC1lZGl0b3InLCAnbXVsdGktY3Vyc29yOmV4cGFuZERvd24nOiA9PiBAZXhwYW5kRG93bigpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXRleHQtZWRpdG9yJywgJ211bHRpLWN1cnNvcjpleHBhbmRVcCc6ID0+IEBleHBhbmRVcCgpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20tdGV4dC1lZGl0b3InLCAnbXVsdGktY3Vyc29yOm1vdmUtbGFzdC1jdXJzb3ItdXAnOiA9PiBAbW92ZUxhc3RDdXJzb3JVcCgpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXRleHQtZWRpdG9yJywgJ211bHRpLWN1cnNvcjptb3ZlLWxhc3QtY3Vyc29yLWRvd24nOiA9PiBAbW92ZUxhc3RDdXJzb3JEb3duKClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20tdGV4dC1lZGl0b3InLCAnbXVsdGktY3Vyc29yOm1vdmUtbGFzdC1jdXJzb3ItbGVmdCc6ID0+IEBtb3ZlTGFzdEN1cnNvckxlZnQoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcicsICdtdWx0aS1jdXJzb3I6bW92ZS1sYXN0LWN1cnNvci1yaWdodCc6ID0+IEBtb3ZlTGFzdEN1cnNvclJpZ2h0KClcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEBjdXJyZW50UG9zaXRpb24gPSBudWxsXG4gICAgQGZpcnN0QnVmZmVyID0gbnVsbFxuICAgIEBlZGl0b3IgPSBudWxsXG5cbiAgc2VyaWFsaXplOiAtPlxuICAgIEBjdXJyZW50UG9zaXRpb24gPSBudWxsXG5cbiAgZXhwYW5kRG93bjogLT5cbiAgICBAZXhwYW5kSW5EaXJlY3Rpb24oMSlcblxuICBleHBhbmRVcDogLT5cbiAgICBAZXhwYW5kSW5EaXJlY3Rpb24oLTEpXG5cbiAgZXhwYW5kSW5EaXJlY3Rpb246IChkaXIpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICByZXR1cm4gdW5sZXNzIGxhc3RDdXJzb3IgPSBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpXG4gICAgY3Vyc29ycyA9IGVkaXRvci5nZXRDdXJzb3JzKClcbiAgICBjb29yZHMgPSBsYXN0Q3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcblxuICAgIG5ld0Nvb3JkcyA9IHsgY29sdW1uOiBsYXN0Q3Vyc29yLmdvYWxDb2x1bW4gfHwgY29vcmRzLmNvbHVtbiwgcm93OiBjb29yZHMucm93ICsgZGlyICsgQHNraXBDb3VudCB9XG4gICAgcmV0dXJuIGlmIG5ld0Nvb3Jkcy5yb3cgPCAwIG9yIG5ld0Nvb3Jkcy5yb3cgPiBlZGl0b3IuZ2V0TGFzdEJ1ZmZlclJvdygpXG5cbiAgICBuZXdDdXJzb3IgPSBlZGl0b3IuYWRkQ3Vyc29yQXRCdWZmZXJQb3NpdGlvbihuZXdDb29yZHMpXG4gICAgbmV3Q3Vyc29yLmdvYWxDb2x1bW4gPSBsYXN0Q3Vyc29yLmdvYWxDb2x1bW4gfHwgY29vcmRzLmNvbHVtblxuXG4gICAgaWYgY3Vyc29ycy5sZW5ndGggaXMgZWRpdG9yLmdldEN1cnNvcnMoKS5sZW5ndGhcbiAgICAgICMgbm8gY3Vyc29yIHdhcyBhZGRlZCBzbyB3ZSB0cmllZCB0byBhZGQgYSBjdXJzb3Igd2hlcmUgdGhlcmUgaXMgb25lIGFscmVhZHlcbiAgICAgIGxhc3RDdXJzb3IuZGVzdHJveSgpIGlmIGVkaXRvci5oYXNNdWx0aXBsZUN1cnNvcnMoKVxuXG4gICAgQHNraXBDb3VudCA9IDBcblxuICBtb3ZlTGFzdEN1cnNvclVwOiAtPlxuICAgIEBza2lwQ291bnQgPSAwXG4gICAgcmV0dXJuIHVubGVzcyBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICByZXR1cm4gdW5sZXNzIGN1cnNvciA9IGVkaXRvci5nZXRMYXN0Q3Vyc29yKClcbiAgICBpZiBjdXJzb3Iuc2VsZWN0aW9uLmlzRW1wdHkoKVxuICAgICAgY3Vyc29yLm1vdmVVcCgpXG4gICAgZWxzZVxuICAgICAgY3Vyc29yLnNlbGVjdGlvbi5tb2RpZnlTZWxlY3Rpb24gLT4gY3Vyc29yLm1vdmVVcCgpXG4gICAgZWRpdG9yLm1lcmdlQ3Vyc29ycygpXG5cbiAgbW92ZUxhc3RDdXJzb3JEb3duOiAtPlxuICAgIEBza2lwQ291bnQgPSAwXG4gICAgcmV0dXJuIHVubGVzcyBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICByZXR1cm4gdW5sZXNzIGN1cnNvciA9IGVkaXRvci5nZXRMYXN0Q3Vyc29yKClcbiAgICBpZiBjdXJzb3Iuc2VsZWN0aW9uLmlzRW1wdHkoKVxuICAgICAgY3Vyc29yLm1vdmVEb3duKClcbiAgICBlbHNlXG4gICAgICBjdXJzb3Iuc2VsZWN0aW9uLm1vZGlmeVNlbGVjdGlvbiAtPiBjdXJzb3IubW92ZURvd24oKVxuICAgIGVkaXRvci5tZXJnZUN1cnNvcnMoKVxuXG4gIG1vdmVMYXN0Q3Vyc29yTGVmdDogLT5cbiAgICBAc2tpcENvdW50ID0gMFxuICAgIHJldHVybiB1bmxlc3MgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgcmV0dXJuIHVubGVzcyBjdXJzb3IgPSBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpXG4gICAgaWYgY3Vyc29yLnNlbGVjdGlvbi5pc0VtcHR5KClcbiAgICAgIGN1cnNvci5tb3ZlTGVmdCgpXG4gICAgZWxzZVxuICAgICAgY3Vyc29yLnNlbGVjdGlvbi5tb2RpZnlTZWxlY3Rpb24gLT4gY3Vyc29yLm1vdmVMZWZ0KClcbiAgICBlZGl0b3IubWVyZ2VDdXJzb3JzKClcblxuICBtb3ZlTGFzdEN1cnNvclJpZ2h0OiAtPlxuICAgIEBza2lwQ291bnQgPSAwXG4gICAgcmV0dXJuIHVubGVzcyBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICByZXR1cm4gdW5sZXNzIGN1cnNvciA9IGVkaXRvci5nZXRMYXN0Q3Vyc29yKClcbiAgICBpZiBjdXJzb3Iuc2VsZWN0aW9uLmlzRW1wdHkoKVxuICAgICAgY3Vyc29yLm1vdmVSaWdodCgpXG4gICAgZWxzZVxuICAgICAgY3Vyc29yLnNlbGVjdGlvbi5tb2RpZnlTZWxlY3Rpb24gLT4gY3Vyc29yLm1vdmVSaWdodCgpXG4gICAgZWRpdG9yLm1lcmdlQ3Vyc29ycygpXG4iXX0=
