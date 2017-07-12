(function() {
  var CompositeDisposable, SublimeWordNavigation;

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = SublimeWordNavigation = {
    subscriptions: null,
    activate: function(state) {
      this.subscriptions = new CompositeDisposable;
      return this.subscriptions.add(atom.commands.add('atom-text-editor', {
        'sublime-word-navigation:move-to-beginning-of-word': (function(_this) {
          return function() {
            return _this.moveToBeginningOfWord();
          };
        })(this),
        'sublime-word-navigation:move-to-end-of-word': (function(_this) {
          return function() {
            return _this.moveToEndOfWord();
          };
        })(this),
        'sublime-word-navigation:select-to-beginning-of-word': (function(_this) {
          return function() {
            return _this.selectToBeginningOfWord();
          };
        })(this),
        'sublime-word-navigation:select-to-end-of-word': (function(_this) {
          return function() {
            return _this.selectToEndOfWord();
          };
        })(this),
        'sublime-word-navigation:delete-to-beginning-of-word': (function(_this) {
          return function() {
            return _this.deleteToBeginningOfWord();
          };
        })(this),
        'sublime-word-navigation:delete-to-end-of-word': (function(_this) {
          return function() {
            return _this.deleteToEndOfWord();
          };
        })(this)
      }));
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    },
    getEditor: function() {
      return atom.workspace.getActiveTextEditor();
    },
    getCursors: function() {
      return this.getEditor().getCursors();
    },
    getSelections: function() {
      return this.getEditor().getSelections();
    },
    moveCursorToBeginningOfWord: function(cursor) {
      var beginningOfWordPosition;
      beginningOfWordPosition = cursor.getBeginningOfCurrentWordBufferPosition({
        includeNonWordCharacters: false
      });
      if (cursor.isAtBeginningOfLine()) {
        cursor.moveUp();
        return cursor.moveToEndOfLine();
      } else if (beginningOfWordPosition.row < cursor.getBufferPosition().row) {
        return cursor.moveToBeginningOfLine();
      } else {
        return cursor.setBufferPosition(beginningOfWordPosition);
      }
    },
    moveCursorToEndOfWord: function(cursor) {
      var endOfWordPosition;
      endOfWordPosition = cursor.getEndOfCurrentWordBufferPosition({
        includeNonWordCharacters: false
      });
      if (cursor.isAtEndOfLine()) {
        cursor.moveDown();
        return cursor.moveToBeginningOfLine();
      } else if (endOfWordPosition.row > cursor.getBufferPosition().row) {
        return cursor.moveToEndOfLine();
      } else {
        return cursor.setBufferPosition(endOfWordPosition);
      }
    },
    moveToBeginningOfWord: function() {
      return this.getCursors().forEach(this.moveCursorToBeginningOfWord);
    },
    moveToEndOfWord: function() {
      return this.getCursors().forEach(this.moveCursorToEndOfWord);
    },
    selectToBeginningOfWord: function() {
      return this.getSelections().forEach((function(_this) {
        return function(selection) {
          return selection.modifySelection(function() {
            return _this.moveCursorToBeginningOfWord(selection.cursor);
          });
        };
      })(this));
    },
    selectToEndOfWord: function() {
      return this.getSelections().forEach((function(_this) {
        return function(selection) {
          return selection.modifySelection(function() {
            return _this.moveCursorToEndOfWord(selection.cursor);
          });
        };
      })(this));
    },
    deleteToBeginningOfWord: function() {
      return this.getEditor().mutateSelectedText((function(_this) {
        return function(selection) {
          if (selection.isEmpty()) {
            selection.modifySelection(function() {
              return _this.moveCursorToBeginningOfWord(selection.cursor);
            });
          }
          return selection.deleteSelectedText();
        };
      })(this));
    },
    deleteToEndOfWord: function() {
      return this.getEditor().mutateSelectedText((function(_this) {
        return function(selection) {
          if (selection.isEmpty()) {
            selection.modifySelection(function() {
              return _this.moveCursorToEndOfWord(selection.cursor);
            });
          }
          return selection.deleteSelectedText();
        };
      })(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL3N1YmxpbWUtd29yZC1uYXZpZ2F0aW9uL2xpYi9zdWJsaW1lLXdvcmQtbmF2aWdhdGlvbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFFeEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIscUJBQUEsR0FDZjtJQUFBLGFBQUEsRUFBZSxJQUFmO0lBRUEsUUFBQSxFQUFVLFNBQUMsS0FBRDtNQUVSLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7YUFHckIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixrQkFBbEIsRUFDakI7UUFBQSxtREFBQSxFQUFxRCxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxxQkFBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJEO1FBQ0EsNkNBQUEsRUFBK0MsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsZUFBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRC9DO1FBRUEscURBQUEsRUFBdUQsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsdUJBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUZ2RDtRQUdBLCtDQUFBLEVBQWlELENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLGlCQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FIakQ7UUFJQSxxREFBQSxFQUF1RCxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSx1QkFBRCxDQUFB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QUMsTUFBakM7VUFBSCxDQUExQjtRQUR1QjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekI7SUFEaUIsQ0E3RG5CO0lBaUVBLHVCQUFBLEVBQXlCLFNBQUE7YUFDdkIsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFZLENBQUMsa0JBQWIsQ0FBZ0MsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLFNBQUQ7VUFDOUIsSUFBRyxTQUFTLENBQUMsT0FBVixDQUFBLENBQUg7WUFDRSxTQUFTLENBQUMsZUFBVixDQUEwQixTQUFBO3FCQUFHLEtBQUMsQ0FBQSwyQkFBRCxDQUE2QixTQUFTLENBQUMsTUFBdkM7WUFBSCxDQUExQixFQURGOztpQkFFQSxTQUFTLENBQUMsa0JBQVYsQ0FBQTtRQUg4QjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEM7SUFEdUIsQ0FqRXpCO0lBdUVBLGlCQUFBLEVBQW1CLFNBQUE7YUFDakIsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFZLENBQUMsa0JBQWIsQ0FBZ0MsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLFNBQUQ7VUFDOUIsSUFBRyxTQUFTLENBQUMsT0FBVixDQUFBLENBQUg7WUFDRSxTQUFTLENBQUMsZUFBVixDQUEwQixTQUFBO3FCQUFHLEtBQUMsQ0FBQSxxQkFBRCxDQUF1QixTQUFTLENBQUMsTUFBakM7WUFBSCxDQUExQixFQURGOztpQkFFQSxTQUFTLENBQUMsa0JBQVYsQ0FBQTtRQUg4QjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEM7SUFEaUIsQ0F2RW5COztBQUhGIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxubW9kdWxlLmV4cG9ydHMgPSBTdWJsaW1lV29yZE5hdmlnYXRpb24gPVxuICBzdWJzY3JpcHRpb25zOiBudWxsXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICAjIEV2ZW50cyBzdWJzY3JpYmVkIHRvIGluIGF0b20ncyBzeXN0ZW0gY2FuIGJlIGVhc2lseSBjbGVhbmVkIHVwIHdpdGggYSBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG4gICAgIyBSZWdpc3RlciBjb21tYW5kIHRoYXQgdG9nZ2xlcyB0aGlzIHZpZXdcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20tdGV4dC1lZGl0b3InLFxuICAgICAgJ3N1YmxpbWUtd29yZC1uYXZpZ2F0aW9uOm1vdmUtdG8tYmVnaW5uaW5nLW9mLXdvcmQnOiA9PiBAbW92ZVRvQmVnaW5uaW5nT2ZXb3JkKClcbiAgICAgICdzdWJsaW1lLXdvcmQtbmF2aWdhdGlvbjptb3ZlLXRvLWVuZC1vZi13b3JkJzogPT4gQG1vdmVUb0VuZE9mV29yZCgpXG4gICAgICAnc3VibGltZS13b3JkLW5hdmlnYXRpb246c2VsZWN0LXRvLWJlZ2lubmluZy1vZi13b3JkJzogPT4gQHNlbGVjdFRvQmVnaW5uaW5nT2ZXb3JkKClcbiAgICAgICdzdWJsaW1lLXdvcmQtbmF2aWdhdGlvbjpzZWxlY3QtdG8tZW5kLW9mLXdvcmQnOiA9PiBAc2VsZWN0VG9FbmRPZldvcmQoKVxuICAgICAgJ3N1YmxpbWUtd29yZC1uYXZpZ2F0aW9uOmRlbGV0ZS10by1iZWdpbm5pbmctb2Ytd29yZCc6ID0+IEBkZWxldGVUb0JlZ2lubmluZ09mV29yZCgpXG4gICAgICAnc3VibGltZS13b3JkLW5hdmlnYXRpb246ZGVsZXRlLXRvLWVuZC1vZi13b3JkJzogPT4gQGRlbGV0ZVRvRW5kT2ZXb3JkKClcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuXG4gIGdldEVkaXRvcjogLT5cbiAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcblxuICBnZXRDdXJzb3JzOiAtPlxuICAgIEBnZXRFZGl0b3IoKS5nZXRDdXJzb3JzKClcblxuICBnZXRTZWxlY3Rpb25zOiAtPlxuICAgIEBnZXRFZGl0b3IoKS5nZXRTZWxlY3Rpb25zKClcblxuICBtb3ZlQ3Vyc29yVG9CZWdpbm5pbmdPZldvcmQ6IChjdXJzb3IpIC0+XG4gICAgYmVnaW5uaW5nT2ZXb3JkUG9zaXRpb24gPSBjdXJzb3IuZ2V0QmVnaW5uaW5nT2ZDdXJyZW50V29yZEJ1ZmZlclBvc2l0aW9uKHtcbiAgICAgIGluY2x1ZGVOb25Xb3JkQ2hhcmFjdGVyczogZmFsc2VcbiAgICB9KVxuICAgIGlmIGN1cnNvci5pc0F0QmVnaW5uaW5nT2ZMaW5lKClcbiAgICAgIGN1cnNvci5tb3ZlVXAoKVxuICAgICAgY3Vyc29yLm1vdmVUb0VuZE9mTGluZSgpXG4gICAgZWxzZSBpZiBiZWdpbm5pbmdPZldvcmRQb3NpdGlvbi5yb3cgPCBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKS5yb3dcbiAgICAgIGN1cnNvci5tb3ZlVG9CZWdpbm5pbmdPZkxpbmUoKVxuICAgIGVsc2VcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihiZWdpbm5pbmdPZldvcmRQb3NpdGlvbilcblxuICBtb3ZlQ3Vyc29yVG9FbmRPZldvcmQ6IChjdXJzb3IpIC0+XG4gICAgZW5kT2ZXb3JkUG9zaXRpb24gPSBjdXJzb3IuZ2V0RW5kT2ZDdXJyZW50V29yZEJ1ZmZlclBvc2l0aW9uKHtcbiAgICAgIGluY2x1ZGVOb25Xb3JkQ2hhcmFjdGVyczogZmFsc2VcbiAgICB9KVxuICAgIGlmIGN1cnNvci5pc0F0RW5kT2ZMaW5lKClcbiAgICAgIGN1cnNvci5tb3ZlRG93bigpXG4gICAgICBjdXJzb3IubW92ZVRvQmVnaW5uaW5nT2ZMaW5lKClcbiAgICBlbHNlIGlmIGVuZE9mV29yZFBvc2l0aW9uLnJvdyA+IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpLnJvd1xuICAgICAgY3Vyc29yLm1vdmVUb0VuZE9mTGluZSgpXG4gICAgZWxzZVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKGVuZE9mV29yZFBvc2l0aW9uKVxuXG4gIG1vdmVUb0JlZ2lubmluZ09mV29yZDogLT5cbiAgICBAZ2V0Q3Vyc29ycygpLmZvckVhY2goQG1vdmVDdXJzb3JUb0JlZ2lubmluZ09mV29yZClcblxuICBtb3ZlVG9FbmRPZldvcmQ6IC0+XG4gICAgQGdldEN1cnNvcnMoKS5mb3JFYWNoKEBtb3ZlQ3Vyc29yVG9FbmRPZldvcmQpXG5cbiAgc2VsZWN0VG9CZWdpbm5pbmdPZldvcmQ6IC0+XG4gICAgQGdldFNlbGVjdGlvbnMoKS5mb3JFYWNoIChzZWxlY3Rpb24pID0+XG4gICAgICBzZWxlY3Rpb24ubW9kaWZ5U2VsZWN0aW9uID0+IEBtb3ZlQ3Vyc29yVG9CZWdpbm5pbmdPZldvcmQoc2VsZWN0aW9uLmN1cnNvcilcblxuICBzZWxlY3RUb0VuZE9mV29yZDogLT5cbiAgICBAZ2V0U2VsZWN0aW9ucygpLmZvckVhY2ggKHNlbGVjdGlvbikgPT5cbiAgICAgIHNlbGVjdGlvbi5tb2RpZnlTZWxlY3Rpb24gPT4gQG1vdmVDdXJzb3JUb0VuZE9mV29yZChzZWxlY3Rpb24uY3Vyc29yKVxuXG4gIGRlbGV0ZVRvQmVnaW5uaW5nT2ZXb3JkOiAtPlxuICAgIEBnZXRFZGl0b3IoKS5tdXRhdGVTZWxlY3RlZFRleHQgKHNlbGVjdGlvbikgPT5cbiAgICAgIGlmIHNlbGVjdGlvbi5pc0VtcHR5KClcbiAgICAgICAgc2VsZWN0aW9uLm1vZGlmeVNlbGVjdGlvbiA9PiBAbW92ZUN1cnNvclRvQmVnaW5uaW5nT2ZXb3JkKHNlbGVjdGlvbi5jdXJzb3IpXG4gICAgICBzZWxlY3Rpb24uZGVsZXRlU2VsZWN0ZWRUZXh0KClcblxuICBkZWxldGVUb0VuZE9mV29yZDogLT5cbiAgICBAZ2V0RWRpdG9yKCkubXV0YXRlU2VsZWN0ZWRUZXh0IChzZWxlY3Rpb24pID0+XG4gICAgICBpZiBzZWxlY3Rpb24uaXNFbXB0eSgpXG4gICAgICAgIHNlbGVjdGlvbi5tb2RpZnlTZWxlY3Rpb24gPT4gQG1vdmVDdXJzb3JUb0VuZE9mV29yZChzZWxlY3Rpb24uY3Vyc29yKVxuICAgICAgc2VsZWN0aW9uLmRlbGV0ZVNlbGVjdGVkVGV4dCgpXG4iXX0=
