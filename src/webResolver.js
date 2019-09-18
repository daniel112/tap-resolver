const fs = require('fs')
const path = require('path')
const { isFunc } = require('jsutils')

/**
 * Checks all passed in extentions with the file path
 * If a file is found with the path and extention, return it
 * @param {string} fullPath - Path to the file to load
 * @param {Array} [extensions=[]] - All allowed extentions
 *
 * @returns {string} - Found file path
 */
const findAliasPath = (fullPath, extensions=[]) => {

  const usePath = fs.existsSync(`${fullPath}`)
    ? fullPath
    : extensions.reduce((foundPath, ext) => {

      // If the path is already found, just return it
      if(foundPath) return foundPath 

      // Built the path with the extention
      const withExt = `${fullPath}${ext}`

      // Check the extention exists and return it
      return fs.existsSync(withExt) && withExt || undefined
    }, undefined)

  return usePath
}

/**
 * Finds the correct path to a file when in a web context
 *
 * @param {string} sourcePath - Path used in import or require
 * @param {string} currentFile - file that's trying to import
 * @param {Object} opts - original options passed to the babel module-resolver plugin
 *
 * @returns {string} - path to file ( from clients directory || core/base directory )
 */
module.exports = (sourcePath, currentFile, opts) => {
  // Split the path to get the alias
  // Aliases should always be 'alias/path/to/sub/file'
  // So the first item in the split should be the Alias
  const [ aliasKey, ...pathToFile ] = sourcePath.split('/')
  const alias = opts.alias[aliasKey]
  // If no alias exists, just return undefined
  if(!alias) return

  // If alias is a function call it, otherwise build the path to the file
  return isFunc(alias)
    ? alias([ aliasKey, pathToFile.join('/') ])
    : findAliasPath(path.join(alias, ...pathToFile), opts.extensions)

}