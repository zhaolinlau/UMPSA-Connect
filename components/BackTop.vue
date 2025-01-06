<script setup>
const showButton = ref(false)
onMounted(() => {
	window.addEventListener('scroll', handleScroll)
});
function handleScroll() {
	showButton.value = window.scrollY > 250;
}
function scrollToTop() {
	window.scrollTo({ top: 0, behavior: 'smooth' })
}
onUnmounted(() => {
	window.removeEventListener('scroll', handleScroll)
});
</script>

<template>
	<VBtn color="primary" class="position-fixed scrolltotop" v-if="showButton" @click="scrollToTop"
		icon="i-mdi:arrow-up" />
</template>

<style>
.scrolltotop {
	bottom: 20px;
	right: 20px;
	z-index: 99;
}
</style>