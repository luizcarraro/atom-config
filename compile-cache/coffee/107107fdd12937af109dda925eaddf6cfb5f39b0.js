(function() {
  var LogLine, LogView, View,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  View = require('atom-space-pen-views').View;

  LogLine = (function(superClass) {
    extend(LogLine, superClass);

    function LogLine() {
      return LogLine.__super__.constructor.apply(this, arguments);
    }

    LogLine.content = function(line) {
      return this.pre({
        "class": "" + (line.iserror ? 'error' : '')
      }, line.log);
    };

    return LogLine;

  })(View);

  module.exports = LogView = (function(superClass) {
    extend(LogView, superClass);

    function LogView() {
      return LogView.__super__.constructor.apply(this, arguments);
    }

    LogView.content = function() {
      return this.div({
        "class": 'logger'
      });
    };

    LogView.prototype.log = function(log, iserror) {
      this.append(new LogLine({
        iserror: iserror,
        log: log
      }));
      this.scrollToBottom();
    };

    return LogView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi92aWV3cy9sb2ctdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHNCQUFBO0lBQUE7OztFQUFDLE9BQVEsT0FBQSxDQUFRLHNCQUFSOztFQUVIOzs7Ozs7O0lBQ0osT0FBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLElBQUQ7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxFQUFBLEdBQUUsQ0FBSSxJQUFJLENBQUMsT0FBUixHQUFxQixPQUFyQixHQUFrQyxFQUFuQyxDQUFUO09BQUwsRUFBdUQsSUFBSSxDQUFDLEdBQTVEO0lBRFE7Ozs7S0FEVTs7RUFJdEIsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7OztJQUNKLE9BQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFFBQVA7T0FBTDtJQURROztzQkFHVixHQUFBLEdBQUssU0FBQyxHQUFELEVBQU0sT0FBTjtNQUNILElBQUMsQ0FBQSxNQUFELENBQVksSUFBQSxPQUFBLENBQVE7UUFBQSxPQUFBLEVBQVMsT0FBVDtRQUFrQixHQUFBLEVBQUssR0FBdkI7T0FBUixDQUFaO01BQ0EsSUFBQyxDQUFBLGNBQUQsQ0FBQTtJQUZHOzs7O0tBSmU7QUFQdEIiLCJzb3VyY2VzQ29udGVudCI6WyJ7Vmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcblxuY2xhc3MgTG9nTGluZSBleHRlbmRzIFZpZXdcbiAgQGNvbnRlbnQ6IChsaW5lKSAtPlxuICAgIEBwcmUgY2xhc3M6IFwiI3tpZiBsaW5lLmlzZXJyb3IgdGhlbiAnZXJyb3InIGVsc2UgJyd9XCIsIGxpbmUubG9nXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIExvZ1ZpZXcgZXh0ZW5kcyBWaWV3XG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6ICdsb2dnZXInXG5cbiAgbG9nOiAobG9nLCBpc2Vycm9yKSAtPlxuICAgIEBhcHBlbmQgbmV3IExvZ0xpbmUoaXNlcnJvcjogaXNlcnJvciwgbG9nOiBsb2cpXG4gICAgQHNjcm9sbFRvQm90dG9tKClcbiAgICByZXR1cm5cbiJdfQ==
