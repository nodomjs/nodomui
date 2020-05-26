///<reference types='nodom'/>
/**
 * panel 插件
 */
class UILayout {
    constructor() {
        this.tagName = 'UI-LAYOUT';
    }
    /**
     * 编译后执行代码
     */
    init(el) {
        let oe = new nodom.Element();
        oe.tagName = 'DIV';
        nodom.Compiler.handleAttributes(oe, el);
        nodom.Compiler.handleChildren(oe, el);
        const cls = 'nd-layout';
        oe.props['class'] = oe.props['class'] ? oe.props['class'] + ' ' + cls : cls;
        //增加middle 容器
        let middleCt = new nodom.Element();
        middleCt.props['class'] = 'nd-layout-middle';
        middleCt.tagName = 'DIV';
        let insertIndex = -1;
        //位置
        let locs = ['north', 'west', 'center', 'east', 'south'];
        //中间区域
        let middleLocs = ['west', 'center', 'east'];
        for (let i = 0; i < oe.children.length; i++) {
            let item = oe.children[i];
            if (!item.tagName) {
                continue;
            }
            let addItem;
            let addIndex = -1;
            /**非东西南北中的元素，需要删除*/
            let isLoc = false;
            for (let l of locs) {
                if (item.props.hasOwnProperty(l)) {
                    // delete item.props[l];
                    isLoc = true;
                    //判读是否需要添加到middle容器
                    if (middleLocs.includes(l)) {
                        addItem = item;
                        if (addIndex === -1) {
                            addIndex = i;
                        }
                    }
                    break;
                }
            }
            if (!isLoc) {
                oe.children.splice(i--, 1);
                continue;
            }
            if (addItem) {
                middleCt.children.push(addItem);
                if (addItem.props.hasOwnProperty('center')) {
                    addItem.props['class'] = addItem.props['class'] ? 'nd-layout-center ' + addItem.props['class'] : 'nd-layout-center';
                }
                oe.children.splice(i--, 1);
            }
        }
        oe.children.splice(insertIndex - 1, 0, middleCt);
        oe.defineType = 'layout';
        return oe;
    }
}
nodom.DefineElementManager.add(new UILayout());
//# sourceMappingURL=layout.js.map