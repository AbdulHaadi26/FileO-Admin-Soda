import React, { useState, useEffect } from 'react';
import Link from 'react-router-dom/Link';
import More from '../../../assets/more.svg';
import PlanIco from '../../../assets/plan-ico.svg';
import history from '../../../utils/history';
const bS = { borderBottom: 'solid 1px #dcdde1' };
const pF = { position: 'fixed', zIndex: '9998', minHeight: '100vh', backgroundColor: '#000', top: '0', left: '0', opacity: '0.0', minWidth: '100vw' };

export default ({ id, list, count, ord, onFetch, isList, setEP, setDel }) => {
    const [listT, setLT] = useState([]), [active, setAct] = useState(false);

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

    const renderList = () => listT.map((File, k) => isList ? <div className="LI" key={File._id} style={{ borderRadius: '4px', position: 'relative' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Link style={{ textDecoration: 'none', wordBreak: 'break-all', fontSize: '14px', fontWeight: '400' }} className="mr-auto" to={`/organization/${id}/myspace/user/${File.postedby}/plan/view/${File._id}`}>{File.name}</Link>
            <h6 style={{ color: 'gray', fontSize: '11px', marginTop:'4px', marginRight: '12px', fontWeight: '400' }}>{File.started}</h6>
        </div>
        {active === k && active >= 0 && <div style={pF} onClick={e => setAct(-1)} />}
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginLeft: 'auto' }}>
            <h6 className="item-hover" style={{ position: 'relative', width: 'fit-content' }} onClick={e => setAct(active === k ? -1 : k)}>
                <div style={{ width: '18px', height: '18px', cursor: 'pointer', backgroundImage: `url('${More}')` }} />
                <div className="dropdown-content" style={{ display: `${active === k ? 'flex' : 'none'}`, top: '12px' }}>
                    <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setEP(File); }}>Edit Plan</h6>
                    <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setDel(File._id); }}>Delete Plan</h6>
                </div>
            </h6>
        </div>
    </div> : <div className="col-lg-2 col-4 mFWS" key={k}>
            {active === k && active >= 0 && <div style={pF} onClick={e => setAct(-1)} />}
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginLeft: 'auto' }}>
                <h6 className="item-hover" style={{ position: 'relative', width: 'fit-content' }} onClick={e => setAct(active === k ? -1 : k)}>
                    <div style={{ width: '18px', height: '18px', cursor: 'pointer', backgroundImage: `url('${More}')` }} />
                    <div className="dropdown-content" style={{ display: `${active === k ? 'flex' : 'none'}`, top: '12px' }}>
                        <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setEP(File); }}>Edit Plan</h6>
                        <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setDel(File._id); }}>Delete Plan</h6>
                    </div>
                </h6>
            </div>
            <img src={PlanIco} alt="Plan" style={{ cursor: 'pointer' }} onClick={e => history.push(`/organization/${id}/myspace/user/${File.postedby}/plan/view/${File._id}`)} />
            <Link style={{ textDecoration: 'none', wordBreak: 'break-all', fontSize: '14px', fontWeight: '400', marginTop: '12px', marginLeft: 'auto', marginRight: 'auto' }} to={`/organization/${id}/myspace/user/${File.postedby}/plan/view/${File._id}`}>{File.name}</Link>
            <h6 style={{ color: 'gray', fontSize: '11px', marginTop: '12px', marginRight: '12px', fontWeight: '400' }}>{File.started}</h6>
        </div>);

    return <div className="fLW">
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '20px' }}>
            {renderList()}
        </div>
        {count > 12 && <div className="col-12 bNW">
            <button className="btn btn-nav" onClick={e => onFetch(e, count, -1, -12)}> <div className="fa-ch ch-l" /> Previous</button>
            <button className="btn btn-nav" onClick={e => onFetch(e, count, 1, 12)} >Next <div className="fa-ch ch-r" /></button>
        </div>}
    </div>
}