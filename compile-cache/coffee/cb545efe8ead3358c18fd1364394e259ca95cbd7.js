(function() {
  var Dialog, MergeDialog, git,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Dialog = require('./dialog');

  git = require('../git');

  module.exports = MergeDialog = (function(superClass) {
    extend(MergeDialog, superClass);

    function MergeDialog() {
      return MergeDialog.__super__.constructor.apply(this, arguments);
    }

    MergeDialog.content = function() {
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
            return _this.strong('Merge');
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
            _this.label('Merge From Branch');
            _this.select({
              "class": 'native-key-bindings',
              outlet: 'fromBranch'
            });
            return _this.div(function() {
              _this.input({
                type: 'checkbox',
                "class": 'checkbox',
                outlet: 'noff'
              });
              return _this.label('No Fast-Forward');
            });
          });
          return _this.div({
            "class": 'buttons'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'merge'
            }, function() {
              _this.i({
                "class": 'icon merge'
              });
              return _this.span('Merge');
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

    MergeDialog.prototype.activate = function(branches) {
      var branch, current, i, len;
      current = git.getLocalBranch();
      if (atom.config.get("git-control.noFastForward")) {
        this.noff.prop("checked", true);
      }
      this.toBranch.val(current);
      this.fromBranch.find('option').remove();
      for (i = 0, len = branches.length; i < len; i++) {
        branch = branches[i];
        if (branch !== current) {
          this.fromBranch.append("<option value='" + branch + "'>" + branch + "</option>");
        }
      }
      return MergeDialog.__super__.activate.call(this);
    };

    MergeDialog.prototype.merge = function() {
      this.deactivate();
      this.parentView.merge(this.fromBranch.val(), this.noFF());
    };

    MergeDialog.prototype.noFF = function() {
      return this.noff.is(':checked');
    };

    return MergeDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi9kaWFsb2dzL21lcmdlLWRpYWxvZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHdCQUFBO0lBQUE7OztFQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7RUFFVCxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBRU4sTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7OztJQUNKLFdBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFFBQVA7T0FBTCxFQUFzQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDcEIsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sU0FBUDtXQUFMLEVBQXVCLFNBQUE7WUFDckIsS0FBQyxDQUFBLENBQUQsQ0FBRztjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sa0JBQVA7Y0FBMkIsS0FBQSxFQUFPLFFBQWxDO2FBQUg7bUJBQ0EsS0FBQyxDQUFBLE1BQUQsQ0FBUSxPQUFSO1VBRnFCLENBQXZCO1VBR0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sTUFBUDtXQUFMLEVBQW9CLFNBQUE7WUFDbEIsS0FBQyxDQUFBLEtBQUQsQ0FBTyxnQkFBUDtZQUNBLEtBQUMsQ0FBQSxLQUFELENBQU87Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHFCQUFQO2NBQThCLElBQUEsRUFBTSxNQUFwQztjQUE0QyxRQUFBLEVBQVUsSUFBdEQ7Y0FBNEQsTUFBQSxFQUFRLFVBQXBFO2FBQVA7WUFDQSxLQUFDLENBQUEsS0FBRCxDQUFPLG1CQUFQO1lBQ0EsS0FBQyxDQUFBLE1BQUQsQ0FBUTtjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8scUJBQVA7Y0FBOEIsTUFBQSxFQUFRLFlBQXRDO2FBQVI7bUJBQ0EsS0FBQyxDQUFBLEdBQUQsQ0FBSyxTQUFBO2NBQ0gsS0FBQyxDQUFBLEtBQUQsQ0FBTztnQkFBQSxJQUFBLEVBQU0sVUFBTjtnQkFBaUIsQ0FBQSxLQUFBLENBQUEsRUFBTyxVQUF4QjtnQkFBbUMsTUFBQSxFQUFRLE1BQTNDO2VBQVA7cUJBQ0EsS0FBQyxDQUFBLEtBQUQsQ0FBTyxpQkFBUDtZQUZHLENBQUw7VUFMa0IsQ0FBcEI7aUJBUUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sU0FBUDtXQUFMLEVBQXVCLFNBQUE7WUFDckIsS0FBQyxDQUFBLE1BQUQsQ0FBUTtjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sUUFBUDtjQUFpQixLQUFBLEVBQU8sT0FBeEI7YUFBUixFQUF5QyxTQUFBO2NBQ3ZDLEtBQUMsQ0FBQSxDQUFELENBQUc7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxZQUFQO2VBQUg7cUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTSxPQUFOO1lBRnVDLENBQXpDO21CQUdBLEtBQUMsQ0FBQSxNQUFELENBQVE7Y0FBQSxLQUFBLEVBQU8sUUFBUDthQUFSLEVBQXlCLFNBQUE7Y0FDdkIsS0FBQyxDQUFBLENBQUQsQ0FBRztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFFBQVA7ZUFBSDtxQkFDQSxLQUFDLENBQUEsSUFBRCxDQUFNLFFBQU47WUFGdUIsQ0FBekI7VUFKcUIsQ0FBdkI7UUFab0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRCO0lBRFE7OzBCQXFCVixRQUFBLEdBQVUsU0FBQyxRQUFEO0FBQ1IsVUFBQTtNQUFBLE9BQUEsR0FBVSxHQUFHLENBQUMsY0FBSixDQUFBO01BRVYsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsMkJBQWhCLENBQUg7UUFDRSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBVyxTQUFYLEVBQXNCLElBQXRCLEVBREY7O01BR0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsT0FBZDtNQUNBLElBQUMsQ0FBQSxVQUFVLENBQUMsSUFBWixDQUFpQixRQUFqQixDQUEwQixDQUFDLE1BQTNCLENBQUE7QUFFQSxXQUFBLDBDQUFBOztZQUE0QixNQUFBLEtBQVk7VUFDdEMsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLENBQW1CLGlCQUFBLEdBQWtCLE1BQWxCLEdBQXlCLElBQXpCLEdBQTZCLE1BQTdCLEdBQW9DLFdBQXZEOztBQURGO0FBR0EsYUFBTyx3Q0FBQTtJQVpDOzswQkFjVixLQUFBLEdBQU8sU0FBQTtNQUNMLElBQUMsQ0FBQSxVQUFELENBQUE7TUFDQSxJQUFDLENBQUEsVUFBVSxDQUFDLEtBQVosQ0FBa0IsSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFaLENBQUEsQ0FBbEIsRUFBb0MsSUFBQyxDQUFBLElBQUQsQ0FBQSxDQUFwQztJQUZLOzswQkFLUCxJQUFBLEdBQU0sU0FBQTtBQUNILGFBQU8sSUFBQyxDQUFBLElBQUksQ0FBQyxFQUFOLENBQVMsVUFBVDtJQURKOzs7O0tBekNrQjtBQUwxQiIsInNvdXJjZXNDb250ZW50IjpbIkRpYWxvZyA9IHJlcXVpcmUgJy4vZGlhbG9nJ1xuXG5naXQgPSByZXF1aXJlICcuLi9naXQnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIE1lcmdlRGlhbG9nIGV4dGVuZHMgRGlhbG9nXG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6ICdkaWFsb2cnLCA9PlxuICAgICAgQGRpdiBjbGFzczogJ2hlYWRpbmcnLCA9PlxuICAgICAgICBAaSBjbGFzczogJ2ljb24geCBjbGlja2FibGUnLCBjbGljazogJ2NhbmNlbCdcbiAgICAgICAgQHN0cm9uZyAnTWVyZ2UnXG4gICAgICBAZGl2IGNsYXNzOiAnYm9keScsID0+XG4gICAgICAgIEBsYWJlbCAnQ3VycmVudCBCcmFuY2gnXG4gICAgICAgIEBpbnB1dCBjbGFzczogJ25hdGl2ZS1rZXktYmluZGluZ3MnLCB0eXBlOiAndGV4dCcsIHJlYWRvbmx5OiB0cnVlLCBvdXRsZXQ6ICd0b0JyYW5jaCdcbiAgICAgICAgQGxhYmVsICdNZXJnZSBGcm9tIEJyYW5jaCdcbiAgICAgICAgQHNlbGVjdCBjbGFzczogJ25hdGl2ZS1rZXktYmluZGluZ3MnLCBvdXRsZXQ6ICdmcm9tQnJhbmNoJ1xuICAgICAgICBAZGl2ID0+XG4gICAgICAgICAgQGlucHV0IHR5cGU6ICdjaGVja2JveCcsY2xhc3M6ICdjaGVja2JveCcsb3V0bGV0OiAnbm9mZidcbiAgICAgICAgICBAbGFiZWwgJ05vIEZhc3QtRm9yd2FyZCdcbiAgICAgIEBkaXYgY2xhc3M6ICdidXR0b25zJywgPT5cbiAgICAgICAgQGJ1dHRvbiBjbGFzczogJ2FjdGl2ZScsIGNsaWNrOiAnbWVyZ2UnLCA9PlxuICAgICAgICAgIEBpIGNsYXNzOiAnaWNvbiBtZXJnZSdcbiAgICAgICAgICBAc3BhbiAnTWVyZ2UnXG4gICAgICAgIEBidXR0b24gY2xpY2s6ICdjYW5jZWwnLCA9PlxuICAgICAgICAgIEBpIGNsYXNzOiAnaWNvbiB4J1xuICAgICAgICAgIEBzcGFuICdDYW5jZWwnXG5cbiAgYWN0aXZhdGU6IChicmFuY2hlcykgLT5cbiAgICBjdXJyZW50ID0gZ2l0LmdldExvY2FsQnJhbmNoKClcblxuICAgIGlmIGF0b20uY29uZmlnLmdldChcImdpdC1jb250cm9sLm5vRmFzdEZvcndhcmRcIilcbiAgICAgIEBub2ZmLnByb3AoXCJjaGVja2VkXCIsIHRydWUpXG5cbiAgICBAdG9CcmFuY2gudmFsKGN1cnJlbnQpXG4gICAgQGZyb21CcmFuY2guZmluZCgnb3B0aW9uJykucmVtb3ZlKClcblxuICAgIGZvciBicmFuY2ggaW4gYnJhbmNoZXMgd2hlbiBicmFuY2ggaXNudCBjdXJyZW50XG4gICAgICBAZnJvbUJyYW5jaC5hcHBlbmQgXCI8b3B0aW9uIHZhbHVlPScje2JyYW5jaH0nPiN7YnJhbmNofTwvb3B0aW9uPlwiXG5cbiAgICByZXR1cm4gc3VwZXIoKVxuXG4gIG1lcmdlOiAtPlxuICAgIEBkZWFjdGl2YXRlKClcbiAgICBAcGFyZW50Vmlldy5tZXJnZShAZnJvbUJyYW5jaC52YWwoKSxAbm9GRigpKVxuICAgIHJldHVyblxuXG4gIG5vRkY6IC0+XG4gICAgIHJldHVybiBAbm9mZi5pcygnOmNoZWNrZWQnKVxuIl19
