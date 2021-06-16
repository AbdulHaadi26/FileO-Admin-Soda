import React, { lazy, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import Container from './container';
import { fetchCombinedCP } from '../redux/actions/categoryActions';
import { fetchCombined } from '../redux/actions/userCategoryActions';
import { fetchCombinedC } from '../redux/actions/clientCategoryAction';
import { fetchCombinedPM } from '../redux/actions/project_categoryActions';
const UserList = lazy(() => import('../components/Allfiles/userCatList'));

const ListPage = ({ match, profile, fetchCombinedCP, fetchCombinedC, fetchCombinedPM, fetchCombined, isL, isLS, categoryP }) => {
    const { id, num } = match.params;

    const [started, setStarted] = useState(0), [string, setS] = useState(''), [tabNav, setTN] = useState(Number(num)), [stringU, setSU] = useState(''),
        [typeU, setTU] = useState('All'), [stringC, setSTC] = useState(''), [typeC, setTC] = useState('All'), [stringP, setSP] = useState(''),
        [isList, setISL] = useState(false);


    useEffect(() => {
        async function fetch() {
            setTN(Number(num));
            if (profile && profile.user)
                switch (Number(num)) {
                    case 0:
                        await fetchCombinedCP({
                            auth: profile.user.userType === 2
                        });
                        break;
                    case 1:
                        await fetchCombinedPM({
                            auth: profile.user.userType === 1
                        });
                        break;
                    case 2:
                        await fetchCombined({
                            _id: profile.user._id,
                            type: 'All',
                            pId: profile.user._id
                        });
                        break;
                    case 3:
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
      
    }, [num, id, profile, fetchCombined, fetchCombinedC, fetchCombinedCP, fetchCombinedPM]);

    const onhandleS = s => setS(s);

    const onhandleSU = s => setSU(s);
    const onhandleTU = t => setTU(t);
    const onhandleSC = s => setSTC(s);
    const onhandleTC = t => setTC(t);

    const onhandleSP = s => setSP(s);

    return <Container profile={profile} isSuc={!isL && !isLS && started > 0} num={18}>
        <UserList id={id} tabNav={tabNav} orgName={profile.user.orgName}
            pId={profile && profile.user ? profile.user._id : ''}
            string={string} handleS={onhandleS} setTN={setTN}
            admin={profile.user.userType === 2 ? true : false}
            typeU={typeU} stringU={stringU} handleSU={onhandleSU} handleTU={onhandleTU}
            typeC={typeC} stringC={stringC} handleSC={onhandleSC} handleTC={onhandleTC}
            stringP={stringP} handleSP={onhandleSP}
            auth={profile && profile.user && profile.user.userType === 1 ? true : false}
            client={((profile && profile.user && profile.user.clientView) || profile.user.userType === 2)}
            isList={isList} handleISL={setISL} categoryP={categoryP}
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

export default connect(mapStateToProps, { fetchCombinedCP, fetchCombined, fetchCombinedC, fetchCombinedPM })(ListPage);