(function() {
  var OutputViewManager, git, notifier;

  git = require('../git');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  module.exports = function(repo) {
    var cwd;
    cwd = repo.getWorkingDirectory();
    return git.cmd(['stash', 'pop'], {
      cwd: cwd
    }, {
      color: true
    }).then(function(msg) {
      if (msg !== '') {
        return OutputViewManager.getView().showContent(msg);
      }
    })["catch"](function(msg) {
      return notifier.addInfo(msg);
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9tb2RlbHMvZ2l0LXN0YXNoLXBvcC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBQ1gsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLHdCQUFSOztFQUVwQixNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLElBQUQ7QUFDZixRQUFBO0lBQUEsR0FBQSxHQUFNLElBQUksQ0FBQyxtQkFBTCxDQUFBO1dBQ04sR0FBRyxDQUFDLEdBQUosQ0FBUSxDQUFDLE9BQUQsRUFBVSxLQUFWLENBQVIsRUFBMEI7TUFBQyxLQUFBLEdBQUQ7S0FBMUIsRUFBaUM7TUFBQSxLQUFBLEVBQU8sSUFBUDtLQUFqQyxDQUNBLENBQUMsSUFERCxDQUNNLFNBQUMsR0FBRDtNQUNKLElBQWdELEdBQUEsS0FBUyxFQUF6RDtlQUFBLGlCQUFpQixDQUFDLE9BQWxCLENBQUEsQ0FBMkIsQ0FBQyxXQUE1QixDQUF3QyxHQUF4QyxFQUFBOztJQURJLENBRE4sQ0FHQSxFQUFDLEtBQUQsRUFIQSxDQUdPLFNBQUMsR0FBRDthQUNMLFFBQVEsQ0FBQyxPQUFULENBQWlCLEdBQWpCO0lBREssQ0FIUDtFQUZlO0FBSmpCIiwic291cmNlc0NvbnRlbnQiOlsiZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xubm90aWZpZXIgPSByZXF1aXJlICcuLi9ub3RpZmllcidcbk91dHB1dFZpZXdNYW5hZ2VyID0gcmVxdWlyZSAnLi4vb3V0cHV0LXZpZXctbWFuYWdlcidcblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbykgLT5cbiAgY3dkID0gcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KClcbiAgZ2l0LmNtZChbJ3N0YXNoJywgJ3BvcCddLCB7Y3dkfSwgY29sb3I6IHRydWUpXG4gIC50aGVuIChtc2cpIC0+XG4gICAgT3V0cHV0Vmlld01hbmFnZXIuZ2V0VmlldygpLnNob3dDb250ZW50KG1zZykgaWYgbXNnIGlzbnQgJydcbiAgLmNhdGNoIChtc2cpIC0+XG4gICAgbm90aWZpZXIuYWRkSW5mbyBtc2dcbiJdfQ==
