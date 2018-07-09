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
                  if (line.indexOf('#' + 'marker-rule:') >= 0) {
                    rule = _this.parseRule(line);
                    if (rule) {
                      (base = _this.projectRules)[projectPath] || (base[projectPath] = []);
                      results1.push(_this.projectRules[projectPath].push(rule));
                    } else {
                      results1.push(void 0);
                    }
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
      var activeRules, editor, editorFile, ext, indent, items, k, l, len, len1, len2, lineText, m, markerIndents, match, n, newRule, nextLineText, parentIndent, prevIndent, projectPath, projectRules, ref1, ref2, ref3, row, rule, updateRules;
      items = [];
      editor = atom.workspace.getActiveTextEditor();
      if (!editor) {
        return items;
      }
      editorFile = editor.getPath();
      if (!editorFile) {
        return;
      }
      activeRules = ((ref1 = langdef.All) != null ? ref1.slice() : void 0) || [];
      markerIndents = [];
      updateRules = function(newRule) {
        var disableGroup, ext, fileMatches, k, l, len, len1, len2, m, ref2, ref3, rule;
        if (newRule.ext) {
          fileMatches = false;
          ref2 = newRule.ext;
          for (k = 0, len = ref2.length; k < len; k++) {
            ext = ref2[k];
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
          ref3 = newRule.disableGroups;
          for (l = 0, len1 = ref3.length; l < len1; l++) {
            disableGroup = ref3[l];
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
      ref2 = Object.keys(langmap);
      for (k = 0, len = ref2.length; k < len; k++) {
        ext = ref2[k];
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
      for (row = m = 0, ref3 = editor.getLineCount(); 0 <= ref3 ? m <= ref3 : m >= ref3; row = 0 <= ref3 ? ++m : --m) {
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
      if (typeof pathObserver !== "undefined" && pathObserver !== null) {
        return this.pathObserver.dispose();
      }
    };

    return NavParser;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL25hdi1wYW5lbC1wbHVzL2xpYi9uYXYtcGFyc2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxNQUFxQixPQUFBLENBQVEsU0FBUixDQUFyQixFQUFDLHFCQUFELEVBQVU7O0VBR1YsTUFBQSxHQUFTO0lBQ1AsSUFBQSxFQUFNLGFBREM7SUFFUCxJQUFBLEVBQU0sY0FGQzs7O0VBSVQsYUFBQSxHQUFnQjs7RUFDaEIsVUFBQSxHQUFhOztBQUNiLE9BQVMsMEJBQVQ7SUFDRSxVQUFXLENBQUEsQ0FBQSxDQUFYLEdBQWdCLElBQUksTUFBSixDQUFXLEdBQUEsR0FBTSxDQUFqQixFQUFvQixHQUFwQjtBQURsQjs7RUFJQSxNQUFNLENBQUMsT0FBUCxHQUNNO3dCQUNKLFlBQUEsR0FBYzs7d0JBQ2QsWUFBQSxHQUFlOztJQUdGLG1CQUFBO0FBQ1gsVUFBQTtNQUFBLElBQUMsQ0FBQSxlQUFELENBQWlCLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFBLENBQWpCO01BQ0EsWUFBQSxHQUFlLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWIsQ0FBOEIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEtBQUQ7aUJBQzNDLEtBQUMsQ0FBQSxlQUFELENBQWlCLEtBQWpCO1FBRDJDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QjtJQUZKOzt3QkFNYixlQUFBLEdBQWlCLFNBQUMsS0FBRDtBQUVmLFVBQUE7QUFBQSxXQUFBLGdDQUFBO1FBQ0UsSUFBRyxLQUFLLENBQUMsT0FBTixDQUFjLFdBQWQsQ0FBQSxLQUE4QixDQUFDLENBQWxDO1VBQ0UsT0FBTyxJQUFDLENBQUEsWUFBYSxDQUFBLFdB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QSxDQUFwQixDQUFIO1VBQ0UsSUFBSSxDQUFDLFNBQUwsR0FBaUIsS0FEbkI7O1FBRUEsS0FBSyxDQUFDLEtBQU4sQ0FBQSxFQU5GOztBQVFBLFdBQUEsdUNBQUE7O1FBQ0UsSUFBRyxJQUFJLENBQUMsT0FBTCxDQUFhLEdBQWIsQ0FBQSxLQUFzQixDQUFDLENBQTFCO1VBQ0UsSUFBSSxDQUFDLEVBQUwsR0FBVSxLQURaO1NBQUEsTUFFSyxJQUFHLElBQUksQ0FBQyxPQUFMLENBQWEsV0FBYixDQUFBLEtBQTZCLENBQWhDO1VBQ0gsSUFBSSxDQUFDLFNBQUwsR0FBaUIsS0FEZDtTQUFBLE1BRUEsSUFBRyxJQUFJLENBQUMsT0FBTCxDQUFhLFVBQWIsQ0FBQSxLQUE0QixDQUEvQjtVQUNILElBQUksQ0FBQyxhQUFMLEdBQXFCLElBQUksQ0FBQyxNQUFMLENBQVksVUFBVSxDQUFDLE1BQXZCLENBQThCLENBQUMsS0FBL0IsQ0FBcUMsR0FBckMsRUFEbEI7U0FBQSxNQUVBLElBQUcsSUFBSSxDQUFDLE9BQUwsQ0FBYSxNQUFiLENBQUEsS0FBd0IsQ0FBM0I7VUFDSCxJQUFJLENBQUMsR0FBTCxHQUFXLElBQUksQ0FBQyxNQUFMLENBQVksTUFBTSxDQUFDLE1BQW5CLENBQTBCLENBQUMsS0FBM0IsQ0FBaUMsR0FBakMsRUFEUjtTQUFBLE1BQUE7VUFHSCxJQUFJLENBQUMsSUFBTCxHQUFZLEtBSFQ7O0FBUFA7QUFXQSxhQUFPO0lBckNFOzt3QkF3Q1gsT0FBQSxHQUFTLFNBQUE7TUFDUCxJQUEyQiw0REFBM0I7ZUFBQSxJQUFDLENBQUEsWUFBWSxDQUFDLE9BQWQsQ0FBQSxFQUFBOztJQURPOzs7OztBQTVMWCIsInNvdXJjZXNDb250ZW50IjpbImZzID0gcmVxdWlyZSAnZnMnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbntsYW5nZGVmLCBsYW5nbWFwfSA9IHJlcXVpcmUgJy4vY3RhZ3MnXG5cbiMgUmVnRXhwIHRvIGNhcHR1cmUgYW55IGFyZ3VtZW50cyB3aXRoaW4gKCkgb3Igd2l0aGluIFtdXG5hcmdzUmUgPSB7XG4gICcoKSc6IC8oXFwoW14pXStcXCkpL1xuICAnW10nOiAvKFxcW1teXFxdXStcXF0pL1xufVxuaW5kZW50U3BhY2VSZSA9IC9eKD86IHxcXHQpKi9cbnBvc2l0aW9uUmUgPSBbXVxuZm9yIGkgaW4gWzAuLjldXG4gIHBvc2l0aW9uUmVbaV0gPSBuZXcgUmVnRXhwKCclJyArIGksICdnJylcblxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBOYXZQYXJzZXJcbiAgcGF0aE9ic2VydmVyOiBudWxsXG4gIHByb2plY3RSdWxlcyA6IHt9XG5cblxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAZ2V0UHJvamVjdFJ1bGVzIGF0b20ucHJvamVjdC5nZXRQYXRocygpXG4gICAgcGF0aE9ic2VydmVyID0gYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHMgKHBhdGhzKT0+XG4gICAgICBAZ2V0UHJvamVjdFJ1bGVzIHBhdGhzXG5cblxuICBnZXRQcm9qZWN0UnVsZXM6IChwYXRocyktPlxuICAgICMgRmlyc3QgcmVtb3ZlIGFueSBwcm9qZWN0IHRoYXQncyBiZWVuIGNsb3NlZFxuICAgIGZvciBwcm9qZWN0UGF0aCBvZiBAcHJvamVjdFJ1bGVzXG4gICAgICBpZiBwYXRocy5pbmRleE9mKHByb2plY3RQYXRoKSA9PSAtMVxuICAgICAgICBkZWxldGUgQHByb2plY3RSdWxlc1twcm9qZWN0UGF0aF1cbiAgICAjIE5vdyBhbnkgbmV3IHByb2plY3Qgb3BlbmVkLlxuICAgIGZvciBwcm9qZWN0UGF0aCBpbiBwYXRoc1xuICAgICAgcnVsZUZpbGUgPSBwcm9qZWN0UGF0aCArIHBhdGguc2VwICsgJy5uYXYtbWFya2VyLXJ1bGVzJ1xuICAgICAgaWYgIUBwcm9qZWN0UnVsZXNbcHJvamVjdFBhdGhdXG4gICAgICAgIGRvIChwcm9qZWN0UGF0aCk9PlxuICAgICAgICAgIGZzLnJlYWRGaWxlIHJ1bGVGaWxlLCAoZXJyLGRhdGEpPT5cbiAgICAgICAgICAgIHJldHVybiB1bmxlc3MgZGF0YVxuICAgICAgICAgICAgcnVsZXNUZXh0ID0gZGF0YS50b1N0cmluZygpLnNwbGl0KFwiXFxuXCIpXG4gICAgICAgICAgICBmb3IgbGluZSBpbiBydWxlc1RleHRcbiAgICAgICAgICAgICAgaWYgbGluZS5pbmRleE9mKCcjJyArICdtYXJrZXItcnVsZTonKSA+PSAwXG4gICAgICAgICAgICAgICAgcnVsZSA9IEBwYXJzZVJ1bGUobGluZSlcbiAgICAgICAgICAgICAgICBpZiBydWxlXG4gICAgICAgICAgICAgICAgICBAcHJvamVjdFJ1bGVzW3Byb2plY3RQYXRoXSB8fD0gW11cbiAgICAgICAgICAgICAgICAgIEBwcm9qZWN0UnVsZXNbcHJvamVjdFBhdGhdLnB1c2ggcnVsZVxuXG5cbiAgcGFyc2U6IC0+XG4gICAgIyBwYXJzZSBhY3RpdmUgZWRpdG9yJ3MgdGV4dFxuICAgIGl0ZW1zID0gW11cbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICByZXR1cm4gaXRlbXMgdW5sZXNzIGVkaXRvclxuICAgIGVkaXRvckZpbGUgPSBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgcmV0dXJuIHVubGVzcyBlZGl0b3JGaWxlICAjIGhhcHBlbnMgd2l0aCBuZXcgZmlsZVxuXG4gICAgYWN0aXZlUnVsZXMgPSBsYW5nZGVmLkFsbD8uc2xpY2UoKSB8fCBbXSAgIyBNVVNUIG9wZXJhdGUgb24gYSBjb3B5LlxuICAgICMgQXNzaWduaW5nIHdpdGhvdXQgc2xpY2UoKSBpbiB0aGUgbGluZSBhYm92ZSBjYXVzZWQgYWRkaXRpb25zIHRvXG4gICAgIyBhY3RpdmVSdWxlcyAoYmVsb3cpIHRvIGFsc28gYmUgYWRkaXRpb25zIHRvIGxhbmdkZWYuQWxsLCB3aGljaFxuICAgICMgd2FzIGRlZmluaXRlbHkgbm90IGRlc2lyZWQuXG4gICAgbWFya2VySW5kZW50cyA9IFtdICAgICMgaW5kZW50IGNoYXJzIHRvIHRyYWNrIHBhcmVudC9jaGlsZHJlblxuXG4gICAgdXBkYXRlUnVsZXMgPSAobmV3UnVsZSktPlxuICAgICAgaWYgbmV3UnVsZS5leHRcbiAgICAgICAgZmlsZU1hdGNoZXMgPSBmYWxzZVxuICAgICAgICBmb3IgZXh0IGluIG5ld1J1bGUuZXh0XG4gICAgICAgICAgaWYgZWRpdG9yRmlsZS5sYXN0SW5kZXhPZihleHQpICsgZXh0Lmxlbmd0aCA9PSBlZGl0b3JGaWxlLmxlbmd0aFxuICAgICAgICAgICAgZmlsZU1hdGNoZXMgPSB0cnVlXG4gICAgICAgICAgICBicmVha1xuICAgICAgICByZXR1cm4gdW5sZXNzIGZpbGVNYXRjaGVzXG4gICAgICBpZiBuZXdSdWxlLnN0YXJ0T3ZlclxuICAgICAgICBhY3RpdmVSdWxlcyA9IFtdXG4gICAgICBpZiBuZXdSdWxlLmRpc2FibGVHcm91cHNcbiAgICAgICAgZm9yIGRpc2FibGVHcm91cCBpbiBuZXdSdWxlLmRpc2FibGVHcm91cHNcbiAgICAgICAgICBmb3IgcnVsZSwgaSBpbiBhY3RpdmVSdWxlc1xuICAgICAgICAgICAgaWYgcnVsZS5raW5kID09IGRpc2FibGVHcm91cFxuICAgICAgICAgICAgICBhY3RpdmVSdWxlcy5zcGxpY2UoaSwgMSlcbiAgICAgIGlmIG5ld1J1bGUucmVcbiAgICAgICAgYWN0aXZlUnVsZXMucHVzaCBuZXdSdWxlXG5cbiAgICBwcmV2SW5kZW50ID0gMFxuICAgIGZvciBleHQgaW4gT2JqZWN0LmtleXMobGFuZ21hcClcbiAgICAgIGlmIGVkaXRvckZpbGUubGFzdEluZGV4T2YoZXh0KSArIGV4dC5sZW5ndGggPT0gZWRpdG9yRmlsZS5sZW5ndGhcbiAgICAgICAgYWN0aXZlUnVsZXMgPSBhY3RpdmVSdWxlcy5jb25jYXQobGFuZ21hcFtleHRdKVxuICAgICAgICBicmVha1xuXG4gICAgIyBpbmNvcnBvcmF0ZSBwcm9qZWN0IHJ1bGVzXG4gICAgZm9yIHByb2plY3RQYXRoIG9mIEBwcm9qZWN0UnVsZXNcbiAgICAgIGlmIGVkaXRvckZpbGUuaW5kZXhPZihwcm9qZWN0UGF0aCkgPT0gMFxuICAgICAgICBwcm9qZWN0UnVsZXMgPSBAcHJvamVjdFJ1bGVzW3Byb2plY3RQYXRoXVxuICAgICAgICBmb3IgcnVsZSBpbiBwcm9qZWN0UnVsZXNcbiAgICAgICAgICB1cGRhdGVSdWxlcyhydWxlKVxuXG4gICAgZm9yIHJvdyBpbiBbMC4uZWRpdG9yLmdldExpbmVDb3VudCgpIF1cbiAgICAgIGxpbmVUZXh0ID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHJvdylcbiAgICAgIGxpbmVUZXh0ID0gbGluZVRleHQudHJpbSgpIGlmIGxpbmVUZXh0XG4gICAgICBjb250aW51ZSBpZiAhbGluZVRleHRcbiAgICAgIGlmIGxpbmVUZXh0LmluZGV4T2YoJyMnICsgJ21hcmtlci1ydWxlOicpID49IDBcbiAgICAgICAgbmV3UnVsZSA9IEBwYXJzZVJ1bGUobGluZVRleHQpXG4gICAgICAgIGlmIG5ld1J1bGVcbiAgICAgICAgICB1cGRhdGVSdWxlcyhuZXdSdWxlKVxuICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICMgVHJhY2sgaW5kZW50IGxldmVsXG4gICAgICBpbmRlbnQgPSBsaW5lVGV4dC5tYXRjaChpbmRlbnRTcGFjZVJlKVswXS5sZW5ndGhcbiAgICAgIHdoaWxlIGluZGVudCA8IHByZXZJbmRlbnRcbiAgICAgICAgcHJldkluZGVudCA9IG1hcmtlckluZGVudHMucG9wKClcblxuICAgICAgZm9yIHJ1bGUgaW4gYWN0aXZlUnVsZXNcbiAgICAgICAgaWYgcnVsZS5tdWx0aWxpbmUgPT0gdHJ1ZSAmJiByb3cgPCBlZGl0b3IuZ2V0TGluZUNvdW50KClcbiAgICAgICAgICBuZXh0TGluZVRleHQgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocm93ICsgMSkgXG4gICAgICAgICAgbGluZVRleHQgPSBsaW5lVGV4dCArICdcXG4nICsgbmV4dExpbmVUZXh0XG4gICAgICAgICAgbWF0Y2ggPSBsaW5lVGV4dC5tYXRjaChydWxlLnJlKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgbWF0Y2ggPSBsaW5lVGV4dC5tYXRjaChydWxlLnJlKVxuICAgICAgICBpZiBtYXRjaFxuICAgICAgICAgIHBhcmVudEluZGVudCA9IC0xXG4gICAgICAgICAgbWFya2VySW5kZW50cy5wdXNoKGluZGVudCkgaWYgaW5kZW50ID4gcHJldkluZGVudFxuICAgICAgICAgIGlmIG1hcmtlckluZGVudHMubGVuZ3RoID4gMVxuICAgICAgICAgICAgcGFyZW50SW5kZW50ID0gbWFya2VySW5kZW50c1ttYXJrZXJJbmRlbnRzLmxlbmd0aC0yXVxuICAgICAgICAgIGl0ZW1zLnB1c2ggQG1ha2VJdGVtKHJ1bGUsIG1hdGNoLCBsaW5lVGV4dCwgcm93LCBpbmRlbnQsIHBhcmVudEluZGVudClcbiAgICByZXR1cm4gaXRlbXNcblxuXG4gIG1ha2VJdGVtOiAocnVsZSwgbWF0Y2gsIHRleHQsIHJvdywgaW5kZW50LCBwYXJlbnRJbmRlbnQpIC0+XG4gICAgbGFiZWwgPSBydWxlLmlkIHx8ICcnXG4gICAgdG9vbHRpcCA9IHJ1bGUudG9vbHRpcCB8fCAnJ1xuICAgIGljb24gPSBydWxlLmljb24gI3x8ICdwcmltaXRpdmUtZG90J1xuICAgIGlmIGxhYmVsIG9yIHRvb2x0aXBcbiAgICAgIGZvciBzdHIsIGkgaW4gbWF0Y2hcbiAgICAgICAgaWYgbGFiZWxcbiAgICAgICAgICBsYWJlbCA9IGxhYmVsLnJlcGxhY2UocG9zaXRpb25SZVtpXSwgbWF0Y2hbaV0pXG4gICAgICAgIGlmIHRvb2x0aXBcbiAgICAgICAgICB0b29sdGlwID0gdG9vbHRpcC5yZXBsYWNlKHBvc2l0aW9uUmVbaV0sIG1hdGNoW2ldKVxuICAgIGlmICEgbGFiZWxcbiAgICAgIGxhYmVsID0gbWF0Y2hbMV0gfHwgbWF0Y2hbMF1cblxuICAgIGtpbmQgPSBydWxlLmtpbmQgfHwgJ01hcmtlcnMnXG5cbiAgICBpZiBydWxlLmFyZ3NcbiAgICAgIGFyZ3NNYXRjaCA9IGFyZ3NSZVtydWxlLmFyZ3NdLmV4ZWModGV4dClcbiAgICAgIHRvb2x0aXAgKz0gYXJnc01hdGNoWzFdIGlmIGFyZ3NNYXRjaFxuXG4gICAgaXRlbSA9IHtsYWJlbDogbGFiZWwsIGljb246IGljb24sIGtpbmQ6IGtpbmQsIHJvdzogcm93XG4gICAgICAsIHRvb2x0aXA6IHRvb2x0aXAsIGluZGVudDogaW5kZW50LCBwYXJlbnRJbmRlbnQ6IHBhcmVudEluZGVudH1cblxuXG4gICMgcGFyc2VSdWxlIDogdG8gZGVjaXBoZXIgcnVsZXMgaW4gLm5hdi1tYXJrZXItcnVsZXMgZmlsZSBvciB3aXRoaW4gc291cmNlXG4gIHBhcnNlUnVsZTogKGxpbmUpIC0+XG4gICAgIyBTaG91bGQgYmU6ICcjbWFya2VyLXJ1bGUnIGZvbGxvd2VkIGJ5IGNvbG9uLCB0aGVuIGJ5IHJlZ3VsYXIgZXhwcmVzc2lvblxuICAgICMgZm9sbG93ZWQgYnkgb3B0aW9uYWwgZmllbGRzIHNlcGFyYXRlZCBieSB8fFxuICAgICMgb3B0aW9uYWwgZmllbGRzIGFyZVxuICAgICMgaWRlbnRpZmllciAobGFiZWwpIHdoaWNoIG11c3QgaGF2ZSBvbmUgb2YgJTEgdGhyb3VnaCAlOSBpZiBwcmVzZW50XG4gICAgIyBraW5kIDogZS5nLiBGdW5jdGlvbi4gRGVmYXVsdCBpcyAnTWFya2VycydcbiAgICAjIHN0YXJ0T3ZlciA6IFRoZSBsaXRlcmFsIHRleHQgJ3N0YXJ0T3ZlcicuIERpc2NhcmRzIGFueSBwcmV2aW91cyBydWxlc1xuICAgICMgZGlzYWJsZT1raW5kMSxraW5kMiA6IERpc2FibGUgc3BlY2lmaWVkIGtpbmRzXG4gICAgIyBleHQ9LmNvZmZlZSwuanNcbiAgICByZXR1cm4gdW5sZXNzIGxpbmVcbiAgICBydWxlU3RyID0gbGluZS5zcGxpdCgnIycgKyAnbWFya2VyLXJ1bGU6JylbMV0udHJpbSgpXG4gICAgcmV0dXJuIHVubGVzcyBydWxlU3RyXG4gICAgcGFydHMgPSBydWxlU3RyLnNwbGl0KCd8fCcpXG4gICAgcmVGaWVsZHMgPSBwYXJ0c1swXS5tYXRjaCgvWyBcXHRdKlxcLyguKylcXC8oLiopLylcbiAgICBpZiAhcmVGaWVsZHMgJiYgcnVsZVN0ci5zZWFyY2goLyhefFxcfFxcfCkoc3RhcnRPdmVyfGRpc2FibGU9KS8pID09IC0xXG4gICAgICBjb25zb2xlLmxvZyAnTmF2aWdhdG9yIFBhbmVsOiBObyByZWd1bGFyIGV4cHJlc3Npb24gZm91bmQgaW4gOicsIGxpbmVcbiAgICAgIHJldHVyblxuICAgIHJ1bGUgPSB7fVxuICAgIGlmIHJlRmllbGRzXG4gICAgICByZVN0ciA9IHJlRmllbGRzWzFdICMucmVwbGFjZSgvXFxcXC9nLCAnXFxcXFxcXFwnKVxuICAgICAgZmxhZyA9ICdpJyBpZiByZUZpZWxkc1syXVxuICAgICAgcnVsZSA9IHtyZTogbmV3IFJlZ0V4cChyZVN0ciwgZmxhZyl9XG4gICAgICBpZiAvXFxcXG4vLnRlc3QocmVGaWVsZHNbMV0pXG4gICAgICAgIHJ1bGUubXVsdGlsaW5lID0gdHJ1ZVxuICAgICAgcGFydHMuc2hpZnQoKVxuXG4gICAgZm9yIHBhcnQgaW4gcGFydHNcbiAgICAgIGlmIHBhcnQuaW5kZXhPZignJScpICAhPSAtMVxuICAgICAgICBydWxlLmlkID0gcGFydFxuICAgICAgZWxzZSBpZiBwYXJ0LmluZGV4T2YoJ3N0YXJ0T3ZlcicpID09IDBcbiAgICAgICAgcnVsZS5zdGFydE92ZXIgPSB0cnVlXG4gICAgICBlbHNlIGlmIHBhcnQuaW5kZXhPZignZGlzYWJsZT0nKSA9PSAwXG4gICAgICAgIHJ1bGUuZGlzYWJsZUdyb3VwcyA9IHBhcnQuc3Vic3RyKCdkaXNhYmxlPScubGVuZ3RoKS5zcGxpdCgnLCcpXG4gICAgICBlbHNlIGlmIHBhcnQuaW5kZXhPZignZXh0PScpID09IDBcbiAgICAgICAgcnVsZS5leHQgPSBwYXJ0LnN1YnN0cignZXh0PScubGVuZ3RoKS5zcGxpdCgnLCcpXG4gICAgICBlbHNlXG4gICAgICAgIHJ1bGUua2luZCA9IHBhcnRcbiAgICByZXR1cm4gcnVsZVxuXG5cbiAgZGVzdHJveTogLT5cbiAgICBAcGF0aE9ic2VydmVyLmRpc3Bvc2UoKSBpZiBwYXRoT2JzZXJ2ZXI/XG4iXX0=
