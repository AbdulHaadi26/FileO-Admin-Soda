import React, { useEffect, lazy, useState } from 'react';
import { connect } from 'react-redux';
import { getCat } from '../../redux/actions/categoryActions';
import Container from '../container';
const Details = lazy(() => import('../../components/category/details'));

const CategoryPage = ({ getCat, profile, isErr, isSuc, cat, match }) => {
    const [tabNav, setTN] = useState(0);
    const { id, _id } = match.params;

    useEffect(() => { getCat(_id); }, [getCat, _id]);

    return <Container profile={profile} isErr={isErr} isSuc={isSuc && cat} eT={'Category Not Found'} num={6}> <Details Cat={cat} id={id} tabNav={tabNav} setTN={setTN} /> </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isErr: state.Category.isErr,
        isSuc: state.Category.isSuc,
        cat: state.Category.data
    }
}

export default connect(mapStateToProps, { getCat })(CategoryPage);