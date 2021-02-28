import React, { lazy, Suspense, useState } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import { fetchTicket, fetchTicketSearch } from '../../../redux/actions/ticketActions';
import { Link } from 'react-router-dom';
import Bolt from '../../../assets/bolt.svg';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import CalAsc from '../../../assets/calendar-down.svg';
import CalDes from '../../../assets/calendar-up.svg';
import Tabnav from '../../tabnav';
const TicketList = lazy(() => import('./item'));
const dF = { display: 'flex', justifyContent: 'flex-end' };
const eS = { textAlign: 'center', marginTop: '50px' };
const mT = { marginRight: '12px' };
const mTop = { marginTop: '16px' };
const List = ({ fetchTicket, fetchTicketSearch, TicketData, isSuc, profile, handleS, handleL, handleLM, limit, string, limitMult, tabNav, setTN }) => {

    const [ord, setO] = useState(0);

    const onhandleInput = e => handleS(e.target.value);

    const fetch = (e, count, i, j) => {
        e.preventDefault();
        if ((limit < count && i > 0) || (limit > 12 && i < 0)) {
            var data = { limit: limitMult + i, string: string };
            var upgradeLimit = limit + j;
            handleL(upgradeLimit); handleLM(data.limit);
            !string ? fetchTicket(data) : fetchTicketSearch(data);
        }
    }

    const handleSearch = e => {
        e.preventDefault();
        var data = { limit: 0, string: string };
        handleL(12); handleLM(0);
        !string ? fetchTicket(data) : fetchTicketSearch(data);
    }

    var count = 0;
    var list = [];

    if (isSuc) {
        count = TicketData.count;
        list = TicketData.data;
    }

    return <div className="col-11 sup-w p-0">
        <h4 className="h">Ticket</h4>
        <Tabnav items={['Tickets']} i={tabNav} setI={setTN} />
        <div style={dF}>
            <Link className="btn btn-dark" to={`/organization/${profile.current_employer ? profile.current_employer._id : ''}/ticket/create`} style={mT}>Generate ticket<div className="faS" style={{ backgroundImage: `url('${Bolt}')` }} /></Link>
        </div>
        <div style={dF}>
            <div className="input-group col-lg-4 col-12 p-0" style={mTop}>
                <input type="text" className="form-control corner-rounded" placeholder="Ticket title" value={string} onChange={e => onhandleInput(e)} onKeyPress={e => e.key === 'Enter' && handleSearch(e)} />
                <div className="input-group-append">
                    <button className="btn btn-outline-secondary" type="button" onClick={e => handleSearch(e)} ><div className="faH" /></button>
                </div>
            </div>
        </div>
        <div style={dF}>
            <div className={`order ${ord < 2 ? 'orderA' : ''}`} onClick={e => setO(ord >= 2 ? 0 : ord === 0 ? 1 : 0)}>
                <img src={ord === 1 ? CalAsc : CalDes} alt="Icon" style={{ width: '100%' }} />
                <span className="tooltip">Sort By Date</span>
            </div>
            <div className={`order ${ord >= 2 ? 'orderA' : ''}`} onClick={e => setO(ord < 2 ? 2 : ord === 2 ? 3 : 2)}>
                <img src={ord === 3 ? SortZA : SortAZ} alt="Icon" style={{ width: '100%' }} />
                <span className="tooltip">Sort By Name</span>
            </div>
        </div>
        {isSuc && count > 0 && list.length > 0 ? <Suspense fallback={<></>}> <TicketList list={list} ord={ord} count={count} onFetch={fetch} /> </Suspense> : <div> <h6 className="sup-n" style={eS}>No ticket found</h6></div>}
    </div>
}

const mapStateToProps = state => {
    return {
        TicketData: state.Ticket.list,
        isSuc: state.Ticket.isSuc
    }
}

export default connect(mapStateToProps, { fetchTicket, fetchTicketSearch })(List);