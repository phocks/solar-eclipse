const Preact = require("preact");

import Promise from 'promise-polyfill';

const HTML = require("./html");
const Australia = require("./australia");
const World = require("./world");

const styles = require("./app.scss");

// Promise polyfill
if (!window.Promise) {
  window.Promise = Promise;
}

class App extends Preact.Component {
  render() {
    return (
      <div class={"u-richtext" + styles.wrapper}>
        <Australia />
        <p>This is some more paragraph text. Blah blah ABC stuff. Hello how are you today?</p>
        <World />
      </div>
    );
  }
}

module.exports = App;
