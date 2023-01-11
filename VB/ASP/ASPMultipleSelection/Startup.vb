Imports Microsoft.AspNetCore.Builder
Imports Microsoft.AspNetCore.Hosting
Imports Microsoft.Extensions.Configuration
Imports Microsoft.Extensions.DependencyInjection
Imports Microsoft.Extensions.Hosting

Namespace ASPMultipleSelection

    Public Class Startup

        Public Sub New(ByVal configuration As IConfiguration)
            Me.Configuration = configuration
        End Sub

        Public ReadOnly Property Configuration As IConfiguration

        ' This method gets called by the runtime. Use this method to add services to the container.
        Public Sub ConfigureServices(ByVal services As IServiceCollection)
            services.AddControllersWithViews.AddJsonOptions(Sub(options) options.JsonSerializerOptions.PropertyNamingPolicy = Nothing)
        End Sub

        ' This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        Public Sub Configure(ByVal app As IApplicationBuilder, ByVal env As IWebHostEnvironment)
            If env.IsDevelopment() Then
                app.UseDeveloperExceptionPage()
            Else
                app.UseExceptionHandler("/Home/Error")
            End If

            app.UseStaticFiles()
            app.UseRouting()
            app.UseAuthorization()
            app.UseEndpoints(Sub(endpoints) endpoints.MapControllerRoute(name:="default", pattern:="{controller=Home}/{action=Index}/{id?}"))
        End Sub
    End Class
End Namespace
