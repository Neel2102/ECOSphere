// EcoSphere - Gamification module API calls
import api from './api';

const gamificationService = {
  // Challenges
  listChallenges: (params) =>
    api.get('/gamification/challenges', { params }).then((r) => r.data.data),
  createChallenge: (data) =>
    api.post('/gamification/challenges', data).then((r) => r.data),
  updateChallenge: (id, data) =>
    api.put(`/gamification/challenges/${id}`, data).then((r) => r.data),
  deleteChallenge: (id) =>
    api.delete(`/gamification/challenges/${id}`).then((r) => r.data),
  changeStatus: (id, status) =>
    api.patch(`/gamification/challenges/${id}/status`, { status }).then((r) => r.data),
  joinChallenge: (id) =>
    api.post(`/gamification/challenges/${id}/join`).then((r) => r.data),

  // Challenge Participations
  listParticipations: (params) =>
    api.get('/gamification/participations', { params }).then((r) => r.data.data),
  approveParticipation: (id) =>
    api.patch(`/gamification/participations/${id}/approve`).then((r) => r.data),
  rejectParticipation: (id) =>
    api.patch(`/gamification/participations/${id}/reject`).then((r) => r.data),
  updateProgress: (id, data) =>
    api.patch(`/gamification/participations/${id}/progress`, data).then((r) => r.data),
  uploadProof: (id, formData) =>
    api.post(`/gamification/participations/${id}/proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  // Badges
  listBadges: () =>
    api.get('/gamification/badges').then((r) => r.data.data),
  createBadge: (data) =>
    api.post('/gamification/badges', data).then((r) => r.data),
  updateBadge: (id, data) =>
    api.put(`/gamification/badges/${id}`, data).then((r) => r.data),
  deleteBadge: (id) =>
    api.delete(`/gamification/badges/${id}`).then((r) => r.data),

  // Rewards
  listRewards: () =>
    api.get('/gamification/rewards').then((r) => r.data.data),
  createReward: (data) =>
    api.post('/gamification/rewards', data).then((r) => r.data),
  updateReward: (id, data) =>
    api.put(`/gamification/rewards/${id}`, data).then((r) => r.data),
  deleteReward: (id) =>
    api.delete(`/gamification/rewards/${id}`).then((r) => r.data),
  redeemReward: (id) =>
    api.post(`/gamification/rewards/${id}/redeem`).then((r) => r.data),
  listRedemptions: () =>
    api.get('/gamification/redemptions').then((r) => r.data.data),

  // Leaderboard & XP
  getLeaderboard: (params) =>
    api.get('/gamification/leaderboard', { params }).then((r) => r.data.data),
  getMyXp: () =>
    api.get('/gamification/xp/me').then((r) => r.data.data),
};

export default gamificationService;
