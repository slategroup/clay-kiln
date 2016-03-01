var _ = require('lodash'),
  dom = require('../services/dom'),
  prosemirror = require('prosemirror'),
  schema = require('prosemirror/dist/model/schema'),
  defaultSchema = require('prosemirror/dist/model/defaultschema');

function createCustomSchemaSpec() {
  var spec = new schema.SchemaSpec({
    doc: defaultSchema.Doc,
    paragraph: defaultSchema.Paragraph,
    text: schema.Text
  }, {
    em: defaultSchema.EmMark
  });

  console.log(spec)
  return spec;
}

function createCustomSchema() {
  return new schema.Schema(createCustomSchemaSpec());
}

// use tooltip menu
require('prosemirror/dist/menu/tooltipmenu');
require('prosemirror/dist/markdown');

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
    // tooltipMenu: true,
    place: textField, // appends it to the textField element
    doc: '',
    docFormat: 'text',
    schema: createCustomSchema()
  });

  console.log(editor)
  console.log(editor.content)

  // add rivets bindings
  editor.content.classList.add('input-text');
  editor.content.setAttribute('rv-field', name);
  editor.content.setAttribute('rv-value', name + '.data.value');

  editor.on('change', function() {
    console.log('\nch-ch-ch-changes!')
    console.log(editor.getContent('html'));
    console.log(editor.getContent('text'));
    console.log(editor.getContent('markdown'));
    console.log(editor.getContent('json'));
  });

  result.el = textField;

  return result;
};
