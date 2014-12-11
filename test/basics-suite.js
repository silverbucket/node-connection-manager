if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(['require'], function (require) {
  var suites = [];

  suites.push({
    name: "ConnectionManager tests",
    desc: "initialize and test the results of the ConnectionManager singleton",
    abortOnFail: true,
    setup: function(env, test) {
      env.platform = 'test';
      var connectionManager = require('./../index');
      env.namespace1 = 'namespace1';
      env.namespace2 = 'namespace2';

      env.cm1 = connectionManager(env.namespace1, {
        id: 'cm1',
        foo: 'bar cm1'
      });

      env.cm2 = connectionManager(env.namespace1, {
        id: 'cm2',
        foo: 'bar cm2'
      });

      env.cm3 = connectionManager(env.namespace1, {
        id: 'cm3',
        foo: 'bar cm3'
      });

      env.cm4 = connectionManager(env.namespace2, {
        id: 'cm4',
        foo: 'bar cm4'
      });

      test.assertType(env.cm3, 'object');
    },

    tests: [
      {
        desc: 'get something that doesnt exist',
        run: function (env, test) {
          test.assert(env.cm1.get('test-client'), undefined);
        }
      },

      {
        desc: '#__getScope',
        run: function (env, test) {
          test.assertTypeAnd(env.cm2.__getScope, 'function');
          var scope = env.cm2.__getScope();
          var exp = {
            id: 'cm2',
            foo: 'bar cm2'
          };
          test.assert(scope, exp);
        }
      },

      {
        desc: '# referenceCount 0',
        run: function (env, test) {
            test.assert(env.cm2.referenceCount('test-client'), 0);
        }
      },

      {
        desc: '# create a client [cm1]',
        run: function (env, test) {
          var checklist = {
            connect: false,
            disconnect: false,
            listenersConnect: false,
            listenersDisconnect: false
          };

          env.credentials = {
            'test-client': {
              hello: 'world'
            }
          };

          env.cm1.create({
            id: 'test-client',
            credentials: env.credentials['test-client'],
            listeners: {
              connect: function (obj) {
                this.scope.connected = true;
                checklist.listenersConnect = true;
                test.assertAnd(this.connection.myConnectionObject, true);
              },
              disconnect: function (obj) {
                this.scope.disconnected = true;
                checklist.listenersDisconnect = true;
                test.assertAnd(this.connection.myConnectionObject, true);
              }
            },
            connect: function (cb) {
              console.log('this: ', this);
              checklist.connect = true;
              test.assertAnd(this.scope.foo, 'bar cm1');

              var connectObj = {
                myConnectionObject: true
              };
              cb(null, connectObj);
            },
            addListener: function () {},
            removeListener: function () {},
            disconnect: function (cb) { cb(null); }
          }, function (err, client) {
            if (err) { test.result(false, err); }
            else { test.assertType(client.connection, 'object'); }
          });
        }
      },

      {
        desc: '# referenceCount 1',
        run: function (env, test) {
            test.assert(env.cm2.referenceCount('test-client'), 1);
        }
      },

      {
        desc: '# __getScope [cm1]',
        run: function (env, test) {
          var scope = env.cm1.__getScope();
            test.assert(scope.foo, 'bar cm1');
        }
      },

      {
        desc: '# referenceCount 1 [cm1]',
        run: function (env, test) {
            test.assert(env.cm1.referenceCount('test-client'), 1);
        }
      },

      {
        desc: '# get [cm2]',
        run: function (env, test) {
            test.assertType(env.cm2.get('test-client', env.credentials['test-client']), 'object');
        }
      },

      {
        desc: '# referenceCount 2 [cm3]',
        run: function (env, test) {
            test.assert(env.cm3.referenceCount('test-client'), 3);
        }
      },

      {
        desc: 'fetch client without creds',
        run: function (env, test) {
          var client;
          try {
            client = env.cm1.get('test1', {});
          } catch (e) {
            test.result(false, e);
          }
          test.assertType(client, 'object');
        }
      },

      {
        desc: 'add a client with credentials',
        run: function (env, test) {
          try {
            env.cm1.add('test-client-2', {
              disconnect: function () {},
              credentials: {
                pepper: 'salt',
                ketchup: 'mustard',
                yo: [ 'one', 'two', 'three' ],
                deep: {
                  objects: 'that',
                  are: 'deep',
                  and: {
                    deeper: true
                  }
                }
              }
            });
            test.result(true);
          } catch (e) {
            test.result(false, e);
          }
        }
      },

      {
        desc: 'fetch client with creds. cm1',
        run: function (env, test) {
          try {
            var client = env.cm1.get('test-client-2', {
              pepper: 'salt',
              ketchup: 'mustard',
              yo: [ 'one', 'two', 'three' ],
              deep: {
                objects: 'that',
                are: 'deep',
                and: {
                  deeper: true
                }
              }
            });
            test.assertType(client, 'object');
          } catch (e) {
            test.result(false, e);
          }
        }
      },

      {
        desc: 'fetch client with creds. cm2',
        run: function (env, test) {
          try {
            var client = env.cm2.get('test-client-2', {
              pepper: 'salt',
              ketchup: 'mustard',
              yo: [ 'one', 'two', 'three' ],
              deep: {
                objects: 'that',
                are: 'deep',
                and: {
                  deeper: true
                }
              }
            });
            test.assertType(client, 'object');
          } catch (e) {
            test.result(false, e);
          }
        }
      },

      {
        desc: 'get count on test-client-2',
        run: function (env, test) {
          try {
            var count = env.cm1.referenceCount('test-client-2');
            console.log('COUNT: '+count);
            test.assert(count, 2);
          } catch (e) {
            test.result(false, e);
          }
        }
      },

      {
        desc: 'remove one listener',
        run: function (env, test) {
          try {
            env.cm1.remove('test-client-2');
            test.result(true);
          } catch (e) {
            test.result(false, e);
          }
        }
      },

      {
        desc: 'get count on test-client-2 again',
        run: function (env, test) {
          try {
            var count = env.cm1.referenceCount('test-client-2');
            console.log('COUNT: '+count);
            test.assert(count, 1);
          } catch (e) {
            test.result(false, e);
          }
        }
      }

    ]

  });

  return suites;
});
