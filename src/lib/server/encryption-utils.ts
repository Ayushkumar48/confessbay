import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = crypto.scryptSync(process.env.ENCRYPTION_KEY!, 'salt', 32);

export function encryptMessage(message: string) {
	const iv = crypto.randomBytes(12);
	const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
	let encrypted = cipher.update(message, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	const authTag = cipher.getAuthTag().toString('hex');
	return {
		encrypted,
		iv: iv.toString('hex'),
		authTag
	};
}

export function decryptMessage(
	encrypted: string | null,
	iv: string | null,
	authTag: string | null
) {
	if (!encrypted || !iv || !authTag) return '';
	const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, Buffer.from(iv, 'hex'));
	decipher.setAuthTag(Buffer.from(authTag, 'hex'));
	let decrypted = decipher.update(encrypted, 'hex', 'utf8');
	decrypted += decipher.final('utf8');
	return decrypted;
}
