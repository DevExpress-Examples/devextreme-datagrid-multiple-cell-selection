<template>
  <div>
    <DxDataGrid
      ref="dataGridRef"
      id="gridContainer"
      :data-source="dataSource"
      key-expr="ID"
      :columns="columns"
      :show-borders="true"
      @content-ready="onContentReady"
      @cell-hover-changed="onCellHoverChanged"
      @cell-click="onCellClick"
      @cell-prepared="onCellPrepared"
    />

    <div class="selected-data">
      <h3 class="caption">Selected Cells:</h3>

      <ul>
        <li
          v-for="(info, index) in data"
          :key="index"
        >
          {{ getCellValue(info) }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { DxDataGrid, type DxDataGridTypes } from 'devextreme-vue/data-grid';
import { type Customer, customers } from '../assets/data';

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

const dataGridRef = ref<DxDataGrid | null>(null);
const dataSource = ref<Customer[]>(customers);
const columns = ref<string[]>(['CompanyName', 'City', 'State', 'Phone', 'Fax']);
const selectedRange = ref<SelectedRange>({});
const isSelectionStopped = ref<boolean>(true);
const cellInfos = ref<CellInfo[]>([]);
const data = ref<CellData[]>([]);

onMounted((): void => {
  const gridInstance = dataGridRef.value?.instance;
  if (!gridInstance) return;

  const dataGridElement = gridInstance.element();
  dataGridElement.addEventListener('touchmove', (args: TouchEvent): void => {
    const event = args.touches[0];
    const element = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
    if (!element) return;

    const cellInfo = cellInfos.value.find((x) => x.cellElement === element);
    if (cellInfo) {
      selectedRange.value.endRowIndex = cellInfo.rowIndex;
      selectedRange.value.endColumnIndex = cellInfo.columnIndex;
      showSelection();
    }
  });
});

function foreachRange(
  range: SelectedRange,
  func: (rowIndex: number, columnIndex: number) => void
): void {
  data.value = [];
  if (range.startRowIndex !== undefined && range.startRowIndex >= 0) {
    const minRowIndex = Math.min(
      range.startRowIndex,
      range.endRowIndex ?? range.startRowIndex
    );
    const maxRowIndex = Math.max(
      range.startRowIndex,
      range.endRowIndex ?? range.startRowIndex
    );
    const minColumnIndex = Math.min(
      range.startColumnIndex ?? 0,
      range.endColumnIndex ?? 0
    );
    const maxColumnIndex = Math.max(
      range.startColumnIndex ?? 0,
      range.endColumnIndex ?? 0
    );

    for (let rowIndex = minRowIndex; rowIndex <= maxRowIndex; rowIndex += 1) {
      for (
        let columnIndex = minColumnIndex;
        columnIndex <= maxColumnIndex;
        columnIndex += 1
      ) {
        func(rowIndex, columnIndex);
        data.value.push({ rowIndex, columnIndex });
      }
    }
  }
}

function showSelection(): void {
  const gridInstance = dataGridRef.value?.instance;
  if (!gridInstance) return;

  const selectedCells = gridInstance.element().querySelectorAll('.cell-selected');

  // Remove previously selected cells
  selectedCells.forEach((cell: Element): void => {
    cell.classList.remove('cell-selected');
  });

  // Add selection to new cells
  foreachRange(
    selectedRange.value,
    (rowIndex: number, columnIndex: number): void => {
      const cellElement = gridInstance.getCellElement(rowIndex, columnIndex);
      if (cellElement) {
        cellElement.classList.add('cell-selected');
      }
    }
  );
}

function getCellValue(
  info: CellData
): string | number | boolean | null | undefined {
  const gridInstance = dataGridRef.value?.instance;
  if (!gridInstance) return '';

  return gridInstance.cellValue(info.rowIndex, info.columnIndex);
}

function onContentReady(): void {
  data.value = [];
}

function onCellHoverChanged(
  e: DxDataGridTypes.CellHoverChangedEvent<Customer, number>
): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const eventData = e as any;
  if (!eventData.event) return;

  const event = eventData.event as MouseEvent;
  if (event.buttons === 1) {
    if (isSelectionStopped.value) {
      isSelectionStopped.value = false;
      selectedRange.value = {};
    }

    if (selectedRange.value.startRowIndex === undefined) {
      selectedRange.value.startRowIndex = e.rowIndex;
    }

    if (selectedRange.value.startColumnIndex === undefined) {
      selectedRange.value.startColumnIndex = e.columnIndex;
    }

    selectedRange.value.endRowIndex = e.rowIndex;
    selectedRange.value.endColumnIndex = e.columnIndex;

    showSelection();
  } else {
    isSelectionStopped.value = true;
  }
}

function onCellClick(
  e: DxDataGridTypes.CellClickEvent<Customer, number>
): void {
  // Save the first hovered cell
  if (e.rowType !== 'data') return;

  if (e.event && e.event.ctrlKey === true && e.event.shiftKey === false) {
    // Selects or deselects a single cell when Ctrl + Left Click
    if (e.cellElement.classList.contains('cell-selected')) {
      data.value = data.value.filter(
        (item) =>
          !(item.rowIndex === e.rowIndex && item.columnIndex === e.columnIndex)
      );
      e.cellElement.classList.remove('cell-selected');
    } else {
      data.value.push({ rowIndex: e.rowIndex, columnIndex: e.columnIndex });
      e.cellElement.classList.add('cell-selected');
    }
  } else if (
    e.event &&
    e.event.ctrlKey === false &&
    e.event.shiftKey === true
  ) {
    // Selection via Shift + Left Click
    selectedRange.value.endRowIndex = e.rowIndex;
    selectedRange.value.endColumnIndex = e.columnIndex;
    showSelection();
  } else {
    // Normal click - reset selection to single cell
    selectedRange.value.startRowIndex = e.rowIndex;
    selectedRange.value.endRowIndex = e.rowIndex;
    selectedRange.value.startColumnIndex = e.columnIndex;
    selectedRange.value.endColumnIndex = e.columnIndex;
    isSelectionStopped.value = false;
    showSelection();
  }
}

function onCellPrepared(
  e: DxDataGridTypes.CellPreparedEvent<Customer, number>
): void {
  if (e.rowType === 'data') {
    cellInfos.value.push({
      cellElement: e.cellElement,
      rowIndex: e.rowIndex,
      columnIndex: e.columnIndex,
    });

    e.cellElement.addEventListener('touchstart', (): void => {
      selectedRange.value.startRowIndex = e.rowIndex;
      selectedRange.value.endRowIndex = e.rowIndex;
      selectedRange.value.startColumnIndex = e.columnIndex;
      selectedRange.value.endColumnIndex = e.columnIndex;
      showSelection();
    });
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.cell-selected {
  background-color: lightgreen;
}

.dx-datagrid {
  user-select: none;
}

.selected-data {
  margin-top: 10px;
  overflow-y: scroll;
  max-height: 200px;
}
</style>
