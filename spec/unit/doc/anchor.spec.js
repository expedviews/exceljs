const {createSheetMock} = require('../../utils/index');

const Anchor = verquire('doc/anchor');

describe('Anchor', () => {
  describe('colWidth', () => {
    it('should colWidth equals 640000 when worksheet is undefined', () => {
      const anchor = new Anchor();
      expect(anchor.colWidth).to.equal(640000);
    });
    it('should colWidth equals 640000 when column has not set custom width', () => {
      const anchor = new Anchor(createSheetMock());
      expect(anchor.colWidth).to.equal(640000);
    });
    it('should colWidth equals column width', () => {
      const worksheet = createSheetMock();
      const anchor = new Anchor(worksheet);
      worksheet.addColumn(anchor.nativeCol + 1, {
        width: 10,
      });
      // width 10 characters = 75px (10 * 7 + 5) at 9525 EMU per pixel
      expect(anchor.colWidth).to.equal(75 * 9525);
    });
  });
  describe('rowHeight', () => {
    it('should rowHeight equals 180000 when worksheet is undefined', () => {
      const anchor = new Anchor();
      expect(anchor.rowHeight).to.equal(180000);
    });
    it('should rowHeight equals 180000 when row has not set height', () => {
      const anchor = new Anchor(createSheetMock());
      expect(anchor.rowHeight).to.equal(180000);
    });
    it('should rowHeight equals row height', () => {
      const worksheet = createSheetMock();
      worksheet.getRow(1).height = 10;

      const anchor = new Anchor(worksheet);
      // 10pt = 127000 EMU (12700 EMU per point)
      expect(anchor.rowHeight).to.equal(127000);
    });
  });
  describe('resize worksheet`s cells', () => {
    const context = this;
    before(() => {
      context.worksheet = createSheetMock();
      context.worksheet.getColumn(1).width = 20;
      context.worksheet.getRow(1).height = 20;

      context.anchor = new Anchor(context.worksheet, {col: 0.6, row: 0.6});
    });

    it('should update colWidth', () => {
      const pre = context.anchor.colWidth;
      context.worksheet.getColumn(1).width *= 2;
      expect(context.anchor.colWidth).to.not.equal(pre);
      // 20 -> 145px, 40 -> 285px
      expect(pre).to.equal(145 * 9525);
      expect(context.anchor.colWidth).to.equal(285 * 9525);
    });
    it('should update rowHeight', () => {
      const pre = context.anchor.rowHeight;
      context.worksheet.getRow(1).height *= 2;
      expect(context.anchor.rowHeight).to.not.equal(pre);
      expect(context.anchor.rowHeight).to.equal(pre * 2);
    });
    it('should recalculate col', () => {
      const pre = context.anchor.col;
      context.worksheet.getColumn(1).width *= 2;
      expect(context.anchor.col).to.not.equal(pre);
    });
    it('should recalculate row', () => {
      const pre = context.anchor.row;
      context.worksheet.getRow(1).height *= 2;
      expect(context.anchor.row).to.not.equal(pre);
    });
    it('should integer part of row and rowOff should be always equals', () => {
      expect(Math.floor(context.anchor.row)).to.equal(
        Math.floor(context.anchor.nativeCol)
      );
      context.worksheet.getRow(1).height *= 2;
      expect(Math.floor(context.anchor.row)).to.equal(
        Math.floor(context.anchor.nativeCol)
      );
      context.worksheet.getRow(1).height /= 4;
      expect(Math.floor(context.anchor.row)).to.equal(
        Math.floor(context.anchor.nativeCol)
      );
      context.worksheet.getRow(1).height = 0.1;
      expect(Math.floor(context.anchor.row)).to.equal(
        Math.floor(context.anchor.nativeCol)
      );
      context.worksheet.getRow(1).height = 9999;
      expect(Math.floor(context.anchor.row)).to.equal(
        Math.floor(context.anchor.nativeCol)
      );
    });
    it('should integer part of col and colOff should be always equals', () => {
      expect(Math.floor(context.anchor.col)).to.equal(
        Math.floor(context.anchor.nativeCol)
      );
      context.worksheet.getColumn(1).width *= 2;
      expect(Math.floor(context.anchor.col)).to.equal(
        Math.floor(context.anchor.nativeCol)
      );
      context.worksheet.getColumn(1).width /= 4;
      expect(Math.floor(context.anchor.col)).to.equal(
        Math.floor(context.anchor.nativeCol)
      );
      context.worksheet.getColumn(1).width = 0.1;
      expect(Math.floor(context.anchor.col)).to.equal(
        Math.floor(context.anchor.nativeCol)
      );
      context.worksheet.getColumn(1).width = 9999;
      expect(Math.floor(context.anchor.col)).to.equal(
        Math.floor(context.anchor.nativeCol)
      );
    });
    it('should update nativeColOff after col has been changed', () => {
      const pre = context.anchor.nativeColOff;
      context.anchor.col -= 0.321;
      expect(context.anchor.nativeColOff).to.not.equal(pre);
    });
    it('should update nativeRowOff after row has been changed', () => {
      const pre = context.anchor.nativeRowOff;
      context.anchor.row -= 0.321;
      expect(context.anchor.nativeColOff).to.not.equal(pre);
    });
  });
  describe('fractional column offsets', () => {
    it('should place col 1.5 in the middle of a wide custom-width column', () => {
      const worksheet = createSheetMock();
      worksheet.getColumn(2).width = 100;
      const anchor = new Anchor(worksheet, {col: 1.5, row: 0});
      expect(anchor.nativeCol).to.equal(1);
      // column B is 705px wide, so the middle is 352.5px = 3357562 EMU
      expect(anchor.nativeColOff).to.equal(Math.floor(705 * 9525 * 0.5));
      expect(anchor.col).to.be.closeTo(1.5, 0.001);
    });
    it('should place row 1.5 in the middle of a custom-height row', () => {
      const worksheet = createSheetMock();
      worksheet.getRow(2).height = 40;
      const anchor = new Anchor(worksheet, {col: 0, row: 1.5});
      expect(anchor.nativeRow).to.equal(1);
      expect(anchor.nativeRowOff).to.equal(Math.floor(40 * 12700 * 0.5));
    });
  });
});
