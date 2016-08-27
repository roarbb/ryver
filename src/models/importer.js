import config from '../config.json'
import mapping from '../mappings/default.json'

export class Importer {

  constructor(alias, type, elasticsearch) {
    this.alias = alias
    this.type = type
    this.elasticsearch = elasticsearch
    this.commonExportFolder = config.commonExportFolder
    this.fs = require('fs')
    this.exportFolder = `${this.commonExportFolder}/${this.alias}`
  }

  importFromFiles() {
    const start = new Date()

    return new Promise((resolve, reject) => {
      this.createElasticsearchIndex().then(() => {
        return this.getExportFiles()
      }).then(files => {
          let importPromises = []

          for (let fileName of files) {
            importPromises.push(this.getImportPromise(fileName))
          }

          Promise.all(importPromises).then(log => {
            resolve({
              errors: false,
              execTime: `${new Date().getTime()-start.getTime()} ms`,
              docExported: 4456,
              log
            })
          }).catch(err => {
            reject({errors: true, reason: err})
          })

        })
        .catch(err => reject({error: true, ...err}))
    })
  }

  getExportFiles() {
    return new Promise((resolve, reject) => {
      this.fs.readdir(this.exportFolder, (err, files) => {
        if(err) reject(err)

        resolve(files)
      })
    })
  }

  getImportPromise(fileName) {
    return new Promise((resolve, reject) => {
      this.fs.readFile(`${this.exportFolder}/${fileName}`, 'utf8', (err,data) => {
        if(err) reject(err)

        this.elasticsearch.bulk({
          requestTimeout: 3000000,
          body: [data]
        }).then(response => {
          return this.deleteFile(`${this.exportFolder}/${fileName}`)
        })
        .then(() => {
          resolve(`${fileName} imported and deleted`)
        })
        .catch(err => {
          reject(err)
        })
      });

    })
  }

  createElasticsearchIndex() {
    return new Promise((resolve, reject) => {
      this.elasticsearch.indices.create({
        index: this.alias,
        body: mapping
      }).then(response => resolve(response))
        .catch(err => reject(err))
    })
  }

  deleteFile(filePath) {
    return new Promise((resolve, reject) => {
      this.fs.unlink(filePath, err => {
           if (err) reject(err)

           resolve(`${filePath} deleted`)
      })
    })
  }
}
