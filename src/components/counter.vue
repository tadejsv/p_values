<template>
  <div class="input-group">
    <div class="input-group-prepend">
      <button class="btn" type="button" @click="decreaseCounter" :disabled="disableDown">-</button>
    </div>
    <input type="text" class="form-control text-center value" :value="count" disabled>
    <div class="input-group-append">
      <button class="btn" type="button" @click="increaseCounter" :disabled="disableUp">+</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'counter',
  props: {
    value: {
      default: 2,
      type: Number
    },
    upperLimit: {
      default: 10,
      type: Number
    },
    lowerLimit: {
      default: 2,
      type: Number
    }
  },
  methods: {
    increaseCounter() { // Increase
      this.count++;
    },
    decreaseCounter() { // Decrease
      this.count--;
    }
  },
  computed: {
    count: {
      get: function () {
        return this.value;
      },
      set: function (newValue) {
        const newCount = parseFloat(newValue),
        withinLimits = (newCount <= this.upperLimit) &&
        (newCount >= this.lowerLimit);

        if (withinLimits) {
          this.$emit('input', newCount);
        }
      }
    },
    disableDown: function () {
      return this.count <= this.lowerLimit;
    },
    disableUp: function () {
      return this.count >= this.upperLimit;
    }
  }
}
</script>

<style scoped>
input {
  max-width: 100px;
}
</style>
