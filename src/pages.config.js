import NotificationSettings from './pages/NotificationSettings';
import NotificationCenter from './pages/NotificationCenter';
import HomePage from './pages/HomePage';
import NewJobs from './pages/NewJobs';
import Marketplace from './pages/Marketplace';
import MarketplaceDetail from './pages/MarketplaceDetail';
import MarketplaceCreate from './pages/MarketplaceCreate';
import TestProfessional from './pages/TestProfessional';
import TestCompany from './pages/TestCompany';


export const PAGES = {
    "NotificationSettings": NotificationSettings,
    "NotificationCenter": NotificationCenter,
    "HomePage": HomePage,
    "NewJobs": NewJobs,
    "Marketplace": Marketplace,
    "MarketplaceDetail": MarketplaceDetail,
    "MarketplaceCreate": MarketplaceCreate,
    "TestProfessional": TestProfessional,
    "TestCompany": TestCompany,
}

export const pagesConfig = {
    mainPage: "TestProfessional",
    Pages: PAGES,
};