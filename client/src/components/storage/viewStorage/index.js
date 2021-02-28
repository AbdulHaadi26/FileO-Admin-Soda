import React, { Suspense, lazy, useState } from 'react';
import '../style.css';
import Tabnav from '../../tabnav';
const Storage = lazy(() => import('./storage'));
const ModalStorage = lazy(() => import('../modelStorage'));

export default ({ Org, onRefresh, tabNav, setTN }) => {
    const [modal, setModal] = useState(false);
    let org = Org;
    const { active_plan, combined_plan, available, data_uploaded, bucketSize } = Org;

    let percent = 0;

    if (combined_plan && data_uploaded) {
        percent = (Number(data_uploaded) * 100) / Number(combined_plan);
    }

    var data = {
        labels: ['Free Space', 'Used Space'],
        datasets: [{ data: [((combined_plan - bucketSize) > 0 ? (combined_plan - bucketSize) : 0).toFixed(4), bucketSize.toFixed(4)], backgroundColor: ['#40739e', '#e1b12c'], hoverBackgroundColor: ['#487eb0', '#fbc531'] }]
    };

    const handleModal = (e, val) => setModal(val);

    return <div className="col-11 str-w p-0">
        <h4 className="h">Storage</h4>
        <Tabnav items={['Storage']} i={tabNav} setI={setTN} />
        <div className="strI">
            <h6 className="dyna mr-auto">Active Plan</h6>
            <h6 className="static" style={{ textAlign: 'right', marginRight: '12px' }}>{active_plan && active_plan.name ? active_plan.name : 'None'}</h6>
            <div className="faN mr-auto" onClick={e => onRefresh()}><div className="refresh" /></div>
        </div>
        <div className="str-dsh">
            <h6 style={{ fontSize: '18px', color: 'grey', fontWeight: '500' }}>Overall Storage:</h6>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h6 style={{ fontSize: '14px', color: 'grey' }}>{bucketSize ? bucketSize.toFixed(2) : 0} GB / {combined_plan ? combined_plan.toFixed(2) : 0} GB</h6>
                <div className="progress" style={{ height: '6px', width: '100%' }}>
                    <div className="progress-bar" role="progressbar" style={{ width: `${percent}%` }} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}></div>
                </div>
            </div>
            <h6 style={{ fontSize: '16px', color: 'grey', fontWeight: '400' }}>{Math.floor(percent)}% Used</h6>
            <button className="btn btn-str" type="button" onClick={e => setModal(false)}>Upgrade Storage</button>
        </div>
        {modal && <ModalStorage data_uploaded={data_uploaded} combined_plan={combined_plan} available={available}
            percent={percent} org={org && org._id} users={org && org.userCount} onhandleModal={handleModal} />}
        {active_plan && active_plan.name && <Suspense fallback={<></>}>
            <Storage data={data} />
        </Suspense>}
    </div>
}
