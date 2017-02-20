
# checkbox-group

A group of checkboxes, allowing the user to toggle on or off related items.

## Arguments

* **options** _(required)_ an array of checkboxes

Each option should be an object with `name` and `value` properties. Use the bootstrap to specify which should be toggled by default, e.g.

```yaml
field1:
  option1: true
  option2: false
  option3: false
```

# checkbox

A single checkbox, allowing the user to toggle something on or off.

## Arguments

* **label** _(required)_ the checkbox label

In practice, it's usually best to use a conversational tone / question as the checkbox label, with the field label being shorter. e.g.

```yaml
field1:
  _label: Special Logo
  _has:
    fn: checkbox
    label: Should we use a special logo in this component?
```

# codemirror

A syntax-highlighted text area. Useful for writing css, sass, yaml, or other code in the editor.

## Arguments

* **mode** _(required)_ the language used

The mode of the editor sets syntax highlighting, linting, and other functionality. Currently, we support these modes:

* `text/css` - css mode
* `text/x-scss` - sass/scss mode (useful for per-instance styles)
* `text/x-yaml` - yaml mode (useful for writing elasticsearch queries)

_Note:_ We will add more supported modes as we find use cases for them. See [this link](http://codemirror.net/mode/) for the full list of modes supported in codemirror.

# description

Appends a description to a field.

## Arguments

* **value** _(required)_ field description, allows html

# label

Appends a label to a field. This is pulled from the field's `_label` property, and falls back to using the key of the field.

## Arguments

_No arguments_

# lock

Append a lock button to an input. The input will be locked until the user clicks the lock button. This provides a small amount of friction before editing important (and rarely-edited) fields, similar to macOS's system preferences.

# magic-button

Append a magic button to an input.

## Arguments

* **field** _(optional)_ a field to grab the value from
* **component** _(optional)_ a name of a component to grab the component ref from
* **transform** _(optional)_ a transform to apply to the grabbed value
* **transformArg** _(optional)_ an argument to pass through to the transform
* **store** _(optional)_ to grab data from the client-side store
* **url** _(optional)_ to get data from
* **property** _(optional)_ to get from the returned data
* **moreMagic** _(optional)_ to run the returned value through more transforms, api calls, etc

☆.。.:*・°☆.。.:*・°☆.。.:*・°☆.。.:*・°☆

Magic buttons are extremely powerful, but can be a little confusing to configure. This is what they generally look like:

1. specify a `field` or `component`. The button will grab the value or ref, respectively
2. specify a `transform`. Transforms are useful when doing api calls with that data
2. specify a `transformArg` if you need to send more information to the transform.
3. specify a `store` path or `url` if you need to grab data from somewhere. The request will be prefixed with the `store`/`url` string you pass in.
4. specify a `property` to grab from the result of that api call. You can use `_.get()` syntax, e.g. `foo.bar[0].baz`
5. add `moreMagic` if you need to do anything else to the returned data

**All of these arguments are optional!**

## Here are some examples:

_Note: MediaPlay is the name of our image server._

### (ﾉ◕ヮ◕)ﾉ*:・ﾟ✧ "just grab the primary headline"

```yaml
field: primaryHeadline
```

### (ﾉ◕ヮ◕)ﾉ*:・ﾟ✧ "grab a caption from mediaplay"

```yaml
field: url
transform: mediaplayUrl (to change the image url into a string we can query mediaplay's api with)
url: [mediaplay api url]
property: metadata.caption
```

### (ﾉ◕ヮ◕)ﾉ*:・ﾟ✧ "grab the url of the first mediaplay-image on this page"

```yaml
component: mediaplay-image
store: components
property: url
```

### (ﾉ◕ヮ◕)ﾉ*:・ﾟ✧ "grab a list of items keyed by some component uri"

```yaml
component: mediaplay-image
transform: getComponentInstance (this transforms the full component uri into a ref we can pop onto the end of our site prefix)
url: $SITE_PREFIX/lists/images (this is a ~ special token ~ that evaluates to the prefix of current site, so you can do api calls against your own clay instance)
```

### (ﾉ◕ヮ◕)ﾉ*:・ﾟ✧ "grab the image url from a lede component, then ask mediaplay for the caption"

```yaml
component: feature-lede
store: components
property: imgUrl
moreMagic:
  -
    transform: mediaplayUrl (to change the image url into a string we can query mediaplay's api with)
    url: [mediaplay api url]
    property: metadata.caption
```

### (ﾉ◕ヮ◕)ﾉ*:・ﾟ✧ "grab the tv show name and use it to automatically format an image url"

```yaml
field: showName
transform: formatUrl
transformArg: [base image url]/recaps-$DATAFIELD.png ($DATAFIELD is the placeholder in our formatUrl transform)
```

☆.。.:*・°☆.。.:*・°☆.。.:*・°☆.。.:*・°☆

# radio

A group of radio buttons, allowing the user to select one of a few related options.

## Arguments

* **options** _(required)_ an array of strings

Unlike [checkbox-group](https://github.com/nymag/clay-kiln/blob/master/behaviors/checkbox-group.md), each option should be a string rather than an object. The label for each option will simply be the option converted to Start Case.

```yaml
field1:
  _has:
    fn: radio
    options:
      - foo # looks like Foo
      - bar # looks like Bar
      - baz # looks like Baz
```

# required

Appends "required" to a field's label, to mark that field as required.

## Arguments

_No arguments_

# segmented-button

A group of buttons allowing the user to select one of a few related options. Functions like a styled radio button.

## Arguments

* **options** _(required)_ an array of options

Each option should be an object with `icon`, `text`, and `value` properties. If `icon`s are provided the buttons will use those rather than the text.

_Note:_ It's best to choose either icons or text for all segments of the button, rather than interspersing them.

# segmented-button-group

A group of segmented buttons allowing the user to select one of a few related options. Functions like styled radio buttons.

## Arguments

* **options** _(required)_ an array of options

Each option should be an object with `title` and `values` properties. The `values` should be an array of objects with `icon`, `text`, and `value` properties. Like `segmented-button`, if `icon`s are provided the buttons will use those rather than the text.

_Note:_ It's best to choose either icons or text for all segments of the button, rather than interspersing them.

# select

A standard browser `<select>` element, allowing the user to select one of a few related options.

_Notes:_

- the first item in `options` is pre-selected
- you can force the user to select an option by adding a `required` behavior and by setting the options like this:

```yaml
    fn: select
    options:
      -
      - foo
      - bar
```

Since a blank option is selected by default, the validator will fail.

## Arguments

* **options** _(required)_ an array of strings

Unlike [checkbox-group](https://github.com/nymag/clay-kiln/blob/master/behaviors/checkbox-group.md), each option should be a string rather than an object. The label for each option will simply be the option converted to Start Case.

```yaml
field1:
  _has:
    fn: select
    options:
      - foo # looks like Foo
      - bar # looks like Bar
      - baz # looks like Baz
```

# site-specific-select

A standard browser `<select>` element, allowing the user to select one of a few related options. Options are delineated by site, using the site slug.

## Arguments

* **sites** _(required)_ an array of site options
* **default** _(optional)_ an array of default options

Each site should have a `slug` to match and an `options` array. Similar to the [select behavior](https://github.com/nymag/clay-kiln/blob/master/behaviors/select.md), options are an array of strings. The label for each option will simply be the option converted to Start Case.

```yaml
field1:
  _has:
    fn: site-specific-select
    sites:
      -
        slug: site1
        options:
          - foo # looks like Foo
          - bar # looks like Bar
          - baz # looks like Baz
      -
        slug: site2
        options:
          - quz
          - quuz
```

You may also specify `default` options that will be used if no site slug matches.

```yaml
field1:
  _has:
    fn: site-specific-select
    sites:
      -
        slug: site1
        options:
          - foo # looks like Foo
          - bar # looks like Bar
          - baz # looks like Baz
    default:
      - quz
      - quuz
```

# soft-maxlength

Appends a character count to an input. Allows the user to type above the limit, but can be paired with publishing validation to prevent publishing things that are too long.

## Arguments

* **value** _(required)_ number of characters that should be allowed

The character count will update as users type into the input, and will turn red if they type more characters than allowed.

# text

A one-line text input.

## Arguments

* **type** _(optional)_ defaults to `text` if not defined
* **required** _(optional)_ set input required (blocking)
* **pattern** _(optional)_ required input pattern (blocking)
* **minLength** _(optional)_ minimum number of characters required (blocking)
* **maxLength** _(optional)_ maximum number of characters allowed (blocking)
* **placeholder** _(optional)_ placeholder that will display in the input
* **autocomplete** _(optional)_ enable/disable autocomplete on field (defaults to true)
* **step** _(optional)_ define step increments (for number type)
* **min** _(optional)_ define a minimum value (for number, date-related, and time-related types)
* **max** _(optional)_ define a maximum value (for number, date-related, and time-related  type)
* **autocapitalize** _(optional)_ enable/disable auto-capitalize on field (defaults to true). if set to "words" it will capitalize the first letter of each word

_Note:_ All of the arguments marked `(blocking)` will block saving if the input is invalid.

_Note:_ On recent mobile browsers, certain input types will have auto-capitalize disabled, e.g. emails.

# textarea

A multi-line text input.

## Arguments

* **required** _(optional)_ set textarea required (will block saving)
* **placeholder** _(optional)_ placeholder that will display in the textarea

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
