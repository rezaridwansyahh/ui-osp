
import api from './api';

export const fetchFranchiseByGymId = async (gymId) => {
  const res = await api.get(`/api/franchise/mappings/gym/${gymId}`);
  return res.data; // { franchiseId, brandId, gymId, gymName, franchiseName, ... }
};