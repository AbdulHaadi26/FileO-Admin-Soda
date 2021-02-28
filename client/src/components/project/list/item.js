import React, { useState } from 'react';
import Link from 'react-router-dom/Link';
import './style.css';
import More from '../../../assets/more.svg';
import history from '../../../utils/history';
import Rocket from '../../../assets/project-icons/the-rocket.svg';
import Airline from '../../../assets/project-icons/airline.svg';
import Badge from '../../../assets/project-icons/badge.svg';
import Bank from '../../../assets/project-icons/bank.svg';
import Book from '../../../assets/project-icons/book.svg';
import Chip from '../../../assets/project-icons/airline.svg';
import Factory from '../../../assets/project-icons/factory.svg';
import Finance from '../../../assets/project-icons/finance.svg';
import Government from '../../../assets/project-icons/government.svg';
import Hospital from '../../../assets/project-icons/hospital.svg';
import MegaPhone from '../../../assets/project-icons/megaphone.svg';
import Movies from '../../../assets/project-icons/movies.svg';
import Pills from '../../../assets/project-icons/pills.svg';
import Sales from '../../../assets/project-icons/sales.svg';
import Sports from '../../../assets/project-icons/sports.svg';

let listI = [
    { img: Rocket, text: 'Default' }, { img: Airline, text: 'Airlines' },
    { img: Badge, text: 'NGO' }, { img: Bank, text: 'Bank' }, { img: Book, text: 'Education' },
    { img: Chip, text: 'Technical' }, { img: Factory, text: 'Manufacturing' }, { img: Finance, text: 'Finance' },
    { img: Government, text: 'Government' }, { img: Hospital, text: 'Hospital' },
    { img: MegaPhone, text: 'Marketing' }, { img: Movies, text: 'Entertainment' }, { img: Pills, text: 'Pharmaceuticals' },
    { img: Sales, text: 'Sales' }, { img: Sports, text: 'Sports' }
];

const dF = { display: 'flex', flexDirection: 'row', marginTop: '20px', width: '100%', flexWrap: 'wrap' };
const bS = { borderBottom: 'solid 1px #dcdde1' };
const pF = { position: 'fixed', zIndex: '9998', minHeight: '100vh', backgroundColor: '#000', top: '0', left: '0', opacity: '0.0', minWidth: '100vw' };

export default ({ list, count, ord, onFetch, setTP, setDel, isList }) => {
    const [active, setAct] = useState(false);

    var listT = [];
    listT = listT.concat(list);

    switch (ord) {
        case 0: listT = listT.sort(function Sort(a, b) {
            var textA = a.name.toLowerCase();
            var textB = b.name.toLowerCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        }); break;
        case 1: listT = listT.sort(function Sort(a, b) {
            var textA = a.name.toLowerCase();
            var textB = b.name.toLowerCase();
            return (textA > textB) ? -1 : (textA > textB) ? 1 : 0;
        }); break;
        default: listT = list; break;
    }

    const renderList = () => isList ? listT.map((Item, k) => <div className="LI" key={Item._id}>
        <Link style={{ textDecoration: 'none', wordBreak: 'break-all', fontSize: '14px', fontWeight: '400' }} className="mr-auto" to={`/organization/${Item.org}/projects/${Item._id}/categories/list`}>{Item.name}</Link>
        {active === k && active >= 0 && <div style={pF} onClick={e => setAct(-1)} />}
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginLeft: 'auto' }}>
            <h6 className="item-hover" style={{ position: 'relative', width: 'fit-content' }} onClick={e => setAct(active === k ? -1 : k)}>
                <div style={{ width: '18px', height: '18px', cursor: 'pointer', backgroundImage: `url('${More}')` }} />
                <div className="dropdown-content" style={{ display: `${active === k ? 'flex' : 'none'}`, top: '12px' }}>
                    <h6 className='s-l' style={bS} onClick={e => { setAct(-1); history.push(`/organization/${Item.org}/projects/${Item._id}/employee/list`) }}>Add Participants</h6>
                    <h6 className='s-l' style={bS} onClick={e => { setAct(-1); history.push(`/organization/${Item.org}/projects/${Item._id}/assigned/employee/list`) }}>Edit Participants</h6>
                    <h6 className='s-l' style={bS} onClick={e => { setAct(-1); history.push(`/organization/${Item.org}/projects/${Item._id}/role/list`) }}>View Roles</h6>
                    <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setTP(Item); }}>Edit Project</h6>
                    <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setDel(Item._id); }}>Delete Project</h6>
                </div>
            </h6>
        </div>
    </div>) : listT.map((Item, k) => <div className="col-lg-2 col-4 mFWS" key={k}>
        {active === k && active >= 0 && <div style={pF} onClick={e => setAct(-1)} />}
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginLeft: 'auto' }}>
            <h6 className="item-hover" style={{ position: 'relative', width: 'fit-content' }} onClick={e => setAct(active === k ? -1 : k)}>
                <div style={{ width: '18px', height: '18px', cursor: 'pointer', backgroundImage: `url('${More}')` }} />
                <div className="dropdown-content" style={{ display: `${active === k ? 'flex' : 'none'}`, top: '12px' }}>
                    <h6 className='s-l' style={bS} onClick={e => { setAct(-1); history.push(`/organization/${Item.org}/projects/${Item._id}/employee/list`) }}>Add Participants</h6>
                    <h6 className='s-l' style={bS} onClick={e => { setAct(-1); history.push(`/organization/${Item.org}/projects/${Item._id}/assigned/employee/list`) }}>Edit Participants</h6>
                    <h6 className='s-l' style={bS} onClick={e => { setAct(-1); history.push(`/organization/${Item.org}/projects/${Item._id}/role/list`) }}>View Roles</h6>
                    <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setTP(Item); }}>Edit Project</h6>
                    <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setDel(Item._id); }}>Delete Project</h6>
                </div>
            </h6>
        </div>
        <img src={listI[Item.icon ? Item.icon : 0].img} alt={listI[Item.icon ? Item.icon : 0].text} style={{ cursor: 'pointer' }}
            onClick={e => history.push(`/organization/${Item.org}/projects/${Item._id}/categories/list`)} />
        <Link style={{ textDecoration: 'none', wordBreak: 'break-all', fontSize: '14px', fontWeight: '400', marginTop: '12px', marginLeft: 'auto', marginRight: 'auto' }} to={`/organization/${Item.org}/projects/${Item._id}/categories/list`}>{Item.name}</Link>
    </div>);

    return <>
        <div style={dF}>
            {renderList(list)}
        </div>
        {count > 12 && <div className="pLW">
            <div className="col-12 bNW">
                <button className="btn btn-nav" onClick={e => onFetch(e, count, -1, -12)}> <div className="fa-ch ch-l" /> Previous</button>
                <button className="btn btn-nav" onClick={e => onFetch(e, count, 1, 12)} >Next <div className="fa-ch ch-r" /></button>
            </div>
        </div>}
    </>
}