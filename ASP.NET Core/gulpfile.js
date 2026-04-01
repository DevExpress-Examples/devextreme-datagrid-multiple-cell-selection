/// <binding Clean='clean' />
const gulp = require("gulp"),
    { rimraf } = require("rimraf"),
    concat = require("gulp-concat");


const paths = {
    webroot: "./wwwroot/"
};

paths.concatJsDest = paths.webroot + "js/vendor.js";
paths.concatCssDest = paths.webroot + "css/vendor.css";
paths.fonts = paths.webroot + "css/fonts";
paths.icons = paths.webroot + "css/icons";

let defaultScripts = [
    "node_modules/jquery/dist/jquery.min.js",
    "node_modules/bootstrap/dist/js/bootstrap.min.js"],
    dxtScripts = [
        "node_modules/devextreme-dist/js/dx.all.js",
        "node_modules/devextreme-dist/js/dx.aspnet.mvc.js",
        "node_modules/devextreme-aspnet-data/js/dx.aspnet.data.js"];


let dxtStyles = [
    "node_modules/bootstrap/dist/css/bootstrap.css",
    "node_modules/devextreme-dist/css/dx.common.css",
    "node_modules/devextreme-dist/css/dx.material.blue.light.compact.css"];


/* default configuration */

let styles = dxtStyles;
let scripts = [...defaultScripts, ...dxtScripts];

gulp.task("clean:js", async function () {
    await rimraf(paths.concatJsDest);
});

gulp.task("clean:css", async function () {
    await rimraf(paths.concatCssDest);
});

gulp.task("clean:fonts", async function () {
    await rimraf(paths.fonts);
});

gulp.task("clean:icons", async function () {
    await rimraf(paths.icons);
});

gulp.task("clean", gulp.series(["clean:js", "clean:css", "clean:fonts", "clean:icons"]));

gulp.task("scripts", gulp.series(["clean:js"], function () {
    return gulp.src(scripts, { base: "." })
        .pipe(concat(paths.concatJsDest))
        .pipe(gulp.dest("."));
}));

gulp.task("styles", gulp.series(["clean:css"], function () {
    return gulp.src(styles, { base: "." })
        .pipe(concat(paths.concatCssDest))
        .pipe(gulp.dest("."));
}));

gulp.task("fonts", gulp.series(["clean:fonts"], function () {
    return gulp.src('./node_modules/devextreme-dist/css/fonts/*', { base: "./node_modules/devextreme-dist/css" })
        .pipe(gulp.dest(paths.webroot + "css"));
}));

gulp.task("icons", gulp.series(["clean:icons"], function () {
    return gulp.src('./node_modules/devextreme-dist/css/icons/*', { base: "./node_modules/devextreme-dist/css" })
        .pipe(gulp.dest(paths.webroot + "css"));
}));

gulp.task("add-resources", gulp.series(["scripts", "styles", "fonts", "icons"]));

gulp.task("default", gulp.series(["add-resources"]));
