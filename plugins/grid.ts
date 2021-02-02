///<reference types='nodomjs'/>

/**
 * panel 插件
 * ui-grid参数
 *  rowalt      行颜色交替标志，不用设置值
 *  sortable    排序标志，不用设置值 
 *  gridline    网格线类型，包括column(列) row(行) both(行列)，不设置则不显示
 * cols参数(列信息)
 *  field       表格数据数组对应名，如rows等
 *  子元素(列)，用div元素
 *  width       宽度，表示整个列宽度为几份，所有列的宽度合在一起表示总份数，栅格方式，默认1
 *  title       该列表头显示
 *  notsort     当表格设置sortable时，该设置表示该列不显示排序按钮
 *  editable    是否可编辑 尚未提供
 *  inputtype   输入类型，参考ui-form，默认text，尚未提供
 *
 * sub参数(详细显示框)
 *  auto        自动生成详细显示框标志，设置该标志后，点击左侧箭头，自动生成显示框
 *  cols        一行显示列数，auto设置时有效
 *  labelwidth  label宽度，默认100，auto设置时有效
 */
class UIGrid extends nodom.Plugin{
    tagName:string = 'UI-GRID';
    
    /**
     * grid数据绑定字段名
     */
    private dataName:string;
    
    /**
     * 行交替
     */
    private rowAlt:boolean;

    /**
     * 排序
     */
    private sortable:boolean;

    /**
     * 网格线 row column both
     */
    private gridLine:string;

    /**
     * 固定头部
     */
    private fixHead:boolean;

    /**
     * 显示checkbox
     */
    private checkbox:boolean;

    /**
     * 是否隐藏头部
     */
    private hideHead:boolean;

    /**
     * 默认列宽
     */
    private defaultColWidth:number;

    /**
     * 全选字段名(checkbox时有效)
     */
    private wholeCheckName:string;

    /**
     * 是否显示下拉详情
     */
    private showDetail:boolean;

    /**
     * 显示子属性名
     */
    private subName:string;

    /**
     * 选中属性名
     */
    private checkName:string;

    /**
     *  滚动变量数据
     */
    private scrollName:string;

    /**
     * 行repeat指令
     */
    private repeatDirective:nodom.Directive;
    
    constructor(params:HTMLElement|object){
        super(params);
        let rootDom:nodom.Element = new nodom.Element();
        if(params){
            if(params instanceof HTMLElement){
                nodom.Compiler.handleAttributes(rootDom,params);
                nodom.Compiler.handleChildren(rootDom,params);
                UITool.handleUIParam(rootDom,this,
                    ['dataname','rowalt|bool','sortable|bool','gridline','fixhead|bool','checkbox|bool','hidehead|bool','defaultcolwidth|number'],
                    ['dataName','rowAlt','sortable','gridLine','fixHead','checkbox','hideHead','defaultColWidth'],
                    ['rows',null,null,'',null,null,null,0]);
            }else if(typeof params === 'object'){
                for(let o in params){
                    this[o] = params[o];
                }
            }
            rootDom.tagName = 'div';
            rootDom = this.generate(rootDom);
        }
        rootDom.plugin = this;
        this.element = rootDom;
    }

