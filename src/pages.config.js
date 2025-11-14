import NotificationSettings from './pages/NotificationSettings';
import NotificationCenter from './pages/NotificationCenter';
import HomePage from './pages/HomePage';
import NewJobs from './pages/NewJobs';


export const PAGES = {
    "NotificationSettings": NotificationSettings,
    "NotificationCenter": NotificationCenter,
    "HomePage": HomePage,
    "NewJobs": NewJobs,
}

export const pagesConfig = {
    mainPage: "NotificationSettings",
    Pages: PAGES,
};