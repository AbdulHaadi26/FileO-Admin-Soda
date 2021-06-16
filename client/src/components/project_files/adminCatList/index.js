import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import CalAsc from '../../../assets/calendar-down.svg';
import CalDes from '../../../assets/calendar-up.svg';
import ListIco from '../../../assets/list.svg';
import BlockIco from '../../../assets/blocks.svg';
import Tabnav from '../../tabnav';
import AddFolder from '../modals/addFolder';
import AddAnnc from '../modals/addAnnc';
import EditFolder from '../modals/editFolder';
import EditAnnc from '../modals/editAnnc';
import DeleteModal from '../../containers/deleteContainer';
import AddFile from '../modals/addFile';
import Assigned from '../modals/shared';
import AnncList from './anncList';
import FolderList from './folderList';
import More from '../../../assets/elpW.svg';
import MoveCopyModal from '../modals/folderList';
import Searchbar from '../../searchbarReusable';
import Discussion from '../../discussion';
import {
    fetchCombinedP,
    registerCat,
    registerCatC,
    deleteCat,
    updateCat
} from '../../../redux/actions/project_categoryActions';
import GFolder from '../../../assets/tabnav/G-folder.svg';
import BFolder from '../../../assets/tabnav/B-folder.svg';
import GANC from '../../../assets/tabnav/G-announcement.svg';
import BANC from '../../../assets/tabnav/B-announcement.svg';
import GDSC from '../../../assets/tabnav/G-discussion.svg';
import BDSC from '../../../assets/tabnav/B-discussion.svg';
import { addComment } from '../../../redux/actions/discussionActions';
import { delANC, fetchANC, registerANC, updateANC } from '../../../redux/actions/announcementActions';
import history from '../../../utils/history';

const ModalRec = lazy(() => import('../modelRec'));
const ModalRecV = lazy(() => import('../modelRecVideo'));

let icons = [{ G: GFolder, B: BFolder }, { G: GANC, B: BANC }, { G: GDSC, B: BDSC }];

const eS = {
    textAlign: 'center',
    marginTop: '50px',
    marginBottom: '80px',
    width: '100%'
};
const mT = {
    marginTop: '16px'
};

