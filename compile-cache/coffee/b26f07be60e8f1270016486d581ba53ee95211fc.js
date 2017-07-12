(function() {
  var Beautifier, Executable, Promise, _, fs, path, readFile, shellEnv, temp, which;

  Promise = require('bluebird');

  _ = require('lodash');

  fs = require('fs');

  temp = require('temp').track();

  readFile = Promise.promisify(fs.readFile);

  which = require('which');

  path = require('path');

  shellEnv = require('shell-env');

  Executable = require('./executable');

  module.exports = Beautifier = (function() {

    /*
    Promise
     */
    Beautifier.prototype.Promise = Promise;


    /*
    Name of Beautifier
     */

    Beautifier.prototype.name = 'Beautifier';


    /*
    Supported Options
    
    Enable options for supported languages.
    - <string:language>:<boolean:all_options_enabled>
    - <string:language>:<string:option_key>:<boolean:enabled>
    - <string:language>:<string:option_key>:<string:rename>
    - <string:language>:<string:option_key>:<function:transform>
    - <string:language>:<string:option_key>:<array:mapper>
     */

    Beautifier.prototype.options = {};

    Beautifier.prototype.executables = [];


    /*
    Is the beautifier a command-line interface beautifier?
     */

    Beautifier.prototype.isPreInstalled = function() {
      return this.executables.length === 0;
    };

    Beautifier.prototype._exe = {};

    Beautifier.prototype.loadExecutables = function() {
      var executables;
      this.debug("Load executables");
      if (Object.keys(this._exe).length === this.executables.length) {
        return Promise.resolve(this._exe);
      } else {
        return Promise.resolve(executables = this.executables.map(function(e) {
          return new Executable(e);
        })).then(function(executables) {
          return Promise.all(executables.map(function(exe) {
            return exe.init();
          }));
        }).then((function(_this) {
          return function(es) {
            var exe, missingInstalls;
            _this.debug("Executables loaded", es);
            exe = {};
            missingInstalls = [];
            es.forEach(function(e) {
              exe[e.cmd] = e;
              if (!e.isInstalled && e.required) {
                return missingInstalls.push(e);
              }
            });
            _this._exe = exe;
            _this.debug("exe", exe);
            if (missingInstalls.length === 0) {
              return _this._exe;
            } else {
              _this.debug("Missing required executables: " + (missingInstalls.map(function(e) {
                return e.cmd;
              }).join(' and ')) + ".");
              throw Executable.commandNotFoundError(missingInstalls[0].cmd);
            }
          };
        })(this))["catch"]((function(_this) {
          return function(error) {
            _this.debug("Error loading executables", error);
            return Promise.reject(error);
          };
        })(this));
      }
    };

    Beautifier.prototype.exe = function(cmd) {
      var e;
      console.log('exe', cmd, this._exe);
      e = this._exe[cmd];
      if (e == null) {
        throw Executable.commandNotFoundError(cmd);
      }
      return e;
    };


    /*
    Supported languages by this Beautifier
    
    Extracted from the keys of the `options` field.
     */

    Beautifier.prototype.languages = null;


    /*
    Beautify text
    
    Override this method in subclasses
     */

    Beautifier.prototype.beautify = null;


    /*
    Show deprecation warning to user.
     */

    Beautifier.prototype.deprecate = function(warning) {
      var ref;
      return (ref = atom.notifications) != null ? ref.addWarning(warning) : void 0;
    };


    /*
    Create temporary file
     */

    Beautifier.prototype.tempFile = function(name, contents, ext) {
      if (name == null) {
        name = "atom-beautify-temp";
      }
      if (contents == null) {
        contents = "";
      }
      if (ext == null) {
        ext = "";
      }
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return temp.open({
            prefix: name,
            suffix: ext
          }, function(err, info) {
            _this.debug('tempFile', name, err, info);
            if (err) {
              return reject(err);
            }
            return fs.write(info.fd, contents, function(err) {
              if (err) {
                return reject(err);
              }
              return fs.close(info.fd, function(err) {
                if (err) {
                  return reject(err);
                }
                return resolve(info.path);
              });
            });
          });
        };
      })(this));
    };


    /*
    Read file
     */

    Beautifier.prototype.readFile = function(filePath) {
      return Promise.resolve(filePath).then(function(filePath) {
        return readFile(filePath, "utf8");
      });
    };


    /*
    Find file
     */

    Beautifier.prototype.findFile = function(startDir, fileNames) {
      var currentDir, fileName, filePath, i, len;
      if (!arguments.length) {
        throw new Error("Specify file names to find.");
      }
      if (!(fileNames instanceof Array)) {
        fileNames = [fileNames];
      }
      startDir = startDir.split(path.sep);
      while (startDir.length) {
        currentDir = startDir.join(path.sep);
        for (i = 0, len = fileNames.length; i < len; i++) {
          fileName = fileNames[i];
          filePath = path.join(currentDir, fileName);
          try {
            fs.accessSync(filePath, fs.R_OK);
            return filePath;
          } catch (error1) {}
        }
        startDir.pop();
      }
      return null;
    };

    Beautifier.prototype.getDefaultLineEnding = function(crlf, lf, optionEol) {
      if (!optionEol || optionEol === 'System Default') {
        optionEol = atom.config.get('line-ending-selector.defaultLineEnding');
      }
      switch (optionEol) {
        case 'LF':
          return lf;
        case 'CRLF':
          return crlf;
        case 'OS Default':
          if (process.platform === 'win32') {
            return crlf;
          } else {
            return lf;
          }
        default:
          return lf;
      }
    };


    /*
    Like the unix which utility.
    
    Finds the first instance of a specified executable in the PATH environment variable.
    Does not cache the results,
    so hash -r is not needed when the PATH changes.
    See https://github.com/isaacs/node-which
     */

    Beautifier.prototype.which = function(exe, options) {
      if (options == null) {
        options = {};
      }
      return Executable.which(exe, options);
    };


    /*
    Run command-line interface command
     */

    Beautifier.prototype.run = function(executable, args, arg) {
      var cwd, exe, help, ignoreReturnCode, onStdin, ref;
      ref = arg != null ? arg : {}, cwd = ref.cwd, ignoreReturnCode = ref.ignoreReturnCode, help = ref.help, onStdin = ref.onStdin;
      exe = new Executable({
        name: this.name,
        homepage: this.link,
        installation: this.link,
        cmd: executable
      });
      return exe.run(args, {
        cwd: cwd,
        ignoreReturnCode: ignoreReturnCode,
        help: help,
        onStdin: onStdin
      });
    };


    /*
    Logger instance
     */

    Beautifier.prototype.logger = null;


    /*
    Initialize and configure Logger
     */

    Beautifier.prototype.setupLogger = function() {
      var key, method, ref;
      this.logger = require('../logger')(__filename);
      ref = this.logger;
      for (key in ref) {
        method = ref[key];
        this[key] = method;
      }
      return this.verbose(this.name + " beautifier logger has been initialized.");
    };


    /*
    Constructor to setup beautifer
     */

    function Beautifier() {
      var globalOptions, lang, options, ref;
      this.setupLogger();
      if (this.options._ != null) {
        globalOptions = this.options._;
        delete this.options._;
        if (typeof globalOptions === "object") {
          ref = this.options;
          for (lang in ref) {
            options = ref[lang];
            if (typeof options === "boolean") {
              if (options === true) {
                this.options[lang] = globalOptions;
              }
            } else if (typeof options === "object") {
              this.options[lang] = _.merge(globalOptions, options);
            } else {
              this.warn(("Unsupported options type " + (typeof options) + " for language " + lang + ": ") + options);
            }
          }
        }
      }
      this.verbose("Options for " + this.name + ":", this.options);
      this.languages = _.keys(this.options);
    }

    return Beautifier;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2JlYXV0aWZpZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFVBQVI7O0VBQ1YsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztFQUNKLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBZSxDQUFDLEtBQWhCLENBQUE7O0VBQ1AsUUFBQSxHQUFXLE9BQU8sQ0FBQyxTQUFSLENBQWtCLEVBQUUsQ0FBQyxRQUFyQjs7RUFDWCxLQUFBLEdBQVEsT0FBQSxDQUFRLE9BQVI7O0VBQ1IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLFFBQUEsR0FBVyxPQUFBLENBQVEsV0FBUjs7RUFDWCxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7O0FBRXJCOzs7eUJBR0EsT0FBQSxHQUFTOzs7QUFFVDs7Ozt5QkFHQSxJQUFBLEdBQU07OztBQUVOOzs7Ozs7Ozs7Ozt5QkFVQSxPQUFBLEdBQVM7O3lCQUVULFdBQUEsR0FBYTs7O0FBRWI7Ozs7eUJBR0EsY0FBQSxHQUFnQixTQUFBO2FBQ2QsSUFBQyxDQUFBLFdBQVcsQ0FBQyxNQUFiLEtBQXVCO0lBRFQ7O3lCQUdoQixJQUFBLEdBQU07O3lCQUNOLGVBQUEsR0FBaUIsU0FBQTtBQUNmLFVBQUE7TUFBQSxJQUFDLENBQUEsS0FBRCxDQUFPLGtCQUFQO01BQ0EsSUFBRyxNQUFNLENBQUMsSUFBUCxDQUFZLElBQUMsQ0FBQSxJQUFiLENBQWtCLENBQUMsTUFBbkIsS0FBNkIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxNQUE3QztlQUNFLE9BQU8sQ0FBQyxPQUFSLENBQWdCLElB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RSxDQUFBLEdBQXFFLE9BQTNFLEVBSEc7O0FBTFAsV0FGRjtTQUpGOztNQWVBLElBQUMsQ0FBQSxPQUFELENBQVMsY0FBQSxHQUFlLElBQUMsQ0FBQSxJQUFoQixHQUFxQixHQUE5QixFQUFrQyxJQUFDLENBQUEsT0FBbkM7TUFFQSxJQUFDLENBQUEsU0FBRCxHQUFhLENBQUMsQ0FBQyxJQUFGLENBQU8sSUFBQyxDQUFBLE9BQVI7SUFyQkY7Ozs7O0FBbE5mIiwic291cmNlc0NvbnRlbnQiOlsiUHJvbWlzZSA9IHJlcXVpcmUoJ2JsdWViaXJkJylcbl8gPSByZXF1aXJlKCdsb2Rhc2gnKVxuZnMgPSByZXF1aXJlKCdmcycpXG50ZW1wID0gcmVxdWlyZSgndGVtcCcpLnRyYWNrKClcbnJlYWRGaWxlID0gUHJvbWlzZS5wcm9taXNpZnkoZnMucmVhZEZpbGUpXG53aGljaCA9IHJlcXVpcmUoJ3doaWNoJylcbnBhdGggPSByZXF1aXJlKCdwYXRoJylcbnNoZWxsRW52ID0gcmVxdWlyZSgnc2hlbGwtZW52JylcbkV4ZWN1dGFibGUgPSByZXF1aXJlKCcuL2V4ZWN1dGFibGUnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEJlYXV0aWZpZXJcblxuICAjIyNcbiAgUHJvbWlzZVxuICAjIyNcbiAgUHJvbWlzZTogUHJvbWlzZVxuXG4gICMjI1xuICBOYW1lIG9mIEJlYXV0aWZpZXJcbiAgIyMjXG4gIG5hbWU6ICdCZWF1dGlmaWVyJ1xuXG4gICMjI1xuICBTdXBwb3J0ZWQgT3B0aW9uc1xuXG4gIEVuYWJsZSBvcHRpb25zIGZvciBzdXBwb3J0ZWQgbGFuZ3VhZ2VzLlxuICAtIDxzdHJpbmc6bGFuZ3VhZ2U+Ojxib29sZWFuOmFsbF9vcHRpb25zX2VuYWJsZWQ+XG4gIC0gPHN0cmluZzpsYW5ndWFnZT46PHN0cmluZzpvcHRpb25fa2V5Pjo8Ym9vbGVhbjplbmFibGVkPlxuICAtIDxzdHJpbmc6bGFuZ3VhZ2U+OjxzdHJpbmc6b3B0aW9uX2tleT46PHN0cmluZzpyZW5hbWU+XG4gIC0gPHN0cmluZzpsYW5ndWFnZT46PHN0cmluZzpvcHRpb25fa2V5Pjo8ZnVuY3Rpb246dHJhbnNmb3JtPlxuICAtIDxzdHJpbmc6bGFuZ3VhZ2U+OjxzdHJpbmc6b3B0aW9uX2tleT46PGFycmF5Om1hcHBlcj5cbiAgIyMjXG4gIG9wdGlvbnM6IHt9XG5cbiAgZXhlY3V0YWJsZXM6IFtdXG5cbiAgIyMjXG4gIElzIHRoZSBiZWF1dGlmaWVyIGEgY29tbWFuZC1saW5lIGludGVyZmFjZSBiZWF1dGlmaWVyP1xuICAjIyNcbiAgaXNQcmVJbnN0YWxsZWQ6ICgpIC0+XG4gICAgQGV4ZWN1dGFibGVzLmxlbmd0aCBpcyAwXG5cbiAgX2V4ZToge31cbiAgbG9hZEV4ZWN1dGFibGVzOiAoKSAtPlxuICAgIEBkZWJ1ZyhcIkxvYWQgZXhlY3V0YWJsZXNcIilcbiAgICBpZiBPYmplY3Qua2V5cyhAX2V4ZSkubGVuZ3RoIGlzIEBleGVjdXRhYmxlcy5sZW5ndGhcbiAgICAgIFByb21pc2UucmVzb2x2ZShAX2V4ZSlcbiAgICBlbHNlXG4gICAgICBQcm9taXNlLnJlc29sdmUoZXhlY3V0YWJsZXMgPSBAZXhlY3V0YWJsZXMubWFwKChlKSAtPiBuZXcgRXhlY3V0YWJsZShlKSkpXG4gICAgICAgIC50aGVuKChleGVjdXRhYmxlcykgLT4gUHJvbWlzZS5hbGwoZXhlY3V0YWJsZXMubWFwKChleGUpIC0+IGV4ZS5pbml0KCkpKSlcbiAgICAgICAgLnRoZW4oKGVzKSA9PlxuICAgICAgICAgIEBkZWJ1ZyhcIkV4ZWN1dGFibGVzIGxvYWRlZFwiLCBlcylcbiAgICAgICAgICBleGUgPSB7fVxuICAgICAgICAgIG1pc3NpbmdJbnN0YWxscyA9IFtdXG4gICAgICAgICAgZXMuZm9yRWFjaCgoZSkgLT5cbiAgICAgICAgICAgIGV4ZVtlLmNtZF0gPSBlXG4gICAgICAgICAgICBpZiBub3QgZS5pc0luc3RhbGxlZCBhbmQgZS5yZXF1aXJlZFxuICAgICAgICAgICAgICBtaXNzaW5nSW5zdGFsbHMucHVzaChlKVxuICAgICAgICAgIClcbiAgICAgICAgICBAX2V4ZSA9IGV4ZVxuICAgICAgICAgIEBkZWJ1ZyhcImV4ZVwiLCBleGUpXG4gICAgICAgICAgaWYgbWlzc2luZ0luc3RhbGxzLmxlbmd0aCBpcyAwXG4gICAgICAgICAgICByZXR1cm4gQF9leGVcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAZGVidWcoXCJNaXNzaW5nIHJlcXVpcmVkIGV4ZWN1dGFibGVzOiAje21pc3NpbmdJbnN0YWxscy5tYXAoKGUpIC0+IGUuY21kKS5qb2luKCcgYW5kICcpfS5cIilcbiAgICAgICAgICAgIHRocm93IEV4ZWN1dGFibGUuY29tbWFuZE5vdEZvdW5kRXJyb3IobWlzc2luZ0luc3RhbGxzWzBdLmNtZClcbiAgICAgICAgKVxuICAgICAgICAuY2F0Y2goKGVycm9yKSA9PlxuICAgICAgICAgIEBkZWJ1ZyhcIkVycm9yIGxvYWRpbmcgZXhlY3V0YWJsZXNcIiwgZXJyb3IpXG4gICAgICAgICAgUHJvbWlzZS5yZWplY3QoZXJyb3IpXG4gICAgICAgIClcbiAgZXhlOiAoY21kKSAtPlxuICAgIGNvbnNvbGUubG9nKCdleGUnLCBjbWQsIEBfZXhlKVxuICAgIGUgPSBAX2V4ZVtjbWRdXG4gICAgaWYgIWU/XG4gICAgICB0aHJvdyBFeGVjdXRhYmxlLmNvbW1hbmROb3RGb3VuZEVycm9yKGNtZClcbiAgICBlXG5cbiAgIyMjXG4gIFN1cHBvcnRlZCBsYW5ndWFnZXMgYnkgdGhpcyBCZWF1dGlmaWVyXG5cbiAgRXh0cmFjdGVkIGZyb20gdGhlIGtleXMgb2YgdGhlIGBvcHRpb25zYCBmaWVsZC5cbiAgIyMjXG4gIGxhbmd1YWdlczogbnVsbFxuXG4gICMjI1xuICBCZWF1dGlmeSB0ZXh0XG5cbiAgT3ZlcnJpZGUgdGhpcyBtZXRob2QgaW4gc3ViY2xhc3Nlc1xuICAjIyNcbiAgYmVhdXRpZnk6IG51bGxcblxuICAjIyNcbiAgU2hvdyBkZXByZWNhdGlvbiB3YXJuaW5nIHRvIHVzZXIuXG4gICMjI1xuICBkZXByZWNhdGU6ICh3YXJuaW5nKSAtPlxuICAgIGF0b20ubm90aWZpY2F0aW9ucz8uYWRkV2FybmluZyh3YXJuaW5nKVxuXG4gICMjI1xuICBDcmVhdGUgdGVtcG9yYXJ5IGZpbGVcbiAgIyMjXG4gIHRlbXBGaWxlOiAobmFtZSA9IFwiYXRvbS1iZWF1dGlmeS10ZW1wXCIsIGNvbnRlbnRzID0gXCJcIiwgZXh0ID0gXCJcIikgLT5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgICMgY3JlYXRlIHRlbXAgZmlsZVxuICAgICAgdGVtcC5vcGVuKHtwcmVmaXg6IG5hbWUsIHN1ZmZpeDogZXh0fSwgKGVyciwgaW5mbykgPT5cbiAgICAgICAgQGRlYnVnKCd0ZW1wRmlsZScsIG5hbWUsIGVyciwgaW5mbylcbiAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpIGlmIGVyclxuICAgICAgICBmcy53cml0ZShpbmZvLmZkLCBjb250ZW50cywgKGVycikgLT5cbiAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycikgaWYgZXJyXG4gICAgICAgICAgZnMuY2xvc2UoaW5mby5mZCwgKGVycikgLT5cbiAgICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKSBpZiBlcnJcbiAgICAgICAgICAgIHJlc29sdmUoaW5mby5wYXRoKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKVxuICAgIClcblxuICAjIyNcbiAgUmVhZCBmaWxlXG4gICMjI1xuICByZWFkRmlsZTogKGZpbGVQYXRoKSAtPlxuICAgIFByb21pc2UucmVzb2x2ZShmaWxlUGF0aClcbiAgICAudGhlbigoZmlsZVBhdGgpIC0+XG4gICAgICByZXR1cm4gcmVhZEZpbGUoZmlsZVBhdGgsIFwidXRmOFwiKVxuICAgIClcblxuICAjIyNcbiAgRmluZCBmaWxlXG4gICMjI1xuICBmaW5kRmlsZTogKHN0YXJ0RGlyLCBmaWxlTmFtZXMpIC0+XG4gICAgdGhyb3cgbmV3IEVycm9yIFwiU3BlY2lmeSBmaWxlIG5hbWVzIHRvIGZpbmQuXCIgdW5sZXNzIGFyZ3VtZW50cy5sZW5ndGhcbiAgICB1bmxlc3MgZmlsZU5hbWVzIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgIGZpbGVOYW1lcyA9IFtmaWxlTmFtZXNdXG4gICAgc3RhcnREaXIgPSBzdGFydERpci5zcGxpdChwYXRoLnNlcClcbiAgICB3aGlsZSBzdGFydERpci5sZW5ndGhcbiAgICAgIGN1cnJlbnREaXIgPSBzdGFydERpci5qb2luKHBhdGguc2VwKVxuICAgICAgZm9yIGZpbGVOYW1lIGluIGZpbGVOYW1lc1xuICAgICAgICBmaWxlUGF0aCA9IHBhdGguam9pbihjdXJyZW50RGlyLCBmaWxlTmFtZSlcbiAgICAgICAgdHJ5XG4gICAgICAgICAgZnMuYWNjZXNzU3luYyhmaWxlUGF0aCwgZnMuUl9PSylcbiAgICAgICAgICByZXR1cm4gZmlsZVBhdGhcbiAgICAgIHN0YXJ0RGlyLnBvcCgpXG4gICAgcmV0dXJuIG51bGxcblxuICAjIFJldHJpZXZlcyB0aGUgZGVmYXVsdCBsaW5lIGVuZGluZyBiYXNlZCB1cG9uIHRoZSBBdG9tIGNvbmZpZ3VyYXRpb25cbiAgIyAgYGxpbmUtZW5kaW5nLXNlbGVjdG9yLmRlZmF1bHRMaW5lRW5kaW5nYC4gSWYgdGhlIEF0b20gY29uZmlndXJhdGlvblxuICAjICBpbmRpY2F0ZXMgXCJPUyBEZWZhdWx0XCIsIHRoZSBgcHJvY2Vzcy5wbGF0Zm9ybWAgaXMgcXVlcmllZCwgcmV0dXJuaW5nXG4gICMgIENSTEYgZm9yIFdpbmRvd3Mgc3lzdGVtcyBhbmQgTEYgZm9yIGFsbCBvdGhlciBzeXN0ZW1zLlxuICAjIENvZGUgbW9kaWZpZWQgZnJvbSBhdG9tL2xpbmUtZW5kaW5nLXNlbGVjdG9yXG4gICMgcmV0dXJuczogVGhlIGNvcnJlY3QgbGluZS1lbmRpbmcgY2hhcmFjdGVyIHNlcXVlbmNlIGJhc2VkIHVwb24gdGhlIEF0b21cbiAgIyAgY29uZmlndXJhdGlvbiwgb3IgYG51bGxgIGlmIHRoZSBBdG9tIGxpbmUgZW5kaW5nIGNvbmZpZ3VyYXRpb24gd2FzIG5vdFxuICAjICByZWNvZ25pemVkLlxuICAjIHNlZTogaHR0cHM6Ly9naXRodWIuY29tL2F0b20vbGluZS1lbmRpbmctc2VsZWN0b3IvYmxvYi9tYXN0ZXIvbGliL21haW4uanNcbiAgZ2V0RGVmYXVsdExpbmVFbmRpbmc6IChjcmxmLGxmLG9wdGlvbkVvbCkgLT5cbiAgICBpZiAoIW9wdGlvbkVvbCB8fCBvcHRpb25Fb2wgPT0gJ1N5c3RlbSBEZWZhdWx0JylcbiAgICAgIG9wdGlvbkVvbCA9IGF0b20uY29uZmlnLmdldCgnbGluZS1lbmRpbmctc2VsZWN0b3IuZGVmYXVsdExpbmVFbmRpbmcnKVxuICAgIHN3aXRjaCBvcHRpb25Fb2xcbiAgICAgIHdoZW4gJ0xGJ1xuICAgICAgICByZXR1cm4gbGZcbiAgICAgIHdoZW4gJ0NSTEYnXG4gICAgICAgIHJldHVybiBjcmxmXG4gICAgICB3aGVuICdPUyBEZWZhdWx0J1xuICAgICAgICByZXR1cm4gaWYgcHJvY2Vzcy5wbGF0Zm9ybSBpcyAnd2luMzInIHRoZW4gY3JsZiBlbHNlIGxmXG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiBsZlxuXG4gICMjI1xuICBMaWtlIHRoZSB1bml4IHdoaWNoIHV0aWxpdHkuXG5cbiAgRmluZHMgdGhlIGZpcnN0IGluc3RhbmNlIG9mIGEgc3BlY2lmaWVkIGV4ZWN1dGFibGUgaW4gdGhlIFBBVEggZW52aXJvbm1lbnQgdmFyaWFibGUuXG4gIERvZXMgbm90IGNhY2hlIHRoZSByZXN1bHRzLFxuICBzbyBoYXNoIC1yIGlzIG5vdCBuZWVkZWQgd2hlbiB0aGUgUEFUSCBjaGFuZ2VzLlxuICBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2lzYWFjcy9ub2RlLXdoaWNoXG4gICMjI1xuICB3aGljaDogKGV4ZSwgb3B0aW9ucyA9IHt9KSAtPlxuICAgICMgQGRlcHJlY2F0ZShcIkJlYXV0aWZpZXIud2hpY2ggZnVuY3Rpb24gaGFzIGJlZW4gZGVwcmVjYXRlZC4gUGxlYXNlIHVzZSBFeGVjdXRhYmxlcy5cIilcbiAgICBFeGVjdXRhYmxlLndoaWNoKGV4ZSwgb3B0aW9ucylcblxuICAjIyNcbiAgUnVuIGNvbW1hbmQtbGluZSBpbnRlcmZhY2UgY29tbWFuZFxuICAjIyNcbiAgcnVuOiAoZXhlY3V0YWJsZSwgYXJncywge2N3ZCwgaWdub3JlUmV0dXJuQ29kZSwgaGVscCwgb25TdGRpbn0gPSB7fSkgLT5cbiAgICAjIEBkZXByZWNhdGUoXCJCZWF1dGlmaWVyLnJ1biBmdW5jdGlvbiBoYXMgYmVlbiBkZXByZWNhdGVkLiBQbGVhc2UgdXNlIEV4ZWN1dGFibGVzLlwiKVxuICAgIGV4ZSA9IG5ldyBFeGVjdXRhYmxlKHtcbiAgICAgIG5hbWU6IEBuYW1lXG4gICAgICBob21lcGFnZTogQGxpbmtcbiAgICAgIGluc3RhbGxhdGlvbjogQGxpbmtcbiAgICAgIGNtZDogZXhlY3V0YWJsZVxuICAgIH0pXG4gICAgZXhlLnJ1bihhcmdzLCB7Y3dkLCBpZ25vcmVSZXR1cm5Db2RlLCBoZWxwLCBvblN0ZGlufSlcblxuICAjIyNcbiAgTG9nZ2VyIGluc3RhbmNlXG4gICMjI1xuICBsb2dnZXI6IG51bGxcbiAgIyMjXG4gIEluaXRpYWxpemUgYW5kIGNvbmZpZ3VyZSBMb2dnZXJcbiAgIyMjXG4gIHNldHVwTG9nZ2VyOiAtPlxuICAgIEBsb2dnZXIgPSByZXF1aXJlKCcuLi9sb2dnZXInKShfX2ZpbGVuYW1lKVxuICAgICMgQHZlcmJvc2UoQGxvZ2dlcilcbiAgICAjIE1lcmdlIGxvZ2dlciBtZXRob2RzIGludG8gYmVhdXRpZmllciBjbGFzc1xuICAgIGZvciBrZXksIG1ldGhvZCBvZiBAbG9nZ2VyXG4gICAgICAjIEB2ZXJib3NlKGtleSwgbWV0aG9kKVxuICAgICAgQFtrZXldID0gbWV0aG9kXG4gICAgQHZlcmJvc2UoXCIje0BuYW1lfSBiZWF1dGlmaWVyIGxvZ2dlciBoYXMgYmVlbiBpbml0aWFsaXplZC5cIilcblxuICAjIyNcbiAgQ29uc3RydWN0b3IgdG8gc2V0dXAgYmVhdXRpZmVyXG4gICMjI1xuICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICAjIFNldHVwIGxvZ2dlclxuICAgIEBzZXR1cExvZ2dlcigpXG4gICAgIyBIYW5kbGUgZ2xvYmFsIG9wdGlvbnNcbiAgICBpZiBAb3B0aW9ucy5fP1xuICAgICAgZ2xvYmFsT3B0aW9ucyA9IEBvcHRpb25zLl9cbiAgICAgIGRlbGV0ZSBAb3B0aW9ucy5fXG4gICAgICAjIE9ubHkgbWVyZ2UgaWYgZ2xvYmFsT3B0aW9ucyBpcyBhbiBvYmplY3RcbiAgICAgIGlmIHR5cGVvZiBnbG9iYWxPcHRpb25zIGlzIFwib2JqZWN0XCJcbiAgICAgICAgIyBJdGVyYXRlIG92ZXIgYWxsIHN1cHBvcnRlZCBsYW5ndWFnZXNcbiAgICAgICAgZm9yIGxhbmcsIG9wdGlvbnMgb2YgQG9wdGlvbnNcbiAgICAgICAgICAjXG4gICAgICAgICAgaWYgdHlwZW9mIG9wdGlvbnMgaXMgXCJib29sZWFuXCJcbiAgICAgICAgICAgIGlmIG9wdGlvbnMgaXMgdHJ1ZVxuICAgICAgICAgICAgICBAb3B0aW9uc1tsYW5nXSA9IGdsb2JhbE9wdGlvbnNcbiAgICAgICAgICBlbHNlIGlmIHR5cGVvZiBvcHRpb25zIGlzIFwib2JqZWN0XCJcbiAgICAgICAgICAgIEBvcHRpb25zW2xhbmddID0gXy5tZXJnZShnbG9iYWxPcHRpb25zLCBvcHRpb25zKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB3YXJuKFwiVW5zdXBwb3J0ZWQgb3B0aW9ucyB0eXBlICN7dHlwZW9mIG9wdGlvbnN9IGZvciBsYW5ndWFnZSAje2xhbmd9OiBcIisgb3B0aW9ucylcbiAgICBAdmVyYm9zZShcIk9wdGlvbnMgZm9yICN7QG5hbWV9OlwiLCBAb3B0aW9ucylcbiAgICAjIFNldCBzdXBwb3J0ZWQgbGFuZ3VhZ2VzXG4gICAgQGxhbmd1YWdlcyA9IF8ua2V5cyhAb3B0aW9ucylcbiJdfQ==
