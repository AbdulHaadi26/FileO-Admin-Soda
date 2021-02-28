import React, { lazy, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { fetchFile, getCatSelect } from '../../redux/actions/clientFilesAction';
import Container from '../container';
const List = lazy(() => import('../../components/client_files/list'));

const ListPage = ({ match, profile, fetchFile, isL, isLS, isSucS, getCatSelect }) => {
    const { id, catId, _id } = match.params;
    const [started, setStarted] = useState(0), [string, setS] = useState(''), [type, setT] = useState('All'), [tabNav, setTN] = useState(0), [isList, setISL] = useState(false);

    useEffect(() => {
        const data = { pId: _id, cat: catId, type: 'All' };
        fetchFile(data);
        getCatSelect(_id);
        setStarted(1);
    }, [fetchFile, _id, catId, setStarted, getCatSelect]);

    const onhandleS = s => setS(s);
    const onhandleT = t => setT(t);

    const getList = () => {
        const data = { pId: _id, cat: catId, type: 'All' };
        fetchFile(data);
        getCatSelect(_id);
        setStarted(1);
    }

    return <Container profile={profile} num={17} isSuc={!isL && started > 0 && !isLS && isSucS}>
        <List getList={getList} id={id} catId={catId} _id={_id} string={string} type={type} tabNav={tabNav} setTN={setTN} handleS={onhandleS} handleT={onhandleT}
            isList={isList} handleISL={setISL} />
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.File.isL,
        isLS: state.Category.isL,
        isSucS: state.Category.isSuc
    }
}

export default connect(mapStateToProps, { fetchFile, getCatSelect })(ListPage);