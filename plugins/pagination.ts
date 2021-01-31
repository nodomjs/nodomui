///<reference types='nodomjs'/>

/**
 * 分页插件
 */
class UIPagination extends nodom.Plugin{
    tagName:string = 'UI-PAGINATION';
    
    /**
     * 附加数据项名
     */
    extraDataName:string;

    /**
     * 总条数字段名
     */
    totalName:string;

    /**
     * 页面大小
     */
    pageSize:number;

    /**
     * 是否显示total
     */
    showTotal:boolean;
    /**
     * 是否显示第几页
     */
    showGo:boolean;

    /**
     * 当前页
     */
    currentPage:number;

    /**
     * 显示页数
     */
    showNum:number;

    /**
     * 页面size列表
     */
    pageSizeData:number[];

    /**
     * 处理后的page size data
     */
    pageSizeDatas:object[];

    /**
     * 双箭头的步幅，默认5
     */
    steps:number;

    /**
     * 显示的最小页号
     */
    minPage:number=0;

    /**
     * 显示的最大页号
     */
    maxPage:number=0;

    /**
     * 附加数据模型id
     */
    extraModelId:number;

    /**
     * 页面总数
     */
    private pageCount:number = 0;

    /**
     * 数据记录总数
     */
    private recordCount:number = 0;
    /**
     * 数据url
     */
    private dataUrl:string;

    /**
     * 请求页号 name
     */
    private pageName:string;

    /**
     * 请求 页面大小 name
     */
    private sizeName:string;
    
    /**
     * 请求参数对戏，当dataUrl存在时有效
     */
    private params:object = {};



    /**
     * 变化事件 方法名或函数，如果为方法名，则属于module的method factory
     */
    onChange:string|Function;

    /**
     * 请求返回后响应事件
     */
    onReq:string|Function;

