<script setup>
import { Bar } from 'vue-chartjs'

const props = defineProps({
	posts: Array
})

const general = useArrayFilter(props.posts, post => post.category == 'General')
const question = useArrayFilter(props.posts, post => post.category == 'Question')
const event = useArrayFilter(props.posts, post => post.category == 'Event')

const data = {
	labels: [
		'General',
		'Question',
		'Event'
	],
	datasets: [
		{
			label: 'Number of Posts',
			backgroundColor: '#04c8c5',
			data: [general.value.length, question.value.length, event.value.length]
		},
	]
}

const options = {
	responsive: true,
}
</script>

<template>
	<Bar :data="data" :options="options" />
</template>