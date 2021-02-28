import React, { lazy, Suspense, useState } from 'react';
import '../style.css';
import Link from 'react-router-dom/Link';
import history from '../../../utils/history';
import { registerReq } from '../../../redux/actions/userActions';
import { connect } from 'react-redux';
import AddPlan from '../modals/addPlan';
import { registerPlan } from '../../../redux/actions/planActions';
const Dash = lazy(() => import('../lists/DashPM'));
const FileList = lazy(() => import('../lists/UserFileList'));
const Storage = lazy(() => import('../lists/UserStorage'));

const Dashboard = ({ data, profile, catId, registerReq, registerPlan }) => {
    const [kI, setKI] = useState(false);
    const { fileCount, fileList, projectCount, empReq } = data;
    const { current_employer, _id, storageLimit, storageUploaded } = profile;

    let percent = 0;

    const sendRequest = () => {
        let data = {
            cats: catId,
            role: false
        };
        registerReq(1, data);
    }

    if (storageLimit && storageUploaded) {
        percent = (Number(storageUploaded) * 100) / Number(storageLimit);
    }

    const renderLists = () => <Suspense fallback={<></>}>
        <div className={`col-12 mDW p-0`}>
            <div className="col-12 p-0 dDIW">
                <FileList fileList={fileList} />
            </div>
        </div>
    </Suspense>


    const handleAdd = async (text, date) => {
        let data = { name: text, org: current_employer._id, _id: profile._id, date };
        registerPlan(data);
    };


    const renderOptions = () => {
        let list = [
            { name: 'View Profile', img: 'Man', link: `/user/profile` },
            { name: 'Add Task', img: 'Task', link: `/organization/${current_employer._id}/myspace/user/${_id}/tasks/add` },
            { name: 'Add Note', img: 'Note', link: `/organization/${current_employer._id}/myspace/user/${_id}/notes/add` },
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
            {<Suspense fallback={<></>}><Dash org={current_employer && current_employer._id} or={current_employer} r={projectCount} f={fileCount} _id={profile && profile._id} /></Suspense>}
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
            {current_employer && renderLists()}
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Link style={{ marginTop: '16px', fontWeight: '600', marginRight: '12px', fontSize: '16px', fontFamily: `'Roboto', serif` }}
                to={`/organization/${current_employer._id}/all/files/page/0`}>See All</Link>
        </div>
        <Suspense fallback={<></>}>
            <h6 className="sH">My Space</h6>
            <div className="str-dsh">
                <h6 style={{ fontSize: '18px', color: 'grey', fontFamily: `'Roboto Slab', serif`, fontWeight: '500' }}>Overall Storage:</h6>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h6 style={{ fontSize: '14px', color: 'grey', fontFamily: `'Playfair Display', serif` }}>{storageUploaded ? storageUploaded.toFixed(2) : 0} GB / {storageLimit ? storageLimit.toFixed(2) : 0} GB</h6>
                    <div className="progress" style={{ height: '6px', width: '100%' }}>
                        <div className="progress-bar" role="progressbar" style={{ width: `${percent}%` }} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}></div>
                    </div>
                </div>
                <h6 style={{ fontSize: '16px', color: 'grey', fontFamily: `'Roboto Slab', serif`, fontWeight: '400' }}>{Math.floor(percent)}% Used</h6>
                {!empReq && <button className="btn btn-str" onClick={e => sendRequest()}>Request Upgrade</button>}
            </div>
            {profile && <Storage storageAvailable={profile.storageAvailable} storageUploaded={profile.storageUploaded} />}
        </Suspense>
        {kI === 3 && <AddPlan onhandleAdd={(text, date) => handleAdd(text, date)} onhandleModal={e => setKI(false)} />}
    </div>
}

export default connect(null, { registerReq, registerPlan })(Dashboard);