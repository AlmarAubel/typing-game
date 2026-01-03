<template>
  <router-link
    class="p-2 rounded-md text-white transition duration-150 ease-in-out hover:bg-blue-900"
    :to="props.to"
  >
    <slot></slot>
  </router-link>
</template>

<script setup lang="ts">

import { type RouterLinkProps } from "vue-router";

const props = defineProps<Pick<RouterLinkProps, "to">>();
</script>
