(function() {
  var $, FileItem, FileView, View, git, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom-space-pen-views'), View = ref.View, $ = ref.$;

  git = require('../git');

  FileItem = (function(superClass) {
    extend(FileItem, superClass);

    function FileItem() {
      return FileItem.__super__.constructor.apply(this, arguments);
    }

    FileItem.content = function(file) {
      console.log('file', file);
      return this.div({
        "class": "file " + file.type,
        'data-name': file.name
      }, (function(_this) {
        return function() {
          _this.span({
            "class": 'clickable text',
            click: 'select',
            title: file.name
          }, file.name);
          _this.i({
            "class": 'icon check clickable',
            click: 'select'
          });
          return _this.i({
            "class": "icon " + (file.type === 'modified' ? 'clickable' : '') + " file-" + file.type,
            click: 'showFileDiff'
          });
        };
      })(this));
    };

    FileItem.prototype.initialize = function(file) {
      return this.file = file;
    };

    FileItem.prototype.showFileDiff = function() {
      if (this.file.type === 'modified') {
        return this.file.showFileDiff(this.file.name);
      }
    };

    FileItem.prototype.select = function() {
      return this.file.select(this.file.name);
    };

    return FileItem;

  })(View);

  module.exports = FileView = (function(superClass) {
    extend(FileView, superClass);

    function FileView() {
      return FileView.__super__.constructor.apply(this, arguments);
    }

    FileView.content = function() {
      return this.div({
        "class": 'files'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'heading clickable'
          }, function() {
            _this.i({
              click: 'toggleBranch',
              "class": 'icon forked'
            });
            _this.span({
              click: 'toggleBranch'
            }, 'Workspace:');
            _this.span('', {
              outlet: 'workspaceTitle'
            });
            return _this.div({
              "class": 'action',
              click: 'selectAll'
            }, function() {
              _this.span('Select all');
              _this.i({
                "class": 'icon check'
              });
              return _this.input({
                "class": 'invisible',
                type: 'checkbox',
                outlet: 'allCheckbox',
                checked: true
              });
            });
          });
          return _this.div({
            "class": 'placeholder'
          }, 'No local working copy changes detected');
        };
      })(this));
    };

    FileView.prototype.initialize = function() {
      this.files = {};
      this.arrayOfFiles = new Array;
      return this.hidden = false;
    };

    FileView.prototype.toggleBranch = function() {
      if (this.hidden) {
        this.addAll(this.arrayOfFiles);
      } else {
        this.clearAll();
      }
      return this.hidden = !this.hidden;
    };

    FileView.prototype.hasSelected = function() {
      var file, name, ref1;
      ref1 = this.files;
      for (name in ref1) {
        file = ref1[name];
        if (file.selected) {
          return true;
        }
      }
      return false;
    };

    FileView.prototype.getSelected = function() {
      var file, files, name, ref1;
      files = {
        all: [],
        add: [],
        rem: []
      };
      ref1 = this.files;
      for (name in ref1) {
        file = ref1[name];
        if (!file.selected) {
          continue;
        }
        files.all.push(file.name);
        switch (file.type) {
          case 'deleted':
            files.rem.push(file.name);
            break;
          default:
            files.add.push(file.name);
        }
      }
      return files;
    };

    FileView.prototype.showSelected = function() {
      var file, fnames, name, ref1;
      fnames = [];
      this.arrayOfFiles = Object.keys(this.files).map((function(_this) {
        return function(file) {
          return _this.files[file];
        };
      })(this));
      this.find('.file').toArray().forEach((function(_this) {
        return function(div) {
          var f, name;
          f = $(div);
          if (name = f.attr('data-name')) {
            if (_this.files[name].selected) {
              fnames.push(name);
              f.addClass('active');
            } else {
              f.removeClass('active');
            }
          }
        };
      })(this));
      ref1 = this.files;
      for (name in ref1) {
        file = ref1[name];
        if (indexOf.call(fnames, name) < 0) {
          file.selected = false;
        }
      }
      this.parentView.showSelectedFiles();
    };

    FileView.prototype.clearAll = function() {
      this.find('>.file').remove();
    };

    FileView.prototype.addAll = function(files) {
      var file, fnames, name, ref1, select, showFileDiff;
      fnames = [];
      this.clearAll();
      if (files.length) {
        this.removeClass('none');
        select = (function(_this) {
          return function(name) {
            return _this.selectFile(name);
          };
        })(this);
        showFileDiff = (function(_this) {
          return function(name) {
            return _this.showFileDiff(name);
          };
        })(this);
        files.forEach((function(_this) {
          return function(file) {
            var base, name1, tempName;
            fnames.push(file.name);
            file.select = select;
            file.showFileDiff = showFileDiff;
            tempName = file.name;
            if (tempName.indexOf(' ') > 0) {
              tempName = '\"' + tempName + '\"';
            }
            (base = _this.files)[name1 = file.name] || (base[name1] = {
              name: tempName
            });
            _this.files[file.name].type = file.type;
            _this.files[file.name].selected = file.selected;
            _this.append(new FileItem(file));
          };
        })(this));
      } else {
        this.addClass('none');
      }
      ref1 = this.files;
      for (name in ref1) {
        file = ref1[name];
        if (indexOf.call(fnames, name) < 0) {
          file.selected = false;
        }
      }
      this.showSelected();
    };

    FileView.prototype.showFileDiff = function(name) {
      return git.diff(name).then((function(_this) {
        return function(diffs) {
          _this.parentView.diffView.clearAll();
          return _this.parentView.diffView.addAll(diffs);
        };
      })(this));
    };

    FileView.prototype.selectFile = function(name) {
      if (name) {
        this.files[name].selected = !!!this.files[name].selected;
      }
      this.allCheckbox.prop('checked', false);
      this.showSelected();
    };

    FileView.prototype.selectAll = function() {
      var file, name, ref1, val;
      if (this.hidden) {
        return;
      }
      val = !!!this.allCheckbox.prop('checked');
      this.allCheckbox.prop('checked', val);
      ref1 = this.files;
      for (name in ref1) {
        file = ref1[name];
        file.selected = val;
      }
      this.showSelected();
    };

    FileView.prototype.unselectAll = function() {
      var file, i, len, name, ref1;
      ref1 = this.files;
      for (file = i = 0, len = ref1.length; i < len; file = ++i) {
        name = ref1[file];
        if (file.selected) {
          file.selected = false;
        }
      }
    };

    FileView.prototype.setWorkspaceTitle = function(title) {
      this.workspaceTitle.text(title);
    };

    return FileView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi92aWV3cy9maWxlLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxxQ0FBQTtJQUFBOzs7O0VBQUEsTUFBWSxPQUFBLENBQVEsc0JBQVIsQ0FBWixFQUFDLGVBQUQsRUFBTzs7RUFDUCxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBRUE7Ozs7Ozs7SUFDSixRQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsSUFBRDtNQUNSLE9BQU8sQ0FBQyxHQUFSLENBQVksTUFBWixFQUFvQixJQUFwQjthQUNBLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLE9BQUEsR0FBUSxJQUFJLENBQUMsSUFBcEI7UUFBNEIsV0FBQSxFQUFhLElBQUksQ0FBQyxJQUE5QztPQUFMLEVBQXlELENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUN2RCxLQUFDLENBQUEsSUFBRCxDQUFNO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxnQkFBUDtZQUF5QixLQUFBLEVBQU8sUUFBaEM7WUFBMEMsS0FBQSxFQUFPLElBQUksQ0FBQyxJQUF0RDtXQUFOLEVBQWtFLElBQUksQ0FBQyxJQUF2RTtVQUNBLEtBQUMsQ0FBQSxDQUFELENBQUc7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHNCQUFQO1lBQStCLEtBQUEsRUFBTyxRQUF0QztXQUFIO2lCQUNBLEtBQUMsQ0FBQSxDQUFELENBQUc7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLE9BQUEsR0FBTyxDQUFLLElBQUksQ0FBQyxJQUFMLEtBQWEsVUFBakIsR0FBa0MsV0FBbEMsR0FBbUQsRUFBcEQsQ0FBUCxHQUE4RCxRQUE5RCxHQUFzRSxJQUFJLENBQUMsSUFBbEY7WUFBMEYsS0FBQSxFQUFPLGNBQWpHO1dBQUg7UUFIdUQ7TUFB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Q0FBQyxDQUFDLENBQUMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxJQUFiLENBQWtCLFNBQWxCO01BQ1QsSUFBQyxDQUFBLFdBQVcsQ0FBQyxJQUFiLENBQWtCLFNBQWxCLEVBQTZCLEdBQTdCO0FBRUE7QUFBQSxXQUFBLFlBQUE7O1FBQ0UsSUFBSSxDQUFDLFFBQUwsR0FBZ0I7QUFEbEI7TUFHQSxJQUFDLENBQUEsWUFBRCxDQUFBO0lBUlM7O3VCQVdYLFdBQUEsR0FBYSxTQUFBO0FBQ1gsVUFBQTtBQUFBO0FBQUEsV0FBQSxvREFBQTs7WUFBOEIsSUFBSSxDQUFDO1VBQ2pDLElBQUksQ0FBQyxRQUFMLEdBQWdCOztBQURsQjtJQURXOzt1QkFNYixpQkFBQSxHQUFtQixTQUFDLEtBQUQ7TUFDakIsSUFBQyxDQUFBLGNBQWMsQ0FBQyxJQUFoQixDQUFxQixLQUFyQjtJQURpQjs7OztLQXJJRTtBQXRCdkIiLCJzb3VyY2VzQ29udGVudCI6WyJ7VmlldywgJH0gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcbmdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcblxuY2xhc3MgRmlsZUl0ZW0gZXh0ZW5kcyBWaWV3XG4gIEBjb250ZW50OiAoZmlsZSkgLT5cbiAgICBjb25zb2xlLmxvZygnZmlsZScsIGZpbGUpXG4gICAgQGRpdiBjbGFzczogXCJmaWxlICN7ZmlsZS50eXBlfVwiLCAnZGF0YS1uYW1lJzogZmlsZS5uYW1lLCA9PlxuICAgICAgQHNwYW4gY2xhc3M6ICdjbGlja2FibGUgdGV4dCcsIGNsaWNrOiAnc2VsZWN0JywgdGl0bGU6IGZpbGUubmFtZSwgZmlsZS5uYW1lXG4gICAgICBAaSBjbGFzczogJ2ljb24gY2hlY2sgY2xpY2thYmxlJywgY2xpY2s6ICdzZWxlY3QnXG4gICAgICBAaSBjbGFzczogXCJpY29uICN7aWYgKGZpbGUudHlwZSA9PSAnbW9kaWZpZWQnKSB0aGVuICdjbGlja2FibGUnIGVsc2UgJyd9IGZpbGUtI3tmaWxlLnR5cGV9XCIsIGNsaWNrOiAnc2hvd0ZpbGVEaWZmJ1xuXG4gIGluaXRpYWxpemU6IChmaWxlKSAtPlxuICAgIEBmaWxlID0gZmlsZVxuXG4gIHNob3dGaWxlRGlmZjogLT5cbiAgICBpZiBAZmlsZS50eXBlID09ICdtb2RpZmllZCdcbiAgICAgIEBmaWxlLnNob3dGaWxlRGlmZihAZmlsZS5uYW1lKVxuXG4gIHNlbGVjdDogLT5cbiAgICBAZmlsZS5zZWxlY3QoQGZpbGUubmFtZSlcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgRmlsZVZpZXcgZXh0ZW5kcyBWaWV3XG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6ICdmaWxlcycsID0+XG4gICAgICBAZGl2IGNsYXNzOiAnaGVhZGluZyBjbGlja2FibGUnLCA9PlxuICAgICAgICBAaSBjbGljazogJ3RvZ2dsZUJyYW5jaCcsIGNsYXNzOiAnaWNvbiBmb3JrZWQnXG4gICAgICAgIEBzcGFuIGNsaWNrOiAndG9nZ2xlQnJhbmNoJywgJ1dvcmtzcGFjZTonXG4gICAgICAgIEBzcGFuICcnLCBvdXRsZXQ6ICd3b3Jrc3BhY2VUaXRsZSdcbiAgICAgICAgQGRpdiBjbGFzczogJ2FjdGlvbicsIGNsaWNrOiAnc2VsZWN0QWxsJywgPT5cbiAgICAgICAgICBAc3BhbiAnU2VsZWN0IGFsbCdcbiAgICAgICAgICBAaSBjbGFzczogJ2ljb24gY2hlY2snXG4gICAgICAgICAgQGlucHV0IGNsYXNzOiAnaW52aXNpYmxlJywgdHlwZTogJ2NoZWNrYm94Jywgb3V0bGV0OiAnYWxsQ2hlY2tib3gnLCBjaGVja2VkOiB0cnVlXG4gICAgICBAZGl2IGNsYXNzOiAncGxhY2Vob2xkZXInLCAnTm8gbG9jYWwgd29ya2luZyBjb3B5IGNoYW5nZXMgZGV0ZWN0ZWQnXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBAZmlsZXMgPSB7fVxuICAgIEBhcnJheU9mRmlsZXMgPSBuZXcgQXJyYXlcbiAgICBAaGlkZGVuID0gZmFsc2VcblxuICB0b2dnbGVCcmFuY2g6IC0+XG4gICAgaWYgQGhpZGRlbiB0aGVuIEBhZGRBbGwgQGFycmF5T2ZGaWxlcyBlbHNlIGRvIEBjbGVhckFsbFxuICAgIEBoaWRkZW4gPSAhQGhpZGRlblxuXG4gIGhhc1NlbGVjdGVkOiAtPlxuICAgIGZvciBuYW1lLCBmaWxlIG9mIEBmaWxlcyB3aGVuIGZpbGUuc2VsZWN0ZWRcbiAgICAgIHJldHVybiB0cnVlXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgZ2V0U2VsZWN0ZWQ6IC0+XG4gICAgZmlsZXMgPVxuICAgICAgYWxsOiBbXVxuICAgICAgYWRkOiBbXVxuICAgICAgcmVtOiBbXVxuXG4gICAgZm9yIG5hbWUsIGZpbGUgb2YgQGZpbGVzIHdoZW4gZmlsZS5zZWxlY3RlZFxuICAgICAgZmlsZXMuYWxsLnB1c2ggZmlsZS5uYW1lXG4gICAgICBzd2l0Y2ggZmlsZS50eXBlXG4gICAgICAgIHdoZW4gJ2RlbGV0ZWQnIHRoZW4gZmlsZXMucmVtLnB1c2ggZmlsZS5uYW1lXG4gICAgICAgIGVsc2UgZmlsZXMuYWRkLnB1c2ggZmlsZS5uYW1lXG5cbiAgICByZXR1cm4gZmlsZXNcblxuICBzaG93U2VsZWN0ZWQ6IC0+XG4gICAgZm5hbWVzID0gW11cbiAgICBAYXJyYXlPZkZpbGVzID0gT2JqZWN0LmtleXMoQGZpbGVzKS5tYXAoKGZpbGUpID0+IEBmaWxlc1tmaWxlXSk7XG4gICAgQGZpbmQoJy5maWxlJykudG9BcnJheSgpLmZvckVhY2ggKGRpdikgPT5cbiAgICAgIGYgPSAkKGRpdilcblxuICAgICAgaWYgbmFtZSA9IGYuYXR0cignZGF0YS1uYW1lJylcbiAgICAgICAgaWYgQGZpbGVzW25hbWVdLnNlbGVjdGVkXG4gICAgICAgICAgZm5hbWVzLnB1c2ggbmFtZVxuICAgICAgICAgIGYuYWRkQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBmLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuICAgICAgcmV0dXJuXG5cbiAgICBmb3IgbmFtZSwgZmlsZSBvZiBAZmlsZXNcbiAgICAgIHVubGVzcyBuYW1lIGluIGZuYW1lc1xuICAgICAgICBmaWxlLnNlbGVjdGVkID0gZmFsc2VcblxuICAgIEBwYXJlbnRWaWV3LnNob3dTZWxlY3RlZEZpbGVzKClcbiAgICByZXR1cm5cblxuICBjbGVhckFsbDogLT5cbiAgICBAZmluZCgnPi5maWxlJykucmVtb3ZlKClcbiAgICByZXR1cm5cblxuICBhZGRBbGw6IChmaWxlcykgLT5cbiAgICBmbmFtZXMgPSBbXVxuXG4gICAgQGNsZWFyQWxsKClcblxuICAgIGlmIGZpbGVzLmxlbmd0aFxuICAgICAgQHJlbW92ZUNsYXNzKCdub25lJylcblxuICAgICAgc2VsZWN0ID0gKG5hbWUpID0+IEBzZWxlY3RGaWxlKG5hbWUpXG4gICAgICBzaG93RmlsZURpZmYgPSAobmFtZSkgPT4gQHNob3dGaWxlRGlmZihuYW1lKVxuXG4gICAgICBmaWxlcy5mb3JFYWNoIChmaWxlKSA9PlxuICAgICAgICBmbmFtZXMucHVzaCBmaWxlLm5hbWVcblxuICAgICAgICBmaWxlLnNlbGVjdCA9IHNlbGVjdFxuICAgICAgICBmaWxlLnNob3dGaWxlRGlmZiA9IHNob3dGaWxlRGlmZlxuXG4gICAgICAgIHRlbXBOYW1lID0gZmlsZS5uYW1lXG4gICAgICAgIGlmIHRlbXBOYW1lLmluZGV4T2YoJyAnKSA+IDAgdGhlbiB0ZW1wTmFtZSA9ICdcXFwiJyArIHRlbXBOYW1lICsgJ1xcXCInXG5cbiAgICAgICAgQGZpbGVzW2ZpbGUubmFtZV0gb3I9IG5hbWU6IHRlbXBOYW1lXG4gICAgICAgIEBmaWxlc1tmaWxlLm5hbWVdLnR5cGUgPSBmaWxlLnR5cGVcbiAgICAgICAgQGZpbGVzW2ZpbGUubmFtZV0uc2VsZWN0ZWQgPSBmaWxlLnNlbGVjdGVkXG4gICAgICAgIEBhcHBlbmQgbmV3IEZpbGVJdGVtKGZpbGUpXG4gICAgICAgIHJldHVyblxuXG4gICAgZWxzZVxuICAgICAgQGFkZENsYXNzKCdub25lJylcblxuICAgIGZvciBuYW1lLCBmaWxlIG9mIEBmaWxlc1xuICAgICAgdW5sZXNzIG5hbWUgaW4gZm5hbWVzXG4gICAgICAgIGZpbGUuc2VsZWN0ZWQgPSBmYWxzZVxuXG4gICAgQHNob3dTZWxlY3RlZCgpXG4gICAgcmV0dXJuXG5cbiAgc2hvd0ZpbGVEaWZmOiAobmFtZSkgLT5cbiAgICBnaXQuZGlmZihuYW1lKS50aGVuIChkaWZmcykgPT5cbiAgICAgIEBwYXJlbnRWaWV3LmRpZmZWaWV3LmNsZWFyQWxsKClcbiAgICAgIEBwYXJlbnRWaWV3LmRpZmZWaWV3LmFkZEFsbChkaWZmcylcblxuXG4gIHNlbGVjdEZpbGU6IChuYW1lKSAtPlxuICAgIGlmIG5hbWVcbiAgICAgIEBmaWxlc1tuYW1lXS5zZWxlY3RlZCA9ICEhIUBmaWxlc1tuYW1lXS5zZWxlY3RlZFxuXG4gICAgQGFsbENoZWNrYm94LnByb3AoJ2NoZWNrZWQnLCBmYWxzZSlcbiAgICBAc2hvd1NlbGVjdGVkKClcbiAgICByZXR1cm5cblxuICBzZWxlY3RBbGw6IC0+XG4gICAgcmV0dXJuIGlmIEBoaWRkZW5cbiAgICB2YWwgPSAhISFAYWxsQ2hlY2tib3gucHJvcCgnY2hlY2tlZCcpXG4gICAgQGFsbENoZWNrYm94LnByb3AoJ2NoZWNrZWQnLCB2YWwpXG5cbiAgICBmb3IgbmFtZSwgZmlsZSBvZiBAZmlsZXNcbiAgICAgIGZpbGUuc2VsZWN0ZWQgPSB2YWxcblxuICAgIEBzaG93U2VsZWN0ZWQoKVxuICAgIHJldHVyblxuXG4gIHVuc2VsZWN0QWxsOiAtPlxuICAgIGZvciBuYW1lLCBmaWxlIGluIEBmaWxlcyB3aGVuIGZpbGUuc2VsZWN0ZWRcbiAgICAgIGZpbGUuc2VsZWN0ZWQgPSBmYWxzZVxuXG4gICAgcmV0dXJuXG5cbiAgc2V0V29ya3NwYWNlVGl0bGU6ICh0aXRsZSkgLT5cbiAgICBAd29ya3NwYWNlVGl0bGUudGV4dCh0aXRsZSlcbiAgICByZXR1cm5cbiJdfQ==
