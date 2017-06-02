(function() {
  var $, MenuItem, MenuView, View, items, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), View = ref.View, $ = ref.$;

  items = [
    {
      id: 'project',
      menu: 'Project',
      icon: 'icon-repo',
      type: 'active'
    }, {
      id: 'compare',
      menu: 'Compare',
      icon: 'compare',
      type: 'active'
    }, {
      id: 'commit',
      menu: 'Commit',
      icon: 'commit',
      type: 'file merging'
    }, {
      id: 'tag',
      menu: 'Tag',
      icon: 'tag',
      type: 'active'
    }, {
      id: 'ptag',
      menu: 'Push Tags',
      icon: 'versions',
      type: 'active'
    }, {
      id: 'reset',
      menu: 'Reset',
      icon: 'sync',
      type: 'file'
    }, {
      id: 'fetch',
      menu: 'Fetch',
      icon: 'cloud-download',
      type: 'remote'
    }, {
      id: 'pull',
      menu: 'Pull',
      icon: 'pull',
      type: 'upstream'
    }, {
      id: 'pullup',
      menu: 'Pull Upstream',
      icon: 'desktop-download',
      type: 'active'
    }, {
      id: 'push',
      menu: 'Push',
      icon: 'push',
      type: 'downstream'
    }, {
      id: 'rebase',
      menu: 'Rebase',
      icon: 'circuit-board',
      type: 'active'
    }, {
      id: 'merge',
      menu: 'Merge',
      icon: 'merge',
      type: 'active'
    }, {
      id: 'branch',
      menu: 'Branch',
      icon: 'branch',
      type: 'active'
    }, {
      id: 'flow',
      menu: 'GitFlow',
      icon: 'flow',
      type: 'active',
      showConfig: 'git-control.showGitFlowButton'
    }
  ];

  MenuItem = (function(superClass) {
    extend(MenuItem, superClass);

    function MenuItem() {
      return MenuItem.__super__.constructor.apply(this, arguments);
    }

    MenuItem.content = function(item) {
      var klass;
      klass = item.type === 'active' ? '' : 'inactive';
      klass += (item.showConfig != null) && !atom.config.get(item.showConfig) ? ' hide' : '';
      return this.div({
        "class": "item " + klass + " " + item.type,
        id: "menu" + item.id,
        click: 'click'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": "icon large " + item.icon
          });
          return _this.div(item.menu);
        };
      })(this));
    };

    MenuItem.prototype.initialize = function(item) {
      this.item = item;
      if (item.showConfig != null) {
        return atom.config.observe(item.showConfig, function(show) {
          if (show) {
            return $("#menu" + item.id).removeClass('hide');
          } else {
            return $("#menu" + item.id).addClass('hide');
          }
        });
      }
    };

    MenuItem.prototype.click = function() {
      return this.parentView.click(this.item.id);
    };

    return MenuItem;

  })(View);

  module.exports = MenuView = (function(superClass) {
    extend(MenuView, superClass);

    function MenuView() {
      return MenuView.__super__.constructor.apply(this, arguments);
    }

    MenuView.content = function(item) {
      return this.div({
        "class": 'menu'
      }, (function(_this) {
        return function() {
          var i, len, results;
          results = [];
          for (i = 0, len = items.length; i < len; i++) {
            item = items[i];
            results.push(_this.subview(item.id, new MenuItem(item)));
          }
          return results;
        };
      })(this));
    };

    MenuView.prototype.click = function(id) {
      if (!(this.find("#menu" + id).hasClass('inactive'))) {
        return this.parentView[id + "MenuClick"]();
      }
    };

    MenuView.prototype.activate = function(type, active) {
      var menuItems;
      menuItems = this.find(".item." + type);
      if (active) {
        menuItems.removeClass('inactive');
      } else {
        menuItems.addClass('inactive');
      }
    };

    return MenuView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi92aWV3cy9tZW51LXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx1Q0FBQTtJQUFBOzs7RUFBQSxNQUFZLE9BQUEsQ0FBUSxzQkFBUixDQUFaLEVBQUMsZUFBRCxFQUFPOztFQUVQLEtBQUEsR0FBUTtJQUNOO01BQUUsRUFBQSxFQUFJLFNBQU47TUFBaUIsSUFBQSxFQUFNLFNBQXZCO01BQWtDLElBQUEsRUFBTSxXQUF4QztNQUFxRCxJQUFBLEVBQU0sUUFBM0Q7S0FETSxFQUVOO01BQUUsRUFBQSxFQUFJLFNBQU47TUFBaUIsSUFBQSxFQUFNLFNBQXZCO01BQWtDLElBQUEsRUFBTSxTQUF4QztNQUFtRCxJQUFBLEVBQU0sUUFBekQ7S0FGTSxFQUdOO01BQUUsRUFBQSxFQUFJLFFBQU47TUFBZ0IsSUFBQSxFQUFNLFFBQXRCO01BQWdDLElBQUEsRUFBTSxRQUF0QztNQUFnRCxJQUFBLEVBQU0sY0FBdEQ7S0FITSxFQUlOO01BQUUsRUFBQSxFQUFJLEtBQU47TUFBYSxJQUFBLEVBQU0sS0FBbkI7TUFBMEIsSUFBQSxFQUFNLEtBQWhDO01BQXVDLElBQUEsRUFBTSxRQUE3QztLQUpNLEVBS047TUFBRSxFQUFBLEVBQUksTUFBTjtNQUFjLElBQUEsRUFBTSxXQUFwQjtNQUFpQyxJQUFBLEVBQU0sVUFBdkM7TUFBbUQsSUFBQSxFQUFNLFFBQXpEO0tBTE0sRUFNTjtNQUFFLEVBQUEsRUFBSSxPQUFOO01BQWUsSUFBQSxFQUFNLE9BQXJCO01BQThCLElBQUEsRUFBTSxNQUFwQztNQUE0QyxJQUFBLEVBQU0sTUFBbEQ7S0FOTSxFQVFOO01BQUUsRUFBQSxFQUFJLE9BQU47TUFBZSxJQUFBLEVBQU0sT0FBckI7TUFBOEIsSUFBQSxFQUFNLGdCQUFwQztNQUFzRCxJQUFBLEVBQU0sUUFB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QUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxNQUFQO09BQUwsRUFBb0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBQ2xCLGNBQUE7QUFBQTtlQUFBLHVDQUFBOzt5QkFDRSxLQUFDLENBQUEsT0FBRCxDQUFTLElBQUksQ0FBQyxFQUFkLEVBQXNCLElBQUEsUUFBQSxDQUFTLElBQVQsQ0FBdEI7QUFERjs7UUFEa0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBCO0lBRFE7O3VCQUtWLEtBQUEsR0FBTyxTQUFDLEVBQUQ7TUFDTCxJQUFHLENBQUMsQ0FBQyxJQUFDLENBQUEsSUFBRCxDQUFNLE9BQUEsR0FBUSxFQUFkLENBQW1CLENBQUMsUUFBcEIsQ0FBNkIsVUFBN0IsQ0FBRCxDQUFKO2VBQ0UsSUFBQyxDQUFBLFVBQVcsQ0FBRyxFQUFELEdBQUksV0FBTixDQUFaLENBQUEsRUFERjs7SUFESzs7dUJBSVAsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLE1BQVA7QUFDUixVQUFBO01BQUEsU0FBQSxHQUFZLElBQUMsQ0FBQSxJQUFELENBQU0sUUFBQSxHQUFTLElBQWY7TUFDWixJQUFHLE1BQUg7UUFDRSxTQUFTLENBQUMsV0FBVixDQUFzQixVQUF0QixFQURGO09BQUEsTUFBQTtRQUdFLFNBQVMsQ0FBQyxRQUFWLENBQW1CLFVBQW5CLEVBSEY7O0lBRlE7Ozs7S0FWVztBQXpDdkIiLCJzb3VyY2VzQ29udGVudCI6WyJ7VmlldywgJH0gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcblxuaXRlbXMgPSBbXG4gIHsgaWQ6ICdwcm9qZWN0JywgbWVudTogJ1Byb2plY3QnLCBpY29uOiAnaWNvbi1yZXBvJywgdHlwZTogJ2FjdGl2ZSd9XG4gIHsgaWQ6ICdjb21wYXJlJywgbWVudTogJ0NvbXBhcmUnLCBpY29uOiAnY29tcGFyZScsIHR5cGU6ICdhY3RpdmUnfVxuICB7IGlkOiAnY29tbWl0JywgbWVudTogJ0NvbW1pdCcsIGljb246ICdjb21taXQnLCB0eXBlOiAnZmlsZSBtZXJnaW5nJ31cbiAgeyBpZDogJ3RhZycsIG1lbnU6ICdUYWcnLCBpY29uOiAndGFnJywgdHlwZTogJ2FjdGl2ZSd9XG4gIHsgaWQ6ICdwdGFnJywgbWVudTogJ1B1c2ggVGFncycsIGljb246ICd2ZXJzaW9ucycsIHR5cGU6ICdhY3RpdmUnfVxuICB7IGlkOiAncmVzZXQnLCBtZW51OiAnUmVzZXQnLCBpY29uOiAnc3luYycsIHR5cGU6ICdmaWxlJ31cbiAgIyB7IGlkOiAnY2xvbmUnLCBtZW51OiAnQ2xvbmUnLCBpY29uOiAnY2xvbmUnfVxuICB7IGlkOiAnZmV0Y2gnLCBtZW51OiAnRmV0Y2gnLCBpY29uOiAnY2xvdWQtZG93bmxvYWQnLCB0eXBlOiAncmVtb3RlJ31cbiAgeyBpZDogJ3B1bGwnLCBtZW51OiAnUHVsbCcsIGljb246ICdwdWxsJywgdHlwZTogJ3Vwc3RyZWFtJ31cbiAgeyBpZDogJ3B1bGx1cCcsIG1lbnU6ICdQdWxsIFVwc3RyZWFtJywgaWNvbjogJ2Rlc2t0b3AtZG93bmxvYWQnLCB0eXBlOiAnYWN0aXZlJ31cbiAgeyBpZDogJ3B1c2gnLCBtZW51OiAnUHVzaCcsIGljb246ICdwdXNoJywgdHlwZTogJ2Rvd25zdHJlYW0nfVxuICB7IGlkOiAncmViYXNlJywgbWVudTogJ1JlYmFzZScsIGljb246ICdjaXJjdWl0LWJvYXJkJywgdHlwZTogJ2FjdGl2ZSd9XG4gIHsgaWQ6ICdtZXJnZScsIG1lbnU6ICdNZXJnZScsIGljb246ICdtZXJnZScsIHR5cGU6ICdhY3RpdmUnfVxuICB7IGlkOiAnYnJhbmNoJywgbWVudTogJ0JyYW5jaCcsIGljb246ICdicmFuY2gnLCB0eXBlOiAnYWN0aXZlJ31cbiAgeyBpZDogJ2Zsb3cnLCBtZW51OiAnR2l0RmxvdycsIGljb246ICdmbG93JywgdHlwZTogJ2FjdGl2ZScsIHNob3dDb25maWc6ICdnaXQtY29udHJvbC5zaG93R2l0Rmxvd0J1dHRvbid9XG5dXG5cbmNsYXNzIE1lbnVJdGVtIGV4dGVuZHMgVmlld1xuICBAY29udGVudDogKGl0ZW0pIC0+XG4gICAga2xhc3MgPSBpZiBpdGVtLnR5cGUgaXMgJ2FjdGl2ZScgdGhlbiAnJyBlbHNlICdpbmFjdGl2ZSdcbiAgICBrbGFzcyArPSBpZiBpdGVtLnNob3dDb25maWc/ICYmICFhdG9tLmNvbmZpZy5nZXQoaXRlbS5zaG93Q29uZmlnKSB0aGVuICcgaGlkZScgZWxzZSAnJ1xuXG4gICAgQGRpdiBjbGFzczogXCJpdGVtICN7a2xhc3N9ICN7aXRlbS50eXBlfVwiLCBpZDogXCJtZW51I3tpdGVtLmlkfVwiLCBjbGljazogJ2NsaWNrJywgPT5cbiAgICAgIEBkaXYgY2xhc3M6IFwiaWNvbiBsYXJnZSAje2l0ZW0uaWNvbn1cIlxuICAgICAgQGRpdiBpdGVtLm1lbnVcblxuICBpbml0aWFsaXplOiAoaXRlbSkgLT5cbiAgICBAaXRlbSA9IGl0ZW1cblxuICAgIGlmIGl0ZW0uc2hvd0NvbmZpZz9cbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUgaXRlbS5zaG93Q29uZmlnLCAoc2hvdykgLT5cbiAgICAgICAgaWYgc2hvdyB0aGVuICQoXCIjbWVudSN7aXRlbS5pZH1cIikucmVtb3ZlQ2xhc3MoJ2hpZGUnKVxuICAgICAgICBlbHNlICQoXCIjbWVudSN7aXRlbS5pZH1cIikuYWRkQ2xhc3MoJ2hpZGUnKVxuXG4gIGNsaWNrOiAtPlxuICAgIEBwYXJlbnRWaWV3LmNsaWNrKEBpdGVtLmlkKVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBNZW51VmlldyBleHRlbmRzIFZpZXdcbiAgQGNvbnRlbnQ6IChpdGVtKSAtPlxuICAgIEBkaXYgY2xhc3M6ICdtZW51JywgPT5cbiAgICAgIGZvciBpdGVtIGluIGl0ZW1zXG4gICAgICAgIEBzdWJ2aWV3IGl0ZW0uaWQsIG5ldyBNZW51SXRlbShpdGVtKVxuXG4gIGNsaWNrOiAoaWQpIC0+XG4gICAgaWYgIShAZmluZChcIiNtZW51I3tpZH1cIikuaGFzQ2xhc3MoJ2luYWN0aXZlJykpXG4gICAgICBAcGFyZW50Vmlld1tcIiN7aWR9TWVudUNsaWNrXCJdKClcblxuICBhY3RpdmF0ZTogKHR5cGUsIGFjdGl2ZSkgLT5cbiAgICBtZW51SXRlbXMgPSBAZmluZChcIi5pdGVtLiN7dHlwZX1cIilcbiAgICBpZiBhY3RpdmVcbiAgICAgIG1lbnVJdGVtcy5yZW1vdmVDbGFzcygnaW5hY3RpdmUnKVxuICAgIGVsc2VcbiAgICAgIG1lbnVJdGVtcy5hZGRDbGFzcygnaW5hY3RpdmUnKVxuXG4gICAgcmV0dXJuXG4iXX0=
