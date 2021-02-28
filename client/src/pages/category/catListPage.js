import React, { lazy, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Container from '../container';
import { fetchCombinedCP } from '../../redux/actions/categoryActions';
const List = lazy(() => import('../../components/category/list'));

const ListPage = ({ profile, isL, fetchCombinedCP, match }) => {
    const { id } = match.params;

    const [started, setStarted] = useState(0), [tabNav, setTN] = useState(0), [formData, setList] = useState({
        string: '', setS: (v) => setList(prevState => ({ ...prevState, string: v }))
    }), [isList, setISL] = useState(false);

    useEffect(() => {
        let data = { limit: 0, _id: id };
        fetchCombinedCP(data);
        setStarted(1);
    }, [id, fetchCombinedCP, setStarted]);

    const getList = () => {
        let data = { limit: 0, _id: id };
        fetchCombinedCP(data);
    };

    return <Container profile={profile} isSuc={!isL && started > 0} num={6}>
        <List id={id} isList={isList} getList={getList} handleISL={setISL} formData={formData} tabNav={tabNav} setTN={setTN} />
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.Category.isL
    }
}

export default connect(mapStateToProps, { fetchCombinedCP })(ListPage);