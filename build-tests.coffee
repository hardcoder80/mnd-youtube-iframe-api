###
Note - operations are synchronous so that this
plays nicely with the rest of the makefile
###

# Only necessary because spec files are in a flattened
# directory structure
SPEC_FILE_CONVENTION = /\.coffee$/
eco = require './node_modules/eco'
fs  = require 'fs'

buildDir = process.argv[2] or __dirname + '/test/build/'

template = fs.readFileSync __dirname + '/test/phantom.eco', 'utf-8'

files = fs.readdirSync __dirname + '/test/'
filenames = []

for file in files
  fileName = file
  if fileName.match SPEC_FILE_CONVENTION
    filenames.push 'js/test/' + file.replace('coffee', 'js')

fs.writeFileSync buildDir + 'index.html', (eco.render template, { filenames: filenames })
