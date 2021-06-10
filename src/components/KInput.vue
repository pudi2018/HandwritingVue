<template>
<div>
    <input :type="type" :value="value" @input="onInput" v-bind="$attrs" />
</div>
</template>
<script>
import emitter from '../mixins/emitter';
export default {
		name: 'KInput',
		inheritAttrs: false,
		mixins: [emitter],
		componentName: 'KInput',
    props: {
        value: {
            type: String,
            default: ''
        },
        type: {
            type: String,
            default: 'text'
        }
    },
    methods: {
        onInput(e) {
            this.$emit('input', e.target.value);
						console.log(this.$parent.$options, this.$parent.$options.componentName);
						// this.$parent.$emit('validate');
						this.dispatch('KFormItem', 'validate');
        }
    },
    data: () => {
        return {

        }
    }
}
</script>

<style scoped>

</style>