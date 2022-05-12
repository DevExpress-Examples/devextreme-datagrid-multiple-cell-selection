let helper = null;
// let selectedRange = {};
// let shiftSelectRange = {};
// let cellsInfo = [];
// let dataGrid;
// let data = [];
// function foreachRange(selectedRange, func) {
//   data = [];
//   if(selectedRange.startRowIndex >= 0) {
//     let minRowIndex = Math.min(selectedRange.startRowIndex, selectedRange.endRowIndex);
//     let maxRowIndex = Math.max(selectedRange.startRowIndex, selectedRange.endRowIndex);
//     let minColumnIndex = Math.min(selectedRange.startColumnIndex, selectedRange.endColumnIndex);
//     let maxColumnIndex = Math.max(selectedRange.startColumnIndex, selectedRange.endColumnIndex);
    
//   	for(let rowIndex = minRowIndex; rowIndex <= maxRowIndex; rowIndex++) {
//       for(let columnIndex = minColumnIndex; columnIndex <= maxColumnIndex; columnIndex++) {
//       	func(rowIndex, columnIndex);
//         data.push({rowIndex: rowIndex, columnIndex: columnIndex})
//       }
//     }
//   }
// }
    
// function showSelection(component, selectedRange) {
//   component.element().find(".cell-selected").removeClass("cell-selected");
//   //You can then get the cell's value here
//   foreachRange(selectedRange, function(rowIndex, columnIndex) {
// 				component.getCellElement(rowIndex, columnIndex).addClass("cell-selected");
//   });
//   renderList();
// }

// function renderList(){
//   $(".selected-data ul").html(null);
//   data.map((item=>{
//     $(".selected-data ul").append($("<li>").text(dataGrid.cellValue(item.rowIndex, item.columnIndex)))
//   })) 
// }
$(() => {
  dataGrid = $('#gridContainer').dxDataGrid({
    dataSource: customers,
    keyExpr: 'ID',
    columns: ['CompanyName', 'City', 'State', 'Phone', 'Fax'],
    showBorders: true,
    onInitialized: function(e){
        if (!helper) {
            helper = new SelectionHelper(e.component);
        }
    },
    // onCellPrepared: function(e){
    //   if(e.rowType === "data") cellsInfo.push(
    //     {
    //       cellElement: e.cellElement[0],
    //       rowIndex: e.rowIndex,
    //       columnIndex: e.columnIndex,
    //     }
    //   );
    //   e.cellElement.on("touchstart", function(args){ //Save the first touched cell
    //     selectedRange.startRowIndex = selectedRange.endRowIndex = e.rowIndex;
    //     selectedRange.startColumnIndex = selectedRange.endColumnIndex = e.columnIndex;
    //     showSelection(e.component, selectedRange);
    //   })
    // },
    // onCellClick: function(e) { //Save the first hovered cell
    //   if(e.rowType !== "data") return;
    //   if (e.event.ctrlKey === true && e.event.shiftKey === false) { //selects or deselects a single cell when Ctrl + Left Click
    //     if (e.cellElement.hasClass("cell-selected")) {
    //       data = data.filter(item => !(item.rowIndex === e.rowIndex && item.columnIndex === e.columnIndex));
    //       e.cellElement.removeClass("cell-selected");
    //     } else {
    //       data.push({rowIndex: e.rowIndex, columnIndex: e.columnIndex})
    //       e.cellElement.addClass("cell-selected");
    //     }
    //     renderList();
    //   }
    //   else if(e.event.ctrlKey === false && e.event.shiftKey === true){ //Selection via Shift + Left Click

    //     shiftSelectRange.endRowIndex = e.rowIndex;
    //     shiftSelectRange.endColumnIndex = e.columnIndex;
    //     showSelection(e.component, shiftSelectRange);

    //   }
    //   else{
    //     shiftSelectRange.startRowIndex = e.rowIndex;
    //     shiftSelectRange.startColumnIndex = e.columnIndex;
    //     selectedRange.startRowIndex = selectedRange.endRowIndex = e.rowIndex;
    //     selectedRange.startColumnIndex = selectedRange.endColumnIndex = e.columnIndex;
    //     isSelectionStopped = false;
    //     showSelection(e.component, selectedRange);
    //   }
    // },
    
    // onCellHoverChanged: function(e) { //Save the last hovered cell
    // 	let event = e.event;
    //   if(event.buttons === 1) {
    //   	if(isSelectionStopped) {
    //     	isSelectionStopped = false;
    //     	selectedRange = {};
    //     }
    //     if(selectedRange.startRowIndex === undefined) {
    //     	selectedRange.startRowIndex = e.rowIndex;
    //     }
    //     if(selectedRange.startColumnIndex === undefined) {
    //     	selectedRange.startColumnIndex = e.columnIndex;
    //     }
        
    //     selectedRange.endRowIndex = e.rowIndex;
    //   	selectedRange.endColumnIndex = e.columnIndex;
        
    //     showSelection(e.component, selectedRange);
        
    //   }
    //   else {
    //   	isSelectionStopped = true;
    //   }
    // },
  }).dxDataGrid("instance");

  $('#gridContainer').on("touchmove", function(args){ //Attach a touchmove event to save the last touched cell
    let event = args.touches[0]
    let element = document.elementFromPoint(event.clientX, event.clientY);
    let cellInfo = cellsInfo.filter(x=>x.cellElement === element)[0];
    if(cellInfo){
      selectedRange.endRowIndex = cellInfo.rowIndex;
      selectedRange.endColumnIndex = cellInfo.columnIndex;
      showSelection(dataGrid, selectedRange);  
    }
  });
 
});