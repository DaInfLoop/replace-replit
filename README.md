# repl-auth

Use Replit's Repl Auth in your project without hosting on Replit.

## Usage

### Replit

Use this exactly how you'd use [`@replit/repl-auth`](https://npm.im/@replit/repl-auth):

```js
import { getUserInfo } from "repl-auth";
import express from "express";

const app = express();

app.get('/', (req, res) => {
  const user = getUserInfo(req);

  if (user)
    res.send(`Hello, ${user.name}!`);
  else
    res.send(`Hello, World!`);
});

app.listen(8000, () => {
  console.log("App is running on port 8000");
});
```

### Anywhere else

The module only supports express currently.

```js
import { express as replAuth } from "repl-auth";
import express from "express";

const app = express();
app.use(replAuth());

app.get('/', (req, res) => {
  const username = req.get("X-Replit-User-Name");

  if (username)
    res.send(`Hello, ${username}!`);
  else
    res.send(`Hello, World!`);
});

app.listen(8000, () => {
  console.log("App is running on port 8000");
});
```

## Options

Currently there is only one option passable to the `replAuth` middleware:

`exposeAs` will allow you to control what an object containing the user data will be set to:

```js
app.use(replAuth({ exposeAs: "user" }))

// In a route handler...
req.user.name // contains the user's username
```

# Acknowledgements

[PotentialStyx](https://replit.com/@PotentialStyx) - Helped me with verifying the JWT  
[PikachuB2005](https://replit.com/@PikachuB2005) - Donated the package name to me
[coding398](https://replit.com/@codingMASTER398) - Cool tester + has great ideas + bug fixer
