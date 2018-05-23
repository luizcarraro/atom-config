
/*
Requires https://github.com/bbatsov/rubocop
 */

(function() {
  "use strict";
  var Beautifier, Rubocop, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  path = require('path');

  module.exports = Rubocop = (function(superClass) {
    extend(Rubocop, superClass);

    function Rubocop() {
      return Rubocop.__super__.constructor.apply(this, arguments);
    }

    Rubocop.prototype.name = "Rubocop";

    Rubocop.prototype.link = "https://github.com/bbatsov/rubocop";

    Rubocop.prototype.isPreInstalled = false;

    Rubocop.prototype.options = {
      Ruby: {
        indent_size: true,
        rubocop_path: true
      }
    };

    Rubocop.prototype.beautify = function(text, language, options, context) {
      var _relativePath, fullPath, projectPath, ref;
      fullPath = context.filePath || "";
      ref = atom.project.relativizePath(fullPath), projectPath = ref[0], _relativePath = ref[1];
      return this.Promise.all([options.rubocop_path ? this.which(options.rubocop_path) : void 0, this.which('rubocop')]).then((function(_this) {
        return function(paths) {
          var config, configFile, rubocopArguments, rubocopPath, tempConfig, yaml;
          _this.debug('rubocop paths', paths);
          rubocopPath = paths.find(function(p) {
            return p && path.isAbsolute(p);
          }) || "rubocop";
          _this.verbose('rubocopPath', rubocopPath);
          _this.debug('rubocopPath', rubocopPath, paths);
          configFile = _this.findFile(path.dirname(fullPath), ".rubocop.yml");
          if (configFile == null) {
            yaml = require("yaml-front-matter");
            config = {
              "Style/IndentationWidth": {
                "Width": options.indent_size
              }
            };
            tempConfig = _this.tempFile("rubocop-config", yaml.safeDump(config));
          }
          rubocopArguments = ["--auto-correct", "--force-exclusion", "--stdin", "atom-beautify.rb"];
          if (tempConfig != null) {
            rubocopArguments.push("--config", tempConfig);
          }
          _this.debug("rubocop arguments", rubocopArguments);
          return _this.run(rubocopPath, rubocopArguments, {
            ignoreReturnCode: true,
            cwd: projectPath,
            onStdin: function(stdin) {
              return stdin.end(text);
            }
          }).then(function(stdout) {
            var result;
            _this.debug("rubocop output", stdout);
            if (stdout.length === 0) {
              return text;
            }
            result = stdout.split("====================\n");
            return result[result.length - 1];
          });
        };
      })(this));
    };

    return Rubocop;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3J1Ym9jb3AuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBSUE7QUFKQSxNQUFBLHlCQUFBO0lBQUE7OztFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFDYixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7c0JBQ3JCLElBQUEsR0FBTTs7c0JBQ04sSUFBQSxHQUFNOztzQkFDTixjQUFBLEdBQWdCOztzQkFFaEIsT0FBQSxHQUFTO01BQ1AsSUFBQSxFQUNFO1FBQUEsV0FBQSxFQUFhLElBQWI7UUFDQSxZQUFBLEVBQWMsSUFEZDtPQUZLOzs7c0JBTVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakIsRUFBMEIsT0FBMUI7QUFDUixVQUFBO01BQUEsUUFBQSxHQUFXLE9BQU8sQ0FBQyxRQUFSLElBQW9CO01BQy9CLE1BQStCLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYixDQUE0QixRQUE1QixDQUEvQixFQUFDLG9CQUFELEVBQWM7YUFHZCxJQUFDLENBQUEsT0FBTyxDQUFDLEdBQVQsQ0FBYSxDQUNxQixPQUFPLENBQUMsWUFBeEMsR0FBQSxJQUFDLENBQUEsS0FBRCxDQUFPLE9BQU8sQ0FBQyxZQUFmLENBQUEsR0FBQSxNQURXLEVBRVgsSUFBQyxDQUFBLEtBQUQsQ0FBTyxTQUFQLENBRlcsQ0FBYixDQUlBLENBQUMsSUFKRCxDQUlNLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxLQUFEO0FBQ0osY0FBQTtVQUFBLEtBQUMsQ0FBQSxLQUFELENBQU8sZUFBUCxFQUF3QixLQUF4QjtVQUVBLFdBQUEsR0FBYyxLQUFLLENBQUMsSUFBTixDQUFXLFNBQUMsQ0FBRDttQkFBTyxDQUFBLElBQU0sSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsQ0FBaEI7VUFBYixDQUFYLENBQUEsSUFBK0M7VUFDN0QsS0FBQyxDQUFBLE9BQUQsQ0FBUyxhQUFULEVBQXdCLFdBQXhCO1VBQ0EsS0FBQyxDQUFBLEtBQUQsQ0FBTyxhQUFQLEVBQXNCLFdBQXRCLEVBQW1DLEtBQW5DO1VBR0EsVUFBQSxHQUFhLEtBQUMsQ0FBQSxRQUFELENBQVUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxRQUFiLENBQVYsRUFBa0MsY0FBbEM7VUFDYixJQUFJLGtCQUFKO1lBQ0UsSUFBQSxHQUFPLE9BQUEsQ0FBUSxtQkFBUjtZQUNQLE1BQUEsR0FBUztjQUNQLHdCQUFBLEVBQ0U7Z0JBQUEsT0FBQSxFQUFTLE9BQU8sQ0FBQyxXQUFqQjtlQUZLOztZQUlULFVBQUEsR0FBYSxLQUFDLENBQUEsUUFBRCxDQUFVLGdCQUFWLEVBQTRCLElBQUksQ0FBQyxRQUFMLENBQWMsTUFBZCxDQUE1QixFQU5mOztVQVFBLGdCQUFBLEdBQW1CLENBQ2pCLGdCQURpQixFQUVqQixtQkFGaUIsRUFHakIsU0FIaUIsRUFHTixrQkFITTtVQUtuQixJQUFpRCxrQkFBakQ7WUFBQSxnQkFBZ0IsQ0FBQyxJQUFqQixDQUFzQixVQUF0QixFQUFrQyxVQUFsQyxFQUFBOztVQUNBLEtBQUMsQ0FBQSxLQUFELENBQU8sbUJBQVAsRUFBNEIsZ0JBQTVCO2lCQUVBLEtBQUMsQ0FBQSxHQUFELENBQUssV0FBTCxFQUFrQixnQkFBbEIsRUFBb0M7WUFDbEMsZ0JBQUEsRUFBa0IsSUFEZ0I7WUFFbEMsR0FBQSxFQUFLLFdBRjZCO1lBR2xDLE9BQUEsRUFBUyxTQUFDLEtBQUQ7cUJBQVcsS0FBSyxDQUFDLEdBQU4sQ0FBVSxJQUFWO1lBQVgsQ0FIeUI7V0FBcEMsQ0FJRSxDQUFDLElBSkgsQ0FJUSxTQUFDLE1BQUQ7QUFDTixnQkFBQTtZQUFBLEtBQUMsQ0FBQSxLQUFELENBQU8sZ0JBQVAsRUFBeUIsTUFBekI7WUFFQSxJQUFlLE1BQU0sQ0FBQyxNQUFQLEtBQWlCLENBQWhDO0FBQUEscUJBQU8sS0FBUDs7WUFFQSxNQUFBLEdBQVMsTUFBTSxDQUFDLEtBQVAsQ0FBYSx3QkFBYjttQkFDVCxNQUFPLENBQUEsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsQ0FBaEI7VUFORCxDQUpSO1FBekJJO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUpOO0lBTFE7Ozs7S0FYMkI7QUFSdkMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblJlcXVpcmVzIGh0dHBzOi8vZ2l0aHViLmNvbS9iYmF0c292L3J1Ym9jb3BcbiMjI1xuXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5wYXRoID0gcmVxdWlyZSgncGF0aCcpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUnVib2NvcCBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJSdWJvY29wXCJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vYmJhdHNvdi9ydWJvY29wXCJcbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXG5cbiAgb3B0aW9uczoge1xuICAgIFJ1Ynk6XG4gICAgICBpbmRlbnRfc2l6ZTogdHJ1ZVxuICAgICAgcnVib2NvcF9wYXRoOiB0cnVlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zLCBjb250ZXh0KSAtPlxuICAgIGZ1bGxQYXRoID0gY29udGV4dC5maWxlUGF0aCBvciBcIlwiXG4gICAgW3Byb2plY3RQYXRoLCBfcmVsYXRpdmVQYXRoXSA9IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChmdWxsUGF0aClcblxuICAgICMgRmluZCB0aGUgcnVib2NvcCBwYXRoXG4gICAgQFByb21pc2UuYWxsKFtcbiAgICAgIEB3aGljaChvcHRpb25zLnJ1Ym9jb3BfcGF0aCkgaWYgb3B0aW9ucy5ydWJvY29wX3BhdGhcbiAgICAgIEB3aGljaCgncnVib2NvcCcpXG4gICAgXSlcbiAgICAudGhlbigocGF0aHMpID0+XG4gICAgICBAZGVidWcoJ3J1Ym9jb3AgcGF0aHMnLCBwYXRocylcbiAgICAgICMgR2V0IGZpcnN0IHZhbGlkLCBhYnNvbHV0ZSBwYXRoXG4gICAgICBydWJvY29wUGF0aCA9IHBhdGhzLmZpbmQoKHApIC0+IHAgYW5kIHBhdGguaXNBYnNvbHV0ZShwKSkgb3IgXCJydWJvY29wXCJcbiAgICAgIEB2ZXJib3NlKCdydWJvY29wUGF0aCcsIHJ1Ym9jb3BQYXRoKVxuICAgICAgQGRlYnVnKCdydWJvY29wUGF0aCcsIHJ1Ym9jb3BQYXRoLCBwYXRocylcblxuICAgICAgIyBGaW5kIG9yIGdlbmVyYXRlIGEgY29uZmlnIGZpbGUgaWYgbm9uIGV4aXN0c1xuICAgICAgY29uZmlnRmlsZSA9IEBmaW5kRmlsZShwYXRoLmRpcm5hbWUoZnVsbFBhdGgpLCBcIi5ydWJvY29wLnltbFwiKVxuICAgICAgaWYgIWNvbmZpZ0ZpbGU/XG4gICAgICAgIHlhbWwgPSByZXF1aXJlKFwieWFtbC1mcm9udC1tYXR0ZXJcIilcbiAgICAgICAgY29uZmlnID0ge1xuICAgICAgICAgIFwiU3R5bGUvSW5kZW50YXRpb25XaWR0aFwiOlxuICAgICAgICAgICAgXCJXaWR0aFwiOiBvcHRpb25zLmluZGVudF9zaXplXG4gICAgICAgIH1cbiAgICAgICAgdGVtcENvbmZpZyA9IEB0ZW1wRmlsZShcInJ1Ym9jb3AtY29uZmlnXCIsIHlhbWwuc2FmZUR1bXAoY29uZmlnKSlcblxuICAgICAgcnVib2NvcEFyZ3VtZW50cyA9IFtcbiAgICAgICAgXCItLWF1dG8tY29ycmVjdFwiXG4gICAgICAgIFwiLS1mb3JjZS1leGNsdXNpb25cIlxuICAgICAgICBcIi0tc3RkaW5cIiwgXCJhdG9tLWJlYXV0aWZ5LnJiXCIgIyBmaWxlbmFtZSBpcyByZXF1aXJlZCBidXQgbm90IHVzZWRcbiAgICAgIF1cbiAgICAgIHJ1Ym9jb3BBcmd1bWVudHMucHVzaChcIi0tY29uZmlnXCIsIHRlbXBDb25maWcpIGlmIHRlbXBDb25maWc/XG4gICAgICBAZGVidWcoXCJydWJvY29wIGFyZ3VtZW50c1wiLCBydWJvY29wQXJndW1lbnRzKVxuXG4gICAgICBAcnVuKHJ1Ym9jb3BQYXRoLCBydWJvY29wQXJndW1lbnRzLCB7XG4gICAgICAgIGlnbm9yZVJldHVybkNvZGU6IHRydWUsXG4gICAgICAgIGN3ZDogcHJvamVjdFBhdGgsXG4gICAgICAgIG9uU3RkaW46IChzdGRpbikgLT4gc3RkaW4uZW5kIHRleHRcbiAgICAgIH0pLnRoZW4oKHN0ZG91dCkgPT5cbiAgICAgICAgQGRlYnVnKFwicnVib2NvcCBvdXRwdXRcIiwgc3Rkb3V0KVxuICAgICAgICAjIFJ1Ym9jb3Agb3V0cHV0IGFuIGVycm9yIGlmIHN0ZG91dCBpcyBlbXB0eVxuICAgICAgICByZXR1cm4gdGV4dCBpZiBzdGRvdXQubGVuZ3RoID09IDBcblxuICAgICAgICByZXN1bHQgPSBzdGRvdXQuc3BsaXQoXCI9PT09PT09PT09PT09PT09PT09PVxcblwiKVxuICAgICAgICByZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdXG4gICAgICApXG4gICAgKVxuIl19
