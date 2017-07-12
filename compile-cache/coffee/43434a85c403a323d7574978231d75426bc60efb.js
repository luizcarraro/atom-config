
/*
Requires https://github.com/hhatto/autopep8
 */

(function() {
  "use strict";
  var Autopep8, Beautifier,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Autopep8 = (function(superClass) {
    extend(Autopep8, superClass);

    function Autopep8() {
      return Autopep8.__super__.constructor.apply(this, arguments);
    }

    Autopep8.prototype.name = "autopep8";

    Autopep8.prototype.link = "https://github.com/hhatto/autopep8";

    Autopep8.prototype.executables = [
      {
        name: "autopep8",
        cmd: "autopep8",
        homepage: "https://github.com/hhatto/autopep8",
        installation: "https://github.com/hhatto/autopep8#installation",
        version: {
          parse: function(text) {
            return text.match(/autopep8 (\d+\.\d+\.\d+)/)[1];
          },
          runOptions: {
            returnStdoutOrStderr: true
          }
        },
        docker: {
          image: "unibeautify/autopep8"
        }
      }, {
        name: "isort",
        cmd: "isort",
        optional: true,
        homepage: "https://github.com/timothycrosley/isort",
        installation: "https://github.com/timothycrosley/isort#installing-isort",
        version: {
          parse: function(text) {
            return text.match(/VERSION (\d+\.\d+\.\d+)/)[1];
          }
        }
      }
    ];

    Autopep8.prototype.options = {
      Python: true
    };

    Autopep8.prototype.beautify = function(text, language, options, context) {
      var tempFile;
      if (context == null) {
        context = {};
      }
      return this.exe("autopep8").run([tempFile = this.tempFile("input", text), "-i", options.max_line_length != null ? ["--max-line-length", "" + options.max_line_length] : void 0, options.indent_size != null ? ["--indent-size", "" + options.indent_size] : void 0, options.ignore != null ? ["--ignore", "" + (options.ignore.join(','))] : void 0]).then((function(_this) {
        return function() {
          var filePath, projectPath;
          if (options.sort_imports) {
            filePath = context.filePath;
            projectPath = typeof atom !== "undefined" && atom !== null ? atom.project.relativizePath(filePath)[0] : void 0;
            return _this.exe("isort").run(["-sp", projectPath, tempFile]);
          }
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.readFile(tempFile);
        };
      })(this));
    };

    return Autopep8;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2F1dG9wZXA4LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUlBO0FBSkEsTUFBQSxvQkFBQTtJQUFBOzs7RUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7dUJBRXJCLElBQUEsR0FBTTs7dUJBQ04sSUFBQSxHQUFNOzt1QkFDTixXQUFBLEdBQWE7TUFDWDtRQUNFLElBQUEsRUFBTSxVQURSO1FBRUUsR0FBQSxFQUFLLFVBRlA7UUFHRSxRQUFBLEVBQVUsb0NBSFo7UUFJRSxZQUFBLEVBQWMsaURBSmhCO1FBS0UsT0FBQSxFQUFTO1VBQ1AsS0FBQSxFQUFPLFNBQUMsSUFBRDttQkFBVSxJQUFJLENBQUMsS0FBTCxDQUFXLDBCQUFYLENBQXVDLENBQUEsQ0FBQTtVQUFqRCxDQURBO1VBRVAsVUFBQSxFQUFZO1lBQ1Ysb0JBQUEsRUFBc0IsSUFEWjtXQUZMO1NBTFg7UUFXRSxNQUFBLEVBQVE7VUFDTixLQUFBLEVBQU8sc0JBREQ7U0FYVjtPQURXLEVBZ0JYO1FBQ0UsSUFBQSxFQUFNLE9BRFI7UUFFRSxHQUFBLEVBQUssT0FGUDtRQUdFLFFBQUEsRUFBVSxJQUhaO1FBSUUsUUFBQSxFQUFVLHlDQUpaO1FBS0UsWUFBQSxFQUFjLDBEQUxoQjtRQU1FLE9BQUEsRUFBUztVQUNQLEtBQUEsRUFBTyxTQUFDLElBQUQ7bUJBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyx5QkFBWCxDQUFzQyxDQUFBLENBQUE7VUFBaEQsQ0FEQTtTQU5YO09BaEJXOzs7dUJBNEJiLE9BQUEsR0FBUztNQUNQLE1BQUEsRUFBUSxJQUREOzs7dUJBSVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakIsRUFBMEIsT0FBMUI7QUFDUixVQUFBOztRQURrQyxVQUFVOzthQUM1QyxJQUFDLENBQUEsR0FBRCxDQUFLLFVBQUwsQ0FBZ0IsQ0FBQyxHQUFqQixDQUFxQixDQUNqQixRQUFBLEdBQVcsSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CLENBRE0sRUFFakIsSUFGaUIsRUFHc0MsK0JBQXZELEdBQUEsQ0FBQyxtQkFBRCxFQUFzQixFQUFBLEdBQUcsT0FBTyxDQUFDLGVBQWpDLENBQUEsR0FBQSxNQUhpQixFQUk2QiwyQkFBOUMsR0FBQSxDQUFDLGVBQUQsRUFBaUIsRUFBQSxHQUFHLE9BQU8sQ0FBQyxXQUE1QixDQUFBLEdBQUEsTUFKaUIsRUFLNkIsc0JBQTlDLEdBQUEsQ0FBQyxVQUFELEVBQVksRUFBQSxHQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFmLENBQW9CLEdBQXBCLENBQUQsQ0FBZCxDQUFBLEdBQUEsTUFMaUIsQ0FBckIsQ0FPRSxDQUFDLElBUEgsQ0FPUSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7QUFDSixjQUFBO1VBQUEsSUFBRyxPQUFPLENBQUMsWUFBWDtZQUNFLFFBQUEsR0FBVyxPQUFPLENBQUM7WUFDbkIsV0FBQSxrREFBYyxJQUFJLENBQUUsT0FBTyxDQUFDLGNBQWQsQ0FBNkIsUUFBN0IsQ0FBdUMsQ0FBQSxDQUFBO21CQUNyRCxLQUFDLENBQUEsR0FBRCxDQUFLLE9BQUwsQ0FBYSxDQUFDLEdBQWQsQ0FBa0IsQ0FBQyxLQUFELEVBQVEsV0FBUixFQUFxQixRQUFyQixDQUFsQixFQUhGOztRQURJO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVBSLENBYUUsQ0FBQyxJQWJILENBYVEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtRQUFIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQWJSO0lBRFE7Ozs7S0FwQzRCO0FBUHhDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5SZXF1aXJlcyBodHRwczovL2dpdGh1Yi5jb20vaGhhdHRvL2F1dG9wZXA4XG4jIyNcblxuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEF1dG9wZXA4IGV4dGVuZHMgQmVhdXRpZmllclxuXG4gIG5hbWU6IFwiYXV0b3BlcDhcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9oaGF0dG8vYXV0b3BlcDhcIlxuICBleGVjdXRhYmxlczogW1xuICAgIHtcbiAgICAgIG5hbWU6IFwiYXV0b3BlcDhcIlxuICAgICAgY21kOiBcImF1dG9wZXA4XCJcbiAgICAgIGhvbWVwYWdlOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9oaGF0dG8vYXV0b3BlcDhcIlxuICAgICAgaW5zdGFsbGF0aW9uOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9oaGF0dG8vYXV0b3BlcDgjaW5zdGFsbGF0aW9uXCJcbiAgICAgIHZlcnNpb246IHtcbiAgICAgICAgcGFyc2U6ICh0ZXh0KSAtPiB0ZXh0Lm1hdGNoKC9hdXRvcGVwOCAoXFxkK1xcLlxcZCtcXC5cXGQrKS8pWzFdXG4gICAgICAgIHJ1bk9wdGlvbnM6IHtcbiAgICAgICAgICByZXR1cm5TdGRvdXRPclN0ZGVycjogdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBkb2NrZXI6IHtcbiAgICAgICAgaW1hZ2U6IFwidW5pYmVhdXRpZnkvYXV0b3BlcDhcIlxuICAgICAgfVxuICAgIH1cbiAgICB7XG4gICAgICBuYW1lOiBcImlzb3J0XCJcbiAgICAgIGNtZDogXCJpc29ydFwiXG4gICAgICBvcHRpb25hbDogdHJ1ZVxuICAgICAgaG9tZXBhZ2U6IFwiaHR0cHM6Ly9naXRodWIuY29tL3RpbW90aHljcm9zbGV5L2lzb3J0XCJcbiAgICAgIGluc3RhbGxhdGlvbjogXCJodHRwczovL2dpdGh1Yi5jb20vdGltb3RoeWNyb3NsZXkvaXNvcnQjaW5zdGFsbGluZy1pc29ydFwiXG4gICAgICB2ZXJzaW9uOiB7XG4gICAgICAgIHBhcnNlOiAodGV4dCkgLT4gdGV4dC5tYXRjaCgvVkVSU0lPTiAoXFxkK1xcLlxcZCtcXC5cXGQrKS8pWzFdXG4gICAgICB9XG4gICAgfVxuICBdXG5cbiAgb3B0aW9uczoge1xuICAgIFB5dGhvbjogdHJ1ZVxuICB9XG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucywgY29udGV4dCA9IHt9KSAtPlxuICAgIEBleGUoXCJhdXRvcGVwOFwiKS5ydW4oW1xuICAgICAgICB0ZW1wRmlsZSA9IEB0ZW1wRmlsZShcImlucHV0XCIsIHRleHQpXG4gICAgICAgIFwiLWlcIlxuICAgICAgICBbXCItLW1heC1saW5lLWxlbmd0aFwiLCBcIiN7b3B0aW9ucy5tYXhfbGluZV9sZW5ndGh9XCJdIGlmIG9wdGlvbnMubWF4X2xpbmVfbGVuZ3RoP1xuICAgICAgICBbXCItLWluZGVudC1zaXplXCIsXCIje29wdGlvbnMuaW5kZW50X3NpemV9XCJdIGlmIG9wdGlvbnMuaW5kZW50X3NpemU/XG4gICAgICAgIFtcIi0taWdub3JlXCIsXCIje29wdGlvbnMuaWdub3JlLmpvaW4oJywnKX1cIl0gaWYgb3B0aW9ucy5pZ25vcmU/XG4gICAgICBdKVxuICAgICAgLnRoZW4oPT5cbiAgICAgICAgaWYgb3B0aW9ucy5zb3J0X2ltcG9ydHNcbiAgICAgICAgICBmaWxlUGF0aCA9IGNvbnRleHQuZmlsZVBhdGhcbiAgICAgICAgICBwcm9qZWN0UGF0aCA9IGF0b20/LnByb2plY3QucmVsYXRpdml6ZVBhdGgoZmlsZVBhdGgpWzBdXG4gICAgICAgICAgQGV4ZShcImlzb3J0XCIpLnJ1bihbXCItc3BcIiwgcHJvamVjdFBhdGgsIHRlbXBGaWxlXSlcbiAgICAgIClcbiAgICAgIC50aGVuKD0+IEByZWFkRmlsZSh0ZW1wRmlsZSkpXG4iXX0=
