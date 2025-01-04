<script setup>
const addStaffDialog = ref(false)
const visible = ref(false)
const addStaffForm = reactive({
	email: '@umpsa.edu.my',
	password: '',
	confirm_password: '',
	name: '',
	role: 'staff',
	avatar: null,
	gender: '',
	nationality: '',
	employee_id: '',
	department: '',
	position: ''
})

const addStaffFormRef = ref()

const addStaffAlert = ref(false)
const addStaffError = ref('')
const departments = useDepartment()
const positions = usePosition()
const client = useSupabaseClient()
const media_id = ref('')

const randomNumber = async () => {
	media_id.value = Math.random()
}

const addStaff = async () => {
	try {
		const { valid } = await addStaffFormRef.value.validate()
		if (valid) {
			if (addStaffForm.password == addStaffForm.confirm_password) {
				const user = await $fetch('/api/users', {
					method: 'POST',
					body: {
						email: addStaffForm.email.toLowerCase(),
						password: addStaffForm.password
					}
				})

				if (user) {
					await randomNumber()
					const profile = await $fetch('/api/profiles', {
						method: 'POST',
						body: {
							name: addStaffForm.name,
							role: addStaffForm.role,
							avatar: addStaffForm.avatar ? `${media_id.value}/${addStaffForm.avatar.name}` : '',
							gender: addStaffForm.gender,
							nationality: addStaffForm.nationality,
							user_id: user.id
						}
					})

					if (profile) {
						await uploadAvatarFile()
					}

					if (profile) {
						await $fetch('/api/staffs', {
							method: 'POST',
							body: {
								employee_id: addStaffForm.employee_id.toUpperCase(),
								department: addStaffForm.department,
								position: addStaffForm.position,
								user_id: user.id
							}
						})

						addStaffDialog.value = false
					}
				}
			}
		}
	} catch (error) {
		addStaffError.value = error.message
		addStaffAlert.value = true
	}
}

const staffProfileRules = ref({
	email: [
		value => {
			if (value) return true
			return 'Email is required.'
		}
	],
	password: [
		value => {
			if (value) return true
			return 'Password is required.'
		}
	],
	confirm_password: [
		value => {
			if (value) return true
			return 'Confirm Password is required.'
		}
	],
	employee_id: [
		value => {
			if (value) return true
			return 'Matric ID is required.'
		}
	],
	name: [
		value => {
			if (value) return true
			return 'Name is required.'
		}
	],
	avatar: [
		value => {
			if (value.length > 0) return true
			return 'Avatar is required.'
		}
	],
	gender: [
		value => {
			if (value) return true
			return 'Gender is required.'
		}
	],
	nationality: [
		value => {
			if (value) return true
			return 'Nationality is required.'
		}
	],
	department: [
		value => {
			if (value) return true
			return 'Department is required.'
		}
	],
	position: [
		value => {
			if (value) return true
			return 'Position is required.'
		}
	]
})

const uploadAvatarFile = async () => {
	if (addStaffForm.avatar) {
		const { error } = await client.storage.from('images').upload(`profiles/${media_id.value}/${addStaffForm.avatar.name}`, addStaffForm.avatar, {
			cacheControl: '3600',
			upsert: false
		})

		if (error) {
			addStaffError.value = error.message
			addStaffAlert.value = true
		}
	}
}
</script>

<template>
	<VBtn text="Add Staff" color="primary" variant="elevated" @click="addStaffDialog = true" />

	<VDialog v-model="addStaffDialog" max-width="750">
		<VCard title="Add Staff">
			<VForm @submit.prevent="addStaff" ref="addStaffFormRef">
				<VCardText>
					<VRow>
						<VCol cols="12" v-if="addStaffAlert">
							<VAlert v-model="addStaffAlert" border="start" color="red" variant="elevated" border-color="red"
								title="Error" icon="$error" :text="addStaffError" closable />
						</VCol>

						<vCol cols="12" lg="6">
							<vTextField label="Email" :rules="staffProfileRules.email" v-model="addStaffForm.email" />
						</vCol>

						<vCol cols="12" lg="6">
							<vTextField label="Password" :rules="staffProfileRules.password"
								:append-inner-icon="visible ? 'i-mdi:eye-off' : 'i-mdi:eye'" :type="visible ? 'text' : 'password'"
								@click:append-inner="visible = !visible" v-model="addStaffForm.password" />
						</vCol>

						<vCol cols="12" lg="6">
							<vTextField label="Confirm Password" :append-inner-icon="visible ? 'i-mdi:eye-off' : 'i-mdi:eye'"
								:type="visible ? 'text' : 'password'" @click:append-inner="visible = !visible"
								:rules="staffProfileRules.confirm_password" v-model="addStaffForm.confirm_password" />
						</vCol>

						<vCol cols="12" lg="6">
							<vTextField label="Name" :rules="staffProfileRules.name" v-model="addStaffForm.name" />
						</vCol>

						<vCol cols="12" lg="6">
							<VSelect label="Gender" :items="['Male', 'Female']" :rules="staffProfileRules.gender"
								v-model="addStaffForm.gender" />
						</vCol>

						<vCol cols="12" lg="6">
							<VSelect label="Nationality" :items="['Local', 'International']" :rules="staffProfileRules.nationality"
								v-model="addStaffForm.nationality" />
						</vCol>

						<vCol cols="12" lg="6">
							<vTextField label="Employee ID" v-model="addStaffForm.employee_id"
								:rules="staffProfileRules.employee_id" />
						</vCol>

						<vCol cols="12" lg="6">
							<VSelect label="Department" :items="departments" :rules="staffProfileRules.department"
								v-model="addStaffForm.department" />
						</vCol>

						<vCol cols="12" lg="6">
							<VSelect label="Position" :items="positions" :rules="staffProfileRules.position"
								v-model="addStaffForm.position" />
						</vCol>

						<VCol cols="12" lg="6">
							<VFileInput label="Avatar File" accept="image/*" :rules="staffProfileRules.avatar"
								v-model="addStaffForm.avatar" />
						</VCol>
					</VRow>
				</VCardText>

				<VCardActions class="w-100">
					<VRow>
						<vCol cols="12" lg="6">
							<VBtn text="Submit" variant="elevated" block type="submit" color="primary" />
						</vCol>

						<vCol cols="12" lg="6">
							<VBtn text="Cancel" variant="elevated" block type="button" color="error"
								@click="addStaffDialog = false" />
						</vCol>
					</VRow>
				</VCardActions>
			</VForm>
		</VCard>
	</VDialog>
</template>