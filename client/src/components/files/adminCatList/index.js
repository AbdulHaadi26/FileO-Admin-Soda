import React, { lazy, Suspense, useState } from 'react';
import { connect } from 'react-redux';
import { fetchCombinedCP, registerCat, updateCat, deleteCat } from '../../../redux/actions/categoryActions';
import Plus from '../../../assets/plus.svg';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import CalAsc from '../../../assets/calendar-down.svg';
import CalDes from '../../../assets/calendar-up.svg';
import ListIco from '../../../assets/list.svg';
import BlockIco from '../../../assets/blocks.svg';
import '../style.css';
import Popover from '../../popover';
import Tabnav from '../../tabnav';
import AddFolder from '../modals/addFolder';
import EditFolder from '../modals/editFolder';
import AddFile from '../modals/addFile';
import DeleteModal from '../../containers/deleteContainer';
const List = lazy(() => import('./folderList'));
const dF = { display: 'flex', justifyContent: 'flex-end', alignItems: 'center' };
const mT = { marginTop: '16px' };
const eS = { textAlign: 'center', marginTop: '50px' };

const Admin = ({
    fetchCombinedCP, id, tabNav,
    catData, setTN, getList,
    string, handleS, setting,
    isList, handleISL, profile,
    deleteCat, updateCat, registerCat
}) => {
    const [ord, setO] = useState(0), [modalUpt, setMUpt] = useState(false), [modalAdd, setMA] = useState(false),
        [modalDel, setMD] = useState(false), [catId, setCID] = useState(false);

    const onhandleS = e => handleS(e.target.value);

    const handleAdd = async (text, desc) => {

        let data = {
            _id: id,
            name: text,
            desc: desc
        };

        await registerCat(data);
        getList();
    };

    const handleUpt = async (_id, text, desc) => {

        let data = {
            org: id,
            _id: _id,
            value: text,
            desc: desc
        };

        await updateCat(data);
        getList();
    };

    const handleSearch = (e, num) => {
        e.preventDefault();
        let data = { _id: id, string: string };
        fetchCombinedCP(data);
    };

    return <div className="col-11 f-w p-0">
        <h4 className="h">Files</h4>
        <Tabnav items={['Folder']} i={tabNav} setI={setTN} />
        {tabNav === 0 && <>
            <div style={dF}>
                <Popover sty={{ marginRight: '6px', marginTop: '12px' }} text={'A specific folder will be assigned to a specific role so that the person entitled to that role can see the files related to the folder.'} url={`https://docs.file-o.com:4242/doc/topic/0/content/0`} />
                <button className="btn btn-dark" onClick={e => setMA(true)}>Add folder <div className="faS" style={{ backgroundImage: `url('${Plus}')` }} /></button>
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
                <div className={`order ${ord < 2 ? 'orderA' : ''}`} style={{ padding: '6px' }} onClick={e => setO(ord >= 2 ? 0 : ord === 0 ? 1 : 0)}>
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
            {catData && catData.catList && catData.catList.length > 0 ?
                <Suspense fallback={<></>}>
                    <List list={catData.catList} id={id} ord={ord} isList={isList} setCID={setCID} setMD={setMD} setMUpt={setMUpt} />
                </Suspense> : <div> <h6 className="f-n" style={eS}>No folder found</h6> </div>}
        </>}

        {modalUpt && <EditFolder txt={modalUpt.name} desc={modalUpt.description ? modalUpt.description : ''} onhandleUpt={(text, desc) => handleUpt(modalUpt._id, text, desc)} onhandleModal={e => setMUpt(false)} />}
        {modalAdd && <AddFolder onhandleAdd={(text, desc) => handleAdd(text, desc)} onhandleModal={e => setMA(false)} />}

        {catId && <AddFile setting={setting && setting.setting} id={id} userId={profile.user._id} catId={catId} onhandleModal={e => setCID(false)} />}

        {modalDel && <DeleteModal handleModalDel={e => setMD(false)} handleDelete={async e => {
            await deleteCat(modalDel, '');
            getList();
        }}>
            <p style={mT}>Are you sure? </p>
        </DeleteModal>}
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

export default connect(mapStateToProps, { fetchCombinedCP, registerCat, updateCat, deleteCat })(Admin);