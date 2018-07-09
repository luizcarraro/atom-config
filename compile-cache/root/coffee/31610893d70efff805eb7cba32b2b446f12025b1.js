(function() {
  var OutputViewManager, emptyOrUndefined, getUpstream, git, notifier;

  git = require('../git');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  emptyOrUndefined = function(thing) {
    return thing !== '' && thing !== void 0;
  };

  getUpstream = function(repo) {
    var branch, branchInfo, ref, remote;
    branchInfo = (ref = repo.getUpstreamBranch()) != null ? ref.substring('refs/remotes/'.length).split('/') : void 0;
    if (!branchInfo) {
      return null;
    }
    remote = branchInfo[0];
    branch = branchInfo.slice(1).join('/');
    return [remote, branch];
  };

  module.exports = function(repo, arg) {
    var args, extraArgs, startMessage, upstream, view;
    extraArgs = (arg != null ? arg : {}).extraArgs;
    if (upstream = getUpstream(repo)) {
      if (extraArgs == null) {
        extraArgs = [];
      }
      view = OutputViewManager.getView();
      startMessage = notifier.addInfo("Pulling...", {
        dismissable: true
      });
      args = ['pull'].concat(extraArgs).concat(upstream).filter(emptyOrUndefined);
      return git.cmd(args, {
        cwd: repo.getWorkingDirectory()
      }, {
        color: true
      }).then(function(data) {
        view.showContent(data);
        return startMessage.dismiss();
      })["catch"](function(error) {
        view.showContent(error);
        return startMessage.dismiss();
      });
    } else {
      return notifier.addInfo('The current branch is not tracking from upstream');
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9tb2RlbHMvX3B1bGwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUNYLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx3QkFBUjs7RUFFcEIsZ0JBQUEsR0FBbUIsU0FBQyxLQUFEO1dBQVcsS0FBQSxLQUFXLEVBQVgsSUFBa0IsS0FBQSxLQUFXO0VBQXhDOztFQUVuQixXQUFBLEdBQWMsU0FBQyxJQUFEO0FBQ1osUUFBQTtJQUFBLFVBQUEsaURBQXFDLENBQUUsU0FBMUIsQ0FBb0MsZUFBZSxDQUFDLE1BQXBELENBQTJELENBQUMsS0FBNUQsQ0FBa0UsR0FBbEU7SUFDYixJQUFlLENBQUksVUFBbkI7QUFBQSxhQUFPLEtBQVA7O0lBQ0EsTUFBQSxHQUFTLFVBQVcsQ0FBQSxDQUFBO0lBQ3BCLE1BQUEsR0FBUyxVQUFVLENBQUMsS0FBWCxDQUFpQixDQUFqQixDQUFtQixDQUFDLElBQXBCLENBQXlCLEdBQXpCO1dBQ1QsQ0FBQyxNQUFELEVBQVMsTUFBVDtFQUxZOztFQU9kLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsSUFBRCxFQUFPLEdBQVA7QUFDZixRQUFBO0lBRHVCLDJCQUFELE1BQVk7SUFDbEMsSUFBRyxRQUFBLEdBQVcsV0FBQSxDQUFZLElBQVosQ0FBZDs7UUFDRSxZQUFhOztNQUNiLElBQUEsR0FBTyxpQkFBaUIsQ0FBQyxPQUFsQixDQUFBO01BQ1AsWUFBQSxHQUFlLFFBQVEsQ0FBQyxPQUFULENBQWlCLFlBQWpCLEVBQStCO1FBQUEsV0FBQSxFQUFhLElBQWI7T0FBL0I7TUFDZixJQUFBLEdBQU8sQ0FBQyxNQUFELENBQVEsQ0FBQyxNQUFULENBQWdCLFNBQWhCLENBQTBCLENBQUMsTUFBM0IsQ0FBa0MsUUFBbEMsQ0FBMkMsQ0FBQyxNQUE1QyxDQUFtRCxnQkFBbkQ7YUFDUCxHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsRUFBYztRQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO09BQWQsRUFBK0M7UUFBQyxLQUFBLEVBQU8sSUFBUjtPQUEvQyxDQUNBLENBQUMsSUFERCxDQUNNLFNBQUMsSUFBRDtRQUNKLElBQUksQ0FBQyxXQUFMLENBQWlCLElBQWpCO2VBQ0EsWUFBWSxDQUFDLE9BQWIsQ0FBQTtNQUZJLENBRE4sQ0FJQSxFQUFDLEtBQUQsRUFKQSxDQUlPLFNBQUMsS0FBRDtRQUNMLElBQUksQ0FBQyxXQUFMLENBQWlCLEtBQWpCO2VBQ0EsWUFBWSxDQUFDLE9BQWIsQ0FBQTtNQUZLLENBSlAsRUFMRjtLQUFBLE1BQUE7YUFhRSxRQUFRLENBQUMsT0FBVCxDQUFpQixrREFBakIsRUFiRjs7RUFEZTtBQWJqQiIsInNvdXJjZXNDb250ZW50IjpbImdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcbm5vdGlmaWVyID0gcmVxdWlyZSAnLi4vbm90aWZpZXInXG5PdXRwdXRWaWV3TWFuYWdlciA9IHJlcXVpcmUgJy4uL291dHB1dC12aWV3LW1hbmFnZXInXG5cbmVtcHR5T3JVbmRlZmluZWQgPSAodGhpbmcpIC0+IHRoaW5nIGlzbnQgJycgYW5kIHRoaW5nIGlzbnQgdW5kZWZpbmVkXG5cbmdldFVwc3RyZWFtID0gKHJlcG8pIC0+XG4gIGJyYW5jaEluZm8gPSByZXBvLmdldFVwc3RyZWFtQnJhbmNoKCk/LnN1YnN0cmluZygncmVmcy9yZW1vdGVzLycubGVuZ3RoKS5zcGxpdCgnLycpXG4gIHJldHVybiBudWxsIGlmIG5vdCBicmFuY2hJbmZvXG4gIHJlbW90ZSA9IGJyYW5jaEluZm9bMF1cbiAgYnJhbmNoID0gYnJhbmNoSW5mby5zbGljZSgxKS5qb2luKCcvJylcbiAgW3JlbW90ZSwgYnJhbmNoXVxuXG5tb2R1bGUuZXhwb3J0cyA9IChyZXBvLCB7ZXh0cmFBcmdzfT17fSkgLT5cbiAgaWYgdXBzdHJlYW0gPSBnZXRVcHN0cmVhbShyZXBvKVxuICAgIGV4dHJhQXJncyA/PSBbXVxuICAgIHZpZXcgPSBPdXRwdXRWaWV3TWFuYWdlci5nZXRWaWV3KClcbiAgICBzdGFydE1lc3NhZ2UgPSBub3RpZmllci5hZGRJbmZvIFwiUHVsbGluZy4uLlwiLCBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgIGFyZ3MgPSBbJ3B1bGwnXS5jb25jYXQoZXh0cmFBcmdzKS5jb25jYXQodXBzdHJlYW0pLmZpbHRlcihlbXB0eU9yVW5kZWZpbmVkKVxuICAgIGdpdC5jbWQoYXJncywgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSwge2NvbG9yOiB0cnVlfSlcbiAgICAudGhlbiAoZGF0YSkgLT5cbiAgICAgIHZpZXcuc2hvd0NvbnRlbnQoZGF0YSlcbiAgICAgIHN0YXJ0TWVzc2FnZS5kaXNtaXNzKClcbiAgICAuY2F0Y2ggKGVycm9yKSAtPlxuICAgICAgdmlldy5zaG93Q29udGVudChlcnJvcilcbiAgICAgIHN0YXJ0TWVzc2FnZS5kaXNtaXNzKClcbiAgZWxzZVxuICAgIG5vdGlmaWVyLmFkZEluZm8gJ1RoZSBjdXJyZW50IGJyYW5jaCBpcyBub3QgdHJhY2tpbmcgZnJvbSB1cHN0cmVhbSdcbiJdfQ==
