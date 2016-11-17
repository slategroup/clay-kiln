var dom = require('@nymag/dom');

/**
 * Replace result.el with color.
 * @param {{name: string}} result
 * @param {{label: string}} args
 * @returns {{}}
 */
module.exports = function (result, args) {
  var name = result.name,
    label = args.label,
    tpl = `
      <label class="input-label">
        <input class="input-color" type="color" value="${color}"" /><span class="color-label">${label}</span>
      </label>
    `,
    color = dom.create(tpl);

  result.el = color;

  return result;
};
