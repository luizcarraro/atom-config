(function() {
  var $, QuickQueryEditorView, SelectDataType, SelectListView, View, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), View = ref.View, SelectListView = ref.SelectListView, $ = ref.$;

  SelectDataType = (function(superClass) {
    extend(SelectDataType, superClass);

    function SelectDataType() {
      return SelectDataType.__super__.constructor.apply(this, arguments);
    }

    SelectDataType.prototype.initialize = function() {
      SelectDataType.__super__.initialize.apply(this, arguments);
      this.list.hide();
      this.filterEditorView.focus((function(_this) {
        return function(e) {
          return _this.list.show();
        };
      })(this));
      return this.filterEditorView.blur((function(_this) {
        return function(e) {
          return _this.list.hide();
        };
      })(this));
    };

    SelectDataType.prototype.viewForItem = function(item) {
      return "<li> " + item + " </li>";
    };

    SelectDataType.prototype.confirmed = function(item) {
      this.filterEditorView.getModel().setText(item);
      return this.list.hide();
    };

    SelectDataType.prototype.setError = function(message) {
      if (message == null) {
        message = '';
      }
    };

    SelectDataType.prototype.cancel = function() {};

    return SelectDataType;

  })(SelectListView);

  module.exports = QuickQueryEditorView = (function(superClass) {
    extend(QuickQueryEditorView, superClass);

    QuickQueryEditorView.prototype.editor = null;

    QuickQueryEditorView.prototype.action = null;

    QuickQueryEditorView.prototype.model = null;

    QuickQueryEditorView.prototype.model_type = null;

    function QuickQueryEditorView(action, model) {
      this.action = action;
      this.model = model;
      if (this.action === 'create') {
        this.model_type = this.model.child_type;
      } else {
        this.model_type = this.model.type;
      }
      QuickQueryEditorView.__super__.constructor.apply(this, arguments);
    }

    QuickQueryEditorView.prototype.initialize = function() {
      var connection;
      connection = this.model.type === 'connection' ? this.model : this.model.connection;
      this.selectDataType.setItems(connection.getDataTypes());
      this.nameEditor = this.find('#quick-query-editor-name')[0].getModel();
      this.datatypeEditor = this.selectDataType.filterEditorView.getModel();
      this.defaultValueEditor = this.find('#quick-query-default')[0].getModel();
      this.find('#quick-query-nullable').click(function(e) {
        $(this).toggleClass('selected');
        return $(this).html($(this).hasClass('selected') ? 'YES' : 'NO');
      });
      this.find('#quick-query-null').change((function(_this) {
        return function(e) {
          var $null;
          $null = $(e.currentTarget);
          if ($null.is(':checked')) {
            _this.find('#quick-query-default').addClass('hide');
            return _this.find('#quick-query-default-is-null').removeClass('hide');
          } else {
            _this.find('#quick-query-default').removeClass('hide');
            return _this.find('#quick-query-default-is-null').addClass('hide');
          }
        };
      })(this));
      this.find('#quick-query-editor-done, #quick-query-nullable').keydown(function(e) {
        if (e.keyCode === 13) {
          return $(this).click();
        }
      });
      this.find('#quick-query-editor-done').click((function(_this) {
        return function(e) {
          _this.openTextEditor();
          return _this.closest('atom-panel.modal').hide();
        };
      })(this));
      if (this.action !== 'create') {
        this.nameEditor.insertText(this.model.name);
      }
      if (this.model_type === 'column') {
        this.find('.quick-query-column-editor').removeClass('hide');
      }
      if (this.model_type === 'column' && this.action === 'alter') {
        this.datatypeEditor.setText(this.model.datatype);
        this.defaultValueEditor.setText(this.model["default"] || "");
        this.find('#quick-query-null').prop('checked', this.model["default"] == null).change();
        if (this.model.nullable) {
          return this.find('#quick-query-nullable').click();
        }
      }
    };

    QuickQueryEditorView.content = function() {
      return this.div({
        "class": 'quick-query-editor'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'row'
          }, function() {
            return _this.div({
              "class": 'col-sm-12'
            }, function() {
              _this.label('name');
              return _this.currentBuilder.tag('atom-text-editor', {
                id: 'quick-query-editor-name',
                "class": 'editor',
                mini: 'mini'
              });
            });
          });
          _this.div({
            "class": 'row quick-query-column-editor hide'
          }, function() {
            _this.div({
              "class": 'col-sm-6'
            }, function() {
              _this.label('type');
              return _this.subview('selectDataType', new SelectDataType());
            });
            _this.div({
              "class": 'col-sm-2'
            }, function() {
              _this.label('nullable');
              return _this.button({
                id: 'quick-query-nullable',
                "class": 'btn'
              }, 'NO');
            });
            _this.div({
              "class": 'col-sm-3'
            }, function() {
              _this.label('default');
              _this.currentBuilder.tag('atom-text-editor', {
                id: 'quick-query-default',
                "class": 'editor',
                mini: 'mini'
              });
              return _this.div({
                id: 'quick-query-default-is-null',
                "class": 'hide'
              }, "Null");
            });
            return _this.div({
              "class": 'col-sm-1'
            }, function() {
              return _this.input({
                id: 'quick-query-null',
                type: 'checkbox',
                style: "margin-top:24px;"
              });
            });
          });
          return _this.div({
            "class": 'row'
          }, function() {
            return _this.div({
              "class": 'col-sm-12'
            }, function() {
              return _this.button('Done', {
                id: 'quick-query-editor-done',
                "class": 'btn btn-default icon icon-check'
              });
            });
          });
        };
      })(this));
    };

    QuickQueryEditorView.prototype.openTextEditor = function() {
      var comment, editText;
      comment = "-- Check the sentence before execute it\n" + "-- This editor will close after you run the sentence \n";
      editText = (function() {
        switch (this.action) {
          case 'create':
            return this.getCreateText();
          case 'alter':
            return this.getAlterText();
          case 'drop':
            return this.getDropText();
        }
      }).call(this);
      if (editText !== '') {
        return atom.workspace.open().then((function(_this) {
          return function(editor) {
            atom.textEditors.setGrammarOverride(editor, 'source.sql');
            editor.insertText(comment + editText);
            return _this.editor = editor;
          };
        })(this));
      }
    };

    QuickQueryEditorView.prototype.getCreateText = function() {
      var datatype, defaultValue, info, newName, nullable;
      newName = this.nameEditor.getText();
      switch (this.model_type) {
        case 'database':
          info = {
            name: newName
          };
          return this.model.createDatabase(this.model, info);
        case 'table':
          info = {
            name: newName
          };
          return this.model.connection.createTable(this.model, info);
        case 'schema':
          info = {
            name: newName
          };
          return this.model.connection.createSchema(this.model, info);
        case 'column':
          datatype = this.datatypeEditor.getText();
          nullable = this.find('#quick-query-nullable').hasClass('selected');
          defaultValue = this.find('#quick-query-null').is(':checked') ? null : this.defaultValueEditor.getText();
          info = {
            name: newName,
            datatype: datatype,
            nullable: nullable,
            "default": defaultValue
          };
          return this.model.connection.createColumn(this.model, info);
      }
    };

    QuickQueryEditorView.prototype.getAlterText = function() {
      var datatype, defaultValue, delta, newName, nullable;
      newName = this.nameEditor.getText();
      switch (this.model_type) {
        case 'table':
          delta = {
            old_name: this.model.name,
            new_name: newName
          };
          return this.model.connection.alterTable(this.model, delta);
        case 'column':
          datatype = this.datatypeEditor.getText();
          nullable = this.find('#quick-query-nullable').hasClass('selected');
          defaultValue = this.find('#quick-query-null').is(':checked') ? null : this.defaultValueEditor.getText();
          delta = {
            old_name: this.model.name,
            new_name: newName,
            datatype: datatype,
            nullable: nullable,
            "default": defaultValue
          };
          return this.model.connection.alterColumn(this.model, delta);
      }
    };

    QuickQueryEditorView.prototype.getDropText = function() {
      switch (this.model_type) {
        case 'database':
          return this.model.connection.dropDatabase(this.model);
        case 'schema':
          return this.model.connection.dropSchema(this.model);
        case 'table':
          return this.model.connection.dropTable(this.model);
        case 'column':
          return this.model.connection.dropColumn(this.model);
      }
    };

    QuickQueryEditorView.prototype.getColumnInfo = function() {};

    QuickQueryEditorView.prototype.focusFirst = function() {
      return setTimeout(((function(_this) {
        return function() {
          return _this.find('#quick-query-editor-name').focus();
        };
      })(this)), 10);
    };

    return QuickQueryEditorView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL3F1aWNrLXF1ZXJ5L2xpYi9xdWljay1xdWVyeS1lZGl0b3Itdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGtFQUFBO0lBQUE7OztFQUFBLE1BQThCLE9BQUEsQ0FBUSxzQkFBUixDQUE5QixFQUFDLGVBQUQsRUFBTyxtQ0FBUCxFQUF5Qjs7RUFHbkI7Ozs7Ozs7NkJBQ0osVUFBQSxHQUFZLFNBQUE7TUFDVixnREFBQSxTQUFBO01BQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQUE7TUFDQSxJQUFDLENBQUEsZ0JBQWdCLENBQUMsS0FBbEIsQ0FBd0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLENBQUQ7aUJBQ3RCLEtBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFBO1FBRHNCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QjthQUVBLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxJQUFsQixDQUF1QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRDtpQkFDckIsS0FBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQUE7UUFEcUI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZCO0lBTFU7OzZCQU9aLFdBQUEsR0FBYSxTQUFDLElBQUQ7YUFDVixPQUFBLEdBQVEsSUFBUixHQUFhO0lBREg7OzZCQUViLFNBQUEsR0FBVyxTQUFDLElBQUQ7TUFDVCxJQUFDLENBQUEsZ0JBQWdCLENBQUMsUUFBbEIsQ0FBQSxDQUE0QixDQUFDLE9BQTdCLENBQXFDLElBQXJDO2FBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQUE7SUFGUzs7NkJBR1gsUUFBQSxHQUFVLFNBQUMsT0FBRDs7UUFBQyxVQUFROztJQUFUOzs2QkFFVixNQUFBLEdBQVEsU0FBQSxHQUFBOzs7O0tBZm1COztFQWlCN0Is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LEVBQVUsUUFIVjtZQUlBLENBQUEsT0FBQSxDQUFBLEVBQVMsWUFKVDs7aUJBS0YsSUFBQyxDQUFBLEtBQUssQ0FBQyxVQUFVLENBQUMsV0FBbEIsQ0FBOEIsSUFBQyxDQUFBLEtBQS9CLEVBQXFDLEtBQXJDO0FBakJKO0lBRlk7O21DQXFCZCxXQUFBLEdBQWEsU0FBQTtBQUNYLGNBQU8sSUFBQyxDQUFBLFVBQVI7QUFBQSxhQUNPLFVBRFA7aUJBRUksSUFBQyxDQUFBLEtBQUssQ0FBQyxVQUFVLENBQUMsWUFBbEIsQ0FBK0IsSUFBQyxDQUFBLEtBQWhDO0FBRkosYUFHTyxRQUhQO2lCQUlJLElBQUMsQ0FBQSxLQUFLLENBQUMsVUFBVSxDQUFDLFVBQWxCLENBQTZCLElBQUMsQ0FBQSxLQUE5QjtBQUpKLGFBS08sT0FMUDtpQkFNSSxJQUFDLENBQUEsS0FBSyxDQUFDLFVBQVUsQ0FBQyxTQUFsQixDQUE0QixJQUFDLENBQUEsS0FBN0I7QUFOSixhQU9PLFFBUFA7aUJBUUksSUFBQyxDQUFBLEtBQUssQ0FBQyxVQUFVLENBQUMsVUFBbEIsQ0FBNkIsSUFBQyxDQUFBLEtBQTlCO0FBUko7SUFEVzs7bUNBV2IsYUFBQSxHQUFlLFNBQUEsR0FBQTs7bUNBRWYsVUFBQSxHQUFZLFNBQUE7YUFDVixVQUFBLENBQVcsQ0FBQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLElBQUQsQ0FBTSwwQkFBTixDQUFpQyxDQUFDLEtBQWxDLENBQUE7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBRCxDQUFYLEVBQTJELEVBQTNEO0lBRFU7Ozs7S0E1SnFCO0FBckJuQyIsInNvdXJjZXNDb250ZW50IjpbIntWaWV3LCBTZWxlY3RMaXN0VmlldyAgLCAkfSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5cbmNsYXNzIFNlbGVjdERhdGFUeXBlIGV4dGVuZHMgU2VsZWN0TGlzdFZpZXdcbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlclxuICAgIEBsaXN0LmhpZGUoKVxuICAgIEBmaWx0ZXJFZGl0b3JWaWV3LmZvY3VzIChlKT0+XG4gICAgICBAbGlzdC5zaG93KClcbiAgICBAZmlsdGVyRWRpdG9yVmlldy5ibHVyIChlKT0+XG4gICAgICBAbGlzdC5oaWRlKClcbiAgdmlld0Zvckl0ZW06IChpdGVtKSAtPlxuICAgICBcIjxsaT4gI3tpdGVtfSA8L2xpPlwiXG4gIGNvbmZpcm1lZDogKGl0ZW0pIC0+XG4gICAgQGZpbHRlckVkaXRvclZpZXcuZ2V0TW9kZWwoKS5zZXRUZXh0KGl0ZW0pXG4gICAgQGxpc3QuaGlkZSgpXG4gIHNldEVycm9yOiAobWVzc2FnZT0nJykgLT5cbiAgICAjZG8gbm90aGluZ1xuICBjYW5jZWw6IC0+XG4gICAgI2RvIG5vdGhpbmdcbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFF1aWNrUXVlcnlFZGl0b3JWaWV3IGV4dGVuZHMgVmlld1xuXG4gIGVkaXRvcjogbnVsbFxuICBhY3Rpb246IG51bGxcbiAgbW9kZWw6IG51bGxcbiAgbW9kZWxfdHlwZTogbnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoQGFjdGlvbixAbW9kZWwpIC0+XG4gICAgaWYgQGFjdGlvbiA9PSAnY3JlYXRlJ1xuICAgICAgQG1vZGVsX3R5cGUgPSBAbW9kZWwuY2hpbGRfdHlwZVxuICAgIGVsc2VcbiAgICAgIEBtb2RlbF90eXBlID0gQG1vZGVsLnR5cGVcbiAgICBzdXBlclxuXG4gIGluaXRpYWxpemU6IC0+XG5cbiAgICBjb25uZWN0aW9uID0gaWYgQG1vZGVsLnR5cGUgPT0gJ2Nvbm5lY3Rpb24nIHRoZW4gQG1vZGVsIGVsc2UgQG1vZGVsLmNvbm5lY3Rpb25cbiAgICBAc2VsZWN0RGF0YVR5cGUuc2V0SXRlbXMoY29ubmVjdGlvbi5nZXREYXRhVHlwZXMoKSlcblxuICAgIEBuYW1lRWRpdG9yID0gQGZpbmQoJyNxdWljay1xdWVyeS1lZGl0b3ItbmFtZScpWzBdLmdldE1vZGVsKClcbiAgICAjIEBkYXRhdHlwZUVkaXRvciA9IEBmaW5kKCcjcXVpY2stcXVlcnktZGF0YXR5cGUnKVswXS5nZXRNb2RlbCgpXG4gICAgQGRhdGF0eXBlRWRpdG9yID0gQHNlbGVjdERhdGFUeXBlLmZpbHRlckVkaXRvclZpZXcuZ2V0TW9kZWwoKTtcbiAgICBAZGVmYXVsdFZhbHVlRWRpdG9yID0gQGZpbmQoJyNxdWljay1xdWVyeS1kZWZhdWx0JylbMF0uZ2V0TW9kZWwoKVxuXG4gICAgQGZpbmQoJyNxdWljay1xdWVyeS1udWxsYWJsZScpLmNsaWNrIChlKSAtPlxuICAgICAgICAgICQodGhpcykudG9nZ2xlQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgICAgICAkKHRoaXMpLmh0bWwoaWYgJCh0aGlzKS5oYXNDbGFzcygnc2VsZWN0ZWQnKSB0aGVuICdZRVMnIGVsc2UgJ05PJylcblxuICAgIEBmaW5kKCcjcXVpY2stcXVlcnktbnVsbCcpLmNoYW5nZSAoZSkgPT5cbiAgICAgICRudWxsID0gJChlLmN1cnJlbnRUYXJnZXQpXG4gICAgICBpZiAkbnVsbC5pcygnOmNoZWNrZWQnKVxuICAgICAgICBAZmluZCgnI3F1aWNrLXF1ZXJ5LWRlZmF1bHQnKS5hZGRDbGFzcygnaGlkZScpXG4gICAgICAgIEBmaW5kKCcjcXVpY2stcXVlcnktZGVmYXVsdC1pcy1udWxsJykucmVtb3ZlQ2xhc3MoJ2hpZGUnKVxuICAgICAgZWxzZVxuICAgICAgICBAZmluZCgnI3F1aWNrLXF1ZXJ5LWRlZmF1bHQnKS5yZW1vdmVDbGFzcygnaGlkZScpXG4gICAgICAgIEBmaW5kKCcjcXVpY2stcXVlcnktZGVmYXVsdC1pcy1udWxsJykuYWRkQ2xhc3MoJ2hpZGUnKVxuXG4gICAgQGZpbmQoJyNxdWljay1xdWVyeS1lZGl0b3ItZG9uZSwgI3F1aWNrLXF1ZXJ5LW51bGxhYmxlJykua2V5ZG93biAoZSkgLT5cbiAgICAgICQodGhpcykuY2xpY2soKSBpZiBlLmtleUNvZGUgPT0gMTNcbiAgICBAZmluZCgnI3F1aWNrLXF1ZXJ5LWVkaXRvci1kb25lJykuY2xpY2sgKGUpID0+XG4gICAgICBAb3BlblRleHRFZGl0b3IoKVxuICAgICAgQGNsb3Nlc3QoJ2F0b20tcGFuZWwubW9kYWwnKS5oaWRlKClcblxuICAgIGlmIEBhY3Rpb24gIT0gJ2NyZWF0ZSdcbiAgICAgIEBuYW1lRWRpdG9yLmluc2VydFRleHQoQG1vZGVsLm5hbWUpXG5cbiAgICBpZiBAbW9kZWxfdHlwZSA9PSAnY29sdW1uJ1xuICAgICAgQGZpbmQoJy5xdWljay1xdWVyeS1jb2x1bW4tZWRpdG9yJykucmVtb3ZlQ2xhc3MoJ2hpZGUnKVxuICAgIGlmIEBtb2RlbF90eXBlID09ICdjb2x1bW4nICYmIEBhY3Rpb24gPT0gJ2FsdGVyJ1xuICAgICAgQGRhdGF0eXBlRWRpdG9yLnNldFRleHQoQG1vZGVsLmRhdGF0eXBlKVxuICAgICAgQGRlZmF1bHRWYWx1ZUVkaXRvci5zZXRUZXh0KEBtb2RlbC5kZWZhdWx0IHx8IFwiXCIpXG4gICAgICBAZmluZCgnI3F1aWNrLXF1ZXJ5LW51bGwnKS5wcm9wKCdjaGVja2VkJywgIUBtb2RlbC5kZWZhdWx0PykuY2hhbmdlKClcbiAgICAgIGlmIEBtb2RlbC5udWxsYWJsZVxuICAgICAgICBAZmluZCgnI3F1aWNrLXF1ZXJ5LW51bGxhYmxlJykuY2xpY2soKVxuXG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6ICdxdWljay1xdWVyeS1lZGl0b3InICwgPT5cbiAgICAgIEBkaXYgY2xhc3M6ICdyb3cnLCA9PlxuICAgICAgICBAZGl2IGNsYXNzOiAnY29sLXNtLTEyJyAsID0+XG4gICAgICAgICAgQGxhYmVsICduYW1lJ1xuICAgICAgICAgIEBjdXJyZW50QnVpbGRlci50YWcgJ2F0b20tdGV4dC1lZGl0b3InLCBpZDogJ3F1aWNrLXF1ZXJ5LWVkaXRvci1uYW1lJyAsIGNsYXNzOiAnZWRpdG9yJywgbWluaTogJ21pbmknXG4gICAgICBAZGl2IGNsYXNzOiAncm93IHF1aWNrLXF1ZXJ5LWNvbHVtbi1lZGl0b3IgaGlkZScsID0+XG4gICAgICAgIEBkaXYgY2xhc3M6ICdjb2wtc20tNicgLCA9PlxuICAgICAgICAgIEBsYWJlbCAndHlwZSdcbiAgICAgICAgICAjIEBjdXJyZW50QnVpbGRlci50YWcgJ2F0b20tdGV4dC1lZGl0b3InLCBpZDogJ3F1aWNrLXF1ZXJ5LWRhdGF0eXBlJyAsIGNsYXNzOiAnZWRpdG9yJywgbWluaTogJ21pbmknXG4gICAgICAgICAgQHN1YnZpZXcgJ3NlbGVjdERhdGFUeXBlJywgbmV3IFNlbGVjdERhdGFUeXBlKClcbiAgICAgICAgQGRpdiBjbGFzczogJ2NvbC1zbS0yJyAsID0+XG4gICAgICAgICAgQGxhYmVsICdudWxsYWJsZSdcbiAgICAgICAgICBAYnV0dG9uIGlkOidxdWljay1xdWVyeS1udWxsYWJsZScsY2xhc3M6ICdidG4nICwnTk8nXG4gICAgICAgIEBkaXYgY2xhc3M6ICdjb2wtc20tMycgLCA9PlxuICAgICAgICAgIEBsYWJlbCAnZGVmYXVsdCdcbiAgICAgICAgICBAY3VycmVudEJ1aWxkZXIudGFnICdhdG9tLXRleHQtZWRpdG9yJywgaWQ6ICdxdWljay1xdWVyeS1kZWZhdWx0JyAsIGNsYXNzOiAnZWRpdG9yJywgbWluaTogJ21pbmknXG4gICAgICAgICAgQGRpdiBpZDogJ3F1aWNrLXF1ZXJ5LWRlZmF1bHQtaXMtbnVsbCcgLGNsYXNzOidoaWRlJyAsIFwiTnVsbFwiXG4gICAgICAgIEBkaXYgY2xhc3M6ICdjb2wtc20tMScgLCA9PlxuICAgICAgICAgIEBpbnB1dCAgaWQ6ICdxdWljay1xdWVyeS1udWxsJywgdHlwZTogJ2NoZWNrYm94JyAsIHN0eWxlOiBcIm1hcmdpbi10b3A6MjRweDtcIlxuICAgICAgQGRpdiBjbGFzczogJ3JvdycsID0+XG4gICAgICAgIEBkaXYgY2xhc3M6ICdjb2wtc20tMTInLCA9PlxuICAgICAgICAgIEBidXR0b24gJ0RvbmUnLCBpZDogJ3F1aWNrLXF1ZXJ5LWVkaXRvci1kb25lJyAsIGNsYXNzOiAnYnRuIGJ0bi1kZWZhdWx0IGljb24gaWNvbi1jaGVjaydcblxuXG4gIG9wZW5UZXh0RWRpdG9yOiAoKS0+XG4gICAgY29tbWVudCAgPSBcIi0tIENoZWNrIHRoZSBzZW50ZW5jZSBiZWZvcmUgZXhlY3V0ZSBpdFxcblwiK1xuICAgICAgICAgICAgICAgXCItLSBUaGlzIGVkaXRvciB3aWxsIGNsb3NlIGFmdGVyIHlvdSBydW4gdGhlIHNlbnRlbmNlIFxcblwiXG4gICAgZWRpdFRleHQgPSBzd2l0Y2ggQGFjdGlvblxuICAgICAgd2hlbiAnY3JlYXRlJ1xuICAgICAgICBAZ2V0Q3JlYXRlVGV4dCgpXG4gICAgICB3aGVuICdhbHRlcidcbiAgICAgICAgQGdldEFsdGVyVGV4dCgpXG4gICAgICB3aGVuICdkcm9wJ1xuICAgICAgICBAZ2V0RHJvcFRleHQoKVxuICAgIGlmIGVkaXRUZXh0ICE9ICcnXG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCkudGhlbiAoZWRpdG9yKSA9PlxuICAgICAgICBhdG9tLnRleHRFZGl0b3JzLnNldEdyYW1tYXJPdmVycmlkZShlZGl0b3IsICdzb3VyY2Uuc3FsJylcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoY29tbWVudCtlZGl0VGV4dClcbiAgICAgICAgQGVkaXRvciA9IGVkaXRvclxuXG4gIGdldENyZWF0ZVRleHQ6ICgpLT5cbiAgICBuZXdOYW1lPSBAbmFtZUVkaXRvci5nZXRUZXh0KClcbiAgICBzd2l0Y2ggQG1vZGVsX3R5cGVcbiAgICAgIHdoZW4gJ2RhdGFiYXNlJ1xuICAgICAgICBpbmZvID0ge25hbWU6IG5ld05hbWUgfVxuICAgICAgICBAbW9kZWwuY3JlYXRlRGF0YWJhc2UoQG1vZGVsLGluZm8pXG4gICAgICB3aGVuICd0YWJsZSdcbiAgICAgICAgaW5mbyA9IHtuYW1lOiBuZXdOYW1lIH1cbiAgICAgICAgQG1vZGVsLmNvbm5lY3Rpb24uY3JlYXRlVGFibGUoQG1vZGVsLGluZm8pXG4gICAgICB3aGVuICdzY2hlbWEnXG4gICAgICAgIGluZm8gPSB7bmFtZTogbmV3TmFtZSB9XG4gICAgICAgIEBtb2RlbC5jb25uZWN0aW9uLmNyZWF0ZVNjaGVtYShAbW9kZWwsaW5mbylcbiAgICAgIHdoZW4gJ2NvbHVtbidcbiAgICAgICAgZGF0YXR5cGUgPSBAZGF0YXR5cGVFZGl0b3IuZ2V0VGV4dCgpXG4gICAgICAgIG51bGxhYmxlID0gQGZpbmQoJyNxdWljay1xdWVyeS1udWxsYWJsZScpLmhhc0NsYXNzKCdzZWxlY3RlZCcpXG4gICAgICAgIGRlZmF1bHRWYWx1ZSA9IGlmIEBmaW5kKCcjcXVpY2stcXVlcnktbnVsbCcpLmlzKCc6Y2hlY2tlZCcpXG4gICAgICAgICAgbnVsbFxuICAgICAgICBlbHNlXG4gICAgICAgICAgQGRlZmF1bHRWYWx1ZUVkaXRvci5nZXRUZXh0KClcbiAgICAgICAgaW5mbyA9XG4gICAgICAgICAgbmFtZTogbmV3TmFtZSAsXG4gICAgICAgICAgZGF0YXR5cGU6IGRhdGF0eXBlICxcbiAgICAgICAgICBudWxsYWJsZTogbnVsbGFibGUsXG4gICAgICAgICAgZGVmYXVsdDogZGVmYXVsdFZhbHVlXG4gICAgICAgIEBtb2RlbC5jb25uZWN0aW9uLmNyZWF0ZUNvbHVtbihAbW9kZWwsaW5mbylcblxuICBnZXRBbHRlclRleHQ6ICgpLT5cbiAgICBuZXdOYW1lPSBAbmFtZUVkaXRvci5nZXRUZXh0KClcbiAgICBzd2l0Y2ggQG1vZGVsX3R5cGVcbiAgICAgIHdoZW4gJ3RhYmxlJ1xuICAgICAgICBkZWx0YSA9IHsgb2xkX25hbWU6IEBtb2RlbC5uYW1lICwgbmV3X25hbWU6IG5ld05hbWUgfVxuICAgICAgICBAbW9kZWwuY29ubmVjdGlvbi5hbHRlclRhYmxlKEBtb2RlbCxkZWx0YSlcbiAgICAgIHdoZW4gJ2NvbHVtbidcbiAgICAgICAgZGF0YXR5cGUgPSBAZGF0YXR5cGVFZGl0b3IuZ2V0VGV4dCgpXG4gICAgICAgIG51bGxhYmxlID0gQGZpbmQoJyNxdWljay1xdWVyeS1udWxsYWJsZScpLmhhc0NsYXNzKCdzZWxlY3RlZCcpXG4gICAgICAgIGRlZmF1bHRWYWx1ZSA9IGlmIEBmaW5kKCcjcXVpY2stcXVlcnktbnVsbCcpLmlzKCc6Y2hlY2tlZCcpXG4gICAgICAgICAgbnVsbFxuICAgICAgICBlbHNlXG4gICAgICAgICAgQGRlZmF1bHRWYWx1ZUVkaXRvci5nZXRUZXh0KClcbiAgICAgICAgZGVsdGEgPVxuICAgICAgICAgIG9sZF9uYW1lOiBAbW9kZWwubmFtZSAsXG4gICAgICAgICAgbmV3X25hbWU6IG5ld05hbWUgLFxuICAgICAgICAgIGRhdGF0eXBlOiBkYXRhdHlwZSAsXG4gICAgICAgICAgbnVsbGFibGU6IG51bGxhYmxlLFxuICAgICAgICAgIGRlZmF1bHQ6IGRlZmF1bHRWYWx1ZVxuICAgICAgICBAbW9kZWwuY29ubmVjdGlvbi5hbHRlckNvbHVtbihAbW9kZWwsZGVsdGEpXG5cbiAgZ2V0RHJvcFRleHQ6ICgpLT5cbiAgICBzd2l0Y2ggQG1vZGVsX3R5cGVcbiAgICAgIHdoZW4gJ2RhdGFiYXNlJ1xuICAgICAgICBAbW9kZWwuY29ubmVjdGlvbi5kcm9wRGF0YWJhc2UoQG1vZGVsKVxuICAgICAgd2hlbiAnc2NoZW1hJ1xuICAgICAgICBAbW9kZWwuY29ubmVjdGlvbi5kcm9wU2NoZW1hKEBtb2RlbClcbiAgICAgIHdoZW4gJ3RhYmxlJ1xuICAgICAgICBAbW9kZWwuY29ubmVjdGlvbi5kcm9wVGFibGUoQG1vZGVsKVxuICAgICAgd2hlbiAnY29sdW1uJ1xuICAgICAgICBAbW9kZWwuY29ubmVjdGlvbi5kcm9wQ29sdW1uKEBtb2RlbClcblxuICBnZXRDb2x1bW5JbmZvOiAtPlxuXG4gIGZvY3VzRmlyc3Q6IC0+XG4gICAgc2V0VGltZW91dCgoPT4gQGZpbmQoJyNxdWljay1xdWVyeS1lZGl0b3ItbmFtZScpLmZvY3VzKCkpICwxMClcbiJdfQ==
