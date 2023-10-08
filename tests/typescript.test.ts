import { template } from '../dist/index.mjs';

test('Prints a welcome statement with username.', () => {
	expect(template(process.env.REPL_OWNER)).toBe(
		`Hello ${process.env.REPL_OWNER}. Nice to meet you.`,
	);
});
