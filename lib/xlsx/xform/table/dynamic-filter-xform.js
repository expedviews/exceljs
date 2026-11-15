const BaseXform = require('../base-xform');

// <dynamicFilter type="aboveAverage" val="14.5" maxVal="..." />
class DynamicFilterXform extends BaseXform {
  get tag() {
    return 'dynamicFilter';
  }

  render(xmlStream, model) {
    xmlStream.leafNode(this.tag, {
      type: model.type,
      val: model.val,
      valIso: model.valIso,
      maxVal: model.maxVal,
      maxValIso: model.maxValIso,
    });
  }

  parseOpen(node) {
    if (node.name === this.tag) {
      const {type, val, valIso, maxVal, maxValIso} = node.attributes;
      this.model = {type, val, valIso, maxVal, maxValIso};
      Object.keys(this.model).forEach(key => {
        if (this.model[key] === undefined) {
          delete this.model[key];
        }
      });
      return true;
    }
    return false;
  }

  parseText() {}

  parseClose() {
    return false;
  }
}

module.exports = DynamicFilterXform;
