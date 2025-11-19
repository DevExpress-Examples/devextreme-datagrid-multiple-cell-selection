import 'devextreme/dist/css/dx.light.css';
import './App.css';

import { DataGrid } from 'devextreme-react';
import { customers } from './data';
import { memo, useCallback, useRef, useState, useEffect } from 'react';

let selectedRange = {},
  shiftSelectRange = {},
  isSelectionStopped,
  cellsInfo = [];

const columns = ['CompanyName', 'City', 'State', 'Phone', 'Fax'];

function App() {
  const dataGrid = useRef(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    const dataGridElement = dataGrid.current.instance.element();
    dataGridElement.addEventListener('touchmove', (args) => {
      const event = args.touches[0],
        element = document.elementFromPoint(event.clientX, event.clientY),
        cellInfo = cellsInfo.filter((x) => x.cellElement === element)[0];
      if (cellInfo) {
        selectedRange.endRowIndex = cellInfo.rowIndex;
        selectedRange.endColumnIndex = cellInfo.columnIndex;
        showSelection(dataGrid.current.instance, selectedRange);
      }
    });
  }, []);

  const foreachRange = useCallback((selectedRange, func) => {
    let dataTemp = [];
    if (selectedRange.startRowIndex >= 0) {
      const minRowIndex = Math.min(
        selectedRange.startRowIndex,
        selectedRange.endRowIndex
      );
      const maxRowIndex = Math.max(
        selectedRange.startRowIndex,
        selectedRange.endRowIndex
      );
      const minColumnIndex = Math.min(
        selectedRange.startColumnIndex,
        selectedRange.endColumnIndex
      );
      const maxColumnIndex = Math.max(
        selectedRange.startColumnIndex,
        selectedRange.endColumnIndex
      );

      for (let rowIndex = minRowIndex; rowIndex <= maxRowIndex; rowIndex++) {
        for (
          let columnIndex = minColumnIndex;
          columnIndex <= maxColumnIndex;
          columnIndex++
        ) {
          func(rowIndex, columnIndex);
          dataTemp.push({ rowIndex: rowIndex, columnIndex: columnIndex });
        }
      }
    }
    setData(dataTemp);
  }, []);

  const showSelection = useCallback(
    (component, selectedRange) => {
      const selectedCells = component
        .element()
        .querySelectorAll('.cell-selected');

      //Remove previously selected cells
      if (selectedCells) {
        for (let i = 0; i < selectedCells.length; i++) {
          selectedCells[i].classList.remove('cell-selected');
        }
      }

      //You can then get the cell's value here
      foreachRange(selectedRange, function (rowIndex, columnIndex) {
        component
          .getCellElement(rowIndex, columnIndex)
          .classList.add('cell-selected');
      });
    },
    [foreachRange]
  );

  const onCellHoverChanged = useCallback(
    (e) => {
      const event = e.event;
      if (event.buttons === 1) {
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
    [showSelection]
  );

  const onCellPrepared = useCallback(
    (e) => {
      if (e.rowType === 'data')
        cellsInfo.push({
          cellElement: e.cellElement,
          rowIndex: e.rowIndex,
          columnIndex: e.columnIndex,
        });

      e.cellElement.addEventListener('touchstart', () => {
        selectedRange.startRowIndex = selectedRange.endRowIndex = e.rowIndex;
        selectedRange.startColumnIndex = selectedRange.endColumnIndex =
          e.columnIndex;
        showSelection(e.component, selectedRange);
      });
    },
    [showSelection]
  );

  const onCellClick = useCallback(
    (e) => {
      if (e.rowType !== 'data') return;
      if (e.event && e.event.ctrlKey === true && e.event.shiftKey === false) {
        //selects or deselects a single cell when Ctrl + Left Click
        if (e.cellElement.classList.contains('cell-selected')) {
          setData((prevData) => {
            return prevData.filter(
              (item) =>
                !(
                  item.rowIndex === e.rowIndex &&
                  item.columnIndex === e.columnIndex
                )
            );
          });
          e.cellElement.classList.remove('cell-selected');
        } else {
          setData((prevData) => [
            ...prevData,
            { rowIndex: e.rowIndex, columnIndex: e.columnIndex },
          ]);
          e.cellElement.classList.add('cell-selected');
        }
      } else if (
        e.event &&
        e.event.ctrlKey === false &&
        e.event.shiftKey === true
      ) {
        //Selection via Shift + Left Click
        shiftSelectRange.endRowIndex = e.rowIndex;
        shiftSelectRange.endColumnIndex = e.columnIndex;
        showSelection(e.component, shiftSelectRange);
      } else {
        shiftSelectRange.startRowIndex = e.rowIndex;
        shiftSelectRange.startColumnIndex = e.columnIndex;
        selectedRange.startRowIndex = selectedRange.endRowIndex = e.rowIndex;
        selectedRange.startColumnIndex = selectedRange.endColumnIndex =
          e.columnIndex;
        isSelectionStopped = false;
        showSelection(e.component, selectedRange);
      }
    },
    [showSelection]
  );

  const onContentReady = useCallback((e) => {
    setData([]);
  }, []);

  return (
    <>
      <DataGrid
        ref={dataGrid}
        id='gridContainer'
        dataSource={customers}
        keyExpr='ID'
        columns={columns}
        showBorders={true}
        onCellHoverChanged={onCellHoverChanged}
        onCellClick={onCellClick}
        onCellPrepared={onCellPrepared}
        onContentReady={onContentReady}
      ></DataGrid>
      <h3 className='caption'>Selected Cells:</h3>
      <div className='selected-data'>
        <ul>
          {data.map((item, i) => {
            return (
              <li key={i}>
                {dataGrid.current.instance.cellValue(
                  item.rowIndex,
                  item.columnIndex
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

export default memo(App);
