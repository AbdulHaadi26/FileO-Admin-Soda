import React, { useState } from 'react';
import { connect } from 'react-redux';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import CalAsc from '../../../assets/calendar-down.svg';
import CalDes from '../../../assets/calendar-up.svg';
import ListIco from '../../../assets/list.svg';
import BlockIco from '../../../assets/blocks.svg';
import Tabnav from '../../tabnav';
import AddFolder from '../modals/addFolder';
import EditFolder from '../modals/editFolder';
import AddFile from '../modals/addFile';
import DeleteModal from '../../containers/deleteContainer';
import Assigned from '../modals/shared';
import FolderList from './folderList';
import GFolder from '../../../assets/tabnav/G-folder.svg';
import BFolder from '../../../assets/tabnav/B-folder.svg';
import Searchbar from '../../searchbarReusable';
import { fetchCombinedCP, registerCat, updateCat, deleteCat, registerCatC } from '../../../redux/actions/categoryActions';
import MoveCopyModal from '../modals/folderList';
import '../style.css';

const eS = {
    textAlign: 'center',
    marginTop: '50px'
};

let icons = [
    { G: GFolder, B: BFolder }
];

const Admin = ({
    fetchCombinedCP, id, tabNav, registerCatC,
    catData, setTN, getList,
    string, handleS, setting,
    isList, handleISL, profile,
    deleteCat, updateCat, registerCat,
    disabled
}) => {
    const [ord, setO] = useState(0), [modalUpt, setMUpt] = useState(false), [modalAdd, setMA] = useState(false), 
        [modalDel, setMD] = useState(false), [catId, setCID] = useState(false), [folderAccess, setFA] = useState(false), [copy, setCopy] = useState({
            type: 0, _id: '', catId: '', isModal: false, sId: ''
        }), [move, setMove] = useState({
            type: 0, _id: '', catId: '', isModal: false, sId: ''
        });

    const handleAdd = async (text, desc) => {

        let data = {
            _id: id,
            name: text,
            desc: desc
        };

        await registerCat(data);
    };

    const handleUpt = async (_id, text, desc) => {

        let data = {
            org: id,
            _id: _id,
            value: text,
            desc: desc
        };

        await updateCat(data);
    };

    const handleSearch = (e, num) => {
        e.preventDefault();
        let data = { auth: true, string: string };
        fetchCombinedCP(data);
    };

    const handleAddC = async (text, desc, pCat) => {

        let data;

        if (!pCat) data = {
            _id: id,
            name: text,
            desc: desc,
            skip: true
        };
        else data = {
            _id: id,
            name: text,
            desc: desc,
            pCat: pCat,
            skip: true
        }

        !pCat ? await registerCat(data) : await registerCatC(data);
        setCopy({ ...copy, isModal: false });
        setMove({ ...move, isModal: false });

    };


    return <div className="col-11 f-w p-0">
        <div className="JSC" style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <h4 className="h">Files</h4>
            <div style={{ marginLeft: 'auto' }} />
            <Searchbar isCreate={true} classN={`col-lg-7 col-12`} value={string} onHandleInput={val => handleS(val)} 
            holder={'Folder name'} handleSearch={e => handleSearch(e, 2)} callFunc={e => !disabled && setMA(true)} />
            <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: '12px' }}>
                <div className={`order mTHS ${ord < 2 ? 'orderA' : ''}`} style={{ padding: '6px', marginLeft: '12px', marginTop: '0px' }} onClick={e => setO(ord >= 2 ? 0 : ord === 0 ? 1 : 0)}>
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
        </div>
        <Tabnav items={['Folder']} i={tabNav} setI={setTN} icons={icons} />
        <h6 style={{ fontWeight: '600', fontSize: '12px', marginRight: '3px', marginTop: '12px' }}>Admin Files</h6>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '12px' }}>
            {catData && catData.catList && catData.catList.length > 0 ?
                <FolderList list={catData.catList} id={id} ord={ord} isList={isList} disabled={disabled}
                    setCID={setCID} setMD={setMD} setMUpt={setMUpt} setFA={setFA}
                    setCopy={data => setCopy({ type: 0, _id: data._id, catId: '', sId: '' })}
                    setMove={data => setMove({ type: 0, _id: data._id, catId: '', sId: '' })} />
                : <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                    <h6 className="f-n" style={eS}>No folder found</h6>
                </div>}
        </div>

        {copy._id && !copy.isModal && <MoveCopyModal data={copy} title={'Copy'} onhandleModal={e => getList()} type={0}
            setCId={catId => setCopy({ ...copy, catId: catId })} setMA={e => setCopy({ ...copy, isModal: true })} setSId={catId => setCopy({ ...copy, sId: catId })}
        />}

        {move._id && !move.isModal && <MoveCopyModal data={move} title={'Move'} onhandleModal={e => getList()} type={1}
            setCId={catId => setMove({ ...move, catId: catId })} setMA={e => setMove({ ...move, isModal: true })} setSId={catId => setMove({ ...move, sId: catId })}
        />}

        {copy.isModal && <AddFolder onhandleAdd={(text, desc) => handleAddC(text, desc, copy.sId)} onhandleModal={e => setCopy({ ...copy, isModal: false })} />}
        {move.isModal && <AddFolder onhandleAdd={(text, desc) => handleAddC(text, desc, move.sId)} onhandleModal={e => setMove({ ...move, isModal: false })} />}

        {modalUpt && <EditFolder txt={modalUpt.name} desc={modalUpt.description ? modalUpt.description : ''} onhandleUpt={(text, desc) => handleUpt(modalUpt._id, text, desc)} onhandleModal={e => setMUpt(false)} />}
        {modalAdd && <AddFolder onhandleAdd={(text, desc) => handleAdd(text, desc)} onhandleModal={e => setMA(false)} />}

        {catId && <AddFile setting={setting && setting.setting} id={id} userId={profile.user._id} catId={catId} onhandleModal={e => setCID(false)} />}

        {modalDel && <DeleteModal handleModalDel={e => setMD(false)} handleDelete={async e => {
            await deleteCat(modalDel, '');
        }}>
            <p style={{ marginTop: '16px' }}>Are you sure? </p>
        </DeleteModal>}


        {folderAccess && <Assigned cId={folderAccess} onhandleModal={e => setFA(false)} />}
    </div>
}

const mapStateToProps = state => {
    return {
        catData: state.Category.list,
        isSucS: state.Category.isSuc,
        setting: state.setting.data,
        profile: state.Profile.data
    }
};

export default connect(mapStateToProps, { fetchCombinedCP, registerCat, updateCat, deleteCat, registerCatC })(Admin);