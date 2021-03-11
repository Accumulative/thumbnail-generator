# Thumbnail generator

Thumbnail-generator is a JSON-based REST API service which resizes images into 100x100px thumbnails.

## Running the server

```properties
npm install
npm run build
npm start
```

## Running the server in docker

```properties
docker-compose up -d
```

## Notes for future
### Image upload
- Does validation cover all cases? File size 20mb, jpg, jpeg and png allowed.
- Consider base64 input vs file
- Should there be validation on file size or pixel dimensions?