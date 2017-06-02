(function() {
  var $, NavView, ResizableWidthView, TextEditor, icon_order_alphabetical, icon_order_as_is,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  $ = require('jquery');

  ResizableWidthView = require('./resizable-width-view');

  TextEditor = require('atom').TextEditor;

  icon_order_as_is = "icon-arrow-right";

  icon_order_alphabetical = "alphabetical-order";

  module.exports = NavView = (function(superClass) {
    extend(NavView, superClass);

    NavView.prototype.panel = null;

    NavView.prototype.filePanel = null;

    NavView.prototype.bottomGroups = [];

    NavView.prototype.enabled = true;

    NavView.prototype.settings = {};

    NavView.prototype.parser = null;

    NavView.prototype.state = {};

    NavView.prototype.view = null;

    NavView.prototype.miniEditor = null;

    NavView.prototype.nextId = 1;

    function NavView(state, settings, parser) {
      var header, html;
      NavView.__super__.constructor.call(this, settings.leftPanel);
      this.enabled = !(state.enabled === false);
      this.state = state.fileStates || {};
      this.changeSettings(settings);
      this.parser = parser;
      this.miniEditor = new TextEditor({
        mini: true,
        placeholderText: "Filter by name"
      });
      this.miniEditor.onDidChange((function(_this) {
        return function() {
          return _this.filter();
        };
      })(this));
      this.viewContainer.addClass('zi-marker-panel');
      html = "<div class='zi-header'>\n  <!-- <div class='icon settings icon-gear'></div> -->\n  <div class='icon sorter'></div>\n</div>\n<div class='zi-view'>\n</div>";
      $(html).appendTo(this.mainView);
      header = this.mainView.find('.zi-header');
      header.append(this.miniEditor.element);
      this.view = this.mainView.find('.zi-view');
      this.view.on('click', '.list-item', (function(_this) {
        return function(event) {
          var elem;
          elem = event.currentTarget;
          if (elem.markerId) {
            if ($(event.target).hasClass('icon')) {
              return _this.toggleHighlight(elem);
            } else {
              return _this.gotoMarker(elem.markerId);
            }
          } else if ($(elem).is('.zi-marker-group-label')) {
            return $(elem).parent().toggleClass('collapsed');
          }
        };
      })(this));
      this.mainView.on('click', '.sorter', (function(_this) {
        return function() {
          var base, editor, file, sorter;
          editor = atom.workspace.getActiveTextEditor();
          if (!editor) {
            return;
          }
          file = editor.getPath();
          (base = _this.state)[file] || (base[file] = {});
          if (_this.state[file].sort === void 0) {
            _this.state[file].sort = true;
          } else {
            _this.state[file].sort = !_this.state[file].sort;
          }
          sorter = _this.mainView.find('.sorter');
          if (_this.state[file].sort) {
            sorter.addClass(icon_order_alphabetical);
            sorter.removeClass(icon_order_as_is);
            sorter.prop('title', 'Order: sorted');
          } else {
            sorter.addClass(icon_order_as_is);
            sorter.removeClass(icon_order_alphabetical);
            sorter.prop('title', 'Order: as is in file');
          }
          return _this.updateFile(file);
        };
      })(this));
    }

    NavView.prototype.destroy = function() {
      this.view.children().each((function(_this) {
        return function() {
          return _this.destroyPanel($(_this));
        };
      })(this));
      return this.panel.destroy();
    };

    NavView.prototype.filter = function() {
      var filterText, lis;
      filterText = this.miniEditor.getText();
      lis = this.view.find("li.list-item");
      lis.show();
      if (filterText !== "") {
        return lis.each((function(_this) {
          return function(index, element) {
            var el;
            el = $(element);
            if (el.text().toLowerCase().indexOf(filterText.toLowerCase()) < 0) {
              return el.hide();
            }
          };
        })(this));
      }
    };

    NavView.prototype.movePanel = function() {
      if (this.settings.leftPanel === 'left') {
        this.settings.leftPanel = 'right';
        this.panel.destroy();
        this.panel = atom.workspace.addRightPanel({
          item: this.viewContainer,
          visible: this.enabled,
          priority: 300
        });
        return this.moveHandleLeft();
      } else {
        this.settings.leftPanel = 'left';
        this.panel.destroy();
        this.panel = atom.workspace.addLeftPanel({
          item: this.viewContainer,
          visible: this.enabled,
          priority: 300
        });
        return this.moveHandleRight();
      }
    };

    NavView.prototype.changeSettings = function(settings) {
      this.settings = settings;
      if (settings.leftPanel === 'left') {
        this.panel = atom.workspace.addLeftPanel({
          item: this.viewContainer,
          visible: false,
          priority: 300
        });
        return this.moveHandleRight();
      } else {
        this.panel = atom.workspace.addRightPanel({
          item: this.viewContainer,
          visible: false,
          priority: 300
        });
        return this.moveHandleLeft();
      }
    };

    NavView.prototype.getFilePanel = function(file) {
      var filePanel;
      filePanel = null;
      this.view.children().each(function() {
        if ($(this).data('file') === file) {
          filePanel = $(this);
          return false;
        }
        return true;
      });
      return filePanel;
    };

    NavView.prototype.getFileEditor = function(file) {
      var editor, editors, i, len;
      editors = atom.workspace.getTextEditors();
      for (i = 0, len = editors.length; i < len; i++) {
        editor = editors[i];
        if (editor.getPath() === file) {
          return editor;
        }
      }
      return null;
    };

    NavView.prototype.setFile = function(file) {
      var editor, editorView, gutter, newElem, sorter;
      if (!file) {
        return;
      }
      newElem = this.getFilePanel(file);
      editor = this.getFileEditor(file);
      editorView = atom.views.getView(editor);
      gutter = $('.gutter-container', editorView);
      sorter = this.mainView.find('.sorter');
      if (!this.state[file] || this.state[file].sort) {
        sorter.addClass(icon_order_alphabetical);
        sorter.removeClass(icon_order_as_is);
        sorter.prop('title', 'Order: sorted');
      } else {
        sorter.addClass(icon_order_as_is);
        sorter.removeClass(icon_order_alphabetical);
        sorter.prop('title', 'Order: as is in file');
      }
      if (!gutter.data('zNavPanelMouse')) {
        gutter.data('zNavPanelMouse', 'done');
        (function(_this) {
          return (function(editor) {
            return gutter.on('mousedown', '.line-number', function(event) {
              var row;
              if (!_this.enabled) {
                return;
              }
              if (event.which !== 1 || event.altKey === false || event.ctrlKey === true || event.shiftKey === true) {
                return;
              }
              event.stopPropagation();
              event.preventDefault();
              row = +($(event.target).attr('data-buffer-row'));
              return _this.toggleBookmark(row, editor);
            });
          });
        })(this)(editor);
      }
      if (newElem) {
        if (newElem === this.filePanel) {
          return this.setVisibility();
        }
        return this.switchPanel(newElem);
      }
      return this.populatePanel(editor);
    };

    NavView.prototype.updateFile = function(file) {
      var editor, oldPanel, prevState;
      editor = this.getFileEditor(file);
      oldPanel = this.getFilePanel(file);
      if (oldPanel) {
        prevState = this.getPanelState(oldPanel);
        this.state[file] = prevState;
        this.destroyPanel(oldPanel);
      }
      this.populatePanel(editor);
      this.setVisibility();
      return this.filter();
    };

    NavView.prototype.getPanelState = function(panel) {
      var editor, file, groups, state;
      if (!panel) {
        return;
      }
      state = {
        collapsedGroups: [],
        bookmarks: [],
        highlights: {}
      };
      file = panel.data('file');
      editor = this.getFileEditor(file);
      if (!editor) {
        return;
      }
      groups = panel.find(".zi-marker-group");
      groups.each(function() {
        var group, groupLabel;
        group = $(this);
        groupLabel = $(this).find('.zi-marker-group-label').text().trim();
        if ($(this).hasClass('collapsed')) {
          state.collapsedGroups.push(groupLabel);
        }
        if (groupLabel === 'Bookmarks' && editor) {
          group.find('li.list-item').each(function() {
            var row;
            row = editor.getMarker(this.markerId).getStartBufferPosition().row;
            return state.bookmarks.push(row);
          });
        }
        return group.find('li.zi-highlight').each(function() {
          var base, row;
          (base = state.highlights)[groupLabel] || (base[groupLabel] = []);
          row = editor.getMarker(this.markerId).getStartBufferPosition().row;
          return state.highlights[groupLabel].push(row);
        });
      });
      if (this.state[file] && this.state[file].sort !== void 0) {
        state.sort = this.state[file].sort;
      }
      return state;
    };

    NavView.prototype.setPanelState = function(panel, state) {
      var bookmarkRow, bookmarksGroup, editor, groupLabel, groups, highlightRow, i, j, k, len, len1, len2, prevFilePanel, ref, ref1, ref2;
      if (!(panel && state)) {
        return;
      }
      editor = this.getFileEditor(panel.data('file'));
      if (!editor) {
        return;
      }
      prevFilePanel = null;
      if (this.filePanel !== panel) {
        prevFilePanel = this.filePanel;
        this.filePanel = panel;
      }
      if (state.bookmarks.length) {
        bookmarksGroup = this.addGroup('Bookmarks');
        ref = state.bookmarks;
        for (i = 0, len = ref.length; i < len; i++) {
          bookmarkRow = ref[i];
          this.toggleBookmark(bookmarkRow, editor, true);
        }
      }
      ref1 = Object.keys(state.highlights);
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        groupLabel = ref1[j];
        ref2 = state.highlights[groupLabel];
        for (k = 0, len2 = ref2.length; k < len2; k++) {
          highlightRow = ref2[k];
          this.toggleHighlight(this.getItemByOrigRow(highlightRow, groupLabel), editor);
        }
      }
      groups = panel.find(".zi-marker-group");
      groups.each(function() {
        var group;
        group = $(this);
        groupLabel = $(this).find('.zi-marker-group-label').text().trim();
        if (state.collapsedGroups.indexOf(groupLabel) >= 0) {
          return group.addClass('collapsed');
        } else {
          return group.removeClass('collapsed');
        }
      });
      if (prevFilePanel) {
        return this.filePanel = prevFilePanel;
      }
    };

    NavView.prototype.getState = function() {
      this.view.children().each((function(_this) {
        return function() {
          var file, panel, panelState;
          panel = $(_this);
          file = panel.data('file');
          panelState = _this.getPanelState(panel);
          return _this.state[file] = panelState;
        };
      })(this));
      return this.state;
    };

    NavView.prototype.saveFileState = function(file) {
      var panel, state;
      panel = this.getFilePanel(file);
      state = this.getPanelState(panel);
      if (state) {
        return this.state[file] = state;
      }
    };

    NavView.prototype.closeFile = function(file) {
      var panel, panelState;
      panel = this.getFilePanel(file);
      if (!panel) {
        return;
      }
      panelState = this.getPanelState(panel);
      if (panelState) {
        this.state[file] = panelState;
      }
      if (panel) {
        return this.destroyPanel(panel);
      }
    };

    NavView.prototype.switchPanel = function(panel) {
      this.filePanel.hide();
      this.filePanel = panel;
      return this.setVisibility();
    };

    NavView.prototype.arrangeItems = function(items, file) {
      var arrangedItems, dupKey, i, item, len, prevItems, sort;
      arrangedItems = [];
      if (this.settings.noDups) {
        prevItems = [];
        for (i = 0, len = items.length; i < len; i++) {
          item = items[i];
          dupKey = item.kind + '||' + item.label;
          if (prevItems.indexOf(dupKey) >= 0) {
            continue;
          }
          prevItems.push(dupKey);
          arrangedItems.push(item);
        }
      } else {
        arrangedItems = items.slice(0);
      }
      if (this.state[file] && this.state[file].sort !== void 0) {
        sort = this.state[file].sort;
      } else {
        sort = this.settings.sort;
      }
      if (/\.(md|rst)$/.test(file)) {
        sort = false;
      }
      if (sort) {
        arrangedItems.sort(function(a, b) {
          var key1, key2;
          key1 = (a.kind + '||' + a.label).toLowerCase();
          key2 = (b.kind + '||' + b.label).toLowerCase();
          if (key1 === key2) {
            return 0;
          }
          if (key1 > key2) {
            return 1;
          }
          return -1;
        });
      }
      return arrangedItems;
    };

    NavView.prototype.populatePanel = function(editor) {
      var elem, file, i, id, item, items, len, marker, ref;
      if (!editor) {
        editor = atom.workspace.getActiveTextEditor();
      }
      file = editor.getPath();
      this.filePanel = $("<ul class='list-tree has-collapsable-children'>").appendTo(this.view);
      this.filePanel.data('file', file);
      items = this.parser.parse();
      if (items) {
        items = this.arrangeItems(items, file);
        for (i = 0, len = items.length; i < len; i++) {
          item = items[i];
          ref = this.addPanelItem(item), id = ref.id, elem = ref.elem;
          marker = editor.markBufferPosition([item.row, 0]);
          marker.zItemId = id;
          elem[0].markerId = marker.id;
        }
      }
      this.setVisibility();
      return this.setPanelState(this.filePanel, this.state[file]);
    };

    NavView.prototype.gotoMarker = function(markerId) {
      var editor, marker, position;
      editor = atom.workspace.getActiveTextEditor();
      marker = editor.getMarker(markerId);
      if (!marker) {
        return;
      }
      position = marker.getStartBufferPosition();
      editor.unfoldBufferRow(position.row);
      editor.setCursorBufferPosition(position);
      return editor.scrollToCursorPosition();
    };

    NavView.prototype.addGroup = function(label) {
      var collapsed, elem, group, html;
      group = this.filePanel.find(".zi-marker-group-label:contains(" + label + ")").siblings('ul.list-tree');
      if (group.length) {
        return group;
      }
      if (this.settings.collapsedGroups.indexOf(label) >= 0) {
        collapsed = 'collapsed';
      } else {
        collapsed = '';
      }
      html = "<li class='list-nested-item zi-marker-group " + collapsed + "'>\n  <div class='list-item zi-marker-group-label'>\n    <span>" + label + "</span>\n  </div>\n  <ul class='list-tree'>\n  </ul>\n</li>";
      if (this.settings.topGroups.indexOf(label) >= 0) {
        elem = $(html).prependTo(this.filePanel);
      } else {
        elem = $(html).appendTo(this.filePanel);
      }
      return elem.find('ul.list-tree');
    };

    NavView.prototype.addPanelItem = function(groupLabel, label, data) {
      var elem, group, html, labelClass, tooltip;
      if (typeof groupLabel !== 'string') {
        data = groupLabel;
        groupLabel = data.kind;
        label = data.label;
      } else {
        data || (data = {});
      }
      group = this.addGroup(groupLabel);
      if (data.icon) {
        labelClass = "class='icon icon-" + data.icon + "'";
      } else {
        labelClass = "class='icon icon-eye'";
      }
      tooltip = data.tooltip;
      if (!tooltip && label.length > 28) {
        tooltip = label.replace(/'/g, '&#39;');
      }
      html = "<li id='zi-item-" + this.nextId + "' class='list-item' title='" + (tooltip || '') + "'>\n  <span " + labelClass + "></span>\n  <span class='zi-marker-label'>" + label + "</span>\n</li>";
      elem = $(html).appendTo(group);
      if (data.row) {
        elem[0].origRow = data.row;
      }
      return {
        id: this.nextId++,
        elem: elem
      };
    };

    NavView.prototype.toggleHighlight = function(element, editor) {
      var decoration, marker;
      if (element.jquery) {
        element = element[0];
      }
      if (!element) {
        return;
      }
      if (!editor) {
        editor = atom.workspace.getActiveTextEditor();
      }
      if (element.decoration) {
        element.decoration.destroy();
        $(element).removeClass('zi-highlight');
        return element.decoration = null;
      } else {
        $(element).addClass('zi-highlight');
        marker = editor.getMarker(element.markerId);
        decoration = editor.decorateMarker(marker, {
          type: 'line-number',
          "class": 'zi-highlight'
        });
        decoration.zNavPanelItem = true;
        return element.decoration = decoration;
      }
    };

    NavView.prototype.toggleBookmark = function(lineNum, editor, skipHighlight) {
      var atomMarker, decoration, decorations, elem, i, id, j, len, len1, lineMarker, lineMarkers, lineText, ref;
      if (!editor) {
        editor = atom.workspace.getActiveTextEditor();
      }
      lineMarkers = editor.findMarkers({
        startBufferRow: lineNum,
        endBufferRow: lineNum
      });
      for (i = 0, len = lineMarkers.length; i < len; i++) {
        lineMarker = lineMarkers[i];
        if (!lineMarker.zItemId) {
          continue;
        }
        if (lineMarker.zNavPanelBookmark) {
          return this.removeItem(lineMarker.zItemId, editor);
        }
        decorations = editor.decorationsForMarkerId(lineMarker.id);
        if (decorations) {
          for (j = 0, len1 = decorations.length; j < len1; j++) {
            decoration = decorations[j];
            if (decoration.zNavPanelItem) {
              return this.toggleHighlight(this.getItemById(lineMarker.zItemId));
            }
          }
        }
      }
      lineText = editor.lineTextForBufferRow(lineNum);
      lineText = lineText.trim() || '___ blank line ___';
      atomMarker = editor.markBufferPosition([lineNum, 0]);
      ref = this.addPanelItem('Bookmarks', lineText, {
        marker: atomMarker
      }), id = ref.id, elem = ref.elem;
      atomMarker.zItemId = id;
      atomMarker.zNavPanelBookmark = true;
      elem[0].markerId = atomMarker.id;
      elem[0].origRow = lineNum;
      if (!skipHighlight) {
        decoration = this.toggleHighlight(elem[0], editor);
      }
      return this.setVisibility();
    };

    NavView.prototype.removeItem = function(id, editor) {
      var item, marker;
      item = $('#zi-item-' + id);
      if (!item.length) {
        return;
      }
      if (!editor) {
        editor = atom.workspace.getActiveTextEditor();
      }
      if (item[0].decoration) {
        item[0].decoration.destroy();
      }
      if (item[0].markerId) {
        marker = editor.getMarker(item[0].markerId);
        marker.destroy();
      }
      if (item.siblings().length) {
        item.remove();
      } else {
        item.parents('li.list-nested-item').first().remove();
      }
      return this.setVisibility();
    };

    NavView.prototype.getItemById = function(id) {
      return $('#zi-item-' + id);
    };

    NavView.prototype.getItemByOrigRow = function(row, group) {
      var elem, root;
      elem = $();
      if (group) {
        root = this.filePanel.find(".zi-marker-group-label:contains(" + group + ")").siblings('ul.list-tree');
      } else {
        root = this.filePanel;
      }
      root.find('li.list-item').each(function() {
        if (this.origRow === row) {
          elem = $(this);
          return false;
        }
        return true;
      });
      return elem;
    };

    NavView.prototype.setVisibility = function() {
      var ref;
      if (this.enabled && ((ref = this.filePanel) != null ? ref.find('li.list-item').length : void 0) > 0) {
        this.view.children().hide();
        this.filePanel.show();
        this.panel.show();
        return true;
      } else {
        this.panel.hide();
        return false;
      }
    };

    NavView.prototype.hide = function() {
      return this.panel.hide();
    };

    NavView.prototype.enable = function(enable) {
      this.enabled = enable;
      return this.setVisibility();
    };

    NavView.prototype.destroyPanel = function(filePanel) {
      var editor;
      editor = this.getFileEditor(filePanel.data('file'));
      $(filePanel).find('li.list-item').each(function() {
        var ref;
        if (this.decorator) {
          this.decorator.destroy();
        }
        if (editor) {
          return (ref = editor.getMarker(this.markerId)) != null ? ref.destroy() : void 0;
        }
      });
      return filePanel.remove();
    };

    return NavView;

  })(ResizableWidthView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL25hdi1wYW5lbC1wbHVzL2xpYi9uYXYtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHFGQUFBO0lBQUE7OztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjs7RUFDSixrQkFBQSxHQUFxQixPQUFBLENBQVEsd0JBQVI7O0VBQ3BCLGFBQWMsT0FBQSxDQUFRLE1BQVI7O0VBRWYsZ0JBQUEsR0FBbUI7O0VBQ25CLHVCQUFBLEdBQTBCOztFQUUxQixNQUFNLENBQUMsT0FBUCxHQUNNOzs7c0JBQ0osS0FBQSxHQUFPOztzQkFDUCxTQUFBLEdBQVc7O3NCQUNYLFlBQUEsR0FBYzs7c0JBQ2QsT0FBQSxHQUFTOztzQkFDVCxRQUFBLEdBQVU7O3NCQUNWLE1BQUEsR0FBUTs7c0JBQ1IsS0FBQSxHQUFPOztzQkFDUCxJQUFBLEdBQU07O3NCQUNOLFVBQUEsR0FBWTs7c0JBRVosTUFBQSxHQUFROztJQUdLLGlCQUFDLEtBQUQsRUFBUSxRQUFSLEVBQWtCLE1BQWxCO0FBQ1gsVUFBQTtNQUFBLHlDQUFNLFFBQVEsQ0FBQyxTQUFmO01BQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU4sS0FBaUIsS0FBbEI7TUFDWixJQUFDLENBQUEsS0FBRCxHQUFTLEtBQUssQ0FBQyxVQUFOLElBQW9CO01BQzdCLElBQUMsQ0FBQSxjQUFELENBQWdCLFFBQWhCO01BQ0EsSUFBQyxDQUFBLE1BQUQsR0FBVTtNQUVWLElBQUMsQ0FBQSxVQUFELEdBQWtCLElBQUEsVUFBQSxDQUFXO1FBQUMsSUFBQSxFQUFNLElBQVA7UUFBYSxlQUFBLEVBQWlCLGdCQUE5QjtPQUFYO01BQ2xCLElBQUMsQ0FBQSxVQUFVLENBQUMsV0FBWixDQUF3QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FB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aWV3ID0gcmVxdWlyZSAnLi9yZXNpemFibGUtd2lkdGgtdmlldydcbntUZXh0RWRpdG9yfSA9IHJlcXVpcmUgJ2F0b20nXG5cbmljb25fb3JkZXJfYXNfaXMgPSBcImljb24tYXJyb3ctcmlnaHRcIlxuaWNvbl9vcmRlcl9hbHBoYWJldGljYWwgPSBcImFscGhhYmV0aWNhbC1vcmRlclwiXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIE5hdlZpZXcgZXh0ZW5kcyBSZXNpemFibGVXaWR0aFZpZXdcbiAgcGFuZWw6IG51bGxcbiAgZmlsZVBhbmVsOiBudWxsICAjIG1haW4gZWxlbSBmb3IgY3VycmVudCBmaWxlXG4gIGJvdHRvbUdyb3VwczogW11cbiAgZW5hYmxlZDogdHJ1ZVxuICBzZXR0aW5nczoge31cbiAgcGFyc2VyOiBudWxsICAjIHBhcnNlciBzdXBwbGllZCBieSBjbGllbnQgY29kZVxuICBzdGF0ZToge31cbiAgdmlldzogbnVsbFxuICBtaW5pRWRpdG9yOiBudWxsXG5cbiAgbmV4dElkOiAxICAgIyBUbyBtYXJrIHRoZSBkb20gaXRlbVxuXG5cbiAgY29uc3RydWN0b3I6IChzdGF0ZSwgc2V0dGluZ3MsIHBhcnNlciktPlxuICAgIHN1cGVyKHNldHRpbmdzLmxlZnRQYW5lbClcbiAgICBAZW5hYmxlZCA9ICEoc3RhdGUuZW5hYmxlZCA9PSBmYWxzZSlcbiAgICBAc3RhdGUgPSBzdGF0ZS5maWxlU3RhdGVzIHx8IHt9XG4gICAgQGNoYW5nZVNldHRpbmdzKHNldHRpbmdzKVxuICAgIEBwYXJzZXIgPSBwYXJzZXJcblxuICAgIEBtaW5pRWRpdG9yID0gbmV3IFRleHRFZGl0b3Ioe21pbmk6IHRydWUsIHBsYWNlaG9sZGVyVGV4dDogXCJGaWx0ZXIgYnkgbmFtZVwifSlcbiAgICBAbWluaUVkaXRvci5vbkRpZENoYW5nZSA9PiBAZmlsdGVyKClcbiAgICBAdmlld0NvbnRhaW5lci5hZGRDbGFzcygnemktbWFya2VyLXBhbmVsJylcbiAgICBodG1sID0gXCJcIlwiXG4gICAgPGRpdiBjbGFzcz0nemktaGVhZGVyJz5cbiAgICAgIDwhLS0gPGRpdiBjbGFzcz0naWNvbiBzZXR0aW5ncyBpY29uLWdlYXInPjwvZGl2PiAtLT5cbiAgICAgIDxkaXYgY2xhc3M9J2ljb24gc29ydGVyJz48L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPSd6aS12aWV3Jz5cbiAgICA8L2Rpdj5cbiAgICBcIlwiXCJcblxuICAgICQoaHRtbCkuYXBwZW5kVG8oQG1haW5WaWV3KVxuXG4gICAgaGVhZGVyID0gQG1haW5WaWV3LmZpbmQoJy56aS1oZWFkZXInKVxuICAgIGhlYWRlci5hcHBlbmQoQG1pbmlFZGl0b3IuZWxlbWVudClcblxuICAgIEB2aWV3ID0gQG1haW5WaWV3LmZpbmQoJy56aS12aWV3JylcbiAgICBAdmlldy5vbiAnY2xpY2snLCAnLmxpc3QtaXRlbScsIChldmVudCk9PlxuICAgICAgZWxlbSA9IGV2ZW50LmN1cnJlbnRUYXJnZXRcbiAgICAgIGlmIGVsZW0ubWFya2VySWRcbiAgICAgICAgaWYgJChldmVudC50YXJnZXQpLmhhc0NsYXNzKCdpY29uJylcbiAgICAgICAgICBAdG9nZ2xlSGlnaGxpZ2h0KGVsZW0pXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAZ290b01hcmtlcihlbGVtLm1hcmtlcklkKVxuICAgICAgZWxzZSBpZiAkKGVsZW0pLmlzKCcuemktbWFya2VyLWdyb3VwLWxhYmVsJylcbiAgICAgICAgJChlbGVtKS5wYXJlbnQoKS50b2dnbGVDbGFzcygnY29sbGFwc2VkJylcbiAgICBAbWFpblZpZXcub24gJ2NsaWNrJywgJy5zb3J0ZXInLCA9PlxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICByZXR1cm4gdW5sZXNzIGVkaXRvclxuICAgICAgZmlsZSA9IGVkaXRvci5nZXRQYXRoKClcbiAgICAgIEBzdGF0ZVtmaWxlXSB8fD0ge31cbiAgICAgIGlmIEBzdGF0ZVtmaWxlXS5zb3J0ID09IHVuZGVmaW5lZFxuICAgICAgICBAc3RhdGVbZmlsZV0uc29ydCA9IHRydWVcbiAgICAgIGVsc2VcbiAgICAgICAgQHN0YXRlW2ZpbGVdLnNvcnQgPSAhQHN0YXRlW2ZpbGVdLnNvcnRcbiAgICAgICMgU2V0dXAgc29ydGVyIGljb24gYW5kIHRpdGxlXG4gICAgICBzb3J0ZXIgPSBAbWFpblZpZXcuZmluZCgnLnNvcnRlcicpXG4gICAgICBpZiBAc3RhdGVbZmlsZV0uc29ydFxuICAgICAgICBzb3J0ZXIuYWRkQ2xhc3MoaWNvbl9vcmRlcl9hbHBoYWJldGljYWwpXG4gICAgICAgIHNvcnRlci5yZW1vdmVDbGFzcyhpY29uX29yZGVyX2FzX2lzKVxuICAgICAgICBzb3J0ZXIucHJvcCgndGl0bGUnLCAnT3JkZXI6IHNvcnRlZCcpXG4gICAgICBlbHNlXG4gICAgICAgIHNvcnRlci5hZGRDbGFzcyhpY29uX29yZGVyX2FzX2lzKVxuICAgICAgICBzb3J0ZXIucmVtb3ZlQ2xhc3MoaWNvbl9vcmRlcl9hbHBoYWJldGljYWwpXG4gICAgICAgIHNvcnRlci5wcm9wKCd0aXRsZScsICdPcmRlcjogYXMgaXMgaW4gZmlsZScpXG4gICAgICBAdXBkYXRlRmlsZShmaWxlKVxuXG5cblxuICBkZXN0cm95OiAtPlxuICAgIEB2aWV3LmNoaWxkcmVuKCkuZWFjaCA9PlxuICAgICAgQGRlc3Ryb3lQYW5lbCgkKHRoaXMpKVxuICAgIEBwYW5lbC5kZXN0cm95KClcblxuICBmaWx0ZXI6IC0+XG4gICAgZmlsdGVyVGV4dCA9IEBtaW5pRWRpdG9yLmdldFRleHQoKVxuICAgIGxpcyA9IEB2aWV3LmZpbmQoXCJsaS5saXN0LWl0ZW1cIilcbiAgICBsaXMuc2hvdygpXG4gICAgaWYgZmlsdGVyVGV4dCAhPSBcIlwiXG4gICAgICBsaXMuZWFjaCAoaW5kZXgsIGVsZW1lbnQpID0+XG4gICAgICAgIGVsID0gJChlbGVtZW50KVxuICAgICAgICBpZihlbC50ZXh0KCkudG9Mb3dlckNhc2UoKS5pbmRleE9mKGZpbHRlclRleHQudG9Mb3dlckNhc2UoKSkgPCAwKVxuICAgICAgICAgIGVsLmhpZGUoKVxuXG4gIG1vdmVQYW5lbDogLT5cbiAgICBpZiBAc2V0dGluZ3MubGVmdFBhbmVsID09ICdsZWZ0J1xuICAgICAgQHNldHRpbmdzLmxlZnRQYW5lbCA9ICdyaWdodCdcbiAgICAgIEBwYW5lbC5kZXN0cm95KClcbiAgICAgIEBwYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZFJpZ2h0UGFuZWwoXG4gICAgICAgIGl0ZW06IEB2aWV3Q29udGFpbmVyXG4gICAgICAgIHZpc2libGU6IEBlbmFibGVkXG4gICAgICAgIHByaW9yaXR5OiAzMDBcbiAgICAgIClcbiAgICAgIEBtb3ZlSGFuZGxlTGVmdCgpXG4gICAgZWxzZVxuICAgICAgQHNldHRpbmdzLmxlZnRQYW5lbCA9ICdsZWZ0J1xuICAgICAgQHBhbmVsLmRlc3Ryb3koKVxuICAgICAgQHBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTGVmdFBhbmVsKFxuICAgICAgICBpdGVtOiBAdmlld0NvbnRhaW5lclxuICAgICAgICB2aXNpYmxlOiBAZW5hYmxlZFxuICAgICAgICBwcmlvcml0eTogMzAwXG4gICAgICApXG4gICAgICBAbW92ZUhhbmRsZVJpZ2h0KClcblxuXG5cbiAgY2hhbmdlU2V0dGluZ3M6IChzZXR0aW5ncyktPlxuICAgIEBzZXR0aW5ncyA9IHNldHRpbmdzXG4gICAgIyBBZGQgdG8gdGhlIHBhbmVsXG4gICAgaWYgc2V0dGluZ3MubGVmdFBhbmVsID09ICdsZWZ0J1xuICAgICAgQHBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTGVmdFBhbmVsKFxuICAgICAgICBpdGVtOiBAdmlld0NvbnRhaW5lclxuICAgICAgICB2aXNpYmxlOiBmYWxzZVxuICAgICAgICBwcmlvcml0eTogMzAwXG4gICAgICApXG4gICAgICBAbW92ZUhhbmRsZVJpZ2h0KClcbiAgICBlbHNlXG4gICAgICBAcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRSaWdodFBhbmVsKFxuICAgICAgICBpdGVtOiBAdmlld0NvbnRhaW5lclxuICAgICAgICB2aXNpYmxlOiBmYWxzZVxuICAgICAgICBwcmlvcml0eTogMzAwXG4gICAgICApXG4gICAgICBAbW92ZUhhbmRsZUxlZnQoKVxuXG4gIGdldEZpbGVQYW5lbDogKGZpbGUpLT5cbiAgICBmaWxlUGFuZWwgPSBudWxsXG4gICAgQHZpZXcuY2hpbGRyZW4oKS5lYWNoIC0+XG4gICAgICBpZiAkKHRoaXMpLmRhdGEoJ2ZpbGUnKSA9PSBmaWxlXG4gICAgICAgIGZpbGVQYW5lbCA9ICQodGhpcylcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIHJldHVybiBmaWxlUGFuZWxcblxuXG4gIGdldEZpbGVFZGl0b3I6IChmaWxlKS0+XG4gICAgZWRpdG9ycyA9IGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKClcbiAgICBmb3IgZWRpdG9yIGluIGVkaXRvcnNcbiAgICAgIGlmIGVkaXRvci5nZXRQYXRoKCkgPT0gZmlsZVxuICAgICAgICByZXR1cm4gZWRpdG9yXG4gICAgcmV0dXJuIG51bGxcblxuXG4gIHNldEZpbGU6IChmaWxlKS0+XG4gICAgcmV0dXJuIHVubGVzcyBmaWxlXG4gICAgbmV3RWxlbSA9IEBnZXRGaWxlUGFuZWwoZmlsZSlcbiAgICAjdG9kbzogSWYgd2UgaGF2ZSBtdWx0aXBsZSBwYW5lcyB0aGlzIG1pZ2h0IGdpdmUgc29tZSBvZGQgcmVzdWx0c1xuICAgIGVkaXRvciA9IEBnZXRGaWxlRWRpdG9yKGZpbGUpXG4gICAgZWRpdG9yVmlldyA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpXG4gICAgZ3V0dGVyID0gJCgnLmd1dHRlci1jb250YWluZXInLCBlZGl0b3JWaWV3KVxuICAgICMgU2V0dXAgc29ydGVyIGljb24gYW5kIHRpdGxlXG4gICAgc29ydGVyID0gQG1haW5WaWV3LmZpbmQoJy5zb3J0ZXInKVxuICAgIGlmICFAc3RhdGVbZmlsZV0gfHwgQHN0YXRlW2ZpbGVdLnNvcnRcbiAgICAgIHNvcnRlci5hZGRDbGFzcyhpY29uX29yZGVyX2FscGhhYmV0aWNhbClcbiAgICAgIHNvcnRlci5yZW1vdmVDbGFzcyhpY29uX29yZGVyX2FzX2lzKVxuICAgICAgc29ydGVyLnByb3AoJ3RpdGxlJywgJ09yZGVyOiBzb3J0ZWQnKVxuICAgIGVsc2VcbiAgICAgIHNvcnRlci5hZGRDbGFzcyhpY29uX29yZGVyX2FzX2lzKVxuICAgICAgc29ydGVyLnJlbW92ZUNsYXNzKGljb25fb3JkZXJfYWxwaGFiZXRpY2FsKVxuICAgICAgc29ydGVyLnByb3AoJ3RpdGxlJywgJ09yZGVyOiBhcyBpcyBpbiBmaWxlJylcbiAgICBpZiAhZ3V0dGVyLmRhdGEoJ3pOYXZQYW5lbE1vdXNlJylcbiAgICAgIGd1dHRlci5kYXRhKCd6TmF2UGFuZWxNb3VzZScsICdkb25lJylcbiAgICAgIGRvIChlZGl0b3IpPT5cbiAgICAgICAgZ3V0dGVyLm9uICdtb3VzZWRvd24nLCAnLmxpbmUtbnVtYmVyJywgKGV2ZW50KSA9PlxuICAgICAgICAgIHJldHVybiB1bmxlc3MgQGVuYWJsZWRcbiAgICAgICAgICBpZiBldmVudC53aGljaCAhPSAxIHx8IGV2ZW50LmFsdEtleSA9PSBmYWxzZSB8fFxuICAgICAgICAgICAgICBldmVudC5jdHJsS2V5ID09IHRydWUgfHwgZXZlbnQuc2hpZnRLZXkgPT0gdHJ1ZVxuICAgICAgICAgICAgIyByZXR1cm4gaWYgbm90IGFsdC1jbGlja1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgI3RvZG86IGRldGVybWluZSB3aHkgc3RvcFByb3BhZ2F0aW9uIGFuZCBwcmV2ZW50RGVmYXVsdCBkb24ndCB3b3JrXG4gICAgICAgICAgIyBmb3IgdGhlIGxpbmUgc3RpbGwgZ2V0cyBzZWxlY3RlZFxuICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgIHJvdyA9ICsoJChldmVudC50YXJnZXQpLmF0dHIoJ2RhdGEtYnVmZmVyLXJvdycpKVxuICAgICAgICAgIEB0b2dnbGVCb29rbWFyayhyb3csIGVkaXRvcilcbiAgICBpZiBuZXdFbGVtXG4gICAgICAjIEhhZCBwcmV2aW91c2x5IGJlZW4gc2V0IHVwXG4gICAgICByZXR1cm4gQHNldFZpc2liaWxpdHkoKSBpZiBuZXdFbGVtID09IEBmaWxlUGFuZWxcbiAgICAgIHJldHVybiBAc3dpdGNoUGFuZWwobmV3RWxlbSlcbiAgICBAcG9wdWxhdGVQYW5lbChlZGl0b3IpXG5cblxuICB1cGRhdGVGaWxlOiAoZmlsZSktPlxuICAgIGVkaXRvciA9IEBnZXRGaWxlRWRpdG9yKGZpbGUpXG4gICAgb2xkUGFuZWwgPSBAZ2V0RmlsZVBhbmVsKGZpbGUpXG4gICAgaWYgb2xkUGFuZWwgICAjIG9sZFBhbmVsIGlzIG51bGwgd2hlbiBuZXdseSBjcmVhdGVkIGZpbGUgaXMgc2F2ZWRcbiAgICAgIHByZXZTdGF0ZSA9IEBnZXRQYW5lbFN0YXRlKG9sZFBhbmVsKVxuICAgICAgQHN0YXRlW2ZpbGVdID0gcHJldlN0YXRlXG4gICAgICBAZGVzdHJveVBhbmVsKG9sZFBhbmVsKVxuICAgIEBwb3B1bGF0ZVBhbmVsKGVkaXRvcilcbiAgICBAc2V0VmlzaWJpbGl0eSgpXG4gICAgQGZpbHRlcigpXG5cblxuICBnZXRQYW5lbFN0YXRlOiAocGFuZWwpLT5cbiAgICByZXR1cm4gdW5sZXNzIHBhbmVsXG4gICAgc3RhdGUgPSB7Y29sbGFwc2VkR3JvdXBzOiBbXSwgYm9va21hcmtzOiBbXSwgaGlnaGxpZ2h0czoge319XG4gICAgZmlsZSA9IHBhbmVsLmRhdGEoJ2ZpbGUnKVxuICAgIGVkaXRvciA9IEBnZXRGaWxlRWRpdG9yKGZpbGUpXG4gICAgcmV0dXJuIHVubGVzcyBlZGl0b3JcbiAgICBncm91cHMgPSBwYW5lbC5maW5kKFwiLnppLW1hcmtlci1ncm91cFwiKVxuICAgIGdyb3Vwcy5lYWNoIC0+XG4gICAgICBncm91cCA9ICQodGhpcylcbiAgICAgIGdyb3VwTGFiZWwgPSAkKHRoaXMpLmZpbmQoJy56aS1tYXJrZXItZ3JvdXAtbGFiZWwnKS50ZXh0KCkudHJpbSgpXG4gICAgICBpZiAkKHRoaXMpLmhhc0NsYXNzKCdjb2xsYXBzZWQnKVxuICAgICAgICBzdGF0ZS5jb2xsYXBzZWRHcm91cHMucHVzaCBncm91cExhYmVsXG4gICAgICBpZiBncm91cExhYmVsID09ICdCb29rbWFya3MnICYmIGVkaXRvclxuICAgICAgICBncm91cC5maW5kKCdsaS5saXN0LWl0ZW0nKS5lYWNoIC0+XG4gICAgICAgICAgcm93ID0gZWRpdG9yLmdldE1hcmtlcih0aGlzLm1hcmtlcklkKS5nZXRTdGFydEJ1ZmZlclBvc2l0aW9uKCkucm93XG4gICAgICAgICAgc3RhdGUuYm9va21hcmtzLnB1c2ggcm93XG4gICAgICAjIFNhdmUgaXRlbXMgdGhhdCBoYXZlIGhpZ2hsaWdodHNcbiAgICAgIGdyb3VwLmZpbmQoJ2xpLnppLWhpZ2hsaWdodCcpLmVhY2ggLT5cbiAgICAgICAgc3RhdGUuaGlnaGxpZ2h0c1tncm91cExhYmVsXSB8fD0gW11cbiAgICAgICAgcm93ID0gZWRpdG9yLmdldE1hcmtlcih0aGlzLm1hcmtlcklkKS5nZXRTdGFydEJ1ZmZlclBvc2l0aW9uKCkucm93XG4gICAgICAgIHN0YXRlLmhpZ2hsaWdodHNbZ3JvdXBMYWJlbF0ucHVzaCByb3dcbiAgICBpZiBAc3RhdGVbZmlsZV0gJiYgQHN0YXRlW2ZpbGVdLnNvcnQgIT0gdW5kZWZpbmVkXG4gICAgICBzdGF0ZS5zb3J0ID0gQHN0YXRlW2ZpbGVdLnNvcnRcbiAgICByZXR1cm4gc3RhdGVcblxuXG5cbiAgc2V0UGFuZWxTdGF0ZTogKHBhbmVsLCBzdGF0ZSktPlxuICAgIHJldHVybiB1bmxlc3MgcGFuZWwgJiYgc3RhdGVcbiAgICBlZGl0b3IgPSBAZ2V0RmlsZUVkaXRvcihwYW5lbC5kYXRhKCdmaWxlJykpXG4gICAgcmV0dXJuIHVubGVzcyBlZGl0b3JcblxuICAgIHByZXZGaWxlUGFuZWwgPSBudWxsXG4gICAgaWYgQGZpbGVQYW5lbCAhPSBwYW5lbFxuICAgICAgcHJldkZpbGVQYW5lbCA9IEBmaWxlUGFuZWxcbiAgICAgIEBmaWxlUGFuZWwgPSBwYW5lbFxuXG4gICAgIyBGaXJzdCBkZWFsIHdpdGggYm9va21hcmtzXG4gICAgaWYgc3RhdGUuYm9va21hcmtzLmxlbmd0aFxuICAgICAgYm9va21hcmtzR3JvdXAgPSBAYWRkR3JvdXAoJ0Jvb2ttYXJrcycpXG4gICAgICBmb3IgYm9va21hcmtSb3cgaW4gc3RhdGUuYm9va21hcmtzXG4gICAgICAgIEB0b2dnbGVCb29rbWFyayhib29rbWFya1JvdywgZWRpdG9yLCB0cnVlKVxuICAgICMgTm93IGhpZ2h0bGlnaHRzXG4gICAgZm9yIGdyb3VwTGFiZWwgaW4gT2JqZWN0LmtleXMoc3RhdGUuaGlnaGxpZ2h0cylcbiAgICAgIGZvciBoaWdobGlnaHRSb3cgaW4gc3RhdGUuaGlnaGxpZ2h0c1tncm91cExhYmVsXVxuICAgICAgICAgIEB0b2dnbGVIaWdobGlnaHQoQGdldEl0ZW1CeU9yaWdSb3coaGlnaGxpZ2h0Um93LCBncm91cExhYmVsKSwgZWRpdG9yKVxuICAgICMgTm93IGNvbGxhcHNlZCBHcm91cHNcbiAgICBncm91cHMgPSBwYW5lbC5maW5kKFwiLnppLW1hcmtlci1ncm91cFwiKVxuICAgIGdyb3Vwcy5lYWNoIC0+XG4gICAgICBncm91cCA9ICQodGhpcylcbiAgICAgIGdyb3VwTGFiZWwgPSAkKHRoaXMpLmZpbmQoJy56aS1tYXJrZXItZ3JvdXAtbGFiZWwnKS50ZXh0KCkudHJpbSgpXG4gICAgICBpZiBzdGF0ZS5jb2xsYXBzZWRHcm91cHMuaW5kZXhPZihncm91cExhYmVsKSA+PSAwXG4gICAgICAgIGdyb3VwLmFkZENsYXNzKCdjb2xsYXBzZWQnKVxuICAgICAgZWxzZVxuICAgICAgICBncm91cC5yZW1vdmVDbGFzcygnY29sbGFwc2VkJylcblxuICAgIEBmaWxlUGFuZWwgPSBwcmV2RmlsZVBhbmVsIGlmIHByZXZGaWxlUGFuZWxcblxuXG4gIGdldFN0YXRlOiAtPlxuICAgICMgc3RhdGUgZm9yIGVhY2ggcGFuZWwgYnkgZmlsZVxuICAgIEB2aWV3LmNoaWxkcmVuKCkuZWFjaCA9PlxuICAgICAgcGFuZWwgPSAkKHRoaXMpXG4gICAgICBmaWxlID0gcGFuZWwuZGF0YSgnZmlsZScpXG4gICAgICBwYW5lbFN0YXRlID0gQGdldFBhbmVsU3RhdGUocGFuZWwpXG4gICAgICBAc3RhdGVbZmlsZV0gPSBwYW5lbFN0YXRlXG4gICAgcmV0dXJuIEBzdGF0ZVxuXG5cbiAgc2F2ZUZpbGVTdGF0ZTogKGZpbGUpLT5cbiAgICBwYW5lbCA9IEBnZXRGaWxlUGFuZWwoZmlsZSlcbiAgICBzdGF0ZSA9IEBnZXRQYW5lbFN0YXRlKHBhbmVsKVxuICAgIEBzdGF0ZVtmaWxlXSA9IHN0YXRlIGlmIHN0YXRlXG5cblxuICBjbG9zZUZpbGU6IChmaWxlKS0+XG4gICAgcGFuZWwgPSBAZ2V0RmlsZVBhbmVsKGZpbGUpXG4gICAgcmV0dXJuIHVubGVzcyBwYW5lbFxuICAgIHBhbmVsU3RhdGUgPSBAZ2V0UGFuZWxTdGF0ZShwYW5lbClcbiAgICBAc3RhdGVbZmlsZV0gPSBwYW5lbFN0YXRlIGlmIHBhbmVsU3RhdGVcbiAgICBAZGVzdHJveVBhbmVsKHBhbmVsKSBpZiBwYW5lbFxuXG5cbiAgc3dpdGNoUGFuZWw6IChwYW5lbCktPlxuICAgIEBmaWxlUGFuZWwuaGlkZSgpXG4gICAgQGZpbGVQYW5lbCA9IHBhbmVsXG4gICAgQHNldFZpc2liaWxpdHkoKVxuXG5cbiAgYXJyYW5nZUl0ZW1zOiAoaXRlbXMsIGZpbGUpLT5cbiAgICBhcnJhbmdlZEl0ZW1zID0gW11cbiAgICBpZiBAc2V0dGluZ3Mubm9EdXBzXG4gICAgICBwcmV2SXRlbXMgPSBbXVxuICAgICAgZm9yIGl0ZW0gaW4gaXRlbXNcbiAgICAgICAgZHVwS2V5ID0gaXRlbS5raW5kICsgJ3x8JyArIGl0ZW0ubGFiZWxcbiAgICAgICAgY29udGludWUgaWYgcHJldkl0ZW1zLmluZGV4T2YoZHVwS2V5KSA+PSAwXG4gICAgICAgIHByZXZJdGVtcy5wdXNoKGR1cEtleSlcbiAgICAgICAgYXJyYW5nZWRJdGVtcy5wdXNoIGl0ZW1cbiAgICBlbHNlXG4gICAgICBhcnJhbmdlZEl0ZW1zID0gaXRlbXMuc2xpY2UoMClcbiAgICBpZiBAc3RhdGVbZmlsZV0gJiYgQHN0YXRlW2ZpbGVdLnNvcnQgIT0gdW5kZWZpbmVkXG4gICAgICBzb3J0ID0gQHN0YXRlW2ZpbGVdLnNvcnRcbiAgICBlbHNlXG4gICAgICBzb3J0ID0gQHNldHRpbmdzLnNvcnRcbiAgICBpZiAvXFwuKG1kfHJzdCkkLy50ZXN0KGZpbGUpXG4gICAgICBzb3J0ID0gZmFsc2VcbiAgICBpZiBzb3J0XG4gICAgICBhcnJhbmdlZEl0ZW1zLnNvcnQgKGEsYiktPlxuICAgICAgICBrZXkxID0gKGEua2luZCArICd8fCcgKyBhLmxhYmVsKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGtleTIgPSAoYi5raW5kICsgJ3x8JyArIGIubGFiZWwpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgcmV0dXJuIDAgaWYga2V5MSA9PSBrZXkyXG4gICAgICAgIHJldHVybiAxIGlmIGtleTEgPiBrZXkyXG4gICAgICAgIHJldHVybiAtMVxuICAgIHJldHVybiBhcnJhbmdlZEl0ZW1zXG5cblxuICBwb3B1bGF0ZVBhbmVsOiAoZWRpdG9yKS0+XG4gICAgIyBuZXdcbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkgdW5sZXNzIGVkaXRvclxuICAgIGZpbGUgPSBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgQGZpbGVQYW5lbCA9ICQoXCI8dWwgY2xhc3M9J2xpc3QtdHJlZSBoYXMtY29sbGFwc2FibGUtY2hpbGRyZW4nPlwiKS5hcHBlbmRUbyhAdmlldylcbiAgICBAZmlsZVBhbmVsLmRhdGEoJ2ZpbGUnLCBmaWxlKVxuICAgIGl0ZW1zID0gQHBhcnNlci5wYXJzZSgpXG4gICAgaWYgaXRlbXNcbiAgICAgIGl0ZW1zID0gQGFycmFuZ2VJdGVtcyhpdGVtcywgZmlsZSlcbiAgICAgIGZvciBpdGVtIGluIGl0ZW1zXG4gICAgICAgIHtpZCwgZWxlbX0gPSBAYWRkUGFuZWxJdGVtKGl0ZW0pXG4gICAgICAgIG1hcmtlciA9IGVkaXRvci5tYXJrQnVmZmVyUG9zaXRpb24oW2l0ZW0ucm93LCAwXSlcbiAgICAgICAgbWFya2VyLnpJdGVtSWQgPSBpZFxuICAgICAgICBlbGVtWzBdLm1hcmtlcklkID0gbWFya2VyLmlkXG4gICAgIyBAdmlldy5jaGlsZHJlbigpLmhpZGUoKVxuICAgIEBzZXRWaXNpYmlsaXR5KClcbiAgICBAc2V0UGFuZWxTdGF0ZShAZmlsZVBhbmVsLCBAc3RhdGVbZmlsZV0pXG5cblxuICBnb3RvTWFya2VyOiAobWFya2VySWQpLT5cbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBtYXJrZXIgPSBlZGl0b3IuZ2V0TWFya2VyKG1hcmtlcklkKVxuICAgIHJldHVybiB1bmxlc3MgbWFya2VyXG4gICAgcG9zaXRpb24gPSBtYXJrZXIuZ2V0U3RhcnRCdWZmZXJQb3NpdGlvbigpXG4gICAgZWRpdG9yLnVuZm9sZEJ1ZmZlclJvdyhwb3NpdGlvbi5yb3cpXG4gICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKHBvc2l0aW9uKVxuICAgIGVkaXRvci5zY3JvbGxUb0N1cnNvclBvc2l0aW9uKClcblxuXG4gIGFkZEdyb3VwOiAobGFiZWwpLT5cbiAgICAjIHBvcyA6IHByZXNlbnRseSBzaG91bGQgYmUgMSBmb3IgdG9wIG9yIHVuZGVmaW5lZCBvciBqcXVlcnkgb2JqIHRvIGluc2VydCBhZnRlclxuICAgICMgcmV0dXJucyBlbGVtZW50IHRoYXQgbmV3IGl0ZW1zIGNhbiBiZSBhcHBlbmRlZCB0b1xuICAgIGdyb3VwID0gQGZpbGVQYW5lbC5maW5kKFwiLnppLW1hcmtlci1ncm91cC1sYWJlbDpjb250YWlucygje2xhYmVsfSlcIikuc2libGluZ3MoJ3VsLmxpc3QtdHJlZScpXG4gICAgcmV0dXJuIGdyb3VwIGlmIGdyb3VwLmxlbmd0aFxuXG4gICAgaWYgQHNldHRpbmdzLmNvbGxhcHNlZEdyb3Vwcy5pbmRleE9mKGxhYmVsKSA+PSAwXG4gICAgICBjb2xsYXBzZWQgPSAnY29sbGFwc2VkJ1xuICAgIGVsc2VcbiAgICAgIGNvbGxhcHNlZCA9ICcnXG5cbiAgICBodG1sID0gXCJcIlwiXG4gICAgICA8bGkgY2xhc3M9J2xpc3QtbmVzdGVkLWl0ZW0gemktbWFya2VyLWdyb3VwICN7Y29sbGFwc2VkfSc+XG4gICAgICAgIDxkaXYgY2xhc3M9J2xpc3QtaXRlbSB6aS1tYXJrZXItZ3JvdXAtbGFiZWwnPlxuICAgICAgICAgIDxzcGFuPiN7bGFiZWx9PC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPHVsIGNsYXNzPSdsaXN0LXRyZWUnPlxuICAgICAgICA8L3VsPlxuICAgICAgPC9saT5cbiAgICBcIlwiXCJcbiAgICBpZiBAc2V0dGluZ3MudG9wR3JvdXBzLmluZGV4T2YobGFiZWwpID49IDBcbiAgICAgIGVsZW0gPSAkKGh0bWwpLnByZXBlbmRUbyhAZmlsZVBhbmVsKVxuICAgIGVsc2VcbiAgICAgIGVsZW0gPSAkKGh0bWwpLmFwcGVuZFRvKEBmaWxlUGFuZWwpXG4gICAgcmV0dXJuIGVsZW0uZmluZCgndWwubGlzdC10cmVlJylcblxuXG4gIGFkZFBhbmVsSXRlbTogKGdyb3VwTGFiZWwsIGxhYmVsLCBkYXRhKS0+XG4gICAgIyBncm91cExhYmVsIGNvdWxkIGJlIGFuIG9iamVjdCAmIG9ubHkgYXJnXG4gICAgIyBkYXRhIC0+IHtpY29uLCB0b29sdGlwLCBtYXJrZXIsIGRlY29yYXRvcn1cbiAgICAjIHJldHVybiBpZCwgZGF0YSBhdHRhY2hlZCB0byBvYmplY3RcbiAgICBpZiB0eXBlb2YgZ3JvdXBMYWJlbCAhPSAnc3RyaW5nJ1xuICAgICAgZGF0YSA9IGdyb3VwTGFiZWxcbiAgICAgIGdyb3VwTGFiZWwgPSBkYXRhLmtpbmRcbiAgICAgIGxhYmVsID0gZGF0YS5sYWJlbFxuICAgIGVsc2VcbiAgICAgIGRhdGEgfHw9IHt9XG5cbiAgICBncm91cCA9IEBhZGRHcm91cChncm91cExhYmVsKVxuICAgIGlmIGRhdGEuaWNvblxuICAgICAgbGFiZWxDbGFzcyA9IFwiY2xhc3M9J2ljb24gaWNvbi0je2RhdGEuaWNvbn0nXCJcbiAgICBlbHNlXG4gICAgICBsYWJlbENsYXNzID0gXCJjbGFzcz0naWNvbiBpY29uLWV5ZSdcIlxuICAgICMgSW50ZXJpbSA6IEZpeCB3aXRoIGEgYmV0dGVyIGFwcHJvYWNoXG4gICAgdG9vbHRpcCA9IGRhdGEudG9vbHRpcFxuICAgIGlmICF0b29sdGlwICYmIGxhYmVsLmxlbmd0aCA+IDI4XG4gICAgICB0b29sdGlwID0gbGFiZWwucmVwbGFjZSgvJy9nLCAnJiMzOTsnKVxuICAgIGh0bWwgPSBcIlwiXCJcbiAgICA8bGkgaWQ9J3ppLWl0ZW0tI3tAbmV4dElkfScgY2xhc3M9J2xpc3QtaXRlbScgdGl0bGU9JyN7dG9vbHRpcCB8fCAnJ30nPlxuICAgICAgPHNwYW4gI3tsYWJlbENsYXNzfT48L3NwYW4+XG4gICAgICA8c3BhbiBjbGFzcz0nemktbWFya2VyLWxhYmVsJz4je2xhYmVsfTwvc3Bhbj5cbiAgICA8L2xpPlxuICAgIFwiXCJcIlxuICAgIGVsZW0gPSAkKGh0bWwpLmFwcGVuZFRvKGdyb3VwKVxuICAgIGVsZW1bMF0ub3JpZ1JvdyA9IGRhdGEucm93IGlmIGRhdGEucm93XG4gICAgcmV0dXJuIHtpZDogQG5leHRJZCsrLCBlbGVtOiBlbGVtfVxuXG5cbiAgdG9nZ2xlSGlnaGxpZ2h0OiAoZWxlbWVudCwgZWRpdG9yKS0+XG4gICAgZWxlbWVudCA9IGVsZW1lbnRbMF0gaWYgZWxlbWVudC5qcXVlcnlcbiAgICByZXR1cm4gdW5sZXNzIGVsZW1lbnRcbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkgdW5sZXNzIGVkaXRvclxuICAgIGlmIGVsZW1lbnQuZGVjb3JhdGlvblxuICAgICAgZWxlbWVudC5kZWNvcmF0aW9uLmRlc3Ryb3koKVxuICAgICAgJChlbGVtZW50KS5yZW1vdmVDbGFzcygnemktaGlnaGxpZ2h0JylcbiAgICAgIHJldHVybiBlbGVtZW50LmRlY29yYXRpb24gPSBudWxsXG4gICAgZWxzZVxuICAgICAgJChlbGVtZW50KS5hZGRDbGFzcygnemktaGlnaGxpZ2h0JylcbiAgICAgIG1hcmtlciA9IGVkaXRvci5nZXRNYXJrZXIoZWxlbWVudC5tYXJrZXJJZClcbiAgICAgIGRlY29yYXRpb24gPSBlZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7dHlwZTogJ2xpbmUtbnVtYmVyJywgY2xhc3M6ICd6aS1oaWdobGlnaHQnfSlcbiAgICAgIGRlY29yYXRpb24uek5hdlBhbmVsSXRlbSA9IHRydWVcbiAgICAgIHJldHVybiBlbGVtZW50LmRlY29yYXRpb24gPSBkZWNvcmF0aW9uXG5cblxuICB0b2dnbGVCb29rbWFyazogKGxpbmVOdW0sIGVkaXRvciwgc2tpcEhpZ2hsaWdodCkgLT5cbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkgdW5sZXNzIGVkaXRvclxuICAgIGxpbmVNYXJrZXJzID0gZWRpdG9yLmZpbmRNYXJrZXJzKHtzdGFydEJ1ZmZlclJvdzogbGluZU51bSwgZW5kQnVmZmVyUm93OiBsaW5lTnVtfSlcbiAgICBmb3IgbGluZU1hcmtlciBpbiBsaW5lTWFya2Vyc1xuICAgICAgY29udGludWUgdW5sZXNzIGxpbmVNYXJrZXIuekl0ZW1JZFxuICAgICAgaWYgbGluZU1hcmtlci56TmF2UGFuZWxCb29rbWFya1xuICAgICAgICByZXR1cm4gQHJlbW92ZUl0ZW0obGluZU1hcmtlci56SXRlbUlkLCBlZGl0b3IpXG4gICAgICBkZWNvcmF0aW9ucyA9IGVkaXRvci5kZWNvcmF0aW9uc0Zvck1hcmtlcklkKGxpbmVNYXJrZXIuaWQpXG4gICAgICBpZiBkZWNvcmF0aW9uc1xuICAgICAgICBmb3IgZGVjb3JhdGlvbiBpbiBkZWNvcmF0aW9uc1xuICAgICAgICAgIGlmIGRlY29yYXRpb24uek5hdlBhbmVsSXRlbVxuICAgICAgICAgICAgcmV0dXJuIEB0b2dnbGVIaWdobGlnaHQoQGdldEl0ZW1CeUlkKGxpbmVNYXJrZXIuekl0ZW1JZCkpXG5cbiAgICAjIE5vIGV4aXN0aW5nIGJvb2ttYXJrIHNvIGNyZWF0ZSBvbmVcbiAgICBsaW5lVGV4dCA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhsaW5lTnVtKVxuICAgIGxpbmVUZXh0ID0gbGluZVRleHQudHJpbSgpIHx8ICdfX18gYmxhbmsgbGluZSBfX18nXG4gICAgYXRvbU1hcmtlciA9IGVkaXRvci5tYXJrQnVmZmVyUG9zaXRpb24oW2xpbmVOdW0sIDBdKVxuICAgIHtpZCwgZWxlbX0gPSBAYWRkUGFuZWxJdGVtKCdCb29rbWFya3MnLCBsaW5lVGV4dCwge21hcmtlcjogYXRvbU1hcmtlcn0pXG4gICAgYXRvbU1hcmtlci56SXRlbUlkID0gaWRcbiAgICBhdG9tTWFya2VyLnpOYXZQYW5lbEJvb2ttYXJrID0gdHJ1ZVxuICAgIGVsZW1bMF0ubWFya2VySWQgPSBhdG9tTWFya2VyLmlkXG4gICAgZWxlbVswXS5vcmlnUm93ID0gbGluZU51bVxuICAgIGlmICFza2lwSGlnaGxpZ2h0XG4gICAgICBkZWNvcmF0aW9uID0gQHRvZ2dsZUhpZ2hsaWdodChlbGVtWzBdLCBlZGl0b3IpXG4gICAgQHNldFZpc2liaWxpdHkoKVxuXG5cbiAgcmVtb3ZlSXRlbTogKGlkLCBlZGl0b3IpLT5cbiAgICAjIEFsc28gcmVtb3ZlIGdyb3VwIGlmIGxhc3QgaXRlbVxuICAgIGl0ZW0gPSAkKCcjemktaXRlbS0nICsgaWQpXG4gICAgcmV0dXJuIHVubGVzcyBpdGVtLmxlbmd0aFxuXG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpIHVubGVzcyBlZGl0b3JcbiAgICBpdGVtWzBdLmRlY29yYXRpb24uZGVzdHJveSgpIGlmIGl0ZW1bMF0uZGVjb3JhdGlvblxuICAgIGlmIGl0ZW1bMF0ubWFya2VySWRcbiAgICAgIG1hcmtlciA9IGVkaXRvci5nZXRNYXJrZXIoaXRlbVswXS5tYXJrZXJJZClcbiAgICAgIG1hcmtlci5kZXN0cm95KClcbiAgICBpZiBpdGVtLnNpYmxpbmdzKCkubGVuZ3RoXG4gICAgICBpdGVtLnJlbW92ZSgpXG4gICAgZWxzZVxuICAgICAgaXRlbS5wYXJlbnRzKCdsaS5saXN0LW5lc3RlZC1pdGVtJykuZmlyc3QoKS5yZW1vdmUoKVxuICAgIEBzZXRWaXNpYmlsaXR5KClcblxuXG4gIGdldEl0ZW1CeUlkOiAoaWQpLT5cbiAgICByZXR1cm4gJCgnI3ppLWl0ZW0tJyArIGlkKVxuXG5cbiAgZ2V0SXRlbUJ5T3JpZ1JvdzogKHJvdywgZ3JvdXApLT5cbiAgICBlbGVtID0gJCgpXG4gICAgaWYgZ3JvdXBcbiAgICAgIHJvb3QgPSBAZmlsZVBhbmVsLmZpbmQoXCIuemktbWFya2VyLWdyb3VwLWxhYmVsOmNvbnRhaW5zKCN7Z3JvdXB9KVwiKS5zaWJsaW5ncygndWwubGlzdC10cmVlJylcbiAgICBlbHNlXG4gICAgICByb290ID0gQGZpbGVQYW5lbFxuICAgIHJvb3QuZmluZCgnbGkubGlzdC1pdGVtJykuZWFjaCAtPlxuICAgICAgaWYgdGhpcy5vcmlnUm93ID09ICByb3dcbiAgICAgICAgZWxlbSA9ICQodGhpcylcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIHJldHVybiBlbGVtXG5cblxuICBzZXRWaXNpYmlsaXR5OiAtPlxuICAgIGlmIEBlbmFibGVkICYmIEBmaWxlUGFuZWw/LmZpbmQoJ2xpLmxpc3QtaXRlbScpLmxlbmd0aCA+IDBcbiAgICAgIEB2aWV3LmNoaWxkcmVuKCkuaGlkZSgpXG4gICAgICBAZmlsZVBhbmVsLnNob3coKVxuICAgICAgQHBhbmVsLnNob3coKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICBlbHNlXG4gICAgICBAcGFuZWwuaGlkZSgpXG4gICAgICByZXR1cm4gZmFsc2VcblxuXG4gIGhpZGU6IC0+XG4gICAgQHBhbmVsLmhpZGUoKVxuXG5cbiAgZW5hYmxlOiAoZW5hYmxlKS0+XG4gICAgQGVuYWJsZWQgPSBlbmFibGVcbiAgICBAc2V0VmlzaWJpbGl0eSgpXG5cblxuICBkZXN0cm95UGFuZWw6IChmaWxlUGFuZWwpLT5cbiAgICBlZGl0b3IgPSBAZ2V0RmlsZUVkaXRvcihmaWxlUGFuZWwuZGF0YSgnZmlsZScpKVxuICAgICQoZmlsZVBhbmVsKS5maW5kKCdsaS5saXN0LWl0ZW0nKS5lYWNoIC0+XG4gICAgICB0aGlzLmRlY29yYXRvci5kZXN0cm95KCkgaWYgdGhpcy5kZWNvcmF0b3JcbiAgICAgIGVkaXRvci5nZXRNYXJrZXIodGhpcy5tYXJrZXJJZCk/LmRlc3Ryb3koKSBpZiBlZGl0b3JcbiAgICBmaWxlUGFuZWwucmVtb3ZlKClcbiJdfQ==
