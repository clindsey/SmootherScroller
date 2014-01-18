require 'utils'

utils = moduleLibrary.get 'utils'

moduleLibrary.define 'Planet.Model', gamecore.Pooled.extend 'PlanetModel',
    create: (@seed) ->
      planetModel = @_super()

      planetModel.name = @generateName @seed

      planetModel

    generateName: (seed) ->
      syllableCount = Math.floor(utils.random(seed++) * 3) + 2

      nameParts = []

      for i in [0..syllableCount - 1]
        digraphIndex = Math.floor utils.random(seed++) * @digraphs.length
        nameParts.push @digraphs[digraphIndex]

      if utils.random(seed++) > 0.5
        digraphIndex = Math.floor utils.random(seed++) * @digraphs.length
        nameParts.push @digraphs[digraphIndex]
      else
        trigraphIndex = Math.floor utils.random(seed++) * @trigraphs.length
        nameParts.push @trigraphs[trigraphIndex]

      name = nameParts.join ''

      name.charAt(0).toUpperCase() + name.slice(1)

    isSensibleName: (name) ->
      name.match(/.*[aeiou]{3}.*/i) is null

    digraphs: [
      "a", "ac", "ad", "ar", "as", "at", "ax", "ba", "bi", "bo", "ce", "ci",
      "co", "de", "di", "e", "ed", "en", "es", "ex", "fa", "fo", "ga", "ge",
      "gi", "gu", "ha", "he", "in", "is", "it", "ju", "ka", "ky", "la", "le",
      "le", "lo", "mi", "mo", "na", "ne", "ne", "ni", "no", "o", "ob", "oi",
      "ol", "on", "or", "or", "os", "ou", "pe", "pi", "po", "qt", "re", "ro",
      "sa", "se", "so", "ta", "te", "ti", "to", "tu", "ud", "um", "un", "us",
      "ut", "va", "ve", "ve", "za", "zi"
    ]

    trigraphs: [
      "cla", "clu", "cra", "cre", "dre", "dro", "pha", "phi", "pho", "sha",
      "she", "sta", "stu", "tha", "the", "thi", "thy", "tri"
    ]
  ,
    dispose: ->
      @release()
