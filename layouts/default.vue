<template>
	<v-layout>
		<v-app-bar title="UMPSA Connect"></v-app-bar>
		<v-navigation-drawer>
			<v-list>
				<v-list-item title="Navigation drawer"></v-list-item>
			</v-list>
		</v-navigation-drawer>
		<v-main>
			<slot />
		</v-main>
	</v-layout>
</template>