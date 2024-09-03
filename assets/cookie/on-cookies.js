import { DAY } from './constants.js'
import languageDictionary from './language.dictionary.js'
import {
	encodeData,
	getUserType,
	setCookie,
	updateCookiePreferences,
} from './utils.js'

document.addEventListener('DOMContentLoaded', function () {
	new OnCookies({
		language: 'en',
		policy: './cookie.html',
	})
})

class CookieManager {
	constructor() {}

	set(name, value, days) {
		let expires = ''
		if (days) {
			const date = new Date()
			date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
			expires = '; expires=' + date.toUTCString()
		}
		document.cookie = name + '=' + (value || '') + expires + '; path=/'
	}

	get(name) {
		const nameEQ = name + '='
		const ca = document.cookie.split(';')
		for (let i = 0; i < ca.length; i++) {
			let c = ca[i]
			while (c.charAt(0) === ' ') c = c.substring(1, c.length)
			if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
		}
		return null
	}

	remove(name) {
		document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
	}
}

export const cookieManager = new CookieManager()

class OnCookies {
	constructor({ language, banner = null, policy }) {
		this.language = language
		this.banner = banner
		this.policy = policy
		this.cookieIcon = this.createCookieIcon()
		this.dialog = this.createBanner()
		this.initialize()
	}

	initialize() {
		document.body.appendChild(this.dialog)
		document.body.appendChild(this.cookieIcon)
		this.setupEventListeners()
		this.setupObserver()
		this.checkResetRequest()
		this.showBannerOnFirstView()
	}

	checkResetRequest() {
		const urlParams = new URLSearchParams(window.location.search)
		const resetTrigger = urlParams.get('reset')
		if (resetTrigger === 'true') {
			console.log('Cookies were reset')
			cookieManager.remove('_cookies_accepted')
			cookieManager.remove('_cookie_preference')
			cookieManager.remove('essential_cookie')
			cookieManager.remove('performance_cookie')
			cookieManager.remove('advertising_cookie')
			cookieManager.remove('_usertype')
			cookieManager.remove('_usertoken')
		}
	}

	showBannerOnFirstView() {
		if (!cookieManager.get('_cookies_accepted')) {
			this.showModal()
		} else {
			this.cookieIcon.classList.remove('ont-hidden')
		}
	}

	setTextContent(element, text) {
		return (element.innerText = text)
	}

	setHyperlinkDestination(element, destination) {
		return (element.href = destination)
	}

