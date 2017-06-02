(function() {
  var langdef, langmap;

  langdef = {
    All: [
      {
        re: /#nav-mark:(.*)/i,
        id: '%1',
        kind: 'Markers'
      }, {
        re: /(#|\/\/)[ \t]*todos:(.*)/i,
        id: '%2',
        kind: 'Todo'
      }
    ],
    CoffeeScript: [
      {
        re: /^[ \t]*class[ \t]*([a-zA-Z$_\.0-9]+)(?:[ \t]|$)/,
        id: '%1',
        kind: 'Class'
      }, {
        re: /^[ \t]*(@?[a-zA-Z$_\.0-9]+)[ \t]*(?:=|\:)[ \t]*(\(.*\))?[ \t]*(?:-|=)>/,
        id: '%1',
        kind: 'Function'
      }, {
        re: /^[ \t]*([a-zA-Z$_0-9]+\:\:[a-zA-Z$_\.0-9]+)[ \t]*(=|\:)[ \t]*(\(.*\))?[ \t]*(-|=)>/,
        id: '%1',
        kind: 'Function'
      }, {
        re: /^[ \t]*(@?[a-zA-Z$_\.0-9]+)[ \t]*[:=][^>]*$/,
        id: '%1',
        kind: 'Variable'
      }
    ],
    Ruby: [
      {
        re: /^[\t ]*([A-Z][-_A-Za-z0-9]*::)*([A-Z][-_A-Za-z0-9]*)[\t ]*=/,
        id: '%2',
        kind: 'Constant'
      }, {
        re: /^[ \t]*([A-Z_][A-Z0-9_]*)[ \t]*=/,
        id: '%1',
        kind: 'Constant'
      }, {
        re: /^[ \t]*describe (.*) do/,
        id: '%1',
        kind: 'Rspec describe'
      }, {
        re: /^[ \t]*context ['"](.*)['"] do/,
        id: '%1',
        kind: 'Rspec context'
      }, {
        re: /^[ \t]*def[ \t]([_a-zA-Z]*)/i,
        id: '%1',
        kind: 'Functions'
      }
    ],
    php: [
      {
        re: /^[ \t]*const[ \t]*([a-zA-Z]+[^=]*=.*);/i,
        id: '%1',
        kind: 'Class'
      }, {
        re: /^[ \t]*((var|protected|private|public|static).*);/i,
        id: '%1',
        kind: 'Properties'
      }, {
        re: /^([_a-zA-Z \t]*)function (.*)/i,
        id: '%2',
        kind: 'Functions'
      }, {
        re: /^([_a-zA-Z \t]*)protected.+function (.*)/i,
        id: '%2',
        kind: 'Protected Methods'
      }, {
        re: /^([_a-zA-Z \t]*)private.+function (.*)/i,
        id: '%2',
        kind: 'Private Methods'
      }, {
        re: /^([_a-zA-Z \t]*)public.+function (.*)/i,
        id: '%2',
        kind: 'Public Methods'
      }
    ],
    Css: [
      {
        re: /^[ \t]*(.+)[ \t]*\{/,
        id: '%1',
        kind: 'Selector'
      }, {
        re: /^[ \t]*(.+)[ \t]*,[ \t]*$/,
        id: '%1',
        kind: 'Selector'
      }, {
        re: /^[ \t]*[@$]([a-zA-Z$_][-a-zA-Z$_0-9]*)[ \t]*:/,
        id: '%1',
        kind: 'Selector'
      }
    ],
    Sass: [
      {
        re: /^[ \t]*([#.]*[a-zA-Z_0-9]+)[ \t]*$/,
        id: '%1',
        kind: 'Function'
      }
    ],
    Yaml: [
      {
        re: /^[ \t]*([a-zA-Z_0-9 ]+)[ \t]*\:[ \t]*/,
        id: '%1',
        kind: 'Function'
      }
    ],
    Html: [
      {
        re: /^[ \t]*<([a-zA-Z]+)[ \t]*.*>/,
        id: '%1',
        kind: 'Function'
      }
    ],
    Markdown: [
      {
        re: /^#+[ \t]*([^#]+)/,
        id: '%1',
        kind: 'Function'
      }
    ],
    Json: [
      {
        re: /^[ \t]*"([^"]+)"[ \t]*\:/,
        id: '%1',
        kind: 'Field'
      }
    ],
    Cson: [
      {
        re: /^[ \t]*'([^']+)'[ \t]*\:/,
        id: '%1',
        kind: 'Field'
      }, {
        re: /^[ \t]*"([^"]+)"[ \t]*\:/,
        id: '%1',
        kind: 'Field'
      }, {
        re: /^[ \t]*([^'"#]+)[ \t]*\:/,
        id: '%1',
        kind: 'Field'
      }
    ],
    Go: [
      {
        re: /func([ \t]+\([^)]+\))?[ \t]+([a-zA-Z0-9_]+)/,
        id: '%2',
        kind: 'Func'
      }, {
        re: /var[ \t]+([a-zA-Z_][a-zA-Z0-9_]*)/,
        id: '%1',
        kind: 'Var'
      }, {
        re: /type[ \t]+([a-zA-Z_][a-zA-Z0-9_]*)/,
        id: '%1',
        kind: 'Type'
      }
    ],
    Capnp: [
      {
        re: /struct[ \t]+([A-Za-z]+)/,
        id: '%1',
        kind: 'Struct'
      }, {
        re: /enum[ \t]+([A-Za-z]+)/,
        id: '%1',
        kind: 'Enum'
      }, {
        re: /using[ \t]+([A-Za-z]+)[ \t]+=[ \t]+import/,
        id: '%1',
        kind: 'Using'
      }, {
        re: /const[ \t]+([A-Za-z]+)/,
        id: '%1',
        kind: 'Const'
      }
    ],
    perl: [
      {
        re: /with[ \t]+([^;]+)[ \t]*?;/,
        id: '%1',
        kind: 'Role'
      }, {
        re: /extends[ \t]+['"]([^'"]+)['"][ \t]*?;/,
        id: '%1',
        kind: 'Extends'
      }, {
        re: /use[ \t]+base[ \t]+['"]([^'"]+)['"][ \t]*?;/,
        id: '%1',
        kind: 'Extends'
      }, {
        re: /use[ \t]+parent[ \t]+['"]([^'"]+)['"][ \t]*?;/,
        id: '%1',
        kind: 'Extends'
      }, {
        re: /Mojo::Base[ \t]+['"]([^'"]+)['"][ \t]*?;/,
        id: '%1',
        kind: 'Extends'
      }, {
        re: /^[ \t]*?use[ \t]+([^;]+)[ \t]*?;/,
        id: '%1',
        kind: 'Use'
      }, {
        re: /^[ \t]*?require[ \t]+((\w|\:)+)/,
        id: '%1',
        kind: 'Require'
      }, {
        re: /^[ \t]*?has[ \t]+['"]?(\w+)['"]?/,
        id: '%1',
        kind: 'Attribute'
      }, {
        re: /^[ \t]*?\*(\w+)[ \t]*?=/,
        id: '%1',
        kind: 'Alias'
      }, {
        re: /->helper\([ \t]?['"]?(\w+)['"]?/,
        id: '%1',
        kind: 'Helper'
      }, {
        re: /^[ \t]*?our[ \t]*?[\$@%](\w+)/,
        id: '%1',
        kind: 'Our'
      }, {
        re: /^\=head1[ \t]+(.+)/,
        id: '%1',
        kind: 'Plain Old Doc'
      }, {
        re: /^\=head2[ \t]+(.+)/,
        id: '-- %1',
        kind: 'Plain Old Doc'
      }, {
        re: /^\=head[3-5][ \t]+(.+)/,
        id: '---- %1',
        kind: 'Plain Old Doc'
      }
    ],
    JavaScript: [
      {
        re: /(,|(;|^)[ \t]*(var|let|([A-Za-z_$][A-Za-z0-9_$.]*\.)*))[ \t]*([A-Za-z0-9_$]+)[ \t]*=[ \t]*function[ \t]*\(/,
        id: '%5',
        kind: 'Function'
      }, {
        re: /function[ \t]+([A-Za-z0-9_$]+)[ \t]*\([^)]*\)/,
        id: '%1',
        kind: 'Function'
      }, {
        re: /(,|^|\*\/)[ \t]*([A-Za-z_$][A-Za-z0-9_$]+)[ \t]*:[ \t]*function[ \t]*\(/,
        id: '%2',
        kind: 'Function'
      }, {
        re: /(,|^|\*\/)[ \t]*get[ \t]+([A-Za-z_$][A-Za-z0-9_$]+)[ \t]*\([ \t]*\)[ \t]*\{/,
        id: 'get %2',
        kind: 'Function'
      }, {
        re: /(,|^|\*\/)[ \t]*set[ \t]+([A-Za-z_$][A-Za-z0-9_$]+)[ \t]*\([ \t]*([A-Za-z_$][A-Za-z0-9_$]+)?[ \t]*\)[ \t]*\{/,
        id: 'set %2',
        kind: 'Function'
      }
    ],
    haxe: [
      {
        re: /^package[ \t]+([A-Za-z0-9_.]+)/,
        id: '%1',
        kind: 'Package'
      }, {
        re: /^[ \t]*[(@:macro|private|public|static|override|inline|dynamic)( \t)]*function[ \t]+([A-Za-z0-9_]+)/,
        id: '%1',
        kind: 'Function'
      }, {
        re: /^[ \t]*([private|public|static|protected|inline][ \t]*)+var[ \t]+([A-Za-z0-9_]+)/,
        id: '%2',
        kind: 'Variable'
      }, {
        re: /^[ \t]*package[ \t]*([A-Za-z0-9_]+)/,
        id: '%1',
        kind: 'Package'
      }, {
        re: /^[ \t]*(extern[ \t]*|@:native\([^)]*\)[ \t]*)*class[ \t]+([A-Za-z0-9_]+)[ \t]*[^\{]*/,
        id: '%2',
        kind: 'Class'
      }, {
        re: /^[ \t]*(extern[ \t]+)?interface[ \t]+([A-Za-z0-9_]+)/,
        id: '%2',
        kind: 'Interface'
      }, {
        re: /^[ \t]*typedef[ \t]+([A-Za-z0-9_]+)/,
        id: '%1',
        kind: 'Typedef'
      }, {
        re: /^[ \t]*enum[ \t]+([A-Za-z0-9_]+)/,
        id: '%1',
        kind: 'Typedef'
      }
    ],
    Elixir: [
      {
        re: /^[ \t]*def(p?)[ \t]+([a-z_][a-zA-Z0-9_?!]*)/,
        id: '%2',
        kind: 'Functions (def ...)'
      }, {
        re: /^[ \t]*defcallback[ \t]+([a-z_][a-zA-Z0-9_?!]*)/,
        id: '%1',
        kind: 'Callbacks (defcallback ...)'
      }, {
        re: /^[ \t]*defdelegate[ \t]+([a-z_][a-zA-Z0-9_?!]*)/,
        id: '%1',
        kind: 'Delegates (defdelegate ...)'
      }, {
        re: /^[ \t]*defexception[ \t]+([A-Z][a-zA-Z0-9_]*\.)*([A-Z][a-zA-Z0-9_?!]*)/,
        id: '%2',
        kind: 'Exceptions (defexception ...)'
      }, {
        re: /^[ \t]*defimpl[ \t]+([A-Z][a-zA-Z0-9_]*\.)*([A-Z][a-zA-Z0-9_?!]*)/,
        id: '%2',
        kind: 'Implementations (defimpl ...)'
      }, {
        re: /^[ \t]*defmacro(p?)[ \t]+([a-z_][a-zA-Z0-9_?!]*)\(/,
        id: '%2',
        kind: 'Macros (defmacro ...)'
      }, {
        re: /^[ \t]*defmacro(p?)[ \t]+([a-zA-Z0-9_?!]+)?[ \t]+([^ \tA-Za-z0-9_]+)[ \t]*[a-zA-Z0-9_!?!]/,
        id: '%3',
        kind: 'Operators (e.g. "defmacro a <<< b")'
      }, {
        re: /^[ \t]*defmodule[ \t]+([A-Z][a-zA-Z0-9_]*\.)*([A-Z][a-zA-Z0-9_?!]*)/,
        id: '%2',
        kind: 'Modules (defmodule ...)'
      }, {
        re: /^[ \t]*defprotocol[ \t]+([A-Z][a-zA-Z0-9_]*\.)*([A-Z][a-zA-Z0-9_?!]*)/,
        id: '%2',
        kind: 'Protocols (defprotocol...)'
      }, {
        re: /^[ \t]*Record\.defrecord[ \t]+:([a-zA-Z0-9_]+)/,
        id: '%1',
        kind: 'Records (defrecord...)'
      }
    ],
    Nim: [
      {
        re: /^[\t\s]*proc\s+([_A-Za-z0-9]+)\**(\[\w+(\:\s+\w+)?\])?\s*\(/,
        id: '%1',
        kind: 'Function'
      }, {
        re: /^[\t\s]*iterator\s+([_A-Za-z0-9]+)\**(\[\w+(\:\s+\w+)?\])?\s*\(/,
        id: '%1',
        kind: 'Iterator'
      }, {
        re: /^[\t\s]*macro\s+([_A-Za-z0-9]+)\**(\[\w+(\:\s+\w+)?\])?\s*\(/,
        id: '%1',
        kind: 'Macro'
      }, {
        re: /^[\t\s]*method\s+([_A-Za-z0-9]+)\**(\[\w+(\:\s+\w+)?\])?\s*\(/,
        id: '%1',
        kind: 'Method'
      }, {
        re: /^[\t\s]*template\s+([_A-Za-z0-9]+)\**(\[\w+(\:\s+\w+)?\])?\s*\(/,
        id: '%1',
        kind: 'Generics'
      }, {
        re: /^[\t\s]*converter\s+([_A-Za-z0-9]+)\**(\[\w+(\:\s+\w+)?\])?\s*\(/,
        id: '%1',
        kind: 'Converter'
      }
    ],
    Fountain: [
      {
        re: /^(([iI][nN][tT]|[eE][xX][tT]|[^\w][eE][sS][tT]|\.|[iI]\.?\/[eE]\.?)([^\n]+))/,
        id: '%1',
        kind: 'Function'
      }
    ],
    Julia: [
      {
        re: /^[ \t]*(function|macro|abstract|type|typealias|immutable)[ \t]+([^ \t({[]+).*$/,
        id: '%2',
        kind: 'Function'
      }, {
        re: /^[ \t]*(([^@#$ \t({[]+)|\(([^@#$ \t({[]+)\)|\((\$)\))[ \t]*(\{.*\})?[ \t]*\([^#]*\)[ \t]*=([^=].*$|$)/,
        id: '%2%3%4',
        kind: 'Function'
      }
    ]
  };

  langmap = {
    '.coffee': langdef.CoffeeScript,
    '.litcoffee': langdef.CoffeeScript,
    '.rb': langdef.Ruby,
    'Rakefile': langdef.Ruby,
    '.php': langdef.php,
    '.css': langdef.Css,
    '.less': langdef.Css,
    '.scss': langdef.Css,
    '.sass': langdef.Sass,
    '.yaml': langdef.Yaml,
    '.yml': langdef.Yaml,
    '.md': langdef.Markdown,
    '.markdown': langdef.Markdown,
    '.mdown': langdef.Markdown,
    '.mkd': langdef.Markdown,
    '.mkdown': langdef.Markdown,
    '.ron': langdef.Markdown,
    '.json': langdef.Json,
    '.cson': langdef.Cson,
    '.gyp': langdef.Cson,
    '.go': langdef.Go,
    '.capnp': langdef.Capnp,
    '.pod': langdef.perl,
    '.js': langdef.JavaScript,
    '.hx': langdef.haxe,
    '.ex.exs': langdef.Elixir,
    '.nim': langdef.Nim,
    '.fountain': langdef.Fountain,
    '.ftn': langdef.Fountain,
    '.jl': langdef.Julia
  };

  module.exports = {
    langdef: langdef,
    langmap: langmap
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL25hdi1wYW5lbC1wbHVzL2xpYi9jdGFncy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7QUFBQSxNQUFBOztFQUFBLE9BQUEsR0FDRTtJQUFBLEdBQUEsRUFBSztNQUNIO1FBQUMsRUFBQSxFQUFJLGlCQUFMO1FBQXdCLEVBQUEsRUFBSSxJQUE1QjtRQUFrQyxJQUFBLEVBQU0sU0FBeEM7T0FERyxFQUVIO1FBQUMsRUFBQSxFQUFJLDJCQUFMO1FBQWtDLEVBQUEsRUFBSSxJQUF0QztRQUE0QyxJQUFBLEVBQU0sTUFBbEQ7T0FGRztLQUFMO0lBSUEsWUFBQSxFQUFjO01BQ1o7UUFBQyxFQUFBLEVBQUksaURBQUw7UUFBd0QsRUFBQSxFQUFJLElBQTVEO1FBQWtFLElBQUEsRUFBTSxPQUF4RTtPQURZLEVBRVo7UUFBQyxFQUFBLEVBQUksd0VBQUw7UUFBK0UsRUFBQSxFQUFJLElBQW5GO1FBQXlGLElBQUEsRUFBTSxVQUEvRjtPQUZZLEVBR1o7UUFBQyxFQUFBLEVBQUksb0ZBQUw7UUFBMkYsRUFBQSxFQUFJLElBQS9GO1FBQXFHLElBQUEsRUFBTSxVQUEzRztPQUhZLEVBSVo7UUFBQyxFQUFBLEVBQUksNkNBQUw7UUFBb0QsRUFBQSxFQUFJLElBQXhEO1FBQThELElBQUEsRUFBTSxVQUFwRTtPQUpZO0tBSmQ7SUFVQSxJQUFBLEVBQU07TUFDSjtRQUFDLEVBQUEsRUFBSSw2REFBTDtRQUFvRSxFQUFBLEVBQUksSUFBeEU7UUFBOEUsSUFBQSxFQUFNLFVBQXBGO09BREksRUFFSjtRQUFDLEVBQUEsRUFBSSxrQ0FBTDtRQUF5QyxFQUFBLEVBQUksSUFBN0M7UUFBbUQsSUFBQSxFQUFNLFVBQXpEO09BRkksRUFHSjtRQUFDLEVBQUEsRUFBSSx5QkFBTDtRQUFnQyxFQUFBLEVBQUksSUFBcEM7UUFBMEMsSUFBQSxFQUFNLGdCQUFoRDtP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QyxRQWZuQjtJQWdCQSxNQUFBLEVBQVEsT0FBTyxDQUFDLFFBaEJoQjtJQWlCQSxPQUFBLEVBQVMsT0FBTyxDQUFDLElBakJqQjtJQWtCQSxPQUFBLEVBQVMsT0FBTyxDQUFDLElBbEJqQjtJQW1CQSxNQUFBLEVBQVEsT0FBTyxDQUFDLElBbkJoQjtJQW9CQSxLQUFBLEVBQU8sT0FBTyxDQUFDLEVBcEJmO0lBcUJBLFFBQUEsRUFBVSxPQUFPLENBQUMsS0FyQmxCO0lBc0JBLE1BQUEsRUFBUSxPQUFPLENBQUMsSUF0QmhCO0lBdUJBLEtBQUEsRUFBTyxPQUFPLENBQUMsVUF2QmY7SUF3QkEsS0FBQSxFQUFPLE9BQU8sQ0FBQyxJQXhCZjtJQXlCQSxTQUFBLEVBQVcsT0FBTyxDQUFDLE1BekJuQjtJQTBCQSxNQUFBLEVBQVEsT0FBTyxDQUFDLEdBMUJoQjtJQTJCQSxXQUFBLEVBQWEsT0FBTyxDQUFDLFFBM0JyQjtJQTRCQSxNQUFBLEVBQVEsT0FBTyxDQUFDLFFBNUJoQjtJQTZCQSxLQUFBLEVBQU8sT0FBTyxDQUFDLEtBN0JmOzs7RUE4QkYsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFBQyxPQUFBLEVBQVMsT0FBVjtJQUFtQixPQUFBLEVBQVMsT0FBNUI7O0FBekpqQiIsInNvdXJjZXNDb250ZW50IjpbIiMgQ3JlYXRlZCBieSBjdGFnczJjb2ZmZWUuY29mZmVlIGJ5IHByb2Nlc3NpbmcgLmN0YWdzXG5sYW5nZGVmID0gXG4gIEFsbDogW1xuICAgIHtyZTogLyNuYXYtbWFyazooLiopL2ksIGlkOiAnJTEnLCBraW5kOiAnTWFya2Vycyd9XG4gICAge3JlOiAvKCN8XFwvXFwvKVsgXFx0XSp0b2RvczooLiopL2ksIGlkOiAnJTInLCBraW5kOiAnVG9kbyd9XG4gIF1cbiAgQ29mZmVlU2NyaXB0OiBbXG4gICAge3JlOiAvXlsgXFx0XSpjbGFzc1sgXFx0XSooW2EtekEtWiRfXFwuMC05XSspKD86WyBcXHRdfCQpLywgaWQ6ICclMScsIGtpbmQ6ICdDbGFzcyd9XG4gICAge3JlOiAvXlsgXFx0XSooQD9bYS16QS1aJF9cXC4wLTldKylbIFxcdF0qKD86PXxcXDopWyBcXHRdKihcXCguKlxcKSk/WyBcXHRdKig/Oi18PSk+LywgaWQ6ICclMScsIGtpbmQ6ICdGdW5jdGlvbid9XG4gICAge3JlOiAvXlsgXFx0XSooW2EtekEtWiRfMC05XStcXDpcXDpbYS16QS1aJF9cXC4wLTldKylbIFxcdF0qKD18XFw6KVsgXFx0XSooXFwoLipcXCkpP1sgXFx0XSooLXw9KT4vLCBpZDogJyUxJywga2luZDogJ0Z1bmN0aW9uJ31cbiAgICB7cmU6IC9eWyBcXHRdKihAP1thLXpBLVokX1xcLjAtOV0rKVsgXFx0XSpbOj1dW14+XSokLywgaWQ6ICclMScsIGtpbmQ6ICdWYXJpYWJsZSd9XG4gIF1cbiAgUnVieTogW1xuICAgIHtyZTogL15bXFx0IF0qKFtBLVpdWy1fQS1aYS16MC05XSo6OikqKFtBLVpdWy1fQS1aYS16MC05XSopW1xcdCBdKj0vLCBpZDogJyUyJywga2luZDogJ0NvbnN0YW50J31cbiAgICB7cmU6IC9eWyBcXHRdKihbQS1aX11bQS1aMC05X10qKVsgXFx0XSo9LywgaWQ6ICclMScsIGtpbmQ6ICdDb25zdGFudCd9XG4gICAge3JlOiAvXlsgXFx0XSpkZXNjcmliZSAoLiopIGRvLywgaWQ6ICclMScsIGtpbmQ6ICdSc3BlYyBkZXNjcmliZSd9XG4gICAge3JlOiAvXlsgXFx0XSpjb250ZXh0IFsnXCJdKC4qKVsnXCJdIGRvLywgaWQ6ICclMScsIGtpbmQ6ICdSc3BlYyBjb250ZXh0J31cbiAgICB7cmU6IC9eWyBcXHRdKmRlZlsgXFx0XShbX2EtekEtWl0qKS9pLCBpZDogJyUxJywga2luZDogJ0Z1bmN0aW9ucyd9XG4gIF1cbiAgcGhwOiBbXG4gICAge3JlOiAvXlsgXFx0XSpjb25zdFsgXFx0XSooW2EtekEtWl0rW149XSo9LiopOy9pLCBpZDogJyUxJywga2luZDogJ0NsYXNzJ31cbiAgICB7cmU6IC9eWyBcXHRdKigodmFyfHByb3RlY3RlZHxwcml2YXRlfHB1YmxpY3xzdGF0aWMpLiopOy9pLCBpZDogJyUxJywga2luZDogJ1Byb3BlcnRpZXMnfVxuICAgIHtyZTogL14oW19hLXpBLVogXFx0XSopZnVuY3Rpb24gKC4qKS9pLCBpZDogJyUyJywga2luZDogJ0Z1bmN0aW9ucyd9XG4gICAge3JlOiAvXihbX2EtekEtWiBcXHRdKilwcm90ZWN0ZWQuK2Z1bmN0aW9uICguKikvaSwgaWQ6ICclMicsIGtpbmQ6ICdQcm90ZWN0ZWQgTWV0aG9kcyd9XG4gICAge3JlOiAvXihbX2EtekEtWiBcXHRdKilwcml2YXRlLitmdW5jdGlvbiAoLiopL2ksIGlkOiAnJTInLCBraW5kOiAnUHJpdmF0ZSBNZXRob2RzJ31cbiAgICB7cmU6IC9eKFtfYS16QS1aIFxcdF0qKXB1YmxpYy4rZnVuY3Rpb24gKC4qKS9pLCBpZDogJyUyJywga2luZDogJ1B1YmxpYyBNZXRob2RzJ31cbiAgXVxuICBDc3M6IFtcbiAgICB7cmU6IC9eWyBcXHRdKiguKylbIFxcdF0qXFx7LywgaWQ6ICclMScsIGtpbmQ6ICdTZWxlY3Rvcid9XG4gICAge3JlOiAvXlsgXFx0XSooLispWyBcXHRdKixbIFxcdF0qJC8sIGlkOiAnJTEnLCBraW5kOiAnU2VsZWN0b3InfVxuICAgIHtyZTogL15bIFxcdF0qW0AkXShbYS16QS1aJF9dWy1hLXpBLVokXzAtOV0qKVsgXFx0XSo6LywgaWQ6ICclMScsIGtpbmQ6ICdTZWxlY3Rvcid9XG4gIF1cbiAgU2FzczogW1xuICAgIHtyZTogL15bIFxcdF0qKFsjLl0qW2EtekEtWl8wLTldKylbIFxcdF0qJC8sIGlkOiAnJTEnLCBraW5kOiAnRnVuY3Rpb24nfVxuICBdXG4gIFlhbWw6IFtcbiAgICB7cmU6IC9eWyBcXHRdKihbYS16QS1aXzAtOSBdKylbIFxcdF0qXFw6WyBcXHRdKi8sIGlkOiAnJTEnLCBraW5kOiAnRnVuY3Rpb24nfVxuICBdXG4gIEh0bWw6IFtcbiAgICB7cmU6IC9eWyBcXHRdKjwoW2EtekEtWl0rKVsgXFx0XSouKj4vLCBpZDogJyUxJywga2luZDogJ0Z1bmN0aW9uJ31cbiAgXVxuICBNYXJrZG93bjogW1xuICAgIHtyZTogL14jK1sgXFx0XSooW14jXSspLywgaWQ6ICclMScsIGtpbmQ6ICdGdW5jdGlvbid9XG4gIF1cbiAgSnNvbjogW1xuICAgIHtyZTogL15bIFxcdF0qXCIoW15cIl0rKVwiWyBcXHRdKlxcOi8sIGlkOiAnJTEnLCBraW5kOiAnRmllbGQnfVxuICBdXG4gIENzb246IFtcbiAgICB7cmU6IC9eWyBcXHRdKicoW14nXSspJ1sgXFx0XSpcXDovLCBpZDogJyUxJywga2luZDogJ0ZpZWxkJ31cbiAgICB7cmU6IC9eWyBcXHRdKlwiKFteXCJdKylcIlsgXFx0XSpcXDovLCBpZDogJyUxJywga2luZDogJ0ZpZWxkJ31cbiAgICB7cmU6IC9eWyBcXHRdKihbXidcIiNdKylbIFxcdF0qXFw6LywgaWQ6ICclMScsIGtpbmQ6ICdGaWVsZCd9XG4gIF1cbiAgR286IFtcbiAgICB7cmU6IC9mdW5jKFsgXFx0XStcXChbXildK1xcKSk/WyBcXHRdKyhbYS16QS1aMC05X10rKS8sIGlkOiAnJTInLCBraW5kOiAnRnVuYyd9XG4gICAge3JlOiAvdmFyWyBcXHRdKyhbYS16QS1aX11bYS16QS1aMC05X10qKS8sIGlkOiAnJTEnLCBraW5kOiAnVmFyJ31cbiAgICB7cmU6IC90eXBlWyBcXHRdKyhbYS16QS1aX11bYS16QS1aMC05X10qKS8sIGlkOiAnJTEnLCBraW5kOiAnVHlwZSd9XG4gIF1cbiAgQ2FwbnA6IFtcbiAgICB7cmU6IC9zdHJ1Y3RbIFxcdF0rKFtBLVphLXpdKykvLCBpZDogJyUxJywga2luZDogJ1N0cnVjdCd9XG4gICAge3JlOiAvZW51bVsgXFx0XSsoW0EtWmEtel0rKS8sIGlkOiAnJTEnLCBraW5kOiAnRW51bSd9XG4gICAge3JlOiAvdXNpbmdbIFxcdF0rKFtBLVphLXpdKylbIFxcdF0rPVsgXFx0XStpbXBvcnQvLCBpZDogJyUxJywga2luZDogJ1VzaW5nJ31cbiAgICB7cmU6IC9jb25zdFsgXFx0XSsoW0EtWmEtel0rKS8sIGlkOiAnJTEnLCBraW5kOiAnQ29uc3QnfVxuICBdXG4gIHBlcmw6IFtcbiAgICB7cmU6IC93aXRoWyBcXHRdKyhbXjtdKylbIFxcdF0qPzsvLCBpZDogJyUxJywga2luZDogJ1JvbGUnfVxuICAgIHtyZTogL2V4dGVuZHNbIFxcdF0rWydcIl0oW14nXCJdKylbJ1wiXVsgXFx0XSo/Oy8sIGlkOiAnJTEnLCBraW5kOiAnRXh0ZW5kcyd9XG4gICAge3JlOiAvdXNlWyBcXHRdK2Jhc2VbIFxcdF0rWydcIl0oW14nXCJdKylbJ1wiXVsgXFx0XSo/Oy8sIGlkOiAnJTEnLCBraW5kOiAnRXh0ZW5kcyd9XG4gICAge3JlOiAvdXNlWyBcXHRdK3BhcmVudFsgXFx0XStbJ1wiXShbXidcIl0rKVsnXCJdWyBcXHRdKj87LywgaWQ6ICclMScsIGtpbmQ6ICdFeHRlbmRzJ31cbiAgICB7cmU6IC9Nb2pvOjpCYXNlWyBcXHRdK1snXCJdKFteJ1wiXSspWydcIl1bIFxcdF0qPzsvLCBpZDogJyUxJywga2luZDogJ0V4dGVuZHMnfVxuICAgIHtyZTogL15bIFxcdF0qP3VzZVsgXFx0XSsoW147XSspWyBcXHRdKj87LywgaWQ6ICclMScsIGtpbmQ6ICdVc2UnfVxuICAgIHtyZTogL15bIFxcdF0qP3JlcXVpcmVbIFxcdF0rKChcXHd8XFw6KSspLywgaWQ6ICclMScsIGtpbmQ6ICdSZXF1aXJlJ31cbiAgICB7cmU6IC9eWyBcXHRdKj9oYXNbIFxcdF0rWydcIl0/KFxcdyspWydcIl0/LywgaWQ6ICclMScsIGtpbmQ6ICdBdHRyaWJ1dGUnfVxuICAgIHtyZTogL15bIFxcdF0qP1xcKihcXHcrKVsgXFx0XSo/PS8sIGlkOiAnJTEnLCBraW5kOiAnQWxpYXMnfVxuICAgIHtyZTogLy0+aGVscGVyXFwoWyBcXHRdP1snXCJdPyhcXHcrKVsnXCJdPy8sIGlkOiAnJTEnLCBraW5kOiAnSGVscGVyJ31cbiAgICB7cmU6IC9eWyBcXHRdKj9vdXJbIFxcdF0qP1tcXCRAJV0oXFx3KykvLCBpZDogJyUxJywga2luZDogJ091cid9XG4gICAge3JlOiAvXlxcPWhlYWQxWyBcXHRdKyguKykvLCBpZDogJyUxJywga2luZDogJ1BsYWluIE9sZCBEb2MnfVxuICAgIHtyZTogL15cXD1oZWFkMlsgXFx0XSsoLispLywgaWQ6ICctLSAlMScsIGtpbmQ6ICdQbGFpbiBPbGQgRG9jJ31cbiAgICB7cmU6IC9eXFw9aGVhZFszLTVdWyBcXHRdKyguKykvLCBpZDogJy0tLS0gJTEnLCBraW5kOiAnUGxhaW4gT2xkIERvYyd9XG4gIF1cbiAgSmF2YVNjcmlwdDogW1xuICAgIHtyZTogLygsfCg7fF4pWyBcXHRdKih2YXJ8bGV0fChbQS1aYS16XyRdW0EtWmEtejAtOV8kLl0qXFwuKSopKVsgXFx0XSooW0EtWmEtejAtOV8kXSspWyBcXHRdKj1bIFxcdF0qZnVuY3Rpb25bIFxcdF0qXFwoLywgaWQ6ICclNScsIGtpbmQ6ICdGdW5jdGlvbid9XG4gICAge3JlOiAvZnVuY3Rpb25bIFxcdF0rKFtBLVphLXowLTlfJF0rKVsgXFx0XSpcXChbXildKlxcKS8sIGlkOiAnJTEnLCBraW5kOiAnRnVuY3Rpb24nfVxuICAgIHtyZTogLygsfF58XFwqXFwvKVsgXFx0XSooW0EtWmEtel8kXVtBLVphLXowLTlfJF0rKVsgXFx0XSo6WyBcXHRdKmZ1bmN0aW9uWyBcXHRdKlxcKC8sIGlkOiAnJTInLCBraW5kOiAnRnVuY3Rpb24nfVxuICAgIHtyZTogLygsfF58XFwqXFwvKVsgXFx0XSpnZXRbIFxcdF0rKFtBLVphLXpfJF1bQS1aYS16MC05XyRdKylbIFxcdF0qXFwoWyBcXHRdKlxcKVsgXFx0XSpcXHsvLCBpZDogJ2dldCAlMicsIGtpbmQ6ICdGdW5jdGlvbid9XG4gICAge3JlOiAvKCx8XnxcXCpcXC8pWyBcXHRdKnNldFsgXFx0XSsoW0EtWmEtel8kXVtBLVphLXowLTlfJF0rKVsgXFx0XSpcXChbIFxcdF0qKFtBLVphLXpfJF1bQS1aYS16MC05XyRdKyk/WyBcXHRdKlxcKVsgXFx0XSpcXHsvLCBpZDogJ3NldCAlMicsIGtpbmQ6ICdGdW5jdGlvbid9XG4gIF1cbiAgaGF4ZTogW1xuICAgIHtyZTogL15wYWNrYWdlWyBcXHRdKyhbQS1aYS16MC05Xy5dKykvLCBpZDogJyUxJywga2luZDogJ1BhY2thZ2UnfVxuICAgIHtyZTogL15bIFxcdF0qWyhAOm1hY3JvfHByaXZhdGV8cHVibGljfHN0YXRpY3xvdmVycmlkZXxpbmxpbmV8ZHluYW1pYykoIFxcdCldKmZ1bmN0aW9uWyBcXHRdKyhbQS1aYS16MC05X10rKS8sIGlkOiAnJTEnLCBraW5kOiAnRnVuY3Rpb24nfVxuICAgIHtyZTogL15bIFxcdF0qKFtwcml2YXRlfHB1YmxpY3xzdGF0aWN8cHJvdGVjdGVkfGlubGluZV1bIFxcdF0qKSt2YXJbIFxcdF0rKFtBLVphLXowLTlfXSspLywgaWQ6ICclMicsIGtpbmQ6ICdWYXJpYWJsZSd9XG4gICAge3JlOiAvXlsgXFx0XSpwYWNrYWdlWyBcXHRdKihbQS1aYS16MC05X10rKS8sIGlkOiAnJTEnLCBraW5kOiAnUGFja2FnZSd9XG4gICAge3JlOiAvXlsgXFx0XSooZXh0ZXJuWyBcXHRdKnxAOm5hdGl2ZVxcKFteKV0qXFwpWyBcXHRdKikqY2xhc3NbIFxcdF0rKFtBLVphLXowLTlfXSspWyBcXHRdKlteXFx7XSovLCBpZDogJyUyJywga2luZDogJ0NsYXNzJ31cbiAgICB7cmU6IC9eWyBcXHRdKihleHRlcm5bIFxcdF0rKT9pbnRlcmZhY2VbIFxcdF0rKFtBLVphLXowLTlfXSspLywgaWQ6ICclMicsIGtpbmQ6ICdJbnRlcmZhY2UnfVxuICAgIHtyZTogL15bIFxcdF0qdHlwZWRlZlsgXFx0XSsoW0EtWmEtejAtOV9dKykvLCBpZDogJyUxJywga2luZDogJ1R5cGVkZWYnfVxuICAgIHtyZTogL15bIFxcdF0qZW51bVsgXFx0XSsoW0EtWmEtejAtOV9dKykvLCBpZDogJyUxJywga2luZDogJ1R5cGVkZWYnfVxuICBdXG4gIEVsaXhpcjogW1xuICAgIHtyZTogL15bIFxcdF0qZGVmKHA/KVsgXFx0XSsoW2Etel9dW2EtekEtWjAtOV8/IV0qKS8sIGlkOiAnJTInLCBraW5kOiAnRnVuY3Rpb25zIChkZWYgLi4uKSd9XG4gICAge3JlOiAvXlsgXFx0XSpkZWZjYWxsYmFja1sgXFx0XSsoW2Etel9dW2EtekEtWjAtOV8/IV0qKS8sIGlkOiAnJTEnLCBraW5kOiAnQ2FsbGJhY2tzIChkZWZjYWxsYmFjayAuLi4pJ31cbiAgICB7cmU6IC9eWyBcXHRdKmRlZmRlbGVnYXRlWyBcXHRdKyhbYS16X11bYS16QS1aMC05Xz8hXSopLywgaWQ6ICclMScsIGtpbmQ6ICdEZWxlZ2F0ZXMgKGRlZmRlbGVnYXRlIC4uLiknfVxuICAgIHtyZTogL15bIFxcdF0qZGVmZXhjZXB0aW9uWyBcXHRdKyhbQS1aXVthLXpBLVowLTlfXSpcXC4pKihbQS1aXVthLXpBLVowLTlfPyFdKikvLCBpZDogJyUyJywga2luZDogJ0V4Y2VwdGlvbnMgKGRlZmV4Y2VwdGlvbiAuLi4pJ31cbiAgICB7cmU6IC9eWyBcXHRdKmRlZmltcGxbIFxcdF0rKFtBLVpdW2EtekEtWjAtOV9dKlxcLikqKFtBLVpdW2EtekEtWjAtOV8/IV0qKS8sIGlkOiAnJTInLCBraW5kOiAnSW1wbGVtZW50YXRpb25zIChkZWZpbXBsIC4uLiknfVxuICAgIHtyZTogL15bIFxcdF0qZGVmbWFjcm8ocD8pWyBcXHRdKyhbYS16X11bYS16QS1aMC05Xz8hXSopXFwoLywgaWQ6ICclMicsIGtpbmQ6ICdNYWNyb3MgKGRlZm1hY3JvIC4uLiknfVxuICAgIHtyZTogL15bIFxcdF0qZGVmbWFjcm8ocD8pWyBcXHRdKyhbYS16QS1aMC05Xz8hXSspP1sgXFx0XSsoW14gXFx0QS1aYS16MC05X10rKVsgXFx0XSpbYS16QS1aMC05XyE/IV0vLCBpZDogJyUzJywga2luZDogJ09wZXJhdG9ycyAoZS5nLiBcImRlZm1hY3JvIGEgPDw8IGJcIiknfVxuICAgIHtyZTogL15bIFxcdF0qZGVmbW9kdWxlWyBcXHRdKyhbQS1aXVthLXpBLVowLTlfXSpcXC4pKihbQS1aXVthLXpBLVowLTlfPyFdKikvLCBpZDogJyUyJywga2luZDogJ01vZHVsZXMgKGRlZm1vZHVsZSAuLi4pJ31cbiAgICB7cmU6IC9eWyBcXHRdKmRlZnByb3RvY29sWyBcXHRdKyhbQS1aXVthLXpBLVowLTlfXSpcXC4pKihbQS1aXVthLXpBLVowLTlfPyFdKikvLCBpZDogJyUyJywga2luZDogJ1Byb3RvY29scyAoZGVmcHJvdG9jb2wuLi4pJ31cbiAgICB7cmU6IC9eWyBcXHRdKlJlY29yZFxcLmRlZnJlY29yZFsgXFx0XSs6KFthLXpBLVowLTlfXSspLywgaWQ6ICclMScsIGtpbmQ6ICdSZWNvcmRzIChkZWZyZWNvcmQuLi4pJ31cbiAgXVxuICBOaW06IFtcbiAgICB7cmU6IC9eW1xcdFxcc10qcHJvY1xccysoW19BLVphLXowLTldKylcXCoqKFxcW1xcdysoXFw6XFxzK1xcdyspP1xcXSk/XFxzKlxcKC8sIGlkOiAnJTEnLCBraW5kOiAnRnVuY3Rpb24nfVxuICAgIHtyZTogL15bXFx0XFxzXSppdGVyYXRvclxccysoW19BLVphLXowLTldKylcXCoqKFxcW1xcdysoXFw6XFxzK1xcdyspP1xcXSk/XFxzKlxcKC8sIGlkOiAnJTEnLCBraW5kOiAnSXRlcmF0b3InfVxuICAgIHtyZTogL15bXFx0XFxzXSptYWNyb1xccysoW19BLVphLXowLTldKylcXCoqKFxcW1xcdysoXFw6XFxzK1xcdyspP1xcXSk/XFxzKlxcKC8sIGlkOiAnJTEnLCBraW5kOiAnTWFjcm8nfVxuICAgIHtyZTogL15bXFx0XFxzXSptZXRob2RcXHMrKFtfQS1aYS16MC05XSspXFwqKihcXFtcXHcrKFxcOlxccytcXHcrKT9cXF0pP1xccypcXCgvLCBpZDogJyUxJywga2luZDogJ01ldGhvZCd9XG4gICAge3JlOiAvXltcXHRcXHNdKnRlbXBsYXRlXFxzKyhbX0EtWmEtejAtOV0rKVxcKiooXFxbXFx3KyhcXDpcXHMrXFx3Kyk/XFxdKT9cXHMqXFwoLywgaWQ6ICclMScsIGtpbmQ6ICdHZW5lcmljcyd9XG4gICAge3JlOiAvXltcXHRcXHNdKmNvbnZlcnRlclxccysoW19BLVphLXowLTldKylcXCoqKFxcW1xcdysoXFw6XFxzK1xcdyspP1xcXSk/XFxzKlxcKC8sIGlkOiAnJTEnLCBraW5kOiAnQ29udmVydGVyJ31cbiAgXVxuICBGb3VudGFpbjogW1xuICAgIHtyZTogL14oKFtpSV1bbk5dW3RUXXxbZUVdW3hYXVt0VF18W15cXHddW2VFXVtzU11bdFRdfFxcLnxbaUldXFwuP1xcL1tlRV1cXC4/KShbXlxcbl0rKSkvLCBpZDogJyUxJywga2luZDogJ0Z1bmN0aW9uJ31cbiAgXVxuICBKdWxpYTogW1xuICAgIHtyZTogL15bIFxcdF0qKGZ1bmN0aW9ufG1hY3JvfGFic3RyYWN0fHR5cGV8dHlwZWFsaWFzfGltbXV0YWJsZSlbIFxcdF0rKFteIFxcdCh7W10rKS4qJC8sIGlkOiAnJTInLCBraW5kOiAnRnVuY3Rpb24nfVxuICAgIHtyZTogL15bIFxcdF0qKChbXkAjJCBcXHQoe1tdKyl8XFwoKFteQCMkIFxcdCh7W10rKVxcKXxcXCgoXFwkKVxcKSlbIFxcdF0qKFxcey4qXFx9KT9bIFxcdF0qXFwoW14jXSpcXClbIFxcdF0qPShbXj1dLiokfCQpLywgaWQ6ICclMiUzJTQnLCBraW5kOiAnRnVuY3Rpb24nfVxuICBdXG5sYW5nbWFwID0gXG4gICcuY29mZmVlJzogbGFuZ2RlZi5Db2ZmZWVTY3JpcHRcbiAgJy5saXRjb2ZmZWUnOiBsYW5nZGVmLkNvZmZlZVNjcmlwdFxuICAnLnJiJzogbGFuZ2RlZi5SdWJ5XG4gICdSYWtlZmlsZSc6IGxhbmdkZWYuUnVieVxuICAnLnBocCc6IGxhbmdkZWYucGhwXG4gICcuY3NzJzogbGFuZ2RlZi5Dc3NcbiAgJy5sZXNzJzogbGFuZ2RlZi5Dc3NcbiAgJy5zY3NzJzogbGFuZ2RlZi5Dc3NcbiAgJy5zYXNzJzogbGFuZ2RlZi5TYXNzXG4gICcueWFtbCc6IGxhbmdkZWYuWWFtbFxuICAnLnltbCc6IGxhbmdkZWYuWWFtbFxuICAnLm1kJzogbGFuZ2RlZi5NYXJrZG93blxuICAnLm1hcmtkb3duJzogbGFuZ2RlZi5NYXJrZG93blxuICAnLm1kb3duJzogbGFuZ2RlZi5NYXJrZG93blxuICAnLm1rZCc6IGxhbmdkZWYuTWFya2Rvd25cbiAgJy5ta2Rvd24nOiBsYW5nZGVmLk1hcmtkb3duXG4gICcucm9uJzogbGFuZ2RlZi5NYXJrZG93blxuICAnLmpzb24nOiBsYW5nZGVmLkpzb25cbiAgJy5jc29uJzogbGFuZ2RlZi5Dc29uXG4gICcuZ3lwJzogbGFuZ2RlZi5Dc29uXG4gICcuZ28nOiBsYW5nZGVmLkdvXG4gICcuY2FwbnAnOiBsYW5nZGVmLkNhcG5wXG4gICcucG9kJzogbGFuZ2RlZi5wZXJsXG4gICcuanMnOiBsYW5nZGVmLkphdmFTY3JpcHRcbiAgJy5oeCc6IGxhbmdkZWYuaGF4ZVxuICAnLmV4LmV4cyc6IGxhbmdkZWYuRWxpeGlyXG4gICcubmltJzogbGFuZ2RlZi5OaW1cbiAgJy5mb3VudGFpbic6IGxhbmdkZWYuRm91bnRhaW5cbiAgJy5mdG4nOiBsYW5nZGVmLkZvdW50YWluXG4gICcuamwnOiBsYW5nZGVmLkp1bGlhXG5tb2R1bGUuZXhwb3J0cyA9IHtsYW5nZGVmOiBsYW5nZGVmLCBsYW5nbWFwOiBsYW5nbWFwfVxuIl19
