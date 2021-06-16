import React, { lazy } from 'react';
import Switch from "react-router-dom/Switch";
import Route from 'react-router-dom/Route';
import Redirect from 'react-router-dom/Redirect';
const FvrFileList = lazy(() => import('../pages/files/fvrFilePage'));
const UserProfilePage = lazy(() => import('../pages/userProfilePage'));
const ErrorLimit = lazy(() => import('../components/error/errorLimit'));
const ErrorLimitU = lazy(() => import('../components/error/errorLimitU'));
const RecentFileDate = lazy(() => import('../pages/files/recentDatePage'));
const FileVersionPage = lazy(() => import('../pages/files/fileViewPage'));
const ProjectsListPage = lazy(() => import('../pages/projects/projectsListPage'));
const FileListPageS = lazy(() => import('../pages/user_files/sharedFileListPage'));
const CreateTaskPage = lazy(() => import('../pages/notes/createTaskPage'));
const FileCategoriesPage = lazy(() => import('../pages/project_files/fileCategoriesPage'));
const FileListPageP = lazy(() => import('../pages/project_files/fileListPage'));
const FileVersionPageP = lazy(() => import('../pages/project_files/fileViewPage'));
const FileVersionPagePV = lazy(() => import('../pages/project_files/fileViewPageV'));
const CatListPageU = lazy(() => import('../pages/user_category/catListPage'));
const FileListPageU = lazy(() => import('../pages/user_files/fileListPage'));
const FileViewPageU = lazy(() => import('../pages/user_files/fileViewPage'));
const SharedFiles = lazy(() => import('../pages/shared/fileListPage'));
const ViewSharedFiles = lazy(() => import('../pages/shared/fileViewPage'));
const NotificationPage = lazy(() => import('../pages/notifications/notificationPage'));
const NotificationListPage = lazy(() => import('../pages/notifications/notificationListPage'));
const CreateNotePage = lazy(() => import('../pages/notes/createNotePage'));
const NoteListPage = lazy(() => import('../pages/notes/noteListPage'));
const NoteDetailsPage = lazy(() => import('../pages/notes/notePage'));
const NoteViewPage = lazy(() => import('../pages/notes/noteViewPage'));
const PollListPage = lazy(() => import('../pages/poll/pollListPage'));
const CatListPageC = lazy(() => import('../pages/client_category/catListPage'));
const FileListPageC = lazy(() => import('../pages/client_files/fileListPage'));
const FileViewPageC = lazy(() => import('../pages/client_files/fileViewPage'));
const FileListPageCS = lazy(() => import('../pages/sharedCat/fileListPage'));
const FileViewPageCS = lazy(() => import('../pages/sharedCat/fileViewPage'));
const DashboardPage = lazy(() => import('../pages/dashboard/dashboardPage'));
const FileCatPage = lazy(() => import('../pages/files/fileCategoriesPage'));
const FileListPage = lazy(() => import('../pages/files/fileListPage'));
const NoteDetailsPageS = lazy(() => import('../pages/notes/noteEditPage'));
const AllFilePage = lazy(() => import('../pages/fileCategoriesPage'));
const NoteFileView = lazy(() => import('../pages/notes/noteFileViewPage'));
const FileViewPageUV = lazy(() => import('../pages/user_files/fileViewPageV'));
const PlanListPage = lazy(() => import('../pages/plans/planListPage'));
const PlanViewPage = lazy(() => import('../pages/plans/planPage'));
const FileAnnc = lazy(() => import('../pages/project_files/annoucementPage'));

