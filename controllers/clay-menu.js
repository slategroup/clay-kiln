const openDirectory = require('../services/pane/directory'),
  dom = require('@nymag/dom'),
  site = require('../services/site'),
  db = require('../services/edit/db'),
  moment = require('moment'),
  querySize = 50;

function queryConstructor(selectedSites, inputVal, fromVal) {
  var query = {
      index: 'pages',
      type: 'general'
    },
    body = {
      size: querySize,
      from: fromVal || 0
    };

  if (inputVal || selectedSites.length) {
    body.query = {
      filtered: {}
    };
  }


  if (inputVal) {
    _.set(body.query.filtered, ['query', 'match', 'title'], inputVal);
  }

  if (selectedSites.length) {
    _.set(body.query.filtered, ['filter', 'terms', 'siteSlug'], selectedSites);
  }

  // Add size
  // Add pagination stuff
  // Add all the things
  return _.assign(query, { body: body });
}

/**
 * Return a promise with all the pages data
 *
 * @param {object} query
 * @param {string} reqPath
 * @returns {Promise}
 */
function getPages(query, reqPath) {
  return db.pageListQuery(reqPath + '/_search/pagelist', query);
}

/**
 * Make the site data pretty and easy to work with
 *
 * @param  {[type]} resp [description]
 * @return {[type]}      [description]
 */
function modelSiteData(resp) {
  var sites = _.get(resp, 'hits'),
    modeledSites = [];

  _.each(sites, function (site) {
    modeledSites.push(site._source);
  });

  return modeledSites;
}

/**
 * Return a promise with the sites data
 *
 * @param {string} currentSiteUrl
 * @return {Promise}
 */
function getSites(currentSiteUrl) {
  return db.siteListQuery(currentSiteUrl + '/_search/sites')
    .then(modelSiteData);
}

/**
 * [modelPageData description]
 * @param  {[type]} resp [description]
 * @return {[type]}      [description]
 */
function modelPageData(resp) {
  var pages = _.get(resp, 'hits');

  if (!pages) {
    return [];
  }

  return _.map(pages, function (page) {
    var src = page._source;

    return {
      id: page._id,
      title: src.title,
      url: src.url,
      uri: src.uri,
      authors: src.authors,
      site: src.siteSlug,
      published: src.published,
      scheduled: src.scheduled,
      scheduledTime: src.scheduledTime,
      publishTime: src.publishTime
    };
  });
}

/**
 * [formatTime description]
 * @param  {[type]} time [description]
 * @return {[type]}      [description]
 */
function formatTime(time) {
  var time;

  function dateFormatter(date) {
    if (date.year() !== moment().year()) {
      return date.format('MM/DD/YY');
    } else {
      return date.format('MM/DD');
    }
  }

  time = moment().calendar(moment(time), {
    sameDay: '[Today]',
    nextDay: '[Yesterday]',
    lastDay: '[Tomorrow]',
    sameElse: dateFormatter,
    nextWeek: dateFormatter,
    lastWeek: dateFormatter
  });

  return `<span class="page-list-readout-item-status-time">${time}</span>`;
}



/**
 *
 * @param  {array} sites
 * @param  {string} currentSite
 * @return {Element}
 */
function templateSites(sites, currentSite) {
  var list = '';

  _.each(sites, function (site) {
    var item = `<li class="sites-readout-list-item">
      <button type="button" data-id="${site.slug}" class="sites-readout-list-item-btn ${site.slug === currentSite ? 'active' : ''}">
        <img src="//${site.mediaPath}${site.siteIcon}" />
        <span class="checkmark">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path class="check" fill="#599f61" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        </span>
      </button>
    </li>`;

    // If we're dealing with the current site
    // lets add it to the beginning of the list,
    // otherwise append to the end
    if (site.slug === currentSite) {
      list = item + list;
    } else {
      list += item;
    }
  });

  return dom.create(`<ul class='sites-readout-list'>${list}</ul>`);
}

/**
 * [templateAuthors description]
 * @param  {[type]} authors [description]
 * @return {[type]}         [description]
 */
function templateAuthors(authors) {
  return _.map(authors, function (author) {
    return `<span data-id="${author}" class="author-button">${author}</span>`;
  }).join(',');
}

