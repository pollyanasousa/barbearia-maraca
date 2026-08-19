const pool = require('./src/config/db');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Erro ao conectar:', err);
  } else {
    console.log('Conexão OK:', res.rows[0]);
  }
  pool.end();
});