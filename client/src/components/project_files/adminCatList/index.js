import React, { lazy, Suspense, useState } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import CalAsc from '../../../assets/calendar-down.svg';
import CalDes from '../../../assets/calendar-up.svg';
import ListIco from '../../../assets/list.svg';
import BlockIco from '../../../assets/blocks.svg';
import Tabnav from '../../tabnav';
import Plus from '../../../assets/plus.svg';
import { fetchCombinedP, registerCat, deleteCat, updateCat } from '../../../redux/actions/project_categoryActions';
import AddFolder from '../modals/addFolder';
import EditFolder from '../modals/editFolder';
import DeleteModal from '../../containers/deleteContainer';
import AddFile from '../modals/addFile';
const List = lazy(() => import('./folderList'));
const dF = { display: 'flex', justifyContent: 'flex-end', width: '100%' };
const fS = { margin: '12px 12px 12px 12px', fontWeight: '400' };
const eS = { textAlign: 'center', marginTop: '50px', marginBottom: '80px', width: '100%' };
const mT = { marginTop: '16px' };

const Admin = ({
    pId, fetchCombinedP, catData, isSuc, org, project, string, isList, handleS, tabNav, setTN, handleISL, getList,
    deleteCat, updateCat, registerCat, profile, setting
}) => {
    const [ord, setO] = useState(0), [modalAdd, setMA] = useState(false), [modalDel, setMD] = useState(false),
        [modalUpt, setMUpt] = useState(false), [catId, setCID] = useState(false);

    const onhandleS = e => handleS(e.target.value);

    const handleSearch = (e, num) => {
        e.preventDefault();
        let data = { _id: pId, string: string };
        fetchCombinedP(data);
    }

    let list = [];

    if (isSuc && catData && catData.catList) {
        list = catData.catList;
    }


    const handleAdd = async (text, desc) => {
        let data = { _id: org, name: text, pId: pId, desc };
        await registerCat(data);
        getList();
    };

    const handleUpt = async (id, text, desc) => {

        let data = {
            _id: id,
            value: text,
            pId: pId,
            desc: desc
        };

        await updateCat(data);
        getList();
    };

    return <div className="col-11 f-w p-0">
        <h4 className="h">{project && project.project ? project.project.name : ''}</h4>
        {project && project.project && project.project.description && <>
            <h6 className="f-n" style={fS}>{project.project.description}</h6>
        </>}
        <Tabnav items={['Folders']} i={tabNav} setI={setTN} />
        {tabNav === 0 && <div>
            <div style={dF}>
                <button className="btn btn-dark" onClick={e => setMA(true)}>Add folder<div className="faS" style={{ backgroundImage: `url('${Plus}')` }} /></button>
            </div>
            <div style={dF}>
                <div className="input-group" style={mT}>
                    <input type="text" className="form-control" placeholder="Folder name" value={string} onChange={e => onhandleS(e)} onKeyPress={e => e.key === 'Enter' && handleSearch(e, 2)} />
                    <div className="input-group-append">
                        <button className="btn btn-outline-secondary" type="button" onClick={e => handleSearch(e, 2)} ><div className="faH" /></button>
                    </div>
                </div>
            </div>
            <div style={dF}>
                <div className={`order ${ord < 2 ? 'orderA' : ''}`} onClick={e => setO(ord >= 2 ? 0 : ord === 0 ? 1 : 0)}>
                    <img src={ord === 1 ? CalDes : CalAsc} alt="Icon" style={{ width: '100%' }} />
                    <span className="tooltip">Sort By Date</span>
                </div>
                <div className={`order ${ord >= 2 ? 'orderA' : ''}`} style={{ padding: '4px' }} onClick={e => setO(ord < 2 ? 2 : ord === 2 ? 3 : 2)}>
                    <img src={ord === 3 ? SortZA : SortAZ} alt="Icon" style={{ width: '100%' }} />
                    <span className="tooltip">Sort By Name</span>
                </div>
                <div className={`order`} onClick={e => handleISL(!isList)}>
                    <img src={!isList ? ListIco : BlockIco} alt="Icon" style={{ width: '100%' }} />
                    <span className="tooltip">{!isList ? 'List View' : 'Grid View'}</span>
                </div>
            </div>
            {list && list.length > 0 ? <Suspense fallback={<></>}>
                <List list={list} pId={pId} org={org} ord={ord} isList={isList} setMUpt={setMUpt} setMD={setMD} setCID={setCID} />
            </Suspense> : <div> <h6 className="cat-name" style={eS}> No folder found</h6></div>}

            {catId && <AddFile setting={setting && setting.setting} id={org} _id={pId} userId={profile.user._id} catId={catId} onhandleModal={e => setCID(false)} />}

            {modalUpt && <EditFolder txt={modalUpt.name} desc={modalUpt.description ? modalUpt.description : ''} onhandleUpt={(text, desc) => handleUpt(modalUpt._id, text, desc)} onhandleModal={e => setMUpt(false)} />}
            {modalAdd && <AddFolder onhandleAdd={(text, desc) => handleAdd(text, desc)} onhandleModal={e => setMA(false)} />}
            {modalDel && <DeleteModal handleModalDel={e => setMD(false)} handleDelete={async e => {
                await deleteCat(modalDel, '', '');
                getList();
            }}>
                <p style={mT}>Are you sure? </p>
            </DeleteModal>}
        </div>
        }
    </div>
}

const mapStateToProps = state => {
    return {
        isSuc: state.Category.isSuc,
        catData: state.Category.list,
        project: state.Project.data,
        profile: state.Profile.data,
        setting: state.setting.data
    }
}

export default connect(mapStateToProps, { fetchCombinedP, registerCat, deleteCat, updateCat })(Admin);