function createPageLink(url) {
  var formedUrl = '';

  // Check for .html ending
  if (_.endsWith(url, '/')) {
    formedUrl = url;
  } else {
    formedUrl = `${url}.html`;
  }

  // Add begining slashes if none exist
  if (!_.includes(url, '//')) {
    formedUrl = `//${formedUrl}`;
  }

  return formedUrl;
}

/**
 * [templatePages description]
 * @param  {[type]} pages [description]
 * @return {[type]}       [description]
 */
function templatePages(pages) {
  var list = '';

  _.each(pages, function (page) {
    list += `<li class="page-list-readout-item" data-id="${page.id}">
      <span class="page-list-readout-item-title">
        <a class="page-list-readout-item-link" href="${createPageLink(page.url || page.uri)}">
          ${page.title || 'Undefined Page Title'}
        </a>
      </span>
      <span class="page-list-readout-item-author">
        ${templateAuthors(page.authors)}
      </span>
      <span class="page-list-readout-item-status ${setStatus(page)}">
        ${setStatusMessage(page)}
      </span>
    </li>`;
  });

  return dom.create(`<ul class='page-list-readout'>${list}</ul>`);
}

/**
 * Set the status class for styling
 *
 * @param {object} page
 * @returns {string}
 */
function setStatus(page) {
  var status = '';

  if (page.published) {
    status = 'published';
  } else if (page.scheduled) {
    status = 'scheduled';
  } else {
    status = 'draft';
  }

  return status;
}

/**
 * Create the string for the status message
 *
 * @param {object} page
 * @returns {string}
 */
function setStatusMessage(page) {
  var statusMsg = '';

  if (page.scheduled && page.published) {
    statusMsg = `Published & Scheduled${formatTime(page.scheduledTime)}`;
  } else if (page.scheduled) {
    statusMsg = `Scheduled${formatTime(page.scheduledTime)}`;
  } else if (page.published) {
    statusMsg = `Published${formatTime(page.publishTime)}`;
  } else {
    statusMsg = 'Draft';
  }

  return statusMsg;
}

/**
 * [formSiteBasePath description]
 * @return {[type]} [description]
 */
function formSiteBasePath() {
  var path = site.get('path'),
    host = site.get('host'),
    port = site.get('port');

  port = port === '80' ? '' : `:${port}`;

  return `//${host}${port}${path}`;
}


