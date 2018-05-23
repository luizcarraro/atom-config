(function() {
  module.exports = {
    get: function() {
      var sublimeTabs, treeView;
      if (atom.packages.isPackageLoaded('tree-view')) {
        treeView = atom.packages.getLoadedPackage('tree-view');
        treeView = require(treeView.mainModulePath).getTreeViewInstance();
        return treeView.serialize();
      } else if (atom.packages.isPackageLoaded('sublime-tabs')) {
        sublimeTabs = atom.packages.getLoadedPackage('sublime-tabs');
        sublimeTabs = require(sublimeTabs.mainModulePath);
        return sublimeTabs.serialize();
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9jb250ZXh0LXBhY2thZ2UtZmluZGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxHQUFBLEVBQUssU0FBQTtBQUNILFVBQUE7TUFBQSxJQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixXQUE5QixDQUFIO1FBQ0UsUUFBQSxHQUFXLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWQsQ0FBK0IsV0FBL0I7UUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLFFBQVEsQ0FBQyxjQUFqQixDQUFnQyxDQUFDLG1CQUFqQyxDQUFBO2VBQ1gsUUFBUSxDQUFDLFNBQVQsQ0FBQSxFQUhGO09BQUEsTUFJSyxJQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixjQUE5QixDQUFIO1FBQ0gsV0FBQSxHQUFjLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWQsQ0FBK0IsY0FBL0I7UUFDZCxXQUFBLEdBQWMsT0FBQSxDQUFRLFdBQVcsQ0FBQyxjQUFwQjtlQUNkLFdBQVcsQ0FBQyxTQUFaLENBQUEsRUFIRzs7SUFMRixDQUFMOztBQURGIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPVxuICBnZXQ6IC0+XG4gICAgaWYgYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VMb2FkZWQoJ3RyZWUtdmlldycpXG4gICAgICB0cmVlVmlldyA9IGF0b20ucGFja2FnZXMuZ2V0TG9hZGVkUGFja2FnZSgndHJlZS12aWV3JylcbiAgICAgIHRyZWVWaWV3ID0gcmVxdWlyZSh0cmVlVmlldy5tYWluTW9kdWxlUGF0aCkuZ2V0VHJlZVZpZXdJbnN0YW5jZSgpXG4gICAgICB0cmVlVmlldy5zZXJpYWxpemUoKVxuICAgIGVsc2UgaWYgYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VMb2FkZWQoJ3N1YmxpbWUtdGFicycpXG4gICAgICBzdWJsaW1lVGFicyA9IGF0b20ucGFja2FnZXMuZ2V0TG9hZGVkUGFja2FnZSgnc3VibGltZS10YWJzJylcbiAgICAgIHN1YmxpbWVUYWJzID0gcmVxdWlyZShzdWJsaW1lVGFicy5tYWluTW9kdWxlUGF0aClcbiAgICAgIHN1YmxpbWVUYWJzLnNlcmlhbGl6ZSgpXG4iXX0=
