import NotificationSettings from './pages/NotificationSettings';
import NotificationCenter from './pages/NotificationCenter';
import HomePage from './pages/HomePage';
import NewJobs from './pages/NewJobs';
import Marketplace from './pages/Marketplace';
import MarketplaceDetail from './pages/MarketplaceDetail';
import MarketplaceCreate from './pages/MarketplaceCreate';
import TestProfessional from './pages/TestProfessional';
import TestCompany from './pages/TestCompany';
import TestJob from './pages/TestJob';
import TestCompanyOwner from './pages/TestCompanyOwner';
import TestCompanyUnit from './pages/TestCompanyUnit';
import TestJobMatch from './pages/TestJobMatch';
import TestJobContract from './pages/TestJobContract';
import TestRating from './pages/TestRating';
import BuscarProfissionais from './pages/BuscarProfissionais';
import EscolherTipoCadastro from './pages/EscolherTipoCadastro';
import CadastroProfissional from './pages/CadastroProfissional';
import CadastroClinica from './pages/CadastroClinica';
import CadastroSucesso from './pages/CadastroSucesso';
import AdminAprovacoes from './pages/AdminAprovacoes';
import SimulacaoCredito from './pages/SimulacaoCredito';
import DashboardProfissional from './pages/DashboardProfissional';


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
    "TestJob": TestJob,
    "TestCompanyOwner": TestCompanyOwner,
    "TestCompanyUnit": TestCompanyUnit,
    "TestJobMatch": TestJobMatch,
    "TestJobContract": TestJobContract,
    "TestRating": TestRating,
    "BuscarProfissionais": BuscarProfissionais,
    "EscolherTipoCadastro": EscolherTipoCadastro,
    "CadastroProfissional": CadastroProfissional,
    "CadastroClinica": CadastroClinica,
    "CadastroSucesso": CadastroSucesso,
    "AdminAprovacoes": AdminAprovacoes,
    "SimulacaoCredito": SimulacaoCredito,
    "DashboardProfissional": DashboardProfissional,
}

export const pagesConfig = {
    mainPage: "HomePage",
    Pages: PAGES,
};