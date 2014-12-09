/**
 * copyright 2012-2015 Nick Jennings (https://github.com/silverbucket)
 *
 * node-connection-share is licensed under the MIT license.
 * See the LICENSE file for details.
 *
 * The latest version of node-connection-share can be found here:
 *   git://github.com/silverbucket/node-connection-share.git
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

var objectAssert = require('object-assert'),
    ArrayKeys    = require('array-keys');


var ConnectionManager = (function (namespace, scope) {

  var clients = new ArrayKeys({
    identifier: 'id'
  });

  /**
   * Class: ConnectionManager
   *
   * The singleton object responsible for keeping a connection session alive for
   * retreival for anything claiming the same namespace. Tracking references, etc.
   *
   */
  function _ConnectionManager() {}

  function getScope(client) {
    return {
      id: client.id,
      credentials: client.credentials,
      connection: client.connection,
      scope: scope
    };
  }

  function registerListeners(client) {

    function listenerWrapper(listener) {
      return function () {
        var args = Array.prototype.slice.call(arguments);
        listener.apply(getScope(), args);
      };
    }

    var keys = Object.keys(client.listeners);
    for (var i = 0, len = keys.length; i < len; i += 1) {
      // wrapper for listener callbacks
      if (typeof client.indexedListeners[keys[i]] === 'undefined') {
        client.indexedListeners[keys[i]] = {}; // TODO use ArrayKey
      } else if (typeof client.indexedListeners[keys[i]][client.id + '__' + scope.id] !== 'undefined') {
        // scope already registered listeners
        continue;
      } else {
        // new scope, register listeners for it
        client.indexedListeners[keys[i]][client.id + '__' + scope.id] = listenerWrapper(client.listeners[keys[i]]);

        try {
          client.addListener.apply(getScope(), [keys[i], client.indexedListeners[keys[i]][client.id + '__' + scope.id]]);
        } catch (e) {
          throw new Error(e);
        }
      }
    }
  }

  /**
   * Function: create
   *
   * Manages the creation, listener registering, and removal of a client.
   *
   * Parameters:
   *
   *   o   - object containing a set of function callbacks for various states
   *         of the client.
   *   cb  - callback function when create is completed, params are:
   *         err (srting, client (object)
   *
   *  ---
   *
   *   o.id [string] - unique identifier of this client connection
   *
   *   o.timeout [number] - optionally specify the timeout in ms to abort the
   *                        connection attempt.
   *
   *   o.credentials [object]
   *         credential object to be used when issuing the connect
   *
   *   o.connect(cb) [function]
   *         called to establish a connection, should provide the the client
   *         connection object on cb.
   *
   *   o.listeners [object]
   *         an object of listeners, the property is the name of the listener,
   *         the value is a function to call when that listener event is fired.
   *
   *   o.addListener(name, func) [function]
   *         executed when the clientManager wants to add a listener (ie.
   *         during connect), the name/func pairs will be whatever you've
   *         described in the listeners(object).
   *
   *   o.removeListener(name, func) [function]
   *         called when the clientManager wants to remove a listener (ie.
   *         during a disconnect).
   *
   *   o.disconnect(cb) [function]
   *         called when the clientManager wants to completely destroy the
   *         connection.
   *
   */
  _ConnectionManager.prototype.create = function (o, cb) {

    console.log(' [client manager:create:' + namespace + '] called');

    if (typeof o !== 'object') {
      return cb('first parameter object not defined.');
    } else if (typeof cb !== 'function') {
      return cb('callback not defined.');
    }

    if ((typeof o.id !== 'string') ||
        (typeof o.credentials !== 'object') ||
        (typeof o.listeners !== 'object') ||
        (typeof o.addListener !== 'function') ||
        (typeof o.removeListener !== 'function') ||
        (typeof o.disconnect !== 'function')) {
      return cb('properties of object must be: connect(function [' + typeof o.connect + ']) ' +
                'listeners(object [' + typeof o.listeners + ']) addListener(function [' + typeof o.addListener + ']) ' +
                'removeListener(function [' + typeof o.removeListener + ']) disconnect(function [' + typeof o.disconnect + '])');
    }

    o.timeout = (typeof o.timeout === 'number') ? o.timeout : 6000;

    var client = {
      id: o.id,
      credentials: o.credentials,
      connect: o.connect,
      listeners: o.listeners,
      indexedListeners: {},
      addListener: o.addListener,
      removeListener: o.removeListener,
      disconnect: o.disconnect,
      connection: undefined
    };

    // call provided connect function
    o.connect.apply(getScope(client), [function (err, c) {
      if (err) {
        // error with client connection
        return cb(err);
      }
      client.connection = c;

      registerListeners(client);

      _ConnectionManager.prototype.add(client);

      cb(null, client);
    }]);
  };

  /**
   * Function: get
   *
   * Given an ID and credential object, the get function will send back an existing
   * client object if one was found under the given key name, and also if the
   * credential objects match.
   *
   * Parameters:
   *
   *   id       - unique name to lookup client
   *   credentials - credential object set by client for the session.
   *
   * Returns:
   *
   *   client object, undefined (no client found) or false (credentials don't match)
   */
  _ConnectionManager.prototype.get = function (id, credentials) {
    var client = clients.getRecord(id);
    if (! client) {
      return undefined;
    }

    if (! credentials) {
      credentials = {};
    }

    //
    // compare clients credentials with current sessions
    //
    if (objectAssert(credentials, client.credentials)) {
      //
      // credential match for client, return client object
      //
      client.references.addRecord(session);
      console.info('credentials match, returning existing client. count: ' +
                   _ConnectionManager.prototype.referenceCount(id));

      clients[platform].addRecord(record);
      return registerListeners(key, client, session);
    } else {
      console.log('credentials do not match, rejecting');
      return false;
    }
  };


  /**
   * Function: add
   *
   * adds a client to the index based on key. incrementing the reference count
   * for already added clients.
   *
   * Parameters:
   *
   *   key - unique name to lookup client
   *   client - the client object that contains the connection
   *
   */
  // _ConnectionManager.prototype.add = function (id) {
  //   var record = clients.getRecord(id);
  //   var completeRecord;

  //   if (!record) {
  //     // adding new record, verify it has some basic things
  //     if (typeof client.disconnect !== 'function') {
  //       throw new Error('client must provide an disconnect() function');
  //     }
  //     if (typeof client.credentials !== 'object') {
  //       throw new Error('client must provide a credentials object in order to' +
  //                       ' retreive the client object with another session, even if it\'s empty.');
  //     }

  //     // ensure key index
  //     client.key = key;

  //     // the client is actually a sub-object, so we make sure it also has key
  //     // and references here.
  //     completeRecord = {
  //       key: key,
  //       client: client,
  //       references: new ArrayKeys({
  //         identifier: 'sid'
  //       }),
  //       listeners: {}
  //     };
  //   } else {
  //     completeRecord = record;
  //   }

  //   completeRecord.references.addRecord(session);
  //   clients[platform].addRecord(completeRecord);
  // };


  /**
   * Function: remove
   *
   * removes the client completely if there are no more references, otherwise,
   * it decrements the reference count by 1
   *
   * there is a 20s delay for complete removal of the object, to account for
   * page refreshes.
   *
   * Parameters:
   *
   *   key - unique name to lookup client
   *
   */
  _ConnectionManager.prototype.remove = function (session, key) {
    var platform  = session.platform,
        sessionId = session.getSessionID();

    ensureIndex(platform);

    var record = clients[platform].getRecord(key);
    if (record) {
      // first thing is we decrese the count by removing the session
      record.references.removeRecord(sessionId);
    } else {
      return;
    }

    console.debug(' [client manager:remove:' + namespace +
                  '] removal of ' + key + '. decreased count: ' +
                  _ConnectionManager.prototype.referenceCount(platform, key));
                  // , clients[platform]);

    if (_ConnectionManager.prototype.referenceCount(platform, key) <= 0) {
      //
      // if the removal of our session reference brings the count to 0, then we
      // initiate the timeout for actual removal check
      //
      setTimeout(function () {
        // console.log('ATTEMPTING CHECK: ['+platform+']['+key+']: ', clients[platform]);
        if ((!clients[platform]) || (!clients[platform][key])) {
          console.warn(' [client manager:remove] skipping duplicate removals, should not arrive here');
        } else if (_ConnectionManager.prototype.referenceCount(platform, key) <= 0) {
          // disconnect client
          try {
            console.info(' [client manager:remove:' + namespace +
                         '] ending client ' + key);
            console.debug(' [client manager:remove] references: ', record.references.getIdentifiers());
            record.client.disconnect.apply({session: session}, record.client, key, function () {
              try {
                //delete record.client;
                //record.listeners = 0;
                clients[platform].removeRecord(record.key);
                //delete clients[platform][key].listeners;
                //delete clients[platform][key];
              } catch (e) {
                console.error(e);
              }
            });
          } catch (e) {
            console.error(' [client manager:remove] client.disconnect() failed: ', e);
            throw new Error(e);
          }
        } else {
          // someone jumped on and grabbed this client
          console.debug(' [client manager:remove:' + namespace +
                        '] client \'' + key + '\' spoken for, aborting removal.');
        }
      }, 20000); // delay for 20s
    }
  };



  /**
   * Function: move TODO
   *
   * moves a client object from one key lookup to another, useful for cases
   * where the 'key' is a username that changes after the initial creation of
   * the client object
   *
   * Parameters:
   *
   *   oldkey    - existing key to retreive the client object
   *   oldcreds  - credential object set by client for the session, (can be
   *               retreived within a platform with session.getConfig('credentials'))
   *   newkey    - new key to move the client object to
   *   newcreds  - [optional] updated credential object, if not specified existing
   *               credentials will remain unchanged
   *
   * Returns:
   *
   *   boolean
   */
  _ConnectionManager.prototype.move = function (session, oldkey, oldcreds, newkey, newcreds) {
    var platform  = session.platform,
        sessionId = session.getSessionID();

    if ((!oldkey) || (!newkey) || (!oldcreds)) {
      console.error(' [client manager:move:' + namespace +
                    '] move needs at least three parameters oldkey, credentials, and newkey');
      return undefined;
    }

    console.debug(' [client manager:move:' + namespace +
                    '] attempting move of '+oldkey+ ' to '+newkey, oldcreds);

    var client = _ConnectionManager.prototype.get(session, oldkey, oldcreds);

    if (!client) {
      return false;
    }

    if (newcreds) {
      client.credentials = newcreds;
    }

    //delete client.credentials.sessionId;
    //delete client.credentials.rid;
    var oldRecord   = clients[platform].getRecord(oldkey);
    var references  = oldRecord.references;
    var listeners   = oldRecord.listeners;

    var newRecord = {
      key: newkey,
      client: client,
      references: references,
      listeners: listeners
    };
    clients[platform].addRecord(newRecord);

    clients[platform].removeRecord(oldkey);
    // delete clients[platform][oldkey].client;
    // clients[platform][oldkey].listeners = 0;
    // delete clients[platform][oldkey].listeners;
    // delete clients[platform][oldkey];

    return true;
  };


  /**
   * Function: exists
   *
   * returns a boolean indicating whether or not the given ID exists
   *
   * Parameters:
   *
   *   id - unique name to lookup
   *
   * Returns:
   *
   *   boolean
   */
  _ConnectionManager.prototype.exists = function (id) {
    return clients.exists(id);
  };


  /**
   * Function: referenceCount
   *
   * returns number of refernences for a given ID
   *
   * Parameters:
   *
   *   id - unique id to get reference count on
   *
   * Returns:
   *
   *   number
   */
  _ConnectionManager.prototype.referenceCount = function (id) {
    var client = clients.getRecord(id);
    if (! client) {
      return 0;
    }
    return client.references;
  };


  /**
   * Function: getIDs
   *
   * returns all IDs existing within the namespace
   *
   * Parameters:
   *
   *   none
   *
   * Returns:
   *
   *   array of strings
   */
  _ConnectionManager.prototype.getKeys = function () {
    return clients.getIdentifiers();
  };


  /**
   * Function: removeListeners TODO
   *
   * given a key and connection name (the name of the connection object attached
   * to the client object. for exaple 'xmpp' is the name of the xmpp session
   * attached to the client in the platform module). The connection reference
   * should have a removeListener function on it.
   *
   * Parameters:
   *
   *   key - unique name to lookup client
   *
   * Returns:
   *
   *   return description
   */
  _ConnectionManager.prototype.removeListeners = function (session, key) {
    var platform  = session.platform,
        sessionId = session.getSessionID();
    console.debug(' [client manager:removeListeners:' + namespace + '] called: ' + key);

    ensureIndex(platform);

    if (!key) {
      console.error(' [client manager:removeListeners] requires a key paramater');
    }

    var record = clients[platform].getRecord(key);
    if ((!record) || (!record.client.listeners)) {
      return;
    }

    var client = record.client;

    //
    // if we have listeners for this session, we need to remove them
    // from the simple-xmpp eventemitter
    if (typeof client.listeners === 'object') {
      //console.log('CLIENT LISTENERS: ', client.listeners);
      for (var type in client.listeners) {
        //console.debug('CLIENT LISTENERS ['+type+']: ', client.conn.listeners(type));
        for (var listener in client.listeners[type]) {

          if (typeof client.listeners[type][listener] !== 'function') {
            console.error('[client manager:removeListeners] why isnt ['+listener+'] a function ? [' +
                          typeof client.listeners[type][listener] +
                          ']:', client.listeners[type][listener]);
          } else {
            if (typeof client.conn.removeListener !== 'function') {
              console.error(' [client manager:removeListeners:' + namespace + '] need a cliet[platform].removeListener function');
            } else {
              console.debug(' [client manager:removeListeners:' + namespace + '] removing ' + type +
                        ' event listeners for session [' + sessionId +
                        ']');
              client.conn.removeListener(
                      key,
                      type,
                      client.listeners[type][listener]
              );
            }
          }
          delete client.listeners[type][listener];
        }
      }
    }
  };

  return _ConnectionManager;
})();



var namespaces = new Arraykeys({
  identifier: 'namespace'
});

module.exports = function (namespace) {
  if (typeof session !== 'string') {
    throw new Error('ConncetionManager constructor called without valid namespace param (string)');
  }

  var connectionManager = namespaces.get(namespace);
  if (! connectionManager) {
    _cm = new ConnectionManager(namespace);
    connectionManager = namespaces.add(_cm);
  }

  return connectionManager;
};
