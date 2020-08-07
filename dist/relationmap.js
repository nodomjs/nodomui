///<reference types='nodom'/>
/**
 * relation map 插件
 * 配置
 *  field 绑定数据项名，数据格式为[{列数据id名:值1,行数据id名:值2},...]
 *  datas='列数据名,行数据名'
 *  valueName='列数据id名,行数据id名'
 *  showFields='列数据显示数据项名,行数据显示数据项名'
 */
class UIRelationMap extends nodom.DefineElement {
    constructor() {
        super(...arguments);
        this.tagName = 'UI-RELATIONMAP';
    }
    init(el) {
        let me = this;
        let rootDom = new nodom.Element();
        nodom.Compiler.handleAttributes(rootDom, el);
        rootDom.tagName = 'table';
        rootDom.addClass('nd-relationmap');
        //需要检查参数
        UITool.handleUIParam(rootDom, this, ['valuefield|array|1', 'displayfield|array|2', 'listfield|array|2'], ['valueName', 'displayName', 'listName'], [null, null, null]);
        this.mapName = '$ui_relationmap_' + nodom.Util.genId();
        let field = rootDom.getDirective('field');
        if (field) {
            this.dataName = field.value;
        }
        //横行头
        let rowHead = new nodom.Element('tr');
        rowHead.addClass('nd-relationmap-head');
        rootDom.add(rowHead);
        //第一个空白
        let td = new nodom.Element('td');
        rowHead.add(td);
        //列数td
        td = new nodom.Element('td');
        td.addDirective(new nodom.Directive('repeat', this.listName[0], td));
        let txt = new nodom.Element();
        txt.expressions = [new nodom.Expression(this.displayName[0])];
        td.add(txt);
        rowHead.add(td);
        //行元素
        let tr = new nodom.Element('tr');
        tr.addDirective(new nodom.Directive('repeat', '$$' + this.mapName, tr));
        tr.addClass('nd-relationmap-row');
        td = new nodom.Element('td');
        td.addClass('nd-relationmap-head');
        txt = new nodom.Element();
        txt.expressions = [new nodom.Expression('title')];
        td.add(txt);
        tr.add(td);
        td = new nodom.Element('td');
        td.addDirective(new nodom.Directive('repeat', 'cols', td));
        td.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
            me.switchValue(module, dom, model);
        }));
        //按钮
        let b = new nodom.Element('b');
        b.addDirective(new nodom.Directive('class', "{'nd-relationmap-active':'active'}", b));
        td.add(b);
        tr.add(td);
        rootDom.children = [rowHead, tr];
        rootDom.defineElement = this;
        return rootDom;
    }
    /**
     * 渲染前执行
     * @param module
     */
    beforeRender(module, uidom) {
        //增加列表格渲染数据
        let model = module.modelFactory.get(uidom.modelId);
        this.modelId = uidom.modelId;
        let rowData = model.query(this.listName[1]);
        let colData = model.query(this.listName[0]);
        let data = model.query(this.dataName);
        let idRow = this.valueName[1];
        let idCol = this.valueName[0];
        if (!module.model.query(this.mapName)) {
            let mapData = [];
            let title;
            for (let d of rowData) {
                let a1 = [];
                let id1 = d[idRow];
                title = d[this.displayName[1]];
                for (let d1 of colData) {
                    let active = false;
                    if (data && data.length > 0) {
                        for (let da of data) {
                            if (da[idRow] === id1 && da[idCol] === d1[idCol]) {
                                active = true;
                                break;
                            }
                        }
                    }
                    a1.push({
                        id1: id1,
                        id2: d1[idCol],
                        active: active
                    });
                }
                mapData.push({ title: title, cols: a1 });
            }
            module.model.set(this.mapName, mapData);
        }
    }
    /**
     * 切换选中状态
     * @param module
     * @param dom
     * @param model
     */
    switchValue(module, dom, model) {
        let pmodel = module.modelFactory.get(this.modelId);
        let data = pmodel.query(this.dataName);
        let id1 = model.data['id1'];
        let id2 = model.data['id2'];
        let active = model.data['active'];
        let o = {};
        o[this.valueName[0]] = id2;
        o[this.valueName[1]] = id1;
        if (!data) {
            if (!active) {
                pmodel.set(this.dataName, [o]);
            }
        }
        else {
            //添加
            if (!active) {
                data.push(o);
            }
            else { //删除
                for (let i = 0; i < data.length; i++) {
                    let d = data[i];
                    if (d[this.valueName[0]] === id2 && d[this.valueName[1]] === id1) {
                        data.splice(i, 1);
                        break;
                    }
                }
            }
        }
        model.set('active', !active);
    }
}
nodom.DefineElementManager.add('UI-RELATIONMAP', UIRelationMap);
//# sourceMappingURL=relationmap.js.map