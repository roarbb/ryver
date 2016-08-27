import { Router } from 'express';
import { Importer } from '../models/importer'
import Es from '../elasticsearch'

export default ({ config, db, app }) => {
	let importApi = Router();

	importApi.get('/ping', (req, res) => {
		Es.ping({
			requestTimeout: 30000,
			hello: "elasticsearch"
		}).then(response => res.json(response))
  });

  importApi.get('/', (req, res) => {
    app.server.timeout = 0

    const TestImporter = new Importer('node_test', 'videos', Es)

    TestImporter.importFromFiles()
      .then(result => res.json(result))
      .catch(err => res.json(err))
  });

	return importApi;
}
