class SelectionHelper {
    selectedRange;
    shiftSelectRange;
    cellsInfo;
    grid;
    data;
    isSelectionStopped;
    
    constructor(grid){
        this.grid = grid;
        this.data = [];
        this.selectedRange = {};
        this.shiftSelectRange = {};
        this.cellsInfo = [];
        grid.on("cellPrepared", this.onCellPrepared.bind(this));
        grid.on("cellClick", this.onCellClick.bind(this));
        grid.on("cellHoverChanged", this.onCellHoverChanged.bind(this));
    }

    renderList(){
        $(".selected-data ul").html(null);
        this.data.map((item=>{
            $(".selected-data ul").append($("<li>").text(this.grid.cellValue(item.rowIndex, item.columnIndex)))
        })) 
    }
    onCellHoverChanged(e) { //Save the last hovered cell
    	let event = e.event;
        if(event.buttons === 1) {
            if(this.isSelectionStopped) {
                this.isSelectionStopped = false;
                this.selectedRange = {};
            }
            if(this.selectedRange.startRowIndex === undefined) {
                this.selectedRange.startRowIndex = e.rowIndex;
            }
            if(this.selectedRange.startColumnIndex === undefined) {
                this.selectedRange.startColumnIndex = e.columnIndex;
            }
            this.selectedRange.endRowIndex = e.rowIndex;
            this.selectedRange.endColumnIndex = e.columnIndex;
            this.showSelection(e.component, this.selectedRange);
        }
        else {
            this.isSelectionStopped = true;
        }
    }
    onCellClick(e) { //Save the first hovered cell
        if(e.rowType !== "data") return;
        if (e.event.ctrlKey === true && e.event.shiftKey === false) { //selects or deselects a single cell when Ctrl + Left Click
            if (e.cellElement.hasClass("cell-selected")) {
                this.data = this.data.filter(item => !(item.rowIndex === e.rowIndex && item.columnIndex === e.columnIndex));
                e.cellElement.removeClass("cell-selected");
            } else {
                this.data.push({rowIndex: e.rowIndex, columnIndex: e.columnIndex})
                e.cellElement.addClass("cell-selected");
            }
            this.renderList();
        }
        else if(e.event.ctrlKey === false && e.event.shiftKey === true){ //Selection via Shift + Left Click
            this.shiftSelectRange.endRowIndex = e.rowIndex;
            this.shiftSelectRange.endColumnIndex = e.columnIndex;
            this.showSelection(e.component, this.shiftSelectRange);
        }
        else{
            this.shiftSelectRange.startRowIndex = e.rowIndex;
            this.shiftSelectRange.startColumnIndex = e.columnIndex;
            this.selectedRange.startRowIndex = this.selectedRange.endRowIndex = e.rowIndex;
            this.selectedRange.startColumnIndex = this.selectedRange.endColumnIndex = e.columnIndex;
            this.isSelectionStopped = false;
            this.showSelection(e.component, this.selectedRange);
        }
    }

    onCellPrepared(e){
        if(e.rowType === "data") this.cellsInfo.push(
            {
            cellElement: e.cellElement[0],
            rowIndex: e.rowIndex,
            columnIndex: e.columnIndex,
            }
        );
        e.cellElement.on("touchstart", function(args){ //Save the first touched cell
            this.selectedRange.startRowIndex = this.selectedRange.endRowIndex = e.rowIndex;
            this.selectedRange.startColumnIndex = this.selectedRange.endColumnIndex = e.columnIndex;
            this.showSelection(e.component, this.selectedRange);
        })
    }
    foreachRange(selectedRange, func) {
        this.data = [];
        if(selectedRange.startRowIndex >= 0) {
          let minRowIndex = Math.min(selectedRange.startRowIndex, selectedRange.endRowIndex);
          let maxRowIndex = Math.max(selectedRange.startRowIndex, selectedRange.endRowIndex);
          let minColumnIndex = Math.min(selectedRange.startColumnIndex, selectedRange.endColumnIndex);
          let maxColumnIndex = Math.max(selectedRange.startColumnIndex, selectedRange.endColumnIndex);
          
            for(let rowIndex = minRowIndex; rowIndex <= maxRowIndex; rowIndex++) {
            for(let columnIndex = minColumnIndex; columnIndex <= maxColumnIndex; columnIndex++) {
                func(rowIndex, columnIndex);
              this.data.push({rowIndex: rowIndex, columnIndex: columnIndex})
            }
          }
        }
      }
          
    showSelection(component, selectedRange) {
        component.element().find(".cell-selected").removeClass("cell-selected");
        //You can then get the cell's value here
        this.foreachRange(selectedRange, function(rowIndex, columnIndex) {
            component.getCellElement(rowIndex, columnIndex).addClass("cell-selected");
        });
        this.renderList();
    }
}