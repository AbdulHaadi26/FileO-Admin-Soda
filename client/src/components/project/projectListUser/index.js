import React, { lazy, Suspense, useState } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import {
    fetchProjSearchA,
    fetchProjectA
} from '../../../redux/actions/projectActions';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import ListIco from '../../../assets/list.svg';
import BlockIco from '../../../assets/blocks.svg';
import Tabnav from '../../tabnav';
import GProj from '../../../assets/tabnav/G-Projects.svg';
import BProj from '../../../assets/tabnav/B-Projects.svg';
import Searchbar from '../../searchbarReusable';
let icons = [{ G: GProj, B: BProj }];
const ProjectList = lazy(() => import('./item'));
const eS = {
    textAlign: 'center',
    marginTop: '50px'
};

const List = ({
    fetchProjSearchA, fetchProjectA, userId, pData,
    limitMult, limit, string, handleS, handleL, handleLM,
    tabNav, setTN, isList, setISL
}) => {
    const [ordC, setOC] = useState(0);

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
        let data = { limit: 0, string: string, uId: userId };
        handleLM(0); handleL(12);
        !string ? fetchProjectA(data) : fetchProjSearchA(data);
    }

    var count = 0;
    var list = [];

    if (pData && pData.data) {
        count = pData.count;
        list = pData.data;
    }

    return <div className="col-11 p-w p-0">
        <div className="JSC" style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <h4 className="h">Projects</h4>
            <div style={{ marginLeft: 'auto' }} />
            <Searchbar isCreate={false} classN={false ? `col-lg-7 col-12` : 'col-lg-5 col-12'} pad={false} value={string}
                handleSearch={e => handleSearch(e)} onHandleInput={val => handleS(val)} holder={'Project name'} />
            <div className="col-12" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: '12px' }}>
                <div className={`order mTHS ${ordC < 2 ? 'orderA' : ''}`} style={{ padding: '4px', marginLeft: '12px', marginTop: '0px' }} onClick={e => setOC(ordC === 0 ? 1 : 0)}>
                    <img src={ordC === 1 ? SortZA : SortAZ} alt="Icon" style={{ width: '100%' }} />
                    <span className="tooltip">Sort By Name</span>
                </div>
                <div className={`order mTHS`} style={{ padding: '6px', marginTop: '0px' }} onClick={e => setISL(!isList)}>
                    <img src={!isList ? ListIco : BlockIco} alt="Icon" style={{ width: '100%' }} />
                    <span className="tooltip">{!isList ? 'List View' : 'Grid View'}</span>
                </div>
            </div>
        </div>
        <Tabnav items={['Projects']} i={tabNav} setI={setTN} icons={icons} />
        {count && list && list.length > 0 ? <Suspense fallback={<></>}><ProjectList isList={isList} list={list} ord={ordC} count={count} onFetch={fetch} /> </Suspense> : <div> <h6 className="str-n" style={eS}>No project found</h6></div>}
    </div>
}

const mapStateToProps = state => {
    return {
        pData: state.Project.list
    }
};

export default connect(mapStateToProps, { fetchProjectA, fetchProjSearchA })(List);