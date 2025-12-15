// src/scripts/seed-colleges.ts
import { db } from '../lib/server/db/core.js';
import { colleges } from '../lib/shared/index.js';
import crypto from 'crypto';

const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');
const MAX_RETRIES = 3;
const DELAY_MS = 1500;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, attempt = 1): Promise<any[]> {
	try {
		const res = await fetch(url);

		if (!res.ok) {
			throw new Error(`HTTP ${res.status}`);
		}

		return await res.json();
	} catch (err) {
		if (attempt >= MAX_RETRIES) {
			console.error(`❌ Failed after ${attempt} attempts`);
			throw err;
		}

		console.warn(`⚠️ Retry ${attempt}/${MAX_RETRIES}`);
		await sleep(2000);
		return fetchWithRetry(url, attempt + 1);
	}
}

async function seedUS() {
	for (const letter of LETTERS) {
		console.log(`Fetching US (${letter})`);

		try {
			const url = `http://universities.hipolabs.com/search?country=United%20States&name=${letter}`;
			const data = await fetchWithRetry(url);

			const values = data
				.filter((u: any) => u.domains?.length)
				.map((u: any) => ({
					id: crypto.randomUUID(),
					name: u.name.trim(),
					domain: `@${u.domains[0].toLowerCase()}`,
					city: null,
					state: u['state-province'] ?? null
				}));

			await db.insert(colleges).values(values).onConflictDoNothing();

			console.log(`Inserted ${values.length}`);
		} catch (err) {
			console.error(`⏭️ Skipping letter ${letter}`);
		}

		// IMPORTANT: slow down
		await sleep(DELAY_MS);
	}
}

seedUS()
	.then(() => {
		console.log('✅ US colleges seeding finished');
		process.exit(0);
	})
	.catch((err) => {
		console.error('🔥 Fatal error', err);
		process.exit(1);
	});
