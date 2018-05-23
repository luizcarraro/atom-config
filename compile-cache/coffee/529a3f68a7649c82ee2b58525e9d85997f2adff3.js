(function() {
  var CompositeDisposable, GitPull, GitPush, Path, cleanup, commit, destroyCommitEditor, disposables, fs, getStagedFiles, getTemplate, git, notifier, prepFile, scissorsLine, showFile, trimFile, verboseCommitsEnabled;

  Path = require('path');

  CompositeDisposable = require('atom').CompositeDisposable;

  fs = require('fs-plus');

  git = require('../git');

  notifier = require('../notifier');

  GitPush = require('./git-push');

  GitPull = require('./git-pull');

  disposables = new CompositeDisposable;

  verboseCommitsEnabled = function() {
    return atom.config.get('git-plus.commits.verboseCommits');
  };

  scissorsLine = '------------------------ >8 ------------------------';

  getStagedFiles = function(repo) {
    return git.stagedFiles(repo).then(function(files) {
      if (files.length >= 1) {
        return git.cmd(['-c', 'color.ui=false', 'status'], {
          cwd: repo.getWorkingDirectory()
        });
      } else {
        return Promise.reject("Nothing to commit.");
      }
    });
  };

  getTemplate = function(filePath) {
    var e;
    if (filePath) {
      try {
        return fs.readFileSync(fs.absolute(filePath.trim())).toString().trim();
      } catch (error) {
        e = error;
        throw new Error("Your configured commit template file can't be found.");
      }
    } else {
      return '';
    }
  };

  prepFile = function(arg) {
    var commentChar, commitEditor, content, cwd, diff, filePath, indexOfComments, ref, status, template, text;
    status = arg.status, filePath = arg.filePath, diff = arg.diff, commentChar = arg.commentChar, template = arg.template;
    if (commitEditor = (ref = atom.workspace.paneForURI(filePath)) != null ? ref.itemForURI(filePath) : void 0) {
      text = commitEditor.getText();
      indexOfComments = text.indexOf(commentChar);
      if (indexOfComments > 0) {
        template = text.substring(0, indexOfComments - 1);
      }
    }
    cwd = Path.dirname(filePath);
    status = status.replace(/\s*\(.*\)\n/g, "\n");
    status = status.trim().replace(/\n/g, "\n" + commentChar + " ");
    content = template + "\n" + commentChar + " " + scissorsLine + "\n" + commentChar + " Do not touch the line above.\n" + commentChar + " Everything below will be removed.\n" + commentChar + " Please enter the commit message for your changes. Lines starting\n" + commentChar + " with '" + commentChar + "' will be ignored, and an empty message aborts the commit.\n" + commentChar + "\n" + commentChar + " " + status;
    if (diff) {
      content += "\n" + commentChar + "\n" + diff;
    }
    return fs.writeFileSync(filePath, content);
  };

  destroyCommitEditor = function(filePath) {
    var ref, ref1;
    if (atom.config.get('git-plus.general.openInPane')) {
      return (ref = atom.workspace.paneForURI(filePath)) != null ? ref.destroy() : void 0;
    } else {
      return (ref1 = atom.workspace.paneForURI(filePath).itemForURI(filePath)) != null ? ref1.destroy() : void 0;
    }
  };

  trimFile = function(filePath, commentChar) {
    var content, cwd, findScissorsLine, startOfComments;
    findScissorsLine = function(line) {
      return line.includes(commentChar + " " + scissorsLine);
    };
    cwd = Path.dirname(filePath);
    content = fs.readFileSync(fs.absolute(filePath)).toString();
    startOfComments = content.indexOf(content.split('\n').find(findScissorsLine));
    content = startOfComments > 0 ? content.substring(0, startOfComments) : content;
    return fs.writeFileSync(filePath, content);
  };

  commit = function(directory, filePath) {
    return git.cmd(['commit', "--cleanup=whitespace", "--file=" + filePath], {
      cwd: directory
    }).then(function(data) {
      notifier.addSuccess(data);
      destroyCommitEditor(filePath);
      return git.refresh();
    })["catch"](function(data) {
      notifier.addError(data);
      return destroyCommitEditor(filePath);
    });
  };

  cleanup = function(currentPane) {
    if (currentPane.isAlive()) {
      currentPane.activate();
    }
    return disposables.dispose();
  };

  showFile = function(filePath) {
    var commitEditor, ref, splitDirection;
    commitEditor = (ref = atom.workspace.paneForURI(filePath)) != null ? ref.itemForURI(filePath) : void 0;
    if (!commitEditor) {
      if (atom.config.get('git-plus.general.openInPane')) {
        splitDirection = atom.config.get('git-plus.general.splitPane');
        atom.workspace.getCenter().getActivePane()["split" + splitDirection]();
      }
      return atom.workspace.open(filePath);
    } else {
      if (atom.config.get('git-plus.general.openInPane')) {
        atom.workspace.paneForURI(filePath).activate();
      } else {
        atom.workspace.paneForURI(filePath).activateItemForURI(filePath);
      }
      return Promise.resolve(commitEditor);
    }
  };

  module.exports = function(repo, arg) {
    var andPush, commentChar, currentPane, e, filePath, init, ref, ref1, stageChanges, startCommit, template;
    ref = arg != null ? arg : {}, stageChanges = ref.stageChanges, andPush = ref.andPush;
    filePath = Path.join(repo.getPath(), 'COMMIT_EDITMSG');
    currentPane = atom.workspace.getActivePane();
    commentChar = (ref1 = git.getConfig(repo, 'core.commentchar')) != null ? ref1 : '#';
    try {
      template = getTemplate(git.getConfig(repo, 'commit.template'));
    } catch (error) {
      e = error;
      notifier.addError(e.message);
      return Promise.reject(e.message);
    }
    init = function() {
      return getStagedFiles(repo).then(function(status) {
        var args;
        if (verboseCommitsEnabled()) {
          args = ['diff', '--color=never', '--staged'];
          if (atom.config.get('git-plus.diffs.wordDiff')) {
            args.push('--word-diff');
          }
          return git.cmd(args, {
            cwd: repo.getWorkingDirectory()
          }).then(function(diff) {
            return prepFile({
              status: status,
              filePath: filePath,
              diff: diff,
              commentChar: commentChar,
              template: template
            });
          });
        } else {
          return prepFile({
            status: status,
            filePath: filePath,
            commentChar: commentChar,
            template: template
          });
        }
      });
    };
    startCommit = function() {
      return showFile(filePath).then(function(textEditor) {
        disposables.dispose();
        disposables = new CompositeDisposable;
        disposables.add(textEditor.onDidSave(function() {
          trimFile(filePath, commentChar);
          return commit(repo.getWorkingDirectory(), filePath).then(function() {
            if (andPush) {
              return GitPush(repo);
            }
          });
        }));
        return disposables.add(textEditor.onDidDestroy(function() {
          return cleanup(currentPane);
        }));
      })["catch"](notifier.addError);
    };
    if (stageChanges) {
      return git.add(repo, {
        update: true
      }).then(init).then(startCommit);
    } else {
      return init().then(function() {
        return startCommit();
      })["catch"](function(message) {
        if (typeof message.includes === "function" ? message.includes('CRLF') : void 0) {
          return startCommit();
        } else {
          return notifier.addInfo(message);
        }
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9tb2RlbHMvZ2l0LWNvbW1pdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDTixzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDTCxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUNYLE9BQUEsR0FBVSxPQUFBLENBQVEsWUFBUjs7RUFDVixPQUFBLEdBQVUsT0FBQSxDQUFRLFlBQVI7O0VBRVYsV0FBQSxHQUFjLElBQUk7O0VBRWxCLHFCQUFBLEdBQXdCLFNBQUE7V0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsaUNBQWhCO0VBQUg7O0VBRXhCLFlBQUEsR0FBZTs7RUFFZixjQUFBLEdBQWlCLFNBQUMsSUFBRDtXQUNmLEdBQUcsQ0FBQyxXQUFKLENBQWdCLElBQWhCLENBQXFCLENBQUMsSUFBdEIsQ0FBMkIsU0FBQyxLQUFEO01BQ3pCLElBQUcsS0FBSyxDQUFDLE1BQU4sSUFBZ0IsQ0FBbkI7ZUFDRSxHQUFHLENBQUMsR0FBSixDQUFRLENBQUMsSUFBRCxFQUFPLGdCQUFQLEVBQXlCLFFBQXpCLENBQVIsRUFBNEM7VUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBTDtTQUE1QyxFQURGO09BQUEsTUFBQTtlQUdFLE9BQU8sQ0FBQyxNQUFSLENBQWUsb0JBQWYsRUFIRjs7SUFEeUIsQ0FBM0I7RUFEZTs7RUFPakIsV0FBQSxHQUFjLFNBQUMsUUFBRDtBQUNaLFFBQUE7SUFBQSxJQUFHLFFBQUg7QUFDRTtlQUNFLEVBQUUsQ0FBQyxZQUFILENBQWdCLEVBQUUsQ0FBQyxRQUFI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Q08sU0FBQyxPQUFEO1FBQ0wsNkNBQUcsT0FBTyxDQUFDLFNBQVUsZ0JBQXJCO2lCQUNFLFdBQUEsQ0FBQSxFQURGO1NBQUEsTUFBQTtpQkFHRSxRQUFRLENBQUMsT0FBVCxDQUFpQixPQUFqQixFQUhGOztNQURLLENBRFAsRUFIRjs7RUE5QmU7QUFuR2pCIiwic291cmNlc0NvbnRlbnQiOlsiUGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG57Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xuZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xubm90aWZpZXIgPSByZXF1aXJlICcuLi9ub3RpZmllcidcbkdpdFB1c2ggPSByZXF1aXJlICcuL2dpdC1wdXNoJ1xuR2l0UHVsbCA9IHJlcXVpcmUgJy4vZ2l0LXB1bGwnXG5cbmRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxudmVyYm9zZUNvbW1pdHNFbmFibGVkID0gLT4gYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5jb21taXRzLnZlcmJvc2VDb21taXRzJylcblxuc2Npc3NvcnNMaW5lID0gJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSA+OCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nXG5cbmdldFN0YWdlZEZpbGVzID0gKHJlcG8pIC0+XG4gIGdpdC5zdGFnZWRGaWxlcyhyZXBvKS50aGVuIChmaWxlcykgLT5cbiAgICBpZiBmaWxlcy5sZW5ndGggPj0gMVxuICAgICAgZ2l0LmNtZChbJy1jJywgJ2NvbG9yLnVpPWZhbHNlJywgJ3N0YXR1cyddLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAgIGVsc2VcbiAgICAgIFByb21pc2UucmVqZWN0IFwiTm90aGluZyB0byBjb21taXQuXCJcblxuZ2V0VGVtcGxhdGUgPSAoZmlsZVBhdGgpIC0+XG4gIGlmIGZpbGVQYXRoXG4gICAgdHJ5XG4gICAgICBmcy5yZWFkRmlsZVN5bmMoZnMuYWJzb2x1dGUoZmlsZVBhdGgudHJpbSgpKSkudG9TdHJpbmcoKS50cmltKClcbiAgICBjYXRjaCBlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3VyIGNvbmZpZ3VyZWQgY29tbWl0IHRlbXBsYXRlIGZpbGUgY2FuJ3QgYmUgZm91bmQuXCIpXG4gIGVsc2VcbiAgICAnJ1xuXG5wcmVwRmlsZSA9ICh7c3RhdHVzLCBmaWxlUGF0aCwgZGlmZiwgY29tbWVudENoYXIsIHRlbXBsYXRlfSkgLT5cbiAgaWYgY29tbWl0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvclVSSShmaWxlUGF0aCk/Lml0ZW1Gb3JVUkkoZmlsZVBhdGgpXG4gICAgdGV4dCA9IGNvbW1pdEVkaXRvci5nZXRUZXh0KClcbiAgICBpbmRleE9mQ29tbWVudHMgPSB0ZXh0LmluZGV4T2YoY29tbWVudENoYXIpXG4gICAgaWYgaW5kZXhPZkNvbW1lbnRzID4gMFxuICAgICAgdGVtcGxhdGUgPSB0ZXh0LnN1YnN0cmluZygwLCBpbmRleE9mQ29tbWVudHMgLSAxKVxuXG4gIGN3ZCA9IFBhdGguZGlybmFtZShmaWxlUGF0aClcbiAgc3RhdHVzID0gc3RhdHVzLnJlcGxhY2UoL1xccypcXCguKlxcKVxcbi9nLCBcIlxcblwiKVxuICBzdGF0dXMgPSBzdGF0dXMudHJpbSgpLnJlcGxhY2UoL1xcbi9nLCBcIlxcbiN7Y29tbWVudENoYXJ9IFwiKVxuICBjb250ZW50ID1cbiAgICBcIlwiXCIje3RlbXBsYXRlfVxuICAgICN7Y29tbWVudENoYXJ9ICN7c2Npc3NvcnNMaW5lfVxuICAgICN7Y29tbWVudENoYXJ9IERvIG5vdCB0b3VjaCB0aGUgbGluZSBhYm92ZS5cbiAgICAje2NvbW1lbnRDaGFyfSBFdmVyeXRoaW5nIGJlbG93IHdpbGwgYmUgcmVtb3ZlZC5cbiAgICAje2NvbW1lbnRDaGFyfSBQbGVhc2UgZW50ZXIgdGhlIGNvbW1pdCBtZXNzYWdlIGZvciB5b3VyIGNoYW5nZXMuIExpbmVzIHN0YXJ0aW5nXG4gICAgI3tjb21tZW50Q2hhcn0gd2l0aCAnI3tjb21tZW50Q2hhcn0nIHdpbGwgYmUgaWdub3JlZCwgYW5kIGFuIGVtcHR5IG1lc3NhZ2UgYWJvcnRzIHRoZSBjb21taXQuXG4gICAgI3tjb21tZW50Q2hhcn1cbiAgICAje2NvbW1lbnRDaGFyfSAje3N0YXR1c31cIlwiXCJcbiAgaWYgZGlmZlxuICAgIGNvbnRlbnQgKz1cbiAgICAgIFwiXCJcIlxcbiN7Y29tbWVudENoYXJ9XG4gICAgICAje2RpZmZ9XCJcIlwiXG4gIGZzLndyaXRlRmlsZVN5bmMgZmlsZVBhdGgsIGNvbnRlbnRcblxuZGVzdHJveUNvbW1pdEVkaXRvciA9IChmaWxlUGF0aCkgLT5cbiAgaWYgYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5nZW5lcmFsLm9wZW5JblBhbmUnKVxuICAgIGF0b20ud29ya3NwYWNlLnBhbmVGb3JVUkkoZmlsZVBhdGgpPy5kZXN0cm95KClcbiAgZWxzZVxuICAgIGF0b20ud29ya3NwYWNlLnBhbmVGb3JVUkkoZmlsZVBhdGgpLml0ZW1Gb3JVUkkoZmlsZVBhdGgpPy5kZXN0cm95KClcblxudHJpbUZpbGUgPSAoZmlsZVBhdGgsIGNvbW1lbnRDaGFyKSAtPlxuICBmaW5kU2Npc3NvcnNMaW5lID0gKGxpbmUpIC0+XG4gICAgbGluZS5pbmNsdWRlcyhcIiN7Y29tbWVudENoYXJ9ICN7c2Npc3NvcnNMaW5lfVwiKVxuXG4gIGN3ZCA9IFBhdGguZGlybmFtZShmaWxlUGF0aClcbiAgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhmcy5hYnNvbHV0ZShmaWxlUGF0aCkpLnRvU3RyaW5nKClcbiAgc3RhcnRPZkNvbW1lbnRzID0gY29udGVudC5pbmRleE9mKGNvbnRlbnQuc3BsaXQoJ1xcbicpLmZpbmQoZmluZFNjaXNzb3JzTGluZSkpXG4gIGNvbnRlbnQgPSBpZiBzdGFydE9mQ29tbWVudHMgPiAwIHRoZW4gY29udGVudC5zdWJzdHJpbmcoMCwgc3RhcnRPZkNvbW1lbnRzKSBlbHNlIGNvbnRlbnRcbiAgZnMud3JpdGVGaWxlU3luYyBmaWxlUGF0aCwgY29udGVudFxuXG5jb21taXQgPSAoZGlyZWN0b3J5LCBmaWxlUGF0aCkgLT5cbiAgZ2l0LmNtZChbJ2NvbW1pdCcsIFwiLS1jbGVhbnVwPXdoaXRlc3BhY2VcIiwgXCItLWZpbGU9I3tmaWxlUGF0aH1cIl0sIGN3ZDogZGlyZWN0b3J5KVxuICAudGhlbiAoZGF0YSkgLT5cbiAgICBub3RpZmllci5hZGRTdWNjZXNzIGRhdGFcbiAgICBkZXN0cm95Q29tbWl0RWRpdG9yKGZpbGVQYXRoKVxuICAgIGdpdC5yZWZyZXNoKClcbiAgLmNhdGNoIChkYXRhKSAtPlxuICAgIG5vdGlmaWVyLmFkZEVycm9yIGRhdGFcbiAgICBkZXN0cm95Q29tbWl0RWRpdG9yKGZpbGVQYXRoKVxuXG5jbGVhbnVwID0gKGN1cnJlbnRQYW5lKSAtPlxuICBjdXJyZW50UGFuZS5hY3RpdmF0ZSgpIGlmIGN1cnJlbnRQYW5lLmlzQWxpdmUoKVxuICBkaXNwb3NhYmxlcy5kaXNwb3NlKClcblxuc2hvd0ZpbGUgPSAoZmlsZVBhdGgpIC0+XG4gIGNvbW1pdEVkaXRvciA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JVUkkoZmlsZVBhdGgpPy5pdGVtRm9yVVJJKGZpbGVQYXRoKVxuICBpZiBub3QgY29tbWl0RWRpdG9yXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5nZW5lcmFsLm9wZW5JblBhbmUnKVxuICAgICAgc3BsaXREaXJlY3Rpb24gPSBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLmdlbmVyYWwuc3BsaXRQYW5lJylcbiAgICAgIGF0b20ud29ya3NwYWNlLmdldENlbnRlcigpLmdldEFjdGl2ZVBhbmUoKVtcInNwbGl0I3tzcGxpdERpcmVjdGlvbn1cIl0oKVxuICAgIGF0b20ud29ya3NwYWNlLm9wZW4gZmlsZVBhdGhcbiAgZWxzZVxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMuZ2VuZXJhbC5vcGVuSW5QYW5lJylcbiAgICAgIGF0b20ud29ya3NwYWNlLnBhbmVGb3JVUkkoZmlsZVBhdGgpLmFjdGl2YXRlKClcbiAgICBlbHNlXG4gICAgICBhdG9tLndvcmtzcGFjZS5wYW5lRm9yVVJJKGZpbGVQYXRoKS5hY3RpdmF0ZUl0ZW1Gb3JVUkkoZmlsZVBhdGgpXG4gICAgUHJvbWlzZS5yZXNvbHZlKGNvbW1pdEVkaXRvcilcblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbywge3N0YWdlQ2hhbmdlcywgYW5kUHVzaH09e30pIC0+XG4gIGZpbGVQYXRoID0gUGF0aC5qb2luKHJlcG8uZ2V0UGF0aCgpLCAnQ09NTUlUX0VESVRNU0cnKVxuICBjdXJyZW50UGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICBjb21tZW50Q2hhciA9IGdpdC5nZXRDb25maWcocmVwbywgJ2NvcmUuY29tbWVudGNoYXInKSA/ICcjJ1xuICB0cnlcbiAgICB0ZW1wbGF0ZSA9IGdldFRlbXBsYXRlKGdpdC5nZXRDb25maWcocmVwbywgJ2NvbW1pdC50ZW1wbGF0ZScpKVxuICBjYXRjaCBlXG4gICAgbm90aWZpZXIuYWRkRXJyb3IoZS5tZXNzYWdlKVxuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlLm1lc3NhZ2UpXG5cbiAgaW5pdCA9IC0+IGdldFN0YWdlZEZpbGVzKHJlcG8pLnRoZW4gKHN0YXR1cykgLT5cbiAgICBpZiB2ZXJib3NlQ29tbWl0c0VuYWJsZWQoKVxuICAgICAgYXJncyA9IFsnZGlmZicsICctLWNvbG9yPW5ldmVyJywgJy0tc3RhZ2VkJ11cbiAgICAgIGFyZ3MucHVzaCAnLS13b3JkLWRpZmYnIGlmIGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMuZGlmZnMud29yZERpZmYnKVxuICAgICAgZ2l0LmNtZChhcmdzLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAgICAgLnRoZW4gKGRpZmYpIC0+IHByZXBGaWxlIHtzdGF0dXMsIGZpbGVQYXRoLCBkaWZmLCBjb21tZW50Q2hhciwgdGVtcGxhdGV9XG4gICAgZWxzZVxuICAgICAgcHJlcEZpbGUge3N0YXR1cywgZmlsZVBhdGgsIGNvbW1lbnRDaGFyLCB0ZW1wbGF0ZX1cbiAgc3RhcnRDb21taXQgPSAtPlxuICAgIHNob3dGaWxlIGZpbGVQYXRoXG4gICAgLnRoZW4gKHRleHRFZGl0b3IpIC0+XG4gICAgICBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICAgIGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICAgIGRpc3Bvc2FibGVzLmFkZCB0ZXh0RWRpdG9yLm9uRGlkU2F2ZSAtPlxuICAgICAgICB0cmltRmlsZShmaWxlUGF0aCwgY29tbWVudENoYXIpXG4gICAgICAgIGNvbW1pdChyZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSwgZmlsZVBhdGgpXG4gICAgICAgIC50aGVuIC0+IEdpdFB1c2gocmVwbykgaWYgYW5kUHVzaFxuICAgICAgZGlzcG9zYWJsZXMuYWRkIHRleHRFZGl0b3Iub25EaWREZXN0cm95IC0+IGNsZWFudXAoY3VycmVudFBhbmUpXG4gICAgLmNhdGNoKG5vdGlmaWVyLmFkZEVycm9yKVxuXG4gIGlmIHN0YWdlQ2hhbmdlc1xuICAgIGdpdC5hZGQocmVwbywgdXBkYXRlOiB0cnVlKS50aGVuKGluaXQpLnRoZW4oc3RhcnRDb21taXQpXG4gIGVsc2VcbiAgICBpbml0KCkudGhlbiAtPiBzdGFydENvbW1pdCgpXG4gICAgLmNhdGNoIChtZXNzYWdlKSAtPlxuICAgICAgaWYgbWVzc2FnZS5pbmNsdWRlcz8oJ0NSTEYnKVxuICAgICAgICBzdGFydENvbW1pdCgpXG4gICAgICBlbHNlXG4gICAgICAgIG5vdGlmaWVyLmFkZEluZm8gbWVzc2FnZVxuIl19
