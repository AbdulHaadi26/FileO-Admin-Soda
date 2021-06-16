import React from 'react';
import Link from 'react-router-dom/Link';
import './style.css';
import Rocket from '../../../assets/project-icons/the-rocket.svg';
import Airline from '../../../assets/project-icons/airline.svg';
import Badge from '../../../assets/project-icons/badge.svg';
import Bank from '../../../assets/project-icons/bank.svg';
import Book from '../../../assets/project-icons/book.svg';
import Chip from '../../../assets/project-icons/chip.svg';
import Factory from '../../../assets/project-icons/factory.svg';
import Finance from '../../../assets/project-icons/finance.svg';
import Government from '../../../assets/project-icons/government.svg';
import Hospital from '../../../assets/project-icons/hospital.svg';
import MegaPhone from '../../../assets/project-icons/megaphone.svg';
import Movies from '../../../assets/project-icons/movies.svg';
import Pills from '../../../assets/project-icons/pills.svg';
import Sales from '../../../assets/project-icons/sales.svg';
import Sports from '../../../assets/project-icons/sports.svg';
import history from '../../../utils/history';

let listI = [
    { img: Rocket, text: 'Default' }, { img: Airline, text: 'Airlines' },
    { img: Badge, text: 'NGO' }, { img: Bank, text: 'Bank' }, { img: Book, text: 'Education' },
    { img: Chip, text: 'Technical' }, { img: Factory, text: 'Manufacturing' }, { img: Finance, text: 'Finance' },
    { img: Government, text: 'Government' }, { img: Hospital, text: 'Hospital' },
    { img: MegaPhone, text: 'Marketing' }, { img: Movies, text: 'Entertainment' }, { img: Pills, text: 'Pharmaceuticals' },
    { img: Sales, text: 'Sales' }, { img: Sports, text: 'Sports' }
];

const dF = { display: 'flex', flexDirection: 'row', marginTop: '12px', width: '100%', flexWrap: 'wrap' };

export default ({ list, count, ord, onFetch, isList }) => {

    var listT = [];
    listT = listT.concat(list);

    switch (ord) {
        case 0: listT = listT.sort(function Sort(a, b) {
            var textA = a.projId && a.projId.name.toLowerCase();
            var textB = b.projId && b.projId.name.toLowerCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        }); break;
        case 1: listT = listT.sort(function Sort(a, b) {
            var textA = a.projId && a.projId.name.toLowerCase();
            var textB = b.projId && b.projId.name.toLowerCase();
            return (textA > textB) ? -1 : (textA > textB) ? 1 : 0;
        }); break;
        default: listT = list; break;
    }

    const renderList = () => listT.map((Item, k) => isList ? <div className="LI" key={Item._id}>
        <img src={listI[Item.projId.icon ? Item.projId.icon : 0].img} alt={listI[Item.projId.icon ? Item.projId.icon : 0].text} style={{ cursor: 'pointer', width: '30px', height: '30px' }}
            onClick={e => history.push(`/organization/${Item.org}/projects/${Item.projId._id}/categories/list/page/0`)} />
        {Item.projId && <Link style={{ marginLeft: '12px' }} className="mr-auto" to={`/organization/${Item.org}/projects/${Item.projId._id}/categories/list/page/0`}>{Item.projId ? Item.projId.name : ''}</Link>}
    </div> : <div className="col-lg-2 col-4 mFWS" key={k}>
            <img src={listI[Item.projId.icon ? Item.projId.icon : 0].img} alt={listI[Item.projId.icon ? Item.projId.icon : 0].text} style={{ cursor: 'pointer' }}
                onClick={e => history.push(`/organization/${Item.org}/projects/${Item.projId._id}/categories/list/page/0`)} />
            <Link style={{ textDecoration: 'none', wordBreak: 'break-all', fontSize: '14px', fontWeight: '400', marginTop: '12px', marginLeft: 'auto', marginRight: 'auto' }} to={`/organization/${Item.org}/projects/${Item.projId._id}/categories/list/page/0`}>{Item.projId ? Item.projId.name : ''}</Link>
        </div>);

    return <>
        <div className="col-12 p-0" style={dF}>{renderList(list)}</div>
        {count > 12 && <div className="pLW">
            <div className="col-12 bNW">
                <button className="btn btn-nav" onClick={e => onFetch(e, count, -1, -12)}> <div className="fa-ch ch-l" /> Previous</button>
                <button className="btn btn-nav" onClick={e => onFetch(e, count, 1, 12)} >Next <div className="fa-ch ch-r" /></button>
            </div>
        </div>}
    </>
}