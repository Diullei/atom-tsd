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

function visitor(text, tag, attribs, childs, engine, fnFix?: Function) {
    if(text) {
        return engine[tag](text, attribs, () => {
            childs.forEach((child) => {
                visitor(child.text, child.name, child.attribs, child.child || [], engine);
            });

            if(fnFix) {
                fnFix();
            }
        });
    } else {
        return engine[tag](attribs, () => {
            childs.forEach((child) => {
                visitor(child.text, child.name, child.attribs, child.child || [], engine);
            });

            if(fnFix) {
                fnFix();
            }
        });
    }
}

export function toHtmlEl(html: string, engine, fnFix?: Function) {
    var tree = toTree(html);
    return visitor(tree[0].text, tree[0].name, tree[0].attribs, tree[0].child || [], engine, fnFix);
}

export function cycleMessage(msg: string, fnPublish: (msg: string) => void) {
    var cycle = [
        `${msg}.`,
        `${msg}..`,
        `${msg}...`,
        `${msg}....`,
        `${msg}.....`
    ];

    var cycleIndex = 0;

    var fnWaiting = () => {
        if (cycleIndex > 4) {
            cycleIndex = 0;
        }
        fnPublish(cycle[cycleIndex++]);
    };

    var id = window.setInterval(fnWaiting, 500);

    return {
        cancel: () => {
            window.clearInterval(id);
        }
    };
}
