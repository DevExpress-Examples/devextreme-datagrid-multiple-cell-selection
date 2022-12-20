<!-- default badges list -->
![](https://img.shields.io/endpoint?url=https://codecentral.devexpress.com/api/v1/VersionRange/486527353/21.2.4%2B)
[![](https://img.shields.io/badge/Open_in_DevExpress_Support_Center-FF7200?style=flat-square&logo=DevExpress&logoColor=white)](https://supportcenter.devexpress.com/ticket/details/T1085435)
[![](https://img.shields.io/badge/📖_How_to_use_DevExpress_Examples-e9f6fc?style=flat-square)](https://docs.devexpress.com/GeneralInformation/403183)
<!-- default badges end -->
# DataGrid - Multiple cell selection

This example illustrates how to implement multiple cell selection for DataGrid

The cells are selected via the DataGrid's [onCellHoverChanged](https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/#onCellHoverChanged) and [onCellClick](https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/#onCellClick) event handlers. In these event handlers, the cells' columnIndex and rowIndex properties are stored and used to display the corresponding cell values via the [cellValue](https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Methods/#cellValuerowIndex_visibleColumnIndex_value) method.

Additionally, this example works on mobile devices via the touchmove and touchstart events.
