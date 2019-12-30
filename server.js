// server.js
// where your node app starts

// init project
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// init sqlite db
var fs = require("fs");
var dbFile = "./.data/sqlite.db";
var exists = fs.existsSync(dbFile);
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(dbFile);

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(function() {
  if (!exists) {
    db.run("CREATE TABLE Notes (primary_key INTEGER PRIMARY KEY, body TEXT, time_created TEXT)");
    console.log("New table Dreams created!");

    // insert default dreams
    db.serialize(function() {
      db.run(
        'INSERT INTO Notes (body, time_created) VALUES (("Find and count some sheep"), (datetime("now"))'
      );
    });
  } else {
    console.log('Database "Notes" ready to go!');
    db.each("SELECT * from Notes", function(err, row) {
      if (row) {
        console.log("record:", row);
      }
    });
  }
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

// endpoint to get all the notes in the database
// currently this is the only endpoint, ie. adding dreams won't update the database
// read the sqlite3 module docs and try to add your own! https://www.npmjs.com/package/sqlite3
app.get("/api/get/notes", function(request, response) {
  db.all("SELECT * from Notes", function(err, rows) {
    response.send(JSON.stringify(rows));
  });
});

app.post("/api/post/note", function(request, response) {
  var note = request.body.note;
  if (!note) {
    console.log("Received incomplete POST: "+JSON.stringify(request.body));
    return response.send({"status": "error", "message": "missing a parameter"});
  }
  console.log(`Adding a note to the database: ${note}`);
  db.serialize(function() {
    db.run('INSERT INTO Notes (body, time_created) VALUES (?, ?)', [note.toString(), new Date().toJSON()], (err, result) => {
      if (err) throw err;
      console.log(`1 record inserted.`);
    });
    db.all("SELECT * from Note", function(err, rows) {
      response.send(JSON.stringify(rows));
    });
  });
});

app.delete("/api/delete/notes", function(request, response) {
  db.serialize(function() {
    db.run('DELETE FROM Notes', (err, result) => {
      if (err) throw err;
      console.log(`dreams are gone.`);
    });
    db.all("SELECT * from Notes", function(err, rows) {
      response.send(JSON.stringify(rows));
    });
  });
});

app.put("/api/:id/", function(request, response) {
  // do stuff.
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
