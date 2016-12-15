const ds = require('dollar-slice'),
  _ = require('lodash'),
  tpl = require('../tpl'),
  pane = require('./'),
  clayMenuController = require('../../controllers/clay-menu');

// The menu header. Let's cache the declaration here
// so we can store the value and not have to re-query
// the DOM anytime this menu opens.
var $clayMenuHeader;

function openClayMenu() {
  var el;

  $clayMenuHeader = $clayMenuHeader || tpl.get('.clay-menu-header-template');

  el = pane.open([{
    header: 'All Pages',
    content: tpl.get('.page-list-template'),
    fullWidth: true
  }], null, 'left', 'wide', $clayMenuHeader.cloneNode(true));

  ds.controller('clay-menu', clayMenuController);
  ds.get('clay-menu', el);
}

module.exports = openClayMenu;
_.set(window, 'kiln.services.panes.openClayMenu', module.exports);
