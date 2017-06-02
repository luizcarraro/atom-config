(function() {
  var atomRefresh, callGit, cwd, fs, getBranches, git, logcb, noop, parseDefault, parseDiff, parseStatus, path, projectIndex, q, repo, setProjectIndex;

  fs = require('fs');

  path = require('path');

  git = require('git-promise');

  q = require('q');

  logcb = function(log, error) {
    return console[error ? 'error' : 'log'](log);
  };

  repo = void 0;

  cwd = void 0;

  projectIndex = 0;

  noop = function() {
    return q.fcall(function() {
      return true;
    });
  };

  atomRefresh = function() {
    repo.refreshStatus();
  };

  getBranches = function() {
    return q.fcall(function() {
      var branches, h, i, j, len, len1, ref, ref1, refs;
      branches = {
        local: [],
        remote: [],
        tags: []
      };
      refs = repo.getReferences();
      ref = refs.heads;
      for (i = 0, len = ref.length; i < len; i++) {
        h = ref[i];
        branches.local.push(h.replace('refs/heads/', ''));
      }
      ref1 = refs.remotes;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        h = ref1[j];
        branches.remote.push(h.replace('refs/remotes/', ''));
      }
      return branches;
    });
  };

  setProjectIndex = function(index) {
    repo = void 0;
    cwd = void 0;
    projectIndex = index;
    if (atom.project) {
      repo = atom.project.getRepositories()[index];
      cwd = repo ? repo.getWorkingDirectory() : void 0;
    }
  };

  setProjectIndex(projectIndex);

  parseDiff = function(data) {
    return q.fcall(function() {
      var diff, diffs, i, len, line, ref;
      diffs = [];
      diff = {};
      ref = data.split('\n');
      for (i = 0, len = ref.length; i < len; i++) {
        line = ref[i];
        if (line.length) {
          switch (false) {
            case !/^diff --git /.test(line):
              diff = {
                lines: [],
                added: 0,
                removed: 0
              };
              diff['diff'] = line.replace(/^diff --git /, '');
              diffs.push(diff);
              break;
            case !/^index /.test(line):
              diff['index'] = line.replace(/^index /, '');
              break;
            case !/^--- /.test(line):
              diff['---'] = line.replace(/^--- [a|b]\//, '');
              break;
            case !/^\+\+\+ /.test(line):
              diff['+++'] = line.replace(/^\+\+\+ [a|b]\//, '');
              break;
            default:
              diff['lines'].push(line);
              if (/^\+/.test(line)) {
                diff['added']++;
              }
              if (/^-/.test(line)) {
                diff['removed']++;
              }
          }
        }
      }
      return diffs;
    });
  };

  parseStatus = function(data) {
    return q.fcall(function() {
      var files, i, len, line, name, ref, type;
      files = [];
      ref = data.split('\n');
      for (i = 0, len = ref.length; i < len; i++) {
        line = ref[i];
        if (!line.length) {
          continue;
        }
        type = line.substring(0, 2);
        name = line.substring(2).trim().replace(new RegExp('\"', 'g'), '');
        files.push({
          name: name,
          selected: (function() {
            switch (type[type.length - 1]) {
              case 'C':
              case 'M':
              case 'R':
              case 'D':
              case 'A':
                return true;
              default:
                return false;
            }
          })(),
          type: (function() {
            switch (type[type.length - 1]) {
              case 'A':
                return 'added';
              case 'C':
                return 'modified';
              case 'D':
                return 'deleted';
              case 'M':
                return 'modified';
              case 'R':
                return 'modified';
              case 'U':
                return 'conflict';
              case '?':
                return 'new';
              default:
                return 'unknown';
            }
          })()
        });
      }
      return files;
    });
  };

  parseDefault = function(data) {
    return q.fcall(function() {
      return true;
    });
  };

  callGit = function(cmd, parser, nodatalog) {
    logcb("> git " + cmd);
    return git(cmd, {
      cwd: cwd
    }).then(function(data) {
      if (!nodatalog) {
        logcb(data);
      }
      return parser(data);
    }).fail(function(e) {
      logcb(e.stdout, true);
      logcb(e.message, true);
    });
  };

  module.exports = {
    isInitialised: function() {
      return cwd;
    },
    alert: function(text) {
      logcb(text);
    },
    setLogger: function(cb) {
      logcb = cb;
    },
    setProjectIndex: setProjectIndex,
    getProjectIndex: function() {
      return projectIndex;
    },
    getRepository: function() {
      return repo;
    },
    count: function(branch) {
      return repo.getAheadBehindCount(branch);
    },
    getLocalBranch: function() {
      return repo.getShortHead();
    },
    getRemoteBranch: function() {
      return repo.getUpstreamBranch();
    },
    isMerging: function() {
      return fs.existsSync(path.join(repo.path, 'MERGE_HEAD'));
    },
    getBranches: getBranches,
    hasRemotes: function() {
      var refs;
      refs = repo.getReferences();
      return refs && refs.remotes && refs.remotes.length;
    },
    hasOrigin: function() {
      return repo.getOriginURL() !== null;
    },
    add: function(files) {
      if (!files.length) {
        return noop();
      }
      return callGit("add -- " + (files.join(' ')), function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    commit: function(message) {
      message = message || Date.now();
      message = message.replace(/"/g, '\\"');
      return callGit("commit --allow-empty-message -m \"" + message + "\"", function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    checkout: function(branch, remote) {
      return callGit("checkout " + (remote ? '--track ' : '') + branch, function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    createBranch: function(branch) {
      return callGit("branch " + branch, function(data) {
        return callGit("checkout " + branch, function(data) {
          atomRefresh();
          return parseDefault(data);
        });
      });
    },
    deleteBranch: function(branch) {
      return callGit("branch -d " + branch, function(data) {
        atomRefresh();
        return parseDefault;
      });
    },
    forceDeleteBranch: function(branch) {
      return callGit("branch -D " + branch, function(data) {
        atomRefresh();
        return parseDefault;
      });
    },
    diff: function(file) {
      return callGit("--no-pager diff " + (file || ''), parseDiff, true);
    },
    fetch: function() {
      return callGit("fetch --prune", parseDefault);
    },
    merge: function(branch, noff) {
      var noffOutput;
      noffOutput = noff ? "--no-ff" : "";
      return callGit("merge " + noffOutput + " " + branch, function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    ptag: function(remote) {
      return callGit("push " + remote + " --tags", function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    pullup: function() {
      return callGit("pull upstream $(git branch | grep '^\*' | sed -n 's/\*[ ]*//p')", function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    pull: function() {
      return callGit("pull", function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    flow: function(type, action, branch) {
      return callGit("flow " + type + " " + action + " " + branch, function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    push: function(remote, branch, force) {
      var cmd, forced;
      forced = force ? "-f" : "";
      cmd = "-c push.default=simple push " + remote + " " + branch + " " + forced + " --porcelain";
      return callGit(cmd, function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    log: function(branch) {
      return callGit("log origin/" + (repo.getUpstreamBranch() || 'master') + ".." + branch, parseDefault);
    },
    rebase: function(branch) {
      return callGit("rebase " + branch, function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    midrebase: function(contin, abort, skip) {
      if (contin) {
        return callGit("rebase --continue", function(data) {
          atomRefresh();
          return parseDefault(data);
        });
      } else if (abort) {
        return callGit("rebase --abort", function(data) {
          atomRefresh();
          return parseDefault(data);
        });
      } else if (skip) {
        return callGit("rebase --skip", function(data) {
          atomRefresh();
          return parseDefault(data);
        });
      }
    },
    reset: function(files) {
      return callGit("checkout -- " + (files.join(' ')), function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    remove: function(files) {
      if (!files.length) {
        return noop();
      }
      return callGit("rm -- " + (files.join(' ')), function(data) {
        atomRefresh();
        return parseDefault(true);
      });
    },
    status: function() {
      return callGit('status --porcelain --untracked-files=all', parseStatus);
    },
    tag: function(name, href, msg) {
      return callGit("tag -a " + name + " -m '" + msg + "' " + href, function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi9naXQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQLEdBQUEsR0FBTSxPQUFBLENBQVEsYUFBUjs7RUFDTixDQUFBLEdBQUksT0FBQSxDQUFRLEdBQVI7O0VBRUosS0FBQSxHQUFRLFNBQUMsR0FBRCxFQUFNLEtBQU47V0FDTixPQUFRLENBQUcsS0FBSCxHQUFjLE9BQWQsR0FBMkIsS0FBM0IsQ0FBUixDQUEwQyxHQUExQztFQURNOztFQUdSLElBQUEsR0FBTzs7RUFDUCxHQUFBLEdBQU07O0VBQ04sWUFBQSxHQUFlOztFQUVmLElBQUEsR0FBTyxTQUFBO1dBQUcsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxTQUFBO2FBQUc7SUFBSCxDQUFSO0VBQUg7O0VBRVAsV0FBQSxHQUFjLFNBQUE7SUFDWixJQUFJLENBQUMsYUFBTCxDQUFBO0VBRFk7O0VBSWQsV0FBQSxHQUFjLFNBQUE7V0FBRyxDQUFDLENBQUMsS0FBRixDQUFRLFNBQUE7QUFDdkIsVUFBQTtNQUFBLFFBQUEsR0FBVztRQUFBLEtBQUEsRUFBTyxFQUFQO1FBQVcsTUFBQSxFQUFRLEVBQW5CO1FBQXVCLElBQUEsRUFBTSxFQUE3Qjs7TUFDWCxJQUFBLEdBQU8sSUFBSSxDQUFDLGFBQUwsQ0FBQTtBQUVQO0FBQUEsV0FBQSxxQ0FBQTs7UUFDRSxRQUFRLENBQUMsS0FBSyxDQUFDLElBQWYsQ0FBb0IsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxhQUFWLEVBQXlCLEVBQXpCLENBQXBCO0FBREY7QUFHQTtBQUFBLFdBQUEsd0NBQUE7O1FBQ0UsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFoQixDQUFxQixDQUFDLENBQUMsT0FB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QXpHRiIsInNvdXJjZXNDb250ZW50IjpbImZzID0gcmVxdWlyZSAnZnMnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcblxuZ2l0ID0gcmVxdWlyZSAnZ2l0LXByb21pc2UnXG5xID0gcmVxdWlyZSAncSdcblxubG9nY2IgPSAobG9nLCBlcnJvcikgLT5cbiAgY29uc29sZVtpZiBlcnJvciB0aGVuICdlcnJvcicgZWxzZSAnbG9nJ10gbG9nXG5cbnJlcG8gPSB1bmRlZmluZWRcbmN3ZCA9IHVuZGVmaW5lZFxucHJvamVjdEluZGV4ID0gMFxuXG5ub29wID0gLT4gcS5mY2FsbCAtPiB0cnVlXG5cbmF0b21SZWZyZXNoID0gLT5cbiAgcmVwby5yZWZyZXNoU3RhdHVzKCkgIyBub3QgcHVibGljL2luIGRvY3NcbiAgcmV0dXJuXG5cbmdldEJyYW5jaGVzID0gLT4gcS5mY2FsbCAtPlxuICBicmFuY2hlcyA9IGxvY2FsOiBbXSwgcmVtb3RlOiBbXSwgdGFnczogW11cbiAgcmVmcyA9IHJlcG8uZ2V0UmVmZXJlbmNlcygpXG5cbiAgZm9yIGggaW4gcmVmcy5oZWFkc1xuICAgIGJyYW5jaGVzLmxvY2FsLnB1c2ggaC5yZXBsYWNlKCdyZWZzL2hlYWRzLycsICcnKVxuXG4gIGZvciBoIGluIHJlZnMucmVtb3Rlc1xuICAgIGJyYW5jaGVzLnJlbW90ZS5wdXNoIGgucmVwbGFjZSgncmVmcy9yZW1vdGVzLycsICcnKVxuXG4gIHJldHVybiBicmFuY2hlc1xuXG5zZXRQcm9qZWN0SW5kZXggPSAoaW5kZXgpIC0+XG4gIHJlcG8gPSB1bmRlZmluZWRcbiAgY3dkID0gdW5kZWZpbmVkXG4gIHByb2plY3RJbmRleCA9IGluZGV4XG4gIGlmIGF0b20ucHJvamVjdFxuICAgIHJlcG8gPSBhdG9tLnByb2plY3QuZ2V0UmVwb3NpdG9yaWVzKClbaW5kZXhdXG4gICAgY3dkID0gaWYgcmVwbyB0aGVuIHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpICNwcmV2ZW50IHN0YXJ0dXAgZXJyb3JzIGlmIHJlcG8gaXMgdW5kZWZpbmVkXG4gIHJldHVyblxuc2V0UHJvamVjdEluZGV4KHByb2plY3RJbmRleClcblxucGFyc2VEaWZmID0gKGRhdGEpIC0+IHEuZmNhbGwgLT5cbiAgZGlmZnMgPSBbXVxuICBkaWZmID0ge31cbiAgZm9yIGxpbmUgaW4gZGF0YS5zcGxpdCgnXFxuJykgd2hlbiBsaW5lLmxlbmd0aFxuICAgIHN3aXRjaFxuICAgICAgd2hlbiAvXmRpZmYgLS1naXQgLy50ZXN0KGxpbmUpXG4gICAgICAgIGRpZmYgPVxuICAgICAgICAgIGxpbmVzOiBbXVxuICAgICAgICAgIGFkZGVkOiAwXG4gICAgICAgICAgcmVtb3ZlZDogMFxuICAgICAgICBkaWZmWydkaWZmJ10gPSBsaW5lLnJlcGxhY2UoL15kaWZmIC0tZ2l0IC8sICcnKVxuICAgICAgICBkaWZmcy5wdXNoIGRpZmZcbiAgICAgIHdoZW4gL15pbmRleCAvLnRlc3QobGluZSlcbiAgICAgICAgZGlmZlsnaW5kZXgnXSA9IGxpbmUucmVwbGFjZSgvXmluZGV4IC8sICcnKVxuICAgICAgd2hlbiAvXi0tLSAvLnRlc3QobGluZSlcbiAgICAgICAgZGlmZlsnLS0tJ10gPSBsaW5lLnJlcGxhY2UoL14tLS0gW2F8Yl1cXC8vLCAnJylcbiAgICAgIHdoZW4gL15cXCtcXCtcXCsgLy50ZXN0KGxpbmUpXG4gICAgICAgIGRpZmZbJysrKyddID0gbGluZS5yZXBsYWNlKC9eXFwrXFwrXFwrIFthfGJdXFwvLywgJycpXG4gICAgICBlbHNlXG4gICAgICAgIGRpZmZbJ2xpbmVzJ10ucHVzaCBsaW5lXG4gICAgICAgIGRpZmZbJ2FkZGVkJ10rKyBpZiAvXlxcKy8udGVzdChsaW5lKVxuICAgICAgICBkaWZmWydyZW1vdmVkJ10rKyBpZiAvXi0vLnRlc3QobGluZSlcblxuICByZXR1cm4gZGlmZnNcblxucGFyc2VTdGF0dXMgPSAoZGF0YSkgLT4gcS5mY2FsbCAtPlxuICBmaWxlcyA9IFtdXG4gIGZvciBsaW5lIGluIGRhdGEuc3BsaXQoJ1xcbicpIHdoZW4gbGluZS5sZW5ndGhcbiAgICAjIFt0eXBlLCBuYW1lXSA9IGxpbmUucmVwbGFjZSgvXFwgXFwgL2csICcgJykudHJpbSgpLnNwbGl0KCcgJylcbiAgICB0eXBlID0gbGluZS5zdWJzdHJpbmcoMCwgMilcbiAgICBuYW1lID0gbGluZS5zdWJzdHJpbmcoMikudHJpbSgpLnJlcGxhY2UobmV3IFJlZ0V4cCgnXFxcIicsICdnJyksICcnKVxuICAgIGZpbGVzLnB1c2hcbiAgICAgIG5hbWU6IG5hbWVcbiAgICAgIHNlbGVjdGVkOiBzd2l0Y2ggdHlwZVt0eXBlLmxlbmd0aCAtIDFdXG4gICAgICAgIHdoZW4gJ0MnLCdNJywnUicsJ0QnLCdBJyB0aGVuIHRydWVcbiAgICAgICAgZWxzZSBmYWxzZVxuICAgICAgdHlwZTogc3dpdGNoIHR5cGVbdHlwZS5sZW5ndGggLSAxXVxuICAgICAgICB3aGVuICdBJyB0aGVuICdhZGRlZCdcbiAgICAgICAgd2hlbiAnQycgdGhlbiAnbW9kaWZpZWQnICMnY29waWVkJ1xuICAgICAgICB3aGVuICdEJyB0aGVuICdkZWxldGVkJ1xuICAgICAgICB3aGVuICdNJyB0aGVuICdtb2RpZmllZCdcbiAgICAgICAgd2hlbiAnUicgdGhlbiAnbW9kaWZpZWQnICMncmVuYW1lZCdcbiAgICAgICAgd2hlbiAnVScgdGhlbiAnY29uZmxpY3QnXG4gICAgICAgIHdoZW4gJz8nIHRoZW4gJ25ldydcbiAgICAgICAgZWxzZSAndW5rbm93bidcblxuICByZXR1cm4gZmlsZXNcblxucGFyc2VEZWZhdWx0ID0gKGRhdGEpIC0+IHEuZmNhbGwgLT5cbiAgcmV0dXJuIHRydWVcblxuY2FsbEdpdCA9IChjbWQsIHBhcnNlciwgbm9kYXRhbG9nKSAtPlxuICBsb2djYiBcIj4gZ2l0ICN7Y21kfVwiXG5cbiAgcmV0dXJuIGdpdChjbWQsIHtjd2Q6IGN3ZH0pXG4gICAgLnRoZW4gKGRhdGEpIC0+XG4gICAgICBsb2djYiBkYXRhIHVubGVzcyBub2RhdGFsb2dcbiAgICAgIHJldHVybiBwYXJzZXIoZGF0YSlcbiAgICAuZmFpbCAoZSkgLT5cbiAgICAgIGxvZ2NiIGUuc3Rkb3V0LCB0cnVlXG4gICAgICBsb2djYiBlLm1lc3NhZ2UsIHRydWVcbiAgICAgIHJldHVyblxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGlzSW5pdGlhbGlzZWQ6IC0+XG4gICAgcmV0dXJuIGN3ZFxuXG4gIGFsZXJ0OiAodGV4dCkgLT4gI21ha2luZyB0aGUgY29uc29sZSBhdmFpbGFibGUgZWxzZXdoZXJlXG4gICAgbG9nY2IgdGV4dFxuICAgIHJldHVyblxuXG4gIHNldExvZ2dlcjogKGNiKSAtPlxuICAgIGxvZ2NiID0gY2JcbiAgICByZXR1cm5cblxuICBzZXRQcm9qZWN0SW5kZXg6IHNldFByb2plY3RJbmRleFxuXG4gIGdldFByb2plY3RJbmRleDogLT5cbiAgICByZXR1cm4gcHJvamVjdEluZGV4XG5cbiAgZ2V0UmVwb3NpdG9yeTogLT5cbiAgICByZXR1cm4gcmVwb1xuXG4gIGNvdW50OiAoYnJhbmNoKSAtPlxuICAgIHJldHVybiByZXBvLmdldEFoZWFkQmVoaW5kQ291bnQoYnJhbmNoKVxuXG4gIGdldExvY2FsQnJhbmNoOiAtPlxuICAgIHJldHVybiByZXBvLmdldFNob3J0SGVhZCgpXG5cbiAgZ2V0UmVtb3RlQnJhbmNoOiAtPlxuICAgIHJldHVybiByZXBvLmdldFVwc3RyZWFtQnJhbmNoKClcblxuICBpc01lcmdpbmc6IC0+XG4gICAgcmV0dXJuIGZzLmV4aXN0c1N5bmMocGF0aC5qb2luKHJlcG8ucGF0aCwgJ01FUkdFX0hFQUQnKSlcblxuICBnZXRCcmFuY2hlczogZ2V0QnJhbmNoZXNcblxuICBoYXNSZW1vdGVzOiAtPlxuICAgIHJlZnMgPSByZXBvLmdldFJlZmVyZW5jZXMoKVxuICAgIHJldHVybiByZWZzIGFuZCByZWZzLnJlbW90ZXMgYW5kIHJlZnMucmVtb3Rlcy5sZW5ndGhcblxuICBoYXNPcmlnaW46IC0+XG4gICAgcmV0dXJuIHJlcG8uZ2V0T3JpZ2luVVJMKCkgaXNudCBudWxsXG5cbiAgYWRkOiAoZmlsZXMpIC0+XG4gICAgcmV0dXJuIG5vb3AoKSB1bmxlc3MgZmlsZXMubGVuZ3RoXG4gICAgcmV0dXJuIGNhbGxHaXQgXCJhZGQgLS0gI3tmaWxlcy5qb2luKCcgJyl9XCIsIChkYXRhKSAtPlxuICAgICAgYXRvbVJlZnJlc2goKVxuICAgICAgcmV0dXJuIHBhcnNlRGVmYXVsdChkYXRhKVxuXG4gIGNvbW1pdDogKG1lc3NhZ2UpIC0+XG4gICAgbWVzc2FnZSA9IG1lc3NhZ2Ugb3IgRGF0ZS5ub3coKVxuICAgIG1lc3NhZ2UgPSBtZXNzYWdlLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKVxuXG4gICAgcmV0dXJuIGNhbGxHaXQgXCJjb21taXQgLS1hbGxvdy1lbXB0eS1tZXNzYWdlIC1tIFxcXCIje21lc3NhZ2V9XFxcIlwiLCAoZGF0YSkgLT5cbiAgICAgIGF0b21SZWZyZXNoKClcbiAgICAgIHJldHVybiBwYXJzZURlZmF1bHQoZGF0YSlcblxuICBjaGVja291dDogKGJyYW5jaCwgcmVtb3RlKSAtPlxuICAgIHJldHVybiBjYWxsR2l0IFwiY2hlY2tvdXQgI3tpZiByZW1vdGUgdGhlbiAnLS10cmFjayAnIGVsc2UgJyd9I3ticmFuY2h9XCIsIChkYXRhKSAtPlxuICAgICAgYXRvbVJlZnJlc2goKVxuICAgICAgcmV0dXJuIHBhcnNlRGVmYXVsdChkYXRhKVxuXG4gIGNyZWF0ZUJyYW5jaDogKGJyYW5jaCkgLT5cbiAgICByZXR1cm4gY2FsbEdpdCBcImJyYW5jaCAje2JyYW5jaH1cIiwgKGRhdGEpIC0+XG4gICAgICByZXR1cm4gY2FsbEdpdCBcImNoZWNrb3V0ICN7YnJhbmNofVwiLCAoZGF0YSkgLT5cbiAgICAgICAgYXRvbVJlZnJlc2goKVxuICAgICAgICByZXR1cm4gcGFyc2VEZWZhdWx0KGRhdGEpXG5cbiAgZGVsZXRlQnJhbmNoOiAoYnJhbmNoKSAtPlxuICAgIHJldHVybiBjYWxsR2l0IFwiYnJhbmNoIC1kICN7YnJhbmNofVwiLCAoZGF0YSkgLT5cbiAgICAgIGF0b21SZWZyZXNoKClcbiAgICAgIHJldHVybiBwYXJzZURlZmF1bHRcblxuICBmb3JjZURlbGV0ZUJyYW5jaDogKGJyYW5jaCkgLT5cbiAgICByZXR1cm4gY2FsbEdpdCBcImJyYW5jaCAtRCAje2JyYW5jaH1cIiwgKGRhdGEpIC0+XG4gICAgICBhdG9tUmVmcmVzaCgpXG4gICAgICByZXR1cm4gcGFyc2VEZWZhdWx0XG5cbiAgZGlmZjogKGZpbGUpIC0+XG4gICAgcmV0dXJuIGNhbGxHaXQgXCItLW5vLXBhZ2VyIGRpZmYgI3tmaWxlIG9yICcnfVwiLCBwYXJzZURpZmYsIHRydWVcblxuICBmZXRjaDogLT5cbiAgICByZXR1cm4gY2FsbEdpdCBcImZldGNoIC0tcHJ1bmVcIiwgcGFyc2VEZWZhdWx0XG5cbiAgbWVyZ2U6IChicmFuY2gsbm9mZikgLT5cbiAgICBub2ZmT3V0cHV0ID0gaWYgbm9mZiB0aGVuIFwiLS1uby1mZlwiIGVsc2UgXCJcIlxuICAgIHJldHVybiBjYWxsR2l0IFwibWVyZ2UgI3tub2ZmT3V0cHV0fSAje2JyYW5jaH1cIiwgKGRhdGEpIC0+XG4gICAgICBhdG9tUmVmcmVzaCgpXG4gICAgICByZXR1cm4gcGFyc2VEZWZhdWx0KGRhdGEpXG5cbiAgcHRhZzogKHJlbW90ZSkgLT5cbiAgICByZXR1cm4gY2FsbEdpdCBcInB1c2ggI3tyZW1vdGV9IC0tdGFnc1wiLCAoZGF0YSkgLT5cbiAgICAgIGF0b21SZWZyZXNoKClcbiAgICAgIHJldHVybiBwYXJzZURlZmF1bHQoZGF0YSlcblxuICBwdWxsdXA6IC0+XG4gICAgcmV0dXJuIGNhbGxHaXQgXCJwdWxsIHVwc3RyZWFtICQoZ2l0IGJyYW5jaCB8IGdyZXAgJ15cXConIHwgc2VkIC1uICdzL1xcKlsgXSovL3AnKVwiLCAoZGF0YSkgLT5cbiAgICAgIGF0b21SZWZyZXNoKClcbiAgICAgIHJldHVybiBwYXJzZURlZmF1bHQoZGF0YSlcblxuICBwdWxsOiAtPlxuICAgIHJldHVybiBjYWxsR2l0IFwicHVsbFwiLCAoZGF0YSkgLT5cbiAgICAgIGF0b21SZWZyZXNoKClcbiAgICAgIHJldHVybiBwYXJzZURlZmF1bHQoZGF0YSlcblxuICBmbG93OiAodHlwZSxhY3Rpb24sYnJhbmNoKSAtPlxuICAgIHJldHVybiBjYWxsR2l0IFwiZmxvdyAje3R5cGV9ICN7YWN0aW9ufSAje2JyYW5jaH1cIiwgKGRhdGEpIC0+XG4gICAgICBhdG9tUmVmcmVzaCgpXG4gICAgICByZXR1cm4gcGFyc2VEZWZhdWx0KGRhdGEpXG5cbiAgcHVzaDogKHJlbW90ZSxicmFuY2gsZm9yY2UpLT5cbiAgICBmb3JjZWQgPSBpZiBmb3JjZSB0aGVuIFwiLWZcIiBlbHNlIFwiXCJcbiAgICBjbWQgPSBcIi1jIHB1c2guZGVmYXVsdD1zaW1wbGUgcHVzaCAje3JlbW90ZX0gI3ticmFuY2h9ICN7Zm9yY2VkfSAtLXBvcmNlbGFpblwiXG4gICAgcmV0dXJuIGNhbGxHaXQgY21kLCAoZGF0YSkgLT5cbiAgICAgIGF0b21SZWZyZXNoKClcbiAgICAgIHJldHVybiBwYXJzZURlZmF1bHQoZGF0YSlcblxuICBsb2c6IChicmFuY2gpIC0+XG4gICAgcmV0dXJuIGNhbGxHaXQgXCJsb2cgb3JpZ2luLyN7cmVwby5nZXRVcHN0cmVhbUJyYW5jaCgpIG9yICdtYXN0ZXInfS4uI3ticmFuY2h9XCIsIHBhcnNlRGVmYXVsdFxuXG4gIHJlYmFzZTogKGJyYW5jaCkgLT5cbiAgICByZXR1cm4gY2FsbEdpdCBcInJlYmFzZSAje2JyYW5jaH1cIiwgKGRhdGEpIC0+XG4gICAgICBhdG9tUmVmcmVzaCgpXG4gICAgICByZXR1cm4gcGFyc2VEZWZhdWx0KGRhdGEpXG5cbiAgbWlkcmViYXNlOiAoY29udGluLGFib3J0LHNraXApIC0+XG4gICAgaWYgY29udGluXG4gICAgICByZXR1cm4gY2FsbEdpdCBcInJlYmFzZSAtLWNvbnRpbnVlXCIsIChkYXRhKSAtPlxuICAgICAgICBhdG9tUmVmcmVzaCgpXG4gICAgICAgIHJldHVybiBwYXJzZURlZmF1bHQoZGF0YSlcbiAgICBlbHNlIGlmIGFib3J0XG4gICAgICByZXR1cm4gY2FsbEdpdCBcInJlYmFzZSAtLWFib3J0XCIsIChkYXRhKSAtPlxuICAgICAgICBhdG9tUmVmcmVzaCgpXG4gICAgICAgIHJldHVybiBwYXJzZURlZmF1bHQoZGF0YSlcbiAgICBlbHNlIGlmIHNraXBcbiAgICAgIHJldHVybiBjYWxsR2l0IFwicmViYXNlIC0tc2tpcFwiLCAoZGF0YSkgLT5cbiAgICAgICAgYXRvbVJlZnJlc2goKVxuICAgICAgICByZXR1cm4gcGFyc2VEZWZhdWx0KGRhdGEpXG5cbiAgcmVzZXQ6IChmaWxlcykgLT5cbiAgICByZXR1cm4gY2FsbEdpdCBcImNoZWNrb3V0IC0tICN7ZmlsZXMuam9pbignICcpfVwiLCAoZGF0YSkgLT5cbiAgICAgIGF0b21SZWZyZXNoKClcbiAgICAgIHJldHVybiBwYXJzZURlZmF1bHQoZGF0YSlcblxuICByZW1vdmU6IChmaWxlcykgLT5cbiAgICByZXR1cm4gbm9vcCgpIHVubGVzcyBmaWxlcy5sZW5ndGhcbiAgICByZXR1cm4gY2FsbEdpdCBcInJtIC0tICN7ZmlsZXMuam9pbignICcpfVwiLCAoZGF0YSkgLT5cbiAgICAgIGF0b21SZWZyZXNoKClcbiAgICAgIHJldHVybiBwYXJzZURlZmF1bHQodHJ1ZSlcblxuICBzdGF0dXM6IC0+XG4gICAgcmV0dXJuIGNhbGxHaXQgJ3N0YXR1cyAtLXBvcmNlbGFpbiAtLXVudHJhY2tlZC1maWxlcz1hbGwnLCBwYXJzZVN0YXR1c1xuXG4gIHRhZzogKG5hbWUsaHJlZixtc2cpIC0+XG4gICAgcmV0dXJuIGNhbGxHaXQgXCJ0YWcgLWEgI3tuYW1lfSAtbSAnI3ttc2d9JyAje2hyZWZ9XCIsIChkYXRhKSAtPlxuICAgICAgYXRvbVJlZnJlc2goKVxuICAgICAgcmV0dXJuIHBhcnNlRGVmYXVsdChkYXRhKVxuIl19
