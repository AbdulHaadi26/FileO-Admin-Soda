import React, { lazy, Suspense, useState } from 'react';
import '../style.css';
import history from '../../../utils/history';
import Link from 'react-router-dom/Link';
import AddPlan from '../modals/addPlan';
import { registerPlan } from '../../../redux/actions/planActions';
import { connect } from 'react-redux';
const ModalStorage = lazy(() => import('../modelStorage'));
const Dash = lazy(() => import('../lists/Dashes'));
const FileList = lazy(() => import('../lists/FileList'));
const Storage = lazy(() => import('../lists/OrgStorage'));

const Admin = ({ data, profile, registerPlan }) => {
    const [modal, setModal] = useState(false), [kI, setKI] = useState(false);
    const { userCount, roleCount, fileCount, org, fileList } = data;
    const { data_uploaded, available, combined_plan, bucketSize } = org;

    let percent = 0;

    if (combined_plan && data_uploaded) {
        percent = (Number(data_uploaded) * 100) / Number(combined_plan);
    }

    const handleAdd = (text, date) => {
        let data = { name: text, org: org._id, _id: profile._id, date };
        registerPlan(data);
    };

    const handleModal = (e, val) => setModal(val);

    const renderLists = () => <Suspense fallback={<></>}>
        <div className="col-12 p-0 dDIW">
            <FileList fileList={fileList} current_employer={org} i={0} />
        </div>
    </Suspense>

    const renderOptions = () => {
        let list = [
            { name: 'Add User', img: 'Man', link: `/organization/${org._id}/employee/add` },
            { name: 'Add Task', img: 'Task', link: `/organization/${org._id}/myspace/user/${profile._id}/tasks/add` },
            { name: 'Add Note', img: 'Note', link: `/organization/${org._id}/myspace/user/${profile._id}/notes/add` },
            { name: 'Add Plan', img: 'Cal', link: `` },
        ];

        return list.map((item, k) => <div className="col-lg-3 col-12" key={k} onClick={e => item.link ? history.push(item.link) : setKI(k)}>
            <div className="dsh-item col-12">
                <div className={`img ${item.img}`} />
                <h6>{item.name}</h6>
            </div>
        </div>);
    }

    return <div className="col-11 d-w p-0">
        <h4 className="h">Dashboard</h4>
        <h6 className="sH">Overview</h6>
        <div className="col-12 p-0 dsh p-0">
            {org && <Suspense fallback={<></>}><Dash org={org} u={userCount} r={roleCount} f={fileCount} /></Suspense>}
        </div>
        <h6 className="sH">Quick Access</h6>
        <div className="list-head" style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
            {renderOptions()}
        </div>
        <h6 className="sH">Recent Uploads</h6>
        <div className="list-head" style={{ width: '100%', display: 'flex', flexDirection: 'row' }}>
            {['Name', 'Location', 'Uploaded'].map((item, k) => <div className={k === 0 ? 'col-lg-5 col-12' : k === 2 ? 'col-3 hide' : 'col-4 hide'} key={k}>
                <h6>{item}</h6>
            </div>)}
        </div>
        <div className="col-12 p-0 dsh p-0">
            {org && renderLists()}
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Link style={{ marginTop: '16px', fontWeight: '600', marginRight: '12px', fontSize: '16px' }} to={`/organization/${org._id}/all/files/page/0`}>See All</Link>
        </div>
        <h6 className="sH">Storage</h6>
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
        <Storage data_uploaded={bucketSize} combined_plan={((combined_plan - bucketSize) > 0 ? (combined_plan - bucketSize) : 0)} />


        {kI === 3 && <AddPlan onhandleAdd={(text, date) => handleAdd(text, date)} onhandleModal={e => setKI(false)} />}
    </div>
}

export default connect(null, { registerPlan })(Admin);