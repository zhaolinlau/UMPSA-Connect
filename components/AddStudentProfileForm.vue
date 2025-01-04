<script setup>
const addStudentDialog = ref(false)
const loading = ref(false)
const visible = ref(false)
const addStudentForm = reactive({
	email: '@adab.umpsa.edu.my',
	password: '',
	confirm_password: '',
	name: '',
	role: 'student',
	avatar: null,
	gender: '',
	nationality: '',
	matric_id: '',
	faculty: '',
	course: ''
})

const addStudentFormRef = ref()

const addStudentAlert = ref(false)
const addStudentError = ref('')
const faculties = useFaculty()
const courses = useCourse()
const client = useSupabaseClient()
const media_id = ref('')

const randomNumber = async () => {
	media_id.value = Math.random()
}

const addStudent = async () => {
	try {
		loading.value = true
		const { valid } = await addStudentFormRef.value.validate()

		if (valid) {
			if (addStudentForm.password == addStudentForm.confirm_password) {
				const user = await $fetch('/api/users', {
					method: 'POST',
					body: {
						email: addStudentForm.matric_id.toLowerCase() + addStudentForm.email,
						password: addStudentForm.password
					}
				})

				if (user) {
					await randomNumber()
					const profile = await $fetch('/api/profiles', {
						method: 'POST',
						body: {
							name: addStudentForm.name,
							role: addStudentForm.role,
							avatar: addStudentForm.avatar ? `${media_id.value}/${addStudentForm.avatar.name}` : '',
							gender: addStudentForm.gender,
							nationality: addStudentForm.nationality,
							user_id: user.id
						}
					})

					if (profile) {
						await uploadAvatarFile()
					}

					if (profile) {
						await $fetch('/api/students', {
							method: 'POST',
							body: {
								matric_id: addStudentForm.matric_id.toUpperCase(),
								faculty: addStudentForm.faculty,
								course: addStudentForm.course,
								user_id: user.id
							}
						})

						addStudentDialog.value = false
					}
				}
			}
		}
	} catch (error) {
		addStudentError.value = error.message
		addStudentAlert.value = true
	} finally {
		loading.value = false
	}
}

const studentProfileRules = ref({
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
	matric_id: [
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
	faculty: [
		value => {
			if (value) return true
			return 'Faculty is required.'
		}
	],
	course: [
		value => {
			if (value) return true
			return 'Course is required.'
		}
	]
})

const uploadAvatarFile = async () => {
	if (addStudentForm.avatar) {
		const { error } = await client.storage.from('images').upload(`profiles/${media_id.value}/${addStudentForm.avatar.name}`, addStudentForm.avatar, {
			cacheControl: '3600',
			upsert: false
		})

		if (error) {
			throw createError(error)
		}
	}
}
</script>

<template>
	<VOverlay class="align-center justify-center" persistent v-model="loading">
		<VProgressCircular color="primary" size="64" indeterminate />
	</VOverlay>

	<VBtn text="Add Student" color="primary" variant="elevated" @click="addStudentDialog = true" />

	<VDialog v-model="addStudentDialog" max-width="750">
		<VCard title="Add Student">
			<VForm @submit.prevent="addStudent" ref="addStudentFormRef">
				<VCardText>
					<VRow>
						<VCol cols="12" v-if="addStudentAlert">
							<VAlert v-model="addStudentAlert" border="start" color="red" variant="elevated" border-color="red"
								title="Error" icon="$error" :text="addStudentError" closable />
						</VCol>

						<vCol cols="12" lg="6">
							<vTextField label="Email" :rules="studentProfileRules.matric_id" v-model="addStudentForm.email"
								:model-value="addStudentForm.matric_id.toLowerCase() + addStudentForm.email" disabled />
						</vCol>

						<vCol cols="12" lg="6">
							<vTextField label="Password" :rules="studentProfileRules.password"
								:append-inner-icon="visible ? 'i-mdi:eye-off' : 'i-mdi:eye'" :type="visible ? 'text' : 'password'"
								@click:append-inner="visible = !visible" v-model="addStudentForm.password" />
						</vCol>

						<vCol cols="12" lg="6">
							<vTextField label="Confirm Password" :append-inner-icon="visible ? 'i-mdi:eye-off' : 'i-mdi:eye'"
								:type="visible ? 'text' : 'password'" @click:append-inner="visible = !visible"
								:rules="studentProfileRules.confirm_password" v-model="addStudentForm.confirm_password" />
						</vCol>

						<vCol cols="12" lg="6">
							<vTextField label="Name" :rules="studentProfileRules.name" v-model="addStudentForm.name" />
						</vCol>

						<vCol cols="12" lg="6">
							<VSelect label="Gender" :items="['Male', 'Female']" :rules="studentProfileRules.gender"
								v-model="addStudentForm.gender" />
						</vCol>

						<vCol cols="12" lg="6">
							<VSelect label="Nationality" :items="['Local', 'International']" :rules="studentProfileRules.nationality"
								v-model="addStudentForm.nationality" />
						</vCol>

						<vCol cols="12" lg="6">
							<vTextField label="Student ID" v-model="addStudentForm.matric_id"
								:rules="studentProfileRules.matric_id" />
						</vCol>

						<vCol cols="12" lg="6">
							<VSelect label="Faculty" :items="faculties" :rules="studentProfileRules.faculty"
								v-model="addStudentForm.faculty" />
						</vCol>

						<vCol cols="12" lg="6">
							<VSelect label="Course" :items="courses" :rules="studentProfileRules.course"
								v-model="addStudentForm.course" />
						</vCol>

						<VCol cols="12" lg="6">
							<VFileInput label="Avatar File" accept="image/*" :rules="studentProfileRules.avatar"
								v-model="addStudentForm.avatar" />
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
								@click="addStudentDialog = false" />
						</vCol>
					</VRow>
				</VCardActions>
			</VForm>
		</VCard>
	</VDialog>
</template>