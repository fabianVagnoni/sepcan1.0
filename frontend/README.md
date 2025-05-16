# Service Company Frontend

This is the frontend for the Service Company application. It provides a user-friendly interface for employees to submit vehicle and job forms, and for administrators to query the data.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

## About the Background Image

The application uses a background image located at:
```
src/assets/background_pic.jpg
```

The background image has been configured with:
- A slight blur effect (5px) to make it less distracting
- Reduced opacity (70%) to ensure content readability
- Full-screen coverage with proper centering

If you need to change the background image:
1. Replace the file at this location with your own image
2. Make sure to keep the same filename or update the import in `src/App.tsx`
3. Use a high-resolution image (at least 1920x1080) for best quality
4. Keep the file size reasonable for faster loading

**Note**: When using Vite, media files in the `src/assets` directory are processed by the bundler, which is why we import the image directly in the code.

## Features

- **Vehicle Form**: Submit information about vehicles before meeting clients
- **Job Form**: Submit information about completed jobs
- **Query Page**: Query and download data with time-based filtering
- **Responsive Design**: Works on both desktop and mobile devices
- **Background Image**: Subtle background image with blur effect for better readability

## Building for Production

To build the application for production:

```bash
npm run build
```

The built files will be in the `dist` directory, ready to be deployed to a static hosting service like Netlify.

## Customizing the Background

If you want to change the background or its appearance:

- To use a different image: Replace the file at `src/assets/background_pic.jpg`
- To adjust the blur effect: Modify the `filter: 'blur(5px)'` value in `src/App.tsx`
- To adjust the opacity: Modify the `opacity: 0.7` value in `src/App.tsx`
- To adjust the content opacity: Modify the `background-color` values in `src/App.css`
