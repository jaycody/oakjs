"use strict";

import React from "react";
import { Project } from "oak";

import * as themeComponents from "./theme";
import * as projectComponents from "./components";
import * as stackMap from "./stacks";

export default class SUIProject extends Project {
	static themeComponents = themeComponents;
	static projectComponents = projectComponents;
	static stackMap = stackMap;

	static defaultProps = {
		id: "SUI",
		title: "Semantic UI"
	};
  // Necessary so hot reloader will notice this file.
  render(){ return super.render() }
}

SUIProject.initialize();
