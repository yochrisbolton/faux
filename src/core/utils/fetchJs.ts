import path from 'path'
import fs from 'fs'

export const fetchJs = (folder: string, name: string = 'script.js'): string => {
  return `<script>${fs.readFileSync(path.join(__dirname, `templates/${folder}/${name}`), 'utf8')}</script>`
}
