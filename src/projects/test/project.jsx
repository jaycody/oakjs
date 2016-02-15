"use strict";

import React from "react";
import oak from "oak";

import * as themeComponents from "./theme";
import * as projectComponents from "./components";
import * as stackMap from "./stacks";

export default class Project extends oak.Project {
	static themeComponents = themeComponents;
	static projectComponents = projectComponents;
	static stackMap = stackMap;

	static defaultProps = {
		id: "test",
		title: "Test"
	};
  // Necessary so hot reloader will notice this file.
  render(){ return super.render() }
}

Project.initialize();
