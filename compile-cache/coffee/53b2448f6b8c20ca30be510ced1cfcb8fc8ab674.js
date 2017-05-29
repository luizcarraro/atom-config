(function() {
  module.exports = {
    apply: function() {
      var root, setFontSize, setLayoutMode;
      root = document.documentElement;
      setFontSize = function(currentFontSize) {
        if (Number.isInteger(currentFontSize)) {
          return root.style.fontSize = currentFontSize + 'px';
        } else if (currentFontSize === 'Auto') {
          return root.style.fontSize = '';
        }
      };
      atom.config.onDidChange('slim-dark-ui.fontSize', function() {
        return setFontSize(atom.config.get('slim-dark-ui.fontSize'));
      });
      setFontSize(atom.config.get('slim-dark-ui.fontSize'));
      setLayoutMode = function(layoutMode) {
        return root.setAttribute('theme-slim-dark-ui-layoutmode', layoutMode.toLowerCase());
      };
      atom.config.onDidChange('slim-dark-ui.layoutMode', function() {
        return setLayoutMode(atom.config.get('slim-dark-ui.layoutMode'));
      });
      return setLayoutMode(atom.config.get('slim-dark-ui.layoutMode'));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL3NsaW0tZGFyay11aS9saWIvY29uZmlnLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBRUU7SUFBQSxLQUFBLEVBQU8sU0FBQTtBQUVMLFVBQUE7TUFBQSxJQUFBLEdBQU8sUUFBUSxDQUFDO01BSWhCLFdBQUEsR0FBYyxTQUFDLGVBQUQ7UUFDWixJQUFHLE1BQU0sQ0FBQyxTQUFQLENBQWlCLGVBQWpCLENBQUg7aUJBQ0UsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFYLEdBQXNCLGVBQUEsR0FBa0IsS0FEMUM7U0FBQSxNQUVLLElBQUcsZUFBQSxLQUFtQixNQUF0QjtpQkFDSCxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVgsR0FBc0IsR0FEbkI7O01BSE87TUFNZCxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVosQ0FBd0IsdUJBQXhCLEVBQWlELFNBQUE7ZUFDL0MsV0FBQSxDQUFZLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix1QkFBaEIsQ0FBWjtNQUQrQyxDQUFqRDtNQUdBLFdBQUEsQ0FBWSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsdUJBQWhCLENBQVo7TUFJQSxhQUFBLEdBQWdCLFNBQUMsVUFBRDtlQUNkLElBQUksQ0FBQyxZQUFMLENBQWtCLCtCQUFsQixFQUFtRCxVQUFVLENBQUMsV0FBWCxDQUFBLENBQW5EO01BRGM7TUFHaEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFaLENBQXdCLHlCQUF4QixFQUFtRCxTQUFBO2VBQ2pELGFBQUEsQ0FBYyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IseUJBQWhCLENBQWQ7TUFEaUQsQ0FBbkQ7YUFHQSxhQUFBLENBQWMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHlCQUFoQixDQUFkO0lBekJLLENBQVA7O0FBRkYiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9XG5cbiAgYXBwbHk6IC0+XG5cbiAgICByb290ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XG5cblxuICAgICMgRm9udCBTaXplXG4gICAgc2V0Rm9udFNpemUgPSAoY3VycmVudEZvbnRTaXplKSAtPlxuICAgICAgaWYgTnVtYmVyLmlzSW50ZWdlcihjdXJyZW50Rm9udFNpemUpXG4gICAgICAgIHJvb3Quc3R5bGUuZm9udFNpemUgPSBjdXJyZW50Rm9udFNpemUgKyAncHgnXG4gICAgICBlbHNlIGlmIGN1cnJlbnRGb250U2l6ZSBpcyAnQXV0bydcbiAgICAgICAgcm9vdC5zdHlsZS5mb250U2l6ZSA9ICcnXG5cbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnc2xpbS1kYXJrLXVpLmZvbnRTaXplJywgLT5cbiAgICAgIHNldEZvbnRTaXplKGF0b20uY29uZmlnLmdldCgnc2xpbS1kYXJrLXVpLmZvbnRTaXplJykpXG5cbiAgICBzZXRGb250U2l6ZShhdG9tLmNvbmZpZy5nZXQoJ3NsaW0tZGFyay11aS5mb250U2l6ZScpKVxuXG5cbiAgICAjIExheW91dCBNb2RlXG4gICAgc2V0TGF5b3V0TW9kZSA9IChsYXlvdXRNb2RlKSAtPlxuICAgICAgcm9vdC5zZXRBdHRyaWJ1dGUoJ3RoZW1lLXNsaW0tZGFyay11aS1sYXlvdXRtb2RlJywgbGF5b3V0TW9kZS50b0xvd2VyQ2FzZSgpKVxuXG4gICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ3NsaW0tZGFyay11aS5sYXlvdXRNb2RlJywgLT5cbiAgICAgIHNldExheW91dE1vZGUoYXRvbS5jb25maWcuZ2V0KCdzbGltLWRhcmstdWkubGF5b3V0TW9kZScpKVxuXG4gICAgc2V0TGF5b3V0TW9kZShhdG9tLmNvbmZpZy5nZXQoJ3NsaW0tZGFyay11aS5sYXlvdXRNb2RlJykpXG4iXX0=
