# AI Assistant Frontend

## Environment Variables

Create a `.env.local` file in the root directory:
```bash
NEXT_PUBLIC_API_URL=your_backend_api_url
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_APP_URL=your_frontend_url
NEXT_PUBLIC_SOCKET_URL=your_socket_url
```

## Local Development
```bash
npm install
npm run dev
```

## Deployment to Vercel

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Import to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure environment variables in Vercel dashboard

### Step 3: Set Environment Variables in Vercel
Go to your project settings → Environment Variables and add:
- `NEXT_PUBLIC_API_URL` (your production backend URL)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_APP_URL` (your Vercel app URL)
- `NEXT_PUBLIC_SOCKET_URL`

### Step 4: Deploy
Vercel will automatically deploy on every push to main branch.

## Production URLs
- Frontend: `https://your-app.vercel.app`
- Backend: Your backend API URL

## Important Notes
- Make sure your backend API has CORS configured for your Vercel domain
- Update Google OAuth redirect URIs to include your Vercel URL