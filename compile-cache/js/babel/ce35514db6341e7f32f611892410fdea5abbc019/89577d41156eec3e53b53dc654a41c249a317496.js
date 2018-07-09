Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom = require('atom');

var _blameGutterView = require('./blame-gutter-view');

var _blameGutterView2 = _interopRequireDefault(_blameGutterView);

'use babel';

exports['default'] = {
  gitBlameMeView: null,
  modalPanel: null,
  subscriptions: null,

  config: {
    gutterFormat: {
      title: 'Format (gutter)',
      description: 'Placeholders: `{hash}`, `{date}` and `{author}.`',
      type: 'string',
      'default': '{hash} {date} {author}'
    },
    dateFormat: {
      title: 'Format (date)',
      description: ['Placeholders: `YYYY` (year), `MM` (month), `DD` (day), `HH` (hours), `mm` (minutes).', 'See [momentjs documentation](http://momentjs.com/docs/#/parsing/string-format/) for mor information.'].join('<br>'),
      type: 'string',
      'default': 'YYYY-MM-DD'
    },
    defaultWidth: {
      title: 'Default width (px)',
      type: 'integer',
      'default': 250,
      minimum: 50,
      maximum: 500
    },
    ignoreWhitespace: {
      type: 'boolean',
      'default': true
    },
    detectMoved: {
      type: 'boolean',
      'default': true
    },
    detectCopy: {
      type: 'boolean',
      'default': true
    }
  },

  activate: function activate() {
    var _this = this;

    var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    this.state = state;
    this.gutters = new Map();
    this.disposables = new _atom.CompositeDisposable();

    this.disposables.add(atom.commands.add('atom-workspace', {
      'blame:toggle': function blameToggle() {
        return _this.toggleBlameGutter();
      }
    }));
  },

  toggleBlameGutter: function toggleBlameGutter() {
    var editor = atom.workspace.getActiveTextEditor();
    if (!editor) {
      return;
    }

    var gutter = this.gutters.get(editor);
    if (gutter) {
      gutter.toggleVisible();
    } else {
      gutter = new _blameGutterView2['default'](this.state, editor);
      this.disposables.add(gutter);
      this.gutters.set(editor, gutter);
    }
  },

  deactivate: function deactivate() {
    this.disposables.dispose();
  },

  serialize: function serialize() {
    return this.state;
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2x1aXouY2FycmFyby8uYXRvbS9wYWNrYWdlcy9ibGFtZS9saWIvaW5pdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7b0JBRW9DLE1BQU07OytCQUNkLHFCQUFxQjs7OztBQUhqRCxXQUFXLENBQUE7O3FCQUtJO0FBQ2IsZ0JBQWMsRUFBRSxJQUFJO0FBQ3BCLFlBQVUsRUFBRSxJQUFJO0FBQ2hCLGVBQWEsRUFBRSxJQUFJOztBQUVuQixRQUFNLEVBQUU7QUFDTixnQkFBWSxFQUFFO0FBQ1osV0FBSyxFQUFFLGlCQUFpQjtBQUN4QixpQkFBVyxFQUFFLGtEQUFrRDtBQUMvRCxVQUFJLEVBQUUsUUFBUTtBQUNkLGlCQUFTLHdCQUF3QjtLQUNsQztBQUNELGNBQVUsRUFBRTtBQUNWLFdBQUssRUFBRSxlQUFlO0FBQ3RCLGlCQUFXLEVBQUUsQ0FDWCxzRkFBc0YsRUFDdEYsc0dBQXNHLENBQ3ZHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUNkLFVBQUksRUFBRSxRQUFRO0FBQ2QsaUJBQVMsWUFBWTtLQUN0QjtBQUNELGdCQUFZLEVBQUU7QUFDWixXQUFLLEVBQUUsb0JBQW9CO0FBQzNCLFVBQUksRUFBRSxTQUFTO0FBQ2YsaUJBQVMsR0FBRztBQUNaLGFBQU8sRUFBRSxFQUFFO0FBQ1gsYUFBTyxFQUFFLEdBQUc7S0FDYjtBQUNELG9CQUFnQixFQUFFO0FBQ2hCLFVBQUksRUFBRSxTQUFTO0FBQ2YsaUJBQVMsSUFBSTtLQUNkO0FBQ0QsZUFBVyxFQUFFO0FBQ1gsVUFBSSxFQUFFLFNBQVM7QUFDZixpQkFBUyxJQUFJO0tBQ2Q7QUFDRCxjQUFVLEVBQUU7QUFDVixVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLElBQUk7S0FDZDtHQUNGOztBQUVELFVBQVEsRUFBQyxvQkFBYTs7O1FBQVosS0FBSyx5REFBRyxFQUFFOztBQUNsQixRQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtBQUNsQixRQUFJLENBQUMsT0FBTyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7QUFDeEIsUUFBSSxDQUFDLFdBQVcsR0FBRywrQkFBeUIsQ0FBQTs7QUFFNUMsUUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUU7QUFDdkQsb0JBQWMsRUFBRTtlQUFNLE1BQUssaUJBQWlCLEVBQUU7T0FBQTtLQUMvQyxDQUFDLENBQUMsQ0FBQTtHQUNKOztBQUVELG1CQUFpQixFQUFDLDZCQUFHO0FBQ25CLFFBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQTtBQUNuRCxRQUFJLENBQUMsTUFBTSxFQUFFO0FBQUUsYUFBTTtLQUFFOztBQUV2QixRQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNyQyxRQUFJLE1BQU0sRUFBRTtBQUNWLFlBQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQTtLQUN2QixNQUFNO0FBQ0wsWUFBTSxHQUFHLGlDQUFvQixJQUFJLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFBO0FBQ2hELFVBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQzVCLFVBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQTtLQUNqQztHQUNGOztBQUVELFlBQVUsRUFBQyxzQkFBRztBQUNaLFFBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUE7R0FDM0I7O0FBRUQsV0FBUyxFQUFDLHFCQUFHO0FBQ1gsV0FBTyxJQUFJLENBQUMsS0FBSyxDQUFBO0dBQ2xCO0NBQ0YiLCJmaWxlIjoiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2JsYW1lL2xpYi9pbml0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgQmxhbWVHdXR0ZXJWaWV3IGZyb20gJy4vYmxhbWUtZ3V0dGVyLXZpZXcnXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgZ2l0QmxhbWVNZVZpZXc6IG51bGwsXG4gIG1vZGFsUGFuZWw6IG51bGwsXG4gIHN1YnNjcmlwdGlvbnM6IG51bGwsXG5cbiAgY29uZmlnOiB7XG4gICAgZ3V0dGVyRm9ybWF0OiB7XG4gICAgICB0aXRsZTogJ0Zvcm1hdCAoZ3V0dGVyKScsXG4gICAgICBkZXNjcmlwdGlvbjogJ1BsYWNlaG9sZGVyczogYHtoYXNofWAsIGB7ZGF0ZX1gIGFuZCBge2F1dGhvcn0uYCcsXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlZmF1bHQ6ICd7aGFzaH0ge2RhdGV9IHthdXRob3J9J1xuICAgIH0sXG4gICAgZGF0ZUZvcm1hdDoge1xuICAgICAgdGl0bGU6ICdGb3JtYXQgKGRhdGUpJyxcbiAgICAgIGRlc2NyaXB0aW9uOiBbXG4gICAgICAgICdQbGFjZWhvbGRlcnM6IGBZWVlZYCAoeWVhciksIGBNTWAgKG1vbnRoKSwgYEREYCAoZGF5KSwgYEhIYCAoaG91cnMpLCBgbW1gIChtaW51dGVzKS4nLFxuICAgICAgICAnU2VlIFttb21lbnRqcyBkb2N1bWVudGF0aW9uXShodHRwOi8vbW9tZW50anMuY29tL2RvY3MvIy9wYXJzaW5nL3N0cmluZy1mb3JtYXQvKSBmb3IgbW9yIGluZm9ybWF0aW9uLidcbiAgICAgIF0uam9pbignPGJyPicpLFxuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiAnWVlZWS1NTS1ERCdcbiAgICB9LFxuICAgIGRlZmF1bHRXaWR0aDoge1xuICAgICAgdGl0bGU6ICdEZWZhdWx0IHdpZHRoIChweCknLFxuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgZGVmYXVsdDogMjUwLFxuICAgICAgbWluaW11bTogNTAsXG4gICAgICBtYXhpbXVtOiA1MDBcbiAgICB9LFxuICAgIGlnbm9yZVdoaXRlc3BhY2U6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICB9LFxuICAgIGRldGVjdE1vdmVkOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgfSxcbiAgICBkZXRlY3RDb3B5OiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgfVxuICB9LFxuXG4gIGFjdGl2YXRlIChzdGF0ZSA9IHt9KSB7XG4gICAgdGhpcy5zdGF0ZSA9IHN0YXRlXG4gICAgdGhpcy5ndXR0ZXJzID0gbmV3IE1hcCgpXG4gICAgdGhpcy5kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICdibGFtZTp0b2dnbGUnOiAoKSA9PiB0aGlzLnRvZ2dsZUJsYW1lR3V0dGVyKClcbiAgICB9KSlcbiAgfSxcblxuICB0b2dnbGVCbGFtZUd1dHRlciAoKSB7XG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgaWYgKCFlZGl0b3IpIHsgcmV0dXJuIH1cblxuICAgIGxldCBndXR0ZXIgPSB0aGlzLmd1dHRlcnMuZ2V0KGVkaXRvcilcbiAgICBpZiAoZ3V0dGVyKSB7XG4gICAgICBndXR0ZXIudG9nZ2xlVmlzaWJsZSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIGd1dHRlciA9IG5ldyBCbGFtZUd1dHRlclZpZXcodGhpcy5zdGF0ZSwgZWRpdG9yKVxuICAgICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoZ3V0dGVyKVxuICAgICAgdGhpcy5ndXR0ZXJzLnNldChlZGl0b3IsIGd1dHRlcilcbiAgICB9XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSAoKSB7XG4gICAgdGhpcy5kaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgfSxcblxuICBzZXJpYWxpemUgKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlXG4gIH1cbn1cbiJdfQ==