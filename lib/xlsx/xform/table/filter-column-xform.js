const BaseXform = require('../base-xform');
const ListXform = require('../list-xform');

const CustomFilterXform = require('./custom-filter-xform');
const DynamicFilterXform = require('./dynamic-filter-xform');
const FilterXform = require('./filter-xform');

class FilterColumnXform extends BaseXform {
  constructor() {
    super();

    this.map = {
      customFilters: new ListXform({
        tag: 'customFilters',
        count: false,
        empty: true,
        childXform: new CustomFilterXform(),
      }),
      dynamicFilter: new DynamicFilterXform(),
      filters: new ListXform({
        tag: 'filters',
        count: false,
        empty: true,
        childXform: new FilterXform(),
      }),
    };
  }

  get tag() {
    return 'filterColumn';
  }

  prepare(model, options) {
    model.colId = options.index.toString();
  }

  render(xmlStream, model) {
    if (model.customFilters || model.dynamicFilter) {
      xmlStream.openNode(this.tag, {
        colId: model.colId,
        hiddenButton: model.filterButton ? '0' : '1',
      });

      if (model.customFilters) {
        this.map.customFilters.render(xmlStream, model.customFilters);
      }
      if (model.dynamicFilter) {
        this.map.dynamicFilter.render(xmlStream, model.dynamicFilter);
      }

      xmlStream.closeNode();
      return true;
    }
    xmlStream.leafNode(this.tag, {
      colId: model.colId,
      hiddenButton: model.filterButton ? '0' : '1',
    });
    return true;
  }

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    const {attributes} = node;
    switch (node.name) {
      case this.tag:
        this.model = {
          filterButton: attributes.hiddenButton === '0',
        };
        this.map.dynamicFilter.model = undefined;
        return true;
      default:
        this.parser = this.map[node.name];
        if (this.parser) {
          this.parseOpen(node);
          return true;
        }
        throw new Error(`Unexpected xml node in parseOpen: ${JSON.stringify(node)}`);
    }
  }

  parseText() {}

  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.parser = undefined;
      }
      return true;
    }
    switch (name) {
      case this.tag:
        if (this.map.customFilters.model) {
          this.model.customFilters = this.map.customFilters.model;
        }
        if (this.map.dynamicFilter.model) {
          this.model.dynamicFilter = this.map.dynamicFilter.model;
        }
        return false;
      default:
        // could be some unrecognised tags
        return true;
    }
  }
}

module.exports = FilterColumnXform;
