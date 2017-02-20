<docs>
  # wysiwyg

  A multi-line text input which allows a rich editing experience. Uses [medium-editor](https://github.com/yabwe/medium-editor).

  _Note:_ When this behavior is added to a field, it will replace any previous elements (rather than modifying them). Add it as the first behavior.

  ## Arguments

  * **buttons** _(optional)_  array of button names (strings) or custom buttons (objects) for text styling. defaults to "remove formatting"
  * **styled** _(optional)_   style the content editable element like our `text` and `textarea` inputs.
  * **enableKeyboardExtras** _(optional)_  enable creating new components on enter, and appending text to previous components on delete, etc
  * **paste** _(optional)_ array of paste rules for parsing pasted content and creating new components

  The buttons allowed in our wysiwyg behavior are:

  * bold
  * italic
  * strikethrough
  * anchor
  * phrase - uses [Medium Editor Phrase](https://github.com/nymag/medium-editor-phrase) and takes [documented options](https://github.com/nymag/medium-editor-phrase#initialization-options). See the example below for a full example.

  By default, wysiwyg fields will use the styles of the containing component. To use our kiln input styling, set `styled` to `true`.

  **Keyboard Extras** are the difference between a simple wysiwyg field and a robust content authoring experience. When enabled, these features are unlocked:

  * hitting enter will create a new instance of the component you're in, add it onto the page, and paste in text if there is text _in front of_ your cursor
  * hitting delete (with the cursor at the beginning of the input) will remove the component you're in and paste text into the previous instance of the same component if there is text _in front of your cursor_
  * hitting <kbd>tab</kbd> will insert a bullet point
  * hitting <kbd>shift+enter</kbd> will insert a soft break

  _Note:_ All pasted text gets run through [text-model](https://github.com/nymag/text-model). Pasting in multiple paragraphs will create multiple instances of the current component with the respective paragraphs of text added to each instance.

  **Paste** is an optional array of pasting rules that's used for parsing and creating different components. This is useful for transforming pasted links into embeds, catching pasted blockquotes, etc. Rules have these properties:

  * `match` - regex to match the pasted content. all rules will be wrapped in `^` and `$` (so they don't match urls _inside_ links in the content)
  * `matchLink` - boolean to determine whether _links_ containing the regex should also match. Should be true for embeds, false for components that could potentially contain links inside them.
  * `component` - the name of the component that should be created
  * `field` - the name of the field that the captured data should be populated to on the new component. the (last) new component will focus this field after it's added (note: this is limited to a single regex capture group)
  * `group` - (optional) the group that should be focused when the (last) new component is added (instead of the specific field). this is useful for components with forms that contain both the specified field and other things, and preserves the same editing experience as editing that component normally
  * `sanitize` - (optional) a boolean flag that tells kiln whether the captured data should be run through text-model to sanitize it. this is useful for pasting into components' fields that themselves use the wysiwyg behavior (e.g. pasting a `<blockquote>` into a paragraph, which should create a new blockquote component with the sanitized text)

  ## Example

  ```
  text:
    _placeholder:
      height: 50px
      text: New Paragraph
      required: true
    _display: inline
    _has:
      -
        fn: wysiwyg
        enableKeyboardExtras: true
        styled: false
        buttons:
          - bold
          - italic
          - strikethrough
          - anchor
          - phrase:
              aria: annotate
              name: annotate
              contentDefault: A¹
              phraseClassList: ['clay-annotated'] # adds this class to the span
              phraseTagName: span
        paste:
          -
            match: (https?://twitter\.com/\w+?/status/\d+)
            component: clay-tweet
            field: url
          -
            match: (https?://www\.facebook\.com/.+?/posts/\d+)
            component: clay-facebook-post
            field: url
          -
            match: <blockquote>(.*?)(?:</blockquote>)?
            component: blockquote
            field: text
            sanitize: true
          -
            match: (.*)
            component: clay-paragraph
            field: text
            sanitize: true
  ```
</docs>

<style lang="sass">
  @import '../styleguide/colors';
  @import '../styleguide/inputs';
  @import '~medium-editor/src/sass/medium-editor';

  .wysiwyg-input {
    @include normal-text();

    cursor: text;
    min-height: 19px;
    outline: none;
    text-align: left;
    white-space: normal;

    &::selection {
      background-color: $blue-25;
    }
  }

  .wysiwyg-input *::selection {
    background-color: $blue-25;
  }

  .wysiwyg-input.styled {
    @include input();

    white-space: normal;
  }

  .wysiwyg-input p {
    margin: 0;
  }

  .wysiwyg-input blockquote {
    border-left: 10px solid $black-25;
    margin-left: 0;
    padding-left: 20px;
  }

  // toolbar

  // settings
  $wysiwyg-color: $black;
  $wysiwyg-bgcolor: $white;
  $wysiwyg-hover-color: $black-10;
  $wysiwyg-selected-bgcolor: $blue-25;
  $wysiwyg-button-size: 48px;
  $wysiwyg-border-color: $black-30;
  $wysiwyg-border-radius: 0;
  $wysiwyg-border-width: 1px;
  $wysiwyg-boxshadow: 0 0 6px 0 $input-shadow;
  $wysiwyg-dropshadow: 0 0 6px $input-shadow;

  .medium-toolbar-arrow-over:before {
    border-color: transparent transparent $wysiwyg-bgcolor;
    filter: drop-shadow($wysiwyg-dropshadow);
    top: -8px;
  }

  .medium-toolbar-arrow-under:before,
  .medium-toolbar-arrow-under:after {
    border: $wysiwyg-border-width solid transparent;
    content: '';
    display: block;
    height: 0;
    left: 50%;
    pointer-events: none;
    position: absolute;
    top: $wysiwyg-button-size;
    width: 0;
  }

  .medium-toolbar-arrow-under:before {
    border-color: transparent;
    border-top-color: $wysiwyg-bgcolor;
    border-width: 8px;
    margin-left: -8px;
    z-index: 1;
  }

  .medium-toolbar-arrow-under:after {
    border-color: transparent;
    border-top-color: $wysiwyg-border-color;
    border-width: 9px;
    filter: drop-shadow($wysiwyg-dropshadow);
    margin-left: -9px;
    z-index: -1;
  }

  .medium-editor-toolbar {
    border: none;
    border-radius: $wysiwyg-border-radius;
    box-shadow: $wysiwyg-boxshadow;

    .medium-editor-toolbar-actions,
    .medium-editor-toolbar-form {
      background-color: $wysiwyg-bgcolor;
      border: $wysiwyg-border-width solid $wysiwyg-border-color;
      border-radius: $wysiwyg-border-radius;
      position: relative;

      input {
        padding: 6px 6px 6px 10px;
      }
    }

    li {
      &:nth-child(6n) {
        border-right: none;
      }

      button {
        align-items: center;
        background-color: transparent;
        border: none;
        color: $wysiwyg-color;
        display: block;
        font-size: 18px;
        height: $wysiwyg-button-size;
        justify-content: center;
        line-height: 32px;
        padding: 0;
        text-align: center;
        transition: background-color .2s ease-in;
        width: $wysiwyg-button-size;

        &:hover {
          background-color: $wysiwyg-hover-color;
        }
      }

      .medium-editor-button-active,
      .medium-editor-button-active:hover {
        background-color: $wysiwyg-selected-bgcolor;
      }

      &:first-of-type button {
        border-bottom-left-radius: $wysiwyg-border-radius;
        border-top-left-radius: $wysiwyg-border-radius;
      }

      &:last-of-type button {
        border-bottom-right-radius: $wysiwyg-border-radius;
        border-top-right-radius: $wysiwyg-border-radius;
      }
    }

    li + li {
      border-left: $wysiwyg-border-width solid $wysiwyg-border-color;
    }
  }

  .medium-editor-toolbar-form {
    background: transparent;
    border-radius: $wysiwyg-border-radius;
    color: $wysiwyg-color;

    .medium-editor-toolbar-input {
      background: transparent;
      color: $wysiwyg-color;
      height: $wysiwyg-button-size;
    }
    .medium-editor-toolbar-input:placeholder {
      color: $black-50;
      font-family: Helvetica, Arial, sans-serif;
    }

    a {
      color: $wysiwyg-color;
    }

    .medium-editor-toolbar-save {
      color: $published;
      font-size: 18px;
      margin: 0 5px;
    }

    .medium-editor-toolbar-close {
      color: $red;
      margin: 0 10px 0 5px;
    }
  }

  .medium-editor-anchor-preview {
    background: $wysiwyg-bgcolor;
    border-radius: $wysiwyg-border-radius;
    box-shadow: $wysiwyg-boxshadow;
    color: $wysiwyg-color;
    max-width: 300px;
    word-break: break-word;
    word-wrap: normal;
  }

  .medium-editor-toolbar-anchor-preview {
    background: $wysiwyg-bgcolor;
    border-radius: $wysiwyg-border-radius;
    position: relative;

    a {
      color: $wysiwyg-color;
      margin: 8px 10px;
    }
  }

  .medium-editor-placeholder:after {
    color: $black-25;
  }

  .medium-editor-toolbar-actions {
    max-width: ($wysiwyg-button-size * 6) + ($wysiwyg-border-width * 7);
  }

  // show the first 6 items (tier 1)
  // hide the rest (tier 2)
  .medium-editor-toolbar li:nth-child(n+7) {
    display: none;
  }

  @keyframes medium-editor-animate-tiers {
    0% {
      margin-top: 0;
    }
    100% {
      margin-top: -$wysiwyg-button-size;
    }
  }

  @keyframes medium-editor-animate-arrow {
    0% {
      top: $wysiwyg-button-size;
    }
    100% {
      top: 2 * $wysiwyg-button-size;
    }
  }

  // showing all
  .medium-editor-toolbar.show-all {
    animation: medium-editor-animate-tiers 200ms forwards linear;
  }
  .medium-editor-toolbar.show-all .medium-editor-toolbar-form {
    height: 2 * $wysiwyg-button-size;
  }
  .medium-toolbar-arrow-under.show-all:before,
  .medium-toolbar-arrow-under.show-all:after {
    animation: medium-editor-animate-arrow 200ms forwards linear;
  }

  .medium-editor-toolbar.show-all li {
    display: list-item;
  }

  // add border-bottom to the first row
  .medium-editor-toolbar.show-all li:nth-child(1),
  .medium-editor-toolbar.show-all li:nth-child(2),
  .medium-editor-toolbar.show-all li:nth-child(3),
  .medium-editor-toolbar.show-all li:nth-child(4),
  .medium-editor-toolbar.show-all li:nth-child(5),
  .medium-editor-toolbar.show-all li:nth-child(6) {
    border-bottom: $wysiwyg-border-width solid $wysiwyg-border-color;
  }

  // hide items in the second row
  .medium-editor-toolbar.show-none li:nth-child(n+7) {
    display: none;
  }

  // showing none
  .medium-editor-toolbar.show-none {
    animation: medium-editor-animate-tiers 200ms backwards linear;
  }
  .medium-editor-toolbar.show-none .medium-editor-toolbar-form {
    height: $wysiwyg-button-size;
  }
  .medium-toolbar-arrow-under.show-none:before,
  .medium-toolbar-arrow-under.show-none:after {
    animation: medium-editor-animate-arrow 200ms backwards linear;
  }

  // toolbar buttons
  .medium-editor-action-bold b {
    padding-left: 2px;
  }
  .medium-editor-action-italic i,
  .medium-editor-action-italic em {
    font-weight: normal !important;
  }
  .medium-editor-action-strikethrough s {
    padding-left: 1px;
  }
  .medium-editor-action-anchor img {
    width: 18px;
  }
</style>

<template>
  <p class="wysiwyg-input" :class="{ styled: isStyled }" :html="data"></p>
</template>

<script>
  import _ from 'lodash';
  import MediumEditor from 'medium-editor';
  import MediumEditorPhrase from 'medium-editor-phrase';
  import * as model from 'text-model';
  import { create } from '@nymag/dom';
  import { UPDATE_FORMDATA } from '../lib/forms/mutationTypes';
  import { getComponentName } from '../lib/utils/references';

  // pass config actions to text-model
  model.updateSameAs({
    // all headings (inside the current component) should be converted to bold text
    H1: 'STRONG',
    H2: 'STRONG',
    H3: 'STRONG',
    H4: 'STRONG',
    H5: 'STRONG',
    H6: 'STRONG'
  });

  /**
   * grab buttons and extensions from the passed-in buttons
   * @param  {array} buttons
   * @return {object}
   */
  function initButtonsAndExtensions(buttons) {
    const buttonNames = _.map(buttons, (button) => {
        if (_.isString(button)) {
          return button;
        } else if (_.isObject(button) && button.phrase) {
          return button.phrase.name;
        }
      }).concat(['removeFormat']), // always add "remove formatting" button to the end
      extensions = _.reduce(buttons, (obj, button) => {
        if (_.isObject(button) && button.phrase) {
          obj[button.phrase.name] = new MediumEditorPhrase(button.phrase);
        }
        return obj;
      }, {});

    return { buttons: buttonNames, extensions };
  }

  /**
   * match extension names when instantiating medium-editor
   * @param {string} extname e.g. 'italic'
   * @returns {Function}
   */
  function findExtension(extname) {
    return function (ext) {
      return ext.name === extname;
    };
  }

  /**
   * add custom icons to certain extensions
   * @param {object} extensions
   * @param {string} assetPath
   */
  function addCustomIcons(extensions, assetPath) {
    const boldExtension = _.find(extensions, findExtension('bold')),
      italicExtension = _.find(extensions, findExtension('italic')),
      strikethoughExtension = _.find(extensions, findExtension('strikethrough')),
      linkExtension = _.find(extensions, findExtension('anchor')),
      removeFormattingExtension = _.find(extensions, findExtension('removeFormat'));

    if (boldExtension) {
      boldExtension.button.innerHTML = `<img src="${assetPath}/media/components/clay-kiln/bold.svg" />`;
    }
    if (italicExtension) {
      italicExtension.button.innerHTML = `<img src="${assetPath}/media/components/clay-kiln/italics.svg" />`;
    }
    if (strikethoughExtension) {
      strikethoughExtension.button.innerHTML = `<img src="${assetPath}/media/components/clay-kiln/strikethrough.svg" />`;
    }
    if (linkExtension) {
      linkExtension.button.innerHTML = `<img src="${assetPath}/media/components/clay-kiln/link.svg" />`;
    }
    if (removeFormattingExtension) {
      removeFormattingExtension.button.innerHTML = `<img src="${assetPath}/media/components/clay-kiln/remove-formatting.svg" />`;
    }
  }

  /**
   * generate regex from paste rules
   * @param {array} rules
   * @returns {array}
   */
  function addPasteRules(rules) {
    return _.map(rules, (rawRule) => {
      const pre = '^',
        preLink = '(?:<a(?:.*?)>)?',
        post = '$',
        postLink = '(?:</a>)?';

      let rule = _.assign({}, rawRule);

      // regex rule assumptions
      // 1. match FULL STRINGS (not partials), e.g. wrap rule in ^ and $
      if (!rule.match) {
        throw new Error('Paste rule needs regex! ', rule);
      }

      // if `rule.matchLink` is true, match rule AND a link with the rule as its text
      // this allows us to deal with urls that other text editors make into links automatically
      // (e.g. google docs creates links when you paste in urls),
      // but will only return the stuff INSIDE the link text (e.g. the url).
      // For embeds (where you want to grab the url) set matchLink to true,
      // but for components that may contain actual links set matchLink to false
      if (rule.matchLink) {
        rule.match = `${preLink}${rule.match}${postLink}`;
      }

      // create regex
      try {
        rule.match = new RegExp(`${pre}${rule.match}${post}`);
      } catch (e) {
        console.error(e);
        throw e;
      }

      return rule;
    });
  }

  /**
   * sanitize a string of html through text-model
   * @param  {string} str
   * @return {string}
   */
  function sanitizeThroughModel(str) {
    const wrapper = document.createElement('div'),
      fragment = model.toElement(model.fromElement(create(str)));

    wrapper.appendChild(fragment);
    return wrapper.innerHTML;
  }

  /**
   * split innerHTML into paragraphs based on closing <p>/<div> and line breaks
   * trim the resulting strings to get rid of any extraneous whitespace
   * @param {string} str
   * @returns {array}
   */
  function splitParagraphs(str) {
    // </p>, </div>, </h1> through </h9>, or two (interchangeable) <br> or newlines
    // note: <br> tags may contain closing slashes, and there may be spaces around stuff
    // note: split on both </blockquote> and <blockquote>, since there may be text before/after the quote
    let paragraphs = _.map(str.split(/(?:<\/(?:p|div|h[1-9])>|(?:\s?<br(?:\s?\/)?>\s?|\s?\n\s?){2})/ig), s => s.trim());

    // splitting on the closing p/div/header allows us to grab ALL the paragraphs from
    // google docs, since when you paste from there the last paragraph
    // isn't wrapped in a <p> tag. weird, right?
    // splitting on closing <div> tags allows us to support some weird
    // google docs situations (lots of line breaks with embedded media),
    // as well as "plaintext" editors like IA Writer
    // splitting on double line breaks/<br> tags allows us to catch a few edge cases in other editors

    // handle inline blockquotes (and, in the future, other inline things)
    // that should be parsed out as separate components
    return _.reduce(paragraphs, function (result, graf) {
      if (_.includes(graf, '<blockquote') || _.includes(graf, '</blockquote')) {
        let start = graf.indexOf('<blockquote'),
          end = graf.indexOf('</blockquote>') + 13, // length of that closing tag
          before = graf.substring(0, start),
          quote = graf.substring(start, end),
          after = graf.substring(end);

        result.push(before);
        result.push(quote); // pass this through so it gets picked up by rules
        result.push(after);
      } else {
        result.push(graf);
      }
      return result;
    }, []);
  }

  /**
   * match components from strings of random pasted input
   * note: paragraphs (and other components with rules that specify sanitization)
   * will have their values returned as text models instead of strings
   * @param  {array} strings
   * @param {array} rules chain of responsibility for paste rules
   * @param {object} editor needs to remove the new text if it throws an error
   * @param {string} rawDiff to remove on error (see above)
   * @returns {array}
   */
  function matchComponents(strings, rules, editor, rawDiff) {
    return _.filter(_.map(strings, function (str) {
      let cleanStr, matchedRule, matchedObj, matchedValue;

      // remove extraneous opening <p>, <div>, and <br> tags
      // note: some google docs pastes might have `<p><br>`
      cleanStr = str.replace(/^\s?<(?:p><br|p|div|br)(?:.*?)>\s?/ig, '');
      // remove any other <p> or <div> tags, because you cannot put block-level tags inside paragraphs
      cleanStr = cleanStr.replace(/<(?:p|div).*?>/ig, '');
      // remove 'line separator' and 'paragraph separator' characters
      // (not visible in text editors, but get added when pasting from pdfs and old systems)
      cleanStr = cleanStr.replace(/(\u2028|\u2029)/g, '');
      // convert tab characters to spaces (pdfs looooove tab characters)
      cleanStr = cleanStr.replace(/(?:\t|\\t)/g, ' ');
      // convert nonbreaking spaces to regular spaces
      cleanStr = cleanStr.replace(/&nbsp;/ig, ' ');
      // assume newlines that AREN'T between a period and a capital letter (or number) are errors
      // note: this fixes issues when pasting from pdfs or other sources that automatically
      // insert newlines at arbitrary places
      cleanStr = cleanStr.replace(/\.\n[A-Z0-9]/g, '<br>');
      cleanStr = cleanStr.replace(/\n/g, ' ');
      // FINALLY, trim the string to catch any of the stuff we converted to spaces above
      cleanStr = cleanStr.trim();

      matchedRule = _.find(rules, function matchRule(rule) {
        return rule.match.exec(cleanStr);
      });

      if (!matchedRule) {
        // remove pasted content from element and display an error
        editor.setContent(editor.getContent().replace(rawDiff, ''), 0);
        progress.open('error', `Error pasting text: No rule found for "${_.truncate(cleanStr, { length: 40, omission: '…' })}"`);
        throw new Error('No matching paste rule for ' + cleanStr);
      }

      // grab stuff from matched rule, incl. component, field, sanitize
      matchedObj = _.assign({}, matchedRule);

      // find actual matched value for component
      // note: rules need to grab _some value_ from the string
      matchedValue = matchedRule.match.exec(cleanStr)[1];

      // finally, add the potentially-sanitized value into the matched obj
      matchedObj.value = matchedValue;

      return matchedObj;
    }), function filterMatches(component) {
      const val = component.value;

      // filter out any components that are blank (filled with empty spaces)
      // this happens a lot when paragraphs really only contain <p> tags, <div>s, or extra spaces

      // return true if the string contains words (anything that isn't whitespace, but not just a single closing tag)
      return _.isString(val) && val.match(/\S/) && !val.match(/^<\/.*?>$/);
    });
  }

  /**
   * persist data to store on input
   * @param  {object} editor
   * @param  {object} store
   * @param  {string} name
   * @param  {array} rules
   * @returns {function}
   */
  function onEditableInput(editor, { store, name, rules, oldData }) {
    return () => {
      const newData = editor.getContent(),
        isAdded = newData.length > oldData.length,
        diff = isAdded ? { type: 'add', text: newData.replace(oldData, '') } : { type: 'remove', text: oldData.replace(newData, '') };

      console.log(diff)
      let components, firstComponent; // populate this after we determine if there are paste rules

      if (_.isEmpty(rules) || diff.type === 'remove' ) {
        const storeData = diff.type === 'add' ? oldData + sanitizeThroughModel(diff.text) : oldData.replace(diff.text, '');

        // no paste rules, simply persist data to the store as is
        return store.commit(UPDATE_FORMDATA, { path: name, data: storeData });
      }

      components = matchComponents(splitParagraphs(diff.text), rules, editor, diff);

      // now grab the first component
      firstComponent = _.head(components);

      if (getComponentName(_.get(store, 'state.ui.currentForm.uri')) === firstComponent.component) {
        // first component is the same as the one we're in. append text to the end
        const value = firstComponent.sanitize ? sanitizeThroughModel(firstComponent.value) : firstComponent.value;

        console.log('current:', value)

        store.commit(UPDATE_FORMDATA, { path: name, data: oldData + value });
      } else {
        console.log('gotta replace the current component!')
      }
    };
  }

  export default {
    props: ['name', 'data', 'schema', 'args'],
    data() {
      return {};
    },
    computed: {
      isStyled() {
        return this.args.styled;
      }
    },
    mounted() {
      const { buttons, extensions } = initButtonsAndExtensions(this.args.buttons),
        assetPath = _.get(this, '$store.state.site.assetPath'),
        pasteRules = addPasteRules(this.args.paste),
        initialValue = this.data,
        editor = new MediumEditor(this.$el, {
          toolbar: {
            buttons,
            standardizeSelectionStart: true,
            allowMultiParagraphSelection: false
          },
          delay: 200, // wait a bit for the toolbar and link previews to display
          paste: {
            forcePlainText: false,
            cleanPastedHTML: true, // clean html from sources like google docs
            cleanTags: [ // remove these tags when pasting
              'meta',
              'script',
              'style',
              'object',
              'iframe',
              'table'
            ],
            preCleanReplacements: [
              [/&lt;(.*?)&gt;/ig, '<$1>'], // catch any html trying to be sent in as escaped strings,
              // thus allowing cleanTags (above) or text-model to manage them
              [/<h[1-9]>/ig, '<h2>'],
              [/<\/h[1-9]>/ig, '</h2>'], // force all headers to the same level
              // decode SPECIFIC html entities (not all of them, as that's a security hole)
              ['&amp;', '&'],
              ['&nbsp;', ' '],
              ['&ldquo;', '“'],
              ['&rdguo;', '”'],
              ['&lsquo;', '‘'],
              ['&rsquo;', '’'],
              ['&hellip;', '…'],
              ['&mdash;', '—'],
              ['&ndash;', '–']
            ]
          },
          anchor: {
            linkValidation: true // check for common protocols on links
          },
          autoLink: false, // create links automatically when urls are entered
          imageDragging: false, // disallow dragging inline images
          targetBlank: true,
          disableReturn: true,
          disableExtraSpaces: true, // disable double spaces
          placeholder: false, // the placeholder isn't native
          extensions
        });

      // add custom icons to toolbar buttons
      addCustomIcons(editor.extensions, assetPath);

      // add initial value back into the editor
      editor.setContent(initialValue, 0);

      // add event handlers
      // note: input also handles paste event, since there's no functional difference
      // between changing a single character and dumping in a bunch of characters
      // (and the native paste event fires AFTER input anyways)
      editor.subscribe('editableInput', onEditableInput(editor, {
        store: this.$store,
        name: this.name,
        rules: pasteRules,
        oldData: this.data
      }));
    },
    slot: 'main'
  };
</script>
