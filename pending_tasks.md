# Remaining Tasks Based on Cupi Platform Upgrade Plan

## Completed
- Database schema with cupi_template_audio + RLS
- Store interface + postgres/json implementations  
- Admin audio endpoints (GET /api/admin/audio, POST /api/admin/audio/:templateId)
- Public audio endpoint (GET /api/audio/:templateId)
- Pricing page, routes, navbar/footer links
- AudioPlayer/BackgroundAnimation components + ExperienceView integration
- Server typecheck passes, supabase+postgres tests pass

## Pending

### 1. Superadmin Dashboard - Music Manager
- [ ] Edit src/pages/admin/AdminDashboard.tsx to add "Music Manager" section
- [ ] Form: template selector, external audio URL input, MP3 upload (convert to base64)
- [ ] Fetch and display current audio per template
- [ ] Save via POST /api/admin/audio/:templateId

### 2. Verify AudioPlayer (src/components/store/AudioPlayer.tsx)
- [ ] Confirm fetches from /api/audio/:templateId
- [ ] Test floating UI, play/pause/mute behavior
- [ ] Ensure works in shared links and demo mode

### 3. Verify BackgroundAnimation (src/components/store/BackgroundAnimation.tsx) 
- [ ] Confirm framer-motion + canvas-confetti
- [ ] Map animations by theme type (hearts, balloons, confetti)
- [ ] Test with different templates

### 4. Demo Mode Integration
- [ ] Add AudioPlayer + BackgroundAnimation to demo overlay in src/App.tsx if desired

### 5. Manual Verification
- [ ] Music Manager upload/set URL in Superadmin
- [ ] Demo plays audio + animations
- [ ] /pricing visible, footer links correct
