import React, { lazy, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { fetchCombinedCP } from '../../redux/actions/categoryActions';
import { clearUpload } from '../../redux/actions/fileActions';
import Container from '../containerUpt';
const UserList = lazy(() => import('../../components/files/userCatList'));
const AdminList = lazy(() => import('../../components/files/adminCatList'));

const ListPage = ({ match, profile, fetchCombinedCP, isL, isLS, isUpt, per, clearUpload }) => {
    const { id } = match.params;
    const [started, setStarted] = useState(0), [string, setS] = useState(''), [categories, setCATS] = useState([]), [tabNav, setTN] = useState(0), [isList, setISL] = useState(false);

    useEffect(() => {
        let catId = [], cats = [], data;
        if (profile && profile.user) {
            if (profile.user.userType === 2) {
                data = { _id: id };
                fetchCombinedCP(data);
                setStarted(1);
            } else {
                profile.user.roles && profile.user.roles.length > 0 && profile.user.roles.map(r => r.category && r.category.length > 0 && r.category.map(c => {
                    if (!catId.includes(c._id)) {
                        catId.push(c._id);
                        return cats.push(c);
                    } else return c;
                }));
                setCATS(cats);
                setStarted(1);
            }
        }
    }, [profile, fetchCombinedCP, id, setStarted]);

    const getList = () => {
        let catId = [], cats = [], data;
        clearUpload();
        if (profile && profile.user) {
            if (profile.user.userType === 2) {
                data = { _id: id };
                fetchCombinedCP(data);
            } else {
                profile.user.roles && profile.user.roles.length > 0 && profile.user.roles.map(r => r.category && r.category.length > 0 && r.category.map(c => {
                    if (!catId.includes(c._id)) {
                        catId.push(c._id);
                        return cats.push(c);
                    } else return c;
                }));
                setCATS(cats);
            }
        }
    }

    const onhandleS = s => setS(s);

    return <Container profile={profile} isSuc={!isL && !isLS && started > 0} num={9} isUpt={isUpt} percent={per} onSubmit={getList}> {profile.user.userType !== 2 ?
        <UserList id={id} tabNav={tabNav} category={categories} orgName={profile.user.orgName} string={string}
            handleS={onhandleS} setTN={setTN} isList={isList} handleISL={setISL} getList={getList} />
        : <AdminList id={id} orgName={profile.user.orgName} tabNav={tabNav} string={string} handleS={onhandleS}
            setTN={setTN} isList={isList} handleISL={setISL} getList={getList} />} </Container>
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