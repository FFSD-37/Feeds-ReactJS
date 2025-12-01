import { useUserData } from '../providers/userData.jsx';
import { Navigate } from 'react-router-dom';

const KidsSettings = () => {
    const { userData } = useUserData();
    if (userData?.type !== 'Kids') {
        return <Navigate to="/home" />;
    }
    return (
        <div className="kids-settings-page">
            <div className="kids-settings-container">
                <h1>Kids Settings</h1>
            </div>
        </div>
    );
}

export default KidsSettings;