    /**
     * 产生插件内容
     * @param rootDom 插件对应的element
     */
    private generate(rootDom:nodom.Element):nodom.Element{
        rootDom.addClass('nd-grid');
        
        //生成行数据附加名
        let genName = '$ui_grid_' + nodom.Util.genId();
        this.subName = genName + '_showSub';
        this.checkName = genName + '_checked';
        this.scrollName = genName + '_scroll';
        if(this.checkbox){
            this.wholeCheckName = genName + '_wholeCheck';
        }

        if(this.fixHead){
            rootDom.addClass('nd-grid-fixed');
        }

        //头部，如果隐藏则不显示
        let headTbl:nodom.Element;
        let thead:nodom.Element;
        if(!this.hideHead){
            thead = new nodom.Element('div');
            thead.addClass('nd-grid-head');
            headTbl = new nodom.Element('table');
            thead.add(headTbl);
        }
        
        //tbody
        let tbody:nodom.Element = new nodom.Element('div');
        tbody.addClass('nd-grid-body');
        if(this.rowAlt){
            tbody.addClass('nd-grid-rowalt');
        }

        let bodyTbl:nodom.Element = new nodom.Element('table');
        tbody.add(bodyTbl);

        //数据行dom
        let rowDom:nodom.Element;
        //子表格dom
        let subDom:nodom.Element;
        
        //第一个tr
        for(let c of rootDom.children){
            if(c.tagName === 'COLS'){
                rowDom = c;
            }else if(c.tagName === 'SUB'){
                this.showDetail = true;
                subDom = c;
            }
        }
        
        if(!rowDom){
            return;
        }

        let fields = [];
            
        //处理所有td
        for(let c of rowDom.children){
            //不带tagname的直接删除
            if(!c.tagName){
                continue;
            }

            let field:string = c.getProp('field');
            if(field){
                field = field.trim();
            }
            
            //暂存field
            fields.push({
                title:c.getProp('title'),
                field:field,
                type:0,  //0 数据表格, 1 子表格 ,2 checkbox
                notsort:c.hasProp('notsort'),
                children: c.children,
                hide:c.hasProp('hide'),
                width: c.hasProp('width') && nodom.Util.isNumberString(c.getProp('width'))?c.getProp('width'):this.defaultColWidth
            });
        }
        
        if(this.checkbox){
            fields.unshift({
                type:2,
                width:45,
            })
        }

        if(this.showDetail){
            fields.unshift({
                type:1,
                width:45,
            })
        }

        this.handleBody(tbody,fields,subDom);
        if(headTbl){
            this.handleHead(thead,fields);
            rootDom.children=[thead,tbody];
        }else{
            rootDom.children=[tbody];
        }
        
        //网格线
        this.handleGridLine(tbody,thead);
        this.handleScroll(tbody,thead);
        return rootDom;
    }

    /**
     * 处理网格线
     * @param tbody     body容器 
     * @param thead     head容器
     */
    private handleGridLine(tbody:nodom.Element,thead:nodom.Element){
        if(!this.gridLine){
            return;
        }
        tbody = tbody.children[0];
        if(thead){
            thead = thead.children[0];
        }
        let type;
        switch(this.gridLine){
            case 'row':
                type = 'rows';
                tbody.addClass('nd-grid-row-line');
                if(thead){
                    thead.addClass('nd-grid-top-line');
                }
                break;
            case 'col':
                type='cols';
                tbody.addClass('nd-grid-column-line');
                thead.addClass('nd-grid-column-line');
                break;
            case 'both':
                type='all';
                tbody.addClass('nd-grid-all-line');
                if(thead){
                    thead.addClass('nd-grid-column-line nd-grid-top-line');
                }
                break;
        }
        //表格网格线
        if(type){
            tbody.setProp('rules',type);
            if(thead){
                thead.setProp('rules',type);
            }
        }
    }
    /**
     * 处理thead
     * @param tbl       表头tbl
     * @param fields    字段集合
     */ 
    private handleHead(headCt:nodom.Element,fields:any[]){
        let colGroup:nodom.Element = new nodom.Element('colgroup');
        let tbl = headCt.children[0];
        tbl.add(colGroup);
        let thead:nodom.Element = new nodom.Element('thead');
        tbl.add(thead);
        let tr:nodom.Element = new nodom.Element('tr');
        thead.add(tr);
        let width = 0;
        let fixWidth:boolean = true;
        for(let f of fields){
            if(f.hide){
                continue;
            }
            // 列定义
            let col:nodom.Element = new nodom.Element('col');
            if(f.width){
                col.setProp('width',f.width);
                width += parseInt(f.width);
            }else{
                fixWidth = false;
            }
            
            //添加到列group
            colGroup.add(col);
            let th:nodom.Element = new nodom.Element('th');
            let div:nodom.Element = new nodom.Element('div');
            th.add(div);
            tr.add(th);

            switch(f.type){
                case 0:
                    div.assets.set('innerHTML',f.title);
                    //允许排序
                    if(this.sortable){
                        //图片不排序，设置notsort属性，无field属性不排序
                        if(f.type !== 'img' && !f.notsort && f.field){
                            div.add(this.addSortBtn(f.field));
                        }
                    }
                    break;
                case 1:  //子表格
                    let b:nodom.Element = new nodom.Element();
                    b.textContent='';
                    div.add(b);
                    break;
                case 2: //checkbox
                    let bh:nodom.Element = new nodom.Element('b');
                    bh.addClass('nd-icon-checkbox');
                    div.add(bh);
                    bh.addDirective(new nodom.Directive('class',"{'nd-checked':'"+ this.wholeCheckName +"'}",bh));

                    //表头复选框事件
                    bh.addEvent(new nodom.NodomEvent('click',(dom,model,module,e)=>{
                        let check = model.data[this.wholeCheckName] || false;
                        model.set(this.wholeCheckName,!check);
                        let model1:nodom.Model = this.getModel();
                        for(let d of model1.data[this.dataName]){
                            let m:nodom.Model = module.getModel(d.$modelId);
                            m.set(this.checkName,!check);
                        }
                    }));
            }
        }
        let widthName = 'min-width';
        if(fixWidth){
            widthName = 'width';
            headCt.setProp('style','max-width:' + (width+15) + 'px');
        }
        //设置head宽度和移动head
        tbl.setProp('style',[widthName + ':' + width +'px;transform:translateX(',new nodom.Expression(this.scrollName),'px)'],true);
    }

