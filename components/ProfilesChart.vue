<script setup>
import { Doughnut } from 'vue-chartjs'

const props = defineProps({
	profiles: Array
})

const student = useArrayFilter(props.profiles, profile => profile.role == 'student')
const staff = useArrayFilter(props.profiles, profile => profile.role == 'staff')
const admin = useArrayFilter(props.profiles, profile => profile.role == 'admin')

const options = {
	responsive: true
}

const data = {
	labels: ['Student', 'Staff', 'Admin'],
	datasets: [
		{
			backgroundColor: ['#04c8c5', '#3499fd', '#4caf50'],
			data: [student.value.length, staff.value.length, admin.value.length]
		}
	]
}
</script>

<template>
	<Doughnut :data="data" :options="options" />
</template>