///<reference types='nodom'/>
/**
 * panel 插件
 * ui-grid参数
 *  rowalt      行颜色交替标志，不用设置值
 *  sortable    排序标志，不用设置值
 *  gridline    网格线类型，包括column(列) row(行) both(行列)，不设置则不显示
 * ui-row参数
 *  data        表格数据数组对应名，如rows等
 *  子元素(列)，用div元素
 *  width       宽度，表示整个列宽度为几份，所有列的宽度合在一起表示总份数，栅格方式，默认1
 *  title       该列表头显示
 *  notsort     当表格设置sortable时，该设置表示该列不显示排序按钮
 *  editable    是否可编辑
 *  inputtype   输入类型，参考ui-form，默认text
 *
 * ui-sub参数(详细显示框)
 *  auto        自动生成详细显示框标志，设置该标志后，点击左侧箭头，自动生成显示框
 *  cols        一行显示列数，auto设置时有效
 *  labelwidth  label宽度，默认100，auto设置时有效
 *
 * ui-form参数(编辑window)
 *  如果设置编辑，需要设置ui-row子元素
 *  auto        自动生成编辑框标志，设置该标志后，点击左侧箭头，自动生成编辑框
 *  cols        一行显示列数，auto设置时有效
 *  labelwidth  label宽度，默认100，auto设置时有效
 *
 */
class UIGrid {
    constructor() {
        this.tagName = 'UI-GRID';
    }
    /**
     * 编译后执行代码
     */
    init(el) {
        let grid = new nodom.Element('div');
        nodom.Compiler.handleAttributes(grid, el);
        nodom.Compiler.handleChildren(grid, el);
        grid.addClass('nd-grid');
        //网格线
        let gridLine = grid.props['gridline'];
        //thead
        let thead = new nodom.Element('div');
        thead.addClass('nd-grid-head');
        //tbody
        let tbody = new nodom.Element('div');
        tbody.addClass('nd-grid-body');
        if (grid.props.hasOwnProperty('rowalt')) {
            tbody.addClass('nd-grid-body-rowalt');
        }
        //数据行dom
        let rowDom = new nodom.Element();
        //子表格dom
        let subDom = new nodom.Element();
        //第一个tr
        for (let c of grid.children) {
            if (c.tagName === 'UI-ROW') {
                rowDom = c;
            }
            else if (c.tagName === 'UI-SUB') {
                subDom = c;
            }
        }
        if (rowDom) {
            //增加repeat指令
            rowDom.addDirective(new nodom.Directive('repeat', rowDom.props['data'], rowDom));
            //第一个孩子
            let firstDom = new nodom.Element('div');
            firstDom.addClass('nd-grid-row');
            //处理所有td
            for (let c of rowDom.children) {
                if (!c.tagName) {
                    continue;
                }
                //th
                let th = new nodom.Element('div');
                th.addClass('nd-grid-row-item');
                th.props['style'] = 'flex:' + c.props['width'] || 0;
                console.log(c.expressions);
                //表头内容
                let span = new nodom.Element('span');
                span.assets.set('innerHTML', c.props['title']);
                th.add(span);
                //允许排序
                if (grid.props.hasOwnProperty('sortable')) {
                    //图片不排序，设置notsort属性不排序
                    if (c.props['type'] !== 'img' && !c.props.hasOwnProperty('notsort')) {
                        th.add(this.addSortBtn());
                    }
                }
                thead.add(th);
                //td
                //表格body
                let tdIn = c.children[0];
                switch (c.props['type']) {
                    case 'img':
                        tdIn.tagName = 'img';
                        tdIn.exprProps['src'] = tdIn.expressions;
                        c.children = [tdIn];
                        delete tdIn.expressions;
                        break;
                }
                c.tagName = 'div';
                c.addClass('nd-grid-row-item');
                //设置自定义flex
                if (c.props['width'] && nodom.Util.isNumberString(c.props['width'])) {
                    c.props['style'] = 'flex:' + c.props['width'];
                }
                firstDom.add(c);
                delete c.props['title'];
                delete c.props['type'];
                delete c.props['width'];
            }
            //网格线
            if (gridLine) {
                this.addGridLine(gridLine, thead, firstDom);
            }
            //替换孩子节点
            rowDom.children = [firstDom];
            //带子容器
            if (subDom) {
                //表头加一列
                let th = new nodom.Element('div');
                th.addClass('nd-icon-right nd-grid-iconcol nd-grid-row-item');
                thead.children.unshift(th);
                //行前添加箭头
                let td = new nodom.Element('div');
                td.addClass('nd-icon-right nd-grid-iconcol nd-grid-row-item');
                td.addDirective(new nodom.Directive('class', "{'nd-grid-showsub':'$showSub'}", td));
                td.addEvent(new nodom.NodomEvent('click', (dom, model, module, e) => {
                    model.set('$showSub', !model.data['$showSub']);
                }));
                firstDom.children.unshift(td);
                subDom.addDirective(new nodom.Directive('show', '$showSub', subDom));
                subDom.tagName = 'div';
                rowDom.add(subDom);
            }
            rowDom.tagName = 'div';
            tbody.add(rowDom);
        }
        delete grid.props['rowalt'];
        grid.children = [thead, tbody];
        grid.defineElement = this;
        return grid;
    }
    /**
     * 添加排序按钮
     */
    addSortBtn() {
        let updown = new nodom.Element('span');
        updown.addClass('nd-grid-sort');
        let up = new nodom.Element('B');
        up.addClass('nd-icon-arrow-down nd-grid-sort-raise');
        let down = new nodom.Element('B');
        down.addClass('nd-icon-arrow-down nd-grid-sort-down');
        const defineElement = this;
        /**
         * 升序按钮事件
         */
        up.addEvent(new nodom.NodomEvent('click', (dom, model, module, e) => {
            // defineElement.addSort()
        }));
        /**
         * 降序按钮事件
         */
        up.addEvent(new nodom.NodomEvent('click', (dom, model, module, e) => {
        }));
        updown.add(up);
        updown.add(down);
        return updown;
    }
    /**
     * 添加网格线
     * @param gridLine  网格线类型 column row both
     * @param headDom   表格头
     * @param rowDom    表格体
     */
    addGridLine(gridLine, headDom, rowDom) {
        switch (gridLine) {
            case 'column':
                headDom.addClass('nd-grid-col-line');
                rowDom.addClass('nd-grid-col-line');
                break;
            case 'row':
                headDom.addClass('nd-grid-row-line');
                rowDom.addClass('nd-grid-row-line');
                break;
            case 'both':
                headDom.addClass('nd-grid-row-line nd-grid-col-line');
                rowDom.addClass('nd-grid-row-line nd-grid-col-line');
                break;
        }
    }
    /**
     * 设置排序
     */
    setSort() {
    }
}
nodom.DefineElementManager.add('UI-GRID', UIGrid);
//# sourceMappingURL=grid.js.map