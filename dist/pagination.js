///<reference types='nodom'/>
/**
 * 分页插件
 */
class UIPagination extends nodom.DefineElement {
    constructor() {
        super(...arguments);
        this.tagName = 'UI-PAGINATION';
        /**
         * 当前页
         */
        this.currentPage = 1;
        /**
         * 显示的最小页号
         */
        this.minPage = 1;
    }
    /**
     * 编译后执行代码
     */
    init(el) {
        let me = this;
        let rootDom = new nodom.Element();
        nodom.Compiler.handleAttributes(rootDom, el);
        nodom.Compiler.handleChildren(rootDom, el);
        rootDom.tagName = 'div';
        UITool.handleUIParam(rootDom, this, ['totalname', 'currentname', 'sizename', 'showtotal|bool', 'showgo|bool', 'shownum|number', 'sizechange|array|number'], ['totalName', 'currentName', 'pageSizeName', 'showTotal', 'showGo', 'showNum', 'pageSizeData'], [null, 10, null, null, 8, []]);
        rootDom.addClass('nd-pagination');
        rootDom.children = [];
        this.pageDataName = '$ui-pagination_' + nodom.Util.genId();
        this.pageSizeDataName = '$ui-pagination_' + nodom.Util.genId();
        //显示共x条
        if (this.showTotal) {
            let totalDom = new nodom.Element('div');
            let txt = new nodom.Element();
            txt.textContent = TipWords.total;
            totalDom.add(txt);
            let span = new nodom.Element('span');
            span.addClass('nd-pagination-total');
            txt = new nodom.Element();
            txt.expressions = [new nodom.Expression(this.totalName)];
            span.add(txt);
            totalDom.add(span);
            txt = new nodom.Element();
            txt.textContent = TipWords.record;
            totalDom.add(txt);
            rootDom.add(totalDom);
        }
        //选择页面大小
        if (this.pageSizeData) {
            let datas = [];
            for (let d of this.pageSizeData) {
                datas.push({
                    value: d,
                    text: d + TipWords.record + '/' + TipWords.page
                });
            }
            this.pageSizeDatas = datas;
            let sizeDom = new nodom.Element('select');
            sizeDom.addDirective(new nodom.Directive('field', this.pageSizeName, sizeDom));
            sizeDom.setProp('value', new nodom.Expression(this.pageSizeName), true);
            let optDom = new nodom.Element('option');
            optDom.addDirective(new nodom.Directive('repeat', this.pageSizeDataName, optDom));
            optDom.setProp('value', new nodom.Expression('value'), true);
            let txt = new nodom.Element();
            txt.expressions = [new nodom.Expression('text')];
            optDom.add(txt);
            sizeDom.add(optDom);
            rootDom.add(sizeDom);
        }
        //分页内容
        let pageCt = new nodom.Element('div');
        pageCt.addClass('nd-pagination-pagect');
        //左双箭头
        let left1 = new nodom.Element('b');
        left1.addClass('nd-pagination-leftarrow1');
        pageCt.add(left1);
        //左箭头
        let left = new nodom.Element('b');
        left.addClass('nd-pagination-leftarrow');
        left.addDirective(new nodom.Directive('class', "{'nd-pagination-disable':'" + this.currentName + "===1'}", left));
        pageCt.add(left);
        //页面数字
        let page = new nodom.Element('span');
        page.addClass('nd-pagination-page');
        page.addDirective(new nodom.Directive('repeat', this.pageDataName, page));
        page.addDirective(new nodom.Directive('class', "{'nd-pagination-active':'active'}", page), true);
        let txt = new nodom.Element();
        txt.expressions = [new nodom.Expression('no')];
        page.add(txt);
        pageCt.add(page);
        //右箭头
        let right = new nodom.Element('b');
        right.addClass('nd-pagination-rightarrow');
        right.addDirective(new nodom.Directive('class', "{'nd-pagination-disable':'" + this.currentName + "=== Math.ceil(" + this.total + "/" + this.pageSizeName + ")'}", right));
        pageCt.add(right);
        //右双箭头
        let right1 = new nodom.Element('b');
        right1.addClass('nd-pagination-rightarrow1');
        pageCt.add(right1);
        rootDom.add(pageCt);
        //点击事件
        page.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
            me.move(module, model.data['no'], 1);
        }));
        left.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
            me.move(module, -1);
        }));
        right.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
            me.move(module, 1);
        }));
        left1.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
            me.move(module, -5);
        }));
        right1.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
            me.move(module, 5);
        }));
        //显示第x页
        if (this.showGo) {
            let goDom = new nodom.Element('div');
            goDom.addClass('nd-pagination-go');
            let txt = new nodom.Element();
            txt.textContent = TipWords.NO;
            goDom.add(txt);
            let input = new nodom.Element('input');
            input.setProp('type', 'text');
            input.addDirective(new nodom.Directive('field', this.currentName, input));
            input.setProp('value', new nodom.Expression(this.currentName), true);
            goDom.add(input);
            txt = new nodom.Element();
            txt.textContent = TipWords.page;
            goDom.add(txt);
            rootDom.add(goDom);
        }
        rootDom.defineElement = this;
        return rootDom;
    }
    /**
     * 渲染前置方法
     * @param module
     * @param uidom
     */
    beforeRender(module, uidom) {
        this.handleInit(uidom, module);
        // this.update(module);
    }
    /**
     * 更新显示
     * @param model
     */
    update(module, current, minPage, maxPage) {
        let model = module.modelFactory.get(this.modelId);
        let a = [];
        if (!minPage) {
            minPage = 1;
            maxPage = this.showNum;
            this.minPage = minPage;
            this.maxPage = maxPage;
        }
        for (let i = minPage; i <= maxPage; i++) {
            let ind = i;
            let active = ind === current ? true : false;
            a.push({
                no: ind,
                active: active
            });
        }
        //设置当前页
        model.set(this.currentName, current);
        model.set(this.pageDataName, a);
    }
    /**
     * 页面移动
     * @param module
     * @param step      flag为0时表示移动步数，为1时表示要移动到的页号
     * @param flag      0移动 1点击页号
     */
    move(module, step, flag) {
        let model = module.modelFactory.get(this.modelId);
        let data = model.data;
        let total;
        if (data) {
            total = data[this.totalName] || 0;
        }
        if (total === 0) {
            return;
        }
        let pageSize = data[this.pageSizeName];
        let count = Math.ceil(total / pageSize);
        let a = [];
        let current = data[this.currentName] || 1;
        if (step === 0) {
            this.minPage = 1;
            this.maxPage = this.showNum;
        }
        //点击页号，需要以点击页为中心
        if (flag === 1) {
            let center = Math.ceil((this.showNum - 1) / 2) + this.minPage;
            current = step;
            step = current - center;
        }
        if (count > this.showNum) {
            if (step > 0) {
                if (this.maxPage + step > count) { //超出最大页数
                    step = count - this.maxPage;
                }
            }
            else if (this.minPage + step < 1) { //超出最小页数
                step = -this.minPage;
            }
            if (!flag) {
                current += step;
            }
            this.minPage += step;
            this.maxPage += step;
        }
        else {
            this.minPage = 1;
            this.maxPage = count;
        }
        this.update(module, current, this.minPage, this.maxPage);
    }
    /**
     * 只执行一次的初始化
     * @param dom
     * @param module
     */
    handleInit(dom, module) {
        if (this.initFlag) {
            return;
        }
        let model = module.modelFactory.get(dom.modelId);
        this.initFlag = true;
        this.modelId = model.id;
        model.set(this.pageSizeName, model.query(this.pageSizeName) || 10);
        model.set(this.pageSizeDataName, this.pageSizeDatas);
        this.move(module, 0);
    }
}
nodom.DefineElementManager.add('UI-PAGINATION', UIPagination);
//# sourceMappingURL=pagination.js.map