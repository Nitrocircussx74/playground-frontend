import api from '@/utils/api';

export default {
  async getRooms(buildingId) {
    const response = await api.get('/api/v1/rooms', { params: { buildingId } });
    return response.data;
  },

  async getRoomById(id) {
    const response = await api.get(`/api/v1/rooms/${id}`);
    return response.data;
  },

  async createRoom(payload) {
    const response = await api.post('/api/v1/rooms', payload);
    return response.data;
  }
};
