///<reference types='nodom'/>
/**
 * panel 插件
 */
class UISelect implements nodom.IDefineElement{
    tagName:string = 'UI-SELECT';
    /**
     * 显示数据name(在model中新增)
     */
    displayName:string;
    /**
     * 显示开关数据name(在model中新增)
     */
    switchName:string;
    /**
     * select绑定的数据字段名
     */
    dataName:string;

    /**
     * 初始化数据标志
     */
    initDataFlag:boolean;

    /**
     * 列表数据名
     */
    listName:string;

    /**
     * 列表值数据name
     */
    valueName:string;

    /**
     * 列表项显示字段名（显示在content输入框）
     */
    showName:string;
    /**
     * 选中的数据name(在model中新增)
     */
    checkName:string;

    /**
     * select 对象的modelId
     */
    modelId:number;

    /**
     * 多选
     */
    multi:boolean;

    //设置显示内容

    init(el:HTMLElement){
        let me = this;
        //生成id
        let gid:number = nodom.Util.genId();
        this.switchName = '$nui_switch_' + gid;
        this.displayName = '$nui_display_' + gid;
        this.checkName = '$nui_checked_' + gid;

        let selectDom:nodom.Element = new nodom.Element();
        nodom.Compiler.handleAttributes(selectDom,el);
        nodom.Compiler.handleChildren(selectDom,el);
        selectDom.tagName = 'div';
        selectDom.addClass('nd-select');
        this.dataName = selectDom.getProp('name');
        this.valueName = selectDom.getProp('valuefield');
        this.showName = selectDom.getProp('displayfield');
        this.multi = selectDom.hasProp('multiselect');

        selectDom.delProp(['name','valuefield','multiselect']);
        //值框(隐藏框)
        let inputDom:nodom.Element = new nodom.Element('input');
        inputDom.setProp('name',this.dataName);
        inputDom.addClass('nd-select-value');
        inputDom.exprProps['value'] = [new nodom.Expression(this.dataName)];
        
        //显示框
        let showDom:nodom.Element = new nodom.Element('div');
        showDom.addClass('nd-select-content');

        //下拉框
        let listDom:nodom.Element = new nodom.Element('div');
        listDom.addClass('nd-select-list');
        listDom.addDirective(new nodom.Directive('show',me.switchName,listDom));    

        //显示框
        let firstDom:nodom.Element = new nodom.Element('div');
        firstDom.addClass('nd-select-firstct');
        let input:nodom.Element = new nodom.Element('input');
        input.addClass('nd-select-show');
        //多选择，不允许输入
        if(this.multi){
            input.setProp('readonly',true);
        }
        input.exprProps['value'] = [new nodom.Expression(me.displayName)];
        firstDom.add(input);
        let icon:nodom.Element = new nodom.Element('b');
        icon.addClass('nd-icon-arrow-down');
        //点击展开或收拢
        icon.addEvent(new nodom.NodomEvent('click',':nopopo',
            (dom,model,module,e,el)=>{
                //设置显示宽度（作用在源虚拟dom）
                model.set(me.switchName,!model.data[me.switchName]);
            }
        ));

        //关闭select列表
        firstDom.addEvent(new nodom.NodomEvent('click',
            (dom,model,module)=>{
                if(model.data[me.switchName]){
                    model.set(me.switchName,false);
                }     
            }
        ));
        firstDom.add(icon);
        showDom.add(firstDom);
        // 下拉孩子节点
        for(let c of selectDom.children){
            if(!c.tagName){
                continue;
            }
            //保存list数据名
            if(c.hasDirective('model')){
                let d:nodom.Directive = c.getDirective('model');
                this.listName = d.value[0];
            }
            let icon:nodom.Element = new nodom.Element('b');
            icon.addClass('nd-icon-checkbox');
            icon.addDirective(new nodom.Directive('class',"{'nd-icon-checked':'" + this.checkName + "'}",icon));    
            c.children.unshift(icon);
            //点击事件
            c.addEvent(new nodom.NodomEvent('click',
                (dom,model,module)=>{
                    me.switchValue(module,model,dom.getProp('show'));
                }
            ));
            listDom.add(c);
        }
        showDom.add(listDom);
        selectDom.children = [inputDom,showDom];
        selectDom.delProp('field');
        selectDom.defineElement = this;
        return selectDom;
    }
    /**
     * 后置渲染
     * @param module 
     * @param dom 
     */
    afterRender(module:nodom.Module,dom:nodom.Element){
        this.modelId = dom.modelId;
        let pmodel:nodom.Model = module.modelFactory.get(this.modelId);
        let value = pmodel.query(this.dataName);
        let valueArr:string[];
        if(value && value!==''){
            console.log(value);
            valueArr = value.split(',');
        }
        let txtArr:string[] = [];
        if(!this.initDataFlag && this.listName){
            let rows = pmodel.query(this.listName);
            for(let d of rows){
                if(valueArr && valueArr.includes(d[this.valueName]+'')){
                    d[this.checkName] = true;
                    txtArr.push(d[this.showName]);
                }else{
                    d[this.checkName] = false;
                }
            }
            
            if(txtArr.length>0){
                pmodel.set(this.displayName,txtArr.join(','));
            }
            this.initDataFlag = true;
        }
    }
    /**
     * 全部反选
     * @param module    module 
     */
    unseleceAll(module:nodom.Module){
        if(!this.modelId || !this.listName){
            return;
        }
        let pmodel:nodom.Model = module.modelFactory.get(this.modelId);
        let rows = pmodel.query(this.listName);
        for(let d of rows){
            d[this.checkName] = false;    
        }
    }

