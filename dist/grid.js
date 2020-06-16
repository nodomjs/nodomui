///<reference types='nodom'/>
/**
 * panel 插件
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
            if (gridLine) {
                switch (gridLine) {
                    case 'column':
                        firstDom.addClass('nd-grid-col-line');
                        break;
                    case 'row':
                        firstDom.addClass('nd-grid-row-line');
                        break;
                    case 'both':
                        firstDom.addClass('nd-grid-row-line nd-grid-col-line');
                        break;
                }
            }
            //处理所有td
            for (let c of rowDom.children) {
                if (!c.tagName) {
                    continue;
                }
                //th
                let th = new nodom.Element('div');
                th.addClass('nd-grid-row-item');
                th.props['style'] = 'flex:' + c.props['width'] || 0;
                th.assets.set('innerHTML', c.props['title']);
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
                c.props['style'] = 'flex:' + c.props['width'];
                firstDom.add(c);
                delete c.props['title'];
                delete c.props['type'];
                delete c.props['width'];
            }
            //网格线
            if (gridLine) {
                switch (gridLine) {
                    case 'column':
                        thead.addClass('nd-grid-col-line');
                        firstDom.addClass('nd-grid-col-line');
                        break;
                    case 'row':
                        thead.addClass('nd-grid-row-line');
                        firstDom.addClass('nd-grid-row-line');
                        break;
                    case 'both':
                        thead.addClass('nd-grid-row-line nd-grid-col-line');
                        firstDom.addClass('nd-grid-row-line nd-grid-col-line');
                        break;
                }
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
                td.addEvent(new nodom.NodomEvent('click', '', (dom, model, module, e) => {
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
        grid.defineType = this.tagName;
        return grid;
    }
}
nodom.DefineElementManager.add(new UIGrid());
//# sourceMappingURL=grid.js.map