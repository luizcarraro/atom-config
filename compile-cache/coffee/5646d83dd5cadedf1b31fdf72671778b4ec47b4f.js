(function() {
  var CMD_TOGGLE, CompositeDisposable, EVT_SWITCH, GitControl, GitControlView, git, item, pane, view, views;

  GitControlView = require('./git-control-view');

  CompositeDisposable = require('atom').CompositeDisposable;

  git = require('./git');

  CMD_TOGGLE = 'git-control:toggle';

  EVT_SWITCH = 'pane-container:active-pane-item-changed';

  views = [];

  view = void 0;

  pane = void 0;

  item = void 0;

  module.exports = GitControl = {
    activate: function(state) {
      console.log('GitControl: activate');
      atom.commands.add('atom-workspace', CMD_TOGGLE, (function(_this) {
        return function() {
          return _this.toggleView();
        };
      })(this));
      atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function(item) {
          return _this.updateViews();
        };
      })(this));
      atom.project.onDidChangePaths((function(_this) {
        return function() {
          return _this.updatePaths();
        };
      })(this));
    },
    deactivate: function() {
      console.log('GitControl: deactivate');
    },
    toggleView: function() {
      console.log('GitControl: toggle');
      if (!(view && view.active)) {
        view = new GitControlView();
        views.push(view);
        pane = atom.workspace.getActivePane();
        item = pane.addItem(view, {
          index: 0
        });
        pane.activateItem(item);
      } else {
        pane.destroyItem(item);
      }
    },
    updatePaths: function() {
      git.setProjectIndex(0);
    },
    updateViews: function() {
      var activeView, i, len, v;
      activeView = atom.workspace.getActivePane().getActiveItem();
      for (i = 0, len = views.length; i < len; i++) {
        v = views[i];
        if (v === activeView) {
          v.update();
        }
      }
    },
    updatePaths: function() {
      git.setProjectIndex(0);
    },
    serialize: function() {},
    config: {
      showGitFlowButton: {
        title: 'Show GitFlow button',
        description: 'Show the GitFlow button in the Git Control toolbar',
        type: 'boolean',
        "default": true
      },
      noFastForward: {
        title: 'Disable Fast Forward',
        description: 'Disable Fast Forward for default at Git Merge',
        type: 'boolean',
        "default": false
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi9naXQtY29udHJvbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG9CQUFSOztFQUNoQixzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLEdBQUEsR0FBTSxPQUFBLENBQVEsT0FBUjs7RUFFTixVQUFBLEdBQWE7O0VBQ2IsVUFBQSxHQUFhOztFQUViLEtBQUEsR0FBUTs7RUFDUixJQUFBLEdBQU87O0VBQ1AsSUFBQSxHQUFPOztFQUNQLElBQUEsR0FBTzs7RUFFUCxNQUFNLENBQUMsT0FBUCxHQUFpQixVQUFBLEdBRWY7SUFBQSxRQUFBLEVBQVUsU0FBQyxLQUFEO01BQ1IsT0FBTyxDQUFDLEdBQVIsQ0FBWSxzQkFBWjtNQUVBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0MsVUFBcEMsRUFBZ0QsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxVQUFELENBQUE7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEQ7TUFDQSxJQUFJLENBQUMsU0FBUyxDQUFDLHlCQUFmLENBQXlDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO2lCQUFVLEtBQUMsQ0FBQSxXQUFELENBQUE7UUFBVjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekM7TUFDQSxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFiLENBQThCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsV0FBRCxDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlCO0lBTFEsQ0FBVjtJQVFBLFVBQUEsRUFBWSxTQUFBO01BQ1YsT0FBTyxDQUFDLEdBQVIsQ0FBWSx3QkFBWjtJQURVLENBUlo7SUFZQSxVQUFBLEVBQVksU0FBQTtNQUNWLE9BQU8sQ0FBQyxHQUFSLENBQVksb0JBQVo7TUFFQSxJQUFBLENBQUEsQ0FBTyxJQUFBLElBQVMsSUFBSSxDQUFDLE1BQXJCLENBQUE7UUFDRSxJQUFBLEdBQVcsSUFBQSxjQUFBLENBQUE7UUFDWCxLQUFLLENBQUMsSUFBTixDQUFXLElBQVg7UUFFQSxJQUFBLEdBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQUE7UUFDUCxJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQUwsQ0FBYSxJQUFiLEVBQW1CO1VBQUMsS0FBQSxFQUFPLENBQVI7U0FBbkI7UUFFUCxJQUFJLENBQUMsWUFBTCxDQUFrQixJQUFsQixFQVBGO09BQUEsTUFBQTtRQVVFLElBQUksQ0FBQyxXQUFMLENBQWlCLElBQWpCLEVBVkY7O0lBSFUsQ0FaWjtJQTZCQSxXQUFBLEVBQWEsU0FBQTtNQUNWLEdBQUcsQ0FBQyxlQUFKLENBQW9CLENBQXBCO0lBRFUsQ0E3QmI7SUFpQ0EsV0FBQSxFQUFhLFNBQUE7QUFDWCxVQUFBO01BQUEsVUFBQSxHQUFhLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUFBLENBQThCLENBQUMsYUFBL0IsQ0FBQTtBQUNiLFdBQUEsdUNBQUE7O1lBQW9CLENBQUEsS0FBSztVQUN2QixDQUFDLENBQUMsTUFBRixDQUFBOztBQURGO0lBRlcsQ0FqQ2I7SUF1Q0EsV0FBQSxFQUFhLFNBQUE7TUFFWCxHQUFHLENBQUMsZUFBSixDQUFvQixDQUFwQjtJQUZXLENBdkNiO0lBNENBLFNBQUEsRUFBVyxTQUFBLEdBQUEsQ0E1Q1g7SUE4Q0EsTUFBQSxFQUNFO01BQUEsaUJBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxxQkFBUDtRQUNBLFdBQUEsRUFBYSxvREFEYjtRQUVBLElBQUEsRUFBTSxTQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUhUO09BREY7TUFLQSxhQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sc0JBQVA7UUFDQSxXQUFBLEVBQWEsK0NBRGI7UUFFQSxJQUFBLEVBQU0sU0FGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtPQU5GO0tBL0NGOztBQWRGIiwic291cmNlc0NvbnRlbnQiOlsiR2l0Q29udHJvbFZpZXcgPSByZXF1aXJlICcuL2dpdC1jb250cm9sLXZpZXcnXG57Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuZ2l0ID0gcmVxdWlyZSAnLi9naXQnXG5cbkNNRF9UT0dHTEUgPSAnZ2l0LWNvbnRyb2w6dG9nZ2xlJ1xuRVZUX1NXSVRDSCA9ICdwYW5lLWNvbnRhaW5lcjphY3RpdmUtcGFuZS1pdGVtLWNoYW5nZWQnXG5cbnZpZXdzID0gW11cbnZpZXcgPSB1bmRlZmluZWRcbnBhbmUgPSB1bmRlZmluZWRcbml0ZW0gPSB1bmRlZmluZWRcblxubW9kdWxlLmV4cG9ydHMgPSBHaXRDb250cm9sID1cblxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgIGNvbnNvbGUubG9nICdHaXRDb250cm9sOiBhY3RpdmF0ZSdcblxuICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsIENNRF9UT0dHTEUsID0+IEB0b2dnbGVWaWV3KClcbiAgICBhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtIChpdGVtKSA9PiBAdXBkYXRlVmlld3MoKVxuICAgIGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzID0+IEB1cGRhdGVQYXRocygpXG4gICAgcmV0dXJuXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBjb25zb2xlLmxvZyAnR2l0Q29udHJvbDogZGVhY3RpdmF0ZSdcbiAgICByZXR1cm5cblxuICB0b2dnbGVWaWV3OiAtPlxuICAgIGNvbnNvbGUubG9nICdHaXRDb250cm9sOiB0b2dnbGUnXG5cbiAgICB1bmxlc3MgdmlldyBhbmQgdmlldy5hY3RpdmVcbiAgICAgIHZpZXcgPSBuZXcgR2l0Q29udHJvbFZpZXcoKVxuICAgICAgdmlld3MucHVzaCB2aWV3XG5cbiAgICAgIHBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICAgIGl0ZW0gPSBwYW5lLmFkZEl0ZW0gdmlldywge2luZGV4OiAwfVxuXG4gICAgICBwYW5lLmFjdGl2YXRlSXRlbSBpdGVtXG5cbiAgICBlbHNlXG4gICAgICBwYW5lLmRlc3Ryb3lJdGVtIGl0ZW1cblxuICAgIHJldHVyblxuXG4gIHVwZGF0ZVBhdGhzOiAtPlxuICAgICBnaXQuc2V0UHJvamVjdEluZGV4KDApXG4gICAgIHJldHVyblxuXG4gIHVwZGF0ZVZpZXdzOiAtPlxuICAgIGFjdGl2ZVZpZXcgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkuZ2V0QWN0aXZlSXRlbSgpXG4gICAgZm9yIHYgaW4gdmlld3Mgd2hlbiB2IGlzIGFjdGl2ZVZpZXdcbiAgICAgIHYudXBkYXRlKClcbiAgICByZXR1cm5cblxuICB1cGRhdGVQYXRoczogLT5cbiAgICAjIHdoZW4gcHJvamVjdHMgcGF0aHMgY2hhbmdlZCByZXN0YXJ0IHdpdGhpbiAwXG4gICAgZ2l0LnNldFByb2plY3RJbmRleCgwKTtcbiAgICByZXR1cm5cblxuICBzZXJpYWxpemU6IC0+XG5cbiAgY29uZmlnOlxuICAgIHNob3dHaXRGbG93QnV0dG9uOlxuICAgICAgdGl0bGU6ICdTaG93IEdpdEZsb3cgYnV0dG9uJ1xuICAgICAgZGVzY3JpcHRpb246ICdTaG93IHRoZSBHaXRGbG93IGJ1dHRvbiBpbiB0aGUgR2l0IENvbnRyb2wgdG9vbGJhcidcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIG5vRmFzdEZvcndhcmQ6XG4gICAgICB0aXRsZTogJ0Rpc2FibGUgRmFzdCBGb3J3YXJkJ1xuICAgICAgZGVzY3JpcHRpb246ICdEaXNhYmxlIEZhc3QgRm9yd2FyZCBmb3IgZGVmYXVsdCBhdCBHaXQgTWVyZ2UnXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4iXX0=
