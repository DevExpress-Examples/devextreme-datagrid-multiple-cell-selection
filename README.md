<!-- default badges list -->
[![](https://img.shields.io/badge/📖_How_to_use_DevExpress_Examples-e9f6fc?style=flat-square)](https://docs.devexpress.com/GeneralInformation/403183)
<!-- default badges end -->
# DataGrid - Multiple cell selection

This example illustrates how to implement multiple cell selection for DataGrid

The cells are selected via the DataGrid's [onCellHoverChanged](https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/#onCellHoverChanged) and [onCellClick](https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/#onCellClick) event handlers. In these event handlers, the cells' columnIndex and rowIndex properties are stored and used to display the corresponding cell values via the [cellValue](https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Methods/#cellValuerowIndex_visibleColumnIndex_value) method.

Additionally, this example works on mobile devices via the touchmove and touchstart events.
