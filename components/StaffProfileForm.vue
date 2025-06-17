<script setup>
const props = defineProps({
	profile: Object,
	staff: Object
})

const route = useRoute()

const departments = useDepartment()

const positions = usePosition()

const client = useSupabaseClient()

const editProfile = ref(false)

const loading = ref(false)

const uploadAvatar = ref(false)

const media_id = ref('')

const randomNumber = async () => {
	media_id.value = Math.random()
}

const staffFormRef = ref()
const avatarFormRef = ref()

const avatarRule = ref({
	avatar: [
		value => {
			if (value) return true
			return 'Avatar is required.'
		}
	],
})

const staffProfileRules = ref({
	employee_id: [
		value => {
			if (value) return true
			return 'Employee ID is required.'
		}
	],
	name: [
		value => {
			if (value) return true
			return 'Name is required.'
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

const avatarFile = ref(null)

const staffProfileForm = reactive({
	name: props.profile.name,
	gender: props.profile.gender,
	nationality: props.profile.nationality,
	avatar: props.profile.avatar,
	employee_id: props.staff.employee_id,
	department: props.staff.department,
	position: props.staff.position,
})

const updateProfile = async () => {
	await $fetch('/api/profiles', {
		method: 'put',
		body: {
			user_id: props.profile.user_id,
			name: staffProfileForm.name,
			gender: staffProfileForm.gender,
			nationality: staffProfileForm.nationality,
			avatar: staffProfileForm.avatar,
			role: props.profile.role
		}
	})
}

const updateStaff = async () => {
	await $fetch('/api/staffs', {
		method: 'put',
		body: {
			user_id: props.staff.user_id,
			employee_id: staffProfileForm.employee_id,
			department: staffProfileForm.department,
			position: staffProfileForm.position,
		}
	})
}

const updateStaffProfile = async () => {
	try {
		loading.value = true
		const { valid } = await staffFormRef.value.validate()

		if (valid) {
			await updateProfile()
			await updateStaff()
			editProfile.value = false
		}
	} catch (error) {
		console.error(error.message)
	} finally {
		loading.value = false
	}
}

const uploadAvatarFile = async () => {
	try {
		loading.value = true
		const { valid } = await avatarFormRef.value.validate()

		if (valid) {
			if (props.profile.avatar) {
				await deleteMedia()
			}

			await randomNumber()
			await client.storage.from('images').upload(`profiles/${media_id.value}/${avatarFile.value.name}`, avatarFile.value, {
				cacheControl: '3600',
				upsert: false
			})

			staffProfileForm.avatar = `${media_id.value}/${avatarFile.value.name}`
			await updateProfile()
			await updateStaff()
			avatarFile.value = null
			uploadAvatar.value = false
		}
	} catch (error) {
		console.error(error.message)
	} finally {
		loading.value = false
	}
}

const deleteMedia = async () => {
	await $fetch('/api/storage', {
		method: 'DELETE',
		body: {
			path: `profiles/${props.profile.avatar}`
		}
	})
	await $fetch('/api/profiles', {
		method: 'PUT',
		body: {
			delete_avatar: true,
			user_id: props.profile.user_id
		}
	})
}
</script>

<template>
	<VOverlay class="align-center justify-center" persistent v-model="loading">
		<VProgressCircular color="primary" size="64" indeterminate />
	</VOverlay>

	<vRow>
		<vCol cols="12">
			<p>PROFILE INFORMATION</p>
			<VDivider class="mb-3" />
		</vCol>

		<vCol cols="12">
			<VRow align="center" justify="center" justify-lg="start">
				<vCol cols="12" lg="1">
					<div class="d-flex justify-center justify-lg-start">
						<VAvatar
							:image="profile.avatar ? client.storage.from('images').getPublicUrl(`profiles/${profile.avatar}`).data.publicUrl : '/img/blank-profile-picture-973460_1280.png'"
							size="100" rounded="circle" accept="image/*" />
					</div>
				</vCol>

				<vCol cols="12" lg="5">
					<div class="mx-3">
						<VForm @submit.prevent="uploadAvatarFile" class="ml-3" v-if="uploadAvatar" ref="avatarFormRef">
							<VFileInput :rules="avatarRule.avatar" label="Avatar File" v-model="avatarFile" :disabled="loading" />
							<VBtn block type="submit" color="primary" text="Save" />
							<VBtn type="button" block class="mt-3" color="error" text="Cancel" @click="uploadAvatar = false" />
						</VForm>

						<div class="d-flex justify-center justify-lg-start" v-else>
							<VBtn type="button" color="secondary" text="Upload" class="ml-3" @click="uploadAvatar = true" />
						</div>
					</div>
				</vCol>
			</VRow>
		</vCol>

		<vCol cols="12">
			<vForm @submit.prevent="updateStaffProfile" ref="staffFormRef">
				<VRow>
					<vCol cols="12" lg="6">
						<vTextField label="Name" :rules="staffProfileRules.name" clearable v-model="staffProfileForm.name"
							:disabled="!editProfile" />
					</vCol>

					<vCol cols="12" lg="6">
						<VSelect label="Gender" :rules="staffProfileRules.gender" :items="['Male', 'Female']"
							v-model="staffProfileForm.gender" :disabled="!editProfile" />
					</vCol>

					<vCol cols="12" lg="6">
						<VSelect label="Nationality" :rules="staffProfileRules.nationality" :items="['Local', 'International']"
							v-model="staffProfileForm.nationality" :disabled="!editProfile" />
					</vCol>

					<vCol cols="12" lg="6">
						<vTextField label="Employee ID" :rules="staffProfileRules.employee_id"
							v-model="staffProfileForm.employee_id" :disabled="!editProfile" />
					</vCol>

					<vCol cols="12" lg="6">
						<VSelect label="Department" :rules="staffProfileRules.department" :items="departments"
							v-model="staffProfileForm.department" :disabled="!editProfile" />
					</vCol>

					<vCol cols="12" lg="6">
						<VSelect label="Position" :rules="staffProfileRules.position" :items="positions"
							v-model="staffProfileForm.position" :disabled="!editProfile" />
					</vCol>

					<template v-if="editProfile">
						<vCol cols="12" lg="6">
							<VBtn text="Save" block type="submit" color="primary" />
						</vCol>

						<vCol cols="12" lg="6">
							<VBtn text="Cancel" block type="button" color="error" @click="editProfile = false" />
						</vCol>
					</template>

					<template v-else>
						<vCol cols="12" lg="6">
							<VBtn text="Edit" block type="button" color="secondary" @click="editProfile = true" />
						</vCol>
						<VCol cols="12" lg="6">
							<VBtn text="Back" block type="button" color="grey" to="/admin/staffs"
								v-if="route.params.user_id == props.profile.user_id" />
						</VCol>
					</template>
				</VRow>
			</vForm>
		</vCol>
	</vRow>
</template>