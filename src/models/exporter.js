import { mkdirSync } from '../lib/util'
import config from '../config.json'

export class Exporter {

  constructor(db, alias, type, limit = 2000) {
    this.limit = limit
    this.db = db
    this.fs = require('fs')
    this.commonExportFolder = config.commonExportFolder
    this.alias = alias
    this.type = type
    this.exportFolder = `${this.commonExportFolder}/${this.alias}`

    mkdirSync(this.commonExportFolder)
    mkdirSync(this.exportFolder)
  }

  getCountSql() {
    return `
      select count(*) as count
      from switch_content.site_mapping sm
      left join switch_content.videos v using(videoID)
      where v.videoID is not null
      order by v.videoID DESC`;
  }

  getPromiseSql(limit, iterator) {
    return `
      select v.*, sm.siteID
      from switch_content.site_mapping sm
      left join switch_content.videos v using(videoID)
      where v.videoID is not null
      order by v.videoID DESC
      limit ${limit} offset ${limit*iterator}`
  }

  exportMysql() {
    const start = new Date()

    return new Promise((resolve, reject) => {
      let promises = []

      let sql = this.getCountSql()

      this.db.query(sql, (err, results) => {
        for(let i = 0; i <= results[0].count/this.limit; i++) {
          promises.push(this.getExportPromise(i, this.limit))
        }

        Promise.all(promises).then(log => {
          resolve({
            errors: false,
            execTime: `${new Date().getTime()-start.getTime()} ms`,
            docExported: results[0].count,
            // log
          })
        }).catch(err => {
          reject({errors: true, reason: err})
        })
      })
    })
  }

  getExportPromise(iterator, limit) {
    return new Promise((resolve, reject) => {
      let sql = this.getPromiseSql(limit, iterator)

        this.db.query(sql, (err, results, fields) => {
          if(err) reject(err)

          if(results === undefined) {
            reject("No results.")
            return
          }

          results.map(row => this.writeRow(row, iterator))

          resolve(`${this.exportFolder}/${iterator+1}.json created`)
        });
    })
  }

  writeRow(row, iterator) {
    this.fs.appendFile(
      `${this.exportFolder}/${iterator+1}.json`,
      `{ "index": { "_index": "${this.alias}", "_type": "${this.type}" } }\r\n`
      + `${JSON.stringify(row)}\r\n`
    )
  }
}
