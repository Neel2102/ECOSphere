// EcoSphere - Notifications API calls
import api from './api';

const notificationService = {
  listMine: (params) =>
    api.get('/notifications', { params }).then((r) => r.data.data),
  markRead: (id) =>
    api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () =>
    api.patch('/notifications/read-all').then((r) => r.data),
};

export default notificationService;