	createBanner() {
		if (this.language.length !== 2)
			throw new Error(
				'Incorrect language format! Should be 2-letter ISO country code: https://countrycode.org'
			)
		if (!(this.language in languageDictionary))
			throw new Error(
				'This language is not supported. Here is the list of country codes: ' +
					Object.keys(languageDictionary)
			)
		const texts = languageDictionary[this.language]

		const dialog = document.createElement('dialog')
		dialog.id = 'cookie-banner'
		dialog.className =
			'ont-rounded-xl ont-border ont-border-neutral-300 ont-overflow-hidden ont-flex ont-flex-col ont-items-center ont-justify-center ont-gap-4 ont-max-w-[20rem] sm:ont-max-w-[30rem] ont-shadow-2xl ont-opacity-0 ont-transition-opacity ont-duration-700 ont-hidden'
		if (this.language === 'he' || this.language === 'ar') {
			dialog.dir = 'rtl'
		}

		const cookieAccept = document.createElement('div')
		cookieAccept.id = 'cookie-accept'
		cookieAccept.className =
			'ont-flex ont-flex-col ont-items-center ont-justify-center'

		if (this.banner) {
			const img = document.createElement('img')
			img.src = this.banner
			img.alt = 'cookies banner'
			img.className =
				'ont-block ont-max-h-[300px] ont-w-full ont-object-cover ont-border-b ont-border-neutral-300'
			cookieAccept.appendChild(img)
		}

		const textContainer = document.createElement('div')
		textContainer.className = 'ont-flex ont-flex-col ont-p-4 ont-gap-1'

		const acceptHeading = document.createElement('h2')
		acceptHeading.className = 'ont-font-medium ont-text-lg ont-text-center'
		acceptHeading.id = 'cookie-accept__heading'
		this.setTextContent(acceptHeading, texts[acceptHeading.id])

		const acceptText1 = document.createElement('p')
		acceptText1.className = 'ont-text-sm ont-text-neutral-500'
		acceptText1.id = 'cookie-accept__text-1'
		this.setTextContent(acceptText1, texts[acceptText1.id])

		const acceptText2 = document.createElement('p')
		acceptText2.className = 'ont-text-sm ont-text-neutral-500'
		acceptText2.id = 'cookie-accept__text-2'
		this.setTextContent(acceptText2, texts[acceptText2.id])

		const agreeButton = document.createElement('button')
		agreeButton.type = 'button'
		agreeButton.id = 'cookie-accept__button'
		agreeButton.className = 'ont-custom-btn'
		this.setTextContent(agreeButton, texts[agreeButton.id])

		const manageSettings = document.createElement('sm')
		manageSettings.id = 'cookie-accept__manage-settings'
		manageSettings.className =
			'ont-text-center ont-text-sm ont-text-neutral-500 ont-font-medium ont-py-2 ont-cursor-pointer hover:ont-text-neutral-700 ont-transition-all ont-duration-300'
		manageSettings.onclick = this.showCookieSettings.bind(this)
		this.setTextContent(manageSettings, texts[manageSettings.id])

		textContainer.appendChild(acceptHeading)
		textContainer.appendChild(acceptText1)
		textContainer.appendChild(acceptText2)
		textContainer.appendChild(agreeButton)
		textContainer.appendChild(manageSettings)

		cookieAccept.appendChild(textContainer)

		dialog.appendChild(cookieAccept)

		const cookieSettings = document.createElement('div')
		cookieSettings.id = 'cookie-settings'
		cookieSettings.className =
			'ont-hidden ont-p-4 ont-flex-col ont-justify-center ont-gap-2'

		const settingsHeading = document.createElement('h2')
		settingsHeading.className = 'ont-font-medium ont-text-3xl ont-tracking-wide'
		settingsHeading.id = 'cookie-settings__heading'
		this.setTextContent(settingsHeading, texts[settingsHeading.id])
		cookieSettings.appendChild(settingsHeading)

		const settingsIntro = document.createElement('p')
		settingsIntro.className = 'ont-my-4'
		settingsIntro.id = 'cookie-settings__intro'
		this.setTextContent(settingsIntro, texts[settingsIntro.id])
		cookieSettings.append(settingsIntro)

		const essentialCookies = this.createCookieCategory(
			texts['cookie-settings__subheading1'],
			texts['cookie-settings__description1'],
			1
		)
		cookieSettings.appendChild(essentialCookies)

		const performanceCookies = this.createCookieCategory(
			texts['cookie-settings__subheading2'],
			texts['cookie-settings__description2'],
			2
		)
		cookieSettings.appendChild(performanceCookies)

		const advertisingCookies = this.createCookieCategory(
			texts['cookie-settings__subheading3'],
			texts['cookie-settings__description3'],
			3
		)
		cookieSettings.appendChild(advertisingCookies)

		const savePreferencesButton = document.createElement('button')
		savePreferencesButton.type = 'button'
		savePreferencesButton.id = 'cookie-settings__preference-button'
		savePreferencesButton.className =
			'ont-flex ont-w-fit ont-items-start ont-p-2 ont-font-medium ont-transition-all ont-duration-300 primary-color ont-text-white ont-rounded-xl hover:ont-brightness-75'
		savePreferencesButton.onclick = this.savePreferences
		this.setTextContent(savePreferencesButton, texts[savePreferencesButton.id])

		const policyLink = document.createElement('a')
		policyLink.id = 'cookie-settings__policy-link'
		this.setHyperlinkDestination(policyLink, this.policy)
		policyLink.className =
			'ont-text-sm ont-text-neutral-500 ont-font-medium hover:ont-text-neutral-700 ont-transition-all ont-duration-300'
		this.setTextContent(policyLink, texts[policyLink.id])
		const preferencesContainer = document.createElement('div')
		preferencesContainer.className =
			'ont-flex ont-items-center ont-justify-between ont-w-full'
		preferencesContainer.appendChild(savePreferencesButton)
		preferencesContainer.appendChild(policyLink)

		const backToBanner = document.createElement('button')
		backToBanner.type = 'button'
		backToBanner.id = 'cookie-settings__back-to-banner'
		backToBanner.className =
			'ont-text-sm ont-text-neutral-500 ont-font-medium hover:ont-text-neutral-700 ont-transition-all ont-duration-300 ont-cursor-pointer ont-tracking-wider ont-w-fit ont-bg-white'
		backToBanner.onclick = () => {
			cookieAccept.classList.remove('ont-hidden')
			cookieSettings.classList.add('ont-hidden')
		}
		this.setTextContent(backToBanner, texts[backToBanner.id])
		cookieSettings.appendChild(backToBanner)

		cookieSettings.appendChild(preferencesContainer)
		dialog.appendChild(cookieSettings)

		return dialog
	}

