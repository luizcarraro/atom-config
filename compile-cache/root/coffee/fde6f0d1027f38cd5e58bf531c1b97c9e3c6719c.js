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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL25hdi1wYW5lbC1wbHVzL2xpYi9uYXYtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHFGQUFBO0lBQUE7OztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjs7RUFDSixrQkFBQSxHQUFxQixPQUFBLENBQVEsd0JBQVI7O0VBQ3BCLGFBQWMsT0FBQSxDQUFRLE1BQVI7O0VBRWYsZ0JBQUEsR0FBbUI7O0VBQ25CLHVCQUFBLEdBQTBCOztFQUUxQixNQUFNLENBQUMsT0FBUCxHQUNNOzs7c0JBQ0osS0FBQSxHQUFPOztzQkFDUCxTQUFBLEdBQVc7O3NCQUNYLFlBQUEsR0FBYzs7c0JBQ2QsT0FBQSxHQUFTOztzQkFDVCxRQUFBLEdBQVU7O3NCQUNWLE1BQUEsR0FBUTs7c0JBQ1IsS0FBQSxHQUFPOztzQkFDUCxJQUFBLEdBQU07O3NCQUNOLFVBQUEsR0FBWTs7c0JBRVosTUFBQSxHQUFROztJQUdLLGlCQUFDLEtBQUQsRUFBUSxRQUFSLEVBQWtCLE1BQWxCO0FBQ1gsVUFBQTtNQUFBLHlDQUFNLFFBQVEsQ0FBQyxTQUFmO01BQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU4sS0FBaUIsS0FBbEI7TUFDWixJQUFDLENBQUEsS0FBRCxHQUFTLEtBQUssQ0FBQyxVQUFOLElBQW9CO01BQzdCLElBQUMsQ0FBQSxjQUFELENBQWdCLFFBQWhCO01BQ0EsSUFBQyxDQUFBLE1BQUQsR0FBVTtNQUVWLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBSSxVQUFKLENBQWU7UUFBQyxJQUFBLEVBQU0sSUFBUDtRQUFhLGVBQUEsRUFBaUIsZ0JBQTlCO09BQWY7TUFDZCxJQUFDLENBQUEsVUFBVSxDQUFDLFdBQVosQ0FBd0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMs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dyA9IHJlcXVpcmUgJy4vcmVzaXphYmxlLXdpZHRoLXZpZXcnXG57VGV4dEVkaXRvcn0gPSByZXF1aXJlICdhdG9tJ1xuXG5pY29uX29yZGVyX2FzX2lzID0gXCJpY29uLWFycm93LXJpZ2h0XCJcbmljb25fb3JkZXJfYWxwaGFiZXRpY2FsID0gXCJhbHBoYWJldGljYWwtb3JkZXJcIlxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBOYXZWaWV3IGV4dGVuZHMgUmVzaXphYmxlV2lkdGhWaWV3XG4gIHBhbmVsOiBudWxsXG4gIGZpbGVQYW5lbDogbnVsbCAgIyBtYWluIGVsZW0gZm9yIGN1cnJlbnQgZmlsZVxuICBib3R0b21Hcm91cHM6IFtdXG4gIGVuYWJsZWQ6IHRydWVcbiAgc2V0dGluZ3M6IHt9XG4gIHBhcnNlcjogbnVsbCAgIyBwYXJzZXIgc3VwcGxpZWQgYnkgY2xpZW50IGNvZGVcbiAgc3RhdGU6IHt9XG4gIHZpZXc6IG51bGxcbiAgbWluaUVkaXRvcjogbnVsbFxuXG4gIG5leHRJZDogMSAgICMgVG8gbWFyayB0aGUgZG9tIGl0ZW1cblxuXG4gIGNvbnN0cnVjdG9yOiAoc3RhdGUsIHNldHRpbmdzLCBwYXJzZXIpLT5cbiAgICBzdXBlcihzZXR0aW5ncy5sZWZ0UGFuZWwpXG4gICAgQGVuYWJsZWQgPSAhKHN0YXRlLmVuYWJsZWQgPT0gZmFsc2UpXG4gICAgQHN0YXRlID0gc3RhdGUuZmlsZVN0YXRlcyB8fCB7fVxuICAgIEBjaGFuZ2VTZXR0aW5ncyhzZXR0aW5ncylcbiAgICBAcGFyc2VyID0gcGFyc2VyXG5cbiAgICBAbWluaUVkaXRvciA9IG5ldyBUZXh0RWRpdG9yKHttaW5pOiB0cnVlLCBwbGFjZWhvbGRlclRleHQ6IFwiRmlsdGVyIGJ5IG5hbWVcIn0pXG4gICAgQG1pbmlFZGl0b3Iub25EaWRDaGFuZ2UgPT4gQGZpbHRlcigpXG4gICAgQHZpZXdDb250YWluZXIuYWRkQ2xhc3MoJ3ppLW1hcmtlci1wYW5lbCcpXG4gICAgaHRtbCA9IFwiXCJcIlxuICAgIDxkaXYgY2xhc3M9J3ppLWhlYWRlcic+XG4gICAgICA8IS0tIDxkaXYgY2xhc3M9J2ljb24gc2V0dGluZ3MgaWNvbi1nZWFyJz48L2Rpdj4gLS0+XG4gICAgICA8ZGl2IGNsYXNzPSdpY29uIHNvcnRlcic+PC9kaXY+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzcz0nemktdmlldyc+XG4gICAgPC9kaXY+XG4gICAgXCJcIlwiXG5cbiAgICAkKGh0bWwpLmFwcGVuZFRvKEBtYWluVmlldylcblxuICAgIGhlYWRlciA9IEBtYWluVmlldy5maW5kKCcuemktaGVhZGVyJylcbiAgICBoZWFkZXIuYXBwZW5kKEBtaW5pRWRpdG9yLmVsZW1lbnQpXG5cbiAgICBAdmlldyA9IEBtYWluVmlldy5maW5kKCcuemktdmlldycpXG4gICAgQHZpZXcub24gJ2NsaWNrJywgJy5saXN0LWl0ZW0nLCAoZXZlbnQpPT5cbiAgICAgIGVsZW0gPSBldmVudC5jdXJyZW50VGFyZ2V0XG4gICAgICBpZiBlbGVtLm1hcmtlcklkXG4gICAgICAgIGlmICQoZXZlbnQudGFyZ2V0KS5oYXNDbGFzcygnaWNvbicpXG4gICAgICAgICAgQHRvZ2dsZUhpZ2hsaWdodChlbGVtKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQGdvdG9NYXJrZXIoZWxlbS5tYXJrZXJJZClcbiAgICAgIGVsc2UgaWYgJChlbGVtKS5pcygnLnppLW1hcmtlci1ncm91cC1sYWJlbCcpXG4gICAgICAgICQoZWxlbSkucGFyZW50KCkudG9nZ2xlQ2xhc3MoJ2NvbGxhcHNlZCcpXG4gICAgQG1haW5WaWV3Lm9uICdjbGljaycsICcuc29ydGVyJywgPT5cbiAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgcmV0dXJuIHVubGVzcyBlZGl0b3JcbiAgICAgIGZpbGUgPSBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICBAc3RhdGVbZmlsZV0gfHw9IHt9XG4gICAgICBpZiBAc3RhdGVbZmlsZV0uc29ydCA9PSB1bmRlZmluZWRcbiAgICAgICAgQHN0YXRlW2ZpbGVdLnNvcnQgPSB0cnVlXG4gICAgICBlbHNlXG4gICAgICAgIEBzdGF0ZVtmaWxlXS5zb3J0ID0gIUBzdGF0ZVtmaWxlXS5zb3J0XG4gICAgICAjIFNldHVwIHNvcnRlciBpY29uIGFuZCB0aXRsZVxuICAgICAgc29ydGVyID0gQG1haW5WaWV3LmZpbmQoJy5zb3J0ZXInKVxuICAgICAgaWYgQHN0YXRlW2ZpbGVdLnNvcnRcbiAgICAgICAgc29ydGVyLmFkZENsYXNzKGljb25fb3JkZXJfYWxwaGFiZXRpY2FsKVxuICAgICAgICBzb3J0ZXIucmVtb3ZlQ2xhc3MoaWNvbl9vcmRlcl9hc19pcylcbiAgICAgICAgc29ydGVyLnByb3AoJ3RpdGxlJywgJ09yZGVyOiBzb3J0ZWQnKVxuICAgICAgZWxzZVxuICAgICAgICBzb3J0ZXIuYWRkQ2xhc3MoaWNvbl9vcmRlcl9hc19pcylcbiAgICAgICAgc29ydGVyLnJlbW92ZUNsYXNzKGljb25fb3JkZXJfYWxwaGFiZXRpY2FsKVxuICAgICAgICBzb3J0ZXIucHJvcCgndGl0bGUnLCAnT3JkZXI6IGFzIGlzIGluIGZpbGUnKVxuICAgICAgQHVwZGF0ZUZpbGUoZmlsZSlcblxuXG5cbiAgZGVzdHJveTogLT5cbiAgICBAdmlldy5jaGlsZHJlbigpLmVhY2ggPT5cbiAgICAgIEBkZXN0cm95UGFuZWwoJCh0aGlzKSlcbiAgICBAcGFuZWwuZGVzdHJveSgpXG5cbiAgZmlsdGVyOiAtPlxuICAgIGZpbHRlclRleHQgPSBAbWluaUVkaXRvci5nZXRUZXh0KClcbiAgICBsaXMgPSBAdmlldy5maW5kKFwibGkubGlzdC1pdGVtXCIpXG4gICAgbGlzLnNob3coKVxuICAgIGlmIGZpbHRlclRleHQgIT0gXCJcIlxuICAgICAgbGlzLmVhY2ggKGluZGV4LCBlbGVtZW50KSA9PlxuICAgICAgICBlbCA9ICQoZWxlbWVudClcbiAgICAgICAgaWYoZWwudGV4dCgpLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihmaWx0ZXJUZXh0LnRvTG93ZXJDYXNlKCkpIDwgMClcbiAgICAgICAgICBlbC5oaWRlKClcblxuICBtb3ZlUGFuZWw6IC0+XG4gICAgaWYgQHNldHRpbmdzLmxlZnRQYW5lbCA9PSAnbGVmdCdcbiAgICAgIEBzZXR0aW5ncy5sZWZ0UGFuZWwgPSAncmlnaHQnXG4gICAgICBAcGFuZWwuZGVzdHJveSgpXG4gICAgICBAcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRSaWdodFBhbmVsKFxuICAgICAgICBpdGVtOiBAdmlld0NvbnRhaW5lclxuICAgICAgICB2aXNpYmxlOiBAZW5hYmxlZFxuICAgICAgICBwcmlvcml0eTogMzAwXG4gICAgICApXG4gICAgICBAbW92ZUhhbmRsZUxlZnQoKVxuICAgIGVsc2VcbiAgICAgIEBzZXR0aW5ncy5sZWZ0UGFuZWwgPSAnbGVmdCdcbiAgICAgIEBwYW5lbC5kZXN0cm95KClcbiAgICAgIEBwYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZExlZnRQYW5lbChcbiAgICAgICAgaXRlbTogQHZpZXdDb250YWluZXJcbiAgICAgICAgdmlzaWJsZTogQGVuYWJsZWRcbiAgICAgICAgcHJpb3JpdHk6IDMwMFxuICAgICAgKVxuICAgICAgQG1vdmVIYW5kbGVSaWdodCgpXG5cblxuXG4gIGNoYW5nZVNldHRpbmdzOiAoc2V0dGluZ3MpLT5cbiAgICBAc2V0dGluZ3MgPSBzZXR0aW5nc1xuICAgICMgQWRkIHRvIHRoZSBwYW5lbFxuICAgIGlmIHNldHRpbmdzLmxlZnRQYW5lbCA9PSAnbGVmdCdcbiAgICAgIEBwYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZExlZnRQYW5lbChcbiAgICAgICAgaXRlbTogQHZpZXdDb250YWluZXJcbiAgICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICAgICAgcHJpb3JpdHk6IDMwMFxuICAgICAgKVxuICAgICAgQG1vdmVIYW5kbGVSaWdodCgpXG4gICAgZWxzZVxuICAgICAgQHBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkUmlnaHRQYW5lbChcbiAgICAgICAgaXRlbTogQHZpZXdDb250YWluZXJcbiAgICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICAgICAgcHJpb3JpdHk6IDMwMFxuICAgICAgKVxuICAgICAgQG1vdmVIYW5kbGVMZWZ0KClcblxuICBnZXRGaWxlUGFuZWw6IChmaWxlKS0+XG4gICAgZmlsZVBhbmVsID0gbnVsbFxuICAgIEB2aWV3LmNoaWxkcmVuKCkuZWFjaCAtPlxuICAgICAgaWYgJCh0aGlzKS5kYXRhKCdmaWxlJykgPT0gZmlsZVxuICAgICAgICBmaWxlUGFuZWwgPSAkKHRoaXMpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgcmV0dXJuIHRydWVcbiAgICByZXR1cm4gZmlsZVBhbmVsXG5cblxuICBnZXRGaWxlRWRpdG9yOiAoZmlsZSktPlxuICAgIGVkaXRvcnMgPSBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpXG4gICAgZm9yIGVkaXRvciBpbiBlZGl0b3JzXG4gICAgICBpZiBlZGl0b3IuZ2V0UGF0aCgpID09IGZpbGVcbiAgICAgICAgcmV0dXJuIGVkaXRvclxuICAgIHJldHVybiBudWxsXG5cblxuICBzZXRGaWxlOiAoZmlsZSktPlxuICAgIHJldHVybiB1bmxlc3MgZmlsZVxuICAgIG5ld0VsZW0gPSBAZ2V0RmlsZVBhbmVsKGZpbGUpXG4gICAgI3RvZG86IElmIHdlIGhhdmUgbXVsdGlwbGUgcGFuZXMgdGhpcyBtaWdodCBnaXZlIHNvbWUgb2RkIHJlc3VsdHNcbiAgICBlZGl0b3IgPSBAZ2V0RmlsZUVkaXRvcihmaWxlKVxuICAgIGVkaXRvclZpZXcgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxuICAgIGd1dHRlciA9ICQoJy5ndXR0ZXItY29udGFpbmVyJywgZWRpdG9yVmlldylcbiAgICAjIFNldHVwIHNvcnRlciBpY29uIGFuZCB0aXRsZVxuICAgIHNvcnRlciA9IEBtYWluVmlldy5maW5kKCcuc29ydGVyJylcbiAgICBpZiAhQHN0YXRlW2ZpbGVdIHx8IEBzdGF0ZVtmaWxlXS5zb3J0XG4gICAgICBzb3J0ZXIuYWRkQ2xhc3MoaWNvbl9vcmRlcl9hbHBoYWJldGljYWwpXG4gICAgICBzb3J0ZXIucmVtb3ZlQ2xhc3MoaWNvbl9vcmRlcl9hc19pcylcbiAgICAgIHNvcnRlci5wcm9wKCd0aXRsZScsICdPcmRlcjogc29ydGVkJylcbiAgICBlbHNlXG4gICAgICBzb3J0ZXIuYWRkQ2xhc3MoaWNvbl9vcmRlcl9hc19pcylcbiAgICAgIHNvcnRlci5yZW1vdmVDbGFzcyhpY29uX29yZGVyX2FscGhhYmV0aWNhbClcbiAgICAgIHNvcnRlci5wcm9wKCd0aXRsZScsICdPcmRlcjogYXMgaXMgaW4gZmlsZScpXG4gICAgaWYgIWd1dHRlci5kYXRhKCd6TmF2UGFuZWxNb3VzZScpXG4gICAgICBndXR0ZXIuZGF0YSgnek5hdlBhbmVsTW91c2UnLCAnZG9uZScpXG4gICAgICBkbyAoZWRpdG9yKT0+XG4gICAgICAgIGd1dHRlci5vbiAnbW91c2Vkb3duJywgJy5saW5lLW51bWJlcicsIChldmVudCkgPT5cbiAgICAgICAgICByZXR1cm4gdW5sZXNzIEBlbmFibGVkXG4gICAgICAgICAgaWYgZXZlbnQud2hpY2ggIT0gMSB8fCBldmVudC5hbHRLZXkgPT0gZmFsc2UgfHxcbiAgICAgICAgICAgICAgZXZlbnQuY3RybEtleSA9PSB0cnVlIHx8IGV2ZW50LnNoaWZ0S2V5ID09IHRydWVcbiAgICAgICAgICAgICMgcmV0dXJuIGlmIG5vdCBhbHQtY2xpY2tcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICN0b2RvOiBkZXRlcm1pbmUgd2h5IHN0b3BQcm9wYWdhdGlvbiBhbmQgcHJldmVudERlZmF1bHQgZG9uJ3Qgd29ya1xuICAgICAgICAgICMgZm9yIHRoZSBsaW5lIHN0aWxsIGdldHMgc2VsZWN0ZWRcbiAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICByb3cgPSArKCQoZXZlbnQudGFyZ2V0KS5hdHRyKCdkYXRhLWJ1ZmZlci1yb3cnKSlcbiAgICAgICAgICBAdG9nZ2xlQm9va21hcmsocm93LCBlZGl0b3IpXG4gICAgaWYgbmV3RWxlbVxuICAgICAgIyBIYWQgcHJldmlvdXNseSBiZWVuIHNldCB1cFxuICAgICAgcmV0dXJuIEBzZXRWaXNpYmlsaXR5KCkgaWYgbmV3RWxlbSA9PSBAZmlsZVBhbmVsXG4gICAgICByZXR1cm4gQHN3aXRjaFBhbmVsKG5ld0VsZW0pXG4gICAgQHBvcHVsYXRlUGFuZWwoZWRpdG9yKVxuXG5cbiAgdXBkYXRlRmlsZTogKGZpbGUpLT5cbiAgICBlZGl0b3IgPSBAZ2V0RmlsZUVkaXRvcihmaWxlKVxuICAgIG9sZFBhbmVsID0gQGdldEZpbGVQYW5lbChmaWxlKVxuICAgIGlmIG9sZFBhbmVsICAgIyBvbGRQYW5lbCBpcyBudWxsIHdoZW4gbmV3bHkgY3JlYXRlZCBmaWxlIGlzIHNhdmVkXG4gICAgICBwcmV2U3RhdGUgPSBAZ2V0UGFuZWxTdGF0ZShvbGRQYW5lbClcbiAgICAgIEBzdGF0ZVtmaWxlXSA9IHByZXZTdGF0ZVxuICAgICAgQGRlc3Ryb3lQYW5lbChvbGRQYW5lbClcbiAgICBAcG9wdWxhdGVQYW5lbChlZGl0b3IpXG4gICAgQHNldFZpc2liaWxpdHkoKVxuICAgIEBmaWx0ZXIoKVxuXG5cbiAgZ2V0UGFuZWxTdGF0ZTogKHBhbmVsKS0+XG4gICAgcmV0dXJuIHVubGVzcyBwYW5lbFxuICAgIHN0YXRlID0ge2NvbGxhcHNlZEdyb3VwczogW10sIGJvb2ttYXJrczogW10sIGhpZ2hsaWdodHM6IHt9fVxuICAgIGZpbGUgPSBwYW5lbC5kYXRhKCdmaWxlJylcbiAgICBlZGl0b3IgPSBAZ2V0RmlsZUVkaXRvcihmaWxlKVxuICAgIHJldHVybiB1bmxlc3MgZWRpdG9yXG4gICAgZ3JvdXBzID0gcGFuZWwuZmluZChcIi56aS1tYXJrZXItZ3JvdXBcIilcbiAgICBncm91cHMuZWFjaCAtPlxuICAgICAgZ3JvdXAgPSAkKHRoaXMpXG4gICAgICBncm91cExhYmVsID0gJCh0aGlzKS5maW5kKCcuemktbWFya2VyLWdyb3VwLWxhYmVsJykudGV4dCgpLnRyaW0oKVxuICAgICAgaWYgJCh0aGlzKS5oYXNDbGFzcygnY29sbGFwc2VkJylcbiAgICAgICAgc3RhdGUuY29sbGFwc2VkR3JvdXBzLnB1c2ggZ3JvdXBMYWJlbFxuICAgICAgaWYgZ3JvdXBMYWJlbCA9PSAnQm9va21hcmtzJyAmJiBlZGl0b3JcbiAgICAgICAgZ3JvdXAuZmluZCgnbGkubGlzdC1pdGVtJykuZWFjaCAtPlxuICAgICAgICAgIHJvdyA9IGVkaXRvci5nZXRNYXJrZXIodGhpcy5tYXJrZXJJZCkuZ2V0U3RhcnRCdWZmZXJQb3NpdGlvbigpLnJvd1xuICAgICAgICAgIHN0YXRlLmJvb2ttYXJrcy5wdXNoIHJvd1xuICAgICAgIyBTYXZlIGl0ZW1zIHRoYXQgaGF2ZSBoaWdobGlnaHRzXG4gICAgICBncm91cC5maW5kKCdsaS56aS1oaWdobGlnaHQnKS5lYWNoIC0+XG4gICAgICAgIHN0YXRlLmhpZ2hsaWdodHNbZ3JvdXBMYWJlbF0gfHw9IFtdXG4gICAgICAgIHJvdyA9IGVkaXRvci5nZXRNYXJrZXIodGhpcy5tYXJrZXJJZCkuZ2V0U3RhcnRCdWZmZXJQb3NpdGlvbigpLnJvd1xuICAgICAgICBzdGF0ZS5oaWdobGlnaHRzW2dyb3VwTGFiZWxdLnB1c2ggcm93XG4gICAgaWYgQHN0YXRlW2ZpbGVdICYmIEBzdGF0ZVtmaWxlXS5zb3J0ICE9IHVuZGVmaW5lZFxuICAgICAgc3RhdGUuc29ydCA9IEBzdGF0ZVtmaWxlXS5zb3J0XG4gICAgcmV0dXJuIHN0YXRlXG5cblxuXG4gIHNldFBhbmVsU3RhdGU6IChwYW5lbCwgc3RhdGUpLT5cbiAgICByZXR1cm4gdW5sZXNzIHBhbmVsICYmIHN0YXRlXG4gICAgZWRpdG9yID0gQGdldEZpbGVFZGl0b3IocGFuZWwuZGF0YSgnZmlsZScpKVxuICAgIHJldHVybiB1bmxlc3MgZWRpdG9yXG5cbiAgICBwcmV2RmlsZVBhbmVsID0gbnVsbFxuICAgIGlmIEBmaWxlUGFuZWwgIT0gcGFuZWxcbiAgICAgIHByZXZGaWxlUGFuZWwgPSBAZmlsZVBhbmVsXG4gICAgICBAZmlsZVBhbmVsID0gcGFuZWxcblxuICAgICMgRmlyc3QgZGVhbCB3aXRoIGJvb2ttYXJrc1xuICAgIGlmIHN0YXRlLmJvb2ttYXJrcy5sZW5ndGhcbiAgICAgIGJvb2ttYXJrc0dyb3VwID0gQGFkZEdyb3VwKCdCb29rbWFya3MnKVxuICAgICAgZm9yIGJvb2ttYXJrUm93IGluIHN0YXRlLmJvb2ttYXJrc1xuICAgICAgICBAdG9nZ2xlQm9va21hcmsoYm9va21hcmtSb3csIGVkaXRvciwgdHJ1ZSlcbiAgICAjIE5vdyBoaWdodGxpZ2h0c1xuICAgIGZvciBncm91cExhYmVsIGluIE9iamVjdC5rZXlzKHN0YXRlLmhpZ2hsaWdodHMpXG4gICAgICBmb3IgaGlnaGxpZ2h0Um93IGluIHN0YXRlLmhpZ2hsaWdodHNbZ3JvdXBMYWJlbF1cbiAgICAgICAgICBAdG9nZ2xlSGlnaGxpZ2h0KEBnZXRJdGVtQnlPcmlnUm93KGhpZ2hsaWdodFJvdywgZ3JvdXBMYWJlbCksIGVkaXRvcilcbiAgICAjIE5vdyBjb2xsYXBzZWQgR3JvdXBzXG4gICAgZ3JvdXBzID0gcGFuZWwuZmluZChcIi56aS1tYXJrZXItZ3JvdXBcIilcbiAgICBncm91cHMuZWFjaCAtPlxuICAgICAgZ3JvdXAgPSAkKHRoaXMpXG4gICAgICBncm91cExhYmVsID0gJCh0aGlzKS5maW5kKCcuemktbWFya2VyLWdyb3VwLWxhYmVsJykudGV4dCgpLnRyaW0oKVxuICAgICAgaWYgc3RhdGUuY29sbGFwc2VkR3JvdXBzLmluZGV4T2YoZ3JvdXBMYWJlbCkgPj0gMFxuICAgICAgICBncm91cC5hZGRDbGFzcygnY29sbGFwc2VkJylcbiAgICAgIGVsc2VcbiAgICAgICAgZ3JvdXAucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNlZCcpXG5cbiAgICBAZmlsZVBhbmVsID0gcHJldkZpbGVQYW5lbCBpZiBwcmV2RmlsZVBhbmVsXG5cblxuICBnZXRTdGF0ZTogLT5cbiAgICAjIHN0YXRlIGZvciBlYWNoIHBhbmVsIGJ5IGZpbGVcbiAgICBAdmlldy5jaGlsZHJlbigpLmVhY2ggPT5cbiAgICAgIHBhbmVsID0gJCh0aGlzKVxuICAgICAgZmlsZSA9IHBhbmVsLmRhdGEoJ2ZpbGUnKVxuICAgICAgcGFuZWxTdGF0ZSA9IEBnZXRQYW5lbFN0YXRlKHBhbmVsKVxuICAgICAgQHN0YXRlW2ZpbGVdID0gcGFuZWxTdGF0ZVxuICAgIHJldHVybiBAc3RhdGVcblxuXG4gIHNhdmVGaWxlU3RhdGU6IChmaWxlKS0+XG4gICAgcGFuZWwgPSBAZ2V0RmlsZVBhbmVsKGZpbGUpXG4gICAgc3RhdGUgPSBAZ2V0UGFuZWxTdGF0ZShwYW5lbClcbiAgICBAc3RhdGVbZmlsZV0gPSBzdGF0ZSBpZiBzdGF0ZVxuXG5cbiAgY2xvc2VGaWxlOiAoZmlsZSktPlxuICAgIHBhbmVsID0gQGdldEZpbGVQYW5lbChmaWxlKVxuICAgIHJldHVybiB1bmxlc3MgcGFuZWxcbiAgICBwYW5lbFN0YXRlID0gQGdldFBhbmVsU3RhdGUocGFuZWwpXG4gICAgQHN0YXRlW2ZpbGVdID0gcGFuZWxTdGF0ZSBpZiBwYW5lbFN0YXRlXG4gICAgQGRlc3Ryb3lQYW5lbChwYW5lbCkgaWYgcGFuZWxcblxuXG4gIHN3aXRjaFBhbmVsOiAocGFuZWwpLT5cbiAgICBAZmlsZVBhbmVsLmhpZGUoKVxuICAgIEBmaWxlUGFuZWwgPSBwYW5lbFxuICAgIEBzZXRWaXNpYmlsaXR5KClcblxuXG4gIGFycmFuZ2VJdGVtczogKGl0ZW1zLCBmaWxlKS0+XG4gICAgYXJyYW5nZWRJdGVtcyA9IFtdXG4gICAgaWYgQHNldHRpbmdzLm5vRHVwc1xuICAgICAgcHJldkl0ZW1zID0gW11cbiAgICAgIGZvciBpdGVtIGluIGl0ZW1zXG4gICAgICAgIGR1cEtleSA9IGl0ZW0ua2luZCArICd8fCcgKyBpdGVtLmxhYmVsXG4gICAgICAgIGNvbnRpbnVlIGlmIHByZXZJdGVtcy5pbmRleE9mKGR1cEtleSkgPj0gMFxuICAgICAgICBwcmV2SXRlbXMucHVzaChkdXBLZXkpXG4gICAgICAgIGFycmFuZ2VkSXRlbXMucHVzaCBpdGVtXG4gICAgZWxzZVxuICAgICAgYXJyYW5nZWRJdGVtcyA9IGl0ZW1zLnNsaWNlKDApXG4gICAgaWYgQHN0YXRlW2ZpbGVdICYmIEBzdGF0ZVtmaWxlXS5zb3J0ICE9IHVuZGVmaW5lZFxuICAgICAgc29ydCA9IEBzdGF0ZVtmaWxlXS5zb3J0XG4gICAgZWxzZVxuICAgICAgc29ydCA9IEBzZXR0aW5ncy5zb3J0XG4gICAgaWYgL1xcLihtZHxyc3QpJC8udGVzdChmaWxlKVxuICAgICAgc29ydCA9IGZhbHNlXG4gICAgaWYgc29ydFxuICAgICAgYXJyYW5nZWRJdGVtcy5zb3J0IChhLGIpLT5cbiAgICAgICAga2V5MSA9IChhLmtpbmQgKyAnfHwnICsgYS5sYWJlbCkudG9Mb3dlckNhc2UoKVxuICAgICAgICBrZXkyID0gKGIua2luZCArICd8fCcgKyBiLmxhYmVsKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIHJldHVybiAwIGlmIGtleTEgPT0ga2V5MlxuICAgICAgICByZXR1cm4gMSBpZiBrZXkxID4ga2V5MlxuICAgICAgICByZXR1cm4gLTFcbiAgICByZXR1cm4gYXJyYW5nZWRJdGVtc1xuXG5cbiAgcG9wdWxhdGVQYW5lbDogKGVkaXRvciktPlxuICAgICMgbmV3XG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpIHVubGVzcyBlZGl0b3JcbiAgICBmaWxlID0gZWRpdG9yLmdldFBhdGgoKVxuICAgIEBmaWxlUGFuZWwgPSAkKFwiPHVsIGNsYXNzPSdsaXN0LXRyZWUgaGFzLWNvbGxhcHNhYmxlLWNoaWxkcmVuJz5cIikuYXBwZW5kVG8oQHZpZXcpXG4gICAgQGZpbGVQYW5lbC5kYXRhKCdmaWxlJywgZmlsZSlcbiAgICBpdGVtcyA9IEBwYXJzZXIucGFyc2UoKVxuICAgIGlmIGl0ZW1zXG4gICAgICBpdGVtcyA9IEBhcnJhbmdlSXRlbXMoaXRlbXMsIGZpbGUpXG4gICAgICBmb3IgaXRlbSBpbiBpdGVtc1xuICAgICAgICB7aWQsIGVsZW19ID0gQGFkZFBhbmVsSXRlbShpdGVtKVxuICAgICAgICBtYXJrZXIgPSBlZGl0b3IubWFya0J1ZmZlclBvc2l0aW9uKFtpdGVtLnJvdywgMF0pXG4gICAgICAgIG1hcmtlci56SXRlbUlkID0gaWRcbiAgICAgICAgZWxlbVswXS5tYXJrZXJJZCA9IG1hcmtlci5pZFxuICAgICMgQHZpZXcuY2hpbGRyZW4oKS5oaWRlKClcbiAgICBAc2V0VmlzaWJpbGl0eSgpXG4gICAgQHNldFBhbmVsU3RhdGUoQGZpbGVQYW5lbCwgQHN0YXRlW2ZpbGVdKVxuXG5cbiAgZ290b01hcmtlcjogKG1hcmtlcklkKS0+XG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgbWFya2VyID0gZWRpdG9yLmdldE1hcmtlcihtYXJrZXJJZClcbiAgICByZXR1cm4gdW5sZXNzIG1hcmtlclxuICAgIHBvc2l0aW9uID0gbWFya2VyLmdldFN0YXJ0QnVmZmVyUG9zaXRpb24oKVxuICAgIGVkaXRvci51bmZvbGRCdWZmZXJSb3cocG9zaXRpb24ucm93KVxuICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihwb3NpdGlvbilcbiAgICBlZGl0b3Iuc2Nyb2xsVG9DdXJzb3JQb3NpdGlvbigpXG5cblxuICBhZGRHcm91cDogKGxhYmVsKS0+XG4gICAgIyBwb3MgOiBwcmVzZW50bHkgc2hvdWxkIGJlIDEgZm9yIHRvcCBvciB1bmRlZmluZWQgb3IganF1ZXJ5IG9iaiB0byBpbnNlcnQgYWZ0ZXJcbiAgICAjIHJldHVybnMgZWxlbWVudCB0aGF0IG5ldyBpdGVtcyBjYW4gYmUgYXBwZW5kZWQgdG9cbiAgICBncm91cCA9IEBmaWxlUGFuZWwuZmluZChcIi56aS1tYXJrZXItZ3JvdXAtbGFiZWw6Y29udGFpbnMoI3tsYWJlbH0pXCIpLnNpYmxpbmdzKCd1bC5saXN0LXRyZWUnKVxuICAgIHJldHVybiBncm91cCBpZiBncm91cC5sZW5ndGhcblxuICAgIGlmIEBzZXR0aW5ncy5jb2xsYXBzZWRHcm91cHMuaW5kZXhPZihsYWJlbCkgPj0gMFxuICAgICAgY29sbGFwc2VkID0gJ2NvbGxhcHNlZCdcbiAgICBlbHNlXG4gICAgICBjb2xsYXBzZWQgPSAnJ1xuXG4gICAgaHRtbCA9IFwiXCJcIlxuICAgICAgPGxpIGNsYXNzPSdsaXN0LW5lc3RlZC1pdGVtIHppLW1hcmtlci1ncm91cCAje2NvbGxhcHNlZH0nPlxuICAgICAgICA8ZGl2IGNsYXNzPSdsaXN0LWl0ZW0gemktbWFya2VyLWdyb3VwLWxhYmVsJz5cbiAgICAgICAgICA8c3Bhbj4je2xhYmVsfTwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDx1bCBjbGFzcz0nbGlzdC10cmVlJz5cbiAgICAgICAgPC91bD5cbiAgICAgIDwvbGk+XG4gICAgXCJcIlwiXG4gICAgaWYgQHNldHRpbmdzLnRvcEdyb3Vwcy5pbmRleE9mKGxhYmVsKSA+PSAwXG4gICAgICBlbGVtID0gJChodG1sKS5wcmVwZW5kVG8oQGZpbGVQYW5lbClcbiAgICBlbHNlXG4gICAgICBlbGVtID0gJChodG1sKS5hcHBlbmRUbyhAZmlsZVBhbmVsKVxuICAgIHJldHVybiBlbGVtLmZpbmQoJ3VsLmxpc3QtdHJlZScpXG5cblxuICBhZGRQYW5lbEl0ZW06IChncm91cExhYmVsLCBsYWJlbCwgZGF0YSktPlxuICAgICMgZ3JvdXBMYWJlbCBjb3VsZCBiZSBhbiBvYmplY3QgJiBvbmx5IGFyZ1xuICAgICMgZGF0YSAtPiB7aWNvbiwgdG9vbHRpcCwgbWFya2VyLCBkZWNvcmF0b3J9XG4gICAgIyByZXR1cm4gaWQsIGRhdGEgYXR0YWNoZWQgdG8gb2JqZWN0XG4gICAgaWYgdHlwZW9mIGdyb3VwTGFiZWwgIT0gJ3N0cmluZydcbiAgICAgIGRhdGEgPSBncm91cExhYmVsXG4gICAgICBncm91cExhYmVsID0gZGF0YS5raW5kXG4gICAgICBsYWJlbCA9IGRhdGEubGFiZWxcbiAgICBlbHNlXG4gICAgICBkYXRhIHx8PSB7fVxuXG4gICAgZ3JvdXAgPSBAYWRkR3JvdXAoZ3JvdXBMYWJlbClcbiAgICBpZiBkYXRhLmljb25cbiAgICAgIGxhYmVsQ2xhc3MgPSBcImNsYXNzPSdpY29uIGljb24tI3tkYXRhLmljb259J1wiXG4gICAgZWxzZVxuICAgICAgbGFiZWxDbGFzcyA9IFwiY2xhc3M9J2ljb24gaWNvbi1leWUnXCJcbiAgICAjIEludGVyaW0gOiBGaXggd2l0aCBhIGJldHRlciBhcHByb2FjaFxuICAgIHRvb2x0aXAgPSBkYXRhLnRvb2x0aXBcbiAgICBpZiAhdG9vbHRpcCAmJiBsYWJlbC5sZW5ndGggPiAyOFxuICAgICAgdG9vbHRpcCA9IGxhYmVsLnJlcGxhY2UoLycvZywgJyYjMzk7JylcbiAgICBodG1sID0gXCJcIlwiXG4gICAgPGxpIGlkPSd6aS1pdGVtLSN7QG5leHRJZH0nIGNsYXNzPSdsaXN0LWl0ZW0nIHRpdGxlPScje3Rvb2x0aXAgfHwgJyd9Jz5cbiAgICAgIDxzcGFuICN7bGFiZWxDbGFzc30+PC9zcGFuPlxuICAgICAgPHNwYW4gY2xhc3M9J3ppLW1hcmtlci1sYWJlbCc+I3tsYWJlbH08L3NwYW4+XG4gICAgPC9saT5cbiAgICBcIlwiXCJcbiAgICBlbGVtID0gJChodG1sKS5hcHBlbmRUbyhncm91cClcbiAgICBlbGVtWzBdLm9yaWdSb3cgPSBkYXRhLnJvdyBpZiBkYXRhLnJvd1xuICAgIHJldHVybiB7aWQ6IEBuZXh0SWQrKywgZWxlbTogZWxlbX1cblxuXG4gIHRvZ2dsZUhpZ2hsaWdodDogKGVsZW1lbnQsIGVkaXRvciktPlxuICAgIGVsZW1lbnQgPSBlbGVtZW50WzBdIGlmIGVsZW1lbnQuanF1ZXJ5XG4gICAgcmV0dXJuIHVubGVzcyBlbGVtZW50XG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpIHVubGVzcyBlZGl0b3JcbiAgICBpZiBlbGVtZW50LmRlY29yYXRpb25cbiAgICAgIGVsZW1lbnQuZGVjb3JhdGlvbi5kZXN0cm95KClcbiAgICAgICQoZWxlbWVudCkucmVtb3ZlQ2xhc3MoJ3ppLWhpZ2hsaWdodCcpXG4gICAgICByZXR1cm4gZWxlbWVudC5kZWNvcmF0aW9uID0gbnVsbFxuICAgIGVsc2VcbiAgICAgICQoZWxlbWVudCkuYWRkQ2xhc3MoJ3ppLWhpZ2hsaWdodCcpXG4gICAgICBtYXJrZXIgPSBlZGl0b3IuZ2V0TWFya2VyKGVsZW1lbnQubWFya2VySWQpXG4gICAgICBkZWNvcmF0aW9uID0gZWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwge3R5cGU6ICdsaW5lLW51bWJlcicsIGNsYXNzOiAnemktaGlnaGxpZ2h0J30pXG4gICAgICBkZWNvcmF0aW9uLnpOYXZQYW5lbEl0ZW0gPSB0cnVlXG4gICAgICByZXR1cm4gZWxlbWVudC5kZWNvcmF0aW9uID0gZGVjb3JhdGlvblxuXG5cbiAgdG9nZ2xlQm9va21hcms6IChsaW5lTnVtLCBlZGl0b3IsIHNraXBIaWdobGlnaHQpIC0+XG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpIHVubGVzcyBlZGl0b3JcbiAgICBsaW5lTWFya2VycyA9IGVkaXRvci5maW5kTWFya2Vycyh7c3RhcnRCdWZmZXJSb3c6IGxpbmVOdW0sIGVuZEJ1ZmZlclJvdzogbGluZU51bX0pXG4gICAgZm9yIGxpbmVNYXJrZXIgaW4gbGluZU1hcmtlcnNcbiAgICAgIGNvbnRpbnVlIHVubGVzcyBsaW5lTWFya2VyLnpJdGVtSWRcbiAgICAgIGlmIGxpbmVNYXJrZXIuek5hdlBhbmVsQm9va21hcmtcbiAgICAgICAgcmV0dXJuIEByZW1vdmVJdGVtKGxpbmVNYXJrZXIuekl0ZW1JZCwgZWRpdG9yKVxuICAgICAgZGVjb3JhdGlvbnMgPSBlZGl0b3IuZGVjb3JhdGlvbnNGb3JNYXJrZXJJZChsaW5lTWFya2VyLmlkKVxuICAgICAgaWYgZGVjb3JhdGlvbnNcbiAgICAgICAgZm9yIGRlY29yYXRpb24gaW4gZGVjb3JhdGlvbnNcbiAgICAgICAgICBpZiBkZWNvcmF0aW9uLnpOYXZQYW5lbEl0ZW1cbiAgICAgICAgICAgIHJldHVybiBAdG9nZ2xlSGlnaGxpZ2h0KEBnZXRJdGVtQnlJZChsaW5lTWFya2VyLnpJdGVtSWQpKVxuXG4gICAgIyBObyBleGlzdGluZyBib29rbWFyayBzbyBjcmVhdGUgb25lXG4gICAgbGluZVRleHQgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cobGluZU51bSlcbiAgICBsaW5lVGV4dCA9IGxpbmVUZXh0LnRyaW0oKSB8fCAnX19fIGJsYW5rIGxpbmUgX19fJ1xuICAgIGF0b21NYXJrZXIgPSBlZGl0b3IubWFya0J1ZmZlclBvc2l0aW9uKFtsaW5lTnVtLCAwXSlcbiAgICB7aWQsIGVsZW19ID0gQGFkZFBhbmVsSXRlbSgnQm9va21hcmtzJywgbGluZVRleHQsIHttYXJrZXI6IGF0b21NYXJrZXJ9KVxuICAgIGF0b21NYXJrZXIuekl0ZW1JZCA9IGlkXG4gICAgYXRvbU1hcmtlci56TmF2UGFuZWxCb29rbWFyayA9IHRydWVcbiAgICBlbGVtWzBdLm1hcmtlcklkID0gYXRvbU1hcmtlci5pZFxuICAgIGVsZW1bMF0ub3JpZ1JvdyA9IGxpbmVOdW1cbiAgICBpZiAhc2tpcEhpZ2hsaWdodFxuICAgICAgZGVjb3JhdGlvbiA9IEB0b2dnbGVIaWdobGlnaHQoZWxlbVswXSwgZWRpdG9yKVxuICAgIEBzZXRWaXNpYmlsaXR5KClcblxuXG4gIHJlbW92ZUl0ZW06IChpZCwgZWRpdG9yKS0+XG4gICAgIyBBbHNvIHJlbW92ZSBncm91cCBpZiBsYXN0IGl0ZW1cbiAgICBpdGVtID0gJCgnI3ppLWl0ZW0tJyArIGlkKVxuICAgIHJldHVybiB1bmxlc3MgaXRlbS5sZW5ndGhcblxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSB1bmxlc3MgZWRpdG9yXG4gICAgaXRlbVswXS5kZWNvcmF0aW9uLmRlc3Ryb3koKSBpZiBpdGVtWzBdLmRlY29yYXRpb25cbiAgICBpZiBpdGVtWzBdLm1hcmtlcklkXG4gICAgICBtYXJrZXIgPSBlZGl0b3IuZ2V0TWFya2VyKGl0ZW1bMF0ubWFya2VySWQpXG4gICAgICBtYXJrZXIuZGVzdHJveSgpXG4gICAgaWYgaXRlbS5zaWJsaW5ncygpLmxlbmd0aFxuICAgICAgaXRlbS5yZW1vdmUoKVxuICAgIGVsc2VcbiAgICAgIGl0ZW0ucGFyZW50cygnbGkubGlzdC1uZXN0ZWQtaXRlbScpLmZpcnN0KCkucmVtb3ZlKClcbiAgICBAc2V0VmlzaWJpbGl0eSgpXG5cblxuICBnZXRJdGVtQnlJZDogKGlkKS0+XG4gICAgcmV0dXJuICQoJyN6aS1pdGVtLScgKyBpZClcblxuXG4gIGdldEl0ZW1CeU9yaWdSb3c6IChyb3csIGdyb3VwKS0+XG4gICAgZWxlbSA9ICQoKVxuICAgIGlmIGdyb3VwXG4gICAgICByb290ID0gQGZpbGVQYW5lbC5maW5kKFwiLnppLW1hcmtlci1ncm91cC1sYWJlbDpjb250YWlucygje2dyb3VwfSlcIikuc2libGluZ3MoJ3VsLmxpc3QtdHJlZScpXG4gICAgZWxzZVxuICAgICAgcm9vdCA9IEBmaWxlUGFuZWxcbiAgICByb290LmZpbmQoJ2xpLmxpc3QtaXRlbScpLmVhY2ggLT5cbiAgICAgIGlmIHRoaXMub3JpZ1JvdyA9PSAgcm93XG4gICAgICAgIGVsZW0gPSAkKHRoaXMpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgcmV0dXJuIHRydWVcbiAgICByZXR1cm4gZWxlbVxuXG5cbiAgc2V0VmlzaWJpbGl0eTogLT5cbiAgICBpZiBAZW5hYmxlZCAmJiBAZmlsZVBhbmVsPy5maW5kKCdsaS5saXN0LWl0ZW0nKS5sZW5ndGggPiAwXG4gICAgICBAdmlldy5jaGlsZHJlbigpLmhpZGUoKVxuICAgICAgQGZpbGVQYW5lbC5zaG93KClcbiAgICAgIEBwYW5lbC5zaG93KClcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZWxzZVxuICAgICAgQHBhbmVsLmhpZGUoKVxuICAgICAgcmV0dXJuIGZhbHNlXG5cblxuICBoaWRlOiAtPlxuICAgIEBwYW5lbC5oaWRlKClcblxuXG4gIGVuYWJsZTogKGVuYWJsZSktPlxuICAgIEBlbmFibGVkID0gZW5hYmxlXG4gICAgQHNldFZpc2liaWxpdHkoKVxuXG5cbiAgZGVzdHJveVBhbmVsOiAoZmlsZVBhbmVsKS0+XG4gICAgZWRpdG9yID0gQGdldEZpbGVFZGl0b3IoZmlsZVBhbmVsLmRhdGEoJ2ZpbGUnKSlcbiAgICAkKGZpbGVQYW5lbCkuZmluZCgnbGkubGlzdC1pdGVtJykuZWFjaCAtPlxuICAgICAgdGhpcy5kZWNvcmF0b3IuZGVzdHJveSgpIGlmIHRoaXMuZGVjb3JhdG9yXG4gICAgICBlZGl0b3IuZ2V0TWFya2VyKHRoaXMubWFya2VySWQpPy5kZXN0cm95KCkgaWYgZWRpdG9yXG4gICAgZmlsZVBhbmVsLnJlbW92ZSgpXG4iXX0=
