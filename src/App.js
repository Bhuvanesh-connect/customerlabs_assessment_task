
import ViewAudience from './pages/ViewAudience';
import { ToastContainer } from 'react-toastify';
import styles from './app.module.scss';

function App() {
  return (
    <div className={styles.app}>
      <ViewAudience/>
      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        style={{ bottom: "120px", right: "20px" }} 
      />
    </div>
  );
}

export default App;
