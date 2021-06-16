import React, { lazy, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { fetchCombinedCP } from '../../redux/actions/categoryActions';
import { clearUpload } from '../../redux/actions/fileActions';
import Container from '../containerUpt';
const UserList = lazy(() => import('../../components/files/userCatList'));
const AdminList = lazy(() => import('../../components/files/adminCatList'));

const ListPage = ({ match, profile, fetchCombinedCP, isL, isLS, isUpt, per, clearUpload }) => {
    const { id } = match.params;
    const [started, setStarted] = useState(0), [string, setS] = useState(''), [tabNav, setTN] = useState(0), [isList, setISL] = useState(false);

    useEffect(() => {
        async function fetch() {
            if (profile && profile.user) {
                let data = { auth: profile.user.userType === 2 };
                await fetchCombinedCP(data);
            }
            setStarted(1);
        }
        fetch();
    }, [fetchCombinedCP, profile, setStarted]);

    const getList = () => {
        clearUpload();
        if (profile && profile.user) {
            let data = { auth: profile.user.userType === 2 };
            fetchCombinedCP(data);
        }
    }

    const onhandleS = s => setS(s);

    return <Container profile={profile} isSuc={!isL && !isLS && started > 0} num={9} isUpt={isUpt} percent={per} onSubmit={getList}> {profile.user.userType !== 2 ?
        <UserList id={id} tabNav={tabNav} auth={false} orgName={profile.user.orgName} string={string}
            handleS={onhandleS} setTN={setTN} isList={isList} handleISL={setISL} getList={getList} />
        : <AdminList id={id} auth={true} orgName={profile.user.orgName} tabNav={tabNav} string={string} handleS={onhandleS}
            setTN={setTN} isList={isList} handleISL={setISL} getList={getList} disabled={profile && profile.user && profile.user.current_employer && profile.user.current_employer.isDisabled}  />} </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.File.isL,
        isLS: state.Category.isL,
        isUpt: state.File.isUpt,
        per: state.File.per
    }
}

export default connect(mapStateToProps, { fetchCombinedCP, clearUpload })(ListPage);