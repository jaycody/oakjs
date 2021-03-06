//////////////////////////////
//
//  Generic ChildController class
//
//  Assumes you will create a `LoadableIndex` in `_makeChildIndex` to manage list of children.
//
//  There's also stuff in here about managing `parent` and parent properties.
//  REFACTOR: move parent stuff into separate class?
//
//////////////////////////////

import Eventful from "oak-roots/Eventful";
import Loadable from "oak-roots/Loadable";
import Savable from "oak-roots/Savable";
import { autobind, proto, throttle } from "oak-roots/util/decorators";
import ids from "oak-roots/util/ids";

export default class ChildController extends Savable(Loadable()) {
  constructor(props) {
    super(...arguments);
  }


  //////////////////////////////
  //  Child Index and accessors
  //////////////////////////////

  _makeChildIndex() { throw new TypeError("You must implement _makeChildIndex()") }

  get childIndex() { return this._childIndex || (this._childIndex = this._makeIndex()) }
  get childIds() { return this.childIndex && this.childIndex.items.map(item => item.id) }
  get children() { return this.childIndex && this.childIndex.items }
  get firstChild() { const children = this.children; return children && children[0] }
  get lastChild() { const children = this.children; return children && children[children.length-1] }

  // Given a possible childId, modify it (minmally) to make sure it's unique
  //  within our current children's ids.
  // NOTE: its possible that you will still get a colision on the server... ????
  uniquifyChildId(childId) { return ids.uniquifyId(childId, this.childIds) }


  //////////////////////////////
  //  Parents & Paths
  //////////////////////////////

  getChildPath(childId) { throw new TypeError("You must implement getChildPath()") }
  get path() { return this.parent ? this.parent.getChildPath(this.id) : this.id; }

  // Return our parent's index, which will include us.
  get parentIndex() { return this.parent && this.parent.childIndex }

  // Position (index) of this page in its section's `pages` list
  // Returns `undefined` if we don't parent or parent has no childIndex.
  get position() { return this.parentIndex && this.parentIndex.items.indexOf(this) }

  // Are we the first or last item in our parent's list?
  get isFirst() { return this.position === 0 }
  get isLast() { return !!this.parentIndex && this.position === this.parentIndex.items.length - 1 }

  // Return the next item in our parent's list.
  get previous() { return this.parentIndex.items[this.position-1] }
  get next() { return this.parentIndex.items[this.position+1] }


  //////////////////////////////
  //  Loading
  //////////////////////////////

  // By default, loading simply causes our `childIndex` to load.
  // Your subclass may load a bundle with this info,
  //  or load the data some other way and call `_loadedIndex()` to update the index.
  loadData() {
    if (this.childIndex) return this.childIndex.load();
    return Promise.resolve();
  }

  onLoaded(indexJSON) {
    this._loadedIndex(indexJSON);
  }

  _loadedIndex(indexJSON) {
    if (this.childIndex) {
      if (typeof indexJSON === "string") indexJSON = JSON.parse(indexJSON);
      this.childIndex.loaded(indexJSON);
    }
  }


  //////////////////////////////
  //  Saving
  //////////////////////////////

  // By default, saveing simply causes our `childIndex` to save.
  // Your subclass may save a bundle with this info,
  //  calling `_getIndexData()` to get the index data to save.
  saveData() {
    if (this.childIndex) return index.saveData();
    return Promise.resolve();
  }

  onSaved() {}

  // Return the data to save for the index, only necessary if you're saving in a bundle or something.
  _getIndexData() {
    return this.childIndex && JSON.stringify(this.childIndex.getIndexData(), undefined, "  ");
  }

}
