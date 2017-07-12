(function() {
  var meta;

  meta = require('../package.json');

  module.exports = {
    activate: function(state) {
      return require('atom-package-deps').install(meta.name);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL3N1YmxpbWUvbGliL3N1YmxpbWUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLGlCQUFSOztFQUVQLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxRQUFBLEVBQVUsU0FBQyxLQUFEO2FBQ1IsT0FBQSxDQUFRLG1CQUFSLENBQTRCLENBQUMsT0FBN0IsQ0FBcUMsSUFBSSxDQUFDLElBQTFDO0lBRFEsQ0FBVjs7QUFIRiIsInNvdXJjZXNDb250ZW50IjpbIm1ldGEgPSByZXF1aXJlICcuLi9wYWNrYWdlLmpzb24nXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICByZXF1aXJlKCdhdG9tLXBhY2thZ2UtZGVwcycpLmluc3RhbGwobWV0YS5uYW1lKVxuIl19
