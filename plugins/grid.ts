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
class UIGrid extends nodom.DefineElement{
    tagName:string = 'UI-GRID';
    /**
     * 字段对象数组，{title:标题,field:字段,expressions:表达式}
     */
    fields:object[] = [];
    
    /**
     * grid数据绑定字段名
     */
    dataName:string;
    
    /**
     * 行交替
     */
    rowAlt:boolean;

    /**
     * 排序
     */
    sortable:boolean;

    /**
     * 网格线 row column both
     */
    gridLine:string;

    
    /**
     * 数据行 dom key
     */
    rowDomKey:string;

    /**
     * 固定头部
     */
    fixHead:boolean;

    /**
     * 是否隐藏头部
     */
    hideHead:boolean;

    /**
     * 页号
     */
    currentPage:number;

    /**
     * 页面大小
     */
    pageSize:number;

    /**
     * 选择分页数据方法id
     */
    selectPageMethodId:string;

    /**
     * 初始化标志
     */
    initFlag:boolean;

    /**
     * modelId
     */
    modelId:number;

    /**
     * 编译后执行代码
     */
    init(el:HTMLElement):nodom.Element{
        let grid:nodom.Element = new nodom.Element('div');
        nodom.Compiler.handleAttributes(grid,el);
        nodom.Compiler.handleChildren(grid,el);
        grid.addClass('nd-grid');
        // rowalt sortable gridline='both' sizeName='pageSize'
        UITool.handleUIParam(grid,this,
            ['dataname','rowalt|bool','sortable|bool','gridline','fixhead|bool','hidehead|bool'],
            ['dataName','rowAlt','sortable','gridLine','fixHead','hideHead'],
            ['rows',null,null,'',null,null,null]);

        if(this.fixHead){
            grid.addClass('nd-grid-fixed');
        }

        //头部，如果隐藏则不显示
        let thead:nodom.Element
        if(!this.hideHead){
            thead = new nodom.Element('div');
            thead.addClass('nd-grid-head');
        }
        
        //tbody
        let tbody:nodom.Element = new nodom.Element('div');
        tbody.addClass('nd-grid-body');
        if(this.rowAlt){
            tbody.addClass('nd-grid-body-rowalt');
        }

        //数据行dom

        let rowDom:nodom.Element;
        //子表格dom
        let subDom:nodom.Element;
        //分页dom
        let pagination:nodom.Element;
        //第一个tr
        for(let c of grid.children){
            if(c.tagName === 'COLS'){
                rowDom = c;
            }else if(c.tagName === 'SUB'){
                subDom = c;
            }else if(c.defineElement && c.defineElement.tagName === 'UI-PAGINATION'){
                pagination = c;
            }
        }
        
        if(rowDom){
            this.rowDomKey = rowDom.key;
            //每一行包括行数据和subpanel，所以需要rowDom作为容器，dataDom作为数据行，subDom最为子panel
            //增加repeat指令
            let filter:nodom.Filter;
            //设置选择页数据
            if(pagination){
                this.selectPageMethodId = '$$nodom_method_gen_' + nodom.Util.genId();
                filter = new nodom.Filter('select:func:' + this.selectPageMethodId);
            }
            let directive:nodom.Directive;
            directive = new nodom.Directive('repeat',this.dataName);
            if(filter){
                directive.filters = [filter];
            }
            rowDom.addDirective(directive);
            
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

                //隐藏列不显示
                if(c.hasProp('hide')){
                    c.delProp('hide');
                    continue;
                }
                
                let field:string = c.getProp('field');
                if(field){
                    field = field.trim();
                }
                //暂存field
                this.fields.push( {
                    title:c.getProp('title'),
                    field:field,
                    expressions:c.children[0].expressions
                });
                //添加到头部
                this.addToHead(c,i,thead,field);
                
                //td
                let tdIn:nodom.Element = c.children[0];

                switch(c.getProp('type')){
                    case 'img':
                        tdIn.tagName = 'img';
                        tdIn.setProp('src',tdIn.expressions,true);
                        c.children = [tdIn];
                        delete tdIn.expressions;
                        break;
                }
                c.tagName='div';
                c.addClass('nd-grid-row-item');
                
                //设置自定义flex
                if(c.hasProp('width') && nodom.Util.isNumberString(c.getProp('width'))){
                    c.setProp('style','flex:' + c.getProp('width'));
                }
                
                dataDom.add(c);
                c.delProp(['title','type','width','field','notsort']);
            }

            //替换孩子节点
            rowDom.children = [dataDom];
            rowDom.delProp('data');
            //带子容器
            if(subDom){
                this.handleSub(subDom,thead,dataDom,rowDom);
            }
            tbody.add(rowDom);
        }
        
        if(thead){
            grid.children=[thead,tbody];
        }else{
            grid.children=[tbody];
        }
        
