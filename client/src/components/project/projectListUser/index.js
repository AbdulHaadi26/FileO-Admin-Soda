import React, { lazy, Suspense, Fragment, useState } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import { fetchProjSearchA, fetchProjectA } from '../../../redux/actions/projectActions';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import ListIco from '../../../assets/list.svg';
import BlockIco from '../../../assets/blocks.svg';
import Tabnav from '../../tabnav';
const ProjectList = lazy(() => import('./item'));
const dF = { display: 'flex', justifyContent: 'flex-end' };
const mT = { marginTop: '12px' };
const eS = { textAlign: 'center', marginTop: '50px' };

const List = ({ fetchProjSearchA, fetchProjectA, userId, pData, isSuc, limitMult, limit, string, handleS, handleL, handleLM, tabNav, setTN, isList, setISL }) => {
    const [ordC, setOC] = useState(0);

    const onhandleInput = e => handleS(e.target.value);

    const fetch = (e, count, i, j) => {
        e.preventDefault();
        if ((limit < count && i > 0) || (limit > 12 && i < 0)) {
            var data = { limit: limitMult + i, string: string, uId: userId };
            var upgradeLimit = limit + j;
            handleL(upgradeLimit); handleLM(data.limit);
            !string ? fetchProjectA(data) : fetchProjSearchA(data);
        }
    }

    const handleSearch = e => {
        e.preventDefault();
        var data = { limit: 0, string: string, uId: userId };
        handleLM(0); handleL(12);
        !string ? fetchProjectA(data) : fetchProjSearchA(data);
    }

    var count = 0;
    var list = [];

    if (isSuc) {
        count = pData.count;
        list = pData.data;
    }

    return <div className="col-11 p-w p-0">
        <h4 className="h">Project</h4>
        <Tabnav items={['Projects']} i={tabNav} setI={setTN} />
        <div style={dF}>
            <div className="input-group col-lg-4 col-12 p-0" style={mT}>
                <input type="text" className="form-control corner-rounded" placeholder="Project name" value={string} onChange={e => onhandleInput(e)} onKeyPress={e => e.key === 'Enter' && handleSearch(e)} />
                <div className="input-group-append">
                    <button className="btn btn-outline-secondary" type="button" onClick={e => handleSearch(e)} ><div className="faH" /></button>
                </div>
            </div>
        </div>
        <div style={dF}>
            <div className={`order ${ordC < 2 ? 'orderA' : ''}`} onClick={e => setOC(ordC === 0 ? 1 : 0)}>
                <img src={ordC === 1 ? SortZA : SortAZ} alt="Icon" style={{ width: '100%' }} />
                <span className="tooltip">Sort By Name</span>
            </div>
            <div className={`order`} style={{ padding: '6px' }} onClick={e => setISL(!isList)}>
                <img src={!isList ? ListIco : BlockIco} alt="Icon" style={{ width: '100%' }} />
                <span className="tooltip">{!isList ? 'List View' : 'Grid View'}</span>
            </div>
        </div>
        {isSuc && count > 0 && list.length > 0 ? <Suspense fallback={<Fragment />}><ProjectList isList={isList} list={list} ord={ordC} count={count} onFetch={fetch} /> </Suspense> : <div> <h6 className="str-n" style={eS}>No project found</h6></div>}
    </div>
}

const mapStateToProps = state => {
    return {
        pData: state.Project.list,
        isSuc: state.Project.isSuc
    }
}
export default connect(mapStateToProps, { fetchProjectA, fetchProjSearchA })(List);