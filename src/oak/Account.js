//////////////////////////////
// Account class -- lists all projects that this account can see.
//////////////////////////////

import ChildController from "oak-roots/ChildController";
import LoadableIndex from "oak-roots/LoadableIndex";
import { proto } from "oak-roots/util/decorators";
import { dieIfMissing } from "oak-roots/util/die";

import api from "./api";
import ComponentController from "./ComponentController";
import Page from "./Page";
import Project from "./Project";
import Section from "./Section";

export default class Account extends ChildController {
  constructor(props) {
    super();
    Object.assign(this, props);
  }

  //////////////////////////////
  //  "Project" Syntactic sugar
  //////////////////////////////

  get projectIndex() { return this.childIndex }
  get projects() { return this.projectIndex.items }

  // Return a project, which may or may not be loaded.
  // You can pass string id or *1-based* numeric index, or a single project/section/page path.
  // Returns `undefined` if the project is not known.
  // Use `account.loadProject()` if you want to ensure that a project is loaded.
  getProject(projectId) {
    // Normalize in case they passed, eg, a page path.
    if (typeof projectId === "string") {
      projectId = Project.splitPath(projectId).projectId;
    }

    // convert 1-based URLs to 0-based indices
    if (typeof projectId === "number") projectId--;

    return this.projectIndex.getItem(projectId);
  }

  // Return a promise which resolves with a loaded project.
  // You can pass string id or *1-based* numeric index, or a single project/section/page path.
  // If project is not found, returns a rejected promise.
  loadProject(projectId) {
    // Normalize in case they passed, eg, a page path.
    if (typeof projectId === "string") {
      projectId = Project.splitPath(projectId).projectId;
    }

    // convert 1-based URLs to 0-based indices
    if (typeof projectId === "number") projectId--;

    return this.projectIndex.loadItem(projectId)
//       .catch(error => {
//         console.group(`Error loading project ${projectId}:`);
//         console.error(error);
//         console.groupEnd();
//         throw new ReferenceError("Couldn't load project");
//       });
  }


  //////////////////////////////
  //  Sections!
  //////////////////////////////

  // Return a section FROM ANY KNOWN PROJECT, but only if the project has already been loaded.
  // You can pass string ids or *1-based* numeric indices, or a single project/section/page path.
  // Returns `undefined` if the project is unloaded or the section is not known.
  // Use `account.loadSection()` if you want to ensure that a section is loaded first.
  getSection(projectId, sectionId) {
    // If they passed a single string argument, assume it's a project/section/page path.
    if (arguments.length === 1 && typeof projectId === "string") {
      const path = Section.split(projectId);
      return this.getSection(path.projectId, path.sectionId);
    }
    // convert 1-based URLs to 0-based indices
    if (typeof sectionId === "number") sectionId--;

    const project = this.getProject(projectId);
    if (project) return project.getSection(sectionId);
  }

  // Return a promise which resolves with a loaded section FROM ANY KNOWN PROJECT.
  // You can pass string ids or *1-based* numeric indices, or a single project/section/page path.
  // If section is not found, returns a rejected promise.
  loadSection(projectId, sectionId) {
    // If they passed a single string argument, assume it's a project/section/page path.
    if (arguments.length === 1 && typeof projectId === "string") {
      const path = Section.split(projectId);
      return this.loadSection(path.projectId, path.sectionId);
    }

    // try to get it directly first
    const section = this.getSection(projectId, sectionId);
    if (section) return section.load();

    return this.loadProject(projectId)
      .then( () => {
        const section = this.getSection(projectId, sectionId);
        if (section) return section.load();
        return Promise.reject(`Section ${sectionId} not found`);
      })
//       .catch(error => {
//         console.group(`Error loading section ${projectId}/${sectionId}:`);
//         console.error(error);
//         console.groupEnd();
//         throw new ReferenceError("Couldn't load section");
//       });
  }


  //////////////////////////////
  //  Pages!
  //////////////////////////////

  // Return a page FROM ANY KNOWN PROJECT/SECTION, but only if the project/section have already been loaded.
  // You can pass string ids or *1-based* numeric indices, or a single project/section/page path.
  // Returns `undefined` if the project/section are unloaded or the page is not known.
  // Use `account.loadPage()` if you want to ensure that parents are loaded.
  getPage(projectId, sectionId, pageId) {
    // If they passed a single string argument, assume it's a project/section/page path.
    if (arguments.length === 1 && typeof projectId === "string") {
      const path = Page.splitPath(projectId);
      return this.getPage(path.projectId, path.sectionId, path.pageId);
    }
    // convert 1-based URLs to 0-based indices
    if (typeof pageId === "number") pageId--;

    const section = this.getSection(projectId, sectionId);
    if (section) return section.getPage(pageId);
  }

  // Return a promise which resolves with a loaded page FROM ANY KNOWN PROJECT/SECTION.
  // You can pass string ids or *1-based* numeric indices, or a single project/section/page path.
  // If page is not found, returns a rejected promise.
  loadPage(projectId, sectionId, pageId) {
    // If they passed a single string argument, assume it's a project/section/page path.
    if (arguments.length === 1 && typeof projectId === "string") {
      const path = Page.split(projectId);
      return this.loadPage(path.projectId, path.sectionId, path.pageId);
    }

    return this.loadSection(projectId, sectionId)
      .then( () => {
        const page = this.getPage(projectId, sectionId, pageId);
        if (page) return page.load();
        return Promise.reject(`Page ${pageId} not found`);
      })
//       .catch(error => {
//         console.group(`Error loading page ${projectId}/${sectionId}/${pageId}:`);
//         console.error(error);
//         console.groupEnd();
//         throw new ReferenceError("Couldn't load page");
//       });
  }


  //////////////////////////////
  //  Standard ChildController stuff
  //////////////////////////////

  // Currently no account prefix on project paths
  getChildPath(projectId) { return projectId }

  // Create the projectIndex on demand
  _makeIndex() {
    return new LoadableIndex({
      itemType: "project",
      loadData: () => {
        return api.loadProjectIndex();
      },
      saveData: () => {
        return api.saveProjectIndex(this.getIndexData());
      },
      createItem: (projectId, props) => {
        return new Project({
          projectId,
          ...props,
        });
      }
    });
  }


}
