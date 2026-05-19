import HomePage from './components/HomePage';
import MoviesList from './components/MoviesList';
import MovieDetails from './components/MovieDetails';
import StreamingPage from './components/StreamingPage';
import TVDetails from './components/TVDetails';
import AuthPage from './components/AuthPage';
import {BrowserRouter , Routes , Route} from 'react-router-dom';

export default function App(){

  return(
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<HomePage/>}/>
          <Route path='/Login' element={<AuthPage mode="login"/>}/>
          <Route path='/Register' element={<AuthPage mode="register"/>}/>
          <Route path='/Movies' element={<MoviesList/>}/>
          <Route path='/Movies/:id/Details' element={<MovieDetails/>}/>
          <Route path='/Movies/:id/Watch' element={<StreamingPage/>}/>
          <Route path='/TV/:id/Details' element={<TVDetails/>}/>
          <Route path='/TV/:id/Season/:seasonNumber/Episode/:episodeNumber/Watch' element={<StreamingPage/>}/>
        </Routes>
      </BrowserRouter>
      
    </>
  )
}
