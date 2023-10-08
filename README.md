# replace-replit

Use some of Replit's features in your project without hosting on Replit.

## Usage

### ReplAuth

The ReplAuth module only supports express and socket.io currently.

```js
import { auth } from "replace-replit";
import express from "express";
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);
app.use(auth.express());

app.get('/', (req, res) => {
  const username = req.get("X-Replit-User-Name");

  if (username)
    res.send(`Hello, ${username}!`);
  else
    res.send(`Hello, World!`);
});

io.use(auth.socketIo({ exposeAs: "user" }))

io.on('connection', (socket) => {
  console.log('connection from', socket.user.name)
})

server.listen(8000, () => {
  console.log("App is running on port 8000");
});
```

### ReplDB

The ReplDB module only supports express and socket.io currently.

```js
// server.js
import { db } from "replace-replit";
import express from "express";

const app = express();
app.use(db.express({
  file: "database.json",
  fileType: "json"
}));

app.listen(8000, () => {
  console.log("App is running on port 8000");
});

// test.js
import Database from "@replit/database";

const db = new Database("localhost:8000");

await db.set("hello", "world")

await db.get("hello") // world
```

## Options

### ReplAuth
Currently there is only one option passable to the `auth` middleware:

`exposeAs` will allow you to control what an object containing the user data will be set to:

```js
app.use(auth.express({ exposeAs: "user" }))

// In a route handler...
req.user.name // contains the user's username
```

### ReplDB
There are 4 options passable to the `db` middleware:

`file`: Controls what file your database will be saved to.
`fileType`: Controls what type your file will use. Values can either be `json`, `toml`, `ini`, or `custom` (see below):

`parse`: Function that takes two arguments, data (the file contents) and fileType (the fileType passed to the middleware).

```js
db.express({
  // ...
  parse(data, fileType) {
    if (fileType == "...") {
      // do stuff
      return TheResultingDataInAnObject
    } else {
      throw new Error('i dunno what this file type is')
    }
  }
})
```

`stringify`: Function that takes two arguments, data (the current db object) and fileType (the fileType passed to the middleware).

```js
db.express({
  // ...
  stringify(data, fileType) {
    if (fileType == "...") {
      // do stuff
      return TheResultingDataInAString
    } else {
      throw new Error('i dunno what this file type is')
    }
  }
})
```

# Acknowledgements

[PotentialStyx](https://replit.com/@PotentialStyx) - Helped me with verifying the JWT  
[PikachuB2005](https://replit.com/@PikachuB2005) - Donated the package name to me  
[coding398](https://replit.com/@codingMASTER398) - Cool tester + has great ideas + bug fixer
[DillonB07](https://replit.com/@DillonB07) - Helped on the README
