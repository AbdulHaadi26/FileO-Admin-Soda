import React from 'react';
import Axios from 'axios';
import { clientUrl } from '../../utils/api';
import Down from '../../assets/downB.svg';

export default ({ id, mT }) => {

    const downloadFile = async () => {
        const res = await Axios.get(`${clientUrl}/api/shared/download/${id}`);
        if (res.data.file && !res.data.error) window.open(res.data.file.url);
    }

    return <h6 className={`order`} style={{ marginTop: mT }} onClick={e => downloadFile()}><div style={{ width: '16px', height: '16px', backgroundImage: `url('${Down}')`, marginLeft: '4px' }} /></h6>
}
