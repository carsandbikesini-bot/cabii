# CABII: Cars And Bikes In India – Copilot Instructions

## Architecture Overview

**CABII** is a vehicle trust infrastructure platform combining RTO intelligence, image analysis, and fraud detection.

### Core Data Flow
1. **User/Dealer uploads vehicle ad** → Multiple images + RC documents
2. **Automatic verification layer** → OCR (plate + RC), damage detection, RTO lookup, fraud scoring
3. **Trust scoring engine** → Outputs: damageScore, fraudScore, trustScore → determines guarantee & badge (red/yellow/green)
4. **Auto-description generation** → Transparent, templated descriptions
5. **Pricing engine** → Market rate lookup + final price adjustment
6. **Dealer membership enforcement** → Ad post limits, feature access via membership tiers

### Technology Stack
- **Backend**: Node.js/Express (port 5000)
- **Database**: MongoDB (localhost:27017/cabii)
- **Authentication**: Session-based (users) + JWT (dealers via `/dealer/login`)
- **Image Processing**: Sharp (quality, metadata), Tesseract OCR (plate/RC text)
- **External APIs**: Twilio (WhatsApp future), VAHAN (RTO lookup planned)

---

## Backend Structure

### `/Backend/routes/` – Entry Points
- `ads.js` – **Main ad posting pipeline**: image upload, OCR, damage analysis, pricing
- `dealerAuth.js` – Dealer login/auth routes
- `dealer.js` – Dealer dashboard, ad management
- `plateDetect.js`, `detect.js` – Plate OCR test endpoints
- `marketRate.js` – Market pricing lookup
- `sell48.js` – 48-hour guarantee feature
- `bids.js` – Bidding system

### `/Backend/services/` – Intelligence Layers
These are **pluggable analysis engines**:

| Service | Purpose | Key Exports |
|---------|---------|-------------|
| `imageDamageAnalyzer.js` | Damage scoring from images (ML-ready) | `analyzeImages()`, `evaluateTrust()` |
| `trustScoreEngine.js` | Overall trust calculation | `trustScore()` |
| `fraudEngine.js` / `fraud.service.js` | Fraud detection heuristics | `detectFraud()` |
| `priceEngine.js` / `pricingEngine.js` | Market rate + adjustments | `calculateFinalPrice()` |
| `rtoProvider.js` | Routes to mock/VAHAN providers | Abstracts RTO lookup |
| `rtoVahanProvider.js` | VAHAN API integration (future) | `fetchVehicleData()` |
| `rtoMockProvider.js` | Mock RTO data for dev | `fetchVehicleData()` |
| `autoDescription.js` | Template-based ad descriptions | `generateDescription()` |
| `guaranteeEngine.js` | Guarantee eligibility (trustScore + fraudScore) | `getGuarantee()` |

**Pattern**: Each engine is deterministic, testable. Import in `ads.js` route → call on each upload.

### `/Backend/utils/` – Utilities
- `numberPlateDetect.js` – Extract plate from image
- `ocr.js`, `rcocr.js` – Tesseract wrappers (plates, RC text)
- `imageHash.js` – Duplicate detection (MD5/SHA)
- `exifCheck.js` – Image metadata extraction
- `conditionScore.js` – Condition heuristics
- `imageQuality.js` – Resolution/clarity checks
- `rtoFetch.js` – RTO database lookups
- `sendWhatsApp.js` – Twilio integration (stub)

### `/Backend/models/` – Data Schemas
- **Ad.js** – Vehicle ads with rcVerified flag, trustBadge, damageScore, guarantee fields
- **User.js** – Users with membership (adsPosted, adsLimit)
- **Dealer.js** – Dealers with phone auth, membershipPlan
- **Bid.js** – Bidding system for buyers
- **Sell48.js** – 48-hour acceleration feature

### Auth Flows

**Regular Users** (email-based):
```
POST /auth/signup or /auth/login → session.userId stored → isLoggedIn() middleware
```

**Dealers** (phone-based):
```
POST /dealer/login → session.dealerId stored → isDealerLoggedIn() middleware
```

JWT middleware exists but primary flow uses sessions. **Pattern**: Check `req.session.userId` or `req.session.dealerId` before operations.

---

## Frontend Structure

### Flows
- **Login/Signup** (`login.js`, `signup.js`) → Session-based auth
- **Post Ad** (`post-ad.html`, `post-ad.js`) → Form + image accumulation (crucial: `imageInput.value = ""` reset for multi-select)
- **Dealer Dashboard** (`dealer-dashboard.html`, `dealer.js`) → List/edit ads
- **Trust Badge Display** (`trustBadge.js`) → Shows red/yellow/green badge based on trustBadge field
- **Sell in 48 Hours** (`sell48.html`, `sell48.js`) → Acceleration via guarantee

