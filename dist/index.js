"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ldapjs = _interopRequireDefault(require("ldapjs"));

var _cleanEntry = _interopRequireDefault(require("./lib/cleanEntry"));

var _addListenerIfNotAdded = _interopRequireDefault(require("./lib/addListenerIfNotAdded"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A simple LDAP query machine
 */
class SimpleLDAPSearch {
  constructor({
    url,
    base,
    dn,
    password
  }) {
    this.config = {
      url,
      base,
      dn,
      password
    };
    this.client = _ldapjs.default.createClient({
      url
    });
    this.isBoundTo = null;
    this.isBinding = false;
    this.queue = [];
  }
  /**
   * destroys the ldap client
   */


  destroy() {
    if (this.client) {
      this.client.destroy();
      this.client = null;
    }

    this.isBoundTo = null;
  }

  bindDN() {
    const self = this;
    const {
      dn,
      password
    } = this.config;
    return new Promise((resolve, reject) => {
      // handle case where ldapjs client emits 'error' event
      // e.g. if a bad URL is given
      (0, _addListenerIfNotAdded.default)(self.client, 'error', reject);

      if (!dn || !password) {
        return reject(new Error('No bind credentials provided'));
      }

      if (this.isBoundTo === dn) {
        return resolve();
      }

      if (this.isBoundTo && this.isBoundTo !== dn) {
        return reject(new Error(`bound to different dn: ${dn}`));
      }

      if (this.isBinding) {
        // put this resolve function on the queue
        // to be called when binding completes
        return this.queue.push(resolve);
      }

      self.isBinding = true;
      return this.client.bind(dn, password, (err, res) => {
        if (err) return reject(err);
        self.isBinding = false;
        self.isBoundTo = dn; // resolve everything on this.queue

        self.queue.forEach(fn => fn());
        self.queue = [];
        return resolve(res);
      });
    });
  }
  /**
   * searches ldap. Will autobind if
   * this.config.dn and this.config.password are set.
   */


  async search(filter = '(objectclass=*)', attributes) {
    const self = this;
    const opts = {
      scope: 'sub',
      filter,
      attributes
    };
    const results = []; // bind if not bound

    await self.bindDN();
    return new Promise((resolve, reject) => {
      // handle case where ldapjs client emits 'error' event
      (0, _addListenerIfNotAdded.default)(this.client, 'error', reject);
      self.client.search(self.config.base, opts, (err, res) => {
        if (err) {
          return reject(new Error(`Search failed: ${err.message}`));
        }

        return res.on('searchEntry', entry => results.push((0, _cleanEntry.default)(entry.object))).once('error', resError => {
          return reject(new Error(`Search error: ${resError}`));
        }).once('end', () => resolve(results));
      });
    });
  }

}

exports.default = SimpleLDAPSearch;