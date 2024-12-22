<script setup>
import { VueMarkdown } from '@crazydos/vue-markdown'

defineProps({
	markdown: String
})
</script>

<template>
	<VueMarkdown :markdown="markdown" />
</template>