	createCookieIcon() {
		const cookieIcon = document.createElement('div')
		cookieIcon.id = 'cookie-preference-icon'
		cookieIcon.className =
			'ont-flex ont-hidden ont-items-center ont-justify-center ont-h-12 ont-w-12 ont-fixed ont-bottom-[3%] ont-left-[3%] ont-rounded-full ont-bg-white ont-border ont-border-slate-300 hover:ont-bg-blue-200 ont-group hover:primary-color ont-transition-all ont-duration-300 ont-z-[9999] ont-cursor-pointer'

		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		svg.setAttribute('width', '24')
		svg.setAttribute('height', '24')
		svg.setAttribute('viewBox', '0 0 24 24')
		svg.setAttribute('fill', 'none')
		svg.setAttribute('stroke', 'currentColor')
		svg.setAttribute('stroke-width', '2')
		svg.setAttribute('stroke-linecap', 'round')
		svg.setAttribute('stroke-linejoin', 'round')
		svg.classList.add =
			'lucide lucide-cookie ont-stroke-blue-600 group-hover:ont-stroke-blue-800'

		const paths = [
			'M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5',
			'M8.5 8.5v.01',
			'M16 15.5v.01',
			'M12 12v.01',
			'M11 17v.01',
			'M7 14v.01',
		]

		paths.forEach(d => {
			const path = document.createElementNS(
				'http://www.w3.org/2000/svg',
				'path'
			)
			path.setAttribute('d', d)
			svg.appendChild(path)
		})

		cookieIcon.appendChild(svg)

		return cookieIcon
	}

	createCookieCategory(title, description, idSuffix) {
		const categoryContainer = document.createElement('div')
		categoryContainer.className =
			'ont-flex ont-items-center ont-justify-between ont-gap-2'

		const details = document.createElement('details')
		details.className =
			'[&_svg]:open:ont-rotate-180 ont-transition-all ont-duration-300 ont-w-full'
		categoryContainer.appendChild(details)

		const summary = document.createElement('summary')
		summary.className =
			'ont-flex ont-items-center ont-justify-between ont-w-full ont-cursor-pointer ont-list-none ont-text-sm ont-leading-6 ont-text-slate-900 ont-font-semibold ont-select-none'
		details.appendChild(summary)

		const summaryContent = document.createElement('div')
		summaryContent.className =
			'ont-flex ont-items-center ont-justify-center ont-gap-4'
		summaryContent.id = `cookie-settings__subheading${idSuffix}`
		summary.appendChild(summaryContent)

		this.setTextContent(summaryContent, title)

		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		svg.setAttribute(
			'class',
			'ont-rotate-0 ont-transform ont-text-blue-700 ont-transition-all ont-duration-500'
		)
		svg.setAttribute('fill', 'none')
		svg.setAttribute('viewBox', '0 0 24 24')
		svg.setAttribute('height', '20')
		svg.setAttribute('width', '20')
		svg.setAttribute('stroke', 'currentColor')
		svg.setAttribute('stroke-linecap', 'round')
		svg.setAttribute('stroke-linejoin', 'round')
		svg.setAttribute('stroke-width', '2')
		const polyline = document.createElementNS(
			'http://www.w3.org/2000/svg',
			'polyline'
		)
		polyline.setAttribute('points', '6 9 12 15 18 9')
		svg.appendChild(polyline)
		summaryContent.appendChild(svg)

		const label = document.createElement('label')
		label.className =
			'ont-inline-flex ont-relative ont-items-center ont-cursor-pointer'
		summary.appendChild(label)

		const input = document.createElement('input')
		input.type = 'checkbox'
		input.id = `toggleCookies${idSuffix}`
		if (idSuffix === 1) input.checked = true // Include essential cookies by default
		input.className = 'ont-sr-only ont-peer'
		label.appendChild(input)

		const slider = document.createElement('div')
		slider.className =
			'ont-w-11 ont-h-6 ont-bg-gray-200 ont-rounded-full peer peer-focus:ont-ring-4 peer-focus:ont-ring-blue-300 dark:peer-focus:ont-ring-blue-800 peer-checked:after:ont-translate-x-full peer-checked:after:ont-border-white after:ont-content-[""] after:ont-absolute after:ont-top-[2px] after:ont-left-[2px] after:ont-bg-white after:ont-border-gray-300 after:ont-border after:ont-rounded-full after:ont-h-5 after:ont-w-5 after:ont-transition-all dark:ont-border-gray-600 peer-checked:ont-bg-blue-600 ont-duration-300'
		label.appendChild(slider)

		const desc = document.createElement('p')
		desc.className = 'ont-text-sm ont-text-slate-600 ont-leading-6 ont-mt-2'
		desc.id = `cookie-settings__description${idSuffix}`
		this.setTextContent(desc, description)
		details.appendChild(desc)

		return categoryContainer
	}

