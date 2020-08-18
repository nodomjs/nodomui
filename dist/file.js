///<reference types='nodom'/>
/**
 * checkbox
 */
class UIFile extends nodom.Plugin {
    constructor(params) {
        super(params);
        this.tagName = 'UI-FILE';
        /**
         * 状态  0初始化 1上传中 2上传结束
         */
        this.state = 0;
        /**
         * 可上传文件数量
         */
        this.maxCount = 1;
        let rootDom = new nodom.Element();
        if (params) {
            if (params instanceof HTMLElement) {
                nodom.Compiler.handleAttributes(rootDom, params);
                UITool.handleUIParam(rootDom, this, ['valuefield', 'displayfield', 'multiple|bool', 'type', 'maxcount', 'uploadmethod', 'delmethod'], ['valueField', 'displayField', 'multiple', 'fileType', 'maxCount', 'uploadMethod', 'delMethod'], [null, null, null, '', 1, null, null]);
            }
            else if (typeof params === 'object') {
                for (let o in params) {
                    this[o] = params[o];
                }
            }
            this.generate(rootDom);
        }
        rootDom.tagName = 'span';
        rootDom.plugin = this;
        this.element = rootDom;
    }
    /**
     * 产生插件内容
     * @param rootDom 插件对应的element
     */
    generate(rootDom) {
        let me = this;
        rootDom.addClass('nd-file');
        let field = rootDom.getDirective('field');
        if (field) {
            this.dataName = field.value;
            rootDom.removeDirectives(['field']);
        }
        if (this.multiple === '') {
            this.maxCount = 1;
        }
        //生成filestate name
        this.stateName = '$uploadstate_' + this.dataName;
        this.uploadingName = '$uploading_' + this.dataName;
        this.fileName = '$file_' + this.dataName;
        //生成result name
        this.resultName = '$ui_file_' + nodom.Util.genId();
        //文件显示container
        let ctDom = new nodom.Element('div');
        ctDom.addClass('nd-file-showct');
        ctDom.addDirective(new nodom.Directive('repeat', this.dataName, ctDom));
        //显示框
        let showDom = new nodom.Element('a');
        showDom.addClass('nd-file-content');
        showDom.setProp('target', 'blank');
        let expr = new nodom.Expression(this.displayField);
        showDom.setProp('href', expr, true);
        if (this.fileType === 'image') { //图片
            let img = new nodom.Element('img');
            img.setProp('src', expr, true);
            showDom.add(img);
        }
        else {
            let txt = new nodom.Element();
            txt.expressions = [expr];
            showDom.add(txt);
        }
        ctDom.add(showDom);
        //删除按钮
        if (this.delMethod) {
            let delDom = new nodom.Element('b');
            delDom.addClass('nd-file-del');
            delDom.addEvent(new nodom.NodomEvent('click', this.delMethod));
            ctDom.add(delDom);
        }
        //上传容器
        let uploadDom = new nodom.Element('div');
        uploadDom.addClass('nd-file-uploadct');
        //当文件数量==maxcount时不再显示
        uploadDom.addDirective(new nodom.Directive('show', this.dataName + '.length<' + this.maxCount, uploadDom));
        //文件
        let fDom = new nodom.Element('input');
        fDom.setProp('type', 'file');
        //多文件
        if (this.multiple === 'multi') {
            fDom.setProp('multiple', 'multiple');
        }
        fDom.addClass('nd-file-input');
        fDom.addEvent(new nodom.NodomEvent('change', (dom, model, module, e, el) => {
            let foo = module.methodFactory.get(me.uploadMethod);
            //已有数据条数
            let fieldData = model.data[this.dataName];
            let rowLen = fieldData ? fieldData.length : 0;
            rowLen = this.maxCount - rowLen;
            if (el.files) {
                //上传标志
                model.set(me.stateName, 1);
                //上传显示
                model.set(me.uploadingName, NUITipWords.uploading);
                //设置文件内容
                model.set(me.fileName, el.files);
                if (foo) {
                    foo.apply(module, [dom, model, module, e]);
                }
            }
        }));
        //上传框
        let uploadingDom = new nodom.Element('div');
        uploadingDom.addClass('nd-file-uploading');
        //上传(+号)
        let span1 = new nodom.Element('span');
        span1.addClass('nd-file-add');
        span1.addDirective(new nodom.Directive('show', this.stateName + '==0', span1));
        uploadingDom.add(span1);
        //上传中
        let span2 = new nodom.Element('span');
        span2.addClass('nd-file-progress');
        span2.addDirective(new nodom.Directive('show', this.stateName + '==1', span2));
        let txt = new nodom.Element();
        txt.expressions = [new nodom.Expression(this.uploadingName || NUITipWords.uploading)];
        span2.add(txt);
        uploadingDom.add(span2);
        uploadDom.add(uploadingDom);
        uploadDom.add(fDom);
        rootDom.children = [ctDom, uploadDom];
        rootDom.plugin = this;
        return rootDom;
    }
    beforeRender(module, dom) {
        super.beforeRender(module, dom);
        if (this.needPreRender) {
            let model = module.modelFactory.get(dom.modelId);
            if (model) {
                model.set(this.stateName, 0);
            }
        }
    }
}
nodom.PluginManager.add('UI-FILE', UIFile);
//# sourceMappingURL=file.js.map