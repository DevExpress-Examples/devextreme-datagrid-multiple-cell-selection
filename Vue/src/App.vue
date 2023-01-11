<template>
  <DxDataGrid
    :ref="dataGridRefKey"
    id="gridContainer"
    :data-source="dataSource"
    key-expr="ID"
    :columns="columns"
    :show-borders="true"
    @content-ready="onContentReady()"
    @cell-hover-changed="onCellHoverChanged($event)"
    @cell-click="onCellClick($event)"
    @cell-prepared="onCellPrepared($event)"
  />

  <div class="selected-data">
    <h3 class="caption">Selected Cells:</h3>

    <ul>
      <li v-for="(info, index) in data" v-bind:key="index">
        {{ getCellValue(info) }}
      </li>
    </ul>
  </div>
</template>

<script>
import DxDataGrid from 'devextreme-vue/data-grid';
import { customers } from './assets/data';

const dataGridRefKey = 'my-data-grid';

export default {
  name: 'App',
  components: {
    DxDataGrid,
  },
  mounted() {
    const dataGridElement = this.dataGrid.element();
    dataGridElement.addEventListener('touchmove', (args) => {
      const event = args.touches[0],
        element = document.elementFromPoint(event.clientX, event.clientY),
        cellInfo = this.cellInfos.filter((x) => x.cellElement === element)[0];
      if (cellInfo) {
        this.selectedRange.endRowIndex = cellInfo.rowIndex;
        this.selectedRange.endColumnIndex = cellInfo.columnIndex;
        this.showSelection(this.dataGrid.instance, this.selectedRange);
      }
    });
  },
  data() {
    return {
      dataSource: customers,
      columns: ['CompanyName', 'City', 'State', 'Phone', 'Fax'],
      selectedRange: {},
      isSelectionStopped: true,
      cellInfos: [],
      dataGridRefKey,
      data: [],
    };
  },
  methods: {
    foreachRange(selectedRange, func) {
      this.data = [];
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
            this.data.push({ rowIndex: rowIndex, columnIndex: columnIndex });
          }
        }
      }
    },
    showSelection() {
      const selectedCells = this.dataGrid
        .element()
        .querySelectorAll('.cell-selected');
      //Remove previously selected cells
      if (selectedCells) {
        for (let i = 0; i < selectedCells.length; i++) {
          selectedCells[i].classList.remove('cell-selected');
        }
      }
      //You can then get the cell's value here
      this.foreachRange(this.selectedRange, (rowIndex, columnIndex) => {
        this.dataGrid
          .getCellElement(rowIndex, columnIndex)
          .classList.add('cell-selected');
      });
    },
    getCellValue(info) {
      console.log(info);
      return this.dataGrid.cellValue(info.rowIndex, info.columnIndex);
    },
    onContentReady() {
      this.data = [];
    },
    onCellHoverChanged(e) {
      const event = e.event;
      if (event.buttons === 1) {
        if (this.isSelectionStopped) {
          this.isSelectionStopped = false;
          this.selectedRange = {};
        }

        if (!this.selectedRange.startRowIndex) {
          this.selectedRange.startRowIndex = e.rowIndex;
        }

        if (!this.selectedRange.startColumnIndex) {
          this.selectedRange.startColumnIndex = e.columnIndex;
        }

        this.selectedRange.endRowIndex = e.rowIndex;
        this.selectedRange.endColumnIndex = e.columnIndex;

        this.showSelection();
      } else {
        this.isSelectionStopped = true;
      }
    },
    onCellClick(e) {
      //Save the first hovered cell
      if (e.rowType !== 'data') return;
      if (e.event && e.event.ctrlKey === true && e.event.shiftKey === false) {
        //selects or deselects a single cell when Ctrl + Left Click
        if (e.cellElement.classList.contains('cell-selected')) {
          this.data = this.data.filter(
            (item) =>
              !(
                item.rowIndex === e.rowIndex &&
                item.columnIndex === e.columnIndex
              )
          );
          e.cellElement.classList.remove('cell-selected');
        } else {
          this.data.push({ rowIndex: e.rowIndex, columnIndex: e.columnIndex });
          e.cellElement.classList.add('cell-selected');
        }
      } else if (
        e.event &&
        e.event.ctrlKey === false &&
        e.event.shiftKey === true
      ) {
        //Selection via Shift + Left Click

        this.selectedRange.endRowIndex = e.rowIndex;
        this.selectedRange.endColumnIndex = e.columnIndex;
        this.showSelection();
      } else {
        this.selectedRange.startRowIndex = this.selectedRange.endRowIndex =
          e.rowIndex;
        this.selectedRange.startColumnIndex =
          this.selectedRange.endColumnIndex = e.columnIndex;
        this.isSelectionStopped = false;
        this.showSelection();
      }
    },
    onCellPrepared(e) {
      if (e.rowType === 'data')
        this.cellInfos.push({
          cellElement: e.cellElement,
          rowIndex: e.rowIndex,
          columnIndex: e.columnIndex,
        });
      e.cellElement.addEventListener('touchstart', () => {
        this.selectedRange.startRowIndex = this.selectedRange.endRowIndex =
          e.rowIndex;
        this.selectedRange.startColumnIndex =
          this.selectedRange.endColumnIndex = e.columnIndex;
        this.showSelection();
      });
    },
  },
  computed: {
    dataGrid: function () {
      return this.$refs[dataGridRefKey].instance;
    },
  },
};
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
