(function() {
  var Dialog, MidrebaseDialog, git,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Dialog = require('./dialog');

  git = require('../git');

  module.exports = MidrebaseDialog = (function(superClass) {
    extend(MidrebaseDialog, superClass);

    function MidrebaseDialog() {
      return MidrebaseDialog.__super__.constructor.apply(this, arguments);
    }

    MidrebaseDialog.content = function() {
      return this.div({
        "class": 'dialog'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'heading'
          }, function() {
            _this.i({
              "class": 'icon x clickable',
              click: 'cancel'
            });
            return _this.strong('It appears that you are in the middle of a rebase, would you like to:');
          });
          _this.div({
            "class": 'body'
          }, function() {
            _this.label('Continue the rebase');
            _this.input({
              type: 'checkbox',
              "class": 'checkbox',
              outlet: 'contin'
            });
            _this.div(function() {
              _this.label('Abort the rebase');
              return _this.input({
                type: 'checkbox',
                "class": 'checkbox',
                outlet: 'abort'
              });
            });
            return _this.div(function() {
              _this.label('Skip the patch');
              return _this.input({
                type: 'checkbox',
                "class": 'checkbox',
                outlet: 'skip'
              });
            });
          });
          return _this.div({
            "class": 'buttons'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'midrebase'
            }, function() {
              _this.i({
                "class": 'icon circuit-board'
              });
              return _this.span('Rebase');
            });
            return _this.button({
              click: 'cancel'
            }, function() {
              _this.i({
                "class": 'icon x'
              });
              return _this.span('Cancel');
            });
          });
        };
      })(this));
    };

    MidrebaseDialog.prototype.midrebase = function() {
      this.deactivate();
      this.parentView.midrebase(this.Contin(), this.Abort(), this.Skip());
    };

    MidrebaseDialog.prototype.Contin = function() {
      return this.contin.is(':checked');
    };

    MidrebaseDialog.prototype.Abort = function() {
      return this.abort.is(':checked');
    };

    MidrebaseDialog.prototype.Skip = function() {
      return this.skip.is(':checked');
    };

    return MidrebaseDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi9kaWFsb2dzL21pZHJlYmFzZS1kaWFsb2cuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSw0QkFBQTtJQUFBOzs7RUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0VBRVQsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUVOLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7SUFDSixlQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxRQUFQO09BQUwsRUFBc0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ3BCLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFNBQVA7V0FBTCxFQUF1QixTQUFBO1lBQ3JCLEtBQUMsQ0FBQSxDQUFELENBQUc7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGtCQUFQO2NBQTJCLEtBQUEsRUFBTyxRQUFsQzthQUFIO21CQUNBLEtBQUMsQ0FBQSxNQUFELENBQVEsdUVBQVI7VUFGcUIsQ0FBdkI7VUFHQSxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxNQUFQO1dBQUwsRUFBb0IsU0FBQTtZQUNsQixLQUFDLENBQUEsS0FBRCxDQUFPLHFCQUFQO1lBQ0EsS0FBQyxDQUFBLEtBQUQsQ0FBTztjQUFBLElBQUEsRUFBTSxVQUFOO2NBQWlCLENBQUEsS0FBQSxDQUFBLEVBQU8sVUFBeEI7Y0FBbUMsTUFBQSxFQUFRLFFBQTNDO2FBQVA7WUFDQSxLQUFDLENBQUEsR0FBRCxDQUFLLFNBQUE7Y0FDSCxLQUFDLENBQUEsS0FBRCxDQUFPLGtCQUFQO3FCQUNBLEtBQUMsQ0FBQSxLQUFELENBQU87Z0JBQUEsSUFBQSxFQUFNLFVBQU47Z0JBQWlCLENBQUEsS0FBQSxDQUFBLEVBQU8sVUFBeEI7Z0JBQW1DLE1BQUEsRUFBUSxPQUEzQztlQUFQO1lBRkcsQ0FBTDttQkFHQSxLQUFDLENBQUEsR0FBRCxDQUFLLFNBQUE7Y0FDSCxLQUFDLENBQUEsS0FBRCxDQUFPLGdCQUFQO3FCQUNBLEtBQUMsQ0FBQSxLQUFELENBQU87Z0JBQUEsSUFBQSxFQUFNLFVBQU47Z0JBQWlCLENBQUEsS0FBQSxDQUFBLEVBQU8sVUFBeEI7Z0JBQW1DLE1BQUEsRUFBUSxNQUEzQztlQUFQO1lBRkcsQ0FBTDtVQU5rQixDQUFwQjtpQkFTQSxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxTQUFQO1dBQUwsRUFBdUIsU0FBQTtZQUNyQixLQUFDLENBQUEsTUFBRCxDQUFRO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxRQUFQO2NBQWlCLEtBQUEsRUFBTyxXQUF4QjthQUFSLEVBQTZDLFNBQUE7Y0FDM0MsS0FBQyxDQUFBLENBQUQsQ0FBRztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLG9CQUFQO2VBQUg7cUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTSxRQUFOO1lBRjJDLENBQTdDO21CQUdBLEtBQUMsQ0FBQSxNQUFELENBQVE7Y0FBQSxLQUFBLEVBQU8sUUFBUDthQUFSLEVBQXlCLFNBQUE7Y0FDdkIsS0FBQyxDQUFBLENBQUQsQ0FBRztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFFBQVA7ZUFBSDtxQkFDQSxLQUFDLENBQUEsSUFBRCxDQUFNLFFBQU47WUFGdUIsQ0FBekI7VUFKcUIsQ0FBdkI7UUFib0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRCO0lBRFE7OzhCQXNCVixTQUFBLEdBQVcsU0FBQTtNQUNULElBQUMsQ0FBQSxVQUFELENBQUE7TUFDQSxJQUFDLENBQUEsVUFBVSxDQUFDLFNBQVosQ0FBc0IsSUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUF0QixFQUFnQyxJQUFDLENBQUEsS0FBRCxDQUFBLENBQWhDLEVBQXlDLElBQUMsQ0FBQSxJQUFELENBQUEsQ0FBekM7SUFGUzs7OEJBS1gsTUFBQSxHQUFRLFNBQUE7QUFDTixhQUFPLElBQUMsQ0FBQSxNQUFNLENBQUMsRUFBUixDQUFXLFVBQVg7SUFERDs7OEJBR1IsS0FBQSxHQUFPLFNBQUE7QUFDTCxhQUFPLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBUCxDQUFVLFVBQVY7SUFERjs7OEJBR1AsSUFBQSxHQUFNLFNBQUE7QUFDSixhQUFPLElBQUMsQ0FBQSxJQUFJLENBQUMsRUFBTixDQUFTLFVBQVQ7SUFESDs7OztLQWxDc0I7QUFMOUIiLCJzb3VyY2VzQ29udGVudCI6WyJEaWFsb2cgPSByZXF1aXJlICcuL2RpYWxvZydcblxuZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBNaWRyZWJhc2VEaWFsb2cgZXh0ZW5kcyBEaWFsb2dcbiAgQGNvbnRlbnQ6IC0+XG4gICAgQGRpdiBjbGFzczogJ2RpYWxvZycsID0+XG4gICAgICBAZGl2IGNsYXNzOiAnaGVhZGluZycsID0+XG4gICAgICAgIEBpIGNsYXNzOiAnaWNvbiB4IGNsaWNrYWJsZScsIGNsaWNrOiAnY2FuY2VsJ1xuICAgICAgICBAc3Ryb25nICdJdCBhcHBlYXJzIHRoYXQgeW91IGFyZSBpbiB0aGUgbWlkZGxlIG9mIGEgcmViYXNlLCB3b3VsZCB5b3UgbGlrZSB0bzonXG4gICAgICBAZGl2IGNsYXNzOiAnYm9keScsID0+XG4gICAgICAgIEBsYWJlbCAnQ29udGludWUgdGhlIHJlYmFzZSdcbiAgICAgICAgQGlucHV0IHR5cGU6ICdjaGVja2JveCcsY2xhc3M6ICdjaGVja2JveCcsb3V0bGV0OiAnY29udGluJ1xuICAgICAgICBAZGl2ID0+XG4gICAgICAgICAgQGxhYmVsICdBYm9ydCB0aGUgcmViYXNlJ1xuICAgICAgICAgIEBpbnB1dCB0eXBlOiAnY2hlY2tib3gnLGNsYXNzOiAnY2hlY2tib3gnLG91dGxldDogJ2Fib3J0J1xuICAgICAgICBAZGl2ID0+XG4gICAgICAgICAgQGxhYmVsICdTa2lwIHRoZSBwYXRjaCdcbiAgICAgICAgICBAaW5wdXQgdHlwZTogJ2NoZWNrYm94JyxjbGFzczogJ2NoZWNrYm94JyxvdXRsZXQ6ICdza2lwJ1xuICAgICAgQGRpdiBjbGFzczogJ2J1dHRvbnMnLCA9PlxuICAgICAgICBAYnV0dG9uIGNsYXNzOiAnYWN0aXZlJywgY2xpY2s6ICdtaWRyZWJhc2UnLCA9PlxuICAgICAgICAgIEBpIGNsYXNzOiAnaWNvbiBjaXJjdWl0LWJvYXJkJ1xuICAgICAgICAgIEBzcGFuICdSZWJhc2UnXG4gICAgICAgIEBidXR0b24gY2xpY2s6ICdjYW5jZWwnLCA9PlxuICAgICAgICAgIEBpIGNsYXNzOiAnaWNvbiB4J1xuICAgICAgICAgIEBzcGFuICdDYW5jZWwnXG5cbiAgbWlkcmViYXNlOiAtPlxuICAgIEBkZWFjdGl2YXRlKClcbiAgICBAcGFyZW50Vmlldy5taWRyZWJhc2UoQENvbnRpbigpLEBBYm9ydCgpLEBTa2lwKCkpXG4gICAgcmV0dXJuXG5cbiAgQ29udGluOiAtPlxuICAgIHJldHVybiBAY29udGluLmlzKCc6Y2hlY2tlZCcpXG5cbiAgQWJvcnQ6IC0+XG4gICAgcmV0dXJuIEBhYm9ydC5pcygnOmNoZWNrZWQnKVxuXG4gIFNraXA6IC0+XG4gICAgcmV0dXJuIEBza2lwLmlzKCc6Y2hlY2tlZCcpXG4iXX0=