        grid.defineElement = this;
        //如果有分页，则需要在外添加容器
        if(pagination){
            let parentDom:nodom.Element = new nodom.Element('div');
            parentDom.children = [grid,pagination];
            pagination.addClass('nd-grid-pager');
            this.handlePagination(pagination);
            return parentDom;
        }
        return grid;
    }

    /**
     * 添加到头部
     * @param col       列dom
     * @param index     当前index
     * @param thead     thead
     * @param field     绑定字段
     */ 
    addToHead(col:nodom.Element,index:number,thead:nodom.Element,field?:string){
        if(!thead){
            return;
        }
        //如果没有孩子节点，则创建一个
        if(thead.children.length === 0){
            let thCt = new nodom.Element('div');
            thCt.addClass('nd-grid-row');
            thead.add(thCt);    
        }
        //隐藏头部不显示
        if(thead){
            //th
            let th:nodom.Element = new nodom.Element('div');
            th.addClass('nd-grid-row-item');
            th.setProp('style','flex:' + col.getProp('width')||0);
            //表头内容
            let span:nodom.Element = new nodom.Element('span');
            span.assets.set('innerHTML',col.getProp('title'));
            th.add(span);
            //允许排序
            if(this.sortable){
                //图片不排序，设置notsort属性，无field属性不排序
                if(col.getProp('type') !== 'img' && !col.hasProp('notsort') && field){
                    th.add(this.addSortBtn(index));
                }
            }
        
            thead.children[0].add(th);
        }
    }
    /**
     * 添加排序按钮
     */
    addSortBtn(index:number):nodom.Element{
        let updown:nodom.Element = new nodom.Element('span');
        updown.addClass('nd-grid-sort');
        let up:nodom.Element = new nodom.Element('B');
        up.addClass('nd-grid-sort-raise');
        //保存index
        up.tmpData = {index:index};
        let down:nodom.Element = new nodom.Element('B');
        down.addClass('nd-grid-sort-down');
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
        th.addClass('nd-grid-iconcol');
        let b:nodom.Element = new nodom.Element('b');
        b.addClass('nd-grid-sub-btn');
        th.add(b);
        if(thead){
            thead.children[0].children.unshift(th);
        }
        
        
        //行前添加箭头
        let td:nodom.Element = new nodom.Element('div');
        td.addClass('nd-grid-iconcol');
        b = new nodom.Element('b');
        b.addClass('nd-grid-sub-btn');
        b.addDirective(new nodom.Directive('class',"{'nd-grid-showsub':'$showSub'}"));
        b.addEvent(new nodom.NodomEvent('click', ':delg',
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
        subDom.addDirective(new nodom.Directive('show','$showSub'));
        subDom.addClass('nd-grid-sub');
        //自动
        if(subDom.hasProp('auto')){
            subDom.children = [];
            //label宽度
            let lw:string = subDom.getProp('labelwidth')||1;
            //content宽度
            let cw:string = subDom.getProp('contentwidth')||5;
            //每行显示数
            let cols:number = subDom.hasProp('cols')?parseInt(subDom.getProp('cols')):1;
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
                subDom.delProp(['auto','cols','labelwidth']);
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
        if(directive.filters.length === 1){
            directive.filters.push(new nodom.Filter(arr));
        }else{
            directive.filters[1] = new nodom.Filter(arr);
        }
        
        //重新渲染
        nodom.Renderer.add(module);
    }

    /**
     * 前置渲染
     * @param module 
     * @param uidom 
     */
    beforeRender(module:nodom.Module,uidom:nodom.Element){
        let me = this;
        this.modelId = uidom.modelId;
        
        if(!this.initFlag){
            this.initFlag = true;
            //增加过滤器方法
            if(this.selectPageMethodId){
                module.methodFactory.add(this.selectPageMethodId,
                    (arr)=>{
                        let start = (me.currentPage-1) * me.pageSize;
                        let end = start + me.pageSize;
                        return arr.slice(start,end);
                    }
                );
            }
        }
    }


    /**
     * 处理pagination
     */
    handlePagination(pagination:nodom.Element){
        let me = this;
        let df:UIPagination = <UIPagination>pagination.defineElement;
        if(df.currentPage){
            this.currentPage = df.currentPage;
        }
        if(df.pageSize){
            this.pageSize = df.pageSize;
        }
        let reqName = df.requestName;
        //如果已经有change事件了，则不再设置
        if(!df.onChange){
            //增加onchange事件
            df.onChange = (module:nodom.Module,pageNo:number,pageSize:number)=>{
                //无请求
                if(reqName.length === 0){
                    me.currentPage = pageNo;
                    me.pageSize = pageSize;
                    //渲染模块
                    nodom.Renderer.add(module);
                }else{
                    let params = {};
                    params[reqName[0]] = pageNo;
                    params[reqName[1]] = pageSize;
                    
                    request({
                        url:module.dataUrl,
                        params:params,
                        type:'json'
                    }).then(r=>{
                        if(!r){
                            return;
                        }
                        if(r[df.totalName]){
                            module.model.set(df.totalName,r[df.totalName]);
                            df.changeParams(module);
                        }
                        module.model.set(me.dataName,r[me.dataName]);
                    });
                }
            }
        }
    }

}

nodom.DefineElementManager.add('UI-GRID',UIGrid);