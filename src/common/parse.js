/**
 * #001: 清除标签间的空格
 * 清除以 > 开头或以 < 结尾的匹配空字符，如: <tr> {{vm.thListTpl}}  </tr>
 * 标签内的属性空字符不清除，如: <thead {{vm.tableHeadKey}}>
 * 清除标签间的空格，要清除的原因是jTool会将这个空格当作一个text node插入dom，从而导致在使用jTool时出错。如index()方法。
 */
/**
 * 解析html模板, 该方法为装饰器方法
 * @param tpl
 * @returns {Function}
 */
export function parseTpl(tpl) {
    return (target, key, descriptor) => {
        const oldValue = descriptor.value;
        // params 中如果存在 tpl 则使用 params 中的进行渲染
        descriptor.value = params => {
            const vm = oldValue.call(target, params);
            let str = (params && params.tpl || tpl).trim();

            // 清除标签间的空格 #001
            str = str.replace(/(\S)(\s)+(\S)/g, (match, p1, p2, p3) => {
                // 清除以 > 开头或以 < 结尾的匹配空字符，如: <tr> {{vm.thListTpl}}  </tr>
                if (p1 === '>' || p3 === '<') {
                    return p1 + p3;
                }

                // 标签内的属性空字符不清除，如: <thead {{vm.tableHeadKey}}>
                return p1 + p2 + p3;
            });
            // console.log(str);
            return str.replace(/\{\{([^(\}\})]+)\}\}/g, (match, evalStr) => {
                if (/return/.test(evalStr)) {
                    return new Function('vm', evalStr)(vm) || '';
                }
                return new Function('vm', 'return ' + evalStr)(vm) || '';
            });
        };
    }
}