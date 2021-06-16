import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import { fetchNotification, fetchRequests, readAllNotification } from '../../../redux/actions/personal/notifActions';
import More from '../../../assets/more.svg';
import Tabnav from '../../tabnav';
import history from '../../../utils/history';
import GNotif from '../../../assets/tabnav/G-notifications.svg';
import BNotif from '../../../assets/tabnav/B-notification.svg';
import GPlan from '../../../assets/tabnav/G-Plan.svg';
import BPlan from '../../../assets/tabnav/B-Plan.svg';
const ModalDelete = lazy(() => import('../modelDelAll'));
const bS = { borderBottom: 'solid 1px #dcdde1' };
const NotifList = lazy(() => import('./item'));
const eS = { textAlign: 'center', marginTop: '50px' };
let icons = [
    { G: GNotif, B: BNotif },
    {G: GPlan, B: BPlan}
];

const List = ({ fetchNotification, id, isSuc, notifData, limit, limitMult, handleLM, handleL, readAllNotification, tabNav, setTN }) => {
    const [active, setAct] = useState(false), [modalDel, setMD] = useState(false);
    const node = useRef({});

    useEffect(() => {
       tabNav === 0 && document.addEventListener('mousedown', handleClick, true);
    }, [tabNav]);

    const handleClick = e => {
        if (node && node.current && !node.current.contains(e.target)) {
            setAct(false);
        }
    };

    const setIN = i => {
        history.push(`/personal/notification/list/page/${i}`);
    };

    const handleModalDel = (e, val) => setMD(val);;

    const fetch = (e, count, i, j) => {
        e.preventDefault();
        if ((limit < count && i > 0) || (limit > 12 && i < 0)) {
            let data = { limit: limitMult + i };
            let upgradeLimit = limit + j;
            handleL(upgradeLimit); handleLM(data.limit);
            fetchNotification(data);
        }
    }

    const resetFetch = e => {
        let data = { limit: 0 };
        let upgradeLimit = 12;
        handleL(upgradeLimit); handleLM(data.limit);
        fetchNotification(data);
    }

    var list = [], count = 0;

    if (isSuc && notifData && notifData.data && notifData.count) {
        list = notifData.data;
        count = notifData.count;
    }

    let listOpt = ['Notifications'];


    return <div className="col-11 not-w p-0">
        <h4 className="h">Notification</h4>
        <Tabnav items={listOpt} i={tabNav} setI={setIN} icons={icons} />
        {tabNav === 0 && <>
            <div className="notIM">
                <div className="faN mr-auto" onClick={e => resetFetch(e)}><div className="refresh" /></div>
                <h6 className="count">{limit - 11 <= count ? limit - 11 : count > 0 ? limit + 1 : 0}-{count >= limit ? limit : count} of {count}</h6>
                <div className="faN" onClick={e => fetch(e, count, -1, -12)} ><div className="chevL" /></div>
                <div className="faN" onClick={e => fetch(e, count, 1, 12)} ><div className="chevR" /></div>
                <h6 className={`faN`} style={{ position: 'relative', margin: '0px 8px 0px 8px' }} onClick={e => setAct(!active)}>
                    <div style={{ width: '16px', height: '16px', backgroundImage: `url('${More}')` }} />
                    <div className="dropdown-content" ref={node} style={{ display: `${active ? 'flex' : 'none'}` }}>
                        <h6 className='s-l' style={bS} onClick={e => readAllNotification(id)}>Mark All as Read</h6>
                        <h6 className='s-l' onClick={e => setMD(true)}>Delete  All</h6>
                    </div>
                </h6>
            </div>
            {modalDel && <Suspense fallback={<></>}> <ModalDelete org={id} onhandleModalDel={handleModalDel} /> </Suspense>}
            {isSuc && list.length > 0 && count > 0 ? <Suspense fallback={<></>}> <NotifList id={id} list={list} /> </Suspense> : <div> <h6 className="not-n" style={eS}>No notification found</h6> </div>}
        </>}
    </div>
}
const mapStateToProps = state => {
    return {
        notifData: state.Notification.list,
        isSuc: state.Notification.isSuc
    }
}

export default connect(mapStateToProps, { fetchNotification, readAllNotification, fetchRequests })(List);