import axios from 'axios';
export const baseUrl="https://www.file-o.com";

export default axios.create({
    baseURL: `${baseUrl}/api`
});