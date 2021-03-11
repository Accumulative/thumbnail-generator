interface Job {
  attrs: {
    data: unknown;
  };
}

interface ThumbnailJobData {
  _id: string;
  filename: string;
  originalFilename: string;
  status: string;
  thumbnailFilename: string;
}

interface ThumbnailJob extends Job {
  attrs: {
    data: ThumbnailJobData;
  };
}

export type { Job, ThumbnailJob, ThumbnailJobData };
