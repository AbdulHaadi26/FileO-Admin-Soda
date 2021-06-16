import React, { lazy, Suspense, Fragment, useState } from 'react';
import { connect } from 'react-redux';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import CalAsc from '../../../assets/calendar-down.svg';
import CalDes from '../../../assets/calendar-up.svg';
import ListIco from '../../../assets/list.svg';
import BlockIco from '../../../assets/blocks.svg';
import '../style.css';
import Tabnav from '../../tabnav';
import history from '../../../utils/history';
import GHistory from '../../../assets/tabnav/G-visited files.svg';
import BHistory from '../../../assets/tabnav/B-visited files.svg';
import GRecent from '../../../assets/tabnav/G-recent uploaded.svg';
import BRecent from '../../../assets/tabnav/B-recent uploaded.svg';
const FileList = lazy(() => import('./fileList'));
const FileList2 = lazy(() => import('./fileList2'));

let icons = [
    { G: GHistory, B: BHistory },
    { G: GRecent, B: BRecent }
]

const mB = {
    textAlign: 'center',
    marginTop: '50px'
};

const Recent = ({
    fileData, isSuc, id, tabNav, isList, handleISL
}) => {
    const [ord, setO] = useState(0);

    const setIN = i => {
        history.push(`/personal/files/recent/page/${i}`)
    };

    var list = [];

    if (isSuc && fileData) {
        list = fileData.files;
    }

    return <div className="col-11 f-w p-0">
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <h4 className="h">Recent Files</h4>
            <div style={{ marginLeft: 'auto' }} />
            <div className={`order ${ord < 2 ? 'orderA' : ''}`} style={{ marginTop: '0px' }} onClick={e => setO(ord >= 2 ? 0 : ord === 0 ? 1 : 0)}>
                <img src={ord === 1 ? CalDes : CalAsc} alt="Icon" style={{ width: '100%' }} />
                <span className="tooltip">Sort By Date</span>
            </div>
            <div className={`order ${ord >= 2 ? 'orderA' : ''}`} style={{ padding: '4px', marginTop: '0px' }} onClick={e => setO(ord < 2 ? 2 : ord === 2 ? 3 : 2)}>
                <img src={ord === 3 ? SortZA : SortAZ} alt="Icon" style={{ width: '100%' }} />
                <span className="tooltip">Sort By Name</span>
            </div>
            <div className={`order`} style={{ marginTop: '0px' }} onClick={e => handleISL(!isList)}>
                <img src={!isList ? ListIco : BlockIco} alt="Icon" style={{ width: '100%' }} />
                <span className="tooltip">{!isList ? 'List View' : 'Grid View'}</span>
            </div>
        </div>
        <Tabnav items={['Visited', 'Uploaded']} i={tabNav} setI={setIN} icons={icons} />
        {list && list.length > 0 ? <Suspense fallback={<Fragment />}>
            {tabNav === 0 ?
                <FileList list={list} isList={isList} ord={ord} id={id} /> :
                <FileList2 list={list} isList={isList} ord={ord} id={id} />}
        </Suspense> : <div><h6 className="f-n" style={mB}>No file found</h6></div>}
    </div>
}

const mapStateToProps = state => {
    return {
        fileData: state.File.data,
        isSuc: state.File.isSuc
    }
}

export default connect(mapStateToProps)(Recent);