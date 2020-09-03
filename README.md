# NodomUI

NoDomUI是一套基于NoDom开发的插件。  
官网：[www.nodom.cn](http://www.nodom.cn#/plugin)。

## 概述
插件(Plugin)作为扩展元素，通过自定义元素和实例化方式使用。 
1. 自定义元素通常以“UI-”开头，如“UI-BUTTON”,“UI-DIALOG”等，该方式主要用于模版定义。  
2. 实例化方式，如new UIButton()方式，该方式主要用于自定义插件。

## 使用限制
1. 浏览器限制
    插件大量应用css3，对ie浏览器支持较差，请主要用于非ie浏览器。
2. 设备限制
    目前尚未针对手机类小屏设备进行匹配，后期会进行完全匹配，保证多屏适用。

## 文件说明
项目采用typescript开发，目录及结构如下：
1. bin:编译后的文件目录，目录下为最新编译，可直接使用。
2. plugins:插件源代码目录
3. examples:例子程序目录
4. examples/sass:插件sass文件目录
5. examples/css:插件css编译目录，nodomui.css为编译后css文件，nodomui.min.css为压缩后的css文件，nodomui.scss为待编译sass文件
6. examples/css/font:iconfont目录，用于文字图标，针对“nd-icon-xxxx”系列css
7. index.ts:整体编译源文件
8. Gruntfile.js:grunt文件
## 编译说明
### 插件组编译
1. npm安装typescript,grunt-ts和grunt；
2. 运行grunt进行编译。
默认编译为es6，如果需要其它js版本，请修改Gruntfile.js文件中的options->target，压缩请参考uglify。  
### css编译
1. npm安装sass；
2. 切换到examples/css目录；
3. 运行“sass index.scss:index.css”编译css文件，压缩请参考sass指令。