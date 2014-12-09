node-connection-manager
=======================

Store and retreive active connections from multiple locations in your code-base, keep connection alive as long as there are references to it. Able to reconnect and manage listeners.


```javascript
var ConnectionShare = require('connection-share');
var cs = new ConnectionShare('<unique_string_namespace>');

cs.create({
  id: 'irc://user@irc.freenode.net',  // unique identifier
  timeout: 10000,   // time to wait before cancelling the connect operation
  credentials: {    // used to connect & re-connect
    nick: 'user',
    host: 'irc.freenode.net'
  },
  connect: function (key, credentials, cb) {
    conn.on('connect', function (connection) {
      cb(null, connection);
    });

    conn.on('error', function (err) {
      cb(err);
    });

    // attempting to connect...
    conn.open(credentials);
  },
  listeners: {
    join: function (object) {
      // joined channel
    },
    leave: function (object) {
      // left channel
    }
  },
  addListener: function (name, func) {
    // for each listener defined, the addListener function 
    // is called during a connect or reconnect.
    this.connection.on(name, func);
  },
  removeListener: function (name, func) {
    // for each listener defined, the removeListener function 
    // is called during a connect or reconnect.
    this.connection.off(name, func);
  },
  disconnect: function (cb) {
    // disconnect the connection
    this.connection.close();
    cb();
  }
},
function (err, client) {
  if (err) {
    // error during connection object creation
  }
  // connection object has been created
});
```
