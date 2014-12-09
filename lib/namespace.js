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

var Manager    = require('./manager.js');

module.exports = function (namespace) {

  var manager  = new Manager(namespace);

  return function (scope) {
    manager.__getScope = function () {
      return scope;
    };
    return manager;
  };
};
