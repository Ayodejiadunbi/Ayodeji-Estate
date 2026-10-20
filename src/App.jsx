import {createBrowserRouter,RouterProvider,Navigate,Link} from 'react-router-dom';
import HomePage from './routes/homePage/homePage';
import ListPage from './routes/listPage/listPage';
import Layout from './routes/layout/layout';
import SinglePage from './routes/singlePage/singlePage';
import ProfilePage from './routes/profilePage/profilePage';
import LoginPage from './routes/loginPage/loginPage';
import Editor from './routes/editor/Editor';
import {AuthProvider,useAuth} from './lib/auth';
import './product.css';
function Protected({children}){const {user,loading}=useAuth();return loading?<p>Loading account…</p>:user?children:<Navigate to="/login" replace/>;}
function Info({contact=false}){return <section className="pagePanel"><h1>{contact?'Contact an owner':'About SunnyEstate'}</h1><p>{contact?'Open a property and use Send enquiry to contact its owner. Received and sent enquiries appear in My account. Sample listings cannot receive enquiries.':'SunnyEstate is a real estate portfolio project by Ayodeji Adunbi. Explore sample homes, create an account, publish a listing and save your favourite places.'}</p><Link className="action" to="/list">Browse properties</Link></section>}
const router=createBrowserRouter([{element:<Layout/>,errorElement:<section className="pagePanel"><h1>Something went wrong</h1><a href="/">Return home</a></section>,children:[{index:true,element:<HomePage/>},{path:'list',element:<ListPage/>},{path:'login',element:<LoginPage key="login"/>},{path:'register',element:<LoginPage key="register" register/>},{path:'profile',element:<Protected><ProfilePage/></Protected>},{path:'new',element:<Protected><Editor key="new"/></Protected>},{path:'edit/:id',element:<Protected><Editor key="edit"/></Protected>},{path:'about',element:<Info/>},{path:'contact',element:<Info contact/>},{path:':id',element:<SinglePage/>},{path:'*',element:<p>Page not found. <Link to="/">Home</Link></p>}]}]);
export default function App(){return <AuthProvider><RouterProvider router={router}/></AuthProvider>}
