(function() {
  var Dom, Headers, Utility;

  Dom = require('./dom');

  Utility = require('./utility');

  Headers = require('./headers');

  module.exports = {
    init: function(state) {
      var self;
      self = this;
      self.tabSize(atom.config.get('seti-ui.compactView'));
      self.ignoredFiles(atom.config.get('seti-ui.displayIgnored'));
      self.fileIcons(atom.config.get('seti-ui.fileIcons'));
      self.hideTabs(atom.config.get('seti-ui.hideTabs'));
      self.setTheme(atom.config.get('seti-ui.themeColor'), false, false);
      self.font(atom.config.get('seti-ui.font'), false);
      self.animate(atom.config.get('seti-ui.disableAnimations'));
      atom.config.onDidChange('seti-ui.font', function(value) {
        return self.font(atom.config.get('seti-ui.font'), true);
      });
      return atom.config.onDidChange('seti-ui.themeColor', function(value) {
        return self.setTheme(value.newValue, value.oldValue, true);
      });
    },
    "package": atom.packages.getLoadedPackage('seti-ui'),
    refresh: function() {
      var self;
      self = this;
      self["package"].deactivate();
      return setImmediate(function() {
        return self["package"].activate();
      });
    },
    font: function(val, reload) {
      var el, self;
      self = this;
      el = Dom.query('atom-workspace');
      if (val === 'Roboto') {
        return el.classList.add('seti-roboto');
      } else {
        return el.classList.remove('seti-roboto');
      }
    },
    setTheme: function(theme, previous, reload) {
      var el, fs, path, pkg, self, themeData;
      self = this;
      el = Dom.query('atom-workspace');
      fs = require('fs');
      path = require('path');
      pkg = atom.packages.getLoadedPackage('seti-ui');
      themeData = '@seti-primary: @' + theme.toLowerCase() + ';';
      themeData = themeData + '@seti-primary-text: @' + theme.toLowerCase() + '-text;';
      themeData = themeData + '@seti-primary-highlight: @' + theme.toLowerCase() + '-highlight;';
      atom.config.set('seti-ui.themeColor', theme);
      return fs.writeFile(pkg.path + '/styles/user-theme.less', themeData, function(err) {
        if (!err) {
          if (previous) {
            el.classList.remove('seti-theme-' + previous.toLowerCase());
            el.classList.add('seti-theme-' + theme.toLowerCase());
          }
          if (reload) {
            return self.refresh();
          }
        }
      });
    },
    animate: function(val) {
      return Utility.applySetting({
        action: 'addWhenFalse',
        config: 'seti-ui.disableAnimations',
        el: ['atom-workspace'],
        className: 'seti-animate',
        val: val,
        cb: this.animate
      });
    },
    tabSize: function(val) {
      return Utility.applySetting({
        action: 'addWhenTrue',
        config: 'seti-ui.compactView',
        el: ['atom-workspace'],
        className: 'seti-compact',
        val: val,
        cb: this.tabSize
      });
    },
    hideTabs: function(val) {
      Utility.applySetting({
        action: 'addWhenTrue',
        config: 'seti-ui.hideTabs',
        el: ['atom-workspace'],
        className: 'seti-hide-tabs',
        val: val,
        cb: this.hideTabs
      });
    },
    fileIcons: function(val) {
      Utility.applySetting({
        action: 'addWhenTrue',
        config: 'seti-ui.fileIcons',
        el: ['atom-workspace'],
        className: 'seti-icons',
        val: val,
        cb: this.fileIcons
      });
    },
    ignoredFiles: function(val) {
      return Utility.applySetting({
        action: 'addWhenFalse',
        config: 'seti-ui.displayIgnored',
        el: ['.file.entry.list-item.status-ignored', '.directory.entry.list-nested-item.status-ignored'],
        className: 'seti-hide',
        val: val,
        cb: this.ignoredFiles
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL3NldGktdWkvbGliL3NldHRpbmdzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxPQUFSOztFQUNOLE9BQUEsR0FBVSxPQUFBLENBQVEsV0FBUjs7RUFDVixPQUFBLEdBQVUsT0FBQSxDQUFRLFdBQVI7O0VBRVYsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLElBQUEsRUFBTSxTQUFDLEtBQUQ7QUFFSixVQUFBO01BQUEsSUFBQSxHQUFPO01BR1AsSUFBSSxDQUFDLE9BQUwsQ0FBYSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IscUJBQWhCLENBQWI7TUFFQSxJQUFJLENBQUMsWUFBTCxDQUFrQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isd0JBQWhCLENBQWxCO01BRUEsSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsbUJBQWhCLENBQWY7TUFFQSxJQUFJLENBQUMsUUFBTCxDQUFjLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixrQkFBaEIsQ0FBZDtNQUVBLElBQUksQ0FBQyxRQUFMLENBQWMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG9CQUFoQixDQUFkLEVBQXFELEtBQXJELEVBQTRELEtBQTVEO01BR0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsY0FBaEIsQ0FBVixFQUEyQyxLQUEzQztNQUdBLElBQUksQ0FBQyxPQUFMLENBQWEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDJCQUFoQixDQUFiO01BRUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFaLENBQXdCLGNBQXhCLEVBQXdDLFNBQUMsS0FBRDtlQUN0QyxJ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QUFDLFlBQVIsQ0FDRTtRQUFBLE1BQUEsRUFBUSxhQUFSO1FBQ0EsTUFBQSxFQUFRLHFCQURSO1FBRUEsRUFBQSxFQUFJLENBQ0YsZ0JBREUsQ0FGSjtRQUtBLFNBQUEsRUFBVyxjQUxYO1FBTUEsR0FBQSxFQUFLLEdBTkw7UUFPQSxFQUFBLEVBQUksSUFBQyxDQUFBLE9BUEw7T0FERjtJQURPLENBdEZUO0lBa0dBLFFBQUEsRUFBVSxTQUFDLEdBQUQ7TUFDUixPQUFPLENBQUMsWUFBUixDQUNFO1FBQUEsTUFBQSxFQUFRLGFBQVI7UUFDQSxNQUFBLEVBQVEsa0JBRFI7UUFFQSxFQUFBLEVBQUksQ0FDRixnQkFERSxDQUZKO1FBS0EsU0FBQSxFQUFXLGdCQUxYO1FBTUEsR0FBQSxFQUFLLEdBTkw7UUFPQSxFQUFBLEVBQUksSUFBQyxDQUFBLFFBUEw7T0FERjtJQURRLENBbEdWO0lBK0dBLFNBQUEsRUFBVyxTQUFDLEdBQUQ7TUFDVCxPQUFPLENBQUMsWUFBUixDQUNFO1FBQUEsTUFBQSxFQUFRLGFBQVI7UUFDQSxNQUFBLEVBQVEsbUJBRFI7UUFFQSxFQUFBLEVBQUksQ0FBRSxnQkFBRixDQUZKO1FBR0EsU0FBQSxFQUFXLFlBSFg7UUFJQSxHQUFBLEVBQUssR0FKTDtRQUtBLEVBQUEsRUFBSSxJQUFDLENBQUEsU0FMTDtPQURGO0lBRFMsQ0EvR1g7SUEwSEEsWUFBQSxFQUFjLFNBQUMsR0FBRDthQUNaLE9BQU8sQ0FBQyxZQUFSLENBQ0U7UUFBQSxNQUFBLEVBQVEsY0FBUjtRQUNBLE1BQUEsRUFBUSx3QkFEUjtRQUVBLEVBQUEsRUFBSSxDQUNGLHNDQURFLEVBRUYsa0RBRkUsQ0FGSjtRQU1BLFNBQUEsRUFBVyxXQU5YO1FBT0EsR0FBQSxFQUFLLEdBUEw7UUFRQSxFQUFBLEVBQUksSUFBQyxDQUFBLFlBUkw7T0FERjtJQURZLENBMUhkOztBQUxGIiwic291cmNlc0NvbnRlbnQiOlsiRG9tID0gcmVxdWlyZSgnLi9kb20nKVxuVXRpbGl0eSA9IHJlcXVpcmUoJy4vdXRpbGl0eScpXG5IZWFkZXJzID0gcmVxdWlyZSgnLi9oZWFkZXJzJylcblxubW9kdWxlLmV4cG9ydHMgPVxuICBpbml0OiAoc3RhdGUpIC0+XG5cbiAgICBzZWxmID0gQFxuXG4gICAgIyBUQUIgU0laRVxuICAgIHNlbGYudGFiU2l6ZSBhdG9tLmNvbmZpZy5nZXQoJ3NldGktdWkuY29tcGFjdFZpZXcnKVxuICAgICMgRElTUExBWSBJR05PUkVEIEZJTEVTXG4gICAgc2VsZi5pZ25vcmVkRmlsZXMgYXRvbS5jb25maWcuZ2V0KCdzZXRpLXVpLmRpc3BsYXlJZ25vcmVkJylcbiAgICAjIERJU1BMQVkgRklMRSBJQ09OU1xuICAgIHNlbGYuZmlsZUljb25zIGF0b20uY29uZmlnLmdldCgnc2V0aS11aS5maWxlSWNvbnMnKVxuICAgICMgSElERSBUQUJTXG4gICAgc2VsZi5oaWRlVGFicyBhdG9tLmNvbmZpZy5nZXQoJ3NldGktdWkuaGlkZVRhYnMnKVxuICAgICMgU0VUIFRIRU1FXG4gICAgc2VsZi5zZXRUaGVtZSBhdG9tLmNvbmZpZy5nZXQoJ3NldGktdWkudGhlbWVDb2xvcicpLCBmYWxzZSwgZmFsc2VcblxuICAgICMgRk9OVCBGQU1JTFlcbiAgICBzZWxmLmZvbnQgYXRvbS5jb25maWcuZ2V0KCdzZXRpLXVpLmZvbnQnKSwgZmFsc2VcblxuICAgICMgQU5JTUFUSU9OU1xuICAgIHNlbGYuYW5pbWF0ZSBhdG9tLmNvbmZpZy5nZXQoJ3NldGktdWkuZGlzYWJsZUFuaW1hdGlvbnMnKVxuXG4gICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ3NldGktdWkuZm9udCcsICh2YWx1ZSkgLT5cbiAgICAgIHNlbGYuZm9udCBhdG9tLmNvbmZpZy5nZXQoJ3NldGktdWkuZm9udCcpLCB0cnVlXG5cbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnc2V0aS11aS50aGVtZUNvbG9yJywgKHZhbHVlKSAtPlxuICAgICAgc2VsZi5zZXRUaGVtZSB2YWx1ZS5uZXdWYWx1ZSwgdmFsdWUub2xkVmFsdWUsIHRydWVcblxuICBwYWNrYWdlOiBhdG9tLnBhY2thZ2VzLmdldExvYWRlZFBhY2thZ2UoJ3NldGktdWknKSxcblxuICAjIFJFTE9BRCBXSEVOIFNFVFRJTkdTIENIQU5HRVxuICByZWZyZXNoOiAtPlxuICAgIHNlbGYgPSBAXG4gICAgc2VsZi5wYWNrYWdlLmRlYWN0aXZhdGUoKVxuICAgIHNldEltbWVkaWF0ZSAtPlxuICAgICAgcmV0dXJuIHNlbGYucGFja2FnZS5hY3RpdmF0ZSgpXG5cbiAgIyBTRVQgRk9OVCBGQU1JTFlcbiAgZm9udDogKHZhbCwgcmVsb2FkKSAtPlxuICAgIHNlbGYgPSB0aGlzXG4gICAgZWwgPSBEb20ucXVlcnkoJ2F0b20td29ya3NwYWNlJylcblxuICAgIGlmIHZhbCA9PSAnUm9ib3RvJ1xuICAgICAgZWwuY2xhc3NMaXN0LmFkZCAnc2V0aS1yb2JvdG8nXG4gICAgZWxzZVxuICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSAnc2V0aS1yb2JvdG8nXG5cbiAgIyBTRVQgVEhFTUUgQ09MT1JcbiAgc2V0VGhlbWU6ICh0aGVtZSwgcHJldmlvdXMsIHJlbG9hZCkgLT5cbiAgICBzZWxmID0gdGhpc1xuICAgIGVsID0gRG9tLnF1ZXJ5KCdhdG9tLXdvcmtzcGFjZScpXG4gICAgZnMgPSByZXF1aXJlKCdmcycpXG4gICAgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuXG4gICAgIyBHRVQgT1VSIFBBQ0tBR0UgSU5GT1xuICAgIHBrZyA9IGF0b20ucGFja2FnZXMuZ2V0TG9hZGVkUGFja2FnZSgnc2V0aS11aScpXG5cbiAgICAjIFRIRU1FIERBVEFcbiAgICB0aGVtZURhdGEgPSAnQHNldGktcHJpbWFyeTogQCcgKyB0aGVtZS50b0xvd2VyQ2FzZSgpICsgJzsnXG4gICAgdGhlbWVEYXRhID0gdGhlbWVEYXRhICsgJ0BzZXRpLXByaW1hcnktdGV4dDogQCcgKyB0aGVtZS50b0xvd2VyQ2FzZSgpICsgJy10ZXh0OydcbiAgICB0aGVtZURhdGEgPSB0aGVtZURhdGEgKyAnQHNldGktcHJpbWFyeS1oaWdobGlnaHQ6IEAnICsgdGhlbWUudG9Mb3dlckNhc2UoKSArICctaGlnaGxpZ2h0OydcblxuICAgICMgU0FWRSBUTyBBVE9NIENPTkZJR1xuICAgIGF0b20uY29uZmlnLnNldCAnc2V0aS11aS50aGVtZUNvbG9yJywgdGhlbWVcblxuICAgICMgU0FWRSBVU0VSIFRIRU1FIEZJTEVcbiAgICBmcy53cml0ZUZpbGUgcGtnLnBhdGggKyAnL3N0eWxlcy91c2VyLXRoZW1lLmxlc3MnLCB0aGVtZURhdGEsIChlcnIpIC0+XG4gICAgICBpZiAhZXJyXG4gICAgICAgIGlmIHByZXZpb3VzXG4gICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSAnc2V0aS10aGVtZS0nICsgcHJldmlvdXMudG9Mb3dlckNhc2UoKVxuICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQgJ3NldGktdGhlbWUtJyArIHRoZW1lLnRvTG93ZXJDYXNlKClcbiAgICAgICAgaWYgcmVsb2FkXG4gICAgICAgICAgc2VsZi5yZWZyZXNoKClcblxuICAjIFNFVCBUQUIgU0laRVxuICBhbmltYXRlOiAodmFsKSAtPlxuICAgIFV0aWxpdHkuYXBwbHlTZXR0aW5nXG4gICAgICBhY3Rpb246ICdhZGRXaGVuRmFsc2UnXG4gICAgICBjb25maWc6ICdzZXRpLXVpLmRpc2FibGVBbmltYXRpb25zJ1xuICAgICAgZWw6IFtcbiAgICAgICAgJ2F0b20td29ya3NwYWNlJ1xuICAgICAgXVxuICAgICAgY2xhc3NOYW1lOiAnc2V0aS1hbmltYXRlJ1xuICAgICAgdmFsOiB2YWxcbiAgICAgIGNiOiBAYW5pbWF0ZVxuXG4gICMgU0VUIFRBQiBTSVpFXG4gIHRhYlNpemU6ICh2YWwpIC0+XG4gICAgVXRpbGl0eS5hcHBseVNldHRpbmdcbiAgICAgIGFjdGlvbjogJ2FkZFdoZW5UcnVlJ1xuICAgICAgY29uZmlnOiAnc2V0aS11aS5jb21wYWN0VmlldydcbiAgICAgIGVsOiBbXG4gICAgICAgICdhdG9tLXdvcmtzcGFjZSdcbiAgICAgIF1cbiAgICAgIGNsYXNzTmFtZTogJ3NldGktY29tcGFjdCdcbiAgICAgIHZhbDogdmFsXG4gICAgICBjYjogQHRhYlNpemVcblxuICAjIFNFVCBXSEVUSEVSIFdFIFNIT1cgVEFCU1xuICBoaWRlVGFiczogKHZhbCkgLT5cbiAgICBVdGlsaXR5LmFwcGx5U2V0dGluZ1xuICAgICAgYWN0aW9uOiAnYWRkV2hlblRydWUnXG4gICAgICBjb25maWc6ICdzZXRpLXVpLmhpZGVUYWJzJ1xuICAgICAgZWw6IFtcbiAgICAgICAgJ2F0b20td29ya3NwYWNlJ1xuICAgICAgXVxuICAgICAgY2xhc3NOYW1lOiAnc2V0aS1oaWRlLXRhYnMnXG4gICAgICB2YWw6IHZhbFxuICAgICAgY2I6IEBoaWRlVGFic1xuICAgIHJldHVyblxuXG4gICMgU0VUIFdIRVRIRVIgV0UgU0hPVyBGSUxFIElDT05TXG4gIGZpbGVJY29uczogKHZhbCkgLT5cbiAgICBVdGlsaXR5LmFwcGx5U2V0dGluZ1xuICAgICAgYWN0aW9uOiAnYWRkV2hlblRydWUnXG4gICAgICBjb25maWc6ICdzZXRpLXVpLmZpbGVJY29ucydcbiAgICAgIGVsOiBbICdhdG9tLXdvcmtzcGFjZScgXVxuICAgICAgY2xhc3NOYW1lOiAnc2V0aS1pY29ucydcbiAgICAgIHZhbDogdmFsXG4gICAgICBjYjogQGZpbGVJY29uc1xuICAgIHJldHVyblxuXG4gICMgU0VUIElGIFdFIFNIT1cgSUdOT1JFRCBGSUxFU1xuICBpZ25vcmVkRmlsZXM6ICh2YWwpIC0+XG4gICAgVXRpbGl0eS5hcHBseVNldHRpbmdcbiAgICAgIGFjdGlvbjogJ2FkZFdoZW5GYWxzZSdcbiAgICAgIGNvbmZpZzogJ3NldGktdWkuZGlzcGxheUlnbm9yZWQnXG4gICAgICBlbDogW1xuICAgICAgICAnLmZpbGUuZW50cnkubGlzdC1pdGVtLnN0YXR1cy1pZ25vcmVkJ1xuICAgICAgICAnLmRpcmVjdG9yeS5lbnRyeS5saXN0LW5lc3RlZC1pdGVtLnN0YXR1cy1pZ25vcmVkJ1xuICAgICAgXVxuICAgICAgY2xhc3NOYW1lOiAnc2V0aS1oaWRlJ1xuICAgICAgdmFsOiB2YWxcbiAgICAgIGNiOiBAaWdub3JlZEZpbGVzXG4iXX0=
