(function() {
  var HtmlEntities, XmlEntities, countTabs, crypto, escape_sql, htmlEntities, string, tabify, unescape_sql, untabify, xmlEntities,
    modulo = function(a, b) { return (+a % (b = +b) + b) % b; };

  HtmlEntities = require('html-entities').AllHtmlEntities;

  htmlEntities = new HtmlEntities();

  XmlEntities = require('html-entities').XmlEntities;

  xmlEntities = new XmlEntities();

  crypto = require('crypto');

  string = require('string');

  module.exports = {
    activate: function() {
      atom.commands.add('atom-workspace', 'text-manipulation:base64-encode', (function(_this) {
        return function() {
          return _this.convert(_this.encodeBase64);
        };
      })(this));
      atom.commands.add('atom-workspace', 'text-manipulation:base64-decode', (function(_this) {
        return function() {
          return _this.convert(_this.decodeBase64);
        };
      })(this));
      atom.commands.add('atom-workspace', 'text-manipulation:html-encode', (function(_this) {
        return function() {
          return _this.convert(_this.encodeHtml);
        };
      })(this));
      atom.commands.add('atom-workspace', 'text-manipulation:html-decode', (function(_this) {
        return function() {
          return _this.convert(_this.decodeHtml);
        };
      })(this));
      atom.commands.add('atom-workspace', 'text-manipulation:xml-encode', (function(_this) {
        return function() {
          return _this.convert(_this.encodeXml);
        };
      })(this));
      atom.commands.add('atom-workspace', 'text-manipulation:xml-decode', (function(_this) {
        return function() {
          return _this.convert(_this.decodeXml);
        };
      })(this));
      atom.commands.add('atom-workspace', 'text-manipulation:sql-encode', (function(_this) {
        return function() {
          return _this.convert(_this.encodeSql);
        };
      })(this));
      atom.commands.add('atom-workspace', 'text-manipulation:sql-decode', (function(_this) {
        return function() {
          return _this.convert(_this.decodeSql);
        };
      })(this));
      atom.commands.add('atom-workspace', 'text-manipulation:url-encode', (function(_this) {
        return function() {
          return _this.convert(_this.encodeUrl);
        };
      })(this));
      atom.commands.add('atom-workspace', 'text-manipulation:url-decode', (function(_this) {
        return function() {
          return _this.convert(_this.decodeUrl);
        };
      })(this));
      atom.commands.add('atom-workspace', 'text-manipulation:hash-md5', (function(_this) {
        return function() {
          return _this.convert(_this.hashMD5);
        };
      })(this));
      atom.commands.add('atom-workspace', 'text-manipulation:hash-sha1', (function(_this) {
        return function() {
          return _this.convert(_this.hashSHA1);
        };
      })(this));
      atom.commands.add('atom-workspace', 'text-manipulation:hash-sha256', (function(_this) {
        return function() {
          return _this.convert(_this.hashSHA256);
        };
      })(this));
      atom.commands.add('atom-workspace', 'text-manipulation:hash-sha512', (function(_this) {
        return function() {
          return _this.convert(_this.hashSHA512);
        };
      })(this));
      atom.commands.add('atom-workspace', 'text-manipulation:format-camelize', (function(_this) {
        return function() {
          return _this.convert(_this.formatCamelize);
        };
      })(this));
      atom.commands.add('atom-workspace', 'text-manipulation:format-dasherize', (function(_this) {
        return function() {
          return _this.convert(_this.formatDasherize);
        };
      })(this));
      atom.commands.add('atom-workspace', 'text-manipulation:format-underscore', (function(_this) {
        return function() {
          return _this.convert(_this.formatUnderscore);
        };
      })(this));
      atom.commands.add('atom-workspace', 'text-manipulation:format-slugify', (function(_this) {
        return function() {
          return _this.convert(_this.formatSlugify);
        };
      })(this));
      atom.commands.add('atom-workspace', 'text-manipulation:format-humanize', (function(_this) {
        return function() {
          return _this.convert(_this.formatHumanize);
        };
      })(this));
      atom.commands.add('atom-workspace', 'text-manipulation:whitespace-trim', (function(_this) {
        return function() {
          return _this.convert(_this.whitespaceTrim);
        };
      })(this));
      atom.commands.add('atom-workspace', 'text-manipulation:whitespace-collapse', (function(_this) {
        return function() {
          return _this.convert(_this.whitespaceCollapse);
        };
      })(this));
      atom.commands.add('atom-workspace', 'text-manipulation:whitespace-remove', (function(_this) {
        return function() {
          return _this.convert(_this.whitespaceRemove);
        };
      })(this));
      atom.commands.add('atom-workspace', 'text-manipulation:whitespace-emptylines', (function(_this) {
        return function() {
          return _this.convert(_this.whitespaceEmptyLines);
        };
      })(this));
      atom.commands.add('atom-workspace', 'text-manipulation:whitespace-tabify', (function(_this) {
        return function() {
          return _this.convert(_this.whitespaceTabify);
        };
      })(this));
      atom.commands.add('atom-workspace', 'text-manipulation:whitespace-untabify', (function(_this) {
        return function() {
          return _this.convert(_this.whitespaceUntabify);
        };
      })(this));
      return atom.commands.add('atom-workspace', 'text-manipulation:strip-punctuation', (function(_this) {
        return function() {
          return _this.convert(_this.stripPunctuation);
        };
      })(this));
    },
    convert: function(converter) {
      var editor, i, len, results, selection, selections;
      editor = atom.workspace.getActiveTextEditor();
      selections = editor.getSelections();
      results = [];
      for (i = 0, len = selections.length; i < len; i++) {
        selection = selections[i];
        results.push(selection.insertText(converter(selection.getText()), {
          'select': true
        }));
      }
      return results;
    },
    encodeBase64: function(text) {
      return new Buffer(text).toString('base64');
    },
    decodeBase64: function(text) {
      if (/^[A-Za-z0-9+\/=]+$/.test(text)) {
        return new Buffer(text, 'base64').toString('utf8');
      } else {
        return text;
      }
    },
    encodeHtml: function(text) {
      return htmlEntities.encodeNonUTF(text);
    },
    decodeHtml: function(text) {
      return htmlEntities.decode(text);
    },
    encodeXml: function(text) {
      return xmlEntities.encodeNonUTF(text);
    },
    decodeXml: function(text) {
      return xmlEntities.decode(text);
    },
    encodeSql: function(text) {
      return escape_sql(text);
    },
    decodeSql: function(text) {
      return unescape_sql(text);
    },
    encodeUrl: function(text) {
      return encodeURIComponent(text);
    },
    decodeUrl: function(text) {
      return decodeURIComponent(text);
    },
    hashMD5: function(text) {
      var hash;
      hash = crypto.createHash('md5');
      hash.update(new Buffer(text));
      return hash.digest('hex');
    },
    hashSHA1: function(text) {
      var hash;
      hash = crypto.createHash('sha1');
      hash.update(new Buffer(text));
      return hash.digest('hex');
    },
    hashSHA256: function(text) {
      var hash;
      hash = crypto.createHash('sha256');
      hash.update(new Buffer(text));
      return hash.digest('hex');
    },
    hashSHA512: function(text) {
      var hash;
      hash = crypto.createHash('sha512');
      hash.update(new Buffer(text));
      return hash.digest('hex');
    },
    formatCamelize: function(text) {
      return string(text).camelize().s;
    },
    formatDasherize: function(text) {
      return string(text).dasherize().s;
    },
    formatUnderscore: function(text) {
      return string(text).underscore().s;
    },
    formatSlugify: function(text) {
      return string(text).slugify().s;
    },
    formatHumanize: function(text) {
      return string(text).humanize().s;
    },
    whitespaceTrim: function(text) {
      var line, lines;
      lines = (function() {
        var i, len, ref, results;
        ref = text.split('\n');
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          line = ref[i];
          results.push(string(line).replace(/\s+$/, "").s);
        }
        return results;
      })();
      return lines.join('\n');
    },
    whitespaceCollapse: function(text) {
      return string(text).collapseWhitespace().s;
    },
    whitespaceRemove: function(text) {
      return string(text).collapseWhitespace().s.replace(/\s+/g, '');
    },
    whitespaceEmptyLines: function(text) {
      var line, lines;
      lines = (function() {
        var i, len, ref, results;
        ref = text.split('\n');
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          line = ref[i];
          if (line.length > 0) {
            results.push(line);
          }
        }
        return results;
      })();
      return lines.join('\n');
    },
    whitespaceTabify: function(text) {
      var editor, line, lines, tabLength;
      editor = atom.workspace.getActiveTextEditor();
      tabLength = editor.getTabLength();
      lines = (function() {
        var i, len, ref, results;
        ref = text.split('\n');
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          line = ref[i];
          results.push(tabify(line, tabLength));
        }
        return results;
      })();
      return lines.join('\n');
    },
    whitespaceUntabify: function(text) {
      var editor, line, lines, tabLength;
      editor = atom.workspace.getActiveTextEditor();
      tabLength = editor.getTabLength();
      lines = (function() {
        var i, len, ref, results;
        ref = text.split('\n');
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          line = ref[i];
          results.push(untabify(line, tabLength));
        }
        return results;
      })();
      return lines.join('\n');
    },
    stripPunctuation: function(text) {
      return string(text).stripPunctuation().s;
    }
  };

  tabify = function(str, tabLength) {
    var count, ref, spaces, start, tabs;
    ref = countTabs(str, tabLength), start = ref[0], count = ref[1];
    tabs = string('\t').repeat(Math.floor(count / tabLength)).s;
    spaces = string(' ').repeat(modulo(count, tabLength)).s;
    return tabs + spaces + str.substr(start);
  };

  untabify = function(str, tabLength) {
    var count, ref, spaces, start;
    ref = countTabs(str, tabLength), start = ref[0], count = ref[1];
    spaces = string(' ').repeat(count).s;
    return spaces + str.substr(start);
  };

  countTabs = function(str, tabLength) {
    var ch, count, i, len, ref, start;
    start = str.search(/[^\s]/);
    if (start < 0) {
      start = str.length;
    }
    count = 0;
    ref = str.substr(0, start);
    for (i = 0, len = ref.length; i < len; i++) {
      ch = ref[i];
      switch (ch) {
        case ' ':
          count += 1;
          break;
        case '\t':
          count = (Math.floor(count / tabLength) + 1) * tabLength;
      }
    }
    return [start, count];
  };

  escape_sql = function(str) {
    return str.replace(/[\0\b\t\n\r\\"'%\x1a]/g, function(char) {
      switch (char) {
        case "\0":
          return "\\0";
        case "\b":
          return "\\b";
        case "\t":
          return "\\t";
        case "\n":
          return "\\n";
        case "\r":
          return "\\r";
        case "\"":
          return "\\\"";
        case "'":
          return "\\'";
        case "\\":
          return "\\\\";
        case "%":
          return "\\%";
        case "\x1a":
          return "\\z";
      }
    });
  };

  unescape_sql = function(str) {
    return str.replace(/\\[0btnr"'\\%z]/g, function(char) {
      switch (char) {
        case "\\0":
          return "\0";
        case "\\b":
          return "\b";
        case "\\t":
          return "\t";
        case "\\n":
          return "\n";
        case "\\r":
          return "\r";
        case "\\\"":
          return "\"";
        case "\\'":
          return "'";
        case "\\\\":
          return "\\";
        case "\\%":
          return "%";
        case "\\z":
          return "\x1a";
      }
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL3RleHQtbWFuaXB1bGF0aW9uL2xpYi90ZXh0LW1hbmlwdWxhdGlvbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDJIQUFBO0lBQUE7O0VBQUEsWUFBQSxHQUFlLE9BQUEsQ0FBUSxlQUFSLENBQXdCLENBQUM7O0VBQ3hDLFlBQUEsR0FBbUIsSUFBQSxZQUFBLENBQUE7O0VBQ25CLFdBQUEsR0FBYyxPQUFBLENBQVEsZUFBUixDQUF3QixDQUFDOztFQUN2QyxXQUFBLEdBQWtCLElBQUEsV0FBQSxDQUFBOztFQUNsQixNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7O0VBQ1QsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztFQUVULE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxRQUFBLEVBQVUsU0FBQTtNQUNSLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0MsaUNBQXBDLEVBQXVFLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsT0FBRCxDQUFTLEtBQUMsQ0FBQSxZQUFWO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZFO01BQ0EsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQyxpQ0FBcEMsRUFBdUUsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxPQUFELENBQVMsS0FBQyxDQUFBLFlBQVY7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkU7TUFDQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DLCtCQUFwQyxFQUFxRSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLE9BQUQsQ0FBUyxLQUFDLENBQUEsVUFBVjtR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QixhQUVPLElBRlA7aUJBRWlCO0FBRmpCLGFBR08sSUFIUDtpQkFHaUI7QUFIakIsYUFJTyxJQUpQO2lCQUlpQjtBQUpqQixhQUtPLElBTFA7aUJBS2lCO0FBTGpCLGFBTU8sSUFOUDtpQkFNaUI7QUFOakIsYUFPTyxHQVBQO2lCQU9nQjtBQVBoQixhQVFPLElBUlA7aUJBUWlCO0FBUmpCLGFBU08sR0FUUDtpQkFTZ0I7QUFUaEIsYUFVTyxNQVZQO2lCQVVtQjtBQVZuQjtJQURvQyxDQUF0QztFQURXOztFQWViLFlBQUEsR0FBZSxTQUFDLEdBQUQ7V0FDYixHQUFHLENBQUMsT0FBSixDQUFZLGtCQUFaLEVBQWdDLFNBQUMsSUFBRDtBQUM5QixjQUFPLElBQVA7QUFBQSxhQUNPLEtBRFA7aUJBQ2tCO0FBRGxCLGFBRU8sS0FGUDtpQkFFa0I7QUFGbEIsYUFHTyxLQUhQO2lCQUdrQjtBQUhsQixhQUlPLEtBSlA7aUJBSWtCO0FBSmxCLGFBS08sS0FMUDtpQkFLa0I7QUFMbEIsYUFNTyxNQU5QO2lCQU1tQjtBQU5uQixhQU9PLEtBUFA7aUJBT2tCO0FBUGxCLGFBUU8sTUFSUDtpQkFRbUI7QUFSbkIsYUFTTyxLQVRQO2lCQVNrQjtBQVRsQixhQVVPLEtBVlA7aUJBVWtCO0FBVmxCO0lBRDhCLENBQWhDO0VBRGE7QUFyTGYiLCJzb3VyY2VzQ29udGVudCI6WyJIdG1sRW50aXRpZXMgPSByZXF1aXJlKCdodG1sLWVudGl0aWVzJykuQWxsSHRtbEVudGl0aWVzXG5odG1sRW50aXRpZXMgPSBuZXcgSHRtbEVudGl0aWVzKClcblhtbEVudGl0aWVzID0gcmVxdWlyZSgnaHRtbC1lbnRpdGllcycpLlhtbEVudGl0aWVzXG54bWxFbnRpdGllcyA9IG5ldyBYbWxFbnRpdGllcygpXG5jcnlwdG8gPSByZXF1aXJlKCdjcnlwdG8nKVxuc3RyaW5nID0gcmVxdWlyZSgnc3RyaW5nJylcblxubW9kdWxlLmV4cG9ydHMgPVxuICBhY3RpdmF0ZTogLT5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAndGV4dC1tYW5pcHVsYXRpb246YmFzZTY0LWVuY29kZScsID0+IEBjb252ZXJ0IEBlbmNvZGVCYXNlNjRcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAndGV4dC1tYW5pcHVsYXRpb246YmFzZTY0LWRlY29kZScsID0+IEBjb252ZXJ0IEBkZWNvZGVCYXNlNjRcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAndGV4dC1tYW5pcHVsYXRpb246aHRtbC1lbmNvZGUnLCA9PiBAY29udmVydCBAZW5jb2RlSHRtbFxuICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICd0ZXh0LW1hbmlwdWxhdGlvbjpodG1sLWRlY29kZScsID0+IEBjb252ZXJ0IEBkZWNvZGVIdG1sXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ3RleHQtbWFuaXB1bGF0aW9uOnhtbC1lbmNvZGUnLCA9PiBAY29udmVydCBAZW5jb2RlWG1sXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ3RleHQtbWFuaXB1bGF0aW9uOnhtbC1kZWNvZGUnLCA9PiBAY29udmVydCBAZGVjb2RlWG1sXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ3RleHQtbWFuaXB1bGF0aW9uOnNxbC1lbmNvZGUnLCA9PiBAY29udmVydCBAZW5jb2RlU3FsXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ3RleHQtbWFuaXB1bGF0aW9uOnNxbC1kZWNvZGUnLCA9PiBAY29udmVydCBAZGVjb2RlU3FsXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ3RleHQtbWFuaXB1bGF0aW9uOnVybC1lbmNvZGUnLCA9PiBAY29udmVydCBAZW5jb2RlVXJsXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ3RleHQtbWFuaXB1bGF0aW9uOnVybC1kZWNvZGUnLCA9PiBAY29udmVydCBAZGVjb2RlVXJsXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ3RleHQtbWFuaXB1bGF0aW9uOmhhc2gtbWQ1JywgPT4gQGNvbnZlcnQgQGhhc2hNRDVcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAndGV4dC1tYW5pcHVsYXRpb246aGFzaC1zaGExJywgPT4gQGNvbnZlcnQgQGhhc2hTSEExXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ3RleHQtbWFuaXB1bGF0aW9uOmhhc2gtc2hhMjU2JywgPT4gQGNvbnZlcnQgQGhhc2hTSEEyNTZcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAndGV4dC1tYW5pcHVsYXRpb246aGFzaC1zaGE1MTInLCA9PiBAY29udmVydCBAaGFzaFNIQTUxMlxuICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICd0ZXh0LW1hbmlwdWxhdGlvbjpmb3JtYXQtY2FtZWxpemUnLCA9PiBAY29udmVydCBAZm9ybWF0Q2FtZWxpemVcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAndGV4dC1tYW5pcHVsYXRpb246Zm9ybWF0LWRhc2hlcml6ZScsID0+IEBjb252ZXJ0IEBmb3JtYXREYXNoZXJpemVcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAndGV4dC1tYW5pcHVsYXRpb246Zm9ybWF0LXVuZGVyc2NvcmUnLCA9PiBAY29udmVydCBAZm9ybWF0VW5kZXJzY29yZVxuICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICd0ZXh0LW1hbmlwdWxhdGlvbjpmb3JtYXQtc2x1Z2lmeScsID0+IEBjb252ZXJ0IEBmb3JtYXRTbHVnaWZ5XG4gICAgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ3RleHQtbWFuaXB1bGF0aW9uOmZvcm1hdC1odW1hbml6ZScsID0+IEBjb252ZXJ0IEBmb3JtYXRIdW1hbml6ZVxuICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICd0ZXh0LW1hbmlwdWxhdGlvbjp3aGl0ZXNwYWNlLXRyaW0nLCA9PiBAY29udmVydCBAd2hpdGVzcGFjZVRyaW1cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAndGV4dC1tYW5pcHVsYXRpb246d2hpdGVzcGFjZS1jb2xsYXBzZScsID0+IEBjb252ZXJ0IEB3aGl0ZXNwYWNlQ29sbGFwc2VcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAndGV4dC1tYW5pcHVsYXRpb246d2hpdGVzcGFjZS1yZW1vdmUnLCA9PiBAY29udmVydCBAd2hpdGVzcGFjZVJlbW92ZVxuICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICd0ZXh0LW1hbmlwdWxhdGlvbjp3aGl0ZXNwYWNlLWVtcHR5bGluZXMnLCA9PiBAY29udmVydCBAd2hpdGVzcGFjZUVtcHR5TGluZXNcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAndGV4dC1tYW5pcHVsYXRpb246d2hpdGVzcGFjZS10YWJpZnknLCA9PiBAY29udmVydCBAd2hpdGVzcGFjZVRhYmlmeVxuICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICd0ZXh0LW1hbmlwdWxhdGlvbjp3aGl0ZXNwYWNlLXVudGFiaWZ5JywgPT4gQGNvbnZlcnQgQHdoaXRlc3BhY2VVbnRhYmlmeVxuICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICd0ZXh0LW1hbmlwdWxhdGlvbjpzdHJpcC1wdW5jdHVhdGlvbicsID0+IEBjb252ZXJ0IEBzdHJpcFB1bmN0dWF0aW9uXG5cbiAgY29udmVydDogKGNvbnZlcnRlcikgLT5cbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBzZWxlY3Rpb25zID0gZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICNpZiBzZWxlY3Rpb25zLmxlbmd0aCA9PSAxIGFuZCBzZWxlY3Rpb25zWzBdLmlzRW1wdHlcbiAgICAjICBlZGl0b3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUoKVxuICAgICMgIGVkaXRvci5zZWxlY3RUb0VuZE9mTGluZSgpXG4gICAgIyAgc2VsZWN0aW9ucyA9IGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dChjb252ZXJ0ZXIoc2VsZWN0aW9uLmdldFRleHQoKSksIHsnc2VsZWN0JzogdHJ1ZX0pIGZvciBzZWxlY3Rpb24gaW4gc2VsZWN0aW9uc1xuXG4gIGVuY29kZUJhc2U2NDogKHRleHQpIC0+XG4gICAgbmV3IEJ1ZmZlcih0ZXh0KS50b1N0cmluZygnYmFzZTY0JylcblxuICBkZWNvZGVCYXNlNjQ6ICh0ZXh0KSAtPlxuICAgIGlmIC9eW0EtWmEtejAtOSsvPV0rJC8udGVzdCh0ZXh0KVxuICAgICAgbmV3IEJ1ZmZlcih0ZXh0LCAnYmFzZTY0JykudG9TdHJpbmcoJ3V0ZjgnKVxuICAgIGVsc2VcbiAgICAgIHRleHRcblxuICBlbmNvZGVIdG1sOiAodGV4dCkgLT5cbiAgICBodG1sRW50aXRpZXMuZW5jb2RlTm9uVVRGKHRleHQpXG5cbiAgZGVjb2RlSHRtbDogKHRleHQpIC0+XG4gICAgaHRtbEVudGl0aWVzLmRlY29kZSh0ZXh0KVxuXG4gIGVuY29kZVhtbDogKHRleHQpIC0+XG4gICAgeG1sRW50aXRpZXMuZW5jb2RlTm9uVVRGKHRleHQpXG5cbiAgZGVjb2RlWG1sOiAodGV4dCkgLT5cbiAgICB4bWxFbnRpdGllcy5kZWNvZGUodGV4dClcblxuICBlbmNvZGVTcWw6ICh0ZXh0KSAtPlxuICAgIGVzY2FwZV9zcWwodGV4dClcblxuICBkZWNvZGVTcWw6ICh0ZXh0KSAtPlxuICAgIHVuZXNjYXBlX3NxbCh0ZXh0KVxuXG4gIGVuY29kZVVybDogKHRleHQpIC0+XG4gICAgZW5jb2RlVVJJQ29tcG9uZW50KHRleHQpXG5cbiAgZGVjb2RlVXJsOiAodGV4dCkgLT5cbiAgICBkZWNvZGVVUklDb21wb25lbnQodGV4dClcblxuICBoYXNoTUQ1OiAodGV4dCkgLT5cbiAgICBoYXNoID0gY3J5cHRvLmNyZWF0ZUhhc2goJ21kNScpXG4gICAgaGFzaC51cGRhdGUobmV3IEJ1ZmZlcih0ZXh0KSlcbiAgICBoYXNoLmRpZ2VzdCgnaGV4JylcblxuICBoYXNoU0hBMTogKHRleHQpIC0+XG4gICAgaGFzaCA9IGNyeXB0by5jcmVhdGVIYXNoKCdzaGExJylcbiAgICBoYXNoLnVwZGF0ZShuZXcgQnVmZmVyKHRleHQpKVxuICAgIGhhc2guZGlnZXN0KCdoZXgnKVxuXG4gIGhhc2hTSEEyNTY6ICh0ZXh0KSAtPlxuICAgIGhhc2ggPSBjcnlwdG8uY3JlYXRlSGFzaCgnc2hhMjU2JylcbiAgICBoYXNoLnVwZGF0ZShuZXcgQnVmZmVyKHRleHQpKVxuICAgIGhhc2guZGlnZXN0KCdoZXgnKVxuXG4gIGhhc2hTSEE1MTI6ICh0ZXh0KSAtPlxuICAgIGhhc2ggPSBjcnlwdG8uY3JlYXRlSGFzaCgnc2hhNTEyJylcbiAgICBoYXNoLnVwZGF0ZShuZXcgQnVmZmVyKHRleHQpKVxuICAgIGhhc2guZGlnZXN0KCdoZXgnKVxuXG4gIGZvcm1hdENhbWVsaXplOiAodGV4dCkgLT5cbiAgICBzdHJpbmcodGV4dCkuY2FtZWxpemUoKS5zXG5cbiAgZm9ybWF0RGFzaGVyaXplOiAodGV4dCkgLT5cbiAgICBzdHJpbmcodGV4dCkuZGFzaGVyaXplKCkuc1xuXG4gIGZvcm1hdFVuZGVyc2NvcmU6ICh0ZXh0KSAtPlxuICAgIHN0cmluZyh0ZXh0KS51bmRlcnNjb3JlKCkuc1xuXG4gIGZvcm1hdFNsdWdpZnk6ICh0ZXh0KSAtPlxuICAgIHN0cmluZyh0ZXh0KS5zbHVnaWZ5KCkuc1xuXG4gIGZvcm1hdEh1bWFuaXplOiAodGV4dCkgLT5cbiAgICBzdHJpbmcodGV4dCkuaHVtYW5pemUoKS5zXG5cbiAgd2hpdGVzcGFjZVRyaW06ICh0ZXh0KSAtPlxuICAgIGxpbmVzID0gKHN0cmluZyhsaW5lKS5yZXBsYWNlKC9cXHMrJC8sIFwiXCIpLnMgZm9yIGxpbmUgaW4gdGV4dC5zcGxpdCgnXFxuJykpXG4gICAgbGluZXMuam9pbignXFxuJylcblxuICB3aGl0ZXNwYWNlQ29sbGFwc2U6ICh0ZXh0KSAtPlxuICAgIHN0cmluZyh0ZXh0KS5jb2xsYXBzZVdoaXRlc3BhY2UoKS5zXG5cbiAgd2hpdGVzcGFjZVJlbW92ZTogKHRleHQpIC0+XG4gICAgc3RyaW5nKHRleHQpLmNvbGxhcHNlV2hpdGVzcGFjZSgpLnMucmVwbGFjZSgvXFxzKy9nLCAnJylcblxuICB3aGl0ZXNwYWNlRW1wdHlMaW5lczogKHRleHQpIC0+XG4gICAgbGluZXMgPSAobGluZSBmb3IgbGluZSBpbiB0ZXh0LnNwbGl0KCdcXG4nKSB3aGVuIGxpbmUubGVuZ3RoID4gMClcbiAgICBsaW5lcy5qb2luKCdcXG4nKVxuXG4gIHdoaXRlc3BhY2VUYWJpZnk6ICh0ZXh0KSAtPlxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIHRhYkxlbmd0aCA9IGVkaXRvci5nZXRUYWJMZW5ndGgoKVxuICAgIGxpbmVzID0gKHRhYmlmeShsaW5lLCB0YWJMZW5ndGgpIGZvciBsaW5lIGluIHRleHQuc3BsaXQoJ1xcbicpKVxuICAgIGxpbmVzLmpvaW4oJ1xcbicpXG5cbiAgd2hpdGVzcGFjZVVudGFiaWZ5OiAodGV4dCkgLT5cbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICB0YWJMZW5ndGggPSBlZGl0b3IuZ2V0VGFiTGVuZ3RoKClcbiAgICBsaW5lcyA9ICh1bnRhYmlmeShsaW5lLCB0YWJMZW5ndGgpIGZvciBsaW5lIGluIHRleHQuc3BsaXQoJ1xcbicpKVxuICAgIGxpbmVzLmpvaW4oJ1xcbicpXG5cbiAgc3RyaXBQdW5jdHVhdGlvbjogKHRleHQpIC0+XG4gICAgc3RyaW5nKHRleHQpLnN0cmlwUHVuY3R1YXRpb24oKS5zXG5cbiMgSGVscGVyIGZ1bmN0aW9uc1xuXG50YWJpZnkgPSAoc3RyLCB0YWJMZW5ndGgpIC0+XG4gIFtzdGFydCwgY291bnRdID0gY291bnRUYWJzKHN0ciwgdGFiTGVuZ3RoKVxuICB0YWJzID0gc3RyaW5nKCdcXHQnKS5yZXBlYXQoY291bnQgLy8gdGFiTGVuZ3RoKS5zXG4gIHNwYWNlcyA9IHN0cmluZygnICcpLnJlcGVhdChjb3VudCAlJSB0YWJMZW5ndGgpLnNcbiAgdGFicyArIHNwYWNlcyArIHN0ci5zdWJzdHIoc3RhcnQpXG5cbnVudGFiaWZ5ID0gKHN0ciwgdGFiTGVuZ3RoKSAtPlxuICBbc3RhcnQsIGNvdW50XSA9IGNvdW50VGFicyhzdHIsIHRhYkxlbmd0aClcbiAgc3BhY2VzID0gc3RyaW5nKCcgJykucmVwZWF0KGNvdW50KS5zXG4gIHNwYWNlcyArIHN0ci5zdWJzdHIoc3RhcnQpXG5cbmNvdW50VGFicyA9IChzdHIsIHRhYkxlbmd0aCkgLT5cbiAgc3RhcnQgPSBzdHIuc2VhcmNoKC9bXlxcc10vKVxuICBpZiBzdGFydCA8IDBcbiAgICBzdGFydCA9IHN0ci5sZW5ndGhcbiAgY291bnQgPSAwXG4gIGZvciBjaCBpbiBzdHIuc3Vic3RyKDAsIHN0YXJ0KVxuICAgIHN3aXRjaCBjaFxuICAgICAgd2hlbiAnICcgdGhlbiBjb3VudCArPSAxXG4gICAgICB3aGVuICdcXHQnIHRoZW4gY291bnQgPSAoY291bnQgLy8gdGFiTGVuZ3RoICsgMSkgKiB0YWJMZW5ndGhcbiAgW3N0YXJ0LCBjb3VudF1cblxuZXNjYXBlX3NxbCA9IChzdHIpIC0+XG4gIHN0ci5yZXBsYWNlKC9bXFwwXFxiXFx0XFxuXFxyXFxcXFwiJyVcXHgxYV0vZywgKGNoYXIpIC0+XG4gICAgc3dpdGNoIGNoYXJcbiAgICAgIHdoZW4gXCJcXDBcIiB0aGVuIFwiXFxcXDBcIlxuICAgICAgd2hlbiBcIlxcYlwiIHRoZW4gXCJcXFxcYlwiXG4gICAgICB3aGVuIFwiXFx0XCIgdGhlbiBcIlxcXFx0XCJcbiAgICAgIHdoZW4gXCJcXG5cIiB0aGVuIFwiXFxcXG5cIlxuICAgICAgd2hlbiBcIlxcclwiIHRoZW4gXCJcXFxcclwiXG4gICAgICB3aGVuIFwiXFxcIlwiIHRoZW4gXCJcXFxcXFxcIlwiXG4gICAgICB3aGVuIFwiJ1wiIHRoZW4gXCJcXFxcJ1wiXG4gICAgICB3aGVuIFwiXFxcXFwiIHRoZW4gXCJcXFxcXFxcXFwiXG4gICAgICB3aGVuIFwiJVwiIHRoZW4gXCJcXFxcJVwiXG4gICAgICB3aGVuIFwiXFx4MWFcIiB0aGVuIFwiXFxcXHpcIlxuICApXG5cbnVuZXNjYXBlX3NxbCA9IChzdHIpIC0+XG4gIHN0ci5yZXBsYWNlKC9cXFxcWzBidG5yXCInXFxcXCV6XS9nLCAoY2hhcikgLT5cbiAgICBzd2l0Y2ggY2hhclxuICAgICAgd2hlbiBcIlxcXFwwXCIgdGhlbiBcIlxcMFwiXG4gICAgICB3aGVuIFwiXFxcXGJcIiB0aGVuIFwiXFxiXCJcbiAgICAgIHdoZW4gXCJcXFxcdFwiIHRoZW4gXCJcXHRcIlxuICAgICAgd2hlbiBcIlxcXFxuXCIgdGhlbiBcIlxcblwiXG4gICAgICB3aGVuIFwiXFxcXHJcIiB0aGVuIFwiXFxyXCJcbiAgICAgIHdoZW4gXCJcXFxcXFxcIlwiIHRoZW4gXCJcXFwiXCJcbiAgICAgIHdoZW4gXCJcXFxcJ1wiIHRoZW4gXCInXCJcbiAgICAgIHdoZW4gXCJcXFxcXFxcXFwiIHRoZW4gXCJcXFxcXCJcbiAgICAgIHdoZW4gXCJcXFxcJVwiIHRoZW4gXCIlXCJcbiAgICAgIHdoZW4gXCJcXFxcelwiIHRoZW4gXCJcXHgxYVwiXG4gIClcbiJdfQ==
