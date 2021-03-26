"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = addListenerIfNotAdded;

var _arrayIncludesFunction = _interopRequireDefault(require("./arrayIncludesFunction"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Adds an event listener to an emitter only if not already present
 *
 * @param {EventEmitter} eventEmitter - the event emitter we listen to
 * @param {String} eventName - the name of the event we're listening for
 * @param {Function} fn - the function to be invoked when event is emitted
 *
 * @example
 * new Promise((resolve, reject) => {
 *   addListenerIfNotAdded(ldapClient, 'error', reject);
 *   ...
 * })
 */
function addListenerIfNotAdded(eventEmitter, eventName, fn) {
  const listenersArray = eventEmitter.listeners(eventName);
  if ((0, _arrayIncludesFunction.default)(listenersArray, fn)) return;
  eventEmitter.on(eventName, fn);
}