import React, { lazy, Suspense, useState } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import Plus from '../../../assets/plus.svg';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import CalAsc from '../../../assets/calendar-down.svg';
import CalDes from '../../../assets/calendar-up.svg';
import LinkI from '../../../assets/link.svg';
import ListIco from '../../../assets/list.svg';
import BlockIco from '../../../assets/blocks.svg';
import Tabnav from '../../tabnav';
import { returnSelectT } from '../../types';
import { fetchCombined, registerCat, updateCatC, deleteCat } from '../../../redux/actions/clientCategoryAction';
import AddFolder from '../modals/addFolder';
import EditFolder from '../modals/editFolder';
import DeleteModal from '../../containers/deleteContainer';
import { deleteFile, getFileDetailsM } from '../../../redux/actions/clientFilesAction';
import EditFile from '../modals/editFile';
const ModalLinkF = lazy(() => import('./modalLinkF'));
const ModalLink = lazy(() => import('./modalLink'));
const FileList = lazy(() => import('./fileList'));
const FolderList = lazy(() => import('./folderList'));
const dF = { display: 'flex', justifyContent: 'flex-end' };
const mT = { marginTop: '16px' };

const ListCat = ({
    fetchCombined, id, _id, handleT, tabNav, setTN, pId, fileData, string, handleS, type, isList, handleISL, getList, registerCat, updateCatC,
    deleteFile, deleteCat, File, getFileDetailsM
}) => {
    const [sM, setSM] = useState(false), [ordF, setOF] = useState(0), [modalUpt, setMUpt] = useState(false), [modalAdd, setMA] = useState(false),
        [modalDel, setMD] = useState(false), [modalDelF, setMDF] = useState(false), [catId, setCID] = useState(false), [eF, setEF] = useState(false);

    const handleSearch = e => {
        e.preventDefault();
        let data = { _id: _id, string: string, type: type };
        fetchCombined(data);
    }

    const handleModal = (e, val) => setSM(val);

    var list = [], listF = [];

    if (fileData) {
        listF = fileData.files;
        list = fileData.catList;
    }

    const handleSelectC = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-key') && handleT(e.target.options[selectedIndex].getAttribute('data-key'));
    }

    const handleAdd = async (text, desc) => {

        let data = {
            _id: id,
            uId: _id,
            name: text,
            desc: desc
        };

        await registerCat(data);
        getList();
    };

    const handleUpt = async (id, text, desc) => {

        let data = {
            _id: id,
            uId: _id,
            value: text,
            desc: desc
        };

        await updateCatC(data);
        getList();
    };

    const renderOptions = () => returnSelectT().map(Item => <option data-key={Item} key={Item}>{Item}</option>);

    const getDetails = (val) => {
        let data = { _id: val, pId: _id };
        getFileDetailsM(data);
    };

    return <div className="col-11 c-d-w p-0">
        <h4 className="h">Client Requests</h4>
        <Tabnav items={['Folders']} i={tabNav} setI={setTN} />
        <div style={dF}>
            <button className="btn btn-dark" onClick={e => setMA(true)}>Add folder<div className="faS" style={{ backgroundImage: `url('${Plus}')` }} /></button>
            <button className="btn btn-dark" style={{ marginLeft: '12px' }} type="button" onClick={e => setSM(true)}>Generate Url<div className="faS" style={{ backgroundImage: `url('${LinkI}')` }} /></button>
        </div>
        <div style={dF}>
            <div className="input-group col-lg-5 col-12" style={mT}>
                <input type="text" className="form-control" placeholder="Enter text here" value={string} onChange={e => handleS(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch(e)} />
                <select className="custom-select col-lg-2 col-4" onChange={e => handleSelectC(e)} defaultValue={type}>
                    {renderOptions()}
                </select>
                <div className="input-group-append">
                    <button className="btn btn-outline-secondary" type="button" onClick={e => handleSearch(e)} ><div className="faH" /></button>
                </div>
            </div>
        </div>
        <div style={dF}>
            <div className={`order ${ordF < 2 ? 'orderA' : ''}`} onClick={e => setOF(ordF >= 2 ? 0 : ordF === 0 ? 1 : 0)}>
                <img src={ordF === 1 ? CalAsc : CalDes} alt="Icon" style={{ width: '100%' }} />
                <span className="tooltip">Sort By Date</span>
            </div>
            <div className={`order ${ordF >= 2 ? 'orderA' : ''}`} style={{ padding: '4px' }} onClick={e => setOF(ordF < 2 ? 2 : ordF === 2 ? 3 : 2)}>
                <img src={ordF === 3 ? SortZA : SortAZ} alt="Icon" style={{ width: '100%' }} />
                <span className="tooltip">Sort By Name</span>
            </div>
            <div className={`order`} onClick={e => handleISL(!isList)}>
                <img src={!isList ? ListIco : BlockIco} alt="Icon" style={{ width: '100%' }} />
                <span className="tooltip">{!isList ? 'List View' : 'Grid View'}</span>
            </div>
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '20px' }}>
            {list && list.length > 0 && <Suspense fallback={<></>}><FolderList id={id} uId={_id} list={list} ord={ordF} isList={isList}
                setMUpt={setMUpt} setMD={setMD} setCID={setCID} /></Suspense>}
            {listF && listF.length > 0 && <Suspense fallback={<></>}>
                <FileList list={listF} isList={isList} ord={ordF} uId={pId} id={id}
                    setMDF={setMDF} setEF={val => { setEF(val); getDetails(val); }} />
            </Suspense>}
        </div>
        {((!listF || listF.length <= 0) && (!list || list.length <= 0)) && <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '30px' }}>
            <h6>Nothing found</h6>
        </div>}


        {eF && File && File.file && <EditFile uId={_id} getList={getList} File={File} onhandleModal={e => setEF(false)} />}
        {sM && <Suspense fallback={<></>}><ModalLink id={id} _id={_id} showModal={handleModal} /></Suspense>}
        {catId && <Suspense fallback={<></>}><ModalLinkF catId={catId} id={id} _id={_id} showModal={e => setCID(false)} /></Suspense>}
        {modalUpt && <EditFolder txt={modalUpt.name} desc={modalUpt.description ? modalUpt.description : ''} onhandleUpt={(text, desc) => handleUpt(modalUpt._id, text, desc)} onhandleModal={e => setMUpt(false)} />}
        {modalAdd && <AddFolder onhandleAdd={(text, desc) => handleAdd(text, desc)} onhandleModal={e => setMA(false)} />}

        {modalDel && <DeleteModal handleModalDel={e => setMD(false)} handleDelete={async e => {
            await deleteCat(modalDel, '', '');
            getList();
        }}>
            <p style={mT}>Are you sure? </p>
        </DeleteModal>}

        {modalDelF && <DeleteModal handleModalDel={e => setMDF(false)} handleDelete={async e => {
            await deleteFile(modalDelF, '', '');
            getList();
        }}>
            <p style={mT}>Are you sure? </p>
        </DeleteModal>}
    </div>
}

const mapStateToProps = state => {
    return {
        fileData: state.File.list,
        File: state.File.data
    }
}

export default connect(mapStateToProps, { fetchCombined, updateCatC, registerCat, deleteCat, deleteFile, getFileDetailsM })(ListCat);