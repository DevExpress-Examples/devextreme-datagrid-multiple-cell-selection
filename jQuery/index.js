let helper = null;

$(() => {
  dataGrid = $('#gridContainer')
    .dxDataGrid({
      dataSource: customers,
      keyExpr: 'ID',
      columns: ['CompanyName', 'City', 'State', 'Phone', 'Fax'],
      showBorders: true,
      onInitialized: function (e) {
        if (!helper) {
          helper = new SelectionHelper(e.component);
        }
      },
    })
    .dxDataGrid('instance');

  $('#gridContainer').on('touchmove', function (args) {
    //Attach a touchmove event to save the last touched cell
    let event = args.touches[0];
    let element = document.elementFromPoint(event.clientX, event.clientY);
    let cellInfo = cellsInfo.filter((x) => x.cellElement === element)[0];
    if (cellInfo) {
      selectedRange.endRowIndex = cellInfo.rowIndex;
      selectedRange.endColumnIndex = cellInfo.columnIndex;
      showSelection(dataGrid, selectedRange);
    }
  });
});
