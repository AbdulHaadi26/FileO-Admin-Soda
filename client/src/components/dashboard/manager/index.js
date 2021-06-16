import React, { lazy, Suspense, useState } from 'react';
import '../style.css';
import Link from 'react-router-dom/Link';
import history from '../../../utils/history';
import { registerReq } from '../../../redux/actions/userActions';
import { connect } from 'react-redux';
import AddPlan from '../modals/addPlan';
import { registerPlan } from '../../../redux/actions/planActions';
import AddProject from '../modals/addProject';
import { registerProject } from '../../../redux/actions/projectActions';
import Searchbar from '../../searchbar';
import Media from '../../../assets/dashboard/Media.svg';
import Docs from '../../../assets/dashboard/Docs.svg';
import Others from '../../../assets/dashboard/Others.svg';
import Images from '../../../assets/dashboard/Images.svg';
import Storage from '../../../assets/dashboard/Storage.svg';
const Dash = lazy(() => import('../lists/DashPM'));
const FileList = lazy(() => import('../lists/UserFileList'));

const Dashboard = ({ data, profile, catId, registerReq, registerPlan, registerProject }) => {
    const [kI, setKI] = useState(false);
    const { fileCount, fileList, projectCount, empReq, mediaCount, docCount, imageCount, otherCount, orgFileCount } = data;
    const { current_employer, _id, storageLimit, storageUploaded, isDisabled } = profile;

    const sendRequest = () => {
        let data = { cats: catId, role: true };
        registerReq(0, data)
    };

    const renderLists = () => <Suspense fallback={<></>}>
        <div className={`col-12 mDW p-0`}>
            <div className="col-12 p-0 dDIW">
                <FileList fileList={fileList} />
            </div>
        </div>
    </Suspense>


    const handleAdd = (text, date) => {
        let data = { name: text, org: current_employer._id, _id: _id, date };
        registerPlan(data);
    };

    const handleAddP = async (text, desc, active, icon) => {

        let data = {
            _id: profile._id, name: text, desc: desc, org: current_employer._id, orgName: current_employer.name, active, icon
        };

        await registerProject(data);

        history.push(`/organization/${current_employer._id}/user/${_id}/projects/list`)
    };


    const renderOptions = () => {
        let list = [
            { name: 'Add Project', img: 'Rocket', link: `` },
            { name: 'Add Task', img: 'Task', link: `/organization/${current_employer._id}/myspace/user/${_id}/tasks/add` },
            { name: 'Add Note', img: 'Note', link: `/organization/${current_employer._id}/myspace/user/${_id}/notes/add` },
            { name: 'Add Plan', img: 'Cal', link: `` },
        ];

        return list.map((item, k) => <div className="col-lg-3 col-6" key={k} onClick={e => {
            if (!isDisabled)
                item.link ? history.push(item.link) : setKI(k)
        }}>
            <div className="dsh-item col-12">
                <div style={{ padding: '12px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #dedcdc' }}>
                    <div className={`img ${item.img}`} />
                </div>
                <h6>{item.name}</h6>
            </div>
        </div>);
    }

    const renderOptions2 = () => {
        let list = [
            { name: 'Admin', img: 'folders', link: `/organization/${current_employer._id}/files/categories` },
            { name: 'Project', img: 'folders', link: `/organization/${current_employer._id}/user/${profile._id}/projects/list` },
            { name: 'Personal', img: 'folders', link: `/organization/${current_employer._id}/myspace/user/${profile._id}/category/list` },
            { name: 'Client', img: 'folders', link: `/organization/${current_employer._id}/user/${profile._id}/clients/category/list` },
        ];

        return list.map((item, k) => <div className="col-lg-3 col-6" style={{ marginBottom: '12px' }} key={k} onClick={e => history.push(item.link)}>
            <div className="dsh-item col-12 bgW" style={{ border: '1px solid #dedcdc' }}>
                <div style={{ width: '100%', padding: '12px', display: 'flex', flexDirection: 'column' }}>
                    <div className={`${item.img}`} style={{ width: '26px', height: '26px', marginLeft: '6px' }} />
                    <h6 style={{ fontSize: '14px', fontWeight: '400', textAlign: 'left', marginBottom: '0px', marginLeft: '0px' }}>{item.name}</h6>
                </div>
            </div>
        </div>);
    }

    return <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
        <div className="col-lg-9 col-12 d-w">
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                <h4 className="h" style={{ marginRight: '12px', marginBottom: '-6px' }}>Dashboard</h4>
                <Searchbar org={current_employer._id} pId={profile._id} />
            </div>
            <h6 className="sH">Overview</h6>
            <div className="dsh p-0">
                {<Suspense fallback={<></>}><Dash r={projectCount} f={fileCount} _id={profile && profile._id}
                    or={current_employer} org={current_employer && current_employer._id} uStr={profile && profile.storageLimit} uptStr={profile && profile.storageUploaded}
                /></Suspense>}
            </div>
            <h6 className="sH">Quick Access</h6>
            <div className="list-head" style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                {renderOptions()}
            </div>
            <h6 className="sH">Folders</h6>
            <div className="list-head" style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                {renderOptions2()}
            </div>
            <h6 className="sH">Recent Uploads</h6>
            <div className="list-head" style={{
                width: '100%', display: 'flex', flexDirection: 'row', backgroundColor: 'white', border: '1px solid #dedcdc',
                padding: '12px', borderRadius: '8px'
            }}>
                {['Name', 'Location', 'Uploaded'].map((item, k) => <div className={k === 0 ? 'col-lg-5 col-12' : k === 2 ? 'col-3 hide' : 'col-4 hide'} key={k}>
                    <h6>{item}</h6>
                </div>)}
            </div>
            <div className="dsh p-0">
                {current_employer && renderLists()}
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Link style={{ marginTop: '16px', fontWeight: '400', marginRight: '12px', fontSize: '16px', marginBottom: '16px' }}
                    to={`/organization/${current_employer._id}/all/files/page/0`}>See All</Link>
            </div>

            {kI === 3 && <AddPlan onhandleAdd={(text, date) => handleAdd(text, date)} onhandleModal={e => setKI(false)} />}

            {kI === 0 && <AddProject onhandleAdd={(text, desc, act, icon) => handleAddP(text, desc, act, icon)} onhandleModal={e => setKI(false)} />}
        </div>
        <div className="col-lg-3 col-12" style={{ backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column', padding: '30px 21px', border: '1px solid #dedcdc' }}>
            <h3 className="h" style={{ fontSize: '24px' }}>My Space</h3>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                <h6 style={{ fontSize: '12px' }}>{orgFileCount} Files</h6>
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', marginTop: '12px' }}>
                <img src={Docs} alt="Docs" style={{ width: '30px', height: '30px', marginRight: '12px' }}></img>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <h6 style={{ fontSize: '12px' }}>Docs</h6>
                        <h6 style={{ fontSize: '12px' }}>{Math.floor((docCount !== 0 || orgFileCount !== 0) ? ((docCount / orgFileCount) * 100) : 0)}%</h6>
                    </div>
                    <div className="progress" style={{ height: '4px', width: '100%', borderRadius: '1000px' }}>
                        <div className="progress-bar" role="progressbar" style={{ width: `${Math.floor((docCount !== 0 || orgFileCount !== 0) ? ((docCount / orgFileCount) * 100) : 0)}%`, backgroundColor: '#008CBD' }} aria-valuenow={Math.floor((docCount / orgFileCount) * 100)} aria-valuemin={0} aria-valuemax={100}></div>
                    </div>
                </div>
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', marginTop: '30px' }}>
                <img src={Media} alt="Media" style={{ width: '30px', height: '30px', marginRight: '12px' }}></img>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <h6 style={{ fontSize: '12px' }}>Media</h6>
                        <h6 style={{ fontSize: '12px' }}>{Math.floor((mediaCount !== 0 || orgFileCount !== 0) ? ((mediaCount / orgFileCount) * 100) : 0)}%</h6>
                    </div>
                    <div className="progress" style={{ height: '4px', width: '100%', borderRadius: '1000px' }}>
                        <div className="progress-bar" role="progressbar" style={{ width: `${Math.floor((mediaCount !== 0 || orgFileCount !== 0) ? ((mediaCount / orgFileCount) * 100) : 0)}%`, backgroundColor: '#008CBD' }} aria-valuenow={80} aria-valuemin={0} aria-valuemax={100}></div>
                    </div>
                </div>
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', marginTop: '30px' }}>
                <img src={Images} alt="Images" style={{ width: '30px', height: '30px', marginRight: '12px' }}></img>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <h6 style={{ fontSize: '12px' }}>Images</h6>
                        <h6 style={{ fontSize: '12px' }}>{Math.floor((imageCount !== 0 || orgFileCount !== 0) ? ((imageCount / orgFileCount) * 100) : 0)}%</h6>
                    </div>
                    <div className="progress" style={{ height: '4px', width: '100%', borderRadius: '1000px' }}>
                        <div className="progress-bar" role="progressbar" style={{ width: `${Math.floor((imageCount !== 0 || orgFileCount !== 0) ? ((imageCount / orgFileCount) * 100) : 0)}%`, backgroundColor: '#008CBD' }} aria-valuenow={Math.floor((imageCount / orgFileCount) * 100)} aria-valuemin={0} aria-valuemax={100}></div>
                    </div>
                </div>
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', marginTop: '30px' }}>
                <img src={Others} alt="Others" style={{ width: '30px', height: '30px', marginRight: '12px' }}></img>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <h6 style={{ fontSize: '12px' }}>Others</h6>
                        <h6 style={{ fontSize: '12px' }}>{Math.floor((otherCount !== 0 || orgFileCount !== 0) ? ((otherCount / orgFileCount) * 100) : 0)}%</h6>
                    </div>
                    <div className="progress" style={{ height: '4px', width: '100%', borderRadius: '1000px' }}>
                        <div className="progress-bar" role="progressbar" style={{ width: `${Math.floor((otherCount !== 0 || orgFileCount !== 0) ? ((otherCount / orgFileCount) * 100) : 0)}%`, backgroundColor: '#008CBD' }} aria-valuenow={Math.floor((docCount / orgFileCount) * 100)} aria-valuemin={0} aria-valuemax={100}></div>
                    </div>
                </div>
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', position: 'relative', marginTop: '60px', backgroundColor: '#3AAED5', borderRadius: '8px', color: 'white', padding: '18px 12px' }}>
                <img src={Storage} alt="Storage" style={{ width: '100px', position: 'absolute', top: '-24px', right: '12px' }} />
                <h3 style={{ width: '60%', fontSize: '16px', fontWeight: '600', marginTop: '12px' }}>My Space Storage</h3>
                <div className="progress" style={{ height: '8px', width: '100%', borderRadius: '1000px', marginTop: '12px', marginBottom: '12px' }}>
                    <div className="progress-bar" role="progressbar" style={{ width: `${Math.floor((storageUploaded / storageLimit) * 100)}%`, backgroundColor: '#008CBD' }} aria-valuenow={Math.floor((storageUploaded / storageLimit) * 100)} aria-valuemin={0} aria-valuemax={100}></div>
                </div>
                <h6 style={{ width: '80%', margin: '12px auto', fontSize: '12px', textAlign: 'center' }}>{storageUploaded.toFixed(2)} GB of {storageLimit.toFixed(2)} GB Used</h6>
            </div>
            {!empReq && <h6 onClick={e => sendRequest()} className="btn btn-upt"
                style={{ margin: '12px auto', fontSize: '14px', cursor: 'pointer', fontWeight: '400' }}>Request Upgrade</h6>}
        </div>
    </div>
}

export default connect(null, { registerReq, registerPlan, registerProject })(Dashboard);