export default () => <Switch>
    <Route exact path='/user/dashboard' component={DashboardPage} />
    <Route path='/user/profile' component={UserProfilePage} />
    <Route path='/organization/:id/files/:catId/list' component={FileListPage} />
    <Route path='/organization/:id/file/:_id' component={FileVersionPage} />
    <Route path='/organization/:id/files/categories' component={FileCatPage} />
    <Route path='/organization/:id/files/recent/page/:num' component={RecentFileDate} />
    <Route path='/organization/:id/user/:_id/projects/list' component={ProjectsListPage} />
    <Route path='/organization/:id/projects/:_id/categories/list/page/:num' component={FileCategoriesPage} />
    <Route path='/organization/:id/projects/:pId/files/:catId/list' component={FileListPageP} />
    <Route path='/organization/:id/projects/:pId/file/:_id' component={FileVersionPageP} />
    <Route path='/organization/:id/projects/:pId/version/file/:_id' component={FileVersionPageP} />
    <Route path='/organization/:id/projects/:pId/version/:ver/file/:_id' component={FileVersionPagePV} />
    <Route path='/organization/:id/myspace/user/:_id/category/list' component={CatListPageU} />
    <Route path='/organization/:id/myspace/user/:_id/files/:catId/list' component={FileListPageU} />
    <Route path='/organization/:id/shared/:_id/category/:catId/list' component={FileListPageS} />
    <Route path='/organization/:id/myspace/user/:uId/file/:_id' component={FileViewPageU} />
    <Route path='/organization/:id/myspace/user/:uId/version/:ver/file/:_id' component={FileViewPageUV} />
    <Route path='/organization/:id/projects/:pId/announcement/:_id' component={FileAnnc} />
    <Route path='/organization/:id/user/:_id/shared/files/page/:num' component={SharedFiles} />
    <Route path='/organization/:id/notification/details/:_id' component={NotificationPage} />
    <Route path='/organization/:id/notification/list/page/:num' component={NotificationListPage} />
    <Route path='/organization/:id/user/:_id/view/shared/file/:fId' component={ViewSharedFiles} />
    <Route path='/organization/:id/myspace/user/:_id/notes/add' component={CreateNotePage} />
    <Route path='/organization/:id/myspace/user/:_id/notes/list/page/:num' component={NoteListPage} />
    <Route path='/organization/:id/myspace/user/:_id/notes/details/:nId' component={NoteDetailsPage} />
    <Route path='/organization/:id/myspace/user/:_id/notes/view/:nId' component={NoteViewPage} />
    <Route path='/organization/:id/myspace/user/:_id/category/data/:term/list' component={CatListPageU} />
    <Route path='/organization/:id/myspace/user/:_id/tasks/add' component={CreateTaskPage} />
    <Route path='/organization/:id/myspace/user/:_id/notes/shared/details/:nId' component={NoteDetailsPageS} />
    <Route path='/organization/:id/user/:_id/clients/category/list' component={CatListPageC} />
    <Route path='/organization/:id/user/:_id/clients/files/:catId/list' component={FileListPageC} />
    <Route path='/organization/:id/user/:uId/clients/file/:_id' component={FileViewPageC} />
    <Route path='/organization/:id/sharedby/:_id/category/:catId/list' component={FileListPageCS} />
    <Route path='/organization/:id/sharedby/:_id/parentCategory/:pCat/category/:catId/list' component={FileListPageCS} />
    <Route path='/organization/:id/poll/list/page/:num' component={PollListPage} />
    <Route path='/organization/:id/sharedby/:uId/file/:_id' component={FileViewPageCS} />
    <Route path='/organization/:id/user/:uId/favourites' component={FvrFileList} />
    <Route path='/organization/:_id/upload/limit' component={ErrorLimit} />
    <Route path='/organization/:_id/myspace/limit' component={ErrorLimitU} />
    <Route path='/organization/:id/all/files/page/:num' component={AllFilePage} />
    <Route path='/organization/:id/note/view/:_id' component={NoteFileView} />
    <Route path='/organization/:id/myspace/user/:_id/plan/list' component={PlanListPage} />
    <Route path='/organization/:id/myspace/user/:_id/plan/view/:nId' component={PlanViewPage} />
    <Route render={() => <Redirect to='/user/dashboard' />} />
</Switch>
