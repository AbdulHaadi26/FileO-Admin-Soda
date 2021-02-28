import React, { lazy, Suspense, Fragment, useState } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import { delProject, fetchProjectM, fetchSearchProjectM, registerProject } from '../../../redux/actions/projectActions';
import Plus from '../../../assets/plus.svg';
import SortAZ from '../../../assets/sortAZ.svg';
import SortZA from '../../../assets/sortZA.svg';
import Tabnav from '../../tabnav';
import AddProject from '../modals/addProject';
import EditProject from '../modals/editProject';
import DeleteModal from '../../containers/deleteContainer';
import ListIco from '../../../assets/list.svg';
import BlockIco from '../../../assets/blocks.svg';
const ProjectList = lazy(() => import('./item'));
const dF = { display: 'flex', justifyContent: 'flex-end', alignItems: 'center' };
const eS = { textAlign: 'center', marginTop: '50px' };
const mT = { marginTop: '16px' };

const List = ({
    fetchSearchProjectM, fetchProjectM, userId, orgName, pData, isSuc, org, limit, delProject,
    limitMult, string, handleS, handleL, handleLM, tabNav, setTN, getList, registerProject,
    isList, setISL
}) => {
    const [ordC, setOC] = useState(0), [modalAdd, setMA] = useState(false), [tempProject, setTP] = useState(false), [del, setDel] = useState(false);

    const handleAdd = async (text, desc, active, icon) => {

        let data = {
            _id: userId, name: text, desc: desc, org: org, orgName: orgName, active, icon
        };

        await registerProject(data);
        getList();
    };


    const onhandleInput = e => handleS(e.target.value);

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

    if (isSuc) {
        count = pData.count;
        list = pData.data;
    }

    return <div className="col-11 p-w p-0">
        <h4 className="h">Project</h4>
        <Tabnav items={['Projects']} i={tabNav} setI={setTN} />
        <div style={dF}>
            <button className="btn btn-dark" onClick={e => setMA(true)}>Create project<div className="faS" style={{ backgroundImage: `url('${Plus}')` }} /></button>
        </div>
        <div style={dF}>
            <div className="input-group col-lg-4 col-12 p-0" style={{ marginTop: '12px' }}>
                <input type="text" className="form-control corner-rounded" placeholder="Project name" value={string} name="string" onChange={e => onhandleInput(e)} onKeyPress={e => e.key === 'Enter' && handleSearch(e)} />
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

        {isSuc && count > 0 && list.length > 0 ? <Suspense fallback={<Fragment />}>
            <ProjectList ord={ordC} list={list} count={count} onFetch={fetch} setDel={setDel} setTP={setTP} isList={isList} />
        </Suspense> : <div><h6 className="str-n" style={eS}>No project found</h6></div>}
        
        {modalAdd && <AddProject onhandleAdd={(text, desc, act, icon) => handleAdd(text, desc, act, icon)} onhandleModal={e => setMA(false)} />}
        
        {tempProject && <EditProject getList={getList} Project={tempProject} onhandleModal={e => setTP(false)} />}
       
        {del && <DeleteModal handleModalDel={e => setDel(false)} handleDelete={async e => {
            await delProject(del);
            getList();
        }}>
            <p style={mT}>Are you sure? </p>
        </DeleteModal>}
    </div>
}

const mapStateToProps = state => {
    return {
        pData: state.Project.list,
        isSuc: state.Project.isSuc
    }
};

export default connect(mapStateToProps, { fetchProjectM, fetchSearchProjectM, registerProject, delProject })(List);