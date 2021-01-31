///<reference types='nodomjs'/>
/**
 * checkbox
 */
class UIRadio extends nodom.Plugin{
    tagName:string = 'UI-RADIO';

    /**
     * 数据项名
     */
    dataName:string;

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
     * 选择项的左右margin值
     */
    itemMargin:number;
    /**
     * 选中字段名，选择项产生方式为数据，则会自动生成，为自定义，则不生成
     */
    checkName:string;

    constructor(params:HTMLElement|object){
        super(params);
        let rootDom:nodom.Element = new nodom.Element();
        if(params){
            if(params instanceof HTMLElement){
                nodom.Compiler.handleAttributes(rootDom,params);
                nodom.Compiler.handleChildren(rootDom,params);
                UITool.handleUIParam(rootDom,this,
                    ['valuefield','displayfield','listfield','itemmargin|number'],
                    ['valueField','displayField','listField','itemMargin'],
                    ['','','',5]);
            }else if(typeof params === 'object'){
                for(let o in params){
                    this[o] = params[o];
                }
            }
            this.generate(rootDom);
        }
        rootDom.tagName = 'span';
        rootDom.plugin = this;
        this.element = rootDom;
    }

    /**
     * 产生插件内容
     * @param rootDom 插件对应的element
     */
    private generate(rootDom:nodom.Element){
        rootDom.addClass('nd-radio');
        let field = rootDom.getDirective('field');
        if(field){
            this.dataName = field.value;
            rootDom.removeDirectives(['field']);
        }

        // 通过配置项生成选择项
        if(this.valueField !== '' && this.displayField !== '' && this.listField !== ''){
            //自定义checkname
            this.checkName = '$ui_radio_' + nodom.Util.genId();
            let item:nodom.Element = new nodom.Element('span');
            item.setProp('value',new nodom.Expression(this.valueField),true);
            let icon:nodom.Element = new nodom.Element('b');
            icon.addClass('nd-radio-unactive');
            icon.addDirective(new nodom.Directive('class',"{'nd-radio-active':'" + this.checkName  +"'}",icon));
            item.add(icon);
            let txt = new nodom.Element();
            txt.expressions = [new nodom.Expression(this.displayField)];
            item.add(txt);
            let directive:nodom.Directive = new nodom.Directive('repeat',this.listField,item);
            item.addDirective(directive);
            item.assets.set('style','margin:0 ' + this.itemMargin + 'px;');
            item.addEvent(new nodom.NodomEvent('click',
                (dom,model,module)=>{
                    let model1:nodom.Model = module.getModel(this.modelId);
                    let datas:Array<object> = model1.query(this.listField);
                    // 所有选项的select置false
                    if(datas){
                        for(let d of datas){
                            d[this.checkName] = false;
                        }
                    }
                    //当前点击项置true
                    model.set(this.checkName,true);
                    //修改实际数据项
                    model1.set(this.dataName,dom.getProp('value'));
                }
            ));
            rootDom.children = [item];
        }else{ //通过子节点生成选择项
            for(let c of rootDom.children){
                if(c.tagName){
                    let icon:nodom.Element = new nodom.Element('b');
                    icon.addClass('nd-radio-unactive');
                    icon.addDirective(new nodom.Directive('class',"{'nd-radio-active':'" + this.dataName + "==\""+ c.getProp('value') +"\"'}",icon));
                    c.children.unshift(icon);
                    //点击事件
                    c.addEvent(new nodom.NodomEvent('click',
                        (dom,model,module)=>{
                            model.set(this.dataName,dom.getProp('value'));
                        }
                    ));
                }
            }
        }
    }

    /**
     * 后置渲染
     * @param module 
     * @param dom 
     */
    beforeRender(module:nodom.Module,dom:nodom.Element){
        super.beforeRender(module,dom);
        let model = module.getModel(this.modelId);
        if(this.checkName){
            let datas:Array<object> = model.query(this.listField);
            if(datas){
                for(let d of datas){
                    if(model.data[this.dataName] == d[this.valueField]){
                        d[this.checkName] = true;
                    }else{
                        d[this.checkName] = false;
                    }
                }
            }
        }
    }
}

nodom.PluginManager.add('UI-RADIO',UIRadio);