module.exports = function () {
  // We have to construct the sites list when we open the menu, but we don't
  // want to have to do it everytime we open the list since this data is pretty
  // static. Let's create it the first time, cache the element, and the reference
  // it anytime the page list is opened again.
  var $sitesList = null, // Element to
    sitesDataArray = [], // ES provides an array response
    sitesDataObject = {}, // Easier to query an object sometimes
    currentSite = site.get('slug'), // The string (key) of the current site
    siteBaseReqPath = formSiteBasePath();

  function Constructor(el) {
    this.el = el;

    // A debounced keyup handler
    this.debouncedKeyUp = _.debounce(_.bind(this.debouncedKeyUpHandler, this), 500);

    this.sites = [];

    this.selectedSites = [];

    this.sitesOpenState = false;

    this.paginationState = 0;

    this.createChildren()
      .initValues()
      .initPageList();
  }

  Constructor.prototype = {
    events: {
      '.signout click': 'onSignOutClick',
      '.settings click': 'onDirectoryClick',
      '.page-list-search keyup': 'onInputKeyup',
      '.sites-readout-trigger click': 'onTriggerClick'
    },
    onSignOutClick: function (e) {
      e.stopPropagation();

      window.location.href = `${site.get('path')}/auth/logout`;
    },
    /**
     * Select the children elements we need
     *
     * @return {Object}
     */
    createChildren: function () {
      this.search = dom.find(this.el, '.page-list-search');
      this.trigger = dom.find(this.el, '.sites-readout-trigger');
      this.list = dom.find(this.el, '.page-list-readout');
      this.loader = dom.find(this.el, '.page-list-loading');
      this.sitesReadout = dom.find(this.el, '.sites-readout');
      this.siteList = dom.find(this.el, '.sites-readout-list');

      return this;
    },
    /**
     * [initValues description]
     * @return {[type]} [description]
     */
    initValues: function () {
      // Add the current site to the selected sites array
      this.selectedSites.push(currentSite);

      return this;
    },
    /**
     * Click handler for clicking the clay menu trigger
     *
     * @return {Promise}
     */
    onDirectoryClick: function () {
      return openDirectory();
    },
    /**
     * Click handler for when clicking the sites trigger
     * @param  {object} e
     */
    onTriggerClick: function (e) {
      e.stopPropagation();

      this.sitesReadout.classList.toggle('open');
      this.search.classList.toggle('closed');
      this.updateTriggerHTML(!this.sitesOpenState);

      // If closing the sites tab, fetch the pages again
      if (!this.sitesOpenState) {
        // Assume changes to the selected sites so reset pagination
        this.paginationState = 0;

        getPages(queryConstructor(this.selectedSites, this.search.value, this.paginationState), siteBaseReqPath)
          .then(modelPageData)
          .then(this.updatePageList.bind(this));
      }
    },
    /**
     * Execute the debounced key up function
     * so that we don't go bonkers with requests
     * @param  {event} e
     */
    onInputKeyup: function (e) {
      e.stopPropagation();

      this.debouncedKeyUp(e);
    },
    /**
     * Debounced handler for querying elastic
     *
     * @param  {Object} e
     */
    debouncedKeyUpHandler: function (e) {
      // Reset pagination to 0 because the search is new
      this.paginationState = 0;

      // Request the pages
      getPages(queryConstructor(this.selectedSites, e.target.value, this.paginationState), siteBaseReqPath)
        .then(modelPageData)
        .then(this.updatePageList.bind(this));
    },
    /**
     * Render the pages list to the DOM and re-select
     * the readout list so that we can update it again
     * next time it updates
     *
     * @param  {Array} pages
     */
    updatePageList: function (pages) {
      var list = templatePages(pages);

      dom.replaceElement(this.list, list);
      this.list = dom.find(this.el, '.page-list-readout');
    },
    /**
     * Update the sites list area for selecting from sites
     * @param  {array} sites
     */
    updateSiteList: function (sites) {
      sitesDataArray = sites; // TODO: don't rerun this stuff
      sitesDataObject = _.keyBy(sites, function (site) {
        return site.slug;
      });
      $sitesList = $sitesList || templateSites(sitesDataArray, currentSite);

      dom.replaceElement(this.siteList, $sitesList);
      this.siteList = dom.find(this.el, '.sites-readout-list');
      // TODO: Remove this listener on close of pane
      this.siteList.addEventListener('click', this.siteButtonClick.bind(this));
      this.updateTriggerHTML(false);
    },
    updateTriggerHTML: function (state) {
      var html = '',
        selectedSite;

      if (!state) {
        if (this.selectedSites.length === sitesDataArray.length || !this.selectedSites.length) {
          html = '<span class="sites-readout-trigger-text">All</span>';
        } else if (this.selectedSites.length === 1) {
          selectedSite = sitesDataObject[this.selectedSites[0]];
          html = `<img src="//${selectedSite.mediaPath}${selectedSite.siteIcon}" />`;
        } else {
          html = `<span class="sites-readout-trigger-text">${this.selectedSites.length}</span>`;
        }
      } else {
        html = '<svg width="8" height="12" viewBox="0 0 8 12" xmlns="http://www.w3.org/2000/svg"><path d="M2 0L.59 1.41 5.17 6 .59 10.59 2 12l6-6z" fill-rule="evenodd"/></svg>';
      }

      this.sitesOpenState = state;
      this.trigger.innerHTML = html;
    },
    /**
     * Click handler for clicking a button within the sites container
     * @param  {object} e
     */
    siteButtonClick: function (e) {
      var button = dom.closest(e.target, '.sites-readout-list-item-btn'),
        siteId = button.getAttribute('data-id');

      e.stopPropagation();

      if (_.includes(this.selectedSites, siteId)) {
        this.selectedSites = _.pull(this.selectedSites, siteId);
      } else {
        this.selectedSites.push(siteId);
      }

      // Toggle active class
      button.classList.toggle('active');
    },
    /**
     * Initialize the page list
     *
     * @return {Object}
     */
    initPageList: function () {
      getSites(siteBaseReqPath)
        .then(function (sites) {
          this.updateSiteList(sites);

          return getPages(queryConstructor(this.selectedSites, '', this.paginationState), siteBaseReqPath)
            .then(modelPageData)
            .then(this.updatePageList.bind(this));
        }.bind(this));
      return this;
    }
  };
  return Constructor;
};

