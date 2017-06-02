(function() {
  var BranchItem, BranchView, View, git,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  View = require('atom-space-pen-views').View;

  git = require('../git');

  BranchItem = (function(superClass) {
    extend(BranchItem, superClass);

    function BranchItem() {
      return BranchItem.__super__.constructor.apply(this, arguments);
    }

    BranchItem.content = function(branch) {
      var bklass, cklass, dclass;
      bklass = branch.current ? 'active' : '';
      cklass = branch.count.total ? '' : 'invisible';
      dclass = branch.current || !branch.local ? 'invisible' : '';
      return this.div({
        "class": "branch " + bklass,
        'data-name': branch.name
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'info'
          }, function() {
            _this.i({
              "class": 'icon chevron-right'
            });
            return _this.span({
              "class": 'clickable',
              click: 'checkout'
            }, branch.name);
          });
          _this.div({
            "class": "right-info " + dclass
          }, function() {
            return _this.i({
              "class": 'icon trash clickable',
              click: 'deleteThis'
            });
          });
          return _this.div({
            "class": "right-info count " + cklass
          }, function() {
            _this.span(branch.count.ahead);
            _this.i({
              "class": 'icon cloud-upload'
            });
            _this.span(branch.count.behind);
            return _this.i({
              "class": 'icon cloud-download'
            });
          });
        };
      })(this));
    };

    BranchItem.prototype.initialize = function(branch) {
      return this.branch = branch;
    };

    BranchItem.prototype.checkout = function() {
      return this.branch.checkout(this.branch.name);
    };

    BranchItem.prototype.deleteThis = function() {
      return this.branch["delete"](this.branch.name);
    };

    return BranchItem;

  })(View);

  module.exports = BranchView = (function(superClass) {
    extend(BranchView, superClass);

    function BranchView() {
      return BranchView.__super__.constructor.apply(this, arguments);
    }

    BranchView.content = function(params) {
      return this.div({
        "class": 'branches'
      }, (function(_this) {
        return function() {
          return _this.div({
            click: 'toggleBranch',
            "class": 'heading clickable'
          }, function() {
            _this.i({
              "class": 'icon branch'
            });
            return _this.span(params.name);
          });
        };
      })(this));
    };

    BranchView.prototype.initialize = function(params) {
      this.params = params;
      this.branches = [];
      return this.hidden = false;
    };

    BranchView.prototype.toggleBranch = function() {
      if (this.hidden) {
        this.addAll(this.branches);
      } else {
        this.clearAll();
      }
      return this.hidden = !this.hidden;
    };

    BranchView.prototype.clearAll = function() {
      this.find('>.branch').remove();
    };

    BranchView.prototype.addAll = function(branches) {
      var checkout, remove;
      this.branches = branches;
      this.selectedBranch = git["get" + (this.params.local ? 'Local' : 'Remote') + "Branch"]();
      this.clearAll();
      remove = (function(_this) {
        return function(name) {
          return _this.deleteBranch(name);
        };
      })(this);
      checkout = (function(_this) {
        return function(name) {
          return _this.checkoutBranch(name);
        };
      })(this);
      branches.forEach((function(_this) {
        return function(branch) {
          var count, current;
          current = _this.params.local && branch === _this.selectedBranch;
          count = {
            total: 0
          };
          if (current) {
            count = git.count(branch);
            count.total = count.ahead + count.behind;
            _this.parentView.branchCount(count);
          }
          _this.append(new BranchItem({
            name: branch,
            count: count,
            current: current,
            local: _this.params.local,
            "delete": remove,
            checkout: checkout
          }));
        };
      })(this));
    };

    BranchView.prototype.checkoutBranch = function(name) {
      this.parentView.checkoutBranch(name, !this.params.local);
    };

    BranchView.prototype.deleteBranch = function(name) {
      this.parentView.deleteBranch(name);
    };

    return BranchView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi92aWV3cy9icmFuY2gtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGlDQUFBO0lBQUE7OztFQUFDLE9BQVEsT0FBQSxDQUFRLHNCQUFSOztFQUVULEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFFQTs7Ozs7OztJQUNKLFVBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQyxNQUFEO0FBQ1IsVUFBQTtNQUFBLE1BQUEsR0FBWSxNQUFNLENBQUMsT0FBVixHQUF1QixRQUF2QixHQUFxQztNQUM5QyxNQUFBLEdBQVksTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFoQixHQUEyQixFQUEzQixHQUFtQztNQUM1QyxNQUFBLEdBQVksTUFBTSxDQUFDLE9BQVAsSUFBa0IsQ0FBQyxNQUFNLENBQUMsS0FBN0IsR0FBd0MsV0FBeEMsR0FBeUQ7YUFFbEUsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sU0FBQSxHQUFVLE1BQWpCO1FBQTJCLFdBQUEsRUFBYSxNQUFNLENBQUMsSUFBL0M7T0FBTCxFQUEwRCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDeEQsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sTUFBUDtXQUFMLEVBQW9CLFNBQUE7WUFDbEIsS0FBQyxDQUFBLENBQUQsQ0FBRztjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sb0JBQVA7YUFBSDttQkFDQSxLQUFDLENBQUEsSUFBRCxDQUFNO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxXQUFQO2NBQW9CLEtBQUEsRUFBTyxVQUEzQjthQUFOLEVBQTZDLE1BQU0sQ0FBQyxJQUFwRDtVQUZrQixDQUFwQjtVQUdBLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGFBQUEsR0FBYyxNQUFyQjtXQUFMLEVBQW9DLFNBQUE7bUJBQ2xDLEtBQUMsQ0FBQSxDQUFELENBQUc7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHNCQUFQO2NBQStCLEtBQUEsRUFBTyxZQUF0QzthQUFIO1VBRGtDLENBQXBDO2lCQUVBLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLG1CQUFBLEdBQW9CLE1BQTNCO1dBQUwsRUFBMEMsU0FBQTtZQUN4QyxLQUFDLENBQUEsSUFBRCxDQUFNLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBbkI7WUFDQSxLQUFDLENBQUEsQ0FBRCxDQUFHO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxtQkFBUDthQUFIO1lBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQW5CO21CQUNBLEtBQUMsQ0FBQSxDQUFELENBQUc7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHFCQUFQO2FBQUg7VUFKd0MsQ0FBMUM7UUFOd0Q7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFEO0lBTFE7O3lCQWlCVixVQUFBLEdBQVksU0FBQyxNQUFEO2FBQ1YsSUFBQyxDQUFBLE1BQUQsR0FBVTtJQURBOzt5QkFHWixRQUFBLEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFpQixJQUFDLENBQUEsTUFBTSxDQUFDLElBQXpCO0lBRFE7O3lCQUdWLFVBQUEsR0FBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLE1BQU0sRUFBQyxNQUFELEVBQVAsQ0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQXZCO0lBRFU7Ozs7S0F4Qlc7O0VBMkJ6QixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O0lBQ0osVUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLE1BQUQ7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxVQUFQO09BQUwsRUFBd0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUN0QixLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsS0FBQSxFQUFPLGNBQVA7WUFBdUIsQ0FBQSxLQUFBLENBQUEsRUFBTyxtQkFBOUI7V0FBTCxFQUF3RCxTQUFBO1lBQ3RELEtBQUMsQ0FBQSxDQUFELENBQUc7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGFBQVA7YUFBSDttQkFDQSxLQUFDLENBQUEsSUFBRCxDQUFNLE1BQU0sQ0FBQyxJQUFiO1VBRnNELENBQXhEO1FBRHNCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QjtJQURROzt5QkFNVixVQUFBLEdBQVksU0FBQyxNQUFEO01BQ1YsSUFBQyxDQUFBLE1BQUQsR0FBVTtNQUNWLElBQUMsQ0FBQSxRQUFELEdBQVk7YUFDWixJQUFDLENBQUEsTUFBRCxHQUFVO0lBSEE7O3lCQUtaLFlBQUEsR0FBZSxTQUFBO01BQ2IsSUFBRyxJQUFDLENBQUEsTUFBSjtRQUFnQixJQUFDLENBQUEsTUFBRCxDQUFRLElBQUMsQ0FBQSxRQUFULEVBQWhCO09BQUEsTUFBQTtRQUEwQyxJQUFDLENBQUEsUUFBSixDQUFBLEVBQXZDOzthQUNBLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FBQyxJQUFDLENBQUE7SUFGQzs7eUJBSWYsUUFBQSxHQUFVLFNBQUE7TUFDUixJQUFDLENBQUEsSUFBRCxDQUFNLFVBQU4sQ0FBaUIsQ0FBQyxNQUFsQixDQUFBO0lBRFE7O3lCQUlWLE1BQUEsR0FBUSxTQUFDLFFBQUQ7QUFDTixVQUFBO01BQUEsSUFBQyxDQUFBLFFBQUQsR0FBWTtNQUNaLElBQUMsQ0FBQSxjQUFELEdBQWtCLEdBQUksQ0FBQSxLQUFBLEdBQUssQ0FBSSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVgsR0FBc0IsT0FBdEIsR0FBbUMsUUFBcEMsQ0FBTCxHQUFrRCxRQUFsRCxDQUFKLENBQUE7TUFDbEIsSUFBQyxDQUFBLFFBQUQsQ0FBQTtNQUVBLE1BQUEsR0FBUyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtpQkFBVSxLQUFDLENBQUEsWUFBRCxDQUFjLElBQWQ7UUFBVjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7TUFDVCxRQUFBLEdBQVcsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLElBQUQ7aUJBQVUsS0FBQyxDQUFBLGNBQUQsQ0FBZ0IsSUFBaEI7UUFBVjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7TUFFWCxRQUFRLENBQUMsT0FBVCxDQUFpQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsTUFBRDtBQUNmLGNBQUE7VUFBQSxPQUFBLEdBQVUsS0FBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLElBQWtCLE1BQUEsS0FBVSxLQUFDLENBQUE7VUFDdkMsS0FBQSxHQUFRO1lBQUEsS0FBQSxFQUFPLENBQVA7O1VBRVIsSUFBRyxPQUFIO1lBQ0UsS0FBQSxHQUFRLEdBQUcsQ0FBQyxLQUFKLENBQVUsTUFBVjtZQUNSLEtBQUssQ0FBQyxLQUFOLEdBQWMsS0FBSyxDQUFDLEtBQU4sR0FBYyxLQUFLLENBQUM7WUFFbEMsS0FBQyxDQUFBLFVBQVUsQ0FBQyxXQUFaLENBQXdCLEtBQXhCLEVBSkY7O1VBTUEsS0FBQyxDQUFBLE1BQUQsQ0FBWSxJQUFBLFVBQUEsQ0FDVjtZQUFBLElBQUEsRUFBTSxNQUFOO1lBQ0EsS0FBQSxFQUFPLEtBRFA7WUFFQSxPQUFBLEVBQVMsT0FGVDtZQUdBLEtBQUEsRUFBTyxLQUFDLENBQUEsTUFBTSxDQUFDLEtBSGY7WUFJQSxDQUFBLE1BQUEsQ0FBQSxFQUFRLE1BSlI7WUFLQSxRQUFBLEVBQVUsUUFMVjtXQURVLENBQVo7UUFWZTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakI7SUFSTTs7eUJBNkJSLGNBQUEsR0FBZ0IsU0FBQyxJQUFEO01BQ2QsSUFBQyxDQUFBLFVBQVUsQ0FBQyxjQUFaLENBQTJCLElBQTNCLEVBQWlDLENBQUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUExQztJQURjOzt5QkFJaEIsWUFBQSxHQUFjLFNBQUMsSUFBRDtNQUNaLElBQUMsQ0FBQSxVQUFVLENBQUMsWUFBWixDQUF5QixJQUF6QjtJQURZOzs7O0tBckRTO0FBaEN6QiIsInNvdXJjZXNDb250ZW50IjpbIntWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5naXQgPSByZXF1aXJlICcuLi9naXQnXG5cbmNsYXNzIEJyYW5jaEl0ZW0gZXh0ZW5kcyBWaWV3XG4gIEBjb250ZW50OiAoYnJhbmNoKSAtPlxuICAgIGJrbGFzcyA9IGlmIGJyYW5jaC5jdXJyZW50IHRoZW4gJ2FjdGl2ZScgZWxzZSAnJ1xuICAgIGNrbGFzcyA9IGlmIGJyYW5jaC5jb3VudC50b3RhbCB0aGVuICcnIGVsc2UgJ2ludmlzaWJsZSdcbiAgICBkY2xhc3MgPSBpZiBicmFuY2guY3VycmVudCBvciAhYnJhbmNoLmxvY2FsIHRoZW4gJ2ludmlzaWJsZScgZWxzZSAnJ1xuXG4gICAgQGRpdiBjbGFzczogXCJicmFuY2ggI3tia2xhc3N9XCIsICdkYXRhLW5hbWUnOiBicmFuY2gubmFtZSwgPT5cbiAgICAgIEBkaXYgY2xhc3M6ICdpbmZvJywgPT5cbiAgICAgICAgQGkgY2xhc3M6ICdpY29uIGNoZXZyb24tcmlnaHQnXG4gICAgICAgIEBzcGFuIGNsYXNzOiAnY2xpY2thYmxlJywgY2xpY2s6ICdjaGVja291dCcsIGJyYW5jaC5uYW1lXG4gICAgICBAZGl2IGNsYXNzOiBcInJpZ2h0LWluZm8gI3tkY2xhc3N9XCIsID0+XG4gICAgICAgIEBpIGNsYXNzOiAnaWNvbiB0cmFzaCBjbGlja2FibGUnLCBjbGljazogJ2RlbGV0ZVRoaXMnXG4gICAgICBAZGl2IGNsYXNzOiBcInJpZ2h0LWluZm8gY291bnQgI3tja2xhc3N9XCIsID0+XG4gICAgICAgIEBzcGFuIGJyYW5jaC5jb3VudC5haGVhZFxuICAgICAgICBAaSBjbGFzczogJ2ljb24gY2xvdWQtdXBsb2FkJ1xuICAgICAgICBAc3BhbiBicmFuY2guY291bnQuYmVoaW5kXG4gICAgICAgIEBpIGNsYXNzOiAnaWNvbiBjbG91ZC1kb3dubG9hZCdcblxuICBpbml0aWFsaXplOiAoYnJhbmNoKSAtPlxuICAgIEBicmFuY2ggPSBicmFuY2hcblxuICBjaGVja291dDogLT5cbiAgICBAYnJhbmNoLmNoZWNrb3V0KEBicmFuY2gubmFtZSlcblxuICBkZWxldGVUaGlzOiAtPlxuICAgIEBicmFuY2guZGVsZXRlKEBicmFuY2gubmFtZSlcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgQnJhbmNoVmlldyBleHRlbmRzIFZpZXdcbiAgQGNvbnRlbnQ6IChwYXJhbXMpIC0+XG4gICAgQGRpdiBjbGFzczogJ2JyYW5jaGVzJywgPT5cbiAgICAgIEBkaXYgY2xpY2s6ICd0b2dnbGVCcmFuY2gnLCBjbGFzczogJ2hlYWRpbmcgY2xpY2thYmxlJywgPT5cbiAgICAgICAgQGkgY2xhc3M6ICdpY29uIGJyYW5jaCdcbiAgICAgICAgQHNwYW4gcGFyYW1zLm5hbWVcblxuICBpbml0aWFsaXplOiAocGFyYW1zKSAtPlxuICAgIEBwYXJhbXMgPSBwYXJhbXNcbiAgICBAYnJhbmNoZXMgPSBbXVxuICAgIEBoaWRkZW4gPSBmYWxzZVxuXG4gIHRvZ2dsZUJyYW5jaCA6IC0+XG4gICAgaWYgQGhpZGRlbiB0aGVuIEBhZGRBbGwgQGJyYW5jaGVzIGVsc2UgZG8gQGNsZWFyQWxsXG4gICAgQGhpZGRlbiA9ICFAaGlkZGVuXG5cbiAgY2xlYXJBbGw6IC0+XG4gICAgQGZpbmQoJz4uYnJhbmNoJykucmVtb3ZlKClcbiAgICByZXR1cm5cblxuICBhZGRBbGw6IChicmFuY2hlcykgLT5cbiAgICBAYnJhbmNoZXMgPSBicmFuY2hlc1xuICAgIEBzZWxlY3RlZEJyYW5jaCA9IGdpdFtcImdldCN7aWYgQHBhcmFtcy5sb2NhbCB0aGVuICdMb2NhbCcgZWxzZSAnUmVtb3RlJ31CcmFuY2hcIl0oKVxuICAgIEBjbGVhckFsbCgpXG5cbiAgICByZW1vdmUgPSAobmFtZSkgPT4gQGRlbGV0ZUJyYW5jaChuYW1lKVxuICAgIGNoZWNrb3V0ID0gKG5hbWUpID0+IEBjaGVja291dEJyYW5jaChuYW1lKVxuXG4gICAgYnJhbmNoZXMuZm9yRWFjaCAoYnJhbmNoKSA9PlxuICAgICAgY3VycmVudCA9IEBwYXJhbXMubG9jYWwgYW5kIGJyYW5jaCBpcyBAc2VsZWN0ZWRCcmFuY2hcbiAgICAgIGNvdW50ID0gdG90YWw6IDBcblxuICAgICAgaWYgY3VycmVudFxuICAgICAgICBjb3VudCA9IGdpdC5jb3VudChicmFuY2gpXG4gICAgICAgIGNvdW50LnRvdGFsID0gY291bnQuYWhlYWQgKyBjb3VudC5iZWhpbmRcblxuICAgICAgICBAcGFyZW50Vmlldy5icmFuY2hDb3VudChjb3VudClcblxuICAgICAgQGFwcGVuZCBuZXcgQnJhbmNoSXRlbVxuICAgICAgICBuYW1lOiBicmFuY2hcbiAgICAgICAgY291bnQ6IGNvdW50XG4gICAgICAgIGN1cnJlbnQ6IGN1cnJlbnRcbiAgICAgICAgbG9jYWw6IEBwYXJhbXMubG9jYWxcbiAgICAgICAgZGVsZXRlOiByZW1vdmVcbiAgICAgICAgY2hlY2tvdXQ6IGNoZWNrb3V0XG5cbiAgICAgIHJldHVyblxuICAgIHJldHVyblxuXG4gIGNoZWNrb3V0QnJhbmNoOiAobmFtZSkgLT5cbiAgICBAcGFyZW50Vmlldy5jaGVja291dEJyYW5jaChuYW1lLCAhQHBhcmFtcy5sb2NhbClcbiAgICByZXR1cm5cblxuICBkZWxldGVCcmFuY2g6IChuYW1lKSAtPlxuICAgIEBwYXJlbnRWaWV3LmRlbGV0ZUJyYW5jaChuYW1lKVxuICAgIHJldHVyblxuIl19
