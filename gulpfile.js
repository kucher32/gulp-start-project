/* Galp projekt =============================================================================================================*/
// Создаются переменные с именами папок
let project_folder = require("path").basename(__dirname);    //папка для заказчика пееименовывается в папку проекта
let sourse_folder = "#src";     // исходники

let fs = require('fs');         // переменная будет добавлять шрифты в стили автоматически

// пути =========================================================================================================================
let path = {
    build: { // для проекта
        html: project_folder + "/",                                           //html выводятся в корневую папку
        css: project_folder + "/css/",                                        //css выводятся в папку css
        js: project_folder + "/js/",                                          //js выводятся в папку js
        img: project_folder + "/img/",                                        //img выводятся в папку img
        fonts: project_folder + "/fonts/",                                    //шрифты выводятся в папку fonts
    },
    src: { //для исходников
        html: [sourse_folder + "/*.html", "!" + sourse_folder + "/_*.html"], //html выводятся в корневую папку за исключением _*
        css: sourse_folder + "/scss/style.scss",                             //css выводятся в папку css
        js: sourse_folder + "/js/script.js",                                 //js выводятся в папку js
        img: sourse_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",         //img выводятся в папку img
        fonts: sourse_folder + "/fonts/*.ttf",                               //шрифты выводятся в папку fonts
    },
    watch: { // папка постоянного прослушивания
        html: sourse_folder + "/**/*.html",
        css: sourse_folder + "/scss/**/*.scss",
        js: sourse_folder + "/js/**/*.js",
        img: sourse_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    },
    clean: "./" + project_folder + "/" // удаление папки после перезапуска gulp

}
//подключаем плагины ===================================================================================================
let { src, dest } = require('gulp'),
    gulp = require('gulp'),
    browsersync = require("browser-sync").create(),        // перезагружает страницу после изменений
    fileinclude = require("gulp-file-include"),            // позволяет собрать индекс из нескольких файлов
    del = require("del"),                                  // удаляет не нужные папки (dist) в данном случае
    scss = require("gulp-sass"),                           // работа с sass файлами
    autoprefixer = require("gulp-autoprefixer"),           //авто добавление вендорных префиксов
    group_media = require("gulp-group-css-media-queries"), // Групперует медиа запросы и ставит их в конец файла
    clean_css = require("gulp-clean-css"),                 // Оптимизирует CSS и сжимает
    rename = require("gulp-rename"),                       // Переименовывает файлов
    uglify = require("gulp-uglify-es").default,            // Сжатие и оптимизация (минификация) js совместно с gulp-rename
    imagemin = require("gulp-imagemin"),                   // Сжатие и оптимизация картинок без потери качества
    webp = require("gulp-webp"),                           // формат картинок в webp
    webphtml = require("gulp-webp-html-fixed"),                  // автоподключение webp в HTML
    webpcss = require("gulp-webpcss"),                     // автоподключение webp в CSS
    svgSprite = require("gulp-svg-sprite"),                // автоподключение svg-sprite
    ttf2woff = require("gulp-ttf2woff"),                   // Создайте шрифт WOFF из шрифта TTF с помощью Gulp
    ttf2woff2 = require("gulp-ttf2woff2"),                 // Создайте шрифт WOFF2 из шрифта TTF с помощью Gulp
    fonter = require("gulp-fonter");                       // Плагин подмножества шрифтов и конвертации для gulp


//======================================================================================================================

// настройки плагина browser-sync (params удалил)
function
    browserSync() {
    browsersync.init({
        server: {
            baseDir: "./" + project_folder + "/"   // базовая директория
        },
        port: 3000,                                //порт браузера
        notify: false                              //выключаем уведомление о перезагрузке браузера

    })
}

//функция для работы с HTML файлами ====================================================================================
function html() {
    return src(path.src.html) // путь который возвращает функция

        .pipe(fileinclude()) //сборщик файлов  html
        .pipe(webphtml()) // автоподключение webp в HTML
        .pipe(dest(path.build.html)) //копирует файлы в папку
        .pipe(browsersync.stream()) //обновляем страницу

}

//======================================================================================================================

//функция для работы с scss файлами (ЗАДАЧИ)============================================================================
function css() {
    return src(path.src.css)                                    // путь который возвращает функция
        .pipe(
            scss({
                outputStyle: "expanded"                         // настройка чтобы css файл не сжимался
            })
        )
        .pipe(
            group_media()                                       // группировка медиа запросов
        )
        .pipe(
            autoprefixer({
                overrideBrowserslist: ["Last 5 versions"],
                cascade: true
            })
        )
        .pipe(webpcss())
        .pipe(dest(path.build.css))                             //выгружаем файл css
        .pipe(clean_css())                                      // сжимаем
        .pipe(
            rename({
                extname: ".min.css"                             //переименовываемб добавляет к названию файла .min.css
            })
        )
        .pipe(dest(path.build.css))                             // снова выгружаем  файлы в папку уже min.css
        .pipe(browsersync.stream())                             //обновляем страницу
}

