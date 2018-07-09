(function() {
  var meta;

  meta = {
    define: "https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/metaKey",
    key: (function() {
      switch (process.platform) {
        case "darwin":
          return "⌘";
        case "linux":
          return "Super";
        case "win32":
          return "❖";
      }
    })()
  };

  module.exports = {
    general: {
      order: 1,
      type: "object",
      properties: {
        gitPath: {
          order: 1,
          title: "Git Path",
          type: "string",
          "default": "git",
          description: "If git is not in your PATH, specify where the executable is"
        },
        enableStatusBarIcon: {
          order: 2,
          title: "Status-bar Pin Icon",
          type: "boolean",
          "default": true,
          description: "The pin icon in the bottom-right of the status-bar toggles the output view above the status-bar"
        },
        newBranchKey: {
          order: 3,
          title: "Status-bar New Branch modifier key",
          type: "string",
          "default": "alt",
          description: "Status-bar branch list modifier key to alternatively create a new branch if held on click. Note that _[`meta`](" + meta.define + ")_ is <kbd>" + meta.key + "</kbd>",
          "enum": ["alt", "shift", "meta", "ctrl"]
        },
        openInPane: {
          order: 4,
          title: "Allow commands to open new panes",
          type: "boolean",
          "default": true,
          description: "Commands like `Commit`, `Log`, `Show`, `Diff` can be split into new panes"
        },
        splitPane: {
          order: 5,
          title: "Split pane direction",
          type: "string",
          "default": "Down",
          description: "Where should new panes go?",
          "enum": ["Up", "Right", "Down", "Left"]
        },
        showFormat: {
          order: 6,
          title: "Format option for 'Git Show'",
          type: "string",
          "default": "full",
          "enum": ["oneline", "short", "medium", "full", "fuller", "email", "raw", "none"],
          description: "Which format to use for `git show`? (`none` will use your git config default)"
        }
      }
    },
    commits: {
      order: 2,
      type: "object",
      properties: {
        verboseCommits: {
          title: "Verbose Commits",
          description: "Show diffs in commit pane?",
          type: "boolean",
          "default": false
        }
      }
    },
    diffs: {
      order: 3,
      type: "object",
      properties: {
        includeStagedDiff: {
          order: 1,
          title: "Include staged diffs?",
          type: "boolean",
          "default": true
        },
        wordDiff: {
          order: 2,
          title: "Word diff",
          type: "boolean",
          "default": false,
          description: "Should diffs be generated with the `--word-diff` flag?"
        },
        syntaxHighlighting: {
          order: 3,
          title: "Enable syntax highlighting in diffs?",
          type: "boolean",
          "default": true
        }
      }
    },
    logs: {
      order: 4,
      type: "object",
      properties: {
        numberOfCommitsToShow: {
          order: 1,
          title: "Number of commits to load",
          type: "integer",
          "default": 25,
          minimum: 1,
          description: "Initial amount of commits to load when running the `Log` command"
        }
      }
    },
    remoteInteractions: {
      order: 5,
      type: "object",
      properties: {
        pullRebase: {
          order: 1,
          title: "Pull Rebase",
          type: "boolean",
          "default": false,
          description: "Pull with `--rebase` flag?"
        },
        pullAutostash: {
          order: 2,
          title: "Pull AutoStash",
          type: "boolean",
          "default": false,
          description: "Pull with `--autostash` flag?"
        },
        pullBeforePush: {
          order: 3,
          title: "Pull Before Pushing",
          type: "boolean",
          "default": false,
          description: "Pull from remote before pushing"
        },
        promptForBranch: {
          order: 4,
          title: "Prompt for branch selection when pulling/pushing",
          type: "boolean",
          "default": false,
          description: "If false, it defaults to current branch upstream"
        }
      }
    },
    tags: {
      order: 6,
      type: "object",
      properties: {
        signTags: {
          title: "Sign git tags with GPG",
          type: "boolean",
          "default": false,
          description: "Use a GPG key to sign Git tags"
        }
      }
    },
    experimental: {
      order: 7,
      type: "object",
      properties: {
        stageFilesBeta: {
          order: 1,
          title: "Stage Files Beta",
          type: "boolean",
          "default": true,
          description: "Stage and unstage files in a single command"
        },
        customCommands: {
          order: 2,
          title: "Custom Commands",
          type: "boolean",
          "default": false,
          description: "Declared custom commands in your `init` file that can be run from the Git-plus command palette"
        },
        diffBranches: {
          order: 3,
          title: "Show diffs across branches",
          type: "boolean",
          "default": false,
          description: "Diffs will be shown for the current branch against a branch you choose. The `Diff branch files` command will allow choosing which file to compare. The file feature requires the 'split-diff' package to be installed."
        },
        useSplitDiff: {
          order: 4,
          title: "Split diff",
          type: "boolean",
          "default": false,
          description: "Use the split-diff package to show diffs for a single file. Only works with `Diff` command when a file is open."
        },
        autoFetch: {
          order: 5,
          title: "Auto-fetch",
          type: "integer",
          "default": 0,
          maximum: 60,
          description: "Automatically fetch remote repositories every `x` minutes (`0` will disable this feature)"
        },
        autoFetchNotify: {
          order: 6,
          title: "Auto-fetch notification",
          type: "boolean",
          "default": false,
          description: "Show notifications while running `fetch --all`?"
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9jb25maWcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxJQUFBLEdBQ0U7SUFBQSxNQUFBLEVBQVEscUVBQVI7SUFDQSxHQUFBO0FBQ0UsY0FBTyxPQUFPLENBQUMsUUFBZjtBQUFBLGFBQ08sUUFEUDtpQkFDcUI7QUFEckIsYUFFTyxPQUZQO2lCQUVvQjtBQUZwQixhQUdPLE9BSFA7aUJBR29CO0FBSHBCO1FBRkY7OztFQU9GLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxPQUFBLEVBQ0U7TUFBQSxLQUFBLEVBQU8sQ0FBUDtNQUNBLElBQUEsRUFBTSxRQUROO01BRUEsVUFBQSxFQUNFO1FBQUEsT0FBQSxFQUNFO1VBQUEsS0FBQSxFQUFPLENBQVA7VUFDQSxLQUFBLEVBQU8sVUFEUDtVQUVBLElBQUEsRUFBTSxRQUZOO1VBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhUO1VBSUEsV0FBQSxFQUFhLDZEQUpiO1NBREY7UUFNQSxtQkFBQSxFQUNFO1VBQUEsS0FBQSxFQUFPLENBQVA7VUFDQSxLQUFBLEVBQU8scUJBRFA7VUFFQSxJQUFBLEVBQU0sU0FGTjtVQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFIVDtVQUlBLFdBQUEsRUFBYSxpR0FKYjtTQVBGO1FBWUEsWUFBQSxFQUNFO1VBQUEsS0FBQSxFQUFPLENBQVA7VUFDQSxLQUFBLEVBQU8sb0NBRFA7VUFFQSxJQUFBLEVBQU0sUUFGTjtVQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtVQUlBLFdBQUEsRUFBYSxpSEFBQSxHQUFrSCxJQUFJLENBQUMsTUFBdkgsR0FBOEgsYUFBOUgsR0FBMkksSUFBSSxDQUFDLEdBQWhKLEdBQW9KLFFBSmpLO1VBS0EsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLEtBQUQsRUFBUSxP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QU8sNEJBRFA7VUFFQSxJQUFBLEVBQU0sU0FGTjtVQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtVQUlBLFdBQUEsRUFBYSx3TkFKYjtTQWJGO1FBa0JBLFlBQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyxDQUFQO1VBQ0EsS0FBQSxFQUFPLFlBRFA7VUFFQSxJQUFBLEVBQU0sU0FGTjtVQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtVQUlBLFdBQUEsRUFBYSxpSEFKYjtTQW5CRjtRQXdCQSxTQUFBLEVBQ0U7VUFBQSxLQUFBLEVBQU8sQ0FBUDtVQUNBLEtBQUEsRUFBTyxZQURQO1VBRUEsSUFBQSxFQUFNLFNBRk47VUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLENBSFQ7VUFJQSxPQUFBLEVBQVMsRUFKVDtVQUtBLFdBQUEsRUFBYSwyRkFMYjtTQXpCRjtRQStCQSxlQUFBLEVBQ0U7VUFBQSxLQUFBLEVBQU8sQ0FBUDtVQUNBLEtBQUEsRUFBTyx5QkFEUDtVQUVBLElBQUEsRUFBTSxTQUZOO1VBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhUO1VBSUEsV0FBQSxFQUFhLGlEQUpiO1NBaENGO09BSEY7S0F6SEY7O0FBVEYiLCJzb3VyY2VzQ29udGVudCI6WyJtZXRhID0gI0tleVxuICBkZWZpbmU6IFwiaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL01vdXNlRXZlbnQvbWV0YUtleVwiXG4gIGtleTpcbiAgICBzd2l0Y2ggcHJvY2Vzcy5wbGF0Zm9ybVxuICAgICAgd2hlbiBcImRhcndpblwiIHRoZW4gXCLijJhcIlxuICAgICAgd2hlbiBcImxpbnV4XCIgdGhlbiBcIlN1cGVyXCJcbiAgICAgIHdoZW4gXCJ3aW4zMlwiIHRoZW4gXCLinZZcIlxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGdlbmVyYWw6XG4gICAgb3JkZXI6IDFcbiAgICB0eXBlOiBcIm9iamVjdFwiXG4gICAgcHJvcGVydGllczpcbiAgICAgIGdpdFBhdGg6XG4gICAgICAgIG9yZGVyOiAxXG4gICAgICAgIHRpdGxlOiBcIkdpdCBQYXRoXCJcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIlxuICAgICAgICBkZWZhdWx0OiBcImdpdFwiXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIklmIGdpdCBpcyBub3QgaW4geW91ciBQQVRILCBzcGVjaWZ5IHdoZXJlIHRoZSBleGVjdXRhYmxlIGlzXCJcbiAgICAgIGVuYWJsZVN0YXR1c0Jhckljb246XG4gICAgICAgIG9yZGVyOiAyXG4gICAgICAgIHRpdGxlOiBcIlN0YXR1cy1iYXIgUGluIEljb25cIlxuICAgICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlRoZSBwaW4gaWNvbiBpbiB0aGUgYm90dG9tLXJpZ2h0IG9mIHRoZSBzdGF0dXMtYmFyIHRvZ2dsZXMgdGhlIG91dHB1dCB2aWV3IGFib3ZlIHRoZSBzdGF0dXMtYmFyXCJcbiAgICAgIG5ld0JyYW5jaEtleTpcbiAgICAgICAgb3JkZXI6IDNcbiAgICAgICAgdGl0bGU6IFwiU3RhdHVzLWJhciBOZXcgQnJhbmNoIG1vZGlmaWVyIGtleVwiXG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICAgICAgZGVmYXVsdDogXCJhbHRcIlxuICAgICAgICBkZXNjcmlwdGlvbjogXCJTdGF0dXMtYmFyIGJyYW5jaCBsaXN0IG1vZGlmaWVyIGtleSB0byBhbHRlcm5hdGl2ZWx5IGNyZWF0ZSBhIG5ldyBicmFuY2ggaWYgaGVsZCBvbiBjbGljay4gTm90ZSB0aGF0IF9bYG1ldGFgXSgje21ldGEuZGVmaW5lfSlfIGlzIDxrYmQ+I3ttZXRhLmtleX08L2tiZD5cIlxuICAgICAgICBlbnVtOiBbXCJhbHRcIiwgXCJzaGlmdFwiLCBcIm1ldGFcIiwgXCJjdHJsXCJdXG4gICAgICBvcGVuSW5QYW5lOlxuICAgICAgICBvcmRlcjogNFxuICAgICAgICB0aXRsZTogXCJBbGxvdyBjb21tYW5kcyB0byBvcGVuIG5ldyBwYW5lc1wiXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgZGVzY3JpcHRpb246IFwiQ29tbWFuZHMgbGlrZSBgQ29tbWl0YCwgYExvZ2AsIGBTaG93YCwgYERpZmZgIGNhbiBiZSBzcGxpdCBpbnRvIG5ldyBwYW5lc1wiXG4gICAgICBzcGxpdFBhbmU6XG4gICAgICAgIG9yZGVyOiA1XG4gICAgICAgIHRpdGxlOiBcIlNwbGl0IHBhbmUgZGlyZWN0aW9uXCJcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIlxuICAgICAgICBkZWZhdWx0OiBcIkRvd25cIlxuICAgICAgICBkZXNjcmlwdGlvbjogXCJXaGVyZSBzaG91bGQgbmV3IHBhbmVzIGdvP1wiXG4gICAgICAgIGVudW06IFtcIlVwXCIsIFwiUmlnaHRcIiwgXCJEb3duXCIsIFwiTGVmdFwiXVxuICAgICAgc2hvd0Zvcm1hdDpcbiAgICAgICAgb3JkZXI6IDZcbiAgICAgICAgdGl0bGU6IFwiRm9ybWF0IG9wdGlvbiBmb3IgJ0dpdCBTaG93J1wiXG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICAgICAgZGVmYXVsdDogXCJmdWxsXCJcbiAgICAgICAgZW51bTogW1wib25lbGluZVwiLCBcInNob3J0XCIsIFwibWVkaXVtXCIsIFwiZnVsbFwiLCBcImZ1bGxlclwiLCBcImVtYWlsXCIsIFwicmF3XCIsIFwibm9uZVwiXVxuICAgICAgICBkZXNjcmlwdGlvbjogXCJXaGljaCBmb3JtYXQgdG8gdXNlIGZvciBgZ2l0IHNob3dgPyAoYG5vbmVgIHdpbGwgdXNlIHlvdXIgZ2l0IGNvbmZpZyBkZWZhdWx0KVwiXG4gIGNvbW1pdHM6XG4gICAgb3JkZXI6IDJcbiAgICB0eXBlOiBcIm9iamVjdFwiXG4gICAgcHJvcGVydGllczpcbiAgICAgIHZlcmJvc2VDb21taXRzOlxuICAgICAgICB0aXRsZTogXCJWZXJib3NlIENvbW1pdHNcIlxuICAgICAgICBkZXNjcmlwdGlvbjogXCJTaG93IGRpZmZzIGluIGNvbW1pdCBwYW5lP1wiXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gIGRpZmZzOlxuICAgIG9yZGVyOiAzXG4gICAgdHlwZTogXCJvYmplY3RcIlxuICAgIHByb3BlcnRpZXM6XG4gICAgICBpbmNsdWRlU3RhZ2VkRGlmZjpcbiAgICAgICAgb3JkZXI6IDFcbiAgICAgICAgdGl0bGU6IFwiSW5jbHVkZSBzdGFnZWQgZGlmZnM/XCJcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgd29yZERpZmY6XG4gICAgICAgIG9yZGVyOiAyXG4gICAgICAgIHRpdGxlOiBcIldvcmQgZGlmZlwiXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlNob3VsZCBkaWZmcyBiZSBnZW5lcmF0ZWQgd2l0aCB0aGUgYC0td29yZC1kaWZmYCBmbGFnP1wiXG4gICAgICBzeW50YXhIaWdobGlnaHRpbmc6XG4gICAgICAgIG9yZGVyOiAzXG4gICAgICAgIHRpdGxlOiBcIkVuYWJsZSBzeW50YXggaGlnaGxpZ2h0aW5nIGluIGRpZmZzP1wiXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgbG9nczpcbiAgICBvcmRlcjogNFxuICAgIHR5cGU6IFwib2JqZWN0XCJcbiAgICBwcm9wZXJ0aWVzOlxuICAgICAgbnVtYmVyT2ZDb21taXRzVG9TaG93OlxuICAgICAgICBvcmRlcjogMVxuICAgICAgICB0aXRsZTogXCJOdW1iZXIgb2YgY29tbWl0cyB0byBsb2FkXCJcbiAgICAgICAgdHlwZTogXCJpbnRlZ2VyXCJcbiAgICAgICAgZGVmYXVsdDogMjVcbiAgICAgICAgbWluaW11bTogMVxuICAgICAgICBkZXNjcmlwdGlvbjogXCJJbml0aWFsIGFtb3VudCBvZiBjb21taXRzIHRvIGxvYWQgd2hlbiBydW5uaW5nIHRoZSBgTG9nYCBjb21tYW5kXCJcbiAgcmVtb3RlSW50ZXJhY3Rpb25zOlxuICAgIG9yZGVyOiA1XG4gICAgdHlwZTogXCJvYmplY3RcIlxuICAgIHByb3BlcnRpZXM6XG4gICAgICBwdWxsUmViYXNlOlxuICAgICAgICBvcmRlcjogMVxuICAgICAgICB0aXRsZTogXCJQdWxsIFJlYmFzZVwiXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlB1bGwgd2l0aCBgLS1yZWJhc2VgIGZsYWc/XCJcbiAgICAgIHB1bGxBdXRvc3Rhc2g6XG4gICAgICAgIG9yZGVyOiAyXG4gICAgICAgIHRpdGxlOiBcIlB1bGwgQXV0b1N0YXNoXCJcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgZGVzY3JpcHRpb246IFwiUHVsbCB3aXRoIGAtLWF1dG9zdGFzaGAgZmxhZz9cIlxuICAgICAgcHVsbEJlZm9yZVB1c2g6XG4gICAgICAgIG9yZGVyOiAzXG4gICAgICAgIHRpdGxlOiBcIlB1bGwgQmVmb3JlIFB1c2hpbmdcIlxuICAgICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICBkZXNjcmlwdGlvbjogXCJQdWxsIGZyb20gcmVtb3RlIGJlZm9yZSBwdXNoaW5nXCJcbiAgICAgIHByb21wdEZvckJyYW5jaDpcbiAgICAgICAgb3JkZXI6IDRcbiAgICAgICAgdGl0bGU6IFwiUHJvbXB0IGZvciBicmFuY2ggc2VsZWN0aW9uIHdoZW4gcHVsbGluZy9wdXNoaW5nXCJcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgZGVzY3JpcHRpb246IFwiSWYgZmFsc2UsIGl0IGRlZmF1bHRzIHRvIGN1cnJlbnQgYnJhbmNoIHVwc3RyZWFtXCJcbiAgdGFnczpcbiAgICBvcmRlcjogNlxuICAgIHR5cGU6IFwib2JqZWN0XCJcbiAgICBwcm9wZXJ0aWVzOlxuICAgICAgc2lnblRhZ3M6XG4gICAgICAgIHRpdGxlOiBcIlNpZ24gZ2l0IHRhZ3Mgd2l0aCBHUEdcIlxuICAgICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICBkZXNjcmlwdGlvbjogXCJVc2UgYSBHUEcga2V5IHRvIHNpZ24gR2l0IHRhZ3NcIlxuICBleHBlcmltZW50YWw6XG4gICAgb3JkZXI6IDdcbiAgICB0eXBlOiBcIm9iamVjdFwiXG4gICAgcHJvcGVydGllczpcbiAgICAgIHN0YWdlRmlsZXNCZXRhOlxuICAgICAgICBvcmRlcjogMVxuICAgICAgICB0aXRsZTogXCJTdGFnZSBGaWxlcyBCZXRhXCJcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICBkZXNjcmlwdGlvbjogXCJTdGFnZSBhbmQgdW5zdGFnZSBmaWxlcyBpbiBhIHNpbmdsZSBjb21tYW5kXCJcbiAgICAgIGN1c3RvbUNvbW1hbmRzOlxuICAgICAgICBvcmRlcjogMlxuICAgICAgICB0aXRsZTogXCJDdXN0b20gQ29tbWFuZHNcIlxuICAgICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICBkZXNjcmlwdGlvbjogXCJEZWNsYXJlZCBjdXN0b20gY29tbWFuZHMgaW4geW91ciBgaW5pdGAgZmlsZSB0aGF0IGNhbiBiZSBydW4gZnJvbSB0aGUgR2l0LXBsdXMgY29tbWFuZCBwYWxldHRlXCJcbiAgICAgIGRpZmZCcmFuY2hlczpcbiAgICAgICAgb3JkZXI6IDNcbiAgICAgICAgdGl0bGU6IFwiU2hvdyBkaWZmcyBhY3Jvc3MgYnJhbmNoZXNcIlxuICAgICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICBkZXNjcmlwdGlvbjogXCJEaWZmcyB3aWxsIGJlIHNob3duIGZvciB0aGUgY3VycmVudCBicmFuY2ggYWdhaW5zdCBhIGJyYW5jaCB5b3UgY2hvb3NlLiBUaGUgYERpZmYgYnJhbmNoIGZpbGVzYCBjb21tYW5kIHdpbGwgYWxsb3cgY2hvb3Npbmcgd2hpY2ggZmlsZSB0byBjb21wYXJlLiBUaGUgZmlsZSBmZWF0dXJlIHJlcXVpcmVzIHRoZSAnc3BsaXQtZGlmZicgcGFja2FnZSB0byBiZSBpbnN0YWxsZWQuXCJcbiAgICAgIHVzZVNwbGl0RGlmZjpcbiAgICAgICAgb3JkZXI6IDRcbiAgICAgICAgdGl0bGU6IFwiU3BsaXQgZGlmZlwiXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlVzZSB0aGUgc3BsaXQtZGlmZiBwYWNrYWdlIHRvIHNob3cgZGlmZnMgZm9yIGEgc2luZ2xlIGZpbGUuIE9ubHkgd29ya3Mgd2l0aCBgRGlmZmAgY29tbWFuZCB3aGVuIGEgZmlsZSBpcyBvcGVuLlwiXG4gICAgICBhdXRvRmV0Y2g6XG4gICAgICAgIG9yZGVyOiA1XG4gICAgICAgIHRpdGxlOiBcIkF1dG8tZmV0Y2hcIlxuICAgICAgICB0eXBlOiBcImludGVnZXJcIlxuICAgICAgICBkZWZhdWx0OiAwXG4gICAgICAgIG1heGltdW06IDYwXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIkF1dG9tYXRpY2FsbHkgZmV0Y2ggcmVtb3RlIHJlcG9zaXRvcmllcyBldmVyeSBgeGAgbWludXRlcyAoYDBgIHdpbGwgZGlzYWJsZSB0aGlzIGZlYXR1cmUpXCJcbiAgICAgIGF1dG9GZXRjaE5vdGlmeTpcbiAgICAgICAgb3JkZXI6IDZcbiAgICAgICAgdGl0bGU6IFwiQXV0by1mZXRjaCBub3RpZmljYXRpb25cIlxuICAgICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICBkZXNjcmlwdGlvbjogXCJTaG93IG5vdGlmaWNhdGlvbnMgd2hpbGUgcnVubmluZyBgZmV0Y2ggLS1hbGxgP1wiXG4iXX0=
