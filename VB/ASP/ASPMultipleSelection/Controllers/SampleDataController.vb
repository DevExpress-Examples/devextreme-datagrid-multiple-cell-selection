Imports ASPMultipleSelection.Models
Imports DevExtreme.AspNet.Data
Imports DevExtreme.AspNet.Mvc
Imports Microsoft.AspNetCore.Mvc

Namespace ASPMultipleSelection.Controllers

    <Route("api/[controller]")>
    Public Class SampleDataController
        Inherits Controller

        <HttpGet>
        Public Function [Get](ByVal loadOptions As DataSourceLoadOptions) As Object
            Return DataSourceLoader.Load(Customers, loadOptions)
        End Function
    End Class
End Namespace
