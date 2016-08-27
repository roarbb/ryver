import { mkdirSync } from '../lib/util'

export class Exporter {

  constructor(db, exportFolder, limit = 2000) {
    this.limit = limit
    this.offset = 0
    this.fileNumbering = 1
    this.db = db
    this.fs = require('fs')
    this.exportFolder = `export/${exportFolder}`

    mkdirSync('export')
    mkdirSync(this.exportFolder)
  }

  exportMysql() {
    this.getExportPromise().then(({finished}) => {
      if(!finished) {
        this.exportMysql()
      }
    }).catch(err => console.log(err))
  }

  getExportPromise() {
    return new Promise((resolve, reject) => {
      if(this.offset === 0) console.time("MySQL export")

      let sql = `
        select videos.videoID
        from switch_content.videos
        limit ${this.limit} offset ${this.offset}`

      this.db.query(sql, (err, results, fields) => {
        if(err) reject(err)

        if(results === undefined) {
          reject("No results.")
          return
        }

        if(!results.length) {
          console.timeEnd("MySQL export")
          resolve({finished: true})
          return
        }

        results.map(row => {
          this.fs.appendFile(
            `${this.exportFolder}/${this.fileNumbering}.json`,
            JSON.stringify(row)
          )
          this.offset++
        })

        this.fileNumbering++
        resolve({finished: false})
      });
    })
  }
}
