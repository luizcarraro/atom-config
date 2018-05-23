(function() {
  var $, $$, BranchDialog, BranchView, CommitDialog, ConfirmDialog, CreateTagDialog, DeleteDialog, DiffView, FileView, FlowDialog, GitControlView, LogView, MenuView, MergeDialog, MidrebaseDialog, ProjectDialog, PushDialog, PushTagsDialog, RebaseDialog, View, child_process, git, gitWorkspaceTitle, ref, runShell,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), View = ref.View, $ = ref.$, $$ = ref.$$;

  child_process = require('child_process');

  git = require('./git');

  BranchView = require('./views/branch-view');

  DiffView = require('./views/diff-view');

  FileView = require('./views/file-view');

  LogView = require('./views/log-view');

  MenuView = require('./views/menu-view');

  ProjectDialog = require('./dialogs/project-dialog');

  BranchDialog = require('./dialogs/branch-dialog');

  CommitDialog = require('./dialogs/commit-dialog');

  ConfirmDialog = require('./dialogs/confirm-dialog');

  CreateTagDialog = require('./dialogs/create-tag-dialog');

  DeleteDialog = require('./dialogs/delete-dialog');

  MergeDialog = require('./dialogs/merge-dialog');

  FlowDialog = require('./dialogs/flow-dialog');

  PushDialog = require('./dialogs/push-dialog');

  PushTagsDialog = require('./dialogs/push-tags-dialog');

  RebaseDialog = require('./dialogs/rebase-dialog');

  MidrebaseDialog = require('./dialogs/midrebase-dialog');

  runShell = function(cmd, output) {
    var shell;
    shell = child_process.execSync(cmd, {
      encoding: 'utf8'
    }).trim();
    if (shell === output) {
      return true;
    } else if (shell !== output) {
      return false;
    }
  };

  gitWorkspaceTitle = '';

  module.exports = GitControlView = (function(superClass) {
    extend(GitControlView, superClass);

    function GitControlView() {
      this.tag = bind(this.tag, this);
      this.midrebase = bind(this.midrebase, this);
      this.rebase = bind(this.rebase, this);
      this.flow = bind(this.flow, this);
      this.merge = bind(this.merge, this);
      return GitControlView.__super__.constructor.apply(this, arguments);
    }

    GitControlView.content = function() {
      if (git.isInitialised()) {
        return this.div({
          "class": 'git-control'
        }, (function(_this) {
          return function() {
            _this.subview('menuView', new MenuView());
            _this.div({
              "class": 'content',
              outlet: 'contentView'
            }, function() {
              _this.div({
                "class": 'sidebar'
              }, function() {
                _this.subview('filesView', new FileView());
                _this.subview('localBranchView', new BranchView({
                  name: 'Local',
                  local: true
                }));
                return _this.subview('remoteBranchView', new BranchView({
                  name: 'Remote'
                }));
              });
              _this.div({
                "class": 'domain'
              }, function() {
                return _this.subview('diffView', new DiffView());
              });
              _this.subview('projectDialog', new ProjectDialog());
              _this.subview('branchDialog', new BranchDialog());
              _this.subview('commitDialog', new CommitDialog());
              _this.subview('createtagDialog', new CreateTagDialog());
              _this.subview('mergeDialog', new MergeDialog());
              _this.subview('flowDialog', new FlowDialog());
              _this.subview('pushDialog', new PushDialog());
              _this.subview('pushtagDialog', new PushTagsDialog());
              _this.subview('rebaseDialog', new RebaseDialog());
              return _this.subview('midrebaseDialog', new MidrebaseDialog());
            });
            return _this.subview('logView', new LogView());
          };
        })(this));
      } else {
        return this.div({
          "class": 'git-control'
        }, (function(_this) {
          return function() {
            return _this.subview('logView', new LogView());
          };
        })(this));
      }
    };

    GitControlView.prototype.serialize = function() {};

    GitControlView.prototype.initialize = function() {
      console.log('GitControlView: initialize');
      git.setLogger((function(_this) {
        return function(log, iserror) {
          return _this.logView.log(log, iserror);
        };
      })(this));
      this.active = true;
      this.branchSelected = null;
      if (!git.isInitialised()) {
        git.alert("> This project is not a git repository. Either open another project or create a repository.");
      } else {
        if (git.getRepository().path) {
          this.setWorkspaceTitle(git.getRepository().path.split('/').reverse()[1]);
        } else {
          this.setWorkspaceTitle(git.getRepository().repo.workingDirectory.split('/').reverse()[0]);
        }
      }
      this.update(true);
    };

    GitControlView.prototype.destroy = function() {
      console.log('GitControlView: destroy');
      this.active = false;
    };

    GitControlView.prototype.setWorkspaceTitle = function(title) {
      return gitWorkspaceTitle = title;
    };

    GitControlView.prototype.getTitle = function() {
      return 'git:control';
    };

    GitControlView.prototype.update = function(nofetch) {
      if (git.isInitialised()) {
        this.loadBranches();
        this.showStatus();
        this.filesView.setWorkspaceTitle(gitWorkspaceTitle);
        if (!nofetch) {
          this.fetchMenuClick();
          if (this.diffView) {
            this.diffView.clearAll();
          }
        }
      }
    };

    GitControlView.prototype.loadLog = function() {
      git.log(this.selectedBranch).then(function(logs) {
        console.log('git.log', logs);
      });
    };

    GitControlView.prototype.checkoutBranch = function(branch, remote) {
      git.checkout(branch, remote).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.branchCount = function(count) {
      var remotes;
      if (git.isInitialised()) {
        remotes = git.hasOrigin();
        this.menuView.activate('upstream', remotes && count.behind);
        this.menuView.activate('downstream', remotes && (count.ahead || !git.getRemoteBranch()));
        this.menuView.activate('remote', remotes);
      }
    };

    GitControlView.prototype.loadBranches = function() {
      if (git.isInitialised()) {
        this.selectedBranch = git.getLocalBranch();
        git.getBranches().then((function(_this) {
          return function(branches) {
            _this.branches = branches;
            _this.remoteBranchView.addAll(branches.remote);
            _this.localBranchView.addAll(branches.local, true);
          };
        })(this));
      }
    };

    GitControlView.prototype.showSelectedFiles = function() {
      this.menuView.activate('file', this.filesView.hasSelected());
      this.menuView.activate('file.merging', this.filesView.hasSelected() || git.isMerging());
    };

    GitControlView.prototype.showStatus = function() {
      git.status().then((function(_this) {
        return function(files) {
          _this.filesView.addAll(files);
        };
      })(this));
    };

    GitControlView.prototype.projectMenuClick = function() {
      this.projectDialog.activate();
    };

    GitControlView.prototype.branchMenuClick = function() {
      this.branchDialog.activate();
    };

    GitControlView.prototype.compareMenuClick = function() {
      git.diff(this.filesView.getSelected().all.join(' ')).then((function(_this) {
        return function(diffs) {
          return _this.diffView.addAll(diffs);
        };
      })(this));
    };

    GitControlView.prototype.commitMenuClick = function() {
      if (!(this.filesView.hasSelected() || git.isMerging())) {
        return;
      }
      this.commitDialog.activate();
    };

    GitControlView.prototype.commit = function() {
      var files, msg;
      if (!this.filesView.hasSelected()) {
        return;
      }
      msg = this.commitDialog.getMessage();
      files = this.filesView.getSelected();
      this.filesView.unselectAll();
      git.add(files.add).then(function() {
        return git.remove(files.rem);
      }).then(function() {
        return git.commit(msg);
      }).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.createBranch = function(branch) {
      git.createBranch(branch).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.deleteBranch = function(branch) {
      var confirmCb, forceDeleteCallback;
      confirmCb = (function(_this) {
        return function(params) {
          git.deleteBranch(params.branch).then(function() {
            return _this.update();
          });
        };
      })(this);
      forceDeleteCallback = (function(_this) {
        return function(params) {
          return git.forceDeleteBranch(params.branch).then(function() {
            return _this.update();
          });
        };
      })(this);
      this.contentView.append(new DeleteDialog({
        hdr: 'Delete Branch',
        msg: "Are you sure you want to delete the local branch '" + branch + "'?",
        cb: confirmCb,
        fdCb: forceDeleteCallback,
        branch: branch
      }));
    };

    GitControlView.prototype.fetchMenuClick = function() {
      if (git.isInitialised()) {
        if (!git.hasOrigin()) {
          return;
        }
      }
      git.fetch().then((function(_this) {
        return function() {
          return _this.loadBranches();
        };
      })(this));
    };

    GitControlView.prototype.mergeMenuClick = function() {
      this.mergeDialog.activate(this.branches.local);
    };

    GitControlView.prototype.merge = function(branch, noff) {
      git.merge(branch, noff).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.flowMenuClick = function() {
      this.flowDialog.activate(this.branches.local);
    };

    GitControlView.prototype.flow = function(type, action, branch) {
      git.flow(type, action, branch).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.ptagMenuClick = function() {
      this.pushtagDialog.activate();
    };

    GitControlView.prototype.ptag = function(remote) {
      git.ptag(remote).then((function(_this) {
        return function() {
          return _this.update(true);
        };
      })(this));
    };

    GitControlView.prototype.pullMenuClick = function() {
      git.pull().then((function(_this) {
        return function() {
          return _this.update(true);
        };
      })(this));
    };

    GitControlView.prototype.pullupMenuClick = function() {
      git.pullup().then((function(_this) {
        return function() {
          return _this.update(true);
        };
      })(this));
    };

    GitControlView.prototype.pushMenuClick = function() {
      git.getBranches().then((function(_this) {
        return function(branches) {
          return _this.pushDialog.activate(branches.remote);
        };
      })(this));
    };

    GitControlView.prototype.push = function(remote, branches, force) {
      return git.push(remote, branches, force).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.rebaseMenuClick = function() {
      var check;
      check = runShell('ls `git rev-parse --git-dir` | grep rebase || echo norebase', 'norebase');
      if (check === true) {
        this.rebaseDialog.activate(this.branches.local);
      } else if (check === false) {
        this.midrebaseDialog.activate();
      }
    };

    GitControlView.prototype.rebase = function(branch) {
      git.rebase(branch).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.midrebase = function(contin, abort, skip) {
      git.midrebase(contin, abort, skip).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.resetMenuClick = function() {
      var files;
      if (!this.filesView.hasSelected()) {
        return;
      }
      files = this.filesView.getSelected();
      return atom.confirm({
        message: "Reset will erase changes since the last commit in the selected files. Are you sure?",
        buttons: {
          Cancel: (function(_this) {
            return function() {};
          })(this),
          Reset: (function(_this) {
            return function() {
              git.reset(files.all).then(function() {
                return _this.update();
              });
            };
          })(this)
        }
      });
    };

    GitControlView.prototype.tagMenuClick = function() {
      this.createtagDialog.activate();
    };

    GitControlView.prototype.tag = function(name, href, msg) {
      git.tag(name, href, msg).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    return GitControlView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi9naXQtY29udHJvbC12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsaVRBQUE7SUFBQTs7OztFQUFBLE1BQWdCLE9BQUEsQ0FBUSxzQkFBUixDQUFoQixFQUFDLGVBQUQsRUFBTyxTQUFQLEVBQVU7O0VBRVYsYUFBQSxHQUFnQixPQUFBLENBQVEsZUFBUjs7RUFFaEIsR0FBQSxHQUFNLE9BQUEsQ0FBUSxPQUFSOztFQUVOLFVBQUEsR0FBYSxPQUFBLENBQVEscUJBQVI7O0VBQ2IsUUFBQSxHQUFXLE9BQUEsQ0FBUSxtQkFBUjs7RUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLG1CQUFSOztFQUNYLE9BQUEsR0FBVSxPQUFBLENBQVEsa0JBQVI7O0VBQ1YsUUFBQSxHQUFXLE9BQUEsQ0FBUSxtQkFBUjs7RUFFWCxhQUFBLEdBQWdCLE9BQUEsQ0FBUSwwQkFBUjs7RUFDaEIsWUFBQSxHQUFlLE9BQUEsQ0FBUSx5QkFBUjs7RUFDZixZQUFBLEdBQWUsT0FBQSxDQUFRLHlCQUFSOztFQUNmLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLDBCQUFSOztFQUNoQixlQUFBLEdBQWtCLE9BQUEsQ0FBUSw2QkFBUjs7RUFDbEIsWUFBQSxHQUFlLE9BQUEsQ0FBUSx5QkFBUjs7RUFDZixXQUFBLEdBQWMsT0FBQSxDQUFRLHdCQUFSOztFQUNkLFVBQUEsR0FBYSxPQUFBLENBQVEsdUJBQVI7O0VBQ2IsVUFBQSxHQUFhLE9BQUEsQ0FBUSx1QkFBUjs7RUFDYixjQUFBLEdBQWlCLE9BQUEsQ0FBUSw0QkFBUjs7RUFDakIsWUFBQSxHQUFlLE9BQUEsQ0FBUSx5QkFBUjs7RUFDZixlQUFBLEdBQWtCLE9BQUEsQ0FBUSw0QkFBUjs7RUFFbEIsUUFBQSxHQUFXLFNBQUMsR0FBRCxFQUFNLE1BQU47QUFDVCxRQUFB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QUEsQ0FBYyxJQUFDLENBQUEsU0FBUyxDQUFDLFdBQVgsQ0FBQSxDQUFkO0FBQUEsZUFBQTs7TUFFQSxLQUFBLEdBQVEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxXQUFYLENBQUE7YUFFUixJQUFJLENBQUMsT0FBTCxDQUNFO1FBQUEsT0FBQSxFQUFTLHFGQUFUO1FBQ0EsT0FBQSxFQUNFO1VBQUEsTUFBQSxFQUFRLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUEsR0FBQTtVQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUjtVQUVBLEtBQUEsRUFBTyxDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFBO2NBQ0wsR0FBRyxDQUFDLEtBQUosQ0FBVSxLQUFLLENBQUMsR0FBaEIsQ0FBb0IsQ0FBQyxJQUFyQixDQUEwQixTQUFBO3VCQUFHLEtBQUMsQ0FBQSxNQUFELENBQUE7Y0FBSCxDQUExQjtZQURLO1VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUZQO1NBRkY7T0FERjtJQUxjOzs2QkFjaEIsWUFBQSxHQUFjLFNBQUE7TUFDWixJQUFDLENBQUEsZUFBZSxDQUFDLFFBQWpCLENBQUE7SUFEWTs7NkJBSWQsR0FBQSxHQUFLLFNBQUMsSUFBRCxFQUFPLElBQVAsRUFBYSxHQUFiO01BQ0gsR0FBRyxDQUFDLEdBQUosQ0FBUSxJQUFSLEVBQWMsSUFBZCxFQUFvQixHQUFwQixDQUF3QixDQUFDLElBQXpCLENBQThCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsTUFBRCxDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlCO0lBREc7Ozs7S0FyUHNCO0FBbkM3QiIsInNvdXJjZXNDb250ZW50IjpbIntWaWV3LCAkLCAkJH0gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcblxuY2hpbGRfcHJvY2VzcyA9IHJlcXVpcmUgJ2NoaWxkX3Byb2Nlc3MnXG5cbmdpdCA9IHJlcXVpcmUgJy4vZ2l0J1xuXG5CcmFuY2hWaWV3ID0gcmVxdWlyZSAnLi92aWV3cy9icmFuY2gtdmlldydcbkRpZmZWaWV3ID0gcmVxdWlyZSAnLi92aWV3cy9kaWZmLXZpZXcnXG5GaWxlVmlldyA9IHJlcXVpcmUgJy4vdmlld3MvZmlsZS12aWV3J1xuTG9nVmlldyA9IHJlcXVpcmUgJy4vdmlld3MvbG9nLXZpZXcnXG5NZW51VmlldyA9IHJlcXVpcmUgJy4vdmlld3MvbWVudS12aWV3J1xuXG5Qcm9qZWN0RGlhbG9nID0gcmVxdWlyZSAnLi9kaWFsb2dzL3Byb2plY3QtZGlhbG9nJ1xuQnJhbmNoRGlhbG9nID0gcmVxdWlyZSAnLi9kaWFsb2dzL2JyYW5jaC1kaWFsb2cnXG5Db21taXREaWFsb2cgPSByZXF1aXJlICcuL2RpYWxvZ3MvY29tbWl0LWRpYWxvZydcbkNvbmZpcm1EaWFsb2cgPSByZXF1aXJlICcuL2RpYWxvZ3MvY29uZmlybS1kaWFsb2cnXG5DcmVhdGVUYWdEaWFsb2cgPSByZXF1aXJlICcuL2RpYWxvZ3MvY3JlYXRlLXRhZy1kaWFsb2cnXG5EZWxldGVEaWFsb2cgPSByZXF1aXJlICcuL2RpYWxvZ3MvZGVsZXRlLWRpYWxvZydcbk1lcmdlRGlhbG9nID0gcmVxdWlyZSAnLi9kaWFsb2dzL21lcmdlLWRpYWxvZydcbkZsb3dEaWFsb2cgPSByZXF1aXJlICcuL2RpYWxvZ3MvZmxvdy1kaWFsb2cnXG5QdXNoRGlhbG9nID0gcmVxdWlyZSAnLi9kaWFsb2dzL3B1c2gtZGlhbG9nJ1xuUHVzaFRhZ3NEaWFsb2cgPSByZXF1aXJlICcuL2RpYWxvZ3MvcHVzaC10YWdzLWRpYWxvZydcblJlYmFzZURpYWxvZyA9IHJlcXVpcmUgJy4vZGlhbG9ncy9yZWJhc2UtZGlhbG9nJ1xuTWlkcmViYXNlRGlhbG9nID0gcmVxdWlyZSAnLi9kaWFsb2dzL21pZHJlYmFzZS1kaWFsb2cnXG5cbnJ1blNoZWxsID0gKGNtZCwgb3V0cHV0KSAtPlxuICBzaGVsbCA9IGNoaWxkX3Byb2Nlc3MuZXhlY1N5bmMoY21kLCB7IGVuY29kaW5nOiAndXRmOCd9KS50cmltKClcbiAgaWYgc2hlbGwgaXMgb3V0cHV0XG4gICAgcmV0dXJuIHRydWVcbiAgZWxzZSBpZiBzaGVsbCBpc250IG91dHB1dFxuICAgIHJldHVybiBmYWxzZVxuXG5naXRXb3Jrc3BhY2VUaXRsZSA9ICcnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEdpdENvbnRyb2xWaWV3IGV4dGVuZHMgVmlld1xuICBAY29udGVudDogLT5cbiAgICBpZiBnaXQuaXNJbml0aWFsaXNlZCgpXG4gICAgICBAZGl2IGNsYXNzOiAnZ2l0LWNvbnRyb2wnLCA9PlxuICAgICAgICBAc3VidmlldyAnbWVudVZpZXcnLCBuZXcgTWVudVZpZXcoKVxuICAgICAgICBAZGl2IGNsYXNzOiAnY29udGVudCcsIG91dGxldDogJ2NvbnRlbnRWaWV3JywgPT5cbiAgICAgICAgICBAZGl2IGNsYXNzOiAnc2lkZWJhcicsID0+XG4gICAgICAgICAgICBAc3VidmlldyAnZmlsZXNWaWV3JywgbmV3IEZpbGVWaWV3KClcbiAgICAgICAgICAgIEBzdWJ2aWV3ICdsb2NhbEJyYW5jaFZpZXcnLCBuZXcgQnJhbmNoVmlldyhuYW1lOiAnTG9jYWwnLCBsb2NhbDogdHJ1ZSlcbiAgICAgICAgICAgIEBzdWJ2aWV3ICdyZW1vdGVCcmFuY2hWaWV3JywgbmV3IEJyYW5jaFZpZXcobmFtZTogJ1JlbW90ZScpXG4gICAgICAgICAgQGRpdiBjbGFzczogJ2RvbWFpbicsID0+XG4gICAgICAgICAgICBAc3VidmlldyAnZGlmZlZpZXcnLCBuZXcgRGlmZlZpZXcoKVxuICAgICAgICAgIEBzdWJ2aWV3ICdwcm9qZWN0RGlhbG9nJywgbmV3IFByb2plY3REaWFsb2coKVxuICAgICAgICAgIEBzdWJ2aWV3ICdicmFuY2hEaWFsb2cnLCBuZXcgQnJhbmNoRGlhbG9nKClcbiAgICAgICAgICBAc3VidmlldyAnY29tbWl0RGlhbG9nJywgbmV3IENvbW1pdERpYWxvZygpXG4gICAgICAgICAgQHN1YnZpZXcgJ2NyZWF0ZXRhZ0RpYWxvZycsIG5ldyBDcmVhdGVUYWdEaWFsb2coKVxuICAgICAgICAgIEBzdWJ2aWV3ICdtZXJnZURpYWxvZycsIG5ldyBNZXJnZURpYWxvZygpXG4gICAgICAgICAgQHN1YnZpZXcgJ2Zsb3dEaWFsb2cnLCBuZXcgRmxvd0RpYWxvZygpXG4gICAgICAgICAgQHN1YnZpZXcgJ3B1c2hEaWFsb2cnLCBuZXcgUHVzaERpYWxvZygpXG4gICAgICAgICAgQHN1YnZpZXcgJ3B1c2h0YWdEaWFsb2cnLCBuZXcgUHVzaFRhZ3NEaWFsb2coKVxuICAgICAgICAgIEBzdWJ2aWV3ICdyZWJhc2VEaWFsb2cnLCBuZXcgUmViYXNlRGlhbG9nKClcbiAgICAgICAgICBAc3VidmlldyAnbWlkcmViYXNlRGlhbG9nJywgbmV3IE1pZHJlYmFzZURpYWxvZygpXG4gICAgICAgIEBzdWJ2aWV3ICdsb2dWaWV3JywgbmV3IExvZ1ZpZXcoKVxuICAgIGVsc2UgI1RoaXMgaXMgc28gdGhhdCBubyBlcnJvciBtZXNzYWdlcyBjYW4gYmUgY3JlYXRlZCBieSBwdXNoaW5nIGJ1dHRvbnMgdGhhdCBhcmUgdW5hdmFpbGFibGUuXG4gICAgICBAZGl2IGNsYXNzOiAnZ2l0LWNvbnRyb2wnLCA9PlxuICAgICAgICBAc3VidmlldyAnbG9nVmlldycsIG5ldyBMb2dWaWV3KClcblxuICBzZXJpYWxpemU6IC0+XG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBjb25zb2xlLmxvZyAnR2l0Q29udHJvbFZpZXc6IGluaXRpYWxpemUnXG5cbiAgICBnaXQuc2V0TG9nZ2VyIChsb2csIGlzZXJyb3IpID0+IEBsb2dWaWV3LmxvZyhsb2csIGlzZXJyb3IpXG5cbiAgICBAYWN0aXZlID0gdHJ1ZVxuICAgIEBicmFuY2hTZWxlY3RlZCA9IG51bGxcblxuICAgIGlmICFnaXQuaXNJbml0aWFsaXNlZCgpXG4gICAgICBnaXQuYWxlcnQgXCI+IFRoaXMgcHJvamVjdCBpcyBub3QgYSBnaXQgcmVwb3NpdG9yeS4gRWl0aGVyIG9wZW4gYW5vdGhlciBwcm9qZWN0IG9yIGNyZWF0ZSBhIHJlcG9zaXRvcnkuXCJcbiAgICBlbHNlXG4gICAgICBpZiBnaXQuZ2V0UmVwb3NpdG9yeSgpLnBhdGhcbiAgICAgICAgIEBzZXRXb3Jrc3BhY2VUaXRsZShnaXQuZ2V0UmVwb3NpdG9yeSgpLnBhdGguc3BsaXQoJy8nKS5yZXZlcnNlKClbMV0pXG4gICAgICBlbHNlXG4gICAgICAgICBAc2V0V29ya3NwYWNlVGl0bGUoZ2l0LmdldFJlcG9zaXRvcnkoKS5yZXBvLndvcmtpbmdEaXJlY3Rvcnkuc3BsaXQoJy8nKS5yZXZlcnNlKClbMF0pXG4gICAgQHVwZGF0ZSh0cnVlKVxuXG4gICAgcmV0dXJuXG5cbiAgZGVzdHJveTogLT5cbiAgICBjb25zb2xlLmxvZyAnR2l0Q29udHJvbFZpZXc6IGRlc3Ryb3knXG4gICAgQGFjdGl2ZSA9IGZhbHNlXG4gICAgcmV0dXJuXG5cbiAgc2V0V29ya3NwYWNlVGl0bGU6ICh0aXRsZSkgLT5cbiAgICBnaXRXb3Jrc3BhY2VUaXRsZSA9IHRpdGxlXG5cbiAgZ2V0VGl0bGU6IC0+XG4gICAgcmV0dXJuICdnaXQ6Y29udHJvbCdcblxuICB1cGRhdGU6IChub2ZldGNoKSAtPlxuICAgIGlmIGdpdC5pc0luaXRpYWxpc2VkKClcbiAgICAgIEBsb2FkQnJhbmNoZXMoKVxuICAgICAgQHNob3dTdGF0dXMoKVxuICAgICAgQGZpbGVzVmlldy5zZXRXb3Jrc3BhY2VUaXRsZShnaXRXb3Jrc3BhY2VUaXRsZSlcbiAgICAgIHVubGVzcyBub2ZldGNoXG4gICAgICAgIEBmZXRjaE1lbnVDbGljaygpXG4gICAgICAgIGlmIEBkaWZmVmlld1xuICAgICAgICAgIEBkaWZmVmlldy5jbGVhckFsbCgpXG5cbiAgICByZXR1cm5cblxuICBsb2FkTG9nOiAtPlxuICAgIGdpdC5sb2coQHNlbGVjdGVkQnJhbmNoKS50aGVuIChsb2dzKSAtPlxuICAgICAgY29uc29sZS5sb2cgJ2dpdC5sb2cnLCBsb2dzXG4gICAgICByZXR1cm5cbiAgICByZXR1cm5cblxuICBjaGVja291dEJyYW5jaDogKGJyYW5jaCwgcmVtb3RlKSAtPlxuICAgIGdpdC5jaGVja291dChicmFuY2gsIHJlbW90ZSkudGhlbiA9PiBAdXBkYXRlKClcbiAgICByZXR1cm5cblxuICBicmFuY2hDb3VudDogKGNvdW50KSAtPlxuICAgIGlmIGdpdC5pc0luaXRpYWxpc2VkKClcbiAgICAgIHJlbW90ZXMgPSBnaXQuaGFzT3JpZ2luKClcblxuICAgICAgQG1lbnVWaWV3LmFjdGl2YXRlKCd1cHN0cmVhbScsIHJlbW90ZXMgYW5kIGNvdW50LmJlaGluZClcbiAgICAgIEBtZW51Vmlldy5hY3RpdmF0ZSgnZG93bnN0cmVhbScsIHJlbW90ZXMgYW5kIChjb3VudC5haGVhZCBvciAhZ2l0LmdldFJlbW90ZUJyYW5jaCgpKSlcbiAgICAgIEBtZW51Vmlldy5hY3RpdmF0ZSgncmVtb3RlJywgcmVtb3RlcylcbiAgICByZXR1cm5cblxuICBsb2FkQnJhbmNoZXM6IC0+XG4gICAgaWYgZ2l0LmlzSW5pdGlhbGlzZWQoKVxuICAgICAgQHNlbGVjdGVkQnJhbmNoID0gZ2l0LmdldExvY2FsQnJhbmNoKClcblxuICAgICAgZ2l0LmdldEJyYW5jaGVzKCkudGhlbiAoYnJhbmNoZXMpID0+XG4gICAgICAgIEBicmFuY2hlcyA9IGJyYW5jaGVzXG4gICAgICAgIEByZW1vdGVCcmFuY2hWaWV3LmFkZEFsbChicmFuY2hlcy5yZW1vdGUpXG4gICAgICAgIEBsb2NhbEJyYW5jaFZpZXcuYWRkQWxsKGJyYW5jaGVzLmxvY2FsLCB0cnVlKVxuICAgICAgICByZXR1cm5cblxuICAgIHJldHVyblxuXG4gIHNob3dTZWxlY3RlZEZpbGVzOiAtPlxuICAgIEBtZW51Vmlldy5hY3RpdmF0ZSgnZmlsZScsIEBmaWxlc1ZpZXcuaGFzU2VsZWN0ZWQoKSlcbiAgICBAbWVudVZpZXcuYWN0aXZhdGUoJ2ZpbGUubWVyZ2luZycsIEBmaWxlc1ZpZXcuaGFzU2VsZWN0ZWQoKSBvciBnaXQuaXNNZXJnaW5nKCkpXG4gICAgcmV0dXJuXG5cbiAgc2hvd1N0YXR1czogLT5cbiAgICBnaXQuc3RhdHVzKCkudGhlbiAoZmlsZXMpID0+XG4gICAgICBAZmlsZXNWaWV3LmFkZEFsbChmaWxlcylcbiAgICAgIHJldHVyblxuICAgIHJldHVyblxuXG4gIHByb2plY3RNZW51Q2xpY2s6IC0+XG4gICAgQHByb2plY3REaWFsb2cuYWN0aXZhdGUoKVxuICAgIHJldHVyblxuXG4gIGJyYW5jaE1lbnVDbGljazogLT5cbiAgICBAYnJhbmNoRGlhbG9nLmFjdGl2YXRlKClcbiAgICByZXR1cm5cblxuICBjb21wYXJlTWVudUNsaWNrOiAtPlxuICAgIGdpdC5kaWZmKEBmaWxlc1ZpZXcuZ2V0U2VsZWN0ZWQoKS5hbGwuam9pbignICcpKS50aGVuIChkaWZmcykgPT4gQGRpZmZWaWV3LmFkZEFsbChkaWZmcylcbiAgICByZXR1cm5cblxuICBjb21taXRNZW51Q2xpY2s6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAZmlsZXNWaWV3Lmhhc1NlbGVjdGVkKCkgb3IgZ2l0LmlzTWVyZ2luZygpXG5cbiAgICBAY29tbWl0RGlhbG9nLmFjdGl2YXRlKClcbiAgICByZXR1cm5cblxuICBjb21taXQ6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAZmlsZXNWaWV3Lmhhc1NlbGVjdGVkKClcblxuICAgIG1zZyA9IEBjb21taXREaWFsb2cuZ2V0TWVzc2FnZSgpXG5cbiAgICBmaWxlcyA9IEBmaWxlc1ZpZXcuZ2V0U2VsZWN0ZWQoKVxuICAgIEBmaWxlc1ZpZXcudW5zZWxlY3RBbGwoKVxuXG4gICAgZ2l0LmFkZChmaWxlcy5hZGQpXG4gICAgICAudGhlbiAtPiBnaXQucmVtb3ZlKGZpbGVzLnJlbSlcbiAgICAgIC50aGVuIC0+IGdpdC5jb21taXQobXNnKVxuICAgICAgLnRoZW4gPT4gQHVwZGF0ZSgpXG4gICAgcmV0dXJuXG5cbiAgY3JlYXRlQnJhbmNoOiAoYnJhbmNoKSAtPlxuICAgIGdpdC5jcmVhdGVCcmFuY2goYnJhbmNoKS50aGVuID0+IEB1cGRhdGUoKVxuICAgIHJldHVyblxuXG4gIGRlbGV0ZUJyYW5jaDogKGJyYW5jaCkgLT5cbiAgICBjb25maXJtQ2IgPSAocGFyYW1zKSA9PlxuICAgICAgZ2l0LmRlbGV0ZUJyYW5jaChwYXJhbXMuYnJhbmNoKS50aGVuID0+IEB1cGRhdGUoKVxuICAgICAgcmV0dXJuXG5cbiAgICBmb3JjZURlbGV0ZUNhbGxiYWNrID0gKHBhcmFtcykgPT5cbiAgICAgIGdpdC5mb3JjZURlbGV0ZUJyYW5jaChwYXJhbXMuYnJhbmNoKS50aGVuID0+IEB1cGRhdGUoKVxuXG4gICAgQGNvbnRlbnRWaWV3LmFwcGVuZCBuZXcgRGVsZXRlRGlhbG9nXG4gICAgICBoZHI6ICdEZWxldGUgQnJhbmNoJ1xuICAgICAgbXNnOiBcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkZWxldGUgdGhlIGxvY2FsIGJyYW5jaCAnI3ticmFuY2h9Jz9cIlxuICAgICAgY2I6IGNvbmZpcm1DYlxuICAgICAgZmRDYjogZm9yY2VEZWxldGVDYWxsYmFja1xuICAgICAgYnJhbmNoOiBicmFuY2hcbiAgICByZXR1cm5cblxuICBmZXRjaE1lbnVDbGljazogLT5cbiAgICBpZiBnaXQuaXNJbml0aWFsaXNlZCgpXG4gICAgICByZXR1cm4gdW5sZXNzIGdpdC5oYXNPcmlnaW4oKVxuXG4gICAgZ2l0LmZldGNoKCkudGhlbiA9PiBAbG9hZEJyYW5jaGVzKClcbiAgICByZXR1cm5cblxuICBtZXJnZU1lbnVDbGljazogLT5cbiAgICBAbWVyZ2VEaWFsb2cuYWN0aXZhdGUoQGJyYW5jaGVzLmxvY2FsKVxuICAgIHJldHVyblxuXG4gIG1lcmdlOiAoYnJhbmNoLG5vZmYpID0+XG4gICAgZ2l0Lm1lcmdlKGJyYW5jaCxub2ZmKS50aGVuID0+IEB1cGRhdGUoKVxuICAgIHJldHVyblxuXG4gIGZsb3dNZW51Q2xpY2s6IC0+XG4gICAgQGZsb3dEaWFsb2cuYWN0aXZhdGUoQGJyYW5jaGVzLmxvY2FsKVxuICAgIHJldHVyblxuXG4gIGZsb3c6ICh0eXBlLGFjdGlvbixicmFuY2gpID0+XG4gICAgZ2l0LmZsb3codHlwZSxhY3Rpb24sYnJhbmNoKS50aGVuID0+IEB1cGRhdGUoKVxuICAgIHJldHVyblxuXG4gIHB0YWdNZW51Q2xpY2s6IC0+XG4gICAgQHB1c2h0YWdEaWFsb2cuYWN0aXZhdGUoKVxuICAgIHJldHVyblxuXG4gIHB0YWc6IChyZW1vdGUpIC0+XG4gICAgZ2l0LnB0YWcocmVtb3RlKS50aGVuID0+IEB1cGRhdGUodHJ1ZSlcbiAgICByZXR1cm5cblxuICBwdWxsTWVudUNsaWNrOiAtPlxuICAgIGdpdC5wdWxsKCkudGhlbiA9PiBAdXBkYXRlKHRydWUpXG4gICAgcmV0dXJuXG5cbiAgcHVsbHVwTWVudUNsaWNrOiAtPlxuICAgIGdpdC5wdWxsdXAoKS50aGVuID0+IEB1cGRhdGUodHJ1ZSlcbiAgICByZXR1cm5cblxuICBwdXNoTWVudUNsaWNrOiAtPlxuICAgIGdpdC5nZXRCcmFuY2hlcygpLnRoZW4gKGJyYW5jaGVzKSA9PiAgQHB1c2hEaWFsb2cuYWN0aXZhdGUoYnJhbmNoZXMucmVtb3RlKVxuICAgIHJldHVyblxuXG4gIHB1c2g6IChyZW1vdGUsIGJyYW5jaGVzLCBmb3JjZSkgLT5cbiAgICBnaXQucHVzaChyZW1vdGUsYnJhbmNoZXMsZm9yY2UpLnRoZW4gPT4gQHVwZGF0ZSgpXG5cbiAgcmViYXNlTWVudUNsaWNrOiAtPlxuICAgIGNoZWNrID0gcnVuU2hlbGwoJ2xzIGBnaXQgcmV2LXBhcnNlIC0tZ2l0LWRpcmAgfCBncmVwIHJlYmFzZSB8fCBlY2hvIG5vcmViYXNlJywnbm9yZWJhc2UnKVxuICAgIGlmIGNoZWNrIGlzIHRydWVcbiAgICAgIEByZWJhc2VEaWFsb2cuYWN0aXZhdGUoQGJyYW5jaGVzLmxvY2FsKVxuICAgIGVsc2UgaWYgY2hlY2sgaXMgZmFsc2VcbiAgICAgIEBtaWRyZWJhc2VEaWFsb2cuYWN0aXZhdGUoKVxuICAgIHJldHVyblxuXG4gIHJlYmFzZTogKGJyYW5jaCkgPT5cbiAgICBnaXQucmViYXNlKGJyYW5jaCkudGhlbiA9PiBAdXBkYXRlKClcbiAgICByZXR1cm5cblxuICBtaWRyZWJhc2U6IChjb250aW4sIGFib3J0LCBza2lwKSA9PlxuICAgIGdpdC5taWRyZWJhc2UoY29udGluLGFib3J0LHNraXApLnRoZW4gPT4gQHVwZGF0ZSgpXG4gICAgcmV0dXJuXG5cbiAgcmVzZXRNZW51Q2xpY2s6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAZmlsZXNWaWV3Lmhhc1NlbGVjdGVkKClcblxuICAgIGZpbGVzID0gQGZpbGVzVmlldy5nZXRTZWxlY3RlZCgpXG5cbiAgICBhdG9tLmNvbmZpcm1cbiAgICAgIG1lc3NhZ2U6IFwiUmVzZXQgd2lsbCBlcmFzZSBjaGFuZ2VzIHNpbmNlIHRoZSBsYXN0IGNvbW1pdCBpbiB0aGUgc2VsZWN0ZWQgZmlsZXMuIEFyZSB5b3Ugc3VyZT9cIlxuICAgICAgYnV0dG9uczpcbiAgICAgICAgQ2FuY2VsOiA9PlxuICAgICAgICAgIHJldHVyblxuICAgICAgICBSZXNldDogPT5cbiAgICAgICAgICBnaXQucmVzZXQoZmlsZXMuYWxsKS50aGVuID0+IEB1cGRhdGUoKVxuICAgICAgICAgIHJldHVyblxuXG4gIHRhZ01lbnVDbGljazogLT5cbiAgICBAY3JlYXRldGFnRGlhbG9nLmFjdGl2YXRlKClcbiAgICByZXR1cm5cblxuICB0YWc6IChuYW1lLCBocmVmLCBtc2cpID0+XG4gICAgZ2l0LnRhZyhuYW1lLCBocmVmLCBtc2cpLnRoZW4gPT4gQHVwZGF0ZSgpXG4gICAgcmV0dXJuXG4iXX0=
