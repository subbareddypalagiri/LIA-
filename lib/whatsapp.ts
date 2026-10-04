'use no memo'

export interface WhatsAppReminderParams {
	memberName: string
	planName: string
	expiryDate: string
	daysLeft: number
	amount: number
	upiId: string
	ownerName: string
	ownerPhone: string
	gymName: string
}

/**
 * Sanitizes phone numbers for WhatsApp wa.me links.
 * E.g.: "+91 98765 43210" -> "919876543210"
 * "9876543210" (10 digits) -> "919876543210" (defaults to India +91)
 */
export function cleanPhoneNumber(rawPhone: string): string {
	const digits = rawPhone.replace(/\D/g, '')
	if (digits.length === 10) {
		return `91${digits}`
	}
	return digits
}

/**
 * Generates an authoritative, aesthetic WhatsApp notification message formatted with markdown.
 */
export function formatWhatsAppReminder(params: WhatsAppReminderParams): string {
	const {
		memberName,
		planName,
		expiryDate,
		daysLeft,
		amount,
		upiId,
		ownerName,
		ownerPhone,
		gymName
	} = params

	const isExpired = daysLeft < 0
	const urgencyText = isExpired
		? `has expired (ended on ${expiryDate})`
		: daysLeft === 0
		? `expires *TODAY* (${expiryDate})`
		: `expires in *${daysLeft} days* (on ${expiryDate})`

	return `*${gymName.toUpperCase()} — MEMBERSHIP NOTICE*

Dear *${memberName}*,

This is an official courtesy update regarding your athlete enrollment.

Your *${planName}* membership at ${gymName} ${urgencyText}.

To ensure uninterrupted floor access, heavy iron stations, and personal training momentum, kindly clear your renewal dues:

💰 *Renewal Dues:* ₹${amount.toLocaleString('en-IN')}
💳 *Gym UPI ID:* \`${upiId}\`

*Payment Methods:*
1. Pay directly to our UPI ID via PhonePe / Google Pay / Paytm.
2. Scan the official gym QR Code at the front desk or in your Digital Athlete Pass.

Kindly reply to this message with a screenshot of the payment receipt once completed.

Stay disciplined and keep lifting heavy!

—
*${ownerName}*
Founder & Head Coach, ${gymName}
📞 ${ownerPhone}`
}

/**
 * Generates official WhatsApp web / app redirect link.
 */
export function getWhatsAppUrl(phone: string, message: string): string {
	const cleanPhone = cleanPhoneNumber(phone)
	const encodedMsg = encodeURIComponent(message)
	return `https://wa.me/${cleanPhone}?text=${encodedMsg}`
}
