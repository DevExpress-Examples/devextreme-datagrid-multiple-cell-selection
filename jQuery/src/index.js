let helper = null;

$(() => {
  const dataGrid = $('#gridContainer')
    .dxDataGrid({
      dataSource: customers,
      keyExpr: 'ID',
      columns: ['CompanyName', 'City', 'State', 'Phone', 'Fax'],
      showBorders: true,
      onInitialized: (e) => {
        if (!helper) {
          helper = new SelectionHelper(e.component);
        }
      },
    })
    .dxDataGrid('instance');

  $('#gridContainer').on('touchmove', (args) => {
    // Attach a touchmove event to save the last touched cell
    const event = args.touches[0];
    const element = document.elementFromPoint(event.clientX, event.clientY);
    const cellInfo = helper.cellsInfo.filter((x) => x.cellElement === element)[0];
    if (cellInfo) {
      helper.selectedRange.endRowIndex = cellInfo.rowIndex;
      helper.selectedRange.endColumnIndex = cellInfo.columnIndex;
      helper.showSelection(dataGrid, helper.selectedRange);
    }
  });
});
