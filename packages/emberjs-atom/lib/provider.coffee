fs = require 'fs'
path = require 'path'

propertyPrefixPattern = /(?:^|\[|\(|,|=|:|\s)\s*((Ember|this|\))\.(?:[a-zA-Z]+\.?){0,2})$/

module.exports =
  selector: '.source.js'
  filterSuggestions: true

  getSuggestions: ({bufferPosition, editor}) ->
    line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition])
    folder_parent_name = editor.getPath().match("(controllers|routes)")?[0]
    if folder_parent_name
      @ember_class  = folder_parent_name.slice(0,folder_parent_name.length - 1)

    @getCompletions(line)

  load: ->
    @loadCompletions()
    atom.project.onDidChangePaths => @scanProjectDirectories()
    @scanProjectDirectories()

  scanProjectDirectories: ->
    @packageDirectories = []
    atom.project.getDirectories().forEach (directory) =>
      return unless directory?
      @readMetadata directory, (error, metadata) =>
        if @isAtomPackage(metadata) or @isAtomCore(metadata)
          @packageDirectories.push(directory)

  readMetadata: (directory, callback) ->
    fs.readFile path.join(directory.getPath(), 'package.json'), (error, contents) ->
      unless error?
        try
          metadata = JSON.parse(contents)
        catch parseError
          error = parseError
      callback(error, metadata)

  isAtomPackage: (metadata) ->
    metadata?.engines?.atom?.length > 0

  isAtomCore: (metadata) ->
    metadata?.name is 'atom'

  isEditingAnAtomPackageFile: (editor) ->
    editorPath = editor.getPath()
    if editorPath?
      parsedPath = path.parse(editorPath)
      if path.basename(parsedPath.dir) is '.atom'
        if parsedPath.base is 'init.coffee' or parsedPath.base is 'init.js'
          return true
    for directory in @packageDirectories ? []
      return true if directory.contains(editorPath)
    false

  loadCompletions: ->
    @completions ?= {}

    fs.readFile path.resolve(__dirname, '..', 'completions.json'), (error, content) =>
      return if error?
      @completions = JSON.parse(content)

  getCompletions: (line) ->
    completions = []
    match =  propertyPrefixPattern.exec(line)?[1]
    if !match && line.indexOf('.') > 0
      x = line.split('.')
      for completion in @completions['functions'] when not prefix or firstCharsEqual(completion.name, x[x.length - 1])
        completions.push(clone(completion))
      return completions

    return completions unless match
    return completions unless @ember_class

    segments = match.split('.')
    prefix = segments.pop() ? ''
    segments = segments.filter (segment) -> segment
    property = segments[segments.length - 1]

    propertyCompletions = @completions[@ember_class][property] ? []

    for completion in propertyCompletions when not prefix or firstCharsEqual(completion.name, prefix)
      completions.push(clone(completion))
    completions

  getPropertyClass: (name) ->
    atom[name]?.constructor?.name

  loadProperty: (propertyName, className, classes, parent) ->
    classCompletions = classes[className]
    return unless classCompletions?

    @completions[propertyName] = completions: []

    for completion in classCompletions
      @completions[propertyName].completions.push(completion)
      if completion.type is 'property'
        propertyClass = @getPropertyClass(completion.name)
        @loadProperty(completion.name, propertyClass, classes)
    return

clone = (obj) ->
  newObj = {}
  newObj[k] = v for k, v of obj
  newObj

firstCharsEqual = (str1, str2) ->
  str1[0].toLowerCase() is str2[0].toLowerCase()
