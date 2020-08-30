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
        /**
         * 当前上传数量
         */
        this.count = 0;
        let rootDom = new nodom.Element();
        if (params) {
            if (params instanceof HTMLElement) {
                nodom.Compiler.handleAttributes(rootDom, params);
                UITool.handleUIParam(rootDom, this, ['valuefield', 'displayfield', 'multiple|bool', 'filetype', 'maxcount|number', 'uploadurl', 'deleteurl', 'uploadname'], ['valueField', 'displayField', 'multiple', 'fileType', 'maxCount', 'uploadUrl', 'deleteUrl', 'uploadName'], [null, null, null, '', 1, null, '', 'file']);
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
        rootDom.addClass('nd-file');
        //附加数据项名
        this.extraDataName = '$ui_file_' + nodom.Util.genId();
        let field = rootDom.getDirective('field');
        if (field) {
            this.dataName = field.value;
            rootDom.removeDirectives(['field']);
            //移除事件
            rootDom.events.delete('change');
        }
        if (!this.multiple) {
            this.maxCount = 1;
        }
        rootDom.children = [this.genShowDom(), this.genUploadDom()];
        rootDom.plugin = this;
        return rootDom;
    }
    /**
     * 产生上传dom
     * @returns     上传后的显示dom
     */
    genUploadDom() {
        const me = this;
        //上传容器
        let uploadDom = new nodom.Element('div');
        uploadDom.addClass('nd-file-uploadct');
        //当文件数量==maxcount时不再显示
        uploadDom.addDirective(new nodom.Directive('show', this.dataName + '.length<' + this.maxCount, uploadDom));
        //文件
        let fDom = new nodom.Element('input');
        fDom.setProp('type', 'file');
        fDom.addClass('nd-file-input');
        //input file change事件
        fDom.addEvent(new nodom.NodomEvent('change', (dom, model, module, e, el) => {
            if (!el.files) {
                return;
            }
            //上传标志
            model.set(me.extraDataName + '.state', 1);
            //上传显示
            model.set(me.extraDataName + '.uploading', NUITipWords.uploading);
            let form = new FormData();
            for (let f of el.files) {
                form.append(me.uploadName, f);
            }
            //提交请求
            nodom.request({
                url: me.uploadUrl,
                method: 'POST',
                params: form,
                header: {
                    'Content-Type': 'multipart/form-data'
                },
                type: 'json'
            }).then((r) => {
                //上传显示
                model.set(me.extraDataName + '.state', 0);
                //设置显示数据
                model.query(me.dataName).push(r);
            });
        }));
        //上传框
        let uploadingDom = new nodom.Element('div');
        uploadingDom.addClass('nd-file-uploading');
        //上传(+号)
        let span1 = new nodom.Element('span');
        span1.addClass('nd-file-add');
        span1.addDirective(new nodom.Directive('show', this.extraDataName + '.state==0', span1));
        uploadingDom.add(span1);
        //上传中
        let span2 = new nodom.Element('span');
        span2.addClass('nd-file-progress');
        span2.addDirective(new nodom.Directive('show', this.extraDataName + '.state==1', span2));
        let txt = new nodom.Element();
        txt.expressions = [new nodom.Expression((this.extraDataName + '.uploading') || NUITipWords.uploading)];
        span2.add(txt);
        uploadingDom.add(span2);
        uploadDom.add(uploadingDom);
        uploadDom.add(fDom);
        return uploadDom;
    }
    /**
     * 创建显示dom
     * @returns     上传后的显示dom
     */
    genShowDom() {
        const me = this;
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
        let delDom = new nodom.Element('b');
        delDom.addClass('nd-file-del');
        ctDom.add(delDom);
        //点击删除
        delDom.addEvent(new nodom.NodomEvent('click', (dom, model, module, e) => {
            let params = {};
            let id = model.query(me.valueField);
            params[me.valueField] = id;
            if (this.deleteUrl !== '') { //存在del url，则需要从服务器删除
                nodom.request({
                    url: me.deleteUrl,
                    params: params
                }).then((r) => {
                    me.removeFile(module, id);
                });
            }
            else {
                me.removeFile(module, id);
            }
        }));
        return ctDom;
    }
    /**
     * 删除文件
     * @param module    模块
     * @param id        res id
     */
    removeFile(module, id) {
        let pm = module.modelFactory.get(this.modelId);
        let rows = pm.query(this.dataName);
        //从上传结果中删除
        if (Array.isArray(rows)) {
            for (let i = 0; i < rows.length; i++) {
                if (rows[i][this.valueField] === id) {
                    rows.splice(i, 1);
                    break;
                }
            }
        }
    }
    beforeRender(module, dom) {
        super.beforeRender(module, dom);
        if (this.needPreRender) {
            let model = module.modelFactory.get(dom.modelId);
            //增加附加model
            if (model) {
                model.set(this.extraDataName, {
                    state: 0,
                    uploading: false
                });
            }
        }
    }
}
nodom.PluginManager.add('UI-FILE', UIFile);
//# sourceMappingURL=file.js.map