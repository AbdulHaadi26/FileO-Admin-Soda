import React, { Suspense } from 'react';
import '../style.css';
import Container from '../container';
import User from '../../assets/static/user.png';
import Down from '../../assets/downB.svg';
import Folder from '../../assets/folder.svg';
import ReturnType from '../types';
import { clientUrl } from '../../utils/api';
import axios from 'axios';

export default ({ files, postedby, pCat, setCC, folders, category, categoryC }) => {

    const downloadFile = async (cat, id) => {
        const res = await axios.get(`${clientUrl}/apiC/shared/downloadC/category/${cat}/${id}`);
        if (res.data.file && !res.data.error) window.open(res.data.file.url);
    };

    const BreadCrumb = () => {

        let index = 0;

        if (categoryC && category) {
            if (categoryC && categoryC.pCat && categoryC.pCat.length > 0) {
                categoryC.pCat.map((i, k) => {
                    if (i._id === category._id) index = k;
                    return i;
                });
            }
        }

        if (category) {
            return <>
                <h6 style={{ fontWeight: '600', fontSize: '12px', marginRight: '3px', cursor: 'pointer', color:'#0000EE' }} onClick={e => setCC('')}>{category.name}</h6>
                {categoryC && <h6 style={{ fontWeight: '600', fontSize: '12px', marginRight: '3px', cursor: 'pointer', color:'#0000EE' }} onClick={e => setCC('')}>{'>'}</h6>}
                {categoryC && categoryC.pCat && categoryC.pCat.length > 0 && categoryC.pCat.map((pCat, k) => k > index && <div style={{ display: 'flex', flexDirection: 'row' }} key={k}>
                    <h6
                        style={{ fontWeight: '600', fontSize: '12px', marginRight: '3px', cursor: 'pointer', color:'#0000EE' }} onClick={e => setCC(pCat._id)}>{pCat.name}</h6>
                    <h6 style={{ fontWeight: '600', fontSize: '12px', marginRight: '6px', cursor: 'pointer', color:'#0000EE' }} onClick={e => setCC(pCat._id)}>{'>'}</h6>
                </div>)}
                {categoryC && <h6 style={{ fontWeight: '600', fontSize: '12px', marginRight: '3px' }}>{categoryC.name}</h6>}
            </>
        };

        return <></>
    };

    const renderF = (p, i) => <Suspense fallback={<></>}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginTop: '12px', width: '100%' }}>
            <img src={i ? i : User} alt="user" style={{ width: '50px', height: '50px', borderRadius: '1000px', marginRight: '12px' }} />
            <h6 className="date mr-auto">{p} has shared with you.</h6>
        </div>
    </Suspense>

    return <Container>
        {postedby && renderF(postedby.name, postedby.image)}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '24px' }}>{BreadCrumb()}</div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop:'12px' }}>
            {folders && folders.length > 0 && folders.map((i, k) => <div key={k} className={"mFWS col-lg-2 col-4"}>
                <img src={Folder} alt="Folder" style={{ cursor: 'pointer', marginTop: '6px' }} onClick={e => setCC(i._id)} />
                <h6 style={{ fontSize: '12px', marginTop: '6px', wordBreak: 'break-all', textAlign: 'center', cursor: 'pointer' }} onClick={e => setCC(i._id)}>{i.name.length > 35 ? `${i.name.substr(0, 35)}...` : i.name}</h6>
            </div>)}
            {files && files.length > 0 && files.map((i, k) => <div key={k} className={"mFWS col-lg-2 col-4"}>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                    <h6 className="item-hover" style={{ position: 'absolute', top: '12px', right: '8px', width: 'fit-content' }}>
                        <div onClick={e => downloadFile(pCat, i._id)} style={{
                            width: '26px', height: '26px', display: 'flex', alignItems: 'center', boxShadow: `0 2px 6px 0 rgba(0, 0, 0, 0.25), 0 2px 6px 0 rgba(0, 0, 0, 0.34)`,
                            justifyContent: 'center', backgroundColor: 'white', borderRadius: '1000px', cursor: 'pointer'
                        }}>
                            <div style={{ width: '12px', height: '12px', backgroundSize: 'contain', backgroundImage: `url('${Down}')` }} />
                        </div>
                    </h6>
                </div>
                <img src={ReturnType(i.type)} alt="Shared File" />
                <h6 style={{ fontSize: '12px', marginTop: '6px', wordBreak: 'break-all', textAlign: 'center' }}>{i.name.length > 35 ? `${i.name.substr(0, 35)}...` : i.name}</h6>
            </div>)}

            {(!files || !files.length > 0) && (!folders || !folders.length > 0) &&
                <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: '30px' }}>
                    <h6 style={{ fontSize: '12px' }}>Nothing found.</h6>
                </div>}
        </div>
    </Container>

};
