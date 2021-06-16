import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import CalAsc from '../../../assets/calendar-down.svg';
import CalDes from '../../../assets/calendar-up.svg';
import ListIco from '../../../assets/list.svg';
import BlockIco from '../../../assets/blocks.svg';
import More from '../../../assets/elpW.svg';
import Searchbar from '../../searchbarReusable';
import Tabnav from '../../tabnav';
import { returnSelectT } from '../../types';
import {
    fetchCombined,
    registerCat,
    updateCatC,
    deleteCat
} from '../../../redux/actions/clientCategoryAction';
import AddFolder from '../modals/addFolder';
import EditFolder from '../modals/editFolder';
import DeleteModal from '../../containers/deleteContainer';
import {
    deleteFile,
    getFileDetailsM,
    cutFile
} from '../../../redux/actions/clientFilesAction';
import EditFile from '../modals/editFile';
import FolderList from './folderList';
import FileList from './fileList';
import UploadClientFile from '../../uploadModal/uploadClientFile';
import { DragDropContext } from 'react-beautiful-dnd';
import GFolder from '../../../assets/tabnav/G-folder.svg';
import BFolder from '../../../assets/tabnav/B-folder.svg';
let icons = [{ G: GFolder, B: BFolder }];
const ModalLinkF = lazy(() => import('./modalLinkF'));
const ModalLink = lazy(() => import('./modalLink'));

const mT = {
    marginTop: '16px'
};

