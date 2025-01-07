<script setup>
import { PolarArea } from 'vue-chartjs'

const props = defineProps({
	bookmarks: Array
})

const post = useArrayFilter(props.bookmarks, bookmark => bookmark.post_id)
const event = useArrayFilter(props.bookmarks, bookmark => bookmark.event_id)
const announcement = useArrayFilter(props.bookmarks, bookmark => bookmark.announcement_id)

const options = {
	responsive: true
}

const data = {
	labels: ['Post', 'Event', 'Announcement'],
	datasets: [
		{
			label: 'Number of Bookmarks',
			backgroundColor: ['#04c8c5', '#3499fd', '#ff9800'],
			data: [post.value.length, event.value.length, announcement.value.length]
		}
	]
}
</script>

<template>
	<PolarArea :data="data" :options="options" />
</template>