(function() {
  var CompositeDisposable, Path, cleanup, cleanupUnstagedText, commit, destroyCommitEditor, diffFiles, disposables, fs, getGitStatus, getStagedFiles, git, notifier, parse, prepFile, prettifyFileStatuses, prettifyStagedFiles, prettyifyPreviousFile, showFile,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Path = require('path');

  CompositeDisposable = require('atom').CompositeDisposable;

  fs = require('fs-plus');

  git = require('../git');

  notifier = require('../notifier');

  disposables = new CompositeDisposable;

  prettifyStagedFiles = function(data) {
    var i, mode;
    if (data === '') {
      return [];
    }
    data = data.split(/\0/).slice(0, -1);
    return (function() {
      var j, len, results;
      results = [];
      for (i = j = 0, len = data.length; j < len; i = j += 2) {
        mode = data[i];
        results.push({
          mode: mode,
          path: data[i + 1]
        });
      }
      return results;
    })();
  };

  prettyifyPreviousFile = function(data) {
    return {
      mode: data[0],
      path: data.substring(1).trim()
    };
  };

  prettifyFileStatuses = function(files) {
    return files.map(function(arg) {
      var mode, path;
      mode = arg.mode, path = arg.path;
      switch (mode) {
        case 'M':
          return "modified:   " + path;
        case 'A':
          return "new file:   " + path;
        case 'D':
          return "deleted:   " + path;
        case 'R':
          return "renamed:   " + path;
      }
    });
  };

  getStagedFiles = function(repo) {
    return git.stagedFiles(repo).then(function(files) {
      var args;
      if (files.length >= 1) {
        args = ['diff-index', '--no-color', '--cached', 'HEAD', '--name-status', '-z'];
        return git.cmd(args, {
          cwd: repo.getWorkingDirectory()
        }).then(function(data) {
          return prettifyStagedFiles(data);
        });
      } else {
        return Promise.resolve([]);
      }
    });
  };

  getGitStatus = function(repo) {
    return git.cmd(['-c', 'color.ui=false', 'status'], {
      cwd: repo.getWorkingDirectory()
    });
  };

  diffFiles = function(previousFiles, currentFiles) {
    var currentPaths;
    previousFiles = previousFiles.map(function(p) {
      return prettyifyPreviousFile(p);
    });
    currentPaths = currentFiles.map(function(arg) {
      var path;
      path = arg.path;
      return path;
    });
    return previousFiles.filter(function(p) {
      var ref;
      return (ref = p.path, indexOf.call(currentPaths, ref) >= 0) === false;
    });
  };

  parse = function(prevCommit) {
    var firstSpliting, message, prevChangedFiles, replacerRegex, statusRegex;
    statusRegex = /\n{2,}((?:(?::\w{6} \w{6}(?: \w{7}\.{3}){2} [ MADRCU?!]\s+.+?\n?))*)$/;
    firstSpliting = statusRegex.exec(prevCommit);
    if (firstSpliting != null) {
      message = prevCommit.substring(0, firstSpliting.index);
      replacerRegex = /^:\w{6} \w{6}(?: \w{7}\.{3}){2} ([ MADRCU?!].+)$/gm;
      prevChangedFiles = (firstSpliting[1].trim().replace(replacerRegex, "$1")).split('\n');
    } else {
      message = prevCommit.trim();
      prevChangedFiles = [];
    }
    return {
      message: message,
      prevChangedFiles: prevChangedFiles
    };
  };

  cleanupUnstagedText = function(status) {
    var text, unstagedFiles;
    unstagedFiles = status.indexOf("Changes not staged for commit:");
    if (unstagedFiles >= 0) {
      text = status.substring(unstagedFiles);
      return status = (status.substring(0, unstagedFiles - 1)) + "\n" + (text.replace(/\s*\(.*\)\n/g, ""));
    } else {
      return status;
    }
  };

  prepFile = function(arg) {
    var commentChar, currentChanges, filePath, message, nothingToCommit, prevChangedFiles, replacementText, status, textToReplace;
    commentChar = arg.commentChar, message = arg.message, prevChangedFiles = arg.prevChangedFiles, status = arg.status, filePath = arg.filePath;
    status = cleanupUnstagedText(status);
    status = status.replace(/\s*\(.*\)\n/g, "\n").replace(/\n/g, "\n" + commentChar + " ");
    if (prevChangedFiles.length > 0) {
      nothingToCommit = "nothing to commit, working directory clean";
      currentChanges = "committed:\n" + commentChar;
      textToReplace = null;
      if (status.indexOf(nothingToCommit) > -1) {
        textToReplace = nothingToCommit;
      } else if (status.indexOf(currentChanges) > -1) {
        textToReplace = currentChanges;
      }
      replacementText = "committed:\n" + (prevChangedFiles.map(function(f) {
        return commentChar + "   " + f;
      }).join("\n"));
      status = status.replace(textToReplace, replacementText);
    }
    return fs.writeFileSync(filePath, message + "\n" + commentChar + " Please enter the commit message for your changes. Lines starting\n" + commentChar + " with '" + commentChar + "' will be ignored, and an empty message aborts the commit.\n" + commentChar + "\n" + commentChar + " " + status);
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

  destroyCommitEditor = function(filePath) {
    var ref, ref1;
    if (atom.config.get('git-plus.general.openInPane')) {
      return (ref = atom.workspace.paneForURI(filePath)) != null ? ref.destroy() : void 0;
    } else {
      return (ref1 = atom.workspace.paneForURI(filePath).itemForURI(filePath)) != null ? ref1.destroy() : void 0;
    }
  };

  commit = function(directory, filePath) {
    var args;
    args = ['commit', '--amend', '--cleanup=strip', "--file=" + filePath];
    return git.cmd(args, {
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

  cleanup = function(currentPane, filePath) {
    if (currentPane.isAlive()) {
      currentPane.activate();
    }
    return disposables.dispose();
  };

  module.exports = function(repo) {
    var commentChar, currentPane, cwd, filePath, ref;
    currentPane = atom.workspace.getActivePane();
    filePath = Path.join(repo.getPath(), 'COMMIT_EDITMSG');
    cwd = repo.getWorkingDirectory();
    commentChar = (ref = git.getConfig(repo, 'core.commentchar')) != null ? ref : '#';
    return git.cmd(['whatchanged', '-1', '--format=%B'], {
      cwd: cwd
    }).then(function(amend) {
      return parse(amend);
    }).then(function(arg) {
      var message, prevChangedFiles;
      message = arg.message, prevChangedFiles = arg.prevChangedFiles;
      return getStagedFiles(repo).then(function(files) {
        prevChangedFiles = prettifyFileStatuses(diffFiles(prevChangedFiles, files));
        return {
          message: message,
          prevChangedFiles: prevChangedFiles
        };
      });
    }).then(function(arg) {
      var message, prevChangedFiles;
      message = arg.message, prevChangedFiles = arg.prevChangedFiles;
      return getGitStatus(repo).then(function(status) {
        return prepFile({
          commentChar: commentChar,
          message: message,
          prevChangedFiles: prevChangedFiles,
          status: status,
          filePath: filePath
        });
      }).then(function() {
        return showFile(filePath);
      });
    }).then(function(textEditor) {
      disposables.add(textEditor.onDidSave(function() {
        return commit(repo.getWorkingDirectory(), filePath);
      }));
      return disposables.add(textEditor.onDidDestroy(function() {
        return cleanup(currentPane, filePath);
      }));
    })["catch"](function(msg) {
      return notifier.addInfo(msg);
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9tb2RlbHMvZ2l0LWNvbW1pdC1hbWVuZC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDBQQUFBO0lBQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNOLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUNMLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBRVgsV0FBQSxHQUFjLElBQUk7O0VBRWxCLG1CQUFBLEdBQXNCLFNBQUMsSUFBRDtBQUNwQixRQUFBO0lBQUEsSUFBYSxJQUFBLEtBQVEsRUFBckI7QUFBQSxhQUFPLEdBQVA7O0lBQ0EsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBWCxDQUFpQjs7O0FBQ25CO1dBQUEsaURBQUE7O3FCQUNIO1VBQUMsTUFBQSxJQUFEO1VBQU8sSUFBQSxFQUFNLElBQUssQ0FBQSxDQUFBLEdBQUUsQ0FBRixDQUFsQjs7QUFERzs7O0VBSGU7O0VBTXRCLHFCQUFBLEdBQXdCLFNBQUMsSUFBRDtXQUN0QjtNQUFBLElBQUEsRUFBTSxJQUFLLENBQUEsQ0FBQSxDQUFYO01BQ0EsSUFBQSxFQUFNLElBQUksQ0FBQyxTQUFMLENBQWUsQ0FBZixDQUFpQixDQUFDLElBQWxCLENBQUEsQ0FETjs7RUFEc0I7O0VBSXhCLG9CQUFBLEdBQXVCLFNBQUMsS0FBRDtXQUNyQixLQUFLLENBQUMsR0FBTixDQUFVLFNBQUMsR0FBRDtBQUNSLFVBQUE7TUFEVSxpQkFBTTtBQUNoQixjQUFPLElBQVA7QUFBQSxhQUNPLEdBRFA7aUJBRUksY0FBQSxHQUFlO0FBRm5CLGFBR08sR0FIUDtpQkFJSSxjQUFBLEdBQWU7QUFKbkIsYUFL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VSxrQkFBQSxnQkFBVjs7TUFGSSxDQUROO0lBREksQ0FGTixDQU9BLENBQUMsSUFQRCxDQU9NLFNBQUMsR0FBRDtBQUNKLFVBQUE7TUFETSx1QkFBUzthQUNmLFlBQUEsQ0FBYSxJQUFiLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxNQUFEO2VBQVksUUFBQSxDQUFTO1VBQUMsYUFBQSxXQUFEO1VBQWMsU0FBQSxPQUFkO1VBQXVCLGtCQUFBLGdCQUF2QjtVQUF5QyxRQUFBLE1BQXpDO1VBQWlELFVBQUEsUUFBakQ7U0FBVDtNQUFaLENBRE4sQ0FFQSxDQUFDLElBRkQsQ0FFTSxTQUFBO2VBQUcsUUFBQSxDQUFTLFFBQVQ7TUFBSCxDQUZOO0lBREksQ0FQTixDQVdBLENBQUMsSUFYRCxDQVdNLFNBQUMsVUFBRDtNQUNKLFdBQVcsQ0FBQyxHQUFaLENBQWdCLFVBQVUsQ0FBQyxTQUFYLENBQXFCLFNBQUE7ZUFBRyxNQUFBLENBQU8sSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBUCxFQUFtQyxRQUFuQztNQUFILENBQXJCLENBQWhCO2FBQ0EsV0FBVyxDQUFDLEdBQVosQ0FBZ0IsVUFBVSxDQUFDLFlBQVgsQ0FBd0IsU0FBQTtlQUFHLE9BQUEsQ0FBUSxXQUFSLEVBQXFCLFFBQXJCO01BQUgsQ0FBeEIsQ0FBaEI7SUFGSSxDQVhOLENBY0EsRUFBQyxLQUFELEVBZEEsQ0FjTyxTQUFDLEdBQUQ7YUFBUyxRQUFRLENBQUMsT0FBVCxDQUFpQixHQUFqQjtJQUFULENBZFA7RUFMZTtBQWhJakIiLCJzb3VyY2VzQ29udGVudCI6WyJQYXRoID0gcmVxdWlyZSAncGF0aCdcbntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5mcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG5naXQgPSByZXF1aXJlICcuLi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuXG5kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbnByZXR0aWZ5U3RhZ2VkRmlsZXMgPSAoZGF0YSkgLT5cbiAgcmV0dXJuIFtdIGlmIGRhdGEgaXMgJydcbiAgZGF0YSA9IGRhdGEuc3BsaXQoL1xcMC8pWy4uLi0xXVxuICBbXSA9IGZvciBtb2RlLCBpIGluIGRhdGEgYnkgMlxuICAgIHttb2RlLCBwYXRoOiBkYXRhW2krMV0gfVxuXG5wcmV0dHlpZnlQcmV2aW91c0ZpbGUgPSAoZGF0YSkgLT5cbiAgbW9kZTogZGF0YVswXVxuICBwYXRoOiBkYXRhLnN1YnN0cmluZygxKS50cmltKClcblxucHJldHRpZnlGaWxlU3RhdHVzZXMgPSAoZmlsZXMpIC0+XG4gIGZpbGVzLm1hcCAoe21vZGUsIHBhdGh9KSAtPlxuICAgIHN3aXRjaCBtb2RlXG4gICAgICB3aGVuICdNJ1xuICAgICAgICBcIm1vZGlmaWVkOiAgICN7cGF0aH1cIlxuICAgICAgd2hlbiAnQSdcbiAgICAgICAgXCJuZXcgZmlsZTogICAje3BhdGh9XCJcbiAgICAgIHdoZW4gJ0QnXG4gICAgICAgIFwiZGVsZXRlZDogICAje3BhdGh9XCJcbiAgICAgIHdoZW4gJ1InXG4gICAgICAgIFwicmVuYW1lZDogICAje3BhdGh9XCJcblxuZ2V0U3RhZ2VkRmlsZXMgPSAocmVwbykgLT5cbiAgZ2l0LnN0YWdlZEZpbGVzKHJlcG8pLnRoZW4gKGZpbGVzKSAtPlxuICAgIGlmIGZpbGVzLmxlbmd0aCA+PSAxXG4gICAgICBhcmdzID0gWydkaWZmLWluZGV4JywgJy0tbm8tY29sb3InLCAnLS1jYWNoZWQnLCAnSEVBRCcsICctLW5hbWUtc3RhdHVzJywgJy16J11cbiAgICAgIGdpdC5jbWQoYXJncywgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAgIC50aGVuIChkYXRhKSAtPiBwcmV0dGlmeVN0YWdlZEZpbGVzIGRhdGFcbiAgICBlbHNlXG4gICAgICBQcm9taXNlLnJlc29sdmUgW11cblxuZ2V0R2l0U3RhdHVzID0gKHJlcG8pIC0+XG4gIGdpdC5jbWQgWyctYycsICdjb2xvci51aT1mYWxzZScsICdzdGF0dXMnXSwgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuXG5kaWZmRmlsZXMgPSAocHJldmlvdXNGaWxlcywgY3VycmVudEZpbGVzKSAtPlxuICBwcmV2aW91c0ZpbGVzID0gcHJldmlvdXNGaWxlcy5tYXAgKHApIC0+IHByZXR0eWlmeVByZXZpb3VzRmlsZSBwXG4gIGN1cnJlbnRQYXRocyA9IGN1cnJlbnRGaWxlcy5tYXAgKHtwYXRofSkgLT4gcGF0aFxuICBwcmV2aW91c0ZpbGVzLmZpbHRlciAocCkgLT4gcC5wYXRoIGluIGN1cnJlbnRQYXRocyBpcyBmYWxzZVxuXG5wYXJzZSA9IChwcmV2Q29tbWl0KSAtPlxuICBzdGF0dXNSZWdleCA9IC9cXG57Mix9KCg/Oig/OjpcXHd7Nn0gXFx3ezZ9KD86IFxcd3s3fVxcLnszfSl7Mn0gWyBNQURSQ1U/IV1cXHMrLis/XFxuPykpKikkL1xuICBmaXJzdFNwbGl0aW5nID0gc3RhdHVzUmVnZXguZXhlYyBwcmV2Q29tbWl0XG5cbiAgaWYgZmlyc3RTcGxpdGluZz9cbiAgICBtZXNzYWdlID0gcHJldkNvbW1pdC5zdWJzdHJpbmcgMCwgZmlyc3RTcGxpdGluZy5pbmRleFxuXG4gICAgcmVwbGFjZXJSZWdleCA9IC9eOlxcd3s2fSBcXHd7Nn0oPzogXFx3ezd9XFwuezN9KXsyfSAoWyBNQURSQ1U/IV0uKykkL2dtXG4gICAgcHJldkNoYW5nZWRGaWxlcyA9IChmaXJzdFNwbGl0aW5nWzFdLnRyaW0oKS5yZXBsYWNlIHJlcGxhY2VyUmVnZXgsIFwiJDFcIikuc3BsaXQgJ1xcbidcbiAgZWxzZVxuICAgIG1lc3NhZ2UgPSBwcmV2Q29tbWl0LnRyaW0oKVxuICAgIHByZXZDaGFuZ2VkRmlsZXMgPSBbXVxuICB7bWVzc2FnZSwgcHJldkNoYW5nZWRGaWxlc31cblxuY2xlYW51cFVuc3RhZ2VkVGV4dCA9IChzdGF0dXMpIC0+XG4gIHVuc3RhZ2VkRmlsZXMgPSBzdGF0dXMuaW5kZXhPZiBcIkNoYW5nZXMgbm90IHN0YWdlZCBmb3IgY29tbWl0OlwiXG4gIGlmIHVuc3RhZ2VkRmlsZXMgPj0gMFxuICAgIHRleHQgPSBzdGF0dXMuc3Vic3RyaW5nIHVuc3RhZ2VkRmlsZXNcbiAgICBzdGF0dXMgPSBcIiN7c3RhdHVzLnN1YnN0cmluZygwLCB1bnN0YWdlZEZpbGVzIC0gMSl9XFxuI3t0ZXh0LnJlcGxhY2UgL1xccypcXCguKlxcKVxcbi9nLCBcIlwifVwiXG4gIGVsc2VcbiAgICBzdGF0dXNcblxucHJlcEZpbGUgPSAoe2NvbW1lbnRDaGFyLCBtZXNzYWdlLCBwcmV2Q2hhbmdlZEZpbGVzLCBzdGF0dXMsIGZpbGVQYXRofSkgLT5cbiAgICBzdGF0dXMgPSBjbGVhbnVwVW5zdGFnZWRUZXh0IHN0YXR1c1xuICAgIHN0YXR1cyA9IHN0YXR1cy5yZXBsYWNlKC9cXHMqXFwoLipcXClcXG4vZywgXCJcXG5cIikucmVwbGFjZSgvXFxuL2csIFwiXFxuI3tjb21tZW50Q2hhcn0gXCIpXG4gICAgaWYgcHJldkNoYW5nZWRGaWxlcy5sZW5ndGggPiAwXG4gICAgICBub3RoaW5nVG9Db21taXQgPSBcIm5vdGhpbmcgdG8gY29tbWl0LCB3b3JraW5nIGRpcmVjdG9yeSBjbGVhblwiXG4gICAgICBjdXJyZW50Q2hhbmdlcyA9IFwiY29tbWl0dGVkOlxcbiN7Y29tbWVudENoYXJ9XCJcbiAgICAgIHRleHRUb1JlcGxhY2UgPSBudWxsXG4gICAgICBpZiBzdGF0dXMuaW5kZXhPZihub3RoaW5nVG9Db21taXQpID4gLTFcbiAgICAgICAgdGV4dFRvUmVwbGFjZSA9IG5vdGhpbmdUb0NvbW1pdFxuICAgICAgZWxzZSBpZiBzdGF0dXMuaW5kZXhPZihjdXJyZW50Q2hhbmdlcykgPiAtMVxuICAgICAgICB0ZXh0VG9SZXBsYWNlID0gY3VycmVudENoYW5nZXNcbiAgICAgIHJlcGxhY2VtZW50VGV4dCA9XG4gICAgICAgIFwiXCJcImNvbW1pdHRlZDpcbiAgICAgICAgI3tcbiAgICAgICAgICBwcmV2Q2hhbmdlZEZpbGVzLm1hcCgoZikgLT4gXCIje2NvbW1lbnRDaGFyfSAgICN7Zn1cIikuam9pbihcIlxcblwiKVxuICAgICAgICB9XCJcIlwiXG4gICAgICBzdGF0dXMgPSBzdGF0dXMucmVwbGFjZSB0ZXh0VG9SZXBsYWNlLCByZXBsYWNlbWVudFRleHRcbiAgICBmcy53cml0ZUZpbGVTeW5jIGZpbGVQYXRoLFxuICAgICAgXCJcIlwiI3ttZXNzYWdlfVxuICAgICAgI3tjb21tZW50Q2hhcn0gUGxlYXNlIGVudGVyIHRoZSBjb21taXQgbWVzc2FnZSBmb3IgeW91ciBjaGFuZ2VzLiBMaW5lcyBzdGFydGluZ1xuICAgICAgI3tjb21tZW50Q2hhcn0gd2l0aCAnI3tjb21tZW50Q2hhcn0nIHdpbGwgYmUgaWdub3JlZCwgYW5kIGFuIGVtcHR5IG1lc3NhZ2UgYWJvcnRzIHRoZSBjb21taXQuXG4gICAgICAje2NvbW1lbnRDaGFyfVxuICAgICAgI3tjb21tZW50Q2hhcn0gI3tzdGF0dXN9XCJcIlwiXG5cbnNob3dGaWxlID0gKGZpbGVQYXRoKSAtPlxuICBjb21taXRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9yVVJJKGZpbGVQYXRoKT8uaXRlbUZvclVSSShmaWxlUGF0aClcbiAgaWYgbm90IGNvbW1pdEVkaXRvclxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMuZ2VuZXJhbC5vcGVuSW5QYW5lJylcbiAgICAgIHNwbGl0RGlyZWN0aW9uID0gYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5nZW5lcmFsLnNwbGl0UGFuZScpXG4gICAgICBhdG9tLndvcmtzcGFjZS5nZXRDZW50ZXIoKS5nZXRBY3RpdmVQYW5lKClbXCJzcGxpdCN7c3BsaXREaXJlY3Rpb259XCJdKClcbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuIGZpbGVQYXRoXG4gIGVsc2VcbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLmdlbmVyYWwub3BlbkluUGFuZScpXG4gICAgICBhdG9tLndvcmtzcGFjZS5wYW5lRm9yVVJJKGZpbGVQYXRoKS5hY3RpdmF0ZSgpXG4gICAgZWxzZVxuICAgICAgYXRvbS53b3Jrc3BhY2UucGFuZUZvclVSSShmaWxlUGF0aCkuYWN0aXZhdGVJdGVtRm9yVVJJKGZpbGVQYXRoKVxuICAgIFByb21pc2UucmVzb2x2ZShjb21taXRFZGl0b3IpXG5cbmRlc3Ryb3lDb21taXRFZGl0b3IgPSAoZmlsZVBhdGgpIC0+XG4gIGlmIGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMuZ2VuZXJhbC5vcGVuSW5QYW5lJylcbiAgICBhdG9tLndvcmtzcGFjZS5wYW5lRm9yVVJJKGZpbGVQYXRoKT8uZGVzdHJveSgpXG4gIGVsc2VcbiAgICBhdG9tLndvcmtzcGFjZS5wYW5lRm9yVVJJKGZpbGVQYXRoKS5pdGVtRm9yVVJJKGZpbGVQYXRoKT8uZGVzdHJveSgpXG5cbmNvbW1pdCA9IChkaXJlY3RvcnksIGZpbGVQYXRoKSAtPlxuICBhcmdzID0gWydjb21taXQnLCAnLS1hbWVuZCcsICctLWNsZWFudXA9c3RyaXAnLCBcIi0tZmlsZT0je2ZpbGVQYXRofVwiXVxuICBnaXQuY21kKGFyZ3MsIGN3ZDogZGlyZWN0b3J5KVxuICAudGhlbiAoZGF0YSkgLT5cbiAgICBub3RpZmllci5hZGRTdWNjZXNzIGRhdGFcbiAgICBkZXN0cm95Q29tbWl0RWRpdG9yKGZpbGVQYXRoKVxuICAgIGdpdC5yZWZyZXNoKClcbiAgLmNhdGNoIChkYXRhKSAtPlxuICAgIG5vdGlmaWVyLmFkZEVycm9yIGRhdGFcbiAgICBkZXN0cm95Q29tbWl0RWRpdG9yKGZpbGVQYXRoKVxuXG5jbGVhbnVwID0gKGN1cnJlbnRQYW5lLCBmaWxlUGF0aCkgLT5cbiAgY3VycmVudFBhbmUuYWN0aXZhdGUoKSBpZiBjdXJyZW50UGFuZS5pc0FsaXZlKClcbiAgZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG5cbm1vZHVsZS5leHBvcnRzID0gKHJlcG8pIC0+XG4gIGN1cnJlbnRQYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gIGZpbGVQYXRoID0gUGF0aC5qb2luKHJlcG8uZ2V0UGF0aCgpLCAnQ09NTUlUX0VESVRNU0cnKVxuICBjd2QgPSByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuICBjb21tZW50Q2hhciA9IGdpdC5nZXRDb25maWcocmVwbywgJ2NvcmUuY29tbWVudGNoYXInKSA/ICcjJ1xuICBnaXQuY21kKFsnd2hhdGNoYW5nZWQnLCAnLTEnLCAnLS1mb3JtYXQ9JUInXSwge2N3ZH0pXG4gIC50aGVuIChhbWVuZCkgLT4gcGFyc2UgYW1lbmRcbiAgLnRoZW4gKHttZXNzYWdlLCBwcmV2Q2hhbmdlZEZpbGVzfSkgLT5cbiAgICBnZXRTdGFnZWRGaWxlcyhyZXBvKVxuICAgIC50aGVuIChmaWxlcykgLT5cbiAgICAgIHByZXZDaGFuZ2VkRmlsZXMgPSBwcmV0dGlmeUZpbGVTdGF0dXNlcyhkaWZmRmlsZXMgcHJldkNoYW5nZWRGaWxlcywgZmlsZXMpXG4gICAgICB7bWVzc2FnZSwgcHJldkNoYW5nZWRGaWxlc31cbiAgLnRoZW4gKHttZXNzYWdlLCBwcmV2Q2hhbmdlZEZpbGVzfSkgLT5cbiAgICBnZXRHaXRTdGF0dXMocmVwbylcbiAgICAudGhlbiAoc3RhdHVzKSAtPiBwcmVwRmlsZSB7Y29tbWVudENoYXIsIG1lc3NhZ2UsIHByZXZDaGFuZ2VkRmlsZXMsIHN0YXR1cywgZmlsZVBhdGh9XG4gICAgLnRoZW4gLT4gc2hvd0ZpbGUgZmlsZVBhdGhcbiAgLnRoZW4gKHRleHRFZGl0b3IpIC0+XG4gICAgZGlzcG9zYWJsZXMuYWRkIHRleHRFZGl0b3Iub25EaWRTYXZlIC0+IGNvbW1pdChyZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSwgZmlsZVBhdGgpXG4gICAgZGlzcG9zYWJsZXMuYWRkIHRleHRFZGl0b3Iub25EaWREZXN0cm95IC0+IGNsZWFudXAgY3VycmVudFBhbmUsIGZpbGVQYXRoXG4gIC5jYXRjaCAobXNnKSAtPiBub3RpZmllci5hZGRJbmZvIG1zZ1xuIl19
