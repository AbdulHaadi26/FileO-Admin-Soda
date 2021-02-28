import React, { useEffect, lazy, Suspense } from 'react';
import { RenderErr, RenderPR, RenderEV } from './routes';
import { getCurrentUser } from './redux/actions/userActions';
import { getSetting } from './redux/actions/settingActions';
import { connect } from 'react-redux';
import Loader from './components/loader/loaderMain';
import { getOrganization } from './redux/actions/organizationActions';
const RenderRoutes = lazy(() => import('./routes/auth'));

const App = ({ getCurrentUser, getSetting, getOrganization, isL, isErr, profile, auth, setting, num }) => {

  useEffect(() => {
    if (localStorage.getItem('token')) {
      getCurrentUser();
      getOrganization();
      getSetting();
    }
  }, [getCurrentUser, getSetting, getOrganization]);

  return <Suspense fallback={<Loader />}> {!auth ? <RenderPR /> : !isL && !isErr && profile && profile.user ?
    <>{profile.user.verified ? <RenderRoutes profile={profile.user} setting={setting} num={num} /> : <RenderEV />} </>
    : isL ? <Loader /> : <RenderErr />} </Suspense>
}

const mapStateToProps = state => {
  return {
    auth: state.Profile.isAuth,
    isL: state.Profile.isL,
    isErr: state.Profile.isErr,
    profile: state.Profile.data,
    isSuc: state.setting.isSuc,
    setting: state.setting.data,
    num: state.sidenav.count
  }
}

export default connect(mapStateToProps, { getCurrentUser, getOrganization, getSetting })(App);
