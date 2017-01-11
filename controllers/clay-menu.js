const openDirectory = require('../services/pane/directory'),
  dom = require('@nymag/dom'),
  site = require('../services/site'),
  db = require('../services/edit/db'),
  moment = require('moment'),
  querySize = 8,
  searchEndpoint = setSearchEndpoint();

/**
 * Construct the query to the page list index based on arguments
 *
 * @param  {Array} selectedSites
 * @param  {String} inputVal
 * @param  {Number} fromVal
 * @return {Object}
 */
function queryConstructor(selectedSites, inputVal, fromVal) {
  var query = {
      index: 'pages',
      type: 'general'
    },
    body = {
      size: querySize,
      from: fromVal * querySize || 0
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

  return _.assign(query, { body: body });
}

/**
 * Return a promise with all the pages data
 *
 * @param {object} query
 * @param {string} reqPath
 * @returns {Promise}
 */
function getPages(query) {
  return db.postJSON(`//${searchEndpoint}/pages`, query)
    .then(modelPageData);
}


/**
 * Make the site data pretty and easy to work with
 *
 * @param  {Array} resp
 * @return {Array}
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
function getSites() {
  return db.getJSON(`//${searchEndpoint}/sites`)
    .then(modelSiteData);
}

/**
 * Return an object of pretty page data
 *
 * @param  {Object} resp
 * @return {Array}
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
 * Set the search endpoint so that it can be referenced globally
 *
 * @return {String}
 */
function setSearchEndpoint() {
  return `${window.location.host}/_search`;
}

/**
 * A formatter function to pass to moment
 *
 * @param  {Object} date
 * @return {Object}
 */
function dateFormatter(date) {
  if (date.year() !== moment().year()) {
    return date.format('MM/DD/YY');
  } else {
    return date.format('MM/DD');
  }
}

/**
 * Return the properly formatted date string
 *
 * @param  {String} time
 * @return {String}
 */
function formatTime(time) {
  var time;

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
 * Wrap each author in a span
 *
 * @param  {array} authors
 * @return {string}
 */
function templateAuthors(authors) {
  return _.map(authors, function (author) {
    return `<span data-id="${author}" class="author-button">${author}</span>`;
  }).join(',');
}

/**
 * Create the link for the page. Needs to check for
 * different properties of the URL.
 *
 * @param  {string} url
 * @return {string}
 */
function createPageLink(url) {
  var formedUrl = '';

  // Check for .html ending
  if (_.endsWith(url, '/')) {
    formedUrl = url;
  } else if (!_.endsWith(url, '.html')) {
    formedUrl = `${url}.html`;
  } else {
    formedUrl = url;
  }

  // Add begining slashes if none exist
  if (!_.includes(url, '//')) {
    formedUrl = `//${formedUrl}`;
  }

  return formedUrl;
}

/**
 * Create a string to be converted to an element(s)
 * with all the page data
 *
 * @param  {Array} pages
 * @return {String}
 */
function pageDataToString(pages) {
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

  return list;
}

/**
 * Create the page list element
 *
 * @param  {Array} pages
 * @return {Element}
 */
function templatePages(pages) {
  var list = pageDataToString(pages);

  // Add the load more
  list += '<li class="page-list-readout-loadmore">Load More...</li>'
    // Create the element
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
 * Add additional pages to the readout
 *
 * @param  {array} pages
 * @param  {Element} el
 */
function appendAdditionalPages(pages, el) {
  var pages = dom.create(pageDataToString(pages)),
    loadMore = dom.find(el, '.page-list-readout-loadmore');

  dom.insertBefore(loadMore, pages);
}

module.exports = function () {
  // We have to construct the sites list when we open the menu, but we don't
  // want to have to do it everytime we open the list since this data is pretty
  // static. Let's create it the first time, cache the element, and the reference
  // it anytime the page list is opened again.
  var $sitesList = null, // Element to
    sitesDataArray = [], // ES provides an array response
    sitesDataObject = {}, // Easier to query an object sometimes
    currentSite = site.get('slug'); // The string (key) of the current site

  function Constructor(el) {
    this.el = el;

    // A debounced keyup handler
    this.debouncedKeyUp = _.debounce(_.bind(this.debouncedKeyUpHandler, this), 500);

    this.debouncedScroll = _.debounce(_.bind(this.debouncedScrollHandler, this), 500);

    this.sites = [];

    this.selectedSites = [];

    this.paneHeight = null;

    this.hideLoadMore = false;

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
      '.sites-readout-trigger click': 'onTriggerClick',
      '.pane-inner scroll': 'onPaneScroll'
    },
    /**
     * Debounce scrolling within the pane
     *
     * @param  {Object} e
     */
    debouncedScrollHandler: function (target) {
      if (target.scrollHeight - target.scrollTop === this.paneHeight && !this.loadMore) {
        // Incremement the pagination
        this.paginationState += 1;
        // Get the new pages
        getPages(queryConstructor(this.selectedSites, '', this.paginationState))
          .then(function (resp) {
            appendAdditionalPages(resp, this.list);
            this.hideLoadMore = resp.length < querySize;

            this.toggleLoadMore();
          }.bind(this));
      }
    },
    /**
     * Scroll handler for inside the pane
     *
     * @param  {Object} e
     */
    onPaneScroll: function (e) {
      e.stopPropagation();

      this.debouncedScroll(e.currentTarget);
    },
    toggleLoadMore: function () {
      var loadMore;

      if (this.hideLoadMore) {
        loadMore = dom.find(this.list, '.page-list-readout-loadmore');
        loadMore.classList.add('hidden');
      }
    },
    /**
     * When the sign out button is clicked
     *
     * @param  {Object} e
     */
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
      this.innerPane = dom.find(this.el, '.pane-inner');

      return this;
    },
    /**
     * Init values for the page list
     *
     * @return {object}
     */
    initValues: function () {
      // Add the current site to the selected sites array
      this.selectedSites.push(currentSite);
      // Find the height of the pane
      this.paneHeight = _.parseInt(this.innerPane.style.height);

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

        getPages(queryConstructor(this.selectedSites, this.search.value, this.paginationState))
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
      getPages(queryConstructor(this.selectedSites, e.target.value, this.paginationState))
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
      // Should load more be hidden?
      this.hideLoadMore = pages.length < querySize;
      this.toggleLoadMore();
    },
    /**
     * Update the sites list area for selecting from sites
     * @param  {array} sites
     */
    updateSiteList: function (sites) {
      sitesDataArray = sites;
      sitesDataObject = _.keyBy(sites, function (site) {
        return site.slug;
      });

      $sitesList = $sitesList || templateSites(sitesDataArray, currentSite);

      dom.replaceElement(this.siteList, $sitesList);
      this.siteList = dom.find(this.el, '.sites-readout-list');
      this.siteList.addEventListener('click', this.siteButtonClick.bind(this));
      this.updateTriggerHTML(false);
    },
    /**
     * Update the selected values for the sites trigger
     *
     * @param  {Boolean} state
     */
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
      if ($sitesList) {
        getPages(queryConstructor(this.selectedSites, '', this.paginationState))
          .then(this.updatePageList.bind(this));
      } else {
        getSites()
          .then(function (sites) {
            this.updateSiteList(sites);

            return getPages(queryConstructor(this.selectedSites, '', this.paginationState))
              .then(this.updatePageList.bind(this));
          }.bind(this));
      }

      return this;
    }
  };
  return Constructor;
};

