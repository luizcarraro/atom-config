(function() {
  module.exports = {
    config: {
      fontSize: {
        title: 'Font Size',
        description: 'Change the UI font size. Needs to be between 10 and 20.',
        type: ['integer', 'string'],
        minimum: 10,
        maximum: 20,
        "default": 'Auto'
      },
      layoutMode: {
        title: 'Layout Mode',
        description: 'In Auto mode, the UI will automatically adapt based on the window size.',
        type: 'string',
        "default": 'Auto',
        "enum": ['Compact', 'Auto', 'Spacious']
      }
    },
    activate: function(state) {
      return atom.themes.onDidChangeActiveThemes(function() {
        var Config;
        Config = require('./config');
        return Config.apply();
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL3NsaW0tZGFyay11aS9saWIvc2V0dGluZ3MuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLE1BQUEsRUFFRTtNQUFBLFFBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxXQUFQO1FBQ0EsV0FBQSxFQUFhLHlEQURiO1FBRUEsSUFBQSxFQUFNLENBQUMsU0FBRCxFQUFZLFFBQVosQ0FGTjtRQUdBLE9BQUEsRUFBUyxFQUhUO1FBSUEsT0FBQSxFQUFTLEVBSlQ7UUFLQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLE1BTFQ7T0FERjtNQVFBLFVBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxhQUFQO1FBQ0EsV0FBQSxFQUFhLHlFQURiO1FBRUEsSUFBQSxFQUFNLFFBRk47UUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLE1BSFQ7UUFJQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQ0osU0FESSxFQUVKLE1BRkksRUFHSixVQUhJLENBSk47T0FURjtLQUZGO0lBcUJBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7YUFDUixJQUFJLENBQUMsTUFBTSxDQUFDLHVCQUFaLENBQW9DLFNBQUE7QUFDbEMsWUFBQTtRQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjtlQUNULE1BQU0sQ0FBQyxLQUFQLENBQUE7TUFGa0MsQ0FBcEM7SUFEUSxDQXJCVjs7QUFERiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID1cbiAgY29uZmlnOlxuXG4gICAgZm9udFNpemU6XG4gICAgICB0aXRsZTogJ0ZvbnQgU2l6ZSdcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ2hhbmdlIHRoZSBVSSBmb250IHNpemUuIE5lZWRzIHRvIGJlIGJldHdlZW4gMTAgYW5kIDIwLidcbiAgICAgIHR5cGU6IFsnaW50ZWdlcicsICdzdHJpbmcnXVxuICAgICAgbWluaW11bTogMTBcbiAgICAgIG1heGltdW06IDIwXG4gICAgICBkZWZhdWx0OiAnQXV0bydcblxuICAgIGxheW91dE1vZGU6XG4gICAgICB0aXRsZTogJ0xheW91dCBNb2RlJ1xuICAgICAgZGVzY3JpcHRpb246ICdJbiBBdXRvIG1vZGUsIHRoZSBVSSB3aWxsIGF1dG9tYXRpY2FsbHkgYWRhcHQgYmFzZWQgb24gdGhlIHdpbmRvdyBzaXplLidcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnQXV0bydcbiAgICAgIGVudW06IFtcbiAgICAgICAgJ0NvbXBhY3QnLFxuICAgICAgICAnQXV0bycsXG4gICAgICAgICdTcGFjaW91cycsXG4gICAgICBdXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBhdG9tLnRoZW1lcy5vbkRpZENoYW5nZUFjdGl2ZVRoZW1lcyAtPlxuICAgICAgQ29uZmlnID0gcmVxdWlyZSAnLi9jb25maWcnXG4gICAgICBDb25maWcuYXBwbHkoKVxuIl19
