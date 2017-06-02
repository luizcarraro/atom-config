(function() {
  var provider;

  provider = require('./provider');

  module.exports = {
    activate: function() {
      return provider.load();
    },
    getProvider: function() {
      return provider;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2VtYmVyanMtYXRvbS9saWIvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUjs7RUFFWCxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsUUFBQSxFQUFVLFNBQUE7YUFDUixRQUFRLENBQUMsSUFBVCxDQUFBO0lBRFEsQ0FBVjtJQUdBLFdBQUEsRUFBYSxTQUFBO2FBQUc7SUFBSCxDQUhiOztBQUhGIiwic291cmNlc0NvbnRlbnQiOlsicHJvdmlkZXIgPSByZXF1aXJlICcuL3Byb3ZpZGVyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGFjdGl2YXRlOiAtPlxuICAgIHByb3ZpZGVyLmxvYWQoKVxuXG4gIGdldFByb3ZpZGVyOiAtPiBwcm92aWRlclxuIl19
