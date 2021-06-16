import React, { lazy, Suspense } from 'react';
import { connect } from 'react-redux';
import { fetchEmp, fetchEmpSearch } from '../../../redux/actions/employeeDTActions';
import '../style.css';
import Tabnav from '../../tabnav';
import GTrans from '../../../assets/tabnav/G-transfer from.svg';
import BTrans from '../../../assets/tabnav/B-transfer from.svg';
import Searchbar from '../../searchbarReusable';


const List = lazy(() => import('./item'));

let icons = [
    { G: GTrans, B: BTrans }
];


const ListUser = ({
    fetchEmp, fetchEmpSearch, id, empData, isSuc, string, offsetMult, limit,
    limitMult, handleS, handleL, handleLM, handleOFM, handleT, type, tabNav, setTN
}) => {

    const handleSearch = e => {
        e.preventDefault();
        var data = { offset: 0, limit: 0, string: string, _id: id, type: type.toLowerCase() };
        handleL(12); handleOFM(0); handleLM(0);
        string ? fetchEmpSearch(data) : fetchEmp(data);
    }

    const fetch = (e, count, i, j) => {
        e.preventDefault();
        if ((limit < count && i > 0) || (limit > 12 && i < 0)) {
            var data = { limit: limitMult + i, offset: offsetMult + 1, string: string, _id: id, type: type.toLowerCase() };
            var upgradeLimit = limit + j;
            handleL(upgradeLimit); handleOFM(data.offset); handleLM(data.limit);
            string ? fetchEmpSearch(data) : fetchEmp(data);
        }
    }

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        e.target.options[selectedIndex].getAttribute('data-key') && handleT(e.target.options[selectedIndex].getAttribute('data-key'));
    }

    var count = 0;
    var list = [];

    if (isSuc) {
        count = empData.count;
        list = empData.data;
    }

    return <div className="col-11 e-w p-0">
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <h4 className="h">Storage Transfer</h4>
            <div style={{ marginLeft: 'auto' }} />
            <Searchbar isCreate={false} classN={false ? `col-lg-7 col-12` : 'col-lg-5 col-12'} pad={false} value={string}
                handleSearch={e => handleSearch(e)} onHandleInput={val => handleS(val)} holder={type === 'Name' ? 'Enter name' : 'Enter email'} comp={<>
                    <div style={{ height: '30px', margin: 'auto 2px', width: '2px', backgroundColor: '#f9f9f9' }}></div>
                    <select className="custom-select col-3" onChange={e => handleSelect(e)} value={type}>
                        <option data-key={'Name'}>Name</option>
                        <option data-key={'Email'}>Email</option>
                    </select>
                </>} />
        </div>
        <Tabnav items={['Transfer From']} i={tabNav} setI={setTN} icons={icons} />
        {isSuc && list.length > 0 && count > 0 ? <Suspense fallback={<></>}>
            <List list={list} count={count} id={id} onFetch={fetch} />
        </Suspense> : <div width="100%"> <h6 className="e-n" width="100%" style={{ textAlign: 'center', marginTop: '50px' }}>No user found</h6> </div>}
    </div>
}

const mapStateToProps = state => {
    return {
        empData: state.Employee.list,
        isErr: state.Employee.isErr,
        isSuc: state.Employee.isSuc
    }
}
export default connect(mapStateToProps, { fetchEmp, fetchEmpSearch })(ListUser);