(function() {
  var DiffLine, DiffView, View, fmtNum,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  View = require('atom-space-pen-views').View;

  DiffLine = (function(superClass) {
    extend(DiffLine, superClass);

    function DiffLine() {
      return DiffLine.__super__.constructor.apply(this, arguments);
    }

    DiffLine.content = function(line) {
      return this.div({
        "class": "line " + line.type
      }, (function(_this) {
        return function() {
          _this.pre({
            "class": "lineno " + (!line.lineno ? 'invisible' : '')
          }, line.lineno);
          return _this.pre({
            outlet: 'linetext'
          }, line.text);
        };
      })(this));
    };

    DiffLine.prototype.initialize = function(params) {
      if (params.type === 'heading') {
        return this.linetext.click(function() {
          return atom.workspace.open(params.text);
        });
      }
    };

    return DiffLine;

  })(View);

  fmtNum = function(num) {
    return ("     " + (num || '') + " ").slice(-6);
  };

  module.exports = DiffView = (function(superClass) {
    extend(DiffView, superClass);

    function DiffView() {
      return DiffView.__super__.constructor.apply(this, arguments);
    }

    DiffView.content = function() {
      return this.div({
        "class": 'diff'
      });
    };

    DiffView.prototype.clearAll = function() {
      this.find('>.line').remove();
    };

    DiffView.prototype.addAll = function(diffs) {
      this.clearAll();
      diffs.forEach((function(_this) {
        return function(diff) {
          var file, noa, nob;
          if ((file = diff['+++']) === '+++ /dev/null') {
            file = diff['---'];
          }
          _this.append(new DiffLine({
            type: 'heading',
            text: file
          }));
          noa = 0;
          nob = 0;
          diff.lines.forEach(function(line) {
            var atend, atstart, klass, linea, lineb, lineno, ref;
            klass = '';
            lineno = void 0;
            if (/^@@ /.test(line)) {
              ref = line.replace(/-|\+/g, '').split(' '), atstart = ref[0], linea = ref[1], lineb = ref[2], atend = ref[3];
              noa = parseInt(linea, 10);
              nob = parseInt(lineb, 10);
              klass = 'subtle';
            } else {
              lineno = "" + (fmtNum(noa)) + (fmtNum(nob));
              if (/^-/.test(line)) {
                klass = 'red';
                lineno = "" + (fmtNum(noa)) + (fmtNum(0));
                noa++;
              } else if (/^\+/.test(line)) {
                klass = 'green';
                lineno = "" + (fmtNum(0)) + (fmtNum(nob));
                nob++;
              } else {
                noa++;
                nob++;
              }
            }
            _this.append(new DiffLine({
              type: klass,
              text: line,
              lineno: lineno
            }));
          });
        };
      })(this));
    };

    return DiffView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi92aWV3cy9kaWZmLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxnQ0FBQTtJQUFBOzs7RUFBQyxPQUFRLE9BQUEsQ0FBUSxzQkFBUjs7RUFFSDs7Ozs7OztJQUNKLFFBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQyxJQUFEO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sT0FBQSxHQUFRLElBQUksQ0FBQyxJQUFwQjtPQUFMLEVBQWlDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUMvQixLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxTQUFBLEdBQVMsQ0FBQyxDQUFPLElBQUksQ0FBQyxNQUFaLEdBQXdCLFdBQXhCLEdBQXlDLEVBQTFDLENBQWhCO1dBQUwsRUFBcUUsSUFBSSxDQUFDLE1BQTFFO2lCQUNBLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxNQUFBLEVBQVEsVUFBUjtXQUFMLEVBQXlCLElBQUksQ0FBQyxJQUE5QjtRQUYrQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakM7SUFEUTs7dUJBS1YsVUFBQSxHQUFZLFNBQUMsTUFBRDtNQUNWLElBQUcsTUFBTSxDQUFDLElBQVAsS0FBZSxTQUFsQjtlQUFpQyxJQUFDLENBQUEsUUFBUSxDQUFDLEtBQVYsQ0FBZ0IsU0FBQTtpQkFBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsTUFBTSxDQUFDLElBQTNCO1FBQUgsQ0FBaEIsRUFBakM7O0lBRFU7Ozs7S0FOUzs7RUFTdkIsTUFBQSxHQUFTLFNBQUMsR0FBRDtBQUNQLFdBQU8sQ0FBQSxPQUFBLEdBQU8sQ0FBQyxHQUFBLElBQU8sRUFBUixDQUFQLEdBQWtCLEdBQWxCLENBQW9CLENBQUMsS0FBckIsQ0FBMkIsQ0FBQyxDQUE1QjtFQURBOztFQUdULE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7SUFDSixRQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxNQUFQO09BQUw7SUFEUTs7dUJBR1YsUUFBQSxHQUFVLFNBQUE7TUFDUixJQUFDLENBQUEsSUFBRCxDQUFNLFFBQU4sQ0FBZSxDQUFDLE1BQWhCLENBQUE7SUFEUTs7dUJBSVYsTUFBQSxHQUFRLFNBQUMsS0FBRDtNQUNOLElBQUMsQ0FBQSxRQUFELENBQUE7TUFFQSxLQUFLLENBQUMsT0FBTixDQUFjLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO0FBQ1osY0FBQTtVQUFBLElBQUcsQ0FBQyxJQUFBLEdBQU8sSUFBSyxDQUFBLEtBQUEsQ0FBYixDQUFBLEtBQXdCLGVBQTNCO1lBQ0UsSUFBQSxHQUFPLElBQUssQ0FBQSxLQUFBLEVBRGQ7O1VBR0EsS0FBQyxDQUFBLE1BQUQsQ0FBWSxJQUFBLFFBQUEsQ0FBUztZQUFBLElBQUEsRUFBTSxTQUFOO1lBQWlCLElBQUEsRUFBTSxJQUF2QjtXQUFULENBQVo7VUFFQSxHQUFBLEdBQU07VUFDTixHQUFBLEdBQU07VUFFTixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsU0FBQyxJQUFEO0FBQ2pCLGdCQUFBO1lBQUEsS0FBQSxHQUFRO1lBQ1IsTUFBQSxHQUFTO1lBRVQsSUFBRyxNQUFNLENBQUMsSUFBUCxDQUFZLElBQVosQ0FBSDtjQUVFLE1BQWlDLElBQUksQ0FBQyxPQUFMLENBQWEsT0FBYixFQUFzQixFQUF0QixDQUF5QixDQUFDLEtBQTFCLENBQWdDLEdBQWhDLENBQWpDLEVBQUMsZ0JBQUQsRUFBVSxjQUFWLEVBQWlCLGNBQWpCLEVBQXdCO2NBQ3hCLEdBQUEsR0FBTSxRQUFBLENBQVMsS0FBVCxFQUFnQixFQUFoQjtjQUNOLEdBQUEsR0FBTSxRQUFBLENBQVMsS0FBVCxFQUFnQixFQUFoQjtjQUNOLEtBQUEsR0FBUSxTQUxWO2FBQUEsTUFBQTtjQVFFLE1BQUEsR0FBUyxFQUFBLEdBQUUsQ0FBQyxNQUFBLENBQU8sR0FBUCxDQUFELENBQUYsR0FBZSxDQUFDLE1BQUEsQ0FBTyxHQUFQLENBQUQ7Y0FFeEIsSUFBRyxJQUFJLENBQUMsSUFBTCxDQUFVLElBQVYsQ0FBSDtnQkFDRSxLQUFBLEdBQVE7Z0JBQ1IsTUFBQSxHQUFTLEVBQUEsR0FBRSxDQUFDLE1BQUEsQ0FBTyxHQUFQLENBQUQsQ0FBRixHQUFlLENBQUMsTUFBQSxDQUFPLENBQVAsQ0FBRDtnQkFDeEIsR0FBQSxHQUhGO2VBQUEsTUFJSyxJQUFHLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWCxDQUFIO2dCQUNILEtBQUEsR0FBUTtnQkFDUixNQUFBLEdBQVMsRUFBQSxHQUFFLENBQUMsTUFBQSxDQUFPLENBQVAsQ0FBRCxDQUFGLEdBQWEsQ0FBQyxNQUFBLENBQU8sR0FBUCxDQUFEO2dCQUN0QixHQUFBLEdBSEc7ZUFBQSxNQUFBO2dCQUtILEdBQUE7Z0JBQ0EsR0FBQSxHQU5HO2VBZFA7O1lBc0JBLEtBQUMsQ0FBQSxNQUFELENBQVksSUFBQSxRQUFBLENBQVM7Y0FBQSxJQUFBLEVBQU0sS0FBTjtjQUFhLElBQUEsRUFBTSxJQUFuQjtjQUF5QixNQUFBLEVBQVEsTUFBakM7YUFBVCxDQUFaO1VBMUJpQixDQUFuQjtRQVRZO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFkO0lBSE07Ozs7S0FSYTtBQWZ2QiIsInNvdXJjZXNDb250ZW50IjpbIntWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5jbGFzcyBEaWZmTGluZSBleHRlbmRzIFZpZXdcbiAgQGNvbnRlbnQ6IChsaW5lKSAtPlxuICAgIEBkaXYgY2xhc3M6IFwibGluZSAje2xpbmUudHlwZX1cIiwgPT5cbiAgICAgIEBwcmUgY2xhc3M6IFwibGluZW5vICN7dW5sZXNzIGxpbmUubGluZW5vIHRoZW4gJ2ludmlzaWJsZScgZWxzZSAnJ31cIiwgbGluZS5saW5lbm9cbiAgICAgIEBwcmUgb3V0bGV0OiAnbGluZXRleHQnLCBsaW5lLnRleHRcblxuICBpbml0aWFsaXplOiAocGFyYW1zKSAtPlxuICAgIGlmIHBhcmFtcy50eXBlID09ICdoZWFkaW5nJyB0aGVuIEBsaW5ldGV4dC5jbGljaygtPiBhdG9tLndvcmtzcGFjZS5vcGVuKHBhcmFtcy50ZXh0KSlcblxuZm10TnVtID0gKG51bSkgLT5cbiAgcmV0dXJuIFwiICAgICAje251bSBvciAnJ30gXCIuc2xpY2UoLTYpXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIERpZmZWaWV3IGV4dGVuZHMgVmlld1xuICBAY29udGVudDogLT5cbiAgICBAZGl2IGNsYXNzOiAnZGlmZidcblxuICBjbGVhckFsbDogLT5cbiAgICBAZmluZCgnPi5saW5lJykucmVtb3ZlKClcbiAgICByZXR1cm5cblxuICBhZGRBbGw6IChkaWZmcykgLT5cbiAgICBAY2xlYXJBbGwoKVxuXG4gICAgZGlmZnMuZm9yRWFjaCAoZGlmZikgPT5cbiAgICAgIGlmIChmaWxlID0gZGlmZlsnKysrJ10pIGlzICcrKysgL2Rldi9udWxsJ1xuICAgICAgICBmaWxlID0gZGlmZlsnLS0tJ11cblxuICAgICAgQGFwcGVuZCBuZXcgRGlmZkxpbmUodHlwZTogJ2hlYWRpbmcnLCB0ZXh0OiBmaWxlKVxuXG4gICAgICBub2EgPSAwXG4gICAgICBub2IgPSAwXG5cbiAgICAgIGRpZmYubGluZXMuZm9yRWFjaCAobGluZSkgPT5cbiAgICAgICAga2xhc3MgPSAnJ1xuICAgICAgICBsaW5lbm8gPSB1bmRlZmluZWRcblxuICAgICAgICBpZiAvXkBAIC8udGVzdChsaW5lKVxuICAgICAgICAgICMgQEAgLTEwMCwxMSArMTAwLDEzIEBAXG4gICAgICAgICAgW2F0c3RhcnQsIGxpbmVhLCBsaW5lYiwgYXRlbmRdID0gbGluZS5yZXBsYWNlKC8tfFxcKy9nLCAnJykuc3BsaXQoJyAnKVxuICAgICAgICAgIG5vYSA9IHBhcnNlSW50KGxpbmVhLCAxMClcbiAgICAgICAgICBub2IgPSBwYXJzZUludChsaW5lYiwgMTApXG4gICAgICAgICAga2xhc3MgPSAnc3VidGxlJ1xuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBsaW5lbm8gPSBcIiN7Zm10TnVtIG5vYX0je2ZtdE51bSBub2J9XCJcblxuICAgICAgICAgIGlmIC9eLS8udGVzdChsaW5lKVxuICAgICAgICAgICAga2xhc3MgPSAncmVkJ1xuICAgICAgICAgICAgbGluZW5vID0gXCIje2ZtdE51bSBub2F9I3tmbXROdW0gMH1cIlxuICAgICAgICAgICAgbm9hKytcbiAgICAgICAgICBlbHNlIGlmIC9eXFwrLy50ZXN0KGxpbmUpXG4gICAgICAgICAgICBrbGFzcyA9ICdncmVlbidcbiAgICAgICAgICAgIGxpbmVubyA9IFwiI3tmbXROdW0gMH0je2ZtdE51bSBub2J9XCJcbiAgICAgICAgICAgIG5vYisrXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgbm9hKytcbiAgICAgICAgICAgIG5vYisrXG5cbiAgICAgICAgQGFwcGVuZCBuZXcgRGlmZkxpbmUodHlwZToga2xhc3MsIHRleHQ6IGxpbmUsIGxpbmVubzogbGluZW5vKVxuXG4gICAgICAgIHJldHVyblxuICAgICAgcmV0dXJuXG4gICAgcmV0dXJuXG4iXX0=
