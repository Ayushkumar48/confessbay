import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { Google } from 'arctic';
import {
	AWS_ACCESS_KEY_ID,
	AWS_REGION,
	AWS_SECRET_ACCESS_KEY,
	DATABASE_URL,
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET
} from '$env/static/private';
import { dev } from '$app/environment';
import { S3Client } from '@aws-sdk/client-s3';
if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(DATABASE_URL);

export const db = drizzle(client, { schema });

export const googleAuth = new Google(
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	dev
		? 'http://localhost:5173/login/google/callback'
		: 'https://zeronoticed.vercel.app/login/google/callback'
);

export const s3Client = new S3Client({
	region: AWS_REGION,
	credentials: {
		accessKeyId: AWS_ACCESS_KEY_ID,
		secretAccessKey: AWS_SECRET_ACCESS_KEY
	}
});
