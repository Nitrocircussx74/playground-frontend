import api from '@/utils/api';

export default {
  async getRooms() {
    const response = await api.get('/api/v1/rooms');
    return response.data;
  },

  async getRoomById(id) {
    const response = await api.get(`/api/v1/rooms/${id}`);
    return response.data;
  }
};
