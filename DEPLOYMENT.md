# Deployment Guide - Google Cloud Run

This guide details how to deploy the Project Collaboration App to Google Cloud Run.

## Prerequisites

1.  **Google Cloud Platform (GCP) Account**: Ensure you have an active project with billing enabled.
2.  **Google Cloud CLI (`gcloud`)**: [Install and configure](https://cloud.google.com/sdk/docs/install) the CLI.
3.  **Docker**: Installed and running locally for building images.

## 1. Local Verification (Optional but Recommended)

Before deploying, verify the container works locally.

1.  **Build the image**:
    ```bash
    docker build -t project-collab-app .
    ```

2.  **Run the container**:
    ```bash
    docker run -p 8000:8000 \
      -e PORT=8000 \
      -e JWT_SECRET=test_secret \
      -e GOOGLE_CLIENT_ID=test_id \
      -e DATABASE_URL=postgres://user:pass@host:5432/db \
      project-collab-app
    ```
    *Note: You will need a valid `DATABASE_URL` for the server to start completely.*

3.  Visit `http://localhost:8000` to see the app.

## 2. Google Cloud Setup

1.  **Login to gcloud**:
    ```bash
    gcloud auth login
    gcloud config set project [YOUR_PROJECT_ID]
    ```

2.  **Enable required services**:
    ```bash
    gcloud services enable run.googleapis.com containerregistry.googleapis.com cloudbuild.googleapis.com
    ```

## 3. Deploy to Cloud Run

We will use Google Cloud Build to build the image and deploy it to Cloud Run in one step (or you can push to Artifact Registry manually).

### Option A: Direct Deploy from Source (Easiest)

```bash
gcloud run deploy project-collab-app \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-env-vars CLIENT_URL=https://[YOUR-CLOUD-RUN-URL].run.app
```

*Note: You will need to update `CLIENT_URL` after the first deployment generates the URL, or set it to `*` temporarily.*

### Option B: Build then Deploy (More Control)

1.  **Build and submit to Container Registry (or Artifact Registry)**:
    ```bash
    gcloud builds submit --tag gcr.io/[YOUR_PROJECT_ID]/project-collab-app
    ```

2.  **Deploy the image**:
    ```bash
    gcloud run deploy project-collab-app \
      --image gcr.io/red-seeker-478803-g0/project-collab-app \
      --platform managed \
      --region us-central1 \
      --allow-unauthenticated
    ```

## 4. Configuration & Secrets

You **MUST** set the following environment variables in Cloud Run for the app to function:

-   `JWT_SECRET`: A strong random string.
-   `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID.
-   `DATABASE_URL`: Connection string to your production PostgreSQL database (e.g., Cloud SQL).
-   `CLIENT_URL`: The URL of your deployed Cloud Run service (e.g., `https://project-collab-app-xyz.a.run.app`).

To set these after deployment:

```bash
gcloud run services update project-collab-app \
  --set-env-vars JWT_SECRET=...,GOOGLE_CLIENT_ID=...,DATABASE_URL=...,CLIENT_URL=...
```

## 5. Database (Cloud SQL)

For a production database, it is recommended to use **Cloud SQL for PostgreSQL**.

1.  Create a Cloud SQL instance.
2.  Create a database and user.
3.  Connect Cloud Run to Cloud SQL:
    -   Add the Cloud SQL Client role to the Cloud Run service account.
    -   Use the instance connection name in the deployment command:
        `--add-cloudsql-instances [INSTANCE_CONNECTION_NAME]`
