(function() {
  var clone, firstCharsEqual, fs, path, propertyPrefixPattern;

  fs = require('fs');

  path = require('path');

  propertyPrefixPattern = /(?:^|\[|\(|,|=|:|\s)\s*((Ember|this|\))\.(?:[a-zA-Z]+\.?){0,2})$/;

  module.exports = {
    selector: '.source.js',
    filterSuggestions: true,
    getSuggestions: function(arg) {
      var bufferPosition, editor, folder_parent_name, line, ref;
      bufferPosition = arg.bufferPosition, editor = arg.editor;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      folder_parent_name = (ref = editor.getPath().match("(controllers|routes)")) != null ? ref[0] : void 0;
      if (folder_parent_name) {
        this.ember_class = folder_parent_name.slice(0, folder_parent_name.length - 1);
      }
      return this.getCompletions(line);
    },
    load: function() {
      this.loadCompletions();
      atom.project.onDidChangePaths((function(_this) {
        return function() {
          return _this.scanProjectDirectories();
        };
      })(this));
      return this.scanProjectDirectories();
    },
    scanProjectDirectories: function() {
      this.packageDirectories = [];
      return atom.project.getDirectories().forEach((function(_this) {
        return function(directory) {
          if (directory == null) {
            return;
          }
          return _this.readMetadata(directory, function(error, metadata) {
            if (_this.isAtomPackage(metadata) || _this.isAtomCore(metadata)) {
              return _this.packageDirectories.push(directory);
            }
          });
        };
      })(this));
    },
    readMetadata: function(directory, callback) {
      return fs.readFile(path.join(directory.getPath(), 'package.json'), function(error, contents) {
        var metadata, parseError;
        if (error == null) {
          try {
            metadata = JSON.parse(contents);
          } catch (error1) {
            parseError = error1;
            error = parseError;
          }
        }
        return callback(error, metadata);
      });
    },
    isAtomPackage: function(metadata) {
      var ref, ref1;
      return (metadata != null ? (ref = metadata.engines) != null ? (ref1 = ref.atom) != null ? ref1.length : void 0 : void 0 : void 0) > 0;
    },
    isAtomCore: function(metadata) {
      return (metadata != null ? metadata.name : void 0) === 'atom';
    },
    isEditingAnAtomPackageFile: function(editor) {
      var directory, editorPath, i, len, parsedPath, ref, ref1;
      editorPath = editor.getPath();
      if (editorPath != null) {
        parsedPath = path.parse(editorPath);
        if (path.basename(parsedPath.dir) === '.atom') {
          if (parsedPath.base === 'init.coffee' || parsedPath.base === 'init.js') {
            return true;
          }
        }
      }
      ref1 = (ref = this.packageDirectories) != null ? ref : [];
      for (i = 0, len = ref1.length; i < len; i++) {
        directory = ref1[i];
        if (directory.contains(editorPath)) {
          return true;
        }
      }
      return false;
    },
    loadCompletions: function() {
      if (this.completions == null) {
        this.completions = {};
      }
      return fs.readFile(path.resolve(__dirname, '..', 'completions.json'), (function(_this) {
        return function(error, content) {
          if (error != null) {
            return;
          }
          return _this.completions = JSON.parse(content);
        };
      })(this));
    },
    getCompletions: function(line) {
      var completion, completions, i, j, len, len1, match, prefix, property, propertyCompletions, ref, ref1, ref2, ref3, segments, x;
      completions = [];
      match = (ref = propertyPrefixPattern.exec(line)) != null ? ref[1] : void 0;
      if (!match && line.indexOf('.') > 0) {
        x = line.split('.');
        ref1 = this.completions['functions'];
        for (i = 0, len = ref1.length; i < len; i++) {
          completion = ref1[i];
          if (!prefix || firstCharsEqual(completion.name, x[x.length - 1])) {
            completions.push(clone(completion));
          }
        }
        return completions;
      }
      if (!match) {
        return completions;
      }
      if (!this.ember_class) {
        return completions;
      }
      segments = match.split('.');
      prefix = (ref2 = segments.pop()) != null ? ref2 : '';
      segments = segments.filter(function(segment) {
        return segment;
      });
      property = segments[segments.length - 1];
      propertyCompletions = (ref3 = this.completions[this.ember_class][property]) != null ? ref3 : [];
      for (j = 0, len1 = propertyCompletions.length; j < len1; j++) {
        completion = propertyCompletions[j];
        if (!prefix || firstCharsEqual(completion.name, prefix)) {
          completions.push(clone(completion));
        }
      }
      return completions;
    },
    getPropertyClass: function(name) {
      var ref, ref1;
      return (ref = atom[name]) != null ? (ref1 = ref.constructor) != null ? ref1.name : void 0 : void 0;
    },
    loadProperty: function(propertyName, className, classes, parent) {
      var classCompletions, completion, i, len, propertyClass;
      classCompletions = classes[className];
      if (classCompletions == null) {
        return;
      }
      this.completions[propertyName] = {
        completions: []
      };
      for (i = 0, len = classCompletions.length; i < len; i++) {
        completion = classCompletions[i];
        this.completions[propertyName].completions.push(completion);
        if (completion.type === 'property') {
          propertyClass = this.getPropertyClass(completion.name);
          this.loadProperty(completion.name, propertyClass, classes);
        }
      }
    }
  };

  clone = function(obj) {
    var k, newObj, v;
    newObj = {};
    for (k in obj) {
      v = obj[k];
      newObj[k] = v;
    }
    return newObj;
  };

  firstCharsEqual = function(str1, str2) {
    return str1[0].toLowerCase() === str2[0].toLowerCase();
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2VtYmVyanMtYXRvbS9saWIvcHJvdmlkZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQLHFCQUFBLEdBQXdCOztFQUV4QixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsUUFBQSxFQUFVLFlBQVY7SUFDQSxpQkFBQSxFQUFtQixJQURuQjtJQUdBLGNBQUEsRUFBZ0IsU0FBQyxHQUFEO0FBQ2QsVUFBQTtNQURnQixxQ0FBZ0I7TUFDaEMsSUFBQSxHQUFPLE1BQU0sQ0FBQyxjQUFQLENBQXNCLENBQUMsQ0FBQyxjQUFjLENBQUMsR0FBaEIsRUFBcUIsQ0FBckIsQ0FBRCxFQUEwQixjQUExQixDQUF0QjtNQUNQLGtCQUFBLHVFQUFxRSxDQUFBLENBQUE7TUFDckUsSUFBRyxrQkFBSDtRQUNFLElBQUMsQ0FBQSxXQUFELEdBQWdCLGtCQUFrQixDQUFDLEtBQW5CLENBQXlCLENBQXpCLEVBQTJCLGtCQUFrQixDQUFDLE1BQW5CLEdBQTRCLENBQXZELEVBRGxCOzthQUdBLElBQUMsQ0FBQSxjQUFELENBQWdCLElBQWhCO0lBTmMsQ0FIaEI7SUFXQSxJQUFBLEVBQU0sU0FBQTtNQUNKLElBQUMsQ0FBQSxlQUFELENBQUE7TUFDQSxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFiLENBQThCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsc0JBQUQsQ0FBQTtRQUFIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QjthQUNBLElBQUMsQ0FBQSxzQkFBRCxDQUFBO0lBSEksQ0FYTjtJQWdCQSxzQkFBQSxFQUF3QixTQUFBO01BQ3RCLElBQUMsQ0FBQSxrQkFBRCxHQUFzQjth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LGFBQUEsR0FBZ0IsSUFBQyxDQUFBLGdCQUFELENBQWtCLFVBQVUsQ0FBQyxJQUE3QjtVQUNoQixJQUFDLENBQUEsWUFBRCxDQUFjLFVBQVUsQ0FBQyxJQUF6QixFQUErQixhQUEvQixFQUE4QyxPQUE5QyxFQUZGOztBQUZGO0lBTlksQ0FuRmQ7OztFQWdHRixLQUFBLEdBQVEsU0FBQyxHQUFEO0FBQ04sUUFBQTtJQUFBLE1BQUEsR0FBUztBQUNULFNBQUEsUUFBQTs7TUFBQSxNQUFPLENBQUEsQ0FBQSxDQUFQLEdBQVk7QUFBWjtXQUNBO0VBSE07O0VBS1IsZUFBQSxHQUFrQixTQUFDLElBQUQsRUFBTyxJQUFQO1dBQ2hCLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxXQUFSLENBQUEsQ0FBQSxLQUF5QixJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUMsV0FBUixDQUFBO0VBRFQ7QUEzR2xCIiwic291cmNlc0NvbnRlbnQiOlsiZnMgPSByZXF1aXJlICdmcydcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG5wcm9wZXJ0eVByZWZpeFBhdHRlcm4gPSAvKD86XnxcXFt8XFwofCx8PXw6fFxccylcXHMqKChFbWJlcnx0aGlzfFxcKSlcXC4oPzpbYS16QS1aXStcXC4/KXswLDJ9KSQvXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgc2VsZWN0b3I6ICcuc291cmNlLmpzJ1xuICBmaWx0ZXJTdWdnZXN0aW9uczogdHJ1ZVxuXG4gIGdldFN1Z2dlc3Rpb25zOiAoe2J1ZmZlclBvc2l0aW9uLCBlZGl0b3J9KSAtPlxuICAgIGxpbmUgPSBlZGl0b3IuZ2V0VGV4dEluUmFuZ2UoW1tidWZmZXJQb3NpdGlvbi5yb3csIDBdLCBidWZmZXJQb3NpdGlvbl0pXG4gICAgZm9sZGVyX3BhcmVudF9uYW1lID0gZWRpdG9yLmdldFBhdGgoKS5tYXRjaChcIihjb250cm9sbGVyc3xyb3V0ZXMpXCIpP1swXVxuICAgIGlmIGZvbGRlcl9wYXJlbnRfbmFtZVxuICAgICAgQGVtYmVyX2NsYXNzICA9IGZvbGRlcl9wYXJlbnRfbmFtZS5zbGljZSgwLGZvbGRlcl9wYXJlbnRfbmFtZS5sZW5ndGggLSAxKVxuXG4gICAgQGdldENvbXBsZXRpb25zKGxpbmUpXG5cbiAgbG9hZDogLT5cbiAgICBAbG9hZENvbXBsZXRpb25zKClcbiAgICBhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocyA9PiBAc2NhblByb2plY3REaXJlY3RvcmllcygpXG4gICAgQHNjYW5Qcm9qZWN0RGlyZWN0b3JpZXMoKVxuXG4gIHNjYW5Qcm9qZWN0RGlyZWN0b3JpZXM6IC0+XG4gICAgQHBhY2thZ2VEaXJlY3RvcmllcyA9IFtdXG4gICAgYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKCkuZm9yRWFjaCAoZGlyZWN0b3J5KSA9PlxuICAgICAgcmV0dXJuIHVubGVzcyBkaXJlY3Rvcnk/XG4gICAgICBAcmVhZE1ldGFkYXRhIGRpcmVjdG9yeSwgKGVycm9yLCBtZXRhZGF0YSkgPT5cbiAgICAgICAgaWYgQGlzQXRvbVBhY2thZ2UobWV0YWRhdGEpIG9yIEBpc0F0b21Db3JlKG1ldGFkYXRhKVxuICAgICAgICAgIEBwYWNrYWdlRGlyZWN0b3JpZXMucHVzaChkaXJlY3RvcnkpXG5cbiAgcmVhZE1ldGFkYXRhOiAoZGlyZWN0b3J5LCBjYWxsYmFjaykgLT5cbiAgICBmcy5yZWFkRmlsZSBwYXRoLmpvaW4oZGlyZWN0b3J5LmdldFBhdGgoKSwgJ3BhY2thZ2UuanNvbicpLCAoZXJyb3IsIGNvbnRlbnRzKSAtPlxuICAgICAgdW5sZXNzIGVycm9yP1xuICAgICAgICB0cnlcbiAgICAgICAgICBtZXRhZGF0YSA9IEpTT04ucGFyc2UoY29udGVudHMpXG4gICAgICAgIGNhdGNoIHBhcnNlRXJyb3JcbiAgICAgICAgICBlcnJvciA9IHBhcnNlRXJyb3JcbiAgICAgIGNhbGxiYWNrKGVycm9yLCBtZXRhZGF0YSlcblxuICBpc0F0b21QYWNrYWdlOiAobWV0YWRhdGEpIC0+XG4gICAgbWV0YWRhdGE/LmVuZ2luZXM/LmF0b20/Lmxlbmd0aCA+IDBcblxuICBpc0F0b21Db3JlOiAobWV0YWRhdGEpIC0+XG4gICAgbWV0YWRhdGE/Lm5hbWUgaXMgJ2F0b20nXG5cbiAgaXNFZGl0aW5nQW5BdG9tUGFja2FnZUZpbGU6IChlZGl0b3IpIC0+XG4gICAgZWRpdG9yUGF0aCA9IGVkaXRvci5nZXRQYXRoKClcbiAgICBpZiBlZGl0b3JQYXRoP1xuICAgICAgcGFyc2VkUGF0aCA9IHBhdGgucGFyc2UoZWRpdG9yUGF0aClcbiAgICAgIGlmIHBhdGguYmFzZW5hbWUocGFyc2VkUGF0aC5kaXIpIGlzICcuYXRvbSdcbiAgICAgICAgaWYgcGFyc2VkUGF0aC5iYXNlIGlzICdpbml0LmNvZmZlZScgb3IgcGFyc2VkUGF0aC5iYXNlIGlzICdpbml0LmpzJ1xuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgZm9yIGRpcmVjdG9yeSBpbiBAcGFja2FnZURpcmVjdG9yaWVzID8gW11cbiAgICAgIHJldHVybiB0cnVlIGlmIGRpcmVjdG9yeS5jb250YWlucyhlZGl0b3JQYXRoKVxuICAgIGZhbHNlXG5cbiAgbG9hZENvbXBsZXRpb25zOiAtPlxuICAgIEBjb21wbGV0aW9ucyA/PSB7fVxuXG4gICAgZnMucmVhZEZpbGUgcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uJywgJ2NvbXBsZXRpb25zLmpzb24nKSwgKGVycm9yLCBjb250ZW50KSA9PlxuICAgICAgcmV0dXJuIGlmIGVycm9yP1xuICAgICAgQGNvbXBsZXRpb25zID0gSlNPTi5wYXJzZShjb250ZW50KVxuXG4gIGdldENvbXBsZXRpb25zOiAobGluZSkgLT5cbiAgICBjb21wbGV0aW9ucyA9IFtdXG4gICAgbWF0Y2ggPSAgcHJvcGVydHlQcmVmaXhQYXR0ZXJuLmV4ZWMobGluZSk/WzFdXG4gICAgaWYgIW1hdGNoICYmIGxpbmUuaW5kZXhPZignLicpID4gMFxuICAgICAgeCA9IGxpbmUuc3BsaXQoJy4nKVxuICAgICAgZm9yIGNvbXBsZXRpb24gaW4gQGNvbXBsZXRpb25zWydmdW5jdGlvbnMnXSB3aGVuIG5vdCBwcmVmaXggb3IgZmlyc3RDaGFyc0VxdWFsKGNvbXBsZXRpb24ubmFtZSwgeFt4Lmxlbmd0aCAtIDFdKVxuICAgICAgICBjb21wbGV0aW9ucy5wdXNoKGNsb25lKGNvbXBsZXRpb24pKVxuICAgICAgcmV0dXJuIGNvbXBsZXRpb25zXG5cbiAgICByZXR1cm4gY29tcGxldGlvbnMgdW5sZXNzIG1hdGNoXG4gICAgcmV0dXJuIGNvbXBsZXRpb25zIHVubGVzcyBAZW1iZXJfY2xhc3NcblxuICAgIHNlZ21lbnRzID0gbWF0Y2guc3BsaXQoJy4nKVxuICAgIHByZWZpeCA9IHNlZ21lbnRzLnBvcCgpID8gJydcbiAgICBzZWdtZW50cyA9IHNlZ21lbnRzLmZpbHRlciAoc2VnbWVudCkgLT4gc2VnbWVudFxuICAgIHByb3BlcnR5ID0gc2VnbWVudHNbc2VnbWVudHMubGVuZ3RoIC0gMV1cblxuICAgIHByb3BlcnR5Q29tcGxldGlvbnMgPSBAY29tcGxldGlvbnNbQGVtYmVyX2NsYXNzXVtwcm9wZXJ0eV0gPyBbXVxuXG4gICAgZm9yIGNvbXBsZXRpb24gaW4gcHJvcGVydHlDb21wbGV0aW9ucyB3aGVuIG5vdCBwcmVmaXggb3IgZmlyc3RDaGFyc0VxdWFsKGNvbXBsZXRpb24ubmFtZSwgcHJlZml4KVxuICAgICAgY29tcGxldGlvbnMucHVzaChjbG9uZShjb21wbGV0aW9uKSlcbiAgICBjb21wbGV0aW9uc1xuXG4gIGdldFByb3BlcnR5Q2xhc3M6IChuYW1lKSAtPlxuICAgIGF0b21bbmFtZV0/LmNvbnN0cnVjdG9yPy5uYW1lXG5cbiAgbG9hZFByb3BlcnR5OiAocHJvcGVydHlOYW1lLCBjbGFzc05hbWUsIGNsYXNzZXMsIHBhcmVudCkgLT5cbiAgICBjbGFzc0NvbXBsZXRpb25zID0gY2xhc3Nlc1tjbGFzc05hbWVdXG4gICAgcmV0dXJuIHVubGVzcyBjbGFzc0NvbXBsZXRpb25zP1xuXG4gICAgQGNvbXBsZXRpb25zW3Byb3BlcnR5TmFtZV0gPSBjb21wbGV0aW9uczogW11cblxuICAgIGZvciBjb21wbGV0aW9uIGluIGNsYXNzQ29tcGxldGlvbnNcbiAgICAgIEBjb21wbGV0aW9uc1twcm9wZXJ0eU5hbWVdLmNvbXBsZXRpb25zLnB1c2goY29tcGxldGlvbilcbiAgICAgIGlmIGNvbXBsZXRpb24udHlwZSBpcyAncHJvcGVydHknXG4gICAgICAgIHByb3BlcnR5Q2xhc3MgPSBAZ2V0UHJvcGVydHlDbGFzcyhjb21wbGV0aW9uLm5hbWUpXG4gICAgICAgIEBsb2FkUHJvcGVydHkoY29tcGxldGlvbi5uYW1lLCBwcm9wZXJ0eUNsYXNzLCBjbGFzc2VzKVxuICAgIHJldHVyblxuXG5jbG9uZSA9IChvYmopIC0+XG4gIG5ld09iaiA9IHt9XG4gIG5ld09ialtrXSA9IHYgZm9yIGssIHYgb2Ygb2JqXG4gIG5ld09ialxuXG5maXJzdENoYXJzRXF1YWwgPSAoc3RyMSwgc3RyMikgLT5cbiAgc3RyMVswXS50b0xvd2VyQ2FzZSgpIGlzIHN0cjJbMF0udG9Mb3dlckNhc2UoKVxuIl19
