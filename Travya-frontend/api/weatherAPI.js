import axios from "axios";

const BASE_URL = "http://localhost:5000";

export const getWeatherByCoords = async (lat, lon) => {
  try {
    const res = await axios.get(`${BASE_URL}/weather/coords?lat=${lat}&lon=${lon}`);
    return res.data; // { weather: {...} }
  } catch (err) {
    throw new Error(err.response?.data?.error || "Error fetching weather");
  }
};
