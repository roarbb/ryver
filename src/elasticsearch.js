import config from './config.json';

const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
  host: config.elasticsearch.host,
  log: 'trace'
});

export default client
