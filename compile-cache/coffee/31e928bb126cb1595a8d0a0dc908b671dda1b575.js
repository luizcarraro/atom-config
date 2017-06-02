(function() {
  var CreateTagDialog, Dialog,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Dialog = require('./dialog');

  module.exports = CreateTagDialog = (function(superClass) {
    extend(CreateTagDialog, superClass);

    function CreateTagDialog() {
      return CreateTagDialog.__super__.constructor.apply(this, arguments);
    }

    CreateTagDialog.content = function() {
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
            return _this.strong('Tag');
          });
          _this.div({
            "class": 'body'
          }, function() {
            _this.label('Tag name');
            _this.input({
              "class": 'native-key-bindings',
              type: 'text',
              outlet: 'name'
            });
            _this.label('commit ref');
            _this.input({
              "class": 'native-key-bindings',
              type: 'text',
              outlet: 'href'
            });
            _this.label('Tag Message');
            return _this.textarea({
              "class": 'native-key-bindings',
              outlet: 'msg'
            });
          });
          return _this.div({
            "class": 'buttons'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'tag'
            }, function() {
              _this.i({
                "class": 'icon tag'
              });
              return _this.span('Create Tag');
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

    CreateTagDialog.prototype.activate = function() {
      CreateTagDialog.__super__.activate.call(this);
      this.name.focus();
    };

    CreateTagDialog.prototype.tag = function() {
      this.deactivate();
      this.parentView.tag(this.Name(), this.Href(), this.Msg());
    };

    CreateTagDialog.prototype.Name = function() {
      return this.name.val();
    };

    CreateTagDialog.prototype.Href = function() {
      return this.href.val();
    };

    CreateTagDialog.prototype.Msg = function() {
      return this.msg.val();
    };

    return CreateTagDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi9kaWFsb2dzL2NyZWF0ZS10YWctZGlhbG9nLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsdUJBQUE7SUFBQTs7O0VBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztFQUVULE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7SUFDSixlQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxRQUFQO09BQUwsRUFBc0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ3BCLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFNBQVA7V0FBTCxFQUF1QixTQUFBO1lBQ3JCLEtBQUMsQ0FBQSxDQUFELENBQUc7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGtCQUFQO2NBQTJCLEtBQUEsRUFBTyxRQUFsQzthQUFIO21CQUNBLEtBQUMsQ0FBQSxNQUFELENBQVEsS0FBUjtVQUZxQixDQUF2QjtVQUdBLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLE1BQVA7V0FBTCxFQUFvQixTQUFBO1lBQ2xCLEtBQUMsQ0FBQSxLQUFELENBQU8sVUFBUDtZQUNBLEtBQUMsQ0FBQSxLQUFELENBQU87Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHFCQUFQO2NBQThCLElBQUEsRUFBTSxNQUFwQztjQUE0QyxNQUFBLEVBQVEsTUFBcEQ7YUFBUDtZQUNBLEtBQUMsQ0FBQSxLQUFELENBQU8sWUFBUDtZQUNBLEtBQUMsQ0FBQSxLQUFELENBQU87Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHFCQUFQO2NBQThCLElBQUEsRUFBTSxNQUFwQztjQUE0QyxNQUFBLEVBQVEsTUFBcEQ7YUFBUDtZQUNBLEtBQUMsQ0FBQSxLQUFELENBQU8sYUFBUDttQkFDQSxLQUFDLENBQUEsUUFBRCxDQUFVO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxxQkFBUDtjQUE4QixNQUFBLEVBQVEsS0FBdEM7YUFBVjtVQU5rQixDQUFwQjtpQkFPQSxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxTQUFQO1dBQUwsRUFBdUIsU0FBQTtZQUNyQixLQUFDLENBQUEsTUFBRCxDQUFRO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxRQUFQO2NBQWlCLEtBQUEsRUFBTyxLQUF4QjthQUFSLEVBQXVDLFNBQUE7Y0FDckMsS0FBQyxDQUFBLENBQUQsQ0FBRztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFVBQVA7ZUFBSDtxQkFDQSxLQUFDLENBQUEsSUFBRCxDQUFNLFlBQU47WUFGcUMsQ0FBdkM7bUJBR0EsS0FBQyxDQUFBLE1BQUQsQ0FBUTtjQUFBLEtBQUEsRUFBTyxRQUFQO2FBQVIsRUFBeUIsU0FBQTtjQUN2QixLQUFDLENBQUEsQ0FBRCxDQUFHO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sUUFBUDtlQUFIO3FCQUNBLEtBQUMsQ0FBQSxJQUFELENBQU0sUUFBTjtZQUZ1QixDQUF6QjtVQUpxQixDQUF2QjtRQVhvQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEI7SUFEUTs7OEJBb0JWLFFBQUEsR0FBVSxTQUFBO01BQ1IsNENBQUE7TUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQU4sQ0FBQTtJQUZROzs4QkFLVixHQUFBLEdBQUssU0FBQTtNQUNILElBQUMsQ0FBQSxVQUFELENBQUE7TUFDQSxJQUFDLENBQUEsVUFBVSxDQUFDLEdBQVosQ0FBZ0IsSUFBQyxDQUFBLElBQUQsQ0FBQSxDQUFoQixFQUF5QixJQUFDLENBQUEsSUFBRCxDQUFBLENBQXpCLEVBQWtDLElBQUMsQ0FBQSxHQUFELENBQUEsQ0FBbEM7SUFGRzs7OEJBS0wsSUFBQSxHQUFNLFNBQUE7QUFDSixhQUFPLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFBO0lBREg7OzhCQUdOLElBQUEsR0FBTSxTQUFBO0FBQ0osYUFBTyxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBQTtJQURIOzs4QkFHTixHQUFBLEdBQUssU0FBQTtBQUNILGFBQU8sSUFBQyxDQUFBLEdBQUcsQ0FBQyxHQUFMLENBQUE7SUFESjs7OztLQXJDdUI7QUFIOUIiLCJzb3VyY2VzQ29udGVudCI6WyJEaWFsb2cgPSByZXF1aXJlICcuL2RpYWxvZydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgQ3JlYXRlVGFnRGlhbG9nIGV4dGVuZHMgRGlhbG9nXG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6ICdkaWFsb2cnLCA9PlxuICAgICAgQGRpdiBjbGFzczogJ2hlYWRpbmcnLCA9PlxuICAgICAgICBAaSBjbGFzczogJ2ljb24geCBjbGlja2FibGUnLCBjbGljazogJ2NhbmNlbCdcbiAgICAgICAgQHN0cm9uZyAnVGFnJ1xuICAgICAgQGRpdiBjbGFzczogJ2JvZHknLCA9PlxuICAgICAgICBAbGFiZWwgJ1RhZyBuYW1lJ1xuICAgICAgICBAaW5wdXQgY2xhc3M6ICduYXRpdmUta2V5LWJpbmRpbmdzJywgdHlwZTogJ3RleHQnLCBvdXRsZXQ6ICduYW1lJ1xuICAgICAgICBAbGFiZWwgJ2NvbW1pdCByZWYnXG4gICAgICAgIEBpbnB1dCBjbGFzczogJ25hdGl2ZS1rZXktYmluZGluZ3MnLCB0eXBlOiAndGV4dCcsIG91dGxldDogJ2hyZWYnXG4gICAgICAgIEBsYWJlbCAnVGFnIE1lc3NhZ2UnXG4gICAgICAgIEB0ZXh0YXJlYSBjbGFzczogJ25hdGl2ZS1rZXktYmluZGluZ3MnLCBvdXRsZXQ6ICdtc2cnXG4gICAgICBAZGl2IGNsYXNzOiAnYnV0dG9ucycsID0+XG4gICAgICAgIEBidXR0b24gY2xhc3M6ICdhY3RpdmUnLCBjbGljazogJ3RhZycsID0+XG4gICAgICAgICAgQGkgY2xhc3M6ICdpY29uIHRhZydcbiAgICAgICAgICBAc3BhbiAnQ3JlYXRlIFRhZydcbiAgICAgICAgQGJ1dHRvbiBjbGljazogJ2NhbmNlbCcsID0+XG4gICAgICAgICAgQGkgY2xhc3M6ICdpY29uIHgnXG4gICAgICAgICAgQHNwYW4gJ0NhbmNlbCdcblxuICBhY3RpdmF0ZTogLT5cbiAgICBzdXBlcigpXG4gICAgQG5hbWUuZm9jdXMoKVxuICAgIHJldHVyblxuICAgIFxuICB0YWc6IC0+XG4gICAgQGRlYWN0aXZhdGUoKVxuICAgIEBwYXJlbnRWaWV3LnRhZyhATmFtZSgpLCBASHJlZigpLCBATXNnKCkpXG4gICAgcmV0dXJuXG5cbiAgTmFtZTogLT5cbiAgICByZXR1cm4gQG5hbWUudmFsKClcblxuICBIcmVmOiAtPlxuICAgIHJldHVybiBAaHJlZi52YWwoKVxuXG4gIE1zZzogLT5cbiAgICByZXR1cm4gQG1zZy52YWwoKVxuIl19
