import { Router } from 'express';
import { Exporter } from '../models/exporter'

export default ({ config, db }) => {
	let exportApi = Router();

  exportApi.get('/', function(req, res) {
    const TestExporter = new Exporter(db, 'test')

		TestExporter.exportMysql()
  });

	return exportApi;
}
