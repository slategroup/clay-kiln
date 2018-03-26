<template>
  <ui-textbox
    type="time"
    placeholder="12:00 AM"
    v-model="timeValue"
    :invalid="isInvalid"
    :required="isRequired"
    :label="label"
    :help="help"
    :error="errorMessage"
    :disabled="isDisabled || disabled"
    iconPosition="right"
    @input="update">
    <attached-button slot="icon" :name="name" :data="value" :schema="schema" :args="args" @disable="disableInput" @enable="enableInput"></attached-button>
  </ui-textbox>
</template>

<script>
  import _ from 'lodash';
  import dateFormat from 'date-fns/format';
  import { parseDate as parseNaturalDate } from 'chrono-node';
  import { shouldBeRequired, getValidationError } from '../forms/field-helpers';
  import UiTextbox from 'keen/UiTextbox';
  import attachedButton from '../../inputs/attached-button.vue';

  export default {
    props: ['value', 'label', 'help', 'name', 'schema', 'args', 'disabled'],
    data() {
      return {
        isDisabled: false,
        timeValue: ''
      };
    },
    computed: {
      isRequired() {
        return _.get(this, 'args.validate') ? _.get(this, 'args.validate.required') === true || shouldBeRequired(this.args.validate, this.$store, this.name) : false;
      },
      errorMessage() {
        if (_.get(this, 'args.validate')) {
          const validationError = getValidationError(this.timeValue, this.args.validate, this.$store, this.name)

          if (validationError) {
            return validationError;
          } else if (!this.formattedTime) {
            return `${this.help} (Please enter a valid time)`;
          }
        }
      },
      isInvalid() {
        return !!this.errorMessage;
      },
      // a properly formatted time, or empty string if one cannot be parsed
      formattedTime () {
        // todo: there's a subtle bug here if the implicit chrono reference date (now)
        //       differs from what the user think it is, e.g. w/ a related date-picker
        const parsed = parseNaturalDate(this.timeValue);
        if (parsed) {
          return dateFormat(parsed, 'HH:mm')
        } else {
          return ''
        }
      }
    },
    mounted() {
      this.timeValue = this.value
    },
    methods: {
      // every time the value of the input changes, update the store
      update() {
        this.$emit('update', this.timeValue);
      },
      disableInput() {
        this.isDisabled = true;
      },
      enableInput() {
        this.isDisabled = false;
      },
      clear() {
        this.timeValue = '';
      }
    },
    components: {
      UiTextbox,
      attachedButton
    }
  };
</script>
