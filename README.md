# ghost-gs
Ghost Google Storage

`ghost-gs` is a Google Storage extension for Ghost Blogging platform.

##Configuration

 - Create a bucket, and generate IAM credential creation from Google Cloud Console.
 - Add the credentials file (`your_credential.json`) to your Ghost project.
 - Ensure you add the storage provider to your `config.js`

##Storage config

```
// Add this to your production: {} or development: {} configs (or both)
  "storage": {
    "active": "ghost-gs",
    "ghost-gs": {
      projectId: '',
          keyFilename: path.join(__dirname, './key.json'),
          bucket: 'bucket name',
          hostname: 'https://yourcdn.yourdomain.com/' // OPTIONAL: This is only required if you use a different download URL to the upload URL
    }
},
```
