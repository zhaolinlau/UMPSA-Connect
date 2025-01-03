<script setup>
definePageMeta({
	middleware: ['admin']
})
const client = useSupabaseClient()
const id = useId()

const { data: profiles, refresh: refreshProfiles } = await useFetch('/api/profiles', {
	method: 'get',
	query: {
		staffs: true
	}
})

const { data: staffs, refresh: refreshStaffs } = await useFetch('/api/staffs', {
	method: 'get'
})

const staffProfiles = useArrayMap(profiles, profile => {
	const staff = useArrayFind(staffs, staff => staff.user_id == profile.user_id)

	return {
		...profile,
		matric_id: staff.value.matric_id,
		faculty: staff.value.faculty,
		course: staff.value.course
	}
})

const profilesChannel = client.channel(`${id}:profiles`).on('postgres_changes', {
	event: '*', schema: 'public', table: 'profiles'
}, async () => await refreshStaffProfiles())

const staffsChannel = client.channel(`${id}:staffs`).on('postgres_changes', {
	event: '*', schema: 'public', table: 'staffs'
}, async () => await refreshStaffProfiles())

const refreshStaffProfiles = async () => {
	await refreshProfiles()
	await refreshStaffs()
}

const search = ref('')

onMounted(async () => {
	profilesChannel.subscribe()
	staffsChannel.subscribe()
})

onUnmounted(async () => {
	await client.removeChannel(profilesChannel)
	await client.removeChannel(staffsChannel)
})


const deleteStaff = async (user_id, avatar) => {
	await $fetch('/api/users', {
		method: 'DELETE',
		body: {
			user_id: user_id,
			avatar: avatar
		}
	})
}
</script>

<template>


	<VCard title="Staff List">
		<VCardActions>
			<VTextField v-model="search" label="Search" prepend-inner-icon="i-mdi:magnify" variant="outlined"
				color="primary" />
			<VSpacer />
			<AddStaffProfileForm />
		</VCardActions>
		<VDataTable :items="staffProfiles"
			:filter-keys="['name', 'gender', 'nationality', 'employee_id', 'department', 'position']" :search="search">

			<template v-slot:headers>
				<tr>
					<th>No</th>
					<th>Name</th>
					<th>Gender</th>
					<th>Nationality</th>
					<th>Employee ID</th>
					<th>Department</th>
					<th>Position</th>
					<th>Actions</th>
				</tr>
			</template>

			<template v-slot:item="{ item, index }">
				<tr>
					<td>{{ index + 1 }}</td>
					<td>{{ item.name }}</td>
					<td>{{ item.gender }}</td>
					<td>{{ item.nationality }}</td>
					<td>{{ item.employee_id }}</td>
					<td>{{ item.department }}</td>
					<td>{{ item.position }}</td>
					<td class="d-inline-flex align-center">
						<vBtn icon="i-mdi:pencil" color="secondary" />
						<DeleteStaffAccount :staff="item" />
					</td>
				</tr>
			</template>
		</VDataTable>
	</VCard>
</template>