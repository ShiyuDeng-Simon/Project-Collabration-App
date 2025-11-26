# Production Security Checklist

## ✅ Fixed Issues

### 1. **Google Token Verification** ✅
- **Before**: Backend accepted user data directly from client (CRITICAL VULNERABILITY)
- **After**: Backend now verifies Google ID token using `google-auth-library`
- **Impact**: Prevents unauthorized authentication

### 2. **Hardcoded Client ID** ✅
- **Before**: Fallback hardcoded Google Client ID in code
- **After**: Requires `REACT_APP_GOOGLE_CLIENT_ID` environment variable
- **Impact**: Prevents accidental exposure of credentials

### 3. **JWT Secret Fallback** ✅
- **Before**: Used `'fallback_secret'` if `JWT_SECRET` not set
- **After**: Server fails if `JWT_SECRET` is not configured
- **Impact**: Prevents weak/default secrets in production

## ⚠️ Remaining Production Requirements

### 1. **Install Required Package**
```bash
cd server
npm install google-auth-library
```

### 2. **Environment Variables**
Ensure these are set in production:

**Server (`server/.env`):**
```env
JWT_SECRET=<strong-random-secret-32-chars-minimum>
GOOGLE_CLIENT_ID=<your-google-client-id>
NODE_ENV=production
CLIENT_URL=https://your-production-domain.com
PORT=8000
```

**Client (`client/.env`):**
```env
REACT_APP_SERVERURL=https://api.your-production-domain.com
REACT_APP_GOOGLE_CLIENT_ID=<your-google-client-id>
```

### 3. **HTTPS Enforcement**
- ✅ Use HTTPS in production (required for OAuth)
- ✅ Update CORS to only allow your production domain
- ✅ Set secure cookie flags if using cookies

### 4. **Rate Limiting** ⚠️
**Recommended**: Add rate limiting to prevent brute force attacks:
```bash
npm install express-rate-limit
```

Add to `server/server.js`:
```javascript
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later'
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/google-auth', authLimiter);
```

### 5. **CORS Configuration** ⚠️
Update `server/server.js` for production:
```javascript
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  // In production, be more specific:
  // origin: ['https://your-production-domain.com'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 6. **Error Handling** ⚠️
- ✅ Don't expose stack traces in production
- ✅ Log errors securely (use a logging service)
- ✅ Use generic error messages for users

### 7. **Database Security** ⚠️
- ✅ Use connection pooling
- ✅ Use parameterized queries (already done ✅)
- ✅ Restrict database user permissions
- ✅ Use SSL for database connections in production
- ✅ Regular backups

### 8. **Token Management** ⚠️
- ✅ JWT tokens expire in 7 days (consider shorter for production)
- ⚠️ Consider implementing refresh tokens
- ⚠️ Store tokens securely on client (consider httpOnly cookies)

### 9. **Input Validation** ✅
- ✅ Email validation
- ✅ Password length requirements
- ⚠️ Consider adding more validation (XSS protection, SQL injection prevention)

### 10. **Monitoring & Logging** ⚠️
- ⚠️ Set up error monitoring (e.g., Sentry)
- ⚠️ Log authentication attempts
- ⚠️ Monitor for suspicious activity

### 11. **Google OAuth Configuration** ⚠️
In Google Cloud Console:
- ✅ Add production domain to authorized JavaScript origins
- ✅ Add production callback URLs
- ✅ Enable OAuth consent screen
- ✅ Verify domain ownership

### 12. **Security Headers** ⚠️
Add security headers middleware:
```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

## 🚨 Critical Before Production

1. ✅ **Install `google-auth-library`**: `cd server && npm install google-auth-library`
2. ✅ **Set all environment variables** (no defaults/fallbacks)
3. ✅ **Use HTTPS** (required for OAuth)
4. ✅ **Configure CORS** for production domain only
5. ⚠️ **Add rate limiting** to auth endpoints
6. ⚠️ **Add security headers** (helmet)
7. ⚠️ **Set up error monitoring**
8. ⚠️ **Test Google OAuth** with production credentials

## Testing Checklist

- [ ] Test Google OAuth login in production environment
- [ ] Test JWT token expiration
- [ ] Test rate limiting
- [ ] Test CORS with production domain
- [ ] Test error handling (don't expose sensitive info)
- [ ] Test database connection with SSL
- [ ] Verify all environment variables are set
- [ ] Test HTTPS enforcement

## Notes

- The current implementation is **much more secure** after these fixes
- The critical vulnerability (no token verification) has been **fixed**
- Additional security measures (rate limiting, helmet, etc.) are **recommended** but not critical for basic production use
- Always follow security best practices and keep dependencies updated

