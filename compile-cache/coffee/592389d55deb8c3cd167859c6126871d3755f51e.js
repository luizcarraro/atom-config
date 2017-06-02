(function() {
  var Dialog, RebaseDialog, git,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Dialog = require('./dialog');

  git = require('../git');

  module.exports = RebaseDialog = (function(superClass) {
    extend(RebaseDialog, superClass);

    function RebaseDialog() {
      return RebaseDialog.__super__.constructor.apply(this, arguments);
    }

    RebaseDialog.content = function() {
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
            return _this.strong('Rebase');
          });
          _this.div({
            "class": 'body'
          }, function() {
            _this.label('Current Branch');
            _this.input({
              "class": 'native-key-bindings',
              type: 'text',
              readonly: true,
              outlet: 'toBranch'
            });
            _this.label('Rebase On Branch');
            return _this.select({
              "class": 'native-key-bindings',
              outlet: 'fromBranch'
            });
          });
          return _this.div({
            "class": 'buttons'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'rebase'
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

    RebaseDialog.prototype.activate = function(branches) {
      var branch, current, i, len;
      current = git.getLocalBranch();
      this.toBranch.val(current);
      this.fromBranch.find('option').remove();
      for (i = 0, len = branches.length; i < len; i++) {
        branch = branches[i];
        if (branch !== current) {
          this.fromBranch.append("<option value='" + branch + "'>" + branch + "</option>");
        }
      }
      return RebaseDialog.__super__.activate.call(this);
    };

    RebaseDialog.prototype.rebase = function() {
      this.deactivate();
      this.parentView.rebase(this.fromBranch.val());
    };

    return RebaseDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi9kaWFsb2dzL3JlYmFzZS1kaWFsb2cuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx5QkFBQTtJQUFBOzs7RUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0VBRVQsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUVOLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7SUFDSixZQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxRQUFQO09BQUwsRUFBc0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ3BCLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFNBQVA7V0FBTCxFQUF1QixTQUFBO1lBQ3JCLEtBQUMsQ0FBQSxDQUFELENBQUc7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGtCQUFQO2NBQTJCLEtBQUEsRUFBTyxRQUFsQzthQUFIO21CQUNBLEtBQUMsQ0FBQSxNQUFELENBQVEsUUFBUjtVQUZxQixDQUF2QjtVQUdBLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLE1BQVA7V0FBTCxFQUFvQixTQUFBO1lBQ2xCLEtBQUMsQ0FBQSxLQUFELENBQU8sZ0JBQVA7WUFDQSxLQUFDLENBQUEsS0FBRCxDQUFPO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxxQkFBUDtjQUE4QixJQUFBLEVBQU0sTUFBcEM7Y0FBNEMsUUFBQSxFQUFVLElBQXREO2NBQTRELE1BQUEsRUFBUSxVQUFwRTthQUFQO1lBQ0EsS0FBQyxDQUFBLEtBQUQsQ0FBTyxrQkFBUDttQkFDQSxLQUFDLENBQUEsTUFBRCxDQUFRO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxxQkFBUDtjQUE4QixNQUFBLEVBQVEsWUFBdEM7YUFBUjtVQUprQixDQUFwQjtpQkFNQSxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxTQUFQO1dBQUwsRUFBdUIsU0FBQTtZQUNyQixLQUFDLENBQUEsTUFBRCxDQUFRO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxRQUFQO2NBQWlCLEtBQUEsRUFBTyxRQUF4QjthQUFSLEVBQTBDLFNBQUE7Y0FDeEMsS0FBQyxDQUFBLENBQUQsQ0FBRztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLG9CQUFQO2VBQUg7cUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTSxRQUFOO1lBRndDLENBQTFDO21CQUdBLEtBQUMsQ0FBQSxNQUFELENBQVE7Y0FBQSxLQUFBLEVBQU8sUUFBUDthQUFSLEVBQXlCLFNBQUE7Y0FDdkIsS0FBQyxDQUFBLENBQUQsQ0FBRztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFFBQVA7ZUFBSDtxQkFDQSxLQUFDLENBQUEsSUFBRCxDQUFNLFFBQU47WUFGdUIsQ0FBekI7VUFKcUIsQ0FBdkI7UUFWb0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRCO0lBRFE7OzJCQW1CVixRQUFBLEdBQVUsU0FBQyxRQUFEO0FBQ1IsVUFBQTtNQUFBLE9BQUEsR0FBVSxHQUFHLENBQUMsY0FBSixDQUFBO01BRVYsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsT0FBZDtNQUNBLElBQUMsQ0FBQSxVQUFVLENBQUMsSUFBWixDQUFpQixRQUFqQixDQUEwQixDQUFDLE1BQTNCLENBQUE7QUFFQSxXQUFBLDBDQUFBOztZQUE0QixNQUFBLEtBQVk7VUFDdEMsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLENBQW1CLGlCQUFBLEdBQWtCLE1BQWxCLEdBQXlCLElBQXpCLEdBQTZCLE1BQTdCLEdBQW9DLFdBQXZEOztBQURGO0FBR0EsYUFBTyx5Q0FBQTtJQVRDOzsyQkFXVixNQUFBLEdBQVEsU0FBQTtNQUNOLElBQUMsQ0FBQSxVQUFELENBQUE7TUFDQSxJQUFDLENBQUEsVUFBVSxDQUFDLE1BQVosQ0FBbUIsSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFaLENBQUEsQ0FBbkI7SUFGTTs7OztLQS9CaUI7QUFMM0IiLCJzb3VyY2VzQ29udGVudCI6WyJEaWFsb2cgPSByZXF1aXJlICcuL2RpYWxvZydcblxuZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBSZWJhc2VEaWFsb2cgZXh0ZW5kcyBEaWFsb2dcbiAgQGNvbnRlbnQ6IC0+XG4gICAgQGRpdiBjbGFzczogJ2RpYWxvZycsID0+XG4gICAgICBAZGl2IGNsYXNzOiAnaGVhZGluZycsID0+XG4gICAgICAgIEBpIGNsYXNzOiAnaWNvbiB4IGNsaWNrYWJsZScsIGNsaWNrOiAnY2FuY2VsJ1xuICAgICAgICBAc3Ryb25nICdSZWJhc2UnXG4gICAgICBAZGl2IGNsYXNzOiAnYm9keScsID0+XG4gICAgICAgIEBsYWJlbCAnQ3VycmVudCBCcmFuY2gnXG4gICAgICAgIEBpbnB1dCBjbGFzczogJ25hdGl2ZS1rZXktYmluZGluZ3MnLCB0eXBlOiAndGV4dCcsIHJlYWRvbmx5OiB0cnVlLCBvdXRsZXQ6ICd0b0JyYW5jaCdcbiAgICAgICAgQGxhYmVsICdSZWJhc2UgT24gQnJhbmNoJ1xuICAgICAgICBAc2VsZWN0IGNsYXNzOiAnbmF0aXZlLWtleS1iaW5kaW5ncycsIG91dGxldDogJ2Zyb21CcmFuY2gnXG4gICAgICAgIFxuICAgICAgQGRpdiBjbGFzczogJ2J1dHRvbnMnLCA9PlxuICAgICAgICBAYnV0dG9uIGNsYXNzOiAnYWN0aXZlJywgY2xpY2s6ICdyZWJhc2UnLCA9PlxuICAgICAgICAgIEBpIGNsYXNzOiAnaWNvbiBjaXJjdWl0LWJvYXJkJ1xuICAgICAgICAgIEBzcGFuICdSZWJhc2UnXG4gICAgICAgIEBidXR0b24gY2xpY2s6ICdjYW5jZWwnLCA9PlxuICAgICAgICAgIEBpIGNsYXNzOiAnaWNvbiB4J1xuICAgICAgICAgIEBzcGFuICdDYW5jZWwnXG5cbiAgYWN0aXZhdGU6IChicmFuY2hlcykgLT5cbiAgICBjdXJyZW50ID0gZ2l0LmdldExvY2FsQnJhbmNoKClcblxuICAgIEB0b0JyYW5jaC52YWwoY3VycmVudClcbiAgICBAZnJvbUJyYW5jaC5maW5kKCdvcHRpb24nKS5yZW1vdmUoKVxuXG4gICAgZm9yIGJyYW5jaCBpbiBicmFuY2hlcyB3aGVuIGJyYW5jaCBpc250IGN1cnJlbnRcbiAgICAgIEBmcm9tQnJhbmNoLmFwcGVuZCBcIjxvcHRpb24gdmFsdWU9JyN7YnJhbmNofSc+I3ticmFuY2h9PC9vcHRpb24+XCJcblxuICAgIHJldHVybiBzdXBlcigpXG5cbiAgcmViYXNlOiAtPlxuICAgIEBkZWFjdGl2YXRlKClcbiAgICBAcGFyZW50Vmlldy5yZWJhc2UoQGZyb21CcmFuY2gudmFsKCkpXG5cbiAgICByZXR1cm5cbiJdfQ==
