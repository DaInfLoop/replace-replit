import type { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

const PUBKEY = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEv+0QT2+9KdAHZMXROxnLmfE9qkry
1W4bieh/LIyXyl9v2aexV8hef2iMaYmjz9yji2Iae1/sgiywvwflRD5O9Q==
-----END PUBLIC KEY-----
`;

export type Options = {
	exposeAs?: string;
};

export function express(
	opts?: Options,
): (req: Request, res: Response, next: NextFunction) => void {
	return function middleware(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
		if (req.path == '/__replauth') {
			const REPL_AUTH = req.query.token as string;

			let user;

			try {
				user = verify(REPL_AUTH, PUBKEY);
			} catch (err) {
				return res.status(400).send('bad jwt');
			}

			return res
			.cookie('REPL_AUTH', REPL_AUTH)
			.status(304)
			.redirect(req.query.redirect);
		} else if (req.path == '/__replauthuser') {
			const cookies: { [key: string]: string } = Object.fromEntries(
				req.headers.cookie.split(';').map((x) => {
					const a = x.trim().split('=');
					return [a.shift(), a.join('=')];
				}),
			);

			const REPL_AUTH = cookies.REPL_AUTH;

			let user;

			try {
				user = verify(REPL_AUTH, PUBKEY);
			} catch (err) {
				return res.send('User is not logged in');
			}

			return res.json({
				id: user.sub,
				name: user.name,
				bio: user.bio,
				url: user.url,
				profileImage: user.profile_image,
				roles: user.roles.split(','),
				teams: user.teams.split(','),
			});
		}

		if(!req.headers.cookie){
			return next();
		}

		const cookies: { [key: string]: string } = Object.fromEntries(
			req.headers.cookie.split(';').map((x) => {
				const a = x.trim().split('=');
				return [a.shift(), a.join('=')];
			}),
		);

		if(!cookies.REPL_AUTH) return next();

		const REPL_AUTH = cookies.REPL_AUTH;

		let user;

		try {
			user = verify(REPL_AUTH, PUBKEY);
		} catch (err) {
			return next(err);
		}

		req.headers['x-replit-user-name'] = user.name;
		req.headers['x-replit-user-id'] = user.sub;
		req.headers['x-replit-user-bio'] = user.bio;
		req.headers['x-replit-user-url'] = user.url;
		req.headers['x-replit-user-profile-image'] = user.profile_image;
		req.headers['x-replit-user-teams'] = user.teams;
		req.headers['x-replit-user-roles'] = user.roles;

		if (opts.exposeAs) {
			req[opts.exposeAs] = {
				id: user.sub,
				name: user.name,
				bio: user.bio,
				url: user.url,
				profileImage: user.profile_image,
				roles: user.roles.split(','),
				teams: user.teams.split(','),
			};
		}

		next();
	};
}

export { getUserInfo } from '@replit/repl-auth';
