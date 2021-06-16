import React, { useState } from 'react';
import '../style.css';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import CalAsc from '../../../assets/calendar-down.svg';
import CalDes from '../../../assets/calendar-up.svg';
import ListIco from '../../../assets/list.svg';
import BlockIco from '../../../assets/blocks.svg';
import Tabnav from '../../tabnav';
import { fetchCombinedCP } from '../../../redux/actions/categoryActions';
import { connect } from 'react-redux';
import FolderList from './folderList';
import GFolder from '../../../assets/tabnav/G-folder.svg';
import BFolder from '../../../assets/tabnav/B-folder.svg';
import Searchbar from '../../searchbarReusable';
let icons = [{ G: GFolder, B: BFolder }];
const eS = {
    textAlign: 'center',
    marginTop: '50px',
    marginBottom: '80px'
};

const List = ({
    id, isList, handleISL, fetchCombinedCP,
    string, handleS, tabNav, setTN, catData
}) => {
    const [ord, setO] = useState(0);

    const handleSearch = (e, num) => {
        e.preventDefault();
        let data = { auth: false, string: string };
        fetchCombinedCP(data);
    };

    return <div className="col-11 f-w p-0">
        <div className="JSC" style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <h4 className="h">Files</h4>
            <div style={{ marginLeft: 'auto' }} />
            <Searchbar isCreate={false} classN={`col-lg-5 col-12`} value={string} onHandleInput={val => handleS(val)} holder={'Folder name'} handleSearch={e => handleSearch(e, 2)} />
            <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: '12px' }}>
                <div className={`order mTHS ${ord < 2 ? 'orderA' : ''}`} style={{ marginLeft: '12px', marginTop: '0px' }} onClick={e => setO(ord >= 2 ? 0 : ord === 0 ? 1 : 0)}>
                    <img src={ord === 1 ? CalAsc : CalDes} alt="Icon" style={{ width: '100%' }} />
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
        <Tabnav items={['Folders']} i={tabNav} setI={setTN} icons={icons} />
        <h6 style={{ fontWeight: '600', fontSize: '12px', marginRight: '3px', marginTop: '12px' }}>Admin Files</h6>
        {catData && catData.catList && catData.catList.length > 0 ?
            <FolderList list={catData.catList} id={id} ord={ord} isList={isList} /> : <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                <h6 className="f-n" style={eS}>No folder found</h6>
            </div>}
    </div>
}

const mapStateToProps = state => {
    return {
        catData: state.Category.list,
        setting: state.setting.data,
        profile: state.Profile.data
    }
};

export default connect(mapStateToProps, { fetchCombinedCP })(List);