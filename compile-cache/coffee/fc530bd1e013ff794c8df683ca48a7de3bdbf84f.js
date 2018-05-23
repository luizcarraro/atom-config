(function() {
  var OutputViewManager, fs, git, notifier;

  git = require('../git');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  fs = require('fs-plus');

  module.exports = function(repo, arg) {
    var file, isFolder, ref, tool;
    file = (arg != null ? arg : {}).file;
    if (file == null) {
      file = repo.relativize((ref = atom.workspace.getActiveTextEditor()) != null ? ref.getPath() : void 0);
    }
    isFolder = fs.isDirectorySync(file);
    if (!file) {
      return notifier.addInfo("No open file. Select 'Diff All'.");
    }
    if (!(tool = git.getConfig(repo, 'diff.tool'))) {
      return notifier.addInfo("You don't have a difftool configured.");
    } else {
      return git.cmd(['diff-index', 'HEAD', '-z'], {
        cwd: repo.getWorkingDirectory()
      }).then(function(data) {
        var args, diffIndex, diffsForCurrentFile, includeStagedDiff;
        diffIndex = data.split('\0');
        includeStagedDiff = atom.config.get('git-plus.diffs.includeStagedDiff');
        if (isFolder) {
          args = ['difftool', '-d', '--no-prompt'];
          if (includeStagedDiff) {
            args.push('HEAD');
          }
          args.push(file);
          git.cmd(args, {
            cwd: repo.getWorkingDirectory()
          })["catch"](function(msg) {
            return OutputViewManager.getView().showContent(msg);
          });
          return;
        }
        diffsForCurrentFile = diffIndex.map(function(line, i) {
          var path, staged;
          if (i % 2 === 0) {
            staged = !/^0{40}$/.test(diffIndex[i].split(' ')[3]);
            path = diffIndex[i + 1];
            if (path === file && (!staged || includeStagedDiff)) {
              return true;
            }
          } else {
            return void 0;
          }
        });
        if (diffsForCurrentFile.filter(function(diff) {
          return diff != null;
        })[0] != null) {
          args = ['difftool', '--no-prompt'];
          if (includeStagedDiff) {
            args.push('HEAD');
          }
          args.push(file);
          return git.cmd(args, {
            cwd: repo.getWorkingDirectory()
          })["catch"](function(msg) {
            return OutputViewManager.getView().showContent(msg);
          });
        } else {
          return notifier.addInfo('Nothing to show.');
        }
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9tb2RlbHMvZ2l0LWRpZmZ0b29sLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxpQkFBQSxHQUFvQixPQUFBLENBQVEsd0JBQVI7O0VBQ3BCLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFFTCxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLElBQUQsRUFBTyxHQUFQO0FBQ2YsUUFBQTtJQUR1QixzQkFBRCxNQUFPOztNQUM3QixPQUFRLElBQUksQ0FBQyxVQUFMLDJEQUFvRCxDQUFFLE9BQXRDLENBQUEsVUFBaEI7O0lBQ1IsUUFBQSxHQUFXLEVBQUUsQ0FBQyxlQUFILENBQW1CLElBQW5CO0lBRVgsSUFBRyxDQUFJLElBQVA7QUFDRSxhQUFPLFFBQVEsQ0FBQyxPQUFULENBQWlCLGtDQUFqQixFQURUOztJQUtBLElBQUEsQ0FBTyxDQUFBLElBQUEsR0FBTyxHQUFHLENBQUMsU0FBSixDQUFjLElBQWQsRUFBb0IsV0FBcEIsQ0FBUCxDQUFQO2FBQ0UsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsdUNBQWpCLEVBREY7S0FBQSxNQUFBO2FBR0UsR0FBRyxDQUFDLEdBQUosQ0FBUSxDQUFDLFlBQUQsRUFBZSxNQUFmLEVBQXVCLElBQXZCLENBQVIsRUFBc0M7UUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBTDtPQUF0QyxDQUNBLENBQUMsSUFERCxDQUNNLFNBQUMsSUFBRDtBQUNKLFlBQUE7UUFBQSxTQUFBLEdBQVksSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFYO1FBQ1osaUJBQUEsR0FBb0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGtDQUFoQjtRQUVwQixJQUFHLFFBQUg7VUFDRSxJQUFBLEdBQU8sQ0FBQyxVQUFELEVBQWEsSUFBYixFQUFtQixhQUFuQjtVQUNQLElBQW9CLGlCQUFwQjtZQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsTUFBVixFQUFBOztVQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBVjtVQUNBLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixFQUFjO1lBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7V0FBZCxDQUNBLEVBQUMsS0FBRCxFQURBLENBQ08sU0FBQyxHQUFEO21CQUFTLGlCQUFpQixDQUFDLE9BQWxCLENBQUEsQ0FBMkIsQ0FBQyxXQUE1QixDQUF3QyxHQUF4QztVQUFULENBRFA7QUFFQSxpQkFORjs7UUFRQSxtQkFBQSxHQUFzQixTQUFTLENBQUMsR0FBVixDQUFjLFNBQUMsSUFBRCxFQUFPLENBQVA7QUFDbEMsY0FBQTtVQUFBLElBQUcsQ0FBQSxHQUFJLENBQUosS0FBUyxDQUFaO1lBQ0UsTUFBQSxHQUFTLENBQUksU0FBUyxDQUFDLElBQVYsQ0FBZSxTQUFVLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBYixDQUFtQixHQUFuQixDQUF3QixDQUFBLENBQUEsQ0FBdkM7WUFDYixJQUFBLEdBQU8sU0FBVSxDQUFBLENBQUEsR0FBRSxDQUFGO1lBQ2pCLElBQVEsSUFBQSxLQUFRLElBQVIsSUFBaUIsQ0FBQyxDQUFDLE1BQUQsSUFBVyxpQkFBWixDQUF6QjtxQkFBQSxLQUFBO2FBSEY7V0FBQSxNQUFBO21CQUtFLE9BTEY7O1FBRGtDLENBQWQ7UUFRdEIsSUFBRzs7cUJBQUg7VUFDRSxJQUFBLEdBQU8sQ0FBQyxVQUFELEVBQWEsYUFBYjtVQUNQLElBQW9CLGlCQUFwQjtZQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsTUFBVixFQUFBOztVQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBVjtpQkFDQSxHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsRUFBYztZQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO1dBQWQsQ0FDQSxFQUFDLEtBQUQsRUFEQSxDQUNPLFNBQUMsR0FBRDttQkFBUyxpQkFBaUIsQ0FBQyxPQUFsQixDQUFBLENBQTJCLENBQUMsV0FBNUIsQ0FBd0MsR0FBeEM7VUFBVCxDQURQLEVBSkY7U0FBQSxNQUFBO2lCQU9FLFFBQVEsQ0FBQyxPQUFULENBQWlCLGtCQUFqQixFQVBGOztNQXBCSSxDQUROLEVBSEY7O0VBVGU7QUFMakIiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuT3V0cHV0Vmlld01hbmFnZXIgPSByZXF1aXJlICcuLi9vdXRwdXQtdmlldy1tYW5hZ2VyJ1xuZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IChyZXBvLCB7ZmlsZX09e30pIC0+XG4gIGZpbGUgPz0gcmVwby5yZWxhdGl2aXplKGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKT8uZ2V0UGF0aCgpKVxuICBpc0ZvbGRlciA9IGZzLmlzRGlyZWN0b3J5U3luYyBmaWxlXG5cbiAgaWYgbm90IGZpbGVcbiAgICByZXR1cm4gbm90aWZpZXIuYWRkSW5mbyBcIk5vIG9wZW4gZmlsZS4gU2VsZWN0ICdEaWZmIEFsbCcuXCJcblxuICAjIFdlIHBhcnNlIHRoZSBvdXRwdXQgb2YgZ2l0IGRpZmYtaW5kZXggdG8gaGFuZGxlIHRoZSBjYXNlIG9mIGEgc3RhZ2VkIGZpbGVcbiAgIyB3aGVuIGdpdC1wbHVzLmRpZmZzLmluY2x1ZGVTdGFnZWREaWZmIGlzIHNldCB0byBmYWxzZS5cbiAgdW5sZXNzIHRvb2wgPSBnaXQuZ2V0Q29uZmlnKHJlcG8sICdkaWZmLnRvb2wnKVxuICAgIG5vdGlmaWVyLmFkZEluZm8gXCJZb3UgZG9uJ3QgaGF2ZSBhIGRpZmZ0b29sIGNvbmZpZ3VyZWQuXCJcbiAgZWxzZVxuICAgIGdpdC5jbWQoWydkaWZmLWluZGV4JywgJ0hFQUQnLCAnLXonXSwgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAudGhlbiAoZGF0YSkgLT5cbiAgICAgIGRpZmZJbmRleCA9IGRhdGEuc3BsaXQoJ1xcMCcpXG4gICAgICBpbmNsdWRlU3RhZ2VkRGlmZiA9IGF0b20uY29uZmlnLmdldCAnZ2l0LXBsdXMuZGlmZnMuaW5jbHVkZVN0YWdlZERpZmYnXG5cbiAgICAgIGlmIGlzRm9sZGVyXG4gICAgICAgIGFyZ3MgPSBbJ2RpZmZ0b29sJywgJy1kJywgJy0tbm8tcHJvbXB0J11cbiAgICAgICAgYXJncy5wdXNoICdIRUFEJyBpZiBpbmNsdWRlU3RhZ2VkRGlmZlxuICAgICAgICBhcmdzLnB1c2ggZmlsZVxuICAgICAgICBnaXQuY21kKGFyZ3MsIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gICAgICAgIC5jYXRjaCAobXNnKSAtPiBPdXRwdXRWaWV3TWFuYWdlci5nZXRWaWV3KCkuc2hvd0NvbnRlbnQobXNnKVxuICAgICAgICByZXR1cm5cblxuICAgICAgZGlmZnNGb3JDdXJyZW50RmlsZSA9IGRpZmZJbmRleC5tYXAgKGxpbmUsIGkpIC0+XG4gICAgICAgIGlmIGkgJSAyIGlzIDBcbiAgICAgICAgICBzdGFnZWQgPSBub3QgL14wezQwfSQvLnRlc3QoZGlmZkluZGV4W2ldLnNwbGl0KCcgJylbM10pO1xuICAgICAgICAgIHBhdGggPSBkaWZmSW5kZXhbaSsxXVxuICAgICAgICAgIHRydWUgaWYgcGF0aCBpcyBmaWxlIGFuZCAoIXN0YWdlZCBvciBpbmNsdWRlU3RhZ2VkRGlmZilcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHVuZGVmaW5lZFxuXG4gICAgICBpZiBkaWZmc0ZvckN1cnJlbnRGaWxlLmZpbHRlcigoZGlmZikgLT4gZGlmZj8pWzBdP1xuICAgICAgICBhcmdzID0gWydkaWZmdG9vbCcsICctLW5vLXByb21wdCddXG4gICAgICAgIGFyZ3MucHVzaCAnSEVBRCcgaWYgaW5jbHVkZVN0YWdlZERpZmZcbiAgICAgICAgYXJncy5wdXNoIGZpbGVcbiAgICAgICAgZ2l0LmNtZChhcmdzLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAgICAgICAuY2F0Y2ggKG1zZykgLT4gT3V0cHV0Vmlld01hbmFnZXIuZ2V0VmlldygpLnNob3dDb250ZW50KG1zZylcbiAgICAgIGVsc2VcbiAgICAgICAgbm90aWZpZXIuYWRkSW5mbyAnTm90aGluZyB0byBzaG93LidcbiJdfQ==
