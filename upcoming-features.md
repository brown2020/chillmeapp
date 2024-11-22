# Chill.me MVP Feature Planning

## 1. User Authentication and Management (Firebase)
- [x] Implement user sign-up and login using Firebase Authentication (email/password, Google, etc.).
- [ ] Test and ensure secure authentication flow.
- [x] Add user profile page

## 2. Session Creation and Invitation
- [x] Develop a simple interface for one-click meeting/live stream creation.
- [x] Generate unique invite links for easy sharing.
  
## 3. Password Protection
- [ ] Add functionality for password-protected sessions.
  
## 4. Real-time Video and Audio (100ms)
- [x] Integrate 100ms for high-quality real-time video and audio streaming.
  
## 5. Recording and Playback
- [x] Implement session recording with cloud storage.
- [x] Develop an interface for viewing/downloading previous recordings.

## 6. Basic In-Session Controls
- [x] Add controls for mute/unmute and toggling video.
- [x] Implement leave/end session functionality, allowing hosts to end the session for all participants.
  
## 7. In-Session Chat
- [x] Integrate real-time chat functionality during sessions.
  
## 8. Session Locking
- [ ] Allow hosts to lock the session once all participants have joined.
  
## 9. Mobile-Responsive Design
- [ ] Ensure all features are fully mobile-responsive for seamless mobile use.
  
## 10. Participant Limit
- [ ] Set participant limits between 50 to 100 users to optimize performance.

## 11. AI-Powered Transcription
- [ ] Integrate AI for real-time transcription of sessions.
- [ ] Implement searchable transcripts for easy access post-session.

## 12. AI Meeting Summaries
- [ ] Use AI to generate concise summaries of key points and action items post-meeting.

## 13. Landing Page
- [ ] Create a landing page explaining app purpose, features, and benefits.
- [ ] Add a call to action for user sign-ups.
- [ ] Display credits-based pricing details on the landing page.

## 14. Credits-Based Payment System
- [x] Implement a credits-based system allowing users to purchase 10,000 credits for $99.99.
- [x] Deduct credits based on 100ms usage and AI functionalities.
- [ ] Create a dashboard for users to track remaining credits and usage history.

## 15. Project Maintenence
- [ ] Move server functions to `backend/services` from `frontend/services` 
- [ ] Remove unused files and redundant code

## 16. Resources Setup
- [ ] Add script to auto create resources across multiple services