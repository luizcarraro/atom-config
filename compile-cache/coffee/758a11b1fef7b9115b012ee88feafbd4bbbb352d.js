(function() {
  var NavParser, argsRe, fs, i, indentSpaceRe, j, langdef, langmap, path, positionRe, ref;

  fs = require('fs');

  path = require('path');

  ref = require('./ctags'), langdef = ref.langdef, langmap = ref.langmap;

  argsRe = {
    '()': /(\([^)]+\))/,
    '[]': /(\[[^\]]+\])/
  };

  indentSpaceRe = /^(?: |\t)*/;

  positionRe = [];

  for (i = j = 0; j <= 9; i = ++j) {
    positionRe[i] = new RegExp('%' + i, 'g');
  }

  module.exports = NavParser = (function() {
    NavParser.prototype.pathObserver = null;

    NavParser.prototype.projectRules = {};

    function NavParser() {
      var pathObserver;
      this.getProjectRules(atom.project.getPaths());
      pathObserver = atom.project.onDidChangePaths((function(_this) {
        return function(paths) {
          return _this.getProjectRules(paths);
        };
      })(this));
    }

    NavParser.prototype.getProjectRules = function(paths) {
      var k, len, projectPath, results, ruleFile;
      for (projectPath in this.projectRules) {
        if (paths.indexOf(projectPath) === -1) {
          delete this.projectRules[projectPath];
        }
      }
      results = [];
      for (k = 0, len = paths.length; k < len; k++) {
        projectPath = paths[k];
        ruleFile = projectPath + path.sep + '.nav-marker-rules';
        if (!this.projectRules[projectPath]) {
          results.push((function(_this) {
            return function(projectPath) {
              return fs.readFile(ruleFile, function(err, data) {
                var base, l, len1, line, results1, rule, rulesText;
                if (!data) {
                  return;
                }
                rulesText = data.toString().split("\n");
                results1 = [];
                for (l = 0, len1 = rulesText.length; l < len1; l++) {
                  line = rulesText[l];
                  rule = _this.parseRule(line);
                  if (rule) {
                    (base = _this.projectRules)[projectPath] || (base[projectPath] = []);
                    results1.push(_this.projectRules[projectPath].push(rule));
                  } else {
                    results1.push(void 0);
                  }
                }
                return results1;
              });
            };
          })(this)(projectPath));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    NavParser.prototype.parse = function() {
      var activeRules, editor, editorFile, ext, indent, items, k, l, len, len1, len2, lineText, m, markerIndents, match, n, newRule, nextLineText, parentIndent, prevIndent, projectPath, projectRules, ref1, ref2, row, rule, updateRules;
      items = [];
      editor = atom.workspace.getActiveTextEditor();
      if (!editor) {
        return items;
      }
      editorFile = editor.getPath();
      if (!editorFile) {
        return;
      }
      activeRules = langdef.All || [];
      markerIndents = [];
      updateRules = function(newRule) {
        var disableGroup, ext, fileMatches, k, l, len, len1, len2, m, ref1, ref2, rule;
        if (newRule.ext) {
          fileMatches = false;
          ref1 = newRule.ext;
          for (k = 0, len = ref1.length; k < len; k++) {
            ext = ref1[k];
            if (editorFile.lastIndexOf(ext) + ext.length === editorFile.length) {
              fileMatches = true;
              break;
            }
          }
          if (!fileMatches) {
            return;
          }
        }
        if (newRule.startOver) {
          activeRules = [];
        }
        if (newRule.disableGroups) {
          ref2 = newRule.disableGroups;
          for (l = 0, len1 = ref2.length; l < len1; l++) {
            disableGroup = ref2[l];
            for (i = m = 0, len2 = activeRules.length; m < len2; i = ++m) {
              rule = activeRules[i];
              if (rule.kind === disableGroup) {
                activeRules.splice(i, 1);
              }
            }
          }
        }
        if (newRule.re) {
          return activeRules.push(newRule);
        }
      };
      prevIndent = 0;
      ref1 = Object.keys(langmap);
      for (k = 0, len = ref1.length; k < len; k++) {
        ext = ref1[k];
        if (editorFile.lastIndexOf(ext) + ext.length === editorFile.length) {
          activeRules = activeRules.concat(langmap[ext]);
          break;
        }
      }
      for (projectPath in this.projectRules) {
        if (editorFile.indexOf(projectPath) === 0) {
          projectRules = this.projectRules[projectPath];
          for (l = 0, len1 = projectRules.length; l < len1; l++) {
            rule = projectRules[l];
            updateRules(rule);
          }
        }
      }
      for (row = m = 0, ref2 = editor.getLineCount(); 0 <= ref2 ? m <= ref2 : m >= ref2; row = 0 <= ref2 ? ++m : --m) {
        lineText = editor.lineTextForBufferRow(row);
        if (lineText) {
          lineText = lineText.trim();
        }
        if (!lineText) {
          continue;
        }
        if (lineText.indexOf('#' + 'marker-rule:') >= 0) {
          newRule = this.parseRule(lineText);
          if (newRule) {
            updateRules(newRule);
            continue;
          }
        }
        indent = lineText.match(indentSpaceRe)[0].length;
        while (indent < prevIndent) {
          prevIndent = markerIndents.pop();
        }
        for (n = 0, len2 = activeRules.length; n < len2; n++) {
          rule = activeRules[n];
          if (rule.multiline === true && row < editor.getLineCount()) {
            nextLineText = editor.lineTextForBufferRow(row + 1);
            lineText = lineText + '\n' + nextLineText;
            match = lineText.match(rule.re);
          } else {
            match = lineText.match(rule.re);
          }
          if (match) {
            parentIndent = -1;
            if (indent > prevIndent) {
              markerIndents.push(indent);
            }
            if (markerIndents.length > 1) {
              parentIndent = markerIndents[markerIndents.length - 2];
            }
            items.push(this.makeItem(rule, match, lineText, row, indent, parentIndent));
          }
        }
      }
      return items;
    };

    NavParser.prototype.makeItem = function(rule, match, text, row, indent, parentIndent) {
      var argsMatch, icon, item, k, kind, label, len, str, tooltip;
      label = rule.id || '';
      tooltip = rule.tooltip || '';
      icon = rule.icon;
      if (label || tooltip) {
        for (i = k = 0, len = match.length; k < len; i = ++k) {
          str = match[i];
          if (label) {
            label = label.replace(positionRe[i], match[i]);
          }
          if (tooltip) {
            tooltip = tooltip.replace(positionRe[i], match[i]);
          }
        }
      }
      if (!label) {
        label = match[1] || match[0];
      }
      kind = rule.kind || 'Markers';
      if (rule.args) {
        argsMatch = argsRe[rule.args].exec(text);
        if (argsMatch) {
          tooltip += argsMatch[1];
        }
      }
      return item = {
        label: label,
        icon: icon,
        kind: kind,
        row: row,
        tooltip: tooltip,
        indent: indent,
        parentIndent: parentIndent
      };
    };

    NavParser.prototype.parseRule = function(line) {
      var flag, k, len, part, parts, reFields, reStr, rule, ruleStr;
      if (!line) {
        return;
      }
      ruleStr = line.split('#' + 'marker-rule:')[1].trim();
      if (!ruleStr) {
        return;
      }
      parts = ruleStr.split('||');
      reFields = parts[0].match(/[ \t]*\/(.+)\/(.*)/);
      if (!reFields && ruleStr.search(/(^|\|\|)(startOver|disable=)/) === -1) {
        console.log('Navigator Panel: No regular expression found in :', line);
        return;
      }
      rule = {};
      if (reFields) {
        reStr = reFields[1];
        if (reFields[2]) {
          flag = 'i';
        }
        rule = {
          re: new RegExp(reStr, flag)
        };
        if (/\\n/.test(reFields[1])) {
          rule.multiline = true;
        }
        parts.shift();
      }
      for (k = 0, len = parts.length; k < len; k++) {
        part = parts[k];
        if (part.indexOf('%') !== -1) {
          rule.id = part;
        } else if (part.indexOf('startOver') === 0) {
          rule.startOver = true;
        } else if (part.indexOf('disable=') === 0) {
          rule.disableGroups = part.substr('disable='.length).split(',');
        } else if (part.indexOf('ext=') === 0) {
          rule.ext = part.substr('ext='.length).split(',');
        } else {
          rule.kind = part;
        }
      }
      return rule;
    };

    NavParser.prototype.destroy = function() {
      return this.pathObserver.dispose();
    };

    return NavParser;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL25hdi1wYW5lbC1wbHVzL2xpYi9uYXYtcGFyc2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxNQUFxQixPQUFBLENBQVEsU0FBUixDQUFyQixFQUFDLHFCQUFELEVBQVU7O0VBR1YsTUFBQSxHQUFTO0lBQ1AsSUFBQSxFQUFNLGFBREM7SUFFUCxJQUFBLEVBQU0sY0FGQzs7O0VBSVQsYUFBQSxHQUFnQjs7RUFDaEIsVUFBQSxHQUFhOztBQUNiLE9BQVMsMEJBQVQ7SUFDRSxVQUFXLENBQUEsQ0FBQSxDQUFYLEdBQW9CLElBQUEsTUFBQSxDQUFPLEdBQUEsR0FBTSxDQUFiLEVBQWdCLEdBQWhCO0FBRHRCOztFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ007d0JBQ0osWUFBQSxHQUFjOzt3QkFDZCxZQUFBLEdBQWU7O0lBR0YsbUJBQUE7QUFDWCxVQUFBO01BQUEsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFiLENBQUEsQ0FBakI7TUFDQSxZQUFBLEdBQWUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBYixDQUE4QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRDtpQkFDM0MsS0FBQyxDQUFBLGVBQUQsQ0FBaUIsS0FBakI7UUFEMkM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlCO0lBRko7O3dCQU1iLGVBQUEsR0FBaUIsU0FBQyxLQUFEO0FBRWYsVUFBQTtBQUFBLFdBQUEsZ0NBQUE7UUFDRSxJQUFHLEtBQUssQ0FBQyxPQUFOLENBQWMsV0FBZCxDQUFBLEtBQThCLENBQUMsQ0FBbEM7VUFDRSxPQUFPLElBQUMsQ0FBQSxZQUFhLENBQUEsV0FB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LElBQUcsSUFBSSxDQUFDLE9BQUwsQ0FBYSxHQUFiLENBQUEsS0FBc0IsQ0FBQyxDQUExQjtVQUNFLElBQUksQ0FBQyxFQUFMLEdBQVUsS0FEWjtTQUFBLE1BRUssSUFBRyxJQUFJLENBQUMsT0FBTCxDQUFhLFdBQWIsQ0FBQSxLQUE2QixDQUFoQztVQUNILElBQUksQ0FBQyxTQUFMLEdBQWlCLEtBRGQ7U0FBQSxNQUVBLElBQUcsSUFBSSxDQUFDLE9BQUwsQ0FBYSxVQUFiLENBQUEsS0FBNEIsQ0FBL0I7VUFDSCxJQUFJLENBQUMsYUFBTCxHQUFxQixJQUFJLENBQUMsTUFBTCxDQUFZLFVBQVUsQ0FBQyxNQUF2QixDQUE4QixDQUFDLEtBQS9CLENBQXFDLEdBQXJDLEVBRGxCO1NBQUEsTUFFQSxJQUFHLElBQUksQ0FBQyxPQUFMLENBQWEsTUFBYixDQUFBLEtBQXdCLENBQTNCO1VBQ0gsSUFBSSxDQUFDLEdBQUwsR0FBVyxJQUFJLENBQUMsTUFBTCxDQUFZLE1BQU0sQ0FBQyxNQUFuQixDQUEwQixDQUFDLEtBQTNCLENBQWlDLEdBQWpDLEVBRFI7U0FBQSxNQUFBO1VBR0gsSUFBSSxDQUFDLElBQUwsR0FBWSxLQUhUOztBQVBQO0FBV0EsYUFBTztJQXJDRTs7d0JBd0NYLE9BQUEsR0FBUyxTQUFBO2FBQ1AsSUFBQyxDQUFBLFlBQVksQ0FBQyxPQUFkLENBQUE7SUFETzs7Ozs7QUF4TFgiLCJzb3VyY2VzQ29udGVudCI6WyJmcyA9IHJlcXVpcmUgJ2ZzJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG57bGFuZ2RlZiwgbGFuZ21hcH0gPSByZXF1aXJlICcuL2N0YWdzJ1xuXG4jIFJlZ0V4cCB0byBjYXB0dXJlIGFueSBhcmd1bWVudHMgd2l0aGluICgpIG9yIHdpdGhpbiBbXVxuYXJnc1JlID0ge1xuICAnKCknOiAvKFxcKFteKV0rXFwpKS9cbiAgJ1tdJzogLyhcXFtbXlxcXV0rXFxdKS9cbn1cbmluZGVudFNwYWNlUmUgPSAvXig/OiB8XFx0KSovXG5wb3NpdGlvblJlID0gW11cbmZvciBpIGluIFswLi45XVxuICBwb3NpdGlvblJlW2ldID0gbmV3IFJlZ0V4cCgnJScgKyBpLCAnZycpXG5cblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgTmF2UGFyc2VyXG4gIHBhdGhPYnNlcnZlcjogbnVsbFxuICBwcm9qZWN0UnVsZXMgOiB7fVxuXG5cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQGdldFByb2plY3RSdWxlcyBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVxuICAgIHBhdGhPYnNlcnZlciA9IGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzIChwYXRocyk9PlxuICAgICAgQGdldFByb2plY3RSdWxlcyBwYXRoc1xuXG5cbiAgZ2V0UHJvamVjdFJ1bGVzOiAocGF0aHMpLT5cbiAgICAjIEZpcnN0IHJlbW92ZSBhbnkgcHJvamVjdCB0aGF0J3MgYmVlbiBjbG9zZWRcbiAgICBmb3IgcHJvamVjdFBhdGggb2YgQHByb2plY3RSdWxlc1xuICAgICAgaWYgcGF0aHMuaW5kZXhPZihwcm9qZWN0UGF0aCkgPT0gLTFcbiAgICAgICAgZGVsZXRlIEBwcm9qZWN0UnVsZXNbcHJvamVjdFBhdGhdXG4gICAgIyBOb3cgYW55IG5ldyBwcm9qZWN0IG9wZW5lZC5cbiAgICBmb3IgcHJvamVjdFBhdGggaW4gcGF0aHNcbiAgICAgIHJ1bGVGaWxlID0gcHJvamVjdFBhdGggKyBwYXRoLnNlcCArICcubmF2LW1hcmtlci1ydWxlcydcbiAgICAgIGlmICFAcHJvamVjdFJ1bGVzW3Byb2plY3RQYXRoXVxuICAgICAgICBkbyAocHJvamVjdFBhdGgpPT5cbiAgICAgICAgICBmcy5yZWFkRmlsZSBydWxlRmlsZSwgKGVycixkYXRhKT0+XG4gICAgICAgICAgICByZXR1cm4gdW5sZXNzIGRhdGFcbiAgICAgICAgICAgIHJ1bGVzVGV4dCA9IGRhdGEudG9TdHJpbmcoKS5zcGxpdChcIlxcblwiKVxuICAgICAgICAgICAgZm9yIGxpbmUgaW4gcnVsZXNUZXh0XG4gICAgICAgICAgICAgIHJ1bGUgPSBAcGFyc2VSdWxlKGxpbmUpXG4gICAgICAgICAgICAgIGlmIHJ1bGVcbiAgICAgICAgICAgICAgICBAcHJvamVjdFJ1bGVzW3Byb2plY3RQYXRoXSB8fD0gW11cbiAgICAgICAgICAgICAgICBAcHJvamVjdFJ1bGVzW3Byb2plY3RQYXRoXS5wdXNoIHJ1bGVcblxuXG4gIHBhcnNlOiAtPlxuICAgICMgcGFyc2UgYWN0aXZlIGVkaXRvcidzIHRleHRcbiAgICBpdGVtcyA9IFtdXG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgcmV0dXJuIGl0ZW1zIHVubGVzcyBlZGl0b3JcbiAgICBlZGl0b3JGaWxlID0gZWRpdG9yLmdldFBhdGgoKVxuICAgIHJldHVybiB1bmxlc3MgZWRpdG9yRmlsZSAgIyBoYXBwZW5zIHdpdGggbmV3IGZpbGVcblxuICAgIGFjdGl2ZVJ1bGVzID0gbGFuZ2RlZi5BbGwgfHwgW11cbiAgICBtYXJrZXJJbmRlbnRzID0gW10gICAgIyBpbmRlbnQgY2hhcnMgdG8gdHJhY2sgcGFyZW50L2NoaWxkcmVuXG5cbiAgICB1cGRhdGVSdWxlcyA9IChuZXdSdWxlKS0+XG4gICAgICBpZiBuZXdSdWxlLmV4dFxuICAgICAgICBmaWxlTWF0Y2hlcyA9IGZhbHNlXG4gICAgICAgIGZvciBleHQgaW4gbmV3UnVsZS5leHRcbiAgICAgICAgICBpZiBlZGl0b3JGaWxlLmxhc3RJbmRleE9mKGV4dCkgKyBleHQubGVuZ3RoID09IGVkaXRvckZpbGUubGVuZ3RoXG4gICAgICAgICAgICBmaWxlTWF0Y2hlcyA9IHRydWVcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIHJldHVybiB1bmxlc3MgZmlsZU1hdGNoZXNcbiAgICAgIGlmIG5ld1J1bGUuc3RhcnRPdmVyXG4gICAgICAgIGFjdGl2ZVJ1bGVzID0gW11cbiAgICAgIGlmIG5ld1J1bGUuZGlzYWJsZUdyb3Vwc1xuICAgICAgICBmb3IgZGlzYWJsZUdyb3VwIGluIG5ld1J1bGUuZGlzYWJsZUdyb3Vwc1xuICAgICAgICAgIGZvciBydWxlLCBpIGluIGFjdGl2ZVJ1bGVzXG4gICAgICAgICAgICBpZiBydWxlLmtpbmQgPT0gZGlzYWJsZUdyb3VwXG4gICAgICAgICAgICAgIGFjdGl2ZVJ1bGVzLnNwbGljZShpLCAxKVxuICAgICAgaWYgbmV3UnVsZS5yZVxuICAgICAgICBhY3RpdmVSdWxlcy5wdXNoIG5ld1J1bGVcblxuICAgIHByZXZJbmRlbnQgPSAwXG4gICAgZm9yIGV4dCBpbiBPYmplY3Qua2V5cyhsYW5nbWFwKVxuICAgICAgaWYgZWRpdG9yRmlsZS5sYXN0SW5kZXhPZihleHQpICsgZXh0Lmxlbmd0aCA9PSBlZGl0b3JGaWxlLmxlbmd0aFxuICAgICAgICBhY3RpdmVSdWxlcyA9IGFjdGl2ZVJ1bGVzLmNvbmNhdChsYW5nbWFwW2V4dF0pXG4gICAgICAgIGJyZWFrXG5cbiAgICAjIGluY29ycG9yYXRlIHByb2plY3QgcnVsZXNcbiAgICBmb3IgcHJvamVjdFBhdGggb2YgQHByb2plY3RSdWxlc1xuICAgICAgaWYgZWRpdG9yRmlsZS5pbmRleE9mKHByb2plY3RQYXRoKSA9PSAwXG4gICAgICAgIHByb2plY3RSdWxlcyA9IEBwcm9qZWN0UnVsZXNbcHJvamVjdFBhdGhdXG4gICAgICAgIGZvciBydWxlIGluIHByb2plY3RSdWxlc1xuICAgICAgICAgIHVwZGF0ZVJ1bGVzKHJ1bGUpXG5cbiAgICBmb3Igcm93IGluIFswLi5lZGl0b3IuZ2V0TGluZUNvdW50KCkgXVxuICAgICAgbGluZVRleHQgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocm93KVxuICAgICAgbGluZVRleHQgPSBsaW5lVGV4dC50cmltKCkgaWYgbGluZVRleHRcbiAgICAgIGNvbnRpbnVlIGlmICFsaW5lVGV4dFxuICAgICAgaWYgbGluZVRleHQuaW5kZXhPZignIycgKyAnbWFya2VyLXJ1bGU6JykgPj0gMFxuICAgICAgICBuZXdSdWxlID0gQHBhcnNlUnVsZShsaW5lVGV4dClcbiAgICAgICAgaWYgbmV3UnVsZVxuICAgICAgICAgIHVwZGF0ZVJ1bGVzKG5ld1J1bGUpXG4gICAgICAgICAgY29udGludWVcblxuICAgICAgIyBUcmFjayBpbmRlbnQgbGV2ZWxcbiAgICAgIGluZGVudCA9IGxpbmVUZXh0Lm1hdGNoKGluZGVudFNwYWNlUmUpWzBdLmxlbmd0aFxuICAgICAgd2hpbGUgaW5kZW50IDwgcHJldkluZGVudFxuICAgICAgICBwcmV2SW5kZW50ID0gbWFya2VySW5kZW50cy5wb3AoKVxuXG4gICAgICBmb3IgcnVsZSBpbiBhY3RpdmVSdWxlc1xuICAgICAgICBpZiBydWxlLm11bHRpbGluZSA9PSB0cnVlICYmIHJvdyA8IGVkaXRvci5nZXRMaW5lQ291bnQoKVxuICAgICAgICAgIG5leHRMaW5lVGV4dCA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhyb3cgKyAxKSBcbiAgICAgICAgICBsaW5lVGV4dCA9IGxpbmVUZXh0ICsgJ1xcbicgKyBuZXh0TGluZVRleHRcbiAgICAgICAgICBtYXRjaCA9IGxpbmVUZXh0Lm1hdGNoKHJ1bGUucmUpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBtYXRjaCA9IGxpbmVUZXh0Lm1hdGNoKHJ1bGUucmUpXG4gICAgICAgIGlmIG1hdGNoXG4gICAgICAgICAgcGFyZW50SW5kZW50ID0gLTFcbiAgICAgICAgICBtYXJrZXJJbmRlbnRzLnB1c2goaW5kZW50KSBpZiBpbmRlbnQgPiBwcmV2SW5kZW50XG4gICAgICAgICAgaWYgbWFya2VySW5kZW50cy5sZW5ndGggPiAxXG4gICAgICAgICAgICBwYXJlbnRJbmRlbnQgPSBtYXJrZXJJbmRlbnRzW21hcmtlckluZGVudHMubGVuZ3RoLTJdXG4gICAgICAgICAgaXRlbXMucHVzaCBAbWFrZUl0ZW0ocnVsZSwgbWF0Y2gsIGxpbmVUZXh0LCByb3csIGluZGVudCwgcGFyZW50SW5kZW50KVxuICAgIHJldHVybiBpdGVtc1xuXG5cbiAgbWFrZUl0ZW06IChydWxlLCBtYXRjaCwgdGV4dCwgcm93LCBpbmRlbnQsIHBhcmVudEluZGVudCkgLT5cbiAgICBsYWJlbCA9IHJ1bGUuaWQgfHwgJydcbiAgICB0b29sdGlwID0gcnVsZS50b29sdGlwIHx8ICcnXG4gICAgaWNvbiA9IHJ1bGUuaWNvbiAjfHwgJ3ByaW1pdGl2ZS1kb3QnXG4gICAgaWYgbGFiZWwgb3IgdG9vbHRpcFxuICAgICAgZm9yIHN0ciwgaSBpbiBtYXRjaFxuICAgICAgICBpZiBsYWJlbFxuICAgICAgICAgIGxhYmVsID0gbGFiZWwucmVwbGFjZShwb3NpdGlvblJlW2ldLCBtYXRjaFtpXSlcbiAgICAgICAgaWYgdG9vbHRpcFxuICAgICAgICAgIHRvb2x0aXAgPSB0b29sdGlwLnJlcGxhY2UocG9zaXRpb25SZVtpXSwgbWF0Y2hbaV0pXG4gICAgaWYgISBsYWJlbFxuICAgICAgbGFiZWwgPSBtYXRjaFsxXSB8fCBtYXRjaFswXVxuXG4gICAga2luZCA9IHJ1bGUua2luZCB8fCAnTWFya2VycydcblxuICAgIGlmIHJ1bGUuYXJnc1xuICAgICAgYXJnc01hdGNoID0gYXJnc1JlW3J1bGUuYXJnc10uZXhlYyh0ZXh0KVxuICAgICAgdG9vbHRpcCArPSBhcmdzTWF0Y2hbMV0gaWYgYXJnc01hdGNoXG5cbiAgICBpdGVtID0ge2xhYmVsOiBsYWJlbCwgaWNvbjogaWNvbiwga2luZDoga2luZCwgcm93OiByb3dcbiAgICAgICwgdG9vbHRpcDogdG9vbHRpcCwgaW5kZW50OiBpbmRlbnQsIHBhcmVudEluZGVudDogcGFyZW50SW5kZW50fVxuXG5cbiAgIyBwYXJzZVJ1bGUgOiB0byBkZWNpcGhlciBydWxlcyBpbiAubmF2LW1hcmtlci1ydWxlcyBmaWxlIG9yIHdpdGhpbiBzb3VyY2VcbiAgcGFyc2VSdWxlOiAobGluZSkgLT5cbiAgICAjIFNob3VsZCBiZTogJyNtYXJrZXItcnVsZScgZm9sbG93ZWQgYnkgY29sb24sIHRoZW4gYnkgcmVndWxhciBleHByZXNzaW9uXG4gICAgIyBmb2xsb3dlZCBieSBvcHRpb25hbCBmaWVsZHMgc2VwYXJhdGVkIGJ5IHx8XG4gICAgIyBvcHRpb25hbCBmaWVsZHMgYXJlXG4gICAgIyBpZGVudGlmaWVyIChsYWJlbCkgd2hpY2ggbXVzdCBoYXZlIG9uZSBvZiAlMSB0aHJvdWdoICU5IGlmIHByZXNlbnRcbiAgICAjIGtpbmQgOiBlLmcuIEZ1bmN0aW9uLiBEZWZhdWx0IGlzICdNYXJrZXJzJ1xuICAgICMgc3RhcnRPdmVyIDogVGhlIGxpdGVyYWwgdGV4dCAnc3RhcnRPdmVyJy4gRGlzY2FyZHMgYW55IHByZXZpb3VzIHJ1bGVzXG4gICAgIyBkaXNhYmxlPWtpbmQxLGtpbmQyIDogRGlzYWJsZSBzcGVjaWZpZWQga2luZHNcbiAgICAjIGV4dD0uY29mZmVlLC5qc1xuICAgIHJldHVybiB1bmxlc3MgbGluZVxuICAgIHJ1bGVTdHIgPSBsaW5lLnNwbGl0KCcjJyArICdtYXJrZXItcnVsZTonKVsxXS50cmltKClcbiAgICByZXR1cm4gdW5sZXNzIHJ1bGVTdHJcbiAgICBwYXJ0cyA9IHJ1bGVTdHIuc3BsaXQoJ3x8JylcbiAgICByZUZpZWxkcyA9IHBhcnRzWzBdLm1hdGNoKC9bIFxcdF0qXFwvKC4rKVxcLyguKikvKVxuICAgIGlmICFyZUZpZWxkcyAmJiBydWxlU3RyLnNlYXJjaCgvKF58XFx8XFx8KShzdGFydE92ZXJ8ZGlzYWJsZT0pLykgPT0gLTFcbiAgICAgIGNvbnNvbGUubG9nICdOYXZpZ2F0b3IgUGFuZWw6IE5vIHJlZ3VsYXIgZXhwcmVzc2lvbiBmb3VuZCBpbiA6JywgbGluZVxuICAgICAgcmV0dXJuXG4gICAgcnVsZSA9IHt9XG4gICAgaWYgcmVGaWVsZHNcbiAgICAgIHJlU3RyID0gcmVGaWVsZHNbMV0gIy5yZXBsYWNlKC9cXFxcL2csICdcXFxcXFxcXCcpXG4gICAgICBmbGFnID0gJ2knIGlmIHJlRmllbGRzWzJdXG4gICAgICBydWxlID0ge3JlOiBuZXcgUmVnRXhwKHJlU3RyLCBmbGFnKX1cbiAgICAgIGlmIC9cXFxcbi8udGVzdChyZUZpZWxkc1sxXSlcbiAgICAgICAgcnVsZS5tdWx0aWxpbmUgPSB0cnVlXG4gICAgICBwYXJ0cy5zaGlmdCgpXG5cbiAgICBmb3IgcGFydCBpbiBwYXJ0c1xuICAgICAgaWYgcGFydC5pbmRleE9mKCclJykgICE9IC0xXG4gICAgICAgIHJ1bGUuaWQgPSBwYXJ0XG4gICAgICBlbHNlIGlmIHBhcnQuaW5kZXhPZignc3RhcnRPdmVyJykgPT0gMFxuICAgICAgICBydWxlLnN0YXJ0T3ZlciA9IHRydWVcbiAgICAgIGVsc2UgaWYgcGFydC5pbmRleE9mKCdkaXNhYmxlPScpID09IDBcbiAgICAgICAgcnVsZS5kaXNhYmxlR3JvdXBzID0gcGFydC5zdWJzdHIoJ2Rpc2FibGU9Jy5sZW5ndGgpLnNwbGl0KCcsJylcbiAgICAgIGVsc2UgaWYgcGFydC5pbmRleE9mKCdleHQ9JykgPT0gMFxuICAgICAgICBydWxlLmV4dCA9IHBhcnQuc3Vic3RyKCdleHQ9Jy5sZW5ndGgpLnNwbGl0KCcsJylcbiAgICAgIGVsc2VcbiAgICAgICAgcnVsZS5raW5kID0gcGFydFxuICAgIHJldHVybiBydWxlXG5cblxuICBkZXN0cm95OiAtPlxuICAgIEBwYXRoT2JzZXJ2ZXIuZGlzcG9zZSgpXG4iXX0=
