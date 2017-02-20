<docs>

</docs>

<style lang="sass">
  @import '../styleguide/colors';
  @import '../styleguide/inputs';
  @import '~prosemirror-view/style/prosemirror.css';
  @import '~prosemirror-menu/style/menu.css';

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

</style>

<template>
  <div class="wysiwyg-input" :class="{ styled: isStyled }" :html="data"></div>
</template>

<script>
  import { EditorState } from 'prosemirror-state';
  import { MenuBarEditorView } from 'prosemirror-menu';
  import { schema } from 'prosemirror-schema-basic';
  import { DOMParser, DOMSerializer } from 'prosemirror-model';
  import { exampleSetup } from 'prosemirror-example-setup';
  import { clearChildren } from '@nymag/dom';

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
      let serializer = DOMSerializer.fromSchema(schema),
        el = document.createElement('div'),
        view = new MenuBarEditorView(this.$el, {
          state: EditorState.create({
            doc: DOMParser.fromSchema(schema).parse(this.$el),
            plugins: exampleSetup({schema, history: false})
          }),
          floatingMenu: true,
          dispatchTransaction(tr) {
            view.updateState(view.editor.state.apply(tr));
            el.appendChild(serializer.serializeFragment(view.editor.state.doc.content))
            console.log('[PROSEMIRROR] updated', el.innerHTML)
            clearChildren(el);
          }
        });

      this.$nextTick(() => view.editor.focus());
    },
    slot: 'main'
  };
</script>