### Image Upload Pattern (Frontend)
```javascript
// post-ad.js accumulates images in selectedImages[]
// Forms concatenates them in FormData before POST
// Server processes multer upload → calls analysis engines → stores paths in Ad.images & Ad.rcImages
```

---

## Critical Patterns & Conventions

### 1. **Auto-Verification Pipeline**
When ad is posted:
1. Extract plate from image → OCR → lookup RTO
2. Extract RC text → verify number match
3. Analyze all images → damageScore (AI-plug ready)
4. Calculate trustScore + fraudScore → determine guarantee (see `guaranteeEngine.js`)
5. Generate description (auto-templated, human-readable)
6. Calculate final price (market rate + adjustments)

**Key**: All engines are **idempotent**. Post same ad twice → same outputs.

### 2. **Damage/Trust Scoring Scale**
- **0–59** = Red badge (rejected guarantee)
- **60–79** = Yellow badge (conditional guarantee)
- **80–100** = Green badge (approved guarantee)

This is hardcoded across services; maintain consistency when modifying thresholds.

### 3. **Membership Enforcement**
- **Ad post limit**: Check `user.adsPosted >= user.membership.adsLimit` before saving
- **Dealer features**: Membership plan gates features (see Dealer model)
- **Pattern**: Always validate membership before feature access (in controllers)

### 4. **RTO Provider Pattern** (Abstraction for future)
```javascript
// rtoProvider.js routes to mock or VAHAN based on env
const provider = process.env.USE_VAHAN ? require("./rtoVahanProvider") : require("./rtoMockProvider");
```
When adding real VAHAN integration: **no route changes needed**—just swap provider.

### 5. **Session Configuration**
```javascript
// server.js session config
httpOnly: true, sameSite: "lax", secure: false, maxAge: 24h
```
- **HttpOnly** prevents XSS cookie theft
- **sameSite: lax** allows cross-site post/link clicks
- **secure: false** for localhost dev; set true in production

### 6. **Error Responses**
Consistent pattern: `{ success: false, message: "..." }`
Use this throughout new endpoints for consistency.

---

## Common Developer Workflows

### Running the Stack
```bash
# Terminal 1: Backend
cd Backend
npm install
npm start  # Runs on http://localhost:5000

# Terminal 2: Frontend (open static files)
# Navigate to Frontend/ folder in browser or use Live Server
```

### MongoDB Connection
- **Default**: `mongodb://127.0.0.1:27017/cabii`
- **Check connection**: `db.js` will log `✅ MongoDB Connected`
- **Collections**: User, Ad, Dealer, Bid, Sell48 (auto-created on first write)

### Testing OCR/RTO Locally
- `POST /api/detect-plate` (multipart, single image) → Returns extracted plate + RTO analysis
- `POST /api/detectrc` (multipart) → RC text extraction
- Mock RTO data in `mock/rto.mock.json` is used unless env flag switches to VAHAN

### Adding New Analysis Engine
1. Create `/Backend/services/newEngine.js` → Export function
2. Import & call in `/Backend/routes/ads.js` when ad is posted
3. Store result in Ad model new field
4. Integrate into trust/guarantee calculation in `guaranteeEngine.js`

---

## Key Files to Reference

- **Core Ad Pipeline**: [routes/ads.js](routes/ads.js) – Orchestrates all analysis
- **Trust Scoring**: [services/trustScoreEngine.js](services/trustScoreEngine.js) – Final score formula
- **Guarantee Logic**: [services/guaranteeEngine.js](services/guaranteeEngine.js) – Eligibility rules
- **DB Connection**: [config/db.js](config/db.js) – MongoDB setup (check here if DB queries fail)
- **Frontend Ad Post**: [Frontend/js/post-ad.js](Frontend/js/post-ad.js) – Image accumulation logic
- **Server Entry**: [server.js](server.js) – All route registrations, session setup

---

## Known Constraints & Future Work

- **Image Damage Detection**: Currently random simulation; AI/ML model pending (see `imageDamageAnalyzer.js` lines 17–19)
- **VAHAN RTO**: Stub only; real API integration needed (see `rtoVahanProvider.js`)
- **WhatsApp Alerts**: Twilio client initialized but not wired (see `sendWhatsapp()` in adController.js)
- **Bidding System**: Routes exist but incomplete (bid.js route stubs)
- **PDF RC Extraction**: Tesseract OCR only; PDF support needs `pdf-parse` library

---

## Code Style Notes

- **Naming**: camelCase for variables, PascalCase for classes, SCREAMING_SNAKE_CASE for constants
- **Comments**: Hindi + English mix common; important logic marked with 🔐, 🚗, 📁 emojis
- **Error Handling**: Try-catch used; always respond with structured JSON
- **Async**: Promises used; few .then() chains, mostly async/await
- **Modularity**: service Layer pattern for analysis engines