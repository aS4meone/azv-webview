import axios from "axios";

export const testRequest = async (message: string) => {
  const response = await axios.get(
    `http://192.168.0.112:3001/api/log?message=${message}`
  );
  if (response.status === 200) {
    return response.data;
  }
  return null;
};
