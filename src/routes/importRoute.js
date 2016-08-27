import { Router } from 'express';
import { Exporter } from '../models/exporter'
import Es from '../elasticsearch'

export default ({ config, db, app }) => {
	let importApi = Router();

	importApi.get('/ping', function(req, res) {
		Es.ping({
			requestTimeout: 30000,
			hello: "elasticsearch"
		}).then(response => res.json(response))
  });

	return importApi;
}
