///<reference types='nodomjs'/>

/**
 * panel 插件
 */
class UITree extends nodom.Plugin{
    tagName:string = 'UI-TREE';

    /**
     * 左侧箭头点击事件id
     */
    arrowClickId:string;
    /**
     * 数据项字段名
     */
    dataName:string;
    /**
     * 激活字段名
     */
    activeName:string;

    /**
     * item点击事件
     */
    itemClick:string;

    /**
     * 显示数据项名
     */
    displayField:string;
    
    /**
     * 值数据项名
     */
    valueField:string;

    /**
     * 列表数据名
     */
    listField:string;

    /**
     * 最大级数
     */
    maxLevel:number;

    /**
     * 选中数据名
     */
    checkName:string;

    /**
     * 选中子节点数
     */
    checkedChdNumName:string;

    /**
     * icon 数组 第一个为非叶子节点icon，第二个为叶子节点icon
     */
    iconArr:string[];
    constructor(params:HTMLElement|object){
        super(params);
        let rootDom:nodom.Element = new nodom.Element();
        if(params){
            if(params instanceof HTMLElement){
                nodom.Compiler.handleAttributes(rootDom,params);
                UITool.handleUIParam(rootDom,this,
                    ['valuefield','displayfield','listfield','itemclick','checkname','maxlevel|number','icons|array|2'],
                    ['valueField','displayField','listField','itemClick','checkName','maxLevel','iconArr'],
                    ['',null,null,'','',3,[]]);
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
        const me = this;
        
        rootDom.addClass('nd-tree');
        
        this.activeName = '$ui_tree_' + nodom.Util.genId();
        this.checkedChdNumName = '$ui_tree_' + nodom.Util.genId();

        //展开收拢事件
        let methodId = '$nodomGenMethod' + nodom.Util.genId();
        this.arrowClickId = methodId;
        let closeOpenEvent:nodom.NodomEvent = new nodom.NodomEvent('click', methodId);
        
        //item click 事件
        let itemClickEvent:nodom.NodomEvent;
        if(this.itemClick !== ''){
            itemClickEvent = new nodom.NodomEvent('click', this.itemClick);
        }
        let parentCt:nodom.Element = rootDom;
        let item:nodom.Element;
        for(let i=0;i<this.maxLevel;i++){
            let itemCt:nodom.Element = new nodom.Element();
            itemCt.tagName = 'div';
            itemCt.directives.push(new nodom.Directive('repeat',this.listField,itemCt));
            itemCt.addClass('nd-tree-nodect');
            item = new nodom.Element();
            item.addClass('nd-tree-node');
            item.tagName = 'DIV';
            //绑定item click事件
            if(itemClickEvent){
                item.addEvent(itemClickEvent);
            }
                
            //icon处理
            //树形结构左边箭头图标
            let icon1 = new nodom.Element();
            icon1.tagName = 'SPAN';
            icon1.addClass('nd-tree-icon');
            icon1.addDirective(new nodom.Directive('class',
                "{'nd-tree-node-open':'" + this.activeName + "'," +
                "'nd-icon-right':'" + this.listField + "&&" + this.listField + ".length>0'}",
                icon1));
            
            //绑定展开收起事件
            icon1.addEvent(closeOpenEvent);
            itemCt.add(icon1);

            //folder和叶子节点图标
            if(this.iconArr.length>0){
                let a:string[] = [];

                a.push("'nd-icon-" + this.iconArr[0] + "':'" + this.listField + "&&" + this.listField + ".length>0'");
                //叶子节点图标
                if(this.iconArr.length>1){
                    a.push("'nd-icon-" + this.iconArr[1] + "':'!" + this.listField + "||" + this.listField + ".length===0'");
                }
                let icon:nodom.Element = new nodom.Element();
                icon.tagName = 'SPAN';
                icon.addClass('nd-tree-icon');
                let cls:string = '{' + a.join(',') + '}';
                icon.directives.push(new nodom.Directive('class',cls,icon));
                itemCt.add(icon);
            }

            if(this.checkName !== ''){
                let cb:nodom.Element = new nodom.Element('b');
                cb.addClass('nd-tree-uncheck');
                cb.addDirective(new nodom.Directive('class',"{'nd-tree-checked':'" + this.checkName + "'}",cb));
                itemCt.add(cb);
                cb.addEvent(new nodom.NodomEvent('click',
                    (dom,model,module,e)=>{
                        me.handleCheck(model,module); 
                    }
                ));
            }
            
            itemCt.add(item);
            //显示文本
            let txt = new nodom.Element();
            txt.expressions = [new nodom.Expression(this.displayField)];
            item.add(txt);

            //子节点容器
            let subCt = new nodom.Element();
            subCt.addClass('nd-tree-subct');
            subCt.tagName = 'DIV';
            subCt.addDirective(new nodom.Directive('class',"{'nd-tree-show':'" + this.activeName + "'}",subCt));
            itemCt.add(subCt);
            parentCt.add(itemCt);
            parentCt = subCt;
        }
        
        rootDom.plugin=this;
        return rootDom;
    }

    /**
     * 渲染前执行
     * @param module 
     */
    beforeRender(module:nodom.Module,uidom:nodom.Element){
        const me = this;
        super.beforeRender(module,uidom);
        if(this.needPreRender){
            //展开收拢事件
            module.addMethod(me.arrowClickId,
                (dom,model, module, e) => {
                    
                    let pmodel:nodom.Model = module.getModel(dom.modelId);
                    let rows = pmodel.data[me.listField];
                    //叶子节点不处理
                    if(!rows || rows.length === 0){
                        return;
                    }
                    //选中字段名
                    model.set(me.activeName,!model.data[me.activeName]);
                }
            );
        }
    }
    
    /**
    * 处理选中状态
    * @param data       当前dom的数据
    * @param module     模块
    */
    private handleCheck(model:nodom.Model,module:nodom.Module){
        let checked = !model.data[this.checkName];
        //取消会选中当前框
        model.set(this.checkName,checked);
        this.handleSubCheck(model,module,checked);
        this.handleParentCheck(model,module,checked);        
    }

    /**
    * 处理子孙选中状态
    * @param data       当前dom的数据
    * @param module     模块
    * @param checked    值
    */
    private handleSubCheck(model:nodom.Model,module:nodom.Module,checked:boolean){
        let rows = model.data[this.listField];
        if(!rows){
            return;
        }
        //修改子节点选中数
        if(checked){
            model.set(this.checkedChdNumName,rows.length);
        }else{
            model.set(this.checkedChdNumName,0);
        }
       
        //子孙节点
        for(let d of rows){
            let m:nodom.Model = module.getModel(d.$modelId);
            m.set(this.checkName,checked);
            this.handleSubCheck(m,module,checked);
        }
    }

    /**
    * 处理祖先节点选中状态
    * @param data       当前dom的数据
    * @param module     模块
    * @param checked    值
    */
    private handleParentCheck(model:nodom.Model,module:nodom.Module,checked:boolean){
        //数据向上走两级，因为第一级为数组，第二级才到数据
        let pmodel:nodom.Model = model.parent;
        if(!pmodel || pmodel === module.model){
            return;
        }
        pmodel = pmodel.parent;
        if(!pmodel || pmodel === module.model){
            return;
        }

        let data = pmodel.data;
        if(data[this.checkedChdNumName] === undefined){
            pmodel.set(this.checkedChdNumName,0);
        }
        if(checked){
            data[this.checkedChdNumName]++; 
        }else{
            data[this.checkedChdNumName]--; 
        }
        
        let chk:boolean = data[this.checkName];

        if(data[this.checkedChdNumName] === 0){
            pmodel.set(this.checkName,false);
        }else{
            pmodel.set(this.checkName,true);
        }

        //状态改变，向上递归
        if(chk !== data[this.checkName]){
            this.handleParentCheck(pmodel,module,checked);
        }
    }
    
    /**
     * 获取value
     */
    getValue():any[]{
        const me = this;
        if(this.valueField === ''){
            return;
        }

        let va = [];
        let module:nodom.Module = nodom.ModuleFactory.get(this.moduleId);
        let model = module.getModel(this.modelId);
        getChecked(model.data[this.listField]);
        return va;

        function getChecked(rows){
            if(Array.isArray(rows)){
                for(let d of rows){
                    if(d[me.checkName] === true){
                        va.push(d[me.valueField]);
                    }
                    getChecked(d[me.listField]);
                }
            }
        }
    }
}

nodom.PluginManager.add('UI-TREE',UITree);