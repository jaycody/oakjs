//////////////////////////////
// Overlay which shows/manages selection
//////////////////////////////

import { throttle } from "oak-roots/util/decorators";
import Rect from "oak-roots/Rect";


import DragSelectRect from "./DragSelectRect";
import OakComponent from "./OakComponent";
import SelectionRect from "./SelectionRect";
import Resizer from "./Resizer";

import "./SelectionOverlay.css";


export default class SelectionOverlay extends OakComponent {

  constructor() {
    super(...arguments);
    this.state = {};
  }

  componentDidMount() {
    super.componentDidMount();
    // update selection rectangle(s) when window scrolls, zooms or resizes
    $(document).on("scroll", this.onScroll);
    $(document).on("zoom", this.onZoom);
    $(window).on("resize", this.onResize);
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    $(document).off("scroll", this.onScroll);
    $(document).off("zoom", this.onZoom);
    $(window).off("resize", this.onResize);
  }

  //////////////////////////////
  // Window/document events which change browser geometry
  // and update selection rectangles
  //////////////////////////////

  onScroll = (event) => {
    this._updateSelectionRects();
  }

  onZoom = (event) => {
    this._updateSelectionRects();
  }

  onResize = (event) => {
    this._updateSelectionRects();
  }

  // Update selection due to an event (scroll, zoom, etc).
  @throttle(10)
  _updateSelectionRects() {
    if (!this._isMounted) return;

    // if we have a selection, force update
    if (oak.selection && oak.selection.length) {
      this.forceUpdate();
    }

    this._clearHoverRect();
  }

  // NOTE: we set hover rectangle manually rather than fully redrawing
  //       so we're not redrawing the overlay on mousemove.
  //       This is more efficient and prevents cursor flash.
  @throttle(1)
  _updateHoverRect(event) {
    const mouseOid = oak.event._mouseOid;
    const isInsideHandle = event && $(event.target).is(".ResizeHandle");
    let rect;
    if (mouseOid && !isInsideHandle && !oak.event.anyButtonDown) {
      rect = oak.getRectForOid(mouseOid);
    }
    this._moveRect("hover", rect);
  }

  _clearHoverRect() {
    this._moveRect("hover");
  }

  _moveRect(ref, rect) {
    if (!this._isMounted || !this.refs[ref]) return;

    const $element = $(ReactDOM.findDOMNode(this.refs[ref]))
    if (rect) $element.css(rect);
    else      $element.attr("style", "");
  }


  //////////////////////////////
  // Mouse events which manipulate selection
  //////////////////////////////

  onMouseMove = (event) => {
    this._updateHoverRect(event);
  }

  // Mouse down on overlay itself
  onMouseDown = (event) => {
    this.startDragSelecting(event);
  }

  //////////////////////////////
  //  Drag selection
  //////////////////////////////

  renderDragSelectRect() {
    if (!this.state.dragSelecting) return;
    const props = {
      onDragStop: this.onDragSelectStop,
      onDragCancel: this.onDragSelectCancel
    }
    return <DragSelectRect {...props} />
  }


  // Start drawing a <DragSelectRect> when the mouse goes down.
  startDragSelecting = (event) => {
    this.setState({ dragSelecting: true });
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  // Callback when drag-selection completes:
  //  `selection` is the list of `oids` which were intersected.
  //  `selectionRects` is the list of clientRects for those oids.
  onDragSelectStop = (selection, rects) => {
    // Select the intersecting elements
    if (selection && selection.length > 0) {
      oak.actions.setSelection({ elements: selection });
      this.setState({ dragSelecting: false });
    }
    else {
      this.onDragSelectCancel();
    }
  }

  // Callback when drag-selection completes:
  //  `selection` is the list of `oids` which were intersected.
  //  `selectionRects` is the list of clientRects for those oids.
  onDragSelectCancel = (selection, rects) => {
    oak.actions.clearSelection();
    this.setState({ dragSelecting: false });
  }


  //////////////////////////////
  //  Mouse events in <SelectionRect> children (including the hover element)
  //////////////////////////////

  onSelectionDown = (event) => {
    // if they went down on the editContext root element, start drag selecting
    const oid = oak.event._downOid;
    if (!oid || oak.editContext && oak.editContext.oid === oid) {
      return this.startDragSelecting(event);
    }
console.info("onSelectionDown", oid);
    // if shift is down,
// TODO: verify that we can multi-select...
    if (oak.event.shiftKey) {
      // toggle selection of the element if there is one
      if (oid) oak.actions.toggleSelection({ elements: oid });
    }
    // otherwise select just the oid
    else if (!oak.selection.includes(oid)) {
      oak.actions.setSelection({ elements: oid });
    }

    // If anything is selected, start dragging
    if (oak.selection.length) {
      oak.event.initDragHandlers({
        event,
        onDragStart: "dragStart",
//        onDrag: "drag",
        onDragStop: "dragStop",
        onDragCancel: this.onSelectionRectUp
      });
    }
  }

  // mouse went up on selectionRect WITHOUT dragging
  onSelectionRectUp = (event) => {
    const oid = oak.event._downOid;
    console.info("onSelectionRectUp", oid);
    if (oid && !oak.event.shiftKey && oak.selection.length > 1) {
      oak.actions.setSelection({ elements: oid });
    }
  }

  //////////////////////////////
  //  Mouse events in a <ResizeHandle> child
  //////////////////////////////

  onResizeHandleDown = (event, handle) => {
    oak.event.initDragHandlers({
      event,
      onDragStart: (event) => oak.trigger("resizeStart", event, handle),
//      onDrag: (event) => oak.trigger("resize", event, handle),
      onDragStop: (event) => oak.trigger("resizeStop", event, handle),
    });
  }


  //////////////////////////////
  //  Rendering
  //////////////////////////////

  renderHoverElement() {
    if (this.state.dragSelecting) return;
    return <SelectionRect ref="hover" type="hover" onMouseDown={this.onSelectionDown}/>;
  }

  renderSelection() {
    if (this.state.dragSelecting) return;
    const props = {
      selection: oak.selection,
      canResizeWidth: true,     // TODO
      canResizeHeight: true,    // TODO
      onSelectionDown: this.onSelectionDown,
      onHandleDown: this.onResizeHandleDown
    }
    return <Resizer {...props} />;
  }


  render() {
    const { oak } = this.context;
    if (!oak.state.editing) return null;

    const props = {
      id: "SelectionOverlay",
      onMouseDown: this.onMouseDown,
      onMouseMove: this.onMouseMove
    }

    return (
      <div {...props}>
        { this.renderHoverElement() }
        { this.renderSelection() }
        { this.renderDragSelectRect() }
      </div>
    );
  }
}
