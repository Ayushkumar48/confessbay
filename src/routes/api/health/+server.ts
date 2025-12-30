export function GET() {
	console.log('HEALTH HIT');
	return new Response(JSON.stringify({ ok: true }), {
		headers: { 'Content-Type': 'application/json' }
	});
}
