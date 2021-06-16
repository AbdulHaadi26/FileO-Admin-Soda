import React, { useState } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import {
    delProject,
    fetchProjectM,
    fetchSearchProjectM,
    registerProject
} from '../../../redux/actions/projectActions';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import Tabnav from '../../tabnav';
import AddProject from '../modals/addProject';
import EditProject from '../modals/editProject';
import DeleteModal from '../../containers/deleteContainer';
import ListIco from '../../../assets/list.svg';
import BlockIco from '../../../assets/blocks.svg';
import Assigned from '../modals/shared';
import Searchbar from '../../searchbarReusable';
import ProjectList from './item';
import GProj from '../../../assets/tabnav/G-Projects.svg';
import BProj from '../../../assets/tabnav/B-Projects.svg';
let icons = [{ G: GProj, B: BProj }];
const dF = {
    display: 'flex',
    flexDirection: 'row',
    marginTop: '12px',
    width: '100%',
    flexWrap: 'wrap'
};

const eS = {
    textAlign: 'center',
    marginTop: '50px'
};
const mT = {
    marginTop: '16px'
};

const List = ({
    fetchSearchProjectM, fetchProjectM, userId, orgName, pData, org, limit, delProject,
    limitMult, string, handleS, handleL, handleLM, tabNav, setTN, registerProject,
    isList, setISL, disabled
}) => {
    const [ordC, setOC] = useState(0), [modalAdd, setMA] = useState(false), [tempProject, setTP] = useState(false), [del, setDel] = useState(false),
        [fA, setFA] = useState(false);

    const handleAdd = async (text, desc, active, icon) => {

        let data = {
            _id: userId, name: text, desc: desc, org: org, orgName: orgName, active, icon
        };

        await registerProject(data);
    };

    const fetch = (e, count, i, j) => {
        e.preventDefault();
        if ((limit < count && i > 0) || (limit > 12 && i < 0)) {
            var data = { limit: limitMult + i, string: string, mId: userId };
            var upgradeLimit = limit + j;
            handleL(upgradeLimit); handleLM(data.limit);
            !string ? fetchProjectM(data) : fetchSearchProjectM(data);
        }
    }

    const handleSearch = e => {
        e.preventDefault();
        var data = { limit: 0, string: string, mId: userId };
        handleL(12); handleLM(0);
        !string ? fetchProjectM(data) : fetchSearchProjectM(data);
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
            <Searchbar isCreate={true} classN={true ? `col-lg-7 col-12` : 'col-lg-5 col-12'} value={string} onHandleInput={val => handleS(val)}
                callFunc={e => {
                    !disabled && setMA(true);
                }} isElp={false}
                holder={'Project name'} handleSearch={e => handleSearch(e)}>
            </Searchbar>
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

        <div style={dF}>
            {count > 0 && list && list.length > 0 && <ProjectList ord={ordC} list={list} count={count} onFetch={fetch} setDel={setDel}
                setTP={setTP} isList={isList} setFA={setFA} />}
        </div>

        {(!count || !list || list.length <= 0) && <div><h6 className="str-n" style={eS}>No project found</h6></div>}

        {modalAdd && <AddProject onhandleAdd={(text, desc, act, icon) => handleAdd(text, desc, act, icon)} onhandleModal={e => setMA(false)} />}

        {tempProject && <EditProject Project={tempProject} onhandleModal={e => setTP(false)} />}

        {del && <DeleteModal handleModalDel={e => setDel(false)} handleDelete={async e => {
            await delProject(del);
        }}>
            <p style={mT}>Are you sure? </p>
        </DeleteModal>}
        {fA && <Assigned id={org} pId={fA} onhandleModal={e => setFA(false)} />}
    </div>
}

const mapStateToProps = state => {
    return {
        pData: state.Project.list,
        isSuc: state.Project.isSuc
    }
};

export default connect(mapStateToProps, { fetchProjectM, fetchSearchProjectM, registerProject, delProject })(List);