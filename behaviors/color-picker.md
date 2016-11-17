# color-picker

A simple color picker, allowing the user to visually choose a color with HTML5.

_Note:_ When this behavior is added to a field, it will replace any previous elements (rather than modifying them). Add it as the first behavior.

## Arguments

* **label** _(required)_ the color picker label

In practice, it's usually best to use a conversational tone / question as the color picker label, with the field label being shorter. e.g.

```yaml
field1:
  _label: Special Logo
  _has:
    fn: color-picker
    label: What color would you like this component to be?
```