const ListCat = ({
    fetchCombined, id, _id, handleT, tabNav, setTN, pId, fileData, string, handleS, type, isList, handleISL, registerCat, updateCatC,
    deleteFile, deleteCat, File, getFileDetailsM, cutFile, disabled
}) => {
    const [sM, setSM] = useState(false), [ordF, setOF] = useState(0), [modalUpt, setMUpt] = useState(false), [modalAdd, setMA] = useState(false), [active, setAct] = useState(false),
        [modalDel, setMD] = useState(false), [modalDelF, setMDF] = useState(false), [catId, setCID] = useState(false), [eF, setEF] = useState(false);

    const node = useRef({});

    useEffect(() => {
        document.addEventListener('mousedown', handleClick, true);
        return
    }, []);

    const handleClick = e => {
        if (node && node.current && !node.current.contains(e.target)) {
            setAct(false);
        }
    };

    const handleSearch = e => {
        e.preventDefault();
        let data = { _id: _id, string: string, type: type === 'All' ? type : type.toLowerCase() };
        fetchCombined(data);
    };

    const handleModal = (e, val) => setSM(val);

    var list = [], listF = [];

    if (fileData) {
        listF = fileData.files;
        list = fileData.catList;
    }

    const handleSelectC = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-key') && handleT(e.target.options[selectedIndex].getAttribute('data-key'));
    };

    const handleAdd = async (text, desc) => {

        let data = {
            _id: id,
            uId: _id,
            name: text,
            desc: desc
        };

        await registerCat(data);
    };

    const handleUpt = async (id, text, desc) => {

        let data = {
            _id: id,
            uId: _id,
            value: text,
            desc: desc
        };

        await updateCatC(data);
    };

    const renderOptions = () => returnSelectT().map(Item => <option data-key={Item} key={Item}>{Item}</option>);

    const getDetails = (val) => {
        let data = { _id: val, pId: _id };
        getFileDetailsM(data);
    };

    const handleOnDragEnd = async (data) => {
        if (data && data.source && data.destination) {
            let destination = data.destination.droppableId.split('-');
            let source = data.source.droppableId.split('-');
            if (destination[destination.length - 2] === 'Folder' && source[source.length - 2] === 'File') {
                let folderId = destination[destination.length - 1];
                let fileId = source[source.length - 1];
                await cutFile({ _id: fileId, cat: folderId });
            }
        }
    };

    return <div className="col-11 c-d-w p-0">
        <div className="JSC" style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <h4 className="h">Client Requests</h4>
            <div style={{ marginLeft: 'auto' }} />
            <Searchbar isCreate={true} classN={true ? `col-lg-7 col-12` : 'col-lg-4 col-12'} pad={true} value={string} onHandleInput={val => handleS(val)}
                callFunc={e => !disabled && setMA(true)} isElp={true} callSub={e => setAct(!active)}
                holder={'Enter text here'} handleSearch={e => handleSearch(e)} comp={<>
                    <div style={{ height: '30px', margin: 'auto 2px', width: '2px', backgroundColor: '#f9f9f9' }}></div>
                    <select className="custom-select col-3" onChange={e => handleSelectC(e)} value={type}>
                        {renderOptions()}
                    </select>
                </>}>
                <h6 className={`mTHS`} style={{ padding: '10px 8px 6px 8px', position: 'relative', marginTop: '0px', marginBottom: '0px', marginRight: '-3px' }}>
                    <div className="more" onClick={e => setAct(true)}
                        style={{
                            width: '14px', height: '14px', marginRight: '-3px', cursor: 'pointer',
                            backgroundImage: `url('${More}')`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat'
                        }} />
                    <div className="dropdown-content-c" ref={node} style={{ display: `${active ? 'flex' : 'none'}` }}>
                        <h6 className='s-l' onClick={e => { setAct(false); !disabled && setSM(true); }}>Generate Url</h6>
                    </div>
                </h6>
            </Searchbar>
            <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: '12px' }}>
                <div className={`order mTHS ${ordF < 2 ? 'orderA' : ''}`} style={{ marginLeft: '12px', marginTop: '0px' }} onClick={e => setOF(ordF >= 2 ? 0 : ordF === 0 ? 1 : 0)}>
                    <img src={ordF === 1 ? CalAsc : CalDes} alt="Icon" style={{ width: '100%' }} />
                    <span className="tooltip">Sort By Date</span>
                </div>
                <div className={`order mTHS ${ordF >= 2 ? 'orderA' : ''}`} style={{ padding: '4px', marginTop: '0px' }} onClick={e => setOF(ordF < 2 ? 2 : ordF === 2 ? 3 : 2)}>
                    <img src={ordF === 3 ? SortZA : SortAZ} alt="Icon" style={{ width: '100%' }} />
                    <span className="tooltip">Sort By Name</span>
                </div>
                <div className={`order mTHS`} style={{ marginTop: '0px' }} onClick={e => handleISL(!isList)}>
                    <img src={!isList ? ListIco : BlockIco} alt="Icon" style={{ width: '100%' }} />
                    <span className="tooltip">{!isList ? 'List View' : 'Grid View'}</span>
                </div>
            </div>
        </div>
        <Tabnav items={['Folders']} i={tabNav} setI={setTN} icons={icons} />
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '12px' }}>
            <DragDropContext onDragEnd={handleOnDragEnd}>
                {list && list.length > 0 &&
                    <FolderList id={id} uId={_id} list={list} ord={ordF} isList={isList}
                        setMUpt={setMUpt} setMD={setMD} setCID={setCID} disabled={disabled} />}
                {listF && listF.length > 0 &&
                    <FileList list={listF} isList={isList} ord={ordF} uId={pId} id={id} disabled={disabled}
                        setMDF={setMDF} setEF={val => { setEF(val); getDetails(val); }} />}
            </DragDropContext>
        </div>
        {((!listF || listF.length <= 0) && (!list || list.length <= 0)) && <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '30px' }}>
            <h6>Nothing found</h6>
        </div>}

        {eF && File && File.file && <EditFile uId={_id} File={File} onhandleModal={e => setEF(false)} />}
        {sM && <Suspense fallback={<></>}><ModalLink id={id} _id={_id} showModal={handleModal} /></Suspense>}
        {catId && <Suspense fallback={<></>}><ModalLinkF catId={catId} id={id} _id={_id} showModal={e => setCID(false)} /></Suspense>}
        {modalUpt && <EditFolder txt={modalUpt.name} desc={modalUpt.description ? modalUpt.description : ''} onhandleUpt={(text, desc) => handleUpt(modalUpt._id, text, desc)} onhandleModal={e => setMUpt(false)} />}
        {modalAdd && <AddFolder onhandleAdd={(text, desc) => handleAdd(text, desc)} onhandleModal={e => setMA(false)} />}

        {modalDel && <DeleteModal handleModalDel={e => setMD(false)} handleDelete={async e => {
            await deleteCat(modalDel, '', '');
        }}>
            <p style={mT}>Are you sure? </p>
        </DeleteModal>}

        {modalDelF && <DeleteModal handleModalDel={e => setMDF(false)} handleDelete={async e => {
            await deleteFile(modalDelF, '', '');
        }}>
            <p style={mT}>Are you sure? </p>
        </DeleteModal>}

        <UploadClientFile />
    </div>
}

const mapStateToProps = state => {
    return {
        fileData: state.File.list,
        File: state.File.data
    }
};

export default connect(mapStateToProps, { fetchCombined, updateCatC, registerCat, deleteCat, deleteFile, getFileDetailsM, cutFile })(ListCat);