//////////////////////////////
//
//	<Spacer> component for use with oak.
//
//////////////////////////////

import React, { PropTypes } from "react";
import classNames from "classnames";

import "./Spacer.css";

export default function OakSpacer(props) {
  const { className, appearance, size, inline, width, height } = props;

  const spacerProps = {
    className: classNames(className, "oak", size, appearance, { inline }, "spacer"),
    style: {
      width,
      height,
    }
  }

  return <div {...spacerProps}/>;
}

OakSpacer.propTypes = {
  className: PropTypes.string,
  appearance: PropTypes.string,
  size: PropTypes.string,
  inline: PropTypes.bool,
  width: PropTypes.number,
  height: PropTypes.number
};

OakSpacer.defaultProps = {
  size: "medium"
}