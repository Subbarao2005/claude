# ✅ MELCHO DEPLOYMENT CHECKLIST

## 📋 Pre-Deployment (Run Locally)

- [ ] Backend tests passing: `cd server && npm test`
- [ ] Frontend tests passing: `cd client && npm test -- --run`
- [ ] All code changes committed
- [ ] No uncommitted files: `git status` (clean)

---

## 🚀 Step 1: Push to GitHub (5 min)

```bash
cd d:/New\ folder/melcho
git add .
git commit -m "fix: cors, auth guards, protected routes, product seed, node20 ci"
git push origin main
```

- [ ] Code pushed to main branch
- [ ] GitHub shows all commits
- [ ] GitHub Actions workflow started

---

## 🔧 Step 2: Configure Render (10 min)

1. Go to: https://render.com
2. Select: melcho-api service
3. Click: Settings → Environment

| Variable | Value |
|----------|-------|
| NODE_ENV | `production` |
| PORT | `5000` |
| MONGO_URI | `mongodb+srv://user:pass@cluster...` |
| JWT_SECRET | `[32+ random chars]` |
| RAZORPAY_KEY_ID | `rzp_test_xxxxx` |
| RAZORPAY_KEY_SECRET | `[your secret]` |
| ALLOWED_ORIGINS | `https://claude-eg03xzppt-subbarao-s-projects.vercel.app` |

- [ ] All 7 variables added
- [ ] "Save Changes" clicked
- [ ] Waiting for auto-redeploy (~2-3 min)
- [ ] Check Events tab: deployment completed

---

## 🔐 Step 3: GitHub Secrets (10 min)

Go to: https://github.com/Subbarao2005/claude
Settings → Secrets and variables → Actions → New repository secret

| Secret Name | Value |
|-------------|-------|
| RENDER_DEPLOY_HOOK | Get from Render dashboard → Deploy Hook |
| API_URL | `https://melcho-api.onrender.com` |
| APP_URL | `https://claude-eg03xzppt-subbarao-s-projects.vercel.app` |
| VERCEL_TOKEN | Get from https://vercel.com/account/tokens |
| VERCEL_ORG_ID | Get from Vercel project settings |
| VERCEL_PROJECT_ID | Get from Vercel project settings |
| ADMIN_EMAIL | `admin@melcho.com` |
| ADMIN_PASSWORD | Your admin password |

- [ ] RENDER_DEPLOY_HOOK added
- [ ] API_URL added
- [ ] APP_URL added
- [ ] VERCEL_TOKEN added
- [ ] VERCEL_ORG_ID added
- [ ] VERCEL_PROJECT_ID added
- [ ] ADMIN_EMAIL added
- [ ] ADMIN_PASSWORD added

---

## 🌱 Step 4: Seed Products (2 min)

```bash
cd server
MONGO_URI="mongodb+srv://user:pass@cluster...mongodb.net/melcho" npm run seed:products
```

**Expected output:**
```
✅ Successfully seeded 55 products!
```

- [ ] Seed script executed
- [ ] 55 products created in MongoDB
- [ ] No duplicate error

---

## ✅ Step 5: Verify Production (1 min)

```bash
cd tests
node verify-production.js
```

**Expected output:**
```
✅ PASS: Backend health endpoint
✅ PASS: Backend environment variables loaded
✅ PASS: Products API returns 200
✅ PASS: Products API has items
✅ PASS: CORS allows Vercel origin
✅ PASS: Register endpoint is reachable
✅ PASS: Login endpoint is reachable
✅ PASS: Frontend loads successfully
✅ PASS: Frontend has React app

✅ Passed: 9
❌ Failed: 0

🎉 All checks passed! Melcho is production-ready.
```

- [ ] All 9 tests passing
- [ ] No failures
- [ ] Success message shown

---

## 🧪 Optional: Run Full Test Suite

```bash
# Backend
cd server && npm test

# Frontend
cd ../client && npm test -- --run

# Phase 4 (after deployment)
cd ../tests && npm run test:smoke
```

- [ ] Backend: 11 tests passing
- [ ] Frontend: 2 tests passing
- [ ] Phase 4 smoke tests (if deployed)

---

## 🔍 Manual Verification (Optional)

### Test CORS
```bash
curl -H "Origin: https://claude-eg03xzppt-subbarao-s-projects.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     https://melcho-api.onrender.com/api/products
```

Should show CORS headers in response.

### Test Products API
```bash
curl https://melcho-api.onrender.com/api/products
```

Should return 200 with products array.

### Test Environment
```bash
curl https://melcho-api.onrender.com/api/debug
```

Should show all env vars as "SET".

---

## 📋 Final Validation

- [ ] Backend `/health` returns 200
- [ ] Backend `/api/debug` shows all vars SET
- [ ] Backend `/api/products` returns products
- [ ] Frontend loads without CORS errors
- [ ] Cannot access `/checkout` without login
- [ ] Login redirects back to checkout
- [ ] Products visible on menu page
- [ ] Cart functionality works
- [ ] Admin panel accessible with admin credentials
- [ ] GitHub Actions runs on push
- [ ] Verify script shows all 9 checks passing

---

## 🎉 Deployment Complete!

When all checks pass:

- ✅ CORS issue FIXED
- ✅ Products API working
- ✅ Authentication enforced
- ✅ Production deployed
- ✅ Tests passing
- ✅ CI/CD active

**Melcho is now live and production-ready! 🚀**

---

## 📊 Monitoring

Going forward:

1. **Monitor GitHub Actions** → Each push auto-deploys
2. **Check Render logs** → https://render.com (melcho-api)
3. **Check Vercel deployments** → https://vercel.com/dashboard
4. **Run verification** → `node tests/verify-production.js` anytime

---

## 🆘 If Something Fails

1. Check the specific failing test/step
2. Look at error message
3. Refer to TROUBLESHOOTING section in DEPLOYMENT_GUIDE.md
4. Common issues:
   - CORS: Check ALLOWED_ORIGINS env var
   - Products: Check MONGO_URI and run seed script
   - Auth: Check ProtectedRoute is wrapping routes
   - Deploy: Check GitHub Secrets are set

---

**Total Setup Time:** ~40 minutes
**After deployment:** Fully automated with each push to main
