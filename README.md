# Cogent Labs - Thumbnail Generator API

Thumbnail-generator is a JSON-based REST API service which resizes images into 100x100px thumbnails.

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

## Running the service

```properties
docker-compose up -d
```

- API: runs at http://localhost:3000
- Minio: runs at http://localhost:9000 (Credentials in `local.env`)

---
## Testing the service
### On your pc

*This service requires NodeJS version 14.18.0+*

Database and queue are mocked which means it doesnt have to run in docker
```properties
npm install
npm run test
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

## Notes for deployment

- The application as a whole (all docker images) requires about 2Gb of memory, 2 full CPUs, and 20GB of disk space to run safely.

