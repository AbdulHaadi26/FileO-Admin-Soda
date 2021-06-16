import React, { useState, useEffect } from 'react';
import Link from 'react-router-dom/Link';
import More from '../../../assets/more.svg';
import history from '../../../utils/history';
import APoll from '../../../assets/addPoll.svg';
const bS = { borderBottom: 'solid 1px #dcdde1' };
const pF = { position: 'fixed', zIndex: '9998', minHeight: '100vh', backgroundColor: '#000', top: '0', left: '0', opacity: '0.0', minWidth: '100vw' };

export default ({ id, list, ord, auth, setEP, setDel, setPT }) => {
    const [listT, setLT] = useState([]), [active, setAct] = useState(false);

    console.log(listT);

    useEffect(() => {
        let tempL = [];
        tempL = tempL.concat(list);

        switch (ord) {
            case 1: tempL = tempL.sort(function (a, b) {
                return new Date(a.date) - new Date(b.date);
            });; break;
            case 2: tempL = tempL.sort(function Sort(a, b) {
                var textA = a.name.toLowerCase();
                var textB = b.name.toLowerCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            }); break;
            case 3: tempL = tempL.sort(function Sort(a, b) {
                var textA = a.name.toLowerCase();
                var textB = b.name.toLowerCase();
                return (textA > textB) ? -1 : (textA > textB) ? 1 : 0;
            }); break;
            default: tempL = tempL.sort(function (a, b) {
                return new Date(b.date) - new Date(a.date);
            }); break;
        }
        setLT(tempL);
    }, [list, ord]);

    return listT.map((File, k) => <div className="col-lg-2 col-4 mFWS" key={k}>
        {active === k && active >= 0 && <div style={pF} onClick={e => setAct(-1)} />}
        {auth && <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginLeft: 'auto' }}>
            <h6 className="item-hover" style={{ position: 'relative', width: 'fit-content' }} onClick={e => setAct(active === k ? -1 : k)}>
                <div style={{ width: '18px', height: '18px', cursor: 'pointer', backgroundImage: `url('${More}')` }} />
                <div className="dropdown-content" style={{ display: `${active === k ? 'flex' : 'none'}`, top: '12px' }}>
                    <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setEP(File); }}>Edit Poll</h6>
                    <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setDel(File._id); }}>Delete Poll</h6>
                </div>
            </h6>
        </div>}
        <img src={APoll} alt="Plan" style={{ cursor: 'pointer', marginTop: !auth ? '12px' : '0px' }} 
        onClick={e => auth ? history.push(`/organization/${id}/poll/details/${File._id}`) : setPT(File)} />
        {auth && <Link style={{ textDecoration: 'none', wordBreak: 'break-all', fontSize: '14px', fontWeight: '400', marginTop: '12px', marginLeft: 'auto', marginRight: 'auto' }} to={`/organization/${id}/poll/details/${File._id}`}>{File.name}</Link>}
        {!auth && <h6 onClick={e => setPT(File)} style={{ textDecoration: 'none', cursor:'pointer', wordBreak: 'break-all', fontSize: '14px', fontWeight: '400', marginTop: '12px', marginLeft: 'auto', marginRight: 'auto' }}>{File.name}</h6>}
        <h6 style={{ color: 'gray', fontSize: '11px', marginTop: '6px', fontWeight: '400', marginLeft: 'auto', marginRight: 'auto' }}>{File.end_date}</h6>
    </div>);
}