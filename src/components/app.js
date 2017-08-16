const Preact = require("preact");

import Promise from 'promise-polyfill';

const HTML = require("./html");
const Australia = require("./australia");

const styles = require("./app.scss");

// Promise polyfill
if (!window.Promise) {
  window.Promise = Promise;
}

class App extends Preact.Component {
  render() {
    return (
      <div class={styles.wrapper}>
        <Australia />
      </div>
    );
  }
}

module.exports = App;
