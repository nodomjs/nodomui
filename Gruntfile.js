
module.exports = function (grunt) {  
  grunt.initConfig({  
    ts:{
      options:{
        compile:true,
        comments:false,
        target:'es6',
        module:"cmd"
      },     
      dev:{
        src:[
            './plugins/msg_zh.ts',
            './plugins/uibase.ts',
            './plugins/accordion.ts',
            './plugins/button.ts',
            './plugins/buttongroup.ts',
            './plugins/checkbox.ts',
            './plugins/datetime.ts',
            './plugins/dialog.ts',
            './plugins/file.ts',
            './plugins/form.ts',
            './plugins/grid.ts',
            './plugins/layout.ts',
            './plugins/list.ts',
            './plugins/listtransfer.ts',
            './plugins/menu.ts',
            './plugins/pagination.ts',
            './plugins/panel.ts',
            './plugins/radio.ts',
            './plugins/relationmap.ts',
            './plugins/select.ts',
            // './plugins/selectgroup.ts',
            './plugins/tab.ts',
            './plugins/tip.ts',
            './plugins/toolbar.ts',
            './plugins/text.ts',
            './plugins/tree.ts',
            './plugins/loading.ts',
            './plugins/floatbox.ts'
        ],
        out:'bin/nodomui.js',
        options:{
          module:'commonjs'
        }
      }
    }
  });  
  grunt.loadNpmTasks('grunt-ts');  
  grunt.registerTask('default', ['ts:dev']); 
};  