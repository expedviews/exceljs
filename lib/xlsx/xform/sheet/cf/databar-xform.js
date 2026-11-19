const CompositeXform = require('../../composite-xform');

const ColorXform = require('../../style/color-xform');
const CfvoXform = require('./cfvo-xform');

class DatabarXform extends CompositeXform {
  constructor() {
    super();

    this.map = {
      cfvo: (this.cfvoXform = new CfvoXform()),
      color: (this.colorXform = new ColorXform()),
    };
  }

  get tag() {
    return 'dataBar';
  }

  render(xmlStream, model) {
    xmlStream.openNode(this.tag);

    // a dataBar requires exactly 2 cfvo and a color to be valid - default
    // to Excel's own defaults when the model doesn't provide them
    const cfvo = model.cfvo && model.cfvo.length ? model.cfvo : [{type: 'min'}, {type: 'max'}];
    cfvo.forEach(c => {
      this.cfvoXform.render(xmlStream, c);
    });
    this.colorXform.render(xmlStream, model.color || {argb: 'FF638EC6'});

    xmlStream.closeNode();
  }

  createNewModel() {
    return {
      cfvo: [],
    };
  }

  onParserClose(name, parser) {
    switch (name) {
      case 'cfvo':
        this.model.cfvo.push(parser.model);
        break;
      case 'color':
        this.model.color = parser.model;
        break;
    }
  }
}

module.exports = DatabarXform;
