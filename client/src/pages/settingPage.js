import React, { lazy, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { getOrganizationS } from '../redux/actions/organizationActions';
import Container from './container';
const Setting = lazy(() => import('../components/settings/main'));

const SettingPage = ({ profile, getOrganizationS, isErr, isSuc, data }) => {
    const [tabNav, setTN] = useState(0);
    useEffect(() => { getOrganizationS(); }, [getOrganizationS]);

    return <Container profile={profile} num={0} isSuc={isSuc && data} isErr={isErr} eT={'Organization Settings Not Found'}>
        {data && data.org && <Setting Org={data.org} User={profile.user} tabNav={tabNav} setTN={setTN}
            disabled={profile && profile.user && profile.user.current_employer && profile.user.current_employer.isDisabled}
        />}
    </Container>
};

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isErr: state.Organization.isErr,
        isSuc: state.Organization.isSuc,
        data: state.Organization.data
    }
};

export default connect(mapStateToProps, { getOrganizationS })(SettingPage);