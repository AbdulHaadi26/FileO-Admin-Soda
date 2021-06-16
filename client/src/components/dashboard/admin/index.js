import React, { lazy, Suspense, useState } from 'react';
import '../style.css';
import history from '../../../utils/history';
import Link from 'react-router-dom/Link';
import AddPlan from '../modals/addPlan';
import { registerPlan } from '../../../redux/actions/planActions';
import { connect } from 'react-redux';
import { billingReminder, generateOrderUpt } from '../../../redux/actions/organizationActions';
import EasyPaisa from '../../../components/modals/easyPaisa';
import SelectTypeE from '../../../components/modals/selectTypeE';
import Searchbar from '../../searchbar';
import Media from '../../../assets/dashboard/Media.svg';
import Docs from '../../../assets/dashboard/Docs.svg';
import Others from '../../../assets/dashboard/Others.svg';
import Images from '../../../assets/dashboard/Images.svg';
import Storage from '../../../assets/dashboard/Storage.svg';
const ModalStorage = lazy(() => import('../modelStorage'));
const Dash = lazy(() => import('../lists/Dashes'));
const FileList = lazy(() => import('../lists/FileList'))

const Admin = ({ data, profile, registerPlan, generateOrderUpt, billingReminder }) => {

    const [modal, setModal] = useState(false), [kI, setKI] = useState(false);

    const { userCount, roleCount, fileCount, org, fileList, orgFileCount, mediaCount, otherCount, imageCount, docCount } = data;

    const { data_uploaded, available, combined_plan, bucketSize, isDisabled, active_plan, last_upgraded, isTrail } = org;

    const [oId, setOId] = useState(''), [type, setType] = useState('');

    let percent = 0;

    if (combined_plan && data_uploaded) {
        percent = (Number(data_uploaded) * 100) / Number(combined_plan);
    }

    const handleAdd = (text, date) => {
        let data = { name: text, org: org._id, _id: profile._id, date };
        registerPlan(data);
    };

    const generateOrder = async (data) => {
        let order = await generateOrderUpt(data);

        if (order) {
            setOId(order);
        }
        setModal(false);
    };

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

        return list.map((item, k) => <div className="col-lg-3 col-6" key={k} onClick={e => {
            if (!isDisabled) item.link ? history.push(item.link) : setKI(k)
        }}>
            <div className="dsh-item col-12">
                <div style={{ padding: '12px', backgroundColor: 'white', borderRadius: '4px',  border: `1px solid #dedcdc` }}>
                    <div className={`img ${item.img}`} />
                </div>
                <h6 style={{ fontSize: '16px', fontWeight: '400' }}>{item.name}</h6>
            </div>
        </div>);
    }

    const renderOptions2 = () => {
        let list = [
            { name: 'Admin', img: 'folders', link: `/organization/${org._id}/files/categories` },
            { name: 'Project', img: 'folders', link: `/organization/${org._id}/user/${profile._id}/projects/list` },
            { name: 'Personal', img: 'folders', link: `/organization/${org._id}/myspace/user/${profile._id}/category/list` },
            { name: 'Client', img: 'folders', link: `/organization/${org._id}/user/${profile._id}/clients/category/list` },
        ];

        return list.map((item, k) => <div className="col-lg-3 col-6" style={{ marginBottom: '12px' }} key={k} onClick={e => {
           history.push(item.link)
        }}>
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
                <Searchbar org={org._id} pId={profile._id} />
            </div>
            <h6 className="sH">Overview</h6>
            <div className="dsh">
                {org && <Suspense fallback={<></>}><Dash org={org} u={userCount} r={roleCount} f={fileCount} orgCount={org.userCount} fileStr={bucketSize} orgStorage={combined_plan} /></Suspense>}
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
                width: '100%', display: 'flex', flexDirection: 'row', backgroundColor: 'white',  border: '1px solid #dedcdc',
                padding: '12px', borderRadius: '8px'
            }}>
                {['Name', 'Location', 'Uploaded On'].map((item, k) => <div className={k === 0 ? 'col-lg-5 col-12' : k === 2 ? 'col-3 hide' : 'col-4 hide'} key={k}>
                    <h6>{item}</h6>
                </div>)}
            </div>
            <div className="dsh p-0">
                {org && renderLists()}
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Link style={{ marginTop: '16px', fontWeight: '400', marginRight: '12px', fontSize: '16px', marginBottom: '16px' }} to={`/organization/${org._id}/all/files/page/0`}>See All</Link>
            </div>
            {modal && <ModalStorage data_uploaded={data_uploaded} active_plan={active_plan} last_upgraded={last_upgraded}
                combined_plan={combined_plan} available={available} percent={percent} org={org && org._id}
                onhandleModal={e => {
                    setModal(false);
                }} submitData={(data, pkg) => {
                    generateOrder(data);
                }} />}

            {oId && !type && <SelectTypeE onhandleModal={e => {
                setOId('');
            }} onNext={item => {
                setType(item === 1 ? 'MA_PAYMENT_METHOD' : 'CC_PAYMENT_METHOD');
            }} />}
            {oId && type && <EasyPaisa onHandleModal={e => {
                setType('');
                setOId('');
            }} order={oId} type={type} />}

            {kI === 3 && <AddPlan onhandleAdd={(text, date) => handleAdd(text, date)} onhandleModal={e => setKI(false)} />}
        </div>
        <div className="col-lg-3 col-12" style={{ backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column', padding: '30px 21px'}}>
            <h3 className="h" style={{ fontSize: '24px' }}>Admin Files</h3>
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
                <h3 style={{ width: '60%', fontSize: '16px', fontWeight: '600', marginTop: '12px' }}>Team Storage</h3>
                <div className="progress" style={{ height: '8px', width: '100%', borderRadius: '1000px', marginTop: '12px', marginBottom: '12px' }}>
                    <div className="progress-bar" role="progressbar" style={{ width: `${Math.floor((bucketSize / combined_plan) * 100)}%`, backgroundColor: '#008CBD' }} aria-valuenow={Math.floor((data_uploaded / combined_plan) * 100)} aria-valuemin={0} aria-valuemax={100}></div>
                </div>
                <h6 style={{ width: '80%', margin: '12px auto', fontSize: '12px', textAlign: 'center' }}>{bucketSize.toFixed(2)} GB of {combined_plan.toFixed(2)} GB Used</h6>
            </div>
            <h6 onClick={e => !isTrail ? setModal(true) : billingReminder(2)} className="btn btn-upt"
                style={{ margin: '12px auto', fontSize: '14px', cursor: 'pointer', fontWeight: '400' }}>Upgrade Storage</h6>
        </div>
    </div>
}

export default connect(null, { registerPlan, generateOrderUpt, billingReminder })(Admin);