	savePreferences() {
		const areEssentialCookiesAllowed =
			document.getElementById('toggleCookies1').checked === true
		const arePerformanceCookiesAllowed =
			document.getElementById('toggleCookies2').checked === true
		const areAdvertisingCookiesAllowed =
			document.getElementById('toggleCookies3').checked === true

		updateCookiePreferences(
			areEssentialCookiesAllowed,
			arePerformanceCookiesAllowed,
			areAdvertisingCookiesAllowed
		)
		document.getElementById('cookie-preference-icon').classList.remove('hidden')

		if (this.dialog) {
			this.closeModal()
			this.cookieIcon.classList.remove('ont-hidden')
		}
	}

	setupEventListeners() {
		const acceptBtn = this.dialog.querySelector('#cookie-accept__button')
		const manageSettingsBtn = this.dialog.querySelector(
			'#cookie-accept__manage-settings'
		)
		const savePreferencesBtn = this.dialog.querySelector(
			'#cookie-settings__preference-button'
		)

		acceptBtn.addEventListener('click', () => this.handleAcceptClick())
		manageSettingsBtn.addEventListener('click', () => this.showCookieSettings())
		savePreferencesBtn.addEventListener('click', () => this.savePreferences())

		this.cookieIcon.addEventListener('click', () => this.showModal())
	}

	handleAcceptClick() {
		setCookie('_cookies_accepted', 'true', 1)
		this.closeModal()
		this.cookieIcon.classList.remove('ont-hidden')
	}

	showCookieSettings() {
		const cookieAcceptElement = document.getElementById('cookie-accept')
		cookieAcceptElement.classList.add('ont-hidden')

		const cookieSettings = document.getElementById('cookie-settings')

		cookieSettings.classList.remove('ont-hidden')
		cookieSettings.classList.add('ont-flex')

		this.dialog.showModal()
		this.dialog.classList.remove('ont-hidden')
	}

	showModal() {
		this.dialog.showModal()
		this.dialog.classList.remove('fade-out')
		this.dialog.classList.remove('ont-hidden')
		this.dialog.classList.add('fade-in')
	}

	closeModal() {
		this.dialog.close()
		this.dialog.classList.remove('fade-in')
		this.dialog.classList.add('fade-out')
		setTimeout(() => {
			this.dialog.classList.add('ont-hidden')
		}, 200)
	}

	setupObserver() {
		const observer = new IntersectionObserver(
			entries => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						this.dialog.classList.remove('ont-opacity-0')
						this.dialog.classList.add('ont-opacity-100')
					} else {
						this.dialog.classList.remove('ont-opacity-100')
						this.dialog.classList.add('ont-opacity-0')
					}
				})
			},
			{
				threshold: 0.1,
			}
		)

		observer.observe(this.dialog)
	}
}

const currentUserType = cookieManager.get('_usertype')

if (!getUserType()) {
	setCookie('_usertype', 'visitor', DAY / 10)
}

const PAYLOAD_DATA = {
	user_type: cookieManager.get('_usertype'),
}

const token = encodeData(PAYLOAD_DATA)
setCookie('_usertoken', token, DAY / 10)
