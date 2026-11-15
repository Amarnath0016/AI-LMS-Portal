# Ethical AI Mentorship & Digital Likeness Consent Policy

**Platform**: UptoSkills AI Learning Management System (LMS)  
**Effective Date**: November 2026  
**Document Version**: 2.0 (Synthetic Media Ethics & Rights Standard)

---

## 1. Executive Summary & Core Ethical Commitment

At UptoSkills AI LMS, our educational mission is to empower learners through interactive, responsive, AI-guided pedagogy. We firmly believe that AI avatars and synthetic voices must operate with **uncompromising ethical integrity, transparency, and explicit consent**.

Under this policy:
1. **Zero Unauthorized Impersonation**: UptoSkills strictly prohibits the simulation, cloning, or impersonation of living real people without verified, documented consent.
2. **Clear Identity Disclosure**: Every synthetic mentor interface—cards, video/audio players, and conversational chat turns—must prominently display explicit disclaimers: `"AI-generated mentor. Not the real person."`
3. **Auditable Consent Architecture**: Every mentor record in the platform is tracked in the database with strict metadata: legal classification (`type`), consent document URL (`consentDocUrl`), intellectual property licence (`licenseInfo`), disclosure notice (`disclosureText`), and operational status (`status`).
4. **Mandatory Administrative Activation Gates**: No mentor can be transitioned to `active` status by an administrator or API call unless verified licensing information or consent documentation is attached.

---

## 2. Mentor Typology and Legal Taxonomy

All mentors within UptoSkills LMS are classified under one of four distinct legal categories defined in the `Mentor` Mongoose schema (`server/models/Mentor.js`):

| Mentor Type | Definition | Verification Requirement | Example Personas |
|---|---|---|---|
| `original` | Original fictional pedagogical persona conceived, designed, and owned by UptoSkills LMS. | Documented Character IP assignment & pedagogical curriculum licence on file. | Dr. Alex Vance, Dr. Sid Rao, Elena Montague, Dr. Kai Jensen, Samar Roy, Anya Sharma, Marcus Chen, Dr. Irene Thorne |
| `historical` | Deceased historical figure in the public domain, created strictly as an educational tribute. | Verified public domain status under applicable copyright and right-of-publicity laws. | Ada Lovelace (1815–1852), Alan Turing (1912–1954) |
| `consented-person` | Living individual who has formally executed a synthetic digital likeness and voice agreement. | Executed and countersigned Consent & Digital Likeness Agreement stored via `consentDocUrl`. | Subject matter experts, verified guest instructors |
| `licensed` | Third-party pedagogical avatar or synthetic voice licensed from an authorized studio or talent agency. | Fully executed commercial educational license agreement stored via `licenseInfo`. | Studio-licensed educational avatars |

---

## 3. Database Schema & Integrity Constraints

The `Mentor` model enforces these ethical constraints at the database level:

```javascript
// server/models/Mentor.js
{
  type: {
    type: String,
    enum: ["original", "licensed", "historical", "consented-person"],
    default: "original",
    required: true,
    index: true,
  },
  consentDocUrl: { type: String, default: "" },
  licenseInfo: { type: String, default: "" },
  disclosureText: {
    type: String,
    default: "AI-generated mentor. Not the real person.",
  },
  status: {
    type: String,
    enum: ["active", "inactive", "pending-consent", "draft"],
    default: "active",
    index: true,
  },
}
```

### Pre-Validation Activation Hook
To prevent accidental activation of unconsented or unlicensed personas, Mongoose executes a pre-validation guard:
```javascript
mentorSchema.pre("validate", function (next) {
  if (this.status === "active") {
    const hasConsent = Boolean(this.consentDocUrl && this.consentDocUrl.trim());
    const hasLicense = Boolean(this.licenseInfo && this.licenseInfo.trim());
    if (!hasConsent && !hasLicense) {
      this.invalidate(
        "status",
        "Admin can only activate a mentor if consentDocUrl or licenseInfo is present."
      );
    }
  }
  next();
});
```

---

## 4. Administrative Activation & Governance Controls

Administrative privileges are required to manage mentor profiles. The API endpoint enforces strict validation before a mentor can be published to learners:

- **Endpoint**: `PATCH /api/admin/mentors/:id/status` or `PATCH /api/admin/mentors/:id/activate`
- **Security**: Requires JWT bearer token and verified `role: "admin"`.
- **Validation Rule**:
  ```javascript
  if (targetStatus === "active") {
    const hasConsent = Boolean(mentor.consentDocUrl && mentor.consentDocUrl.trim());
    const hasLicense = Boolean(mentor.licenseInfo && mentor.licenseInfo.trim());

    if (!hasConsent && !hasLicense) {
      return res.status(400).json({
        success: false,
        message: "Admin can only activate a mentor if consentDocUrl or licenseInfo is present.",
      });
    }
  }
  ```
- Any activation attempt without `consentDocUrl` or `licenseInfo` is rejected with `HTTP 400 Bad Request`.

---

## 5. User-Facing Disclosures Across All Touchpoints

Learners must never be misled about whether they are communicating with an AI or a real human:

### 1. Mentor Directory & Catalog Cards (`MentorCard.jsx`)
- Displays an ethical identity tag (`ORIGINAL MENTOR` or `HISTORICAL TRIBUTE`).
- Prominently displays a permanent warning banner:  
  `[ShieldAlert] AI-generated mentor. Not the real person.`

### 2. Interactive Audio / Avatar Player (`AIMentorPlayer.jsx`)
- Persistent header banner docked directly above the audio controls and talking avatar:  
  `[ShieldAlert] AI-generated mentor. Not the real person. [ORIGINAL PERSONA / HISTORICAL TRIBUTE]`
- Talking avatar displays a verified compliance badge linking to consent details.

### 3. AI Chat Turns & Q&A Doubt Solver (`AIMentorPlayer.jsx` & `aiMentorService.js`)
- Every model response payload includes `{ label: "AI-generated mentor. Not the real person.", disclosureText: "..." }`.
- Every incoming chat bubble displays the identity badge:  
  `[ShieldAlert] AI-generated mentor. Not the real person.`

---

## 6. Prompt Engineering & Hallucination Guardrails

UptoSkills LMS eliminates deceptive prompt designs:

1. **No "Clone" Persona Instructions**:
   - The phrase `"You are an AI clone of <real person>"` is strictly prohibited.
   - System prompts explicitly state:  
     `"You are an AI-generated educational mentor: Dr. Alex Vance. You are an AI, NOT a real human. Never claim to be a living person, individual, or speak for anyone without consent. Never fabricate fake quotes or attribute statements to living individuals."`
2. **No First-Person Real Quotes**:
   - Personas teach fundamental concepts, methodologies, and engineering problem-solving frameworks without attributing fake first-person quotes to real people.
3. **Course Grounding & Refusal Policies**:
   - If a student asks questions outside the verified curriculum, the system refuses:  
     `"This topic is not covered in the current course syllabus."`
   - Off-topic or adversarial prompt injections (e.g., attempts to force the model to impersonate a celebrity) trigger immediate refusal.

---

## 7. Compliance Verification & Audit

Our automated test suite continuously verifies this policy:
- `server/tests/mentor_ethics.test.js`: Verifies model taxonomy, activation gates, seed data consent compliance, zero living celebrity impersonation, and disclosure propagation in AI chat.
- All 10 platform mentors are seeded with explicit `consentDocUrl` and `licenseInfo` references.
- Periodic audits are conducted prior to platform deployments.
