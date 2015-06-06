var htmlparser = require("htmlparser2");
function toTree(html) {
    var tree = [];
    var stack = [];
    var parser = new htmlparser.Parser({
        onopentag: function (name, attribs) {
            if (stack.length > 0) {
                if (stack[stack.length - 1].child == undefined) {
                    stack[stack.length - 1].child = [];
                }
                var el = { name: name, attribs: attribs };
                stack[stack.length - 1].child.push(el);
                stack.push(el);
            }
            else {
                var el = { name: name, attribs: attribs };
                tree.push(el);
                stack.push(el);
            }
        },
        ontext: function (text) {
            if (text.trim() != '') {
                stack[stack.length - 1].text = text;
            }
        },
        onclosetag: function (tagname) {
            stack.pop();
        }
    }, { decodeEntities: true });
    parser.write(html);
    parser.end();
    return tree;
}
function visitor(text, tag, attribs, childs, engine, fnFix) {
    if (text) {
        return engine[tag](text, attribs, function () {
            childs.forEach(function (child) {
                visitor(child.text, child.name, child.attribs, child.child || [], engine);
            });
            if (fnFix) {
                fnFix();
            }
        });
    }
    else {
        return engine[tag](attribs, function () {
            childs.forEach(function (child) {
                visitor(child.text, child.name, child.attribs, child.child || [], engine);
            });
            if (fnFix) {
                fnFix();
            }
        });
    }
}
function toHtmlEl(html, engine, fnFix) {
    var tree = toTree(html);
    return visitor(tree[0].text, tree[0].name, tree[0].attribs, tree[0].child || [], engine, fnFix);
}
exports.toHtmlEl = toHtmlEl;
function cycleMessage(msg, fnPublish) {
    var cycle = [
        (msg + "."),
        (msg + ".."),
        (msg + "..."),
        (msg + "...."),
        (msg + ".....")
    ];
    var cycleIndex = 0;
    var fnWaiting = function () {
        if (cycleIndex > 4) {
            cycleIndex = 0;
        }
        fnPublish(cycle[cycleIndex++]);
    };
    var id = window.setInterval(fnWaiting, 500);
    return {
        cancel: function () {
            window.clearInterval(id);
        }
    };
}
exports.cycleMessage = cycleMessage;
//# sourceMappingURL=util.js.map