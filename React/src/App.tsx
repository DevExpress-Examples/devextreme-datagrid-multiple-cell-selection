import React, {
  memo, useCallback, useEffect, useRef, useState,
} from 'react';
import './App.css';
import 'devextreme/dist/css/dx.material.blue.light.compact.css';
import DataGrid, { type DataGridTypes, type DataGridRef } from 'devextreme-react/data-grid';
import type dxDataGrid from 'devextreme/ui/data_grid';
import { customers } from './data';

interface SelectedRange {
  startRowIndex?: number;
  endRowIndex?: number;
  startColumnIndex?: number;
  endColumnIndex?: number;
}

interface CellInfo {
  cellElement: HTMLElement;
  rowIndex: number;
  columnIndex: number;
}

interface CellData {
  rowIndex: number;
  columnIndex: number;
}

let selectedRange: SelectedRange = {};
let shiftSelectRange: SelectedRange = {};
let isSelectionStopped = false;
const cellsInfo: CellInfo[] = [];

const columns = ['CompanyName', 'City', 'State', 'Phone', 'Fax'];

function App(): JSX.Element {
  const dataGrid = useRef<DataGridRef>(null);
  const [data, setData] = useState<CellData[]>([]);

  useEffect(() => {
    const gridInstance = dataGrid.current?.instance();
    if (!gridInstance) return;

    const dataGridElement = gridInstance.element();
    dataGridElement.addEventListener('touchmove', (args: TouchEvent) => {
      const event = args.touches[0];
      const element = document.elementFromPoint(
        event.clientX,
        event.clientY,
      ) as HTMLElement;
      const cellInfo = cellsInfo.filter((x) => x.cellElement === element)[0];
      if (cellInfo) {
        selectedRange.endRowIndex = cellInfo.rowIndex;
        selectedRange.endColumnIndex = cellInfo.columnIndex;
        showSelection(gridInstance, selectedRange);
      }
    });
  }, []);

  const foreachRange = useCallback(
    (selectedRange: SelectedRange, func: (rowIndex: number, columnIndex: number) => void): void => {
      const dataTemp: CellData[] = [];
      if (selectedRange.startRowIndex !== undefined && selectedRange.startRowIndex >= 0) {
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
          selectedRange.endColumnIndex ?? selectedRange.startColumnIndex ?? 0,
        );
        const maxColumnIndex = Math.max(
          selectedRange.startColumnIndex ?? 0,
          selectedRange.endColumnIndex ?? selectedRange.startColumnIndex ?? 0,
        );

        for (let rowIndex = minRowIndex; rowIndex <= maxRowIndex; rowIndex += 1) {
          for (
            let columnIndex = minColumnIndex;
            columnIndex <= maxColumnIndex;
            columnIndex += 1
          ) {
            func(rowIndex, columnIndex);
            dataTemp.push({ rowIndex, columnIndex });
          }
        }
      }
      setData(dataTemp);
    },
    [],
  );

  const showSelection = useCallback(
    (component: dxDataGrid, selectedRange: SelectedRange): void => {
      const selectedCells = component.element().querySelectorAll('.cell-selected');

      // Remove previously selected cells
      if (selectedCells) {
        for (const cell of selectedCells) {
          cell.classList.remove('cell-selected');
        }
      }

      // You can then get the cell's value here
      foreachRange(selectedRange, (rowIndex, columnIndex) => {
        const cellElement = component.getCellElement(rowIndex, columnIndex);
        if (cellElement) {
          cellElement.classList.add('cell-selected');
        }
      });
    },
    [foreachRange],
  );

  const onCellHoverChanged = useCallback(
    (e: DataGridTypes.CellHoverChangedEvent): void => {
      // CellHoverChangedEvent is triggered on hover, we'll track selection through mouse state
      if (e.eventType === 'dxhoverstart' || e.eventType === 'dxhoverend') {
        // For mouse drag selection, we need to check if mouse button is pressed
        // This will be handled through the combination of cellClick and cellPrepared
        if (isSelectionStopped) {
          isSelectionStopped = false;
          selectedRange = {};
        }

        if (selectedRange.startRowIndex === undefined) {
          selectedRange.startRowIndex = e.rowIndex;
        }

        if (selectedRange.startColumnIndex === undefined) {
          selectedRange.startColumnIndex = e.columnIndex;
        }

        selectedRange.endRowIndex = e.rowIndex;
        selectedRange.endColumnIndex = e.columnIndex;
        showSelection(e.component, selectedRange);
      } else {
        isSelectionStopped = true;
      }
    },
    [showSelection],
  );

  const onCellPrepared = useCallback(
    (e: DataGridTypes.CellPreparedEvent): void => {
      if (e.rowType === 'data' && e.cellElement) {
        cellsInfo.push({
          cellElement: e.cellElement,
          rowIndex: e.rowIndex,
          columnIndex: e.columnIndex,
        });

        e.cellElement.addEventListener('touchstart', () => {
          selectedRange.startRowIndex = e.rowIndex;
          selectedRange.endRowIndex = e.rowIndex;
          selectedRange.startColumnIndex = e.columnIndex;
          selectedRange.endColumnIndex = e.columnIndex;
          showSelection(e.component, selectedRange);
        });
      }
    },
    [showSelection],
  );

  const onCellClick = useCallback(
    (e: DataGridTypes.CellClickEvent): void => {
      if (e.rowType !== 'data') return;
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      if (e.event && 'ctrlKey' in e.event && e.event.ctrlKey && 'shiftKey' in e.event && !e.event?.shiftKey) {
        // selects or deselects a single cell when Ctrl + Left Click
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        if (e.cellElement && e.cellElement.classList.contains('cell-selected')) {
          setData((prevData) => prevData.filter(
            (item) => !(item.rowIndex === e.rowIndex && item.columnIndex === e.columnIndex),
          ));
          e.cellElement.classList.remove('cell-selected');
        } else {
          setData((prevData) => [
            ...prevData,
            { rowIndex: e.rowIndex, columnIndex: e.columnIndex },
          ]);
          if (e.cellElement) {
            e.cellElement.classList.add('cell-selected');
          }
        }
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      } else if (
        e.event
        && 'ctrlKey' in e.event && !e.event.ctrlKey
        && 'shiftKey' in e.event && e.event.shiftKey
      ) {
        // Selection via Shift + Left Click
        shiftSelectRange.endRowIndex = e.rowIndex;
        shiftSelectRange.endColumnIndex = e.columnIndex;
        showSelection(e.component, shiftSelectRange);
      } else {
        shiftSelectRange.startRowIndex = e.rowIndex;
        shiftSelectRange.startColumnIndex = e.columnIndex;
        selectedRange.startRowIndex = e.rowIndex;
        selectedRange.endRowIndex = e.rowIndex;
        selectedRange.startColumnIndex = e.columnIndex;
        selectedRange.endColumnIndex = e.columnIndex;
        isSelectionStopped = false;
        showSelection(e.component, selectedRange);
      }
    },
    [showSelection],
  );

  const onContentReady = useCallback((): void => {
    setData([]);
  }, []);

  return (
    <React.Fragment>
      <DataGrid
        ref={dataGrid}
        id="gridContainer"
        dataSource={customers}
        keyExpr="ID"
        columns={columns}
        showBorders={true}
        onCellHoverChanged={onCellHoverChanged}
        onCellClick={onCellClick}
        onCellPrepared={onCellPrepared}
        onContentReady={onContentReady}
      />
      <h3 className="caption">Selected Cells:</h3>
      <div className="selected-data">
        <ul>
          {data.map((item, i) => {
            const gridInstance = dataGrid.current?.instance();
            if (!gridInstance) return null;
            return (
              <li key={i}>
                {gridInstance.cellValue(item.rowIndex, item.columnIndex)}
              </li>
            );
          })}
        </ul>
      </div>
    </React.Fragment>
  );
}

export default memo(App);
