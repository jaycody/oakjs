//////////////////////////////
// Sample editor toolbar
//////////////////////////////

import React, { PropTypes } from "react";
import { classNames } from "oak-roots/util/react";

import JSXElement from "../JSXElement";
import OakComponent from "./OakComponent";

import "./EditorToolbar.css";

export default class EditorToolbar extends OakComponent {
  removeButton() {
    oak.actions.removeElement({element:"oiBgbSMB" });
  }

  addButton() {
    const buttonToAdd = JSXElement.parse("<Button icon='smile'>Love it even more!</Button>");
    oak.actions.addChildToElement({ parent: "ftEkGCjX", child: buttonToAdd });
  }

  moveText() {
    oak.actions.moveElement({ element: "GIboFkjD", targetParent: "arZsBgMa" });
  }

  render() {
    const { oak, components: c } = this.context;
    return (
      <c.Menu id="EditorToolbar" appearance="attached">
        <c.Buttons appearance="transparent">
          <c.Button onClick={oak.actions.stopEditing} icon="large pointing up" active={!oak.state.editing}/>
          <c.Button onClick={oak.actions.startEditing} icon="large configure" active={oak.state.editing}/>
          <c.Spacer inline/>
        </c.Buttons>
        <c.Buttons appearance="transparent">
          <c.Button onClick={oak.undo} icon="large undo" disabled={!oak.canUndo}/>
          <c.Button onClick={oak.redo} icon="large repeat" disabled={!oak.canRedo}/>
          <c.Spacer inline/>
        </c.Buttons>
        <c.Buttons appearance="transparent" visible={oak.state.editing} color="red">
          <c.Button onClick={this.removeButton} icon="large remove"/>
          <c.Button onClick={this.addButton} icon="large plus"/>
          <c.Button onClick={this.moveText} icon="large move"/>
        </c.Buttons>
      </c.Menu>
    );
  }
}
