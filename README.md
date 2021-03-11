# Thumbnail generator

Thumbnail-generator is a JSON-based REST API service which resizes images into 100x100px thumbnails.

## Running the server in docker

```properties
docker-compose up -d
```
---
## Testing the service
### On your pc
Database and queue are mocked which means it doesnt have to run in docker
```properties
npm install
npm run test
```
### In docker
Database and queue are mocked which means it doesnt have to run in docker
```properties
docker-compose build api
docker run -rm thumbnail-api npm run test
```
or
```properties
docker-compose up -d
docker exec -it {api container id} npm run test
```
### For development
You can run `npm run test:watch` for an instant feedback loop


---
## Notes for future
### Image upload
- Does validation cover all cases? File size 20mb, jpg, jpeg and png allowed.
- Consider base64 input vs file
- Should there be validation on file size or pixel dimensions?

### Storage
- Should use AWS's official library instead of minio for better support and developer familiarity
- Use S3 instead of a self hosted solution in production
- UUID's are very unlikely to have duplicates, but be safe by adding a check before saving files.

### Resizing
- Investigate better cropping/stretching methods instead of using fill (which will not preserve aspect ratio)
- Investigate best practices for handling streams vs buffers depending on use case

### Fetching the result
- Presigned URL's currently expire after 7 days (default). Tie to user authentication? Unlimited number of downloads? 
- Connect to cloudfront as a CDN for better performance
- Set up a proxy so that users dont have to set s3 vhost for minio presigned urls to work

### Unit tests
- Need to add end-to-end tests, which requires a synchronous mode or deeper mocking of queue library agenda
- Need to add tests for more types/extensions of images, and also files that exceed the maximum size
- Need to add tests to cover at the function level
- Investigate a better solution for test files