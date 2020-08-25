///<reference types='nodom'/>
/**
 * 分页插件
 */
class UIPagination extends nodom.Plugin {
    constructor(params) {
        super(params);
        this.tagName = 'UI-PAGINATION';
        /**
         * 显示的最小页号
         */
        this.minPage = 1;
        /**
         * 显示的最大页号
         */
        this.maxPage = 1;
        let rootDom = new nodom.Element();
        if (params) {
            if (params instanceof HTMLElement) {
                nodom.Compiler.handleAttributes(rootDom, params);
                nodom.Compiler.handleChildren(rootDom, params);
                UITool.handleUIParam(rootDom, this, ['totalname', 'pagesize|number', 'currentpage|number', 'showtotal|bool', 'showgo|bool', 'shownum|number', 'sizechange|array|number', 'steps|number', 'onchange', 'requestname|array|2'], ['totalName', 'pageSize', 'currentPage', 'showTotal', 'showGo', 'showNum', 'pageSizeData', 'steps', 'onChange', 'requestName'], ['total', 10, 1, null, null, 10, [], 5, '', []]);
            }
            else if (typeof params === 'object') {
                for (let o in params) {
                    this[o] = params[o];
                }
            }
            this.generate(rootDom);
        }
        rootDom.tagName = 'div';
        rootDom.plugin = this;
        this.element = rootDom;
    }
    /**
     * 产生插件内容
     * @param rootDom 插件对应的element
     */
    generate(rootDom) {
        let me = this;
        rootDom.addClass('nd-pagination');
        rootDom.children = [];
        this.extraDataName = '$ui_pagination_' + nodom.Util.genId();
        //增加附加数据模型
        rootDom.addDirective(new nodom.Directive('model', this.extraDataName, rootDom));
        //显示共x条
        if (this.showTotal) {
            let totalDom = new nodom.Element('div');
            let txt = new nodom.Element();
            txt.textContent = NUITipWords.total;
            totalDom.add(txt);
            let span = new nodom.Element('span');
            span.addClass('nd-pagination-total');
            txt = new nodom.Element();
            txt.expressions = [new nodom.Expression('total')];
            span.add(txt);
            totalDom.add(span);
            txt = new nodom.Element();
            txt.textContent = NUITipWords.record;
            totalDom.add(txt);
            rootDom.add(totalDom);
        }
        //选择页面大小
        if (this.pageSizeData && this.pageSizeData.length > 0) {
            let datas = [];
            for (let d of this.pageSizeData) {
                datas.push({
                    value: d,
                    text: d + NUITipWords.record + '/' + NUITipWords.page
                });
            }
            this.pageSizeDatas = datas;
            rootDom.add(new UISelect({
                dataName: 'pageSize',
                listField: 'sizeData',
                displayField: 'text',
                valueField: 'value'
            }).element);
        }
        //分页内容
        let pageCt = new nodom.Element('div');
        pageCt.addClass('nd-pagination-pagect');
        //左双箭头
        let left1 = new nodom.Element('b');
        left1.addClass('nd-pagination-leftarrow1');
        left1.addDirective(new nodom.Directive('class', "{'nd-pagination-disable':'[1,3,5,7,9,11,13,15].includes(btnAllow)'}", left1));
        pageCt.add(left1);
        //左箭头
        let left = new nodom.Element('b');
        left.addClass('nd-pagination-leftarrow');
        left.addDirective(new nodom.Directive('class', "{'nd-pagination-disable':'[2,3,6,7,10,11,15].includes(btnAllow)'}", left));
        pageCt.add(left);
        //页面数字
        let page = new nodom.Element('span');
        page.addClass('nd-pagination-page');
        page.addDirective(new nodom.Directive('repeat', 'pages', page));
        page.addDirective(new nodom.Directive('class', "{'nd-pagination-active':'active'}", page), true);
        let txt = new nodom.Element();
        txt.expressions = [new nodom.Expression('no')];
        page.add(txt);
        pageCt.add(page);
        //右箭头
        let right = new nodom.Element('b');
        right.addClass('nd-pagination-rightarrow');
        right.addDirective(new nodom.Directive('class', "{'nd-pagination-disable':'[4,5,6,7,12,13,15].includes(btnAllow)'}", right));
        pageCt.add(right);
        //右双箭头
        let right1 = new nodom.Element('b');
        right1.addClass('nd-pagination-rightarrow1');
        right1.addDirective(new nodom.Directive('class', "{'nd-pagination-disable':'[8,9,10,11,12,13,15].includes(btnAllow)'}", right1));
        pageCt.add(right1);
        rootDom.add(pageCt);
        //点击事件
        page.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
            me.changeParams(module, model.data['no']);
            // me.update(module,model.data['no']);
        }));
        left.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
            if (dom.hasClass('nd-pagination-disable')) {
                return;
            }
            // me.update(module,-1,true);
            me.changeParams(module, -1, true);
        }));
        right.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
            if (dom.hasClass('nd-pagination-disable')) {
                return;
            }
            // me.update(module,1,true);
            me.changeParams(module, 1, true);
        }));
        left1.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
            if (dom.hasClass('nd-pagination-disable')) {
                return;
            }
            // me.update(module,-me.steps,true);
            me.changeParams(module, -me.steps, true);
        }));
        right1.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
            if (dom.hasClass('nd-pagination-disable')) {
                return;
            }
            // me.update(module,me.steps,true);
            me.changeParams(module, me.steps, true);
        }));
        //显示第x页及输入框
        if (this.showGo) {
            let goDom = new nodom.Element('div');
            goDom.addClass('nd-pagination-go');
            let txt = new nodom.Element();
            txt.textContent = NUITipWords.NO;
            goDom.add(txt);
            let input = new nodom.Element('input');
            input.setProp('type', 'number');
            input.addDirective(new nodom.Directive('field', 'pageNo', input));
            input.setProp('value', new nodom.Expression('pageNo'), true);
            goDom.add(input);
            txt = new nodom.Element();
            txt.textContent = NUITipWords.page;
            goDom.add(txt);
            rootDom.add(goDom);
        }
        rootDom.plugin = this;
        return rootDom;
    }
    /**
     * 渲染前置方法
     * @param module
     * @param uidom
     */
    beforeRender(module, uidom) {
        super.beforeRender(module, uidom);
        this.handleInit(uidom, module);
    }
    /**
     * 设置当前值
     * @param module    模块
     * @param current   当前页或位移量
     * @param isStep    如果true current为位移量
     */
    update(module, current, isStep) {
        //onchange 事件执行
        if (this.onChange && this.onChange !== '') {
            let foo;
            if (typeof this.onChange === 'string') {
                foo = module.methodFactory.get(this.onChange);
            }
            else if (nodom.Util.isFunction(this.onChange)) {
                foo = this.onChange;
            }
            if (foo) {
                foo.apply(this, [module, this.currentPage, this.pageSize]);
            }
        }
    }
    /**
     * 改变pagination 参数
     * @param module    模块
     * @param current   当前页或位移量
     * @param isStep    如果true current为位移量
     */
    changeParams(module, current, isStep) {
        let model1 = module.modelFactory.get(this.modelId);
        let model = module.modelFactory.get(this.extraModelId);
        let data1 = model1.data;
        let data = model.data;
        //获取total
        if (data1 && data1[this.totalName]) {
            this.total = data1[this.totalName];
        }
        //表示是步数
        if (isStep) {
            current = this.currentPage + current;
        }
        if (!this.total) {
            return;
        }
        model.set('total', this.total);
        //页面大小
        let pageSize = data['pageSize'];
        if (typeof pageSize === 'string') {
            pageSize = parseInt(pageSize);
        }
        //设置pagesize，切换到第一页
        if (!current) {
            let d = model.query('pageNo');
            if (typeof d === 'string' && d !== '') {
                //转换为数值
                d = parseInt(d);
            }
            current = d || 1;
        }
        //页面数
        let pageCount = Math.ceil(this.total / pageSize);
        //限定current在页面范围内
        if (current > pageCount) {
            current = pageCount;
        }
        else if (current < 1) {
            current = 1;
        }
        let min = 1;
        let max;
        let btnAllow = 0;
        //页面数>显示数
        if (pageCount > this.showNum) {
            //中心的位置
            let center = (this.showNum + 1) / 2 | 0;
            if (current - center + 1 > 0) {
                min = current - center + 1;
            }
            if (min < 1) {
                min = 1;
            }
            else if (min + this.showNum - 1 > pageCount) {
                min = pageCount - this.showNum + 1;
            }
            max = min + this.showNum - 1;
            if (min === 1) {
                btnAllow += 1;
            }
            if (max === pageCount) {
                btnAllow += 8;
            }
        }
        else {
            min = 1;
            max = pageCount;
            btnAllow = 9;
        }
        if (current === pageCount) {
            btnAllow += 4;
        }
        if (current === 1) {
            btnAllow += 2;
        }
        //参数未改变，则不渲染
        if (this.needPreRender && current === this.currentPage && min === this.minPage && max === this.maxPage) {
            return;
        }
        //页面号数据数组
        let pageArr = [];
        for (let i = min; i <= max; i++) {
            let active = i === current ? true : false;
            pageArr.push({
                no: i,
                active: active
            });
        }
        this.pageSize = pageSize;
        this.currentPage = current;
        this.minPage = min;
        this.maxPage = max;
        model.set('pages', pageArr);
        //设置当前页
        model.set('pageNo', current);
        //设置箭头状态值
        model.set('btnAllow', btnAllow);
    }
    /**
     * 只执行一次的初始化
     * @param dom
     * @param module
     */
    handleInit(dom, module) {
        let me = this;
        if (!this.needPreRender) {
            return;
        }
        let model = module.modelFactory.get(dom.modelId);
        let model1 = model.set(this.extraDataName, {
            //总条数
            total: 0,
            //页面数
            pageNum: 0,
            //页号
            pageNo: this.currentPage || 1,
            //页面大小
            pageSize: this.pageSize || 10,
            /**
             * 按钮允许使用name(自动创建)
             * 包括左双箭头、左箭头、右箭头、右双箭头
             * 对应数据 1左双箭头禁用 2左箭头禁用 4右箭头禁用 8右双箭头禁用,组合值则禁用多个:如6禁用左箭头和右箭头
             */
            btnAllow: 0,
            //显示页号数组，如 [11,12,13,14,15]
            pages: [],
            //页面数数组
            sizeData: this.pageSizeDatas || [10, 20, 30, 50]
        });
        //附加数据模型
        this.extraModelId = model1.id;
        //增加观察方法
        let watchFunc = function (model, key, value) {
            me.update(module);
        };
        model1.watch('pageSize', watchFunc);
        model1.watch('pageNo', watchFunc);
        this.changeParams(module, 1);
    }
}
nodom.PluginManager.add('UI-PAGINATION', UIPagination);
//# sourceMappingURL=pagination.js.map