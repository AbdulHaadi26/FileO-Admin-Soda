import React, { lazy, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import Container from './container';
import { fetchAssignedCatsP } from '../redux/actions/project_categoryActions';
import { fetchCombinedCP } from '../redux/actions/categoryActions';
import { fetchCombined } from '../redux/actions/userCategoryActions';
import { fetchCombinedC } from '../redux/actions/clientCategoryAction';
import { fetchCombinedPM } from '../redux/actions/project_categoryActions';
const UserList = lazy(() => import('../components/Allfiles/userCatList'));

const ListPage = ({ match, profile, fetchCombinedCP, fetchCombinedC, fetchCombinedPM, fetchCombined, isL, isLS, fetchAssignedCatsP, categoryP }) => {
    const { id, num } = match.params;

    const [started, setStarted] = useState(0), [string, setS] = useState(''),
        [categories, setCATS] = useState([]), [tabNav, setTN] = useState(Number(num)), [stringU, setSU] = useState(''),
        [typeU, setTU] = useState('All'), [stringC, setSTC] = useState(''),
        [typeC, setTC] = useState('All'), [stringP, setSP] = useState(''),
        [isList, setISL] = useState(false);


    useEffect(() => {
        setTN(Number(num));
        let data;
        if (profile && profile.user)
            switch (Number(num)) {
                case 0:
                    if (profile.user.userType === 2) {
                        let data = { _id: id };
                        fetchCombinedCP(data);
                    }
                    break;
                case 1:
                    if (profile.user.userType === 1) fetchCombinedPM({});
                    break;
                case 2:
                    data = { _id: profile.user._id, type: 'All', pId: profile.user._id };
                    fetchCombined(data);
                    break;
                case 3:
                    data = { _id: profile.user._id, type: 'All', pId: profile.user._id };
                    fetchCombinedC(data);
                    break;
                default: return num;
            };
    }, [num, id, profile, fetchCombined, fetchCombinedC, fetchCombinedCP, fetchCombinedPM]);

    useEffect(() => {
        let catId = [], cats = [], data;
        if (profile && profile.user) {
            if (profile.user.userType < 2) {
                profile.user.roles && profile.user.roles.length > 0 && profile.user.roles.map(r => r.category && r.category.length > 0 && r.category.map(c => {
                    if (!catId.includes(c._id)) {
                        catId.push(c._id);
                        return cats.push(c);
                    } else return c;
                }));
                setCATS(cats);
            }
            data = { _id: id };
            profile.user.userType === 2 && fetchCombinedCP(data);
            profile.user.userType !== 1 && fetchAssignedCatsP();
        }
        setStarted(1);
    }, [profile, fetchCombinedCP, id, setStarted, fetchAssignedCatsP]);

    const onhandleS = s => setS(s);

    const onhandleSU = s => setSU(s);
    const onhandleTU = t => setTU(t);
    const onhandleSC = s => setSTC(s);
    const onhandleTC = t => setTC(t);

    const onhandleSP = s => setSP(s);

    return <Container profile={profile} isSuc={!isL && !isLS && started > 0} num={18}>
        <UserList id={id} tabNav={tabNav} category={categories}
            orgName={profile.user.orgName} pId={profile && profile.user ? profile.user._id : ''}
            string={string} handleS={onhandleS} setTN={setTN} admin={profile.user.userType === 2 ? true : false}
            typeU={typeU} stringU={stringU} handleSU={onhandleSU} handleTU={onhandleTU}
            typeC={typeC} stringC={stringC} handleSC={onhandleSC} handleTC={onhandleTC}
            stringP={stringP} handleSP={onhandleSP} auth={profile && profile.user && profile.user.userType === 1 ? true : false}
            client={((profile && profile.user && profile.user.clientView) || profile.user.userType === 2)}
            isList={isList} handleISL={setISL} categoryP={categoryP}
        />
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.File.isL,
        isLS: state.Category.isL,
        categoryP: state.Category.data,
        catList: state.Category.list
    }
}

export default connect(mapStateToProps, { fetchCombinedCP, fetchCombined, fetchCombinedC, fetchCombinedPM, fetchAssignedCatsP })(ListPage);