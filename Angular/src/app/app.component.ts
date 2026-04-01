import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { DxDataGridComponent, type DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import {
  type Customer, type CellInfo, type CellData, type SelectedRange, Service,
} from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [Service],
  standalone: false,
})
export class AppComponent implements AfterViewInit {
  @ViewChild(DxDataGridComponent) dataGrid!: DxDataGridComponent<Customer, number>;

  title = 'MultipleSelection';

  customers: Customer[];

  data: CellData[] = [];

  selectedRange: SelectedRange = {};

  shiftSelectRange: SelectedRange = {};

  isSelectionStopped = false;

  cellInfos: CellInfo[] = [];

  constructor(service: Service) {
    this.customers = service.getCustomers();
  }

  foreachRange(
    selectedRange: SelectedRange,
    func: (rowIndex: number, columnIndex: number) => void,
  ): void {
    this.data = [];
    if (
      selectedRange.startRowIndex !== undefined
      && selectedRange.startRowIndex >= 0
    ) {
      const minRowIndex = Math.min(
        selectedRange.startRowIndex,
        selectedRange.endRowIndex ?? selectedRange.startRowIndex,
      );
      const maxRowIndex = Math.max(
        selectedRange.startRowIndex,
        selectedRange.endRowIndex ?? selectedRange.startRowIndex,
      );
      const minColumnIndex = Math.min(
        selectedRange.startColumnIndex ?? 0,
        selectedRange.endColumnIndex ?? 0,
      );
      const maxColumnIndex = Math.max(
        selectedRange.startColumnIndex ?? 0,
        selectedRange.endColumnIndex ?? 0,
      );

      for (let rowIndex = minRowIndex; rowIndex <= maxRowIndex; rowIndex += 1) {
        for (
          let columnIndex = minColumnIndex;
          columnIndex <= maxColumnIndex;
          columnIndex += 1
        ) {
          func(rowIndex, columnIndex);
          this.data.push({ rowIndex, columnIndex });
        }
      }
    }
  }

  getCellValue(info: CellData): string | number | boolean | null | undefined {
    const gridInstance = this.dataGrid.instance;
    if (!gridInstance) return '';

    return gridInstance.cellValue(info.rowIndex, info.columnIndex);
  }

  showSelection(): void {
    const gridInstance = this.dataGrid.instance;
    if (!gridInstance) return;

    const selectedCells = gridInstance.element().querySelectorAll('.cell-selected');

    // Remove previously selected cells
    selectedCells.forEach((cell: Element): void => {
      cell.classList.remove('cell-selected');
    });

    // Add selection to new cells
    this.foreachRange(this.selectedRange, (rowIndex: number, columnIndex: number): void => {
      const cellElement = gridInstance.getCellElement(rowIndex, columnIndex);
      if (cellElement) {
        cellElement.classList.add('cell-selected');
      }
    });
  }

  onContentReady(): void {
    this.data = [];
  }

  onCellPrepared(e: DxDataGridTypes.CellPreparedEvent<Customer, number>): void {
    if (e.rowType === 'data') {
      this.cellInfos.push({
        cellElement: e.cellElement,
        rowIndex: e.rowIndex,
        columnIndex: e.columnIndex,
      });

      e.cellElement.addEventListener('touchstart', (): void => {
        this.selectedRange.startRowIndex = e.rowIndex;
        this.selectedRange.endRowIndex = e.rowIndex;
        this.selectedRange.startColumnIndex = e.columnIndex;
        this.selectedRange.endColumnIndex = e.columnIndex;
        this.showSelection();
      });
    }
  }

  onCellHoverChanged(e: DxDataGridTypes.CellHoverChangedEvent<Customer, number>): void {
    const eventData = e as any;
    if (!eventData.event) return;

    const event = eventData.event as MouseEvent;
    if (event.buttons === 1) {
      if (this.isSelectionStopped) {
        this.isSelectionStopped = false;
        this.selectedRange = {};
      }

      if (this.selectedRange.startRowIndex === undefined) {
        this.selectedRange.startRowIndex = e.rowIndex;
      }

      if (this.selectedRange.startColumnIndex === undefined) {
        this.selectedRange.startColumnIndex = e.columnIndex;
      }

      this.selectedRange.endRowIndex = e.rowIndex;
      this.selectedRange.endColumnIndex = e.columnIndex;

      this.showSelection();
    } else {
      this.isSelectionStopped = true;
    }
  }

  ngAfterViewInit(): void {
    const gridInstance = this.dataGrid.instance;
    if (!gridInstance) return;

    const dataGridElement = gridInstance.element();
    dataGridElement.addEventListener('touchmove', (args: TouchEvent): void => {
      const event = args.touches[0];
      const element = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
      if (!element) return;

      const cellInfo = this.cellInfos.find((x) => x.cellElement === element);
      if (cellInfo) {
        this.selectedRange.endRowIndex = cellInfo.rowIndex;
        this.selectedRange.endColumnIndex = cellInfo.columnIndex;
        this.showSelection();
      }
    });
  }

  onCellClick(e: DxDataGridTypes.CellClickEvent<Customer, number>): void {
    // Save the first hovered cell
    if (e.rowType !== 'data') return;

    if (e.event?.ctrlKey && !e.event.shiftKey) {
      // Selects or deselects a single cell when Ctrl + Left Click
      if (e.cellElement.classList.contains('cell-selected')) {
        this.data = this.data.filter(
          (item) => !(item.rowIndex === e.rowIndex && item.columnIndex === e.columnIndex),
        );
        e.cellElement.classList.remove('cell-selected');
      } else {
        this.data.push({ rowIndex: e.rowIndex, columnIndex: e.columnIndex });
        e.cellElement.classList.add('cell-selected');
      }
    } else if (e.event && !e.event.ctrlKey && e.event?.shiftKey) {
      // Selection via Shift + Left Click
      this.shiftSelectRange.endRowIndex = e.rowIndex;
      this.shiftSelectRange.endColumnIndex = e.columnIndex;
      this.selectedRange = { ...this.shiftSelectRange };
      this.showSelection();
    } else {
      // Normal click - reset selection to single cell
      this.shiftSelectRange.startRowIndex = e.rowIndex;
      this.shiftSelectRange.startColumnIndex = e.columnIndex;
      this.selectedRange.startRowIndex = e.rowIndex;
      this.selectedRange.endRowIndex = e.rowIndex;
      this.selectedRange.startColumnIndex = e.columnIndex;
      this.selectedRange.endColumnIndex = e.columnIndex;
      this.isSelectionStopped = false;
      this.showSelection();
    }
  }
}
