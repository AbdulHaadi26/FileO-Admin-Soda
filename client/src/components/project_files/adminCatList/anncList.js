import React, { useState } from 'react';
import Link from 'react-router-dom/Link';
import history from '../../../utils/history';
import More from '../../../assets/more.svg';
import Text from '../../../assets/announcements/Announcement.svg';
import Audio from '../../../assets/announcements/audio.svg';
import Video from '../../../assets/announcements/Video.svg';
const bS = { borderBottom: 'solid 1px #dcdde1' };
const pF = { position: 'fixed', zIndex: '9998', minHeight: '100vh', backgroundColor: '#000', top: '0', left: '0', opacity: '0.0', minWidth: '100vw' };

export default ({ org, pId, list, isList, ord, setMUpt, setMD, auth, }) => {

    const [active, setAct] = useState(-1);

    var listT = [];
    listT = listT.concat(list);

    switch (ord) {
        case 1: listT = list.sort(function (a, b) {
            return new Date(a.date) - new Date(b.date);
        });; break;
        case 2: listT = listT.sort(function Sort(a, b) {
            var textA = a.name.toLowerCase();
            var textB = b.name.toLowerCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        }); break;
        case 3: listT = listT.sort(function Sort(a, b) {
            var textA = a.name.toLowerCase();
            var textB = b.name.toLowerCase();
            return (textA > textB) ? -1 : (textA > textB) ? 1 : 0;
        }); break;
        default: listT = listT.sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        }); break;
    }

    return isList ? listT.map((Cat, k) => <div className="LI" key={Cat._id}>
        <img src={Cat.type === 'text' ? Text : Cat.type === 'video' ? Video : Audio} alt="Annoucement" style={{ width: '36px', height: '36px' }} />
        <Link style={{ textDecoration: 'none', marginLeft: '12px', wordBreak: 'break-all' }}
            to={`/organization/${org}/projects/${pId}/announcement/${Cat._id}`} className="mr-auto">{Cat.name} {Cat.updated && <span style={{ color: 'red', fontSize: '12px' }}>(Updated)</span>}</Link>
        {active === k && active >= 0 && <div style={pF} onClick={e => setAct(-1)} />}
        {auth && <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
            <h6 className="item-hover" style={{ position: 'relative', width: 'fit-content' }} onClick={e => setAct(active === k ? -1 : k)}>
                <div style={{ width: '18px', height: '18px', cursor: 'pointer', backgroundImage: `url('${More}')` }} />
                <div className="dropdown-content" style={{ display: `${active === k ? 'flex' : 'none'}`, top: '12px' }}>
                    <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setMUpt(Cat); }}>Edit</h6>
                    <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setMD(Cat._id); }}>Delete</h6>
                </div>
            </h6>
        </div>}
    </div>) : listT.map((Cat, k) => <div className="mFWS col-lg-2 col-4" key={Cat._id}>
        {active === k && active >= 0 && <div style={pF} onClick={e => setAct(-1)} />}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', opacity: auth ? '1' : '0' }}>
            <h6 className="item-hover" style={{ position: 'relative', width: 'fit-content' }} onClick={e => setAct(active === k ? -1 : k)}>
                <div style={{ width: '14px', height: '14px', cursor: 'pointer', backgroundImage: `url('${More}')` }} />
                <div className="dropdown-content" style={{ display: `${active === k ? 'flex' : 'none'}`, top: '12px' }}>
                    {auth && <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setMUpt(Cat); }}>Edit</h6>}
                    {auth && <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setMD(Cat._id); }}>Delete </h6>}
                </div>
            </h6>
        </div>
        <img src={Cat.type === 'text' ? Text : Cat.type === 'video' ? Video : Audio} alt="Announcement" style={{ cursor: 'pointer' }} onClick={e => history.push(`/organization/${org}/projects/${pId}/announcement/${Cat._id}`)} />
        <Link to={`/organization/${org}/projects/${pId}/announcement/${Cat._id}`}
            className="f-n mr-auto" style={{ textDecoration: 'none', wordBreak: 'break-all' }}>
            {Cat.name.length > 35 ? `${Cat.name.substr(0, 35)}...` : Cat.name}</Link>
    </div>);

}

