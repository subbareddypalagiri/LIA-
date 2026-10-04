'use no memo'

import QRCode from 'qrcode'

/**
 * Standard NPCI UPI Intent Link Generator:
 * Creates a standard UPI deep-link string compliant with PhonePe, Google Pay, Paytm, BHIM, Cred.
 */
export function generateUpiPayload(
	upiId: string,
	payeeName: string,
	amount?: number,
	note: string = 'LIA Iron Club Membership'
): string {
	const cleanUpi = upiId.trim()
	const cleanName = payeeName.trim()
	const cleanNote = note.trim()

	let payload = `upi://pay?pa=${encodeURIComponent(cleanUpi)}&pn=${encodeURIComponent(cleanName)}&cu=INR`

	if (amount && amount > 0) {
		payload += `&am=${amount.toFixed(2)}`
	}

	if (cleanNote) {
		payload += `&tn=${encodeURIComponent(cleanNote)}`
	}

	return payload
}

/**
 * Generates an ultra-crisp, high-contrast QR Matrix Data URL for instant scanning.
 */
export async function generateUpiQrDataUrl(
	upiId: string,
	payeeName: string,
	amount?: number,
	note: string = 'LIA Iron Club Membership'
): Promise<string> {
	const payload = generateUpiPayload(upiId, payeeName, amount, note)
	try {
		const dataUrl = await QRCode.toDataURL(payload, {
			width: 360,
			margin: 2,
			color: {
				dark: '#000000',
				light: '#ffffff'
			},
			errorCorrectionLevel: 'M'
		})
		return dataUrl
	} catch (err) {
		console.error('[UPI QR] Generation error:', err)
		return ''
	}
}

/**
 * Copy UPI ID with clipboard API
 */
export async function copyUpiIdToClipboard(upiId: string): Promise<boolean> {
	if (typeof window === 'undefined') return false
	try {
		await navigator.clipboard.writeText(upiId)
		return true
	} catch {
		return false
	}
}
