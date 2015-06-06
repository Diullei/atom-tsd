var htmlparser = require("htmlparser2");

function toTree(html: string) {
    var tree = [];
    var stack = [];

    var parser = new htmlparser.Parser({
        onopentag: function(name, attribs){
            if (stack.length > 0) {
                if (stack[stack.length - 1].child == undefined) {
                    stack[stack.length - 1].child = [];
                }

                var el = {name: name, attribs: attribs};

                stack[stack.length - 1].child.push(el);
                stack.push(el);
            } else {
                var el = {name: name, attribs: attribs};
                tree.push(el);
                stack.push(el);
            }
        },
        ontext: function(text){
            if(text.trim() != '') {
                stack[stack.length - 1].text = text;
            }
        },
        onclosetag: function(tagname){
            stack.pop();
        }
    }, {decodeEntities: true});

    parser.write(html);
    parser.end();

    return tree;
}

function visitor(text, tag, attribs, childs, engine) {
    if(text) {
        return engine[tag](text, attribs, () => {
            childs.forEach((child) => {
                visitor(child.text, child.name, child.attribs, child.child || [], engine);
            });
        });
    } else {
        return engine[tag](attribs, () => {
            childs.forEach((child) => {
                visitor(child.text, child.name, child.attribs, child.child || [], engine);
            });
        });
    }
}

export function toHtmlEl(html: string, engine) {
    var tree = toTree(html);
    return visitor(tree[0].text, tree[0].name, tree[0].attribs, tree[0].child || [], engine);
}
