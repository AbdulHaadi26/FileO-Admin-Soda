import React, { lazy, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { fetchBills } from '../../redux/actions/billActions';
import Container from '../container';
const BList = lazy(() => import('../../components/billing/list'));

const ListPage = ({ match, profile, isL, fetchBills }) => {
    const { id, num } = match.params;
    const [started, setStarted] = useState(0), [tabNav, setTN] = useState(Number(num));

    useEffect(() => {
        async function fetch() {
            fetchBills({ status: tabNav === 1 ? 'Paid' : tabNav === 0 ? 'Unpaid' : 'Pending' });
            setStarted(1);
        };

        fetch();
    }, [fetchBills, setStarted, tabNav]);

    return <Container profile={profile} num={0} isSuc={!isL && started > 0}>
        <BList tabNav={tabNav} setTN={setTN} org={id} />
    </Container>
}

const mapStateToProps = state => {
    return {
        isL: state.Bill.isL
    }
}

export default connect(mapStateToProps, { fetchBills })(ListPage);