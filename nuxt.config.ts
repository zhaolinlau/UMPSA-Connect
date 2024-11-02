// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: { enabled: true },
	compatibilityDate: "2024-08-06",
	modules: [
		'vuetify-nuxt-module',
		'@nuxtjs/supabase',
		'nuxt-security',
		'@nuxtjs/robots',
		'@vite-pwa/nuxt',
		'nuxt-gtag',
		'nuxt-delay-hydration',
		'@unocss/nuxt',
		'@formkit/auto-animate/nuxt',
		'@vueuse/nuxt'
	],

	vuetify: {
		vuetifyOptions: {
			icons: {
				defaultSet: 'unocss-mdi'
			},
			theme: {
				defaultTheme: 'myCustomTheme',
				themes: {
					myCustomTheme: {
						colors: {
							primary: '#009FA0',
							secondary: '#1A478F',
							error: '#F44336',
							success: '#4CAF50',
							info: '#2196F3',
							warning: '#FFEB3B'
						}
					}
				}
			}
		}
	},

	supabase: {
		redirectOptions: {
			login: '/login',
			callback: '/confirm',
			include: undefined,
			exclude: [],
			cookieRedirect: false
		},
		clientOptions: {
			auth: {
				flowType: 'pkce',
				autoRefreshToken: true,
				detectSessionInUrl: true,
				persistSession: true
			}
		}
	},

	runtimeConfig: {
		public: {
			siteUrl: process.env.NUXT_PUBLIC_SITE_URL
		}
	},

	security: {
		rateLimiter: process.env.NODE_ENV == 'development' ? false : {
			driver: {
				name: 'lruCache'
			},
			headers: false,
			interval: 300000,
			throwError: true,
			tokensPerInterval: 150
		},
		headers: {
			contentSecurityPolicy: {
				"img-src": ["'self'", "data:", `${process.env.SUPABASE_URL}`]
			},
			crossOriginEmbedderPolicy: process.env.NODE_ENV == 'development' ? 'unsafe-none' : 'credentialless'
		}
	},

	pwa: {
		registerType: 'autoUpdate',
		includeAssets: ['/favicon.ico', '/img/apple-touch-icon.jpeg', '/favicon.svg'],
		manifest: {
			name: 'UMPSA Connect',
			short_name: 'UMPSA Connect',
			description: 'UMPSA Connect serves as a comprehensive solution to enhance communication, streamline information dissemination, foster engagement, and improve data security across the entire UMPSA community.',
			theme_color: '#020420',
			icons: [
				{
					src: '/img/logo_64x64.webp',
					sizes: '64x64',
					type: 'image/webp'
				},
				{
					src: '/img/logo_192x192.webp',
					sizes: '192x192',
					type: 'image/webp'
				},
				{
					src: '/img/logo_512x512.webp',
					sizes: '512x512',
					type: 'image/webp',
					purpose: 'any'

				},
				{
					src: '/img/logo_white_512x512.jpeg',
					sizes: '512x512',
					type: 'image/jpeg',
					purpose: 'maskable'
				}
			],
			screenshots: [
				{
					src: '/img/mobile_login.png',
					sizes: '490x1063',
					type: 'image/png',
					form_factor: 'narrow',
					label: 'UMPSA Connect'
				},
				{
					src: '/img/login.png',
					sizes: '1920x1080',
					type: 'image/png',
					form_factor: 'wide',
					label: 'UMPSA Connect'
				}
			]
		},
		workbox: {
			globPatterns: ['**\/*.{js,wasm,css,html,png,svg,ico,jpeg,webp}'],
		},
		injectManifest: {
			globPatterns: ['**\/*.{js,wasm,css,html,png,svg,ico,jpeg,webp}'],
		}
	},

	gtag: {
		id: process.env.G_TAG_ID
	},

	delayHydration: {
		mode: 'mount'
	},

	app: {
		head: {
			meta: [
				{
					name: 'google-site-verification',
					content: process.env.GOOGLE_SITE_VERIFICATION
				}
			],
		}
	}

})