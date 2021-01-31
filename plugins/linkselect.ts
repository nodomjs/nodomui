///<reference types='nodomjs'/>
/**
 * 联动下拉框
 * 待写...
 */
class UILinkSelect extends nodom.Plugin {
    /**
     * 标签名
     */
    tagName: string = 'UI-LINKSELECT';
    
    /**
     * 额外数据名
     */
    extraDataName: string;
    
    /**
     * select绑定的数据字段名
     */
    dataName: string;

    /**
     * 列表数据名
     */
    listField: string;

    /**
     * 列表值数据name
     */
    valueField: string;

    /**
     * 显示内容
     */
    displayField: string;

    /**
     * select 附加数据项modelId
     */
    extraModelId: number;

    /**
     * 下拉框key
     */
    listKey: string;
    
    /**
     * 过滤器方法id
     */
    filterMethodId: string;

    /**
     * 值
     */
    value: string;

    /**
     * 绑定数据项
     */
    fieldName: string;

    
    /**
     * 数据源
     */
    dataUrl: string;

    flag: boolean = false;
    
    /**
     * 资源状态防止重复请求数据
     */
    resourceState: boolean = true;

    /**
     * 初始化字段项名
     */
    initialName: string =null;

    constructor(params: HTMLElement | object) {
        super(params);
        let rootDom: nodom.Element = new nodom.Element();
        if (params) {
            if (params instanceof HTMLElement) {
                nodom.Compiler.handleAttributes(rootDom, params);
                nodom.Compiler.handleChildren(rootDom, params);
                UITool.handleUIParam(rootDom, this,
                    ['valuefield', 'displayfield', 'listfield', 'fieldname', 'dataurl', 'name', 'initialname|string'],
                    ['valueField', 'displayField', 'listField', 'fieldName', 'dataUrl', 'name', 'initialName'],
                    [null, null, null, null, null, '', null]
                );
            } else if (typeof params === 'object') {
                for (let o in params) {
                    this[o] = params[o];
                }
            }
            this.generate(rootDom);
        }
        rootDom.tagName = 'div';
        rootDom.setProp('name', this.name);
        rootDom.plugin = this;
        this.element = rootDom;

    }
    /**
     * 
     * @param rootDom 产生第一级下拉框
     */
    protected generate(rootDom: nodom.Element) {
        

        

    };

    
    /**
     * 渲染前事件
     * @param module 
     * @param dom 
     */
    beforeRender(module: nodom.Module, dom: nodom.Element) {
        module.addPlugin(this.name, this);
    };
    
    /**渲染后事件 */
    afterRender(module, dom) {
        let me = this;
        let model = module.model;

    }


}
nodom.PluginManager.add('UI-LINKSELECT', UILinkSelect)
