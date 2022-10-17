import path from 'path'
import fs from 'fs'

export const fetchCss = (folder: string, name: string = 'styles.css'): string => {
  return `<style id="page-styles">${fs.readFileSync(path.join(__dirname, `public/styles/${folder}/${name}`), 'utf8')}</style>`
}
