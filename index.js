const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  }
});

const db = new sqlite3.Database('./drawings.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

db.run(`CREATE TABLE IF NOT EXISTS drawings(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  startX REAL,
  startY REAL,
  endX REAL,
  endY REAL,
  penSize INTEGER,
  isEraser INTEGER
)`, (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Drawings table created.');
});

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('load', () => {
    console.log('Load event received');
    let sql = `SELECT startX, startY, endX, endY, penSize, isEraser FROM drawings`;
    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error('Error while loading data:', err.message);
        return;
      }
      socket.emit('load', rows);
    });
  });

  socket.on('draw', (data) => {
    console.log('Received draw event with data:', data);

    db.run(
      `INSERT INTO drawings(startX, startY, endX, endY, penSize, isEraser) VALUES(?, ?, ?, ?, ?, ?)`,
      [data.startX, data.startY, data.endX, data.endY, data.penSize, data.isEraser],
      function (err) {
        if (err) {
          console.error('Failed to insert data into the database:', err);
          return;
        }
        console.log(`A row has been inserted with rowid ${this.lastID}`);
      }
    );
    socket.broadcast.emit('draw', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(3000, () => console.log('Listening on port 3000'));

process.on('exit', () => {
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Close the database connection.');
  });
});
