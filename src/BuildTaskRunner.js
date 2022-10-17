const minify = require('csso')
const fs = require('fs-extra')
const path = require('path')
const glob = require('glob')
const sass = require('sass')
const spawn = require('child_process').spawn
const argv = require('minimist')(process.argv.slice(2))
let appRunning = false

/**
 * Add folders to watch for changes in
 *
 * Usecases:
 * - If we're in dev mode, we want to watch for any new files
 *   that are added to the project and move them over to the dist
 *   folder
 */
const foldersToWatch = [
  { path: 'templates', type: 'template', moveFunction: moveTemplatesAndJavascript },
  { path: 'javascript', type: 'javascript', moveFunction: moveTemplatesAndJavascript },
  { path: 'styles', type: 'scss', moveFunction: compileAndMoveScss }
]

/**
 * Goals:
 * - glob find SCSS, JS, TS, templates and static content
 * - watch for changes
 *   - if SCSS or TS, compile
 * - copy over to dist folder
 *
 */

/**
 * Make sure our folders exist
 */
function makeDistFolder () {
  fs.mkdirSync(path.join(__dirname, '../dist/templates'), { recursive: true })
  fs.mkdirSync(path.join(__dirname, '../dist/public/styles'), { recursive: true })
}

function findAndWatch (fileGlob, type, moveFunction, passAlongFiles = false) {
  glob(path.join(__dirname, fileGlob), {}, (_err, files) => {
    files.forEach(file => {
      // in case there is a path prefixed, lets lob it off
      file = file.split('src/')[1]

      if (passAlongFiles) {
        watchFileOrFolder(file, type, moveFunction, files)
      } else {
        watchFileOrFolder(file, type, moveFunction)
      }

      /** on first start */
      moveFunction(file)
    })
  })
}

/**
 * Find our SCSS in the project
 */
function findScss () {
  findAndWatch('/**/*.scss', 'scss', compileAndMoveScss, true)
}

/**
 * Find all ART templates in projects
 */
function findTemplates () {
  findAndWatch('/**/*.art', 'template', moveTemplatesAndJavascript)
}

/**
 * Find all JS in project
 */
function findJavaScript () {
  findAndWatch('/**/*.js', 'javascript', moveTemplatesAndJavascript)
}

/**
 * Watch static files in public/ or their sub
 * directories (such as javascript/ or images/)
 */

function watchPublicFolders () {
  /** on first load */
  movePublicFolderFile('static')

  watchFileOrFolder('static', 'static general', movePublicFolderFile)
}

/**
 * Watch file or folder for changes
 *
 * Watch and make a callback to a specified function
 * and (optionally) pass along a data object (mostly
 * just for SCSS usage, but may be handy in the future)
 *
 * @param {string} name the file or folder name
 * @param {string} type the file type (for error reporting)
 * @param {requestCallback} moveFunction the callback function when we find a change
 * @param {any} passAlongObject the optional data object to pass along to the function
 */
function watchFileOrFolder (name, type, moveFunction, passAlongObject = {}) {
  fs.watch(path.join(__dirname, name), function (eventType) {
    if (eventType === 'change') {
      try {
        if (passAlongObject !== {}) {
          moveFunction(name, passAlongObject)
        } else {
          moveFunction(name)
        }
      } catch (e) {
        console.log(`Error moving ${type}, please try again: ${e}`)
      }
    }
  })
}

function compileAndMoveScss (file, allScssFiles = []) {
  console.log(`Compiling SCSS file: ${file}`)
  if ((file.includes('components/') || file.includes('layouts/')) && allScssFiles.length > 0) {
    /**
     * If we're not a page we'll assume that we're instead a partial
     * or something, and since we don't really know what files are
     * using it (we *could* we just don't _now_) then we'll recompile
     * all found page SCSS files *just in case*
     */
    allScssFiles.forEach(file => {
      compileAndMoveScss(file)
    })
  } else if (file.includes('code/')) { // if were a page type, just compile that file alone
    /**
     * We want to change from:
     * - src/core/code/{module}/views/styles/{}.scss
     * To:
     * - (in dist/public) `styles/{page}/*.css
     * Because:
     * - its a nicer file path and makes things predictable
     */

    if (file.includes('src/')) {
      file = 'src/' + file.split('src/')[1]
    } else {
      file = 'src/' + file
    }

    const updatedFileName = file.replace('src/', '')
      .replace('core/', '')
      .replace('views/', '')
      .replace('styles/', '')
      .replace('app/code/', 'styles/')
      .replace('.scss', '.css')

    const exportPath = path.join(path.join(__dirname, '../dist/public/'), updatedFileName)
    const compiledCSS = sass.compile(path.join(file), { loadPaths: [path.join(__dirname, 'app')] })

    fs.mkdirSync(path.dirname(exportPath), { recursive: true })
    fs.writeFile(`${exportPath}`, minify.minify(compiledCSS.css).css)
  }
}

/**
 * Move pages, components and JS to better namespace in dist/
 *
 * If we were to use raw file path for namespace, it'd
 * start to feel a little repetitive. So instead when
 * we copy we adjust the name space so that its more
 * predictable and only includes the most relevant information
 *
 * Ex, from:
 * - core/code/{module}/views/templates/{template}.art
 * To:
 * - templates/pages/{module}/{template}.art
 *
 * @param {string} file
 */
function moveTemplatesAndJavascript (file) {
  if (file.includes('app/code')) {
    const moduleName = file.split('app/code')[1]
      .replace('views', '')
      .replace('templates', '')

    fs.copySync(path.join(__dirname, file), path.join(__dirname, '../dist/templates/pages/', moduleName))
  } else if (file.includes('components/')) {
    fs.copySync(path.join(__dirname, '/app/components'), path.join(__dirname, '../dist/templates/components/'))
  }
}

/**
 * Move new files over
 */
function movePublicFolderFile (file, type = '') {
  fs.copySync(path.join(__dirname, file), path.join(__dirname, `../dist/public/${type}`))
}

/**
 * On start
 * - find and watch all SCSS files
 * - find and watch all templates
 * - find and watch all js files
*/
makeDistFolder()
findScss()
findTemplates()
findJavaScript()
watchPublicFolders()

/**
 * Webpack and application bundling start here
 */

/**
 * Should we watch?
**/
const webpackArgs = ['node_modules/webpack/bin/webpack.js']
if (argv?.watch) {
  webpackArgs.push('--watch')
}

/**
 * Run webpack
 * - with or without watch
 *
 * On successful run, we'll start the server
**/
const webpack = spawn('node', webpackArgs)
webpack.stdout.on('data', function (data) {
  process.stdout.write(data)
  if (data.includes('successfully')) {
    if (!appRunning) {
      runApp()
    }
  }
})

webpack.stderr.on('data', function (data) {
  process.stderr.write(data)
})

/**
 * Run the application and pass along variables
 */
function runApp () {
  const bundle = spawn('nodemon', ['dist/bundle.js'], { env: process.env })

  appRunning = true

  bundle.stdout.on('data', function (data) {
    process.stdout.write(data)
  })

  bundle.stderr.on('data', function (data) {
    process.stderr.write(data)
  })
}
