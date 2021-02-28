import axios from 'axios';
export const baseUrl="https://demo1login.file-o.com";
//export const baseUrl = "http://localhost";
export default axios.create({
    baseURL: `${baseUrl}/api`
});