    /**
     * 添加数据
     * @param module    模块
     * @param model     数据model
     * @param txt       显示文本
     */
    switchValue(module:nodom.Module,model:nodom.Model,txt:string){
        let checked:boolean = model.query(this.checkName);
        if(checked){
            this.removeValue(module,model);
            model.set(this.checkName,false);
        }else{
            this.addValue(module,model,txt);
            model.set(this.checkName,true);
        }
    }
    /**
     * 添加数据
     * @param module    模块
     * @param model     数据model
     * @param txt       显示文本
     */
    addValue(module:nodom.Module,model:nodom.Model,txt:string){
        let pmodel = module.modelFactory.get(this.modelId);
        //值串
        let value:string = pmodel.query(this.dataName);
        //显示串
        let display:string = pmodel.query(this.displayName);
        let v = model.query(this.valueName);
        
        //多选
        if(this.multi){
            if(value){
                let a = value.toString().split(',');
                if(a.includes(v)){
                    return;
                }

                a.push(v);
                pmodel.set(this.dataName,a.join(','));
                pmodel.set(this.displayName,display+',' + txt);
            }else{
                pmodel.set(this.dataName,v.toString());
                pmodel.set(this.displayName,txt);
            }
        }else{
            pmodel.set(this.valueName,v.toString());
            pmodel.set(this.displayName,txt);
            this.unseleceAll(module);
        }
    }

    /**
     * 添加数据
     * @param module    模块
     * @param model     数据项
     */
    removeValue(module:nodom.Module,model:nodom.Model){
        let pmodel = module.modelFactory.get(this.modelId);
        //值串
        let value:string = pmodel.query(this.dataName);
        //显示串
        let display:string = pmodel.query(this.displayName);
        let v = model.query(this.valueName).toString();

        model.set(this.checkName,false);
        //多选
        if(this.multi){
            if(value){
                let a = value.toString().split(',');
                if(!a.includes(v)){
                    return;
                }
                let ind = a.indexOf(v);
                
                a.splice(ind,1);
                let a1 = display.split(',');
                a1.splice(ind,1);
                pmodel.set(this.dataName,a.join(','));
                pmodel.set(this.displayName,a1.join(','));
            }else{
                pmodel.set(this.dataName,v);
                pmodel.set(this.displayName,'');
            }
        }else{
            pmodel.set(this.dataName,'');
            pmodel.set(this.displayName,'');
        }
    }

}

nodom.DefineElementManager.add('UI-SELECT',UISelect);