    /**
     * 处理table body
     * @param tbl       body tbl
     * @param fields    字段集合
     * @param subDom    子表格
     */ 
    private handleBody(bodyCt:nodom.Element,fields:any[],subDom:nodom.Element){
        let colGroup:nodom.Element = new nodom.Element('colgroup');
        let tbl = bodyCt.children[0];
        tbl.add(colGroup);
        let tBody:nodom.Element = new nodom.Element('tbody');
        tbl.add(tBody);
        //外层tr容器，因为可能存在detail行，所以需要加一个不渲染的容器
        let trCt:nodom.Element = new nodom.Element('div');
        tBody.add(trCt);
        new nodom.Directive('ignoreself','',trCt);
        this.repeatDirective = new nodom.Directive('repeat',this.dataName,trCt);
        
        let tr:nodom.Element = new nodom.Element('tr');
        trCt.add(tr);
        let width = 0;
        let fixWidth = true;
        for(let f of fields){
            if(f.hide){
                continue;
            }
            // 列定义
            let col:nodom.Element = new nodom.Element('col');
            if(f.width){
                col.setProp('width',f.width);
                width += parseInt(f.width);
            }else{
                fixWidth = false;
            }
            //添加到列group
            colGroup.add(col);

            let td:nodom.Element = new nodom.Element('td');
            
            let div:nodom.Element = new nodom.Element('div');
            td.add(div);
            tr.add(td);
            switch(f.type){
                case 0:
                    div.children = f.children;
                    break;
                case 1:
                    let b = new nodom.Element('b');
                    b.addClass('nd-grid-sub-btn');
                    new nodom.Directive('class',"{'nd-grid-showsub':'"+ this.subName + "'}",b);
                    div.add(b);
                    this.handleSub(subDom,tbl,b,fields);
                    break;
                case 2:
                    let b1 = new nodom.Element('b');
                    b1.addClass('nd-icon-checkbox');
                    new nodom.Directive('class',"{'nd-checked':'"+ this.checkName +"'}",b1);
                    div.add(b1);
                    b1.addEvent(new nodom.NodomEvent('click', 
                        (dom,model,module,e)=>{
                            model.set(this.checkName,!model.data[this.checkName]);
                        }
                    ));
            }
        }
        
        let widthName = 'min-width';
        if(fixWidth){
            widthName = 'width';
            bodyCt.setProp('style','max-width:' + (width+15) + 'px');
        }
        tbl.setProp('style',widthName + ':' + width + 'px');
    }
    /**
     * 添加排序按钮
     */
    private addSortBtn(field:string):nodom.Element{
        let updown:nodom.Element = new nodom.Element('span');
        updown.addClass('nd-grid-sort');
        let up:nodom.Element = new nodom.Element('B');
        up.addClass('nd-grid-sort-raise');
        //保存index
        up.setProp('field',field);
        let down:nodom.Element = new nodom.Element('B');
        down.addClass('nd-grid-sort-down');
        //保存index
        down.setProp('field',field);
        const plugin:UIGrid = this;
        /**
         * 升序按钮事件
         */
        up.addEvent(new nodom.NodomEvent('click',
            (dom,model,module,e)=>{
                plugin.sort(dom.getProp('field'),'asc',module);
            }
        ));

        /**
         * 降序按钮事件
         */
        down.addEvent(new nodom.NodomEvent('click',
            (dom,model,module,e)=>{
                plugin.sort(dom.getProp('field'),'desc',module);
            }
        ));
        updown.add(up);
        updown.add(down);
        return updown;
    }

