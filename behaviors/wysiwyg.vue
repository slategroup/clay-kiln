<docs>

</docs>

<style lang="sass">
  @import '../styleguide/colors';
  @import '../styleguide/inputs';

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
  import { Editor } from 'mobiledoc-kit';
  import { default  as TextRenderer } from 'mobiledoc-text-renderer';

  console.log(TextRenderer.default)

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
      const editor = new Editor({
          html: this.data,
          autofocus: true,
          unknownCardHandler() { console.log('unknown card!') },
          unknownAtomHandler() { console.log('unknown atom!') }
        }),
        renderer = new TextRenderer.default();

      editor.render(this.$el);

      editor.didUpdatePost((postEditor) => {
        console.log('updated', renderer.render(editor.serialize()).result)
      })
    },
    slot: 'main'
  };
</script>
