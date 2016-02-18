var dom = require('../services/dom'),
  prosemirror = require('prosemirror');

// use tooltip menu
require('prosemirror/dist/menu/tooltipmenu');

/**
 * Replace result.el with rich text / prosemirror input.
 * @param {{name: string, bindings: {}}} result
 * @param {{}} args   defined in detail below:
 * @param {array}  [args.buttons]         array of buttons for the toolbar
 * @returns {*}
 */
module.exports = function (result, args) {
  var name = result.name,
    buttons = args.buttons,
    textField, editor;

  textField = dom.create(`<label class="input-label"></label>`);
  editor = new prosemirror.ProseMirror({
    tooltipMenu: true,
    place: textField // appends it to the textField element
  });

  console.log(editor)
  console.log(editor.content)

  // add rivets bindings
  editor.content.classList.add('input-text');
  editor.content.setAttribute('rv-field', name);
  editor.content.setAttribute('rv-value', name + '.data.value');

  editor.on('change', function() {
    console.log(editor.getContent('html'));
  });

  result.el = textField;

  return result;
};
