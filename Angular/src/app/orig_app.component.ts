import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { Customer, Service, CellInfo, SelectedRange } from './app.service';
import { DxDataGridComponent } from 'devextreme-angular';
import { CellClickEvent, CellPreparedEvent, ContentReadyEvent } from 'devextreme/ui/data_grid';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [Service],
})
export class AppComponent implements AfterViewInit{
  @ViewChild(DxDataGridComponent) dataGrid !: DxDataGridComponent;
  title = 'MultipleSelection';
  customers: Customer[];
  data: CellInfo[] = [];
  selectedRange:SelectedRange = {};
  shiftSelectRange: SelectedRange = {};
  isSelectionStopped!: boolean;
  cellInfos: CellInfo[] = [];
  constructor(service: Service) {
    this.customers = service.getCustomers();
  }

  foreachRange(selectedRange:any, func:Function) {
    this.data = [];
    if(selectedRange.startRowIndex >= 0) {
      const minRowIndex = Math.min(selectedRange.startRowIndex, selectedRange.endRowIndex);
      const maxRowIndex = Math.max(selectedRange.startRowIndex, selectedRange.endRowIndex);
      const minColumnIndex = Math.min(selectedRange.startColumnIndex, selectedRange.endColumnIndex);
      const maxColumnIndex = Math.max(selectedRange.startColumnIndex, selectedRange.endColumnIndex);
      
      for(let rowIndex = minRowIndex; rowIndex <= maxRowIndex; rowIndex++) {
        for(let columnIndex = minColumnIndex; columnIndex <= maxColumnIndex; columnIndex++) {
          func(rowIndex, columnIndex);
          this.data.push({rowIndex: rowIndex, columnIndex: columnIndex});
        }
      }
    }
  }

  getCellValue(info:any){
    return this.dataGrid.instance.cellValue(info.rowIndex, info.columnIndex);
  }

  showSelection(component:any, selectedRange:SelectedRange) {
    const selectedCells = component.element().querySelectorAll(".cell-selected");
    //Remove previously selected cells
    if(selectedCells){
      for(let i = 0; i < selectedCells.length; i++){
        selectedCells[i].classList.remove("cell-selected")
      }
    }
    //You can then get the cell's value here
    this.foreachRange(selectedRange, function(rowIndex:Number, columnIndex:Number) {
      component.getCellElement(rowIndex, columnIndex).classList.add("cell-selected");
    });
  }

  onContentReady(e:ContentReadyEvent){
    this.data = [];
  }
  onCellPrepared(e: CellPreparedEvent){
    if(e.rowType === "data") this.cellInfos.push(
      {
        cellElement: e.cellElement,
        rowIndex: e.rowIndex,
        columnIndex: e.columnIndex,
      }
    );
    e.cellElement.addEventListener("touchstart", (args:any)=>{
        this.selectedRange.startRowIndex = this.selectedRange.endRowIndex = e.rowIndex;
        this.selectedRange.startColumnIndex = this.selectedRange.endColumnIndex = e.columnIndex;
        this.showSelection(e.component, this.selectedRange);
    })
  }
  onCellHoverChanged(e: any){
    const event = e.event;
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

  ngAfterViewInit(){
    const dataGridElement = this.dataGrid.instance.element();
    dataGridElement.addEventListener("touchmove", (args:any)=>{
      const event=args.touches[0],
      element = document.elementFromPoint(event.clientX, event.clientY),
      cellInfo = this.cellInfos.filter((x:any)=>x.cellElement === element)[0];
      if(cellInfo){
        this.selectedRange.endRowIndex = cellInfo.rowIndex;
        this.selectedRange.endColumnIndex = cellInfo.columnIndex;
        this.showSelection(this.dataGrid.instance, this.selectedRange);  
      }
    });
  }

  onCellClick(e:CellClickEvent) { //Save the first hovered cell
    if(e.rowType !== "data") return;
    if (e.event && e.event.ctrlKey === true && e.event.shiftKey === false) { //selects or deselects a single cell when Ctrl + Left Click
      if (e.cellElement.classList.contains("cell-selected")) {
        this.data = this.data.filter((item:any) => !(item.rowIndex === e.rowIndex && item.columnIndex === e.columnIndex));
        e.cellElement.classList.remove("cell-selected");
      } else {
        this.data.push({rowIndex: e.rowIndex, columnIndex: e.columnIndex})
        e.cellElement.classList.add("cell-selected");
      }
    }
    else if(e.event && e.event.ctrlKey === false && e.event.shiftKey === true){ //Selection via Shift + Left Click
      
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
}
