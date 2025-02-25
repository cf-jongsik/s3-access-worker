import { S3Client, GetObjectCommand, GetObjectCommandInput } from '@aws-sdk/client-s3';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		let cache = caches.default;
		const cached = await cache.match(request);

		if (cached) {
			if (env.DEBUG) console.debug('Cache hit');
			return cached;
		}
		if (env.DEBUG) console.debug('Cache miss');

		const url = new URL(request.url);
		const key = url.pathname.slice(1);

		if (env.DEBUG) console.debug('Key:', key);

		const { S3_ACCESS_ID, S3_SECRET_KEY, S3_BUCKET_NAME, S3_BUCKET_REGION } = env;
		if (!S3_ACCESS_ID || !S3_SECRET_KEY) {
			return new Response('ACCESS ID/KEY are required', { status: 500 });
		}
		if (!S3_BUCKET_NAME) {
			return new Response('Bucket name is required', { status: 500 });
		}
		if (!S3_BUCKET_REGION) {
			return new Response('Bucket region is required', { status: 500 });
		}

		const client = new S3Client({
			region: S3_BUCKET_REGION,
			credentials: { accessKeyId: S3_ACCESS_ID, secretAccessKey: S3_SECRET_KEY },
		});

		const params = {
			Bucket: S3_BUCKET_NAME,
			Key: key || 'index.html',
		} satisfies GetObjectCommandInput;

		const command = new GetObjectCommand(params);

		try {
			const data = await client.send(command);
			if (!data) return new Response('', { status: 404, statusText: 'Not Found' });
			const headers = new Headers();
			if (data.ContentType) {
				headers.set('content-type', data.ContentType);
			}
			if (data.ContentLength) {
				headers.set('content-length', data.ContentLength.toString());
			}
			if (data.ContentEncoding) {
				headers.set('content-encoding', data.ContentEncoding);
			}
			if (data.LastModified) {
				headers.set('last-modified', data.LastModified.toUTCString());
			}
			if (data.CacheControl) {
				headers.set('cache-control', data.CacheControl);
			}
			if (data.ContentLanguage) {
				headers.set('content-language', data.ContentLanguage);
			}
			headers.append('Cache-Control', 's-maxage=3600');
			const response = new Response(data.Body?.transformToWebStream(), { headers });
			ctx.waitUntil(cache.put(request, response.clone()));
			return response;
		} catch (error) {
			console.error(error);
			return new Response('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
		}
	},
};
