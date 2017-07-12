(function() {
  var Executable, HybridExecutable, Promise, _, fs, os, parentConfigKey, path, semver, shellEnv, spawn, which,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Promise = require('bluebird');

  _ = require('lodash');

  which = require('which');

  spawn = require('child_process').spawn;

  path = require('path');

  semver = require('semver');

  shellEnv = require('shell-env');

  os = require('os');

  fs = require('fs');

  parentConfigKey = "atom-beautify.executables";

  Executable = (function() {
    var isInstalled, version;

    Executable.prototype.name = null;

    Executable.prototype.cmd = null;

    Executable.prototype.key = null;

    Executable.prototype.homepage = null;

    Executable.prototype.installation = null;

    Executable.prototype.versionArgs = ['--version'];

    Executable.prototype.versionParse = function(text) {
      return semver.clean(text);
    };

    Executable.prototype.versionRunOptions = {};

    Executable.prototype.versionsSupported = '>= 0.0.0';

    Executable.prototype.required = true;

    function Executable(options) {
      var versionOptions;
      if (options.cmd == null) {
        throw new Error("The command (i.e. cmd property) is required for an Executable.");
      }
      this.name = options.name;
      this.cmd = options.cmd;
      this.key = this.cmd;
      this.homepage = options.homepage;
      this.installation = options.installation;
      this.required = !options.optional;
      if (options.version != null) {
        versionOptions = options.version;
        if (versionOptions.args) {
          this.versionArgs = versionOptions.args;
        }
        if (versionOptions.parse) {
          this.versionParse = versionOptions.parse;
        }
        if (versionOptions.runOptions) {
          this.versionRunOptions = versionOptions.runOptions;
        }
        if (versionOptions.supported) {
          this.versionsSupported = versionOptions.supported;
        }
      }
      this.setupLogger();
    }

    Executable.prototype.init = function() {
      return Promise.all([this.loadVersion()]).then((function(_this) {
        return function() {
          return _this.verbose("Done init of " + _this.name);
        };
      })(this)).then((function(_this) {
        return function() {
          return _this;
        };
      })(this))["catch"]((function(_this) {
        return function(error) {
          if (!_this.required) {
            return _this;
          } else {
            return Promise.reject(error);
          }
        };
      })(this));
    };


    /*
    Logger instance
     */

    Executable.prototype.logger = null;


    /*
    Initialize and configure Logger
     */

    Executable.prototype.setupLogger = function() {
      var key, method, ref;
      this.logger = require('../logger')(this.name + " Executable");
      ref = this.logger;
      for (key in ref) {
        method = ref[key];
        this[key] = method;
      }
      return this.verbose(this.name + " executable logger has been initialized.");
    };

    isInstalled = null;

    version = null;

    Executable.prototype.loadVersion = function(force) {
      if (force == null) {
        force = false;
      }
      this.verbose("loadVersion", this.version, force);
      if (force || (this.version == null)) {
        this.verbose("Loading version without cache");
        return this.runVersion().then((function(_this) {
          return function(text) {
            return _this.saveVersion(text);
          };
        })(this));
      } else {
        this.verbose("Loading cached version");
        return Promise.resolve(this.version);
      }
    };

    Executable.prototype.runVersion = function() {
      return this.run(this.versionArgs, this.versionRunOptions).then((function(_this) {
        return function(version) {
          _this.info("Version text: " + version);
          return version;
        };
      })(this));
    };

    Executable.prototype.saveVersion = function(text) {
      return Promise.resolve().then((function(_this) {
        return function() {
          return _this.versionParse(text);
        };
      })(this)).then(function(version) {
        var valid;
        valid = Boolean(semver.valid(version));
        if (!valid) {
          throw new Error("Version is not valid: " + version);
        }
        return version;
      }).then((function(_this) {
        return function(version) {
          _this.isInstalled = true;
          return _this.version = version;
        };
      })(this)).then((function(_this) {
        return function(version) {
          _this.info(_this.cmd + " version: " + version);
          return version;
        };
      })(this))["catch"]((function(_this) {
        return function(error) {
          var help;
          _this.isInstalled = false;
          _this.error(error);
          help = {
            program: _this.cmd,
            link: _this.installation || _this.homepage,
            pathOption: "Executable - " + (_this.name || _this.cmd) + " - Path"
          };
          return Promise.reject(_this.commandNotFoundError(_this.name || _this.cmd, help));
        };
      })(this));
    };

    Executable.prototype.isSupported = function() {
      return this.isVersion(this.versionsSupported);
    };

    Executable.prototype.isVersion = function(range) {
      return this.versionSatisfies(this.version, range);
    };

    Executable.prototype.versionSatisfies = function(version, range) {
      return semver.satisfies(version, range);
    };

    Executable.prototype.getConfig = function() {
      return (typeof atom !== "undefined" && atom !== null ? atom.config.get(parentConfigKey + "." + this.key) : void 0) || {};
    };


    /*
    Run command-line interface command
     */

    Executable.prototype.run = function(args, options) {
      var cmd, cwd, exeName, help, ignoreReturnCode, onStdin, returnStderr, returnStdoutOrStderr;
      if (options == null) {
        options = {};
      }
      this.debug("Run: ", this.cmd, args, options);
      cmd = options.cmd, cwd = options.cwd, ignoreReturnCode = options.ignoreReturnCode, help = options.help, onStdin = options.onStdin, returnStderr = options.returnStderr, returnStdoutOrStderr = options.returnStdoutOrStderr;
      exeName = cmd || this.cmd;
      if (cwd == null) {
        cwd = os.tmpDir();
      }
      return Promise.all([this.shellEnv(), this.resolveArgs(args)]).then((function(_this) {
        return function(arg1) {
          var args, env, exePath;
          env = arg1[0], args = arg1[1];
          _this.debug('exeName, args:', exeName, args);
          exePath = _this.path(exeName);
          return Promise.all([exeName, args, env, exePath]);
        };
      })(this)).then((function(_this) {
        return function(arg1) {
          var args, env, exe, exeName, exePath, spawnOptions;
          exeName = arg1[0], args = arg1[1], env = arg1[2], exePath = arg1[3];
          _this.debug('exePath:', exePath);
          _this.debug('env:', env);
          _this.debug('PATH:', env.PATH);
          _this.debug('args', args);
          args = _this.relativizePaths(args);
          _this.debug('relativized args', args);
          exe = exePath != null ? exePath : exeName;
          spawnOptions = {
            cwd: cwd,
            env: env
          };
          _this.debug('spawnOptions', spawnOptions);
          return _this.spawn(exe, args, spawnOptions, onStdin).then(function(arg2) {
            var returnCode, stderr, stdout, windowsProgramNotFoundMsg;
            returnCode = arg2.returnCode, stdout = arg2.stdout, stderr = arg2.stderr;
            _this.verbose('spawn result, returnCode', returnCode);
            _this.verbose('spawn result, stdout', stdout);
            _this.verbose('spawn result, stderr', stderr);
            if (!ignoreReturnCode && returnCode !== 0) {
              windowsProgramNotFoundMsg = "is not recognized as an internal or external command";
              _this.verbose(stderr, windowsProgramNotFoundMsg);
              if (_this.isWindows() && returnCode === 1 && stderr.indexOf(windowsProgramNotFoundMsg) !== -1) {
                throw _this.commandNotFoundError(exeName, help);
              } else {
                throw new Error(stderr || stdout);
              }
            } else {
              if (returnStdoutOrStderr) {
                return stdout || stderr;
              } else if (returnStderr) {
                return stderr;
              } else {
                return stdout;
              }
            }
          })["catch"](function(err) {
            _this.debug('error', err);
            if (err.code === 'ENOENT' || err.errno === 'ENOENT') {
              throw _this.commandNotFoundError(exeName, help);
            } else {
              throw err;
            }
          });
        };
      })(this));
    };

    Executable.prototype.path = function(cmd) {
      var config, exeName;
      if (cmd == null) {
        cmd = this.cmd;
      }
      config = this.getConfig();
      if (config && config.path) {
        return Promise.resolve(config.path);
      } else {
        exeName = cmd;
        return this.which(exeName);
      }
    };

    Executable.prototype.resolveArgs = function(args) {
      args = _.flatten(args);
      return Promise.all(args);
    };

    Executable.prototype.relativizePaths = function(args) {
      var newArgs, tmpDir;
      tmpDir = os.tmpDir();
      newArgs = args.map(function(arg) {
        var isTmpFile;
        isTmpFile = typeof arg === 'string' && !arg.includes(':') && path.isAbsolute(arg) && path.dirname(arg).startsWith(tmpDir);
        if (isTmpFile) {
          return path.relative(tmpDir, arg);
        }
        return arg;
      });
      return newArgs;
    };


    /*
    Spawn
     */

    Executable.prototype.spawn = function(exe, args, options, onStdin) {
      args = _.without(args, void 0);
      args = _.without(args, null);
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var cmd, stderr, stdout;
          _this.debug('spawn', exe, args);
          cmd = spawn(exe, args, options);
          stdout = "";
          stderr = "";
          cmd.stdout.on('data', function(data) {
            return stdout += data;
          });
          cmd.stderr.on('data', function(data) {
            return stderr += data;
          });
          cmd.on('close', function(returnCode) {
            _this.debug('spawn done', returnCode, stderr, stdout);
            return resolve({
              returnCode: returnCode,
              stdout: stdout,
              stderr: stderr
            });
          });
          cmd.on('error', function(err) {
            _this.debug('error', err);
            return reject(err);
          });
          if (onStdin) {
            return onStdin(cmd.stdin);
          }
        };
      })(this));
    };


    /*
    Add help to error.description
    
    Note: error.description is not officially used in JavaScript,
    however it is used internally for Atom Beautify when displaying errors.
     */

    Executable.prototype.commandNotFoundError = function(exe, help) {
      if (exe == null) {
        exe = this.name || this.cmd;
      }
      return this.constructor.commandNotFoundError(exe, help);
    };

    Executable.commandNotFoundError = function(exe, help) {
      var docsLink, er, helpStr, issueSearchLink, message;
      message = "Could not find '" + exe + "'. The program may not be installed.";
      er = new Error(message);
      er.code = 'CommandNotFound';
      er.errno = er.code;
      er.syscall = 'beautifier::run';
      er.file = exe;
      if (help != null) {
        if (typeof help === "object") {
          helpStr = "See " + help.link + " for program installation instructions.\n";
          if (help.pathOption) {
            helpStr += "You can configure Atom Beautify with the absolute path to '" + (help.program || exe) + "' by setting '" + help.pathOption + "' in the Atom Beautify package settings.\n";
          }
          if (help.additional) {
            helpStr += help.additional;
          }
          issueSearchLink = "https://github.com/Glavin001/atom-beautify/search?q=" + exe + "&type=Issues";
          docsLink = "https://github.com/Glavin001/atom-beautify/tree/master/docs";
          helpStr += "Your program is properly installed if running '" + (this.isWindows() ? 'where.exe' : 'which') + " " + exe + "' in your " + (this.isWindows() ? 'CMD prompt' : 'Terminal') + " returns an absolute path to the executable. If this does not work then you have not installed the program correctly and so Atom Beautify will not find the program. Atom Beautify requires that the program be found in your PATH environment variable. \nNote that this is not an Atom Beautify issue if beautification does not work and the above command also does not work: this is expected behaviour, since you have not properly installed your program. Please properly setup the program and search through existing Atom Beautify issues before creating a new issue. See " + issueSearchLink + " for related Issues and " + docsLink + " for documentation. If you are still unable to resolve this issue on your own then please create a new issue and ask for help.\n";
          er.description = helpStr;
        } else {
          er.description = help;
        }
      }
      return er;
    };

    Executable._envCache = null;

    Executable.prototype.shellEnv = function() {
      return this.constructor.shellEnv();
    };

    Executable.shellEnv = function() {
      if (this._envCache) {
        return Promise.resolve(this._envCache);
      } else {
        return shellEnv().then((function(_this) {
          return function(env) {
            return _this._envCache = env;
          };
        })(this));
      }
    };


    /*
    Like the unix which utility.
    
    Finds the first instance of a specified executable in the PATH environment variable.
    Does not cache the results,
    so hash -r is not needed when the PATH changes.
    See https://github.com/isaacs/node-which
     */

    Executable.prototype.which = function(exe, options) {
      return this.constructor.which(exe, options);
    };

    Executable._whichCache = {};

    Executable.which = function(exe, options) {
      if (options == null) {
        options = {};
      }
      if (this._whichCache[exe]) {
        return Promise.resolve(this._whichCache[exe]);
      }
      return this.shellEnv().then((function(_this) {
        return function(env) {
          return new Promise(function(resolve, reject) {
            var i, ref;
            if (options.path == null) {
              options.path = env.PATH;
            }
            if (_this.isWindows()) {
              if (!options.path) {
                for (i in env) {
                  if (i.toLowerCase() === "path") {
                    options.path = env[i];
                    break;
                  }
                }
              }
              if (options.pathExt == null) {
                options.pathExt = ((ref = process.env.PATHEXT) != null ? ref : '.EXE') + ";";
              }
            }
            return which(exe, options, function(err, path) {
              if (err) {
                return resolve(exe);
              }
              _this._whichCache[exe] = path;
              return resolve(path);
            });
          });
        };
      })(this));
    };


    /*
    If platform is Windows
     */

    Executable.prototype.isWindows = function() {
      return this.constructor.isWindows();
    };

    Executable.isWindows = function() {
      return new RegExp('^win').test(process.platform);
    };

    return Executable;

  })();

  HybridExecutable = (function(superClass) {
    extend(HybridExecutable, superClass);

    HybridExecutable.prototype.dockerOptions = {
      image: void 0,
      workingDir: "/workdir"
    };

    function HybridExecutable(options) {
      HybridExecutable.__super__.constructor.call(this, options);
      if (options.docker != null) {
        this.dockerOptions = Object.assign({}, this.dockerOptions, options.docker);
        this.docker = this.constructor.dockerExecutable();
      }
    }

    HybridExecutable.docker = void 0;

    HybridExecutable.dockerExecutable = function() {
      if (this.docker == null) {
        this.docker = new Executable({
          name: "Docker",
          cmd: "docker",
          homepage: "https://www.docker.com/",
          installation: "https://www.docker.com/get-docker",
          version: {
            parse: function(text) {
              return text.match(/version [0]*([1-9]\d*).[0]*([1-9]\d*).[0]*([1-9]\d*)/).slice(1).join('.');
            }
          }
        });
      }
      return this.docker;
    };

    HybridExecutable.prototype.installedWithDocker = false;

    HybridExecutable.prototype.init = function() {
      return HybridExecutable.__super__.init.call(this)["catch"]((function(_this) {
        return function(error) {
          if (_this.docker == null) {
            return Promise.reject(error);
          }
          return _this.docker.init().then(function() {
            return _this.runImage(_this.versionArgs, _this.versionRunOptions);
          }).then(function(text) {
            return _this.saveVersion(text);
          }).then(function() {
            return _this.installedWithDocker = true;
          }).then(function() {
            return _this;
          })["catch"](function(dockerError) {
            _this.debug(dockerError);
            return Promise.reject(error);
          });
        };
      })(this));
    };

    HybridExecutable.prototype.run = function(args, options) {
      if (options == null) {
        options = {};
      }
      if (this.installedWithDocker && this.docker && this.docker.isInstalled) {
        return this.runImage(args, options);
      }
      return HybridExecutable.__super__.run.call(this, args, options);
    };

    HybridExecutable.prototype.runImage = function(args, options) {
      this.debug("Run Docker executable: ", args, options);
      return this.resolveArgs(args).then((function(_this) {
        return function(args) {
          var cwd, image, newArgs, pwd, rootPath, tmpDir, workingDir;
          cwd = options.cwd;
          tmpDir = os.tmpDir();
          pwd = fs.realpathSync(cwd || tmpDir);
          image = _this.dockerOptions.image;
          workingDir = _this.dockerOptions.workingDir;
          rootPath = '/mountedRoot';
          newArgs = args.map(function(arg) {
            if (typeof arg === 'string' && !arg.includes(':') && path.isAbsolute(arg) && !path.dirname(arg).startsWith(tmpDir)) {
              return path.join(rootPath, arg);
            } else {
              return arg;
            }
          });
          return _this.docker.run(["run", "--volume", pwd + ":" + workingDir, "--volume", (path.resolve('/')) + ":" + rootPath, "--workdir", workingDir, image, newArgs], options);
        };
      })(this));
    };

    return HybridExecutable;

  })(Executable);

  module.exports = HybridExecutable;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2V4ZWN1dGFibGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx1R0FBQTtJQUFBOzs7RUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFVBQVI7O0VBQ1YsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztFQUNKLEtBQUEsR0FBUSxPQUFBLENBQVEsT0FBUjs7RUFDUixLQUFBLEdBQVEsT0FBQSxDQUFRLGVBQVIsQ0FBd0IsQ0FBQzs7RUFDakMsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7RUFDVCxRQUFBLEdBQVcsT0FBQSxDQUFRLFdBQVI7O0VBQ1gsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFFTCxlQUFBLEdBQWtCOztFQUdaO0FBRUosUUFBQTs7eUJBQUEsSUFBQSxHQUFNOzt5QkFDTixHQUFBLEdBQUs7O3lCQUNMLEdBQUEsR0FBSzs7eUJBQ0wsUUFBQSxHQUFVOzt5QkFDVixZQUFBLEdBQWM7O3lCQUNkLFdBQUEsR0FBYSxDQUFDLFdBQUQ7O3lCQUNiLFlBQUEsR0FBYyxTQUFDLElBQUQ7YUFBVSxNQUFNLENBQUMsS0FBUCxDQUFhLElBQWI7SUFBVjs7eUJBQ2QsaUJBQUEsR0FBbUI7O3lCQUNuQixpQkFBQSxHQUFtQjs7eUJBQ25CLFFBQUEsR0FBVTs7SUFFRyxvQkFBQyxPQUFEO0FBRVgsVUFBQTtNQUFBLElBQUksbUJBQUo7QUFDRSxjQUFVLElBQUEsS0FBQSxDQUFNLGdFQUFOLEVBRFo7O01BRUEsSUFBQyxDQUFBLElBQUQsR0FBUSxPQUFPLENBQUM7TUFDaEIsSUFBQyxDQUFBLEdBQUQsR0FBTyxPQUFPLENBQUM7TUFDZixJQUFD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YixDQUEvQixJQUNFLElBQUksQ0FBQyxVQUFMLENBQWdCLEdBQWhCLENBREYsSUFDMkIsQ0FBSSxJQUFJLENBQUMsT0FBTCxDQUFhLEdBQWIsQ0FBaUIsQ0FBQyxVQUFsQixDQUE2QixNQUE3QixDQURuQztxQkFFTyxJQUFJLENBQUMsSUFBTCxDQUFVLFFBQVYsRUFBb0IsR0FBcEIsRUFGUDthQUFBLE1BQUE7cUJBRXFDLElBRnJDOztVQURpQixDQUFUO2lCQU1WLEtBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLENBQ1IsS0FEUSxFQUVSLFVBRlEsRUFFTyxHQUFELEdBQUssR0FBTCxHQUFRLFVBRmQsRUFHUixVQUhRLEVBR00sQ0FBQyxJQUFJLENBQUMsT0FBTCxDQUFhLEdBQWIsQ0FBRCxDQUFBLEdBQW1CLEdBQW5CLEdBQXNCLFFBSDVCLEVBSVIsV0FKUSxFQUlLLFVBSkwsRUFLUixLQUxRLEVBTVIsT0FOUSxDQUFaLEVBUUUsT0FSRjtRQWRJO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURSO0lBRlE7Ozs7S0FoRG1COztFQThFL0IsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUE1Y2pCIiwic291cmNlc0NvbnRlbnQiOlsiUHJvbWlzZSA9IHJlcXVpcmUoJ2JsdWViaXJkJylcbl8gPSByZXF1aXJlKCdsb2Rhc2gnKVxud2hpY2ggPSByZXF1aXJlKCd3aGljaCcpXG5zcGF3biA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKS5zcGF3blxucGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuc2VtdmVyID0gcmVxdWlyZSgnc2VtdmVyJylcbnNoZWxsRW52ID0gcmVxdWlyZSgnc2hlbGwtZW52Jylcbm9zID0gcmVxdWlyZSgnb3MnKVxuZnMgPSByZXF1aXJlKCdmcycpXG5cbnBhcmVudENvbmZpZ0tleSA9IFwiYXRvbS1iZWF1dGlmeS5leGVjdXRhYmxlc1wiXG5cblxuY2xhc3MgRXhlY3V0YWJsZVxuXG4gIG5hbWU6IG51bGxcbiAgY21kOiBudWxsXG4gIGtleTogbnVsbFxuICBob21lcGFnZTogbnVsbFxuICBpbnN0YWxsYXRpb246IG51bGxcbiAgdmVyc2lvbkFyZ3M6IFsnLS12ZXJzaW9uJ11cbiAgdmVyc2lvblBhcnNlOiAodGV4dCkgLT4gc2VtdmVyLmNsZWFuKHRleHQpXG4gIHZlcnNpb25SdW5PcHRpb25zOiB7fVxuICB2ZXJzaW9uc1N1cHBvcnRlZDogJz49IDAuMC4wJ1xuICByZXF1aXJlZDogdHJ1ZVxuXG4gIGNvbnN0cnVjdG9yOiAob3B0aW9ucykgLT5cbiAgICAjIFZhbGlkYXRpb25cbiAgICBpZiAhb3B0aW9ucy5jbWQ/XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgY29tbWFuZCAoaS5lLiBjbWQgcHJvcGVydHkpIGlzIHJlcXVpcmVkIGZvciBhbiBFeGVjdXRhYmxlLlwiKVxuICAgIEBuYW1lID0gb3B0aW9ucy5uYW1lXG4gICAgQGNtZCA9IG9wdGlvbnMuY21kXG4gICAgQGtleSA9IEBjbWRcbiAgICBAaG9tZXBhZ2UgPSBvcHRpb25zLmhvbWVwYWdlXG4gICAgQGluc3RhbGxhdGlvbiA9IG9wdGlvbnMuaW5zdGFsbGF0aW9uXG4gICAgQHJlcXVpcmVkID0gbm90IG9wdGlvbnMub3B0aW9uYWxcbiAgICBpZiBvcHRpb25zLnZlcnNpb24/XG4gICAgICB2ZXJzaW9uT3B0aW9ucyA9IG9wdGlvbnMudmVyc2lvblxuICAgICAgQHZlcnNpb25BcmdzID0gdmVyc2lvbk9wdGlvbnMuYXJncyBpZiB2ZXJzaW9uT3B0aW9ucy5hcmdzXG4gICAgICBAdmVyc2lvblBhcnNlID0gdmVyc2lvbk9wdGlvbnMucGFyc2UgaWYgdmVyc2lvbk9wdGlvbnMucGFyc2VcbiAgICAgIEB2ZXJzaW9uUnVuT3B0aW9ucyA9IHZlcnNpb25PcHRpb25zLnJ1bk9wdGlvbnMgaWYgdmVyc2lvbk9wdGlvbnMucnVuT3B0aW9uc1xuICAgICAgQHZlcnNpb25zU3VwcG9ydGVkID0gdmVyc2lvbk9wdGlvbnMuc3VwcG9ydGVkIGlmIHZlcnNpb25PcHRpb25zLnN1cHBvcnRlZFxuICAgIEBzZXR1cExvZ2dlcigpXG5cbiAgaW5pdDogKCkgLT5cbiAgICBQcm9taXNlLmFsbChbXG4gICAgICBAbG9hZFZlcnNpb24oKVxuICAgIF0pXG4gICAgICAudGhlbigoKSA9PiBAdmVyYm9zZShcIkRvbmUgaW5pdCBvZiAje0BuYW1lfVwiKSlcbiAgICAgIC50aGVuKCgpID0+IEApXG4gICAgICAuY2F0Y2goKGVycm9yKSA9PlxuICAgICAgICBpZiBub3QgQC5yZXF1aXJlZFxuICAgICAgICAgIEBcbiAgICAgICAgZWxzZVxuICAgICAgICAgIFByb21pc2UucmVqZWN0KGVycm9yKVxuICAgICAgKVxuXG4gICMjI1xuICBMb2dnZXIgaW5zdGFuY2VcbiAgIyMjXG4gIGxvZ2dlcjogbnVsbFxuICAjIyNcbiAgSW5pdGlhbGl6ZSBhbmQgY29uZmlndXJlIExvZ2dlclxuICAjIyNcbiAgc2V0dXBMb2dnZXI6IC0+XG4gICAgQGxvZ2dlciA9IHJlcXVpcmUoJy4uL2xvZ2dlcicpKFwiI3tAbmFtZX0gRXhlY3V0YWJsZVwiKVxuICAgIGZvciBrZXksIG1ldGhvZCBvZiBAbG9nZ2VyXG4gICAgICBAW2tleV0gPSBtZXRob2RcbiAgICBAdmVyYm9zZShcIiN7QG5hbWV9IGV4ZWN1dGFibGUgbG9nZ2VyIGhhcyBiZWVuIGluaXRpYWxpemVkLlwiKVxuXG4gIGlzSW5zdGFsbGVkID0gbnVsbFxuICB2ZXJzaW9uID0gbnVsbFxuICBsb2FkVmVyc2lvbjogKGZvcmNlID0gZmFsc2UpIC0+XG4gICAgQHZlcmJvc2UoXCJsb2FkVmVyc2lvblwiLCBAdmVyc2lvbiwgZm9yY2UpXG4gICAgaWYgZm9yY2Ugb3IgIUB2ZXJzaW9uP1xuICAgICAgQHZlcmJvc2UoXCJMb2FkaW5nIHZlcnNpb24gd2l0aG91dCBjYWNoZVwiKVxuICAgICAgQHJ1blZlcnNpb24oKVxuICAgICAgICAudGhlbigodGV4dCkgPT4gQHNhdmVWZXJzaW9uKHRleHQpKVxuICAgIGVsc2VcbiAgICAgIEB2ZXJib3NlKFwiTG9hZGluZyBjYWNoZWQgdmVyc2lvblwiKVxuICAgICAgUHJvbWlzZS5yZXNvbHZlKEB2ZXJzaW9uKVxuXG4gIHJ1blZlcnNpb246ICgpIC0+XG4gICAgQHJ1bihAdmVyc2lvbkFyZ3MsIEB2ZXJzaW9uUnVuT3B0aW9ucylcbiAgICAgIC50aGVuKCh2ZXJzaW9uKSA9PlxuICAgICAgICBAaW5mbyhcIlZlcnNpb24gdGV4dDogXCIgKyB2ZXJzaW9uKVxuICAgICAgICB2ZXJzaW9uXG4gICAgICApXG5cbiAgc2F2ZVZlcnNpb246ICh0ZXh0KSAtPlxuICAgIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAudGhlbiggPT4gQHZlcnNpb25QYXJzZSh0ZXh0KSlcbiAgICAgIC50aGVuKCh2ZXJzaW9uKSAtPlxuICAgICAgICB2YWxpZCA9IEJvb2xlYW4oc2VtdmVyLnZhbGlkKHZlcnNpb24pKVxuICAgICAgICBpZiBub3QgdmFsaWRcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJWZXJzaW9uIGlzIG5vdCB2YWxpZDogXCIrdmVyc2lvbilcbiAgICAgICAgdmVyc2lvblxuICAgICAgKVxuICAgICAgLnRoZW4oKHZlcnNpb24pID0+XG4gICAgICAgIEBpc0luc3RhbGxlZCA9IHRydWVcbiAgICAgICAgQHZlcnNpb24gPSB2ZXJzaW9uXG4gICAgICApXG4gICAgICAudGhlbigodmVyc2lvbikgPT5cbiAgICAgICAgQGluZm8oXCIje0BjbWR9IHZlcnNpb246ICN7dmVyc2lvbn1cIilcbiAgICAgICAgdmVyc2lvblxuICAgICAgKVxuICAgICAgLmNhdGNoKChlcnJvcikgPT5cbiAgICAgICAgQGlzSW5zdGFsbGVkID0gZmFsc2VcbiAgICAgICAgQGVycm9yKGVycm9yKVxuICAgICAgICBoZWxwID0ge1xuICAgICAgICAgIHByb2dyYW06IEBjbWRcbiAgICAgICAgICBsaW5rOiBAaW5zdGFsbGF0aW9uIG9yIEBob21lcGFnZVxuICAgICAgICAgIHBhdGhPcHRpb246IFwiRXhlY3V0YWJsZSAtICN7QG5hbWUgb3IgQGNtZH0gLSBQYXRoXCJcbiAgICAgICAgfVxuICAgICAgICBQcm9taXNlLnJlamVjdChAY29tbWFuZE5vdEZvdW5kRXJyb3IoQG5hbWUgb3IgQGNtZCwgaGVscCkpXG4gICAgICApXG5cbiAgaXNTdXBwb3J0ZWQ6ICgpIC0+XG4gICAgQGlzVmVyc2lvbihAdmVyc2lvbnNTdXBwb3J0ZWQpXG5cbiAgaXNWZXJzaW9uOiAocmFuZ2UpIC0+XG4gICAgQHZlcnNpb25TYXRpc2ZpZXMoQHZlcnNpb24sIHJhbmdlKVxuXG4gIHZlcnNpb25TYXRpc2ZpZXM6ICh2ZXJzaW9uLCByYW5nZSkgLT5cbiAgICBzZW12ZXIuc2F0aXNmaWVzKHZlcnNpb24sIHJhbmdlKVxuXG4gIGdldENvbmZpZzogKCkgLT5cbiAgICBhdG9tPy5jb25maWcuZ2V0KFwiI3twYXJlbnRDb25maWdLZXl9LiN7QGtleX1cIikgb3Ige31cblxuICAjIyNcbiAgUnVuIGNvbW1hbmQtbGluZSBpbnRlcmZhY2UgY29tbWFuZFxuICAjIyNcbiAgcnVuOiAoYXJncywgb3B0aW9ucyA9IHt9KSAtPlxuICAgIEBkZWJ1ZyhcIlJ1bjogXCIsIEBjbWQsIGFyZ3MsIG9wdGlvbnMpXG4gICAgeyBjbWQsIGN3ZCwgaWdub3JlUmV0dXJuQ29kZSwgaGVscCwgb25TdGRpbiwgcmV0dXJuU3RkZXJyLCByZXR1cm5TdGRvdXRPclN0ZGVyciB9ID0gb3B0aW9uc1xuICAgIGV4ZU5hbWUgPSBjbWQgb3IgQGNtZFxuICAgIGN3ZCA/PSBvcy50bXBEaXIoKVxuXG4gICAgIyBSZXNvbHZlIGV4ZWN1dGFibGUgYW5kIGFsbCBhcmdzXG4gICAgUHJvbWlzZS5hbGwoW0BzaGVsbEVudigpLCB0aGlzLnJlc29sdmVBcmdzKGFyZ3MpXSlcbiAgICAgIC50aGVuKChbZW52LCBhcmdzXSkgPT5cbiAgICAgICAgQGRlYnVnKCdleGVOYW1lLCBhcmdzOicsIGV4ZU5hbWUsIGFyZ3MpXG4gICAgICAgICMgR2V0IFBBVEggYW5kIG90aGVyIGVudmlyb25tZW50IHZhcmlhYmxlc1xuICAgICAgICBleGVQYXRoID0gQHBhdGgoZXhlTmFtZSlcbiAgICAgICAgUHJvbWlzZS5hbGwoW2V4ZU5hbWUsIGFyZ3MsIGVudiwgZXhlUGF0aF0pXG4gICAgICApXG4gICAgICAudGhlbigoW2V4ZU5hbWUsIGFyZ3MsIGVudiwgZXhlUGF0aF0pID0+XG4gICAgICAgIEBkZWJ1ZygnZXhlUGF0aDonLCBleGVQYXRoKVxuICAgICAgICBAZGVidWcoJ2VudjonLCBlbnYpXG4gICAgICAgIEBkZWJ1ZygnUEFUSDonLCBlbnYuUEFUSClcbiAgICAgICAgQGRlYnVnKCdhcmdzJywgYXJncylcbiAgICAgICAgYXJncyA9IHRoaXMucmVsYXRpdml6ZVBhdGhzKGFyZ3MpXG4gICAgICAgIEBkZWJ1ZygncmVsYXRpdml6ZWQgYXJncycsIGFyZ3MpXG5cbiAgICAgICAgZXhlID0gZXhlUGF0aCA/IGV4ZU5hbWVcbiAgICAgICAgc3Bhd25PcHRpb25zID0ge1xuICAgICAgICAgIGN3ZDogY3dkXG4gICAgICAgICAgZW52OiBlbnZcbiAgICAgICAgfVxuICAgICAgICBAZGVidWcoJ3NwYXduT3B0aW9ucycsIHNwYXduT3B0aW9ucylcblxuICAgICAgICBAc3Bhd24oZXhlLCBhcmdzLCBzcGF3bk9wdGlvbnMsIG9uU3RkaW4pXG4gICAgICAgICAgLnRoZW4oKHtyZXR1cm5Db2RlLCBzdGRvdXQsIHN0ZGVycn0pID0+XG4gICAgICAgICAgICBAdmVyYm9zZSgnc3Bhd24gcmVzdWx0LCByZXR1cm5Db2RlJywgcmV0dXJuQ29kZSlcbiAgICAgICAgICAgIEB2ZXJib3NlKCdzcGF3biByZXN1bHQsIHN0ZG91dCcsIHN0ZG91dClcbiAgICAgICAgICAgIEB2ZXJib3NlKCdzcGF3biByZXN1bHQsIHN0ZGVycicsIHN0ZGVycilcblxuICAgICAgICAgICAgIyBJZiByZXR1cm4gY29kZSBpcyBub3QgMCB0aGVuIGVycm9yIG9jY3VyZWRcbiAgICAgICAgICAgIGlmIG5vdCBpZ25vcmVSZXR1cm5Db2RlIGFuZCByZXR1cm5Db2RlIGlzbnQgMFxuICAgICAgICAgICAgICAjIG9wZXJhYmxlIHByb2dyYW0gb3IgYmF0Y2ggZmlsZVxuICAgICAgICAgICAgICB3aW5kb3dzUHJvZ3JhbU5vdEZvdW5kTXNnID0gXCJpcyBub3QgcmVjb2duaXplZCBhcyBhbiBpbnRlcm5hbCBvciBleHRlcm5hbCBjb21tYW5kXCJcblxuICAgICAgICAgICAgICBAdmVyYm9zZShzdGRlcnIsIHdpbmRvd3NQcm9ncmFtTm90Rm91bmRNc2cpXG5cbiAgICAgICAgICAgICAgaWYgQGlzV2luZG93cygpIGFuZCByZXR1cm5Db2RlIGlzIDEgYW5kIHN0ZGVyci5pbmRleE9mKHdpbmRvd3NQcm9ncmFtTm90Rm91bmRNc2cpIGlzbnQgLTFcbiAgICAgICAgICAgICAgICB0aHJvdyBAY29tbWFuZE5vdEZvdW5kRXJyb3IoZXhlTmFtZSwgaGVscClcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihzdGRlcnIgb3Igc3Rkb3V0KVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBpZiByZXR1cm5TdGRvdXRPclN0ZGVyclxuICAgICAgICAgICAgICAgIHJldHVybiBzdGRvdXQgb3Igc3RkZXJyXG4gICAgICAgICAgICAgIGVsc2UgaWYgcmV0dXJuU3RkZXJyXG4gICAgICAgICAgICAgICAgc3RkZXJyXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzdGRvdXRcbiAgICAgICAgICApXG4gICAgICAgICAgLmNhdGNoKChlcnIpID0+XG4gICAgICAgICAgICBAZGVidWcoJ2Vycm9yJywgZXJyKVxuXG4gICAgICAgICAgICAjIENoZWNrIGlmIGVycm9yIGlzIEVOT0VOVCAoY29tbWFuZCBjb3VsZCBub3QgYmUgZm91bmQpXG4gICAgICAgICAgICBpZiBlcnIuY29kZSBpcyAnRU5PRU5UJyBvciBlcnIuZXJybm8gaXMgJ0VOT0VOVCdcbiAgICAgICAgICAgICAgdGhyb3cgQGNvbW1hbmROb3RGb3VuZEVycm9yKGV4ZU5hbWUsIGhlbHApXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICMgY29udGludWUgYXMgbm9ybWFsIGVycm9yXG4gICAgICAgICAgICAgIHRocm93IGVyclxuICAgICAgICAgIClcbiAgICAgIClcblxuICBwYXRoOiAoY21kID0gQGNtZCkgLT5cbiAgICBjb25maWcgPSBAZ2V0Q29uZmlnKClcbiAgICBpZiBjb25maWcgYW5kIGNvbmZpZy5wYXRoXG4gICAgICBQcm9taXNlLnJlc29sdmUoY29uZmlnLnBhdGgpXG4gICAgZWxzZVxuICAgICAgZXhlTmFtZSA9IGNtZFxuICAgICAgQHdoaWNoKGV4ZU5hbWUpXG5cbiAgcmVzb2x2ZUFyZ3M6IChhcmdzKSAtPlxuICAgIGFyZ3MgPSBfLmZsYXR0ZW4oYXJncylcbiAgICBQcm9taXNlLmFsbChhcmdzKVxuXG4gIHJlbGF0aXZpemVQYXRoczogKGFyZ3MpIC0+XG4gICAgdG1wRGlyID0gb3MudG1wRGlyKClcbiAgICBuZXdBcmdzID0gYXJncy5tYXAoKGFyZykgLT5cbiAgICAgIGlzVG1wRmlsZSA9ICh0eXBlb2YgYXJnIGlzICdzdHJpbmcnIGFuZCBub3QgYXJnLmluY2x1ZGVzKCc6JykgYW5kIFxcXG4gICAgICAgIHBhdGguaXNBYnNvbHV0ZShhcmcpIGFuZCBwYXRoLmRpcm5hbWUoYXJnKS5zdGFydHNXaXRoKHRtcERpcikpXG4gICAgICBpZiBpc1RtcEZpbGVcbiAgICAgICAgcmV0dXJuIHBhdGgucmVsYXRpdmUodG1wRGlyLCBhcmcpXG4gICAgICByZXR1cm4gYXJnXG4gICAgKVxuICAgIG5ld0FyZ3NcblxuICAjIyNcbiAgU3Bhd25cbiAgIyMjXG4gIHNwYXduOiAoZXhlLCBhcmdzLCBvcHRpb25zLCBvblN0ZGluKSAtPlxuICAgICMgUmVtb3ZlIHVuZGVmaW5lZC9udWxsIHZhbHVlc1xuICAgIGFyZ3MgPSBfLndpdGhvdXQoYXJncywgdW5kZWZpbmVkKVxuICAgIGFyZ3MgPSBfLndpdGhvdXQoYXJncywgbnVsbClcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgQGRlYnVnKCdzcGF3bicsIGV4ZSwgYXJncylcblxuICAgICAgY21kID0gc3Bhd24oZXhlLCBhcmdzLCBvcHRpb25zKVxuICAgICAgc3Rkb3V0ID0gXCJcIlxuICAgICAgc3RkZXJyID0gXCJcIlxuXG4gICAgICBjbWQuc3Rkb3V0Lm9uKCdkYXRhJywgKGRhdGEpIC0+XG4gICAgICAgIHN0ZG91dCArPSBkYXRhXG4gICAgICApXG4gICAgICBjbWQuc3RkZXJyLm9uKCdkYXRhJywgKGRhdGEpIC0+XG4gICAgICAgIHN0ZGVyciArPSBkYXRhXG4gICAgICApXG4gICAgICBjbWQub24oJ2Nsb3NlJywgKHJldHVybkNvZGUpID0+XG4gICAgICAgIEBkZWJ1Zygnc3Bhd24gZG9uZScsIHJldHVybkNvZGUsIHN0ZGVyciwgc3Rkb3V0KVxuICAgICAgICByZXNvbHZlKHtyZXR1cm5Db2RlLCBzdGRvdXQsIHN0ZGVycn0pXG4gICAgICApXG4gICAgICBjbWQub24oJ2Vycm9yJywgKGVycikgPT5cbiAgICAgICAgQGRlYnVnKCdlcnJvcicsIGVycilcbiAgICAgICAgcmVqZWN0KGVycilcbiAgICAgIClcblxuICAgICAgb25TdGRpbiBjbWQuc3RkaW4gaWYgb25TdGRpblxuICAgIClcblxuXG4gICMjI1xuICBBZGQgaGVscCB0byBlcnJvci5kZXNjcmlwdGlvblxuXG4gIE5vdGU6IGVycm9yLmRlc2NyaXB0aW9uIGlzIG5vdCBvZmZpY2lhbGx5IHVzZWQgaW4gSmF2YVNjcmlwdCxcbiAgaG93ZXZlciBpdCBpcyB1c2VkIGludGVybmFsbHkgZm9yIEF0b20gQmVhdXRpZnkgd2hlbiBkaXNwbGF5aW5nIGVycm9ycy5cbiAgIyMjXG4gIGNvbW1hbmROb3RGb3VuZEVycm9yOiAoZXhlLCBoZWxwKSAtPlxuICAgIGV4ZSA/PSBAbmFtZSBvciBAY21kXG4gICAgQGNvbnN0cnVjdG9yLmNvbW1hbmROb3RGb3VuZEVycm9yKGV4ZSwgaGVscClcblxuICBAY29tbWFuZE5vdEZvdW5kRXJyb3I6IChleGUsIGhlbHApIC0+XG4gICAgIyBDcmVhdGUgbmV3IGltcHJvdmVkIGVycm9yXG4gICAgIyBub3RpZnkgdXNlciB0aGF0IGl0IG1heSBub3QgYmVcbiAgICAjIGluc3RhbGxlZCBvciBpbiBwYXRoXG4gICAgbWVzc2FnZSA9IFwiQ291bGQgbm90IGZpbmQgJyN7ZXhlfScuIFxcXG4gICAgICAgICAgICBUaGUgcHJvZ3JhbSBtYXkgbm90IGJlIGluc3RhbGxlZC5cIlxuICAgIGVyID0gbmV3IEVycm9yKG1lc3NhZ2UpXG4gICAgZXIuY29kZSA9ICdDb21tYW5kTm90Rm91bmQnXG4gICAgZXIuZXJybm8gPSBlci5jb2RlXG4gICAgZXIuc3lzY2FsbCA9ICdiZWF1dGlmaWVyOjpydW4nXG4gICAgZXIuZmlsZSA9IGV4ZVxuICAgIGlmIGhlbHA/XG4gICAgICBpZiB0eXBlb2YgaGVscCBpcyBcIm9iamVjdFwiXG4gICAgICAgICMgQmFzaWMgbm90aWNlXG4gICAgICAgIGhlbHBTdHIgPSBcIlNlZSAje2hlbHAubGlua30gZm9yIHByb2dyYW0gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YWxsYXRpb24gaW5zdHJ1Y3Rpb25zLlxcblwiXG4gICAgICAgICMgSGVscCB0byBjb25maWd1cmUgQXRvbSBCZWF1dGlmeSBmb3IgcHJvZ3JhbSdzIHBhdGhcbiAgICAgICAgaGVscFN0ciArPSBcIllvdSBjYW4gY29uZmlndXJlIEF0b20gQmVhdXRpZnkgXFxcbiAgICAgICAgICAgICAgICAgICAgd2l0aCB0aGUgYWJzb2x1dGUgcGF0aCBcXFxuICAgICAgICAgICAgICAgICAgICB0byAnI3toZWxwLnByb2dyYW0gb3IgZXhlfScgYnkgc2V0dGluZyBcXFxuICAgICAgICAgICAgICAgICAgICAnI3toZWxwLnBhdGhPcHRpb259JyBpbiBcXFxuICAgICAgICAgICAgICAgICAgICB0aGUgQXRvbSBCZWF1dGlmeSBwYWNrYWdlIHNldHRpbmdzLlxcblwiIGlmIGhlbHAucGF0aE9wdGlvblxuICAgICAgICAjIE9wdGlvbmFsLCBhZGRpdGlvbmFsIGhlbHBcbiAgICAgICAgaGVscFN0ciArPSBoZWxwLmFkZGl0aW9uYWwgaWYgaGVscC5hZGRpdGlvbmFsXG4gICAgICAgICMgQ29tbW9uIEhlbHBcbiAgICAgICAgaXNzdWVTZWFyY2hMaW5rID1cbiAgICAgICAgICBcImh0dHBzOi8vZ2l0aHViLmNvbS9HbGF2aW4wMDEvYXRvbS1iZWF1dGlmeS9cXFxuICAgICAgICAgICAgICAgICAgc2VhcmNoP3E9I3tleGV9JnR5cGU9SXNzdWVzXCJcbiAgICAgICAgZG9jc0xpbmsgPSBcImh0dHBzOi8vZ2l0aHViLmNvbS9HbGF2aW4wMDEvXFxcbiAgICAgICAgICAgICAgICAgIGF0b20tYmVhdXRpZnkvdHJlZS9tYXN0ZXIvZG9jc1wiXG4gICAgICAgIGhlbHBTdHIgKz0gXCJZb3VyIHByb2dyYW0gaXMgcHJvcGVybHkgaW5zdGFsbGVkIGlmIHJ1bm5pbmcgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnI3tpZiBAaXNXaW5kb3dzKCkgdGhlbiAnd2hlcmUuZXhlJyBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgJ3doaWNoJ30gI3tleGV9JyBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluIHlvdXIgI3tpZiBAaXNXaW5kb3dzKCkgdGhlbiAnQ01EIHByb21wdCcgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlICdUZXJtaW5hbCd9IFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJucyBhbiBhYnNvbHV0ZSBwYXRoIHRvIHRoZSBleGVjdXRhYmxlLiBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIElmIHRoaXMgZG9lcyBub3Qgd29yayB0aGVuIHlvdSBoYXZlIG5vdCBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbGxlZCB0aGUgcHJvZ3JhbSBjb3JyZWN0bHkgYW5kIHNvIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQXRvbSBCZWF1dGlmeSB3aWxsIG5vdCBmaW5kIHRoZSBwcm9ncmFtLiBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEF0b20gQmVhdXRpZnkgcmVxdWlyZXMgdGhhdCB0aGUgcHJvZ3JhbSBiZSBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kIGluIHlvdXIgUEFUSCBlbnZpcm9ubWVudCB2YXJpYWJsZS4gXFxuXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBOb3RlIHRoYXQgdGhpcyBpcyBub3QgYW4gQXRvbSBCZWF1dGlmeSBpc3N1ZSBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIGJlYXV0aWZpY2F0aW9uIGRvZXMgbm90IHdvcmsgYW5kIHRoZSBhYm92ZSBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1hbmQgYWxzbyBkb2VzIG5vdCB3b3JrOiB0aGlzIGlzIGV4cGVjdGVkIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmVoYXZpb3VyLCBzaW5jZSB5b3UgaGF2ZSBub3QgcHJvcGVybHkgaW5zdGFsbGVkIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeW91ciBwcm9ncmFtLiBQbGVhc2UgcHJvcGVybHkgc2V0dXAgdGhlIHByb2dyYW0gXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmQgc2VhcmNoIHRocm91Z2ggZXhpc3RpbmcgQXRvbSBCZWF1dGlmeSBpc3N1ZXMgXFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZWZvcmUgY3JlYXRpbmcgYSBuZXcgaXNzdWUuIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgU2VlICN7aXNzdWVTZWFyY2hMaW5rfSBmb3IgcmVsYXRlZCBJc3N1ZXMgYW5kIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgI3tkb2NzTGlua30gZm9yIGRvY3VtZW50YXRpb24uIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgSWYgeW91IGFyZSBzdGlsbCB1bmFibGUgdG8gcmVzb2x2ZSB0aGlzIGlzc3VlIG9uIFxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeW91ciBvd24gdGhlbiBwbGVhc2UgY3JlYXRlIGEgbmV3IGlzc3VlIGFuZCBcXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzayBmb3IgaGVscC5cXG5cIlxuICAgICAgICBlci5kZXNjcmlwdGlvbiA9IGhlbHBTdHJcbiAgICAgIGVsc2UgI2lmIHR5cGVvZiBoZWxwIGlzIFwic3RyaW5nXCJcbiAgICAgICAgZXIuZGVzY3JpcHRpb24gPSBoZWxwXG4gICAgcmV0dXJuIGVyXG5cblxuICBAX2VudkNhY2hlID0gbnVsbFxuICBzaGVsbEVudjogKCkgLT5cbiAgICBAY29uc3RydWN0b3Iuc2hlbGxFbnYoKVxuICBAc2hlbGxFbnY6ICgpIC0+XG4gICAgaWYgQF9lbnZDYWNoZVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShAX2VudkNhY2hlKVxuICAgIGVsc2VcbiAgICAgIHNoZWxsRW52KClcbiAgICAgICAgLnRoZW4oKGVudikgPT5cbiAgICAgICAgICBAX2VudkNhY2hlID0gZW52XG4gICAgICAgIClcblxuICAjIyNcbiAgTGlrZSB0aGUgdW5peCB3aGljaCB1dGlsaXR5LlxuXG4gIEZpbmRzIHRoZSBmaXJzdCBpbnN0YW5jZSBvZiBhIHNwZWNpZmllZCBleGVjdXRhYmxlIGluIHRoZSBQQVRIIGVudmlyb25tZW50IHZhcmlhYmxlLlxuICBEb2VzIG5vdCBjYWNoZSB0aGUgcmVzdWx0cyxcbiAgc28gaGFzaCAtciBpcyBub3QgbmVlZGVkIHdoZW4gdGhlIFBBVEggY2hhbmdlcy5cbiAgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9pc2FhY3Mvbm9kZS13aGljaFxuICAjIyNcbiAgd2hpY2g6IChleGUsIG9wdGlvbnMpIC0+XG4gICAgQC5jb25zdHJ1Y3Rvci53aGljaChleGUsIG9wdGlvbnMpXG4gIEBfd2hpY2hDYWNoZSA9IHt9XG4gIEB3aGljaDogKGV4ZSwgb3B0aW9ucyA9IHt9KSAtPlxuICAgIGlmIEBfd2hpY2hDYWNoZVtleGVdXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKEBfd2hpY2hDYWNoZVtleGVdKVxuICAgICMgR2V0IFBBVEggYW5kIG90aGVyIGVudmlyb25tZW50IHZhcmlhYmxlc1xuICAgIEBzaGVsbEVudigpXG4gICAgICAudGhlbigoZW52KSA9PlxuICAgICAgICBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgICAgIG9wdGlvbnMucGF0aCA/PSBlbnYuUEFUSFxuICAgICAgICAgIGlmIEBpc1dpbmRvd3MoKVxuICAgICAgICAgICAgIyBFbnZpcm9ubWVudCB2YXJpYWJsZXMgYXJlIGNhc2UtaW5zZW5zaXRpdmUgaW4gd2luZG93c1xuICAgICAgICAgICAgIyBDaGVjayBlbnYgZm9yIGEgY2FzZS1pbnNlbnNpdGl2ZSAncGF0aCcgdmFyaWFibGVcbiAgICAgICAgICAgIGlmICFvcHRpb25zLnBhdGhcbiAgICAgICAgICAgICAgZm9yIGkgb2YgZW52XG4gICAgICAgICAgICAgICAgaWYgaS50b0xvd2VyQ2FzZSgpIGlzIFwicGF0aFwiXG4gICAgICAgICAgICAgICAgICBvcHRpb25zLnBhdGggPSBlbnZbaV1cbiAgICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgICMgVHJpY2sgbm9kZS13aGljaCBpbnRvIGluY2x1ZGluZyBmaWxlc1xuICAgICAgICAgICAgIyB3aXRoIG5vIGV4dGVuc2lvbiBhcyBleGVjdXRhYmxlcy5cbiAgICAgICAgICAgICMgUHV0IGVtcHR5IGV4dGVuc2lvbiBsYXN0IHRvIGFsbG93IGZvciBvdGhlciByZWFsIGV4dGVuc2lvbnMgZmlyc3RcbiAgICAgICAgICAgIG9wdGlvbnMucGF0aEV4dCA/PSBcIiN7cHJvY2Vzcy5lbnYuUEFUSEVYVCA/ICcuRVhFJ307XCJcbiAgICAgICAgICB3aGljaChleGUsIG9wdGlvbnMsIChlcnIsIHBhdGgpID0+XG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShleGUpIGlmIGVyclxuICAgICAgICAgICAgQF93aGljaENhY2hlW2V4ZV0gPSBwYXRoXG4gICAgICAgICAgICByZXNvbHZlKHBhdGgpXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApXG5cbiAgIyMjXG4gIElmIHBsYXRmb3JtIGlzIFdpbmRvd3NcbiAgIyMjXG4gIGlzV2luZG93czogKCkgLT4gQGNvbnN0cnVjdG9yLmlzV2luZG93cygpXG4gIEBpc1dpbmRvd3M6ICgpIC0+IG5ldyBSZWdFeHAoJ153aW4nKS50ZXN0KHByb2Nlc3MucGxhdGZvcm0pXG5cbmNsYXNzIEh5YnJpZEV4ZWN1dGFibGUgZXh0ZW5kcyBFeGVjdXRhYmxlXG5cbiAgZG9ja2VyT3B0aW9uczoge1xuICAgIGltYWdlOiB1bmRlZmluZWRcbiAgICB3b3JraW5nRGlyOiBcIi93b3JrZGlyXCJcbiAgfVxuXG4gIGNvbnN0cnVjdG9yOiAob3B0aW9ucykgLT5cbiAgICBzdXBlcihvcHRpb25zKVxuICAgIGlmIG9wdGlvbnMuZG9ja2VyP1xuICAgICAgQGRvY2tlck9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBAZG9ja2VyT3B0aW9ucywgb3B0aW9ucy5kb2NrZXIpXG4gICAgICBAZG9ja2VyID0gQGNvbnN0cnVjdG9yLmRvY2tlckV4ZWN1dGFibGUoKVxuXG4gIEBkb2NrZXI6IHVuZGVmaW5lZFxuICBAZG9ja2VyRXhlY3V0YWJsZTogKCkgLT5cbiAgICBpZiBub3QgQGRvY2tlcj9cbiAgICAgIEBkb2NrZXIgPSBuZXcgRXhlY3V0YWJsZSh7XG4gICAgICAgIG5hbWU6IFwiRG9ja2VyXCJcbiAgICAgICAgY21kOiBcImRvY2tlclwiXG4gICAgICAgIGhvbWVwYWdlOiBcImh0dHBzOi8vd3d3LmRvY2tlci5jb20vXCJcbiAgICAgICAgaW5zdGFsbGF0aW9uOiBcImh0dHBzOi8vd3d3LmRvY2tlci5jb20vZ2V0LWRvY2tlclwiXG4gICAgICAgIHZlcnNpb246IHtcbiAgICAgICAgICBwYXJzZTogKHRleHQpIC0+IHRleHQubWF0Y2goL3ZlcnNpb24gWzBdKihbMS05XVxcZCopLlswXSooWzEtOV1cXGQqKS5bMF0qKFsxLTldXFxkKikvKS5zbGljZSgxKS5qb2luKCcuJylcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICByZXR1cm4gQGRvY2tlclxuXG4gIGluc3RhbGxlZFdpdGhEb2NrZXI6IGZhbHNlXG4gIGluaXQ6ICgpIC0+XG4gICAgc3VwZXIoKVxuICAgICAgLmNhdGNoKChlcnJvcikgPT5cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKSBpZiBub3QgQGRvY2tlcj9cbiAgICAgICAgQGRvY2tlci5pbml0KClcbiAgICAgICAgICAudGhlbig9PiBAcnVuSW1hZ2UoQHZlcnNpb25BcmdzLCBAdmVyc2lvblJ1bk9wdGlvbnMpKVxuICAgICAgICAgIC50aGVuKCh0ZXh0KSA9PiBAc2F2ZVZlcnNpb24odGV4dCkpXG4gICAgICAgICAgLnRoZW4oKCkgPT4gQGluc3RhbGxlZFdpdGhEb2NrZXIgPSB0cnVlKVxuICAgICAgICAgIC50aGVuKD0+IEApXG4gICAgICAgICAgLmNhdGNoKChkb2NrZXJFcnJvcikgPT5cbiAgICAgICAgICAgIEBkZWJ1Zyhkb2NrZXJFcnJvcilcbiAgICAgICAgICAgIFByb21pc2UucmVqZWN0KGVycm9yKVxuICAgICAgICAgIClcbiAgICAgIClcblxuICBydW46IChhcmdzLCBvcHRpb25zID0ge30pIC0+XG4gICAgaWYgQGluc3RhbGxlZFdpdGhEb2NrZXIgYW5kIEBkb2NrZXIgYW5kIEBkb2NrZXIuaXNJbnN0YWxsZWRcbiAgICAgIHJldHVybiBAcnVuSW1hZ2UoYXJncywgb3B0aW9ucylcbiAgICBzdXBlcihhcmdzLCBvcHRpb25zKVxuXG4gIHJ1bkltYWdlOiAoYXJncywgb3B0aW9ucykgLT5cbiAgICBAZGVidWcoXCJSdW4gRG9ja2VyIGV4ZWN1dGFibGU6IFwiLCBhcmdzLCBvcHRpb25zKVxuICAgIHRoaXMucmVzb2x2ZUFyZ3MoYXJncylcbiAgICAgIC50aGVuKChhcmdzKSA9PlxuICAgICAgICB7IGN3ZCB9ID0gb3B0aW9uc1xuICAgICAgICB0bXBEaXIgPSBvcy50bXBEaXIoKVxuICAgICAgICBwd2QgPSBmcy5yZWFscGF0aFN5bmMoY3dkIG9yIHRtcERpcilcbiAgICAgICAgaW1hZ2UgPSBAZG9ja2VyT3B0aW9ucy5pbWFnZVxuICAgICAgICB3b3JraW5nRGlyID0gQGRvY2tlck9wdGlvbnMud29ya2luZ0RpclxuXG4gICAgICAgIHJvb3RQYXRoID0gJy9tb3VudGVkUm9vdCdcbiAgICAgICAgbmV3QXJncyA9IGFyZ3MubWFwKChhcmcpIC0+XG4gICAgICAgICAgaWYgKHR5cGVvZiBhcmcgaXMgJ3N0cmluZycgYW5kIG5vdCBhcmcuaW5jbHVkZXMoJzonKSBcXFxuICAgICAgICAgICAgYW5kIHBhdGguaXNBYnNvbHV0ZShhcmcpIGFuZCBub3QgcGF0aC5kaXJuYW1lKGFyZykuc3RhcnRzV2l0aCh0bXBEaXIpKVxuICAgICAgICAgICAgdGhlbiBwYXRoLmpvaW4ocm9vdFBhdGgsIGFyZykgZWxzZSBhcmdcbiAgICAgICAgKVxuXG4gICAgICAgIEBkb2NrZXIucnVuKFtcbiAgICAgICAgICAgIFwicnVuXCIsXG4gICAgICAgICAgICBcIi0tdm9sdW1lXCIsIFwiI3twd2R9OiN7d29ya2luZ0Rpcn1cIixcbiAgICAgICAgICAgIFwiLS12b2x1bWVcIiwgXCIje3BhdGgucmVzb2x2ZSgnLycpfToje3Jvb3RQYXRofVwiLFxuICAgICAgICAgICAgXCItLXdvcmtkaXJcIiwgd29ya2luZ0RpcixcbiAgICAgICAgICAgIGltYWdlLFxuICAgICAgICAgICAgbmV3QXJnc1xuICAgICAgICAgIF0sXG4gICAgICAgICAgb3B0aW9uc1xuICAgICAgICApXG4gICAgICApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBIeWJyaWRFeGVjdXRhYmxlXG4iXX0=
