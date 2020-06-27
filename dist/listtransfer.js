///<reference types='nodom'/>
/**
 * list元素移动插件
 */
class UIListTransfer {
    constructor() {
        this.tagName = 'UI-LISTTRANSFER';
    }
    init(el) {
        let me = this;
        //生成check id
        this.checkName = '$ui_listtransfer_' + nodom.Util.genId();
        this.selectedName = '$ui_listtransfer_' + nodom.Util.genId();
        let transferDom = new nodom.Element();
        nodom.Compiler.handleAttributes(transferDom, el);
        UITool.handleUIParam(transferDom, this, ['field', 'valuefield', 'displayfield|array', 'data'], ['fieldName', 'valueName', 'displayName', 'listName']);
        transferDom.tagName = 'div';
        transferDom.addClass('nd-listtransfer');
        //左列表
        let listDom = new nodom.Element('div');
        listDom.addClass('nd-nd-listtransfer-box');
        // 列表节点
        let itemDom = new nodom.Element('div');
        itemDom.addClass('nd-listtransfer-item');
        itemDom.addDirective(new nodom.Directive('repeat', this.listName, itemDom, "select:value:{" + this.selectedName + ":false}"));
        listDom.add(itemDom);
        //复选框
        let icon = new nodom.Element('b');
        icon.addClass('nd-listtransfer-uncheck');
        icon.addDirective(new nodom.Directive('class', "{'nd-listtransfer-checked':'" + this.checkName + "'}", icon));
        itemDom.add(icon);
        //显示文本
        for (let f of this.displayName) {
            let span = new nodom.Element('span');
            span.addClass('nd-listtransfer-item-col');
            let txt = new nodom.Element();
            txt.expressions = [new nodom.Expression(f)];
            span.add(txt);
            itemDom.add(span);
        }
        //点击事件
        itemDom.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
            model.set(this.checkName, !model.data[this.checkName]);
        }));
        //右列表(克隆来)
        let listDom1 = listDom.clone(true);
        let dir = listDom1.children[0].getDirective('repeat');
        dir.filter = new nodom.Filter("select:value:{" + this.selectedName + ":true}");
        //按钮>>
        //按钮容器
        let btnGrp = new nodom.Element('div');
        btnGrp.addClass('nd-listtransfer-btngrp');
        //按钮>>
        let btn1 = new nodom.Element('b');
        btn1.addClass('nd-listtransfer-right2');
        //按钮>
        let btn2 = new nodom.Element('b');
        btn2.addClass('nd-listtransfer-right1');
        //按钮<
        let btn3 = new nodom.Element('b');
        btn3.addClass('nd-listtransfer-left1');
        //按钮<<
        let btn4 = new nodom.Element('b');
        btn4.addClass('nd-listtransfer-left2');
        btnGrp.children = [btn1, btn2, btn3, btn4];
        btn1.addEvent(new nodom.NodomEvent('click', (dom, model, module, e) => {
            me.transfer(module, 1, true);
        }));
        btn2.addEvent(new nodom.NodomEvent('click', (dom, model, module, e) => {
            me.transfer(module, 1, false);
        }));
        btn3.addEvent(new nodom.NodomEvent('click', (dom, model, module, e) => {
            me.transfer(module, 2, false);
        }));
        btn4.addEvent(new nodom.NodomEvent('click', (dom, model, module, e) => {
            me.transfer(module, 2, true);
        }));
        transferDom.children = [listDom, btnGrp, listDom1];
        transferDom.delProp(['data', 'field', 'valuefield', 'displayfield']);
        transferDom.defineElement = this;
        return transferDom;
    }
    /**
     * 后置渲染
     * @param module
     * @param dom
     */
    beforeRender(module, dom) {
        this.modelId = dom.modelId;
        let model = module.modelFactory.get(dom.modelId);
        //获取绑定字段值
        let value = model.query(this.fieldName);
        //获取数据列表值
        let datas = model.query(this.listName);
        if (value) {
            for (let d of datas) {
                let m = module.modelFactory.get(d.$modelId);
                let finded = false;
                for (let v of value) {
                    if (d[this.valueName] === v) {
                        m.set(this.selectedName, true);
                        finded = true;
                        break;
                    }
                }
                if (!finded) {
                    m.set(this.selectedName, false);
                }
            }
        }
    }
    /**
     * 移动数据
     * @param module    模块
     * @param direction 移动方向 1右移 2左移
     * @param all       true 全部移动  false 移动选中的项
     */
    transfer(module, direction, all) {
        let model = module.modelFactory.get(this.modelId);
        let datas = model.data[this.listName];
        let selected = direction === 1 ? true : false;
        for (let d of datas) {
            if (all) {
                d[this.selectedName] = selected;
            }
            else if (d[this.checkName]) {
                d[this.selectedName] = selected;
            }
            d[this.checkName] = false;
        }
        this.updateValue(module);
    }
    /**
     * 更新字段值
     * @param module    模块
     */
    updateValue(module) {
        let model = module.modelFactory.get(this.modelId);
        let datas = model.data[this.listName];
        let a = [];
        for (let d of datas) {
            if (d[this.selectedName]) {
                a.push(d[this.valueName]);
            }
        }
        model.set(this.fieldName, a);
    }
}
nodom.DefineElementManager.add('UI-LISTTRANSFER', UIListTransfer);
//# sourceMappingURL=listtransfer.js.map