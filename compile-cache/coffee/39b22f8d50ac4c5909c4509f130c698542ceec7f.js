(function() {
  var DeleteDialog, Dialog,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Dialog = require('./dialog');

  module.exports = DeleteDialog = (function(superClass) {
    extend(DeleteDialog, superClass);

    function DeleteDialog() {
      return DeleteDialog.__super__.constructor.apply(this, arguments);
    }

    DeleteDialog.content = function(params) {
      return this.div({
        "class": 'dialog active'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'heading'
          }, function() {
            _this.i({
              "class": 'icon x clickable',
              click: 'cancel'
            });
            return _this.strong(params.hdr);
          });
          _this.div({
            "class": 'body'
          }, function() {
            return _this.div(params.msg);
          });
          return _this.div({
            "class": 'buttons'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'delete'
            }, function() {
              _this.i({
                "class": 'icon check'
              });
              return _this.span('Yes');
            });
            _this.button({
              click: 'cancel'
            }, function() {
              _this.i({
                "class": 'icon x'
              });
              return _this.span('No');
            });
            return _this.button({
              "class": 'warningText',
              click: 'forceDelete'
            }, function() {
              _this.i({
                "class": 'icon trash'
              });
              return _this.span('FORCE DELETE');
            });
          });
        };
      })(this));
    };

    DeleteDialog.prototype.initialize = function(params) {
      return this.params = params;
    };

    DeleteDialog.prototype["delete"] = function() {
      this.deactivate();
      this.params.cb(this.params);
    };

    DeleteDialog.prototype.forceDelete = function() {
      this.deactivate();
      this.params.fdCb(this.params);
    };

    return DeleteDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi9kaWFsb2dzL2RlbGV0ZS1kaWFsb2cuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxvQkFBQTtJQUFBOzs7RUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0VBRVQsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7OztJQUNKLFlBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQyxNQUFEO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sZUFBUDtPQUFMLEVBQTZCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUMzQixLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxTQUFQO1dBQUwsRUFBdUIsU0FBQTtZQUNyQixLQUFDLENBQUEsQ0FBRCxDQUFHO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxrQkFBUDtjQUEyQixLQUFBLEVBQU8sUUFBbEM7YUFBSDttQkFDQSxLQUFDLENBQUEsTUFBRCxDQUFRLE1BQU0sQ0FBQyxHQUFmO1VBRnFCLENBQXZCO1VBR0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sTUFBUDtXQUFMLEVBQW9CLFNBQUE7bUJBQ2xCLEtBQUMsQ0FBQSxHQUFELENBQUssTUFBTSxDQUFDLEdBQVo7VUFEa0IsQ0FBcEI7aUJBRUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sU0FBUDtXQUFMLEVBQXVCLFNBQUE7WUFDckIsS0FBQyxDQUFBLE1BQUQsQ0FBUTtjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sUUFBUDtjQUFpQixLQUFBLEVBQU8sUUFBeEI7YUFBUixFQUEwQyxTQUFBO2NBQ3hDLEtBQUMsQ0FBQSxDQUFELENBQUc7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxZQUFQO2VBQUg7cUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTSxLQUFOO1lBRndDLENBQTFDO1lBR0EsS0FBQyxDQUFBLE1BQUQsQ0FBUTtjQUFBLEtBQUEsRUFBTyxRQUFQO2FBQVIsRUFBeUIsU0FBQTtjQUN2QixLQUFDLENBQUEsQ0FBRCxDQUFHO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sUUFBUDtlQUFIO3FCQUNBLEtBQUMsQ0FBQSxJQUFELENBQU0sSUFBTjtZQUZ1QixDQUF6QjttQkFHQSxLQUFDLENBQUEsTUFBRCxDQUFRO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxhQUFQO2NBQXNCLEtBQUEsRUFBTyxhQUE3QjthQUFSLEVBQW9ELFNBQUE7Y0FDaEQsS0FBQyxDQUFBLENBQUQsQ0FBRztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFlBQVA7ZUFBSDtxQkFDQSxLQUFDLENBQUEsSUFBRCxDQUFPLGNBQVA7WUFGZ0QsQ0FBcEQ7VUFQcUIsQ0FBdkI7UUFOMkI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTdCO0lBRFE7OzJCQWtCVixVQUFBLEdBQVksU0FBQyxNQUFEO2FBQ1YsSUFBQyxDQUFBLE1BQUQsR0FBVTtJQURBOzs0QkFHWixRQUFBLEdBQVEsU0FBQTtNQUNOLElBQUMsQ0FBQSxVQUFELENBQUE7TUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLEVBQVIsQ0FBVyxJQUFDLENBQUEsTUFBWjtJQUZNOzsyQkFLUixXQUFBLEdBQWEsU0FBQTtNQUNYLElBQUMsQ0FBQSxVQUFELENBQUE7TUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxJQUFDLENBQUEsTUFBZDtJQUZXOzs7O0tBM0JZO0FBSDNCIiwic291cmNlc0NvbnRlbnQiOlsiRGlhbG9nID0gcmVxdWlyZSAnLi9kaWFsb2cnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIERlbGV0ZURpYWxvZyBleHRlbmRzIERpYWxvZ1xuICBAY29udGVudDogKHBhcmFtcykgLT5cbiAgICBAZGl2IGNsYXNzOiAnZGlhbG9nIGFjdGl2ZScsID0+XG4gICAgICBAZGl2IGNsYXNzOiAnaGVhZGluZycsID0+XG4gICAgICAgIEBpIGNsYXNzOiAnaWNvbiB4IGNsaWNrYWJsZScsIGNsaWNrOiAnY2FuY2VsJ1xuICAgICAgICBAc3Ryb25nIHBhcmFtcy5oZHJcbiAgICAgIEBkaXYgY2xhc3M6ICdib2R5JywgPT5cbiAgICAgICAgQGRpdiBwYXJhbXMubXNnXG4gICAgICBAZGl2IGNsYXNzOiAnYnV0dG9ucycsID0+XG4gICAgICAgIEBidXR0b24gY2xhc3M6ICdhY3RpdmUnLCBjbGljazogJ2RlbGV0ZScsID0+XG4gICAgICAgICAgQGkgY2xhc3M6ICdpY29uIGNoZWNrJ1xuICAgICAgICAgIEBzcGFuICdZZXMnXG4gICAgICAgIEBidXR0b24gY2xpY2s6ICdjYW5jZWwnLCA9PlxuICAgICAgICAgIEBpIGNsYXNzOiAnaWNvbiB4J1xuICAgICAgICAgIEBzcGFuICdObydcbiAgICAgICAgQGJ1dHRvbiBjbGFzczogJ3dhcm5pbmdUZXh0JywgY2xpY2s6ICdmb3JjZURlbGV0ZScsID0+XG4gICAgICAgICAgICBAaSBjbGFzczogJ2ljb24gdHJhc2gnXG4gICAgICAgICAgICBAc3BhbiAgJ0ZPUkNFIERFTEVURSdcblxuICBpbml0aWFsaXplOiAocGFyYW1zKSAtPlxuICAgIEBwYXJhbXMgPSBwYXJhbXNcblxuICBkZWxldGU6IC0+XG4gICAgQGRlYWN0aXZhdGUoKVxuICAgIEBwYXJhbXMuY2IoQHBhcmFtcylcbiAgICByZXR1cm5cblxuICBmb3JjZURlbGV0ZTogLT5cbiAgICBAZGVhY3RpdmF0ZSgpXG4gICAgQHBhcmFtcy5mZENiKEBwYXJhbXMpXG4gICAgcmV0dXJuXG4iXX0=
