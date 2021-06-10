<template>
    <div>
        <slot></slot>
    </div>
</template>

<script>
export default {
    provide() {
        return {
            form: this
        }
    },
    name: 'KForm',
    componentName: 'KForm',
    props: {
        model: {
            type: Object,
            required: true
        },
        rules: Object
    },
    created() {
        this.fields = [];
        this.$on('kkb.form.addField', item => {
            this.fields.push(item);
        });
    },
    methods: {
        validate(cb) {
            // 全局校验方法
            // 转成promise
            // const tasks = this.$children.filter((item) => item.prop).map((item) => item.validate());
            const tasks = this.fields.map(item => item.validate());
            Promise.all(tasks)
                .then(() => cb(true))
                .catch(() => cb(false));
        }
    }
}
</script>

<style>

</style>