import React, { lazy, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { getProjectDesc } from '../../redux/actions/projectActions';
import { getCatC } from '../../redux/actions/project_categoryActions';
import { clearUpload, fetchCombinedP } from '../../redux/actions/project_filesActions';
import Container from '../containerUpt';
const List = lazy(() => import('../../components/project_files/list'));

const ListPage = ({ profile, fetchCombinedP, isL, isLP, getProjectDesc, isLS, match, clearUpload, per, isUpt, getCatC }) => {
    const { id, catId, pId } = match.params;
    const [string, setS] = useState(''), [isList, setISL] = useState(false), [type, setT] = useState('All'), [tabNav, setTN] = useState(0);

    useEffect(() => {
        async function fetch() {
            if (profile && profile.user) {
                let data = { pId: pId, cat: catId, type: 'All', auth: profile.user.userType === 1 };
                await fetchCombinedP(data);
                await getProjectDesc(pId);
                await getCatC(catId);
            }
        };

        fetch();

    }, [fetchCombinedP, pId, catId, profile, getProjectDesc, getCatC]);

    const onhandleS = s => setS(s);
    const onhandleT = t => setT(t);

    const getList = async () => {
        clearUpload();
        let data = { pId: pId, cat: catId, type: 'All', auth: profile.user.userType === 1 };
        await fetchCombinedP(data);

    };

    return <Container profile={profile} num={13} isSuc={!isL && !isLS && !isLP && !isUpt} isUpt={isUpt} percent={per} onSubmit={getList} >
        <List getList={getList} id={id} pId={pId} catId={catId} auth={profile && profile.user && profile.user.userType === 1 ? true : false} isList={isList} handleISL={setISL}
            string={string} type={type} _id={profile && profile.user && profile.user._id} tabNav={tabNav} setTN={setTN} handleS={onhandleS} handleT={onhandleT}
            disabled={profile && profile.user && profile.user.current_employer && profile.user.current_employer.isDisabled}
        /> </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.File.isL,
        isLS: state.Category.isL,
        isLP: state.Project.isL,
        isUpt: state.File.isUpt,
        per: state.File.per,
    }
}

export default connect(mapStateToProps, { fetchCombinedP, getProjectDesc, clearUpload, getCatC })(ListPage);