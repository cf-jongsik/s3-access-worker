import { S3Client, GetObjectCommand, GetObjectCommandInput } from '@aws-sdk/client-s3';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		ctx.passThroughOnException();
		const url = new URL(request.url);
		const key = url.pathname.slice(1);

		const client = new S3Client({
			bucketEndpoint: true,
			region: 'auto',
			credentials: { accessKeyId: env.accessKeyId, secretAccessKey: env.secretAccessKey },
		});

		const params = {
			Bucket: env.bucketURL,
			Key: key || 'index.html',
		} satisfies GetObjectCommandInput;

		const command = new GetObjectCommand(params);

		try {
			const data = await client.send(command);
			if (!data) return Response.redirect(url.origin, 302);
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
			return new Response(data.Body?.transformToWebStream(), { headers });
		} catch (error) {
			return Response.redirect(url.origin, 302);
		}
	},
};
