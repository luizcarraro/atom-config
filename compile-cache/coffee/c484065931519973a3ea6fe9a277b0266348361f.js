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
        atom.workspace.getActivePane()["split" + splitDirection]();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9tb2RlbHMvZ2l0LWNvbW1pdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDTixzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDTCxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUNYLE9BQUEsR0FBVSxPQUFBLENBQVEsWUFBUjs7RUFDVixPQUFBLEdBQVUsT0FBQSxDQUFRLFlBQVI7O0VBRVYsV0FBQSxHQUFjLElBQUk7O0VBRWxCLHFCQUFBLEdBQXdCLFNBQUE7V0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsaUNBQWhCO0VBQUg7O0VBRXhCLFlBQUEsR0FBZTs7RUFFZixjQUFBLEdBQWlCLFNBQUMsSUFBRDtXQUNmLEdBQUcsQ0FBQyxXQUFKLENBQWdCLElBQWhCLENBQXFCLENBQUMsSUFBdEIsQ0FBMkIsU0FBQyxLQUFEO01BQ3pCLElBQUcsS0FBSyxDQUFDLE1BQU4sSUFBZ0IsQ0FBbkI7ZUFDRSxHQUFHLENBQUMsR0FBSixDQUFRLENBQUMsSUFBRCxFQUFPLGdCQUFQLEVBQXlCLFFBQXpCLENBQVIsRUFBNEM7VUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBTDtTQUE1QyxFQURGO09BQUEsTUFBQTtlQUdFLE9BQU8sQ0FBQyxNQUFSLENBQWUsb0JBQWYsRUFIRjs7SUFEeUIsQ0FBM0I7RUFEZTs7RUFPakIsV0FBQSxHQUFjLFNBQUMsUUFBRDtBQUNaLFFBQUE7SUFBQSxJQUFHLFFBQUg7QUFDRTtlQUNFLEVBQUUsQ0FBQyxZQUFILENBQWdCLEVBQUUsQ0FBQyxRQUFI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RyxPQUFPLENBQUMsU0FBVSxnQkFBckI7aUJBQ0UsV0FBQSxDQUFBLEVBREY7U0FBQSxNQUFBO2lCQUdFLFFBQVEsQ0FBQyxPQUFULENBQWlCLE9BQWpCLEVBSEY7O01BREssQ0FEUCxFQUhGOztFQTlCZTtBQW5HakIiLCJzb3VyY2VzQ29udGVudCI6WyJQYXRoID0gcmVxdWlyZSAncGF0aCdcbntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5mcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG5naXQgPSByZXF1aXJlICcuLi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuR2l0UHVzaCA9IHJlcXVpcmUgJy4vZ2l0LXB1c2gnXG5HaXRQdWxsID0gcmVxdWlyZSAnLi9naXQtcHVsbCdcblxuZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG52ZXJib3NlQ29tbWl0c0VuYWJsZWQgPSAtPiBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLmNvbW1pdHMudmVyYm9zZUNvbW1pdHMnKVxuXG5zY2lzc29yc0xpbmUgPSAnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tID44IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSdcblxuZ2V0U3RhZ2VkRmlsZXMgPSAocmVwbykgLT5cbiAgZ2l0LnN0YWdlZEZpbGVzKHJlcG8pLnRoZW4gKGZpbGVzKSAtPlxuICAgIGlmIGZpbGVzLmxlbmd0aCA+PSAxXG4gICAgICBnaXQuY21kKFsnLWMnLCAnY29sb3IudWk9ZmFsc2UnLCAnc3RhdHVzJ10sIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gICAgZWxzZVxuICAgICAgUHJvbWlzZS5yZWplY3QgXCJOb3RoaW5nIHRvIGNvbW1pdC5cIlxuXG5nZXRUZW1wbGF0ZSA9IChmaWxlUGF0aCkgLT5cbiAgaWYgZmlsZVBhdGhcbiAgICB0cnlcbiAgICAgIGZzLnJlYWRGaWxlU3luYyhmcy5hYnNvbHV0ZShmaWxlUGF0aC50cmltKCkpKS50b1N0cmluZygpLnRyaW0oKVxuICAgIGNhdGNoIGVcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdXIgY29uZmlndXJlZCBjb21taXQgdGVtcGxhdGUgZmlsZSBjYW4ndCBiZSBmb3VuZC5cIilcbiAgZWxzZVxuICAgICcnXG5cbnByZXBGaWxlID0gKHtzdGF0dXMsIGZpbGVQYXRoLCBkaWZmLCBjb21tZW50Q2hhciwgdGVtcGxhdGV9KSAtPlxuICBpZiBjb21taXRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9yVVJJKGZpbGVQYXRoKT8uaXRlbUZvclVSSShmaWxlUGF0aClcbiAgICB0ZXh0ID0gY29tbWl0RWRpdG9yLmdldFRleHQoKVxuICAgIGluZGV4T2ZDb21tZW50cyA9IHRleHQuaW5kZXhPZihjb21tZW50Q2hhcilcbiAgICBpZiBpbmRleE9mQ29tbWVudHMgPiAwXG4gICAgICB0ZW1wbGF0ZSA9IHRleHQuc3Vic3RyaW5nKDAsIGluZGV4T2ZDb21tZW50cyAtIDEpXG5cbiAgY3dkID0gUGF0aC5kaXJuYW1lKGZpbGVQYXRoKVxuICBzdGF0dXMgPSBzdGF0dXMucmVwbGFjZSgvXFxzKlxcKC4qXFwpXFxuL2csIFwiXFxuXCIpXG4gIHN0YXR1cyA9IHN0YXR1cy50cmltKCkucmVwbGFjZSgvXFxuL2csIFwiXFxuI3tjb21tZW50Q2hhcn0gXCIpXG4gIGNvbnRlbnQgPVxuICAgIFwiXCJcIiN7dGVtcGxhdGV9XG4gICAgI3tjb21tZW50Q2hhcn0gI3tzY2lzc29yc0xpbmV9XG4gICAgI3tjb21tZW50Q2hhcn0gRG8gbm90IHRvdWNoIHRoZSBsaW5lIGFib3ZlLlxuICAgICN7Y29tbWVudENoYXJ9IEV2ZXJ5dGhpbmcgYmVsb3cgd2lsbCBiZSByZW1vdmVkLlxuICAgICN7Y29tbWVudENoYXJ9IFBsZWFzZSBlbnRlciB0aGUgY29tbWl0IG1lc3NhZ2UgZm9yIHlvdXIgY2hhbmdlcy4gTGluZXMgc3RhcnRpbmdcbiAgICAje2NvbW1lbnRDaGFyfSB3aXRoICcje2NvbW1lbnRDaGFyfScgd2lsbCBiZSBpZ25vcmVkLCBhbmQgYW4gZW1wdHkgbWVzc2FnZSBhYm9ydHMgdGhlIGNvbW1pdC5cbiAgICAje2NvbW1lbnRDaGFyfVxuICAgICN7Y29tbWVudENoYXJ9ICN7c3RhdHVzfVwiXCJcIlxuICBpZiBkaWZmXG4gICAgY29udGVudCArPVxuICAgICAgXCJcIlwiXFxuI3tjb21tZW50Q2hhcn1cbiAgICAgICN7ZGlmZn1cIlwiXCJcbiAgZnMud3JpdGVGaWxlU3luYyBmaWxlUGF0aCwgY29udGVudFxuXG5kZXN0cm95Q29tbWl0RWRpdG9yID0gKGZpbGVQYXRoKSAtPlxuICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLmdlbmVyYWwub3BlbkluUGFuZScpXG4gICAgYXRvbS53b3Jrc3BhY2UucGFuZUZvclVSSShmaWxlUGF0aCk/LmRlc3Ryb3koKVxuICBlbHNlXG4gICAgYXRvbS53b3Jrc3BhY2UucGFuZUZvclVSSShmaWxlUGF0aCkuaXRlbUZvclVSSShmaWxlUGF0aCk/LmRlc3Ryb3koKVxuXG50cmltRmlsZSA9IChmaWxlUGF0aCwgY29tbWVudENoYXIpIC0+XG4gIGZpbmRTY2lzc29yc0xpbmUgPSAobGluZSkgLT5cbiAgICBsaW5lLmluY2x1ZGVzKFwiI3tjb21tZW50Q2hhcn0gI3tzY2lzc29yc0xpbmV9XCIpXG5cbiAgY3dkID0gUGF0aC5kaXJuYW1lKGZpbGVQYXRoKVxuICBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGZzLmFic29sdXRlKGZpbGVQYXRoKSkudG9TdHJpbmcoKVxuICBzdGFydE9mQ29tbWVudHMgPSBjb250ZW50LmluZGV4T2YoY29udGVudC5zcGxpdCgnXFxuJykuZmluZChmaW5kU2Npc3NvcnNMaW5lKSlcbiAgY29udGVudCA9IGlmIHN0YXJ0T2ZDb21tZW50cyA+IDAgdGhlbiBjb250ZW50LnN1YnN0cmluZygwLCBzdGFydE9mQ29tbWVudHMpIGVsc2UgY29udGVudFxuICBmcy53cml0ZUZpbGVTeW5jIGZpbGVQYXRoLCBjb250ZW50XG5cbmNvbW1pdCA9IChkaXJlY3RvcnksIGZpbGVQYXRoKSAtPlxuICBnaXQuY21kKFsnY29tbWl0JywgXCItLWNsZWFudXA9d2hpdGVzcGFjZVwiLCBcIi0tZmlsZT0je2ZpbGVQYXRofVwiXSwgY3dkOiBkaXJlY3RvcnkpXG4gIC50aGVuIChkYXRhKSAtPlxuICAgIG5vdGlmaWVyLmFkZFN1Y2Nlc3MgZGF0YVxuICAgIGRlc3Ryb3lDb21taXRFZGl0b3IoZmlsZVBhdGgpXG4gICAgZ2l0LnJlZnJlc2goKVxuICAuY2F0Y2ggKGRhdGEpIC0+XG4gICAgbm90aWZpZXIuYWRkRXJyb3IgZGF0YVxuICAgIGRlc3Ryb3lDb21taXRFZGl0b3IoZmlsZVBhdGgpXG5cbmNsZWFudXAgPSAoY3VycmVudFBhbmUpIC0+XG4gIGN1cnJlbnRQYW5lLmFjdGl2YXRlKCkgaWYgY3VycmVudFBhbmUuaXNBbGl2ZSgpXG4gIGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuXG5zaG93RmlsZSA9IChmaWxlUGF0aCkgLT5cbiAgY29tbWl0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvclVSSShmaWxlUGF0aCk/Lml0ZW1Gb3JVUkkoZmlsZVBhdGgpXG4gIGlmIG5vdCBjb21taXRFZGl0b3JcbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLmdlbmVyYWwub3BlbkluUGFuZScpXG4gICAgICBzcGxpdERpcmVjdGlvbiA9IGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMuZ2VuZXJhbC5zcGxpdFBhbmUnKVxuICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpW1wic3BsaXQje3NwbGl0RGlyZWN0aW9ufVwiXSgpXG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlbiBmaWxlUGF0aFxuICBlbHNlXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5nZW5lcmFsLm9wZW5JblBhbmUnKVxuICAgICAgYXRvbS53b3Jrc3BhY2UucGFuZUZvclVSSShmaWxlUGF0aCkuYWN0aXZhdGUoKVxuICAgIGVsc2VcbiAgICAgIGF0b20ud29ya3NwYWNlLnBhbmVGb3JVUkkoZmlsZVBhdGgpLmFjdGl2YXRlSXRlbUZvclVSSShmaWxlUGF0aClcbiAgICBQcm9taXNlLnJlc29sdmUoY29tbWl0RWRpdG9yKVxuXG5tb2R1bGUuZXhwb3J0cyA9IChyZXBvLCB7c3RhZ2VDaGFuZ2VzLCBhbmRQdXNofT17fSkgLT5cbiAgZmlsZVBhdGggPSBQYXRoLmpvaW4ocmVwby5nZXRQYXRoKCksICdDT01NSVRfRURJVE1TRycpXG4gIGN1cnJlbnRQYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gIGNvbW1lbnRDaGFyID0gZ2l0LmdldENvbmZpZyhyZXBvLCAnY29yZS5jb21tZW50Y2hhcicpID8gJyMnXG4gIHRyeVxuICAgIHRlbXBsYXRlID0gZ2V0VGVtcGxhdGUoZ2l0LmdldENvbmZpZyhyZXBvLCAnY29tbWl0LnRlbXBsYXRlJykpXG4gIGNhdGNoIGVcbiAgICBub3RpZmllci5hZGRFcnJvcihlLm1lc3NhZ2UpXG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGUubWVzc2FnZSlcblxuICBpbml0ID0gLT4gZ2V0U3RhZ2VkRmlsZXMocmVwbykudGhlbiAoc3RhdHVzKSAtPlxuICAgIGlmIHZlcmJvc2VDb21taXRzRW5hYmxlZCgpXG4gICAgICBhcmdzID0gWydkaWZmJywgJy0tY29sb3I9bmV2ZXInLCAnLS1zdGFnZWQnXVxuICAgICAgYXJncy5wdXNoICctLXdvcmQtZGlmZicgaWYgYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5kaWZmcy53b3JkRGlmZicpXG4gICAgICBnaXQuY21kKGFyZ3MsIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gICAgICAudGhlbiAoZGlmZikgLT4gcHJlcEZpbGUge3N0YXR1cywgZmlsZVBhdGgsIGRpZmYsIGNvbW1lbnRDaGFyLCB0ZW1wbGF0ZX1cbiAgICBlbHNlXG4gICAgICBwcmVwRmlsZSB7c3RhdHVzLCBmaWxlUGF0aCwgY29tbWVudENoYXIsIHRlbXBsYXRlfVxuICBzdGFydENvbW1pdCA9IC0+XG4gICAgc2hvd0ZpbGUgZmlsZVBhdGhcbiAgICAudGhlbiAodGV4dEVkaXRvcikgLT5cbiAgICAgIGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgICAgZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgICAgZGlzcG9zYWJsZXMuYWRkIHRleHRFZGl0b3Iub25EaWRTYXZlIC0+XG4gICAgICAgIHRyaW1GaWxlKGZpbGVQYXRoLCBjb21tZW50Q2hhcilcbiAgICAgICAgY29tbWl0KHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpLCBmaWxlUGF0aClcbiAgICAgICAgLnRoZW4gLT4gR2l0UHVzaChyZXBvKSBpZiBhbmRQdXNoXG4gICAgICBkaXNwb3NhYmxlcy5hZGQgdGV4dEVkaXRvci5vbkRpZERlc3Ryb3kgLT4gY2xlYW51cChjdXJyZW50UGFuZSlcbiAgICAuY2F0Y2gobm90aWZpZXIuYWRkRXJyb3IpXG5cbiAgaWYgc3RhZ2VDaGFuZ2VzXG4gICAgZ2l0LmFkZChyZXBvLCB1cGRhdGU6IHRydWUpLnRoZW4oaW5pdCkudGhlbihzdGFydENvbW1pdClcbiAgZWxzZVxuICAgIGluaXQoKS50aGVuIC0+IHN0YXJ0Q29tbWl0KClcbiAgICAuY2F0Y2ggKG1lc3NhZ2UpIC0+XG4gICAgICBpZiBtZXNzYWdlLmluY2x1ZGVzPygnQ1JMRicpXG4gICAgICAgIHN0YXJ0Q29tbWl0KClcbiAgICAgIGVsc2VcbiAgICAgICAgbm90aWZpZXIuYWRkSW5mbyBtZXNzYWdlXG4iXX0=
