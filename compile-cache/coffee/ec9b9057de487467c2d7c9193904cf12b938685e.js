(function() {
  module.exports = {
    name: "Lua",
    namespace: "lua",

    /*
    Supported Grammars
     */
    grammars: ["Lua"],

    /*
    Supported extensions
     */
    extensions: ['lua', 'ttslua'],
    defaultBeautifier: "Lua beautifier",
    options: {
      end_of_line: {
        type: 'string',
        "default": "System Default",
        "enum": ["CRLF", "LF", "System Default"],
        description: "Override EOL from line-ending-selector"
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2xhbmd1YWdlcy9sdWEuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFFZixJQUFBLEVBQU0sS0FGUztJQUdmLFNBQUEsRUFBVyxLQUhJOztBQUtmOzs7SUFHQSxRQUFBLEVBQVUsQ0FDUixLQURRLENBUks7O0FBWWY7OztJQUdBLFVBQUEsRUFBWSxDQUNWLEtBRFUsRUFFVixRQUZVLENBZkc7SUFvQmYsaUJBQUEsRUFBbUIsZ0JBcEJKO0lBc0JmLE9BQUEsRUFDRTtNQUFBLFdBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxnQkFEVDtRQUVBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxNQUFELEVBQVEsSUFBUixFQUFhLGdCQUFiLENBRk47UUFHQSxXQUFBLEVBQWEsd0NBSGI7T0FERjtLQXZCYTs7QUFBakIiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHtcblxuICBuYW1lOiBcIkx1YVwiXG4gIG5hbWVzcGFjZTogXCJsdWFcIlxuXG4gICMjI1xuICBTdXBwb3J0ZWQgR3JhbW1hcnNcbiAgIyMjXG4gIGdyYW1tYXJzOiBbXG4gICAgXCJMdWFcIlxuICBdXG5cbiAgIyMjXG4gIFN1cHBvcnRlZCBleHRlbnNpb25zXG4gICMjI1xuICBleHRlbnNpb25zOiBbXG4gICAgJ2x1YSdcbiAgICAndHRzbHVhJ1xuICBdXG5cbiAgZGVmYXVsdEJlYXV0aWZpZXI6IFwiTHVhIGJlYXV0aWZpZXJcIlxuXG4gIG9wdGlvbnM6XG4gICAgZW5kX29mX2xpbmU6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogXCJTeXN0ZW0gRGVmYXVsdFwiXG4gICAgICBlbnVtOiBbXCJDUkxGXCIsXCJMRlwiLFwiU3lzdGVtIERlZmF1bHRcIl1cbiAgICAgIGRlc2NyaXB0aW9uOiBcIk92ZXJyaWRlIEVPTCBmcm9tIGxpbmUtZW5kaW5nLXNlbGVjdG9yXCJcbn1cbiJdfQ==
