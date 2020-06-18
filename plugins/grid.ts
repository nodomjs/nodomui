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
class UIGrid implements nodom.IDefineElement{
    tagName:string = 'UI-GRID';
    /**
     * 字段对象数组，{title:标题,field:字段,expressions:表达式}
     */
    fields:object[] = [];
    /**
     * 表格主题
     */
    theme:string;

    /**
     * 数据行 dom key
     */
    rowDomKey:string;
    /**
     * 编译后执行代码
     */
    init(el:HTMLElement){
        let grid:nodom.Element = new nodom.Element('div');
        nodom.Compiler.handleAttributes(grid,el);
        nodom.Compiler.handleChildren(grid,el);
        grid.addClass('nd-grid');
        this.theme = grid.props['theme'] || 'green';
        //网格线
        let gridLine:string = grid.props['gridline'];
        //thead
        let thead:nodom.Element = new nodom.Element('div');
        thead.addClass('nd-grid-head nd-title-' + this.theme);
        
        //tbody
        let tbody:nodom.Element = new nodom.Element('div');
        tbody.addClass('nd-grid-body');
        if(grid.props.hasOwnProperty('rowalt')){
            tbody.addClass('nd-grid-body-rowalt');
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
        
        if(rowDom){
            this.rowDomKey = rowDom.key;
            //每一行包括行数据和subpanel，所以需要rowDom作为容器，dataDom作为数据行，subDom最为子panel
            //增加repeat指令
            rowDom.addDirective(new nodom.Directive('repeat',rowDom.props['data'],rowDom));
            rowDom.tagName = 'div';
            //第一个孩子
            let dataDom:nodom.Element = new nodom.Element('div');
            dataDom.addClass('nd-grid-row');
            //处理所有td
            for(let i=0;i<rowDom.children.length;i++){
                let c = rowDom.children[i];
                //不带tagname的直接删除
                if(!c.tagName){
                    rowDom.children.splice(i--,1);
                    continue;
                }
                let field:string = c.props['field'];
                if(field){
                    field = field.trim();
                }
                //暂存field
                this.fields.push( {
                    title:c.props['title'],
                    field:field,
                    expressions:c.children[0].expressions
                });

                if(c.props.hasOwnProperty('hide')){
                    delete c.props['hide'];
                    continue;
                }
                //th
                let th:nodom.Element = new nodom.Element('div');
                th.addClass('nd-grid-row-item');
                th.props['style'] = 'flex:' + c.props['width']||0;
                //表头内容
                let span:nodom.Element = new nodom.Element('span');
                span.assets.set('innerHTML',c.props['title']);
                th.add(span);
                //允许排序
                if(grid.props.hasOwnProperty('sortable')){
                    //图片不排序，设置notsort属性，无field属性不排序
                    if(c.props['type'] !== 'img' && !c.props.hasOwnProperty('notsort') && field){
                        th.add(this.addSortBtn(i,rowDom));
                    }
                }
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
                c.tagName='div';
                c.addClass('nd-grid-row-item');
                
                //设置自定义flex
                if(c.props['width'] && nodom.Util.isNumberString(c.props['width'])){
                    c.props['style'] = 'flex:' + c.props['width'];
                }
                
                dataDom.add(c);
                delete c.props['title'];
                delete c.props['type'];
                delete c.props['width'];
                delete c.props['field'];
                delete c.props['notsort'];
            }

            //网格线
            if(gridLine){
                this.addGridLine(gridLine,thead,dataDom);
            }
            //替换孩子节点
            rowDom.children = [dataDom];
            
            //带子容器
            if(subDom){
                this.handleSub(subDom,thead,dataDom,rowDom);
            }
            tbody.add(rowDom);
        }
        
        delete grid.props['rowalt'];
        delete grid.props['theme'];
        delete grid.props['sortable'];
        delete grid.props['gridline'];
        grid.children=[thead,tbody];
        grid.defineElement = this;
        return grid;
    }

    /**
     * 添加排序按钮
     */
    addSortBtn(index:number,rowDom:nodom.Element):nodom.Element{
        let updown:nodom.Element = new nodom.Element('span');
        updown.addClass('nd-grid-sort');
        let up:nodom.Element = new nodom.Element('B');
        up.addClass('nd-icon-arrow-down nd-grid-sort-raise');
        //保存index
        up.tmpData = {index:index};
        let down:nodom.Element = new nodom.Element('B');
        down.addClass('nd-icon-arrow-down nd-grid-sort-down');
        //保存index
        down.tmpData = {index:index};
        const defineElement:UIGrid = this;
        /**
         * 升序按钮事件
         */
        up.addEvent(new nodom.NodomEvent('click',
            (dom,model,module,e)=>{
                defineElement.sort(parseInt(dom.tmpData['index']),'asc',module);
            }
        ));

        /**
         * 降序按钮事件
         */
        down.addEvent(new nodom.NodomEvent('click',
            (dom,model,module,e)=>{
                defineElement.sort(parseInt(dom.tmpData['index']),'desc',module);
            }
        ));
        updown.add(up);
        updown.add(down);
        return updown;
    }

    /**
     * 添加sub panel
     * @param subDom    ui-sub dom 
     * @param thead     表格头部dom
     * @param dataDom   数据行dom
     * @param rowDom    数据行dom容器
     */
    handleSub(subDom:nodom.Element,thead:nodom.Element,dataDom:nodom.Element,rowDom:nodom.Element){
        //表头加一列
        let th:nodom.Element = new nodom.Element('div');
        th.addClass('nd-icon-right nd-grid-iconcol nd-grid-row-item');
        thead.children.unshift(th);
        
        //行前添加箭头
        let td:nodom.Element = new nodom.Element('div');
        td.addClass('nd-grid-iconcol nd-grid-row-item');
        let b:nodom.Element = new nodom.Element('b');
        b.addClass('nd-icon-right');
        b.addDirective(new nodom.Directive('class',"{'nd-grid-showsub':'$showSub'}",td));
        b.addEvent(new nodom.NodomEvent('click',
            (dom,model,module,e)=>{
                model.set('$showSub',!model.data['$showSub']);
            }
        ));
        td.add(b);
        dataDom.children.unshift(td);
        subDom.tagName = 'div';
        rowDom.add(subDom);
        //子panel处理
        //增加显示指令，$showSub作为新增数据项，用于控制显示
        subDom.addDirective(new nodom.Directive('show','$showSub',subDom));
        subDom.addClass('nd-grid-sub');
        //自动
        if(subDom.props.hasOwnProperty('auto')){
            subDom.children = [];
            //label宽度
            let lw:string = subDom.props['labelwidth']||1;
            //content宽度
            let cw:string = subDom.props['contentwidth']||5;
            //每行显示数
            let cols:number = subDom.props.hasOwnProperty('cols')?parseInt(subDom.props['cols']):1;
            let cnt = 0;
            let rowCt:nodom.Element;
            this.fields.forEach((item)=>{
                if(cnt++ % cols === 0){
                    rowCt = new nodom.Element('div');
                    rowCt.addClass('nd-grid-sub-row');
                    subDom.add(rowCt);
                }
                
                let itemCt:nodom.Element = new nodom.Element('div');
                itemCt.addClass('nd-grid-sub-item');
                let label:nodom.Element = new nodom.Element('label');
                label.assets.set('innerHTML',item['title']+':');
                label.assets.set('style','flex:' + lw);
                itemCt.add(label);

                let span:nodom.Element = new nodom.Element('span');
                span.assets.set('style','flex:' + cw);
                let txt:nodom.Element = new nodom.Element();
                txt.expressions = item['expressions'];
                span.add(txt);
                itemCt.add(span);

                rowCt.add(itemCt);
                delete subDom.props['auto'];
                delete subDom.props['cols'];
                delete subDom.props['labelwidth'];
            });
        }
        
    }
    /**
     * 添加网格线
     * @param gridLine  网格线类型 column row both
     * @param headDom   表格头
     * @param rowDom    表格体
     */
    addGridLine(gridLine:string,headDom:nodom.Element,rowDom:nodom.Element){
        switch(gridLine){
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
     * 排序
     * @param module        模块
     * @param fieldIndex    排序字段名
     * @param asc           desc 降序 asc升序
     */
    sort(index:number,asc:string,module:nodom.Module){
        let dom:nodom.Element = module.virtualDom.query(this.rowDomKey);
        let directive:nodom.Directive = dom.getDirective('repeat');
        if(!directive){
            return;
        }
        //找到字段
        let f = this.fields[index];
        if(!f || !f['field']){
            return;
        }
        let arr:string[] = ['orderby',f['field'],asc];
        directive.filter = new nodom.Filter(arr);
        //重新渲染
        nodom.Renderer.add(module);
    }


}

nodom.DefineElementManager.add('UI-GRID',UIGrid);