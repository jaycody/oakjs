import React, { PropTypes } from "react";
import { Route } from "react-router";
import classNames from "classnames";
import { autobind } from "core-decorators";

import { getPath, setPath } from "./path";

// Import custom CSS for all cards.
import "./Card.css";

export default class OakCard extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    title: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
  }

  static contextTypes = {
    project: PropTypes.any,
    stack: PropTypes.any,
  }

  static childContextTypes = {
    card: PropTypes.any,
    components: PropTypes.any
  };

  getChildContext() {
    return { card: this, components: this.components };
  }

  //////////////////////////////
  // Constructor / initial state stuff
  //////////////////////////////

  constructor() {
    super(...arguments);

    this.data = this.getInitialData();
  }

  // Return `data` for your card, which will be stored in `card.state.data`.
  // NOTE: this should always return a new object,
  //  as data may get modified when the card is in use.
  getInitialData() {
    return {};
  }

  @autobind
  getData(path, defaultValue) {
    const value = getPath(this.data, path);
    if (value === undefined && defaultValue !== undefined) setPath(this.data, path, defaultValue);
    return (value !== undefined ? value : defaultValue);
  }

  @autobind
  setData(path, value) {
    // Don't update if value hasn't actually change
    const currentValue = this.getData(path);
    if (value === currentValue) return;

    setPath(this.data, path, value);
    this.forceUpdate();
  }

  @autobind
  deferredSetData(path, value) {
    return () => {
      this.setData(path, value);
    }
  }


  // Add a `card` to a `stack` at `index`.
  // ASSUMES: `card.components` has already been set up if necessary.
  // ASSUMES: That this is being called from `stack.initializeStack()`
  static initialize({ stack, cardIndex } = {}) {
    const card = this;
    if (stack !== undefined) card.stack = stack;
    if (cardIndex !== undefined) card.cardIndex = cardIndex;
console.info("card after initializing: ", card);
    return card;
  }

  //////////////////////////////
  // Syntactic sugar for deriving stuff
  //////////////////////////////
  static get project() { return this.stack.project }
  static get id() { return this.defaultProps.id }
  static get title() { return this.defaultProps.title }
  static get path() { return this.stack.path + "/" + this.id }
  static get prev() { return this.stack.cards[this.cardIndex - 1] }
  static get next() { return this.stack.cards[this.cardIndex + 1] }
  static get route() { return <Route path={this.id} component={this}/> }
  // All card-accessible components, including card, stack, project and theme
  // NOTE: if your card has specific components, do the following in your `card.jsx`:
  //    import * as components from "./components";
  //    export default class MyCard extends Card {
  //      static _components = components;
  //      ...
  //     }
  static get components() { return Object.assign({}, this.stack.components, this._components) }

  //////////////////////////////
  // Syntactic sugar for treating static things like instance things.
  //////////////////////////////

  // Return the project / stack CONSTRUCTORS (NOT instances).
  // (Really only useful for calling static methods).
  get stack() { return this.constructor.stack }
  get project() { return this.stack.project }
  get components() { return this.constructor.components }

  // Reflection
  get id() { return this.constructor.id }
  get title() { return this.constructor.title }
  get path() { return this.constructor.path }

  // Return the PATH for the previous/next cards.
  // Returns `undefined` if we're at one end or the other.
  get prevCard() {
    const prev = this.constructor.prev;
    return (prev ? prev.path : undefined);
  }
  get nextCard() {
    const next = this.constructor.next;
    return (next ? next.path : undefined);
  }


  //////////////////////////////
  // Rendering
  //////////////////////////////

  render() {
    const components = this.components;
    const params = {
  		card: this,
  		get: this.getData,
  		set: this.deferredSetData,
  		stack: this.context.stack,
  		project: this.context.project,
  		components,
  		c: components
  	};

window.card = this;
window.params = params;
//console.dir(params);

    const children = this.renderChildren(params);

    const { id, className, style } = this.props;
    const cardProps = {
      id,
      className: classNames("oak Card", className),
      style
    };
  	return React.createElement("div", cardProps, children);
  }

}
