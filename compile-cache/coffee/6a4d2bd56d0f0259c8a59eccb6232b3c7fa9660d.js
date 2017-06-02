(function() {
  var Dialog, PushTagsDialog, git,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Dialog = require('./dialog');

  git = require('../git');

  module.exports = PushTagsDialog = (function(superClass) {
    extend(PushTagsDialog, superClass);

    function PushTagsDialog() {
      return PushTagsDialog.__super__.constructor.apply(this, arguments);
    }

    PushTagsDialog.content = function() {
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
            return _this.strong('Push Tags');
          });
          return _this.div({
            "class": 'body'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'ptago'
            }, function() {
              _this.i({
                "class": 'icon versions'
              });
              return _this.span('Push tags to origin');
            });
            _this.button({
              "class": 'active',
              click: 'ptagup'
            }, function() {
              _this.i({
                "class": 'icon versions'
              });
              return _this.span('Push tags to upstream');
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

    PushTagsDialog.prototype.ptago = function() {
      var remote;
      this.deactivate();
      remote = 'origin';
      return this.parentView.ptag(remote);
    };

    PushTagsDialog.prototype.ptagup = function() {
      var remote;
      this.deactivate();
      remote = 'upstream';
      return this.parentView.ptag(remote);
    };

    return PushTagsDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi9kaWFsb2dzL3B1c2gtdGFncy1kaWFsb2cuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwyQkFBQTtJQUFBOzs7RUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0VBQ1QsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUVOLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7SUFDSixjQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxRQUFQO09BQUwsRUFBc0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ3BCLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFNBQVA7V0FBTCxFQUF1QixTQUFBO1lBQ3JCLEtBQUMsQ0FBQSxDQUFELENBQUc7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGtCQUFQO2NBQTBCLEtBQUEsRUFBTyxRQUFqQzthQUFIO21CQUNBLEtBQUMsQ0FBQSxNQUFELENBQVEsV0FBUjtVQUZxQixDQUF2QjtpQkFHQSxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxNQUFQO1dBQUwsRUFBb0IsU0FBQTtZQUNsQixLQUFDLENBQUEsTUFBRCxDQUFRO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxRQUFQO2NBQWlCLEtBQUEsRUFBTyxPQUF4QjthQUFSLEVBQXdDLFNBQUE7Y0FDdEMsS0FBQyxDQUFBLENBQUQsQ0FBRztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGVBQVA7ZUFBSDtxQkFDQSxLQUFDLENBQUEsSUFBRCxDQUFNLHFCQUFOO1lBRnNDLENBQXhDO1lBR0EsS0FBQyxDQUFBLE1BQUQsQ0FBUTtjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sUUFBUDtjQUFpQixLQUFBLEVBQU8sUUFBeEI7YUFBUixFQUF5QyxTQUFBO2NBQ3ZDLEtBQUMsQ0FBQSxDQUFELENBQUc7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxlQUFQO2VBQUg7cUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTSx1QkFBTjtZQUZ1QyxDQUF6QzttQkFHQSxLQUFDLENBQUEsTUFBRCxDQUFRO2NBQUEsS0FBQSxFQUFPLFFBQVA7YUFBUixFQUF5QixTQUFBO2NBQ3ZCLEtBQUMsQ0FBQSxDQUFELENBQUc7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxRQUFQO2VBQUg7cUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTSxRQUFOO1lBRnVCLENBQXpCO1VBUGtCLENBQXBCO1FBSm9CO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QjtJQURROzs2QkFpQlYsS0FBQSxHQUFPLFNBQUE7QUFDTCxVQUFBO01BQUEsSUFBQyxDQUFBLFVBQUQsQ0FBQTtNQUNBLE1BQUEsR0FBUzthQUNULElBQUMsQ0FBQSxVQUFVLENBQUMsSUFBWixDQUFpQixNQUFqQjtJQUhLOzs2QkFLUCxNQUFBLEdBQVEsU0FBQTtBQUNOLFVBQUE7TUFBQSxJQUFDLENBQUEsVUFBRCxDQUFBO01BQ0EsTUFBQSxHQUFTO2FBQ1QsSUFBQyxDQUFBLFVBQVUsQ0FBQyxJQUFaLENBQWlCLE1BQWpCO0lBSE07Ozs7S0F2Qm1CO0FBSjdCIiwic291cmNlc0NvbnRlbnQiOlsiRGlhbG9nID0gcmVxdWlyZSAnLi9kaWFsb2cnXG5naXQgPSByZXF1aXJlICcuLi9naXQnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFB1c2hUYWdzRGlhbG9nIGV4dGVuZHMgRGlhbG9nXG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6ICdkaWFsb2cnLCA9PlxuICAgICAgQGRpdiBjbGFzczogJ2hlYWRpbmcnLCA9PlxuICAgICAgICBAaSBjbGFzczogJ2ljb24geCBjbGlja2FibGUnLGNsaWNrOiAnY2FuY2VsJ1xuICAgICAgICBAc3Ryb25nICdQdXNoIFRhZ3MnXG4gICAgICBAZGl2IGNsYXNzOiAnYm9keScsID0+XG4gICAgICAgIEBidXR0b24gY2xhc3M6ICdhY3RpdmUnLCBjbGljazogJ3B0YWdvJyw9PlxuICAgICAgICAgIEBpIGNsYXNzOiAnaWNvbiB2ZXJzaW9ucydcbiAgICAgICAgICBAc3BhbiAnUHVzaCB0YWdzIHRvIG9yaWdpbidcbiAgICAgICAgQGJ1dHRvbiBjbGFzczogJ2FjdGl2ZScsIGNsaWNrOiAncHRhZ3VwJyw9PlxuICAgICAgICAgIEBpIGNsYXNzOiAnaWNvbiB2ZXJzaW9ucydcbiAgICAgICAgICBAc3BhbiAnUHVzaCB0YWdzIHRvIHVwc3RyZWFtJ1xuICAgICAgICBAYnV0dG9uIGNsaWNrOiAnY2FuY2VsJywgPT5cbiAgICAgICAgICBAaSBjbGFzczogJ2ljb24geCdcbiAgICAgICAgICBAc3BhbiAnQ2FuY2VsJ1xuXG5cbiAgcHRhZ286IC0+XG4gICAgQGRlYWN0aXZhdGUoKVxuICAgIHJlbW90ZSA9ICdvcmlnaW4nXG4gICAgQHBhcmVudFZpZXcucHRhZyhyZW1vdGUpXG5cbiAgcHRhZ3VwOiAtPlxuICAgIEBkZWFjdGl2YXRlKClcbiAgICByZW1vdGUgPSAndXBzdHJlYW0nXG4gICAgQHBhcmVudFZpZXcucHRhZyhyZW1vdGUpXG4iXX0=
