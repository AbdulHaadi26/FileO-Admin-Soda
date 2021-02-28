import React, { lazy } from 'react';
import Switch from "react-router-dom/Switch";
import Route from 'react-router-dom/Route';
import Redirect from 'react-router-dom/Redirect'
const EmployeePage = lazy(() => import('../pages/employee/employeePage'));
const CreateRoles = lazy(() => import('../pages/role/createRoles'));
const RolesListPage = lazy(() => import('../pages/role/rolesListPage'));
const RolesPage = lazy(() => import('../pages/role/rolesPage'));
const OrganizationPage = lazy(() => import('../pages/organization/organizationPage'));
const CreateEmployeePage = lazy(() => import('../pages/employee/createEmployeePage'));
const EmployeeListPage = lazy(() => import('../pages/employee/employeeListPage'));
const UserProfilePage = lazy(() => import('../pages/userProfilePage'));
const FileCatPage = lazy(() => import('../pages/files/fileCategoriesPage'));
const FileListPage = lazy(() => import('../pages/files/fileListPage'));
const ViewStoragePage = lazy(() => import('../pages/storage/viewStoragePage'));
const SupportPage = lazy(() => import('../pages/support/supportPage'));
const CreateTicketPage = lazy(() => import('../pages/support/createTicketPage'));
const TicketPage = lazy(() => import('../pages/support/ticketPage'));
const EmployeeListPageDT = lazy(() => import('../pages/employee/employeeListPageDT'));
const EmployeeListPageDTMain = lazy(() => import('../pages/employee/employeeListPageDTMain'));
const DashboardPage = lazy(() => import('../pages/dashboard/dashboardPage'));
const ErrorLimit = lazy(() => import('../components/error/errorLimit'));
const FileVersionPage = lazy(() => import('../pages/files/fileViewPage'));
const FileVersionPageV = lazy(() => import('../pages/files/fileViewPageV'));
const NotificationPage = lazy(() => import('../pages/notifications/notificationPage'));
const NotificationListPage = lazy(() => import('../pages/notifications/notificationListPage'));
const SettingPage = lazy(() => import('../pages/settingPage'));
const CreateTaskPage = lazy(() => import('../pages/notes/createTaskPage'));


const RecentFileDate = lazy(() => import('../pages/files/recentDatePage'));
const FvrFileList = lazy(() => import('../pages/files/fvrFilePage'));
const ErrorLimitU = lazy(() => import('../components/error/errorLimitU'));
const ProjectsListPage = lazy(() => import('../pages/projects/projectsListPage'));
const FileListPageP = lazy(() => import('../pages/project_files/fileListPage'));
const FileVersionPageP = lazy(() => import('../pages/project_files/fileViewPage'));
const UserFileVersionP = lazy(() => import('../pages/project_files/userFileCategoriesPage'));
const CatListPageU = lazy(() => import('../pages/user_category/catListPage'));
const FileListPageU = lazy(() => import('../pages/user_files/fileListPage'));
const FileListPageS = lazy(() => import('../pages/user_files/sharedFileListPage'));
const FileViewPageU = lazy(() => import('../pages/user_files/fileViewPage'));
const SharedFiles = lazy(() => import('../pages/shared/fileListPage'));
const ViewSharedFiles = lazy(() => import('../pages/shared/fileViewPage'));
const FileViewPageUV = lazy(() => import('../pages/user_files/fileViewPageV'));
const CreateNotePage = lazy(() => import('../pages/notes/createNotePage'));
const NoteListPage = lazy(() => import('../pages/notes/noteListPage'));
const NoteDetailsPage = lazy(() => import('../pages/notes/notePage'));
const NoteViewPage = lazy(() => import('../pages/notes/noteViewPage'));
const CatListPageC = lazy(() => import('../pages/client_category/catListPage'));
const FileListPageC = lazy(() => import('../pages/client_files/fileListPage'));
const FileViewPageC = lazy(() => import('../pages/client_files/fileViewPage'));
const FileListPageCS = lazy(() => import('../pages/sharedCat/fileListPage'));
const FileViewPageCS = lazy(() => import('../pages/sharedCat/fileViewPage'));
const NoteDetailsPageS = lazy(() => import('../pages/notes/noteEditPage'));
const AllFilePage = lazy(() => import('../pages/fileCategoriesPage'));
const NoteFileView = lazy(() => import('../pages/notes/noteFileViewPage'));
const PlanListPage = lazy(() => import('../pages/plans/planListPage'));
const PlanViewPage = lazy(() => import('../pages/plans/planPage'));

