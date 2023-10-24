import axios from "axios";
import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });


const baseURL = process.env.NIGHTSCOUT_BASE_URL
const apiSecret = process.env.NIGHTSCOUT_API_SECRET

export default axios.create({
  baseURL: baseURL,
  headers: {
    "api-secret": apiSecret,
    "accept": "application/json"
  }
});