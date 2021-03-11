# Thumbnail generator

Thumbnail-generator is a JSON-based REST API service which resizes images into 100x100px thumbnails.

## Running the server in docker

```properties
docker-compose up -d
```

## Notes for future
### Image upload
- Does validation cover all cases? File size 20mb, jpg, jpeg and png allowed.
- Consider base64 input vs file
- Should there be validation on file size or pixel dimensions?

### Storage
- Should use AWS's official library instead of minio for better support and developer familiarity
- Use S3 instead of a self hosted solution in production
- UUID's are very unlikely to have duplicates, but be safe by adding a check before saving files.