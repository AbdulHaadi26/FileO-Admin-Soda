import axios from 'axios';
import { baseUrl } from './api';

export default axios.create({
    baseURL: `${baseUrl}/apiP`
});