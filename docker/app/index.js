var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

const mysql = require('mysql');
const log4js = require('log4js')

log4js.configure({
  appenders : {
    system : {type : 'file', filename : '/tmp/system.log'}
  },
  categories : {
    default : {appenders : ['system'], level : 'debug'},
  }
});
const logger = log4js.getLogger('system');


const connection = mysql.createConnection({
  host: 'telepath-db',
  user: 'root',
  password: '',
  database: 'telepath'
});

connection.connect((err) => {
  if (err) {
      logger.debug('error connecting: ' + err.stack)
      return;
  }
  logger.debug('success')
});

var msg_db;
connection.query(
  'SELECT * FROM chat_line',
  (error, results) => {
    msg_db = results;
  }
);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
  io.emit('chat message', msg_db);
});

io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
