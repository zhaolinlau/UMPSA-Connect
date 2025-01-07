<script setup>
import { Pie } from 'vue-chartjs'

const props = defineProps({
	notifications: Array
})

const read = useArrayFilter(props.notifications, notification => notification.read)
const unread = useArrayFilter(props.notifications, notification => !notification.read)

const data = {
	labels: [
		'Read',
		'Unread'
	],
	datasets: [{
		label: 'Number of Notifications',
		data: [read.value.length, unread.value.length],
		backgroundColor: ['#04c8c5', '#3499fd'],
		hoverOffset: 4
	}]
}

const options = {
	responsive: true
}
</script>

<template>
	<Pie :data="data" :options="options" />
</template>