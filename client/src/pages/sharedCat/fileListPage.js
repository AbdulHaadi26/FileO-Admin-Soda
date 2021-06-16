import React, { lazy, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { fetchCombinedShared } from '../../redux/actions/userFilesActions';
import Container from '../container';
import { getCat, getCatC, updateCatShared } from '../../redux/actions/userCategoryActions';
const List = lazy(() => import('../../components/shared/fileList'));

const ListPage = ({ match, profile, isL, isSuc, getCat, fetchCombinedShared, updateCatShared, getCatC }) => {
    const { id, catId, _id, pCat } = match.params;
    const [string, setS] = useState(''), [type, setT] = useState('All'), [tabNav, setTN] = useState(0), [isList, setISL] = useState(false);

    useEffect(() => {
        async function fetch() {
            let data = { pId: _id, cat: catId, type: 'All' };
            await fetchCombinedShared(data);
            if (pCat === catId) await getCat(catId);
            else await getCatC(catId);
            await updateCatShared(catId);
        };
        fetch();
    }, [fetchCombinedShared, updateCatShared, getCat, getCatC, _id, pCat, catId]);

    const onhandleS = s => setS(s);
    const onhandleT = t => setT(t);

    return <Container profile={profile} num={15} isSuc={!isL && isSuc}>
        <List id={id} catId={catId} profile={profile && profile.user} _id={_id} string={string} type={type}
            tabNav={tabNav} setTN={setTN} handleS={onhandleS} handleT={onhandleT} isList={isList} handleISL={setISL}
            disabled={profile && profile.user && profile.user.current_employer && profile.user.current_employer.isDisabled}
        />
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.File.isL,
        isSuc: state.Category.isSuc
    }
};

export default connect(mapStateToProps, { fetchCombinedShared, updateCatShared, getCat, getCatC })(ListPage);