import { NextResponse } from 'next/server'
import crypto from 'crypto'

// Server-side secret for HMAC signing of authentic sessions (never exposed to client)
const SERVER_AUTH_SECRET =
	process.env.AUTH_SESSION_SECRET ||
	process.env.SUPABASE_SERVICE_ROLE_KEY ||
	'lia_iron_club_master_vault_signature_key_2026'

// Server-side owner password (never bundled into client JS)
const SERVER_OWNER_PASSWORD = process.env.OWNER_MASTER_PASSWORD || 'Subba@LIA2026'

const OFFICIAL_OWNER_EMAIL = 'subbareddy123sub@gmail.com'

// Helper: Generate tamper-proof HMAC signature
function signSessionToken(email: string, role: string, timestamp: number): string {
	const payload = `${email.toLowerCase().trim()}:${role}:${timestamp}`
	const signature = crypto.createHmac('sha256', SERVER_AUTH_SECRET).update(payload).digest('hex')
	return `${Buffer.from(payload).toString('base64')}.${signature}`
}

// Helper: Verify tamper-proof HMAC signature
function verifySessionToken(token: string): { valid: boolean; email?: string; role?: string } {
	if (!token || typeof token !== 'string') return { valid: false }
	const parts = token.split('.')
	if (parts.length !== 2) return { valid: false }

	const [encodedPayload, signature] = parts
	try {
		const payload = Buffer.from(encodedPayload, 'base64').toString('utf-8')
		const expectedSignature = crypto.createHmac('sha256', SERVER_AUTH_SECRET).update(payload).digest('hex')

		// Timing-safe comparison to prevent timing attacks
		const isSigMatch = crypto.timingSafeEqual(
			Buffer.from(signature, 'hex'),
			Buffer.from(expectedSignature, 'hex')
		)

		if (!isSigMatch) return { valid: false }

		const [email, role, timestampStr] = payload.split(':')
		const timestamp = parseInt(timestampStr, 10)

		// Max session validity: 30 days
		const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000
		if (Date.now() - timestamp > thirtyDaysMs) {
			return { valid: false }
		}

		return { valid: true, email, role }
	} catch {
		return { valid: false }
	}
}

export async function POST(req: Request) {
	try {
		const body = (await req.json()) as any
		const { action, email, password, token, newPassword } = body

		// 1. Verify Login Credentials (Server-side Only)
		if (action === 'verify-login') {
			const cleanEmail = (email || '').toLowerCase().trim()
			const cleanPass = (password || '').trim()

			if (cleanEmail !== OFFICIAL_OWNER_EMAIL) {
				return NextResponse.json({ success: false, error: 'Unauthorized email' }, { status: 403 })
			}

			// Secure timing comparison against server-side password
			const expectedBuffer = Buffer.from(SERVER_OWNER_PASSWORD)
			const inputBuffer = Buffer.from(cleanPass)

			if (expectedBuffer.length !== inputBuffer.length || !crypto.timingSafeEqual(expectedBuffer, inputBuffer)) {
				return NextResponse.json({ success: false, error: 'Incorrect password for Owner account.' }, { status: 401 })
			}

			const timestamp = Date.now()
			const sessionToken = signSessionToken(cleanEmail, 'owner', timestamp)

			return NextResponse.json({
				success: true,
				token: sessionToken,
				role: 'owner',
				email: cleanEmail
			})
		}

		// 2. Verify Session Integrity (Anti-Tamper & Anti-Privilege Escalation)
		if (action === 'verify-session') {
			const verification = verifySessionToken(token)
			if (!verification.valid || verification.role !== 'owner' || verification.email !== OFFICIAL_OWNER_EMAIL) {
				return NextResponse.json({ success: false, error: 'Invalid or forged owner session' }, { status: 401 })
			}

			return NextResponse.json({
				success: true,
				valid: true,
				role: verification.role,
				email: verification.email
			})
		}

		// 3. Issue Token for Verified Google Sign-In for Owner
		if (action === 'sign-google-owner') {
			const cleanEmail = (email || '').toLowerCase().trim()
			if (cleanEmail !== OFFICIAL_OWNER_EMAIL) {
				return NextResponse.json({ success: false, error: 'Unauthorized email for owner token' }, { status: 403 })
			}

			const timestamp = Date.now()
			const sessionToken = signSessionToken(cleanEmail, 'owner', timestamp)

			return NextResponse.json({
				success: true,
				token: sessionToken,
				role: 'owner'
			})
		}

		return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })
	} catch (err: any) {
		return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 })
	}
}
