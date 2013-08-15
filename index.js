module.exports = process.env.NODEIT_COV
  ? require('./lib-cov/nodeit')
  : require('./lib/nodeit')