    constructor(params:HTMLElement|object){
        super(params);
        let rootDom:nodom.Element = new nodom.Element();
        if(params){
            if(params instanceof HTMLElement){
                nodom.Compiler.handleAttributes(rootDom,params);
                nodom.Compiler.handleChildren(rootDom,params);
                UITool.handleUIParam(rootDom,this,
                    ['totalname','pagesize|number','currentpage|number','showtotal|bool','showgo|bool','shownum|number','sizechange|array|number','steps|number','dataurl','pagename','sizename','onchange','onreq'],
                    ['totalName','pageSize','currentPage','showTotal','showGo','showNum','pageSizeData','steps','dataUrl','pageName','sizeName','onChange','onReq'],
                    ['total',10,1,null,null,10,[],0,'','page','size','','']);
            }else if(typeof params === 'object'){
                for(let o in params){
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
    private generate(rootDom:nodom.Element){
        let me = this;
        if(me.steps === 0){
            me.steps = me.pageSize;
        }
        rootDom.addClass('nd-pagination');
        rootDom.children = [];
        this.extraDataName = '$ui_pagination_' + nodom.Util.genId();
        
        //增加附加数据模型
        rootDom.addDirective(new nodom.Directive('model',this.extraDataName,rootDom));
        //显示共x条
        if(this.showTotal){
            let totalDom:nodom.Element = new nodom.Element('div');
            let txt:nodom.Element = new nodom.Element();
            txt.textContent = NUITipWords.total;
            totalDom.add(txt);
            let span:nodom.Element = new nodom.Element('span');
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
        if(this.pageSizeData && this.pageSizeData.length>0){
            let datas = [];
            for(let d of this.pageSizeData){
                datas.push({
                    value:d,
                    text:d + NUITipWords.record + '/' + NUITipWords.page
                });
            }
            this.pageSizeDatas = datas;
            rootDom.add(new UISelect({
                dataName:'pageSize',
                listField:'sizeData',
                displayField:'text',
                valueField:'value'
            }).element);
        }

        //分页内容
        let pageCt:nodom.Element = new nodom.Element('div');
        pageCt.addClass('nd-pagination-pagect');
        //左双箭头
        let left1:nodom.Element = new nodom.Element('b');
        left1.addClass('nd-pagination-leftarrow1');
        left1.addDirective(new nodom.Directive('class',"{'nd-pagination-disable':'[1,3,5,7,9,11,13,15].includes(btnAllow)'}",left1));
        pageCt.add(left1);
        //左箭头
        let left:nodom.Element = new nodom.Element('b');
        left.addClass('nd-pagination-leftarrow');
        left.addDirective(new nodom.Directive('class',"{'nd-pagination-disable':'[2,3,6,7,10,11,15].includes(btnAllow)'}",left));
        pageCt.add(left);
        //页面数字
        let page:nodom.Element = new nodom.Element('span');
        page.addClass('nd-pagination-page');
        page.addDirective(new nodom.Directive('repeat','pages',page));
        page.addDirective(new nodom.Directive('class',"{'nd-pagination-active':'active'}",page),true);
        let txt:nodom.Element = new nodom.Element();
        txt.expressions = [new nodom.Expression('no')];
        page.add(txt);
        pageCt.add(page);
        //右箭头
        let right:nodom.Element = new nodom.Element('b');
        right.addClass('nd-pagination-rightarrow');
        right.addDirective(new nodom.Directive('class',"{'nd-pagination-disable':'[4,5,6,7,12,13,15].includes(btnAllow)'}",right));
        pageCt.add(right);
        //右双箭头
        let right1:nodom.Element = new nodom.Element('b');
        right1.addClass('nd-pagination-rightarrow1');
        right1.addDirective(new nodom.Directive('class',"{'nd-pagination-disable':'[8,9,10,11,12,13,15].includes(btnAllow)'}",right1));
        pageCt.add(right1);

        rootDom.add(pageCt);

        //页面号点击事件
        page.addEvent(new nodom.NodomEvent('click',
            (dom,model,module)=>{
                let model1:nodom.Model = module.getModel(this.extraModelId);
                model1.set('pageNo',model.data['no']);
            }
        ));
        left.addEvent(new nodom.NodomEvent('click',
            (dom,model,module)=>{
                if(dom.hasClass('nd-pagination-disable')){
                    return;
                }
                if(this.currentPage === 1){
                    return;
                }
                model.set('pageNo',--this.currentPage);
            }
        ));

        right.addEvent(new nodom.NodomEvent('click',
            (dom,model,module)=>{
                if(dom.hasClass('nd-pagination-disable')){
                    return;
                }
                if(this.currentPage === this.pageCount){
                    return;
                }
                model.set('pageNo',++this.currentPage);
            }
        ));

        left1.addEvent(new nodom.NodomEvent('click',
            (dom,model,module)=>{
                if(dom.hasClass('nd-pagination-disable')){
                    return;
                }
                let page = me.currentPage - me.steps;
                if(page < 1){
                    page = 1;
                }
                model.set('pageNo',page);
            }
        ));

        right1.addEvent(new nodom.NodomEvent('click',
            (dom,model,module)=>{
                if(dom.hasClass('nd-pagination-disable')){
                    return;
                }
                let page = me.currentPage + me.steps;
                if(page > this.pageCount){
                    page = this.pageCount;
                }
                model.set('pageNo',page);
            }
        ));
        //显示第x页及输入框
        if(this.showGo){
            let goDom:nodom.Element = new nodom.Element('div');
            goDom.addClass('nd-pagination-go');
            let txt:nodom.Element = new nodom.Element();
            txt.textContent = NUITipWords.NO;
            goDom.add(txt);
            let input:nodom.Element = new nodom.Element('input');
            input.setProp('type','number');
            input.addDirective(new nodom.Directive('field','pageNo',input));
            input.setProp('value',new nodom.Expression('pageNo'),true);
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
     * 计算最大最小页号
     * @param module 
     * @param steps 
     */
    private cacMinMax(module:nodom.Module){
        let step = this.showNum / 2 | 0;
        this.minPage = this.currentPage - step;
        this.maxPage = this.currentPage + step;
        if(this.minPage < 1){
            this.minPage = 1;
        }
        if(this.minPage > this.pageCount){
            this.minPage = this.pageCount;
        }
        if(this.maxPage < 1){
            this.maxPage = 1;
        }
        if(this.maxPage > this.pageCount){
            this.maxPage = this.pageCount;
        }
        if(this.pageCount > this.showNum){
            //补全页码个数为 showNum
            let d = this.maxPage + 1 - this.minPage  - this.showNum;
            if(d < 0){  //数量不够
                if(this.maxPage === this.pageCount){
                    this.minPage += d;
                }else{
                    this.maxPage -= d;
                }
            }else if(d>0){ //数量多了
                if(this.maxPage === this.pageCount){
                    this.minPage += d;
                }else{
                    this.maxPage -= d;
                }
            }
        }
    }

    /**
     * 添加数据项watch
     * @param pmodel    插件外部模型
     * @param model     插件内部模型
     */
    private addWatch(pmodel:nodom.Model,model:nodom.Model){
        //增加页面号
        model.watch('pageNo',(module,field,value)=>{
            if(typeof value === 'string'){
                value = parseInt(value);
            }
            //设置当前页
            this.currentPage = value;
            this.cacMinMax(module);
            this.changeParams(module);
            this.doChangeEvent(module);
            this.doReq(module);
        });

        //监听页面大小
        model.watch('pageSize',(module,field,value)=>{
            if(typeof value === 'string'){
                value = parseInt(value);
            }
            //设置页面大小
            this.pageSize = value;
            this.pageCount = Math.ceil(this.recordCount/this.pageSize);
            this.cacMinMax(module);
            this.changeParams(module);
            this.doChangeEvent(module);
            this.doReq(module);
        });

        //监听total
        model.watch('total',(module,field,value)=>{
            let old = this.pageCount;
            this.recordCount = value;
            this.pageCount = Math.ceil(this.recordCount/this.pageSize);
            this.cacMinMax(module);
            this.changeParams(module);
            
            //total修改导致页面减少，且当前页超出最大页
            if(this.currentPage >= this.pageCount){
                model.set('pageNo',this.pageCount-1);
            }

            //旧页面数为0
            if(this.pageCount>0 && old === 0){ 
                model.set('pageNo',1);
            }
            //保持父对象同步
            pmodel.data[this.totalName] = value;
        });
        
        //监听父对象total
        pmodel.watch(this.totalName,(module,field,value)=>{
            if(typeof value === 'string'){
                value = parseInt(value);
            }
            model.set('total',value);
        });
    }

    /**
     * 渲染前置方法
     * @param module 
     * @param uidom 
     */
    beforeRender(module:nodom.Module,uidom:nodom.Element){
        super.beforeRender(module,uidom);
        this.handleInit(uidom,module);
    }
    
    /**
     * 改变pagination 参数
     * @param module    模块
     */
    private changeParams(module?:nodom.Module){
        if(!module){
            module = nodom.ModuleFactory.get(this.moduleId);
        }
        
        let btnAllow:number = 0;
        //页面号数据数组
        let pageArr = [];
        
        for(let i=this.minPage;i<=this.maxPage;i++){
            pageArr.push({
                no:i,
                active: i===this.currentPage?true:false
            });
        }

        if(this.currentPage === 1){
            btnAllow = 3;
        }else if(this.currentPage === this.pageCount){
            btnAllow = 12;
        }else{
            btnAllow = 0;
        }
        
        let model:nodom.Model = module.getModel(this.extraModelId);
        //设置箭头状态值
        model.set('btnAllow',btnAllow);
        model.set('pages',pageArr);
    }
    /**
     * 只执行一次的初始化
     * @param dom 
     * @param module
     */
    private handleInit(dom:nodom.Element,module:nodom.Module){
        if(!this.needPreRender){
            return;
        }
        let model:nodom.Model = module.getModel(dom.modelId);
        let total = model.query(this.totalName) || 0;
        let model1:nodom.Model = model.set(this.extraDataName,{
            total:total,
            //页面数
            pageNum:0,
            //页号
            pageNo:0,
            //页面大小
            pageSize:this.pageSize,
            /**
             * 按钮允许使用name(自动创建)
             * 包括左双箭头、左箭头、右箭头、右双箭头
             * 对应数据 1左双箭头禁用 2左箭头禁用 4右箭头禁用 8右双箭头禁用,组合值则禁用多个:如6禁用左箭头和右箭头
             */
            btnAllow:0,
            //显示页号数组，如 [11,12,13,14,15]
            pages:[],
            //页面数数组
            sizeData:this.pageSizeDatas || [10,20,30,50]
        });
        
        this.pageCount = Math.ceil(total/this.pageSize);
        this.cacMinMax(module);
        
        //附加数据模型
        this.extraModelId = model1.id;
        this.addWatch(model,model1);
        if(this.pageCount > 0 || this.dataUrl !== ''){
            this.setPage(1);
        }
    }

    /**
     * 设置total值
     * @param value     total值 
     */
    public setTotal(value:number){
        let module:nodom.Module = nodom.ModuleFactory.get(this.moduleId);
        let model:nodom.Model = module.getModel(this.modelId);
        model.set(this.extraDataName + '.total',value);
        this.changeParams(module);
    }

    /**
     * 获取total值
     * @returns     total值
     */
    public getTotal():number{
        let model:nodom.Model = this.getModel();
        if(model!==null){
            model.query(this.extraDataName + '.total');
        }
        return 0;
    }

    /**
     * 获取total对应的字段名
     * @returns     total名
     */
    public getTotalName():string{
        return this.totalName;
    }

    /**
     * 设置页号
     * @param value 页号 
     */
    public setPage(value:number){
        let model:nodom.Model = this.getModel();
        
        if(model!==null){
            model.set(this.extraDataName + '.pageNo',value);
        }
    }

    /**
     * 获取页号
     * @returns     页号
     */
    public getPage():number{
        let model:nodom.Model = this.getModel();
        if(model!==null){
            return model.query(this.extraDataName + '.pageNo');
        }
        return 0;
    }

    /**
     * 设置参数值
     * @param name      参数名 
     * @param value     参数值
     */
    public setParam(name,value){
        this.params[name] = value;
    }

    /**
     * 获取参数值
     * @param name      参数名 
     * @returns         参数值
     */
    public getParam(name:string):any{
        return this.params[name];
    }
    /**
     * 请求数据
     */
    private doReq(module?:nodom.Module){
        if(this.dataUrl === ''){
            return;
        }
        if(!module){
            module = nodom.ModuleFactory.get(this.moduleId);
        }
        
        //复制参数
        let params = nodom.Util.clone(this.params);
        params[this.pageName] = this.currentPage;
        params[this.sizeName] = this.pageSize;
        
        nodom.request({
            url:this.dataUrl,
            params:params,
            type:'json'
        }).then(r=>{
            if(!r){
                return;
            }
            if(r.total){
                this.setTotal(r.total);
            }else if(Array.isArray(r)){ //无total且结果为数组，则设置total为数组长度
                this.setTotal(r.length);
            }
            this.doReqEvent(r,module);
        });
    }

    /**
     * 执行change事件
     * @param module    模块
     */
    private doChangeEvent(module?:nodom.Module){
        if(this.onChange === ''){
            return;
        }
        if(!module){
            module = nodom.ModuleFactory.get(this.moduleId);
        }
        let foo:Function;
        if(typeof this.onChange === 'string'){
            this.onChange = module.getMethod(this.onChange);
        }else if(nodom.Util.isFunction(this.onChange)){
            foo = this.onChange;
        }
        if(foo){
            foo.apply(this,[module,this.currentPage,this.pageSize]);
        }
    }

    /**
     * 执行请求后事件
     * @param data 
     * @param module 
     */
    private doReqEvent(data:any,module?:nodom.Module){
        if(this.onReq === ''){
            return;
        }
        if(!module){
            module = nodom.ModuleFactory.get(this.moduleId);
        }
        // onReq事件
        let foo:Function;
        if(typeof this.onReq === 'string'){
            this.onReq = module.getMethod(this.onReq);
        }else if(nodom.Util.isFunction(this.onReq)){
            foo = this.onReq;
        }
        if(foo){
            foo.apply(this,[module,data]);
        }
    }

}

nodom.PluginManager.add('UI-PAGINATION',UIPagination);