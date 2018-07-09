(function() {
  var meta;

  meta = require("../package.json");

  module.exports = {
    getConfig: function(key) {
      if (key == null) {
        key = "";
      }
      if (key != null) {
        return atom.config.get(meta.name + "." + key);
      }
      return atom.config.get("" + meta.name);
    },
    notification: function(string, notification) {
      switch (this.getConfig("notificationStyle")) {
        case "Success":
          return atom.notifications.addSuccess(string, notification);
        case "Info":
          return atom.notifications.addInfo(string, notification);
        case "Warning":
          return atom.notifications.addWarning(string, notification);
        case "Error":
          return atom.notifications.addError(string, notification);
        default:
          return atom.notifications.addSuccess(string, notification);
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2F1dG8tdXBkYXRlLXBsdXMvbGliL3V0aWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFTLGlCQUFUOztFQUVQLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxTQUFBLEVBQVcsU0FBQyxHQUFEOztRQUFDLE1BQU07O01BQ2hCLElBQUcsV0FBSDtBQUNFLGVBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQW1CLElBQUksQ0FBQyxJQUFOLEdBQVcsR0FBWCxHQUFjLEdBQWhDLEVBRFQ7O0FBR0EsYUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsRUFBQSxHQUFHLElBQUksQ0FBQyxJQUF4QjtJQUpFLENBQVg7SUFNQSxZQUFBLEVBQWMsU0FBQyxNQUFELEVBQVMsWUFBVDtBQUNaLGNBQU8sSUFBQyxDQUFBLFNBQUQsQ0FBVyxtQkFBWCxDQUFQO0FBQUEsYUFDTyxTQURQO2lCQUN1QixJQUFJLENBQUMsYUFBYSxDQUFDLFVBQW5CLENBQThCLE1BQTlCLEVBQXNDLFlBQXRDO0FBRHZCLGFBRU8sTUFGUDtpQkFFb0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFuQixDQUEyQixNQUEzQixFQUFtQyxZQUFuQztBQUZwQixhQUdPLFNBSFA7aUJBR3VCLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBbkIsQ0FBOEIsTUFBOUIsRUFBc0MsWUFBdEM7QUFIdkIsYUFJTyxPQUpQO2lCQUlxQixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQW5CLENBQTRCLE1BQTVCLEVBQW9DLFlBQXBDO0FBSnJCO0FBTUksaUJBQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFuQixDQUE4QixNQUE5QixFQUFzQyxZQUF0QztBQU5YO0lBRFksQ0FOZDs7QUFIRiIsInNvdXJjZXNDb250ZW50IjpbIm1ldGEgPSByZXF1aXJlIChcIi4uL3BhY2thZ2UuanNvblwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGdldENvbmZpZzogKGtleSA9IFwiXCIpIC0+XG4gICAgaWYga2V5P1xuICAgICAgcmV0dXJuIGF0b20uY29uZmlnLmdldCBcIiN7bWV0YS5uYW1lfS4je2tleX1cIlxuXG4gICAgcmV0dXJuIGF0b20uY29uZmlnLmdldCBcIiN7bWV0YS5uYW1lfVwiXG5cbiAgbm90aWZpY2F0aW9uOiAoc3RyaW5nLCBub3RpZmljYXRpb24pIC0+XG4gICAgc3dpdGNoIEBnZXRDb25maWcoXCJub3RpZmljYXRpb25TdHlsZVwiKVxuICAgICAgd2hlbiBcIlN1Y2Nlc3NcIiB0aGVuICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcyhzdHJpbmcsIG5vdGlmaWNhdGlvbilcbiAgICAgIHdoZW4gXCJJbmZvXCIgdGhlbiAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oc3RyaW5nLCBub3RpZmljYXRpb24pXG4gICAgICB3aGVuIFwiV2FybmluZ1wiIHRoZW4gIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKHN0cmluZywgbm90aWZpY2F0aW9uKVxuICAgICAgd2hlbiBcIkVycm9yXCIgdGhlbiAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKHN0cmluZywgbm90aWZpY2F0aW9uKVxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3Moc3RyaW5nLCBub3RpZmljYXRpb24pXG4iXX0=