export default () => <Switch>
    <Route exact path='/user/dashboard' component={DashboardPage} />
    <Route path='/user/profile' component={UserProfilePage} />
    <Route path='/organization/:id/employee/add' component={CreateEmployeePage} />
    <Route path='/organization/:_id/storage' component={ViewStoragePage} />
    <Route path='/organization/:_id/upload/limit' component={ErrorLimit} />
    <Route path='/organization/:id/employee/search' component={EmployeeListPage} />
    <Route path='/organization/:id/employee/:_id' component={EmployeePage} />
    <Route path='/organization/:id/role/add' component={CreateRoles} />
    <Route path='/organization/:id/role/list' component={RolesListPage} />
    <Route path='/organization/:id/role/:_id' component={RolesPage} />
    <Route path='/organization/detail/:id' component={OrganizationPage} />
    <Route path='/organization/:id/files/:catId/list' component={FileListPage} />
    <Route path='/organization/:id/file/:_id' component={FileVersionPage} />
    <Route path='/organization/:id/version/file/:_id' component={FileVersionPage} />
    <Route path='/organization/:id/version/:ver/file/:_id' component={FileVersionPageV} />
    <Route path='/organization/:id/files/categories' component={FileCatPage} />
    <Route path='/organization/:id/support' component={SupportPage} />
    <Route path='/organization/:id/ticket/create' component={CreateTicketPage} />
    <Route path='/organization/:id/ticket/details/:_id' component={TicketPage} />
    <Route path='/organization/:id/notification/details/:_id' component={NotificationPage} />
    <Route path='/organization/:id/notification/list/page/:num' component={NotificationListPage} />
    <Route path='/organization/:id/data/transfer/list' component={EmployeeListPageDT} />
    <Route path='/organization/:id/data/transfer/employee/:_id' component={EmployeeListPageDTMain} />
    <Route path='/organization/:id/settings' component={SettingPage} />
    <Route path='/organization/:id/files/recent/page/:num' component={RecentFileDate} />
    <Route path='/organization/:id/projects/:pId/files/:catId/list' component={FileListPageP} />
    <Route path='/organization/:id/projects/:pId/file/:_id' component={FileVersionPageP} />
    <Route path='/organization/:id/projects/:pId/version/file/:_id' component={FileVersionPageP} />
    <Route path='/organization/:id/projects/:_id/categories/list' component={UserFileVersionP} />
    <Route path='/organization/:id/user/:_id/projects/list' component={ProjectsListPage} />
    <Route path='/organization/:id/myspace/user/:_id/category/list' component={CatListPageU} />
    <Route path='/organization/:id/shared/:_id/category/:catId/list' component={FileListPageS} />
    <Route path='/organization/:id/myspace/user/:_id/files/:catId/list' component={FileListPageU} />
    <Route path='/organization/:id/myspace/user/:uId/file/:_id' component={FileViewPageU} />
    <Route path='/organization/:id/myspace/user/:uId/version/:ver/file/:_id' component={FileViewPageUV} />
    <Route path='/organization/:id/user/:_id/shared/files/page/:num' component={SharedFiles} />
    <Route path='/organization/:id/user/:_id/view/shared/file/:fId' component={ViewSharedFiles} />
    <Route path='/organization/:id/myspace/user/:_id/notes/add' component={CreateNotePage} />
    <Route path='/organization/:id/myspace/user/:_id/tasks/add' component={CreateTaskPage} />
    <Route path='/organization/:id/myspace/user/:_id/notes/list/page/:num' component={NoteListPage} />
    <Route path='/organization/:id/myspace/user/:_id/notes/view/:nId' component={NoteViewPage} />
    <Route path='/organization/:id/myspace/user/:_id/notes/details/:nId' component={NoteDetailsPage} />
    <Route path='/organization/:id/myspace/user/:_id/notes/shared/details/:nId' component={NoteDetailsPageS} />
    <Route path='/organization/:id/user/:_id/clients/category/list' component={CatListPageC} />
    <Route path='/organization/:id/user/:_id/clients/files/:catId/list' component={FileListPageC} />
    <Route path='/organization/:id/user/:uId/clients/file/:_id' component={FileViewPageC} />
    <Route path='/organization/:id/user/:uId/favourites' component={FvrFileList} />
    <Route path='/organization/:id/sharedby/:_id/category/:catId/list' component={FileListPageCS} />
    <Route path='/organization/:id/sharedby/:uId/file/:_id' component={FileViewPageCS} />
    <Route path='/organization/:_id/upload/limit' component={ErrorLimit} />
    <Route path='/organization/:_id/myspace/limit' component={ErrorLimitU} />
    <Route path='/organization/:id/all/files/page/:num' component={AllFilePage} />
    <Route path='/organization/:id/note/view/:_id' component={NoteFileView} />
    <Route path='/organization/:id/myspace/user/:_id/plan/list' component={PlanListPage} />
    <Route path='/organization/:id/myspace/user/:_id/plan/view/:nId' component={PlanViewPage} />
    <Route render={() => <Redirect to='/user/dashboard' />} />
</Switch>


