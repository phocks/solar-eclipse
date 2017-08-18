const Preact = require("preact");

// import Promise from 'promise-polyfill';

const HTML = require("./html");
const Australia = require("./australia");
const World = require("./world");

const styles = require("./app.scss");

// Promise polyfill
// if (!window.Promise) {
//   window.Promise = Promise;
// }

class App extends Preact.Component {
  render() {
      const { type } = this.props;

      if (type === "australia") {
          return <Australia  />;
      } else {
          // return <World />;
      }
  }
}

module.exports = App;
