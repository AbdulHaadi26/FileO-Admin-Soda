import axios from 'axios';
export const baseUrl="https://dev1.file-o.com";
export const clientUrl="https://dev1client.file-o.com";
export const docsUrl="https://dev1docs.file-o.com";

export default axios.create({
    baseURL: `${baseUrl}/api`
});