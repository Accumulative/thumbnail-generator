# Thumbnail generator

Name: Kieran Burke

Description: Thumbnail-generator is a JSON-based REST API service which resizes images into 100x100px thumbnails.

## Overview 

### Libraries
- Minio - S3 compatible API, used with the minio docker image
- Agenda - Background jobs/queue, used due to being lightweight and works with mongo
- MongoDB - Choice for database as easy to use with node, and connects with Agenda
- Express - Most popular server libary for node with many compatible modules
- Sharp - Popular and extremely easy to use image library
- Jest - Unit test framework with wide support

### Architecture

The queue worker and API docker containers have been split for scalability, since they can be deployed independently. However, they share source code so we get all the benefits from using this approach. If the code used by both containers diverges in the future, or they don't share many dependencies then it may be good to reconsider this in the future.

The API docker container will create jobs via agenda, which will create a record in mongodb. Agenda running on the task servers will be periodically scanning for new jobs in the database, and process the thumbnails accordingly. This method means we can scale the number of workers easily.

Both parts store files in the minio/s3 bucket which would be serverless in production and therefore highly scalable. It also means there's no reason to worry about complexity from disk operations.

### Production

This service could already theorectically be deployed to ECS, though it'd be better to opt for managed services for file storage and database hosting. That would leave us with two services, the task and api containers, to deploy to something like Elastic Beanstalk. It can be scaled up without any consequences.

As for logging, it would be wise to integrate a logging and error reporting service such as CloudWatch, Sentry, Splunk, Zabbix etc. For now, failed jobs can be queried from the mongo database by looking for `status='failed'`, and there are console logs for most exceptions.

## Running the server in docker

- API: runs at http://localhost:3000
- Minio: runs at http://localhost:9000 (Credentials in `local.env`)

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
docker run --rm thumbnail-api npm run test
```
or
```properties
docker-compose up -d
docker exec -it {api container id} npm run test
```
### For development
You can run `npm run test:watch` for an instant feedback loop

### Notes
- `src/test/images` are images used as inputs for the unit tests and testing
- `src/test/images_temp` is a directory used by the unit tests

---
## REST API
### Postman collection
There is a postman collection for your convenience. Import `Thumbnail Generator.postman_collection.json` into postman to use it.

### Post image
`POST http://localhost:3000/thumbnail`

- Upload an image as `file` in the form-data

Curl example: 
```bash
curl --location --request POST 'http://localhost:3000/thumbnail' \
--form 'file=@"/path/to/image.png"'
```

### Get job status and result thumbnail as presigned url
`GET http://localhost:3000/thumbnail/:id`

- Gets the current status of the task, and if complete returns as presigned url
- The presigned url only works if you set a vhost for `s3` to `127.0.0.1` in `/etc/hosts`
- Use `job_id` from the previous POST API as the `id` url parameter

Curl example: 
```bash
curl --location --request GET 'http://localhost:3000/thumbnail/c7b4319e-b8f6-4ab0-8fb7-5b51db5c0c36'
```

### Get result thumbnail directly
Use `job_id` from the previous POST API as the `id` url parameter

`GET http://localhost:3000/thumbnail/:id/image`

Curl example: 
```bash
curl --location --request GET 'http://localhost:3000/thumbnail/c7b4319e-b8f6-4ab0-8fb7-5b51db5c0c36/image'
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
- Implement testing/handling for when S3/Database are not responding / down?

### General ideas
- It'd be trivial to allow the end-user to select the size of the thumbnail
- Add support for gifs
- Integrate a url shortener and public access for a compress-and-share service
- Integrate with cloudfront for lowest latancy / included cache