const Admin = ({
    pId, fetchCombinedP, catData, org, project, string, isList, handleS, tabNav, setTN, handleISL, getList, updateChat, registerANC, string2, handleS2,
    deleteCat, updateCat, registerCat, profile, setting, auth, registerCatC, disabled, discussion, count, addComment, updated, offset, setOF, anncList,
    fetchANC, delANC, updateANC
}) => {

    let discussions = discussion && discussion.length > 0 ? discussion.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
    }) : [];

    const [ord, setO] = useState(0), [modalAdd, setMA] = useState(false), [modalDel, setMD] = useState(false), [message, setMessage] = useState(''),
        [modalUpt, setMUpt] = useState(false), [catId, setCID] = useState(false), [folderAccess, setFA] = useState(false), [copy, setCopy] = useState({
            type: 0, _id: '', catId: '', isModal: false, sId: ''
        }), [move, setMove] = useState({
            type: 0, _id: '', catId: '', isModal: false, sId: ''
        }), [modalAddA, setMAA] = useState(false), [activeA, setActA] = useState(false), [modalUptA, setMUptA] = useState(false),
        [modalDelA, setMDA] = useState(false), [ordA, setOA] = useState(0), [recA, setRecA] = useState(false), [recV, setRecV] = useState(false);

    const nodeA = useRef({});

    useEffect(() => {
        const handleClick = e => {
            if (auth && tabNav === 1 && nodeA && nodeA.current && !nodeA.current.contains(e.target)) {
                setActA(false);
            }
        };
        document.addEventListener('mousedown', handleClick, true);
        return
    }, [auth, tabNav]);


    const handleSearch = (e, num) => {
        e.preventDefault();
        let data = { _id: pId, string: string, auth };
        fetchCombinedP(data);
    };

    const handleSearch2 = async (e) => {
        e.preventDefault();
        await fetchANC({
            pId,
            type: 'All',
            string: string2
        })
    };

    let list = [];

    if (catData && catData.catList) {
        list = catData.catList;
    }

    const handleAdd = async (text, desc) => {
        let data = { _id: org, name: text, pId: pId, desc };
        await registerCat(data);
    };

    const handleAddA = async (text, description) => {
        let data = { name: text, pId: pId, description };
        await registerANC(data);
    };

    const handleUpt = async (id, text, desc) => {

        let data = {
            _id: id,
            value: text,
            pId: pId,
            desc: desc
        };

        await updateCat(data);
    };

    const handleUptA = async (id, text, desc) => {

        let data = {
            _id: id,
            name: text,
            pId: pId,
            description: desc
        };

        await updateANC(data);
    };

    const handleAddC = async (text, desc, pCat) => {

        let data;

        if (!pCat) data = {
            _id: org,
            name: text,
            pId,
            desc: desc,
            skip: true
        };
        else data = {
            _id: org,
            name: text,
            desc: desc,
            pId,
            pCat: pCat,
            skip: true
        }

        !pCat ? await registerCat(data) : await registerCatC(data);
        setCopy({ ...copy, isModal: false });
        setMove({ ...move, isModal: false });

    };

    const setTab = (i) => {
        setTN(i)
        return history.push(`/organization/${org}/projects/${pId}/categories/list/page/${i}`)
    };

    return <div className="col-11 f-w p-0">
        <div className="JSC" style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <h4 className="h">{project && project.project ? project.project.name : ''}</h4>
            <div style={{ marginLeft: 'auto' }} />
            {tabNav === 0 && <>
                <Searchbar isCreate={auth} classN={!auth ? `col-lg-5 col-12` : 'col-lg-7 col-12'} value={string} onHandleInput={val => handleS(val)}
                    holder={'Folder name'} handleSearch={e => handleSearch(e, 2)} callFunc={e => !disabled && setMA(true)} />
                <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <div className={`order mTHS ${ord < 2 ? 'orderA' : ''}`} style={{ marginTop: '0px', marginLeft: '12px' }} onClick={e => setO(ord >= 2 ? 0 : ord === 0 ? 1 : 0)}>
                        <img src={ord === 1 ? CalDes : CalAsc} alt="Icon" style={{ width: '100%' }} />
                        <span className="tooltip">Sort By Date</span>
                    </div>
                    <div className={`order mTHS ${ord >= 2 ? 'orderA' : ''}`} style={{ padding: '4px', marginTop: '0px' }} onClick={e => setO(ord < 2 ? 2 : ord === 2 ? 3 : 2)}>
                        <img src={ord === 3 ? SortZA : SortAZ} alt="Icon" style={{ width: '100%' }} />
                        <span className="tooltip">Sort By Name</span>
                    </div>
                    <div className={`order mTHS`} style={{ marginTop: '0px' }} onClick={e => handleISL(!isList)}>
                        <img src={!isList ? ListIco : BlockIco} alt="Icon" style={{ width: '100%' }} />
                        <span className="tooltip">{!isList ? 'List View' : 'Grid View'}</span>
                    </div>
                </div>
            </>}
            {tabNav === 1 && <>
                <Searchbar isCreate={auth} classN={auth ? `col-lg-7 col-12` : 'col-lg-5 col-12'} isElp={auth} value={string2} onHandleInput={val => handleS2(val)}
                    holder={'Annoucement name'} handleSearch={e => handleSearch2(e)} callFunc={e => !disabled && setMAA(true)} callSub={e => setActA(true)}>
                    <h6 className={`mTHS`} style={{ padding: '10px 8px 6px 8px', marginTop: '0px', marginBottom: '0px', marginRight: '-3px' }} onClick={e => setActA(!activeA)} ref={nodeA}>
                        <div className="more" style={{ width: '14px', height: '14px', marginRight: '-3px', backgroundImage: `url('${More}')`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }} />
                        <div className="dropdown-content-c" style={{ display: `${activeA ? 'flex' : 'none'}`, top: '30px' }}>
                            <h6 className='s-l' onClick={e => {
                                !disabled && setRecA(true);
                                setActA(false);
                            }}>Record Audio</h6>
                            <h6 className='s-l' onClick={e => {
                                !disabled && setRecV(true);
                                setActA(false);
                            }}>Record Video</h6>
                        </div>
                    </h6>
                </Searchbar>
                <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <div className={`order mTHS ${ordA < 2 ? 'orderA' : ''}`} style={{ marginTop: '0px', marginLeft: '12px' }} onClick={e => setOA(ordA >= 2 ? 0 : ordA === 0 ? 1 : 0)}>
                        <img src={ordA === 1 ? CalDes : CalAsc} alt="Icon" style={{ width: '100%' }} />
                        <span className="tooltip">Sort By Date</span>
                    </div>
                    <div className={`order mTHS ${ordA >= 2 ? 'orderA' : ''}`} style={{ padding: '4px', marginTop: '0px' }} onClick={e => setOA(ordA < 2 ? 2 : ordA === 2 ? 3 : 2)}>
                        <img src={ordA === 3 ? SortZA : SortAZ} alt="Icon" style={{ width: '100%' }} />
                        <span className="tooltip">Sort By Name</span>
                    </div>
                    <div className={`order mTHS`} style={{ marginTop: '0px' }} onClick={e => handleISL(!isList)}>
                        <img src={!isList ? ListIco : BlockIco} alt="Icon" style={{ width: '100%' }} />
                        <span className="tooltip">{!isList ? 'List View' : 'Grid View'}</span>
                    </div>
                </div>
            </>}
        </div>
        <Tabnav items={['Folders', 'Announcements', 'Discussion']} i={tabNav} setI={i => setTab(i)} icons={icons} />
        {tabNav === 0 && <>
            <h6 style={{ fontWeight: '600', fontSize: '12px', marginRight: '3px', marginTop: '12px' }}>{project && project.project ? project.project.name : ''}</h6>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '12px' }}>
                {list && list.length > 0 ?
                    <FolderList list={list} pId={pId} org={org} ord={ord} isList={isList} setMUpt={setMUpt} setMD={setMD}
                        setMA={setMA} setFA={setFA} auth={auth} setCID={setCID}
                        setCopy={data => setCopy({ type: 0, _id: data._id, catId: '', sId: '' })}
                        setMove={data => setMove({ type: 0, _id: data._id, catId: '', sId: '' })}
                        disabled={disabled}
                    />
                    : <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center' }}> <h6 className="cat-name" style={eS}> No folder found</h6></div>}
            </div>

            {catId && <AddFile setting={setting && setting.setting} id={org} _id={pId} userId={profile.user._id} catId={catId} onhandleModal={e => setCID(false)} />}

            {copy._id && !copy.isModal && <MoveCopyModal name={project && project.project ? project.project.name : ''} pId={pId} data={copy} title={'Copy'} onhandleModal={e => getList()} type={0}
                setCId={catId => setCopy({ ...copy, catId: catId })} setMA={e => setCopy({ ...copy, isModal: true })} setSId={catId => setCopy({ ...copy, sId: catId })}
            />}

            {move._id && !move.isModal && <MoveCopyModal name={project && project.project ? project.project.name : ''} pId={pId} data={move} title={'Move'} onhandleModal={e => getList()} type={1}
                setCId={catId => setMove({ ...move, catId: catId })} setMA={e => setMove({ ...move, isModal: true })} setSId={catId => setMove({ ...move, sId: catId })}
            />}

            {copy.isModal && <AddFolder onhandleAdd={(text, desc) => handleAddC(text, desc, copy.catId)} onhandleModal={e => setCopy({ ...copy, isModal: false })} />}
            {move.isModal && <AddFolder onhandleAdd={(text, desc) => handleAddC(text, desc, move.catId)} onhandleModal={e => setMove({ ...move, isModal: false })} />}

            {modalUpt && <EditFolder txt={modalUpt.name} desc={modalUpt.description ? modalUpt.description : ''} onhandleUpt={(text, desc) => handleUpt(modalUpt._id, text, desc)} onhandleModal={e => setMUpt(false)} />}
            {modalAdd && <AddFolder onhandleAdd={(text, desc) => handleAdd(text, desc)} onhandleModal={e => setMA(false)} />}
            {modalDel && <DeleteModal handleModalDel={e => setMD(false)} handleDelete={async e => {
                await deleteCat(modalDel, '', '');
            }}>
                <p style={mT}>Are you sure? </p>
            </DeleteModal>}

            {folderAccess && <Assigned cId={folderAccess} onhandleModal={e => setFA(false)} />}
        </>}

        {tabNav === 1 && <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '12px' }}>
            {anncList && anncList.length > 0 ?
                <AnncList list={anncList} pId={pId} org={org} ord={ordA} isList={isList} setMUpt={setMUptA} setMD={setMDA} auth={auth} />
                : <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center' }}> <h6 className="cat-name" style={eS}> No  announcement found</h6></div>}
            {modalAddA && <AddAnnc onhandleAdd={(text, desc) => handleAddA(text, desc)} onhandleModal={e => setMAA(false)} />}
            {modalDelA && <DeleteModal handleModalDel={e => setMDA(false)} handleDelete={async e => {
                await delANC(modalDelA);
            }}>
                <p style={mT}>Are you sure? </p>
            </DeleteModal>}
            {modalUptA && <EditAnnc txt={modalUptA.name} desc={modalUptA.description ? modalUptA.description : ''} onhandleUpt={(text, desc) => handleUptA(modalUptA._id, text, desc)} onhandleModal={e => setMUptA(false)} />}
            {recA && <Suspense fallback={<></>}>
                <ModalRec _id={pId} org={org} onhandleModal={e => setRecA(false)} fileL={setting && setting.setting && setting.setting.maxFileSize ? setting.setting.maxFileSize : 5} onSubmit={e => setRecA(false)} />
            </Suspense>}

            {recV && <Suspense fallback={<></>}>
                <ModalRecV _id={pId} org={org} onhandleModal={e => setRecV(false)} fileL={setting && setting.setting && setting.setting.maxFileSize ? setting.setting.maxFileSize : 5} onSubmit={e => setRecV(false)} />
            </Suspense>}
        </div>}
        {tabNav === 2 && <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '30px' }}>
            <Discussion id={pId} message={message} setMessage={setMessage} updateChat={updateChat} count={count} profile={profile && profile.user} project={true}
                addComment={addComment} discussions={discussions} updated={updated} offset={offset} setOF={setOF} />
        </div>}
    </div>
}

const mapStateToProps = state => {
    return {
        isSuc: state.Category.isSuc,
        catData: state.Category.list,
        anncList: state.Annc.list,
        project: state.Project.data,
        profile: state.Profile.data,
        setting: state.setting.data
    }
};

export default connect(mapStateToProps, {
    fetchCombinedP, registerCat, deleteCat, updateCat, registerCatC, addComment, registerANC,
    fetchANC, delANC, updateANC
})(Admin);