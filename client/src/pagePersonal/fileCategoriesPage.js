import React, { lazy, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import Container from './container';
import { fetchCombined } from '../redux/actions/personal/userCategoryActions';
import { fetchCombinedC } from '../redux/actions/personal/clientCategoryAction';
const UserList = lazy(() => import('../componentsP/Allfiles/userCatList'));

const ListPage = ({ match, profile, fetchCombinedC, fetchCombined, isL, isLS, categoryP }) => {
    const { id, num } = match.params;

    const [started, setStarted] = useState(0), [tabNav, setTN] = useState(Number(num)), [stringU, setSU] = useState(''),
        [typeU, setTU] = useState('All'), [stringC, setSTC] = useState(''), [typeC, setTC] = useState('All'),
        [isList, setISL] = useState(false);


    useEffect(() => {
        async function fetch() {
            setTN(Number(num));
            if (profile && profile.user)
                switch (Number(num)) {
                    case 0:
                        await fetchCombined({
                            _id: profile.user._id,
                            type: 'All',
                            pId: profile.user._id
                        });
                        break;
                    case 1:
                        await fetchCombinedC({
                            _id: profile.user._id,
                            type: 'All',
                            pId: profile.user._id
                        });
                        break;
                    default: return num;
                };

            setStarted(1);
        };

        fetch();

    }, [num, id, profile, fetchCombined, fetchCombinedC]);

    const onhandleSU = s => setSU(s);
    const onhandleTU = t => setTU(t);
    const onhandleSC = s => setSTC(s);
    const onhandleTC = t => setTC(t);


    return <Container profile={profile} isSuc={!isL && !isLS && started > 0} num={18}>
        <UserList id={id} tabNav={tabNav} orgName={profile.user.orgName}
            pId={profile && profile.user ? profile.user._id : ''}
            setTN={setTN}
            admin={profile.user.userType === 2 ? true : false}
            typeU={typeU} stringU={stringU} handleSU={onhandleSU} handleTU={onhandleTU}
            typeC={typeC} stringC={stringC} handleSC={onhandleSC} handleTC={onhandleTC}
            auth={profile && profile.user && profile.user.userType === 1 ? true : false}
            client={((profile && profile.user && profile.user.clientView) || profile.user.userType === 2)}
            isList={isList} handleISL={setISL}
        />
    </Container>
};

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.File.isL,
        isLS: state.Category.isL,
        categoryP: state.Category.data,
        catList: state.Category.list
    }
};

export default connect(mapStateToProps, { fetchCombined, fetchCombinedC })(ListPage);