'use strict'
const getLinkTarget = require('get-link-target')
const path = require('path')
const isSubdir = require('is-subdir')

module.exports = function (parent, relativePathToLink) {
  const linkPath = path.resolve(parent, relativePathToLink)
  return getLinkTarget(linkPath)
    .then(target => ({
      isInner: isSubdir(parent, target),
      target
    }))
}
