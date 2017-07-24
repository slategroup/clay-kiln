<docs>
  # hidden

  A hidden input field that does not need to be user-editable and does
  not display in the form UI.

  ## Arguments

  * **name** _(optional)_ An identifier for the field when saving data
  * **value** _(optional)_ The value assigned to the input by the component
  * **id** _(optional)_ A unique identifier for the field in the DOM
</docs>

<style lang="sass">
  // Input margins are applied via sibling selectors, so we need to override
  // the margin on the second field if the first field is hidden.
  .kiln-field.kiln-hide + .kiln-field {
    margin-top: 0 !important;
  }
</style>

<template>
  <input type="hidden" :name="name" :value="value" :id="id" />
</template>

<script>
  import _ from 'lodash';
  import { closest } from '@nymag/dom';

  function getField(el) {
    return closest(el, '.kiln-field');
  }

  function hideField(el) {
    el.classList.add('kiln-hide');
  }

  export default {
    props: ['name', 'data', 'schema', 'args'],
    data() {
      return {};
    },
    computed: {
      name() {
        const name = this.args.name;
        return name;
      },
      value() {
        const name = this.args.name;
        let value = _.get(this.$store, `state.ui.currentForm.fields[${name}]`);

        if(!value) {
          value = 'false';
        }

        return value;
      }
    },
    mounted() {
      hideField(getField(this.$el));
    },
    slot: 'main'
  };
</script>
