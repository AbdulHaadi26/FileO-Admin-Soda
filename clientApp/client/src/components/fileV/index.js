import React, { Suspense } from 'react';
import '../style.css';
import Container from '../container';
import User from '../../assets/static/user.png';
import axios from 'axios';
import Down from '../../assets/downB.svg';
import ReturnType from '../types';
import { clientUrl } from '../../utils/api';
export default ({ file }) => {

    const downloadFile = async (id) => {
        const res = await axios.get(`${clientUrl}/apiC/shared/download/${id}`);
        if (res.data.file && !res.data.error) window.open(res.data.file.url);
    }

    const renderF = (p, d, i) => <Suspense fallback={<></>}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginTop: '12px', width: '100%' }}>
            <img src={i ? i : User} alt="user" style={{ width: '50px', height: '50px', borderRadius: '1000px', marginRight: '12px' }} />
            <h6 className="date mr-auto">{p} has shared with you.</h6>
            <h6 className="date">Uploaded on {renderDate(d)}</h6>
        </div>
    </Suspense>

    const renderDate = date => {
        var strTime = `${date.slice(0, 10)}`;
        return strTime;
    }

    if (file) var { name, _id, postedby, date, type } = file;

    return <Container>
        {postedby && renderF(postedby.name, date, postedby.image)}
        <div className={"mFWS col-lg-2 col-4"} style={{ marginTop: '24px' }}>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                <h6 className="item-hover" style={{ position: 'absolute', top: '12px', right: '8px', width: 'fit-content' }}>
                    <div onClick={e => downloadFile(_id)} style={{
                        width: '26px', height: '26px', display: 'flex', alignItems: 'center', boxShadow: `0 2px 6px 0 rgba(0, 0, 0, 0.25), 0 2px 6px 0 rgba(0, 0, 0, 0.34)`,
                        justifyContent: 'center', backgroundColor: 'white', borderRadius: '1000px', cursor: 'pointer'
                    }}>
                        <div style={{ width: '12px', height: '12px', backgroundSize: 'contain', backgroundImage: `url('${Down}')` }} />
                    </div>
                </h6>
            </div>
            <img src={ReturnType(type)} alt="Shared File" />
            <h6 style={{ fontSize: '12px', marginTop: '6px', wordBreak: 'break-all', textAlign: 'center' }}>{name.length > 35 ? `${name.substr(0, 35)}...` : name}</h6>
        </div>
    </Container>

}
