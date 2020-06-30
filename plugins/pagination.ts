///<reference types='nodom'/>

/**
 * 分页插件
 */
class UIPagination extends nodom.DefineElement{
    tagName:string = 'UI-PAGINATION';
    
    /**
     * 总条数字段名
     */
    totalName:string;

    /**
     * 总记录数
     */
    total:number;
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
     * 页数名(model自动生成)
     */
    pageDataName:string;

    /**
     * 当前页号数名
     */
    currentName:string;

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
     * page size dataName
     */
    pageSizeDataName:string;

    /**
     * 处理后的page size data
     */
    pageSizeDatas:object[];

    /**
     * 页面大小数据名(model自动生成)
     */
    pageSizeName:string;

    /**
     * 双箭头的步幅，默认5
     */
    steps:number;

    /**
     * 初始化标志
     */
    initFlag:boolean;

    /**
     * 显示的最小页号
     */
    minPage:number=1;

    /**
     * 显示的最大页号
     */
    maxPage:number=1;
    /**
     * 模型id
     */
    modelId:number;

    /**
     * 按钮允许使用name(自动创建)
     * 包括左双箭头、左箭头、右箭头、右双箭头
     * 对应数据 1左双箭头禁用 2左箭头禁用 4右箭头禁用 8右双箭头禁用,组合值则禁用多个:如6禁用左箭头和右箭头
     */
    btnAllowName:string;
    /**
     * 编译后执行代码
     */
    init(el:HTMLElement):nodom.Element{
        let me = this;
        let rootDom:nodom.Element = new nodom.Element();
        nodom.Compiler.handleAttributes(rootDom,el);
        nodom.Compiler.handleChildren(rootDom,el);
        rootDom.tagName = 'div';

        UITool.handleUIParam(rootDom,this,
            ['totalname','currentname','sizename','showtotal|bool','showgo|bool','shownum|number','sizechange|array|number','steps|number'],
            ['totalName','currentName','pageSizeName','showTotal','showGo','showNum','pageSizeData','steps'],
            [null,10,null,null,8,[],5]);
        
        rootDom.addClass('nd-pagination');
        rootDom.children = [];
        this.pageDataName = '$ui_pagination_' + nodom.Util.genId();
        this.pageSizeDataName = '$ui_pagination_' + nodom.Util.genId();
        this.btnAllowName = '$ui_pagination_' + nodom.Util.genId();
        //显示共x条
        if(this.showTotal){
            let totalDom:nodom.Element = new nodom.Element('div');
            let txt:nodom.Element = new nodom.Element();
            txt.textContent = TipWords.total;
            totalDom.add(txt);
            let span:nodom.Element = new nodom.Element('span');
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
        if(this.pageSizeData){
            let datas = [];
            for(let d of this.pageSizeData){
                datas.push({
                    value:d,
                    text:d + TipWords.record + '/' + TipWords.page
                });
            }
            
            this.pageSizeDatas = datas;
            let sizeDom:nodom.Element = new nodom.Element('select');
            sizeDom.addDirective(new nodom.Directive('field',this.pageSizeName,sizeDom));
            sizeDom.setProp('value',new nodom.Expression(this.pageSizeName),true);
            let optDom:nodom.Element = new nodom.Element('option');
            optDom.addDirective(new nodom.Directive('repeat',this.pageSizeDataName,optDom));
            optDom.setProp('value',new nodom.Expression('value'),true);
            let txt:nodom.Element = new nodom.Element();
            txt.expressions = [new nodom.Expression('text')];
            optDom.add(txt);
            sizeDom.add(optDom);
            rootDom.add(sizeDom);
        }

        //分页内容
        let pageCt:nodom.Element = new nodom.Element('div');
        pageCt.addClass('nd-pagination-pagect');
        //左双箭头
        let left1:nodom.Element = new nodom.Element('b');
        left1.addClass('nd-pagination-leftarrow1');
        left1.addDirective(new nodom.Directive('class',"{'nd-pagination-disable':'[1,3,5,7,9,11,13,15].includes("+ this.btnAllowName + ")'}",left1));
        pageCt.add(left1);
        //左箭头
        let left:nodom.Element = new nodom.Element('b');
        left.addClass('nd-pagination-leftarrow');
        left.addDirective(new nodom.Directive('class',"{'nd-pagination-disable':'[2,3,6,7,10,11,15].includes("+ this.btnAllowName + ")'}",left));
        pageCt.add(left);
        //页面数字
        let page:nodom.Element = new nodom.Element('span');
        page.addClass('nd-pagination-page');
        page.addDirective(new nodom.Directive('repeat',this.pageDataName,page));
        page.addDirective(new nodom.Directive('class',"{'nd-pagination-active':'active'}",page),true);
        let txt:nodom.Element = new nodom.Element();
        txt.expressions = [new nodom.Expression('no')];
        page.add(txt);
        pageCt.add(page);
        //右箭头
        let right:nodom.Element = new nodom.Element('b');
        right.addClass('nd-pagination-rightarrow');
        right.addDirective(new nodom.Directive('class',"{'nd-pagination-disable':'[4,5,6,7,12,13,15].includes("+ this.btnAllowName + ")'}",right));
        pageCt.add(right);
        //右双箭头
        let right1:nodom.Element = new nodom.Element('b');
        right1.addClass('nd-pagination-rightarrow1');
        right1.addDirective(new nodom.Directive('class',"{'nd-pagination-disable':'[8,9,10,11,12,13,15].includes("+ this.btnAllowName + ")'}",right1));
        pageCt.add(right1);

        rootDom.add(pageCt);
        //点击事件
        page.addEvent(new nodom.NodomEvent('click',
            (dom,model,module)=>{
                me.update(module,model.data['no']);
            }
        ));
        left.addEvent(new nodom.NodomEvent('click',
            (dom,model,module)=>{
                me.update(module,-1,true);
            }
        ));

        right.addEvent(new nodom.NodomEvent('click',
            (dom,model,module)=>{
                me.update(module,1,true);
            }
        ));

        left1.addEvent(new nodom.NodomEvent('click',
            (dom,model,module)=>{
                me.update(module,-me.steps,true);
            }
        ));

        right1.addEvent(new nodom.NodomEvent('click',
            (dom,model,module)=>{
                me.update(module,me.steps,true);
            }
        ));
        //显示第x页
        if(this.showGo){
            let goDom:nodom.Element = new nodom.Element('div');
            goDom.addClass('nd-pagination-go');
            let txt:nodom.Element = new nodom.Element();
            txt.textContent = TipWords.NO;
            goDom.add(txt);
            let input:nodom.Element = new nodom.Element('input');
            input.setProp('type','text');
            input.addDirective(new nodom.Directive('field',this.currentName,input));
            input.setProp('value',new nodom.Expression(this.currentName),true);
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
    beforeRender(module:nodom.Module,uidom:nodom.Element){
        this.handleInit(uidom,module);
        this.update(module);
    }
    
    /**
     * 设置当前值
     * @param module    
     * @param current   当前页或位移量
     * @param isStep    如果true current为位移量
     */
    update(module:nodom.Module,current?:number,isStep?:boolean){
        let model = module.modelFactory.get(this.modelId);
        let data = model.data;
        let total;
        if(data){
            total = data[this.totalName] || 0;
        }
        if(total === 0){
            return;
        }
        //页面大小
        let pageSize:number = data[this.pageSizeName];
        //页面
        if(this.pageSize === pageSize && (!current || this.currentPage === current)){
            return;
        }
        //设置pagesize，切换到第一页
        if(!current){
            current = 1;
        }

        if(isStep){
            current = this.currentPage + current;
        }
        
        //页面数
        let pageCount:number = Math.ceil(total/pageSize);
        
        //限定current在页面范围内
        if(current > pageCount){
            current = pageCount;
        }else if(current < 1){
            current = 1;
        }
        
        let min:number=1;
        let max:number;
        let btnAllow:number = 0;
        //页面数>显示数
        if(pageCount>this.showNum){
            //中心的位置
            let center:number = (this.showNum+1)/2 | 0;
            if(current - center + 1 > 0){
                min = current  - center  + 1;
            }
            if(min < 1){
                min = 1;
            }else if (min + this.showNum - 1 > pageCount) {
                min = pageCount - this.showNum + 1;
            }
            if(current === pageCount){
                btnAllow = 4;
            }else if(current === 1){
                btnAllow = 1;
            }
            max = min + this.showNum - 1;
            if(min === 1){
                btnAllow += 1;
            }
            if(max === pageCount){
                btnAllow += 8;
            }
            
        }else{
            min = 1;
            max = pageCount;
            btnAllow = 15;
        }

        //参数未改变，则不渲染
        if(current === this.currentPage && min === this.minPage && max === this.maxPage){
            return;
        }
        //页面号数据数组
        let pageArr = [];
        for(let i=min;i<=max;i++){
            let ind = i;
            let active:boolean = ind===current?true:false;
            pageArr.push({
                no:ind,
                active:active
            });
        }
        
        this.pageSize = pageSize;
        this.currentPage = current;
        this.minPage = min;
        this.maxPage = max;
        //设置当前页
        model.set(this.currentName,this.currentPage);
        model.set(this.pageDataName,pageArr);
        console.log(btnAllow);
        //设置箭头状态值
        model.set(this.btnAllowName,btnAllow);
    }
    /**
     * 只执行一次的初始化
     * @param dom 
     * @param module
     */
    handleInit(dom:nodom.Element,module:nodom.Module){
        if(this.initFlag){
            return;
        }
        let model = module.modelFactory.get(dom.modelId);
        this.initFlag = true;
        this.modelId = model.id;
        model.set(this.pageSizeName,model.query(this.pageSizeName) || 10);
        model.set(this.pageSizeDataName,this.pageSizeDatas);
        this.update(module,1);
    }
}

nodom.DefineElementManager.add('UI-PAGINATION',UIPagination);