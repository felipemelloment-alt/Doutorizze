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
import DashboardClinica from './pages/DashboardClinica';
import CriarVaga from './pages/CriarVaga';
import MinhasVagas from './pages/MinhasVagas';
import MeuPerfil from './pages/MeuPerfil';
import EditarPerfil from './pages/EditarPerfil';
import PerfilClinica from './pages/PerfilClinica';
import EditarClinica from './pages/EditarClinica';
import DetalheVaga from './pages/DetalheVaga';
import MinhasCandidaturas from './pages/MinhasCandidaturas';
import VerProfissional from './pages/VerProfissional';
import Contratar from './pages/Contratar';
import EditarVaga from './pages/EditarVaga';
import PerfilClinicaPublico from './pages/PerfilClinicaPublico';
import AvaliarClinica from './pages/AvaliarClinica';
import AvaliarProfissional from './pages/AvaliarProfissional';
import NotificationSettings from './pages/NotificationSettings';
import Feed from './pages/Feed';
import Denunciar from './pages/Denunciar';
import AdminDenuncias from './pages/AdminDenuncias';
import AdminFeed from './pages/AdminFeed';
import CadastroFornecedor from './pages/CadastroFornecedor';
import DashboardFornecedor from './pages/DashboardFornecedor';
import CriarPromocao from './pages/CriarPromocao';
import MinhasPromocoes from './pages/MinhasPromocoes';
import CadastroHospital from './pages/CadastroHospital';
import DashboardHospital from './pages/DashboardHospital';
import Configuracoes from './pages/Configuracoes';
import Ajuda from './pages/Ajuda';
import __Layout from './Layout.jsx';


export const PAGES = {
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
    "DashboardClinica": DashboardClinica,
    "CriarVaga": CriarVaga,
    "MinhasVagas": MinhasVagas,
    "MeuPerfil": MeuPerfil,
    "EditarPerfil": EditarPerfil,
    "PerfilClinica": PerfilClinica,
    "EditarClinica": EditarClinica,
    "DetalheVaga": DetalheVaga,
    "MinhasCandidaturas": MinhasCandidaturas,
    "VerProfissional": VerProfissional,
    "Contratar": Contratar,
    "EditarVaga": EditarVaga,
    "PerfilClinicaPublico": PerfilClinicaPublico,
    "AvaliarClinica": AvaliarClinica,
    "AvaliarProfissional": AvaliarProfissional,
    "NotificationSettings": NotificationSettings,
    "Feed": Feed,
    "Denunciar": Denunciar,
    "AdminDenuncias": AdminDenuncias,
    "AdminFeed": AdminFeed,
    "CadastroFornecedor": CadastroFornecedor,
    "DashboardFornecedor": DashboardFornecedor,
    "CriarPromocao": CriarPromocao,
    "MinhasPromocoes": MinhasPromocoes,
    "CadastroHospital": CadastroHospital,
    "DashboardHospital": DashboardHospital,
    "Configuracoes": Configuracoes,
    "Ajuda": Ajuda,
}

export const pagesConfig = {
    mainPage: "CadastroSucesso",
    Pages: PAGES,
    Layout: __Layout,
};