    /**
     * 添加sub panel
     * @param subDom    ui-sub dom 
     * @param bodyTbl   body 表格
     * @param b         下拉点击按钮
     * @param fields    字段集合
     */
    private handleSub(subDom:nodom.Element,bodyTbl:nodom.Element,b:nodom.Element,fields:any[]){
        b.addEvent(new nodom.NodomEvent('click', 
            (dom,model,module,e)=>{
                model.set(this.subName,!model.query(this.subName));
            }
        ));
        
        //子panel处理
        let detailDom:nodom.Element = new nodom.Element('tr');
        bodyTbl.children[1].children[0].add(detailDom);
        
        //增加显示指令，$showSub作为新增数据项，用于控制显示
        new nodom.Directive('show',this.subName,detailDom);
        
        let td = new nodom.Element('td');
        detailDom.add(td);
        td.add(subDom);
        subDom.tagName = 'div';
        subDom.addClass('nd-grid-sub');

        let showCount=0;
        for(let f of fields){
            if(!f['hide']){
                showCount++;
            }
        }
        //设置colspan
        td.setProp('colspan',showCount);
        
        //自动
        if(subDom.hasProp('auto')){
            subDom.children = [];
            //label宽度
            let lw:string = subDom.getProp('labelwidth')||100;
            //每行显示数
            let cols:number = subDom.hasProp('cols')?parseInt(subDom.getProp('cols')):1;
            //单行不多于4个数据域
            if(cols > 4){
                cols = 4;
            }
            let cnt = 0;
            let rowCt:nodom.Element;
            fields.forEach((item)=>{
                if(item['type'] !== 0){
                    return;
                }
                if(cnt++ % cols === 0){
                    rowCt = new nodom.Element('div');
                    rowCt.addClass('nd-grid-sub-row');
                    subDom.add(rowCt);
                }
                
                let itemCt:nodom.Element = new nodom.Element('div');
                itemCt.addClass('nd-grid-sub-item');
                let label:nodom.Element = new nodom.Element('label');
                label.assets.set('innerHTML',item['title']);
                label.assets.set('style','width:' + lw + 'px');
                itemCt.add(label);

                let span:nodom.Element = new nodom.Element('span');
                span.addClass('nd-grid-sub-content');
                let txt:nodom.Element = new nodom.Element();
                txt.expressions = [new nodom.Expression(item['field'])];
                span.add(txt);
                itemCt.add(span);
                rowCt.add(itemCt);
                subDom.delProp(['auto','labelwidth']);
            });
        }
    }
    
    /**
     * 排序
     * @param field         字段名
     * @param asc           desc 降序 asc升序
     */
    private sort(field:string,asc:string,module:nodom.Module){
        let directive:nodom.Directive = this.repeatDirective;
        let arr:string[] = ['orderby',field,asc];
        if(!directive.filters){
            directive.filters = [];
        }
        if(directive.filters.length <= 1){
            directive.filters.push(new nodom.Filter(arr));
        }else{
            directive.filters[1] = new nodom.Filter(arr);
        }
        //重新渲染
        nodom.Renderer.add(module);
    }

    /**
     * 处理滚动事件
     * @param dom 
     */
    private handleScroll(tbody:nodom.Element,thead:nodom.Element){
        if(!thead){
            return;
        }
        tbody.addEvent(new nodom.NodomEvent('scroll',(dom,model,module,e)=>{
            model.set(this.scrollName,-e.target.scrollLeft);
        }));
    }

    /**
     * 前置渲染
     * @param module 
     * @param uidom 
     */
    beforeRender(module:nodom.Module,uidom:nodom.Element){
        super.beforeRender(module,uidom);
    }
    
    /**
     * 获取表格数据
     */
    public getData():any[]{
        let model:nodom.Model = this.getModel();
        let data = model.getData();
        if(data){
            return data[this.dataName];
        }
    }
    
    /**
     * 获取选中行数据集
     */
    public getSelectedRows():Array<any>{
        let module:nodom.Module = nodom.ModuleFactory.get(this.moduleId);
        let model:nodom.Model = module.getModel(this.modelId);
        let arr = [];
        let datas = model.query(this.dataName);
        for(let d of datas){
            if(d[this.checkName]){
                arr.push(d);
            }
        }
        return arr;
    }

    /**
     * 移除选中行
     */
    public removeSelectedRows(){
        let module:nodom.Module = nodom.ModuleFactory.get(this.moduleId);
        let model:nodom.Model = module.getModel(this.modelId);
        let datas = model.query(this.dataName);
        for (let i = 0; i < datas.length; i++) {
            if (datas[i][this.checkName]) {
                datas.splice(i--, 1);
            }
        }
    }

}

nodom.PluginManager.add('UI-GRID',UIGrid);