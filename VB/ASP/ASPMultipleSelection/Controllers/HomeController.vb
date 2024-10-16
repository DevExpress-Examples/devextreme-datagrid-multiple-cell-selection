Imports Microsoft.AspNetCore.Mvc

Namespace ASPMultipleSelection.Controllers

    Public Class HomeController
        Inherits Controller

        Public Function Index() As IActionResult
            Return View()
        End Function

        <ResponseCache(Duration:=0, Location:=ResponseCacheLocation.None, NoStore:=True)>
        Public Function [Error]() As IActionResult
            Return View()
        End Function
    End Class
End Namespace
