<template>
  <div>
      <p v-if="label" class="align-left">{{label}}</p>
      <slot></slot>
      <p v-if="error" class="error">{{error}}</p>
      {{form.model[prop]}}
  </div>
</template>

<script>
import Schema from 'async-validator';
import emitter from '../mixins/emitter';
export default {
    inject: ['form'],
    name: 'KFormItem',
    mixins: [emitter],
    componentName: 'KFormItem',
    props: {
        label: {
            type: String,
            default: ''
        },
        prop: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            error: ''
        }
    },
    mounted() {
        this.$on('validate', () => {
            this.validate();
        })
        if (this.prop) {
            this.dispatch('KForm', 'kkb.form.addField', [this])
        }
    },
    methods: {
        validate() {
            console.log('do');
            const rules = this.form.rules[this.prop];
            const value = this.form.model[this.prop];
            const schema = new Schema({[this.prop]: rules});
            return schema.validate({[this.prop]: value}, error => {
                if (error) {
                    this.error = error[0].message
                } else {
                    this.error = '';
                }
            });

        }
    }
    
}
</script>

<style>
.error {
    color: red;
}
.align-left {
    text-align: left;
}
</style>