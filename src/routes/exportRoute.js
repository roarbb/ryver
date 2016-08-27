import { Router } from 'express';
import { Exporter } from '../models/exporter'
import Es from '../elasticsearch'

export default ({ config, db, app }) => {
	let exportApi = Router();

  exportApi.get('/', function(req, res) {
		app.server.timeout = 0

		const TestExporter = new Exporter(db, 'test')

		TestExporter.exportMysql()
			.then(result => res.json(result))
			.catch(err => res.json(err))
  });

	exportApi.get('/ela', function(req, res) {
		Es.ping({
			requestTimeout: 30000,
			hello: "elasticsearch"
		}).then(response => res.json(response))
  });

	return exportApi;
}
