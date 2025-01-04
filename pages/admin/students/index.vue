<script setup>
definePageMeta({
	middleware: ['admin']
})
const client = useSupabaseClient()
const id = useId()

const { data: profiles, refresh: refreshProfiles } = await useFetch('/api/profiles', {
	method: 'get',
	query: {
		students: true
	}
})

const { data: students, refresh: refreshStudents } = await useFetch('/api/students', {
	method: 'get'
})

const studentProfiles = useArrayMap(profiles, profile => {
	const student = useArrayFind(students, student => student.user_id == profile.user_id)

	return {
		...profile,
		matric_id: student.value.matric_id,
		faculty: student.value.faculty,
		course: student.value.course
	}
})

const profilesChannel = client.channel(`${id}:profiles`).on('postgres_changes', {
	event: '*', schema: 'public', table: 'profiles'
}, async () => await refreshStudentProfiles())

const studentsChannel = client.channel(`${id}:students`).on('postgres_changes', {
	event: '*', schema: 'public', table: 'students'
}, async () => await refreshStudentProfiles())

const refreshStudentProfiles = async () => {
	await refreshProfiles()
	await refreshStudents()
}

const search = ref('')

onMounted(async () => {
	profilesChannel.subscribe()
	studentsChannel.subscribe()
})

onUnmounted(async () => {
	await client.removeChannel(profilesChannel)
	await client.removeChannel(studentsChannel)
})
</script>

<template>
	<VCard title="Student List">
		<VCardActions>
			<VTextField v-model="search" label="Search" prepend-inner-icon="i-mdi:magnify" variant="outlined"
				color="primary" />
			<VSpacer />
			<AddStudentProfileForm />
		</VCardActions>
		<VDataTable :items="studentProfiles"
			:filter-keys="['name', 'gender', 'nationality', 'matric_id', 'faculty', 'course']" :search="search">

			<template v-slot:headers>
				<tr>
					<th>No</th>
					<th>Name</th>
					<th>Gender</th>
					<th>Nationality</th>
					<th>Matric ID</th>
					<th>Faculty</th>
					<th>Course</th>
					<th>Actions</th>
				</tr>
			</template>

			<template v-slot:item="{ item, index }">
				<tr>
					<td>{{ index + 1 }}</td>
					<td>{{ item.name }}</td>
					<td>{{ item.gender }}</td>
					<td>{{ item.nationality }}</td>
					<td>{{ item.matric_id }}</td>
					<td>{{ item.faculty }}</td>
					<td>{{ item.course }}</td>
					<td class="d-inline-flex align-center">
						<VBtn icon="i-mdi:eye" color="blue" :to="`/admin/students/${item.user_id}`" />
						<DeleteStudentAccount :student="item" />
					</td>
				</tr>
			</template>
		</VDataTable>
	</VCard>
</template>