//======================================================================================================================

//функция для работы с js файлами (ЗАДАЧИ)==============================================================================
function js() {
    return src(path.src.js)                                     // путь который возвращает функция
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        })) //
        .pipe(dest(path.build.js))                              //копирует файлы в папку
        .pipe(
            uglify()
        )
        .pipe(
            rename({
                extname: ".min.js"                              //переименовываемб добавляет к названию файла .min.js
            })
        )
        .pipe(dest(path.build.js))                              //копирует файлы в папку
        .pipe(browsersync.stream())                             //обновляем страницу

}

//======================================================================================================================

//функция для работы с картинками ======================================================================================
function images() {
    return src(path.src.img)                                    // путь который возвращает функция
        .pipe(
            webp({
                quality: 70
            })
        )
        .pipe(dest(path.build.img))                             //копирует файлы в папку
        .pipe(src(path.src.img))                                //снова обращаемся к исходникам
        .pipe(
            imagemin({
                progresive: true,
                svgoPlugins: [{ removeViewBox: false }],
                interlaced: true,
                optimizationLevel: 3 // 0 to 7                  //устанавливаем степень сжатия
            })
        )
        .pipe(dest(path.build.img))                             //копирует файлы в папку
        .pipe(browsersync.stream())                             //обновляем страницу

}

//Функция обработки шрифтов ============================================================================================

function fonts() {
    src(path.src.fonts)                                           // путь который возвращает функция
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts));                            //копирует файлы в папку с результатами
    return src(path.src.fonts)                                    // повторяем для второго плагина
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts));
}

//======================================================================================================================

/*отдельная функция работы со шрифтами gulp-fonter (Вызывать отдельно в терминале)
преобразовывает шрифты otf в ttf и копирует в папку с #src вызывается gulp otf2ttf  ==================================*/

// gulp.task('otf2ttf', function () {
//     return src([sourse_folder + '/fonts/*.otf'])
//         .pipe(fonter({
//             formats: ['ttf']
//         }))
//         .pipe(dest(sourse_folder + '/fonts/*.ttf'));// вывожу файл в формате ttf  в исходники
// });
gulp.task('otf2ttf', () => {
    return src([sourse_folder + '/fonts/*.otf'])
        .pipe(fonter({
            formats: ['ttf']
        }))
        .pipe(dest(sourse_folder + '/fonts/*'));        // вывожу файл в формате ttf  в исходники
});
// при конвертации добавляет префикс fonts/  не понятно почему
//======================================================================================================================

/*отдельная функция работы со спрайтами (Вызывать отдельно в терминале)
из отдельныз иконок формирует спрайт вызывается "gulp svgSprite" sprite.stack.html файл пример с подключением svg ====*/

gulp.task('svgSprite', function () {
    return gulp.src([sourse_folder + '/iconsprite/*.svg'])
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: "../icons/icons.svg",               //sprite file name
                    example: true                               // создает html с примерами иконок
                }
            },
        }
        ))
        .pipe(dest(path.build.img))                                  //копирует файлы в папку с изображениями
});
//======================================================================================================================

// JS-функция записи информации в fonts.scss
/* Работает с костылями - fonts.scss не перезаписывается, нужно очищать в ручную, затем удалить папку dist  и запустить gulp*/
function fontsStyle() {

    let file_content = fs.readFileSync(sourse_folder + '/scss/fonts.scss');
    if (file_content == '') {
        fs.writeFile(sourse_folder + '/scss/fonts.scss', '', cb);
        return fs.readdir(path.build.fonts, function (err, items) {
            if (items) {
                let c_fontname;
                for (var i = 0; i < items.length; i++) {
                    let fontname = items[i].split('.');
                    fontname = fontname[0];
                    if (c_fontname != fontname) {
                        fs.appendFile(sourse_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
                    }
                    c_fontname = fontname;
                }
            }
        })
    }
}

function cb() {
}

//======================================================================================================================

//следим за изменениями файлов =========================================================================================
function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
}

//======================================================================================================================
//функция очистки папки params удалил
function clean() {
    return del(path.clean);
}

//======================================================================================================================

let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts), fontsStyle);// дружим функции js, css, html с gulp
let watch = gulp.parallel(build, watchFiles, browserSync);           //выполнение функции слежения и синхронизации


// экспорт файлов ======================================================================================================

exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch; // после запуска gulp выполняатся переменная по умолчанию

//======================================================================================================================


