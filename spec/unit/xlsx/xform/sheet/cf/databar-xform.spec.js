const testXformHelper = require('../../test-xform-helper');

const DatabarXform = verquire('xlsx/xform/sheet/cf/databar-xform');

const expectations = [
  {
    title: 'explicit cfvo and color',
    create() {
      return new DatabarXform();
    },
    preparedModel: {
      cfvo: [
        {type: 'num', value: 5},
        {type: 'num', value: 20},
      ],
      color: {argb: 'FFFF0000'},
    },
    xml: `
      <dataBar>
        <cfvo type="num" val="5" />
        <cfvo type="num" val="20" />
        <color rgb="FFFF0000" />
      </dataBar>
    `,
    get parsedModel() {
      return this.preparedModel;
    },
    tests: ['render', 'parse'],
  },
  {
    title: 'defaults applied when cfvo and color are missing',
    create() {
      return new DatabarXform();
    },
    preparedModel: {},
    xml: `
      <dataBar>
        <cfvo type="min" />
        <cfvo type="max" />
        <color rgb="FF638EC6" />
      </dataBar>
    `,
    parsedModel: {
      cfvo: [{type: 'min'}, {type: 'max'}],
      color: {argb: 'FF638EC6'},
    },
    tests: ['render'],
  },
];

describe('DatabarXform', () => {
  testXformHelper(expectations);
});
