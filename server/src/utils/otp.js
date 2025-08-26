import crypto from 'crypto';

export function generateNumericOtp(length = 6) {
	const digits = '0123456789';
	let otp = '';
	for (let i = 0; i < length; i += 1) {
		const rand = crypto.randomInt(0, digits.length);
		otp += digits[rand];
	}
	return otp;
}

export function hashOtp(code) {
	return crypto.createHash('sha256').update(String(code)).digest('hex');
}

export function nowSeconds() {
	return Math.floor(Date.now() / 1000);
}