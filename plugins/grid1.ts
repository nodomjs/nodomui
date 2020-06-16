///<reference types='nodom'/>

/**
 * panel 插件
 */
class UIGrid1 implements nodom.IDefineElement{
    tagName:string = 'UI-GRID1';
    /**
     * 编译后执行代码
     */
    init(el:HTMLElement){
        let grid:nodom.Element = new nodom.Element('div');
        nodom.Compiler.handleAttributes(grid,el);
        nodom.Compiler.handleChildren(grid,el);
        grid.addClass('nd-grid');
        //thead
        let thead:nodom.Element = new nodom.Element('thead');
        thead.addClass('nd-grid-head');
        //tbody
        let tbody:nodom.Element = new nodom.Element('tbody');
        tbody.addClass('nd-grid-body');
        if(grid.props.hasOwnProperty('rowalt')){
            tbody.addClass('nd-grid-body-colorsplit');
        }

        //数据行dom
        let rowDom:nodom.Element = new nodom.Element();
        //子表格dom
        let subDom:nodom.Element = new nodom.Element();
        //第一个tr
        for(let c of grid.children){
            if(c.tagName === 'UI-ROW'){
                rowDom = c;
            }else if(c.tagName === 'UI-SUB'){
                subDom = c;
            }
        }
        //列数量
        let colNum:number = 0;
        if(rowDom){
            //增加repeat指令
            rowDom.addDirective(new nodom.Directive('repeat',rowDom.props['data'],rowDom));

            //处理所有td
            for(let c of rowDom.children){
                if(!c.tagName){
                    continue;
                }
                colNum++;
                //th
                let th:nodom.Element = new nodom.Element('th');
                //默认宽度100px
                th.props['width'] = c.props['width']?c.props['width'] + 'px':undefined;
                th.assets.set('innerHTML',c.props['title']);
                thead.add(th);
                
                //td
                //表格body
                let tdIn:nodom.Element = c.children[0];
                switch(c.props['type']){
                    case 'img':
                        tdIn.tagName = 'img';
                        tdIn.exprProps['src'] = tdIn.expressions;
                        c.children = [tdIn];
                        delete tdIn.expressions;
                        break;
                }
                c.tagName='td';
                delete c.props['title'];
                delete c.props['type'];
            }
            
            //带子容器
            if(subDom){
                //表头加一列
                let th:nodom.Element = new nodom.Element('th');
                thead.children.unshift(th);
                //行前添加箭头
                let td:nodom.Element = new nodom.Element('td');
                td.addClass('nd-icon-right');
                td.props['width']='20px';
                td.addEvent(new nodom.NodomEvent('click','',
                    (dom,model,module,e)=>{

                    }
                ));
                rowDom.children.unshift(td);
            }
            rowDom.tagName = 'tr';
            tbody.add(rowDom);
        }
        
        

        delete grid.props['rowalt'];
        
        grid.children=[thead,tbody];
        grid.defineType = this.tagName;
        return grid;
    }
}

nodom.DefineElementManager.add(new UIGrid1());