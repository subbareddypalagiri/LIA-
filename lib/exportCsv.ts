import type { GymMember, OwnerProfile } from './supabase'

/**
 * Cleanly escape CSV cell values according to RFC 4180
 */
function escapeCsvCell(value: string | number | undefined | null): string {
	if (value === undefined || value === null) return '""'
	const stringValue = String(value)
	if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
		return `"${stringValue.replace(/"/g, '""')}"`
	}
	return `"${stringValue}"`
}

/**
 * Extract numerical fee amount from plan string (e.g. "1 Month Kickstart (₹1,500)" -> 1500)
 */
function parsePlanAmount(plan: string): number {
	const match = plan.match(/₹([\d,]+)/)
	if (match) {
		return parseInt(match[1].replace(/,/g, ''), 10) || 1500
	}
	if (plan.includes('1,500') || plan.toLowerCase().includes('1 month')) return 1500
	if (plan.includes('4,000') || plan.toLowerCase().includes('3 month')) return 4000
	if (plan.includes('7,000') || plan.toLowerCase().includes('6 month')) return 7000
	if (plan.includes('12,000') || plan.toLowerCase().includes('year')) return 12000
	if (plan.toLowerCase().includes('personal training')) return 6000
	return 1500
}

/**
 * Calculate days left
 */
function getDaysLeft(expiryDate: string): number {
	const now = new Date()
	now.setHours(0, 0, 0, 0)
	const exp = new Date(expiryDate)
	exp.setHours(0, 0, 0, 0)
	const diff = exp.getTime() - now.getTime()
	return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * Generate and download formatted CSV for Gym Members and Revenue Ledger
 */
export function exportMembersToCsv(members: GymMember[], ownerProfile?: OwnerProfile) {
	const today = new Date().toISOString().split('T')[0]
	const gymName = ownerProfile?.gymName || 'LIA Iron Club'
	const ownerName = ownerProfile?.ownerName || 'Palagiri Subbareddy'

	const rows: string[] = []

	// Header Meta Information
	rows.push(`${escapeCsvCell('ORGANIZATION')},${escapeCsvCell(gymName)}`)
	rows.push(`${escapeCsvCell('OWNER')},${escapeCsvCell(ownerName)}`)
	rows.push(`${escapeCsvCell('REPORT')},${escapeCsvCell('Gym Athlete Roster & Revenue Ledger')}`)
	rows.push(`${escapeCsvCell('GENERATED AT')},${escapeCsvCell(new Date().toLocaleString())}`)
	rows.push('') // Empty row separator

	// Column Headers
	const headers = [
		'Member ID',
		'Athlete Name',
		'Phone Number',
		'Email Address',
		'Membership Plan',
		'Plan Fee (INR)',
		'Start Date',
		'Expiry Date',
		'Membership Status',
		'Days Remaining',
		'Last Alert Dispatched'
	]
	rows.push(headers.map(escapeCsvCell).join(','))

	let totalRevenue = 0
	let activeCount = 0
	let expiringCount = 0
	let expiredCount = 0

	// Member Rows
	members.forEach((m) => {
		const fee = parsePlanAmount(m.plan)
		totalRevenue += fee
		const daysLeft = getDaysLeft(m.expiryDate)

		let status = 'Active'
		if (daysLeft < 0) {
			status = 'Expired'
			expiredCount++
		} else if (daysLeft <= 3) {
			status = 'Due Soon (≤3d)'
			expiringCount++
		} else {
			activeCount++
		}

		const row = [
			m.id,
			m.name,
			m.phone || 'N/A',
			m.email,
			m.plan,
			fee,
			m.startDate || today,
			m.expiryDate,
			status,
			daysLeft,
			m.lastNotified || 'Never'
		]
		rows.push(row.map(escapeCsvCell).join(','))
	})

	// Summary Ledger Section
	rows.push('')
	rows.push(`${escapeCsvCell('--- SUMMARY LEDGER ---')}`)
	rows.push(`${escapeCsvCell('Total Enrolled Lifters')},${escapeCsvCell(members.length)}`)
	rows.push(`${escapeCsvCell('Active Passes')},${escapeCsvCell(activeCount)}`)
	rows.push(`${escapeCsvCell('Due Soon (Next 3 Days)')},${escapeCsvCell(expiringCount)}`)
	rows.push(`${escapeCsvCell('Expired Memberships')},${escapeCsvCell(expiredCount)}`)
	rows.push(`${escapeCsvCell('Total Enrolled Revenue (INR)')},${escapeCsvCell(`₹${totalRevenue.toLocaleString('en-IN')}`)}`)
	if (ownerProfile?.monthlyTarget) {
		rows.push(`${escapeCsvCell('Monthly Revenue Target (INR)')},${escapeCsvCell(`₹${ownerProfile.monthlyTarget.toLocaleString('en-IN')}`)}`)
	}

	// Add UTF-8 BOM so Microsoft Excel reads special characters & INR properly
	const csvContent = '\uFEFF' + rows.join('\r\n')
	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
	const url = URL.createObjectURL(blob)

	const link = document.createElement('a')
	link.href = url
	link.setAttribute('download', `LIA_Iron_Club_Members_Ledger_${today}.csv`)
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
	URL.revokeObjectURL(url)
}
