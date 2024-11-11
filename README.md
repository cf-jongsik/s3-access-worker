# S3 Access Worker

This Cloudflare Worker serves static assets directly from an AWS S3 bucket.

## How it Works

1. **Request:** When a request hits the worker, it extracts the requested file path from the URL.
2. **S3 Client:** It creates an S3 client using the provided AWS credentials and bucket information.
3. **GetObject:** It uses the S3 client to fetch the requested object (file) from the specified bucket.
4. **Response:**
   - If the object is found, it returns the object data as a response with appropriate headers.
   - If the object is not found, it redirects to the origin.

## Environment Variables

The worker requires the following environment variables:

- **`accessKeyId`:** Your AWS access key ID.
- **`secretAccessKey`:** Your AWS secret access key.
- **`bucketURL`:** The URL of your S3 bucket (e.g., `my-bucket.s3.amazonaws.com`).

## Deployment

```bash
1. update wrangler.toml, replace bucketURL with correct one
2. npm install
3. npx wrangler deploy
4. npx wrangler secret put accessKeyId  # your AWS access key ID
5. npx wrangler secret put secretAccessKey  # your AWS secret access key
```

## Notes

- You can customize the error handling and redirection behavior as needed.
- Consider using a Cloudflare CDN in front of your worker for improved performance and caching.
